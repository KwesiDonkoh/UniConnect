import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  Dimensions,
  Alert,
  Animated,
  ActivityIndicator,
  FlatList,
  Modal,
  TextInput,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useApp } from '../context/AppContext';

const { width, height } = Dimensions.get('window');

export default function SemesterModulesScreen({ navigation }) {
  const { user, csModules } = useApp();
  const [selectedSemester, setSelectedSemester] = useState(1);
  const [selectedLevel, setSelectedLevel] = useState(user?.academicLevel || '300');
  const [moduleData, setModuleData] = useState({});
  const [enrollmentStatus, setEnrollmentStatus] = useState({});
  const [showEnrollModal, setShowEnrollModal] = useState(false);
  const [selectedModule, setSelectedModule] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  // Animation
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (user?.uid) {
      loadModuleData();
      startAnimation();
    }
  }, [user?.uid, selectedLevel, selectedSemester]);

  const startAnimation = () => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 600,
      useNativeDriver: true,
    }).start();
  };

  const loadModuleData = async () => {
    try {
      setIsLoading(true);
      
      // Comprehensive module data for all levels
      const allModules = {
        '100': {
          1: [
            { code: 'CSM101', name: 'Introduction to Computer Science', credits: 3, lecturer: 'Dr. Smith', enrolled: true, grade: null, status: 'in_progress' },
            { code: 'CSM111', name: 'Programming Fundamentals with C', credits: 3, lecturer: 'Prof. Johnson', enrolled: true, grade: null, status: 'in_progress' },
            { code: 'MATH101', name: 'Algebra and Trigonometry', credits: 3, lecturer: 'Dr. Williams', enrolled: true, grade: null, status: 'in_progress' },
            { code: 'STAT101', name: 'Introduction to Statistics', credits: 3, lecturer: 'Prof. Brown', enrolled: true, grade: null, status: 'in_progress' },
            { code: 'ENG101', name: 'English Composition', credits: 2, lecturer: 'Dr. Davis', enrolled: true, grade: null, status: 'in_progress' },
            { code: 'CSM121', name: 'Computer Hardware Fundamentals', credits: 3, lecturer: 'Prof. Wilson', enrolled: false, grade: null, status: 'available' }
          ],
          2: [
            { code: 'CSM131', name: 'Programming with C++', credits: 3, lecturer: 'Dr. Thompson', enrolled: false, grade: null, status: 'available' },
            { code: 'CSM141', name: 'Logic Design', credits: 3, lecturer: 'Prof. Miller', enrolled: false, grade: null, status: 'available' },
            { code: 'MATH121', name: 'Calculus I', credits: 3, lecturer: 'Dr. Moore', enrolled: false, grade: null, status: 'available' },
            { code: 'CSM151', name: 'Web Development Basics', credits: 3, lecturer: 'Prof. Taylor', enrolled: false, grade: null, status: 'available' },
            { code: 'PHYS101', name: 'Physics for Computer Science', credits: 3, lecturer: 'Dr. Anderson', enrolled: false, grade: null, status: 'available' },
            { code: 'CSM161', name: 'Introduction to Algorithms', credits: 3, lecturer: 'Prof. Thomas', enrolled: false, grade: null, status: 'available' }
          ]
        },
        '200': {
          1: [
            { code: 'CSM201', name: 'Systems Analysis and Design', credits: 3, lecturer: 'Dr. Jackson', enrolled: true, grade: 'A-', status: 'completed' },
            { code: 'CSM211', name: 'Object Oriented Programming with Java', credits: 3, lecturer: 'Prof. White', enrolled: true, grade: 'B+', status: 'completed' },
            { code: 'CSM221', name: 'Computer Architecture', credits: 3, lecturer: 'Dr. Harris', enrolled: true, grade: 'A', status: 'completed' },
            { code: 'MATH201', name: 'Discrete Mathematics I', credits: 3, lecturer: 'Prof. Martin', enrolled: true, grade: 'B', status: 'completed' },
            { code: 'CSM231', name: 'Database Fundamentals', credits: 3, lecturer: 'Dr. Garcia', enrolled: true, grade: 'A-', status: 'completed' },
            { code: 'CSM241', name: 'Operating Systems Concepts', credits: 3, lecturer: 'Prof. Rodriguez', enrolled: true, grade: 'B+', status: 'completed' }
          ],
          2: [
            { code: 'CSM251', name: 'Software Engineering Principles', credits: 3, lecturer: 'Dr. Lewis', enrolled: true, grade: 'A', status: 'completed' },
            { code: 'CSM261', name: 'Data Structures and Algorithms', credits: 3, lecturer: 'Prof. Lee', enrolled: true, grade: 'A-', status: 'completed' },
            { code: 'CSM271', name: 'Computer Networks Basics', credits: 3, lecturer: 'Dr. Walker', enrolled: true, grade: 'B+', status: 'completed' },
            { code: 'MATH221', name: 'Discrete Mathematics II', credits: 3, lecturer: 'Prof. Hall', enrolled: true, grade: 'B', status: 'completed' },
            { code: 'CSM281', name: 'Human Computer Interaction', credits: 3, lecturer: 'Dr. Allen', enrolled: true, grade: 'A', status: 'completed' },
            { code: 'CSM291', name: 'Mobile App Development', credits: 3, lecturer: 'Prof. Young', enrolled: true, grade: 'A-', status: 'completed' }
          ]
        },
        '300': {
          1: [
            { code: 'CSM301', name: 'Advanced Software Engineering', credits: 3, lecturer: 'Dr. King', enrolled: true, grade: null, status: 'in_progress' },
            { code: 'CSM311', name: 'Database Management Systems', credits: 3, lecturer: 'Prof. Wright', enrolled: true, grade: null, status: 'in_progress' },
            { code: 'CSM321', name: 'Computer Networks', credits: 3, lecturer: 'Dr. Lopez', enrolled: true, grade: null, status: 'in_progress' },
            { code: 'CSM331', name: 'Artificial Intelligence', credits: 3, lecturer: 'Prof. Hill', enrolled: true, grade: null, status: 'in_progress' },
            { code: 'MATH301', name: 'Statistics for Computer Science', credits: 3, lecturer: 'Dr. Scott', enrolled: true, grade: null, status: 'in_progress' },
            { code: 'CSM341', name: 'Cybersecurity Fundamentals', credits: 3, lecturer: 'Prof. Green', enrolled: false, grade: null, status: 'available' }
          ],
          2: [
            { code: 'CSM351', name: 'Advanced Algorithms', credits: 3, lecturer: 'Dr. Adams', enrolled: false, grade: null, status: 'available' },
            { code: 'CSM361', name: 'Machine Learning', credits: 3, lecturer: 'Prof. Baker', enrolled: false, grade: null, status: 'available' },
            { code: 'CSM371', name: 'Cloud Computing', credits: 3, lecturer: 'Dr. Gonzalez', enrolled: false, grade: null, status: 'available' },
            { code: 'CSM381', name: 'Data Mining', credits: 3, lecturer: 'Prof. Nelson', enrolled: false, grade: null, status: 'available' },
            { code: 'CSM391', name: 'Project Management in IT', credits: 3, lecturer: 'Dr. Carter', enrolled: false, grade: null, status: 'available' },
            { code: 'CSM3A1', name: 'Internship/Industrial Attachment', credits: 6, lecturer: 'Industry Supervisor', enrolled: false, grade: null, status: 'available' }
          ]
        },
        '400': {
          1: [
            { code: 'CSM401', name: 'Advanced Database Systems', credits: 3, lecturer: 'Dr. Mitchell', enrolled: false, grade: null, status: 'available' },
            { code: 'CSM411', name: 'Software Architecture', credits: 3, lecturer: 'Prof. Perez', enrolled: false, grade: null, status: 'available' },
            { code: 'CSM421', name: 'Advanced AI and Expert Systems', credits: 3, lecturer: 'Dr. Roberts', enrolled: false, grade: null, status: 'available' },
            { code: 'CSM431', name: 'Distributed Systems', credits: 3, lecturer: 'Prof. Turner', enrolled: false, grade: null, status: 'available' },
            { code: 'CSM441', name: 'Advanced Cybersecurity', credits: 3, lecturer: 'Dr. Phillips', enrolled: false, grade: null, status: 'available' },
            { code: 'CSM451', name: 'Research Methods in Computer Science', credits: 3, lecturer: 'Prof. Campbell', enrolled: false, grade: null, status: 'available' }
          ],
          2: [
            { code: 'CSM461', name: 'Senior Project I', credits: 4, lecturer: 'Project Supervisor', enrolled: false, grade: null, status: 'available' },
            { code: 'CSM471', name: 'Advanced Machine Learning', credits: 3, lecturer: 'Dr. Parker', enrolled: false, grade: null, status: 'available' },
            { code: 'CSM481', name: 'Blockchain Technology', credits: 3, lecturer: 'Prof. Evans', enrolled: false, grade: null, status: 'available' },
            { code: 'CSM491', name: 'Senior Project II', credits: 4, lecturer: 'Project Supervisor', enrolled: false, grade: null, status: 'available' },
            { code: 'CSM4A1', name: 'Industry Seminar', credits: 2, lecturer: 'Industry Experts', enrolled: false, grade: null, status: 'available' },
            { code: 'CSM4B1', name: 'Ethics in Computing', credits: 2, lecturer: 'Dr. Edwards', enrolled: false, grade: null, status: 'available' }
          ]
        }
      };

      setModuleData(allModules);

      // Mock enrollment status
      const mockEnrollmentStatus = {};
      Object.keys(allModules).forEach(level => {
        Object.keys(allModules[level]).forEach(semester => {
          allModules[level][semester].forEach(module => {
            mockEnrollmentStatus[module.code] = module.enrolled;
          });
        });
      });
      setEnrollmentStatus(mockEnrollmentStatus);

    } catch (error) {
      console.error('Error loading module data:', error);
      Alert.alert('Error', 'Failed to load module data');
    } finally {
      setIsLoading(false);
    }
  };

  const enrollInModule = async (moduleCode) => {
    try {
      setEnrollmentStatus(prev => ({
        ...prev,
        [moduleCode]: true
      }));

      // Update module data
      setModuleData(prev => {
        const updated = { ...prev };
        Object.keys(updated).forEach(level => {
          Object.keys(updated[level]).forEach(semester => {
            updated[level][semester] = updated[level][semester].map(module => 
              module.code === moduleCode 
                ? { ...module, enrolled: true, status: 'in_progress' }
                : module
            );
          });
        });
        return updated;
      });

      Alert.alert('Success!', `Successfully enrolled in ${moduleCode}! 🎓`);
      setShowEnrollModal(false);
    } catch (error) {
      console.error('Error enrolling in module:', error);
      Alert.alert('Error', 'Failed to enroll in module');
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed': return '#10B981';
      case 'in_progress': return '#F59E0B';
      case 'available': return '#6B7280';
      case 'prerequisite_required': return '#EF4444';
      default: return '#6B7280';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed': return 'checkmark-circle';
      case 'in_progress': return 'time';
      case 'available': return 'add-circle';
      case 'prerequisite_required': return 'lock-closed';
      default: return 'help-circle';
    }
  };

  const getGradeColor = (grade) => {
    if (!grade) return '#6B7280';
    switch (grade) {
      case 'A+': case 'A': return '#10B981';
      case 'A-': return '#059669';
      case 'B+': return '#F59E0B';
      case 'B': return '#D97706';
      case 'B-': return '#B45309';
      case 'C+': case 'C': case 'C-': return '#EF4444';
      case 'D+': case 'D': return '#DC2626';
      default: return '#6B7280';
    }
  };

  const calculateSemesterStats = (modules) => {
    const totalCredits = modules.reduce((sum, module) => sum + module.credits, 0);
    const enrolledModules = modules.filter(module => module.enrolled);
    const completedModules = modules.filter(module => module.status === 'completed');
    const enrolledCredits = enrolledModules.reduce((sum, module) => sum + module.credits, 0);
    
    return {
      totalModules: modules.length,
      enrolledModules: enrolledModules.length,
      completedModules: completedModules.length,
      totalCredits,
      enrolledCredits,
      completionRate: modules.length > 0 ? (completedModules.length / modules.length * 100).toFixed(1) : 0
    };
  };

  const renderModuleCard = ({ item }) => (
    <TouchableOpacity
      style={[
        styles.moduleCard,
        { borderLeftColor: getStatusColor(item.status), borderLeftWidth: 4 }
      ]}
      onPress={() => {
        if (item.status === 'available') {
          setSelectedModule(item);
          setShowEnrollModal(true);
        } else {
          navigation.navigate('Chat', { courseCode: item.code });
        }
      }}
      activeOpacity={0.7}
    >
      <View style={styles.moduleHeader}>
        <View style={styles.moduleLeft}>
          <Text style={styles.moduleCode}>{item.code}</Text>
          <Text style={styles.moduleName}>{item.name}</Text>
          <Text style={styles.moduleLecturer}>👨‍🏫 {item.lecturer}</Text>
        </View>
        
        <View style={styles.moduleRight}>
          <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) }]}>
            <Ionicons name={getStatusIcon(item.status)} size={14} color="#FFFFFF" />
            <Text style={styles.statusText}>
              {item.status.replace('_', ' ').toUpperCase()}
            </Text>
          </View>
          
          {item.grade && (
            <View style={[styles.gradeBadge, { backgroundColor: getGradeColor(item.grade) }]}>
              <Text style={styles.gradeText}>{item.grade}</Text>
            </View>
          )}
        </View>
      </View>

      <View style={styles.moduleFooter}>
        <View style={styles.creditsContainer}>
          <Ionicons name="school" size={16} color="#64748B" />
          <Text style={styles.creditsText}>{item.credits} Credits</Text>
        </View>
        
        {item.status === 'available' && (
          <TouchableOpacity
            style={styles.enrollButton}
            onPress={() => {
              setSelectedModule(item);
              setShowEnrollModal(true);
            }}
          >
            <Ionicons name="add" size={16} color="#4F46E5" />
            <Text style={styles.enrollButtonText}>Enroll</Text>
          </TouchableOpacity>
        )}

        {item.status === 'in_progress' && (
          <TouchableOpacity
            style={styles.joinChatButton}
            onPress={() => navigation.navigate('Chat', { courseCode: item.code })}
          >
            <Ionicons name="chatbubbles" size={16} color="#10B981" />
            <Text style={styles.joinChatButtonText}>Join Chat</Text>
          </TouchableOpacity>
        )}
      </View>
    </TouchableOpacity>
  );

  const levels = ['100', '200', '300', '400'];
  const semesters = [1, 2];
  const currentModules = moduleData[selectedLevel]?.[selectedSemester] || [];
  const semesterStats = calculateSemesterStats(currentModules);

  if (!user) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#4F46E5" />
          <Text style={styles.loadingText}>Loading modules...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#1E293B" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Semester Modules</Text>
        <TouchableOpacity onPress={() => navigation.navigate('CourseRegistration')}>
          <Ionicons name="add" size={24} color="#4F46E5" />
        </TouchableOpacity>
      </View>

      <Animated.View style={{ flex: 1, opacity: fadeAnim }}>
        {/* Level and Semester Selectors */}
        <View style={styles.selectorContainer}>
          <View style={styles.selectorSection}>
            <Text style={styles.selectorLabel}>Academic Level</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.selectorScrollView}>
              {levels.map((level) => (
                <TouchableOpacity
                  key={level}
                  style={[
                    styles.levelSelector,
                    selectedLevel === level && styles.selectedSelector
                  ]}
                  onPress={() => setSelectedLevel(level)}
                >
                  <Text style={[
                    styles.selectorText,
                    selectedLevel === level && styles.selectedSelectorText
                  ]}>
                    Level {level}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          <View style={styles.selectorSection}>
            <Text style={styles.selectorLabel}>Semester</Text>
            <View style={styles.semesterContainer}>
              {semesters.map((semester) => (
                <TouchableOpacity
                  key={semester}
                  style={[
                    styles.semesterSelector,
                    selectedSemester === semester && styles.selectedSelector
                  ]}
                  onPress={() => setSelectedSemester(semester)}
                >
                  <Text style={[
                    styles.selectorText,
                    selectedSemester === semester && styles.selectedSelectorText
                  ]}>
                    Semester {semester}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </View>

        {/* Statistics Card */}
        <View style={styles.statsCard}>
          <LinearGradient
            colors={['#4F46E5', '#7C3AED']}
            style={styles.statsGradient}
          >
            <Text style={styles.statsTitle}>Level {selectedLevel} • Semester {selectedSemester}</Text>
            
            <View style={styles.statsGrid}>
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>{semesterStats.enrolledModules}</Text>
                <Text style={styles.statLabel}>Enrolled</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>{semesterStats.completedModules}</Text>
                <Text style={styles.statLabel}>Completed</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>{semesterStats.enrolledCredits}</Text>
                <Text style={styles.statLabel}>Credits</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>{semesterStats.completionRate}%</Text>
                <Text style={styles.statLabel}>Progress</Text>
              </View>
            </View>
          </LinearGradient>
        </View>

        {/* Modules List */}
        <View style={styles.modulesContainer}>
          {isLoading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#4F46E5" />
              <Text style={styles.loadingText}>Loading modules...</Text>
            </View>
          ) : currentModules.length > 0 ? (
            <FlatList
              data={currentModules}
              keyExtractor={(item) => item.code}
              renderItem={renderModuleCard}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.modulesList}
            />
          ) : (
            <View style={styles.emptyState}>
              <Ionicons name="school-outline" size={64} color="#CBD5E1" />
              <Text style={styles.emptyTitle}>No Modules Available</Text>
              <Text style={styles.emptyText}>
                No modules found for Level {selectedLevel}, Semester {selectedSemester}
              </Text>
            </View>
          )}
        </View>
      </Animated.View>

      {/* Enrollment Modal */}
      <Modal
        visible={showEnrollModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowEnrollModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.enrollModal}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Enroll in Module</Text>
              <TouchableOpacity onPress={() => setShowEnrollModal(false)}>
                <Ionicons name="close" size={24} color="#64748B" />
              </TouchableOpacity>
            </View>

            {selectedModule && (
              <ScrollView style={styles.modalContent}>
                <View style={styles.modulePreview}>
                  <Text style={styles.previewCode}>{selectedModule.code}</Text>
                  <Text style={styles.previewName}>{selectedModule.name}</Text>
                  <Text style={styles.previewLecturer}>Lecturer: {selectedModule.lecturer}</Text>
                  <Text style={styles.previewCredits}>Credits: {selectedModule.credits}</Text>
                </View>

                <View style={styles.enrollmentInfo}>
                  <Text style={styles.infoTitle}>Enrollment Information</Text>
                  <Text style={styles.infoText}>
                    • This module is part of Level {selectedLevel}, Semester {selectedSemester}
                  </Text>
                  <Text style={styles.infoText}>
                    • You will gain access to course materials, assignments, and group chat
                  </Text>
                  <Text style={styles.infoText}>
                    • Enrollment is required to participate in lectures and submit assignments
                  </Text>
                  <Text style={styles.infoText}>
                    • You can withdraw from this module within the first 2 weeks
                  </Text>
                </View>
              </ScrollView>
            )}

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => setShowEnrollModal(false)}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.confirmEnrollButton}
                onPress={() => selectedModule && enrollInModule(selectedModule.code)}
              >
                <Text style={styles.confirmEnrollButtonText}>Confirm Enrollment</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#64748B',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1E293B',
  },
  selectorContainer: {
    backgroundColor: '#FFFFFF',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  selectorSection: {
    marginBottom: 16,
  },
  selectorLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#64748B',
    marginBottom: 8,
  },
  selectorScrollView: {
    flexDirection: 'row',
  },
  semesterContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  levelSelector: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#F1F5F9',
    marginRight: 8,
    minWidth: 80,
    alignItems: 'center',
  },
  semesterSelector: {
    flex: 1,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
  },
  selectedSelector: {
    backgroundColor: '#4F46E5',
  },
  selectorText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#64748B',
  },
  selectedSelectorText: {
    color: '#FFFFFF',
  },
  statsCard: {
    margin: 20,
    borderRadius: 16,
    overflow: 'hidden',
  },
  statsGradient: {
    padding: 20,
  },
  statsTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 16,
    textAlign: 'center',
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#E2E8F0',
  },
  modulesContainer: {
    flex: 1,
    paddingHorizontal: 20,
  },
  modulesList: {
    paddingBottom: 20,
  },
  moduleCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  moduleHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  moduleLeft: {
    flex: 1,
    marginRight: 12,
  },
  moduleCode: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1E293B',
    marginBottom: 4,
  },
  moduleName: {
    fontSize: 14,
    color: '#64748B',
    marginBottom: 6,
    lineHeight: 20,
  },
  moduleLecturer: {
    fontSize: 12,
    color: '#94A3B8',
  },
  moduleRight: {
    alignItems: 'flex-end',
    gap: 8,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  statusText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  gradeBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  gradeText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  moduleFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  creditsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  creditsText: {
    fontSize: 12,
    color: '#64748B',
    fontWeight: '600',
  },
  enrollButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    backgroundColor: '#EEF2FF',
    gap: 4,
  },
  enrollButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#4F46E5',
  },
  joinChatButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    backgroundColor: '#ECFDF5',
    gap: 4,
  },
  joinChatButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#10B981',
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 40,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#64748B',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    color: '#94A3B8',
    textAlign: 'center',
    lineHeight: 20,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  enrollModal: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    width: width * 0.9,
    maxHeight: height * 0.7,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 24,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1E293B',
  },
  modalContent: {
    padding: 24,
    maxHeight: height * 0.4,
  },
  modulePreview: {
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
  },
  previewCode: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1E293B',
    marginBottom: 4,
  },
  previewName: {
    fontSize: 16,
    color: '#64748B',
    marginBottom: 8,
  },
  previewLecturer: {
    fontSize: 14,
    color: '#64748B',
    marginBottom: 4,
  },
  previewCredits: {
    fontSize: 14,
    fontWeight: '600',
    color: '#4F46E5',
  },
  enrollmentInfo: {
    marginBottom: 16,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1E293B',
    marginBottom: 12,
  },
  infoText: {
    fontSize: 14,
    color: '#64748B',
    lineHeight: 20,
    marginBottom: 8,
  },
  modalActions: {
    flexDirection: 'row',
    padding: 24,
    gap: 12,
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#64748B',
  },
  confirmEnrollButton: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 12,
    backgroundColor: '#4F46E5',
    alignItems: 'center',
  },
  confirmEnrollButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});
