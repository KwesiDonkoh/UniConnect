import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  Dimensions,
  Animated,
  RefreshControl,
  FlatList,
  Modal,
  TextInput,
  Alert,
  Platform,
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { StatusBar } from 'expo-status-bar';
import { useApp } from '../context/AppContext';
import { useTheme } from '../components/ThemeProvider';

const { width, height } = Dimensions.get('window');

export default function EnhancedStudentsManagementScreen({ navigation }) {
  const { user, csModules } = useApp();
  const { isDark } = useTheme();
  const lecturerName = user?.name || 'Lecturer';
  const [refreshing, setRefreshing] = useState(false);
  const [selectedView, setSelectedView] = useState('overview');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLevel, setSelectedLevel] = useState('all');
  const [showStudentDetails, setShowStudentDetails] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [showAddStudent, setShowAddStudent] = useState(false);
  const [showAttendanceModal, setShowAttendanceModal] = useState(false);
  
  const fadeAnim = useRef(new Animated.Value(0)).current;

  // Mock student data - in a real app, this would come from a service
  const [studentsData] = useState([
    {
      id: '1',
      name: 'Alice Johnson',
      studentId: 'CST2024001',
      level: '200',
      email: 'alice.johnson@university.edu',
      avatar: '👩‍🎓',
      gpa: 3.8,
      attendance: 92,
      assignments: { completed: 18, total: 20 },
      lastActive: '2 hours ago',
      status: 'active',
      courses: ['CSM251', 'CSM253', 'CSM257'],
      performance: 'excellent',
      notes: 'Very engaged student, shows strong analytical skills',
    },
    {
      id: '2',
      name: 'Bob Smith',
      studentId: 'CST2024002',
      level: '300',
      email: 'bob.smith@university.edu',
      avatar: '👨‍🎓',
      gpa: 3.5,
      attendance: 88,
      assignments: { completed: 15, total: 18 },
      lastActive: '1 day ago',
      status: 'active',
      courses: ['CSM351', 'CSM353', 'CSM357'],
      performance: 'good',
      notes: 'Good understanding of concepts, needs help with practical applications',
    },
    {
      id: '3',
      name: 'Carol Davis',
      studentId: 'CST2024003',
      level: '100',
      email: 'carol.davis@university.edu',
      avatar: '👩‍🎓',
      gpa: 3.9,
      attendance: 95,
      assignments: { completed: 22, total: 22 },
      lastActive: '30 minutes ago',
      status: 'active',
      courses: ['CSM151', 'CSM153', 'CSM157'],
      performance: 'excellent',
      notes: 'Exceptional student, always prepared and participates actively',
    },
    {
      id: '4',
      name: 'David Wilson',
      studentId: 'CST2024004',
      level: '400',
      email: 'david.wilson@university.edu',
      avatar: '👨‍🎓',
      gpa: 3.7,
      attendance: 85,
      assignments: { completed: 12, total: 15 },
      lastActive: '3 days ago',
      status: 'inactive',
      courses: ['CSM451', 'CSM453', 'CSM457'],
      performance: 'average',
      notes: 'Struggling with advanced concepts, needs additional support',
    },
    {
      id: '5',
      name: 'Emma Brown',
      studentId: 'CST2024005',
      level: '200',
      email: 'emma.brown@university.edu',
      avatar: '👩‍🎓',
      gpa: 3.6,
      attendance: 90,
      assignments: { completed: 19, total: 20 },
      lastActive: '4 hours ago',
      status: 'active',
      courses: ['CSM251', 'CSM253', 'CSM257'],
      performance: 'good',
      notes: 'Consistent performer, good team player',
    },
    {
      id: '6',
      name: 'Frank Miller',
      studentId: 'CST2024006',
      level: '300',
      email: 'frank.miller@university.edu',
      avatar: '👨‍🎓',
      gpa: 3.4,
      attendance: 82,
      assignments: { completed: 14, total: 18 },
      lastActive: '2 days ago',
      status: 'active',
      courses: ['CSM351', 'CSM353', 'CSM357'],
      performance: 'average',
      notes: 'Shows improvement, needs encouragement',
    },
  ]);

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 1000,
      useNativeDriver: true,
    }).start();
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 1000);
  };

  const filteredStudents = studentsData.filter(student => {
    const matchesSearch = student.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         student.studentId.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesLevel = selectedLevel === 'all' || student.level === selectedLevel;
    return matchesSearch && matchesLevel;
  });

  const getPerformanceColor = (performance) => {
    switch (performance) {
      case 'excellent': return '#10B981';
      case 'good': return '#3B82F6';
      case 'average': return '#F59E0B';
      case 'poor': return '#EF4444';
      default: return '#64748B';
    }
  };

  const getStatusColor = (status) => {
    return status === 'active' ? '#10B981' : '#EF4444';
  };

  const handleStudentPress = (student) => {
    setSelectedStudent(student);
    setShowStudentDetails(true);
  };

  const handleAddStudent = () => {
    setShowAddStudent(true);
  };

  const handleAttendance = () => {
    setShowAttendanceModal(true);
  };

  const renderStudentCard = ({ item: student }) => (
    <TouchableOpacity
      style={[styles.studentCard, isDark && styles.studentCardDark]}
      onPress={() => handleStudentPress(student)}
    >
      <View style={[styles.studentCardHeader, isDark && styles.studentCardHeaderDark]}>
        <Text style={styles.studentAvatar}>{student.avatar}</Text>
        <View style={styles.studentInfo}>
          <Text style={[styles.studentName, isDark && styles.studentCardTextDark]}>{student.name}</Text>
          <Text style={[styles.studentId, isDark && styles.studentCardSubtextDark]}>{student.studentId}</Text>
          <Text style={[styles.studentLevel, isDark && styles.studentCardSubtextDark]}>Level {student.level}</Text>
        </View>
        <View style={styles.studentStats}>
          <View style={[styles.performanceBadge, { backgroundColor: getPerformanceColor(student.performance) }]}>
            <Text style={styles.performanceText}>{student.performance.toUpperCase()}</Text>
          </View>
          <View style={[styles.statusBadge, { backgroundColor: getStatusColor(student.status) }]}>
            <Text style={styles.statusText}>{student.status}</Text>
          </View>
        </View>
      </View>
      
      <View style={[styles.studentCardBody, isDark && styles.studentCardBodyDark]}>
        <View style={styles.statRow}>
          <View style={styles.statItem}>
            <Ionicons name="school" size={16} color={isDark ? '#94A3B8' : '#64748B'} />
            <Text style={[styles.statLabel, isDark && styles.studentCardSubtextDark]}>GPA</Text>
            <Text style={[styles.statValue, isDark && styles.studentCardTextDark]}>{student.gpa}</Text>
          </View>
          <View style={styles.statItem}>
            <Ionicons name="calendar" size={16} color={isDark ? '#94A3B8' : '#64748B'} />
            <Text style={[styles.statLabel, isDark && styles.studentCardSubtextDark]}>Attendance</Text>
            <Text style={[styles.statValue, isDark && styles.studentCardTextDark]}>{student.attendance}%</Text>
          </View>
          <View style={styles.statItem}>
            <Ionicons name="checkmark-circle" size={16} color={isDark ? '#94A3B8' : '#64748B'} />
            <Text style={[styles.statLabel, isDark && styles.studentCardSubtextDark]}>Assignments</Text>
            <Text style={[styles.statValue, isDark && styles.studentCardTextDark]}>{student.assignments.completed}/{student.assignments.total}</Text>
          </View>
        </View>
        
        <View style={styles.coursesRow}>
          <Text style={[styles.coursesLabel, isDark && styles.studentCardSubtextDark]}>Courses:</Text>
          <Text style={[styles.coursesText, isDark && styles.studentCardTextDark]}>{student.courses.join(', ')}</Text>
        </View>
        
        <View style={styles.lastActiveRow}>
          <Ionicons name="time" size={14} color={isDark ? '#64748B' : '#94A3B8'} />
          <Text style={[styles.lastActiveText, isDark && styles.studentCardSubtextDark]}>Last active: {student.lastActive}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  const renderOverview = () => (
    <View style={styles.overviewContainer}>
      {/* Statistics Cards */}
      <View style={styles.statsGrid}>
        <View style={styles.statCard}>
          <Ionicons name="people" size={24} color="#4F46E5" />
          <Text style={styles.statNumber}>{studentsData.length}</Text>
          <Text style={styles.statLabel}>Total Students</Text>
        </View>
        <View style={styles.statCard}>
          <Ionicons name="checkmark-circle" size={24} color="#10B981" />
          <Text style={styles.statNumber}>
            {studentsData.filter(s => s.status === 'active').length}
          </Text>
          <Text style={styles.statLabel}>Active Students</Text>
        </View>
        <View style={styles.statCard}>
          <Ionicons name="trophy" size={24} color="#F59E0B" />
          <Text style={styles.statNumber}>
            {studentsData.filter(s => s.performance === 'excellent').length}
          </Text>
          <Text style={styles.statLabel}>Excellent</Text>
        </View>
        <View style={styles.statCard}>
          <Ionicons name="trending-up" size={24} color="#8B5CF6" />
          <Text style={styles.statNumber}>
            {Math.round(studentsData.reduce((sum, s) => sum + s.gpa, 0) / studentsData.length * 10) / 10}
          </Text>
          <Text style={styles.statLabel}>Average GPA</Text>
        </View>
      </View>

      {/* Performance Distribution */}
      <View style={styles.performanceSection}>
        <Text style={styles.sectionTitle}>Performance Distribution</Text>
        <View style={styles.performanceBars}>
          {['excellent', 'good', 'average', 'poor'].map((perf) => {
            const count = studentsData.filter(s => s.performance === perf).length;
            const percentage = (count / studentsData.length) * 100;
            return (
              <View key={perf} style={styles.performanceBar}>
                <View style={styles.performanceBarHeader}>
                  <Text style={styles.performanceBarLabel}>{perf.toUpperCase()}</Text>
                  <Text style={styles.performanceBarCount}>{count}</Text>
                </View>
                <View style={styles.performanceBarContainer}>
                  <View 
                    style={[
                      styles.performanceBarFill, 
                      { 
                        width: `${percentage}%`,
                        backgroundColor: getPerformanceColor(perf)
                      }
                    ]} 
                  />
                </View>
              </View>
            );
          })}
        </View>
      </View>

      {/* Recent Activity */}
      <View style={styles.recentActivitySection}>
        <Text style={styles.sectionTitle}>Recent Student Activity</Text>
        <View style={styles.activityList}>
          {studentsData.slice(0, 5).map((student) => (
            <View key={student.id} style={styles.activityItem}>
              <Text style={styles.studentAvatar}>{student.avatar}</Text>
              <View style={styles.activityContent}>
                <Text style={styles.activityText}>
                  <Text style={styles.studentName}>{student.name}</Text> submitted assignment for {student.courses[0]}
                </Text>
                <Text style={styles.activityTime}>{student.lastActive}</Text>
              </View>
            </View>
          ))}
        </View>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={[styles.container, isDark && styles.darkContainer]}>
      <StatusBar style={isDark ? "dark" : "light"} />
      
      {/* Header: Students in your classes · Lecturer name */}
      <LinearGradient
        colors={isDark ? ['#1E293B', '#334155'] : ['#4F46E5', '#7C3AED']}
        style={styles.header}
      >
        <View style={styles.headerContent}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="arrow-back" size={24} color="white" />
          </TouchableOpacity>
          <View style={styles.headerTitleWrap}>
            <Text style={styles.headerTitle}>Students in your classes</Text>
            <Text style={styles.headerSubtitle}>{lecturerName}</Text>
          </View>
          <TouchableOpacity
            style={styles.addButton}
            onPress={handleAddStudent}
          >
            <Ionicons name="add" size={24} color="white" />
          </TouchableOpacity>
        </View>
      </LinearGradient>

      {/* Search and Filters */}
      <View style={[styles.searchContainer, isDark && styles.darkSearchContainer]}>
        <View style={styles.searchBox}>
          <Ionicons name="search" size={20} color="#64748B" />
          <TextInput
            style={styles.searchInput}
            placeholder="Search students by name or ID..."
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
        
        <View style={styles.filterContainer}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {['all', '100', '200', '300', '400'].map((level) => (
              <TouchableOpacity
                key={level}
                style={[
                  styles.filterButton,
                  isDark && styles.filterButtonDark,
                  selectedLevel === level && styles.filterButtonActive
                ]}
                onPress={() => setSelectedLevel(level)}
              >
                <Text style={[
                  styles.filterButtonText,
                  isDark && styles.filterButtonTextDark,
                  selectedLevel === level && styles.filterButtonTextActive
                ]}>
                  {level === 'all' ? 'All Levels' : `Level ${level}`}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      </View>

      {/* View Toggle */}
      <View style={styles.viewToggle}>
        <TouchableOpacity
          style={[
            styles.toggleButton,
            selectedView === 'overview' && styles.toggleButtonActive
          ]}
          onPress={() => setSelectedView('overview')}
        >
          <Ionicons name="grid" size={20} color={selectedView === 'overview' ? 'white' : '#64748B'} />
          <Text style={[
            styles.toggleButtonText,
            selectedView === 'overview' && styles.toggleButtonTextActive
          ]}>
            Overview
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[
            styles.toggleButton,
            selectedView === 'list' && styles.toggleButtonActive
          ]}
          onPress={() => setSelectedView('list')}
        >
          <Ionicons name="list" size={20} color={selectedView === 'list' ? 'white' : '#64748B'} />
          <Text style={[
            styles.toggleButtonText,
            selectedView === 'list' && styles.toggleButtonTextActive
          ]}>
            Student List
          </Text>
        </TouchableOpacity>
      </View>

      {/* Content */}
      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {selectedView === 'overview' ? renderOverview() : (
          <View style={styles.studentListContainer}>
            <FlatList
              data={filteredStudents}
              renderItem={renderStudentCard}
              keyExtractor={(item) => item.id}
              scrollEnabled={false}
              showsVerticalScrollIndicator={false}
            />
          </View>
        )}
      </ScrollView>

      {/* Student Details Modal */}
      <Modal
        visible={showStudentDetails}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setShowStudentDetails(false)}
            >
              <Ionicons name="close" size={24} color="#64748B" />
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Student Details</Text>
            <View style={{ width: 24 }} />
          </View>
          
          {selectedStudent && (
            <ScrollView style={styles.modalContent}>
              <View style={styles.studentDetailHeader}>
                <Text style={styles.studentDetailAvatar}>{selectedStudent.avatar}</Text>
                <Text style={styles.studentDetailName}>{selectedStudent.name}</Text>
                <Text style={styles.studentDetailId}>{selectedStudent.studentId}</Text>
                <Text style={styles.studentDetailLevel}>Level {selectedStudent.level}</Text>
              </View>
              
              <View style={styles.detailSection}>
                <Text style={styles.detailSectionTitle}>Academic Performance</Text>
                <View style={styles.detailStats}>
                  <View style={styles.detailStat}>
                    <Text style={styles.detailStatLabel}>GPA</Text>
                    <Text style={styles.detailStatValue}>{selectedStudent.gpa}</Text>
                  </View>
                  <View style={styles.detailStat}>
                    <Text style={styles.detailStatLabel}>Attendance</Text>
                    <Text style={styles.detailStatValue}>{selectedStudent.attendance}%</Text>
                  </View>
                  <View style={styles.detailStat}>
                    <Text style={styles.detailStatLabel}>Assignments</Text>
                    <Text style={styles.detailStatValue}>
                      {selectedStudent.assignments.completed}/{selectedStudent.assignments.total}
                    </Text>
                  </View>
                </View>
              </View>
              
              <View style={styles.detailSection}>
                <Text style={styles.detailSectionTitle}>Current Courses</Text>
                {selectedStudent.courses.map((course, index) => (
                  <View key={index} style={styles.courseItem}>
                    <Ionicons name="book" size={20} color="#4F46E5" />
                    <Text style={styles.courseText}>{course}</Text>
                  </View>
                ))}
              </View>
              
              <View style={styles.detailSection}>
                <Text style={styles.detailSectionTitle}>Notes</Text>
                <Text style={styles.notesText}>{selectedStudent.notes}</Text>
              </View>
              
              <View style={styles.actionButtons}>
                <TouchableOpacity style={styles.actionButton}>
                  <Ionicons name="mail" size={20} color="white" />
                  <Text style={styles.actionButtonText}>Send Message</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.actionButton}>
                  <Ionicons name="calendar" size={20} color="white" />
                  <Text style={styles.actionButtonText}>Schedule Meeting</Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
          )}
        </SafeAreaView>
      </Modal>

      {/* Add Student Modal */}
      <Modal
        visible={showAddStudent}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setShowAddStudent(false)}
            >
              <Ionicons name="close" size={24} color="#64748B" />
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Add New Student</Text>
            <View style={{ width: 24 }} />
          </View>
          
          <ScrollView style={styles.modalContent}>
            <Text style={styles.comingSoonText}>🚧 Add Student Feature Coming Soon!</Text>
            <Text style={styles.comingSoonSubtext}>
              This feature will allow you to manually add new students to your courses.
            </Text>
          </ScrollView>
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  darkContainer: {
    flex: 1,
    backgroundColor: '#0F172A',
  },
  header: {
    paddingTop: 20,
    paddingBottom: 20,
    paddingHorizontal: 20,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  backButton: {
    padding: 8,
  },
  headerTitleWrap: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
    textAlign: 'center',
  },
  headerSubtitle: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.9)',
    marginTop: 2,
    textAlign: 'center',
  },
  addButton: {
    padding: 8,
  },
  searchContainer: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 15,
    backgroundColor: 'white',
  },
  darkSearchContainer: {
    backgroundColor: '#1E293B',
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F1F5F9',
    borderRadius: 12,
    paddingHorizontal: 15,
    marginBottom: 15,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 15,
    paddingHorizontal: 10,
    fontSize: 16,
  },
  filterContainer: {
    marginBottom: 10,
  },
  filterButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#F1F5F9',
    marginRight: 10,
  },
  filterButtonDark: {
    backgroundColor: '#334155',
  },
  filterButtonActive: {
    backgroundColor: '#4F46E5',
  },
  filterButtonText: {
    fontSize: 14,
    color: '#64748B',
    fontWeight: '500',
  },
  filterButtonTextDark: {
    color: '#94A3B8',
  },
  filterButtonTextActive: {
    color: 'white',
  },
  viewToggle: {
    flexDirection: 'row',
    backgroundColor: '#F1F5F9',
    marginHorizontal: 20,
    marginBottom: 20,
    borderRadius: 12,
    padding: 4,
  },
  toggleButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 8,
    gap: 8,
  },
  toggleButtonActive: {
    backgroundColor: '#4F46E5',
  },
  toggleButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#64748B',
  },
  toggleButtonTextActive: {
    color: 'white',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  overviewContainer: {
    gap: 25,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 15,
  },
  statCard: {
    width: (width - 60) / 2,
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  statNumber: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1E293B',
    marginTop: 8,
  },
  statLabel: {
    fontSize: 14,
    color: '#64748B',
    marginTop: 4,
    textAlign: 'center',
  },
  performanceSection: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1E293B',
    marginBottom: 15,
  },
  performanceBars: {
    gap: 15,
  },
  performanceBar: {
    gap: 8,
  },
  performanceBarHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  performanceBarLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
  },
  performanceBarCount: {
    fontSize: 14,
    color: '#64748B',
  },
  performanceBarContainer: {
    height: 8,
    backgroundColor: '#E2E8F0',
    borderRadius: 4,
  },
  performanceBarFill: {
    height: '100%',
    borderRadius: 4,
  },
  recentActivitySection: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  activityList: {
    gap: 15,
  },
  activityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  studentAvatar: {
    fontSize: 24,
  },
  activityContent: {
    flex: 1,
  },
  activityText: {
    fontSize: 14,
    color: '#374151',
    lineHeight: 20,
  },
  studentName: {
    fontWeight: '600',
  },
  activityTime: {
    fontSize: 12,
    color: '#94A3B8',
    marginTop: 2,
  },
  studentListContainer: {
    gap: 15,
  },
  studentCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    overflow: 'hidden',
  },
  studentCardDark: {
    backgroundColor: '#1E293B',
    borderColor: '#334155',
  },
  studentCardTextDark: {
    color: '#F8FAFC',
  },
  studentCardSubtextDark: {
    color: '#94A3B8',
  },
  studentCardBodyDark: {
    backgroundColor: '#0F172A',
    borderTopColor: '#334155',
  },
  studentCardHeader: {
    flexDirection: 'row',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  studentCardHeaderDark: {
    borderBottomColor: '#334155',
  },
  studentInfo: {
    flex: 1,
    marginLeft: 15,
  },
  studentName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1E293B',
    marginBottom: 4,
  },
  studentId: {
    fontSize: 14,
    color: '#64748B',
    marginBottom: 2,
  },
  studentLevel: {
    fontSize: 14,
    color: '#4F46E5',
    fontWeight: '500',
  },
  studentStats: {
    alignItems: 'flex-end',
    gap: 8,
  },
  performanceBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  performanceText: {
    fontSize: 10,
    color: 'white',
    fontWeight: '600',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 10,
    color: 'white',
    fontWeight: '600',
  },
  studentCardBody: {
    padding: 20,
  },
  statRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 15,
  },
  statItem: {
    alignItems: 'center',
    gap: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#64748B',
  },
  statValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1E293B',
  },
  coursesRow: {
    marginBottom: 10,
  },
  coursesLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
    marginBottom: 4,
  },
  coursesText: {
    fontSize: 14,
    color: '#64748B',
  },
  lastActiveRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  lastActiveText: {
    fontSize: 12,
    color: '#94A3B8',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
    backgroundColor: 'white',
  },
  closeButton: {
    padding: 8,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1E293B',
  },
  modalContent: {
    flex: 1,
    padding: 20,
  },
  studentDetailHeader: {
    alignItems: 'center',
    marginBottom: 30,
  },
  studentDetailAvatar: {
    fontSize: 48,
    marginBottom: 15,
  },
  studentDetailName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1E293B',
    marginBottom: 5,
  },
  studentDetailId: {
    fontSize: 16,
    color: '#64748B',
    marginBottom: 5,
  },
  studentDetailLevel: {
    fontSize: 16,
    color: '#4F46E5',
    fontWeight: '500',
  },
  detailSection: {
    marginBottom: 25,
  },
  detailSectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1E293B',
    marginBottom: 15,
  },
  detailStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  detailStat: {
    alignItems: 'center',
    flex: 1,
  },
  detailStatLabel: {
    fontSize: 14,
    color: '#64748B',
    marginBottom: 5,
  },
  detailStatValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1E293B',
  },
  courseItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 8,
  },
  courseText: {
    fontSize: 16,
    color: '#374151',
  },
  notesText: {
    fontSize: 16,
    color: '#64748B',
    lineHeight: 24,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 15,
    marginTop: 20,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#4F46E5',
    paddingVertical: 15,
    borderRadius: 12,
    gap: 8,
  },
  actionButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  comingSoonText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1E293B',
    textAlign: 'center',
    marginTop: 50,
    marginBottom: 15,
  },
  comingSoonSubtext: {
    fontSize: 16,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 24,
  },
});
