// Course Representative Service for Student-Lecturer Communication
import { 
  collection, 
  addDoc, 
  doc, 
  updateDoc, 
  getDocs, 
  getDoc,
  query, 
  where, 
  orderBy, 
  onSnapshot,
  serverTimestamp,
  limit
} from 'firebase/firestore';
import { db } from '../config/firebaseConfig';
import { Alert } from 'react-native';

class CourseRepService {
  constructor() {
    this.requestListeners = new Map();
    this.announcementListeners = new Map();
    this.currentUserId = null;
    this.currentUserName = null;
    this.currentUserType = null;
  }

  // Set current user
  setCurrentUser(userId, userName, userType) {
    this.currentUserId = userId;
    this.currentUserName = userName;
    this.currentUserType = userType;
  }

  // Set course representative for a course
  async setCourseRepresentative(courseCode, courseName, repUserId, repUserName) {
    try {
      const courseRepData = {
        courseCode,
        courseName,
        representativeId: repUserId,
        representativeName: repUserName,
        assignedAt: serverTimestamp(),
        assignedBy: this.currentUserId,
        isActive: true,
        
        // Representative permissions
        permissions: {
          createAssignmentRequests: true,
          createQuizRequests: true,
          sendAnnouncements: true,
          contactLecturers: true,
          manageClassSchedule: false,
          viewAnalytics: false
        },
        
        // Contact info
        contactMethods: ['chat', 'privateMessage', 'groupChat'],
      };

      const docRef = await addDoc(collection(db, 'courseRepresentatives'), courseRepData);
      
      console.log('Course representative assigned:', docRef.id);
      
      return { 
        success: true, 
        assignmentId: docRef.id,
        courseRep: { ...courseRepData, id: docRef.id }
      };
    } catch (error) {
      console.error('Error setting course representative:', error);
      return { success: false, error: error.message };
    }
  }

  // Get course representative for a course
  async getCourseRepresentative(courseCode) {
    try {
      const q = query(
        collection(db, 'courseRepresentatives'),
        where('courseCode', '==', courseCode),
        where('isActive', '==', true)
      );

      const snapshot = await getDocs(q);
      
      if (!snapshot.empty) {
        const doc = snapshot.docs[0];
        const data = doc.data();
        return {
          success: true,
          courseRep: {
            id: doc.id,
            ...data,
            assignedAt: data.assignedAt?.toDate(),
          }
        };
      }
      
      return { success: true, courseRep: null };
    } catch (error) {
      console.error('Error getting course representative:', error);
      return { success: false, error: error.message };
    }
  }

  // Check if user is a course representative for any course
  async getUserRepresentativeCourses(userId = null) {
    try {
      const targetUserId = userId || this.currentUserId;
      
      if (!targetUserId) {
        throw new Error('User ID not provided');
      }

      const q = query(
        collection(db, 'courseRepresentatives'),
        where('representativeId', '==', targetUserId),
        where('isActive', '==', true)
      );

      const snapshot = await getDocs(q);
      const courses = [];
      
      snapshot.forEach(doc => {
        const data = doc.data();
        courses.push({
          id: doc.id,
          ...data,
          assignedAt: data.assignedAt?.toDate(),
        });
      });

      return { success: true, courses };
    } catch (error) {
      console.error('Error getting user representative courses:', error);
      return { success: false, error: error.message };
    }
  }

