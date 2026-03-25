import React from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, ImageBackground } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

const VirtualTour360 = ({ visible, onClose }) => {
  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.overlay}>
        <View style={styles.content}>
          <ImageBackground 
            source={{ uri: 'https://images.unsplash.com/photo-1541339907198-e08756ebafe3' }} 
            style={styles.panorama}
          >
            <LinearGradient colors={['rgba(0,0,0,0.6)', 'transparent']} style={styles.header}>
              <View>
                <Text style={styles.title}>KNUST 360° Tour</Text>
                <Text style={styles.subtitle}>Explore the Campus Immersively</Text>
              </View>
              <TouchableOpacity onPress={onClose}>
                <Ionicons name="close-circle" size={32} color="#FFFFFF" />
              </TouchableOpacity>
            </LinearGradient>

            <View style={styles.overlayControls}>
               <TouchableOpacity style={styles.navBtn}>
                  <Ionicons name="chevron-back" size={24} color="#FFFFFF" />
               </TouchableOpacity>
               <TouchableOpacity style={styles.navBtn}>
                  <Ionicons name="chevron-forward" size={24} color="#FFFFFF" />
               </TouchableOpacity>
            </View>

            <View style={styles.footer}>
               <View style={styles.hotspot}>
                  <View style={styles.hotspotDot} />
                  <Text style={styles.hotspotText}>Unity Hall</Text>
               </View>
               <TouchableOpacity style={styles.vrButton}>
                  <Ionicons name="glasses" size={24} color="#FFFFFF" />
                  <Text style={styles.vrText}>Enter VR Mode</Text>
               </TouchableOpacity>
            </View>
          </ImageBackground>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: '#000' },
  content: { flex: 1 },
  panorama: { flex: 1, justifyContent: 'space-between' },
  header: { padding: 24, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  title: { fontSize: 24, fontWeight: '900', color: '#FFFFFF' },
  subtitle: { fontSize: 14, color: 'rgba(255,255,255,0.7)', fontWeight: '600' },
  overlayControls: { flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 20 },
  navBtn: { width: 50, height: 50, borderRadius: 25, backgroundColor: 'rgba(0,0,0,0.3)', justifyContent: 'center', alignItems: 'center' },
  footer: { padding: 40, alignItems: 'center' },
  hotspot: { alignItems: 'center', marginBottom: 20 },
  hotspotDot: { width: 12, height: 12, borderRadius: 6, backgroundColor: '#6366F1', borderWidth: 2, borderColor: '#FFFFFF' },
  hotspotText: { color: '#FFFFFF', fontWeight: '800', marginTop: 4, textShadowColor: '#000', textShadowRadius: 4 },
  vrButton: { backgroundColor: '#6366F1', flexDirection: 'row', paddingHorizontal: 24, paddingVertical: 12, borderRadius: 30, gap: 10 },
  vrText: { color: '#FFFFFF', fontWeight: '800' },
});

export default VirtualTour360;
