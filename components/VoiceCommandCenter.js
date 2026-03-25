import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  Animated,
  Dimensions,
  Vibration,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';

const { width, height } = Dimensions.get('window');

const VoiceCommandCenter = ({ visible, onClose, onCommand, isDark }) => {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (visible) {
      startPulse();
      // Simulate "Listening" start
      setTimeout(() => {
        setIsListening(true);
        simulateVoiceCommand();
      }, 1000);
    } else {
      setIsListening(false);
      setTranscript('');
    }
  }, [visible]);

  const startPulse = () => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1.2, duration: 1000, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 1, duration: 1000, useNativeDriver: true }),
      ])
    ).start();
  };

  const simulateVoiceCommand = () => {
    const commands = [
      "Open my academic results",
      "Set a reminder for group study",
      "Show my study streak",
      "Check KNUST SIS sync status",
      "Find Dr. Kofi Mensah",
    ];
    
    // Simulate thinking/typing effect
    let fullText = commands[Math.floor(Math.random() * commands.length)];
    let currentText = "";
    let i = 0;
    
    const interval = setInterval(() => {
      currentText += fullText[i];
      setTranscript(currentText);
      i++;
      if (i === fullText.length) {
        clearInterval(interval);
        setTimeout(() => {
          Vibration.vibrate(50);
          onCommand(fullText);
          onClose();
        }, 1500);
      }
    }, 50);
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <BlurView intensity={isDark ? 60 : 90} tint={isDark ? 'dark' : 'light'} style={styles.overlay}>
        <TouchableOpacity style={styles.closeArea} onPress={onClose} />
        
        <View style={[styles.card, isDark && styles.darkCard]}>
          <View style={styles.header}>
            <Text style={[styles.headerTitle, isDark && styles.darkText]}>Voice Command Center</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <Ionicons name="close" size={24} color={isDark ? '#FFFFFF' : '#64748B'} />
            </TouchableOpacity>
          </View>

          <View style={styles.content}>
            <Animated.View style={[styles.micContainer, { transform: [{ scale: pulseAnim }] }]}>
              <LinearGradient colors={['#6366F1', '#8B5CF6']} style={styles.micGradient}>
                <Ionicons name="mic" size={40} color="#FFFFFF" />
              </LinearGradient>
            </Animated.View>

            <Text style={[styles.statusText, isDark && styles.darkText]}>
              {isListening ? "Listening..." : "Initializing Neural Voice..."}
            </Text>

            <View style={styles.transcriptBox}>
              <Text style={styles.transcriptText}>
                {transcript || "Speak now..."}
              </Text>
            </View>

            <View style={styles.tipsRow}>
              <Ionicons name="bulb-outline" size={16} color="#6366F1" />
              <Text style={styles.tipsText}>Try: "Open results" or "Find library"</Text>
            </View>
          </View>
        </View>
      </BlurView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  closeArea: { ...StyleSheet.absoluteFillObject },
  card: { 
    width: width * 0.85, 
    backgroundColor: '#FFFFFF', 
    borderRadius: 30, 
    padding: 25, 
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
  },
  darkCard: { backgroundColor: '#1E293B' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 30 },
  headerTitle: { fontSize: 18, fontWeight: '800', color: '#1E293B' },
  darkText: { color: '#FFFFFF' },
  closeBtn: { padding: 5 },
  content: { alignItems: 'center' },
  micContainer: { marginBottom: 30 },
  micGradient: { width: 90, height: 90, borderRadius: 45, alignItems: 'center', justifyContent: 'center', elevation: 5 },
  statusText: { fontSize: 16, fontWeight: '700', color: '#1E293B', marginBottom: 20 },
  transcriptBox: { 
    width: '100%', 
    padding: 20, 
    backgroundColor: '#F1F5F9', 
    borderRadius: 20, 
    minHeight: 80, 
    justifyContent: 'center' 
  },
  transcriptText: { fontSize: 18, fontStyle: 'italic', textAlign: 'center', color: '#475569' },
  tipsRow: { flexDirection: 'row', alignItems: 'center', marginTop: 20, gap: 10 },
  tipsText: { fontSize: 12, color: '#64748B', fontWeight: '500' },
});

export default VoiceCommandCenter;
