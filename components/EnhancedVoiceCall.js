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
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import AudioCompat from '../utils/audioCompat';

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
  const [isVideoMode, setIsVideoMode] = useState(false);

  // Animation refs
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const slideAnim = useRef(new Animated.Value(height)).current;
  const waveAnim = useRef(new Animated.Value(0)).current;
  
  // Timer ref
  const timerRef = useRef(null);

  useEffect(() => {
    if (visible) {
      Animated.spring(slideAnim, {
        toValue: 0,
        tension: 50,
        friction: 8,
        useNativeDriver: true,
      }).start();

      setTimeout(() => {
        setCallStatus('active');
        startTimer();
        startPulseAnimation();
        startWaveAnimation();
      }, 2000);

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
    };
  }, [visible]);

  const requestAudioPermissions = async () => {
    try {
      const { status } = await AudioCompat.requestPermissionsAsync();
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
        Animated.timing(pulseAnim, { toValue: 1.2, duration: 1000, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 1, duration: 1000, useNativeDriver: true }),
      ])
    ).start();
  };

  const startWaveAnimation = () => {
    Animated.loop(
      Animated.timing(waveAnim, { toValue: 1, duration: 2000, useNativeDriver: true })
    ).start();
  };

  const formatDuration = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleMute = () => setIsMuted(!isMuted);
  const handleSpeaker = () => setIsSpeakerOn(!isSpeakerOn);
  const handleVideoToggle = () => setIsVideoMode(!isVideoMode);

  const handleRecord = () => {
    setIsRecording(!isRecording);
    Alert.alert(isRecording ? 'Recording Stopped' : 'Recording Started');
  };

  const toggleNoiseReduction = () => setNoiseReduction(!noiseReduction);

  const handleEndCall = () => {
    setCallStatus('ended');
    if (timerRef.current) clearInterval(timerRef.current);
    onCallEnd?.();
    setTimeout(() => onClose(), 1000);
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
          style={[styles.waveBar, { height: animatedValue, marginHorizontal: 2, backgroundColor: callStatus === 'active' ? '#4CAF50' : '#666' }]}
        />
      );
    });
    return <View style={styles.waveform}>{waves}</View>;
  };

  const VideoScreen = () => (
    <View style={styles.videoContainer}>
      <BlurView intensity={60} tint="dark" style={StyleSheet.absoluteFill}>
        <View style={styles.remoteVideo}>
          <View style={styles.videoAvatarPlaceholder}>
            <Text style={styles.videoAvatarText}>{participant?.name?.[0] || 'U'}</Text>
          </View>
          <View style={styles.videoOverlay}>
            <Text style={styles.videoName}>{participant?.name || 'Unknown'}</Text>
            <View style={styles.liveBadge}><Text style={styles.liveText}>LIVE HD</Text></View>
          </View>
        </View>
        <View style={styles.selfVideo}>
          <Ionicons name="person" size={40} color="#666" />
          <View style={styles.selfVideoTag}><Text style={styles.selfVideoText}>You</Text></View>
        </View>
      </BlurView>
    </View>
  );

  if (!visible) return null;

  return (
    <Modal visible={visible} transparent animationType="none">
      <View style={styles.overlay}>
        <Animated.View style={[styles.container, { transform: [{ translateY: slideAnim }] }]}>
          <LinearGradient
            colors={isVideoMode ? ['#000', '#1a1a1a'] : (callStatus === 'active' ? ['#667eea', '#764ba2'] : ['#ff6b6b', '#ee5a52'])}
            style={styles.gradient}
          >
            {isVideoMode ? <VideoScreen /> : (
              <BlurView intensity={20} style={styles.content}>
                <View style={styles.statusBar}>
                  <View style={styles.statusIndicator}>
                    <View style={[styles.statusDot, { backgroundColor: callStatus === 'active' ? '#4CAF50' : '#ff6b6b' }]} />
                    <Text style={styles.statusText}>
                      {callStatus === 'connecting' && 'Connecting...'}
                      {callStatus === 'active' && `${audioQuality} Call • ${formatDuration(callDuration)}`}
                      {callStatus === 'ended' && 'Call Ended'}
                    </Text>
                  </View>
                  {noiseReduction && <View style={styles.aiIndicator}><Ionicons name="sparkles" size={14} color="#4CAF50" /><Text style={styles.aiText}>AI Enhanced</Text></View>}
                </View>

                <View style={styles.participantInfo}>
                  <Animated.View style={[styles.avatar, { transform: [{ scale: pulseAnim }] }]}>
                    <Text style={styles.avatarText}>{participant?.name?.[0] || 'U'}</Text>
                  </Animated.View>
                  <Text style={styles.participantName}>{participant?.name || 'Unknown'}</Text>
                  <Text style={styles.participantRole}>{participant?.username || 'Student'}</Text>
                </View>

                <View style={styles.audioVisualization}>
                  <AudioWaveform />
                  <Text style={styles.audioQualityText}>Crystal Clear Audio {noiseReduction && '• AI Enhanced'}</Text>
                </View>
              </BlurView>
            )}

            <View style={[styles.controls, isVideoMode && styles.videoControls]}>
              <View style={styles.primaryControls}>
                <TouchableOpacity style={[styles.controlButton, isMuted && styles.controlBtnActive]} onPress={handleMute}>
                  <Ionicons name={isMuted ? "mic-off" : "mic"} size={26} color={isMuted ? "#FFF" : "#333"} />
                </TouchableOpacity>
                <TouchableOpacity style={styles.endCallButton} onPress={handleEndCall}>
                  <Ionicons name="call" size={36} color="#fff" />
                </TouchableOpacity>
                <TouchableOpacity style={[styles.controlButton, isVideoMode && styles.videoActive]} onPress={handleVideoToggle}>
                  <Ionicons name={isVideoMode ? "videocam" : "videocam-outline"} size={26} color={isVideoMode ? "#FFF" : "#333"} />
                </TouchableOpacity>
              </View>

              {!isVideoMode && (
                <View style={styles.secondaryControls}>
                  <TouchableOpacity style={[styles.secBtn, isRecording && styles.recActive]} onPress={handleRecord}>
                    <Ionicons name={isRecording ? "stop-circle" : "radio-button-on"} size={20} color={isRecording ? "#FFF" : "#666"} />
                    <Text style={[styles.secBtnText, isRecording && styles.whiteText]}>{isRecording ? "Stop" : "Rec"}</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={[styles.secBtn, noiseReduction && styles.aiActive]} onPress={toggleNoiseReduction}>
                    <Ionicons name="sparkles" size={20} color={noiseReduction ? "#FFF" : "#666"} />
                    <Text style={[styles.secBtnText, noiseReduction && styles.whiteText]}>AI Audio</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.secBtn} onPress={handleSpeaker}>
                    <Ionicons name={isSpeakerOn ? "volume-high" : "volume-medium"} size={20} color={isSpeakerOn ? "#4CAF50" : "#666"} />
                    <Text style={styles.secBtnText}>Speaker</Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>
          </LinearGradient>
        </Animated.View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.9)' },
  container: { flex: 1, marginTop: 40 },
  gradient: { flex: 1, borderTopLeftRadius: 35, borderTopRightRadius: 35, overflow: 'hidden' },
  content: { flex: 1, padding: 30, justifyContent: 'space-between', paddingBottom: 120 },
  videoContainer: { flex: 1 },
  remoteVideo: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  videoAvatarPlaceholder: { width: 140, height: 140, borderRadius: 70, backgroundColor: 'rgba(255,255,255,0.1)', justifyContent: 'center', alignItems: 'center' },
  videoAvatarText: { fontSize: 60, fontWeight: '900', color: '#FFF' },
  videoOverlay: { position: 'absolute', bottom: 180, alignItems: 'center' },
  videoName: { color: '#FFF', fontSize: 24, fontWeight: '900' },
  liveBadge: { backgroundColor: '#EF4444', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 6, marginTop: 10 },
  liveText: { color: '#FFF', fontSize: 10, fontWeight: '900' },
  selfVideo: { position: 'absolute', top: 30, right: 20, width: 90, height: 130, borderRadius: 12, backgroundColor: 'rgba(0,0,0,0.5)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.3)', justifyContent: 'center', alignItems: 'center' },
  selfVideoTag: { position: 'absolute', bottom: 5, backgroundColor: 'rgba(0,0,0,0.6)', padding: 3, borderRadius: 4 },
  selfVideoText: { color: '#FFF', fontSize: 8 },
  videoControls: { position: 'absolute', bottom: 40, alignSelf: 'center' },
  statusBar: { flexDirection: 'row', justifyContent: 'space-between' },
  statusIndicator: { flexDirection: 'row', alignItems: 'center' },
  statusDot: { width: 8, height: 8, borderRadius: 4, marginRight: 8 },
  statusText: { color: '#FFF', fontSize: 14 },
  aiIndicator: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(76,175,80,0.2)', padding: 5, borderRadius: 10 },
  aiText: { color: '#4CAF50', fontSize: 10, fontWeight: '900', marginLeft: 4 },
  participantInfo: { alignItems: 'center', marginTop: 40 },
  avatar: { width: 120, height: 120, borderRadius: 60, backgroundColor: 'rgba(255,255,255,0.2)', justifyContent: 'center', alignItems: 'center', borderWidth: 2, borderColor: '#FFF' },
  avatarText: { fontSize: 40, fontWeight: '900', color: '#FFF' },
  participantName: { color: '#FFF', fontSize: 26, fontWeight: '900', marginTop: 20 },
  participantRole: { color: 'rgba(255,255,255,0.7)', fontSize: 16 },
  audioVisualization: { alignItems: 'center', marginBottom: 40 },
  waveform: { flexDirection: 'row', alignItems: 'flex-end', height: 40 },
  waveBar: { width: 4, borderRadius: 2 },
  audioQualityText: { color: 'rgba(255,255,255,0.5)', fontSize: 12, marginTop: 10 },
  controls: { paddingHorizontal: 20, paddingBottom: 40, alignItems: 'center' },
  primaryControls: { flexDirection: 'row', alignItems: 'center', gap: 25, marginBottom: 20 },
  controlButton: { width: 60, height: 60, borderRadius: 30, backgroundColor: '#FFF', justifyContent: 'center', alignItems: 'center' },
  controlBtnActive: { backgroundColor: '#EF4444' },
  videoActive: { backgroundColor: '#6366F1' },
  endCallButton: { width: 80, height: 80, borderRadius: 40, backgroundColor: '#EF4444', justifyContent: 'center', alignItems: 'center', transform: [{ rotate: '135deg' }] },
  secondaryControls: { flexDirection: 'row', justifyContent: 'space-between', width: '100%', gap: 10 },
  secBtn: { flex: 1, height: 44, borderRadius: 12, backgroundColor: 'rgba(255,255,255,0.1)', justifyContent: 'center', alignItems: 'center', flexDirection: 'row', gap: 5 },
  secBtnText: { color: '#FFF', fontSize: 12 },
  recActive: { backgroundColor: '#EF4444' },
  aiActive: { backgroundColor: '#10B981' },
  whiteText: { color: '#FFF' },
});

export default EnhancedVoiceCall;
