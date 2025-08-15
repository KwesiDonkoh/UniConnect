import { 
  collection, 
  addDoc, 
  query, 
  orderBy, 
  onSnapshot, 
  serverTimestamp, 
  doc, 
  updateDoc, 
  deleteDoc,
  where,
  getDocs,
  writeBatch,
  arrayUnion,
  arrayRemove,
  getDoc
} from 'firebase/firestore';
import { auth, db } from '../config/firebaseConfig';

class NotificationService {
  constructor() {
    this.notificationListeners = new Map();
    this.currentUserId = null;
    this.userProfile = null;
    
    // Listen to auth state changes
    auth.onAuthStateChanged((user) => {
      if (user) {
        this.currentUserId = user.uid;
        this.initializeUserProfile();
      } else {
        this.cleanup();
      }
    });
  }

  // Initialize user profile for notification targeting
  async initializeUserProfile() {
    if (!this.currentUserId) return;

    try {
      const userDoc = await getDoc(doc(db, 'users', this.currentUserId));
      if (userDoc.exists()) {
        this.userProfile = { id: this.currentUserId, ...userDoc.data() };
      }
    } catch (error) {
      console.error('Error initializing user profile for notifications:', error);
    }
  }

  // Create a notification (typically by lecturers)
  async createNotification(notificationData) {
    if (!this.currentUserId || !this.userProfile) {
      throw new Error('User not authenticated');
    }

    try {
      const notificationsRef = collection(db, 'notifications');
      
      const notification = {
        title: notificationData.title,
        message: notificationData.message,
        type: notificationData.type || 'announcement', // 'assignment', 'material', 'announcement', 'exam'
        course: notificationData.course,
        courseCode: notificationData.courseCode,
        priority: notificationData.priority || 'normal', // 'low', 'normal', 'high', 'urgent'
        createdBy: this.currentUserId,
        createdByName: this.userProfile.fullName || this.userProfile.name,
        timestamp: serverTimestamp(),
        recipients: notificationData.recipients || [], // Specific user IDs
        targetUserType: notificationData.targetUserType || null, // 'student', 'lecturer', or null for all
        targetAcademicLevel: notificationData.targetAcademicLevel || null, // '100', '200', '300', '400'
        forAllUsers: notificationData.forAllUsers || false,
        readBy: [],
        deletedBy: [],
        actionUrl: notificationData.actionUrl || null, // Deep link or navigation target
        metadata: notificationData.metadata || {}, // Additional data
        expiresAt: notificationData.expiresAt || null // Optional expiration date
      };

      const docRef = await addDoc(notificationsRef, notification);
      
      return { 
        success: true, 
        notificationId: docRef.id,
        notification: { id: docRef.id, ...notification }
      };
    } catch (error) {
      console.error('Error creating notification:', error);
      return { success: false, error: error.message };
    }
  }

  // Get notifications for current user
  async getUserNotifications() {
    if (!this.currentUserId || !this.userProfile) return [];

    try {
      const notificationsRef = collection(db, 'notifications');
      
      // Simple query to avoid index requirements
      let q = query(notificationsRef);

      const snapshot = await getDocs(q);
      const notifications = [];
      
      snapshot.forEach((doc) => {
        const data = doc.data();
        if (this.isNotificationForUser(data)) {
          notifications.push({
            id: doc.id,
            ...data,
            timestamp: data.timestamp?.toDate?.() || new Date(),
            read: data.readBy?.includes(this.currentUserId) || false,
            deleted: data.deletedBy?.includes(this.currentUserId) || false
          });
        }
      });

      // Sort by timestamp in memory and filter out expired/deleted notifications
      const sortedNotifications = notifications.sort((a, b) => b.timestamp - a.timestamp);
      return sortedNotifications.filter(notification => 
        !notification.deleted && 
        (!notification.expiresAt || new Date() < notification.expiresAt)
      );
    } catch (error) {
      console.error('Error getting user notifications:', error);
      return [];
    }
  }

