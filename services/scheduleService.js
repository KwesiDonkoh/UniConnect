import { 
  collection, 
  addDoc, 
  serverTimestamp, 
  doc, 
  updateDoc,
  query,
  where,
  orderBy,
  onSnapshot,
  getDocs,
  deleteDoc,
  Timestamp
} from 'firebase/firestore';
import { db } from '../config/firebaseConfig';

class ScheduleService {
  constructor() {
    this.scheduleListeners = new Map();
  }

  // Create new class schedule
  async createSchedule(scheduleData) {
    try {
      const schedule = {
        ...scheduleData,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        status: 'scheduled',
        attendanceRecorded: false,
        attendees: [],
      };

      const docRef = await addDoc(collection(db, 'classSchedule'), schedule);
      
      // Send notification to students
      await this.notifyStudentsAboutClass(docRef.id, scheduleData);
      
      return { success: true, scheduleId: docRef.id };
    } catch (error) {
      console.error('Error creating schedule:', error);
      return { success: false, error: error.message };
    }
  }

  // Update schedule
  async updateSchedule(scheduleId, updates) {
    try {
      await updateDoc(doc(db, 'classSchedule', scheduleId), {
        ...updates,
        updatedAt: serverTimestamp(),
      });
      
      return { success: true };
    } catch (error) {
      console.error('Error updating schedule:', error);
      return { success: false, error: error.message };
    }
  }

  // Get schedule for course
  async getCourseSchedule(courseCode, startDate = null, endDate = null) {
    try {
      let q = query(
        collection(db, 'classSchedule'),
        where('courseCode', '==', courseCode),
        orderBy('startTime', 'asc')
      );
      
      if (startDate) {
        q = query(q, where('startTime', '>=', Timestamp.fromDate(startDate)));
      }
      
      if (endDate) {
        q = query(q, where('startTime', '<=', Timestamp.fromDate(endDate)));
      }
      
      const snapshot = await getDocs(q);
      const schedules = [];
      
      snapshot.forEach(doc => {
        const data = doc.data();
        schedules.push({
          id: doc.id,
          ...data,
          startTime: data.startTime?.toDate(),
          endTime: data.endTime?.toDate(),
          createdAt: data.createdAt?.toDate(),
          updatedAt: data.updatedAt?.toDate(),
        });
      });
      
      return { success: true, schedules };
    } catch (error) {
      console.error('Error getting course schedule:', error);
      return { success: false, error: error.message };
    }
  }

  // Get student's full schedule
  async getStudentSchedule(studentId, startDate = null, endDate = null) {
    try {
      // Get student's enrolled courses
      const studentDoc = await getDoc(doc(db, 'users', studentId));
      if (!studentDoc.exists()) {
        return { success: false, error: 'Student not found' };
      }

      const enrolledCourses = studentDoc.data().enrolledCourses || [];
      
      let q = query(
        collection(db, 'classSchedule'),
        where('courseCode', 'in', enrolledCourses),
        orderBy('startTime', 'asc')
      );
      
      if (startDate) {
        q = query(q, where('startTime', '>=', Timestamp.fromDate(startDate)));
      }
      
      if (endDate) {
        q = query(q, where('startTime', '<=', Timestamp.fromDate(endDate)));
      }
      
      const snapshot = await getDocs(q);
      const schedules = [];
      
      snapshot.forEach(doc => {
        const data = doc.data();
        schedules.push({
          id: doc.id,
          ...data,
          startTime: data.startTime?.toDate(),
          endTime: data.endTime?.toDate(),
          createdAt: data.createdAt?.toDate(),
          updatedAt: data.updatedAt?.toDate(),
        });
      });
      
      return { success: true, schedules };
    } catch (error) {
      console.error('Error getting student schedule:', error);
      return { success: false, error: error.message };
    }
  }

  // Get today's classes
  async getTodayClasses(courseCode = null, studentId = null) {
    try {
      const today = new Date();
      const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());
      const endOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1);
      
      if (studentId) {
        return this.getStudentSchedule(studentId, startOfDay, endOfDay);
      } else if (courseCode) {
        return this.getCourseSchedule(courseCode, startOfDay, endOfDay);
      }
      
