// Audio compatibility layer to handle expo-av deprecation gracefully
import { Audio } from 'expo-av';

// This module provides a compatibility layer for audio functionality
// while expo-av is being deprecated in favor of expo-audio

export class AudioCompat {
  static async requestPermissionsAsync() {
    try {
      return await Audio.requestPermissionsAsync();
    } catch (error) {
      console.warn('Audio permissions request failed:', error);
      return { status: 'denied' };
    }
  }

  static async setAudioModeAsync(mode) {
    try {
      return await Audio.setAudioModeAsync(mode);
    } catch (error) {
      console.warn('Audio mode setting failed:', error);
      return false;
    }
  }

  // Create sound async with proper error handling
  static async createSoundAsync(source, initialStatus = {}, onPlaybackStatusUpdate = null) {
    try {
      const { sound } = await Audio.Sound.createAsync(source, initialStatus, onPlaybackStatusUpdate);
      const status = await sound.getStatusAsync();
      return { sound, status };
    } catch (error) {
      console.error('Error creating sound:', error);
      throw error;
    }
  }

  static get Recording() {
    return Audio.Recording;
  }

  static get Sound() {
    return Audio.Sound;
  }

  static get RecordingOptionsPresets() {
    return Audio.RecordingOptionsPresets;
  }

  // Audio interruption mode constants
  static get INTERRUPTION_MODE_IOS_DO_NOT_MIX() {
    return Audio.INTERRUPTION_MODE_IOS_DO_NOT_MIX;
  }

  static get INTERRUPTION_MODE_ANDROID_DO_NOT_MIX() {
    return Audio.INTERRUPTION_MODE_ANDROID_DO_NOT_MIX;
  }

  // Add warning suppression for development
  static suppressDeprecationWarnings() {
    if (__DEV__) {
      const originalWarn = console.warn;
      console.warn = (...args) => {
        const message = args.join(' ');
        if (message.includes('expo-av') && message.includes('deprecated')) {
          // Suppress expo-av deprecation warnings in development
          return;
        }
        originalWarn.apply(console, args);
      };
    }
  }
}

// Initialize compatibility layer
AudioCompat.suppressDeprecationWarnings();

export default AudioCompat;
