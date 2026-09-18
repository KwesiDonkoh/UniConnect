import React from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, Dimensions, ScrollView } from 'react-native';
import { BlurView } from 'expo-blur';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

const { width, height } = Dimensions.get('window');

const OriginalityMatrix = ({ visible, onClose, isDark }) => {
  const flags = [
    { student: 'Arthur Pendragon', id: '20491822', match: '94%', reason: 'Historical writing style mismatch. Possible AI generation.', color: '#EF4444' },
    { student: 'Guinevere Leodegrance', id: '20491833', match: '45%', reason: 'Heavy citation overlap with published journal.', color: '#F59E0B' },
  ];

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <BlurView intensity={100} tint={isDark ? 'dark' : 'light'} style={StyleSheet.absoluteFill} />
        
        <View style={[styles.modalContent, isDark && styles.darkModal]}>
          <TouchableOpacity style={styles.closeBtn} onPress={onClose}>
            <Ionicons name="close" size={28} color={isDark ? '#FFF' : '#000'} />
          </TouchableOpacity>

          <View style={styles.header}>
            <Ionicons name="finger-print" size={44} color="#6366F1" />
            <Text style={[styles.title, isDark && styles.whiteText]}>Originality Matrix</Text>
            <Text style={styles.subtitle}>DEEP NEURAL AUTHENTICITY TRACKING</Text>
          </View>

          <View style={styles.scanBox}>
            <Ionicons name="shield-checkmark" size={32} color="#10B981" />
            <Text style={styles.scanTitle}>SYSTEM SECURE</Text>
            <Text style={styles.scanDesc}>182 clean submissions. 2 anomalies detected.</Text>
          </View>

          <ScrollView style={styles.flagsList} showsVerticalScrollIndicator={false}>
            <Text style={styles.sectionHeader}>PRIORITY REVIEW ANOMALIES</Text>
            {flags.map(flag => (
              <View key={flag.id} style={[styles.flagCard, isDark && styles.darkCard]}>
                <View style={styles.flagHeader}>
                  <Text style={[styles.studentName, isDark && styles.whiteText]}>{flag.student}</Text>
                  <View style={[styles.matchBadge, { backgroundColor: flag.color }]}>
                    <Text style={styles.matchText}>{flag.match} FLAG</Text>
                  </View>
                </View>
                <Text style={styles.studentId}>ID: {flag.id}</Text>
                <Text style={styles.reasonText}>Analysis: {flag.reason}</Text>
                <TouchableOpacity style={styles.viewBtn}>
                  <Text style={styles.viewText}>REVIEW SUBMISSION</Text>
                </TouchableOpacity>
              </View>
            ))}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  modalContent: { width: width * 0.9, height: height * 0.85, backgroundColor: '#FFF', borderRadius: 40, padding: 30 },
  darkModal: { backgroundColor: '#0F172A' },
  closeBtn: { alignSelf: 'flex-end' },
  header: { alignItems: 'center', marginBottom: 20 },
  title: { fontSize: 24, fontWeight: '900', color: '#1E293B', marginTop: 10 },
  whiteText: { color: '#FFF' },
  subtitle: { fontSize: 9, fontWeight: '900', color: '#6366F1', letterSpacing: 2, marginTop: 4, textAlign: 'center' },
  scanBox: { backgroundColor: 'rgba(16, 185, 129, 0.05)', padding: 20, borderRadius: 20, alignItems: 'center', marginBottom: 25, borderWidth: 1, borderColor: 'rgba(16, 185, 129, 0.2)' },
  scanTitle: { fontSize: 12, fontWeight: '900', color: '#10B981', marginTop: 8 },
  scanDesc: { fontSize: 11, color: '#64748B', marginTop: 4 },
  flagsList: { flex: 1 },
  sectionHeader: { fontSize: 11, fontWeight: '900', color: '#EF4444', marginBottom: 12, letterSpacing: 1 },
  flagCard: { backgroundColor: '#F8FAFC', padding: 20, borderRadius: 16, marginBottom: 12, borderWidth: 1, borderColor: 'rgba(239, 68, 68, 0.2)' },
  darkCard: { backgroundColor: 'rgba(255,255,255,0.05)' },
  flagHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  studentName: { fontSize: 16, fontWeight: '800', color: '#1E293B' },
  matchBadge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 },
  matchText: { fontSize: 9, fontWeight: '900', color: '#FFF' },
  studentId: { fontSize: 10, color: '#94A3B8', marginTop: 2 },
  reasonText: { fontSize: 11, color: '#64748B', marginTop: 12, lineHeight: 18 },
  viewBtn: { marginTop: 15, alignSelf: 'flex-start', borderBottomWidth: 1, borderBottomColor: '#6366F1' },
  viewText: { fontSize: 10, fontWeight: '800', color: '#6366F1' },
});

export default OriginalityMatrix;
