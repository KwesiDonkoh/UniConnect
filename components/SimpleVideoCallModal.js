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

export default function SimpleVideoCallModal({ 
  visible, 
  onClose, 
  callData, 
  isIncoming = false,
  onAccept,
  onReject 
}) {
  const [callStatus, setCallStatus] = useState(callData?.status || 'ringing');
  const [isMuted, setIsMuted] = useState(false);
  const [isCameraOff, setIsCameraOff] = useState(false);
  const [callDuration, setCallDuration] = useState(0);

  // Animation refs
  const slideAnim = useRef(new Animated.Value(height)).current;
  const controlsOpacity = useRef(new Animated.Value(1)).current;
  
  // Timer ref
  const timerRef = useRef(null);

  useEffect(() => {
    if (visible) {
      // Slide up animation
      Animated.spring(slideAnim, {
        toValue: 0,
        tension: 100,
        friction: 8,
        useNativeDriver: true,
      }).start();

      // Auto-hide controls after 3 seconds
      const hideTimer = setTimeout(() => {
        hideControls();
      }, 3000);

      return () => clearTimeout(hideTimer);
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
  }, [visible]);

  useEffect(() => {
    if (callStatus === 'connected') {
      startCallTimer();
    } else if (callStatus === 'ended' || callStatus === 'rejected') {
      stopCallTimer();
      setTimeout(() => onClose(), 1000);
    }
  }, [callStatus]);

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

  const hideControls = () => {
    Animated.timing(controlsOpacity, {
      toValue: 0,
      duration: 300,
      useNativeDriver: true,
    }).start();
  };

  const showControls = () => {
    Animated.timing(controlsOpacity, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
    }).start();

    // Auto-hide after 3 seconds
    setTimeout(() => {
      hideControls();
    }, 3000);
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

  const toggleCamera = () => {
    setIsCameraOff(!isCameraOff);
  };

  const getStatusText = () => {
    switch (callStatus) {
      case 'ringing':
        return isIncoming ? 'Incoming video call...' : 'Calling...';
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

  return (
    <Modal
      visible={visible}
      transparent={false}
      animationType="none"
      onRequestClose={onClose}
    >
      <Animated.View
        style={[
          styles.container,
          {
            transform: [{ translateY: slideAnim }],
          },
        ]}
      >
        <TouchableOpacity
          style={styles.videoContainer}
          activeOpacity={1}
          onPress={showControls}
        >
          {callStatus === 'connected' && !isCameraOff ? (
            // Simulated video view
            <LinearGradient
              colors={[Colors.primary[300], Colors.primary[600]]}
              style={styles.simulatedVideo}
            >
              <Ionicons name="videocam" size={80} color="white" />
              <Text style={styles.simulatedText}>Video Call Active</Text>
              <Text style={styles.simulatedSubtext}>Camera simulation</Text>
            </LinearGradient>
          ) : (
            <LinearGradient
              colors={[Colors.primary[400], Colors.primary[700]]}
              style={styles.placeholderVideo}
            >
              <Image
                source={{ 
                  uri: callData?.receiverAvatar || callData?.callerAvatar || 'https://i.pravatar.cc/150?img=1' 
                }}
                style={styles.placeholderAvatar}
              />
              <Text style={styles.placeholderName}>
                {callData?.receiverName || callData?.callerName || 'Unknown'}
              </Text>
              <Text style={styles.placeholderStatus}>
                {getStatusText()}
              </Text>
            </LinearGradient>
          )}

          {/* Self video preview (simulated) */}
          {callStatus === 'connected' && !isCameraOff && (
            <View style={styles.selfVideoPreview}>
              <LinearGradient
                colors={[Colors.secondary[400], Colors.secondary[600]]}
                style={styles.selfVideoGradient}
              >
                <Ionicons name="person" size={30} color="white" />
                <Text style={styles.selfVideoText}>You</Text>
              </LinearGradient>
            </View>
          )}
        </TouchableOpacity>

        {/* Controls Overlay */}
        <Animated.View
          style={[
            styles.controlsOverlay,
            { opacity: controlsOpacity },
          ]}
        >
          {/* Top Controls */}
          <LinearGradient
            colors={['rgba(0,0,0,0.6)', 'transparent']}
            style={styles.topControls}
          >
            <View style={styles.topControlsContent}>
              <Text style={styles.callInfo}>
                {callData?.receiverName || callData?.callerName || 'Unknown'}
              </Text>
              <TouchableOpacity onPress={onClose} style={styles.minimizeButton}>
                <Ionicons name="chevron-down" size={24} color="white" />
              </TouchableOpacity>
            </View>
          </LinearGradient>

          {/* Bottom Controls */}
          <LinearGradient
            colors={['transparent', 'rgba(0,0,0,0.8)']}
            style={styles.bottomControls}
          >
            {callStatus === 'connected' && (
              <View style={styles.activeVideoControls}>
                <TouchableOpacity
                  style={[
                    styles.videoControlButton,
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
                    styles.videoControlButton,
                    { backgroundColor: isCameraOff ? Colors.error[500] : 'rgba(255,255,255,0.2)' }
                  ]}
                  onPress={toggleCamera}
                >
                  <Ionicons 
                    name={isCameraOff ? 'videocam-off' : 'videocam'} 
                    size={24} 
                    color="white" 
                  />
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.videoControlButton, { backgroundColor: 'rgba(255,255,255,0.2)' }]}
                  onPress={() => Alert.alert('Info', 'Camera switch simulated')}
                >
                  <Ionicons name="camera-reverse" size={24} color="white" />
                </TouchableOpacity>
              </View>
            )}

            <View style={styles.mainVideoControls}>
              {isIncoming && callStatus === 'ringing' ? (
                <>
                  <TouchableOpacity
                    style={[styles.videoActionButton, styles.rejectButton]}
                    onPress={handleReject}
                  >
                    <Ionicons name="call" size={28} color="white" />
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[styles.videoActionButton, styles.acceptButton]}
                    onPress={handleAccept}
                  >
                    <Ionicons name="videocam" size={28} color="white" />
                  </TouchableOpacity>
                </>
              ) : (
                <TouchableOpacity
                  style={[styles.videoActionButton, styles.endButton]}
                  onPress={handleEndCall}
                  disabled={callStatus === 'ended' || callStatus === 'rejected'}
                >
                  <Ionicons name="call" size={28} color="white" />
                </TouchableOpacity>
              )}
            </View>
          </LinearGradient>
        </Animated.View>
      </Animated.View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'black',
  },
  videoContainer: {
    flex: 1,
  },
  simulatedVideo: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  simulatedText: {
    color: 'white',
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 20,
  },
  simulatedSubtext: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 16,
    marginTop: 10,
  },
  placeholderVideo: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderAvatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 3,
    borderColor: 'white',
    marginBottom: 20,
  },
  placeholderName: {
    color: 'white',
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  placeholderStatus: {
    color: 'white',
    fontSize: 16,
    opacity: 0.8,
  },
  selfVideoPreview: {
    position: 'absolute',
    top: 60,
    right: 20,
    width: 120,
    height: 160,
    borderRadius: 15,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: 'white',
  },
  selfVideoGradient: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  selfVideoText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
    marginTop: 5,
  },
  controlsOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'space-between',
  },
  topControls: {
    paddingTop: 50,
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  topControlsContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  callInfo: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
  },
  minimizeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  bottomControls: {
    paddingBottom: 50,
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  activeVideoControls: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 30,
    gap: 20,
  },
  videoControlButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
  },
  mainVideoControls: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 40,
  },
  videoActionButton: {
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
