import React from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, Dimensions, ScrollView } from 'react-native';
import { BlurView } from 'expo-blur';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

const { width, height } = Dimensions.get('window');

const AIThesisMentor = ({ visible, onClose, isDark }) => {
  const tools = [
    { name: 'Citation Automator', icon: 'book', color: '#3B82F6' },
    { name: 'Thesis Statement Gen', icon: 'flash', color: '#F59E0B' },
    { name: 'Literature Review AI', icon: 'search', color: '#10B981' },
    { name: 'Hypothesis Tester', icon: 'flask', color: '#8B5CF6' },
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
            <Ionicons name="ribbon" size={40} color="#F59E0B" />
            <Text style={[styles.title, isDark && styles.whiteText]}>AI Thesis Mentor</Text>
            <Text style={styles.subtitle}>ADVANCED RESEARCH COMMAND</Text>
          </View>

          <View style={styles.statsRow}>
            <View style={styles.stat}>
              <Text style={styles.statVal}>84%</Text>
              <Text style={styles.statLab}>PROGRESS</Text>
            </View>
            <View style={[styles.stat, { borderLeftWidth: 1, borderLeftColor: '#E2E8F0' }]}>
              <Text style={styles.statVal}>120</Text>
              <Text style={styles.statLab}>CITATIONS</Text>
            </View>
          </View>

          <ScrollView style={styles.toolGrid} contentContainerStyle={styles.gridContainer}>
            {tools.map(tool => (
              <TouchableOpacity key={tool.name} style={[styles.toolCard, isDark && styles.darkCard]}>
                <Ionicons name={tool.icon} size={32} color={tool.color} />
                <Text style={[styles.toolName, isDark && styles.whiteText]}>{tool.name}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          <TouchableOpacity style={styles.aiBtn}>
            <LinearGradient colors={['#F59E0B', '#F97316']} style={styles.gradient}>
              <Text style={styles.aiText}>GENERATE NEXT CHAPTER</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  modalContent: { width: width * 0.9, height: height * 0.85, padding: 30, backgroundColor: '#FFF', borderRadius: 40 },
  darkModal: { backgroundColor: '#0F172A' },
  closeBtn: { alignSelf: 'flex-end' },
  header: { alignItems: 'center', marginBottom: 20 },
  title: { fontSize: 24, fontWeight: '900', textAlign: 'center' },
  whiteText: { color: '#FFF' },
  subtitle: { fontSize: 10, fontWeight: '900', color: '#F59E0B', letterSpacing: 2, marginTop: 4 },
  statsRow: { flexDirection: 'row', justifyContent: 'center', gap: 40, marginVertical: 20 },
  stat: { alignItems: 'center', paddingLeft: 20 },
  statVal: { fontSize: 28, fontWeight: '900', color: '#1E293B' },
  statLab: { fontSize: 8, fontWeight: '800', color: '#94A3B8' },
  toolGrid: { flex: 1 },
  gridContainer: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
  toolCard: { width: '48%', height: 120, backgroundColor: '#F8FAFC', borderRadius: 24, padding: 20, justifyContent: 'center', alignItems: 'center', marginBottom: 15 },
  darkCard: { backgroundColor: 'rgba(255,255,255,0.05)' },
  toolName: { fontSize: 12, fontWeight: '800', color: '#1E293B', textAlign: 'center', marginTop: 10 },
  aiBtn: { height: 60, borderRadius: 20, overflow: 'hidden', marginTop: 15 },
  gradient: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  aiText: { color: '#FFF', fontWeight: '900', letterSpacing: 1 },
});

export default AIThesisMentor;