  // Check if a notification is for the current user
  isNotificationForUser(notificationData) {
    if (!this.userProfile) return false;

    // Check if user is in specific recipients
    if (notificationData.recipients?.includes(this.currentUserId)) {
      return true;
    }

    // Check if it's for all users
    if (notificationData.forAllUsers) {
      return true;
    }

    // Check target user type
    if (notificationData.targetUserType && 
        notificationData.targetUserType !== this.userProfile.userType) {
      return false;
    }

    // Check target academic level (for students)
    if (notificationData.targetAcademicLevel && 
        this.userProfile.userType === 'student' &&
        notificationData.targetAcademicLevel !== this.userProfile.academicLevel) {
      return false;
    }

    // If no specific targeting, show to all authenticated users
    return !notificationData.recipients?.length && 
           !notificationData.targetUserType && 
           !notificationData.targetAcademicLevel;
  }

  // Listen to real-time notifications
  listenToUserNotifications(callback) {
    if (!this.currentUserId) {
      callback([]);
      return () => {};
    }

    const notificationsRef = collection(db, 'notifications');
    const q = query(notificationsRef, orderBy('timestamp', 'desc'));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const notifications = [];
      
      snapshot.forEach((doc) => {
        const data = doc.data();
        if (this.isNotificationForUser(data)) {
          notifications.push({
            id: doc.id,
            ...data,
            timestamp: data.timestamp?.toDate?.() || new Date(),
            read: data.readBy?.includes(this.currentUserId) || false,
            deleted: data.deletedBy?.includes(this.currentUserId) || false
          });
        }
      });

      // Filter out expired and deleted notifications
      const validNotifications = notifications.filter(notification => 
        !notification.deleted && 
        (!notification.expiresAt || new Date() < notification.expiresAt)
      );

      callback(validNotifications);
    }, (error) => {
      console.error('Error listening to notifications:', error);
      callback([]);
    });

    return unsubscribe;
  }

  // Mark notification as read
  async markAsRead(notificationId) {
    if (!this.currentUserId) return { success: false, error: 'User not authenticated' };

    try {
      const notificationRef = doc(db, 'notifications', notificationId);
      await updateDoc(notificationRef, {
        readBy: arrayUnion(this.currentUserId)
      });
      return { success: true };
    } catch (error) {
      console.error('Error marking notification as read:', error);
      return { success: false, error: error.message };
    }
  }

  // Mark notification as unread
  async markAsUnread(notificationId) {
    if (!this.currentUserId) return { success: false, error: 'User not authenticated' };

    try {
      const notificationRef = doc(db, 'notifications', notificationId);
      await updateDoc(notificationRef, {
        readBy: arrayRemove(this.currentUserId)
      });
      return { success: true };
    } catch (error) {
      console.error('Error marking notification as unread:', error);
      return { success: false, error: error.message };
    }
  }

  // Mark all notifications as read
  async markAllAsRead() {
    if (!this.currentUserId) return { success: false, error: 'User not authenticated' };

    try {
      const notifications = await this.getUserNotifications();
      const batch = writeBatch(db);
      
      notifications.forEach((notification) => {
        if (!notification.read) {
          const notificationRef = doc(db, 'notifications', notification.id);
          batch.update(notificationRef, {
            readBy: arrayUnion(this.currentUserId)
          });
        }
      });

      await batch.commit();
      return { success: true };
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
      return { success: false, error: error.message };
    }
  }

  // Delete notification for current user (soft delete)
  async deleteNotification(notificationId) {
    if (!this.currentUserId) return { success: false, error: 'User not authenticated' };

    try {
      const notificationRef = doc(db, 'notifications', notificationId);
      await updateDoc(notificationRef, {
        deletedBy: arrayUnion(this.currentUserId)
      });
      return { success: true };
    } catch (error) {
      console.error('Error deleting notification:', error);
      return { success: false, error: error.message };
    }
  }

  // Permanently delete notification (only creator or admin)
  async permanentlyDeleteNotification(notificationId) {
    if (!this.currentUserId) return { success: false, error: 'User not authenticated' };

    try {
      const notificationRef = doc(db, 'notifications', notificationId);
      const notificationDoc = await getDoc(notificationRef);
      
      if (!notificationDoc.exists()) {
        return { success: false, error: 'Notification not found' };
      }

      const notificationData = notificationDoc.data();
      
      // Only creator can permanently delete
      if (notificationData.createdBy !== this.currentUserId) {
        return { success: false, error: 'Permission denied' };
      }

      await deleteDoc(notificationRef);
      return { success: true };
    } catch (error) {
      console.error('Error permanently deleting notification:', error);
      return { success: false, error: error.message };
    }
  }

  // Get unread count
  async getUnreadCount() {
    if (!this.currentUserId) return 0;

    try {
      const notifications = await this.getUserNotifications();
      return notifications.filter(notification => !notification.read).length;
    } catch (error) {
      console.error('Error getting unread count:', error);
      return 0;
    }
  }

  // Create course-specific notification
  async createCourseNotification(courseCode, notificationData) {
    const notification = {
      ...notificationData,
      course: courseCode,
      courseCode: courseCode,
      targetUserType: 'student', // Most course notifications are for students
    };

    return await this.createNotification(notification);
  }

  // Create assignment notification
  async createAssignmentNotification(courseCode, assignmentData) {
    const notification = {
      title: `New Assignment: ${assignmentData.title}`,
      message: assignmentData.description || `${assignmentData.title} has been posted for ${courseCode}`,
      type: 'assignment',
      course: courseCode,
      courseCode: courseCode,
      priority: assignmentData.priority || 'high',
      targetUserType: 'student',
      targetAcademicLevel: assignmentData.academicLevel,
      actionUrl: `assignment/${assignmentData.id}`,
      metadata: {
        assignmentId: assignmentData.id,
        dueDate: assignmentData.dueDate,
        points: assignmentData.points
      },
      expiresAt: assignmentData.dueDate ? new Date(assignmentData.dueDate) : null
    };

    return await this.createNotification(notification);
  }

  // Create exam notification
  async createExamNotification(courseCode, examData) {
    const notification = {
      title: `Exam Scheduled: ${examData.title}`,
      message: examData.description || `${examData.title} exam has been scheduled for ${courseCode}`,
      type: 'exam',
      course: courseCode,
      courseCode: courseCode,
      priority: 'urgent',
      targetUserType: 'student',
      targetAcademicLevel: examData.academicLevel,
      actionUrl: `exam/${examData.id}`,
      metadata: {
        examId: examData.id,
        examDate: examData.date,
        duration: examData.duration,
        location: examData.location
      }
    };

    return await this.createNotification(notification);
  }

  // Create material notification
  async createMaterialNotification(courseCode, materialData) {
    const notification = {
      title: `New Material: ${materialData.title}`,
      message: materialData.description || `New course material has been uploaded for ${courseCode}`,
      type: 'material',
      course: courseCode,
      courseCode: courseCode,
      priority: 'normal',
      targetUserType: 'student',
      targetAcademicLevel: materialData.academicLevel,
      actionUrl: `material/${materialData.id}`,
      metadata: {
        materialId: materialData.id,
        fileType: materialData.fileType,
        fileSize: materialData.fileSize
      }
    };

    return await this.createNotification(notification);
  }

  // Cleanup listeners
  cleanup() {
    this.currentUserId = null;
    this.userProfile = null;
    
    this.notificationListeners.forEach((unsubscribe) => {
      if (typeof unsubscribe === 'function') {
        unsubscribe();
      }
    });
    this.notificationListeners.clear();
  }
}

// Create and export a singleton instance
const notificationService = new NotificationService();
export default notificationService;
