// Private Messaging Service for Student-Lecturer Confidential Communication
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

class PrivateMessagingService {
  constructor() {
    this.conversationListeners = new Map();
    this.messageListeners = new Map();
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

  // Start a private conversation
  async startPrivateConversation(otherUserId, otherUserName, otherUserType, courseCode = null, subject = '') {
    try {
      if (!this.currentUserId) {
        throw new Error('User not authenticated');
      }

      // Check if conversation already exists
      const existingConversation = await this.findExistingConversation(otherUserId);
      if (existingConversation) {
        return { success: true, conversationId: existingConversation.id, conversation: existingConversation };
      }

      // Create conversation ID from user IDs (sorted to ensure consistency)
      const participantIds = [this.currentUserId, otherUserId].sort();
      const conversationId = `private_${participantIds[0]}_${participantIds[1]}`;

      const conversationData = {
        id: conversationId,
        type: 'private',
        participants: {
          [this.currentUserId]: {
            id: this.currentUserId,
            name: this.currentUserName,
            userType: this.currentUserType,
            lastSeen: serverTimestamp(),
            hasUnread: false
          },
          [otherUserId]: {
            id: otherUserId,
            name: otherUserName,
            userType: otherUserType,
            lastSeen: null,
            hasUnread: true
          }
        },
        participantIds,
        courseCode: courseCode || '',
        subject: subject || 'Private Consultation',
        isActive: true,
        isConfidential: true,
        lastMessage: null,
        lastActivity: serverTimestamp(),
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        
        // Privacy settings
        encryption: true,
        autoDelete: false,
        allowScreenshots: false,
        
        // Metadata
        initiatedBy: this.currentUserId,
        initiatedByType: this.currentUserType,
        status: 'active', // active, closed, archived
      };

      const docRef = doc(db, 'privateConversations', conversationId);
      await updateDoc(docRef, conversationData).catch(async () => {
        // If document doesn't exist, create it
        await addDoc(collection(db, 'privateConversations'), conversationData);
      });

      console.log('Private conversation created:', conversationId);
      
      return { 
        success: true, 
        conversationId,
        conversation: conversationData
      };
    } catch (error) {
      console.error('Error starting private conversation:', error);
      return { success: false, error: error.message };
    }
  }

  // Find existing conversation between two users
  async findExistingConversation(otherUserId) {
    try {
      const participantIds = [this.currentUserId, otherUserId].sort();
      const conversationId = `private_${participantIds[0]}_${participantIds[1]}`;
      
      const docRef = doc(db, 'privateConversations', conversationId);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        const data = docSnap.data();
        return {
          id: docSnap.id,
          ...data,
          createdAt: data.createdAt?.toDate(),
          updatedAt: data.updatedAt?.toDate(),
          lastActivity: data.lastActivity?.toDate(),
        };
      }
      
      return null;
    } catch (error) {
      console.error('Error finding existing conversation:', error);
      return null;
    }
  }

  // Send private message
  async sendPrivateMessage(conversationId, messageText, messageType = 'text', additionalData = {}) {
    try {
      if (!this.currentUserId) {
        throw new Error('User not authenticated');
      }

      const messageData = {
        conversationId,
        text: messageText,
        senderId: this.currentUserId,
        senderName: this.currentUserName,
        senderType: this.currentUserType,
        type: messageType, // text, voice, file, image
        timestamp: serverTimestamp(),
        isRead: false,
        isEncrypted: true,
        isConfidential: true,
        
        // Additional data for different message types
        ...additionalData,
        
        // Privacy metadata
        canForward: false,
        canCopy: messageType === 'text',
        autoDeleteAfter: null, // null = never, number = hours
        requiresResponse: additionalData.requiresResponse || false,
        priority: additionalData.priority || 'normal', // low, normal, high, urgent
      };

      const docRef = await addDoc(collection(db, 'privateMessages'), messageData);
      
      // Update conversation with last message
      await this.updateConversationLastMessage(conversationId, {
        id: docRef.id,
        text: messageText,
        senderId: this.currentUserId,
        timestamp: serverTimestamp(),
        type: messageType
      });

      console.log('Private message sent:', docRef.id);
      
      return { 
        success: true, 
        messageId: docRef.id,
        message: { ...messageData, id: docRef.id }
      };
    } catch (error) {
      console.error('Error sending private message:', error);
      return { success: false, error: error.message };
    }
  }

