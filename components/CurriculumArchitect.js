import React, { useState } from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, Dimensions, ScrollView, TextInput } from 'react-native';
import { BlurView } from 'expo-blur';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

const { width, height } = Dimensions.get('window');

const CurriculumArchitect = ({ visible, onClose, isDark }) => {
  const [loading, setLoading] = useState(false);
  const [courseName, setCourseName] = useState('');

  const generate = () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      onClose();
    }, 3000);
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <BlurView intensity={100} tint={isDark ? 'dark' : 'light'} style={StyleSheet.absoluteFill} />
        
        <View style={[styles.modalContent, isDark && styles.darkModal]}>
          <TouchableOpacity style={styles.closeBtn} onPress={onClose}>
            <Ionicons name="close" size={28} color={isDark ? '#FFF' : '#000'} />
          </TouchableOpacity>

          <View style={styles.header}>
            <Ionicons name="construct" size={40} color="#6366F1" />
            <Text style={[styles.title, isDark && styles.whiteText]}>Curriculum Architect</Text>
            <Text style={styles.subtitle}>AI-DRIVEN SYLLABUS DESIGN</Text>
          </View>

          <ScrollView style={styles.body} showsVerticalScrollIndicator={false}>
            <Text style={styles.label}>COURSE NAME / SUBJECT</Text>
            <TextInput 
              style={[styles.input, isDark && styles.darkInput]} 
              placeholder="e.g. Advanced Quantum Computing" 
              placeholderTextColor="#94A3B8"
              value={courseName}
              onChangeText={setCourseName}
            />

            <View style={styles.optionRow}>
              <View style={styles.option}>
                <Ionicons name="globe" size={18} color="#6366F1" />
                <Text style={styles.optionText}>Global Standards</Text>
              </View>
              <View style={styles.option}>
                <Ionicons name="flash" size={18} color="#F59E0B" />
                <Text style={styles.optionText}>Accelerated</Text>
              </View>
            </View>

            <TouchableOpacity style={styles.genBtn} onPress={generate} disabled={loading}>
              <LinearGradient colors={['#6366F1', '#4F46E5']} style={styles.gradient}>
                <Text style={styles.genText}>{loading ? 'ARCHITECTING...' : 'GENERATE SYLLABUS'}</Text>
              </LinearGradient>
            </TouchableOpacity>

            <View style={styles.previewBox}>
              <Text style={styles.previewTitle}>ARCHITECTURE PREVIEW</Text>
              <Text style={styles.previewDesc}>Your generated curriculum will include: Weekly Modules, AI-suggested Reading, Assessment Rubrics, and Industry Alignment.</Text>
            </View>
          </ScrollView>
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
  header: { alignItems: 'center', marginBottom: 30 },
  title: { fontSize: 22, fontWeight: '900', textAlign: 'center' },
  whiteText: { color: '#FFF' },
  subtitle: { fontSize: 10, fontWeight: '900', color: '#6366F1', letterSpacing: 2, marginTop: 4 },
  label: { fontSize: 10, fontWeight: '900', color: '#64748B', marginBottom: 10 },
  input: { backgroundColor: '#F8FAFC', padding: 20, borderRadius: 20, fontSize: 16, color: '#1E293B', marginBottom: 20 },
  darkInput: { backgroundColor: 'rgba(255,255,255,0.05)', color: '#FFF' },
  optionRow: { flexDirection: 'row', gap: 15, marginBottom: 30 },
  option: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: 'rgba(99, 102, 241, 0.05)', paddingHorizontal: 15, paddingVertical: 10, borderRadius: 12 },
  optionText: { fontSize: 11, fontWeight: '700', color: '#6366F1' },
  genBtn: { height: 60, borderRadius: 20, overflow: 'hidden' },
  gradient: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  genText: { color: '#FFF', fontWeight: '900', letterSpacing: 1 },
  previewBox: { marginTop: 40, padding: 25, backgroundColor: '#F8FAFC', borderRadius: 24, borderStyle: 'dashed', borderWidth: 2, borderColor: '#E2E8F0' },
  previewTitle: { fontSize: 10, fontWeight: '900', color: '#94A3B8', marginBottom: 8 },
  previewDesc: { fontSize: 12, color: '#64748B', lineHeight: 20 },
});

export default CurriculumArchitect;
