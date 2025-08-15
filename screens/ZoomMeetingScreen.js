import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  Modal,
  TextInput,
  Alert,
  ScrollView,
  SafeAreaView,
  ActivityIndicator,
  Dimensions,
  Switch,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useApp } from '../context/AppContext';
import zoomMeetingService from '../services/zoomMeetingService';

const { width } = Dimensions.get('window');

export default function ZoomMeetingScreen({ navigation }) {
  const { user, csModules } = useApp();
  const [meetings, setMeetings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  // Meeting form state
  const [meetingForm, setMeetingForm] = useState({
    title: '',
    description: '',
    courseCode: '',
    courseName: '',
    scheduledDate: new Date(),
    scheduledTime: new Date(),
    duration: 60,
    meetingType: 'lecture',
    maxParticipants: 100,
    isRecordingEnabled: false,
    allowScreenShare: true,
    allowChat: true,
    waitingRoomEnabled: true,
    passwordRequired: false,
    breakoutRoomsEnabled: false,
    pollsEnabled: false,
    whiteboardEnabled: false,
    attendanceTracking: true,
    requiredAttendance: false,
  });

  useEffect(() => {
    if (user) {
      zoomMeetingService.setCurrentUser(user.uid, user.name, user.userType);
      loadMeetings();
    }
  }, [user]);

  const loadMeetings = async () => {
    try {
      setLoading(true);
      // Get meetings for all courses the lecturer teaches
      const allMeetings = [];
      
      if (Array.isArray(csModules)) {
        for (const course of csModules) {
          const result = await zoomMeetingService.getCourseMeetings(course.code);
          if (result.success) {
            allMeetings.push(...result.meetings);
          }
        }
      }

      // Sort by scheduled time
      allMeetings.sort((a, b) => new Date(b.scheduledTime) - new Date(a.scheduledTime));
      setMeetings(allMeetings);
    } catch (error) {
      console.error('Error loading meetings:', error);
      Alert.alert('Error', 'Failed to load meetings');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateMeeting = async () => {
    try {
      if (!meetingForm.title.trim()) {
        Alert.alert('Error', 'Please enter a meeting title');
        return;
      }

      if (!selectedCourse) {
        Alert.alert('Error', 'Please select a course');
        return;
      }

      setLoading(true);

      // Combine date and time
      const scheduledDateTime = new Date(meetingForm.scheduledDate);
      const timeDate = new Date(meetingForm.scheduledTime);
      scheduledDateTime.setHours(timeDate.getHours(), timeDate.getMinutes(), 0, 0);

      const meetingData = {
        ...meetingForm,
        courseCode: selectedCourse.code,
        courseName: selectedCourse.name,
        scheduledTime: scheduledDateTime,
      };

      const result = await zoomMeetingService.createMeeting(meetingData);

      if (result.success) {
        Alert.alert(
          'Success!', 
          'Zoom meeting created successfully! Students will be notified.',
          [{ text: 'OK', onPress: () => {
            setShowCreateModal(false);
            resetForm();
            loadMeetings();
          }}]
        );
      } else {
        Alert.alert('Error', result.error || 'Failed to create meeting');
      }
    } catch (error) {
      console.error('Error creating meeting:', error);
      Alert.alert('Error', 'Failed to create meeting');
    } finally {
      setLoading(false);
    }
  };

  const handleStartMeeting = async (meetingId) => {
    try {
      Alert.alert(
        'Start Meeting',
        'This will launch Zoom and start the meeting. Continue?',
        [
          { text: 'Cancel', style: 'cancel' },
          { 
            text: 'Start Meeting', 
            onPress: async () => {
              const result = await zoomMeetingService.startMeeting(meetingId);
              if (result.success) {
                Alert.alert('Success', 'Meeting started! Zoom should open now.');
                loadMeetings(); // Refresh to update status
              } else {
                Alert.alert('Error', result.error || 'Failed to start meeting');
              }
            }
          }
        ]
      );
    } catch (error) {
      console.error('Error starting meeting:', error);
      Alert.alert('Error', 'Failed to start meeting');
    }
  };

  const handleEndMeeting = async (meetingId) => {
    try {
      Alert.alert(
        'End Meeting',
        'Are you sure you want to end this meeting?',
        [
          { text: 'Cancel', style: 'cancel' },
          { 
            text: 'End Meeting', 
            style: 'destructive',
            onPress: async () => {
              const result = await zoomMeetingService.endMeeting(meetingId);
              if (result.success) {
                Alert.alert('Success', 'Meeting ended successfully');
                loadMeetings(); // Refresh to update status
              } else {
                Alert.alert('Error', result.error || 'Failed to end meeting');
              }
            }
          }
        ]
      );
    } catch (error) {
      console.error('Error ending meeting:', error);
      Alert.alert('Error', 'Failed to end meeting');
    }
  };

  const resetForm = () => {
    setMeetingForm({
      title: '',
      description: '',
      courseCode: '',
      courseName: '',
      scheduledDate: new Date(),
      scheduledTime: new Date(),
      duration: 60,
      meetingType: 'lecture',
      maxParticipants: 100,
      isRecordingEnabled: false,
      allowScreenShare: true,
      allowChat: true,
      waitingRoomEnabled: true,
      passwordRequired: false,
      breakoutRoomsEnabled: false,
      pollsEnabled: false,
      whiteboardEnabled: false,
      attendanceTracking: true,
      requiredAttendance: false,
    });
    setSelectedCourse(null);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'scheduled': return '#F59E0B';
      case 'live': return '#10B981';
      case 'ended': return '#6B7280';
      case 'cancelled': return '#EF4444';
      default: return '#6B7280';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'scheduled': return 'time-outline';
      case 'live': return 'radio-outline';
      case 'ended': return 'checkmark-circle-outline';
      case 'cancelled': return 'close-circle-outline';
      default: return 'help-circle-outline';
    }
  };

  const formatDateTime = (date) => {
    if (!date) return 'Not set';
    return new Date(date).toLocaleString();
  };

  const renderMeeting = ({ item }) => (
    <View style={styles.meetingCard}>
      <View style={styles.meetingHeader}>
        <View style={styles.meetingInfo}>
          <Text style={styles.meetingTitle}>{item.title}</Text>
          <Text style={styles.courseCode}>{item.courseCode} - {item.courseName}</Text>
          <Text style={styles.meetingTime}>{formatDateTime(item.scheduledTime)}</Text>
        </View>
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) }]}>
          <Ionicons name={getStatusIcon(item.status)} size={16} color="#FFFFFF" />
          <Text style={styles.statusText}>{item.status.toUpperCase()}</Text>
        </View>
      </View>

      <View style={styles.meetingDetails}>
        <View style={styles.detailRow}>
          <Ionicons name="time-outline" size={16} color="#6B7280" />
          <Text style={styles.detailText}>{item.duration} minutes</Text>
        </View>
        <View style={styles.detailRow}>
          <Ionicons name="people-outline" size={16} color="#6B7280" />
          <Text style={styles.detailText}>{item.participants?.length || 0} participants</Text>
        </View>
        <View style={styles.detailRow}>
          <Ionicons name="shield-checkmark-outline" size={16} color="#6B7280" />
          <Text style={styles.detailText}>
            {item.passwordRequired ? 'Password Protected' : 'Open Access'}
          </Text>
        </View>
      </View>

      <View style={styles.meetingActions}>
        {item.status === 'scheduled' && (
          <TouchableOpacity
            style={[styles.actionButton, styles.startButton]}
            onPress={() => handleStartMeeting(item.id)}
          >
            <Ionicons name="play" size={16} color="#FFFFFF" />
            <Text style={styles.actionButtonText}>Start</Text>
          </TouchableOpacity>
        )}

        {item.status === 'live' && (
          <>
            <TouchableOpacity
              style={[styles.actionButton, styles.joinButton]}
              onPress={() => zoomMeetingService.joinMeeting(item.id)}
            >
              <Ionicons name="enter-outline" size={16} color="#FFFFFF" />
              <Text style={styles.actionButtonText}>Join</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.actionButton, styles.endButton]}
              onPress={() => handleEndMeeting(item.id)}
            >
              <Ionicons name="stop" size={16} color="#FFFFFF" />
              <Text style={styles.actionButtonText}>End</Text>
            </TouchableOpacity>
          </>
        )}

        <TouchableOpacity
          style={[styles.actionButton, styles.detailsButton]}
          onPress={() => {
            // Navigate to meeting details/analytics
            Alert.alert('Meeting Details', `Participants: ${item.participants?.length || 0}\nDuration: ${item.duration} min\nType: ${item.meetingType}`);
          }}
        >
          <Ionicons name="information-circle-outline" size={16} color="#4F46E5" />
          <Text style={[styles.actionButtonText, { color: '#4F46E5' }]}>Details</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderCourseSelection = () => (
    <View style={styles.courseSelection}>
      <Text style={styles.sectionTitle}>Select Course</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        {Array.isArray(csModules) && csModules.map((course) => (
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
              {course.code}
            </Text>
            <Text style={[
              styles.courseOptionSubtext,
              selectedCourse?.id === course.id && styles.selectedCourseText
            ]}>
              {course.name}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );

  if (loading && meetings.length === 0) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4F46E5" />
        <Text style={styles.loadingText}>Loading meetings...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <LinearGradient
        colors={['#4F46E5', '6366F1']}
        style={styles.header}
      >
        <View style={styles.headerContent}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Zoom Meetings</Text>
          <TouchableOpacity
            style={styles.createButton}
            onPress={() => setShowCreateModal(true)}
          >
            <Ionicons name="add" size={24} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
      </LinearGradient>

      {/* Meetings List */}
      <FlatList
        data={meetings}
        renderItem={renderMeeting}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContainer}
        refreshing={refreshing}
        onRefresh={() => {
          setRefreshing(true);
          loadMeetings().finally(() => setRefreshing(false));
        }}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Ionicons name="videocam-outline" size={64} color="#9CA3AF" />
            <Text style={styles.emptyStateTitle}>No meetings yet</Text>
            <Text style={styles.emptyStateText}>
              Create your first Zoom meeting to get started
            </Text>
            <TouchableOpacity
              style={styles.createFirstButton}
              onPress={() => setShowCreateModal(true)}
            >
              <Text style={styles.createFirstButtonText}>Create Meeting</Text>
            </TouchableOpacity>
          </View>
        }
      />

      {/* Create Meeting Modal */}
      <Modal
        visible={showCreateModal}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity
              style={styles.modalCancelButton}
              onPress={() => {
                setShowCreateModal(false);
                resetForm();
              }}
            >
              <Text style={styles.modalCancelText}>Cancel</Text>
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Create Zoom Meeting</Text>
            <TouchableOpacity
              style={styles.modalCreateButton}
              onPress={handleCreateMeeting}
            >
              <Text style={styles.modalCreateText}>Create</Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalContent}>
            {/* Course Selection */}
            {renderCourseSelection()}

            {/* Basic Information */}
            <View style={styles.formSection}>
              <Text style={styles.sectionTitle}>Meeting Information</Text>
              
              <TextInput
                style={styles.input}
                placeholder="Meeting Title"
                value={meetingForm.title}
                onChangeText={(text) => setMeetingForm(prev => ({ ...prev, title: text }))}
              />

              <TextInput
                style={[styles.input, styles.textArea]}
                placeholder="Description (optional)"
                multiline
                numberOfLines={3}
                value={meetingForm.description}
                onChangeText={(text) => setMeetingForm(prev => ({ ...prev, description: text }))}
              />

              {/* Meeting Type */}
              <View style={styles.pickerContainer}>
                <Text style={styles.pickerLabel}>Meeting Type</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                  {['lecture', 'tutorial', 'office_hours'].map((type) => (
                    <TouchableOpacity
                      key={type}
                      style={[
                        styles.typeOption,
                        meetingForm.meetingType === type && styles.selectedType
                      ]}
                      onPress={() => setMeetingForm(prev => ({ ...prev, meetingType: type }))}
                    >
                      <Text style={[
                        styles.typeOptionText,
                        meetingForm.meetingType === type && styles.selectedTypeText
                      ]}>
                        {type.replace('_', ' ').toUpperCase()}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>
            </View>

            {/* Schedule */}
            <View style={styles.formSection}>
              <Text style={styles.sectionTitle}>Schedule</Text>
              
              <TouchableOpacity
                style={styles.dateTimeButton}
                onPress={() => setShowDatePicker(true)}
              >
                <Ionicons name="calendar-outline" size={20} color="#6B7280" />
                <Text style={styles.dateTimeText}>
                  {meetingForm.scheduledDate.toDateString()}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.dateTimeButton}
                onPress={() => setShowTimePicker(true)}
              >
                <Ionicons name="time-outline" size={20} color="#6B7280" />
                <Text style={styles.dateTimeText}>
                  {meetingForm.scheduledTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </Text>
              </TouchableOpacity>

              <View style={styles.durationContainer}>
                <Text style={styles.pickerLabel}>Duration (minutes)</Text>
                <TextInput
                  style={styles.durationInput}
                  value={meetingForm.duration.toString()}
                  onChangeText={(text) => setMeetingForm(prev => ({ ...prev, duration: parseInt(text) || 60 }))}
                  keyboardType="numeric"
                />
              </View>
            </View>

            {/* Meeting Settings */}
            <View style={styles.formSection}>
              <Text style={styles.sectionTitle}>Meeting Settings</Text>
              
              {[
                { key: 'isRecordingEnabled', label: 'Enable Recording', icon: 'recording-outline' },
                { key: 'allowScreenShare', label: 'Allow Screen Share', icon: 'desktop-outline' },
                { key: 'allowChat', label: 'Allow Chat', icon: 'chatbubble-outline' },
                { key: 'waitingRoomEnabled', label: 'Enable Waiting Room', icon: 'shield-outline' },
                { key: 'passwordRequired', label: 'Require Password', icon: 'lock-closed-outline' },
                { key: 'breakoutRoomsEnabled', label: 'Enable Breakout Rooms', icon: 'people-outline' },
                { key: 'pollsEnabled', label: 'Enable Polls', icon: 'bar-chart-outline' },
                { key: 'whiteboardEnabled', label: 'Enable Whiteboard', icon: 'create-outline' },
                { key: 'attendanceTracking', label: 'Track Attendance', icon: 'checkmark-circle-outline' },
                { key: 'requiredAttendance', label: 'Required Attendance', icon: 'alert-circle-outline' },
              ].map((setting) => (
                <View key={setting.key} style={styles.settingRow}>
                  <View style={styles.settingInfo}>
                    <Ionicons name={setting.icon} size={20} color="#6B7280" />
                    <Text style={styles.settingLabel}>{setting.label}</Text>
                  </View>
                  <Switch
                    value={meetingForm[setting.key]}
                    onValueChange={(value) => setMeetingForm(prev => ({ ...prev, [setting.key]: value }))}
                    trackColor={{ false: '#E5E7EB', true: '#4F46E5' }}
                    thumbColor={meetingForm[setting.key] ? '#FFFFFF' : '#FFFFFF'}
                  />
                </View>
              ))}
            </View>
          </ScrollView>

          {/* Date/Time Pickers */}
          {showDatePicker && (
            <DateTimePicker
              value={meetingForm.scheduledDate}
              mode="date"
              display="default"
              onChange={(event, selectedDate) => {
                setShowDatePicker(false);
                if (selectedDate) {
                  setMeetingForm(prev => ({ ...prev, scheduledDate: selectedDate }));
                }
              }}
            />
          )}

          {showTimePicker && (
            <DateTimePicker
              value={meetingForm.scheduledTime}
              mode="time"
              display="default"
              onChange={(event, selectedTime) => {
                setShowTimePicker(false);
                if (selectedTime) {
                  setMeetingForm(prev => ({ ...prev, scheduledTime: selectedTime }));
                }
              }}
            />
          )}
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
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  createButton: {
    padding: 8,
  },
  listContainer: {
    padding: 20,
    paddingTop: 0,
  },
  meetingCard: {
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
  meetingHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  meetingInfo: {
    flex: 1,
    marginRight: 16,
  },
  meetingTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 4,
  },
  courseCode: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 4,
  },
  meetingTime: {
    fontSize: 14,
    color: '#4F46E5',
    fontWeight: '600',
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
  meetingDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  detailText: {
    fontSize: 12,
    color: '#6B7280',
  },
  meetingActions: {
    flexDirection: 'row',
    gap: 8,
    flexWrap: 'wrap',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    gap: 4,
  },
  startButton: {
    backgroundColor: '#10B981',
  },
  joinButton: {
    backgroundColor: '#4F46E5',
  },
  endButton: {
    backgroundColor: '#EF4444',
  },
  detailsButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#4F46E5',
  },
  actionButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyStateTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyStateText: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 24,
  },
  createFirstButton: {
    backgroundColor: '#4F46E5',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  createFirstButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
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
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 12,
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
    height: 80,
    textAlignVertical: 'top',
  },
  courseSelection: {
    marginBottom: 24,
  },
  courseOption: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginRight: 12,
    minWidth: 120,
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
  courseOptionSubtext: {
    fontSize: 12,
    color: '#6B7280',
    textAlign: 'center',
    marginTop: 2,
  },
  pickerContainer: {
    marginBottom: 12,
  },
  pickerLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  typeOption: {
    backgroundColor: '#F3F4F6',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 8,
  },
  selectedType: {
    backgroundColor: '#4F46E5',
  },
  typeOptionText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6B7280',
  },
  selectedTypeText: {
    color: '#FFFFFF',
  },
  dateTimeButton: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  dateTimeText: {
    fontSize: 16,
    color: '#1F2937',
  },
  durationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  durationInput: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    width: 80,
    textAlign: 'center',
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  settingInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  settingLabel: {
    fontSize: 14,
    color: '#374151',
  },
});
