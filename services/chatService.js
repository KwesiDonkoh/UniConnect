import { 
  collection, 
  addDoc, 
  query, 
  orderBy, 
  onSnapshot, 
  serverTimestamp, 
  doc, 
  updateDoc, 
  setDoc, 
  deleteDoc,
  where,
  limit,
  getDocs,
  writeBatch,
  arrayUnion,
  arrayRemove,
  getDoc
} from 'firebase/firestore';
import { auth, db } from '../config/firebaseConfig';
import { AppState } from 'react-native';

class ChatService {
  constructor() {
    this.messageListeners = new Map();
    this.typingListeners = new Map();
    this.onlineStatusListeners = new Map();
    this.currentUserId = null;
    this.userProfile = null;
    this.heartbeatInterval = null;
    this.appStateSubscription = null;
    
    // Listen to auth state changes
    auth.onAuthStateChanged((user) => {
      if (user) {
        this.currentUserId = user.uid;
        this.initializeUserPresence();
      } else {
        // Immediately cleanup on auth state change to null
        this.immediateCleanup();
      }
    });
  }

  // Initialize user presence system
  async initializeUserPresence() {
    if (!this.currentUserId) return;

    try {
      // Get user profile data
      const userDoc = await getDoc(doc(db, 'users', this.currentUserId));
      if (userDoc.exists()) {
        this.userProfile = { id: this.currentUserId, ...userDoc.data() };
      }

      // Set user as online
      await this.setUserOnlineStatus(true);

      // Set up periodic heartbeat to maintain online status
      this.heartbeatInterval = setInterval(async () => {
        await this.updateHeartbeat();
      }, 30000); // Update every 30 seconds

      // Handle app state changes for React Native
      this.handleAppStateChange = (nextAppState) => {
        if (nextAppState === 'background' || nextAppState === 'inactive') {
          // App is going to background
          this.setUserOnlineStatus(false);
        } else if (nextAppState === 'active') {
          // App is coming to foreground
          this.setUserOnlineStatus(true);
        }
      };

      // Add app state listener
      this.appStateSubscription = AppState.addEventListener('change', this.handleAppStateChange);

    } catch (error) {
      console.error('Error initializing user presence:', error);
    }
  }

  // Set user online/offline status
  async setUserOnlineStatus(isOnline) {
    if (!this.currentUserId) return;

    try {
      const userPresenceRef = doc(db, 'userPresence', this.currentUserId);
      const presenceData = {
        userId: this.currentUserId,
        isOnline,
        lastSeen: serverTimestamp(),
      };

      // Only add profile data if it exists and is not undefined
      if (this.userProfile) {
        if (this.userProfile.fullName || this.userProfile.name) {
          presenceData.name = this.userProfile.fullName || this.userProfile.name;
        }
        if (this.userProfile.userType) {
          presenceData.userType = this.userProfile.userType;
        }
        if (this.userProfile.academicLevel) {
          presenceData.academicLevel = this.userProfile.academicLevel;
        }
        if (this.userProfile.avatar) {
          presenceData.avatar = this.userProfile.avatar;
        }
      }

      await setDoc(userPresenceRef, presenceData, { merge: true });
    } catch (error) {
      console.error('Error setting user online status:', error);
    }
  }

  // Update user heartbeat
  async updateHeartbeat() {
    if (!this.currentUserId) return;

    try {
      const userPresenceRef = doc(db, 'userPresence', this.currentUserId);
      await updateDoc(userPresenceRef, {
        lastSeen: serverTimestamp()
      });
    } catch (error) {
      console.error('Error updating heartbeat:', error);
    }
  }

