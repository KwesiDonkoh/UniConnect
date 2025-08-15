import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  Alert,
  Animated,
  Dimensions,
  Platform,
  Switch,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import DateTimePicker from '@react-native-community/datetimepicker';
import assignmentService from '../services/assignmentService';
import { useApp } from '../context/AppContext';

const { width } = Dimensions.get('window');

export default function CreateAssignmentScreen({ navigation, route }) {
  const { courseCode, courseName } = route.params;
  const { user } = useApp();
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    instructions: '',
    dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 1 week from now
    maxPoints: 100,
    allowLateSubmission: true,
    lateSubmissionPenalty: 10,
    allowMultipleSubmissions: false,
    submissionTypes: ['file'],
    rubric: '',
    isVisible: true,
  });
  
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  const slideAnim = useRef(new Animated.Value(50)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 600,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const updateFormData = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const toggleSubmissionType = (type) => {
    const currentTypes = formData.submissionTypes;
    if (currentTypes.includes(type)) {
      updateFormData('submissionTypes', currentTypes.filter(t => t !== type));
    } else {
      updateFormData('submissionTypes', [...currentTypes, type]);
    }
  };

  const handleDateChange = (event, selectedDate) => {
    setShowDatePicker(false);
    if (selectedDate) {
      updateFormData('dueDate', selectedDate);
    }
  };

  const validateForm = () => {
    if (!formData.title.trim()) {
      Alert.alert('Validation Error', 'Assignment title is required');
      return false;
    }
    
    if (!formData.description.trim()) {
      Alert.alert('Validation Error', 'Assignment description is required');
      return false;
    }
    
    if (formData.submissionTypes.length === 0) {
      Alert.alert('Validation Error', 'At least one submission type must be selected');
      return false;
    }
    
    if (formData.maxPoints <= 0) {
      Alert.alert('Validation Error', 'Maximum points must be greater than 0');
      return false;
    }
    
    return true;
  };

  const createAssignment = async () => {
    if (!validateForm()) return;
    
    setIsLoading(true);
    
    try {
      const assignmentData = {
        ...formData,
        courseCode,
        courseName,
        createdBy: user.uid,
        creatorName: user.name || user.fullName,
      };
      
      const result = await assignmentService.createAssignment(assignmentData);
      
      if (result.success) {
        Alert.alert(
          'Success',
          'Assignment created successfully!',
          [
            { 
              text: 'OK', 
              onPress: () => navigation.goBack()
            }
          ]
        );
      } else {
        Alert.alert('Error', result.error || 'Failed to create assignment');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to create assignment. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const submissionTypeOptions = [
    { id: 'file', name: 'File Upload', icon: 'document', description: 'Students upload files' },
    { id: 'text', name: 'Text Entry', icon: 'create', description: 'Text-based submissions' },
    { id: 'url', name: 'Website URL', icon: 'link', description: 'Link to external content' },
    { id: 'media', name: 'Media Upload', icon: 'camera', description: 'Images, videos, audio' },
  ];

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <LinearGradient
        colors={['#6366F1', '#8B5CF6']}
        style={styles.header}
      >
        <View style={styles.headerContent}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
          </TouchableOpacity>
          
          <View style={styles.headerInfo}>
            <Text style={styles.headerTitle}>Create Assignment</Text>
            <Text style={styles.headerSubtitle}>{courseName}</Text>
          </View>
          
          <TouchableOpacity 
            style={[styles.saveButton, isLoading && styles.saveButtonDisabled]}
            onPress={createAssignment}
            disabled={isLoading}
          >
            <Ionicons name="checkmark" size={20} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
      </LinearGradient>

      <Animated.View 
        style={[
          styles.content,
          {
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }],
          },
        ]}
      >
        <ScrollView 
          style={styles.scrollView}
          showsVerticalScrollIndicator={false}
        >
          {/* Basic Information */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Basic Information</Text>
            
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Assignment Title *</Text>
              <TextInput
                style={styles.textInput}
                value={formData.title}
                onChangeText={(text) => updateFormData('title', text)}
                placeholder="Enter assignment title"
                placeholderTextColor="#94A3B8"
              />
            </View>
            
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Description *</Text>
              <TextInput
                style={[styles.textInput, styles.textArea]}
                value={formData.description}
                onChangeText={(text) => updateFormData('description', text)}
                placeholder="Describe what students need to do"
                placeholderTextColor="#94A3B8"
                multiline
                numberOfLines={4}
                textAlignVertical="top"
              />
            </View>
            
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Detailed Instructions</Text>
              <TextInput
                style={[styles.textInput, styles.textArea]}
                value={formData.instructions}
                onChangeText={(text) => updateFormData('instructions', text)}
                placeholder="Provide detailed instructions, requirements, and grading criteria"
                placeholderTextColor="#94A3B8"
                multiline
                numberOfLines={6}
                textAlignVertical="top"
              />
            </View>
          </View>

          {/* Due Date and Points */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Due Date & Points</Text>
            
            <View style={styles.row}>
              <View style={styles.halfWidth}>
                <Text style={styles.inputLabel}>Due Date</Text>
                <TouchableOpacity 
                  style={styles.dateButton}
                  onPress={() => setShowDatePicker(true)}
                >
                  <Ionicons name="calendar" size={20} color="#6366F1" />
                  <Text style={styles.dateText}>
                    {formData.dueDate.toLocaleDateString()}
                  </Text>
                  <Text style={styles.timeText}>
                    {formData.dueDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </Text>
                </TouchableOpacity>
              </View>
              
              <View style={styles.halfWidth}>
                <Text style={styles.inputLabel}>Maximum Points</Text>
                <TextInput
                  style={styles.textInput}
                  value={formData.maxPoints.toString()}
                  onChangeText={(text) => updateFormData('maxPoints', parseInt(text) || 0)}
                  placeholder="100"
                  placeholderTextColor="#94A3B8"
                  keyboardType="numeric"
                />
              </View>
            </View>
          </View>

          {/* Submission Types */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Submission Types</Text>
            <Text style={styles.sectionSubtitle}>Select how students can submit their work</Text>
            
            <View style={styles.submissionTypes}>
              {submissionTypeOptions.map((option) => (
                <TouchableOpacity
                  key={option.id}
                  style={[
                    styles.submissionTypeCard,
                    formData.submissionTypes.includes(option.id) && styles.submissionTypeCardActive
                  ]}
                  onPress={() => toggleSubmissionType(option.id)}
                >
                  <View style={styles.submissionTypeHeader}>
                    <View style={[
                      styles.submissionTypeIcon,
                      formData.submissionTypes.includes(option.id) && styles.submissionTypeIconActive
                    ]}>
                      <Ionicons 
                        name={option.icon} 
                        size={20} 
                        color={formData.submissionTypes.includes(option.id) ? '#FFFFFF' : '#6366F1'} 
                      />
                    </View>
                    <Text style={[
                      styles.submissionTypeName,
                      formData.submissionTypes.includes(option.id) && styles.submissionTypeNameActive
                    ]}>
                      {option.name}
                    </Text>
                    {formData.submissionTypes.includes(option.id) && (
                      <Ionicons name="checkmark-circle" size={20} color="#10B981" />
                    )}
                  </View>
                  <Text style={styles.submissionTypeDescription}>{option.description}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Submission Settings */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Submission Settings</Text>
            
            <View style={styles.settingItem}>
              <View style={styles.settingInfo}>
                <Text style={styles.settingName}>Allow Late Submissions</Text>
                <Text style={styles.settingDescription}>Students can submit after due date</Text>
              </View>
              <Switch
                value={formData.allowLateSubmission}
                onValueChange={(value) => updateFormData('allowLateSubmission', value)}
                trackColor={{ false: '#E5E7EB', true: '#86EFAC' }}
                thumbColor={formData.allowLateSubmission ? '#10B981' : '#9CA3AF'}
              />
            </View>
            
            {formData.allowLateSubmission && (
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Late Submission Penalty (%)</Text>
                <TextInput
                  style={styles.textInput}
                  value={formData.lateSubmissionPenalty.toString()}
                  onChangeText={(text) => updateFormData('lateSubmissionPenalty', parseInt(text) || 0)}
                  placeholder="10"
                  placeholderTextColor="#94A3B8"
                  keyboardType="numeric"
                />
              </View>
            )}
            
            <View style={styles.settingItem}>
              <View style={styles.settingInfo}>
                <Text style={styles.settingName}>Allow Multiple Submissions</Text>
                <Text style={styles.settingDescription}>Students can resubmit their work</Text>
              </View>
              <Switch
                value={formData.allowMultipleSubmissions}
                onValueChange={(value) => updateFormData('allowMultipleSubmissions', value)}
                trackColor={{ false: '#E5E7EB', true: '#86EFAC' }}
                thumbColor={formData.allowMultipleSubmissions ? '#10B981' : '#9CA3AF'}
              />
            </View>
            
            <View style={styles.settingItem}>
              <View style={styles.settingInfo}>
                <Text style={styles.settingName}>Visible to Students</Text>
                <Text style={styles.settingDescription}>Assignment is visible and accessible</Text>
              </View>
              <Switch
                value={formData.isVisible}
                onValueChange={(value) => updateFormData('isVisible', value)}
                trackColor={{ false: '#E5E7EB', true: '#86EFAC' }}
                thumbColor={formData.isVisible ? '#10B981' : '#9CA3AF'}
              />
            </View>
          </View>

          {/* Grading Rubric */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Grading Rubric (Optional)</Text>
            <Text style={styles.sectionSubtitle}>Define grading criteria and expectations</Text>
            
            <TextInput
              style={[styles.textInput, styles.textArea]}
              value={formData.rubric}
              onChangeText={(text) => updateFormData('rubric', text)}
              placeholder="Example:
• Excellent (90-100): Exceeds expectations
• Good (80-89): Meets all requirements
• Satisfactory (70-79): Meets most requirements
• Needs Improvement (60-69): Meets some requirements"
              placeholderTextColor="#94A3B8"
              multiline
              numberOfLines={8}
              textAlignVertical="top"
            />
          </View>

          <View style={styles.bottomSpacer} />
        </ScrollView>
      </Animated.View>

      {/* Date Picker */}
      {showDatePicker && (
        <DateTimePicker
          value={formData.dueDate}
          mode="datetime"
          display="default"
          onChange={handleDateChange}
          minimumDate={new Date()}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  header: {
    paddingTop: Platform.OS === 'ios' ? 0 : 20,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  headerInfo: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  headerSubtitle: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
    marginTop: 2,
  },
  saveButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  saveButtonDisabled: {
    opacity: 0.5,
  },
  content: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  section: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 16,
    marginVertical: 8,
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1E293B',
    marginBottom: 4,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: '#64748B',
    marginBottom: 16,
  },
  inputGroup: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
    marginBottom: 8,
  },
  textInput: {
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: '#1E293B',
    backgroundColor: '#F9FAFB',
  },
  textArea: {
    minHeight: 100,
    paddingTop: 12,
  },
  row: {
    flexDirection: 'row',
    gap: 12,
  },
  halfWidth: {
    flex: 1,
  },
  dateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#F9FAFB',
    gap: 8,
  },
  dateText: {
    flex: 1,
    fontSize: 16,
    color: '#1E293B',
  },
  timeText: {
    fontSize: 14,
    color: '#64748B',
  },
  submissionTypes: {
    gap: 12,
  },
  submissionTypeCard: {
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    padding: 16,
    backgroundColor: '#F9FAFB',
  },
  submissionTypeCardActive: {
    borderColor: '#6366F1',
    backgroundColor: '#F0F4FF',
  },
  submissionTypeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 12,
  },
  submissionTypeIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#EEF2FF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  submissionTypeIconActive: {
    backgroundColor: '#6366F1',
  },
  submissionTypeName: {
    flex: 1,
    fontSize: 16,
    fontWeight: '500',
    color: '#1E293B',
  },
  submissionTypeNameActive: {
    color: '#6366F1',
  },
  submissionTypeDescription: {
    fontSize: 14,
    color: '#64748B',
    marginLeft: 52,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  settingInfo: {
    flex: 1,
  },
  settingName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1E293B',
    marginBottom: 2,
  },
  settingDescription: {
    fontSize: 14,
    color: '#64748B',
  },
  bottomSpacer: {
    height: 40,
  },
});
