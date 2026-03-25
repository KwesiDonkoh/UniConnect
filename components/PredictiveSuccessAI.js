import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
  Dimensions,
  Vibration,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';

const { width, height } = Dimensions.get('window');

const PredictiveSuccessAI = ({ visible, onClose, user, isDark }) => {
  const [predicting, setPredicting] = useState(false);

  // Mock data for prediction
  const metrics = [
    { label: 'Attendance Rate', value: '94%', color: '#10B981', icon: 'people' },
    { label: 'Quiz Avg.', value: '88%', color: '#6366F1', icon: 'help-circle' },
    { label: 'Study Hours/Week', value: '18h', color: '#F59E0B', icon: 'time' },
    { label: 'Peer Interaction', value: 'High', color: '#F472B6', icon: 'chatbubbles' },
  ];

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={[styles.container, isDark && styles.darkContainer]}>
          <View style={styles.header}>
            <View>
              <Text style={[styles.headerTitle, isDark && styles.darkText]}>AI Success Engine</Text>
              <Text style={styles.headerSubtitle}>Predictive academic analytics</Text>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <Ionicons name="close" size={24} color={isDark ? '#FFFFFF' : '#64748B'} />
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
            <LinearGradient colors={['#6366F1', '#4F46E5']} style={styles.heroCard}>
              <Text style={styles.predictLabel}>PREDICTED SEMESTER GPA</Text>
              <Text style={styles.predictValue}>3.88</Text>
              <View style={styles.confidenceRow}>
                <Ionicons name="checkmark-circle" size={16} color="#FFFFFF" />
                <Text style={styles.confidenceText}>92% Confidence Score</Text>
              </View>
            </LinearGradient>

            <Text style={[styles.sectionTitle, isDark && styles.darkText]}>Neural Metrics</Text>
            <View style={styles.metricsGrid}>
              {metrics.map((m, i) => (
                <View key={i} style={[styles.metricCard, isDark && styles.darkMetricCard]}>
                  <View style={[styles.metricIcon, { backgroundColor: m.color + '20' }]}>
                    <Ionicons name={m.icon} size={20} color={m.color} />
                  </View>
                  <Text style={styles.metricLabel}>{m.label}</Text>
                  <Text style={[styles.metricValue, isDark && styles.darkText]}>{m.value}</Text>
                </View>
              ))}
            </View>

            <View style={[styles.insightCard, isDark && styles.darkInsightCard]}>
              <View style={styles.insightHeader}>
                <Ionicons name="bulb" size={20} color="#F59E0B" />
                <Text style={styles.insightTitle}>STUDY PATH OPTIMIZATION</Text>
              </View>
              <Text style={styles.insightText}>
                Based on your current performance, focusing 2 more hours weekly on **Discrete Math** will increase your projected GPA by **0.05 points**.
              </Text>
              <TouchableOpacity style={styles.actionBtn}>
                <Text style={styles.actionBtnText}>Add to Calendar</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>

          <View style={styles.footer}>
            <Text style={styles.footerText}>Powered by UniConnect Neural Nexus</Text>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  container: { 
    backgroundColor: '#F8FAFC', 
    borderTopLeftRadius: 35, 
    borderTopRightRadius: 35, 
    height: height * 0.85, 
    paddingTop: 25 
  },
  darkContainer: { backgroundColor: '#0F172A' },
  header: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    paddingHorizontal: 25, 
    marginBottom: 20 
  },
  headerTitle: { fontSize: 22, fontWeight: '900', color: '#1E293B' },
  headerSubtitle: { fontSize: 13, color: '#64748B', marginTop: 2 },
  darkText: { color: '#FFFFFF' },
  closeBtn: { padding: 8, backgroundColor: '#F1F5F910', borderRadius: 20 },
  scrollContent: { paddingHorizontal: 25, paddingBottom: 40 },
  heroCard: { padding: 25, borderRadius: 25, marginBottom: 25, elevation: 5 },
  predictLabel: { color: 'rgba(255,255,255,0.7)', fontSize: 10, fontWeight: '800', letterSpacing: 1 },
  predictValue: { color: '#FFFFFF', fontSize: 48, fontWeight: '900', marginVertical: 10 },
  confidenceRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  confidenceText: { color: '#FFFFFF', fontSize: 12, fontWeight: '600' },
  sectionTitle: { fontSize: 18, fontWeight: '800', color: '#334155', marginBottom: 15 },
  metricsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 15, marginBottom: 25 },
  metricCard: { 
    width: (width - 65) / 2, 
    backgroundColor: '#FFFFFF', 
    padding: 15, 
    borderRadius: 20, 
    elevation: 2 
  },
  darkMetricCard: { backgroundColor: '#1E293B' },
  metricIcon: { width: 36, height: 36, borderRadius: 10, alignItems: 'center', justifyContent: 'center', marginBottom: 10 },
  metricLabel: { fontSize: 11, color: '#64748B', fontWeight: '600' },
  metricValue: { fontSize: 18, fontWeight: '800', color: '#1E293B', marginTop: 4 },
  insightCard: { backgroundColor: '#FFFFFF', padding: 20, borderRadius: 25, elevation: 2 },
  darkInsightCard: { backgroundColor: '#1E293B' },
  insightHeader: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 12 },
  insightTitle: { fontSize: 12, fontWeight: '900', color: '#F59E0B', letterSpacing: 0.5 },
  insightText: { fontSize: 14, color: '#64748B', lineHeight: 22 },
  actionBtn: { 
    backgroundColor: '#6366F1', 
    paddingVertical: 12, 
    borderRadius: 15, 
    alignItems: 'center', 
    marginTop: 20 
  },
  actionBtnText: { color: '#FFFFFF', fontWeight: '700', fontSize: 14 },
  footer: { padding: 20, alignItems: 'center' },
  footerText: { fontSize: 10, color: '#94A3B8', fontWeight: '600' },
});

export default PredictiveSuccessAI;
