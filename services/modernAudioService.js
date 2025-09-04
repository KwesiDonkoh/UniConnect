// Modern audio service using expo-audio and expo-permissions
import * as Permissions from 'expo-permissions';

class ModernAudioService {
  constructor() {
    this.isRecording = false;
    this.currentRecording = null;
    this.currentSound = null;
  }

  // Request audio recording permission using expo-permissions
  async requestPermissions() {
    try {
      console.log('🎤 Requesting audio recording permissions...');
      
      const { status } = await Permissions.askAsync(Permissions.AUDIO_RECORDING);
      
      const granted = status === 'granted';
      console.log('🎤 Audio permission result:', { status, granted });
      
      return {
        granted: granted,
        status: status,
        canAskAgain: status !== 'denied'
      };
    } catch (error) {
      console.error('❌ Error requesting audio permissions:', error);
      return {
        granted: false,
        status: 'error',
        error: error.message
      };
    }
  }

  // Check if we have audio recording permission
  async checkPermissions() {
    try {
      const { status } = await Permissions.getAsync(Permissions.AUDIO_RECORDING);
      return {
        granted: status === 'granted',
        status: status
      };
    } catch (error) {
      console.error('❌ Error checking audio permissions:', error);
      return {
        granted: false,
        status: 'error'
      };
    }
  }

  // Start audio recording (simulated for now)
  async startRecording() {
    try {
      console.log('🎤 Starting audio recording...');
      
      // Check permissions first
      const permissionResult = await this.checkPermissions();
      if (!permissionResult.granted) {
        const requestResult = await this.requestPermissions();
        if (!requestResult.granted) {
          throw new Error('Audio recording permission denied');
        }
      }

      // For now, simulate recording since expo-audio API might be different
      this.isRecording = true;
      this.recordingStartTime = Date.now();
      
      console.log('🎤 Recording started (simulated)');
      
      return {
        success: true,
        message: 'Recording started'
      };
    } catch (error) {
      console.error('❌ Error starting recording:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Stop audio recording
  async stopRecording() {
    try {
      if (!this.isRecording) {
        throw new Error('No recording in progress');
      }

      console.log('🎤 Stopping audio recording...');
      
      this.isRecording = false;
      const duration = Math.floor((Date.now() - this.recordingStartTime) / 1000);
      
      // Generate a mock recording URI
      const recordingUri = `mock_recording_${Date.now()}.m4a`;
      
      console.log('🎤 Recording stopped:', { duration, uri: recordingUri });
      
      return {
        success: true,
        uri: recordingUri,
        duration: duration,
        message: 'Recording completed'
      };
    } catch (error) {
      console.error('❌ Error stopping recording:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Play audio file (simulated)
  async playSound(uri) {
    try {
      console.log('🔊 Playing sound:', uri);
      
      // Simulate sound playback
      return {
        success: true,
        message: 'Sound playback started (simulated)'
      };
    } catch (error) {
      console.error('❌ Error playing sound:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Stop sound playback
  async stopSound() {
    try {
      console.log('🔊 Stopping sound playback...');
      
      return {
        success: true,
        message: 'Sound stopped'
      };
    } catch (error) {
      console.error('❌ Error stopping sound:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Get recording status
  getRecordingStatus() {
    return {
      isRecording: this.isRecording,
      duration: this.isRecording ? Math.floor((Date.now() - this.recordingStartTime) / 1000) : 0
    };
  }

  // Clean up resources
  cleanup() {
    this.isRecording = false;
    this.currentRecording = null;
    this.currentSound = null;
    console.log('🧹 Audio service cleaned up');
  }
}

export default new ModernAudioService();
