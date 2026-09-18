import React, { useState } from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, Dimensions, ScrollView } from 'react-native';
import { BlurView } from 'expo-blur';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

const { width, height } = Dimensions.get('window');

const AutoGraderAI = ({ visible, onClose, isDark }) => {
  const [grading, setGrading] = useState(false);

  const startGrading = () => {
    setGrading(true);
    setTimeout(() => {
      setGrading(false);
      onClose();
    }, 4000);
  };

  const batches = [
    { title: 'CS204 Midterm Essays', count: 184, status: 'Ready to Grade', color: '#F59E0B' },
    { title: 'Final Project Codes', count: 42, status: 'Grading Complete', color: '#10B981' },
    { title: 'Week 2 Quizzes', count: 210, status: 'Awaiting Submissions', color: '#94A3B8' },
  ];

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <BlurView intensity={100} tint={isDark ? 'dark' : 'light'} style={StyleSheet.absoluteFill} />
        
        <View style={[styles.modalContent, isDark && styles.darkModal]}>
          <TouchableOpacity style={styles.closeBtn} onPress={onClose}>
            <Ionicons name="close" size={28} color={isDark ? '#FFF' : '#000'} />
          </TouchableOpacity>

          <View style={styles.header}>
            <Ionicons name="checkmark-done-circle" size={40} color="#10B981" />
            <Text style={[styles.title, isDark && styles.whiteText]}>AutoGrader AI</Text>
            <Text style={styles.subtitle}>BULK ASSESSMENT ENGINE</Text>
          </View>

          <View style={styles.infoBox}>
            <Text style={styles.infoText}>Evaluate subjective essays, codebases, and short answers against your rubric in seconds. Generates personalized feedback for every student.</Text>
          </View>

          <ScrollView style={styles.batchList} showsVerticalScrollIndicator={false}>
            <Text style={styles.sectionHeader}>ASSIGNMENT BATCHES</Text>
            {batches.map(batch => (
              <View key={batch.title} style={[styles.batchCard, isDark && styles.darkCard]}>
                <View style={styles.batchInfo}>
                  <Text style={[styles.batchTitle, isDark && styles.whiteText]}>{batch.title}</Text>
                  <Text style={styles.batchCount}>{batch.count} Submissions</Text>
                </View>
                <View style={[styles.statusBadge, { backgroundColor: `${batch.color}20` }]}>
                  <Text style={[styles.statusText, { color: batch.color }]}>{batch.status}</Text>
                </View>
              </View>
            ))}
          </ScrollView>

          <TouchableOpacity style={styles.gradeBtn} onPress={startGrading} disabled={grading}>
            <LinearGradient colors={['#10B981', '#059669']} style={styles.gradient}>
              <Text style={styles.gradeText}>{grading ? "EVALUATING 184 SUBMISSIONS..." : "INITIATE AUTO-GRADER"}</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: { flex: 1, justifyContent: 'flex-end' },
  modalContent: { height: height * 0.8, backgroundColor: '#FFF', borderTopLeftRadius: 40, borderTopRightRadius: 40, padding: 30 },
  darkModal: { backgroundColor: '#0F172A' },
  closeBtn: { alignSelf: 'flex-end' },
  header: { alignItems: 'center', marginBottom: 20 },
  title: { fontSize: 24, fontWeight: '900', color: '#1E293B', marginTop: 10 },
  whiteText: { color: '#FFF' },
  subtitle: { fontSize: 9, fontWeight: '900', color: '#10B981', letterSpacing: 2, marginTop: 4 },
  infoBox: { backgroundColor: 'rgba(16, 185, 129, 0.05)', padding: 15, borderRadius: 16, marginBottom: 20 },
  infoText: { fontSize: 11, color: '#64748B', lineHeight: 18, textAlign: 'center' },
  batchList: { flex: 1 },
  sectionHeader: { fontSize: 11, fontWeight: '900', color: '#94A3B8', marginBottom: 12, letterSpacing: 1 },
  batchCard: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: '#F8FAFC', padding: 15, borderRadius: 16, marginBottom: 12 },
  darkCard: { backgroundColor: 'rgba(255,255,255,0.05)' },
  batchInfo: { flex: 1 },
  batchTitle: { fontSize: 14, fontWeight: '800', color: '#1E293B' },
  batchCount: { fontSize: 11, color: '#64748B', marginTop: 4 },
  statusBadge: { paddingHorizontal: 10, paddingVertical: 6, borderRadius: 8 },
  statusText: { fontSize: 9, fontWeight: '900' },
  gradeBtn: { height: 60, borderRadius: 20, overflow: 'hidden', marginTop: 15 },
  gradient: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  gradeText: { color: '#FFF', fontWeight: '900', letterSpacing: 1 },
});

export default AutoGraderAI;
