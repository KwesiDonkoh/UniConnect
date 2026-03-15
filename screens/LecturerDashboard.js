import React, { useState } from 'react';
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
  Dimensions,
  FlatList,
  Image,
  StatusBar,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useApp } from '../context/AppContext';
import { useTheme } from '../components/ThemeProvider';
import { AILectureAssistant } from '../components/AILectureAssistant';
import { SmartGradingSystem } from '../components/SmartGradingSystem';
import { LectureAnalyticsDashboard } from '../components/LectureAnalyticsDashboard';
import { VirtualClassroom } from '../components/VirtualClassroom';
import { AIContentGenerator } from '../components/AIContentGenerator';
import { SmartLectureRecorder } from '../components/SmartLectureRecorder';
import { AIPlagiarismDetector } from '../components/AIPlagiarismDetector';
import { FeatureWelcomeGuide } from '../components/FeatureWelcomeGuide';
import { AIPerformancePrediction } from '../components/AIPerformancePrediction';
import VoiceRecorder from '../components/VoiceRecorder';
import TextEditor from '../components/TextEditor';


const { width } = Dimensions.get('window');

export default function LecturerDashboard({ navigation }) {
  const { user, csModules, notifications } = useApp();
  const { isDark } = useTheme();
  const [selectedPeriod, setSelectedPeriod] = useState('week'); // week, month, semester
  const [quickActionModal, setQuickActionModal] = useState(false);
  const [selectedAction, setSelectedAction] = useState(null);
  const [showWelcomeMessage, setShowWelcomeMessage] = useState(true);
  
  // New AI-powered lecturer features
  const [showAILectureAssistant, setShowAILectureAssistant] = useState(false);
  const [showSmartGrading, setShowSmartGrading] = useState(false);
  const [showLectureAnalytics, setShowLectureAnalytics] = useState(false);
  const [showVirtualClassroom, setShowVirtualClassroom] = useState(false);
  const [showContentGenerator, setShowContentGenerator] = useState(false);
  const [showLectureRecorder, setShowLectureRecorder] = useState(false);
  const [showPlagiarismDetector, setShowPlagiarismDetector] = useState(false);
  const [showPerformancePrediction, setShowPerformancePrediction] = useState(false);
  const [showVoiceRecorder, setShowVoiceRecorder] = useState(false);
  const [showTextEditor, setShowTextEditor] = useState(false);

  const [showAILessonPlanner, setShowAILessonPlanner] = useState(false);
  const [showWelcomeGuide, setShowWelcomeGuide] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState(null);

  // Safety check - if user is null, show loading
  if (!user) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Text>Loading...</Text>
      </View>
    );
  }

  // Get lecturer's teaching data - only courses they are actually teaching
  const courseDetails = Array.isArray(csModules) ? csModules : [];
  
  // For lecturers, show only the courses they are assigned to teach
  // In a real app, this would come from the user's teachingCourses array
  const teachingCourses = user?.teachingCourses || [];
  const actualTeachingCourses = courseDetails.filter(course => 
    teachingCourses.includes(course.id) || teachingCourses.includes(course.code)
  );
  
  // If no specific teaching courses assigned, show all courses (fallback)
  const displayCourses = actualTeachingCourses.length > 0 ? actualTeachingCourses : courseDetails;
  
  // Group courses by level for better organization
  const coursesByLevel = displayCourses.reduce((acc, course) => {
    // Determine level based on course code pattern or use semester as fallback
    const level = course.code?.startsWith('CSM1') ? '100' :
                  course.code?.startsWith('CSM2') ? '200' :
                  course.code?.startsWith('CSM3') ? '300' :
                  course.code?.startsWith('CSM4') ? '400' : 
                  `Level ${course.semester || 1}`;
    
    if (!acc[level]) acc[level] = [];
    acc[level].push(course);
    return acc;
  }, {});

  // Calculate comprehensive statistics
  const totalStudents = displayCourses.length * 35; // Assume avg 35 students per course
  const totalMaterials = displayCourses.length * 8; // Assume avg 8 materials per course
  const levelsTeaching = Object.keys(coursesByLevel).length;
  const pendingAssignments = Math.floor(Math.random() * 15) + 5; // Simulated
  
  const getGreeting = () => {
    const hour = new Date().getHours();
    const firstName = user?.name?.split(' ')[0] || 'Professor';
    const title = user?.title || 'Dr.';
    
    if (hour < 12) return `Good morning, ${title} ${firstName}`;
    if (hour < 17) return `Good afternoon, ${title} ${firstName}`;
    return `Good evening, ${title} ${firstName}`;
  };



  // 🚀 Handle AI-powered lecturer features
  const handleQuickAction = (action) => {
    // Set selected course for features that need it
    setSelectedCourse(displayCourses[0] || { name: 'Computer Science', code: 'CSM101' });
    
    switch (action.id) {
      case 'ai-assistant':
        setShowAILectureAssistant(true);
        break;
      case 'smart-grading':
        setShowSmartGrading(true);
        break;
      case 'lecture-analytics':
        setShowLectureAnalytics(true);
        break;
      case 'virtual-classroom':
        setShowVirtualClassroom(true);
        break;
      case 'content-generator':
        setShowContentGenerator(true);
        break;
      case 'lecture-recorder':
        setShowLectureRecorder(true);
        break;
      case 'plagiarism-detector':
        setShowPlagiarismDetector(true);
        break;
      case 'performance-prediction':
        setShowPerformancePrediction(true);
        break;
      case 'ai-lesson-planner':
        setShowAILessonPlanner(true);
        break;
      default:
        console.log('Unknown action:', action.id);
    }
  };



  return (
    <SafeAreaView style={[styles.container, isDark && styles.darkContainer]}>
      <StatusBar style={isDark ? 'light' : 'dark'} />
      
      {/* Header Section */}
        <LinearGradient 
          colors={isDark ? ['#1E293B', '#334155'] : ['#4F46E5', '#7C3AED']} 
        style={styles.header}
      >
        <View style={styles.headerContent}>
          <View style={styles.headerTop}>
            <View style={styles.lecturerInfo}>
              <View style={styles.greetingSection}>
                <Text style={styles.greeting}>
                  {getGreeting()}, <Text style={styles.lecturerName}>{user.name}</Text> • {user.title || 'Dr.'} • {user.department || 'Computer Science'} • ID: {user.lecturerId || 'LEC2024001'} • {user.email || 'lecturer@university.edu'}
                </Text>
        </View>
              
              <Text style={styles.subtitle}>Ready to inspire today's learners?</Text>
              
              <View style={styles.onlineStatus}>
                <View style={styles.onlineIndicator} />
                <Text style={styles.onlineText}>
                  {Math.floor(Math.random() * 30) + 15} students online
              </Text>
            </View>
        </View>
            <TouchableOpacity 
              style={styles.notificationButton} 
              onPress={() => navigation.navigate('Notifications')}
            >
            <Ionicons name="notifications" size={24} color="white" />
            {notifications?.filter(n => !n.read).length > 0 && (
                <View style={styles.notificationBadge}>
                <Text style={styles.notificationBadgeText}>
                    {notifications.filter(n => !n.read).length}
                  </Text>
                </View>
              )}
    </TouchableOpacity>
          </View>
          
          {/* Quick Stats Cards */}
          <View style={styles.statsContainer}>
            <View style={styles.statCard}>
              <Ionicons name="people" size={24} color="#10B981" />
              <Text style={styles.statNumber}>{totalStudents}</Text>
              <Text style={styles.statLabel}>Students</Text>
                </View>
            <View style={styles.statCard}>
              <Ionicons name="book" size={24} color="#F59E0B" />
              <Text style={styles.statNumber}>{courseDetails.length}</Text>
              <Text style={styles.statLabel}>Courses</Text>
              </View>
            <View style={styles.statCard}>
              <Ionicons name="folder" size={24} color="#8B5CF6" />
              <Text style={styles.statNumber}>{totalMaterials}</Text>
              <Text style={styles.statLabel}>Materials</Text>
                </View>
            <View style={styles.statCard}>
              <Ionicons name="checkmark-circle" size={24} color="#EF4444" />
              <Text style={styles.statNumber}>{pendingAssignments}</Text>
              <Text style={styles.statLabel}>Pending</Text>
                </View>
              </View>
            </View>
      </LinearGradient>

      <ScrollView style={[styles.content, isDark && styles.darkContent]} showsVerticalScrollIndicator={false}>
        {/* Quick Access: Course Chats, Materials, Notifications, Profile */}
        <View style={[styles.section, isDark && styles.darkSection]}>
          <Text style={[styles.sectionTitle, isDark && styles.darkSectionTitle]}>⚡ Quick Access</Text>
          <View style={styles.quickAccessRow}>
            <TouchableOpacity style={[styles.quickAccessCard, isDark && styles.darkQuickAccessCard]} onPress={() => navigation.navigate('Chat')}>
              <LinearGradient colors={['#6366F1', '#8B5CF6']} style={styles.quickAccessGradient}>
                <Ionicons name="chatbubbles" size={26} color="#FFFFFF" />
                <Text style={styles.quickAccessLabel}>Course Chats</Text>
              </LinearGradient>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.quickAccessCard, isDark && styles.darkQuickAccessCard]} onPress={() => navigation.navigate('Materials')}>
              <LinearGradient colors={['#10B981', '#059669']} style={styles.quickAccessGradient}>
                <Ionicons name="library" size={26} color="#FFFFFF" />
                <Text style={styles.quickAccessLabel}>Materials</Text>
              </LinearGradient>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.quickAccessCard, isDark && styles.darkQuickAccessCard]} onPress={() => navigation.navigate('Notifications')}>
              <LinearGradient colors={['#F59E0B', '#D97706']} style={styles.quickAccessGradient}>
                <Ionicons name="notifications" size={26} color="#FFFFFF" />
                <Text style={styles.quickAccessLabel}>Notifications</Text>
              </LinearGradient>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.quickAccessCard, isDark && styles.darkQuickAccessCard]} onPress={() => navigation.navigate('Profile')}>
              <LinearGradient colors={['#64748B', '#475569']} style={styles.quickAccessGradient}>
                <Ionicons name="person" size={26} color="#FFFFFF" />
                <Text style={styles.quickAccessLabel}>Profile</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </View>

        {/* Lecturer Info and Quick Start */}
        <View style={[styles.section, isDark && styles.darkSection]}>
          <Text style={[styles.sectionTitle, isDark && styles.darkSectionTitle]}>👨‍🏫 Lecturer Info</Text>
          <Text style={[styles.sectionSubtitle, isDark && styles.darkSectionSubtitle]}>{getGreeting()}</Text>
          <View style={{ flexDirection: 'row', gap: 12, marginTop: 12 }}>
            <TouchableOpacity
              onPress={() => {
                setSelectedCourse(displayCourses[0] || { name: 'Computer Science', code: 'CSM101' });
                setShowVirtualClassroom(true);
              }}
              style={{ flex: 1, backgroundColor: '#4F46E5', borderRadius: 12, paddingVertical: 12, alignItems: 'center' }}
            >
              <Text style={{ color: '#FFFFFF', fontWeight: '700' }}>Start Teaching</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => setShowAILessonPlanner(true)}
              style={{ flex: 1, backgroundColor: '#EEF2FF', borderRadius: 12, paddingVertical: 12, alignItems: 'center' }}
            >
              <Text style={{ color: '#4F46E5', fontWeight: '700' }}>Plan Lesson</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Teaching Impact Section */}
        <View style={[styles.section, isDark && styles.darkSection]}>
          <Text style={[styles.sectionTitle, isDark && styles.darkSectionTitle]}>🎯 Teaching Impact</Text>
          <Text style={[styles.sectionSubtitle, isDark && styles.darkSectionSubtitle]}>Your influence on student success</Text>
          
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' }}>
              <TouchableOpacity 
              style={[styles.teachingImpactCardOuter, isDark && styles.darkTeachingImpactCardOuter]}
              onPress={() => navigation.navigate('Analytics')}
            >
              <View style={{ padding: 14 }}>
                <Ionicons name="trending-up" size={24} color="#059669" />
                <Text style={[styles.teachingImpactCardTitle, isDark && styles.darkSectionTitle]}>Student Progress</Text>
                <Text style={[styles.teachingImpactCardSub, isDark && styles.darkSectionSubtitle]}>Track learning outcomes</Text>
              </View>
              </TouchableOpacity>

              <TouchableOpacity 
              style={[styles.teachingImpactCardOuter, isDark && styles.darkTeachingImpactCardOuter]}
              onPress={() => navigation.navigate('Analytics')}
            >
              <View style={{ padding: 14 }}>
                <Ionicons name="heart" size={24} color="#D97706" />
                <Text style={[styles.teachingImpactCardTitle, isDark && styles.darkSectionTitle]}>Engagement</Text>
                <Text style={[styles.teachingImpactCardSub, isDark && styles.darkSectionSubtitle]}>Student participation</Text>
              </View>
              </TouchableOpacity>

            <TouchableOpacity 
              style={styles.teachingImpactCard}
              onPress={() => navigation.navigate('Gradebook')}
            >
              <LinearGradient
                colors={['#8B5CF6', '#7C3AED']}
                style={styles.teachingImpactGradient}
              >
                <Ionicons name="chatbubbles" size={24} color="#FFFFFF" />
                <Text style={styles.teachingImpactTitle}>Feedback</Text>
                <Text style={styles.teachingImpactSubtitle}>Student reviews</Text>
              </LinearGradient>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.teachingImpactCard}
              onPress={() => navigation.navigate('Analytics')}
            >
              <LinearGradient
                colors={['#EC4899', '#BE185D']}
                style={styles.teachingImpactGradient}
              >
                <Ionicons name="trophy" size={24} color="#FFFFFF" />
                <Text style={styles.teachingImpactTitle}>Success Rate</Text>
                <Text style={styles.teachingImpactSubtitle}>Academic achievements</Text>
        </LinearGradient>
      </TouchableOpacity>
          </View>
        </View>

        

        {/* AI Features Section */}
        <View style={[styles.section, isDark && styles.darkSection]}>
          <Text style={[styles.sectionTitle, isDark && styles.darkSectionTitle]}>🚀 AI-Powered Tools</Text>
          <Text style={[styles.sectionSubtitle, isDark && styles.darkSectionSubtitle]}>Enhance your teaching with cutting-edge AI</Text>
          
          <View style={styles.modernAIGrid}>
            <TouchableOpacity
              style={styles.modernAICard}
              onPress={() => {
                setSelectedCourse(displayCourses[0] || { name: 'Computer Science', code: 'CSM101' });
                setShowAILectureAssistant(true);
              }}
            >
            <LinearGradient
                colors={['#667eea', '#764ba2']}
                style={styles.modernAIGradient}
              >
                <Ionicons name="sparkles" size={28} color="#FFFFFF" />
                <Text style={styles.modernAITitle}>AI Assistant</Text>
                <Text style={styles.modernAIDescription}>Smart lecture help</Text>
              </LinearGradient>
            </TouchableOpacity>

              <TouchableOpacity 
              style={styles.modernAICard}
              onPress={() => {
                setSelectedCourse(displayCourses[0] || { name: 'Computer Science', code: 'CSM101' });
                setShowSmartGrading(true);
              }}
            >
              <LinearGradient
                colors={['#10B981', '#059669']}
                style={styles.modernAIGradient}
              >
                <Ionicons name="analytics" size={28} color="#FFFFFF" />
                <Text style={styles.modernAITitle}>Smart Grading</Text>
                <Text style={styles.modernAIDescription}>Automated system</Text>
              </LinearGradient>
              </TouchableOpacity>

                <TouchableOpacity 
              style={styles.modernAICard}
              onPress={() => {
                setSelectedCourse(displayCourses[0] || { name: 'Computer Science', code: 'CSM101' });
                setShowLectureAnalytics(true);
              }}
            >
              <LinearGradient
                colors={['#F59E0B', '#D97706']}
                style={styles.modernAIGradient}
              >
                <Ionicons name="trending-up" size={28} color="#FFFFFF" />
                <Text style={styles.modernAITitle}>Analytics</Text>
                <Text style={styles.modernAIDescription}>Performance insights</Text>
              </LinearGradient>
                </TouchableOpacity>

            <TouchableOpacity
              style={styles.modernAICard}
              onPress={() => {
                setSelectedCourse(displayCourses[0] || { name: 'Computer Science', code: 'CSM101' });
                setShowVirtualClassroom(true);
              }}
            >
              <LinearGradient
                colors={['#8B5CF6', '#7C3AED']}
                style={styles.modernAIGradient}
              >
                <Ionicons name="school" size={28} color="#FFFFFF" />
                <Text style={styles.modernAITitle}>Virtual Class</Text>
                <Text style={styles.modernAIDescription}>Online environment</Text>
            </LinearGradient>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.modernAICard}
              onPress={() => {
                setSelectedCourse(displayCourses[0] || { name: 'Computer Science', code: 'CSM101' });
                setShowContentGenerator(true);
              }}
            >
        <LinearGradient 
                colors={['#EC4899', '#BE185D']}
                style={styles.modernAIGradient}
              >
                <Ionicons name="create" size={28} color="#FFFFFF" />
                <Text style={styles.modernAITitle}>AI Content</Text>
                <Text style={styles.modernAIDescription}>Generate materials</Text>
              </LinearGradient>
            </TouchableOpacity>

              <TouchableOpacity 
              style={styles.modernAICard}
              onPress={() => {
                setSelectedCourse(displayCourses[0] || { name: 'Computer Science', code: 'CSM101' });
                setShowLectureRecorder(true);
              }}
            >
              <LinearGradient
                colors={['#06B6D4', '#0891B2']}
                style={styles.modernAIGradient}
              >
                <Ionicons name="videocam" size={28} color="#FFFFFF" />
                <Text style={styles.modernAITitle}>Smart Recorder</Text>
                <Text style={styles.modernAIDescription}>Enhanced recording</Text>
              </LinearGradient>
              </TouchableOpacity>
              
              <TouchableOpacity 
              style={styles.modernAICard}
              onPress={() => {
                setSelectedCourse(displayCourses[0] || { name: 'Computer Science', code: 'CSM101' });
                setShowPlagiarismDetector(true);
              }}
            >
              <LinearGradient
                colors={['#EF4444', '#DC2626']}
                style={styles.modernAIGradient}
              >
                <Ionicons name="shield-checkmark" size={28} color="#FFFFFF" />
                <Text style={styles.modernAITitle}>Plagiarism Check</Text>
                <Text style={styles.modernAIDescription}>Academic integrity</Text>
              </LinearGradient>
              </TouchableOpacity>

            <TouchableOpacity
              style={styles.modernAICard}
              onPress={() => {
                setSelectedCourse(displayCourses[0] || { name: 'Computer Science', code: 'CSM101' });
                setShowPerformancePrediction(true);
              }}
            >
              <LinearGradient
                colors={['#84CC16', '#65A30D']}
                style={styles.modernAIGradient}
              >
                <Ionicons name="bulb" size={28} color="#FFFFFF" />
                <Text style={styles.modernAITitle}>Performance AI</Text>
                <Text style={styles.modernAIDescription}>Student insights</Text>
        </LinearGradient>
            </TouchableOpacity>

                <TouchableOpacity
              style={styles.modernAICard}
              onPress={() => setShowAILessonPlanner(true)}
            >
              <LinearGradient
                colors={['#8B5CF6', '#7C3AED']}
                style={styles.modernAIGradient}
              >
                <Ionicons name="library" size={28} color="#FFFFFF" />
                <Text style={styles.modernAITitle}>AI Lesson Planner</Text>
                <Text style={styles.modernAIDescription}>Smart curriculum</Text>
              </LinearGradient>
                </TouchableOpacity>
            </View>
          </View>
          
        {/* Courses Overview Section */}
        <View style={[styles.section, isDark && styles.darkSection]}>
          <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, isDark && styles.darkSectionTitle]}>📚 Your Teaching Courses</Text>
            <TouchableOpacity
              style={styles.viewAllButton}
              onPress={() => navigation.navigate('CourseRegistration')}
            >
              <Text style={styles.viewAllButtonText}>View All</Text>
              <Ionicons name="arrow-forward" size={16} color="#4F46E5" />
            </TouchableOpacity>
        </View>

          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.coursesScroll}>
            {Object.entries(coursesByLevel).map(([level, courses]) => (
              <View key={level} style={styles.levelContainer}>
                <Text style={styles.levelTitle}>Level {level}</Text>
                {courses.map((course, index) => (
              <TouchableOpacity
                    key={course.id || index}
                    style={styles.courseCard}
                    onPress={() => setSelectedCourse(course)}
              >
                <LinearGradient
                      colors={['#F8FAFC', '#E2E8F0']}
                      style={styles.courseCardContent}
                    >
                      <Text style={styles.courseCode}>{course.code}</Text>
                      <Text style={styles.courseName}>{course.name}</Text>
                      <Text style={styles.courseCredits}>{course.credits || 3} Credits</Text>
                      <View style={styles.courseStats}>
                        <Text style={styles.courseStat}>35 Students</Text>
                        <Text style={styles.courseStat}>8 Materials</Text>
                    </View>
                </LinearGradient>
              </TouchableOpacity>
            ))}
          </View>
        ))}
          </ScrollView>
        </View>

        {/* Recent Activity Section */}
        <View style={[styles.section, isDark && styles.darkSection]}>
          <Text style={[styles.sectionTitle, isDark && styles.darkSectionTitle]}>📊 Recent Activity</Text>
          <View style={styles.activityCards}>
            <View style={styles.activityCard}>
              <Ionicons name="document-text" size={24} color="#10B981" />
                <View style={styles.activityContent}>
                <Text style={styles.activityTitle}>New Assignment Posted</Text>
                <Text style={styles.activitySubtitle}>CSM251 - Data Structures</Text>
                <Text style={styles.activityTime}>2 hours ago</Text>
        </View>
            </View>
            
            <View style={styles.activityCard}>
              <Ionicons name="people" size={24} color="#F59E0B" />
              <View style={styles.activityContent}>
                <Text style={styles.activityTitle}>Student Consultation</Text>
                <Text style={styles.activitySubtitle}>Alice Johnson - CSM251</Text>
                <Text style={styles.activityTime}>1 day ago</Text>
            </View>
          </View>
            
            <View style={styles.activityCard}>
              <Ionicons name="videocam" size={24} color="#8B5CF6" />
                <View style={styles.activityContent}>
                <Text style={styles.activityTitle}>Lecture Recorded</Text>
                <Text style={styles.activitySubtitle}>CSM351 - Algorithms</Text>
                <Text style={styles.activityTime}>2 days ago</Text>
                    </View>
                  </View>
          </View>
        </View>

        {/* Quick Actions Section */}
        <View style={[styles.section, isDark && styles.darkSection]}>
          <Text style={[styles.sectionTitle, isDark && styles.darkSectionTitle]}>⚡ Quick Actions</Text>
          <View style={styles.quickActionButtons}>
            <TouchableOpacity
              style={[styles.quickActionButton, isDark && styles.darkQuickActionButton]}
              onPress={() => navigation.navigate('Materials')}
            >
              <Ionicons name="cloud-upload" size={24} color="#4F46E5" />
              <Text style={[styles.quickActionButtonText, isDark && styles.darkQuickActionButtonText]}>Course Materials</Text>
              </TouchableOpacity>
            
                  <TouchableOpacity 
              style={[styles.quickActionButton, isDark && styles.darkQuickActionButton]}
              onPress={() => navigation.navigate('Chat')}
                  >
              <Ionicons name="chatbubbles" size={24} color="#10B981" />
              <Text style={[styles.quickActionButtonText, isDark && styles.darkQuickActionButtonText]}>Course Chats</Text>
                  </TouchableOpacity>
            
                  <TouchableOpacity 
              style={[styles.quickActionButton, isDark && styles.darkQuickActionButton]}
              onPress={() => navigation.navigate('Students')}
                  >
              <Ionicons name="people" size={24} color="#F59E0B" />
              <Text style={[styles.quickActionButtonText, isDark && styles.darkQuickActionButtonText]}>Manage Students</Text>
                  </TouchableOpacity>
            
                  <TouchableOpacity 
              style={[styles.quickActionButton, isDark && styles.darkQuickActionButton]}
              onPress={() => navigation.navigate('Analytics')}
                  >
              <Ionicons name="analytics" size={24} color="#8B5CF6" />
              <Text style={[styles.quickActionButtonText, isDark && styles.darkQuickActionButtonText]}>View Analytics</Text>
                  </TouchableOpacity>
            
                  <TouchableOpacity 
              style={[styles.quickActionButton, isDark && styles.darkQuickActionButton]}
              onPress={() => setShowWelcomeGuide(true)}
                  >
              <Ionicons name="help-circle" size={24} color="#8B5CF6" />
              <Text style={[styles.quickActionButtonText, isDark && styles.darkQuickActionButtonText]}>Feature Guide</Text>
                  </TouchableOpacity>
                </View>
              </View>

                    {/* Additional Lecturer Features */}
          <View style={[styles.section, isDark && styles.darkSection]}>
            <Text style={[styles.sectionTitle, isDark && styles.darkSectionTitle]}>📚 Teaching Tools</Text>
            <View style={styles.additionalFeaturesGrid}>
              <TouchableOpacity 
                style={styles.additionalFeatureCard}
                onPress={() => navigation.navigate('Materials')}
              >
                <LinearGradient
                  colors={['#EC4899', '#BE185D']}
                  style={styles.additionalFeatureGradient}
                >
                  <Ionicons name="create" size={24} color="#FFFFFF" />
                  <Text style={styles.additionalFeatureText}>Course Materials</Text>
          </LinearGradient>
              </TouchableOpacity>

              <TouchableOpacity 
                style={styles.additionalFeatureCard}
                onPress={() => navigation.navigate('Gradebook')}
              >
                <LinearGradient
                  colors={['#10B981', '#059669']}
                  style={styles.additionalFeatureGradient}
                >
                  <Ionicons name="book" size={24} color="#FFFFFF" />
                  <Text style={styles.additionalFeatureText}>Gradebook</Text>
                </LinearGradient>
              </TouchableOpacity>

              <TouchableOpacity 
                style={styles.additionalFeatureCard}
                onPress={() => navigation.navigate('Analytics')}
              >
                <LinearGradient
                  colors={['#F59E0B', '#D97706']}
                  style={styles.additionalFeatureGradient}
                >
                  <Ionicons name="analytics" size={24} color="#FFFFFF" />
                  <Text style={styles.additionalFeatureText}>View Analytics</Text>
                </LinearGradient>
              </TouchableOpacity>

              <TouchableOpacity 
                style={styles.additionalFeatureCard}
                onPress={() => navigation.navigate('Students')}
              >
                <LinearGradient
                  colors={['#8B5CF6', '#7C3AED']}
                  style={styles.additionalFeatureGradient}
                >
                  <Ionicons name="people" size={24} color="#FFFFFF" />
                  <Text style={styles.additionalFeatureText}>Students</Text>
                </LinearGradient>
              </TouchableOpacity>
                    </View>
                    </View>

          {/* Teaching Impact Section - 2x2 Layout */}
          <View style={[styles.section, isDark && styles.darkSection]}>
            <Text style={[styles.sectionTitle, isDark && styles.darkSectionTitle]}>🎯 Teaching Impact</Text>
            <Text style={[styles.sectionSubtitle, isDark && styles.darkSectionSubtitle]}>Track your influence on student learning</Text>
            <View style={styles.teachingImpactGrid}>
                  <TouchableOpacity 
                style={styles.teachingImpactCard}
                onPress={() => navigation.navigate('Analytics')}
              >
                <LinearGradient
                  colors={['#10B981', '#059669']}
                  style={styles.teachingImpactGradient}
                >
                  <Ionicons name="trending-up" size={32} color="#FFFFFF" />
                  <Text style={styles.teachingImpactTitle}>Student Progress</Text>
                  <Text style={styles.teachingImpactSubtitle}>Track learning outcomes</Text>
                </LinearGradient>
                  </TouchableOpacity>

              <TouchableOpacity 
                style={styles.teachingImpactCard}
                onPress={() => navigation.navigate('Analytics')}
              >
                <LinearGradient
                  colors={['#F59E0B', '#D97706']}
                  style={styles.teachingImpactGradient}
                >
                  <Ionicons name="people" size={32} color="#FFFFFF" />
                  <Text style={styles.teachingImpactTitle}>Engagement</Text>
                  <Text style={styles.teachingImpactSubtitle}>Monitor participation</Text>
                </LinearGradient>
              </TouchableOpacity>

                  <TouchableOpacity 
                style={styles.teachingImpactCard}
                onPress={() => navigation.navigate('Gradebook')}
              >
                <LinearGradient
                  colors={['#8B5CF6', '#7C3AED']}
                  style={styles.teachingImpactGradient}
                >
                  <Ionicons name="chatbubble-ellipses" size={32} color="#FFFFFF" />
                  <Text style={styles.teachingImpactTitle}>Feedback</Text>
                  <Text style={styles.teachingImpactSubtitle}>Student insights</Text>
                </LinearGradient>
                  </TouchableOpacity>

                  <TouchableOpacity 
                style={styles.teachingImpactCard}
                onPress={() => navigation.navigate('Analytics')}
              >
                <LinearGradient
                  colors={['#EC4899', '#BE185D']}
                  style={styles.teachingImpactGradient}
                >
                  <Ionicons name="trophy" size={32} color="#FFFFFF" />
                  <Text style={styles.teachingImpactTitle}>Success Rate</Text>
                  <Text style={styles.teachingImpactSubtitle}>Achievement tracking</Text>
                </LinearGradient>
                  </TouchableOpacity>
                </View>
          </View>
        </ScrollView>

      {/* 🚀 AMAZING AI-POWERED LECTURER FEATURES MODALS */}
      {showAILectureAssistant && (
      <AILectureAssistant
        visible={showAILectureAssistant}
        onClose={() => setShowAILectureAssistant(false)}
        course={selectedCourse}
        user={user}
      />
      )}

      {showSmartGrading && (
      <SmartGradingSystem
        visible={showSmartGrading}
        onClose={() => setShowSmartGrading(false)}
        course={selectedCourse}
        user={user}
      />
      )}

      {showLectureAnalytics && (
      <LectureAnalyticsDashboard
        visible={showLectureAnalytics}
        onClose={() => setShowLectureAnalytics(false)}
        course={selectedCourse}
        user={user}
      />
      )}

      {showVirtualClassroom && (
      <VirtualClassroom
        visible={showVirtualClassroom}
        onClose={() => setShowVirtualClassroom(false)}
        course={selectedCourse}
        user={user}
      />
      )}

      {showContentGenerator && (
      <AIContentGenerator
        visible={showContentGenerator}
        onClose={() => setShowContentGenerator(false)}
        course={selectedCourse}
        user={user}
      />
      )}

      {showLectureRecorder && (
      <SmartLectureRecorder
        visible={showLectureRecorder}
        onClose={() => setShowLectureRecorder(false)}
        course={selectedCourse}
        user={user}
      />
      )}

      {showPlagiarismDetector && (
      <AIPlagiarismDetector
        visible={showPlagiarismDetector}
        onClose={() => setShowPlagiarismDetector(false)}
        course={selectedCourse}
        user={user}
      />
      )}

      {showPerformancePrediction && (
      <AIPerformancePrediction
        visible={showPerformancePrediction}
        onClose={() => setShowPerformancePrediction(false)}
        course={selectedCourse}
        user={user}
      />
      )}

      {/* 🌟 Welcome Guide for Discovering Amazing Lecturer Features */}
      {showWelcomeGuide && (
      <FeatureWelcomeGuide
        visible={showWelcomeGuide}
        onClose={() => setShowWelcomeGuide(false)}
          features={[
            {
              title: 'AI Lecture Assistant',
              description: 'Get AI-powered help with lesson planning and content creation',
              icon: '🤖',
              color: '#6366F1'
            },
            {
              title: 'Smart Grading System',
              description: 'Automated grading with AI-powered insights and feedback',
              icon: '📊',
              color: '#10B981'
            },
            {
              title: 'Lecture Analytics',
              description: 'Comprehensive analytics to track student engagement and performance',
              icon: '📈',
              color: '#F59E0B'
            },
            {
              title: 'Virtual Classroom',
              description: 'Create immersive online learning experiences',
              icon: '🏫',
              color: '#8B5CF6'
            },
            {
              title: 'AI Content Generator',
              description: 'Generate course materials, assignments, and presentations',
              icon: '✨',
              color: '#EC4899'
            },
            {
              title: 'Smart Lecture Recorder',
              description: 'Enhanced recording with AI-powered transcription and analysis',
              icon: '🎥',
              color: '#06B6D4'
            },
            {
              title: 'Plagiarism Detector',
              description: 'AI-powered tools to maintain academic integrity',
              icon: '🔍',
              color: '#EF4444'
            },
            {
              title: 'Performance Prediction',
              description: 'Predict student performance and provide early interventions',
              icon: '🎯',
              color: '#84CC16'
            }
          ]}
        />
      )}

      {/* 🎤 Voice Recorder Modal */}
      <VoiceRecorder
        visible={showVoiceRecorder}
        onClose={() => setShowVoiceRecorder(false)}
        onSend={(voiceData) => {
          console.log('Voice message sent:', voiceData);
          Alert.alert('Success!', 'Voice message recorded and sent successfully!');
        }}
        courseCode={selectedCourse?.code}
      />

      {/* ✏️ Smart Text Editor Modal */}
      <TextEditor
        visible={showTextEditor}
        onClose={() => setShowTextEditor(false)}
        onSave={(textData) => {
          console.log('Text saved:', textData);
          Alert.alert('Success!', 'Text saved and sent successfully!');
        }}
        courseCode={selectedCourse?.code}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  darkContainer: {
    backgroundColor: '#0F172A',
  },
  darkContent: {
    backgroundColor: '#0F172A',
  },
  darkSection: {},
  darkSectionTitle: {
    color: '#F8FAFC',
  },
  darkSectionSubtitle: {
    color: '#94A3B8',
  },
  quickAccessRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 10,
    marginTop: 12,
  },
  quickAccessCard: {
    width: (width - 20 * 2 - 10) / 2 - 5,
    borderRadius: 14,
    overflow: 'hidden',
  },
  darkQuickAccessCard: {
    opacity: 0.95,
  },
  quickAccessGradient: {
    paddingVertical: 16,
    paddingHorizontal: 12,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 72,
  },
  quickAccessLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FFFFFF',
    marginTop: 6,
    textAlign: 'center',
  },
  teachingImpactCardOuter: {
    width: (width - 20 * 2 - 12) / 2,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  darkTeachingImpactCardOuter: {
    backgroundColor: '#1E293B',
    borderColor: '#334155',
  },
  teachingImpactCardTitle: {
    fontWeight: '700',
    color: '#111827',
    marginTop: 8,
  },
  teachingImpactCardSub: {
    color: '#6B7280',
    fontSize: 12,
  },
  darkQuickActionButton: {
    backgroundColor: '#1E293B',
    borderColor: '#334155',
  },
  darkQuickActionButtonText: {
    color: '#F8FAFC',
  },
  header: {
    paddingTop: 20,
    paddingBottom: 30,
    paddingHorizontal: 20,
  },
  headerContent: {
    flex: 1,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 25,
  },
  lecturerInfo: {
    flex: 1,
    marginRight: 20,
  },
  greetingSection: {
    marginBottom: 12,
  },
  greeting: {
    fontSize: 28,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 5,
  },


  subtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.9)',
    marginBottom: 12,
  },
  onlineStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  onlineIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#10B981',
    marginRight: 6,
  },
  onlineText: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.8)',
    fontWeight: '500',
  },
  notificationButton: {
    position: 'relative',
    padding: 8,
  },
  notificationBadge: {
    position: 'absolute',
    top: 5,
    right: 5,
    backgroundColor: '#EF4444',
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  notificationBadgeText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: 12,
    padding: 15,
    alignItems: 'center',
    flex: 1,
    marginHorizontal: 5,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    marginTop: 8,
  },
  statLabel: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.9)',
    marginTop: 4,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  section: {
    marginTop: 30,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1E293B',
    marginBottom: 8,
  },
  sectionSubtitle: {
    fontSize: 16,
    color: '#64748B',
    marginBottom: 20,
  },
  viewAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: '#F1F5F9',
    borderRadius: 20,
  },
  viewAllButtonText: {
    color: '#4F46E5',
    fontSize: 14,
    fontWeight: '600',
    marginRight: 4,
  },
  quickActionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  actionCard: {
    width: (width - 60) / 2,
    padding: 20,
    borderRadius: 16,
    marginBottom: 15,
    alignItems: 'center',
  },
  actionIcon: {
    fontSize: 32,
    marginBottom: 12,
  },
  actionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 8,
    textAlign: 'center',
  },
  actionDescription: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.9)',
    textAlign: 'center',
    lineHeight: 16,
  },
  coursesScroll: {
    marginHorizontal: -20,
    paddingHorizontal: 20,
  },
  levelContainer: {
    marginRight: 25,
  },
  levelTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#475569',
    marginBottom: 15,
    textAlign: 'center',
  },
  courseCard: {
    width: 200,
    marginBottom: 15,
  },
  courseCardContent: {
    padding: 20,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },

  courseCode: {
    fontSize: 14,
    fontWeight: '600',
    color: '#4F46E5',
    marginBottom: 8,
  },
  courseName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1E293B',
    marginBottom: 8,
    lineHeight: 22,
  },
  courseCredits: {
    fontSize: 14,
    color: '#64748B',
    marginBottom: 12,
  },
  courseStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  courseStat: {
    fontSize: 12,
    color: '#64748B',
  },
  activityCards: {
    gap: 15,
  },
  activityCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  activityContent: {
    marginLeft: 15,
    flex: 1,
  },
  activityTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1E293B',
    marginBottom: 4,
  },
  activitySubtitle: {
    fontSize: 14,
    color: '#64748B',
    marginBottom: 4,
  },
  activityTime: {
    fontSize: 12,
    color: '#94A3B8',
  },
  quickActionButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  quickActionButton: {
    width: (width - 60) / 2,
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    alignItems: 'center',
    marginBottom: 15,
  },
  quickActionButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1E293B',
    marginTop: 8,
    textAlign: 'center',
  },



  // Profile Section Styles



  // Additional Features Styles
  additionalFeaturesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginTop: 16,
  },
  additionalFeatureCard: {
    width: (width - 64) / 2,
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 12,
  },
  additionalFeatureGradient: {
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 70,
  },
  additionalFeatureText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '600',
    marginTop: 6,
    textAlign: 'center',
  },

  // Modern AI Tools Styles
  modernAIGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
    justifyContent: 'space-between',
  },
  modernAICard: {
    width: (width - 64) / 2,
    borderRadius: 20,
    overflow: 'hidden',
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 15,
    elevation: 8,
  },
  modernAIGradient: {
    padding: 24,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 120,
  },
  modernAITitle: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
    marginTop: 12,
    marginBottom: 6,
    textAlign: 'center',
  },
  modernAIDescription: {
    color: 'rgba(255, 255, 255, 0.9)',
    fontSize: 12,
    fontWeight: '500',
    textAlign: 'center',
    lineHeight: 16,
  },

  // Teaching Impact Styles
  teachingImpactGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginTop: 16,
  },
  teachingImpactCard: {
    width: (width - 64) / 2,
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 12,
  },
  teachingImpactGradient: {
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 120,
  },
  teachingImpactTitle: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: 12,
    marginBottom: 4,
    textAlign: 'center',
  },
  teachingImpactSubtitle: {
    color: 'rgba(255, 255, 255, 0.9)',
    fontSize: 12,
    textAlign: 'center',
  },
});