  // Update conversation with last message
  async updateConversationLastMessage(conversationId, lastMessage) {
    try {
      const conversationRef = doc(db, 'privateConversations', conversationId);
      await updateDoc(conversationRef, {
        lastMessage,
        lastActivity: serverTimestamp(),
        updatedAt: serverTimestamp(),
        [`participants.${this.currentUserId}.lastSeen`]: serverTimestamp(),
      });
    } catch (error) {
      console.error('Error updating conversation last message:', error);
    }
  }

  // Get private messages for a conversation
  async getPrivateMessages(conversationId, limitCount = 50) {
    try {
      const q = query(
        collection(db, 'privateMessages'),
        where('conversationId', '==', conversationId),
        orderBy('timestamp', 'desc'),
        limit(limitCount)
      );

      const snapshot = await getDocs(q);
      const messages = [];
      
      snapshot.forEach(doc => {
        const data = doc.data();
        messages.push({
          id: doc.id,
          ...data,
          timestamp: data.timestamp?.toDate(),
        });
      });

      // Reverse to show oldest first
      return { success: true, messages: messages.reverse() };
    } catch (error) {
      console.error('Error getting private messages:', error);
      return { success: false, error: error.message };
    }
  }

  // Listen to private messages
  listenToPrivateMessages(conversationId, callback) {
    try {
      const q = query(
        collection(db, 'privateMessages'),
        where('conversationId', '==', conversationId),
        orderBy('timestamp', 'asc')
      );
      
      const unsubscribe = onSnapshot(q, (snapshot) => {
        const messages = [];
        snapshot.forEach(doc => {
          const data = doc.data();
          messages.push({
            id: doc.id,
            ...data,
            timestamp: data.timestamp?.toDate(),
          });
        });
        callback(messages);
      });

      this.messageListeners.set(conversationId, unsubscribe);
      return unsubscribe;
    } catch (error) {
      console.error('Error listening to private messages:', error);
      return null;
    }
  }

  // Get user's private conversations
  async getUserConversations() {
    try {
      if (!this.currentUserId) {
        throw new Error('User not authenticated');
      }

      const q = query(
        collection(db, 'privateConversations'),
        where('participantIds', 'array-contains', this.currentUserId),
        where('isActive', '==', true),
        orderBy('lastActivity', 'desc')
      );

      const snapshot = await getDocs(q);
      const conversations = [];
      
      snapshot.forEach(doc => {
        const data = doc.data();
        
        // Get other participant info
        const otherParticipantId = data.participantIds.find(id => id !== this.currentUserId);
        const otherParticipant = data.participants[otherParticipantId];
        
        conversations.push({
          id: doc.id,
          ...data,
          otherParticipant,
          createdAt: data.createdAt?.toDate(),
          updatedAt: data.updatedAt?.toDate(),
          lastActivity: data.lastActivity?.toDate(),
        });
      });

      return { success: true, conversations };
    } catch (error) {
      console.error('Error getting user conversations:', error);
      return { success: false, error: error.message };
    }
  }

  // Listen to user's conversations
  listenToUserConversations(callback) {
    try {
      if (!this.currentUserId) {
        throw new Error('User not authenticated');
      }

      const q = query(
        collection(db, 'privateConversations'),
        where('participantIds', 'array-contains', this.currentUserId),
        where('isActive', '==', true),
        orderBy('lastActivity', 'desc')
      );
      
      const unsubscribe = onSnapshot(q, (snapshot) => {
        const conversations = [];
        snapshot.forEach(doc => {
          const data = doc.data();
          
          // Get other participant info
          const otherParticipantId = data.participantIds.find(id => id !== this.currentUserId);
          const otherParticipant = data.participants[otherParticipantId];
          
          conversations.push({
            id: doc.id,
            ...data,
            otherParticipant,
            createdAt: data.createdAt?.toDate(),
            updatedAt: data.updatedAt?.toDate(),
            lastActivity: data.lastActivity?.toDate(),
          });
        });
        callback(conversations);
      });

      this.conversationListeners.set('userConversations', unsubscribe);
      return unsubscribe;
    } catch (error) {
      console.error('Error listening to user conversations:', error);
      return null;
    }
  }

