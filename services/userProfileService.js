/**
 * userProfileService.js
 * ----------------------
 * Service for user profile management:
 * - Fetch public profiles (for chat, search, call screens)
 * - Update profile fields
 * - Upload profile photo to Firebase Storage
 * - Search students/lecturers by name or ID
 */

import {
  doc,
  getDoc,
  updateDoc,
  collection,
  query,
  where,
  getDocs,
  orderBy,
  limit,
  setDoc,
  serverTimestamp,
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { updateProfile } from 'firebase/auth';
import { auth, db, storage } from '../config/firebaseConfig';

class UserProfileService {
  constructor() {
    this.profileCache = new Map(); // In-memory cache to reduce reads
    this.CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes
  }

  // ─────────────────────────────────────────────────────────────────────────
  // READ
  // ─────────────────────────────────────────────────────────────────────────

  /**
   * Get the full profile for any user.
   * Uses an in-memory cache to avoid redundant Firestore reads.
   * @param {string} uid
   * @returns {object|null}
   */
  async getUserProfile(uid) {
    if (!uid) return null;

    // Check cache
    const cached = this.profileCache.get(uid);
    if (cached && Date.now() - cached.ts < this.CACHE_TTL_MS) {
      return cached.data;
    }

    try {
      const userDoc = await getDoc(doc(db, 'users', uid));
      if (!userDoc.exists()) return null;

      const data = { id: uid, ...userDoc.data() };
      this.profileCache.set(uid, { data, ts: Date.now() });
      return data;
    } catch (error) {
      console.error('Error fetching user profile:', error);
      return null;
    }
  }

  /**
   * Get a "public" subset of a user's profile (safe to show in chat/search).
   * @param {string} uid
   * @returns {{ uid, name, avatar, userType, identifier, academicLevel?, title? }|null}
   */
  async getPublicProfile(uid) {
    const profile = await this.getUserProfile(uid);
    if (!profile) return null;

    return {
      uid: profile.id || uid,
      name: profile.fullName || profile.name || 'Unknown User',
      avatar: profile.avatar || profile.photoURL || null,
      userType: profile.userType || 'student',
      identifier: profile.identifier || '',
      academicLevel: profile.academicLevel || null,
      title: profile.title || null,
      department: profile.department || 'Computer Science',
    };
  }

  /**
   * Batch-fetch public profiles for an array of UIDs.
   * @param {string[]} uids
   * @returns {object} Map of uid → publicProfile
   */
  async getPublicProfiles(uids = []) {
    const profiles = {};
    await Promise.all(
      uids.map(async (uid) => {
        const profile = await this.getPublicProfile(uid);
        if (profile) profiles[uid] = profile;
      })
    );
    return profiles;
  }

  /**
   * Get the currently logged-in user's own profile from Firestore.
   */
  async getMyProfile() {
    const currentUser = auth.currentUser;
    if (!currentUser) return null;
    return this.getUserProfile(currentUser.uid);
  }

  // ─────────────────────────────────────────────────────────────────────────
  // UPDATE
  // ─────────────────────────────────────────────────────────────────────────

  /**
   * Update editable profile fields for the current user.
   * Supported fields: fullName, bio, phoneNumber, socialLinks, preferences
   * @param {object} updates
   */
  async updateProfile(updates) {
    const currentUser = auth.currentUser;
    if (!currentUser) return { success: false, error: 'Not authenticated' };

    try {
      // Clean out undefined values
      const clean = {};
      Object.entries(updates).forEach(([k, v]) => {
        if (v !== undefined && v !== null) clean[k] = v;
      });

      if (Object.keys(clean).length === 0) {
        return { success: false, error: 'No valid fields to update' };
      }

      // Update Firestore document
      await updateDoc(doc(db, 'users', currentUser.uid), {
        ...clean,
        updatedAt: serverTimestamp(),
      });

      // If name changed, also update Firebase Auth display name
      if (clean.fullName) {
        await updateProfile(currentUser, { displayName: clean.fullName });
      }

      // Invalidate cache
      this.profileCache.delete(currentUser.uid);

      return { success: true };
    } catch (error) {
      console.error('Error updating profile:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Upload a new profile photo and update both Storage + Firestore + Auth.
   * @param {string} imageUri - Local file URI from image picker
   * @returns {{ success, downloadURL? }}
   */
  async uploadProfilePhoto(imageUri) {
    const currentUser = auth.currentUser;
    if (!currentUser) return { success: false, error: 'Not authenticated' };

    try {
      // Fetch the image as a blob
      const response = await fetch(imageUri);
      const blob = await response.blob();

      // Upload to Firebase Storage
      const storageRef = ref(
        storage,
        `profilePhotos/${currentUser.uid}/avatar_${Date.now()}.jpg`
      );
      const snapshot = await uploadBytes(storageRef, blob);
      const downloadURL = await getDownloadURL(snapshot.ref);

      // Update Firestore and Auth profile
      await Promise.all([
        updateDoc(doc(db, 'users', currentUser.uid), {
          avatar: downloadURL,
          photoURL: downloadURL,
          updatedAt: serverTimestamp(),
        }),
        updateProfile(currentUser, { photoURL: downloadURL }),
      ]);

      // Invalidate cache
      this.profileCache.delete(currentUser.uid);

      return { success: true, downloadURL };
    } catch (error) {
      console.error('Error uploading profile photo:', error);
      return { success: false, error: error.message };
    }
  }

  // ─────────────────────────────────────────────────────────────────────────
  // SEARCH
  // ─────────────────────────────────────────────────────────────────────────

  /**
   * Search users by name, student ID, or staff ID.
   * @param {string} searchTerm
   * @param {{ userType?, academicLevel?, limit? }} options
   * @returns {object[]}
   */
  async searchUsers(searchTerm, options = {}) {
    if (!auth.currentUser || !searchTerm?.trim()) return [];

    const term = searchTerm.trim().toLowerCase();
    const maxResults = options.limit || 20;

    try {
      let q = query(collection(db, 'users'));

      // Filter by userType if specified
      if (options.userType) {
        q = query(q, where('userType', '==', options.userType));
      }

      if (options.academicLevel) {
        q = query(q, where('academicLevel', '==', options.academicLevel));
      }

      const snapshot = await getDocs(q);
      const results = [];

      snapshot.forEach((d) => {
        const data = d.data();
        const fullName = (data.fullName || data.name || '').toLowerCase();
        const identifier = (data.identifier || '').toLowerCase();
        const email = (data.email || '').toLowerCase();

        if (
          fullName.includes(term) ||
          identifier.includes(term) ||
          email.includes(term)
        ) {
          results.push({
            uid: d.id,
            name: data.fullName || data.name || 'Unknown',
            avatar: data.avatar || data.photoURL || null,
            identifier: data.identifier || '',
            userType: data.userType || 'student',
            academicLevel: data.academicLevel || null,
            title: data.title || null,
            department: data.department || 'Computer Science',
          });
        }
      });

      return results.slice(0, maxResults);
    } catch (error) {
      console.error('Error searching users:', error);
      return [];
    }
  }

  /**
   * Get all students at a specific academic level.
   * @param {string} level - '100' | '200' | '300' | '400'
   */
  async getStudentsByLevel(level) {
    if (!auth.currentUser) return [];

    try {
      const q = query(
        collection(db, 'users'),
        where('userType', '==', 'student'),
        where('academicLevel', '==', level)
      );
      const snapshot = await getDocs(q);
      const students = [];
      snapshot.forEach((d) => {
        students.push({ uid: d.id, ...d.data() });
      });
      return students;
    } catch (error) {
      console.error('Error getting students by level:', error);
      return [];
    }
  }

  /**
   * Get all lecturers.
   */
  async getAllLecturers() {
    if (!auth.currentUser) return [];

    try {
      const q = query(
        collection(db, 'users'),
        where('userType', '==', 'lecturer')
      );
      const snapshot = await getDocs(q);
      const lecturers = [];
      snapshot.forEach((d) => {
        lecturers.push({ uid: d.id, ...d.data() });
      });
      return lecturers;
    } catch (error) {
      console.error('Error getting lecturers:', error);
      return [];
    }
  }

  // ─────────────────────────────────────────────────────────────────────────
  // PREFERENCES
  // ─────────────────────────────────────────────────────────────────────────

  /**
   * Save user app preferences (theme, notifications, language, etc.)
   * @param {object} preferences
   */
  async savePreferences(preferences) {
    const currentUser = auth.currentUser;
    if (!currentUser) return { success: false };

    try {
      await updateDoc(doc(db, 'users', currentUser.uid), {
        preferences: { ...(preferences || {}) },
        updatedAt: serverTimestamp(),
      });
      this.profileCache.delete(currentUser.uid);
      return { success: true };
    } catch (error) {
      console.error('Error saving preferences:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Add a course to the user's enrolled/teaching courses.
   * @param {string} courseCode
   * @param {'reading'|'teaching'} role
   */
  async addCourse(courseCode, role = 'reading') {
    const currentUser = auth.currentUser;
    if (!currentUser) return { success: false };

    try {
      const field = role === 'teaching' ? 'teachingCourses' : 'readingCourses';
      const profileDoc = await getDoc(doc(db, 'users', currentUser.uid));
      const current = profileDoc.exists() ? profileDoc.data()[field] || [] : [];

      if (current.includes(courseCode)) return { success: true }; // Already added

      await updateDoc(doc(db, 'users', currentUser.uid), {
        [field]: [...current, courseCode],
        updatedAt: serverTimestamp(),
      });
      this.profileCache.delete(currentUser.uid);
      return { success: true };
    } catch (error) {
      console.error('Error adding course:', error);
      return { success: false, error: error.message };
    }
  }

  // ─────────────────────────────────────────────────────────────────────────
  // CACHE MANAGEMENT
  // ─────────────────────────────────────────────────────────────────────────

  clearCache(uid = null) {
    if (uid) {
      this.profileCache.delete(uid);
    } else {
      this.profileCache.clear();
    }
  }
}

export default new UserProfileService();
