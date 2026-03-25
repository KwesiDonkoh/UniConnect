import React from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, ScrollView, Dimensions } from 'react-native';
import { BlurView } from 'expo-blur';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

const { width, height } = Dimensions.get('window');

const AcademicCompass = ({ visible, onClose, isDark }) => {
  const roadmap = [
    { step: 1, title: 'Foundation', status: 'completed', desc: 'Core 100-level modules consolidated.' },
    { step: 2, title: 'Specialization', status: 'in-progress', desc: 'Currently mastering 300-level CS concepts.' },
    { step: 3, title: 'Professionalism', status: 'upcoming', desc: 'Final year project and internship phase.' },
    { step: 4, title: 'Graduation', status: 'upcoming', desc: 'Neural Nexus Certification & Alumni status.' },
  ];

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <BlurView intensity={80} tint={isDark ? 'dark' : 'light'} style={StyleSheet.absoluteFill} />
        
        <View style={[styles.modalContent, isDark && styles.darkModal]}>
          <View style={styles.header}>
            <View style={styles.iconBox}>
              <LinearGradient colors={['#6366F1', '#A855F7']} style={styles.gradient}>
                <Ionicons name="compass" size={32} color="#FFFFFF" />
              </LinearGradient>
            </View>
            <View>
              <Text style={[styles.title, isDark && styles.whiteText]}>Academic Compass</Text>
              <Text style={styles.subtitle}>Your Path to Excellence</Text>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <Ionicons name="close" size={24} color={isDark ? '#FFF' : '#000'} />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.scroll}>
            <Text style={[styles.sectionTitle, isDark && styles.whiteText]}>Degree Roadmap</Text>
            {roadmap.map((item, index) => (
              <View key={index} style={styles.roadmapItem}>
                <View style={[styles.stepDot, item.status === 'completed' && styles.dotCompleted]} />
                {index < roadmap.length - 1 && <View style={styles.stepLine} />}
                <View style={[styles.stepContent, isDark && styles.darkStep]}>
                  <Text style={[styles.stepTitle, isDark && styles.whiteText]}>{item.title}</Text>
                  <Text style={styles.stepDesc}>{item.desc}</Text>
                  <View style={[styles.statusBadge, item.status === 'completed' && styles.badgeCompleted]}>
                    <Text style={styles.badgeText}>{item.status.toUpperCase()}</Text>
                  </View>
                </View>
              </View>
            ))}

            <TouchableOpacity style={styles.primaryBtn}>
              <LinearGradient colors={['#6366F1', '#8B5CF6']} style={styles.btnGradient}>
                <Text style={styles.btnText}>Optimize My Path</Text>
              </LinearGradient>
            </TouchableOpacity>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.5)' },
  modalContent: { width: width * 0.9, maxHeight: height * 0.8, backgroundColor: '#FFF', borderRadius: 32, padding: 25, overflow: 'hidden' },
  darkModal: { backgroundColor: '#1E293B' },
  header: { flexDirection: 'row', alignItems: 'center', marginBottom: 25 },
  iconBox: { width: 60, height: 60, marginRight: 15 },
  gradient: { flex: 1, borderRadius: 20, justifyContent: 'center', alignItems: 'center' },
  title: { fontSize: 24, fontWeight: '800', color: '#1E293B' },
  subtitle: { fontSize: 14, color: '#64748B' },
  whiteText: { color: '#FFF' },
  closeBtn: { marginLeft: 'auto', padding: 5 },
  scroll: { flexGrow: 0 },
  sectionTitle: { fontSize: 18, fontWeight: '700', marginBottom: 20 },
  roadmapItem: { flexDirection: 'row', marginBottom: 20, paddingLeft: 10 },
  stepDot: { width: 12, height: 12, borderRadius: 6, backgroundColor: '#CBD5E1', zIndex: 1, marginTop: 5 },
  dotCompleted: { backgroundColor: '#10B981' },
  stepLine: { position: 'absolute', left: 15, top: 15, width: 2, height: '100%', backgroundColor: '#E2E8F0' },
  stepContent: { marginLeft: 20, flex: 1, padding: 15, backgroundColor: '#F8FAFC', borderRadius: 20 },
  darkStep: { backgroundColor: '#334155' },
  stepTitle: { fontSize: 16, fontWeight: '700', color: '#1E293B' },
  stepDesc: { fontSize: 13, color: '#64748B', marginVertical: 5 },
  statusBadge: { alignSelf: 'flex-start', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 10, backgroundColor: '#CBD5E1' },
  badgeCompleted: { backgroundColor: '#10B98120' },
  badgeText: { fontSize: 10, fontWeight: '800', color: '#475569' },
  primaryBtn: { marginTop: 25 },
  btnGradient: { padding: 18, borderRadius: 20, alignItems: 'center' },
  btnText: { color: '#FFF', fontWeight: '800', fontSize: 16 },
});

export default AcademicCompass;
