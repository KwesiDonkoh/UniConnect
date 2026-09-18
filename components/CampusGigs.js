import React from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, Dimensions, ScrollView } from 'react-native';
import { BlurView } from 'expo-blur';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

const { width, height } = Dimensions.get('window');

const CampusGigs = ({ visible, onClose, isDark }) => {
  const gigs = [
    { title: 'Neural Net Tutor', dept: 'Comp Sci', pay: 'GH₵ 80/hr', type: 'Tutoring', color: '#6366F1' },
    { title: 'UX Lab Assistant', dept: 'Design', pay: 'GH₵ 120/pr', type: 'Research', color: '#EC4899' },
    { title: 'Event Photographer', dept: 'SRC', pay: 'GH₵ 250', type: 'Event', color: '#F59E0B' },
  ];

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <BlurView intensity={95} tint={isDark ? 'dark' : 'light'} style={StyleSheet.absoluteFill} />
        
        <View style={[styles.modalContent, isDark && styles.darkModal]}>
          <TouchableOpacity style={styles.closeBtn} onPress={onClose}>
            <Ionicons name="close" size={28} color={isDark ? '#FFF' : '#000'} />
          </TouchableOpacity>

          <View style={styles.header}>
            <Ionicons name="briefcase" size={40} color="#6366F1" />
            <Text style={[styles.title, isDark && styles.whiteText]}>Campus Gigs</Text>
            <Text style={styles.subtitle}>STUDENT MICRO-ECONOMY</Text>
          </View>

          <View style={styles.earningsBox}>
            <Text style={styles.earningsLabel}>TOTAL EARNED THIS MONTH</Text>
            <Text style={[styles.earningsVal, isDark && styles.whiteText]}>GH₵ 450.00</Text>
          </View>

          <ScrollView style={styles.gigsList} showsVerticalScrollIndicator={false}>
            <Text style={styles.sectionHeader}>AVAILABLE GIGS 🚀</Text>
            {gigs.map(gig => (
              <TouchableOpacity key={gig.title} style={[styles.gigCard, isDark && styles.darkCard]}>
                <View style={[styles.iconBox, { backgroundColor: gig.color }]}>
                  <Ionicons name="star" size={20} color="#FFF" />
                </View>
                <View style={styles.gigInfo}>
                  <Text style={[styles.gigTitle, isDark && styles.whiteText]}>{gig.title}</Text>
                  <Text style={styles.gigDept}>{gig.dept} • {gig.type}</Text>
                </View>
                <View style={styles.payBox}>
                  <Text style={styles.payText}>{gig.pay}</Text>
                </View>
              </TouchableOpacity>
            ))}
          </ScrollView>

          <TouchableOpacity style={styles.applyBtn} onPress={onClose}>
            <LinearGradient colors={['#6366F1', '#4F46E5']} style={styles.gradient}>
              <Text style={styles.applyText}>POST A NEW GIG</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: { flex: 1, justifyContent: 'flex-end' },
  modalContent: { height: height * 0.85, backgroundColor: '#FFF', borderTopLeftRadius: 40, borderTopRightRadius: 40, padding: 30 },
  darkModal: { backgroundColor: '#0F172A' },
  closeBtn: { alignSelf: 'flex-end' },
  header: { alignItems: 'center', marginBottom: 20 },
  title: { fontSize: 24, fontWeight: '900', color: '#1E293B', marginTop: 10 },
  whiteText: { color: '#FFF' },
  subtitle: { fontSize: 9, fontWeight: '900', color: '#6366F1', letterSpacing: 2, marginTop: 4 },
  earningsBox: { backgroundColor: 'rgba(99, 102, 241, 0.05)', padding: 20, borderRadius: 20, alignItems: 'center', marginBottom: 20 },
  earningsLabel: { fontSize: 10, fontWeight: '900', color: '#64748B', marginBottom: 4 },
  earningsVal: { fontSize: 28, fontWeight: '900', color: '#1E293B' },
  gigsList: { flex: 1 },
  sectionHeader: { fontSize: 12, fontWeight: '900', color: '#94A3B8', marginBottom: 15 },
  gigCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F8FAFC', padding: 15, borderRadius: 20, marginBottom: 12 },
  darkCard: { backgroundColor: 'rgba(255,255,255,0.05)' },
  iconBox: { width: 44, height: 44, borderRadius: 14, justifyContent: 'center', alignItems: 'center' },
  gigInfo: { flex: 1, marginLeft: 15 },
  gigTitle: { fontSize: 15, fontWeight: '800', color: '#1E293B' },
  gigDept: { fontSize: 11, color: '#64748B', marginTop: 4 },
  payBox: { backgroundColor: 'rgba(99, 102, 241, 0.1)', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 10 },
  payText: { fontSize: 11, fontWeight: '900', color: '#6366F1' },
  applyBtn: { height: 60, borderRadius: 20, overflow: 'hidden', marginTop: 15 },
  gradient: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  applyText: { color: '#FFF', fontWeight: '900', letterSpacing: 1 },
});

export default CampusGigs;
