import React from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, Dimensions } from 'react-native';
import { BlurView } from 'expo-blur';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

const { width, height } = Dimensions.get('window');

const VirtualCampusVR = ({ visible, onClose, isDark }) => {
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <BlurView intensity={100} tint={isDark ? 'dark' : 'light'} style={StyleSheet.absoluteFill} />
        
        <View style={[styles.modalContent, isDark && styles.darkModal]}>
          <TouchableOpacity style={styles.closeBtn} onPress={onClose}>
            <Ionicons name="close-circle" size={32} color={isDark ? '#FFF' : '#000'} />
          </TouchableOpacity>

          <View style={styles.arContainer}>
            <LinearGradient colors={['rgba(99, 102, 241, 0.2)', 'rgba(139, 92, 246, 0.2)']} style={styles.arView}>
              <Ionicons name="cube-outline" size={80} color="#6366F1" />
              <Text style={styles.arStatus}>INITIALIZING HOLOGRAPHIC VR...</Text>
            </LinearGradient>
          </View>

          <View style={styles.infoArea}>
            <Text style={[styles.title, isDark && styles.whiteText]}>Virtual Campus Explorer</Text>
            <Text style={styles.subtitle}>HOLOGRAPHIC AR NAVIGATION</Text>
            <Text style={styles.desc}>Experience KNUST like never before. Navigate through buildings in 3D, view real-time room occupancies, and find hidden campus shortcuts.</Text>

            <TouchableOpacity style={styles.startBtn} onPress={onClose}>
              <LinearGradient colors={['#6366F1', '#4F46E5']} style={styles.gradient}>
                <Text style={styles.startText}>LAUNCH AR CAMERA</Text>
                <Ionicons name="camera" size={20} color="#FFF" />
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.8)', justifyContent: 'center', alignItems: 'center' },
  modalContent: { width: width * 0.9, height: height * 0.75, backgroundColor: '#FFF', borderRadius: 40, overflow: 'hidden' },
  darkModal: { backgroundColor: '#020617' },
  closeBtn: { position: 'absolute', right: 20, top: 20, zIndex: 10 },
  arContainer: { height: '45%', justifyContent: 'center', alignItems: 'center' },
  arView: { width: '100%', height: '100%', justifyContent: 'center', alignItems: 'center', borderBottomWidth: 1, borderBottomColor: 'rgba(99, 102, 241, 0.1)' },
  arStatus: { fontSize: 10, fontWeight: '900', color: '#6366F1', marginTop: 20, letterSpacing: 2 },
  infoArea: { padding: 30, flex: 1 },
  title: { fontSize: 24, fontWeight: '900', color: '#1E293B' },
  whiteText: { color: '#FFF' },
  subtitle: { fontSize: 10, fontWeight: '900', color: '#6366F1', letterSpacing: 2, marginTop: 4 },
  desc: { fontSize: 14, color: '#64748B', lineHeight: 22, marginTop: 20 },
  startBtn: { marginTop: 'auto', height: 60, borderRadius: 20, overflow: 'hidden' },
  gradient: { flex: 1, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 10 },
  startText: { color: '#FFF', fontWeight: '900', letterSpacing: 1 },
});

export default VirtualCampusVR;
