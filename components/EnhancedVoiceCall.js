import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Dimensions,
  Alert,
  Modal,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { AudioCompat } from '../utils/audioCompat';

const { width, height } = Dimensions.get('window');

export const EnhancedVoiceCall = ({ visible, onClose, participant, onCallEnd }) => {
  const [callStatus, setCallStatus] = useState('connecting'); // connecting, active, ended
  const [isMuted, setIsMuted] = useState(false);
  const [isSpeakerOn, setIsSpeakerOn] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [callDuration, setCallDuration] = useState(0);
  const [noiseReduction, setNoiseReduction] = useState(true);
  const [recording, setRecording] = useState(null);
  const [audioQuality, setAudioQuality] = useState('HD');

  // Animation refs
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const slideAnim = useRef(new Animated.Value(height)).current;
  const waveAnim = useRef(new Animated.Value(0)).current;
  
  // Timer ref
  const timerRef = useRef(null);

  useEffect(() => {
    if (visible) {
      // Slide up animation
      Animated.spring(slideAnim, {
        toValue: 0,
        tension: 50,
        friction: 8,
        useNativeDriver: true,
      }).start();

      // Start call simulation
      setTimeout(() => {
        setCallStatus('active');
        startTimer();
        startPulseAnimation();
        startWaveAnimation();
      }, 2000);

      // Request audio permissions
      requestAudioPermissions();
    } else {
      Animated.timing(slideAnim, {
        toValue: height,
        duration: 300,
        useNativeDriver: true,
      }).start();
      
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
      if (recording) {
        recording.stopAndUnloadAsync();
      }
    };
  }, [visible]);

  const requestAudioPermissions = async () => {
    try {
      const { status } = await Audio.requestPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission needed', 'Audio permission is required for voice calls');
      }
    } catch (error) {
      console.error('Error requesting audio permissions:', error);
    }
  };

  const startTimer = () => {
    timerRef.current = setInterval(() => {
      setCallDuration(prev => prev + 1);
    }, 1000);
  };

  const startPulseAnimation = () => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.2,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    ).start();
  };

  const startWaveAnimation = () => {
    Animated.loop(
      Animated.timing(waveAnim, {
        toValue: 1,
        duration: 2000,
        useNativeDriver: true,
      })
    ).start();
  };

  const formatDuration = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleMute = () => {
    setIsMuted(!isMuted);
    // In real implementation, this would mute the microphone
    Alert.alert(
      isMuted ? 'Unmuted' : 'Muted',
      isMuted ? 'Your microphone is now on' : 'Your microphone is now off'
    );
  };

  const handleSpeaker = () => {
    setIsSpeakerOn(!isSpeakerOn);
    Alert.alert(
      'Speaker',
      isSpeakerOn ? 'Speaker turned off' : 'Speaker turned on'
    );
  };

  const handleRecord = async () => {
    if (isRecording) {
      // Stop recording
      try {
        await recording.stopAndUnloadAsync();
        const uri = recording.getURI();
        setRecording(null);
        setIsRecording(false);
        Alert.alert('Recording Saved', 'Call recording has been saved to your device');
      } catch (error) {
        console.error('Error stopping recording:', error);
      }
    } else {
      // Start recording
      try {
        const { recording: newRecording } = await Audio.Recording.createAsync({
          android: {
            extension: '.m4a',
            outputFormat: Audio.RECORDING_OPTION_ANDROID_OUTPUT_FORMAT_MPEG_4,
            audioEncoder: Audio.RECORDING_OPTION_ANDROID_AUDIO_ENCODER_AAC,
            sampleRate: 44100,
            numberOfChannels: 2,
            bitRate: 128000,
          },
          ios: {
            extension: '.m4a',
            outputFormat: Audio.RECORDING_OPTION_IOS_OUTPUT_FORMAT_MPEG4AAC,
            audioQuality: Audio.RECORDING_OPTION_IOS_AUDIO_QUALITY_HIGH,
            sampleRate: 44100,
            numberOfChannels: 2,
            bitRate: 128000,
            linearPCMBitDepth: 16,
            linearPCMIsBigEndian: false,
            linearPCMIsFloat: false,
          },
        });
        setRecording(newRecording);
        setIsRecording(true);
        Alert.alert('Recording Started', 'Call is now being recorded');
      } catch (error) {
        console.error('Error starting recording:', error);
      }
    }
  };

  const handleEndCall = () => {
    Alert.alert(
      'End Call',
      'Are you sure you want to end this call?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'End Call',
          style: 'destructive',
          onPress: () => {
            setCallStatus('ended');
            if (timerRef.current) {
              clearInterval(timerRef.current);
            }
            if (recording) {
              recording.stopAndUnloadAsync();
            }
            onCallEnd?.();
            setTimeout(() => {
              onClose();
            }, 1000);
          }
        }
      ]
    );
  };

  const toggleNoiseReduction = () => {
    setNoiseReduction(!noiseReduction);
    Alert.alert(
      'Noise Reduction',
      noiseReduction ? 'Noise reduction disabled' : 'AI noise reduction enabled for crystal clear audio!'
    );
  };

  const AudioWaveform = () => {
    const waves = Array.from({ length: 5 }, (_, i) => {
      const animatedValue = waveAnim.interpolate({
        inputRange: [0, 1],
        outputRange: [10, 30 + i * 5],
      });

      return (
        <Animated.View
          key={i}
          style={[
            styles.waveBar,
            {
              height: animatedValue,
              marginHorizontal: 2,
              backgroundColor: callStatus === 'active' ? '#4CAF50' : '#666',
            }
          ]}
        />
      );
    });

    return <View style={styles.waveform}>{waves}</View>;
  };

  if (!visible) return null;

  return (
    <Modal visible={visible} transparent animationType="none">
      <View style={styles.overlay}>
        <Animated.View 
          style={[
            styles.container,
            { transform: [{ translateY: slideAnim }] }
          ]}
        >
          <LinearGradient
            colors={callStatus === 'active' ? ['#667eea', '#764ba2'] : ['#ff6b6b', '#ee5a52']}
            style={styles.gradient}
          >
            <BlurView intensity={20} style={styles.content}>
              {/* Status Bar */}
              <View style={styles.statusBar}>
                <View style={styles.statusIndicator}>
                  <View style={[
                    styles.statusDot,
                    { backgroundColor: callStatus === 'active' ? '#4CAF50' : '#ff6b6b' }
                  ]} />
                  <Text style={styles.statusText}>
                    {callStatus === 'connecting' && 'Connecting...'}
                    {callStatus === 'active' && `${audioQuality} Call • ${formatDuration(callDuration)}`}
                    {callStatus === 'ended' && 'Call Ended'}
                  </Text>
                </View>
                
                {noiseReduction && callStatus === 'active' && (
                  <View style={styles.aiIndicator}>
                    <Ionicons name="sparkles" size={14} color="#4CAF50" />
                    <Text style={styles.aiText}>AI Enhanced</Text>
                  </View>
                )}
              </View>

              {/* Participant Info */}
              <View style={styles.participantInfo}>
                <Animated.View 
                  style={[
                    styles.avatar,
                    { transform: [{ scale: pulseAnim }] }
                  ]}
                >
                  <Text style={styles.avatarText}>
                    {participant?.name?.charAt(0) || 'U'}
                  </Text>
                </Animated.View>
                
                <Text style={styles.participantName}>
                  {participant?.name || 'Unknown User'}
                </Text>
                <Text style={styles.participantRole}>
                  {participant?.userType || 'Student'} • {participant?.academicLevel || ''}
                </Text>
              </View>

              {/* Audio Visualization */}
              <View style={styles.audioVisualization}>
                <AudioWaveform />
                <Text style={styles.audioQualityText}>
                  Crystal Clear Audio {noiseReduction && '• AI Enhanced'}
                </Text>
              </View>

              {/* Call Controls */}
              <View style={styles.controls}>
                <View style={styles.primaryControls}>
                  {/* Mute */}
                  <TouchableOpacity
                    style={[styles.controlButton, isMuted && styles.controlButtonActive]}
                    onPress={handleMute}
                  >
                    <Ionicons 
                      name={isMuted ? "mic-off" : "mic"} 
                      size={24} 
                      color={isMuted ? "#fff" : "#333"} 
                    />
                  </TouchableOpacity>

                  {/* End Call */}
                  <TouchableOpacity
                    style={styles.endCallButton}
                    onPress={handleEndCall}
                  >
                    <Ionicons name="call" size={32} color="#fff" />
                  </TouchableOpacity>

                  {/* Speaker */}
                  <TouchableOpacity
                    style={[styles.controlButton, isSpeakerOn && styles.controlButtonActive]}
                    onPress={handleSpeaker}
                  >
                    <Ionicons 
                      name={isSpeakerOn ? "volume-high" : "volume-medium"} 
                      size={24} 
                      color={isSpeakerOn ? "#fff" : "#333"} 
                    />
                  </TouchableOpacity>
                </View>

                {/* Secondary Controls */}
                <View style={styles.secondaryControls}>
                  {/* Record */}
                  <TouchableOpacity
                    style={[styles.secondaryButton, isRecording && styles.recordingActive]}
                    onPress={handleRecord}
                  >
                    <Ionicons 
                      name={isRecording ? "stop-circle" : "radio-button-on"} 
                      size={20} 
                      color={isRecording ? "#fff" : "#666"} 
                    />
                    <Text style={[styles.secondaryButtonText, isRecording && styles.recordingText]}>
                      {isRecording ? 'Stop Rec' : 'Record'}
                    </Text>
                  </TouchableOpacity>

                  {/* Noise Reduction */}
                  <TouchableOpacity
                    style={[styles.secondaryButton, noiseReduction && styles.aiActive]}
                    onPress={toggleNoiseReduction}
                  >
                    <Ionicons 
                      name="sparkles" 
                      size={20} 
                      color={noiseReduction ? "#fff" : "#666"} 
                    />
                    <Text style={[styles.secondaryButtonText, noiseReduction && styles.aiText]}>
                      AI Audio
                    </Text>
                  </TouchableOpacity>

                  {/* Video Call (Future) */}
                  <TouchableOpacity
                    style={styles.secondaryButton}
                    onPress={() => Alert.alert('Coming Soon', 'Video calling feature coming soon!')}
                  >
                    <Ionicons name="videocam-outline" size={20} color="#666" />
                    <Text style={styles.secondaryButtonText}>Video</Text>
                  </TouchableOpacity>
                </View>
              </View>

              {/* Call Quality Indicator */}
              <View style={styles.qualityIndicator}>
                <View style={styles.qualityBars}>
                  {Array.from({ length: 4 }, (_, i) => (
                    <View
                      key={i}
                      style={[
                        styles.qualityBar,
                        { backgroundColor: i < 3 ? '#4CAF50' : '#ddd' }
                      ]}
                    />
                  ))}
                </View>
                <Text style={styles.qualityText}>Excellent Connection</Text>
              </View>
            </BlurView>
          </LinearGradient>
        </Animated.View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
  },
  container: {
    flex: 1,
    marginTop: 50,
  },
  gradient: {
    flex: 1,
    borderTopLeftRadius: 25,
    borderTopRightRadius: 25,
  },
  content: {
    flex: 1,
    padding: 30,
    justifyContent: 'space-between',
  },
  statusBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  statusIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 8,
  },
  statusText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '500',
  },
  aiIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(76, 175, 80, 0.2)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  aiText: {
    color: '#4CAF50',
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 4,
  },
  participantInfo: {
    alignItems: 'center',
    marginVertical: 40,
  },
  avatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    borderWidth: 3,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  avatarText: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#fff',
  },
  participantName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 8,
  },
  participantRole: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  audioVisualization: {
    alignItems: 'center',
    marginVertical: 30,
  },
  waveform: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'center',
    height: 40,
    marginBottom: 15,
  },
  waveBar: {
    width: 4,
    borderRadius: 2,
  },
  audioQualityText: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 14,
    fontWeight: '500',
  },
  controls: {
    alignItems: 'center',
  },
  primaryControls: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 30,
  },
  controlButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 20,
  },
  controlButtonActive: {
    backgroundColor: '#ff6b6b',
  },
  endCallButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#ff6b6b',
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 20,
    transform: [{ rotate: '135deg' }],
  },
  secondaryControls: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
  },
  secondaryButton: {
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  secondaryButtonText: {
    color: '#666',
    fontSize: 12,
    marginTop: 4,
    fontWeight: '500',
  },
  recordingActive: {
    backgroundColor: '#ff6b6b',
  },
  recordingText: {
    color: '#fff',
  },
  aiActive: {
    backgroundColor: 'rgba(76, 175, 80, 0.3)',
  },
  qualityIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 20,
  },
  qualityBars: {
    flexDirection: 'row',
    marginRight: 8,
  },
  qualityBar: {
    width: 3,
    height: 12,
    marginHorizontal: 1,
    borderRadius: 1.5,
  },
  qualityText: {
    color: 'rgba(255, 255, 255, 0.7)',
    fontSize: 12,
  },
});

export default EnhancedVoiceCall;
