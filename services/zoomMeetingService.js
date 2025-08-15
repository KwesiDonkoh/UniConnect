// Zoom Meeting Service for Online Lectures
import { 
  collection, 
  addDoc, 
  doc, 
  updateDoc, 
  deleteDoc, 
  getDocs, 
  getDoc,
  query, 
  where, 
  orderBy, 
  serverTimestamp,
  onSnapshot 
} from 'firebase/firestore';
import { db } from '../config/firebaseConfig';
import { Alert, Linking } from 'react-native';

class ZoomMeetingService {
  constructor() {
    this.meetingListeners = new Map();
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

  // Create a new Zoom meeting
  async createMeeting(meetingData) {
    try {
      if (!this.currentUserId) {
        throw new Error('User not authenticated');
      }

      if (this.currentUserType !== 'lecturer') {
        throw new Error('Only lecturers can create meetings');
      }

      const meeting = {
        id: `meeting_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        title: meetingData.title || 'Online Lecture',
        description: meetingData.description || '',
        courseCode: meetingData.courseCode,
        courseName: meetingData.courseName,
        hostId: this.currentUserId,
        hostName: this.currentUserName,
        scheduledTime: meetingData.scheduledTime,
        duration: meetingData.duration || 60, // minutes
        meetingType: meetingData.meetingType || 'lecture', // lecture, tutorial, office_hours
        status: 'scheduled', // scheduled, live, ended, cancelled
        participants: [],
        maxParticipants: meetingData.maxParticipants || 100,
        isRecordingEnabled: meetingData.isRecordingEnabled || false,
        allowScreenShare: meetingData.allowScreenShare !== false,
        allowChat: meetingData.allowChat !== false,
        waitingRoomEnabled: meetingData.waitingRoomEnabled || true,
        passwordRequired: meetingData.passwordRequired || false,
        meetingPassword: meetingData.passwordRequired ? this.generateMeetingPassword() : null,
        
        // Meeting URLs (simulated for demo - in production would integrate with actual Zoom API)
        joinUrl: this.generateJoinUrl(),
        startUrl: this.generateStartUrl(),
        
        // Timestamps
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        
        // Additional features
        breakoutRoomsEnabled: meetingData.breakoutRoomsEnabled || false,
        pollsEnabled: meetingData.pollsEnabled || false,
        whiteboardEnabled: meetingData.whiteboardEnabled || false,
        
        // Attendance tracking
        attendanceTracking: meetingData.attendanceTracking !== false,
        requiredAttendance: meetingData.requiredAttendance || false,
      };

      const docRef = await addDoc(collection(db, 'zoomMeetings'), meeting);
      
      // Notify enrolled students
      await this.notifyEnrolledStudents(meetingData.courseCode, {
        meetingId: docRef.id,
        title: meeting.title,
        scheduledTime: meeting.scheduledTime,
        courseCode: meeting.courseCode
      });

      console.log('Zoom meeting created:', docRef.id);
      
      return { 
        success: true, 
        meetingId: docRef.id,
        meeting: { ...meeting, id: docRef.id }
      };
    } catch (error) {
      console.error('Error creating Zoom meeting:', error);
      return { success: false, error: error.message };
    }
  }

  // Start a meeting (for lecturers)
  async startMeeting(meetingId) {
    try {
      if (!this.currentUserId) {
        throw new Error('User not authenticated');
      }

      const meetingRef = doc(db, 'zoomMeetings', meetingId);
      const meetingDoc = await getDoc(meetingRef);
      
      if (!meetingDoc.exists()) {
        throw new Error('Meeting not found');
      }

      const meetingData = meetingDoc.data();
      
      if (meetingData.hostId !== this.currentUserId) {
        throw new Error('Only the meeting host can start the meeting');
      }

      // Update meeting status
      await updateDoc(meetingRef, {
        status: 'live',
        actualStartTime: serverTimestamp(),
        updatedAt: serverTimestamp()
      });

      // In a real implementation, this would launch the Zoom app or web client
      const startUrl = meetingData.startUrl;
      
      // Try to open Zoom app, fallback to web browser
      try {
        await Linking.openURL(startUrl);
      } catch (linkingError) {
        // Fallback to web browser
        await Linking.openURL(`https://zoom.us/j/${meetingData.id}`);
      }

      return { 
        success: true, 
        message: 'Meeting started successfully',
        meetingUrl: startUrl 
      };
    } catch (error) {
      console.error('Error starting meeting:', error);
      return { success: false, error: error.message };
    }
  }

  // Join a meeting (for students and lecturers)
  async joinMeeting(meetingId, participantName = null) {
    try {
      if (!this.currentUserId) {
        throw new Error('User not authenticated');
      }

      const meetingRef = doc(db, 'zoomMeetings', meetingId);
      const meetingDoc = await getDoc(meetingRef);
      
      if (!meetingDoc.exists()) {
        throw new Error('Meeting not found');
      }

      const meetingData = meetingDoc.data();
      
      if (meetingData.status === 'ended' || meetingData.status === 'cancelled') {
        throw new Error('Meeting has ended or been cancelled');
      }

      // Add participant to meeting
      const participant = {
        userId: this.currentUserId,
        name: participantName || this.currentUserName,
        userType: this.currentUserType,
        joinedAt: serverTimestamp(),
        isActive: true
      };

      // Update participants list
      const currentParticipants = meetingData.participants || [];
      const updatedParticipants = currentParticipants.filter(p => p.userId !== this.currentUserId);
      updatedParticipants.push(participant);

      await updateDoc(meetingRef, {
        participants: updatedParticipants,
        updatedAt: serverTimestamp()
      });

      // Generate join URL with participant info
      const joinUrl = `${meetingData.joinUrl}&name=${encodeURIComponent(participant.name)}`;
      
      // Try to open Zoom app, fallback to web browser
      try {
        await Linking.openURL(joinUrl);
      } catch (linkingError) {
        // Fallback to web browser
        await Linking.openURL(`https://zoom.us/j/${meetingData.id}`);
      }

      return { 
        success: true, 
        message: 'Joining meeting...',
        meetingUrl: joinUrl 
      };
    } catch (error) {
      console.error('Error joining meeting:', error);
      return { success: false, error: error.message };
    }
  }

  // Get meetings for a course
  async getCourseMeetings(courseCode, status = null) {
    try {
      let q = query(
        collection(db, 'zoomMeetings'),
        where('courseCode', '==', courseCode),
        orderBy('scheduledTime', 'desc')
      );

      if (status) {
        q = query(q, where('status', '==', status));
      }

      const snapshot = await getDocs(q);
      const meetings = [];
      
      snapshot.forEach(doc => {
        const data = doc.data();
        meetings.push({
          id: doc.id,
          ...data,
          scheduledTime: data.scheduledTime?.toDate(),
          createdAt: data.createdAt?.toDate(),
          updatedAt: data.updatedAt?.toDate(),
          actualStartTime: data.actualStartTime?.toDate(),
          actualEndTime: data.actualEndTime?.toDate(),
        });
      });

      return { success: true, meetings };
    } catch (error) {
      console.error('Error getting course meetings:', error);
      return { success: false, error: error.message };
    }
  }

  // End a meeting
  async endMeeting(meetingId) {
    try {
      if (!this.currentUserId) {
        throw new Error('User not authenticated');
      }

      const meetingRef = doc(db, 'zoomMeetings', meetingId);
      const meetingDoc = await getDoc(meetingRef);
      
      if (!meetingDoc.exists()) {
        throw new Error('Meeting not found');
      }

      const meetingData = meetingDoc.data();
      
      if (meetingData.hostId !== this.currentUserId) {
        throw new Error('Only the meeting host can end the meeting');
      }

      await updateDoc(meetingRef, {
        status: 'ended',
        actualEndTime: serverTimestamp(),
        updatedAt: serverTimestamp()
      });

      return { success: true, message: 'Meeting ended successfully' };
    } catch (error) {
      console.error('Error ending meeting:', error);
      return { success: false, error: error.message };
    }
  }

  // Listen to meeting updates
  listenToMeetingUpdates(meetingId, callback) {
    try {
      const meetingRef = doc(db, 'zoomMeetings', meetingId);
      
      const unsubscribe = onSnapshot(meetingRef, (doc) => {
        if (doc.exists()) {
          const data = doc.data();
          const meeting = {
            id: doc.id,
            ...data,
            scheduledTime: data.scheduledTime?.toDate(),
            createdAt: data.createdAt?.toDate(),
            updatedAt: data.updatedAt?.toDate(),
            actualStartTime: data.actualStartTime?.toDate(),
            actualEndTime: data.actualEndTime?.toDate(),
          };
          callback(meeting);
        }
      });

      this.meetingListeners.set(meetingId, unsubscribe);
      return unsubscribe;
    } catch (error) {
      console.error('Error listening to meeting updates:', error);
      return null;
    }
  }

  // Generate meeting URLs (simulated)
  generateJoinUrl() {
    const meetingNumber = Math.floor(Math.random() * 999999999) + 100000000;
    return `zoommtg://zoom.us/join?action=join&confno=${meetingNumber}`;
  }

  generateStartUrl() {
    const meetingNumber = Math.floor(Math.random() * 999999999) + 100000000;
    return `zoommtg://zoom.us/start?action=start&confno=${meetingNumber}`;
  }

  generateMeetingPassword() {
    return Math.random().toString(36).substr(2, 8);
  }

  // Notify enrolled students about new meeting
  async notifyEnrolledStudents(courseCode, meetingInfo) {
    try {
      // In a real app, this would send push notifications
      // For now, we'll create in-app notifications
      const notification = {
        type: 'meeting_scheduled',
        title: 'New Online Lecture Scheduled',
        message: `${meetingInfo.title} has been scheduled for ${courseCode}`,
        data: {
          meetingId: meetingInfo.meetingId,
          courseCode: courseCode,
          scheduledTime: meetingInfo.scheduledTime
        },
        createdAt: serverTimestamp(),
        read: false
      };

      // This would typically query enrolled students and send notifications
      console.log('Meeting notification would be sent to enrolled students:', notification);
      
      return { success: true };
    } catch (error) {
      console.error('Error notifying students:', error);
      return { success: false, error: error.message };
    }
  }

  // Get meeting analytics
  async getMeetingAnalytics(meetingId) {
    try {
      const meetingRef = doc(db, 'zoomMeetings', meetingId);
      const meetingDoc = await getDoc(meetingRef);
      
      if (!meetingDoc.exists()) {
        throw new Error('Meeting not found');
      }

      const meetingData = meetingDoc.data();
      const participants = meetingData.participants || [];
      
      const analytics = {
        totalParticipants: participants.length,
        studentsJoined: participants.filter(p => p.userType === 'student').length,
        lecturersJoined: participants.filter(p => p.userType === 'lecturer').length,
        averageJoinTime: this.calculateAverageJoinTime(participants, meetingData.actualStartTime),
        attendanceRate: this.calculateAttendanceRate(participants, meetingData.courseCode),
        duration: this.calculateMeetingDuration(meetingData.actualStartTime, meetingData.actualEndTime),
        peakParticipants: participants.length, // Simplified
        status: meetingData.status
      };

      return { success: true, analytics };
    } catch (error) {
      console.error('Error getting meeting analytics:', error);
      return { success: false, error: error.message };
    }
  }

  calculateAverageJoinTime(participants, startTime) {
    if (!participants.length || !startTime) return 0;
    
    const joinTimes = participants
      .filter(p => p.joinedAt)
      .map(p => p.joinedAt.toDate().getTime() - startTime.toDate().getTime());
    
    return joinTimes.reduce((sum, time) => sum + time, 0) / joinTimes.length;
  }

  calculateAttendanceRate(participants, courseCode) {
    // This would typically compare against enrolled students
    // For now, return a simplified calculation
    return participants.length > 0 ? (participants.length / 30) * 100 : 0; // Assuming 30 enrolled students
  }

  calculateMeetingDuration(startTime, endTime) {
    if (!startTime || !endTime) return 0;
    return endTime.toDate().getTime() - startTime.toDate().getTime();
  }

  // Cleanup listeners
  cleanup() {
    this.meetingListeners.forEach(unsubscribe => {
      if (typeof unsubscribe === 'function') {
        unsubscribe();
      }
    });
    this.meetingListeners.clear();
  }
}

// Global instance
const zoomMeetingService = new ZoomMeetingService();

export default zoomMeetingService;