      return { success: false, error: 'Either courseCode or studentId required' };
    } catch (error) {
      console.error('Error getting today\'s classes:', error);
      return { success: false, error: error.message };
    }
  }

  // Get upcoming classes
  async getUpcomingClasses(courseCode = null, studentId = null, limit = 5) {
    try {
      const now = new Date();
      
      let schedules;
      if (studentId) {
        const result = await this.getStudentSchedule(studentId, now);
        schedules = result.schedules || [];
      } else if (courseCode) {
        const result = await this.getCourseSchedule(courseCode, now);
        schedules = result.schedules || [];
      } else {
        return { success: false, error: 'Either courseCode or studentId required' };
      }
      
      // Filter and sort upcoming classes
      const upcoming = schedules
        .filter(schedule => schedule.startTime > now)
        .slice(0, limit);
      
      return { success: true, schedules: upcoming };
    } catch (error) {
      console.error('Error getting upcoming classes:', error);
      return { success: false, error: error.message };
    }
  }

  // Record attendance for a class
  async recordAttendance(scheduleId, studentId, status = 'present', notes = '') {
    try {
      const attendanceData = {
        scheduleId,
        studentId,
        status, // 'present', 'absent', 'late', 'excused'
        recordedAt: serverTimestamp(),
        notes,
      };

      const docRef = await addDoc(collection(db, 'attendance'), attendanceData);
      
      // Update schedule with attendance info
      await updateDoc(doc(db, 'classSchedule', scheduleId), {
        attendanceRecorded: true,
        updatedAt: serverTimestamp(),
      });
      
      return { success: true, attendanceId: docRef.id };
    } catch (error) {
      console.error('Error recording attendance:', error);
      return { success: false, error: error.message };
    }
  }

  // Get attendance for a class
  async getClassAttendance(scheduleId) {
    try {
      const q = query(
        collection(db, 'attendance'),
        where('scheduleId', '==', scheduleId)
      );
      
      const snapshot = await getDocs(q);
      const attendance = [];
      
      snapshot.forEach(doc => {
        const data = doc.data();
        attendance.push({
          id: doc.id,
          ...data,
          recordedAt: data.recordedAt?.toDate(),
        });
      });
      
      return { success: true, attendance };
    } catch (error) {
      console.error('Error getting class attendance:', error);
      return { success: false, error: error.message };
    }
  }

  // Get student attendance summary
  async getStudentAttendanceSummary(studentId, courseCode = null) {
    try {
      let q = query(
        collection(db, 'attendance'),
        where('studentId', '==', studentId)
      );
      
      if (courseCode) {
        // We'd need to join with schedule data to filter by course
        // For now, we'll get all and filter
      }
      
      const snapshot = await getDocs(q);
      const attendance = [];
      
      snapshot.forEach(doc => {
        const data = doc.data();
        attendance.push({
          id: doc.id,
          ...data,
          recordedAt: data.recordedAt?.toDate(),
        });
      });
      
      // Calculate summary
      const total = attendance.length;
      const present = attendance.filter(a => a.status === 'present').length;
      const absent = attendance.filter(a => a.status === 'absent').length;
      const late = attendance.filter(a => a.status === 'late').length;
      const excused = attendance.filter(a => a.status === 'excused').length;
      
      const attendanceRate = total > 0 ? (present / total) * 100 : 0;
      
      return {
        success: true,
        summary: {
          total,
          present,
          absent,
          late,
          excused,
          attendanceRate: Math.round(attendanceRate * 100) / 100,
        },
        attendance
      };
    } catch (error) {
      console.error('Error getting student attendance summary:', error);
      return { success: false, error: error.message };
    }
  }

  // Listen to schedule updates
  listenToSchedule(courseCode, callback, startDate = null, endDate = null) {
    try {
      let q = query(
        collection(db, 'classSchedule'),
        where('courseCode', '==', courseCode),
        orderBy('startTime', 'asc')
      );
      
      if (startDate) {
        q = query(q, where('startTime', '>=', Timestamp.fromDate(startDate)));
      }
      
      if (endDate) {
        q = query(q, where('startTime', '<=', Timestamp.fromDate(endDate)));
      }
      
      const unsubscribe = onSnapshot(q, (snapshot) => {
        const schedules = [];
        snapshot.forEach(doc => {
          const data = doc.data();
          schedules.push({
            id: doc.id,
            ...data,
            startTime: data.startTime?.toDate(),
            endTime: data.endTime?.toDate(),
            createdAt: data.createdAt?.toDate(),
            updatedAt: data.updatedAt?.toDate(),
          });
        });
        callback(schedules);
      });
      
      this.scheduleListeners.set(courseCode, unsubscribe);
      return unsubscribe;
    } catch (error) {
      console.error('Error listening to schedule:', error);
      callback([]);
    }
  }

  // Cancel class
  async cancelClass(scheduleId, reason = '') {
    try {
      await updateDoc(doc(db, 'classSchedule', scheduleId), {
        status: 'cancelled',
        cancellationReason: reason,
        cancelledAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
      
      // Notify students about cancellation
      await this.notifyStudentsAboutCancellation(scheduleId, reason);
      
      return { success: true };
    } catch (error) {
      console.error('Error cancelling class:', error);
      return { success: false, error: error.message };
    }
  }

  // Reschedule class
  async rescheduleClass(scheduleId, newStartTime, newEndTime, reason = '') {
    try {
      await updateDoc(doc(db, 'classSchedule', scheduleId), {
        startTime: Timestamp.fromDate(newStartTime),
        endTime: Timestamp.fromDate(newEndTime),
        rescheduled: true,
        rescheduleReason: reason,
        rescheduledAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
      
      // Notify students about reschedule
      await this.notifyStudentsAboutReschedule(scheduleId, newStartTime, newEndTime, reason);
      
      return { success: true };
    } catch (error) {
      console.error('Error rescheduling class:', error);
      return { success: false, error: error.message };
    }
  }

  // Delete schedule
  async deleteSchedule(scheduleId) {
    try {
      // Delete related attendance records
      const attendanceQuery = query(
        collection(db, 'attendance'),
        where('scheduleId', '==', scheduleId)
      );
      const attendanceSnapshot = await getDocs(attendanceQuery);
      
      const deletePromises = attendanceSnapshot.docs.map(doc => deleteDoc(doc.ref));
      await Promise.all(deletePromises);
      
      // Delete schedule
      await deleteDoc(doc(db, 'classSchedule', scheduleId));
      
      return { success: true };
    } catch (error) {
      console.error('Error deleting schedule:', error);
      return { success: false, error: error.message };
    }
  }

  // Generate recurring schedule
  async generateRecurringSchedule(scheduleTemplate, startDate, endDate, pattern) {
    try {
      const schedules = [];
      const currentDate = new Date(startDate);
      
      while (currentDate <= endDate) {
        // Check if current date matches the pattern
        if (this.matchesPattern(currentDate, pattern)) {
          const scheduleData = {
            ...scheduleTemplate,
            startTime: new Date(currentDate.getTime() + scheduleTemplate.startTime.getTime() - new Date(scheduleTemplate.startTime).setHours(0,0,0,0)),
            endTime: new Date(currentDate.getTime() + scheduleTemplate.endTime.getTime() - new Date(scheduleTemplate.endTime).setHours(0,0,0,0)),
            recurring: true,
            parentPattern: pattern,
          };
          
          const result = await this.createSchedule(scheduleData);
          if (result.success) {
            schedules.push(result.scheduleId);
          }
        }
        
        currentDate.setDate(currentDate.getDate() + 1);
      }
      
      return { success: true, createdSchedules: schedules };
    } catch (error) {
      console.error('Error generating recurring schedule:', error);
      return { success: false, error: error.message };
    }
  }

  // Helper method to check if date matches pattern
  matchesPattern(date, pattern) {
    // pattern: { days: ['monday', 'wednesday', 'friday'], frequency: 'weekly' }
    const dayNames = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
    const dayName = dayNames[date.getDay()];
    
    return pattern.days.includes(dayName);
  }

  // Notification methods
  async notifyStudentsAboutClass(scheduleId, scheduleData) {
    try {
      console.log(`New class notification: ${scheduleData.title} for ${scheduleData.courseCode}`);
      return { success: true };
    } catch (error) {
      console.error('Error notifying students about class:', error);
      return { success: false, error: error.message };
    }
  }

  async notifyStudentsAboutCancellation(scheduleId, reason) {
    try {
      console.log(`Class cancellation notification: ${scheduleId} - ${reason}`);
      return { success: true };
    } catch (error) {
      console.error('Error notifying students about cancellation:', error);
      return { success: false, error: error.message };
    }
  }

  async notifyStudentsAboutReschedule(scheduleId, newStartTime, newEndTime, reason) {
    try {
      console.log(`Class reschedule notification: ${scheduleId} - ${reason}`);
      return { success: true };
    } catch (error) {
      console.error('Error notifying students about reschedule:', error);
      return { success: false, error: error.message };
    }
  }

  // Clean up listeners
  cleanup() {
    this.scheduleListeners.forEach(unsubscribe => unsubscribe());
    this.scheduleListeners.clear();
  }
}

export default new ScheduleService();
