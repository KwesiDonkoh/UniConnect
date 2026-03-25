import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
  Dimensions,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

import AttendanceManagement from './AttendanceManagement';

const { width, height } = Dimensions.get('window');

const LecturerAISuite = ({ visible, onClose, isDark }) => {
  const [activeTab, setActiveTab] = useState('Attendance');
  const [showAttendanceView, setShowAttendanceView] = useState(false);

  const tools = [
    { id: 'attendance', title: 'Attendance QR', icon: 'qr-code', desc: 'Auto-scan student attendance', color: ['#6366F1', '#4F46E5'] },
    { id: 'grader', title: 'AI Grader', icon: 'analytics', desc: 'Predictive essay scoring', color: ['#10B981', '#059669'] },
    { id: 'pulse', title: 'Lecture Pulse', icon: 'stats-chart', desc: 'Real-time student comprehension', color: ['#F59E0B', '#D97706'] },
    { id: 'optimizer', title: 'Class Optimizer', icon: 'flash', desc: 'Smart schedule recommendations', color: ['#EF4444', '#B91C1C'] },
  ];

  const handleToolPress = (toolId) => {
    if (toolId === 'attendance') {
      setShowAttendanceView(true);
    } else {
      Alert.alert('AI Module', `${toolId} is coming soon in the next update!`);
    }
  };

  if (showAttendanceView) {
    return (
      <Modal visible={visible} transparent animationType="fade">
        <AttendanceManagement isDark={isDark} onClose={() => setShowAttendanceView(false)} />
      </Modal>
    );
  }

  return (
    <Modal visible={visible} transparent animationType="slide">
      <View style={styles.overlay}>
        <View style={styles.container}>
          <LinearGradient colors={['#F8FAFC', '#F1F5F9']} style={styles.card}>
            <View style={styles.header}>
              <View>
                <Text style={styles.title}>Lecturer AI Suite</Text>
                <Text style={styles.subtitle}>Academic Empowerment Tools</Text>
              </View>
              <TouchableOpacity onPress={onClose}>
                <Ionicons name="close-circle" size={32} color="#64748B" />
              </TouchableOpacity>
            </View>

            <View style={styles.navRow}>
              {['Attendance', 'Grading', 'Analytics'].map((tab) => (
                <TouchableOpacity
                  key={tab}
                  onPress={() => setActiveTab(tab)}
                  style={[styles.navItem, activeTab === tab && styles.activeNav]}
                >
                  <Text style={[styles.navText, activeTab === tab && styles.activeNavText]}>{tab}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <ScrollView contentContainerStyle={styles.content}>
               <Text style={styles.sectionTitle}>Available AI Modules</Text>
               <View style={styles.grid}>
                 {tools.map((tool, index) => (
                   <TouchableOpacity 
                     key={index} 
                     style={styles.toolCard}
                     onPress={() => handleToolPress(tool.id)}
                     activeOpacity={0.7}
                   >
                     <LinearGradient colors={tool.color} style={styles.toolIcon}>
                       <Ionicons name={tool.icon} size={24} color="#FFFFFF" />
                     </LinearGradient>
                     <Text style={styles.toolTitle}>{tool.title}</Text>
                     <Text style={styles.toolDesc}>{tool.desc}</Text>
                   </TouchableOpacity>
                 ))}
               </View>

               <View style={styles.promoCard}>
                 <LinearGradient colors={['#1E293B', '#334155']} style={styles.promoGradient}>
                    <Ionicons name="sparkles" size={24} color="#6366F1" />
                    <View style={styles.promoText}>
                      <Text style={styles.promoTitle}>Auto-Feedback Engine</Text>
                      <Text style={styles.promoSub}>Enable AI to send personalized study tips to students based on attendance.</Text>
                    </View>
                    <TouchableOpacity style={styles.promoToggle}>
                       <View style={styles.toggleTrack} />
                       <View style={styles.toggleKnob} />
                    </TouchableOpacity>
                 </LinearGradient>
               </View>
            </ScrollView>

            <TouchableOpacity style={styles.mainButton} onPress={onClose}>
              <Text style={styles.mainButtonText}>Open Academic Portal</Text>
            </TouchableOpacity>
          </LinearGradient>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'flex-end',
  },
  container: {
    height: '85%',
    width: '100%',
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    overflow: 'hidden',
  },
  card: {
    flex: 1,
    padding: 24,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: '900',
    color: '#1E293B',
  },
  subtitle: {
    fontSize: 14,
    color: '#64748B',
    fontWeight: '600',
  },
  navRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 24,
  },
  navItem: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#E2E8F0',
  },
  activeNav: {
    backgroundColor: '#6366F1',
  },
  navText: {
    color: '#64748B',
    fontWeight: '700',
  },
  activeNavText: {
    color: '#FFFFFF',
  },
  content: {
    paddingBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#1E293B',
    marginBottom: 16,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  toolCard: {
    width: (width - 60) / 2,
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 20,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
  },
  toolIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  toolTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1E293B',
    marginBottom: 4,
  },
  toolDesc: {
    fontSize: 11,
    color: '#64748B',
    lineHeight: 16,
  },
  promoCard: {
    marginTop: 24,
    borderRadius: 20,
    overflow: 'hidden',
  },
  promoGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  promoText: {
    flex: 1,
    marginLeft: 12,
  },
  promoTitle: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '800',
  },
  promoSub: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 11,
    marginTop: 2,
    lineHeight: 16,
  },
  promoToggle: {
    width: 40,
    height: 24,
    justifyContent: 'center',
  },
  toggleTrack: {
    width: 40,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#6366F1',
  },
  toggleKnob: {
    position: 'absolute',
    right: 2,
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: '#FFFFFF',
  },
  mainButton: {
    backgroundColor: '#1E293B',
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: 'center',
    marginTop: 10,
  },
  mainButtonText: {
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: 16,
  },
});

export default LecturerAISuite;
