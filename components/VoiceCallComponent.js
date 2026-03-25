import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  Modal,
  SafeAreaView,
  Animated,
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Audio } from 'expo-av';
import * as Haptics from 'expo-haptics';

const { width, height } = Dimensions.get('window');

const VoiceCallComponent = ({ 
  visible, 
  onClose, 
  isIncoming = false, 
  callerName = 'Unknown',
  callerAvatar = null,
  onAccept,
  onReject,
  isActive = false 
}) => {
  const [isMuted, setIsMuted] = useState(false);
  const [isSpeakerOn, setIsSpeakerOn] = useState(false);
  const [callDuration, setCallDuration] = useState(0);
  const [isConnected, setIsConnected] = useState(isActive);
  
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const callTimerRef = useRef(null);

  useEffect(() => {
    (async () => {
      if (visible) {
        const { status } = await Audio.requestPermissionsAsync();
        if (status !== 'granted') {
          // In a real app we'd handle this better, but for now we'll just log
          console.log('Microphone permission not granted');
        }
      }
    })();
  }, [visible]);

  useEffect(() => {
    if (visible && !isConnected && !isIncoming) {
      startPulseAnimation();
    } else {
      stopPulseAnimation();
    }
  }, [visible, isConnected, isIncoming]);

  useEffect(() => {
    setIsConnected(isActive);
  }, [isActive]);

  useEffect(() => {
    if (isConnected) {
      // Start call timer
      if (!callTimerRef.current) {
        callTimerRef.current = setInterval(() => {
          setCallDuration(prev => prev + 1);
        }, 1000);
      }
      stopPulseAnimation();
    } else {
      // Clear timer
      if (callTimerRef.current) {
        clearInterval(callTimerRef.current);
        callTimerRef.current = null;
      }
    }

    return () => {
      if (callTimerRef.current) {
        clearInterval(callTimerRef.current);
      }
    };
  }, [isConnected]);

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

  const stopPulseAnimation = () => {
    pulseAnim.stopAnimation();
    pulseAnim.setValue(1);
  };

  const formatCallDuration = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const toggleMute = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setIsMuted(!isMuted);
  };

  const toggleSpeaker = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setIsSpeakerOn(!isSpeakerOn);
  };

  const acceptCall = () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setIsConnected(true);
    if (onAccept) onAccept();
  };

  const rejectCall = () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    setIsConnected(false);
    setCallDuration(0);
    if (onReject) onReject();
  };

  const endCall = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setIsConnected(false);
    setCallDuration(0);
    if (onClose) onClose();
  };

  return (
    <Modal visible={visible} animationType="slide" transparent={false}>
      <LinearGradient
        colors={['#0F172A', '#1E293B', '#334155']}
        style={styles.container}
      >
        <SafeAreaView style={styles.safeArea}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.callTypeText}>Voice Call</Text>
            <TouchableOpacity style={styles.minimizeButton} onPress={onClose}>
              <Ionicons name="chevron-down" size={24} color="#FFFFFF" />
            </TouchableOpacity>
          </View>

          {/* Caller Info */}
          <View style={styles.callerInfoContainer}>
            <Animated.View style={[
              styles.avatarContainer,
              !isConnected && { transform: [{ scale: pulseAnim }] }
            ]}>
              {callerAvatar ? (
                <Image source={{ uri: callerAvatar }} style={styles.avatar} />
              ) : (
                <View style={styles.avatarPlaceholder}>
                  <Text style={styles.avatarText}>
                    {callerName.split(' ').map(n => n[0]).join('').toUpperCase()}
                  </Text>
                </View>
              )}
            </Animated.View>
            
            <Text style={styles.callerName}>{callerName}</Text>
            <Text style={styles.callStatus}>
              {isConnected ? formatCallDuration(callDuration) : isIncoming ? 'Incoming...' : 'Calling...'}
            </Text>
          </View>

          {/* Audio Visualization (Simplified) */}
          {isConnected && (
            <View style={styles.vizContainer}>
              {[...Array(5)].map((_, i) => (
                <View key={i} style={[styles.vizBar, { height: 20 + Math.random() * 40 }]} />
              ))}
            </View>
          )}

          {/* Controls */}
          <View style={styles.controlsContainer}>
            {isIncoming && !isConnected ? (
              <View style={styles.incomingControls}>
                <TouchableOpacity 
                  style={[styles.callButton, styles.rejectButton]} 
                  onPress={rejectCall}
                >
                  <Ionicons name="call" size={32} color="#FFFFFF" style={{ transform: [{ rotate: '135deg' }] }} />
                </TouchableOpacity>
                
                <TouchableOpacity 
                  style={[styles.callButton, styles.acceptButton]} 
                  onPress={acceptCall}
                >
                  <Ionicons name="call" size={32} color="#FFFFFF" />
                </TouchableOpacity>
              </View>
            ) : (
              <View style={styles.activeControls}>
                <View style={styles.topControls}>
                  <TouchableOpacity 
                    style={[styles.controlButton, isMuted && styles.activeControl]} 
                    onPress={toggleMute}
                  >
                    <Ionicons name={isMuted ? "mic-off" : "mic"} size={24} color="#FFFFFF" />
                    <Text style={styles.controlLabel}>{isMuted ? 'Unmute' : 'Mute'}</Text>
                  </TouchableOpacity>

                  <TouchableOpacity 
                    style={[styles.controlButton, isSpeakerOn && styles.activeControl]} 
                    onPress={toggleSpeaker}
                  >
                    <Ionicons name={isSpeakerOn ? "volume-high" : "volume-medium"} size={24} color="#FFFFFF" />
                    <Text style={styles.controlLabel}>Speaker</Text>
                  </TouchableOpacity>

                  <TouchableOpacity style={styles.controlButton}>
                    <Ionicons name="add" size={24} color="#FFFFFF" />
                    <Text style={styles.controlLabel}>Add</Text>
                  </TouchableOpacity>
                </View>

                <TouchableOpacity 
                  style={[styles.callButton, styles.endCallButton]} 
                  onPress={endCall}
                >
                  <Ionicons name="call" size={32} color="#FFFFFF" style={{ transform: [{ rotate: '135deg' }] }} />
                </TouchableOpacity>
              </View>
            )}
          </View>
        </SafeAreaView>
      </LinearGradient>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 10,
  },
  callTypeText: {
    color: 'rgba(255, 255, 255, 0.6)',
    fontSize: 14,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  minimizeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  callerInfoContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarContainer: {
    width: 160,
    height: 160,
    borderRadius: 80,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 30,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  avatar: {
    width: 140,
    height: 140,
    borderRadius: 70,
  },
  avatarPlaceholder: {
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: '#4F46E5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  callerName: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 10,
  },
  callStatus: {
    fontSize: 18,
    color: 'rgba(255, 255, 255, 0.6)',
    fontWeight: '500',
  },
  vizContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 100,
    gap: 10,
  },
  vizBar: {
    width: 4,
    backgroundColor: '#4F46E5',
    borderRadius: 2,
    opacity: 0.6,
  },
  controlsContainer: {
    paddingBottom: 60,
    paddingHorizontal: 30,
  },
  incomingControls: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  activeControls: {
    alignItems: 'center',
    gap: 40,
  },
  topControls: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
  },
  controlButton: {
    alignItems: 'center',
    gap: 8,
  },
  activeControl: {
    opacity: 0.5,
  },
  controlLabel: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '500',
  },
  callButton: {
    width: 72,
    height: 72,
    borderRadius: 36,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  acceptButton: {
    backgroundColor: '#10B981',
  },
  rejectButton: {
    backgroundColor: '#EF4444',
  },
  endCallButton: {
    backgroundColor: '#EF4444',
  },
});

export default VoiceCallComponent;
