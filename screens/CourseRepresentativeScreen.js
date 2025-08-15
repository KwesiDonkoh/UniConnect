import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  Modal,
  TextInput,
  Alert,
  SafeAreaView,
  ActivityIndicator,
  Dimensions,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Animated,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useApp } from '../context/AppContext';
import courseRepService from '../services/courseRepService';

const { width, height } = Dimensions.get('window');

function CourseRepresentativeScreen({ navigation }) {
  const { user, csModules } = useApp();
  const [selectedTab, setSelectedTab] = useState('dashboard');
  const [repCourses, setRepCourses] = useState([]);
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [showAnnouncementModal, setShowAnnouncementModal] = useState(false);
  const [requestType, setRequestType] = useState('assignment');
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);

  // Form states
  const [requestForm, setRequestForm] = useState({
    title: '',
    description: '',
    dueDate: new Date(),
    priority: 'normal',
    reason: '',
    instructions: '',
    maxMarks: 100,
    weightage: 10,
    submissionFormat: 'online',
    duration: 60,
    questionCount: 10,
    format: 'online',
    topics: '',
    questionTypes: ['multiple_choice'],
  });

  const [announcementForm, setAnnouncementForm] = useState({
    title: '',
    message: '',
    type: 'general',
    priority: 'normal',
    targetAudience: 'all',
  });

  // Animation refs
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;

  useEffect(() => {
    if (user) {
      courseRepService.setCurrentUser(user.uid, user.fullName || user.name, user.userType);
      loadData();
      startAnimations();
    }
  }, [user]);

  const startAnimations = () => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 500,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const loadData = async () => {
    try {
      setLoading(true);
      
      // Get courses where user is representative
      const repResult = await courseRepService.getUserRepresentativeCourses();
      if (repResult.success) {
        setRepCourses(repResult.courses);
      }

      // Get user's requests
      const requestsResult = await courseRepService.getRepresentativeRequests();
      if (requestsResult.success) {
        setRequests(requestsResult.requests);
        
        // Set up real-time listener
        courseRepService.listenToRequests((newRequests) => {
          setRequests(newRequests);
        });
      }
    } catch (error) {
      console.error('Error loading data:', error);
      Alert.alert('Error', 'Failed to load course representative data');
    } finally {
      setLoading(false);
    }
  };

  const createRequest = async () => {
    if (!selectedCourse || !requestForm.title.trim() || !requestForm.description.trim()) {
      Alert.alert('Required Fields', 'Please fill in all required fields');
      return;
    }

    try {
      setLoading(true);

      const requestData = {
        ...requestForm,
        topics: requestForm.topics.split(',').map(t => t.trim()).filter(t => t),
      };

      let result;
      if (requestType === 'assignment') {
        result = await courseRepService.createAssignmentRequest(
          selectedCourse.courseCode,
          selectedCourse.courseName,
          [], // We'll need to get lecturer IDs from course data
          requestData
        );
      } else {
        result = await courseRepService.createQuizRequest(
          selectedCourse.courseCode,
          selectedCourse.courseName,
          [], // We'll need to get lecturer IDs from course data
          requestData
        );
      }

      if (result.success) {
        Alert.alert(
          'Request Sent! ✅',
          `Your ${requestType} request has been sent to the lecturers.`,
          [{ text: 'OK', onPress: () => {
            setShowRequestModal(false);
            resetRequestForm();
            loadData();
          }}]
        );
      } else {
        Alert.alert('Error', result.error || 'Failed to create request');
      }
    } catch (error) {
      console.error('Error creating request:', error);
      Alert.alert('Error', 'Failed to create request');
    } finally {
      setLoading(false);
    }
  };

  const sendAnnouncement = async () => {
    if (!selectedCourse || !announcementForm.title.trim() || !announcementForm.message.trim()) {
      Alert.alert('Required Fields', 'Please fill in title and message');
      return;
    }

    try {
      setLoading(true);

      const result = await courseRepService.sendCourseAnnouncement(
        selectedCourse.courseCode,
        selectedCourse.courseName,
        announcementForm
      );

      if (result.success) {
        Alert.alert(
          'Announcement Sent! 📢',
          'Your announcement has been sent to all course participants.',
          [{ text: 'OK', onPress: () => {
            setShowAnnouncementModal(false);
            resetAnnouncementForm();
          }}]
        );
      } else {
        Alert.alert('Error', result.error || 'Failed to send announcement');
      }
    } catch (error) {
      console.error('Error sending announcement:', error);
      Alert.alert('Error', 'Failed to send announcement');
    } finally {
      setLoading(false);
    }
  };

  const resetRequestForm = () => {
    setRequestForm({
      title: '',
      description: '',
      dueDate: new Date(),
      priority: 'normal',
      reason: '',
      instructions: '',
      maxMarks: 100,
      weightage: 10,
      submissionFormat: 'online',
      duration: 60,
      questionCount: 10,
      format: 'online',
      topics: '',
      questionTypes: ['multiple_choice'],
    });
    setSelectedCourse(null);
  };

  const resetAnnouncementForm = () => {
    setAnnouncementForm({
      title: '',
      message: '',
      type: 'general',
      priority: 'normal',
      targetAudience: 'all',
    });
    setSelectedCourse(null);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return '#F59E0B';
      case 'approved': return '#10B981';
      case 'rejected': return '#EF4444';
      case 'in_progress': return '#3B82F6';
      case 'completed': return '#8B5CF6';
      default: return '#6B7280';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'pending': return 'time-outline';
      case 'approved': return 'checkmark-circle-outline';
      case 'rejected': return 'close-circle-outline';
      case 'in_progress': return 'hourglass-outline';
      case 'completed': return 'star-outline';
      default: return 'help-circle-outline';
    }
  };

  const formatDate = (date) => {
    if (!date) return 'Not set';
    return new Date(date).toLocaleDateString();
  };

  const renderCourseCard = ({ item }) => (
    <TouchableOpacity
      style={styles.courseCard}
      onPress={() => setSelectedCourse(item)}
    >
      <LinearGradient
        colors={['#4F46E5', '#7C3AED']}
        style={styles.courseCardGradient}
      >
        <View style={styles.courseCardHeader}>
          <View style={styles.courseInfo}>
            <Text style={styles.courseCode}>{item.courseCode}</Text>
            <Text style={styles.courseName}>{item.courseName}</Text>
          </View>
          <View style={styles.repBadge}>
            <Ionicons name="star" size={16} color="#FFD700" />
            <Text style={styles.repBadgeText}>REP</Text>
          </View>
        </View>
        
        <View style={styles.courseCardActions}>
          <TouchableOpacity
            style={styles.courseAction}
            onPress={() => {
              setSelectedCourse(item);
              setShowRequestModal(true);
            }}
          >
            <Ionicons name="document-text-outline" size={20} color="#FFFFFF" />
            <Text style={styles.actionText}>Request</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={styles.courseAction}
            onPress={() => {
              setSelectedCourse(item);
              setShowAnnouncementModal(true);
            }}
          >
            <Ionicons name="megaphone-outline" size={20} color="#FFFFFF" />
            <Text style={styles.actionText}>Announce</Text>
          </TouchableOpacity>
        </View>
      </LinearGradient>
    </TouchableOpacity>
  );

  const renderRequestItem = ({ item }) => (
    <View style={styles.requestCard}>
      <View style={styles.requestHeader}>
        <View style={styles.requestInfo}>
          <Text style={styles.requestTitle}>{item.title}</Text>
          <Text style={styles.requestCourse}>{item.courseCode} - {item.courseName}</Text>
          <Text style={styles.requestType}>{item.type.toUpperCase()}</Text>
        </View>
        
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) }]}>
          <Ionicons name={getStatusIcon(item.status)} size={16} color="#FFFFFF" />
          <Text style={styles.statusText}>{item.status.toUpperCase()}</Text>
        </View>
      </View>
      
      <Text style={styles.requestDescription} numberOfLines={2}>
        {item.description}
      </Text>
      
      <View style={styles.requestMeta}>
        <View style={styles.metaItem}>
          <Ionicons name="calendar-outline" size={16} color="#6B7280" />
          <Text style={styles.metaText}>
            {item.type === 'assignment' ? formatDate(item.dueDate) : formatDate(item.scheduledDate)}
          </Text>
        </View>
        
        <View style={styles.metaItem}>
          <Ionicons name="person-outline" size={16} color="#6B7280" />
          <Text style={styles.metaText}>
            {item.approvalCount}/{item.targetLecturers?.length || 0} Approved
          </Text>
        </View>
        
        <View style={styles.metaItem}>
          <Ionicons name="flag-outline" size={16} color="#6B7280" />
          <Text style={styles.metaText}>{item.priority}</Text>
        </View>
      </View>
    </View>
  );

  if (loading && repCourses.length === 0) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4F46E5" />
        <Text style={styles.loadingText}>Loading course representative data...</Text>
      </SafeAreaView>
    );
  }

  if (repCourses.length === 0) {
    return (
      <SafeAreaView style={styles.container}>
        <LinearGradient
          colors={['#4F46E5', '#7C3AED']}
          style={styles.header}
        >
          <View style={styles.headerContent}>
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => navigation.goBack()}
            >
              <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Course Representative</Text>
          </View>
        </LinearGradient>
        
        <View style={styles.emptyState}>
          <Ionicons name="school-outline" size={64} color="#9CA3AF" />
          <Text style={styles.emptyStateTitle}>Not a Course Representative</Text>
          <Text style={styles.emptyStateText}>
            You are not assigned as a course representative for any courses yet.
            Contact your lecturer to be assigned as a course representative.
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <LinearGradient
        colors={['#4F46E5', '#7C3AED']}
        style={styles.header}
      >
        <View style={styles.headerContent}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
          </TouchableOpacity>
          
          <Text style={styles.headerTitle}>Course Representative</Text>
          
          <TouchableOpacity
            style={styles.addButton}
            onPress={() => {
              Alert.alert('Quick Actions', 'Choose an action:', [
                { text: 'Create Request', onPress: () => setShowRequestModal(true) },
                { text: 'Send Announcement', onPress: () => setShowAnnouncementModal(true) },
                { text: 'Cancel', style: 'cancel' }
              ]);
            }}
          >
            <Ionicons name="add" size={24} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
        
        {/* Tab Navigation */}
        <View style={styles.tabContainer}>
          <TouchableOpacity
            style={[styles.tab, selectedTab === 'dashboard' && styles.activeTab]}
            onPress={() => setSelectedTab('dashboard')}
          >
            <Text style={[styles.tabText, selectedTab === 'dashboard' && styles.activeTabText]}>
              Dashboard
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.tab, selectedTab === 'requests' && styles.activeTab]}
            onPress={() => setSelectedTab('requests')}
          >
            <Text style={[styles.tabText, selectedTab === 'requests' && styles.activeTabText]}>
              My Requests
            </Text>
          </TouchableOpacity>
        </View>
      </LinearGradient>

      <Animated.View style={[
        styles.content,
        { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }
      ]}>
        {selectedTab === 'dashboard' ? (
          <ScrollView contentContainerStyle={styles.dashboardContent}>
            {/* Representative Courses */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>📚 Your Representative Courses</Text>
              <FlatList
                data={repCourses}
                renderItem={renderCourseCard}
                keyExtractor={(item) => item.id}
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.coursesList}
              />
            </View>

            {/* Quick Stats */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>📊 Quick Stats</Text>
              <View style={styles.statsGrid}>
                <View style={styles.statCard}>
                  <LinearGradient colors={['#10B981', '#059669']} style={styles.statGradient}>
                    <Ionicons name="school-outline" size={24} color="#FFFFFF" />
                    <Text style={styles.statNumber}>{repCourses.length}</Text>
                    <Text style={styles.statLabel}>Courses</Text>
                  </LinearGradient>
                </View>
                
                <View style={styles.statCard}>
                  <LinearGradient colors={['#3B82F6', '#2563EB']} style={styles.statGradient}>
                    <Ionicons name="document-text-outline" size={24} color="#FFFFFF" />
                    <Text style={styles.statNumber}>{requests.length}</Text>
                    <Text style={styles.statLabel}>Requests</Text>
                  </LinearGradient>
                </View>
                
                <View style={styles.statCard}>
                  <LinearGradient colors={['#F59E0B', '#D97706']} style={styles.statGradient}>
                    <Ionicons name="time-outline" size={24} color="#FFFFFF" />
                    <Text style={styles.statNumber}>
                      {requests.filter(r => r.status === 'pending').length}
                    </Text>
                    <Text style={styles.statLabel}>Pending</Text>
                  </LinearGradient>
                </View>
                
                <View style={styles.statCard}>
                  <LinearGradient colors={['#8B5CF6', '#7C3AED']} style={styles.statGradient}>
                    <Ionicons name="checkmark-circle-outline" size={24} color="#FFFFFF" />
                    <Text style={styles.statNumber}>
                      {requests.filter(r => r.status === 'approved').length}
                    </Text>
                    <Text style={styles.statLabel}>Approved</Text>
                  </LinearGradient>
                </View>
              </View>
            </View>

            {/* Recent Requests */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>🕒 Recent Requests</Text>
              {requests.slice(0, 3).map((request) => (
                <View key={request.id} style={styles.miniRequestCard}>
                  <View style={styles.miniRequestInfo}>
                    <Text style={styles.miniRequestTitle}>{request.title}</Text>
                    <Text style={styles.miniRequestCourse}>{request.courseCode}</Text>
                  </View>
                  <View style={[styles.miniStatusBadge, { backgroundColor: getStatusColor(request.status) }]}>
                    <Text style={styles.miniStatusText}>{request.status}</Text>
                  </View>
                </View>
              ))}
            </View>
          </ScrollView>
        ) : (
          // Requests List
          <FlatList
            data={requests}
            renderItem={renderRequestItem}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.requestsList}
            ListEmptyComponent={
              <View style={styles.emptyState}>
                <Ionicons name="document-outline" size={64} color="#9CA3AF" />
                <Text style={styles.emptyStateTitle}>No Requests Yet</Text>
                <Text style={styles.emptyStateText}>
                  You haven't created any requests yet. Use the + button to create your first request.
                </Text>
              </View>
            }
          />
        )}
      </Animated.View>

      {/* Request Modal */}
      <Modal
        visible={showRequestModal}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity
              style={styles.modalCancelButton}
              onPress={() => {
                setShowRequestModal(false);
                resetRequestForm();
              }}
            >
              <Text style={styles.modalCancelText}>Cancel</Text>
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Create Request</Text>
            <TouchableOpacity
              style={styles.modalCreateButton}
              onPress={createRequest}
            >
              <Text style={styles.modalCreateText}>Send</Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalContent}>
            {/* Request Type */}
            <View style={styles.formSection}>
              <Text style={styles.sectionTitle}>Request Type</Text>
              <View style={styles.typeSelector}>
                <TouchableOpacity
                  style={[styles.typeOption, requestType === 'assignment' && styles.selectedType]}
                  onPress={() => setRequestType('assignment')}
                >
                  <Ionicons 
                    name="document-text-outline" 
                    size={24} 
                    color={requestType === 'assignment' ? '#FFFFFF' : '#4F46E5'} 
                  />
                  <Text style={[
                    styles.typeText,
                    requestType === 'assignment' && styles.selectedTypeText
                  ]}>
                    Assignment
                  </Text>
                </TouchableOpacity>
                
                <TouchableOpacity
                  style={[styles.typeOption, requestType === 'quiz' && styles.selectedType]}
                  onPress={() => setRequestType('quiz')}
                >
                  <Ionicons 
                    name="help-circle-outline" 
                    size={24} 
                    color={requestType === 'quiz' ? '#FFFFFF' : '#4F46E5'} 
                  />
                  <Text style={[
                    styles.typeText,
                    requestType === 'quiz' && styles.selectedTypeText
                  ]}>
                    Quiz
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Course Selection */}
            <View style={styles.formSection}>
              <Text style={styles.sectionTitle}>Course</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                {repCourses.map((course) => (
                  <TouchableOpacity
                    key={course.id}
                    style={[
                      styles.courseOption,
                      selectedCourse?.id === course.id && styles.selectedCourse
                    ]}
                    onPress={() => setSelectedCourse(course)}
                  >
                    <Text style={[
                      styles.courseOptionText,
                      selectedCourse?.id === course.id && styles.selectedCourseText
                    ]}>
                      {course.courseCode}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>

            {/* Basic Information */}
            <View style={styles.formSection}>
              <Text style={styles.sectionTitle}>Request Details</Text>
              
              <TextInput
                style={styles.input}
                placeholder={`${requestType === 'assignment' ? 'Assignment' : 'Quiz'} Title`}
                value={requestForm.title}
                onChangeText={(text) => setRequestForm(prev => ({ ...prev, title: text }))}
              />

              <TextInput
                style={[styles.input, styles.textArea]}
                placeholder="Description"
                multiline
                numberOfLines={4}
                value={requestForm.description}
                onChangeText={(text) => setRequestForm(prev => ({ ...prev, description: text }))}
              />

              <TextInput
                style={[styles.input, styles.textArea]}
                placeholder="Reason for request"
                multiline
                numberOfLines={3}
                value={requestForm.reason}
                onChangeText={(text) => setRequestForm(prev => ({ ...prev, reason: text }))}
              />
            </View>

            {/* Specific Fields */}
            {requestType === 'assignment' ? (
              <View style={styles.formSection}>
                <Text style={styles.sectionTitle}>Assignment Details</Text>
                
                <TouchableOpacity
                  style={styles.dateButton}
                  onPress={() => setShowDatePicker(true)}
                >
                  <Ionicons name="calendar-outline" size={20} color="#6B7280" />
                  <Text style={styles.dateText}>
                    Due Date: {formatDate(requestForm.dueDate)}
                  </Text>
                </TouchableOpacity>

                <View style={styles.inputRow}>
                  <TextInput
                    style={[styles.input, styles.halfInput]}
                    placeholder="Max Marks"
                    value={requestForm.maxMarks.toString()}
                    onChangeText={(text) => setRequestForm(prev => ({ ...prev, maxMarks: parseInt(text) || 0 }))}
                    keyboardType="numeric"
                  />
                  <TextInput
                    style={[styles.input, styles.halfInput]}
                    placeholder="Weightage %"
                    value={requestForm.weightage.toString()}
                    onChangeText={(text) => setRequestForm(prev => ({ ...prev, weightage: parseInt(text) || 0 }))}
                    keyboardType="numeric"
                  />
                </View>
              </View>
            ) : (
              <View style={styles.formSection}>
                <Text style={styles.sectionTitle}>Quiz Details</Text>
                
                <TouchableOpacity
                  style={styles.dateButton}
                  onPress={() => setShowDatePicker(true)}
                >
                  <Ionicons name="calendar-outline" size={20} color="#6B7280" />
                  <Text style={styles.dateText}>
                    Scheduled Date: {formatDate(requestForm.dueDate)}
                  </Text>
                </TouchableOpacity>

                <View style={styles.inputRow}>
                  <TextInput
                    style={[styles.input, styles.halfInput]}
                    placeholder="Duration (min)"
                    value={requestForm.duration.toString()}
                    onChangeText={(text) => setRequestForm(prev => ({ ...prev, duration: parseInt(text) || 60 }))}
                    keyboardType="numeric"
                  />
                  <TextInput
                    style={[styles.input, styles.halfInput]}
                    placeholder="Questions"
                    value={requestForm.questionCount.toString()}
                    onChangeText={(text) => setRequestForm(prev => ({ ...prev, questionCount: parseInt(text) || 10 }))}
                    keyboardType="numeric"
                  />
                </View>

                <TextInput
                  style={styles.input}
                  placeholder="Topics (comma separated)"
                  value={requestForm.topics}
                  onChangeText={(text) => setRequestForm(prev => ({ ...prev, topics: text }))}
                />
              </View>
            )}

            {/* Priority */}
            <View style={styles.formSection}>
              <Text style={styles.sectionTitle}>Priority</Text>
              <View style={styles.prioritySelector}>
                {['low', 'normal', 'high', 'urgent'].map((priority) => (
                  <TouchableOpacity
                    key={priority}
                    style={[
                      styles.priorityOption,
                      requestForm.priority === priority && styles.selectedPriority
                    ]}
                    onPress={() => setRequestForm(prev => ({ ...prev, priority }))}
                  >
                    <Text style={[
                      styles.priorityText,
                      requestForm.priority === priority && styles.selectedPriorityText
                    ]}>
                      {priority.toUpperCase()}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </ScrollView>

          {/* Date Picker */}
          {showDatePicker && (
            <DateTimePicker
              value={requestForm.dueDate}
              mode="date"
              display="default"
              onChange={(event, selectedDate) => {
                setShowDatePicker(false);
                if (selectedDate) {
                  setRequestForm(prev => ({ ...prev, dueDate: selectedDate }));
                }
              }}
            />
          )}
        </SafeAreaView>
      </Modal>

      {/* Announcement Modal */}
      <Modal
        visible={showAnnouncementModal}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity
              style={styles.modalCancelButton}
              onPress={() => {
                setShowAnnouncementModal(false);
                resetAnnouncementForm();
              }}
            >
              <Text style={styles.modalCancelText}>Cancel</Text>
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Send Announcement</Text>
            <TouchableOpacity
              style={styles.modalCreateButton}
              onPress={sendAnnouncement}
            >
              <Text style={styles.modalCreateText}>Send</Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalContent}>
            {/* Course Selection */}
            <View style={styles.formSection}>
              <Text style={styles.sectionTitle}>Course</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                {repCourses.map((course) => (
                  <TouchableOpacity
                    key={course.id}
                    style={[
                      styles.courseOption,
                      selectedCourse?.id === course.id && styles.selectedCourse
                    ]}
                    onPress={() => setSelectedCourse(course)}
                  >
                    <Text style={[
                      styles.courseOptionText,
                      selectedCourse?.id === course.id && styles.selectedCourseText
                    ]}>
                      {course.courseCode}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>

            {/* Announcement Details */}
            <View style={styles.formSection}>
              <Text style={styles.sectionTitle}>Announcement</Text>
              
              <TextInput
                style={styles.input}
                placeholder="Announcement Title"
                value={announcementForm.title}
                onChangeText={(text) => setAnnouncementForm(prev => ({ ...prev, title: text }))}
              />

              <TextInput
                style={[styles.input, styles.textArea]}
                placeholder="Announcement Message"
                multiline
                numberOfLines={6}
                value={announcementForm.message}
                onChangeText={(text) => setAnnouncementForm(prev => ({ ...prev, message: text }))}
              />
            </View>

            {/* Announcement Type */}
            <View style={styles.formSection}>
              <Text style={styles.sectionTitle}>Type</Text>
              <View style={styles.typeSelector}>
                {['general', 'urgent', 'reminder', 'update'].map((type) => (
                  <TouchableOpacity
                    key={type}
                    style={[
                      styles.announcementTypeOption,
                      announcementForm.type === type && styles.selectedAnnouncementType
                    ]}
                    onPress={() => setAnnouncementForm(prev => ({ ...prev, type }))}
                  >
                    <Text style={[
                      styles.announcementTypeText,
                      announcementForm.type === type && styles.selectedAnnouncementTypeText
                    ]}>
                      {type.toUpperCase()}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Target Audience */}
            <View style={styles.formSection}>
              <Text style={styles.sectionTitle}>Target Audience</Text>
              <View style={styles.audienceSelector}>
                {['all', 'students', 'lecturers'].map((audience) => (
                  <TouchableOpacity
                    key={audience}
                    style={[
                      styles.audienceOption,
                      announcementForm.targetAudience === audience && styles.selectedAudience
                    ]}
                    onPress={() => setAnnouncementForm(prev => ({ ...prev, targetAudience: audience }))}
                  >
                    <Text style={[
                      styles.audienceText,
                      announcementForm.targetAudience === audience && styles.selectedAudienceText
                    ]}>
                      {audience.toUpperCase()}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#6B7280',
  },
  header: {
    paddingTop: 16,
    paddingBottom: 20,
    paddingHorizontal: 20,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  addButton: {
    padding: 8,
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 12,
    padding: 4,
  },
  tab: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  activeTab: {
    backgroundColor: '#FFFFFF',
  },
  tabText: {
    fontSize: 14,
    fontWeight: '600',
    color: 'rgba(255,255,255,0.8)',
  },
  activeTabText: {
    color: '#4F46E5',
  },
  content: {
    flex: 1,
  },
  dashboardContent: {
    padding: 20,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 16,
  },
  coursesList: {
    paddingRight: 20,
  },
  courseCard: {
    width: 280,
    height: 160,
    marginRight: 16,
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 6,
  },
  courseCardGradient: {
    flex: 1,
    padding: 20,
    justifyContent: 'space-between',
  },
  courseCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  courseInfo: {
    flex: 1,
  },
  courseCode: {
    fontSize: 14,
    fontWeight: '600',
    color: 'rgba(255,255,255,0.9)',
    marginBottom: 4,
  },
  courseName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
    lineHeight: 22,
  },
  repBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  repBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  courseCardActions: {
    flexDirection: 'row',
    gap: 12,
  },
  courseAction: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    gap: 6,
  },
  actionText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  statCard: {
    width: (width - 56) / 2,
    height: 100,
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statGradient: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: '700',
    color: '#FFFFFF',
    marginTop: 8,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#E2E8F0',
    textAlign: 'center',
    fontWeight: '600',
  },
  miniRequestCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  miniRequestInfo: {
    flex: 1,
  },
  miniRequestTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 2,
  },
  miniRequestCourse: {
    fontSize: 12,
    color: '#6B7280',
  },
  miniStatusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  miniStatusText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#FFFFFF',
    textTransform: 'uppercase',
  },
  requestsList: {
    padding: 20,
  },
  requestCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  requestHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  requestInfo: {
    flex: 1,
    marginRight: 16,
  },
  requestTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 4,
  },
  requestCourse: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 4,
  },
  requestType: {
    fontSize: 12,
    fontWeight: '600',
    color: '#4F46E5',
    backgroundColor: '#EEF2FF',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
    alignSelf: 'flex-start',
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
    fontSize: 12,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  requestDescription: {
    fontSize: 14,
    color: '#4B5563',
    lineHeight: 20,
    marginBottom: 16,
  },
  requestMeta: {
    flexDirection: 'row',
    gap: 16,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metaText: {
    fontSize: 12,
    color: '#6B7280',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
    paddingVertical: 60,
  },
  emptyStateTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
    marginTop: 16,
    marginBottom: 8,
    textAlign: 'center',
  },
  emptyStateText: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 20,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    backgroundColor: '#FFFFFF',
  },
  modalCancelButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  modalCancelText: {
    fontSize: 16,
    color: '#6B7280',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
  },
  modalCreateButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  modalCreateText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#4F46E5',
  },
  modalContent: {
    flex: 1,
    padding: 20,
  },
  formSection: {
    marginBottom: 24,
  },
  typeSelector: {
    flexDirection: 'row',
    gap: 12,
  },
  typeOption: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 2,
    borderColor: '#4F46E5',
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 20,
    gap: 8,
  },
  selectedType: {
    backgroundColor: '#4F46E5',
  },
  typeText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#4F46E5',
  },
  selectedTypeText: {
    color: '#FFFFFF',
  },
  courseOption: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginRight: 12,
    minWidth: 100,
  },
  selectedCourse: {
    backgroundColor: '#4F46E5',
    borderColor: '#4F46E5',
  },
  courseOptionText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1F2937',
    textAlign: 'center',
  },
  selectedCourseText: {
    color: '#FFFFFF',
  },
  input: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    marginBottom: 12,
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  dateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginBottom: 12,
    gap: 8,
  },
  dateText: {
    fontSize: 16,
    color: '#1F2937',
  },
  inputRow: {
    flexDirection: 'row',
    gap: 12,
  },
  halfInput: {
    flex: 1,
  },
  prioritySelector: {
    flexDirection: 'row',
    gap: 8,
  },
  priorityOption: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 12,
    alignItems: 'center',
  },
  selectedPriority: {
    backgroundColor: '#4F46E5',
    borderColor: '#4F46E5',
  },
  priorityText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6B7280',
  },
  selectedPriorityText: {
    color: '#FFFFFF',
  },
  announcementTypeOption: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 12,
    alignItems: 'center',
  },
  selectedAnnouncementType: {
    backgroundColor: '#10B981',
    borderColor: '#10B981',
  },
  announcementTypeText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#6B7280',
  },
  selectedAnnouncementTypeText: {
    color: '#FFFFFF',
  },
  audienceSelector: {
    flexDirection: 'row',
    gap: 8,
  },
  audienceOption: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 12,
    alignItems: 'center',
  },
  selectedAudience: {
    backgroundColor: '#8B5CF6',
    borderColor: '#8B5CF6',
  },
  audienceText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#6B7280',
  },
  selectedAudienceText: {
    color: '#FFFFFF',
  },
});

export default CourseRepresentativeScreen;
