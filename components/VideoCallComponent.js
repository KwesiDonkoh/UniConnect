import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  Alert,
  Modal,
  SafeAreaView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { CameraView } from 'expo-camera';
import { LinearGradient } from 'expo-linear-gradient';

const { width, height } = Dimensions.get('window');

const VideoCallComponent = ({ 
  visible, 
  onClose, 
  isIncoming = false, 
  callerName = 'Unknown',
  onAccept,
  onReject,
  isActive = false 
}) => {
  const [hasPermission, setHasPermission] = useState(null);
  const [cameraType, setCameraType] = useState('front');
  const [isMuted, setIsMuted] = useState(false);
  const [isCameraOff, setIsCameraOff] = useState(false);
  const [callDuration, setCallDuration] = useState(0);
  const [isConnected, setIsConnected] = useState(false);
  
  const cameraRef = useRef(null);
  const callTimerRef = useRef(null);

  useEffect(() => {
    (async () => {
      const { status } = await Camera.requestCameraPermissionsAsync();
      setHasPermission(status === 'granted');
    })();
  }, []);

  useEffect(() => {
    if (isActive && isConnected) {
      // Start call timer
      callTimerRef.current = setInterval(() => {
        setCallDuration(prev => prev + 1);
      }, 1000);
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
  }, [isActive, isConnected]);

  const formatCallDuration = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const toggleMute = () => {
    setIsMuted(!isMuted);
    // Here you would integrate with your audio system
  };

  const toggleCamera = () => {
    setIsCameraOff(!isCameraOff);
  };

  const flipCamera = () => {
    setCameraType(
      cameraType === 'back' ? 'front' : 'back'
    );
  };

  const acceptCall = async () => {
    if (hasPermission) {
      setIsConnected(true);
      if (onAccept) onAccept();
    } else {
      Alert.alert(
        'Camera Permission Required',
        'Please grant camera permission to make video calls.',
        [
          { text: 'Cancel', style: 'cancel' },
          { 
            text: 'Settings', 
            onPress: () => {
              // Navigate to app settings
            }
          }
        ]
      );
    }
  };

  const rejectCall = () => {
    setIsConnected(false);
    setCallDuration(0);
    if (onReject) onReject();
  };

  const endCall = () => {
    setIsConnected(false);
    setCallDuration(0);
    if (onClose) onClose();
  };

  if (hasPermission === null) {
    return null; // Still loading
  }

  if (hasPermission === false) {
    return (
      <Modal visible={visible} animationType="slide">
        <SafeAreaView style={styles.container}>
          <View style={styles.permissionContainer}>
            <Ionicons name="camera-off" size={64} color="#EF4444" />
            <Text style={styles.permissionTitle}>Camera Permission Required</Text>
            <Text style={styles.permissionText}>
              To make video calls, please grant camera permission in your device settings.
            </Text>
            <TouchableOpacity style={styles.closeButton} onPress={onClose}>
              <Text style={styles.closeButtonText}>Close</Text>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </Modal>
    );
  }

  return (
    <Modal visible={visible} animationType="slide">
      <SafeAreaView style={styles.container}>
        {/* Camera View */}
        <View style={styles.cameraContainer}>
          {!isCameraOff ? (
            <CameraView 
              ref={cameraRef}
              style={styles.camera} 
              facing={cameraType}
              ratio="16:9"
            >
              {/* Remote video placeholder */}
              <View style={styles.remoteVideoContainer}>
                <LinearGradient
                  colors={['rgba(0,0,0,0.7)', 'rgba(0,0,0,0.3)']}
                  style={styles.remoteVideoPlaceholder}
                >
                  <View style={styles.remoteAvatar}>
                    <Text style={styles.remoteAvatarText}>
                      {callerName.split(' ').map(n => n[0]).join('').toUpperCase()}
                    </Text>
                  </View>
                  <Text style={styles.remoteCallerName}>{callerName}</Text>
                  {isConnected && (
                    <Text style={styles.callDurationText}>
                      {formatCallDuration(callDuration)}
                    </Text>
                  )}
                </LinearGradient>
              </View>

              {/* Local video (small overlay) */}
              <View style={styles.localVideoContainer}>
                <View style={styles.localVideo}>
                  <View style={styles.localAvatar}>
                    <Ionicons name="person" size={20} color="#FFFFFF" />
                  </View>
                </View>
              </View>

              {/* Call Status Overlay */}
              {!isConnected && !isIncoming && (
                <View style={styles.statusOverlay}>
                  <Text style={styles.statusText}>Calling...</Text>
                  <View style={styles.pulsingDot} />
                </View>
              )}
            </CameraView>
          ) : (
            <View style={styles.cameraOffContainer}>
              <LinearGradient
                colors={['#1E293B', '#374151']}
                style={styles.cameraOffBackground}
              >
                <Ionicons name="videocam-off" size={64} color="#FFFFFF" />
                <Text style={styles.cameraOffText}>Camera is off</Text>
                <Text style={styles.callerNameText}>{callerName}</Text>
                {isConnected && (
                  <Text style={styles.callDurationText}>
                    {formatCallDuration(callDuration)}
                  </Text>
                )}
              </LinearGradient>
            </View>
          )}
        </View>

        {/* Call Controls */}
        <View style={styles.controlsContainer}>
          {isIncoming && !isConnected ? (
            // Incoming call controls
            <View style={styles.incomingCallControls}>
              <TouchableOpacity 
                style={[styles.callButton, styles.rejectButton]}
                onPress={rejectCall}
              >
                <Ionicons name="call" size={28} color="#FFFFFF" style={{ transform: [{ rotate: '135deg' }] }} />
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[styles.callButton, styles.acceptButton]}
                onPress={acceptCall}
              >
                <Ionicons name="videocam" size={28} color="#FFFFFF" />
              </TouchableOpacity>
            </View>
          ) : (
            // Active call controls
            <View style={styles.activeCallControls}>
              <TouchableOpacity 
                style={[styles.controlButton, isMuted && styles.activeControlButton]}
                onPress={toggleMute}
              >
                <Ionicons 
                  name={isMuted ? "mic-off" : "mic"} 
                  size={24} 
                  color={isMuted ? "#EF4444" : "#FFFFFF"} 
                />
              </TouchableOpacity>

              <TouchableOpacity 
                style={[styles.controlButton, isCameraOff && styles.activeControlButton]}
                onPress={toggleCamera}
              >
                <Ionicons 
                  name={isCameraOff ? "videocam-off" : "videocam"} 
                  size={24} 
                  color={isCameraOff ? "#EF4444" : "#FFFFFF"} 
                />
              </TouchableOpacity>

              <TouchableOpacity 
                style={styles.controlButton}
                onPress={flipCamera}
              >
                <Ionicons name="camera-reverse" size={24} color="#FFFFFF" />
              </TouchableOpacity>

              <TouchableOpacity 
                style={[styles.callButton, styles.endCallButton]}
                onPress={endCall}
              >
                <Ionicons name="call" size={28} color="#FFFFFF" style={{ transform: [{ rotate: '135deg' }] }} />
              </TouchableOpacity>
            </View>
          )}
        </View>

        {/* Call Info */}
        {!isIncoming && (
          <View style={styles.callInfoContainer}>
            <Text style={styles.callStatusText}>
              {isConnected ? 'Connected' : 'Connecting...'}
            </Text>
          </View>
        )}
      </SafeAreaView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  cameraContainer: {
    flex: 1,
  },
  camera: {
    flex: 1,
  },
  remoteVideoContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  remoteVideoPlaceholder: {
    flex: 1,
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  remoteAvatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#6366F1',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  remoteAvatarText: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  remoteCallerName: {
    fontSize: 24,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  callDurationText: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.8)',
    fontFamily: 'monospace',
  },
  localVideoContainer: {
    position: 'absolute',
    top: 60,
    right: 20,
    width: 120,
    height: 160,
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  localVideo: {
    flex: 1,
    backgroundColor: '#374151',
    justifyContent: 'center',
    alignItems: 'center',
  },
  localAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#6366F1',
    justifyContent: 'center',
    alignItems: 'center',
  },
  statusOverlay: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: [{ translateX: -50 }, { translateY: -50 }],
    alignItems: 'center',
  },
  statusText: {
    fontSize: 18,
    color: '#FFFFFF',
    fontWeight: '500',
    marginBottom: 8,
  },
  pulsingDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#10B981',
  },
  cameraOffContainer: {
    flex: 1,
  },
  cameraOffBackground: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cameraOffText: {
    fontSize: 18,
    color: '#FFFFFF',
    marginTop: 16,
    marginBottom: 8,
  },
  callerNameText: {
    fontSize: 24,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  controlsContainer: {
    paddingBottom: 40,
  },
  incomingCallControls: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingHorizontal: 60,
  },
  activeCallControls: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  callButton: {
    width: 70,
    height: 70,
    borderRadius: 35,
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
  controlButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  activeControlButton: {
    backgroundColor: 'rgba(239, 68, 68, 0.2)',
  },
  callInfoContainer: {
    position: 'absolute',
    top: 100,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  callStatusText: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.8)',
    fontWeight: '500',
  },
  permissionContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
    backgroundColor: '#F8FAFC',
  },
  permissionTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1E293B',
    marginTop: 20,
    marginBottom: 12,
  },
  permissionText: {
    fontSize: 16,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 30,
  },
  closeButton: {
    backgroundColor: '#6366F1',
    paddingHorizontal: 32,
    paddingVertical: 12,
    borderRadius: 8,
  },
  closeButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});

export default VideoCallComponent;
