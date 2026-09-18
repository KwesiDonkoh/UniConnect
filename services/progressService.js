/**
 * progressService.js
 * ------------------
 * Firestore-backed service for student progress tracking:
 * - Study streaks (daily activity)
 * - GPA snapshots per semester
 * - Weekly study hours
 * - Overall academic stats for the dashboard
 */

import {
  doc,
  setDoc,
  getDoc,
  updateDoc,
  collection,
  query,
  where,
  orderBy,
  getDocs,
  onSnapshot,
  serverTimestamp,
  addDoc,
  limit,
} from 'firebase/firestore';
import { auth, db } from '../config/firebaseConfig';

class ProgressService {
  constructor() {
    this.progressListeners = new Map();
    this.currentUserId = null;

    auth.onAuthStateChanged((user) => {
      if (user) {
        this.currentUserId = user.uid;
        this.recordDailyActivity();
      } else {
        this.cleanup();
      }
    });
  }

  // ─────────────────────────────────────────────────────────────────────────
  // DAILY ACTIVITY / STREAK TRACKING
  // ─────────────────────────────────────────────────────────────────────────

  /**
   * Called on login/app open. Records today's activity and updates streak.
   */
  async recordDailyActivity() {
    if (!this.currentUserId) return;

    try {
      const today = this._todayKey(); // e.g. "2026-04-02"
      const progressRef = doc(db, 'progress', this.currentUserId);
      const progressDoc = await getDoc(progressRef);

      if (!progressDoc.exists()) {
        // Brand-new user — initialise document
        await setDoc(progressRef, {
          userId: this.currentUserId,
          streak: 1,
          longestStreak: 1,
          lastActiveDate: today,
          totalActiveDays: 1,
          weeklyStudyMinutes: 0,
          totalStudyMinutes: 0,
          gpaHistory: [],
          currentGPA: 0.0,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        });
        return;
      }

      const data = progressDoc.data();
      const lastActive = data.lastActiveDate;

      if (lastActive === today) {
        // Already recorded today — nothing to do
        return;
      }

      const yesterday = this._offsetKey(-1);
      const newStreak = lastActive === yesterday ? (data.streak || 0) + 1 : 1;
      const newLongest = Math.max(newStreak, data.longestStreak || 0);

      await updateDoc(progressRef, {
        streak: newStreak,
        longestStreak: newLongest,
        lastActiveDate: today,
        totalActiveDays: (data.totalActiveDays || 0) + 1,
        updatedAt: serverTimestamp(),
      });
    } catch (error) {
      console.error('Error recording daily activity:', error);
    }
  }

  /**
   * Log study minutes for the current session.
   * @param {number} minutes - Minutes spent studying
   */
  async logStudyTime(minutes) {
    if (!this.currentUserId || minutes <= 0) return { success: false };

    try {
      const progressRef = doc(db, 'progress', this.currentUserId);
      const progressDoc = await getDoc(progressRef);

      if (!progressDoc.exists()) {
        await this.recordDailyActivity();
      }

      const data = (await getDoc(progressRef)).data() || {};
      const weeklyMinutes = (data.weeklyStudyMinutes || 0) + minutes;

      await updateDoc(progressRef, {
        weeklyStudyMinutes: weeklyMinutes,
        totalStudyMinutes: (data.totalStudyMinutes || 0) + minutes,
        updatedAt: serverTimestamp(),
      });

      // Also store in daily log for historical charts
      await addDoc(collection(db, 'progress', this.currentUserId, 'studyLogs'), {
        date: this._todayKey(),
        minutes,
        loggedAt: serverTimestamp(),
      });

      return { success: true };
    } catch (error) {
      console.error('Error logging study time:', error);
      return { success: false, error: error.message };
    }
  }

  // ─────────────────────────────────────────────────────────────────────────
  // GPA TRACKING
  // ─────────────────────────────────────────────────────────────────────────