  // Create assignment request (Course Rep to Lecturer)
  async createAssignmentRequest(courseCode, courseName, lecturerIds, requestData) {
    try {
      if (!this.currentUserId) {
        throw new Error('User not authenticated');
      }

      // Verify user is course rep for this course
      const repResult = await this.getCourseRepresentative(courseCode);
      if (!repResult.success || !repResult.courseRep || repResult.courseRep.representativeId !== this.currentUserId) {
        throw new Error('Only course representatives can create assignment requests');
      }

      const request = {
        type: 'assignment',
        courseCode,
        courseName,
        requestedBy: this.currentUserId,
        requestedByName: this.currentUserName,
        targetLecturers: Array.isArray(lecturerIds) ? lecturerIds : [lecturerIds],
        status: 'pending', // pending, approved, rejected, in_progress, completed
        priority: requestData.priority || 'normal', // low, normal, high, urgent
        
        // Assignment details
        title: requestData.title,
        description: requestData.description,
        dueDate: requestData.dueDate,
        submissionFormat: requestData.submissionFormat || 'online', // online, physical, both
        maxMarks: requestData.maxMarks || 100,
        weightage: requestData.weightage || 10, // percentage
        instructions: requestData.instructions || '',
        resources: requestData.resources || [],
        
        // Request metadata
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        requestReason: requestData.reason || '',
        isUrgent: requestData.priority === 'urgent',
        
        // Tracking
        responses: {},
        approvalCount: 0,
        rejectionCount: 0,
      };

      const docRef = await addDoc(collection(db, 'courseRepRequests'), request);
      
      // Notify lecturers (in a real app, this would send push notifications)
      await this.notifyLecturersOfRequest(docRef.id, lecturerIds, request);
      
      console.log('Assignment request created:', docRef.id);
      
      return { 
        success: true, 
        requestId: docRef.id,
        request: { ...request, id: docRef.id }
      };
    } catch (error) {
      console.error('Error creating assignment request:', error);
      return { success: false, error: error.message };
    }
  }

  // Create quiz request (Course Rep to Lecturer)
  async createQuizRequest(courseCode, courseName, lecturerIds, requestData) {
    try {
      if (!this.currentUserId) {
        throw new Error('User not authenticated');
      }

      // Verify user is course rep for this course
      const repResult = await this.getCourseRepresentative(courseCode);
      if (!repResult.success || !repResult.courseRep || repResult.courseRep.representativeId !== this.currentUserId) {
        throw new Error('Only course representatives can create quiz requests');
      }

      const request = {
        type: 'quiz',
        courseCode,
        courseName,
        requestedBy: this.currentUserId,
        requestedByName: this.currentUserName,
        targetLecturers: Array.isArray(lecturerIds) ? lecturerIds : [lecturerIds],
        status: 'pending',
        priority: requestData.priority || 'normal',
        
        // Quiz details
        title: requestData.title,
        description: requestData.description,
        scheduledDate: requestData.scheduledDate,
        duration: requestData.duration || 60, // minutes
        format: requestData.format || 'online', // online, physical, both
        questionCount: requestData.questionCount || 10,
        maxMarks: requestData.maxMarks || 100,
        questionTypes: requestData.questionTypes || ['multiple_choice'],
        topics: requestData.topics || [],
        instructions: requestData.instructions || '',
        
        // Request metadata
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        requestReason: requestData.reason || '',
        isUrgent: requestData.priority === 'urgent',
        
        // Tracking
        responses: {},
        approvalCount: 0,
        rejectionCount: 0,
      };

      const docRef = await addDoc(collection(db, 'courseRepRequests'), request);
      
      // Notify lecturers
      await this.notifyLecturersOfRequest(docRef.id, lecturerIds, request);
      
      console.log('Quiz request created:', docRef.id);
      
      return { 
        success: true, 
        requestId: docRef.id,
        request: { ...request, id: docRef.id }
      };
    } catch (error) {
      console.error('Error creating quiz request:', error);
      return { success: false, error: error.message };
    }
  }

  // Get requests for course representative
  async getRepresentativeRequests(status = null) {
    try {
      if (!this.currentUserId) {
        throw new Error('User not authenticated');
      }

      let q = query(
        collection(db, 'courseRepRequests'),
        where('requestedBy', '==', this.currentUserId),
        orderBy('createdAt', 'desc')
      );

      if (status) {
        q = query(q, where('status', '==', status));
      }

      const snapshot = await getDocs(q);
      const requests = [];
      
      snapshot.forEach(doc => {
        const data = doc.data();
        requests.push({
          id: doc.id,
          ...data,
          createdAt: data.createdAt?.toDate(),
          updatedAt: data.updatedAt?.toDate(),
          scheduledDate: data.scheduledDate?.toDate(),
          dueDate: data.dueDate?.toDate(),
        });
      });

      return { success: true, requests };
    } catch (error) {
      console.error('Error getting representative requests:', error);
      return { success: false, error: error.message };
    }
  }

