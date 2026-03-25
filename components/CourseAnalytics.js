import React from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, Dimensions, ScrollView } from 'react-native';
import { BlurView } from 'expo-blur';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

const { width, height } = Dimensions.get('window');

const CourseAnalytics = ({ visible, onClose, isDark }) => {
  const stats = [
    { label: 'Attendance', value: '94%', change: '+2%', color: '#10B981' },
    { label: 'Avg Grade', value: 'A-', change: 'Stable', color: '#6366F1' },
    { label: 'Completion', value: '78%', change: '+5%', color: '#F59E0B' },
  ];

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <BlurView intensity={80} tint={isDark ? 'dark' : 'light'} style={StyleSheet.absoluteFill} />
        
        <View style={[styles.modalContent, isDark && styles.darkModal]}>
          <View style={styles.header}>
            <Text style={[styles.title, isDark && styles.whiteText]}>Course Analytics</Text>
            <TouchableOpacity onPress={onClose}>
              <Ionicons name="close" size={28} color={isDark ? '#FFF' : '#000'} />
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false}>
            <View style={styles.statsGrid}>
              {stats.map((stat, i) => (
                <View key={i} style={[styles.statCard, isDark && styles.darkCard]}>
                  <Text style={styles.statLabel}>{stat.label.toUpperCase()}</Text>
                  <Text style={[styles.statValue, { color: stat.color }]}>{stat.value}</Text>
                  <Text style={styles.statChange}>{stat.change}</Text>
                </View>
              ))}
            </View>

            <View style={[styles.chartBox, isDark && styles.darkCard]}>
              <Text style={[styles.boxTitle, isDark && styles.whiteText]}>Performance Trend</Text>
              <View style={styles.placeholderChart}>
                <LinearGradient colors={['#6366F120', '#A855F720']} style={styles.chartBar} />
                <LinearGradient colors={['#6366F140', '#A855F740']} style={[styles.chartBar, { height: 100 }]} />
                <LinearGradient colors={['#6366F160', '#A855F760']} style={[styles.chartBar, { height: 140 }]} />
                <LinearGradient colors={['#6366F1', '#A855F7']} style={[styles.chartBar, { height: 160 }]} />
              </View>
              <View style={styles.xAxis}>
                <Text style={styles.axisLabel}>Wk 1</Text>
                <Text style={styles.axisLabel}>Wk 2</Text>
                <Text style={styles.axisLabel}>Wk 3</Text>
                <Text style={styles.axisLabel}>Current</Text>
              </View>
            </View>

            <TouchableOpacity style={styles.reportBtn}>
              <Text style={styles.reportText}>GENERATE NEURAL REPORT</Text>
            </TouchableOpacity>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  modalContent: { width: width * 0.95, height: height * 0.8, backgroundColor: '#FFF', borderRadius: 40, padding: 30, elevation: 20 },
  darkModal: { backgroundColor: '#1E293B' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 30 },
  title: { fontSize: 24, fontWeight: '900', color: '#1E293B' },
  whiteText: { color: '#FFF' },
  statsGrid: { flexDirection: 'row', gap: 10, marginBottom: 30 },
  statCard: { flex: 1, padding: 15, backgroundColor: '#F8FAFC', borderRadius: 20, alignItems: 'center' },
  darkCard: { backgroundColor: '#334155' },
  statLabel: { fontSize: 10, color: '#64748B', fontWeight: '800' },
  statValue: { fontSize: 22, fontWeight: '900', marginVertical: 5 },
  statChange: { fontSize: 10, color: '#10B981', fontWeight: '800' },
  chartBox: { padding: 25, backgroundColor: '#F8FAFC', borderRadius: 30, marginBottom: 30 },
  boxTitle: { fontSize: 18, fontWeight: '800', marginBottom: 20 },
  placeholderChart: { height: 160, flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-around' },
  chartBar: { width: 30, height: 60, borderRadius: 10 },
  xAxis: { flexDirection: 'row', justifyContent: 'space-around', marginTop: 15 },
  axisLabel: { fontSize: 10, color: '#64748B', fontWeight: '700' },
  reportBtn: { width: '100%', padding: 20, borderRadius: 20, backgroundColor: '#10B981', alignItems: 'center' },
  reportText: { color: '#FFF', fontWeight: '900', letterSpacing: 1 },
});

export default CourseAnalytics;
