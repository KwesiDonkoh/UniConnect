import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  Dimensions,
  FlatList,
  Alert,
  Animated,
  ActivityIndicator,
  Modal,
  TextInput,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useApp } from '../context/AppContext';

const { width, height } = Dimensions.get('window');

export default function GradebookScreen({ navigation }) {
  const { user, csModules } = useApp();
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [selectedView, setSelectedView] = useState('overview'); // 'overview', 'assignments', 'students'
  const [grades, setGrades] = useState({});
  const [assignments, setAssignments] = useState([]);
  const [students, setStudents] = useState([]);
  const [showGradeModal, setShowGradeModal] = useState(false);
  const [selectedGrade, setSelectedGrade] = useState(null);
  const [newGrade, setNewGrade] = useState('');

  // Animation refs
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;

  useEffect(() => {
    if (user?.uid) {
      loadGradebookData();
      startAnimations();
    }
  }, [user?.uid, selectedCourse]);

  const startAnimations = () => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 600,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const loadGradebookData = async () => {
    try {
      // Sample assignments data
      const sampleAssignments = [
        {
          id: 'assign1',
          title: 'Programming Assignment 1',
          type: 'assignment',
          totalMarks: 100,
          dueDate: '2024-12-20',
          submitted: 28,
          graded: 25,
          avgGrade: 78.5
        },
        {
          id: 'assign2',
          title: 'Midterm Exam',
          type: 'exam',
          totalMarks: 50,
          dueDate: '2024-12-22',
          submitted: 30,
          graded: 30,
          avgGrade: 72.3
        },
        {
          id: 'assign3',
          title: 'Lab Report 1',
          type: 'lab',
          totalMarks: 25,
          dueDate: '2024-12-18',
          submitted: 32,
          graded: 32,
          avgGrade: 85.7
        }
      ];

      // Sample students data
      const sampleStudents = [
        {
          id: 'stud1',
          name: 'Alice Johnson',
          studentId: 'CST2024001',
          email: 'alice@university.edu',
          grades: { assign1: 85, assign2: 42, assign3: 22 },
          attendance: 95,
          overall: 82.5
        },
        {
          id: 'stud2',
          name: 'Bob Smith',
          studentId: 'CST2024002',
          email: 'bob@university.edu',
          grades: { assign1: 78, assign2: 38, assign3: 20 },
          attendance: 88,
          overall: 76.2
        },
        {
          id: 'stud3',
          name: 'Carol Davis',
          studentId: 'CST2024003',
          email: 'carol@university.edu',
          grades: { assign1: 92, assign2: 45, assign3: 24 },
          attendance: 100,
          overall: 89.1
        },
        {
          id: 'stud4',
          name: 'David Wilson',
          studentId: 'CST2024004',
          email: 'david@university.edu',
          grades: { assign1: 70, assign2: 35, assign3: 18 },
          attendance: 82,
          overall: 68.7
        }
      ];

      setAssignments(sampleAssignments);
      setStudents(sampleStudents);
    } catch (error) {
      console.error('Error loading gradebook data:', error);
    }
  };

  const calculateGPA = (grades) => {
    const totalMarks = assignments.reduce((sum, assignment) => sum + assignment.totalMarks, 0);
    const studentMarks = assignments.reduce((sum, assignment) => {
      return sum + (grades[assignment.id] || 0);
    }, 0);
    return totalMarks > 0 ? ((studentMarks / totalMarks) * 4.0).toFixed(2) : '0.00';
  };

  const getGradeColor = (percentage) => {
    if (percentage >= 90) return '#10B981';
    if (percentage >= 80) return '#F59E0B';
    if (percentage >= 70) return '#EF4444';
    if (percentage >= 60) return '#8B5CF6';
    return '#6B7280';
  };

  const getGradeLetter = (percentage) => {
    if (percentage >= 90) return 'A+';
    if (percentage >= 85) return 'A';
    if (percentage >= 80) return 'B+';
    if (percentage >= 75) return 'B';
    if (percentage >= 70) return 'C+';
    if (percentage >= 65) return 'C';
    if (percentage >= 60) return 'D';
    return 'F';
  };

  const handleGradeUpdate = async (studentId, assignmentId, grade) => {
    try {
      // In a real app, this would update the database
      setStudents(prev => prev.map(student => {
        if (student.id === studentId) {
          const updatedGrades = { ...student.grades, [assignmentId]: parseFloat(grade) };
          const totalMarks = assignments.reduce((sum, a) => sum + a.totalMarks, 0);
          const studentMarks = assignments.reduce((sum, a) => sum + (updatedGrades[a.id] || 0), 0);
          const overall = totalMarks > 0 ? ((studentMarks / totalMarks) * 100) : 0;
          
          return {
            ...student,
            grades: updatedGrades,
            overall: overall.toFixed(1)
          };
        }
        return student;
      }));

      Alert.alert('Success', 'Grade updated successfully!');
      setShowGradeModal(false);
      setNewGrade('');
    } catch (error) {
      Alert.alert('Error', 'Failed to update grade. Please try again.');
    }
  };

  const renderCourseCard = ({ item }) => (
    <TouchableOpacity
      style={[styles.courseCard, selectedCourse?.id === item.id && styles.selectedCourseCard]}
      onPress={() => setSelectedCourse(item)}
    >
      <LinearGradient
        colors={['#4F46E5', '#7C3AED']}
        style={styles.courseGradient}
      >
        <Text style={styles.courseCode}>{item.code}</Text>
      </LinearGradient>
      <View style={styles.courseInfo}>
        <Text style={styles.courseName}>{item.name}</Text>
        <Text style={styles.courseDetails}>Semester {item.semester} • {item.credits} Credits</Text>
        <Text style={styles.courseInstructor}>Dr. {item.instructor?.split(' ').pop()}</Text>
      </View>
    </TouchableOpacity>
  );

  const renderAssignmentCard = ({ item }) => (
    <View style={styles.assignmentCard}>
      <View style={styles.assignmentHeader}>
        <View style={[styles.assignmentTypeIcon, { backgroundColor: getGradeColor(item.avgGrade) + '20' }]}>
          <Ionicons 
            name={item.type === 'exam' ? 'clipboard' : item.type === 'lab' ? 'flask' : 'document-text'} 
            size={20} 
            color={getGradeColor(item.avgGrade)} 
          />
        </View>
        <View style={styles.assignmentInfo}>
          <Text style={styles.assignmentTitle}>{item.title}</Text>
          <Text style={styles.assignmentDetails}>Due: {item.dueDate} • {item.totalMarks} marks</Text>
        </View>
        <Text style={[styles.avgGrade, { color: getGradeColor(item.avgGrade) }]}>
          {item.avgGrade.toFixed(1)}%
        </Text>
      </View>
      <View style={styles.assignmentStats}>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{item.submitted}</Text>
          <Text style={styles.statLabel}>Submitted</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{item.graded}</Text>
          <Text style={styles.statLabel}>Graded</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={[styles.statValue, { color: getGradeColor(item.avgGrade) }]}>
            {getGradeLetter(item.avgGrade)}
          </Text>
          <Text style={styles.statLabel}>Avg Grade</Text>
        </View>
      </View>
    </View>
  );

  const renderStudentCard = ({ item }) => (
    <View style={styles.studentCard}>
      <View style={styles.studentHeader}>
        <View style={styles.studentAvatar}>
          <Text style={styles.studentInitials}>
            {item.name.split(' ').map(n => n[0]).join('')}
          </Text>
        </View>
        <View style={styles.studentInfo}>
          <Text style={styles.studentName}>{item.name}</Text>
          <Text style={styles.studentId}>{item.studentId}</Text>
          <Text style={styles.studentEmail}>{item.email}</Text>
        </View>
        <View style={styles.studentGrades}>
          <Text style={[styles.overallGrade, { color: getGradeColor(item.overall) }]}>
            {item.overall}%
          </Text>
          <Text style={[styles.letterGrade, { color: getGradeColor(item.overall) }]}>
            {getGradeLetter(item.overall)}
          </Text>
        </View>
      </View>
      
      <View style={styles.gradesGrid}>
        {assignments.map((assignment) => (
          <TouchableOpacity
            key={assignment.id}
            style={styles.gradeItem}
            onPress={() => {
              setSelectedGrade({ studentId: item.id, assignmentId: assignment.id, assignment });
              setNewGrade((item.grades[assignment.id] || 0).toString());
              setShowGradeModal(true);
            }}
          >
            <Text style={styles.gradeAssignment}>{assignment.title.substring(0, 15)}...</Text>
            <Text style={[
              styles.gradeValue,
              { color: getGradeColor((item.grades[assignment.id] / assignment.totalMarks) * 100) }
            ]}>
              {item.grades[assignment.id] || 0}/{assignment.totalMarks}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  const renderOverview = () => {
    if (!selectedCourse) return null;

    const totalStudents = students.length;
    const avgGrade = students.reduce((sum, s) => sum + parseFloat(s.overall), 0) / totalStudents;
    const passRate = (students.filter(s => parseFloat(s.overall) >= 60).length / totalStudents) * 100;

    return (
      <ScrollView style={styles.overviewContainer}>
        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <LinearGradient colors={['#3B82F6', '#1D4ED8']} style={styles.statGradient}>
              <Ionicons name="people" size={24} color="#FFFFFF" />
            </LinearGradient>
            <Text style={styles.statNumber}>{totalStudents}</Text>
            <Text style={styles.statTitle}>Total Students</Text>
          </View>

          <View style={styles.statCard}>
            <LinearGradient colors={['#10B981', '#059669']} style={styles.statGradient}>
              <Ionicons name="trending-up" size={24} color="#FFFFFF" />
            </LinearGradient>
            <Text style={styles.statNumber}>{avgGrade.toFixed(1)}%</Text>
            <Text style={styles.statTitle}>Class Average</Text>
          </View>

          <View style={styles.statCard}>
            <LinearGradient colors={['#F59E0B', '#D97706']} style={styles.statGradient}>
              <Ionicons name="checkmark-circle" size={24} color="#FFFFFF" />
            </LinearGradient>
            <Text style={styles.statNumber}>{passRate.toFixed(1)}%</Text>
            <Text style={styles.statTitle}>Pass Rate</Text>
          </View>
        </View>

        <Text style={styles.sectionTitle}>Recent Assignments</Text>
        <FlatList
          data={assignments.slice(0, 3)}
          renderItem={renderAssignmentCard}
          keyExtractor={(item) => item.id}
          scrollEnabled={false}
        />
      </ScrollView>
    );
  };

  if (!user) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#4F46E5" />
          <Text style={styles.loadingText}>Loading gradebook...</Text>
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
        <Text style={styles.headerTitle}>Gradebook</Text>
        <TouchableOpacity onPress={() => Alert.alert('Export', 'Gradebook export feature coming soon!')}>
          <Ionicons name="download" size={24} color="#4F46E5" />
        </TouchableOpacity>
      </View>

      <Animated.View style={{ flex: 1, opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}>
        {/* Course Selection */}
        <View style={styles.courseSection}>
          <Text style={styles.sectionTitle}>Select Course</Text>
          <FlatList
            data={csModules}
            renderItem={renderCourseCard}
            keyExtractor={(item) => item.id}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.coursesList}
          />
        </View>

        {selectedCourse && (
          <>
            {/* View Tabs */}
            <View style={styles.tabContainer}>
              {[
                { id: 'overview', name: 'Overview', icon: 'analytics' },
                { id: 'assignments', name: 'Assignments', icon: 'clipboard' },
                { id: 'students', name: 'Students', icon: 'people' }
              ].map((tab) => (
                <TouchableOpacity
                  key={tab.id}
                  style={[styles.tab, selectedView === tab.id && styles.activeTab]}
                  onPress={() => setSelectedView(tab.id)}
                >
                  <Ionicons 
                    name={tab.icon} 
                    size={18} 
                    color={selectedView === tab.id ? '#4F46E5' : '#64748B'} 
                  />
                  <Text style={[
                    styles.tabText,
                    selectedView === tab.id && styles.activeTabText
                  ]}>
                    {tab.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Content */}
            <View style={styles.content}>
              {selectedView === 'overview' && renderOverview()}
              {selectedView === 'assignments' && (
                <FlatList
                  data={assignments}
                  renderItem={renderAssignmentCard}
                  keyExtractor={(item) => item.id}
                  showsVerticalScrollIndicator={false}
                />
              )}
              {selectedView === 'students' && (
                <FlatList
                  data={students}
                  renderItem={renderStudentCard}
                  keyExtractor={(item) => item.id}
                  showsVerticalScrollIndicator={false}
                />
              )}
            </View>
          </>
        )}
      </Animated.View>

      {/* Grade Edit Modal */}
      <Modal
        visible={showGradeModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowGradeModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.gradeModal}>
            <Text style={styles.modalTitle}>Edit Grade</Text>
            {selectedGrade && (
              <>
                <Text style={styles.modalSubtitle}>
                  {selectedGrade.assignment.title}
                </Text>
                <Text style={styles.modalInfo}>
                  Max Score: {selectedGrade.assignment.totalMarks}
                </Text>
                <TextInput
                  style={styles.gradeInput}
                  value={newGrade}
                  onChangeText={setNewGrade}
                  placeholder="Enter grade"
                  keyboardType="numeric"
                />
                <View style={styles.modalActions}>
                  <TouchableOpacity
                    style={styles.cancelButton}
                    onPress={() => setShowGradeModal(false)}
                  >
                    <Text style={styles.cancelButtonText}>Cancel</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.saveButton}
                    onPress={() => handleGradeUpdate(
                      selectedGrade.studentId,
                      selectedGrade.assignmentId,
                      newGrade
                    )}
                  >
                    <Text style={styles.saveButtonText}>Save</Text>
                  </TouchableOpacity>
                </View>
              </>
            )}
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
  courseSection: {
    paddingVertical: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1E293B',
    marginBottom: 16,
    paddingHorizontal: 20,
  },
  coursesList: {
    paddingHorizontal: 20,
  },
  courseCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginRight: 16,
    width: 200,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  selectedCourseCard: {
    borderWidth: 2,
    borderColor: '#4F46E5',
  },
  courseGradient: {
    width: 50,
    height: 50,
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  courseCode: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  courseInfo: {
    flex: 1,
  },
  courseName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1E293B',
    marginBottom: 4,
  },
  courseDetails: {
    fontSize: 12,
    color: '#64748B',
    marginBottom: 2,
  },
  courseInstructor: {
    fontSize: 12,
    color: '#64748B',
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    marginHorizontal: 20,
    borderRadius: 12,
    padding: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 8,
    gap: 8,
  },
  activeTab: {
    backgroundColor: '#4F46E5',
  },
  tabText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#64748B',
  },
  activeTabText: {
    color: '#FFFFFF',
  },
  content: {
    flex: 1,
    marginTop: 20,
    paddingHorizontal: 20,
  },
  overviewContainer: {
    flex: 1,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  statCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    flex: 1,
    marginHorizontal: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  statGradient: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  statNumber: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1E293B',
    marginBottom: 4,
  },
  statTitle: {
    fontSize: 12,
    color: '#64748B',
    textAlign: 'center',
  },
  assignmentCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  assignmentHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  assignmentTypeIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  assignmentInfo: {
    flex: 1,
  },
  assignmentTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1E293B',
    marginBottom: 4,
  },
  assignmentDetails: {
    fontSize: 12,
    color: '#64748B',
  },
  avgGrade: {
    fontSize: 18,
    fontWeight: '700',
  },
  assignmentStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1E293B',
  },
  statLabel: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
  },
  studentCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  studentHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  studentAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#4F46E5',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  studentInitials: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  studentInfo: {
    flex: 1,
  },
  studentName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1E293B',
    marginBottom: 2,
  },
  studentId: {
    fontSize: 12,
    color: '#64748B',
    marginBottom: 2,
  },
  studentEmail: {
    fontSize: 12,
    color: '#64748B',
  },
  studentGrades: {
    alignItems: 'center',
  },
  overallGrade: {
    fontSize: 18,
    fontWeight: '700',
  },
  letterGrade: {
    fontSize: 14,
    fontWeight: '600',
  },
  gradesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  gradeItem: {
    backgroundColor: '#F8FAFC',
    borderRadius: 8,
    padding: 8,
    minWidth: (width - 72) / 3,
    alignItems: 'center',
  },
  gradeAssignment: {
    fontSize: 10,
    color: '#64748B',
    marginBottom: 4,
    textAlign: 'center',
  },
  gradeValue: {
    fontSize: 12,
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  gradeModal: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 24,
    width: width * 0.8,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1E293B',
    marginBottom: 8,
    textAlign: 'center',
  },
  modalSubtitle: {
    fontSize: 16,
    color: '#64748B',
    marginBottom: 4,
    textAlign: 'center',
  },
  modalInfo: {
    fontSize: 14,
    color: '#64748B',
    marginBottom: 16,
    textAlign: 'center',
  },
  gradeInput: {
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    marginBottom: 24,
    textAlign: 'center',
  },
  modalActions: {
    flexDirection: 'row',
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#64748B',
  },
  saveButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: '#4F46E5',
    alignItems: 'center',
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});