  // Get requests for lecturer
  async getLecturerRequests(status = null) {
    try {
      if (!this.currentUserId || this.currentUserType !== 'lecturer') {
        throw new Error('Unauthorized access');
      }

      let q = query(
        collection(db, 'courseRepRequests'),
        where('targetLecturers', 'array-contains', this.currentUserId),
        orderBy('createdAt', 'desc')
      );

      if (status) {
        q = query(q, where('status', '==', status));
      }

      const snapshot = await getDocs(q);
      const requests = [];
      
      snapshot.forEach(doc => {
        const data = doc.data();
        requests.push({
          id: doc.id,
          ...data,
          createdAt: data.createdAt?.toDate(),
          updatedAt: data.updatedAt?.toDate(),
          scheduledDate: data.scheduledDate?.toDate(),
          dueDate: data.dueDate?.toDate(),
        });
      });

      return { success: true, requests };
    } catch (error) {
      console.error('Error getting lecturer requests:', error);
      return { success: false, error: error.message };
    }
  }

  // Respond to request (Lecturer response)
  async respondToRequest(requestId, response, comments = '') {
    try {
      if (!this.currentUserId || this.currentUserType !== 'lecturer') {
        throw new Error('Only lecturers can respond to requests');
      }

      const requestRef = doc(db, 'courseRepRequests', requestId);
      const requestDoc = await getDoc(requestRef);
      
      if (!requestDoc.exists()) {
        throw new Error('Request not found');
      }

      const requestData = requestDoc.data();
      
      // Check if lecturer is authorized to respond
      if (!requestData.targetLecturers.includes(this.currentUserId)) {
        throw new Error('Not authorized to respond to this request');
      }

      // Update response
      const responses = requestData.responses || {};
      responses[this.currentUserId] = {
        response, // 'approved', 'rejected'
        comments,
        respondedAt: serverTimestamp(),
        lecturerName: this.currentUserName
      };

      // Calculate new status
      const approvals = Object.values(responses).filter(r => r.response === 'approved').length;
      const rejections = Object.values(responses).filter(r => r.response === 'rejected').length;
      
      let newStatus = requestData.status;
      if (approvals > 0 && rejections === 0) {
        newStatus = 'approved';
      } else if (rejections > 0) {
        newStatus = 'rejected';
      }

      await updateDoc(requestRef, {
        responses,
        approvalCount: approvals,
        rejectionCount: rejections,
        status: newStatus,
        updatedAt: serverTimestamp(),
        lastResponseAt: serverTimestamp(),
      });

      console.log('Request response updated:', requestId);
      
      return { success: true, newStatus };
    } catch (error) {
      console.error('Error responding to request:', error);
      return { success: false, error: error.message };
    }
  }

  // Send announcement to course (Course Rep)
  async sendCourseAnnouncement(courseCode, courseName, announcementData) {
    try {
      if (!this.currentUserId) {
        throw new Error('User not authenticated');
      }

      // Verify user is course rep for this course
      const repResult = await this.getCourseRepresentative(courseCode);
      if (!repResult.success || !repResult.courseRep || repResult.courseRep.representativeId !== this.currentUserId) {
        throw new Error('Only course representatives can send announcements');
      }

      const announcement = {
        courseCode,
        courseName,
        sentBy: this.currentUserId,
        sentByName: this.currentUserName,
        sentByType: 'course_representative',
        
        // Announcement content
        title: announcementData.title,
        message: announcementData.message,
        type: announcementData.type || 'general', // general, urgent, reminder, update
        priority: announcementData.priority || 'normal',
        
        // Targeting
        targetAudience: announcementData.targetAudience || 'all', // all, students, lecturers
        isUrgent: announcementData.priority === 'urgent',
        
        // Metadata
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        expiresAt: announcementData.expiresAt || null,
        isActive: true,
        
        // Engagement tracking
        views: {},
        viewCount: 0,
        acknowledgedBy: {},
        acknowledgmentCount: 0,
      };

      const docRef = await addDoc(collection(db, 'courseAnnouncements'), announcement);
      
      console.log('Course announcement sent:', docRef.id);
      
      return { 
        success: true, 
        announcementId: docRef.id,
        announcement: { ...announcement, id: docRef.id }
      };
    } catch (error) {
      console.error('Error sending course announcement:', error);
      return { success: false, error: error.message };
    }
  }

