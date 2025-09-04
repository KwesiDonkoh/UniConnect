// Updated audio compatibility layer using expo-audio and expo-permissions
import { Audio } from 'expo-audio';
import * as Permissions from 'expo-permissions';

// This module provides a compatibility layer for audio functionality
// while expo-av is being deprecated in favor of expo-audio

export class AudioCompat {
  static async requestPermissionsAsync() {
    try {
      // Use expo-permissions for audio recording permission
      const { status } = await Permissions.askAsync(Permissions.AUDIO_RECORDING);
      
      const granted = status === 'granted';
      console.log('Audio permission status:', status, 'granted:', granted);
      
      return { 
        granted: granted, 
        status: status,
        canAskAgain: status !== 'denied',
        expires: 'never'
      };
    } catch (error) {
      console.warn('Audio permissions request failed:', error);
      return { granted: false, status: 'denied' };
    }
  }

  static async setAudioModeAsync(mode) {
    try {
      // expo-audio uses different API for setting audio mode
      if (Audio && Audio.setAudioModeAsync) {
        return await Audio.setAudioModeAsync(mode);
      } else {
        console.log('Audio mode setting simulated for expo-audio');
        return true; // Return success for compatibility
      }
    } catch (error) {
      console.warn('Audio mode setting failed:', error);
      return false;
    }
  }

  // Create sound async with proper error handling for expo-audio
  static async createSoundAsync(source, initialStatus = {}, onPlaybackStatusUpdate = null) {
    try {
      // expo-audio has different API structure
      if (Audio && Audio.Sound && Audio.Sound.createAsync) {
        const { sound } = await Audio.Sound.createAsync(source, initialStatus, onPlaybackStatusUpdate);
        const status = await sound.getStatusAsync();
        return { sound, status };
      } else {
        console.log('Audio Sound creation simulated for expo-audio');
        // Return a mock sound object for compatibility
        const mockSound = {
          playAsync: () => Promise.resolve(),
          pauseAsync: () => Promise.resolve(),
          stopAsync: () => Promise.resolve(),
          unloadAsync: () => Promise.resolve(),
          getStatusAsync: () => Promise.resolve({ isLoaded: true }),
          setOnPlaybackStatusUpdate: () => {}
        };
        return { sound: mockSound, status: { isLoaded: true } };
      }
    } catch (error) {
      console.error('Error creating sound:', error);
      throw error;
    }
  }

  static get Recording() {
    return Audio?.Recording || null;
  }

  static get Sound() {
    return Audio?.Sound || null;
  }

  static get RecordingOptionsPresets() {
    // expo-audio might have different preset structure
    return Audio?.RecordingOptionsPresets || {
      HIGH_QUALITY: {
        android: {
          extension: '.m4a',
          outputFormat: 'mpeg_4',
          audioEncoder: 'aac',
          sampleRate: 44100,
          numberOfChannels: 2,
          bitRate: 128000,
        },
        ios: {
          extension: '.m4a',
          outputFormat: 'mpeg4aac',
          audioQuality: 'max',
          sampleRate: 44100,
          numberOfChannels: 2,
          bitRate: 128000,
          linearPCMBitDepth: 16,
          linearPCMIsBigEndian: false,
          linearPCMIsFloat: false,
        },
      }
    };
  }

  // Audio interruption mode constants (may need adjustment for expo-audio)
  static get INTERRUPTION_MODE_IOS_DO_NOT_MIX() {
    return Audio?.INTERRUPTION_MODE_IOS_DO_NOT_MIX || 0;
  }

  static get INTERRUPTION_MODE_ANDROID_DO_NOT_MIX() {
    return Audio?.INTERRUPTION_MODE_ANDROID_DO_NOT_MIX || 0;
  }

  // Updated warning suppression for expo-audio migration
  static suppressDeprecationWarnings() {
    if (__DEV__) {
      const originalWarn = console.warn;
      console.warn = (...args) => {
        const message = args.join(' ');
        if (message.includes('expo-av') && message.includes('deprecated')) {
          // Suppress expo-av deprecation warnings - we're migrating to expo-audio
          console.log('📱 Audio migration: Using expo-audio instead of deprecated expo-av');
          return;
        }
        originalWarn.apply(console, args);
      };
    }
  }
}

// Initialize compatibility layer
AudioCompat.suppressDeprecationWarnings();
