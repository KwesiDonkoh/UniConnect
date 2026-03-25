// Modern audio service using AudioCompat and expo-av
import AudioCompat from '../utils/audioCompat';

class ModernAudioService {
  constructor() {
    this.isRecording = false;
    this.currentRecording = null;
    this.currentSound = null;
    this.audioModeSet = false;
  }

  // Request audio recording permission
  async requestPermissions() {
    try {
      console.log('🎤 Requesting audio recording permissions...');
      return await AudioCompat.requestPermissionsAsync();
    } catch (error) {
      console.error('❌ Error requesting audio permissions:', error);
      return { granted: false, status: 'error', error: error.message };
    }
  }

  // Check permissions
  async checkPermissions() {
    return await this.requestPermissions();
  }

  // Start audio recording (Real implementation)
  async startRecording() {
    try {
      console.log('🎤 Starting real audio recording...');
      
      const permission = await this.requestPermissions();
      if (!permission.granted) {
        throw new Error('Audio recording permission denied');
      }

      if (!this.audioModeSet) {
        await AudioCompat.setAudioModeAsync({
          allowsRecordingIOS: true,
          playsInSilentModeIOS: true,
          shouldDuckAndroid: true,
          playThroughEarpieceAndroid: false,
          staysActiveInBackground: true,
        });
        this.audioModeSet = true;
      }

      const recording = new AudioCompat.Recording();
      await recording.prepareToRecordAsync(AudioCompat.RecordingOptionsPresets.HIGH_QUALITY);
      await recording.startAsync();
      
      this.currentRecording = recording;
      this.isRecording = true;
      this.recordingStartTime = Date.now();
      
      console.log('✅ Real recording started');
      
      return { success: true };
    } catch (error) {
      console.error('❌ Error starting real recording:', error);
      return { success: false, error: error.message };
    }
  }

  // Stop audio recording
  async stopRecording() {
    try {
      if (!this.isRecording || !this.currentRecording) {
        throw new Error('No recording in progress');
      }

      console.log('🎤 Stopping real audio recording...');
      
      await this.currentRecording.stopAndUnloadAsync();
      const uri = this.currentRecording.getURI();
      const duration = Math.floor((Date.now() - this.recordingStartTime) / 1000);
      
      this.isRecording = false;
      this.currentRecording = null;
      
      console.log('✅ Recording stopped:', { duration, uri });
      
      return {
        success: true,
        uri: uri,
        duration: duration,
      };
    } catch (error) {
      console.error('❌ Error stopping recording:', error);
      this.isRecording = false;
      this.currentRecording = null;
      return { success: false, error: error.message };
    }
  }

  // Play audio file
  async playSound(uri) {
    try {
      if (this.currentSound) {
        await this.currentSound.unloadAsync();
      }
      
      const { sound } = await AudioCompat.Sound.createAsync(
        { uri },
        { shouldPlay: true }
      );
      
      this.currentSound = sound;
      return { success: true };
    } catch (error) {
      console.error('❌ Error playing sound:', error);
      return { success: false, error: error.message };
    }
  }

  // Stop sound playback
  async stopSound() {
    try {
      if (this.currentSound) {
        await this.currentSound.stopAsync();
        return { success: true };
      }
      return { success: false, error: 'No audio playing' };
    } catch (error) {
      console.error('❌ Error stopping sound:', error);
      return { success: false, error: error.message };
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
    if (this.currentRecording) {
      this.currentRecording.stopAndUnloadAsync().catch(console.warn);
    }
    if (this.currentSound) {
      this.currentSound.unloadAsync().catch(console.warn);
    }
    this.isRecording = false;
    this.currentRecording = null;
    this.currentSound = null;
  }
}

export default new ModernAudioService();
