import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, Image, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Shadows } from '../themes/modernTheme';

const { width } = Dimensions.get('window');

const FeatureWelcomeGuide = ({ visible, onClose, isDark }) => {
  const [activeTab, setActiveTab] = useState(0);
  
  const slides = [
    { title: 'AI Study Tutors', icon: 'sparkles', desc: 'Get instant help with your complex academic questions.', color: ['#6366F1', '#A855F7'] },
    { title: 'Global University Hub', icon: 'globe', desc: 'Connect with peers and resources across the campus.', color: ['#10B981', '#059669'] },
    { title: 'Smart Productivity', icon: 'flash', desc: 'Pomodoro, GPA tracking, and assignment management.', color: ['#F59E0B', '#D97706'] },
  ];

  return (
    <Modal visible={visible} animationType="fade" transparent>
      <View style={styles.modalOverlay}>
        <LinearGradient
          colors={isDark ? ['#1E293B', '#0F172A'] : ['#FFFFFF', '#F8FAFC']}
          style={styles.modalContent}
        >
          <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
            <Ionicons name="close" size={24} color={isDark ? '#FFFFFF' : '#64748B'} />
          </TouchableOpacity>

          <View style={styles.iconContainer}>
            <LinearGradient colors={slides[activeTab].color} style={styles.iconGradient}>
              <Ionicons name={slides[activeTab].icon} size={48} color="#FFFFFF" />
            </LinearGradient>
          </View>

          <Text style={[styles.title, isDark && styles.textWhite]}>{slides[activeTab].title}</Text>
          <Text style={styles.desc}>{slides[activeTab].desc}</Text>

          <View style={styles.indicatorRow}>
            {slides.map((_, i) => (
              <View key={i} style={[styles.dot, activeTab === i && styles.activeDot, activeTab === i && { backgroundColor: slides[i].color[0] }]} />
            ))}
          </View>

          <View style={styles.btnRow}>
            {activeTab < slides.length - 1 ? (
              <TouchableOpacity style={styles.nextBtn} onPress={() => setActiveTab(activeTab + 1)}>
                <Text style={styles.nextText}>Next</Text>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity style={styles.finishBtn} onPress={onClose}>
                <LinearGradient colors={['#6366F1', '#4F46E5']} style={styles.finishGradient}>
                  <Text style={styles.finishText}>Get Started</Text>
                </LinearGradient>
              </TouchableOpacity>
            )}
          </View>
        </LinearGradient>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'center', alignItems: 'center' },
  modalContent: { width: width * 0.85, borderRadius: 32, padding: 30, alignItems: 'center', ...Shadows.lg },
  closeBtn: { position: 'absolute', top: 20, right: 20 },
  iconContainer: { marginBottom: 30 },
  iconGradient: { width: 100, height: 100, borderRadius: 50, justifyContent: 'center', alignItems: 'center', ...Shadows.md },
  title: { fontSize: 24, fontWeight: '900', color: '#1E293B', marginBottom: 12, textAlign: 'center' },
  desc: { fontSize: 16, color: '#64748B', textAlign: 'center', lineHeight: 24, marginBottom: 30 },
  indicatorRow: { flexDirection: 'row', gap: 8, marginBottom: 30 },
  dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#E2E8F0' },
  activeDot: { width: 24 },
  btnRow: { width: '100%' },
  nextBtn: { padding: 16, alignItems: 'center' },
  nextText: { color: '#6366F1', fontWeight: '800', fontSize: 16 },
  finishBtn: { borderRadius: 20, overflow: 'hidden' },
  finishGradient: { padding: 16, alignItems: 'center' },
  finishText: { color: '#FFFFFF', fontWeight: '800', fontSize: 16 },
  textWhite: { color: '#FFFFFF' },
});

export default FeatureWelcomeGuide;
