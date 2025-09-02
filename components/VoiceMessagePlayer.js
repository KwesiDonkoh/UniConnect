import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Alert,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import communicationService from '../services/communicationService';

const VoiceMessagePlayer = ({ message, isCurrentUser }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [duration, setDuration] = useState(message?.duration || message?.voiceMessageDuration || 0);
  const [position, setPosition] = useState(0);
  const [hasError, setHasError] = useState(false);
  const [audioReady, setAudioReady] = useState(false);
  
  const waveformAnim = useRef(new Animated.Value(0)).current;
  const playButtonScale = useRef(new Animated.Value(1)).current;

  // Enhanced audio URI detection with multiple fallbacks and validation
  const getAudioUri = () => {
    const possibleUris = [
      message?.voiceUri,
      message?.audioUri, 
      message?.fileUrl,
      message?.uri,
      message?.audioMetadata?.storageUrl,
      message?.audioMetadata?.uri
    ];
    
    // Find the first valid URI (prefer Firebase Storage URLs)
    for (const uri of possibleUris) {
      if (uri) {
        // Prefer Firebase Storage URLs over local file paths
        if (uri.includes('firebasestorage.googleapis.com') || uri.includes('storage.googleapis.com')) {
          console.log('Using Firebase Storage URL for voice playback:', uri);
          return uri;
        }
      }
    }
    
    // If no Firebase Storage URL found, use the first available URI
    const firstUri = possibleUris.find(uri => uri);
    if (firstUri) {
      console.log('Using fallback URI for voice playback:', firstUri);
      // Check if it's a local file path that might not exist
      if (firstUri.includes('/Library/Caches/') || firstUri.includes('/var/mobile/')) {
        console.warn('Voice message uses local file path - may not be accessible:', firstUri);
      }
    }
    
    return firstUri || null;
  };

  useEffect(() => {
    if (isPlaying) {
      // Start waveform animation
      Animated.loop(
        Animated.sequence([
          Animated.timing(waveformAnim, {
            toValue: 1,
            duration: 500,
            useNativeDriver: true,
          }),
          Animated.timing(waveformAnim, {
            toValue: 0,
            duration: 500,
            useNativeDriver: true,
          }),
        ])
      ).start();
    } else {
      waveformAnim.setValue(0);
    }
  }, [isPlaying]);

  const playVoiceMessage = async () => {
    if (isPlaying) {
      // Pause
      try {
        await communicationService.pauseVoiceMessage();
        setIsPlaying(false);
      } catch (error) {
        console.error('Error pausing voice message:', error);
      }
      return;
    }

    const audioUri = getAudioUri();
    if (!audioUri) {
      console.warn('Voice message not available - no audio URI found', {
        messageId: message?.id,
        messageType: message?.type,
        senderType: message?.senderType,
        availableFields: Object.keys(message || {})
      });
      setHasError(true);
      Alert.alert(
        'Audio Not Available', 
        'This voice message cannot be played. It may have been recorded in an incompatible format or the audio file is missing.',
        [{ text: 'OK' }]
      );
      return;
    }

    setIsLoading(true);
    setHasError(false);

    // Animate play button
    Animated.sequence([
      Animated.timing(playButtonScale, {
        toValue: 0.8,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(playButtonScale, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();

    try {
      console.log('Playing voice message:', {
        audioUri,
        messageId: message?.id,
        senderType: message?.senderType,
        duration: duration,
        crossPlatform: message?.audioMetadata?.crossPlatform
      });
      
      const result = await communicationService.playVoiceMessage(
        audioUri,
        (status) => {
          if (status.isFinished) {
            setIsPlaying(false);
            setPosition(0);
            setAudioReady(true);
          } else if (status.positionMillis && status.durationMillis) {
            setPosition(status.positionMillis);
            if (!duration || duration === 0) {
              setDuration(status.durationMillis);
            }
            setAudioReady(true);
          }
        }
      );

      if (result.success) {
        setIsPlaying(true);
        setAudioReady(true);
        if (result.duration && (!duration || duration === 0)) {
          setDuration(result.duration);
        }
        console.log('Voice message playback started successfully');
      } else {
        setHasError(true);
        console.error('Voice message playback failed:', result.error);
        
        // Provide user-friendly error messages
        let errorMessage = 'Unable to play voice message';
        if (result.error?.includes('network')) {
          errorMessage = 'Network error. Please check your internet connection and try again.';
        } else if (result.error?.includes('format')) {
          errorMessage = 'Audio format not supported on this device.';
        } else if (result.error?.includes('permission')) {
          errorMessage = 'Audio permission required. Please check your settings.';
        }
        
        Alert.alert('Playback Error', errorMessage, [
          { text: 'OK' },
          { text: 'Retry', onPress: () => {
            setHasError(false);
            setTimeout(() => playVoiceMessage(), 500);
          }}
        ]);
      }
    } catch (error) {
      console.error('Error playing voice message:', error);
      setHasError(true);
      
      let errorMessage = 'Unable to play voice message';
      if (error.message?.includes('network')) {
        errorMessage = 'Network error. Please check your connection.';
      } else if (error.message?.includes('not found')) {
        errorMessage = 'Voice message file not found. It may have been deleted.';
      }
      
      Alert.alert('Playback Error', errorMessage, [
        { text: 'OK' }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const formatDuration = (milliseconds) => {
    const seconds = Math.floor(milliseconds / 1000);
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const getPlayButtonIcon = () => {
    if (isLoading) return 'ellipsis-horizontal';
    if (hasError) return 'alert-circle';
    return isPlaying ? 'pause' : 'play';
  };

  const getPlayButtonColor = () => {
    if (hasError) return '#EF4444';
    return isCurrentUser ? '#FFFFFF' : '#4F46E5';
  };

  return (
    <View style={styles.voiceMessage}>
      {/* Play Button */}
      <Animated.View style={{ transform: [{ scale: playButtonScale }] }}>
        <TouchableOpacity 
          style={[
            styles.playButton,
            {
              backgroundColor: isCurrentUser 
                ? 'rgba(255, 255, 255, 0.2)' 
                : '#EEF2FF'
            }
          ]}
          onPress={playVoiceMessage}
          disabled={isLoading}
        >
          <Ionicons 
            name={getPlayButtonIcon()} 
            size={20} 
            color={getPlayButtonColor()} 
          />
        </TouchableOpacity>
      </Animated.View>

      {/* Waveform */}
      <View style={styles.waveform}>
        {[...Array(15)].map((_, i) => {
          const animatedOpacity = waveformAnim.interpolate({
            inputRange: [0, 1],
            outputRange: [0.3, 1],
            extrapolate: 'clamp',
          });

          const animatedScale = waveformAnim.interpolate({
            inputRange: [0, 1],
            outputRange: [0.5, 1.5],
            extrapolate: 'clamp',
          });

          return (
            <Animated.View
              key={i}
              style={[
                styles.waveBar,
                {
                  height: Math.random() * 20 + 8,
                  backgroundColor: isCurrentUser 
                    ? 'rgba(255,255,255,0.8)' 
                    : '#94A3B8',
                  opacity: isPlaying ? animatedOpacity : 0.6,
                  transform: [{ scaleY: isPlaying ? animatedScale : 1 }],
                },
              ]}
            />
          );
        })}
      </View>

      {/* Duration */}
      <View style={styles.durationContainer}>
        {duration > 0 && position > 0 ? (
          <Text style={[
            styles.duration,
            { color: isCurrentUser ? 'rgba(255,255,255,0.8)' : '#64748B' }
          ]}>
            {formatDuration(position)} / {formatDuration(duration)}
          </Text>
        ) : (
          <Text style={[
            styles.duration,
            { color: isCurrentUser ? 'rgba(255,255,255,0.8)' : '#64748B' }
          ]}>
            {message.duration || '0:00'}
          </Text>
        )}
      </View>

      {/* Voice Message Indicator */}
      <View style={styles.voiceIndicator}>
        <Ionicons 
          name="mic" 
          size={12} 
          color={isCurrentUser ? 'rgba(255,255,255,0.6)' : '#94A3B8'} 
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  voiceMessage: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    gap: 8,
  },
  playButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  waveform: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    height: 32,
    gap: 2,
    marginHorizontal: 4,
  },
  waveBar: {
    width: 3,
    borderRadius: 2,
    minHeight: 4,
  },
  durationContainer: {
    minWidth: 60,
    alignItems: 'flex-end',
  },
  duration: {
    fontSize: 12,
    fontWeight: '500',
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
  },
  voiceIndicator: {
    marginLeft: 4,
  },
});

export default VoiceMessagePlayer;
