import React from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, Dimensions, ScrollView } from 'react-native';
import { BlurView } from 'expo-blur';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

const { width, height } = Dimensions.get('window');

const CareerVoyager = ({ visible, onClose, isDark }) => {
  const careers = [
    { title: 'Fullstack Architect', match: '98%', skills: ['React Native', 'Node.js', 'Firebase'], color: '#6366F1' },
    { title: 'AI Ethics Officer', match: '85%', skills: ['Privacy Law', 'Algorithmic Fairness'], color: '#EC4899' },
    { title: 'Smart Systems Engineer', match: '72%', skills: ['IoT', 'Embedded Systems'], color: '#10B981' },
    { title: 'Data Alchemist', match: '64%', skills: ['Big Data', 'Prediction Models'], color: '#F59E0B' },
  ];

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <BlurView intensity={95} tint={isDark ? 'dark' : 'light'} style={StyleSheet.absoluteFill} />
        
        <View style={[styles.modalContent, isDark && styles.darkModal]}>
          <TouchableOpacity style={styles.closeBtn} onPress={onClose}>
            <Ionicons name="close" size={28} color={isDark ? '#FFF' : '#000'} />
          </TouchableOpacity>

          <Text style={[styles.title, isDark && styles.whiteText]}>Career Voyager</Text>
          <Text style={styles.subtitle}>AI-DRIVEN PATH DISCOVERY</Text>

          <ScrollView style={styles.body} showsVerticalScrollIndicator={false}>
            <View style={styles.constellationHeader}>
              <Ionicons name="sparkles" size={40} color="#F59E0B" />
              <Text style={styles.matchText}>Predicting your future constellations based on Semester 2 performance.</Text>
            </View>

            {careers.map((career) => (
              <LinearGradient key={career.title} colors={['rgba(255,255,255,0.05)', 'rgba(99, 102, 241, 0.05)']} style={styles.careerCard}>
                <View style={[styles.matchBadge, { backgroundColor: career.color }]}>
                  <Text style={styles.matchValue}>{career.match} MATCH</Text>
                </View>
                <Text style={[styles.careerTitle, isDark && styles.whiteText]}>{career.title}</Text>
                <View style={styles.skillList}>
                  {career.skills.map(skill => (
                    <View key={skill} style={styles.skillTag}>
                      <Text style={styles.skillText}>{skill}</Text>
                    </View>
                  ))}
                </View>
              </LinearGradient>
            ))}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  modalContent: { width: width * 0.9, height: height * 0.8, padding: 25, backgroundColor: '#FFF', borderRadius: 40 },
  darkModal: { backgroundColor: '#0F172A' },
  closeBtn: { position: 'absolute', right: 20, top: 20, zIndex: 10 },
  title: { fontSize: 24, fontWeight: '900', color: '#1E293B', textAlign: 'center' },
  whiteText: { color: '#FFFFFF' },
  subtitle: { fontSize: 10, fontWeight: '900', color: '#6366F1', letterSpacing: 2, textAlign: 'center', marginTop: 4 },
  body: { marginTop: 30 },
  constellationHeader: { alignItems: 'center', marginBottom: 30, paddingHorizontal: 20 },
  matchText: { fontSize: 12, color: '#94A3B8', textAlign: 'center', marginTop: 10, lineHeight: 18 },
  careerCard: { padding: 20, borderRadius: 24, marginBottom: 20, borderWidth: 1, borderColor: 'rgba(99, 102, 241, 0.1)' },
  matchBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 10, alignSelf: 'flex-start', marginBottom: 12 },
  matchValue: { fontSize: 9, fontWeight: '900', color: '#FFF' },
  careerTitle: { fontSize: 18, fontWeight: '800', color: '#1E293B' },
  skillList: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: 12 },
  skillTag: { backgroundColor: 'rgba(99, 102, 241, 0.1)', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 },
  skillText: { fontSize: 10, fontWeight: '700', color: '#6366F1' },
});

export default CareerVoyager;