  // Send a message to a course chat with enhanced error handling
  async sendMessage(courseCode, messageText, senderId, senderName, senderType, replyToId = null, messageType = 'text', additionalData = {}) {
    // Validate inputs
    if (!courseCode) {
      return { success: false, error: 'Course code is required' };
    }

    if (!messageText && messageType === 'text') {
      return { success: false, error: 'Message text is required' };
    }

    // Ensure user is authenticated
    if (!this.currentUserId) {
      try {
        // Try to get current user
        const currentUser = auth.currentUser;
        if (currentUser) {
          this.currentUserId = currentUser.uid;
          await this.initializeUserPresence();
        } else {
          return { success: false, error: 'User not authenticated. Please log in again.' };
        }
      } catch (error) {
        return { success: false, error: 'Authentication error. Please log in again.' };
      }
    }

    // Ensure user profile is loaded
    if (!this.userProfile) {
      try {
        const userDoc = await getDoc(doc(db, 'users', this.currentUserId));
        if (userDoc.exists()) {
          this.userProfile = { id: this.currentUserId, ...userDoc.data() };
        } else {
          return { success: false, error: 'User profile not found. Please update your profile.' };
        }
      } catch (error) {
        console.error('Error loading user profile:', error);
        return { success: false, error: 'Failed to load user profile' };
      }
    }

    try {
      const messagesRef = collection(db, 'chatMessages', courseCode, 'messages');
      
      const messageData = {
        text: messageText || '',
        type: messageType,
        senderId: senderId || this.currentUserId,
        senderName: senderName || this.userProfile.fullName || this.userProfile.name || 'Unknown User',
        senderAvatar: this.userProfile.avatar || null,
        senderType: senderType || this.userProfile.userType || 'student',
        academicLevel: this.userProfile.academicLevel || null,
        courseCode,
        timestamp: serverTimestamp(),
        status: 'sent',
        readBy: [this.currentUserId],
        reactions: {},
        editedAt: null,
        isEdited: false,
        deletedBy: [],
        deletedForEveryone: false,
        replyTo: replyToId ? { id: replyToId } : null,
        ...additionalData // Include voice URI, file URLs, etc.
      };

      const docRef = await addDoc(messagesRef, messageData);
      
      // Update course's last message info (don't fail if this fails)
      try {
        await this.updateCourseLastMessage(courseCode, messageData);
      } catch (updateError) {
        console.warn('Failed to update course last message:', updateError);
      }
      
      // Clear typing indicator (don't fail if this fails)
      try {
        await this.setTypingStatus(courseCode, false);
      } catch (typingError) {
        console.warn('Failed to clear typing status:', typingError);
      }

      return { success: true, messageId: docRef.id, message: { id: docRef.id, ...messageData } };
    } catch (error) {
      console.error('Error sending message:', error);
      
      // Provide more specific error messages
      let errorMessage = 'Failed to send message';
      if (error.code === 'permission-denied') {
        errorMessage = 'Permission denied. Please check your access to this course.';
      } else if (error.code === 'unavailable') {
        errorMessage = 'Service temporarily unavailable. Please try again.';
      } else if (error.message?.includes('network')) {
        errorMessage = 'Network error. Please check your internet connection.';
      } else {
        errorMessage = error.message || 'Failed to send message';
      }
      
      return { success: false, error: errorMessage, code: error.code };
    }
  }

  // Edit message (WhatsApp/Telegram style)
  async editMessage(courseCode, messageId, newText) {
    if (!this.currentUserId || !this.userProfile) {
      throw new Error('User not authenticated');
    }

    try {
      const messageRef = doc(db, 'chatMessages', courseCode, 'messages', messageId);
      const messageDoc = await getDoc(messageRef);
      
      if (!messageDoc.exists()) {
        return { success: false, error: 'Message not found' };
      }

      const messageData = messageDoc.data();
      
      // Check if user is the sender
      if (messageData.senderId !== this.currentUserId) {
        return { success: false, error: 'You can only edit your own messages' };
      }

      // Check if message is not too old (48 hours limit like WhatsApp)
      const messageTime = messageData.timestamp?.toDate?.() || new Date(0);
      const now = new Date();
      const hoursDiff = (now - messageTime) / (1000 * 60 * 60);
      
      if (hoursDiff > 48) {
        return { success: false, error: 'Message is too old to edit (48 hour limit)' };
      }

      // Check if message was already deleted
      if (messageData.deletedForEveryone) {
        return { success: false, error: 'Cannot edit a deleted message' };
      }

      await updateDoc(messageRef, {
        text: newText,
        editedAt: serverTimestamp(),
        isEdited: true
      });
      
      return { success: true };
    } catch (error) {
      console.error('Error editing message:', error);
      return { success: false, error: error.message };
    }
  }

