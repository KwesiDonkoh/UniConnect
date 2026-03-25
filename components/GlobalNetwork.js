import React from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, Dimensions, ScrollView, Image } from 'react-native';
import { BlurView } from 'expo-blur';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

const { width, height } = Dimensions.get('window');

const GlobalNetwork = ({ visible, onClose, isDark }) => {
  const regions = [
    { name: 'Ivy League Cohort', university: 'Harvard/Oxford/Ivy', peers: 124, color: '#6366F1' },
    { name: 'MIT/Stanford Robotics', university: 'MIT/Stanford', peers: 86, color: '#EC4899' },
    { name: 'Tech Asia Alliance', university: 'Tsinghua/NUS', peers: 230, color: '#10B981' },
  ];

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <BlurView intensity={98} tint={isDark ? 'dark' : 'light'} style={StyleSheet.absoluteFill} />
        
        <View style={[styles.modalContent, isDark && styles.darkModal]}>
          <TouchableOpacity style={styles.closeBtn} onPress={onClose}>
            <Ionicons name="close" size={28} color={isDark ? '#FFF' : '#000'} />
          </TouchableOpacity>

          <View style={styles.header}>
            <Ionicons name="earth" size={40} color="#6366F1" />
            <Text style={[styles.title, isDark && styles.whiteText]}>Global Student Network</Text>
            <Text style={styles.subtitle}>BEYOND BOUNDARIES</Text>
          </View>

          <ScrollView style={styles.body}>
            <Text style={styles.sectionLabel}>ACTIVE INTERNATIONAL COHORTS</Text>
            {regions.map(region => (
              <TouchableOpacity key={region.name} style={[styles.regionCard, isDark && styles.darkCard]}>
                <View style={[styles.regionIcon, { backgroundColor: region.color }]}>
                  <Ionicons name="school" size={20} color="#FFF" />
                </View>
                <View style={styles.regionInfo}>
                  <Text style={[styles.regionName, isDark && styles.whiteText]}>{region.name}</Text>
                  <Text style={styles.uName}>{region.university}</Text>
                </View>
                <View style={styles.peerCount}>
                  <Text style={styles.peerValue}>{region.peers}</Text>
                  <Text style={styles.peerLabel}>PEERS</Text>
                </View>
              </TouchableOpacity>
            ))}

            <TouchableOpacity style={styles.initiateBtn}>
              <LinearGradient colors={['#6366F1', '#A855F7']} style={styles.gradient}>
                <Text style={styles.initiateText}>INITIATE GLOBAL EXCHANGE</Text>
              </LinearGradient>
            </TouchableOpacity>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: { flex: 1, justifyContent: 'flex-end' },
  modalContent: { height: height * 0.8, backgroundColor: '#FFF', borderTopLeftRadius: 40, borderTopRightRadius: 40, padding: 30 },
  darkModal: { backgroundColor: '#020617' },
  closeBtn: { alignSelf: 'flex-end' },
  header: { alignItems: 'center', marginBottom: 30 },
  title: { fontSize: 22, fontWeight: '900', textAlign: 'center', marginTop: 10 },
  whiteText: { color: '#FFF' },
  subtitle: { fontSize: 10, fontWeight: '900', color: '#6366F1', letterSpacing: 3, marginTop: 4 },
  body: { flex: 1 },
  sectionLabel: { fontSize: 10, fontWeight: '900', color: '#64748B', marginBottom: 20 },
  regionCard: { flexDirection: 'row', alignItems: 'center', padding: 20, backgroundColor: '#F8FAFC', borderRadius: 24, marginBottom: 15 },
  darkCard: { backgroundColor: 'rgba(255,255,255,0.05)' },
  regionIcon: { width: 44, height: 44, borderRadius: 14, justifyContent: 'center', alignItems: 'center' },
  regionInfo: { flex: 1, marginLeft: 15 },
  regionName: { fontSize: 15, fontWeight: '800' },
  uName: { fontSize: 10, color: '#94A3B8', marginTop: 2 },
  peerCount: { alignItems: 'flex-end' },
  peerValue: { fontSize: 18, fontWeight: '900', color: '#6366F1' },
  peerLabel: { fontSize: 8, color: '#94A3B8' },
  initiateBtn: { height: 60, borderRadius: 20, overflow: 'hidden', marginTop: 20 },
  gradient: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  initiateText: { color: '#FFF', fontWeight: '900', letterSpacing: 1 },
});

export default GlobalNetwork;
