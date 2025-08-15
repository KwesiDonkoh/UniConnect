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
  const [duration, setDuration] = useState(0);
  const [position, setPosition] = useState(0);
  const [hasError, setHasError] = useState(false);
  
  const waveformAnim = useRef(new Animated.Value(0)).current;
  const playButtonScale = useRef(new Animated.Value(1)).current;

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

    const audioUri = message.voiceUri || message.uri || message.fileUrl || message.audioUri;
    if (!audioUri) {
      console.warn('Voice message not available - no audio URI found');
      setHasError(true);
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
      console.log('Playing audio from URI:', audioUri);
      const result = await communicationService.playVoiceMessage(
        audioUri,
        (status) => {
          if (status.isFinished) {
            setIsPlaying(false);
            setPosition(0);
          } else if (status.positionMillis && status.durationMillis) {
            setPosition(status.positionMillis);
            setDuration(status.durationMillis);
          }
        }
      );

      if (result.success) {
        setIsPlaying(true);
        if (result.duration) {
          setDuration(result.duration);
        }
      } else {
        setHasError(true);
        Alert.alert('Playback Error', result.error || 'Unable to play voice message');
      }
    } catch (error) {
      console.error('Error playing voice message:', error);
      setHasError(true);
      Alert.alert('Playback Error', 'Unable to play voice message');
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