  // Mark messages as read
  async markMessagesAsRead(conversationId) {
    try {
      if (!this.currentUserId) {
        throw new Error('User not authenticated');
      }

      // Update conversation to mark user as having no unread messages
      const conversationRef = doc(db, 'privateConversations', conversationId);
      await updateDoc(conversationRef, {
        [`participants.${this.currentUserId}.hasUnread`]: false,
        [`participants.${this.currentUserId}.lastSeen`]: serverTimestamp(),
      });

      return { success: true };
    } catch (error) {
      console.error('Error marking messages as read:', error);
      return { success: false, error: error.message };
    }
  }

  // Close conversation
  async closeConversation(conversationId, reason = '') {
    try {
      if (!this.currentUserId) {
        throw new Error('User not authenticated');
      }

      const conversationRef = doc(db, 'privateConversations', conversationId);
      await updateDoc(conversationRef, {
        status: 'closed',
        closedBy: this.currentUserId,
        closedAt: serverTimestamp(),
        closureReason: reason,
        updatedAt: serverTimestamp(),
      });

      return { success: true };
    } catch (error) {
      console.error('Error closing conversation:', error);
      return { success: false, error: error.message };
    }
  }

  // Search lecturers for private messaging
  async searchLecturers(searchQuery = '', courseCode = '') {
    try {
      let q = query(
        collection(db, 'users'),
        where('userType', '==', 'lecturer')
      );

      if (courseCode) {
        // If we have course code, get lecturers teaching that course
        // This would need to be implemented based on your course-lecturer relationship
      }

      const snapshot = await getDocs(q);
      const lecturers = [];
      
      snapshot.forEach(doc => {
        const data = doc.data();
        
        // Filter by search query if provided
        if (searchQuery) {
          const searchLower = searchQuery.toLowerCase();
          const nameMatch = (data.fullName || data.name || '').toLowerCase().includes(searchLower);
          const emailMatch = (data.email || '').toLowerCase().includes(searchLower);
          const departmentMatch = (data.department || '').toLowerCase().includes(searchLower);
          
          if (!nameMatch && !emailMatch && !departmentMatch) {
            return;
          }
        }
        
        lecturers.push({
          id: doc.id,
          ...data,
        });
      });

      return { success: true, lecturers };
    } catch (error) {
      console.error('Error searching lecturers:', error);
      return { success: false, error: error.message };
    }
  }

  // Get conversation analytics (for lecturers)
  async getConversationAnalytics() {
    try {
      if (!this.currentUserId || this.currentUserType !== 'lecturer') {
        throw new Error('Unauthorized access');
      }

      const q = query(
        collection(db, 'privateConversations'),
        where('participantIds', 'array-contains', this.currentUserId),
        where('isActive', '==', true)
      );

      const snapshot = await getDocs(q);
      
      const analytics = {
        totalConversations: snapshot.size,
        activeConversations: 0,
        pendingResponse: 0,
        resolvedToday: 0,
        commonTopics: {},
        studentDistribution: {},
      };

      snapshot.forEach(doc => {
        const data = doc.data();
        
        if (data.status === 'active') {
          analytics.activeConversations++;
        }
        
        // Count subject/topic frequency
        if (data.subject) {
          analytics.commonTopics[data.subject] = (analytics.commonTopics[data.subject] || 0) + 1;
        }
        
        // More analytics can be added here
      });

      return { success: true, analytics };
    } catch (error) {
      console.error('Error getting conversation analytics:', error);
      return { success: false, error: error.message };
    }
  }

  // Cleanup listeners
  cleanup() {
    this.conversationListeners.forEach(unsubscribe => {
      if (typeof unsubscribe === 'function') {
        unsubscribe();
      }
    });
    this.conversationListeners.clear();

    this.messageListeners.forEach(unsubscribe => {
      if (typeof unsubscribe === 'function') {
        unsubscribe();
      }
    });
    this.messageListeners.clear();
  }
}

// Global instance
const privateMessagingService = new PrivateMessagingService();

export default privateMessagingService;
