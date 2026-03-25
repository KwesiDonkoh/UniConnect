import React, { useState, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, Dimensions, Animated, Easing } from 'react-native';
import { BlurView } from 'expo-blur';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

const { width, height } = Dimensions.get('window');

const NeuralAmbience = ({ visible, onClose, isDark }) => {
  const [activePreset, setActivePreset] = useState('Deep Study');
  const [isPlaying, setIsPlaying] = useState(false);
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (isPlaying) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, { toValue: 1.2, duration: 1000, useNativeDriver: true }),
          Animated.timing(pulseAnim, { toValue: 1, duration: 1000, useNativeDriver: true }),
        ])
      ).start();
    } else {
      pulseAnim.setValue(1);
    }
  }, [isPlaying]);

  const presets = [
    { name: 'Deep Study', icon: 'brain', color: '#6366F1' },
    { name: 'Creative Flow', icon: 'color-palette', color: '#EC4899' },
    { name: 'Zen Break', icon: 'leaf', color: '#10B981' },
    { name: 'Neural Focus', icon: 'flash', color: '#F59E0B' },
  ];

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <BlurView intensity={95} tint={isDark ? 'dark' : 'light'} style={StyleSheet.absoluteFill} />
        
        <View style={[styles.modalContent, isDark && styles.darkModal]}>
          <TouchableOpacity style={styles.closeBtn} onPress={onClose}>
            <Ionicons name="close" size={28} color={isDark ? '#FFF' : '#000'} />
          </TouchableOpacity>

          <Text style={[styles.title, isDark && styles.whiteText]}>Neural Ambience</Text>
          <Text style={styles.subtitle}>AI-GENERATED FOCUS SOUNDS</Text>

          <View style={styles.playerContainer}>
            <Animated.View style={[styles.visualizer, { transform: [{ scale: pulseAnim }], borderColor: presets.find(p => p.name === activePreset).color }]}>
              <Ionicons name={presets.find(p => p.name === activePreset).icon} size={60} color={presets.find(p => p.name === activePreset).color} />
            </Animated.View>
            
            <Text style={[styles.activeText, isDark && styles.whiteText]}>{activePreset}</Text>
            <TouchableOpacity onPress={() => setIsPlaying(!isPlaying)}>
              <LinearGradient colors={['#6366F1', '#A855F7']} style={styles.playBtn}>
                <Ionicons name={isPlaying ? "pause" : "play"} size={32} color="#FFF" />
              </LinearGradient>
            </TouchableOpacity>
          </View>

          <View style={styles.presetGrid}>
            {presets.map((preset) => (
              <TouchableOpacity 
                key={preset.name} 
                style={[styles.presetCard, activePreset === preset.name && { borderColor: preset.color }]} 
                onPress={() => setActivePreset(preset.name)}
              >
                <Ionicons name={preset.icon} size={24} color={activePreset === preset.name ? preset.color : '#64748B'} />
                <Text style={[styles.presetLabel, activePreset === preset.name && { color: preset.color }]}>{preset.name}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: { flex: 1, justifyContent: 'flex-end' },
  modalContent: { height: height * 0.7, padding: 30, backgroundColor: '#FFF', borderTopLeftRadius: 40, borderTopRightRadius: 40 },
  darkModal: { backgroundColor: '#0F172A' },
  closeBtn: { position: 'absolute', right: 25, top: 25, zIndex: 10 },
  title: { fontSize: 24, fontWeight: '900', color: '#1E293B', textAlign: 'center' },
  whiteText: { color: '#FFFFFF' },
  subtitle: { fontSize: 10, fontWeight: '900', color: '#6366F1', letterSpacing: 2, textAlign: 'center', marginTop: 4 },
  playerContainer: { alignItems: 'center', marginTop: 40 },
  visualizer: { width: 140, height: 140, borderRadius: 70, borderWidth: 2, borderStyle: 'dashed', justifyContent: 'center', alignItems: 'center', marginBottom: 20 },
  activeText: { fontSize: 18, fontWeight: '800', marginBottom: 20 },
  playBtn: { width: 80, height: 80, borderRadius: 40, justifyContent: 'center', alignItems: 'center', elevation: 10 },
  presetGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', marginTop: 40 },
  presetCard: { width: '48%', backgroundColor: 'rgba(99, 102, 241, 0.05)', padding: 15, borderRadius: 20, flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 15, borderHorizontalWidth: 2, borderColor: 'transparent' },
  presetLabel: { fontSize: 12, fontWeight: '700', color: '#64748B' },
});

export default NeuralAmbience;
