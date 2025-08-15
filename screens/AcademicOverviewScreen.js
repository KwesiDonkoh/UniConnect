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

export default function AcademicOverviewScreen({ navigation, route }) {
  const { user, csModules } = useApp();
  const [selectedTab, setSelectedTab] = useState(route?.params?.initialTab || 'overview');
  const [academicData, setAcademicData] = useState({});
  const [semesterGrades, setSemesterGrades] = useState([]);
  const [achievements, setAchievements] = useState([]);
  const [goals, setGoals] = useState([]);
  const [showGoalModal, setShowGoalModal] = useState(false);
  const [newGoal, setNewGoal] = useState({ title: '', description: '', deadline: '', priority: 'medium' });
  const [isLoading, setIsLoading] = useState(false);

  // Animation refs
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;

  useEffect(() => {
    if (user?.uid) {
      loadAcademicData();
      startAnimations();
    }
  }, [user?.uid]);

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

  const loadAcademicData = async () => {
    try {
      setIsLoading(true);
      
      // Mock comprehensive academic data
      const mockAcademicData = {
        personalInfo: {
          studentId: 'UNI2024001',
          fullName: user?.fullName || user?.name || 'John Doe',
          email: user?.email || 'john.doe@university.edu',
          phone: '+233 24 123 4567',
          level: user?.academicLevel || '300',
          program: 'Computer Science',
          department: 'Computer Science & Informatics',
          enrollmentDate: '2022-09-01',
          expectedGraduation: '2026-07-01',
          status: 'Active'
        },
        currentSemester: {
          semester: 1,
          year: '2024/2025',
          registeredCourses: csModules?.length || 6,
          totalCredits: (csModules?.length || 6) * 3,
          status: 'In Progress'
        },
        academicPerformance: {
          currentCGPA: 3.45,
          previousCGPA: 3.28,
          totalCreditsEarned: 54,
          totalCreditsRequired: 120,
          classRank: 15,
          totalStudents: 250,
          progressPercentage: 45
        }
      };

      const mockSemesterGrades = [
        {
          semester: 'Semester 1, 2024/2025',
          gpa: 3.45,
          courses: [
            { code: 'CSM351', name: 'Software Engineering', grade: 'A-', points: 3.7, credits: 3 },
            { code: 'CSM361', name: 'Database Management Systems', grade: 'B+', points: 3.3, credits: 3 },
            { code: 'CSM371', name: 'Computer Networks', grade: 'A', points: 4.0, credits: 3 },
            { code: 'CSM381', name: 'Artificial Intelligence', grade: 'B', points: 3.0, credits: 3 },
            { code: 'MATH363', name: 'Statistics for Computer Science', grade: 'A-', points: 3.7, credits: 3 },
            { code: 'CSM391', name: 'Project Management', grade: 'B+', points: 3.3, credits: 3 }
          ]
        },
        {
          semester: 'Semester 2, 2023/2024',
          gpa: 3.28,
          courses: [
            { code: 'CSM281', name: 'Object Oriented Programming with JAVA', grade: 'B+', points: 3.3, credits: 3 },
            { code: 'CSM271', name: 'Data Structures and Algorithms', grade: 'A-', points: 3.7, credits: 3 },
            { code: 'CSM291', name: 'Computer Organization', grade: 'B', points: 3.0, credits: 3 },
            { code: 'MATH263', name: 'Discrete Mathematics II', grade: 'B+', points: 3.3, credits: 3 },
            { code: 'CSM201', name: 'Systems Analysis and Design', grade: 'A', points: 4.0, credits: 3 },
            { code: 'ENG201', name: 'Technical Writing', grade: 'B', points: 3.0, credits: 2 }
          ]
        }
      ];

      const mockAchievements = [
        { id: 1, title: 'Dean\'s List', description: 'Achieved CGPA above 3.5', date: '2024-01-15', icon: '🏆', category: 'Academic' },
        { id: 2, title: 'Programming Contest Winner', description: 'First place in university coding competition', date: '2023-11-20', icon: '💻', category: 'Competition' },
        { id: 3, title: 'Community Service Award', description: '50+ hours of volunteer work', date: '2023-10-10', icon: '🤝', category: 'Service' },
        { id: 4, title: 'Research Assistant', description: 'Selected for AI research project', date: '2023-09-01', icon: '🔬', category: 'Research' }
      ];

      const mockGoals = [
        {
          id: 1,
          title: 'Achieve 3.8 CGPA',
          description: 'Improve academic performance to reach 3.8 CGPA by end of semester',
          deadline: '2024-12-15',
          priority: 'high',
          progress: 75,
          status: 'in_progress'
        },
        {
          id: 2,
          title: 'Complete Python Certification',
          description: 'Finish online Python certification course',
          deadline: '2024-11-30',
          priority: 'medium',
          progress: 40,
          status: 'in_progress'
        },
        {
          id: 3,
          title: 'Internship Application',
          description: 'Apply to top tech companies for summer internship',
          deadline: '2024-12-01',
          priority: 'high',
          progress: 20,
          status: 'not_started'
        }
      ];

      setAcademicData(mockAcademicData);
      setSemesterGrades(mockSemesterGrades);
      setAchievements(mockAchievements);
      setGoals(mockGoals);

    } catch (error) {
      console.error('Error loading academic data:', error);
      Alert.alert('Error', 'Failed to load academic data');
    } finally {
      setIsLoading(false);
    }
  };

  const createGoal = async () => {
    if (!newGoal.title.trim()) {
      Alert.alert('Error', 'Please enter a goal title');
      return;
    }

    const goal = {
      id: Date.now(),
      ...newGoal,
      progress: 0,
      status: 'not_started'
    };

    setGoals(prev => [goal, ...prev]);
    setNewGoal({ title: '', description: '', deadline: '', priority: 'medium' });
    setShowGoalModal(false);
    Alert.alert('Success!', 'Goal created successfully! 🎯');
  };

  const getGradeColor = (grade) => {
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

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return '#EF4444';
      case 'medium': return '#F59E0B';
      case 'low': return '#10B981';
      default: return '#6B7280';
    }
  };

  const renderOverviewTab = () => (
    <ScrollView showsVerticalScrollIndicator={false}>
      {/* Academic Summary Card */}
      <View style={styles.summaryCard}>
        <LinearGradient
          colors={['#4F46E5', '#7C3AED']}
          style={styles.summaryGradient}
        >
          <View style={styles.summaryHeader}>
            <Text style={styles.summaryTitle}>Academic Summary</Text>
            <Text style={styles.summarySubtitle}>Level {academicData.personalInfo?.level} • {academicData.personalInfo?.program}</Text>
          </View>

          <View style={styles.summaryStats}>
            <View style={styles.summaryStatItem}>
              <Text style={styles.summaryStatNumber}>{academicData.academicPerformance?.currentCGPA}</Text>
              <Text style={styles.summaryStatLabel}>Current CGPA</Text>
            </View>
            <View style={styles.summaryStatItem}>
              <Text style={styles.summaryStatNumber}>{academicData.academicPerformance?.totalCreditsEarned}</Text>
              <Text style={styles.summaryStatLabel}>Credits Earned</Text>
            </View>
            <View style={styles.summaryStatItem}>
              <Text style={styles.summaryStatNumber}>{academicData.academicPerformance?.classRank}</Text>
              <Text style={styles.summaryStatLabel}>Class Rank</Text>
            </View>
          </View>

          <View style={styles.progressContainer}>
            <Text style={styles.progressLabel}>Degree Progress</Text>
            <View style={styles.progressBar}>
              <View style={[styles.progressFill, { width: `${academicData.academicPerformance?.progressPercentage}%` }]} />
            </View>
            <Text style={styles.progressText}>
              {academicData.academicPerformance?.progressPercentage}% Complete • 
              {academicData.academicPerformance?.totalCreditsRequired - academicData.academicPerformance?.totalCreditsEarned} credits remaining
            </Text>
          </View>
        </LinearGradient>
      </View>

      {/* Current Semester */}
      <View style={styles.sectionCard}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>📚 Current Semester</Text>
          <TouchableOpacity onPress={() => navigation.navigate('CourseRegistration')}>
            <Text style={styles.sectionAction}>Manage Courses</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.semesterInfo}>
          <View style={styles.semesterDetail}>
            <Text style={styles.semesterLabel}>Semester</Text>
            <Text style={styles.semesterValue}>{academicData.currentSemester?.semester}, {academicData.currentSemester?.year}</Text>
          </View>
          <View style={styles.semesterDetail}>
            <Text style={styles.semesterLabel}>Registered Courses</Text>
            <Text style={styles.semesterValue}>{academicData.currentSemester?.registeredCourses} courses</Text>
          </View>
          <View style={styles.semesterDetail}>
            <Text style={styles.semesterLabel}>Total Credits</Text>
            <Text style={styles.semesterValue}>{academicData.currentSemester?.totalCredits} credits</Text>
          </View>
        </View>
      </View>

      {/* Recent Achievements */}
      <View style={styles.sectionCard}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>🏆 Recent Achievements</Text>
          <TouchableOpacity>
            <Text style={styles.sectionAction}>View All</Text>
          </TouchableOpacity>
        </View>

        {achievements.slice(0, 3).map((achievement) => (
          <View key={achievement.id} style={styles.achievementItem}>
            <Text style={styles.achievementIcon}>{achievement.icon}</Text>
            <View style={styles.achievementContent}>
              <Text style={styles.achievementTitle}>{achievement.title}</Text>
              <Text style={styles.achievementDescription}>{achievement.description}</Text>
              <Text style={styles.achievementDate}>
                {new Date(achievement.date).toLocaleDateString('en-US', { 
                  year: 'numeric', month: 'short', day: 'numeric' 
                })}
              </Text>
            </View>
            <View style={styles.achievementCategory}>
              <Text style={styles.achievementCategoryText}>{achievement.category}</Text>
            </View>
          </View>
        ))}
      </View>

      {/* Academic Goals */}
      <View style={styles.sectionCard}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>🎯 Academic Goals</Text>
          <TouchableOpacity onPress={() => setShowGoalModal(true)}>
            <Text style={styles.sectionAction}>Add Goal</Text>
          </TouchableOpacity>
        </View>

        {goals.slice(0, 3).map((goal) => (
          <View key={goal.id} style={styles.goalItem}>
            <View style={styles.goalHeader}>
              <Text style={styles.goalTitle}>{goal.title}</Text>
              <View style={[styles.priorityBadge, { backgroundColor: getPriorityColor(goal.priority) }]}>
                <Text style={styles.priorityText}>{goal.priority.toUpperCase()}</Text>
              </View>
            </View>
            <Text style={styles.goalDescription}>{goal.description}</Text>
            <View style={styles.goalProgress}>
              <View style={styles.goalProgressBar}>
                <View style={[styles.goalProgressFill, { width: `${goal.progress}%` }]} />
              </View>
              <Text style={styles.goalProgressText}>{goal.progress}%</Text>
            </View>
            <Text style={styles.goalDeadline}>Due: {new Date(goal.deadline).toLocaleDateString()}</Text>
          </View>
        ))}
      </View>
    </ScrollView>
  );

  const renderGradesTab = () => (
    <FlatList
      data={semesterGrades}
      keyExtractor={(item, index) => index.toString()}
      showsVerticalScrollIndicator={false}
      renderItem={({ item }) => (
        <View style={styles.semesterCard}>
          <View style={styles.semesterCardHeader}>
            <Text style={styles.semesterCardTitle}>{item.semester}</Text>
            <View style={styles.gpaContainer}>
              <Text style={styles.gpaLabel}>GPA</Text>
              <Text style={[styles.gpaValue, { color: item.gpa >= 3.5 ? '#10B981' : item.gpa >= 3.0 ? '#F59E0B' : '#EF4444' }]}>
                {item.gpa}
              </Text>
            </View>
          </View>

          {item.courses.map((course, index) => (
            <View key={index} style={styles.courseGradeItem}>
              <View style={styles.courseGradeLeft}>
                <Text style={styles.courseCode}>{course.code}</Text>
                <Text style={styles.courseName}>{course.name}</Text>
                <Text style={styles.courseCredits}>{course.credits} credits</Text>
              </View>
              <View style={styles.courseGradeRight}>
                <View style={[styles.gradeBadge, { backgroundColor: getGradeColor(course.grade) }]}>
                  <Text style={styles.gradeText}>{course.grade}</Text>
                </View>
                <Text style={styles.gradePoints}>{course.points}</Text>
              </View>
            </View>
          ))}
        </View>
      )}
    />
  );

  const renderPersonalTab = () => (
    <ScrollView showsVerticalScrollIndicator={false}>
      <View style={styles.personalCard}>
        <View style={styles.personalHeader}>
          <LinearGradient
            colors={['#10B981', '#059669']}
            style={styles.avatarGradient}
          >
            <Text style={styles.avatarText}>
              {academicData.personalInfo?.fullName?.split(' ').map(n => n[0]).join('').toUpperCase() || 'JD'}
            </Text>
          </LinearGradient>
          <View style={styles.personalInfo}>
            <Text style={styles.personalName}>{academicData.personalInfo?.fullName}</Text>
            <Text style={styles.personalTitle}>Level {academicData.personalInfo?.level} Student</Text>
            <Text style={styles.personalProgram}>{academicData.personalInfo?.program}</Text>
          </View>
        </View>

        <View style={styles.personalDetails}>
          <View style={styles.personalDetailItem}>
            <Ionicons name="card" size={20} color="#4F46E5" />
            <View style={styles.personalDetailContent}>
              <Text style={styles.personalDetailLabel}>Student ID</Text>
              <Text style={styles.personalDetailValue}>{academicData.personalInfo?.studentId}</Text>
            </View>
          </View>

          <View style={styles.personalDetailItem}>
            <Ionicons name="mail" size={20} color="#4F46E5" />
            <View style={styles.personalDetailContent}>
              <Text style={styles.personalDetailLabel}>Email</Text>
              <Text style={styles.personalDetailValue}>{academicData.personalInfo?.email}</Text>
            </View>
          </View>

          <View style={styles.personalDetailItem}>
            <Ionicons name="call" size={20} color="#4F46E5" />
            <View style={styles.personalDetailContent}>
              <Text style={styles.personalDetailLabel}>Phone</Text>
              <Text style={styles.personalDetailValue}>{academicData.personalInfo?.phone}</Text>
            </View>
          </View>

          <View style={styles.personalDetailItem}>
            <Ionicons name="business" size={20} color="#4F46E5" />
            <View style={styles.personalDetailContent}>
              <Text style={styles.personalDetailLabel}>Department</Text>
              <Text style={styles.personalDetailValue}>{academicData.personalInfo?.department}</Text>
            </View>
          </View>

          <View style={styles.personalDetailItem}>
            <Ionicons name="calendar" size={20} color="#4F46E5" />
            <View style={styles.personalDetailContent}>
              <Text style={styles.personalDetailLabel}>Enrollment Date</Text>
              <Text style={styles.personalDetailValue}>
                {new Date(academicData.personalInfo?.enrollmentDate).toLocaleDateString('en-US', {
                  year: 'numeric', month: 'long', day: 'numeric'
                })}
              </Text>
            </View>
          </View>

          <View style={styles.personalDetailItem}>
            <Ionicons name="school" size={20} color="#4F46E5" />
            <View style={styles.personalDetailContent}>
              <Text style={styles.personalDetailLabel}>Expected Graduation</Text>
              <Text style={styles.personalDetailValue}>
                {new Date(academicData.personalInfo?.expectedGraduation).toLocaleDateString('en-US', {
                  year: 'numeric', month: 'long'
                })}
              </Text>
            </View>
          </View>

          <View style={styles.personalDetailItem}>
            <Ionicons name="checkmark-circle" size={20} color="#10B981" />
            <View style={styles.personalDetailContent}>
              <Text style={styles.personalDetailLabel}>Status</Text>
              <Text style={[styles.personalDetailValue, { color: '#10B981', fontWeight: '600' }]}>
                {academicData.personalInfo?.status}
              </Text>
            </View>
          </View>
        </View>

        <TouchableOpacity style={styles.editProfileButton}>
          <LinearGradient
            colors={['#4F46E5', '#7C3AED']}
            style={styles.editProfileGradient}
          >
            <Ionicons name="create" size={20} color="#FFFFFF" />
            <Text style={styles.editProfileText}>Edit Profile</Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );

  const tabItems = [
    { id: 'overview', label: 'Overview', icon: 'home' },
    { id: 'grades', label: 'Grades', icon: 'school' },
    { id: 'personal', label: 'Profile', icon: 'person' }
  ];

  if (!user) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#4F46E5" />
          <Text style={styles.loadingText}>Loading academic overview...</Text>
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
        <Text style={styles.headerTitle}>Academic Overview</Text>
        <TouchableOpacity onPress={() => Alert.alert('Settings', 'Profile settings coming soon!')}>
          <Ionicons name="settings" size={24} color="#4F46E5" />
        </TouchableOpacity>
      </View>

      <Animated.View style={{ flex: 1, opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}>
        {/* Tab Navigation */}
        <View style={styles.tabContainer}>
          {tabItems.map((tab) => (
            <TouchableOpacity
              key={tab.id}
              style={[styles.tabItem, selectedTab === tab.id && styles.activeTab]}
              onPress={() => setSelectedTab(tab.id)}
            >
              <Ionicons 
                name={tab.icon} 
                size={20} 
                color={selectedTab === tab.id ? "#4F46E5" : "#94A3B8"} 
              />
              <Text style={[
                styles.tabLabel,
                selectedTab === tab.id && styles.activeTabLabel
              ]}>
                {tab.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Content */}
        <View style={styles.content}>
          {isLoading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#4F46E5" />
              <Text style={styles.loadingText}>Loading...</Text>
            </View>
          ) : (
            <>
              {selectedTab === 'overview' && renderOverviewTab()}
              {selectedTab === 'grades' && renderGradesTab()}
              {selectedTab === 'personal' && renderPersonalTab()}
            </>
          )}
        </View>
      </Animated.View>

      {/* Goal Creation Modal */}
      <Modal
        visible={showGoalModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowGoalModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.goalModal}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Create Academic Goal</Text>
              <TouchableOpacity onPress={() => setShowGoalModal(false)}>
                <Ionicons name="close" size={24} color="#64748B" />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalContent}>
              <TextInput
                style={styles.modalInput}
                placeholder="Goal title"
                value={newGoal.title}
                onChangeText={(text) => setNewGoal(prev => ({...prev, title: text}))}
              />

              <TextInput
                style={[styles.modalInput, styles.textArea]}
                placeholder="Description"
                value={newGoal.description}
                onChangeText={(text) => setNewGoal(prev => ({...prev, description: text}))}
                multiline
                numberOfLines={3}
              />

              <TextInput
                style={styles.modalInput}
                placeholder="Deadline (YYYY-MM-DD)"
                value={newGoal.deadline}
                onChangeText={(text) => setNewGoal(prev => ({...prev, deadline: text}))}
              />

              <Text style={styles.priorityLabel}>Priority Level</Text>
              <View style={styles.priorityContainer}>
                {['low', 'medium', 'high'].map((priority) => (
                  <TouchableOpacity
                    key={priority}
                    style={[
                      styles.priorityButton,
                      newGoal.priority === priority && styles.selectedPriority,
                      { backgroundColor: newGoal.priority === priority ? getPriorityColor(priority) : '#F1F5F9' }
                    ]}
                    onPress={() => setNewGoal(prev => ({...prev, priority}))}
                  >
                    <Text style={[
                      styles.priorityButtonText,
                      newGoal.priority === priority && styles.selectedPriorityText
                    ]}>
                      {priority.charAt(0).toUpperCase() + priority.slice(1)}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </ScrollView>

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={styles.modalCancelButton}
                onPress={() => setShowGoalModal(false)}
              >
                <Text style={styles.modalCancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.modalCreateButton}
                onPress={createGoal}
              >
                <Text style={styles.modalCreateText}>Create Goal</Text>
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
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 16,
    gap: 4,
  },
  activeTab: {
    borderBottomWidth: 2,
    borderBottomColor: '#4F46E5',
  },
  tabLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#94A3B8',
  },
  activeTabLabel: {
    color: '#4F46E5',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  summaryCard: {
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 20,
  },
  summaryGradient: {
    padding: 24,
  },
  summaryHeader: {
    marginBottom: 24,
  },
  summaryTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  summarySubtitle: {
    fontSize: 16,
    color: '#E2E8F0',
  },
  summaryStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  summaryStatItem: {
    alignItems: 'center',
  },
  summaryStatNumber: {
    fontSize: 28,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  summaryStatLabel: {
    fontSize: 12,
    color: '#E2E8F0',
  },
  progressContainer: {
    marginTop: 8,
  },
  progressLabel: {
    fontSize: 16,
    color: '#FFFFFF',
    marginBottom: 8,
    fontWeight: '600',
  },
  progressBar: {
    height: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 8,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#FFFFFF',
  },
  progressText: {
    fontSize: 14,
    color: '#E2E8F0',
  },
  sectionCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1E293B',
  },
  sectionAction: {
    fontSize: 14,
    fontWeight: '600',
    color: '#4F46E5',
  },
  semesterInfo: {
    gap: 12,
  },
  semesterDetail: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  semesterLabel: {
    fontSize: 14,
    color: '#64748B',
  },
  semesterValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1E293B',
  },
  achievementItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  achievementIcon: {
    fontSize: 24,
    marginRight: 16,
  },
  achievementContent: {
    flex: 1,
  },
  achievementTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1E293B',
    marginBottom: 4,
  },
  achievementDescription: {
    fontSize: 14,
    color: '#64748B',
    marginBottom: 4,
  },
  achievementDate: {
    fontSize: 12,
    color: '#94A3B8',
  },
  achievementCategory: {
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  achievementCategoryText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#4F46E5',
  },
  goalItem: {
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  goalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  goalTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1E293B',
    flex: 1,
    marginRight: 12,
  },
  priorityBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  priorityText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  goalDescription: {
    fontSize: 14,
    color: '#64748B',
    marginBottom: 12,
  },
  goalProgress: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  goalProgressBar: {
    flex: 1,
    height: 6,
    backgroundColor: '#F1F5F9',
    borderRadius: 3,
    marginRight: 12,
  },
  goalProgressFill: {
    height: '100%',
    backgroundColor: '#4F46E5',
    borderRadius: 3,
  },
  goalProgressText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#4F46E5',
    minWidth: 30,
  },
  goalDeadline: {
    fontSize: 12,
    color: '#94A3B8',
  },
  semesterCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  semesterCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  semesterCardTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1E293B',
  },
  gpaContainer: {
    alignItems: 'center',
  },
  gpaLabel: {
    fontSize: 12,
    color: '#64748B',
    marginBottom: 4,
  },
  gpaValue: {
    fontSize: 24,
    fontWeight: '700',
  },
  courseGradeItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F8FAFC',
  },
  courseGradeLeft: {
    flex: 1,
  },
  courseCode: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1E293B',
    marginBottom: 4,
  },
  courseName: {
    fontSize: 14,
    color: '#64748B',
    marginBottom: 2,
  },
  courseCredits: {
    fontSize: 12,
    color: '#94A3B8',
  },
  courseGradeRight: {
    alignItems: 'center',
  },
  gradeBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    marginBottom: 4,
  },
  gradeText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  gradePoints: {
    fontSize: 12,
    color: '#64748B',
  },
  personalCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  personalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  avatarGradient: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 20,
  },
  avatarText: {
    fontSize: 24,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  personalInfo: {
    flex: 1,
  },
  personalName: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1E293B',
    marginBottom: 4,
  },
  personalTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#4F46E5',
    marginBottom: 4,
  },
  personalProgram: {
    fontSize: 14,
    color: '#64748B',
  },
  personalDetails: {
    gap: 16,
    marginBottom: 24,
  },
  personalDetailItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  personalDetailContent: {
    marginLeft: 16,
    flex: 1,
  },
  personalDetailLabel: {
    fontSize: 12,
    color: '#64748B',
    marginBottom: 4,
  },
  personalDetailValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1E293B',
  },
  editProfileButton: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  editProfileGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    gap: 8,
  },
  editProfileText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  goalModal: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    width: width * 0.9,
    maxHeight: height * 0.8,
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
  modalInput: {
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: '#1E293B',
    marginBottom: 16,
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  priorityLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1E293B',
    marginBottom: 12,
  },
  priorityContainer: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 16,
  },
  priorityButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  selectedPriority: {
    borderColor: 'transparent',
  },
  priorityButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#64748B',
  },
  selectedPriorityText: {
    color: '#FFFFFF',
  },
  modalActions: {
    flexDirection: 'row',
    padding: 24,
    gap: 12,
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
  },
  modalCancelButton: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    alignItems: 'center',
  },
  modalCancelText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#64748B',
  },
  modalCreateButton: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 12,
    backgroundColor: '#4F46E5',
    alignItems: 'center',
  },
  modalCreateText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});