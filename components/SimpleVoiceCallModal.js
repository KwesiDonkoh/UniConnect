import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Dimensions,
  Modal,
  Image,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors } from '../themes/modernTheme';
import simpleCallingService from '../services/simpleCallingService';

const { width, height } = Dimensions.get('window');

export default function SimpleVoiceCallModal({ 
  visible, 
  onClose, 
  callData, 
  isIncoming = false,
  onAccept,
  onReject 
}) {
  const [callStatus, setCallStatus] = useState(callData?.status || 'ringing');
  const [isMuted, setIsMuted] = useState(false);
  const [isSpeakerOn, setIsSpeakerOn] = useState(false);
  const [callDuration, setCallDuration] = useState(0);

  // Animation refs
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const slideAnim = useRef(new Animated.Value(height)).current;
  const avatarScale = useRef(new Animated.Value(0.8)).current;
  
  // Timer ref
  const timerRef = useRef(null);

  useEffect(() => {
    if (visible) {
      // Slide up animation
      Animated.parallel([
        Animated.spring(slideAnim, {
          toValue: 0,
          tension: 100,
          friction: 8,
          useNativeDriver: true,
        }),
        Animated.spring(avatarScale, {
          toValue: 1,
          tension: 100,
          friction: 8,
          useNativeDriver: true,
        }),
      ]).start();

      // Start pulse animation for ringing
      if (callStatus === 'ringing') {
        startPulseAnimation();
      }
    } else {
      // Slide down animation
      Animated.timing(slideAnim, {
        toValue: height,
        duration: 300,
        useNativeDriver: true,
      }).start();
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [visible, callStatus]);

  useEffect(() => {
    if (callStatus === 'connected') {
      startCallTimer();
      stopPulseAnimation();
    } else if (callStatus === 'ended' || callStatus === 'rejected') {
      stopCallTimer();
      stopPulseAnimation();
      setTimeout(() => onClose(), 1000);
    }
  }, [callStatus]);

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

  const startCallTimer = () => {
    timerRef.current = setInterval(() => {
      setCallDuration(prev => prev + 1);
    }, 1000);
  };

  const stopCallTimer = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  };

  const formatDuration = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleAccept = async () => {
    if (isIncoming && callData?.id) {
      const result = await simpleCallingService.acceptCall(callData.id);
      if (result.success) {
        setCallStatus('connected');
        if (onAccept) onAccept();
      } else {
        Alert.alert('Error', 'Failed to accept call');
      }
    }
  };

  const handleReject = async () => {
    if (callData?.id) {
      const result = await simpleCallingService.rejectCall(callData.id);
      if (result.success) {
        setCallStatus('rejected');
        if (onReject) onReject();
      }
    }
  };

  const handleEndCall = async () => {
    if (callData?.id) {
      const result = await simpleCallingService.endCall(callData.id);
      if (result.success) {
        setCallStatus('ended');
      }
    }
  };

  const toggleMute = async () => {
    const result = await simpleCallingService.toggleMute();
    if (result.success) {
      setIsMuted(result.muted);
    }
  };

  const toggleSpeaker = async () => {
    const result = await simpleCallingService.toggleSpeaker();
    if (result.success) {
      setIsSpeakerOn(result.speakerOn);
    }
  };

  const getStatusText = () => {
    switch (callStatus) {
      case 'ringing':
        return isIncoming ? 'Incoming call...' : 'Calling...';
      case 'connected':
        return formatDuration(callDuration);
      case 'ended':
        return 'Call ended';
      case 'rejected':
        return 'Call declined';
      default:
        return 'Connecting...';
    }
  };

  const getStatusColor = () => {
    switch (callStatus) {
      case 'connected':
        return Colors.success[500];
      case 'ended':
      case 'rejected':
        return Colors.error[500];
      default:
        return Colors.primary[500];
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      onRequestClose={onClose}
    >
      <View style={styles.container}>
        <Animated.View
          style={[
            styles.callModal,
            {
              transform: [{ translateY: slideAnim }],
            },
          ]}
        >
          <LinearGradient
            colors={[Colors.primary[400], Colors.primary[700]]}
            style={styles.gradient}
          >
            {/* Header */}
            <View style={styles.header}>
              <Text style={styles.callType}>Voice Call</Text>
              <TouchableOpacity onPress={onClose} style={styles.minimizeButton}>
                <Ionicons name="remove" size={24} color="white" />
              </TouchableOpacity>
            </View>

            {/* Caller Info */}
            <View style={styles.callerInfo}>
              <Animated.View
                style={[
                  styles.avatarContainer,
                  {
                    transform: [
                      { scale: avatarScale },
                      { scale: pulseAnim },
                    ],
                  },
                ]}
              >
                <Image
                  source={{ 
                    uri: callData?.receiverAvatar || callData?.callerAvatar || 'https://i.pravatar.cc/150?img=1' 
                  }}
                  style={styles.avatar}
                />
                {callStatus === 'connected' && (
                  <View style={styles.connectedIndicator}>
                    <Ionicons name="checkmark" size={16} color="white" />
                  </View>
                )}
              </Animated.View>

              <Text style={styles.callerName}>
                {callData?.receiverName || callData?.callerName || 'Unknown'}
              </Text>
              
              <Text style={[styles.callStatus, { color: getStatusColor() }]}>
                {getStatusText()}
              </Text>
            </View>

            {/* Call Controls */}
            <View style={styles.controls}>
              {callStatus === 'connected' && (
                <View style={styles.activeControls}>
                  <TouchableOpacity
                    style={[
                      styles.controlButton,
                      { backgroundColor: isMuted ? Colors.error[500] : 'rgba(255,255,255,0.2)' }
                    ]}
                    onPress={toggleMute}
                  >
                    <Ionicons 
                      name={isMuted ? 'mic-off' : 'mic'} 
                      size={24} 
                      color="white" 
                    />
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[
                      styles.controlButton,
                      { backgroundColor: isSpeakerOn ? Colors.primary[600] : 'rgba(255,255,255,0.2)' }
                    ]}
                    onPress={toggleSpeaker}
                  >
                    <Ionicons 
                      name={isSpeakerOn ? 'volume-high' : 'volume-medium'} 
                      size={24} 
                      color="white" 
                    />
                  </TouchableOpacity>
                </View>
              )}

              <View style={styles.mainControls}>
                {isIncoming && callStatus === 'ringing' ? (
                  <>
                    <TouchableOpacity
                      style={[styles.actionButton, styles.rejectButton]}
                      onPress={handleReject}
                    >
                      <Ionicons name="call" size={28} color="white" />
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={[styles.actionButton, styles.acceptButton]}
                      onPress={handleAccept}
                    >
                      <Ionicons name="call" size={28} color="white" />
                    </TouchableOpacity>
                  </>
                ) : (
                  <TouchableOpacity
                    style={[styles.actionButton, styles.endButton]}
                    onPress={handleEndCall}
                    disabled={callStatus === 'ended' || callStatus === 'rejected'}
                  >
                    <Ionicons name="call" size={28} color="white" />
                  </TouchableOpacity>
                )}
              </View>
            </View>
          </LinearGradient>
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.8)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  callModal: {
    width: width * 0.9,
    height: height * 0.7,
    borderRadius: 30,
    overflow: 'hidden',
  },
  gradient: {
    flex: 1,
    padding: 30,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 40,
  },
  callType: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
    opacity: 0.9,
  },
  minimizeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  callerInfo: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: 30,
  },
  avatar: {
    width: 150,
    height: 150,
    borderRadius: 75,
    borderWidth: 4,
    borderColor: 'white',
  },
  connectedIndicator: {
    position: 'absolute',
    bottom: 10,
    right: 10,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.success[500],
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: 'white',
  },
  callerName: {
    color: 'white',
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 10,
  },
  callStatus: {
    fontSize: 16,
    fontWeight: '500',
    textAlign: 'center',
  },
  controls: {
    alignItems: 'center',
  },
  activeControls: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 30,
    gap: 20,
  },
  controlButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
  },
  mainControls: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 40,
  },
  actionButton: {
    width: 70,
    height: 70,
    borderRadius: 35,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  acceptButton: {
    backgroundColor: Colors.success[500],
  },
  rejectButton: {
    backgroundColor: Colors.error[500],
  },
  endButton: {
    backgroundColor: Colors.error[500],
  },
});
