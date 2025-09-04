import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Alert,
  Modal,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors } from '../themes/modernTheme';
import modernAudioService from '../services/modernAudioService';

const { width } = Dimensions.get('window');

export default function SimpleAudioRecorder({ 
  visible, 
  onClose, 
  onSendAudio,
  maxDuration = 300 // 5 minutes
}) {
  const [isRecording, setIsRecording] = useState(false);
  const [recordingDuration, setRecordingDuration] = useState(0);
  const [recordingUri, setRecordingUri] = useState(null);

  // Animation refs
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const slideAnim = useRef(new Animated.Value(300)).current;
  
  // Timer ref
  const timerRef = useRef(null);

  useEffect(() => {
    if (visible) {
      Animated.spring(slideAnim, {
        toValue: 0,
        tension: 100,
        friction: 8,
        useNativeDriver: true,
      }).start();
    } else {
      // Clean up when modal closes
      stopRecording();
      resetRecorder();
      
      Animated.timing(slideAnim, {
        toValue: 300,
        duration: 300,
        useNativeDriver: true,
      }).start();
    }

    return () => {
      cleanup();
    };
  }, [visible]);

  useEffect(() => {
    if (isRecording) {
      startPulseAnimation();
      startRecordingTimer();
    } else {
      stopPulseAnimation();
      stopRecordingTimer();
    }
  }, [isRecording]);

  const startPulseAnimation = () => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.3,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
      ])
    ).start();
  };

  const stopPulseAnimation = () => {
    pulseAnim.stopAnimation();
    pulseAnim.setValue(1);
  };

  const startRecordingTimer = () => {
    timerRef.current = setInterval(() => {
      setRecordingDuration(prev => {
        const newDuration = prev + 1;
        if (newDuration >= maxDuration) {
          stopRecording();
        }
        return newDuration;
      });
    }, 1000);
  };

  const stopRecordingTimer = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  };

  const startRecording = async () => {
    try {
      console.log('🎤 Starting recording with modern audio service...');
      
      const result = await modernAudioService.startRecording();
      
      if (result.success) {
        setIsRecording(true);
        setRecordingDuration(0);
        console.log('✅ Recording started successfully');
      } else {
        throw new Error(result.error || 'Failed to start recording');
      }
      
    } catch (error) {
      console.error('❌ Failed to start recording:', error);
      Alert.alert('Error', error.message || 'Failed to start recording. Please try again.');
    }
  };

  const stopRecording = async () => {
    if (!isRecording) return;

    try {
      console.log('🎤 Stopping recording with modern audio service...');
      
      const result = await modernAudioService.stopRecording();
      
      if (result.success) {
        setRecordingUri(result.uri);
        setIsRecording(false);
        console.log('✅ Recording stopped successfully:', result.uri);
      } else {
        throw new Error(result.error || 'Failed to stop recording');
      }
      
    } catch (error) {
      console.error('❌ Failed to stop recording:', error);
      Alert.alert('Error', error.message || 'Failed to stop recording.');
    }
  };

  const resetRecorder = () => {
    setRecordingUri(null);
    setRecordingDuration(0);
    setIsRecording(false);
  };

  const handleSend = () => {
    if (recordingDuration > 0) {
      // Send simulated audio data
      onSendAudio({
        uri: recordingUri || `mock_audio_${Date.now()}.m4a`,
        duration: recordingDuration,
        timestamp: Date.now(),
      });
      onClose();
    } else {
      Alert.alert('No Recording', 'Please record an audio message first.');
    }
  };

  const handleDelete = () => {
    Alert.alert(
      'Delete Recording',
      'Are you sure you want to delete this recording?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Delete', style: 'destructive', onPress: resetRecorder },
      ]
    );
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const cleanup = () => {
    stopRecordingTimer();
    modernAudioService.cleanup();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <Animated.View
          style={[
            styles.modal,
            {
              transform: [{ translateY: slideAnim }],
            },
          ]}
        >
          <LinearGradient
            colors={[Colors.primary[500], Colors.primary[700]]}
            style={styles.gradient}
          >
            {/* Header */}
            <View style={styles.header}>
              <Text style={styles.title}>Audio Message</Text>
              <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                <Ionicons name="close" size={24} color="white" />
              </TouchableOpacity>
            </View>

            {/* Recording Area */}
            <View style={styles.recordingArea}>
              {/* Timer */}
              <Text style={styles.timer}>
                {formatTime(recordingDuration)}
              </Text>

              {/* Simple Waveform Visualization */}
              <View style={styles.waveformContainer}>
                {[...Array(15)].map((_, index) => (
                  <View
                    key={index}
                    style={[
                      styles.waveformBar,
                      {
                        height: isRecording ? Math.random() * 20 + 10 : 4,
                        opacity: isRecording ? 1 : 0.3,
                      },
                    ]}
                  />
                ))}
              </View>

              {/* Status Text */}
              <Text style={styles.statusText}>
                {isRecording 
                  ? 'Recording...' 
                  : recordingUri 
                    ? 'Tap play to listen'
                    : 'Tap to record'
                }
              </Text>
            </View>

            {/* Controls */}
            <View style={styles.controls}>
              {!recordingUri ? (
                // Recording Controls
                <View style={styles.recordingControls}>
                  <Animated.View
                    style={[
                      styles.recordButtonContainer,
                      { transform: [{ scale: pulseAnim }] },
                    ]}
                  >
                    <TouchableOpacity
                      style={[
                        styles.recordButton,
                        isRecording && styles.recordButtonActive,
                      ]}
                      onPress={isRecording ? stopRecording : startRecording}
                    >
                      <Ionicons 
                        name={isRecording ? 'stop' : 'mic'} 
                        size={32} 
                        color="white" 
                      />
                    </TouchableOpacity>
                  </Animated.View>
                </View>
              ) : (
                // Playback Controls
                <View style={styles.playbackControls}>
                  <TouchableOpacity
                    style={styles.deleteButton}
                    onPress={handleDelete}
                  >
                    <Ionicons name="trash" size={24} color="white" />
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.playButton}
                    onPress={() => Alert.alert('Info', 'Audio playback simulated')}
                  >
                    <Ionicons name="play" size={32} color="white" />
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.sendButton}
                    onPress={handleSend}
                  >
                    <Ionicons name="send" size={24} color="white" />
                  </TouchableOpacity>
                </View>
              )}
            </View>
          </LinearGradient>
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modal: {
    width: width * 0.9,
    borderRadius: 25,
    overflow: 'hidden',
  },
  gradient: {
    padding: 30,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 30,
  },
  title: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  recordingArea: {
    alignItems: 'center',
    marginBottom: 40,
  },
  timer: {
    color: 'white',
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 30,
  },
  waveformContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 40,
    marginBottom: 20,
    gap: 3,
  },
  waveformBar: {
    width: 3,
    backgroundColor: 'white',
    borderRadius: 1.5,
  },
  statusText: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 16,
    textAlign: 'center',
  },
  controls: {
    alignItems: 'center',
  },
  recordingControls: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  recordButtonContainer: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  recordButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: Colors.error[500],
    alignItems: 'center',
    justifyContent: 'center',
  },
  recordButtonActive: {
    backgroundColor: Colors.error[600],
  },
  playbackControls: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 30,
  },
  deleteButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  playButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: Colors.success[500],
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  sendButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: Colors.primary[600],
    alignItems: 'center',
    justifyContent: 'center',
  },
});
