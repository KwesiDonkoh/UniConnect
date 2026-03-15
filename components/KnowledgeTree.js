import React from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

const { width, height } = Dimensions.get('window');

const TREE_DATA = [
  {
    level: 'Core Foundations',
    courses: [
      { id: 'CS101', name: 'Intro to Programming', status: 'completed' },
      { id: 'CS102', name: 'Data Structures', status: 'completed' },
    ],
  },
  {
    level: 'Advanced Core',
    courses: [
      { id: 'CS201', name: 'Algorithms', status: 'completed', prereq: ['CS102'] },
      { id: 'CS202', name: 'Operating Systems', status: 'in-progress', prereq: ['CS101'] },
      { id: 'CS203', name: 'Database Systems', status: 'completed', prereq: ['CS101'] },
    ],
  },
  {
    level: 'Specializations',
    courses: [
      { id: 'CS301', name: 'Artificial Intelligence', status: 'available', prereq: ['CS201'] },
      { id: 'CS302', name: 'Computer Networks', status: 'locked', prereq: ['CS202'] },
      { id: 'CS303', name: 'Cloud Computing', status: 'available', prereq: ['CS203'] },
    ],
  },
];

export default function KnowledgeTree({ visible, onClose, user }) {
  const getStatusStyle = (status) => {
    switch (status) {
      case 'completed': return styles.statusCompleted;
      case 'in-progress': return styles.statusInProgress;
      case 'available': return styles.statusAvailable;
      default: return styles.statusLocked;
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed': return 'checkmark-circle';
      case 'in-progress': return 'play-circle';
      case 'available': return 'unlock-outline';
      default: return 'lock-closed-outline';
    }
  };

  return (
    <Modal visible={visible} transparent={true} animationType="slide" onRequestClose={onClose}>
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.header}>
            <View>
              <Text style={styles.headerTitle}>Knowledge Tree</Text>
              <Text style={styles.headerSubtitle}>Visualize your academic growth</Text>
            </View>
            <TouchableOpacity style={styles.closeButton} onPress={onClose}>
              <Ionicons name="close" size={24} color="#64748B" />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.scrollContent} showsVerticalScrollIndicator={false}>
            {TREE_DATA.map((tier, tierIndex) => (
              <View key={tier.level} style={styles.tierContainer}>
                <View style={styles.tierHeader}>
                  <Text style={styles.tierTitle}>{tier.level}</Text>
                  <View style={styles.tierLine} />
                </View>

                <View style={styles.coursesGrid}>
                  {tier.courses.map((course) => (
                    <View key={course.id} style={styles.courseWrapper}>
                      <TouchableOpacity style={[styles.courseNode, getStatusStyle(course.status)]}>
                        <Ionicons name={getStatusIcon(course.status)} size={24} color="#FFFFFF" />
                        <Text style={styles.courseCode}>{course.id}</Text>
                        <Text style={styles.courseName} numberOfLines={2}>{course.name}</Text>
                      </TouchableOpacity>
                      {course.prereq && (
                        <View style={styles.prereqContainer}>
                          {course.prereq.map(p => (
                            <Text key={p} style={styles.prereqText}>Requires {p}</Text>
                          ))}
                        </View>
                      )}
                    </View>
                  ))}
                </View>
                
                {tierIndex < TREE_DATA.length - 1 && (
                  <View style={styles.connectorContainer}>
                    <Ionicons name="arrow-down" size={30} color="#CBD5E1" />
                  </View>
                )}
              </View>
            ))}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#F1F5F9',
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    height: height * 0.9,
    paddingTop: 24,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    marginBottom: 24,
  },
  headerTitle: {
    fontSize: 26,
    fontWeight: '800',
    color: '#1E293B',
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#64748B',
  },
  closeButton: {
    padding: 10,
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    elevation: 2,
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingBottom: 40,
  },
  tierContainer: {
    marginBottom: 20,
  },
  tierHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 15,
    marginBottom: 20,
  },
  tierTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#64748B',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  tierLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#CBD5E1',
  },
  coursesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 15,
    justifyContent: 'space-between',
  },
  courseWrapper: {
    width: (width - 63) / 2,
    marginBottom: 10,
  },
  courseNode: {
    padding: 16,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 140,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  statusCompleted: {
    backgroundColor: '#10B981',
  },
  statusInProgress: {
    backgroundColor: '#6366F1',
  },
  statusAvailable: {
    backgroundColor: '#F59E0B',
  },
  statusLocked: {
    backgroundColor: '#94A3B8',
  },
  courseCode: {
    color: 'rgba(255, 255, 255, 0.9)',
    fontSize: 12,
    fontWeight: '800',
    marginTop: 8,
  },
  courseName: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
    textAlign: 'center',
    marginTop: 4,
  },
  prereqContainer: {
    marginTop: 8,
    alignItems: 'center',
  },
  prereqText: {
    fontSize: 10,
    color: '#94A3B8',
    fontWeight: '600',
  },
  connectorContainer: {
    alignItems: 'center',
    marginVertical: 10,
  },
});
