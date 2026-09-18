import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, Dimensions, Animated } from 'react-native';
import { BlurView } from 'expo-blur';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

const { width, height } = Dimensions.get('window');

const ZenSpace = ({ visible, onClose, isDark }) => {
  const [breathing, setBreathing] = useState(false);
  const breathAnim = React.useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (breathing) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(breathAnim, { toValue: 1.5, duration: 4000, useNativeDriver: true }),
          Animated.timing(breathAnim, { toValue: 1, duration: 4000, useNativeDriver: true }),
        ])
      ).start();
    } else {
      breathAnim.stopAnimation();
      breathAnim.setValue(1);
    }
  }, [breathing]);

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <BlurView intensity={100} tint={isDark ? 'dark' : 'light'} style={StyleSheet.absoluteFill} />
        
        <View style={[styles.modalContent, isDark && styles.darkModal]}>
          <TouchableOpacity style={styles.closeBtn} onPress={onClose}>
            <Ionicons name="close" size={28} color={isDark ? '#FFF' : '#000'} />
          </TouchableOpacity>

          <View style={styles.header}>
            <Ionicons name="leaf" size={40} color="#10B981" />
            <Text style={[styles.title, isDark && styles.whiteText]}>Zen Space</Text>
            <Text style={styles.subtitle}>MENTAL WELLNESS & BURNOUT PREDICTION</Text>
          </View>

          <View style={styles.burnoutBox}>
            <Text style={styles.burnoutTitle}>BURNOUT RISK</Text>
            <Text style={styles.burnoutVal}>14%</Text>
            <Text style={styles.burnoutDesc}>Your academic load is balanced. Keep up the steady pace.</Text>
          </View>

          <View style={styles.breathContainer}>
            <Animated.View style={[styles.breathCircle, { transform: [{ scale: breathAnim }] }]} />
            <TouchableOpacity style={styles.breathBtn} onPress={() => setBreathing(!breathing)}>
              <Text style={styles.breathText}>{breathing ? "BREATHE OUT..." : "START BREATHING"}</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.actionRow}>
            <TouchableOpacity style={styles.actionCard}>
              <Ionicons name="medkit" size={24} color="#6366F1" />
              <Text style={styles.actionLabel}>Anon Counselor</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionCard}>
              <Ionicons name="musical-notes" size={24} color="#EC4899" />
              <Text style={styles.actionLabel}>Lofi Therapy</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  modalContent: { width: width * 0.9, height: height * 0.8, backgroundColor: '#FFF', borderRadius: 40, padding: 30 },
  darkModal: { backgroundColor: '#020617' },
  closeBtn: { alignSelf: 'flex-end' },
  header: { alignItems: 'center', marginBottom: 20 },
  title: { fontSize: 24, fontWeight: '900', color: '#1E293B', marginTop: 10 },
  whiteText: { color: '#FFF' },
  subtitle: { fontSize: 9, fontWeight: '900', color: '#10B981', letterSpacing: 2, marginTop: 4, textAlign: 'center' },
  burnoutBox: { backgroundColor: 'rgba(16, 185, 129, 0.05)', padding: 20, borderRadius: 20, alignItems: 'center', marginBottom: 30, borderWidth: 1, borderColor: 'rgba(16, 185, 129, 0.2)' },
  burnoutTitle: { fontSize: 10, fontWeight: '900', color: '#10B981', marginBottom: 4 },
  burnoutVal: { fontSize: 32, fontWeight: '900', color: '#1E293B' },
  burnoutDesc: { fontSize: 11, color: '#64748B', textAlign: 'center', marginTop: 8 },
  breathContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', position: 'relative' },
  breathCircle: { position: 'absolute', width: 120, height: 120, borderRadius: 60, backgroundColor: 'rgba(16, 185, 129, 0.1)', borderWidth: 2, borderColor: '#10B981' },
  breathBtn: { zIndex: 10, padding: 15, borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.9)' },
  breathText: { fontSize: 12, fontWeight: '800', color: '#10B981' },
  actionRow: { flexDirection: 'row', gap: 10, marginTop: 30 },
  actionCard: { flex: 1, backgroundColor: '#F8FAFC', padding: 15, borderRadius: 16, alignItems: 'center', borderWidth: 1, borderColor: '#E2E8F0' },
  actionLabel: { fontSize: 11, fontWeight: '800', color: '#1E293B', marginTop: 8 },
});

export default ZenSpace;
