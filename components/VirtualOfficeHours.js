import React, { useState } from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, Dimensions, ScrollView, Alert, FlatList } from 'react-native';
import { BlurView } from 'expo-blur';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

const { width, height } = Dimensions.get('window');

const VirtualOfficeHours = ({ visible, onClose, isDark }) => {
  const [selectedLecturer, setSelectedLecturer] = useState(null);

  const lecturers = [
    { id: 1, name: 'Dr. Arthur King', dept: 'Computer Science', slots: ['Monday 2PM', 'Wednesday 10AM'], color: '#4F46E5', avatar: '👨‍🏫' },
    { id: 2, name: 'Prof. Darko Mensah', dept: 'Mathematics', slots: ['Tuesday 1PM', 'Thursday 3PM'], color: '#10B981', avatar: '🧑‍🏫' },
    { id: 3, name: 'Dr. Sarah Osei', dept: 'Information Tech', slots: ['Monday 9AM', 'Friday 2PM'], color: '#F59E0B', avatar: '👩‍🏫' },
  ];

  const bookSlot = (slot, name) => {
    Alert.alert(
      'Confirm Booking',
      `Schedule a Virtual Office Hour with ${name} on ${slot}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Confirm', 
          onPress: () => {
            Alert.alert('✅ Success', 'Session booked! You will receive a Zoom link 15 minutes before the start.');
            onClose();
          }
        }
      ]
    );
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <BlurView intensity={90} tint={isDark ? 'dark' : 'light'} style={StyleSheet.absoluteFill} />
        
        <View style={[styles.modalContent, isDark && styles.darkModal]}>
          <View style={styles.topHandle} />
          
          <View style={styles.header}>
            <View>
              <Text style={[styles.title, isDark && styles.whiteText]}>Office Hours</Text>
              <Text style={styles.subtitle}>VIRTUAL 1-ON-1 SESSIONS</Text>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <Ionicons name="close" size={24} color={isDark ? '#FFF' : '#64748B'} />
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false}>
            <View style={styles.promoCard}>
              <LinearGradient colors={['#6366F1', '#A855F7']} style={styles.promoGradient}>
                <Ionicons name="videocam" size={32} color="#FFF" />
                <View style={{ flex: 1, marginLeft: 15 }}>
                  <Text style={styles.promoTitle}>Seamless Mentorship</Text>
                  <Text style={styles.promoText}>Connect with faculty anywhere via high-definition neural streaming.</Text>
                </View>
              </LinearGradient>
            </View>

            <Text style={styles.sectionTitle}>SELECT FACULTY MEMBER</Text>
            
            {lecturers.map((lecturer) => (
              <View key={lecturer.id} style={[styles.lecturerCard, isDark && styles.darkCard]}>
                <View style={styles.lecturerHeader}>
                  <View style={[styles.avatar, { backgroundColor: lecturer.color + '20' }]}>
                    <Text style={{ fontSize: 24 }}>{lecturer.avatar}</Text>
                  </View>
                  <View style={{ flex: 1, marginLeft: 12 }}>
                    <Text style={[styles.lecturerName, isDark && styles.whiteText]}>{lecturer.name}</Text>
                    <Text style={styles.lecturerDept}>{lecturer.dept}</Text>
                  </View>
                  <View style={styles.statusBadge}>
                    <View style={styles.statusDot} />
                    <Text style={styles.statusText}>ONLINE</Text>
                  </View>
                </View>

                <View style={styles.slotsContainer}>
                  {lecturer.slots.map((slot, i) => (
                    <TouchableOpacity 
                      key={i} 
                      style={styles.slotBtn}
                      onPress={() => bookSlot(slot, lecturer.name)}
                    >
                      <Text style={styles.slotText}>{slot}</Text>
                      <Ionicons name="add-circle" size={16} color="#6366F1" />
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            ))}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: { flex: 1, justifyContent: 'flex-end' },
  modalContent: { 
    width: '100%', 
    height: height * 0.85, 
    backgroundColor: '#FFFFFF', 
    borderTopLeftRadius: 40, 
    borderTopRightRadius: 40, 
    padding: 25,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -10 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 20
  },
  darkModal: { backgroundColor: '#1E293B' },
  topHandle: { width: 40, height: 4, backgroundColor: '#E2E8F0', borderRadius: 2, alignSelf: 'center', marginBottom: 20 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 25 },
  title: { fontSize: 24, fontWeight: '900', color: '#1E293B' },
  subtitle: { fontSize: 9, fontWeight: '900', color: '#6366F1', letterSpacing: 2, marginTop: 4 },
  whiteText: { color: '#FFF' },
  closeBtn: { padding: 8, backgroundColor: '#F1F5F9', borderRadius: 20 },
  promoCard: { borderRadius: 24, overflow: 'hidden', marginBottom: 30 },
  promoGradient: { padding: 20, flexDirection: 'row', alignItems: 'center' },
  promoTitle: { color: '#FFF', fontSize: 16, fontWeight: '900' },
  promoText: { color: 'rgba(255,255,255,0.8)', fontSize: 11, marginTop: 4 },
  sectionTitle: { fontSize: 12, fontWeight: '900', color: '#94A3B8', letterSpacing: 1, marginBottom: 15 },
  lecturerCard: { backgroundColor: '#F8FAFC', borderRadius: 24, padding: 20, marginBottom: 15 },
  darkCard: { backgroundColor: 'rgba(255,255,255,0.05)' },
  lecturerHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 15 },
  avatar: { width: 50, height: 50, borderRadius: 15, justifyContent: 'center', alignItems: 'center' },
  lecturerName: { fontSize: 16, fontWeight: '800', color: '#1E293B' },
  lecturerDept: { fontSize: 12, color: '#64748B', marginTop: 2 },
  statusBadge: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(16, 185, 129, 0.1)', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 },
  statusDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: '#10B981', marginRight: 6 },
  statusText: { fontSize: 10, fontWeight: '900', color: '#10B981' },
  slotsContainer: { flexDirection: 'row', gap: 10, flexWrap: 'wrap' },
  slotBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: '#FFFFFF', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 12, borderWeight: 1, borderColor: '#EEF2FF', elevation: 2 },
  slotText: { fontSize: 12, fontWeight: '700', color: '#4F46E5' },
});

export default VirtualOfficeHours;
