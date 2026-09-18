import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  Alert,
  Modal,
  TextInput,
  Image,
  ActivityIndicator,
  Dimensions,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import * as ImagePicker from 'expo-image-picker';
import * as ImageManipulator from 'expo-image-manipulator';
import { useApp } from '../context/AppContext';
import { useTheme } from '../components/ThemeProvider';
import { UNIVERSITY_DATA } from '../data/universityData';

const { width } = Dimensions.get('window');

export default function ProfileScreen({ navigation }) {
  const { user, csModules, signOut, updateUserData } = useApp();
  const { isDark } = useTheme();
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [showIDModal, setShowIDModal] = useState(false); // Dynamic ID
  const [showCareerModal, setShowCareerModal] = useState(false); // Career Matcher
  const [profileImage, setProfileImage] = useState(user?.avatar || null);
  const [isUpdating, setIsUpdating] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [editForm, setEditForm] = useState({
    fullName: user?.name || '',
    identifier: user?.identifier || user?.studentId || '',
    university: user?.university || '',
    degreeType: user?.degreeType || 'Undergraduate',
    college: user?.college || '',
    programme: user?.programme || '',
    department: user?.department || '',
    avatar: user?.avatar || null,
  });

  // Safety check - if user is null after logout, show loading
  if (!user) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4F46E5" />
        <Text style={styles.loadingText}>Loading profile...</Text>
      </SafeAreaView>
    );
  }

  // Update form when user changes
  useEffect(() => {
    if (user) {
      setEditForm({
        fullName: user.name || '',
        identifier: user.identifier || user.studentId || '',
        college: user.college || '',
        programme: user.programme || '',
        department: user.department || '',
        avatar: user.avatar || null,
      });
      setProfileImage(user.avatar || null);
    }
  }, [user]);

  // Track changes for auto-save indication
  useEffect(() => {
    const hasChanges =
      editForm.fullName !== (user?.name || '') ||
      editForm.identifier !== (user?.identifier || user?.studentId || '') ||
      editForm.college !== (user?.college || '') ||
      editForm.programme !== (user?.programme || '') ||
      editForm.department !== (user?.department || '') ||
      editForm.avatar !== (user?.avatar || null);

    setHasUnsavedChanges(hasChanges);
  }, [editForm, user]);

  // Get modules and calculate stats based on user type
  const getModulesAndStats = () => {
    if (user?.userType === 'lecturer') {
      // For lecturers, use the csModules directly (already filtered in AppContext)
      const courseDetails = Array.isArray(csModules) ? csModules : [];

      const totalCredits = courseDetails.reduce((sum, course) => sum + (course.credits || 3), 0);
      const semester1Modules = courseDetails.filter(module => module.semester === 1);
      const semester2Modules = courseDetails.filter(module => module.semester === 2);

      // Get unique levels from course codes
      const levelsCovered = [...new Set(courseDetails.map(course => {
        if (course.code?.startsWith('CSM1')) return '100';
        if (course.code?.startsWith('CSM2')) return '200';
        if (course.code?.startsWith('CSM3')) return '300';
        if (course.code?.startsWith('CSM4')) return '400';
        return '300'; // Default level
      }))].sort();

      return {
        currentLevelModules: courseDetails,
        totalCredits,
        semester1Modules,
        semester2Modules,
        levelsCovered
      };
    } else {
      // For students, csModules is already the correct level modules
      const currentLevelModules = Array.isArray(csModules) ? csModules : [];
      const totalCredits = currentLevelModules.reduce((sum, course) => sum + (course.credits || 3), 0);
      const semester1Modules = currentLevelModules.filter(module => module.semester === 1);
      const semester2Modules = currentLevelModules.filter(module => module.semester === 2);

      return {
        currentLevelModules,
        totalCredits,
        semester1Modules,
        semester2Modules,
        levelsCovered: [user?.academicLevel || '100']
      };
    }
  };

  const { currentLevelModules, totalCredits, semester1Modules, semester2Modules, levelsCovered } = getModulesAndStats();

  // Handle profile image selection
  const pickImage = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert(
          'Permission Required',
          'Please grant camera roll permissions to change your profile picture.',
          [{ text: 'OK' }]
        );
        return;
      }

      Alert.alert(
        'Select Photo',
        'Choose how you\'d like to select your profile picture',
        [
          {
            text: 'Camera',
            onPress: () => openCamera(),
          },
          {
            text: 'Photo Library',
            onPress: () => openImagePicker(),
          },
          {
            text: 'Cancel',
            style: 'cancel',
          },
        ]
      );
    } catch (error) {
      console.error('Error requesting permissions:', error);
    }
  };

  const openCamera = async () => {
    try {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert(
          'Camera Permission Required',
          'Please grant camera permissions to take a photo.',
          [{ text: 'OK' }]
        );
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaType.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.5,
      });

      if (!result.canceled && result.assets[0]) {
        await processImage(result.assets[0].uri);
      }
    } catch (error) {
      console.error('Error opening camera:', error);
      Alert.alert('Error', 'Failed to open camera. Please try again.');
    }
  };

  const openImagePicker = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaType.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.5,
      });

      if (!result.canceled && result.assets[0]) {
        await processImage(result.assets[0].uri);
      }
    } catch (error) {
      console.error('Error opening image picker:', error);
      Alert.alert('Error', 'Failed to select image. Please try again.');
    }
  };

  const processImage = async (imageUri) => {
    try {
      setIsUpdating(true);

      // Resize and compress the image
      const manipulatedImage = await ImageManipulator.manipulateAsync(
        imageUri,
        [{ resize: { width: 300, height: 300 } }],
        { compress: 0.7, format: ImageManipulator.SaveFormat.JPEG }
      );

      // Update local state immediately for instant feedback
      setProfileImage(manipulatedImage.uri);
      setEditForm(prev => ({ ...prev, avatar: manipulatedImage.uri }));

      // Auto-save if modal is not open (real-time update)
      if (!editModalVisible) {
        await handleSaveProfile({ avatar: manipulatedImage.uri }, false);
      }
    } catch (error) {
      console.error('Error processing image:', error);
      Alert.alert('Error', 'Failed to process image. Please try again.');
    } finally {
      setIsUpdating(false);
    }
  };

  // Handle logout
  const handleLogout = () => {
    if (hasUnsavedChanges) {
      Alert.alert(
        'Unsaved Changes',
        'You have unsaved changes. Do you want to save them before logging out?',
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Discard Changes',
            style: 'destructive',
            onPress: () => confirmLogout(),
          },
          {
            text: 'Save & Logout',
            onPress: async () => {
              await handleSaveProfile(editForm, false);
              confirmLogout();
            },
          },
        ]
      );
    } else {
      confirmLogout();
    }
  };

  const confirmLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: async () => {
            try {
              const result = await signOut();
              if (!result.success) {
                Alert.alert('Error', 'Failed to logout. Please try again.');
              }
            } catch (error) {
              Alert.alert('Error', 'An unexpected error occurred.');
            }
          }
        },
      ]
    );
  };

  // Handle edit profile modal
  const handleEditProfile = () => {
    setEditForm({
      fullName: user?.name || '',
      identifier: user?.identifier || user?.studentId || '',
      college: user?.college || '',
      programme: user?.programme || '',
      department: user?.department || '',
      avatar: user?.avatar || null,
    });
    setEditModalVisible(true);
  };

  // Real-time save functionality
  const handleSaveProfile = async (formData = editForm, showAlert = true) => {
    try {
      setIsUpdating(true);

      // Prepare update data with validation to prevent undefined values
      const updateData = {};

      if (formData.fullName && formData.fullName.trim()) {
        updateData.fullName = formData.fullName.trim();
      }
      if (formData.identifier && formData.identifier.trim()) {
        updateData.identifier = formData.identifier.trim();
      }
      if (formData.department && formData.department.trim()) {
        updateData.department = formData.department.trim();
      }
      if (formData.university && formData.university.trim()) {
        updateData.university = formData.university.trim();
      }
      if (formData.college && formData.college.trim()) {
        updateData.college = formData.college.trim();
      }
      if (formData.programme && formData.programme.trim()) {
        updateData.programme = formData.programme.trim();
      }
      if (formData.avatar) {
        updateData.avatar = formData.avatar;
      }

      // Only update if there are valid fields to update
      if (Object.keys(updateData).length === 0) {
        Alert.alert('Error', 'Please provide valid information to update');
        return;
      }

      const result = await updateUserData(updateData);

      if (result.success) {
        setHasUnsavedChanges(false);
        if (showAlert) {
          setEditModalVisible(false);
          Alert.alert('Success', 'Profile updated successfully! ✅');
        }
      } else {
        Alert.alert('Error', result.error || 'Failed to update profile');
      }
    } catch (error) {
      Alert.alert('Error', 'An unexpected error occurred');
    } finally {
      setIsUpdating(false);
    }
  };

  // Real-time input handling
  const handleInputChange = (field, value) => {
    setEditForm(prev => ({ ...prev, [field]: value }));
  };

  // Auto-save functionality (debounced)
  useEffect(() => {
    if (hasUnsavedChanges && !editModalVisible) {
      const saveTimer = setTimeout(() => {
        handleSaveProfile(editForm, false);
      }, 2000); // Auto-save after 2 seconds of no changes

      return () => clearTimeout(saveTimer);
    }
  }, [editForm, hasUnsavedChanges, editModalVisible]);

  const handleNotificationSettings = () => {
    Alert.alert(
      'Notification Settings',
      'Choose your notification preferences',
      [
        {
          text: 'Configure',
          onPress: () => {
            Alert.alert(
              '🔔 Notification Preferences',
              'Assignments: ON\nAnnouncements: ON\nGroup Messages: ON\nApp Updates: OFF\n\nThese settings help you stay updated with important information.',
              [{ text: 'Got it', style: 'default' }]
            );
          }
        },
        { text: 'Cancel', style: 'cancel' }
      ]
    );
  };

  const handlePrivacySecurity = () => {
    Alert.alert(
      '🔒 Privacy & Security',
      'Your data is protected with:\n\n• End-to-end encryption for messages\n• Secure Firebase authentication\n• GDPR compliant data handling\n• No data sharing with third parties\n\nFor detailed privacy policy, visit our website.',
      [
        {
          text: 'Change Password',
          onPress: () => navigation.navigate('ForgotPassword')
        },
        { text: 'OK', style: 'default' }
      ]
    );
  };

  const handleHelpSupport = () => {
    Alert.alert(
      '📞 Help & Support',
      'Need assistance? We\'re here to help!\n\n📧 Email: support@uniconnect.edu\n📱 Phone: +1 (555) 123-4567\n🕒 Hours: Mon-Fri 9AM-5PM\n\n💬 Live Chat: Available in-app\n📚 FAQs: Check our help center',
      [
        {
          text: 'Contact Support',
          onPress: () => Alert.alert('Support', 'Opening support chat...', [{ text: 'OK' }])
        },
        { text: 'OK', style: 'default' }
      ]
    );
  };

  const handleAbout = () => {
    Alert.alert(
      '🎓 About UniConnect',
      'UniConnect v2.1.0\n\nConnecting university students for better learning and collaboration.\n\n🚀 Features:\n• Level-based chat rooms\n• Senior student mentorship\n• Note sharing\n• Real-time notifications\n\n💻 Built with React Native & Firebase\n🏛️ Developed for Computer Science students\n\n© 2024 UniConnect. All rights reserved.',
      [{ text: 'Awesome!', style: 'default' }]
    );
  };

  const profileOptions = [
    {
      id: '1',
      title: 'Edit Profile',
      icon: 'person-outline',
      onPress: handleEditProfile,
      badge: hasUnsavedChanges ? 'unsaved' : null,
    },
    {
      id: '2',
      title: 'Notifications Settings',
      icon: 'notifications-outline',
      onPress: handleNotificationSettings,
    },
    {
      id: '3',
      title: 'Privacy & Security',
      icon: 'shield-outline',
      onPress: handlePrivacySecurity,
    },
    {
      id: '4',
      title: 'Help & Support',
      icon: 'help-circle-outline',
      onPress: handleHelpSupport,
    },
    {
      id: '5',
      title: 'Accessibility Hub',
      icon: 'body-outline',
      onPress: () => Alert.alert('Accessibility Hub', '2030 Accessibility Suite Enabled:\n\n• Neural Voice-Over\n• High-Contrast Optimization\n• Dyslexia-Friendly Fonts\n• Motion Reduction'),
    },
    {
      id: '6',
      title: 'Offline Management',
      icon: 'download-outline',
      onPress: () => Alert.alert('Offline Management', 'Smart Caching Status:\n\n• Lecture Notes: 1.2GB cached\n• Schedule: Synced\n• Campus Map: Available Offline'),
    },
    {
      id: '7',
      title: 'About UniConnect',
      icon: 'information-circle-outline',
      onPress: handleAbout,
    },
  ];

  const renderProfileOption = (option) => (
    <TouchableOpacity
      key={option.id}
      style={styles.optionCard}
      onPress={option.onPress}
      activeOpacity={0.7}
    >
      <View style={styles.optionContent}>
        <View style={styles.optionIconContainer}>
          <Ionicons name={option.icon} size={24} color="#4F46E5" />
        </View>
        <View style={styles.optionTextContainer}>
          <Text style={styles.optionTitle}>{option.title}</Text>
          {option.badge === 'unsaved' && (
            <View style={styles.unsavedBadge}>
              <Text style={styles.unsavedBadgeText}>Unsaved changes</Text>
            </View>
          )}
        </View>
      </View>
      <Ionicons name="chevron-forward" size={20} color="#94A3B8" />
    </TouchableOpacity>
  );

  const renderCourse = (course, index) => {
    const colors = [
      { bg: '#EEF2FF', icon: '#4F46E5' },
      { bg: '#F0FDF4', icon: '#059669' },
      { bg: '#FEF3C7', icon: '#D97706' },
      { bg: '#FDF2F8', icon: '#EC4899' },
    ];
    const colorScheme = colors[index % colors.length];

    return (
      <View key={course.id} style={[styles.courseItem, { backgroundColor: colorScheme.bg }]}>
        <View style={[styles.courseIcon, { backgroundColor: colorScheme.icon }]}>
          <Ionicons name="code-slash" size={18} color="#FFFFFF" />
        </View>
        <View style={styles.courseInfo}>
          <Text style={styles.courseName} numberOfLines={2}>{course.name}</Text>
          <View style={styles.courseDetails}>
            <Text style={[styles.courseCode, { color: colorScheme.icon }]}>{course.code}</Text>
            <Text style={styles.courseCredits}>{course.credits} Credits</Text>
          </View>
          <Text style={styles.courseInstructor}>{course.instructor}</Text>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={[styles.container, isDark && styles.darkContainer]}>
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Enhanced Header with Profile Picture */}
        <LinearGradient
          colors={['#4F46E5', '#6366F1']}
          style={styles.headerGradient}
        >
          <View style={styles.header}>
            <View style={[styles.profileCard, isDark && styles.darkProfileCard]}>
              <View style={styles.avatarSection}>
                <TouchableOpacity
                  style={styles.avatarContainer}
                  onPress={pickImage}
                  activeOpacity={0.8}
                >
                  {isUpdating ? (
                    <View style={styles.avatarLoading}>
                      <ActivityIndicator size="large" color="#FFFFFF" />
                    </View>
                  ) : profileImage ? (
                    <Image
                      source={{ uri: profileImage }}
                      style={styles.avatarImage}
                      resizeMode="cover"
                    />
                  ) : (
                    <LinearGradient
                      colors={['#4F46E5', '#6366F1']}
                      style={styles.avatarGradient}
                    >
                      <Text style={styles.avatarText}>
                        {user?.name?.split(' ').map(n => n[0]).join('').toUpperCase() || (user?.userType === 'lecturer' ? 'L' : 'ST')}
                      </Text>
                    </LinearGradient>
                  )}

                  {user?.userType === 'lecturer' && (
                    <View style={styles.lecturerBadge}>
                      <Ionicons name="school" size={14} color="#FFFFFF" />
                    </View>
                  )}

                  <View style={styles.cameraOverlay}>
                    <Ionicons name="camera" size={16} color="#FFFFFF" />
                  </View>
                </TouchableOpacity>

                <View style={styles.userInfo}>
                  <Text style={[styles.userName, isDark && styles.darkUserName]}>
                    {user?.userType === 'lecturer' ? `${user?.title || 'Dr.'} ` : ''}{user?.name || 'User Name'}
                  </Text>
                  <Text style={styles.userEmail}>{user?.email || 'email@university.edu'}</Text>

                  <View style={styles.idBadgeRow}>
                    <View style={[styles.idBadge, { backgroundColor: isDark ? 'rgba(99, 102, 241, 0.2)' : '#EEF2FF' }]}>
                      <Ionicons name="card-outline" size={14} color="#4F46E5" />
                      <Text style={[styles.idBadgeText, { color: '#4F46E5' }]}>
                        {user?.identifier || user?.studentId || (user?.userType === 'lecturer' ? 'STAFF000' : 'CST000000')}
                      </Text>
                    </View>
                  </View>

                  <View style={styles.levelBadgeContainer}>
                    <LinearGradient
                      colors={['#4F46E5', '#6366F1']}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 0 }}
                      style={styles.levelBadge}
                    >
                      <Text style={styles.levelBadgeText}>
                        {user?.userType === 'lecturer'
                          ? `${levelsCovered.length} Level${levelsCovered.length > 1 ? 's' : ''}`
                          : user?.degreeType === 'Undergraduate' ? `Level ${user?.academicLevel || '100'}` : user?.degreeType
                        }
                      </Text>
                    </LinearGradient>
                    <Text style={[styles.department, isDark && { color: '#94A3B8' }]}>
                      {user?.programme || user?.department || 'Computer Science'}
                    </Text>
                  </View>
                  <Text style={[styles.universityText, isDark && { color: '#6366F1' }]}>
                    {user?.university || 'Kwame Nkrumah University of Science and Technology'}
                  </Text>
                  {user?.college && (
                    <Text style={[styles.collegeText, isDark && { color: '#64748B' }]}>{user.college}</Text>
                  )}

                  {hasUnsavedChanges && (
                    <View style={styles.syncIndicator}>
                      <View style={styles.syncDot} />
                      <Text style={styles.syncText}>Changes pending...</Text>
                    </View>
                  )}

                  <View style={{ flexDirection: 'row', gap: 8, marginTop: 12 }}>
                    <TouchableOpacity
                      style={{ flex: 1, borderRadius: 12, overflow: 'hidden' }}
                      onPress={() => setShowIDModal(true)}
                    >
                      <LinearGradient colors={['#4F46E5', '#3730A3']} style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 8, paddingHorizontal: 12, gap: 8 }}>
                        <Ionicons name="card" size={14} color="#FFF" />
                        <Text style={{ color: '#FFF', fontSize: 12, fontWeight: '800' }}>Digital ID</Text>
                      </LinearGradient>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={{ flex: 1, borderRadius: 12, overflow: 'hidden' }}
                      onPress={() => setShowCareerModal(true)}
                    >
                      <LinearGradient colors={['#F59E0B', '#D97706']} style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 8, paddingHorizontal: 12, gap: 8 }}>
                        <Ionicons name="medal" size={14} color="#FFF" />
                        <Text style={{ color: '#FFF', fontSize: 12, fontWeight: '800' }}>Badges</Text>
                      </LinearGradient>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            </View>
          </View>
        </LinearGradient>

        {/* Professional Portfolio AI */}
        <View style={styles.section}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15 }}>
            <Text style={styles.sectionTitle}>Professional Portfolio</Text>
            <TouchableOpacity onPress={() => navigation.navigate('CareerVoyager')}>
              <Text style={{ color: '#4F46E5', fontSize: 13, fontWeight: '700' }}>Manage Portfolio</Text>
            </TouchableOpacity>
          </View>
          
          <TouchableOpacity 
            style={[styles.careerCard, { borderRadius: 20, overflow: 'hidden' }]}
            onPress={() => setShowCareerModal(true)}
          >
             <LinearGradient colors={['#F8FAFC', '#F1F5F9']} style={{ padding: 15, borderLeftWidth: 4, borderLeftColor: '#4F46E5' }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                   <Ionicons name="compass" size={24} color="#4F46E5" />
                   <View>
                      <Text style={{ fontSize: 15, fontWeight: '800', color: '#1E293B' }}>Recommended: Cloud Architect</Text>
                      <Text style={{ fontSize: 12, color: '#64748B' }}>Based on your A+ in Distibuted Systems</Text>
                   </View>
                </View>
             </LinearGradient>
          </TouchableOpacity>

          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 15 }}>
            {['Python', 'React Native', 'AWS', 'Critical Thinking', 'Leadership'].map(skill => (
              <View key={skill} style={{ backgroundColor: '#EEF2FF', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20, borderWidth: 1, borderColor: '#E0E7FF' }}>
                <Text style={{ fontSize: 11, fontWeight: '700', color: '#4F46E5' }}>{skill}</Text>
              </View>
            ))}
            <TouchableOpacity style={{ backgroundColor: '#F1F5F9', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20, borderStyle: 'dashed', borderWidth: 1, borderColor: '#CBD5E1' }}>
              <Text style={{ fontSize: 11, fontWeight: '700', color: '#64748B' }}>+ Add Skill</Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity 
            style={{ marginTop: 20, flex: 1, borderRadius: 15, overflow: 'hidden' }}
            onPress={() => Alert.alert('Export CV', 'AI is generating your professional smart-CV based on your academic path...')}
          >
            <LinearGradient colors={['#10B981', '#059669']} style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 12, gap: 10 }}>
              <Ionicons name="document" size={18} color="#FFF" />
              <Text style={{ color: '#FFF', fontSize: 14, fontWeight: '800' }}>Export Smart CV (PDF)</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>

        {/* Achievements Gallery */}
        <View style={styles.section}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15 }}>
            <Text style={styles.sectionTitle}>Achievements Gallery</Text>
            <TouchableOpacity onPress={() => Alert.alert('Achievements', 'View all 24 unlocked badges')}>
              <Text style={{ color: '#4F46E5', fontSize: 12, fontWeight: '700' }}>View All</Text>
            </TouchableOpacity>
          </View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 12 }}>
            {[
              { label: 'Top Contributor', icon: 'star', color: '#F59E0B', bg: '#FFF7ED' },
              { label: 'Perfect Attendance', icon: 'calendar', color: '#10B981', bg: '#F0FDF4' },
              { label: 'Lab Hero', icon: 'flask', color: '#8B5CF6', bg: '#F5F3FF' },
              { label: 'Scholar', icon: 'ribbon', color: '#4F46E5', bg: '#EEF2FF' },
              { label: 'Research Pro', icon: 'search', color: '#EC4899', bg: '#FDF2F8' },
            ].map((badge, i) => (
              <TouchableOpacity key={i} style={{ backgroundColor: badge.bg, padding: 12, borderRadius: 16, alignItems: 'center', width: 90, borderWidth: 1, borderColor: badge.color + '20' }}>
                <View style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: badge.color + '15', justifyContent: 'center', alignItems: 'center', marginBottom: 8 }}>
                  <Ionicons name={badge.icon} size={22} color={badge.color} />
                </View>
                <Text style={{ fontSize: 9, fontWeight: '800', color: badge.color, textAlign: 'center' }}>{badge.label.toUpperCase()}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Learning & Performance Analytics */}
        <View style={styles.section}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15 }}>
            <Text style={styles.sectionTitle}>Learning Analytics</Text>
            <View style={{ backgroundColor: '#EEF2FF', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 }}>
              <Text style={{ fontSize: 10, fontWeight: '800', color: '#4F46E5' }}>AI INSIGHT</Text>
            </View>
          </View>
          <View style={{ backgroundColor: isDark ? '#1E293B' : '#F8FAFC', borderRadius: 24, padding: 20, borderWidth: 1, borderColor: isDark ? '#334155' : '#E2E8F0' }}>
            <Text style={{ fontSize: 13, color: '#64748B', marginBottom: 15 }}>Weekly Performance Trend</Text>
            <View style={{ flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between', height: 100, paddingHorizontal: 10 }}>
               {[40, 75, 55, 90, 65, 80, 95].map((h, i) => (
                 <View key={i} style={{ alignItems: 'center', gap: 8 }}>
                    <LinearGradient colors={h > 80 ? ['#10B981', '#34D399'] : ['#4F46E5', '#818CF8']} style={{ width: 22, height: h, borderRadius: 6 }} />
                    <Text style={{ fontSize: 9, color: '#94A3B8', fontWeight: '700' }}>{['M', 'T', 'W', 'T', 'F', 'S', 'S'][i]}</Text>
                 </View>
               ))}
            </View>
            <View style={{ marginTop: 20, paddingTop: 15, borderTopWidth: 1, borderTopColor: isDark ? '#334155' : '#E2E8F0' }}>
               {(() => {
                 const avgPerformance = [40, 75, 55, 90, 65, 80, 95].reduce((a, b) => a + b, 0) / 7;
                 const isOnTrack = avgPerformance > 70;
                 return (
                   <Text style={{ fontSize: 12, color: isOnTrack ? '#059669' : '#4F46E5', fontWeight: '700' }}>
                     {isOnTrack ? "🚀 You're on track for First Class honors this semester!" : "💡 Dedicate 2 more hours to MATH301 for a grade boost."}
                   </Text>
                 );
               })()}
            </View>
          </View>
        </View>

        {/* Social Connection Suggestions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Connect with Peers</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 12, marginTop: 15 }}>
            {[
              { name: 'Dr. Mensah', role: 'Mentor', avatar: 'https://i.pravatar.cc/150?u=1' },
              { name: 'Sarah Wilson', role: 'Project Partner', avatar: 'https://i.pravatar.cc/150?u=2' },
              { name: 'John Doe', role: 'Study Group Admin', avatar: 'https://i.pravatar.cc/150?u=3' },
            ].map((peer, i) => (
              <View key={i} style={{ width: 140, backgroundColor: isDark ? '#1E293B' : '#FFF', padding: 15, borderRadius: 20, alignItems: 'center', borderWidth: 1, borderColor: isDark ? '#334155' : '#F1F5F9' }}>
                <Image source={{ uri: peer.avatar }} style={{ width: 50, height: 50, borderRadius: 25, marginBottom: 10 }} />
                <Text style={{ fontSize: 13, fontWeight: '800', color: isDark ? '#F1F5F9' : '#1E293B', textAlign: 'center' }}>{peer.name}</Text>
                <Text style={{ fontSize: 10, color: '#64748B', marginBottom: 12 }}>{peer.role}</Text>
                <TouchableOpacity style={{ backgroundColor: '#4F46E5', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 10 }}>
                   <Text style={{ color: '#FFF', fontSize: 11, fontWeight: '700' }}>Connect</Text>
                </TouchableOpacity>
              </View>
            ))}
          </ScrollView>
        </View>

        {user?.userType === 'lecturer' && (
          <View style={styles.section}>
             <Text style={styles.sectionTitle}>Teaching Impact & Publications</Text>
             <View style={{ gap: 10, marginTop: 12 }}>
                {[
                  { label: 'Student Rating', value: '4.9/5.0', icon: 'star', color: '#F59E0B' },
                  { label: 'Active Citations', value: '1,240', icon: 'book', color: '#4F46E5' },
                  { label: 'Research Score', value: '92', icon: 'analytics', color: '#10B981' },
                ].map((impact, i) => (
                  <View key={i} style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: isDark ? '#1E293B' : '#F8FAFC', padding: 15, borderRadius: 16, borderWidth: 1, borderColor: isDark ? '#334155' : '#E2E8F0' }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                       <View style={{ width: 36, height: 36, borderRadius: 10, backgroundColor: impact.color + '10', justifyContent: 'center', alignItems: 'center' }}>
                          <Ionicons name={impact.icon} size={20} color={impact.color} />
                       </View>
                       <Text style={{ fontSize: 14, fontWeight: '700', color: isDark ? '#CBD5E1' : '#475569' }}>{impact.label}</Text>
                    </View>
                    <Text style={{ fontSize: 16, fontWeight: '900', color: impact.color }}>{impact.value}</Text>
                  </View>
                ))}
             </View>
          </View>
        )}

        {/* Academic/Teaching Stats */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            {user?.userType === 'lecturer' ? 'Teaching Overview' : 'Academic Overview'}
          </Text>
          <View style={styles.statsContainer}>
            <View style={styles.statCard}>
              <View style={styles.statIcon}>
                <Ionicons
                  name={user?.userType === 'lecturer' ? 'library' : 'library-outline'}
                  size={20}
                  color="#4F46E5"
                />
              </View>
              <Text style={styles.statNumber}>{currentLevelModules.length}</Text>
              <Text style={styles.statLabel}>
                {user?.userType === 'lecturer' ? 'Courses' : 'Modules'}
              </Text>
            </View>

            <View style={styles.statCard}>
              <View style={styles.statIcon}>
                <Ionicons
                  name={user?.userType === 'lecturer' ? 'people' : 'school-outline'}
                  size={20}
                  color="#059669"
                />
              </View>
              <Text style={styles.statNumber}>
                {user?.userType === 'lecturer' ? '150+' : totalCredits}
              </Text>
              <Text style={styles.statLabel}>
                {user?.userType === 'lecturer' ? 'Students' : 'Credits'}
              </Text>
            </View>

            <View style={styles.statCard}>
              <View style={styles.statIcon}>
                <Ionicons name="calendar-outline" size={20} color="#D97706" />
              </View>
              <Text style={styles.statNumber}>
                {user?.userType === 'lecturer' ? levelsCovered.length : (user?.academicLevel || '100')}
              </Text>
              <Text style={styles.statLabel}>
                {user?.userType === 'lecturer' ? 'Levels' : user?.degreeType || 'Level'}
              </Text>
            </View>
          </View>
        </View>

        {/* Course/Module Organization */}
        {user?.userType === 'lecturer' ? (
          levelsCovered.sort().map(level => {
            const levelCourses = currentLevelModules.filter(course => {
              if (course.code?.startsWith('CSM1')) return level === '100';
              if (course.code?.startsWith('CSM2')) return level === '200';
              if (course.code?.startsWith('CSM3')) return level === '300';
              if (course.code?.startsWith('CSM4')) return level === '400';
              return level === '300'; // Default level
            });

            return (
              <View key={level} style={styles.section}>
                <View style={styles.sectionHeader}>
                  <Text style={styles.sectionTitle}>Level {level} Courses</Text>
                  <View style={styles.moduleBadge}>
                    <Text style={styles.moduleBadgeText}>{levelCourses.length}</Text>
                  </View>
                </View>
                <View style={styles.coursesContainer}>
                  {levelCourses.map((course, index) => renderCourse(course, index))}
                </View>
              </View>
            );
          })
        ) : (
          <>
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Semester 1 Modules</Text>
                <View style={styles.moduleBadge}>
                  <Text style={styles.moduleBadgeText}>{semester1Modules.length}</Text>
                </View>
              </View>
              <View style={styles.coursesContainer}>
                {semester1Modules.map((course, index) => renderCourse(course, index))}
              </View>
            </View>

            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Semester 2 Modules</Text>
                <View style={styles.moduleBadge}>
                  <Text style={styles.moduleBadgeText}>{semester2Modules.length}</Text>
                </View>
              </View>
              <View style={styles.coursesContainer}>
                {semester2Modules.map((course, index) => renderCourse(course, index))}
              </View>
            </View>
          </>
        )}

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Settings</Text>
          <View style={styles.optionsContainer}>
            {profileOptions.map(renderProfileOption)}
          </View>
        </View>

        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Ionicons name="log-out-outline" size={20} color="#EF4444" />
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Enhanced Edit Profile Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={editModalVisible}
        onRequestClose={() => {
          if (hasUnsavedChanges) {
            Alert.alert(
              'Unsaved Changes',
              'You have unsaved changes. Do you want to save them?',
              [
                { text: 'Discard', style: 'destructive', onPress: () => setEditModalVisible(false) },
                { text: 'Save', onPress: () => handleSaveProfile() },
              ]
            );
          } else {
            setEditModalVisible(false);
          }
        }}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            {/* Enhanced Modal Header */}
            <LinearGradient
              colors={['#4F46E5', '#6366F1']}
              style={styles.modalHeaderGradient}
            >
              <View style={styles.modalHeader}>
                <View style={styles.modalHeaderContent}>
                  <View style={styles.modalIconContainer}>
                    <Ionicons name="person-circle" size={28} color="#FFFFFF" />
                  </View>
                  <View style={styles.modalTitleContainer}>
                    <Text style={styles.modalTitle}>Edit Profile</Text>
                    <Text style={styles.modalSubtitle}>Update your personal information</Text>
                  </View>
                </View>
                <TouchableOpacity
                  style={styles.closeButton}
                  onPress={() => {
                    if (hasUnsavedChanges) {
                      Alert.alert(
                        'Unsaved Changes',
                        'You have unsaved changes. Do you want to save them?',
                        [
                          { text: 'Discard', style: 'destructive', onPress: () => setEditModalVisible(false) },
                          { text: 'Save', onPress: () => handleSaveProfile() },
                        ]
                      );
                    } else {
                      setEditModalVisible(false);
                    }
                  }}
                >
                  <Ionicons name="close" size={24} color="#FFFFFF" />
                </TouchableOpacity>
              </View>
            </LinearGradient>

            {/* Profile Picture Selection */}
            <View style={styles.modalProfilePicture}>
              <Text style={styles.modalSectionTitle}>Profile Picture</Text>
              <TouchableOpacity
                style={styles.modalAvatarContainer}
                onPress={pickImage}
                activeOpacity={0.8}
              >
                {isUpdating ? (
                  <View style={styles.modalAvatarLoading}>
                    <ActivityIndicator size="large" color="#4F46E5" />
                  </View>
                ) : editForm.avatar ? (
                  <Image
                    source={{ uri: editForm.avatar }}
                    style={styles.modalAvatarImage}
                    resizeMode="cover"
                  />
                ) : (
                  <LinearGradient
                    colors={['#4F46E5', '#6366F1']}
                    style={styles.modalAvatarGradient}
                  >
                    <Text style={styles.modalAvatarText}>
                      {user?.name?.split(' ').map(n => n[0]).join('').toUpperCase() || (user?.userType === 'lecturer' ? 'L' : 'ST')}
                    </Text>
                  </LinearGradient>
                )}

                <View style={styles.modalCameraOverlay}>
                  <Ionicons name="camera" size={20} color="#FFFFFF" />
                </View>
              </TouchableOpacity>
              <Text style={styles.profilePictureHint}>Tap to change your profile picture</Text>
            </View>

            <ScrollView
              style={styles.modalForm}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.modalFormContent}
            >
              {/* Personal Information Section */}
              <View style={styles.modalSection}>
                <Text style={styles.modalSectionTitle}>Personal Information</Text>

                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Full Name *</Text>
                  <View style={styles.inputContainer}>
                    <Ionicons name="person-outline" size={20} color="#64748B" style={styles.inputIcon} />
                    <TextInput
                      style={styles.modalInput}
                      value={editForm.fullName}
                      onChangeText={(text) => handleInputChange('fullName', text)}
                      placeholder="Enter your full name"
                      placeholderTextColor="#94A3B8"
                    />
                    {editForm.fullName !== (user?.name || '') && (
                      <View style={styles.changedIndicator}>
                        <Ionicons name="checkmark-circle" size={16} color="#10B981" />
                      </View>
                    )}
                  </View>
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>
                    {user?.userType === 'lecturer' ? 'Staff ID *' : 'Student ID *'}
                  </Text>
                  <View style={styles.inputContainer}>
                    <Ionicons
                      name={user?.userType === 'lecturer' ? "briefcase-outline" : "school-outline"}
                      size={20}
                      color="#64748B"
                      style={styles.inputIcon}
                    />
                    <TextInput
                      style={styles.modalInput}
                      value={editForm.identifier}
                      onChangeText={(text) => handleInputChange('identifier', text)}
                      placeholder={user?.userType === 'lecturer' ? "Enter your staff ID" : "Enter your student ID"}
                      placeholderTextColor="#94A3B8"
                      autoCapitalize="characters"
                    />
                    {editForm.identifier !== (user?.identifier || user?.studentId || '') && (
                      <View style={styles.changedIndicator}>
                        <Ionicons name="checkmark-circle" size={16} color="#10B981" />
                      </View>
                    )}
                  </View>
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Department</Text>
                  <View style={styles.inputContainer}>
                    <Ionicons name="business-outline" size={20} color="#64748B" style={styles.inputIcon} />
                    <TextInput
                      style={styles.modalInput}
                      value={editForm.department}
                      onChangeText={(text) => handleInputChange('department', text)}
                      placeholder="Enter your department"
                      placeholderTextColor="#94A3B8"
                    />
                    {editForm.department !== (user?.department || '') && (
                      <View style={styles.changedIndicator}>
                        <Ionicons name="checkmark-circle" size={16} color="#10B981" />
                      </View>
                    )}
                  </View>
                </View>
              </View>

              {/* Real-time sync status */}
              {hasUnsavedChanges && (
                <View style={styles.syncStatus}>
                  <Ionicons name="sync-outline" size={16} color="#F59E0B" />
                  <Text style={styles.syncStatusText}>
                    Changes will be saved automatically...
                  </Text>
                </View>
              )}
            </ScrollView>

            <View style={styles.modalFooter}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => {
                  if (hasUnsavedChanges) {
                    Alert.alert(
                      'Unsaved Changes',
                      'You have unsaved changes. Do you want to save them?',
                      [
                        { text: 'Discard', style: 'destructive', onPress: () => setEditModalVisible(false) },
                        { text: 'Save', onPress: () => handleSaveProfile() },
                      ]
                    );
                  } else {
                    setEditModalVisible(false);
                  }
                }}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.saveButton, isUpdating && styles.saveButtonDisabled]}
                onPress={() => handleSaveProfile()}
                disabled={isUpdating}
              >
                {isUpdating ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                  <Ionicons name="checkmark-circle" size={18} color="#FFFFFF" />
                )}
                <Text style={styles.saveButtonText}>
                  {isUpdating ? 'Saving...' : 'Save Changes'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Digital ID Modal */}
      <Modal visible={showIDModal} transparent animationType="fade" onRequestClose={() => setShowIDModal(false)}>
        <View style={styles.modalOverlay}>
          <TouchableOpacity style={{ flex: 1 }} onPress={() => setShowIDModal(false)} />
          <View style={[styles.idCardContainer, { backgroundColor: '#4F46E5' }]}>
             <LinearGradient colors={['#4F46E5', '#3730A3']} style={styles.idCardGradient}>
                <View style={styles.idCardHeader}>
                  <Text style={styles.idCardUniName}>UNI-CONNECT GLOBAL</Text>
                  <Ionicons name="wifi" size={20} color="#FFF" />
                </View>
                <View style={styles.idCardMain}>
                  <Image source={{ uri: user?.avatar || 'https://via.placeholder.com/150' }} style={styles.idCardAvatar} />
                  <View style={styles.idCardInfo}>
                    <Text style={styles.idCardName}>{user?.name}</Text>
                    <Text style={styles.idCardRole}>{user?.userType?.toUpperCase()}</Text>
                    <Text style={styles.idCardSubHeader}>ID: {user?.studentId || user?.identifier}</Text>
                  </View>
                </View>
                <View style={styles.idCardFooter}>
                   <View style={styles.qrPlaceholder}>
                     <Ionicons name="qr-code" size={60} color="#FFF" />
                   </View>
                   <View>
                     <Text style={styles.idCardExpiryLabel}>EXPIRES</Text>
                     <Text style={styles.idCardExpiryDate}>DEC 2026</Text>
                   </View>
                </View>
                <Text style={styles.tapToFlip}>NFC ENABLED • TAP TO SCAN</Text>
             </LinearGradient>
          </View>
          <TouchableOpacity style={{ flex: 1 }} onPress={() => setShowIDModal(false)} />
        </View>
      </Modal>

      {/* Badges/Career Modal */}
      <Modal visible={showCareerModal} transparent animationType="slide" onRequestClose={() => setShowCareerModal(false)}>
        <View style={styles.modalOverlay}>
           <View style={[styles.modalContent, { height: '70%' }]}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Achievements & Career</Text>
                <TouchableOpacity onPress={() => setShowCareerModal(false)}>
                  <Ionicons name="close" size={24} color="#64748B" />
                </TouchableOpacity>
              </View>
              <ScrollView style={{ padding: 20 }}>
                <Text style={styles.modalSectionTitle}>Your Badges</Text>
                <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 15 }}>
                  <View style={styles.badgeItem}>
                    <View style={[styles.badgeIcon, { backgroundColor: '#FEF3C7' }]}><Ionicons name="star" size={24} color="#F59E0B" /></View>
                    <Text style={styles.badgeLabel}>Top Contributor</Text>
                  </View>
                  <View style={styles.badgeItem}>
                    <View style={[styles.badgeIcon, { backgroundColor: '#DCFCE7' }]}><Ionicons name="flash" size={24} color="#10B981" /></View>
                    <Text style={styles.badgeLabel}>Quick Learner</Text>
                  </View>
                  <View style={styles.badgeItem}>
                    <View style={[styles.badgeIcon, { backgroundColor: '#E0E7FF' }]}><Ionicons name="book" size={24} color="#4F46E5" /></View>
                    <Text style={styles.badgeLabel}>Book Worm</Text>
                  </View>
                </View>

                <View style={{ marginTop: 30, padding: 20, backgroundColor: '#F8FAFC', borderRadius: 16 }}>
                   <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                     <Ionicons name="rocket" size={20} color="#4F46E5" />
                     <Text style={{ fontSize: 16, fontWeight: '800', color: '#1F2937' }}>AI Career Match</Text>
                   </View>
                   <Text style={{ fontSize: 13, color: '#64748B', marginTop: 8 }}>Based on your grades in CSM301 and Database Systems, you are a 94% match for:</Text>
                   <Text style={{ fontSize: 18, fontWeight: '900', color: '#10B981', marginTop: 10 }}>Cloud Architect ☁️</Text>
                   <TouchableOpacity style={{ marginTop: 15, backgroundColor: '#4F46E5', padding: 12, borderRadius: 10, alignItems: 'center' }}>
                      <Text style={{ color: '#FFF', fontWeight: '700' }}>View Recommended Internships</Text>
                   </TouchableOpacity>
                </View>
              </ScrollView>
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
  darkContainer: {
    flex: 1,
    backgroundColor: '#0F172A',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    gap: 16,
  },
  darkLoadingContainer: {
    backgroundColor: '#0F172A',
  },
  loadingText: {
    fontSize: 16,
    color: '#64748B',
    fontWeight: '500',
  },
  content: {
    flex: 1,
  },
  headerGradient: {
    paddingTop: 10,
    paddingBottom: 20,
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
  },
  header: {
    paddingHorizontal: 20,
  },
  profileCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 24,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 10,
  },
  darkProfileCard: {
    backgroundColor: 'rgba(30, 41, 59, 0.95)',
  },
  avatarSection: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginRight: 20,
    position: 'relative',
    shadowColor: '#4F46E5',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
  },
  avatarImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
  },
  avatarGradient: {
    width: 100,
    height: 100,
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    color: '#FFFFFF',
    fontSize: 28,
    fontWeight: 'bold',
  },
  avatarLoading: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(79, 70, 229, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  cameraOverlay: {
    position: 'absolute',
    bottom: 4,
    right: 4,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 28,
    fontWeight: '900',
    color: '#1E293B',
    letterSpacing: -0.5,
  },
  darkUserName: {
    color: '#F8FAFC',
  },
  userEmail: {
    fontSize: 16,
    color: '#64748B',
    marginBottom: 4,
  },
  idBadgeRow: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  idBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    gap: 6,
  },
  idBadgeText: {
    fontSize: 13,
    fontWeight: '700',
  },
  studentId: {
    display: 'none',
  },
  levelBadgeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  levelBadge: {
    backgroundColor: '#4F46E5',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 16,
  },
  levelBadgeText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: 'bold',
  },
  department: {
    fontSize: 14,
    color: '#64748B',
    fontWeight: '500',
  },
  syncIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    gap: 6,
  },
  syncDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#F59E0B',
  },
  syncText: {
    fontSize: 12,
    color: '#F59E0B',
    fontStyle: 'italic',
  },
  section: {
    paddingHorizontal: 20,
    marginBottom: 32,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#1E293B',
  },
  moduleBadge: {
    backgroundColor: '#4F46E5',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 6,
    minWidth: 32,
    alignItems: 'center',
  },
  moduleBadgeText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: 'bold',
  },
  statsContainer: {
    flexDirection: 'row',
    gap: 16,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 20,
    alignItems: 'center',
    shadowColor: '#4F46E5',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 8,
    borderWidth: 1,
    borderColor: 'rgba(79, 70, 229, 0.05)',
  },
  statIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#F8FAFC',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1E293B',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#64748B',
    textAlign: 'center',
    fontWeight: '500',
  },
  coursesContainer: {
    gap: 16,
  },
  courseItem: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 20,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 6,
  },
  courseIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  courseInfo: {
    flex: 1,
  },
  courseName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1E293B',
    marginBottom: 8,
    lineHeight: 22,
  },
  courseDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  courseCode: {
    fontSize: 14,
    fontWeight: '600',
  },
  courseCredits: {
    fontSize: 12,
    color: '#64748B',
    fontWeight: '500',
  },
  courseInstructor: {
    fontSize: 12,
    color: '#94A3B8',
  },
  optionsContainer: {
    gap: 12,
  },
  optionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 18,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 15,
    elevation: 4,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  optionContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  optionIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#EEF2FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  optionTextContainer: {
    flex: 1,
  },
  optionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1E293B',
  },
  unsavedBadge: {
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
    marginTop: 4,
    alignSelf: 'flex-start',
  },
  unsavedBadgeText: {
    fontSize: 10,
    color: '#D97706',
    fontWeight: '600',
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FEF2F2',
    borderRadius: 20,
    padding: 20,
    marginHorizontal: 20,
    marginBottom: 40,
    borderWidth: 1,
    borderColor: '#FECACA',
    gap: 12,
    shadowColor: '#EF4444',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 6,
  },
  logoutText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#EF4444',
  },
  department: {
    fontSize: 15,
    fontWeight: '700',
    color: '#4F46E5',
    flex: 1,
  },
  universityText: {
    fontSize: 13,
    color: '#6366F1',
    marginTop: 6,
    fontWeight: '600',
  },
  collegeText: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 4,
    fontWeight: '500',
  },
  lecturerBadge: {
    position: 'absolute',
    bottom: 4,
    right: 4,
    backgroundColor: '#7C3AED',
    borderRadius: 12,
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#FFFFFF',
  },

  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    paddingHorizontal: 20,
    paddingVertical: 40,
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderRadius: 32,
    maxHeight: '90%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 20 },
    shadowOpacity: 0.4,
    shadowRadius: 40,
    elevation: 20,
  },
  modalHeaderGradient: {
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 20,
  },
  modalHeaderContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  modalIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  modalTitleContainer: {
    flex: 1,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 2,
  },
  modalSubtitle: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  closeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalProfilePicture: {
    alignItems: 'center',
    paddingVertical: 24,
    paddingHorizontal: 24,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  modalAvatarContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    position: 'relative',
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 8,
  },
  modalAvatarImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
  },
  modalAvatarGradient: {
    width: 120,
    height: 120,
    borderRadius: 60,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalAvatarText: {
    color: '#FFFFFF',
    fontSize: 32,
    fontWeight: 'bold',
  },
  modalAvatarLoading: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#F8FAFC',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalCameraOverlay: {
    position: 'absolute',
    bottom: 8,
    right: 8,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#FFFFFF',
  },
  profilePictureHint: {
    fontSize: 14,
    color: '#64748B',
    textAlign: 'center',
  },
  modalForm: {
    flex: 1,
  },
  modalFormContent: {
    paddingHorizontal: 24,
    paddingBottom: 20,
  },
  modalSection: {
    marginBottom: 24,
  },
  modalSectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1E293B',
    marginBottom: 16,
  },
  inputGroup: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 2,
    borderColor: '#E5E7EB',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  inputIcon: {
    marginLeft: 16,
    marginRight: 12,
  },
  modalInput: {
    flex: 1,
    paddingVertical: 16,
    paddingRight: 16,
    fontSize: 16,
    color: '#1E293B',
  },
  changedIndicator: {
    marginRight: 16,
  },
  syncStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFBEB',
    padding: 12,
    borderRadius: 12,
    marginTop: 8,
    gap: 8,
  },
  syncStatusText: {
    fontSize: 14,
    color: '#D97706',
    fontWeight: '500',
  },
  modalFooter: {
    flexDirection: 'row',
    paddingHorizontal: 24,
    paddingVertical: 20,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    gap: 16,
    backgroundColor: '#FFFFFF',
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
  },
  cancelButton: {
    flex: 1,
    backgroundColor: '#F8FAFC',
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#E2E8F0',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#64748B',
  },
  saveButton: {
    flex: 1,
    backgroundColor: '#4F46E5',
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
    shadowColor: '#4F46E5',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
  },
  saveButtonDisabled: {
    backgroundColor: '#94A3B8',
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  idCardContainer: {
    width: width * 0.85,
    height: 220,
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
    alignSelf: 'center',
  },
  idCardGradient: {
    flex: 1,
    padding: 20,
    justifyContent: 'space-between',
  },
  idCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  idCardUniName: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '900',
    letterSpacing: 1,
  },
  idCardMain: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 15,
  },
  idCardAvatar: {
    width: 70,
    height: 70,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#FFF',
  },
  idCardName: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: '800',
  },
  idCardRole: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 12,
    fontWeight: '700',
    marginTop: 2,
  },
  idCardSubHeader: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '600',
    marginTop: 4,
  },
  idCardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  qrPlaceholder: {
    width: 60,
    height: 60,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  idCardExpiryLabel: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: 10,
    fontWeight: '700',
  },
  idCardExpiryDate: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '800',
  },
  tapToFlip: {
    color: 'rgba(255,255,255,0.4)',
    fontSize: 9,
    textAlign: 'center',
    fontWeight: '800',
    marginTop: 10,
  },
  badgeItem: {
    width: (width * 0.9 - 70) / 3,
    alignItems: 'center',
    gap: 8,
  },
  badgeIcon: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 4,
  },
  badgeLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#1F2937',
    textAlign: 'center',
  },
});