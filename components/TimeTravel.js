import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

const { width } = Dimensions.get('window');

const TimeTravel = ({ visible, onClose, isDark }) => {
  const memoryLogs = [
    { id: '1', date: 'Sept 15, 2025', action: 'Met 1st Study Buddy', icon: 'people', color: '#6366F1' },
    { id: '2', date: 'Oct 02, 2025', action: 'First Exam Countdown', icon: 'hourglass', color: '#EF4444' },
    { id: '3', date: 'Nov 12, 2025', action: 'Mastered Linear Algebra', icon: 'school', color: '#10B981' },
    { id: '4', date: 'Dec 20, 2025', action: 'Semester GPA: 3.8', icon: 'star', color: '#F59E0B' },
  ];

  return (
    <Modal visible={visible} transparent animationType="slide">
      <View style={styles.overlay}>
        <View style={[styles.container, isDark && styles.darkContainer]}>
          <View style={styles.header}>
            <View>
              <Text style={[styles.title, isDark && styles.darkText]}>Academic Time Travel 🕰️</Text>
              <Text style={styles.subtitle}>Relive your campus milestones</Text>
            </View>
            <TouchableOpacity onPress={onClose}>
              <Ionicons name="close-circle" size={32} color={isDark ? '#FFFFFF' : '#64748B'} />
            </TouchableOpacity>
          </View>

          <ScrollView contentContainerStyle={styles.content}>
            <View style={styles.timeline}>
              {memoryLogs.map((log, index) => (
                <View key={log.id} style={styles.timelineItem}>
                  <View style={styles.timelineLeft}>
                    <View style={[styles.dot, { backgroundColor: log.color }]} />
                    {index !== memoryLogs.length - 1 && <View style={styles.line} />}
                  </View>
                  <View style={[styles.logCard, isDark && styles.darkCard]}>
                    <Text style={styles.logDate}>{log.date}</Text>
                    <View style={styles.logRow}>
                      <Ionicons name={log.icon} size={20} color={log.color} />
                      <Text style={[styles.logAction, isDark && styles.darkText]}>{log.action}</Text>
                    </View>
                  </View>
                </View>
              ))}
            </View>

            <TouchableOpacity style={styles.rewindBtn}>
              <LinearGradient colors={['#1E293B', '#334155']} style={styles.rewindGradient}>
                <Ionicons name="play-back" size={24} color="#6366F1" />
                <Text style={styles.rewindText}>Open Full History</Text>
              </LinearGradient>
            </TouchableOpacity>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  container: { height: '80%', backgroundColor: '#F8FAFC', borderTopLeftRadius: 30, borderTopRightRadius: 30, padding: 20 },
  darkContainer: { backgroundColor: '#0F172A' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 25 },
  title: { fontSize: 20, fontWeight: '800', color: '#1E293B' },
  darkText: { color: '#FFFFFF' },
  subtitle: { fontSize: 13, color: '#64748B', fontWeight: '500' },
  content: { paddingBottom: 40 },
  timeline: { paddingLeft: 10 },
  timelineItem: { flexDirection: 'row', marginBottom: 20 },
  timelineLeft: { alignItems: 'center', marginRight: 15 },
  dot: { width: 14, height: 14, borderRadius: 7 },
  line: { width: 2, flex: 1, backgroundColor: '#E2E8F0', marginTop: 5 },
  logCard: { flex: 1, backgroundColor: '#FFFFFF', padding: 15, borderRadius: 20, elevation: 1 },
  darkCard: { backgroundColor: '#1E293B' },
  logDate: { fontSize: 12, color: '#64748B', fontWeight: '600', marginBottom: 5 },
  logRow: { flexDirection: 'row', alignItems: 'center' },
  logAction: { fontSize: 15, fontWeight: '700', color: '#1E293B', marginLeft: 10 },
  rewindBtn: { height: 60, borderRadius: 20, overflow: 'hidden', marginTop: 30 },
  rewindGradient: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center' },
  rewindText: { color: '#FFFFFF', fontWeight: '700', fontSize: 16, marginLeft: 10 },
});

export default TimeTravel;