  // Get course announcements
  async getCourseAnnouncements(courseCode, limitCount = 20) {
    try {
      const q = query(
        collection(db, 'courseAnnouncements'),
        where('courseCode', '==', courseCode),
        where('isActive', '==', true),
        orderBy('createdAt', 'desc'),
        limit(limitCount)
      );

      const snapshot = await getDocs(q);
      const announcements = [];
      
      snapshot.forEach(doc => {
        const data = doc.data();
        announcements.push({
          id: doc.id,
          ...data,
          createdAt: data.createdAt?.toDate(),
          updatedAt: data.updatedAt?.toDate(),
          expiresAt: data.expiresAt?.toDate(),
        });
      });

      return { success: true, announcements };
    } catch (error) {
      console.error('Error getting course announcements:', error);
      return { success: false, error: error.message };
    }
  }

  // Notify lecturers of new request
  async notifyLecturersOfRequest(requestId, lecturerIds, requestData) {
    try {
      // In a real app, this would send push notifications
      const notification = {
        type: 'course_rep_request',
        title: `New ${requestData.type} request`,
        message: `Course representative has requested: ${requestData.title}`,
        data: {
          requestId,
          courseCode: requestData.courseCode,
          requestType: requestData.type
        },
        targetUsers: lecturerIds,
        createdAt: serverTimestamp(),
        isRead: false
      };

      console.log('Lecturer notification would be sent:', notification);
      
      return { success: true };
    } catch (error) {
      console.error('Error notifying lecturers:', error);
      return { success: false, error: error.message };
    }
  }

  // Listen to requests in real-time
  listenToRequests(callback) {
    try {
      if (!this.currentUserId) {
        throw new Error('User not authenticated');
      }

      let q;
      if (this.currentUserType === 'lecturer') {
        q = query(
          collection(db, 'courseRepRequests'),
          where('targetLecturers', 'array-contains', this.currentUserId),
          orderBy('createdAt', 'desc')
        );
      } else {
        q = query(
          collection(db, 'courseRepRequests'),
          where('requestedBy', '==', this.currentUserId),
          orderBy('createdAt', 'desc')
        );
      }
      
      const unsubscribe = onSnapshot(q, (snapshot) => {
        const requests = [];
        snapshot.forEach(doc => {
          const data = doc.data();
          requests.push({
            id: doc.id,
            ...data,
            createdAt: data.createdAt?.toDate(),
            updatedAt: data.updatedAt?.toDate(),
            scheduledDate: data.scheduledDate?.toDate(),
            dueDate: data.dueDate?.toDate(),
          });
        });
        callback(requests);
      });

      this.requestListeners.set('userRequests', unsubscribe);
      return unsubscribe;
    } catch (error) {
      console.error('Error listening to requests:', error);
      return null;
    }
  }

  // Cleanup listeners
  cleanup() {
    this.requestListeners.forEach(unsubscribe => {
      if (typeof unsubscribe === 'function') {
        unsubscribe();
      }
    });
    this.requestListeners.clear();

    this.announcementListeners.forEach(unsubscribe => {
      if (typeof unsubscribe === 'function') {
        unsubscribe();
      }
    });
    this.announcementListeners.clear();
  }
}

// Global instance
const courseRepService = new CourseRepService();

export default courseRepService;
