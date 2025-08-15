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

  static get Recording() {
    return Audio.Recording;
  }

  static get Sound() {
    return Audio.Sound;
  }

  static get RecordingOptionsPresets() {
    return Audio.RecordingOptionsPresets;
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
