import React from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, Dimensions, ScrollView, Image } from 'react-native';
import { BlurView } from 'expo-blur';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

const { width, height } = Dimensions.get('window');

const AIStudyTutors = ({ visible, onClose, isDark }) => {
  const tutors = [
    { name: 'Dr. Cyber', subject: 'Architecture', icon: 'hardware-chip', color: '#6366F1' },
    { name: 'Prof. Logic', subject: 'Discrete Math', icon: 'infinite', color: '#D946EF' },
    { name: 'Bot Bayes', subject: 'Probability', icon: 'stats-chart', color: '#10B981' },
    { name: 'Nora Neural', subject: 'AI Ethics', icon: 'brain', color: '#F59E0B' },
  ];

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <BlurView intensity={90} tint={isDark ? 'dark' : 'light'} style={StyleSheet.absoluteFill} />
        
        <View style={[styles.modalContent, isDark && styles.darkModal]}>
          <View style={styles.header}>
            <Text style={[styles.title, isDark && styles.whiteText]}>AI Study Tutors</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <Ionicons name="close" size={24} color={isDark ? '#FFF' : '#000'} />
            </TouchableOpacity>
          </View>

          <Text style={styles.sectionDesc}>Select a neural persona to begin your personalized study session.</Text>

          <ScrollView contentContainerStyle={styles.tutorGrid} showsVerticalScrollIndicator={false}>
            {tutors.map((tutor, i) => (
              <TouchableOpacity key={i} style={[styles.tutorCard, isDark && styles.darkCard]}>
                <LinearGradient colors={[tutor.color + '20', 'transparent']} style={styles.tutorGradient}>
                  <View style={[styles.tutorIcon, { backgroundColor: tutor.color }]}>
                    <Ionicons name={tutor.icon} size={30} color="#FFF" />
                  </View>
                  <Text style={[styles.tutorName, isDark && styles.whiteText]}>{tutor.name}</Text>
                  <Text style={styles.tutorSubject}>{tutor.subject}</Text>
                  
                  <View style={styles.onlineBadge}>
                    <View style={styles.greenDot} />
                    <Text style={styles.onlineText}>READY</Text>
                  </View>
                </LinearGradient>
              </TouchableOpacity>
            ))}
          </ScrollView>

          <TouchableOpacity style={styles.primaryBtn}>
            <LinearGradient colors={['#6366F1', '#8B5CF6']} style={styles.btnGradient}>
              <Text style={styles.btnText}>START GLOBAL STUDY SESSION</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  modalContent: { width: width * 0.9, height: height * 0.8, backgroundColor: '#FFF', borderRadius: 40, padding: 30 },
  darkModal: { backgroundColor: '#1E293B' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15 },
  title: { fontSize: 28, fontWeight: '900', color: '#1E293B' },
  whiteText: { color: '#FFF' },
  closeBtn: { padding: 5 },
  sectionDesc: { fontSize: 14, color: '#64748B', marginBottom: 30, lineHeight: 20 },
  tutorGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 15, paddingBottom: 20 },
  tutorCard: { width: (width * 0.9 - 75) / 2, borderRadius: 25, backgroundColor: '#F8FAFC', overflow: 'hidden' },
  darkCard: { backgroundColor: '#334155' },
  tutorGradient: { padding: 20, alignItems: 'center' },
  tutorIcon: { width: 60, height: 60, borderRadius: 30, justifyContent: 'center', alignItems: 'center', marginBottom: 15 },
  tutorName: { fontSize: 16, fontWeight: '800', marginBottom: 2 },
  tutorSubject: { fontSize: 12, color: '#64748B', fontWeight: '600' },
  onlineBadge: { flexDirection: 'row', alignItems: 'center', gap: 5, marginTop: 15, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 10, backgroundColor: 'rgba(16, 185, 129, 0.1)' },
  greenDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: '#10B981' },
  onlineText: { fontSize: 9, fontWeight: '800', color: '#10B981' },
  primaryBtn: { marginTop: 'auto' },
  btnGradient: { padding: 20, borderRadius: 20, alignItems: 'center' },
  btnText: { color: '#FFF', fontWeight: '900', letterSpacing: 1 },
});

export default AIStudyTutors;