  // Delete message (WhatsApp/Telegram style)
  async deleteMessage(courseCode, messageId, deleteForEveryone = false) {
    if (!this.currentUserId || !this.userProfile) {
      throw new Error('User not authenticated');
    }

    try {
      const messageRef = doc(db, 'chatMessages', courseCode, 'messages', messageId);
      const messageDoc = await getDoc(messageRef);
      
      if (!messageDoc.exists()) {
        return { success: false, error: 'Message not found' };
      }

      const messageData = messageDoc.data();
      
      // Check if user is the sender
      if (messageData.senderId !== this.currentUserId) {
        return { success: false, error: 'You can only delete your own messages' };
      }

      if (deleteForEveryone) {
        // Delete for everyone (7 minutes limit like WhatsApp)
        const messageTime = messageData.timestamp?.toDate?.() || new Date(0);
        const now = new Date();
        const minutesDiff = (now - messageTime) / (1000 * 60);
        
        if (minutesDiff > 7) {
          return { success: false, error: 'Cannot delete for everyone after 7 minutes' };
        }

        await updateDoc(messageRef, {
          text: 'This message was deleted',
          deletedForEveryone: true,
          deletedAt: serverTimestamp(),
          type: 'deleted'
        });
      } else {
        // Delete for self only
        const deletedBy = messageData.deletedBy || [];
        if (!deletedBy.includes(this.currentUserId)) {
          deletedBy.push(this.currentUserId);
        }
        
        await updateDoc(messageRef, {
          deletedBy: deletedBy
        });
      }
      
      return { success: true };
    } catch (error) {
      console.error('Error deleting message:', error);
      return { success: false, error: error.message };
    }
  }

  // Update course's last message information
  async updateCourseLastMessage(courseCode, messageData) {
    try {
      const courseRef = doc(db, 'chatMessages', courseCode);
      await setDoc(courseRef, {
        lastMessage: {
          text: messageData.text,
          timestamp: messageData.timestamp,
          senderId: messageData.senderId,
          senderName: messageData.senderName
        },
        lastActivity: serverTimestamp()
      }, { merge: true });
    } catch (error) {
      console.error('Error updating course last message:', error);
    }
  }