  /**
   * Update the student's current GPA and push a snapshot to history.
   * @param {number} gpa - Calculated GPA value (0.0 – 4.0)
   * @param {string} semester - e.g. "Semester 1, 2026"
   */
  async updateGPA(gpa, semester) {
    if (!this.currentUserId) return { success: false };

    try {
      const progressRef = doc(db, 'progress', this.currentUserId);
      const progressDoc = await getDoc(progressRef);
      const existing = progressDoc.exists() ? progressDoc.data() : {};
      const history = existing.gpaHistory || [];

      // Avoid duplicate entries for the same semester
      const filtered = history.filter((h) => h.semester !== semester);
      const newHistory = [
        ...filtered,
        { semester, gpa, recordedAt: new Date().toISOString() },
      ].slice(-8); // Keep last 8 semesters

      await setDoc(
        progressRef,
        {
          userId: this.currentUserId,
          currentGPA: gpa,
          gpaHistory: newHistory,
          updatedAt: serverTimestamp(),
        },
        { merge: true }
      );

      return { success: true };
    } catch (error) {
      console.error('Error updating GPA:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Derive GPA from the overallGrades collection and persist it.
   */
  async syncGPAFromGradebook(semester = null) {
    if (!this.currentUserId) return { success: false };

    try {
      const gradesQuery = query(
        collection(db, 'overallGrades'),
        where('studentId', '==', this.currentUserId)
      );
      const snapshot = await getDocs(gradesQuery);

      if (snapshot.empty) return { success: true, gpa: 0 };

      const gpas = [];
      snapshot.forEach((d) => {
        if (d.data().gpa != null) gpas.push(d.data().gpa);
      });

      const avgGPA =
        gpas.length > 0
          ? Math.round((gpas.reduce((a, b) => a + b, 0) / gpas.length) * 100) / 100
          : 0;

      const semesterLabel =
        semester || `Semester ${new Date().getMonth() < 6 ? 1 : 2}, ${new Date().getFullYear()}`;

      await this.updateGPA(avgGPA, semesterLabel);
      return { success: true, gpa: avgGPA };
    } catch (error) {
      console.error('Error syncing GPA from gradebook:', error);
      return { success: false, error: error.message };
    }
  }

  // ─────────────────────────────────────────────────────────────────────────
  // READ PROGRESS DATA
  // ─────────────────────────────────────────────────────────────────────────

  /**
   * Get the full progress snapshot for the current user.
   */
  async getMyProgress() {
    if (!this.currentUserId) return null;

    try {
      const progressRef = doc(db, 'progress', this.currentUserId);
      const progressDoc = await getDoc(progressRef);

      if (!progressDoc.exists()) {
        // Initialise if first access
        await this.recordDailyActivity();
        return {
          streak: 1,
          longestStreak: 1,
          totalActiveDays: 1,
          weeklyStudyMinutes: 0,
          totalStudyMinutes: 0,
          currentGPA: 0.0,
          gpaHistory: [],
        };
      }

      const data = progressDoc.data();
      const weeklyStudyHours = Math.round((data.weeklyStudyMinutes || 0) / 60 * 10) / 10;

      return {
        streak: data.streak || 0,
        longestStreak: data.longestStreak || 0,
        totalActiveDays: data.totalActiveDays || 0,
        weeklyStudyMinutes: data.weeklyStudyMinutes || 0,
        weeklyStudyHours,
        totalStudyMinutes: data.totalStudyMinutes || 0,
        currentGPA: data.currentGPA || 0.0,
        gpaHistory: data.gpaHistory || [],
        lastActiveDate: data.lastActiveDate,
      };
    } catch (error) {
      console.error('Error fetching progress:', error);
      return null;
    }
  }

  /**
   * Get daily study log for chart display (last N days).
   * @param {number} days
   */
  async getStudyLogs(days = 7) {
    if (!this.currentUserId) return [];

    try {
      const logsRef = collection(db, 'progress', this.currentUserId, 'studyLogs');
      const q = query(logsRef, orderBy('loggedAt', 'desc'), limit(days * 3));
      const snapshot = await getDocs(q);

      const logs = {};
      snapshot.forEach((d) => {
        const { date, minutes } = d.data();
        if (date) {
          logs[date] = (logs[date] || 0) + minutes;
        }
      });

      // Fill in missing days with 0
      const result = [];
      for (let i = days - 1; i >= 0; i--) {
        const key = this._offsetKey(-i);
        result.push({ date: key, minutes: logs[key] || 0 });
      }

      return result;
    } catch (error) {
      console.error('Error fetching study logs:', error);
      return [];
    }
  }

  // ─────────────────────────────────────────────────────────────────────────
  // REAL-TIME LISTENER
  // ─────────────────────────────────────────────────────────────────────────

  /**
   * Subscribe to live progress updates (for dashboard widgets).
   * @param {function} callback - Called with progress data on each change
   * @returns {function} Unsubscribe function
   */
  listenToProgress(callback) {
    if (!this.currentUserId) {
      callback(null);
      return () => {};
    }

    const progressRef = doc(db, 'progress', this.currentUserId);
    const unsubscribe = onSnapshot(
      progressRef,
      (snap) => {
        if (snap.exists()) {
          const data = snap.data();
          callback({
            streak: data.streak || 0,
            longestStreak: data.longestStreak || 0,
            totalActiveDays: data.totalActiveDays || 0,
            weeklyStudyMinutes: data.weeklyStudyMinutes || 0,
            weeklyStudyHours: Math.round((data.weeklyStudyMinutes || 0) / 60 * 10) / 10,
            totalStudyMinutes: data.totalStudyMinutes || 0,
            currentGPA: data.currentGPA || 0.0,
            gpaHistory: data.gpaHistory || [],
            lastActiveDate: data.lastActiveDate,
          });
        } else {
          callback(null);
        }
      },
      (error) => {
        console.error('Error listening to progress:', error);
        callback(null);
      }
    );

    this.progressListeners.set(this.currentUserId, unsubscribe);
    return unsubscribe;
  }

  // ─────────────────────────────────────────────────────────────────────────
  // WEEKLY RESET
  // ─────────────────────────────────────────────────────────────────────────

  /**
   * Reset weeklyStudyMinutes at the start of each new week.
   * Call this once on login after confirming it's a new ISO week.
   */
  async resetWeeklyStudyIfNeeded() {
    if (!this.currentUserId) return;

    try {
      const progressRef = doc(db, 'progress', this.currentUserId);
      const progressDoc = await getDoc(progressRef);
      if (!progressDoc.exists()) return;

      const data = progressDoc.data();
      const lastReset = data.lastWeeklyReset;
      const currentWeek = this._isoWeekKey();

      if (lastReset !== currentWeek) {
        await updateDoc(progressRef, {
          weeklyStudyMinutes: 0,
          lastWeeklyReset: currentWeek,
          updatedAt: serverTimestamp(),
        });
      }
    } catch (error) {
      console.error('Error resetting weekly study:', error);
    }
  }

  // ─────────────────────────────────────────────────────────────────────────
  // UTILITIES
  // ─────────────────────────────────────────────────────────────────────────

  _todayKey() {
    return new Date().toISOString().split('T')[0];
  }

  _offsetKey(offsetDays) {
    const d = new Date();
    d.setDate(d.getDate() + offsetDays);
    return d.toISOString().split('T')[0];
  }

  _isoWeekKey() {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    d.setDate(d.getDate() + 3 - ((d.getDay() + 6) % 7));
    const week1 = new Date(d.getFullYear(), 0, 4);
    const weekNum =
      1 +
      Math.round(
        ((d.getTime() - week1.getTime()) / 86400000 - 3 + ((week1.getDay() + 6) % 7)) / 7
      );
    return `${d.getFullYear()}-W${String(weekNum).padStart(2, '0')}`;
  }

  cleanup() {
    this.currentUserId = null;
    this.progressListeners.forEach((unsub) => {
      if (typeof unsub === 'function') unsub();
    });
    this.progressListeners.clear();
  }
}

export default new ProgressService();
