import AudioCompat from '../utils/audioCompat';
import * as FileSystem from 'expo-file-system';
import { Platform, Alert, Linking } from 'react-native';
import { 
  collection, 
  addDoc, 
  serverTimestamp, 
  doc, 
  updateDoc,
  onSnapshot,
  query,
  where,
  orderBy,
  getDocs
} from 'firebase/firestore';
import { db, auth } from '../config/firebaseConfig';

class CommunicationService {
  constructor() {
    this.currentRecording = null;
    this.isRecording = false;
    this.callListeners = new Map();
    this.activeCall = null;
    this.localStream = null;
    this.remoteStream = null;
    this.currentSound = null;
    this.currentUserId = null;
    
    // Initialize audio session
    this.initializeAudio();
    
    // Audio playback
    this.currentPlayback = null;
    
    // Listen to auth state
    auth.onAuthStateChanged((user) => {
      this.currentUserId = user?.uid || null;
    });
  }

  // Initialize audio session for recording
  async initializeAudio() {
    try {
      await AudioCompat.requestPermissionsAsync();
      await AudioCompat.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
        shouldDuckAndroid: true,
        playThroughEarpieceAndroid: false,
      });
    } catch (error) {
      console.error('Error initializing audio:', error);
    }
  }

  // Voice Recording Functions
  async startVoiceRecording() {
    try {
      if (this.isRecording) {
        console.warn('Recording already in progress');
        return { success: false, error: 'Recording already in progress' };
      }

      // Request permissions
      const { status } = await AudioCompat.requestPermissionsAsync();
      if (status !== 'granted') {
        return { success: false, error: 'Audio permission denied' };
      }

      // Configure recording options
      const recordingOptions = {
        android: {
          extension: '.m4a',
          outputFormat: AudioCompat.RecordingOptionsPresets.HIGH_QUALITY.android.outputFormat,
          audioEncoder: AudioCompat.RecordingOptionsPresets.HIGH_QUALITY.android.audioEncoder,
          sampleRate: 44100,
          numberOfChannels: 2,
          bitRate: 128000,
        },
        ios: {
          extension: '.m4a',
          audioQuality: AudioCompat.RecordingOptionsPresets.HIGH_QUALITY.ios.audioQuality,
          sampleRate: 44100,
          numberOfChannels: 2,
          bitRate: 128000,
          linearPCMBitDepth: 16,
          linearPCMIsBigEndian: false,
          linearPCMIsFloat: false,
        },
      };

      // Start recording
      const recording = new AudioCompat.Recording();
      await recording.prepareToRecordAsync(recordingOptions);
      await recording.startAsync();

      this.currentRecording = recording;
      this.isRecording = true;

      return { success: true, recording };
    } catch (error) {
      console.error('Error starting recording:', error);
      return { success: false, error: error.message };
    }
  }

  async stopVoiceRecording() {
    try {
      if (!this.isRecording || !this.currentRecording) {
        return { success: false, error: 'No recording in progress' };
      }

      await this.currentRecording.stopAndUnloadAsync();
      const uri = this.currentRecording.getURI();
      
      // Get recording info
      const info = await FileSystem.getInfoAsync(uri);
      
      this.isRecording = false;
      const recording = this.currentRecording;
      this.currentRecording = null;

      return { 
        success: true, 
        uri, 
        duration: recording._finalDurationMillis || 0,
        size: info.size 
      };
    } catch (error) {
      console.error('Error stopping recording:', error);
      this.isRecording = false;
      this.currentRecording = null;
      return { success: false, error: error.message };
    }
  }

  async cancelVoiceRecording() {
    try {
      if (this.currentRecording) {
        await this.currentRecording.stopAndUnloadAsync();
        this.currentRecording = null;
      }
      this.isRecording = false;
      return { success: true };
    } catch (error) {
      console.error('Error canceling recording:', error);
      return { success: false, error: error.message };
    }
  }

  async playVoiceMessage(uri, onPlaybackUpdate) {
    try {
      // Stop any currently playing sound
      if (this.currentSound) {
        await this.currentSound.unloadAsync();
        this.currentSound = null;
      }

      // Validate URI
      if (!uri) {
        throw new Error('Audio URI is required');
      }

      // Check if file exists
      const fileInfo = await FileSystem.getInfoAsync(uri);
      if (!fileInfo.exists) {
        throw new Error('Audio file not found');
      }

      // Ensure URI is properly formatted
      let audioUri = uri;
      if (!uri.startsWith('file://') && !uri.startsWith('http')) {
        audioUri = `file://${uri}`;
      }
      
      console.log('Playing voice message:', audioUri);
      
      const { sound } = await AudioCompat.Sound.createAsync(
        { uri: audioUri },
        { 
          shouldPlay: true,
          isLooping: false,
          volume: 1.0,
        }
      );
      
      this.currentSound = sound;
      
      // Set up playback status updates
      sound.setOnPlaybackStatusUpdate((status) => {
        if (onPlaybackUpdate) {
          onPlaybackUpdate(status);
        }
        
        if (status.didJustFinish) {
          this.currentSound = null;
          if (onPlaybackUpdate) {
            onPlaybackUpdate({ ...status, isFinished: true });
          }
        }
      });

      // Get duration for UI
      const status = await sound.getStatusAsync();
      
      return { 
        success: true, 
        sound,
        duration: status.durationMillis || 0
      };
    } catch (error) {
      console.error('Error playing voice message:', error);
      return { success: false, error: error.message };
    }
  }

  async pauseVoiceMessage() {
    try {
      if (this.currentSound) {
        await this.currentSound.pauseAsync();
        return { success: true };
      }
      return { success: false, error: 'No audio playing' };
    } catch (error) {
      console.error('Error pausing voice message:', error);
      return { success: false, error: error.message };
    }
  }

  async resumeVoiceMessage() {
    try {
      if (this.currentSound) {
        await this.currentSound.playAsync();
        return { success: true };
      }
      return { success: false, error: 'No audio to resume' };
    } catch (error) {
      console.error('Error resuming voice message:', error);
      return { success: false, error: error.message };
    }
  }

  async stopVoiceMessage() {
    try {
      if (this.currentSound) {
        await this.currentSound.stopAsync();
        await this.currentSound.unloadAsync();
        this.currentSound = null;
        return { success: true };
      }
      return { success: false, error: 'No audio playing' };
    } catch (error) {
      console.error('Error stopping voice message:', error);
      return { success: false, error: error.message };
    }
  }

  // Voice Call Functions
  async initiateVoiceCall(courseCode, participants = []) {
    try {
      if (!this.currentUserId) {
        return { success: false, error: 'User not authenticated' };
      }

      // Ensure participants is always an array and includes current user
      const participantList = Array.isArray(participants) ? participants : [];
      if (!participantList.includes(this.currentUserId)) {
        participantList.push(this.currentUserId);
      }

      // Create participants object for better structure
      const participantsObj = {};
      participantList.forEach(userId => {
        participantsObj[userId] = {
          joined: userId === this.currentUserId, // Initiator is automatically joined
          joinedAt: userId === this.currentUserId ? serverTimestamp() : null
        };
      });

      const callData = {
        type: 'voice',
        courseCode: courseCode || '',
        initiator: this.currentUserId,
        participants: participantsObj,
        participantsList: participantList, // Keep array for queries
        status: 'calling',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      };

      const callRef = await addDoc(collection(db, 'calls'), callData);
      
      this.activeCall = {
        id: callRef.id,
        type: 'voice',
        status: 'calling',
        ...callData
      };

      return { 
        success: true, 
        callId: callRef.id,
        call: this.activeCall 
      };
    } catch (error) {
      console.error('Error initiating voice call:', error);
      return { success: false, error: error.message };
    }
  }

  async initiateVideoCall(courseCode, participants = []) {
    try {
      if (!this.currentUserId) {
        return { success: false, error: 'User not authenticated' };
      }

      // Ensure participants is always an array and includes current user
      const participantList = Array.isArray(participants) ? participants : [];
      if (!participantList.includes(this.currentUserId)) {
        participantList.push(this.currentUserId);
      }

      // Create participants object for better structure
      const participantsObj = {};
      participantList.forEach(userId => {
        participantsObj[userId] = {
          joined: userId === this.currentUserId, // Initiator is automatically joined
          joinedAt: userId === this.currentUserId ? serverTimestamp() : null
        };
      });

      const callData = {
        type: 'video',
        courseCode: courseCode || '',
        initiator: this.currentUserId,
        participants: participantsObj,
        participantsList: participantList, // Keep array for queries
        status: 'calling',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      };

      const callRef = await addDoc(collection(db, 'calls'), callData);
      
      this.activeCall = {
        id: callRef.id,
        type: 'video',
        status: 'calling',
        ...callData
      };

      return { 
        success: true, 
        callId: callRef.id,
        call: this.activeCall 
      };
    } catch (error) {
      console.error('Error initiating video call:', error);
      return { success: false, error: error.message };
    }
  }

  async joinCall(callId) {
    try {
      if (!this.currentUserId) {
        return { success: false, error: 'User not authenticated' };
      }

      const callRef = doc(db, 'calls', callId);
      await updateDoc(callRef, {
        status: 'active',
        [`participants.${this.currentUserId}`]: {
          joined: true,
          joinedAt: serverTimestamp()
        },
        updatedAt: serverTimestamp()
      });

      return { success: true };
    } catch (error) {
      console.error('Error joining call:', error);
      return { success: false, error: error.message };
    }
  }

  async endCall(callId) {
    try {
      if (!callId && this.activeCall) {
        callId = this.activeCall.id;
      }

      if (!callId) {
        return { success: false, error: 'No active call' };
      }

      const callRef = doc(db, 'calls', callId);
      await updateDoc(callRef, {
        status: 'ended',
        endedAt: serverTimestamp(),
        endedBy: this.currentUserId,
        updatedAt: serverTimestamp()
      });

      this.activeCall = null;
      this.cleanup();

      return { success: true };
    } catch (error) {
      console.error('Error ending call:', error);
      return { success: false, error: error.message };
    }
  }

  async rejectCall(callId) {
    try {
      const callRef = doc(db, 'calls', callId);
      await updateDoc(callRef, {
        status: 'rejected',
        rejectedBy: this.currentUserId,
        rejectedAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });

      return { success: true };
    } catch (error) {
      console.error('Error rejecting call:', error);
      return { success: false, error: error.message };
    }
  }

  // Listen to incoming calls (simplified to avoid index issues)
  listenToIncomingCalls(callback) {
    if (!this.currentUserId) {
      callback([]);
      return () => {};
    }

    const callsRef = collection(db, 'calls');
    // Simplified query to avoid requiring custom indices
    const q = query(
      callsRef,
      where('participantsList', 'array-contains', this.currentUserId)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const calls = [];
      snapshot.forEach((doc) => {
        const data = doc.data();
        // Filter on client side to avoid index requirement
        if (data.status === 'calling' || data.status === 'active') {
          calls.push({
            id: doc.id,
            ...data,
            createdAt: data.createdAt?.toDate?.() || new Date(),
            updatedAt: data.updatedAt?.toDate?.() || new Date()
          });
        }
      });
      
      // Sort on client side
      calls.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      
      callback(calls);
    }, (error) => {
      console.error('Error listening to calls:', error);
      callback([]);
    });

    this.callListeners.set('incoming', unsubscribe);
    return unsubscribe;
  }

  // External call functions (fallback for native calling)
  async makePhoneCall(phoneNumber) {
    try {
      const phoneUrl = Platform.OS === 'ios' ? `tel:${phoneNumber}` : `tel:${phoneNumber}`;
      const supported = await Linking.canOpenURL(phoneUrl);
      
      if (supported) {
        await Linking.openURL(phoneUrl);
        return { success: true };
      } else {
        return { success: false, error: 'Phone calls not supported on this device' };
      }
    } catch (error) {
      console.error('Error making phone call:', error);
      return { success: false, error: error.message };
    }
  }

  // Group call functions
  async createGroupCall(courseCode, callType = 'voice') {
    try {
      if (!this.currentUserId) {
        return { success: false, error: 'User not authenticated' };
      }

      console.log(`Creating ${callType} call for course:`, courseCode);

      // Directly initiate the appropriate call type
      if (callType === 'voice') {
        return await this.initiateVoiceCall(courseCode);
      } else {
        return await this.initiateVideoCall(courseCode);
      }
    } catch (error) {
      console.error('Error creating group call:', error);
      return { success: false, error: error.message };
    }
  }

  // Screen sharing (placeholder for future implementation)
  async startScreenShare() {
    Alert.alert(
      'Screen Share',
      'Screen sharing feature coming soon! This will allow you to share your screen during video calls.',
      [{ text: 'OK' }]
    );
    return { success: true, feature: 'coming_soon' };
  }

  // Enhanced voice message sending with proper chat integration
  async sendVoiceMessage(courseCode, audioUri, duration, senderInfo = {}) {
    try {
      // Import chat service dynamically to avoid circular dependency
      const { default: chatService } = await import('./chatService');
      
      console.log('Sending voice message:', { courseCode, audioUri, duration, senderInfo });
      
      // Prepare voice message data
      const voiceMessageData = {
        voiceUri: audioUri,
        audioUri: audioUri, // Fallback for compatibility
        duration: duration,
        fileUrl: audioUri, // Additional fallback
        voiceMessageDuration: duration,
        isVoiceMessage: true,
        // Enhanced metadata for cross-user compatibility
        audioMetadata: {
          duration: duration,
          format: 'audio/mp4', // or detected format
          uploadedAt: new Date().toISOString(),
          compatible: true,
          crossPlatform: true
        }
      };
      
      // Send the voice message through chat service
      const result = await chatService.sendMessage(
        courseCode,
        `🎤 Voice message (${Math.round(duration / 1000)}s)`, // Display text
        senderInfo.senderId,
        senderInfo.senderName,
        senderInfo.senderType,
        null, // replyToId
        'voice', // messageType
        voiceMessageData // additionalData
      );
      
      if (result.success) {
        console.log('Voice message sent successfully to course:', courseCode);
        return { 
          success: true, 
          messageId: result.messageId,
          messageType: 'voice',
          audioUri,
          duration,
          courseCode,
          crossUserDelivery: true // Indicates it's available to all user types
        };
      } else {
        throw new Error(result.error || 'Failed to send voice message');
      }
    } catch (error) {
      console.error('Error sending voice message:', error);
      return { success: false, error: error.message };
    }
  }

  // Enhanced voice message recording with user context
  async recordVoiceMessage(courseCode, userInfo = {}) {
    try {
      console.log('Starting voice message recording for course:', courseCode);
      
      // Request audio permissions first
      const { status } = await AudioCompat.requestPermissionsAsync();
      if (status !== 'granted') {
        throw new Error('Audio recording permission denied');
      }

      // Set audio mode for recording
      await AudioCompat.setAudioModeAsync({
        allowsRecordingIOS: true,
        staysActiveInBackground: true,
        interruptionModeIOS: AudioCompat.INTERRUPTION_MODE_IOS_DO_NOT_MIX,
        playsInSilentModeIOS: true,
        shouldDuckAndroid: true,
        interruptionModeAndroid: AudioCompat.INTERRUPTION_MODE_ANDROID_DO_NOT_MIX,
        playThroughEarpieceAndroid: false,
      });

      // Create recording with high-quality settings for cross-platform compatibility
      const recording = new AudioCompat.Recording();
      const recordingOptions = {
        ...AudioCompat.RecordingOptionsPresets.HIGH_QUALITY,
        // Ensure compatibility across devices
        android: {
          extension: '.m4a',
          outputFormat: AudioCompat.RECORDING_OPTION_ANDROID_OUTPUT_FORMAT_MPEG_4,
          audioEncoder: AudioCompat.RECORDING_OPTION_ANDROID_AUDIO_ENCODER_AAC,
          sampleRate: 44100,
          numberOfChannels: 2,
          bitRate: 128000,
        },
        ios: {
          extension: '.m4a',
          outputFormat: AudioCompat.RECORDING_OPTION_IOS_OUTPUT_FORMAT_MPEG4AAC,
          audioQuality: AudioCompat.RECORDING_OPTION_IOS_AUDIO_QUALITY_HIGH,
          sampleRate: 44100,
          numberOfChannels: 2,
          bitRate: 128000,
          linearPCMBitDepth: 16,
          linearPCMIsBigEndian: false,
          linearPCMIsFloat: false,
        },
        web: {
          mimeType: 'audio/webm;codecs=opus',
          bitsPerSecond: 128000,
        },
      };

      await recording.prepareToRecordAsync(recordingOptions);
      await recording.startAsync();
      
      this.currentRecording = recording;
      this.isRecording = true;
      
      console.log('Voice recording started with cross-platform compatibility');
      
      return { 
        success: true, 
        recording,
        isRecording: true,
        courseCode,
        userInfo
      };
      
    } catch (error) {
      console.error('Error starting voice recording:', error);
      this.currentRecording = null;
      this.isRecording = false;
      
      let errorMessage = 'Failed to start voice recording';
      if (error.message.includes('permission')) {
        errorMessage = 'Microphone permission required for voice messages';
      } else if (error.message.includes('busy')) {
        errorMessage = 'Microphone is busy. Please try again.';
      }
      
      return { success: false, error: errorMessage };
    }
  }

  // Utility functions
  formatCallDuration(durationMs) {
    const seconds = Math.floor(durationMs / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    
    if (hours > 0) {
      return `${hours}:${(minutes % 60).toString().padStart(2, '0')}:${(seconds % 60).toString().padStart(2, '0')}`;
    } else {
      return `${minutes}:${(seconds % 60).toString().padStart(2, '0')}`;
    }
  }

  formatRecordingDuration(seconds) {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  }

  // Cleanup function
  cleanup() {
    // Cancel any ongoing recording
    if (this.isRecording && this.currentRecording) {
      this.cancelVoiceRecording();
    }

    // Clean up call listeners
    this.callListeners.forEach((unsubscribe) => {
      if (typeof unsubscribe === 'function') {
        unsubscribe();
      }
    });
    this.callListeners.clear();

    // Reset state
    this.activeCall = null;
    this.localStream = null;
    this.remoteStream = null;
  }

  // Get call history for a course
  async getCallHistory(courseCode) {
    try {
      const callsRef = collection(db, 'calls');
      const q = query(
        callsRef,
        where('courseCode', '==', courseCode),
        where('participantsList', 'array-contains', this.currentUserId),
        orderBy('createdAt', 'desc')
      );

      const snapshot = await getDocs(q);
      const calls = [];
      
      snapshot.forEach((doc) => {
        const data = doc.data();
        calls.push({
          id: doc.id,
          ...data,
          createdAt: data.createdAt?.toDate?.() || new Date(),
          updatedAt: data.updatedAt?.toDate?.() || new Date()
        });
      });

      return { success: true, calls };
    } catch (error) {
      console.error('Error getting call history:', error);
      return { success: false, error: error.message, calls: [] };
    }
  }

  // Play voice message
  async playVoiceMessage(uri, onStatusUpdate = null) {
    try {
      // Stop any currently playing audio
      if (this.currentPlayback) {
        try {
          await this.currentPlayback.stopAsync();
          await this.currentPlayback.unloadAsync();
        } catch (cleanupError) {
          console.log('Cleanup warning:', cleanupError.message);
        }
        this.currentPlayback = null;
      }

      console.log('Loading audio from URI:', uri);
      
      // Validate URI
      if (!uri || typeof uri !== 'string') {
        throw new Error('Invalid audio URI provided');
      }

      // Set audio mode for playback
      await AudioCompat.setAudioModeAsync({
        allowsRecordingIOS: false,
        staysActiveInBackground: false,
        interruptionModeIOS: AudioCompat.INTERRUPTION_MODE_IOS_DO_NOT_MIX,
        playsInSilentModeIOS: true,
        shouldDuckAndroid: true,
        interruptionModeAndroid: AudioCompat.INTERRUPTION_MODE_ANDROID_DO_NOT_MIX,
        playThroughEarpieceAndroid: false,
      });

      // Create and load the sound
      const { sound, status } = await AudioCompat.createSoundAsync(
        { uri },
        { 
          shouldPlay: false, // Don't auto-play, let user control
          progressUpdateIntervalMillis: 100,
          positionMillis: 0,
          volume: 1.0,
          rate: 1.0,
          shouldCorrectPitch: true,
          isLooping: false,
        },
        onStatusUpdate
      );

      this.currentPlayback = sound;

      // Start playback
      await sound.playAsync();
      
      // Get duration info
      const playbackStatus = await sound.getStatusAsync();
      let duration = 0;
      if (playbackStatus.isLoaded && playbackStatus.durationMillis) {
        duration = playbackStatus.durationMillis;
      }

      console.log('Audio playback started successfully, duration:', duration);
      
      return { 
        success: true, 
        duration,
        sound: this.currentPlayback 
      };
    } catch (error) {
      console.error('Error playing voice message:', error);
      
      // Provide more specific error messages
      let errorMessage = 'Unable to play audio message';
      if (error.message.includes('network')) {
        errorMessage = 'Network error - check your connection';
      } else if (error.message.includes('format')) {
        errorMessage = 'Audio format not supported';
      } else if (error.message.includes('permission')) {
        errorMessage = 'Audio permission denied';
      }
      
      return { 
        success: false, 
        error: errorMessage,
        originalError: error.message 
      };
    }
  }

  // Pause voice message
  async pauseVoiceMessage() {
    try {
      if (this.currentPlayback) {
        await this.currentPlayback.pauseAsync();
        return { success: true };
      }
      return { success: false, error: 'No audio currently playing' };
    } catch (error) {
      console.error('Error pausing voice message:', error);
      return { success: false, error: error.message };
    }
  }

  // Stop voice message
  async stopVoiceMessage() {
    try {
      if (this.currentPlayback) {
        await this.currentPlayback.stopAsync();
        return { success: true };
      }
      return { success: false, error: 'No audio currently playing' };
    } catch (error) {
      console.error('Error stopping voice message:', error);
      return { success: false, error: error.message };
    }
  }

  // Resume voice message
  async resumeVoiceMessage() {
    try {
      if (this.currentPlayback) {
        await this.currentPlayback.playAsync();
        return { success: true };
      }
      return { success: false, error: 'No audio to resume' };
    } catch (error) {
      console.error('Error resuming voice message:', error);
      return { success: false, error: error.message };
    }
  }

  // Cleanup playback
  async cleanupPlayback() {
    try {
      if (this.currentPlayback) {
        await this.currentPlayback.unloadAsync();
        this.currentPlayback = null;
      }
      return { success: true };
    } catch (error) {
      console.error('Error cleaning up playback:', error);
      return { success: false, error: error.message };
    }
  }
}

// Create and export singleton instance
const communicationService = new CommunicationService();
export default communicationService;
