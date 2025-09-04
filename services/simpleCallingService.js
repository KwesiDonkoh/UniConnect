// Simple calling service without complex dependencies
import { 
  collection, 
  addDoc, 
  doc, 
  updateDoc, 
  onSnapshot, 
  query, 
  where, 
  orderBy, 
  serverTimestamp,
  getDocs 
} from 'firebase/firestore';
import { db } from '../config/firebaseConfig';
import { Alert } from 'react-native';

class SimpleCallingService {
  constructor() {
    this.currentCall = null;
    this.callListeners = new Map();
    this.incomingCallListener = null;
    this.onIncomingCall = null;
    this.onCallStatusChange = null;
  }

  // Initialize calling service
  async initialize(userId) {
    this.userId = userId;
    console.log('Simple calling service initialized for user:', userId);
  }

  // Start a voice call (simplified)
  async startVoiceCall(receiverId, receiverName, receiverAvatar) {
    try {
      console.log('Starting voice call to:', receiverName);
      
      // Create call document in Firestore
      const callData = {
        callerId: this.userId,
        receiverId: receiverId,
        receiverName: receiverName,
        receiverAvatar: receiverAvatar,
        type: 'voice',
        status: 'ringing',
        startedAt: serverTimestamp(),
        endedAt: null,
        duration: 0,
      };

      const callRef = await addDoc(collection(db, 'calls'), callData);
      this.currentCall = { id: callRef.id, ...callData };

      // Simulate call connection after 3 seconds
      setTimeout(() => {
        this.simulateCallConnection(callRef.id);
      }, 3000);

      return {
        success: true,
        callId: callRef.id,
        call: this.currentCall
      };

    } catch (error) {
      console.error('Error starting voice call:', error);
      return {
        success: false,
        error: error.message || 'Failed to start voice call'
      };
    }
  }

  // Start a video call (simplified)
  async startVideoCall(receiverId, receiverName, receiverAvatar) {
    try {
      console.log('Starting video call to:', receiverName);
      
      // Create call document in Firestore
      const callData = {
        callerId: this.userId,
        receiverId: receiverId,
        receiverName: receiverName,
        receiverAvatar: receiverAvatar,
        type: 'video',
        status: 'ringing',
        startedAt: serverTimestamp(),
        endedAt: null,
        duration: 0,
      };

      const callRef = await addDoc(collection(db, 'calls'), callData);
      this.currentCall = { id: callRef.id, ...callData };

      // Simulate call connection after 3 seconds
      setTimeout(() => {
        this.simulateCallConnection(callRef.id);
      }, 3000);

      return {
        success: true,
        callId: callRef.id,
        call: this.currentCall
      };

    } catch (error) {
      console.error('Error starting video call:', error);
      return {
        success: false,
        error: error.message || 'Failed to start video call'
      };
    }
  }

  // Simulate call connection
  async simulateCallConnection(callId) {
    try {
      const callRef = doc(db, 'calls', callId);
      await updateDoc(callRef, {
        status: 'connected',
        connectedAt: serverTimestamp(),
      });

      if (this.onCallStatusChange) {
        this.onCallStatusChange({ 
          ...this.currentCall, 
          status: 'connected' 
        });
      }

      console.log('Call connected (simulated)');
    } catch (error) {
      console.error('Error simulating call connection:', error);
    }
  }

  // End current call
  async endCall(callId) {
    try {
      const callRef = doc(db, 'calls', callId);
      await updateDoc(callRef, {
        status: 'ended',
        endedAt: serverTimestamp(),
      });

      // Clean up current call
      this.currentCall = null;

      // Remove call listener
      if (this.callListeners.has(callId)) {
        this.callListeners.get(callId)();
        this.callListeners.delete(callId);
      }

      if (this.onCallStatusChange) {
        this.onCallStatusChange({ 
          id: callId, 
          status: 'ended' 
        });
      }

      return { success: true };
    } catch (error) {
      console.error('Error ending call:', error);
      return { success: false, error: error.message };
    }
  }

  // Accept incoming call (simplified)
  async acceptCall(callId) {
    try {
      const callRef = doc(db, 'calls', callId);
      await updateDoc(callRef, {
        status: 'connected',
        connectedAt: serverTimestamp(),
      });

      return { success: true };
    } catch (error) {
      console.error('Error accepting call:', error);
      return { success: false, error: error.message };
    }
  }

  // Reject incoming call
  async rejectCall(callId) {
    try {
      const callRef = doc(db, 'calls', callId);
      await updateDoc(callRef, {
        status: 'rejected',
        endedAt: serverTimestamp(),
      });

      return { success: true };
    } catch (error) {
      console.error('Error rejecting call:', error);
      return { success: false, error: error.message };
    }
  }

  // Get call history
  async getCallHistory(userId) {
    try {
      const callsRef = collection(db, 'calls');
      const q = query(
        callsRef,
        where('callerId', '==', userId),
        orderBy('startedAt', 'desc')
      );

      const q2 = query(
        callsRef,
        where('receiverId', '==', userId),
        orderBy('startedAt', 'desc')
      );

      const [callerSnapshot, receiverSnapshot] = await Promise.all([
        getDocs(q),
        getDocs(q2)
      ]);

      const calls = [];

      callerSnapshot.forEach((doc) => {
        calls.push({
          id: doc.id,
          ...doc.data(),
          startedAt: doc.data().startedAt?.toDate() || new Date(),
          endedAt: doc.data().endedAt?.toDate() || null,
          direction: 'outgoing'
        });
      });

      receiverSnapshot.forEach((doc) => {
        calls.push({
          id: doc.id,
          ...doc.data(),
          startedAt: doc.data().startedAt?.toDate() || new Date(),
          endedAt: doc.data().endedAt?.toDate() || null,
          direction: 'incoming'
        });
      });

      // Sort by date
      calls.sort((a, b) => new Date(b.startedAt) - new Date(a.startedAt));

      return {
        success: true,
        calls: calls
      };

    } catch (error) {
      console.error('Error getting call history:', error);
      return {
        success: false,
        error: error.message,
        calls: []
      };
    }
  }

  // Simulate mute toggle
  async toggleMute() {
    console.log('Mute toggled (simulated)');
    return { success: true, muted: !this.isMuted };
  }

  // Simulate speaker toggle
  async toggleSpeaker() {
    console.log('Speaker toggled (simulated)');
    return { success: true, speakerOn: !this.isSpeakerOn };
  }

  // Set callback for incoming calls
  setOnIncomingCall(callback) {
    this.onIncomingCall = callback;
  }

  // Set callback for call status changes
  setOnCallStatusChange(callback) {
    this.onCallStatusChange = callback;
  }

  // Clean up
  destroy() {
    // Remove all call listeners
    this.callListeners.forEach((unsubscribe) => {
      unsubscribe();
    });
    this.callListeners.clear();

    this.currentCall = null;
    console.log('Simple calling service destroyed');
  }
}

export default new SimpleCallingService();