  // Listen to messages for a specific course
  listenToMessages(courseCode, callback) {
    if (this.messageListeners.has(courseCode)) {
      this.messageListeners.get(courseCode)(); // Unsubscribe previous listener
    }

    const messagesRef = collection(db, 'chatMessages', courseCode, 'messages');
    const q = query(messagesRef, orderBy('timestamp', 'asc'));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const messages = [];
      snapshot.forEach((doc) => {
        const data = doc.data();
        messages.push({
          id: doc.id,
          ...data,
          timestamp: data.timestamp?.toDate?.() || new Date()
        });
      });
      
      callback(messages);
      
      // Mark messages as read
      this.markMessagesAsRead(courseCode, messages);
    }, (error) => {
      console.error('Error listening to messages:', error);
      callback([]);
    });

    this.messageListeners.set(courseCode, unsubscribe);
    return unsubscribe;
  }

  // Mark messages as read
  async markMessagesAsRead(courseCode, messages) {
    if (!this.currentUserId || !messages || !Array.isArray(messages)) return;

    try {
      const batch = writeBatch(db);
      let hasUpdates = false;
      
      messages.forEach((message) => {
        if (message && message.senderId !== this.currentUserId) {
          const readBy = message.readBy || [];
          if (!readBy.includes(this.currentUserId)) {
            const messageRef = doc(db, 'chatMessages', courseCode, 'messages', message.id);
            batch.update(messageRef, {
              readBy: arrayUnion(this.currentUserId)
            });
            hasUpdates = true;
          }
        }
      });

      if (hasUpdates) {
        await batch.commit();
      }
    } catch (error) {
      console.error('Error marking messages as read:', error);
    }
  }

  // Set typing status
  async setTypingStatus(courseCode, isTyping) {
    if (!this.currentUserId || !this.userProfile) return;

    try {
      const typingRef = doc(db, 'typingIndicators', courseCode, 'users', this.currentUserId);
      
      if (isTyping) {
        await setDoc(typingRef, {
          userId: this.currentUserId,
          userName: this.userProfile.fullName || this.userProfile.name,
          userType: this.userProfile.userType,
          timestamp: serverTimestamp()
        });
      } else {
        await deleteDoc(typingRef);
      }
    } catch (error) {
      console.error('Error setting typing status:', error);
    }
  }

  // Listen to typing indicators
  listenToTypingIndicators(courseCode, callback) {
    if (this.typingListeners.has(courseCode)) {
      this.typingListeners.get(courseCode)();
    }

    const typingRef = collection(db, 'typingIndicators', courseCode, 'users');
    const q = query(typingRef, where('userId', '!=', this.currentUserId || ''));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const typingUsers = [];
      snapshot.forEach((doc) => {
        const data = doc.data();
        // Only include users who were typing in the last 5 seconds
        const now = new Date();
        const typingTime = data.timestamp?.toDate?.() || new Date(0);
        if (now - typingTime < 5000) {
          typingUsers.push({
            id: data.userId,
            name: data.userName,
            userType: data.userType
          });
        }
      });
      
      callback(typingUsers);
    }, (error) => {
      console.error('Error listening to typing indicators:', error);
      callback([]);
    });

    this.typingListeners.set(courseCode, unsubscribe);
    return unsubscribe;
  }

  // Get online users for a course
  async getOnlineUsersForCourse(courseCode, userType = null, academicLevel = null) {
    try {
      const presenceRef = collection(db, 'userPresence');
      let q = query(presenceRef, where('isOnline', '==', true));

      if (userType) {
        q = query(q, where('userType', '==', userType));
      }
      
      if (academicLevel) {
        q = query(q, where('academicLevel', '==', academicLevel));
      }

      const snapshot = await getDocs(q);
      const onlineUsers = [];
      
      snapshot.forEach((doc) => {
        const data = doc.data();
        // Filter based on last seen (consider online if last seen within 2 minutes)
        const lastSeen = data.lastSeen?.toDate?.() || new Date(0);
        const now = new Date();
        if (now - lastSeen < 120000) { // 2 minutes
          onlineUsers.push({
            id: doc.id,
            ...data,
            lastSeen
          });
        }
      });

      return onlineUsers;
    } catch (error) {
      console.error('Error getting online users:', error);
      return [];
    }
  }

  // Listen to online status for a course
  listenToOnlineStatus(courseCode, userType, academicLevel, callback) {
    const key = `${courseCode}-${userType}-${academicLevel}`;
    
    if (this.onlineStatusListeners.has(key)) {
      this.onlineStatusListeners.get(key)();
    }

    const presenceRef = collection(db, 'userPresence');
    let q = query(presenceRef, where('isOnline', '==', true));

    if (userType) {
      q = query(q, where('userType', '==', userType));
    }
    
    if (academicLevel) {
      q = query(q, where('academicLevel', '==', academicLevel));
    }

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const onlineUsers = [];
      
      snapshot.forEach((doc) => {
        const data = doc.data();
        const lastSeen = data.lastSeen?.toDate?.() || new Date(0);
        const now = new Date();
        
        if (now - lastSeen < 120000) { // Consider online if last seen within 2 minutes
          onlineUsers.push({
            id: doc.id,
            ...data,
            lastSeen
          });
        }
      });

      callback(onlineUsers.length);
    }, (error) => {
      console.error('Error listening to online status:', error);
      callback(0);
    });

    this.onlineStatusListeners.set(key, unsubscribe);
    return unsubscribe;
  }

  // Add reaction to message
  async addReaction(courseCode, messageId, emoji) {
    if (!this.currentUserId) return;

    try {
      const messageRef = doc(db, 'chatMessages', courseCode, 'messages', messageId);
      const reactionKey = `reactions.${emoji}`;
      
      await updateDoc(messageRef, {
        [reactionKey]: arrayUnion(this.currentUserId)
      });

      return { success: true };
    } catch (error) {
      console.error('Error adding reaction:', error);
      return { success: false, error: error.message };
    }
  }

  // Remove reaction from message
  async removeReaction(courseCode, messageId, emoji) {
    if (!this.currentUserId) return;

    try {
      const messageRef = doc(db, 'chatMessages', courseCode, 'messages', messageId);
      const reactionKey = `reactions.${emoji}`;
      
      await updateDoc(messageRef, {
        [reactionKey]: arrayRemove(this.currentUserId)
      });

      return { success: true };
    } catch (error) {
      console.error('Error removing reaction:', error);
      return { success: false, error: error.message };
    }
  }

  // Get unread message count for a course
  async getUnreadCount(courseCode) {
    if (!this.currentUserId || !courseCode) return 0;

    try {
      const messagesRef = collection(db, 'chatMessages', courseCode, 'messages');
      // Get all messages and filter client-side to avoid Firestore query limitations
      const snapshot = await getDocs(messagesRef);
      
      let unreadCount = 0;
      snapshot.forEach((doc) => {
        const message = doc.data();
        if (message && message.senderId && message.senderId !== this.currentUserId) {
          const readBy = message.readBy || [];
          if (!readBy.includes(this.currentUserId)) {
            unreadCount++;
          }
        }
      });

      return unreadCount;
    } catch (error) {
      console.error('Error getting unread count:', error);
      return 0;
    }
  }

  // Get messages for a specific course
  async getMessages(courseCode, limitCount = 50) {
    try {
      const messagesRef = collection(db, 'chatMessages', courseCode, 'messages');
      const q = query(messagesRef, orderBy('timestamp', 'desc'), limit(limitCount));
      
      const snapshot = await getDocs(q);
      const messages = [];
      
      snapshot.forEach((doc) => {
        messages.push({
          id: doc.id,
          ...doc.data()
        });
      });
      
      return messages.reverse(); // Return in chronological order
    } catch (error) {
      console.error('Error getting messages:', error);
      return [];
    }
  }

  // Get recent messages for chat list preview
  async getRecentMessages(courses) {
    const recentMessages = {};

    if (!courses || !Array.isArray(courses)) {
      return recentMessages;
    }

    try {
      for (const course of courses) {
        if (!course || !course.code) continue;
        
        const messagesRef = collection(db, 'chatMessages', course.code, 'messages');
        const q = query(messagesRef, orderBy('timestamp', 'desc'), limit(1));
        
        const snapshot = await getDocs(q);
        if (!snapshot.empty) {
          const lastMessage = snapshot.docs[0].data();
          if (lastMessage) {
            recentMessages[course.code] = {
              ...lastMessage,
              timestamp: lastMessage.timestamp?.toDate?.() || new Date()
            };
          }
        }
      }

      return recentMessages;
    } catch (error) {
      console.error('Error getting recent messages:', error);
      return {};
    }
  }

  // Immediate cleanup for logout (synchronous)
  immediateCleanup() {
    // Clear user data immediately
    this.currentUserId = null;
    this.userProfile = null;
    
    // Clean up message listeners
    try {
      this.messageListeners.forEach((unsubscribe) => {
        if (typeof unsubscribe === 'function') {
          unsubscribe();
        }
      });
      this.messageListeners.clear();
    } catch (error) {
      console.warn('Error cleaning up message listeners:', error);
    }

    // Clean up typing listeners
    try {
      this.typingListeners.forEach((unsubscribe) => {
        if (typeof unsubscribe === 'function') {
          unsubscribe();
        }
      });
      this.typingListeners.clear();
    } catch (error) {
      console.warn('Error cleaning up typing listeners:', error);
    }

    // Clean up online status listeners
    try {
      this.onlineStatusListeners.forEach((unsubscribe) => {
        if (typeof unsubscribe === 'function') {
          unsubscribe();
        }
      });
      this.onlineStatusListeners.clear();
    } catch (error) {
      console.warn('Error cleaning up online status listeners:', error);
    }

    // Clear heartbeat interval
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
      this.heartbeatInterval = null;
    }

    // Remove app state listener
    if (this.appStateSubscription) {
      try {
        this.appStateSubscription.remove();
      } catch (error) {
        console.warn('Error removing app state subscription:', error);
      }
      this.appStateSubscription = null;
    }
  }

  // Edit message
  async editMessage(courseCode, messageId, newText) {
    try {
      const { updateDoc, doc } = await import('firebase/firestore');
      const messageRef = doc(this.db, 'chatMessages', courseCode, 'messages', messageId);
      
      await updateDoc(messageRef, {
        text: newText.trim(),
        edited: true,
        editedAt: new Date()
      });

      return { success: true };
    } catch (error) {
      console.error('Error editing message:', error);
      return { success: false, error: error.message };
    }
  }

  // Delete message
  async deleteMessage(courseCode, messageId) {
    try {
      const { deleteDoc, doc } = await import('firebase/firestore');
      const messageRef = doc(this.db, 'chatMessages', courseCode, 'messages', messageId);
      
      await deleteDoc(messageRef);

      return { success: true };
    } catch (error) {
      console.error('Error deleting message:', error);
      return { success: false, error: error.message };
    }
  }

  // Get sorted chat list by recent messages
  async getSortedChatList(courses) {
    if (!courses || !Array.isArray(courses)) {
      return [];
    }

    const sortedCourses = [...courses];
    
    try {
      const recentMessages = {};
      
      // Get recent message for each course
      for (const course of courses) {
        if (!course || !course.code) continue;
        
        const messagesRef = collection(db, 'chatMessages', course.code, 'messages');
        const q = query(messagesRef, orderBy('timestamp', 'desc'), limit(1));
        
        const snapshot = await getDocs(q);
        if (!snapshot.empty) {
          const lastMessage = snapshot.docs[0].data();
          if (lastMessage) {
            recentMessages[course.code] = {
              ...lastMessage,
              timestamp: lastMessage.timestamp?.toDate?.() || new Date()
            };
          }
        }
      }
      
      // Sort courses by most recent message timestamp
      sortedCourses.sort((a, b) => {
        const aTime = recentMessages[a.code]?.timestamp || new Date(0);
        const bTime = recentMessages[b.code]?.timestamp || new Date(0);
        return bTime - aTime;
      });
      
      return sortedCourses;
    } catch (error) {
      console.error('Error sorting chat list:', error);
      return sortedCourses;
    }
  }

  // Cleanup all listeners (keeps async offline status update)
  cleanup() {
    // Set user offline first if we have a current user
    const currentUserId = this.currentUserId;
    
    // Do immediate cleanup
    this.immediateCleanup();
    
    // Set user offline asynchronously (best effort)
    if (currentUserId) {
      setTimeout(async () => {
        try {
          const userPresenceRef = doc(db, 'userPresence', currentUserId);
          await setDoc(userPresenceRef, {
            userId: currentUserId,
            isOnline: false,
            lastSeen: serverTimestamp(),
          }, { merge: true });
        } catch (error) {
          // Ignore errors during cleanup
          console.warn('Error setting user offline during cleanup:', error);
        }
      }, 0);
    }
  }

  // Get chat statistics
  async getChatStats(courseCode) {
    try {
      const messagesRef = collection(db, 'chatMessages', courseCode, 'messages');
      const snapshot = await getDocs(messagesRef);
      
      let messageCount = 0;
      let participantCount = new Set();
      let lastActivity = null;

      snapshot.forEach((doc) => {
        const data = doc.data();
        messageCount++;
        participantCount.add(data.senderId);
        
        const timestamp = data.timestamp?.toDate?.();
        if (!lastActivity || (timestamp && timestamp > lastActivity)) {
          lastActivity = timestamp;
        }
      });

      return {
        messageCount,
        participantCount: participantCount.size,
        lastActivity
      };
    } catch (error) {
      console.error('Error getting chat stats:', error);
      return {
        messageCount: 0,
        participantCount: 0,
        lastActivity: null
      };
    }
  }

  // Typing Indicators
  async startTyping(courseCode) {
    if (!this.currentUserId || !courseCode) return;
    
    try {
      const typingRef = doc(db, 'typing', `${courseCode}_${this.currentUserId}`);
      await setDoc(typingRef, {
        userId: this.currentUserId,
        courseCode,
        userName: this.userProfile?.name || this.userProfile?.fullName || 'Anonymous',
        userType: this.userProfile?.userType || 'student',
        timestamp: serverTimestamp(),
        isTyping: true
      }, { merge: true });
      
      // Auto-stop typing after 3 seconds
      if (this.typingTimeouts) {
        clearTimeout(this.typingTimeouts);
      }
      
      this.typingTimeouts = setTimeout(() => {
        this.stopTyping(courseCode);
      }, 3000);
    } catch (error) {
      console.error('Error setting typing status:', error);
    }
  }

  async stopTyping(courseCode) {
    if (!this.currentUserId || !courseCode) return;
    
    try {
      const typingRef = doc(db, 'typing', `${courseCode}_${this.currentUserId}`);
      await deleteDoc(typingRef);
      
      if (this.typingTimeouts) {
        clearTimeout(this.typingTimeouts);
        this.typingTimeouts = null;
      }
    } catch (error) {
      console.error('Error removing typing status:', error);
    }
  }

  listenToTypingIndicators(courseCode, callback) {
    if (!courseCode) return null;

    const typingRef = collection(db, 'typing');
    const q = query(typingRef, where('courseCode', '==', courseCode));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const typingUsers = [];
      snapshot.forEach((doc) => {
        const data = doc.data();
        // Don't include current user in typing indicators
        if (data.userId !== this.currentUserId) {
          typingUsers.push({
            id: doc.id,
            ...data,
            timestamp: data.timestamp?.toDate?.() || new Date()
          });
        }
      });

      // Filter out old typing indicators (older than 5 seconds)
      const recentTyping = typingUsers.filter(user => {
        const timeDiff = new Date() - user.timestamp;
        return timeDiff < 5000; // 5 seconds
      });

      callback(recentTyping);
    }, (error) => {
      console.error('Error listening to typing indicators:', error);
      callback([]);
    });

    this.typingListeners.set(courseCode, unsubscribe);
    return unsubscribe;
  }

  // Online Status
  async setOnlineStatus(isOnline = true) {
    if (!this.currentUserId) return;

    try {
      const statusRef = doc(db, 'userStatus', this.currentUserId);
      await setDoc(statusRef, {
        userId: this.currentUserId,
        userName: this.userProfile?.name || this.userProfile?.fullName || 'Anonymous',
        userType: this.userProfile?.userType || 'student',
        isOnline,
        lastSeen: serverTimestamp(),
        timestamp: serverTimestamp()
      }, { merge: true });
    } catch (error) {
      console.error('Error setting online status:', error);
    }
  }

  listenToOnlineUsers(courseCode, callback) {
    if (!courseCode) return null;

    // Get all users who are in this course and check their online status
    const statusRef = collection(db, 'userStatus');
    
    const unsubscribe = onSnapshot(statusRef, (snapshot) => {
      const onlineUsers = [];
      snapshot.forEach((doc) => {
        const data = doc.data();
        if (data.isOnline && data.userId !== this.currentUserId) {
          onlineUsers.push({
            id: doc.id,
            ...data,
            lastSeen: data.lastSeen?.toDate?.() || new Date()
          });
        }
      });

      // Filter users who were online in the last 5 minutes
      const recentlyOnline = onlineUsers.filter(user => {
        const timeDiff = new Date() - user.lastSeen;
        return timeDiff < 300000; // 5 minutes
      });

      callback(recentlyOnline);
    }, (error) => {
      console.error('Error listening to online users:', error);
      callback([]);
    });

    this.onlineStatusListeners.set(courseCode, unsubscribe);
    return unsubscribe;
  }

  // Connection recovery function
  async recoverConnection() {
    try {
      console.log('ChatService: Attempting connection recovery...');
      
      // Re-initialize if user exists
      if (auth.currentUser) {
        this.currentUserId = auth.currentUser.uid;
        await this.initializeUserPresence();
        console.log('ChatService: Connection recovery successful');
        return { success: true };
      } else {
        console.log('ChatService: No authenticated user for recovery');
        return { success: false, error: 'No authenticated user' };
      }
    } catch (error) {
      console.error('ChatService: Connection recovery failed:', error);
      return { success: false, error: error.message };
    }
  }

  // Get connection status
  getConnectionStatus() {
    return {
      isConnected: !!this.currentUserId,
      hasProfile: !!this.userProfile,
      activeListeners: {
        messages: this.messageListeners.size,
        typing: this.typingListeners.size,
        onlineStatus: this.onlineStatusListeners.size
      },
      hasHeartbeat: !!this.heartbeatInterval
    };
  }

  // Force refresh user profile
  async refreshUserProfile() {
    if (!this.currentUserId) return { success: false, error: 'No user ID' };
    
    try {
      const userDoc = await getDoc(doc(db, 'users', this.currentUserId));
      if (userDoc.exists()) {
        this.userProfile = { id: this.currentUserId, ...userDoc.data() };
        return { success: true, profile: this.userProfile };
      } else {
        return { success: false, error: 'User profile not found' };
      }
    } catch (error) {
      console.error('Error refreshing user profile:', error);
      return { success: false, error: error.message };
    }
  }

  // Immediate cleanup for authentication changes
  immediateCleanup() {
    console.log('ChatService: Immediate cleanup triggered');
    
    // Clear all listeners
    this.messageListeners.forEach(unsubscribe => {
      try {
        unsubscribe();
      } catch (error) {
        console.warn('Error unsubscribing message listener:', error);
      }
    });
    this.messageListeners.clear();
    
    this.typingListeners.forEach(unsubscribe => {
      try {
        unsubscribe();
      } catch (error) {
        console.warn('Error unsubscribing typing listener:', error);
      }
    });
    this.typingListeners.clear();
    
    this.onlineStatusListeners.forEach(unsubscribe => {
      try {
        unsubscribe();
      } catch (error) {
        console.warn('Error unsubscribing online status listener:', error);
      }
    });
    this.onlineStatusListeners.clear();
    
    // Clear heartbeat
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
      this.heartbeatInterval = null;
    }
    
    // Remove app state listener
    if (this.appStateSubscription) {
      this.appStateSubscription.remove();
      this.appStateSubscription = null;
    }
    
    // Reset state
    this.currentUserId = null;
    this.userProfile = null;
    
    console.log('ChatService: Immediate cleanup completed');
  }

  cleanup() {
    // Clear all listeners
    this.messageListeners.forEach(unsubscribe => unsubscribe());
    this.typingListeners.forEach(unsubscribe => unsubscribe());
    this.onlineStatusListeners.forEach(unsubscribe => unsubscribe());
    
    this.messageListeners.clear();
    this.typingListeners.clear();
    this.onlineStatusListeners.clear();

    // Clear typing timeout
    if (this.typingTimeouts) {
      clearTimeout(this.typingTimeouts);
      this.typingTimeouts = null;
    }

    // Set offline status
    this.setOnlineStatus(false);
  }
}

// Create and export a singleton instance
const chatService = new ChatService();
export default chatService;
