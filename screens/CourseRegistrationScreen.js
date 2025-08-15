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
import { dummyData } from '../data/dummyData';

const { width, height } = Dimensions.get('window');

export default function CourseRegistrationScreen({ navigation }) {
  const { user, csModules } = useApp();
  const [selectedLevel, setSelectedLevel] = useState(user?.academicLevel || '100');
  const [availableCourses, setAvailableCourses] = useState([]);
  const [registeredCourses, setRegisteredCourses] = useState([]);
  const [pendingCourses, setPendingCourses] = useState([]);
  const [selectedSemester, setSelectedSemester] = useState('all');
  const [searchText, setSearchText] = useState('');
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  // Animation refs
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;

  useEffect(() => {
    if (user?.uid) {
      loadCourseData();
      startAnimations();
    }
  }, [user?.uid, selectedLevel]);

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

  const loadCourseData = async () => {
    try {
      setIsLoading(true);
      
      // Get available courses for the selected level
      const levelCourses = dummyData.csModules[selectedLevel] || [];
      setAvailableCourses(levelCourses);

      // Mock registered courses (in real app, this would come from Firebase)
      const mockRegistered = levelCourses.slice(0, 3).map(course => ({
        ...course,
        status: 'registered',
        registrationDate: new Date(),
        grade: null
      }));
      setRegisteredCourses(mockRegistered);

      // Mock pending courses
      const mockPending = levelCourses.slice(3, 5).map(course => ({
        ...course,
        status: 'pending',
        requestDate: new Date()
      }));
      setPendingCourses(mockPending);

    } catch (error) {
      console.error('Error loading course data:', error);
      Alert.alert('Error', 'Failed to load course data');
    } finally {
      setIsLoading(false);
    }
  };

  const getFilteredCourses = () => {
    let courses = availableCourses;

    // Filter by semester
    if (selectedSemester !== 'all') {
      courses = courses.filter(course => course.semester.toString() === selectedSemester);
    }

    // Filter by search text
    if (searchText.trim()) {
      courses = courses.filter(course =>
        course.name.toLowerCase().includes(searchText.toLowerCase()) ||
        course.code.toLowerCase().includes(searchText.toLowerCase()) ||
        course.instructor.toLowerCase().includes(searchText.toLowerCase())
      );
    }

    return courses;
  };

  const getCourseStatus = (course) => {
    if (registeredCourses.find(c => c.id === course.id)) return 'registered';
    if (pendingCourses.find(c => c.id === course.id)) return 'pending';
    return 'available';
  };

  const registerForCourse = async (course) => {
    setSelectedCourse(course);
    setShowConfirmModal(true);
  };

  const confirmRegistration = async () => {
    if (!selectedCourse) return;

    try {
      setIsLoading(true);
      
      // Simulate registration process
      await new Promise(resolve => setTimeout(resolve, 1500));

      // Add to pending courses
      setPendingCourses(prev => [...prev, {
        ...selectedCourse,
        status: 'pending',
        requestDate: new Date()
      }]);

      setShowConfirmModal(false);
      setSelectedCourse(null);

      Alert.alert(
        'Registration Submitted! 🎓',
        `Your registration request for ${selectedCourse.name} has been submitted successfully.\n\nYou will be notified once the registration is approved.`,
        [{ text: 'Great!', style: 'default' }]
      );

    } catch (error) {
      console.error('Error registering for course:', error);
      Alert.alert('Error', 'Failed to register for course. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const withdrawFromCourse = async (course) => {
    Alert.alert(
      'Withdraw from Course',
      `Are you sure you want to withdraw from ${course.name}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Withdraw',
          style: 'destructive',
          onPress: async () => {
            try {
              setIsLoading(true);
              
              // Remove from registered courses
              setRegisteredCourses(prev => prev.filter(c => c.id !== course.id));
              
              Alert.alert('Success', 'You have been withdrawn from the course.');
            } catch (error) {
              Alert.alert('Error', 'Failed to withdraw from course.');
            } finally {
              setIsLoading(false);
            }
          }
        }
      ]
    );
  };

  const renderCourseCard = ({ item }) => {
    const status = getCourseStatus(item);
    const statusColors = {
      registered: '#10B981',
      pending: '#F59E0B',
      available: '#6B7280'
    };

    const statusText = {
      registered: 'Registered',
      pending: 'Pending',
      available: 'Available'
    };

    return (
      <View style={styles.courseCard}>
        <View style={styles.courseHeader}>
          <LinearGradient
            colors={[statusColors[status], statusColors[status] + '80']}
            style={styles.courseCodeGradient}
          >
            <Text style={styles.courseCode}>{item.code}</Text>
          </LinearGradient>
          
          <View style={styles.courseInfo}>
            <Text style={styles.courseName}>{item.name}</Text>
            <Text style={styles.courseInstructor}>👨‍🏫 {item.instructor}</Text>
            <View style={styles.courseDetails}>
              <Text style={styles.courseCredits}>📚 {item.credits} Credits</Text>
              <Text style={styles.courseSemester}>📅 Semester {item.semester}</Text>
            </View>
            <Text style={styles.courseTheoryPractical}>
              🎓 Theory: {item.theory}h | 🧪 Practical: {item.practical}h
            </Text>
          </View>

          <View style={styles.courseActions}>
            <View style={[styles.statusBadge, { backgroundColor: statusColors[status] }]}>
              <Text style={styles.statusText}>{statusText[status]}</Text>
            </View>
            
            {status === 'available' && (
              <TouchableOpacity
                style={styles.registerButton}
                onPress={() => registerForCourse(item)}
              >
                <Ionicons name="add-circle" size={20} color="#4F46E5" />
                <Text style={styles.registerButtonText}>Register</Text>
              </TouchableOpacity>
            )}
            
            {status === 'registered' && (
              <TouchableOpacity
                style={styles.withdrawButton}
                onPress={() => withdrawFromCourse(item)}
              >
                <Ionicons name="remove-circle" size={20} color="#EF4444" />
                <Text style={styles.withdrawButtonText}>Withdraw</Text>
              </TouchableOpacity>
            )}
            
            {status === 'pending' && (
              <View style={styles.pendingIndicator}>
                <Ionicons name="time" size={16} color="#F59E0B" />
                <Text style={styles.pendingText}>Waiting Approval</Text>
              </View>
            )}
          </View>
        </View>
      </View>
    );
  };

  if (!user) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#4F46E5" />
          <Text style={styles.loadingText}>Loading registration...</Text>
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
        <Text style={styles.headerTitle}>Course Registration</Text>
        <TouchableOpacity onPress={() => Alert.alert('Help', 'Contact academic office for registration assistance.')}>
          <Ionicons name="help-circle" size={24} color="#4F46E5" />
        </TouchableOpacity>
      </View>

      <Animated.View style={{ flex: 1, opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}>
        {/* Level Selector */}
        <View style={styles.levelSelector}>
          <Text style={styles.sectionTitle}>Academic Level</Text>
          <View style={styles.levelButtons}>
            {['100', '200', '300', '400'].map((level) => (
              <TouchableOpacity
                key={level}
                style={[styles.levelButton, selectedLevel === level && styles.selectedLevel]}
                onPress={() => setSelectedLevel(level)}
              >
                <Text style={[
                  styles.levelButtonText,
                  selectedLevel === level && styles.selectedLevelText
                ]}>
                  Level {level}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Filters */}
        <View style={styles.filtersContainer}>
          {/* Search */}
          <View style={styles.searchContainer}>
            <Ionicons name="search" size={20} color="#64748B" />
            <TextInput
              style={styles.searchInput}
              placeholder="Search courses..."
              value={searchText}
              onChangeText={setSearchText}
            />
            {searchText.length > 0 && (
              <TouchableOpacity onPress={() => setSearchText('')}>
                <Ionicons name="close-circle" size={20} color="#64748B" />
              </TouchableOpacity>
            )}
          </View>

          {/* Semester Filter */}
          <View style={styles.semesterFilter}>
            {['all', '1', '2'].map((semester) => (
              <TouchableOpacity
                key={semester}
                style={[
                  styles.semesterButton,
                  selectedSemester === semester && styles.selectedSemester
                ]}
                onPress={() => setSelectedSemester(semester)}
              >
                <Text style={[
                  styles.semesterButtonText,
                  selectedSemester === semester && styles.selectedSemesterText
                ]}>
                  {semester === 'all' ? 'All' : `Sem ${semester}`}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Registration Summary */}
        <View style={styles.summaryContainer}>
          <View style={styles.summaryCard}>
            <Text style={styles.summaryNumber}>{registeredCourses.length}</Text>
            <Text style={styles.summaryLabel}>Registered</Text>
          </View>
          <View style={styles.summaryCard}>
            <Text style={[styles.summaryNumber, { color: '#F59E0B' }]}>{pendingCourses.length}</Text>
            <Text style={styles.summaryLabel}>Pending</Text>
          </View>
          <View style={styles.summaryCard}>
            <Text style={[styles.summaryNumber, { color: '#6B7280' }]}>
              {availableCourses.length - registeredCourses.length - pendingCourses.length}
            </Text>
            <Text style={styles.summaryLabel}>Available</Text>
          </View>
        </View>

        {/* Courses List */}
        <View style={styles.coursesContainer}>
          <Text style={styles.sectionTitle}>
            Courses - Level {selectedLevel} 
            {selectedSemester !== 'all' && ` (Semester ${selectedSemester})`}
          </Text>
          
          {isLoading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#4F46E5" />
              <Text style={styles.loadingText}>Loading courses...</Text>
            </View>
          ) : (
            <FlatList
              data={getFilteredCourses()}
              renderItem={renderCourseCard}
              keyExtractor={(item) => item.id}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.coursesList}
            />
          )}
        </View>
      </Animated.View>

      {/* Registration Confirmation Modal */}
      <Modal
        visible={showConfirmModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowConfirmModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.confirmModal}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Confirm Registration</Text>
              <TouchableOpacity onPress={() => setShowConfirmModal(false)}>
                <Ionicons name="close" size={24} color="#64748B" />
              </TouchableOpacity>
            </View>

            {selectedCourse && (
              <View style={styles.modalContent}>
                <View style={styles.coursePreview}>
                  <Text style={styles.coursePreviewCode}>{selectedCourse.code}</Text>
                  <Text style={styles.coursePreviewName}>{selectedCourse.name}</Text>
                  <Text style={styles.coursePreviewInstructor}>👨‍🏫 {selectedCourse.instructor}</Text>
                  <Text style={styles.coursePreviewCredits}>📚 {selectedCourse.credits} Credits</Text>
                </View>

                <View style={styles.registrationInfo}>
                  <Text style={styles.infoTitle}>Registration Details:</Text>
                  <Text style={styles.infoText}>• Course will be added to your academic record</Text>
                  <Text style={styles.infoText}>• You'll have access to course materials and chat</Text>
                  <Text style={styles.infoText}>• Registration requires academic office approval</Text>
                  <Text style={styles.infoText}>• You'll be notified via app notifications</Text>
                </View>

                <View style={styles.modalActions}>
                  <TouchableOpacity
                    style={styles.cancelButton}
                    onPress={() => setShowConfirmModal(false)}
                  >
                    <Text style={styles.cancelButtonText}>Cancel</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.confirmButton}
                    onPress={confirmRegistration}
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <ActivityIndicator size="small" color="#FFFFFF" />
                    ) : (
                      <>
                        <Ionicons name="checkmark-circle" size={20} color="#FFFFFF" />
                        <Text style={styles.confirmButtonText}>Confirm Registration</Text>
                      </>
                    )}
                  </TouchableOpacity>
                </View>
              </View>
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
  levelSelector: {
    padding: 20,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1E293B',
    marginBottom: 16,
  },
  levelButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  levelButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  selectedLevel: {
    backgroundColor: '#4F46E5',
    borderColor: '#4F46E5',
  },
  levelButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#64748B',
  },
  selectedLevelText: {
    color: '#FFFFFF',
  },
  filtersContainer: {
    padding: 20,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F1F5F9',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginBottom: 16,
    gap: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#1E293B',
  },
  semesterFilter: {
    flexDirection: 'row',
    gap: 8,
  },
  semesterButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    backgroundColor: '#F1F5F9',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  selectedSemester: {
    backgroundColor: '#4F46E5',
    borderColor: '#4F46E5',
  },
  semesterButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#64748B',
  },
  selectedSemesterText: {
    color: '#FFFFFF',
  },
  summaryContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 16,
    gap: 12,
  },
  summaryCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  summaryNumber: {
    fontSize: 24,
    fontWeight: '700',
    color: '#10B981',
    marginBottom: 4,
  },
  summaryLabel: {
    fontSize: 12,
    color: '#64748B',
    textAlign: 'center',
  },
  coursesContainer: {
    flex: 1,
    paddingHorizontal: 20,
  },
  coursesList: {
    paddingBottom: 20,
  },
  courseCard: {
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
  courseHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  courseCodeGradient: {
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  courseCode: {
    fontSize: 12,
    fontWeight: '700',
    color: '#FFFFFF',
    textAlign: 'center',
  },
  courseInfo: {
    flex: 1,
  },
  courseName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1E293B',
    marginBottom: 4,
  },
  courseInstructor: {
    fontSize: 14,
    color: '#64748B',
    marginBottom: 8,
  },
  courseDetails: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 4,
  },
  courseCredits: {
    fontSize: 12,
    color: '#64748B',
  },
  courseSemester: {
    fontSize: 12,
    color: '#64748B',
  },
  courseTheoryPractical: {
    fontSize: 12,
    color: '#64748B',
  },
  courseActions: {
    alignItems: 'flex-end',
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginBottom: 8,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  registerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: '#F0F9FF',
    borderRadius: 20,
    gap: 4,
  },
  registerButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#4F46E5',
  },
  withdrawButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: '#FEF2F2',
    borderRadius: 20,
    gap: 4,
  },
  withdrawButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#EF4444',
  },
  pendingIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: '#FFFBEB',
    borderRadius: 20,
    gap: 4,
  },
  pendingText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#F59E0B',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  confirmModal: {
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
  },
  coursePreview: {
    backgroundColor: '#F8FAFC',
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
    alignItems: 'center',
  },
  coursePreviewCode: {
    fontSize: 18,
    fontWeight: '700',
    color: '#4F46E5',
    marginBottom: 8,
  },
  coursePreviewName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1E293B',
    textAlign: 'center',
    marginBottom: 8,
  },
  coursePreviewInstructor: {
    fontSize: 14,
    color: '#64748B',
    marginBottom: 4,
  },
  coursePreviewCredits: {
    fontSize: 14,
    color: '#64748B',
  },
  registrationInfo: {
    marginBottom: 24,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1E293B',
    marginBottom: 12,
  },
  infoText: {
    fontSize: 14,
    color: '#64748B',
    marginBottom: 6,
    lineHeight: 20,
  },
  modalActions: {
    flexDirection: 'row',
    gap: 12,
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
  confirmButton: {
    flex: 2,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 12,
    backgroundColor: '#4F46E5',
    gap: 8,
  },
  confirmButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});
