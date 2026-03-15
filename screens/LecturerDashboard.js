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
import { AIPatentNavigator } from '../components/AIPatentNavigator';
import SmartScheduleOptimizer from '../components/SmartScheduleOptimizer';
import GlobalUniversityHub from '../components/GlobalUniversityHub';


const { width } = Dimensions.get('window');

export default function LecturerDashboard({ navigation }) {
  const { user, csModules, notifications } = useApp();
  const { isDark, toggleTheme } = useTheme();
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
  const [showAIPatentNavigator, setShowAIPatentNavigator] = useState(false);
  const [showGlobalHub, setShowGlobalHub] = useState(false);
  const [initialHubTab, setInitialHubTab] = useState('research');
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
  
  // For lecturers, strictly show only assigned teaching courses
  const displayCourses = actualTeachingCourses;
  
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
      case 'ai-patent-navigator':
        setShowAIPatentNavigator(true);
        break;
      default:
        console.log('Unknown action:', action.id);
    }
  };



  return (
    <SafeAreaView style={[styles.container, isDark && styles.darkContainer]}>
      <StatusBar style={isDark ? 'light' : 'dark'} />
      
      {/* Top Header */}
      <View style={[styles.topBar, isDark && styles.darkTopBar]}>
        <Text style={[styles.topBarTitle, isDark && styles.darkTopBarTitle]}>Lecturer Dashboard</Text>
        <View style={styles.headerActions}>
          <TouchableOpacity 
            style={styles.discoverButton}
            onPress={() => setShowWelcomeGuide(true)}
          >
            <Ionicons name="sparkles" size={16} color="#FFFFFF" />
            <Text style={styles.discoverButtonText}>Discover</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.themeToggle}
            onPress={toggleTheme}
          >
            <Ionicons 
              name={isDark ? 'sunny' : 'moon'} 
              size={22} 
              color="#FFFFFF" 
            />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView style={[styles.content, isDark && styles.darkContent]} showsVerticalScrollIndicator={false}>
        {/* Green Welcome Card */}
        {showWelcomeMessage && (
          <View style={styles.welcomeCardContainer}>
            <View style={styles.welcomeCard}>
              <TouchableOpacity 
                style={styles.closeButton}
                onPress={() => setShowWelcomeMessage(false)}
              >
                <Ionicons name="close" size={16} color="#FFFFFF" />
              </TouchableOpacity>
              <Text style={styles.welcomeEmoji}>👋</Text>
              <Text style={styles.welcomeTitle}>Good Morning, Professor!</Text>
              <Text style={styles.welcomeText}>
                Ready to inspire and educate? Your students are excited to learn from you today! 🎓✨
              </Text>
              <TouchableOpacity style={styles.startTeachingButton} onPress={() => {
                setSelectedCourse(displayCourses[0] || { name: 'Computer Science', code: 'CSM101' });
                setShowVirtualClassroom(true);
              }}>
                <Ionicons name="chatbubbles" size={18} color="#FFFFFF" style={{marginRight: 8}} />
                <Text style={styles.startTeachingText}>Start Teaching</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Purple Profile Card */}
        <View style={styles.profileCardContainer}>
          <LinearGradient
            colors={isDark ? ['#1E293B', '#334155'] : ['#4F46E5', '#7C3AED']}
            style={styles.profileCard}
          >
            <View style={styles.profileAvatarContainer}>
              <View style={[styles.profileAvatar, { overflow: 'hidden' }]}>
                {user.photoURL || user.profileImage || user.avatar ? (
                  <Image source={{ uri: user.photoURL || user.profileImage || user.avatar }} style={styles.profileAvatarImage} />
                ) : (
                  <Text style={styles.profileAvatarText}>{user.name ? user.name.charAt(0).toUpperCase() : 'L'}</Text>
                )}
              </View>
              <TouchableOpacity 
                style={styles.profileBadge}
                onPress={() => {
                  Alert.alert('Update Photo', 'Would you like to change your profile picture?', [
                    { text: 'Cancel', style: 'cancel' },
                    { text: 'Choose from Gallery', onPress: () => Alert.alert('Simulated', 'Image picker would open here.') },
                    { text: 'Remove Photo', style: 'destructive', onPress: () => Alert.alert('Simulated', 'Photo would be removed.') }
                  ]);
                }}
              >
                <Ionicons name="camera" size={12} color="#FFFFFF" />
              </TouchableOpacity>
            </View>
            <View style={styles.profileInfo}>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Text style={styles.profileGreeting}>{user.name || 'Lecturer'}</Text>
                <Ionicons name="globe" size={14} color="#FCD34D" style={{ marginLeft: 6 }} />
              </View>
              <Text style={styles.profileDepartment}>{user.department || 'Computer Science'}</Text>
              <View style={styles.facultyBadge}>
                  <Ionicons name="shield-checkmark" size={10} color="#FFFFFF" style={{ marginRight: 4 }} />
                  <Text style={styles.facultyBadgeText}>VERIFIED FACULTY</Text>
              </View>
              <View style={styles.profileTeachingInfo}>
                <Ionicons name="stats-chart" size={12} color="rgba(255,255,255,0.8)" style={{marginRight: 4}} />
                <Text style={styles.profileTeachingText}>Teaching {courseDetails.length} courses</Text>
              </View>
            </View>
            <TouchableOpacity 
              style={styles.profileNotificationBtn}
              onPress={() => navigation.navigate('Notifications')}
            >
              <Ionicons name="notifications" size={22} color="#FFFFFF" />
              {notifications?.filter(n => !n.read).length > 0 && (
                <View style={styles.profileNotificationBadge}>
                  <Text style={styles.profileNotificationBadgeText}>
                    {notifications.filter(n => !n.read).length}
                  </Text>
                </View>
              )}
            </TouchableOpacity>
          </LinearGradient>
        </View>

        {/* Your Teaching Impact (Visual Analytics) */}
        <View style={[styles.section, isDark && styles.darkSection, { marginTop: 25, marginBottom: 10 }]}>
          <View style={styles.sectionHeader}>
            <View style={{flexDirection: 'row', alignItems: 'center'}}>
              <Ionicons name="analytics" size={20} color={isDark ? '#818CF8' : '#4F46E5'} style={{marginRight: 8}} />
              <Text style={[styles.sectionTitle, isDark && styles.darkSectionTitle, { marginBottom: 0, fontSize: 18 }]}>Teaching Impact</Text>
            </View>
            <TouchableOpacity 
              onPress={() => navigation.navigate('Analytics', { 
                courseCode: displayCourses[0]?.code || 'LECTURER_PORTFOLIO',
                courseName: displayCourses[0]?.name || 'Teaching Portfolio' 
              })}
            >
              <Text style={styles.seeHowText}>View Insights</Text>
            </TouchableOpacity>
          </View>

          <View style={[styles.analyticsCard, isDark && styles.darkCard]}>
            <View style={styles.chartHeader}>
              <Text style={styles.chartTitle}>Student Engagement Trend</Text>
              <Text style={styles.chartValue}>+12% this week</Text>
            </View>
            
            <View style={styles.chartContainer}>
              {[60, 45, 80, 55, 90, 70, 85].map((height, index) => (
                <View key={index} style={styles.barItem}>
                  <View style={[styles.barValue, { height: height, backgroundColor: index === 4 ? '#6366F1' : 'rgba(99, 102, 241, 0.3)' }]} />
                  <Text style={styles.barLabel}>{['M', 'T', 'W', 'T', 'F', 'S', 'S'][index]}</Text>
                </View>
              ))}
            </View>
          </View>
        </View>

        {/* Global University Hub - Lecturer Side */}
        <View style={[styles.section, isDark && styles.darkSection]}>
          <View style={styles.sectionHeader}>
            <View style={{flexDirection: 'row', alignItems: 'center'}}>
              <Ionicons name="globe-outline" size={20} color={isDark ? '#818CF8' : '#4F46E5'} style={{marginRight: 8}} />
              <Text style={[styles.sectionTitle, isDark && styles.darkSectionTitle, { marginBottom: 0 }]}>Global Academic Hub</Text>
            </View>
          </View>
          
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginTop: 15 }}>
            <TouchableOpacity 
              style={styles.lecturerHubCard}
              onPress={() => {
                setInitialHubTab('research');
                setShowGlobalHub(true);
              }}
            >
              <LinearGradient colors={['#4F46E5', '#3730A3']} style={styles.hubGradient}>
                <View style={styles.hubIconCircle}>
                   <Ionicons name="flask" size={20} color="#4F46E5" />
                </View>
                <Text style={styles.hubTitle}>World Research</Text>
                <Text style={styles.hubSub}>New global grants available</Text>
              </LinearGradient>
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.lecturerHubCard}
              onPress={() => {
                setInitialHubTab('research');
                setShowGlobalHub(true);
              }}
            >
              <LinearGradient colors={['#10B981', '#065F46']} style={styles.hubGradient}>
                <View style={styles.hubIconCircle}>
                   <Ionicons name="library" size={20} color="#10B981" />
                </View>
                <Text style={styles.hubTitle}>Publication Hub</Text>
                <Text style={styles.hubSub}>Submit your recent papers</Text>
              </LinearGradient>
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.lecturerHubCard}
              onPress={() => {
                setInitialHubTab('faculty');
                setShowGlobalHub(true);
              }}
            >
              <LinearGradient colors={['#8B5CF6', '#6D28D9']} style={styles.hubGradient}>
                <View style={styles.hubIconCircle}>
                   <Ionicons name="earth" size={20} color="#8B5CF6" />
                </View>
                <Text style={styles.hubTitle}>Global Faculty</Text>
                <Text style={styles.hubSub}>Connect with other lecturers</Text>
              </LinearGradient>
            </TouchableOpacity>
          </ScrollView>
        </View>

        {/* ✨ Professor's Toolbox & AI (Consolidated) */}
        <View style={[styles.section, isDark && styles.darkSection]}>
          <View style={styles.sectionHeader}>
            <View>
              <Text style={[styles.sectionTitle, isDark && styles.darkSectionTitle]}>🚀 Professor's Toolbox</Text>
              <Text style={[styles.sectionSubtitle, isDark && styles.darkSectionSubtitle]}>AI assistance & quick shortcuts</Text>
            </View>
          </View>
          
          <View style={styles.modernAIGrid}>
            <TouchableOpacity
              style={styles.modernAICard}
              onPress={() => {
                const targetCourse = displayCourses[0] || { name: 'Curriculum', code: 'PLAN' };
                setSelectedCourse(targetCourse);
                setShowAILectureAssistant(true);
              }}
            >
              <LinearGradient colors={['#667eea', '#764ba2']} style={styles.modernAIGradient}>
                <Ionicons name="sparkles" size={28} color="#FFFFFF" />
                <Text style={styles.modernAITitle}>AI Assistant</Text>
                <Text style={styles.modernAIDescription}>Smart lecture help</Text>
              </LinearGradient>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.modernAICard}
              onPress={() => {
                const targetCourse = displayCourses[0] || { name: 'Curriculum', code: 'PLAN' };
                setSelectedCourse(targetCourse);
                setShowAIPatentNavigator(true);
              }}
            >
              <LinearGradient colors={['#4F46E5', '#3730A3']} style={styles.modernAIGradient}>
                <Ionicons name="flask" size={28} color="#FFFFFF" />
                <Text style={styles.modernAITitle}>Patent AI</Text>
                <Text style={styles.modernAIDescription}>Research navigator</Text>
              </LinearGradient>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.modernAICard}
              onPress={() => {
                const targetCourse = displayCourses[0] || { name: 'Curriculum', code: 'PLAN' };
                setSelectedCourse(targetCourse);
                setShowSmartGrading(true);
              }}
            >
              <LinearGradient colors={['#10B981', '#059669']} style={styles.modernAIGradient}>
                <Ionicons name="checkmark-circle" size={28} color="#FFFFFF" />
                <Text style={styles.modernAITitle}>Smart Grading</Text>
                <Text style={styles.modernAIDescription}>Automated system</Text>
              </LinearGradient>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.modernAICard}
              onPress={() => {
                const targetCourse = displayCourses[0] || { name: 'Curriculum', code: 'PLAN' };
                setSelectedCourse(targetCourse);
                setShowLectureAnalytics(true);
              }}
            >
              <LinearGradient colors={['#F59E0B', '#D97706']} style={styles.modernAIGradient}>
                <Ionicons name="trending-up" size={28} color="#FFFFFF" />
                <Text style={styles.modernAITitle}>Analytics</Text>
                <Text style={styles.modernAIDescription}>Performance insights</Text>
              </LinearGradient>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.modernAICard}
              onPress={() => {
                const targetCourse = displayCourses[0] || { name: 'Curriculum', code: 'PLAN' };
                setSelectedCourse(targetCourse);
                setShowPlagiarismDetector(true);
              }}
            >
              <LinearGradient colors={['#EF4444', '#B91C1C']} style={styles.modernAIGradient}>
                <Ionicons name="shield-checkmark" size={28} color="#FFFFFF" />
                <Text style={styles.modernAITitle}>Plagiarism AI</Text>
                <Text style={styles.modernAIDescription}>Smart detector</Text>
              </LinearGradient>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.modernAICard}
              onPress={() => {
                const targetCourse = displayCourses[0] || { name: 'Curriculum', code: 'PLAN' };
                setSelectedCourse(targetCourse);
                setShowLectureRecorder(true);
              }}
            >
              <LinearGradient colors={['#8B5CF6', '#4C1D95']} style={styles.modernAIGradient}>
                <Ionicons name="videocam" size={28} color="#FFFFFF" />
                <Text style={styles.modernAITitle}>Lecture REC</Text>
                <Text style={styles.modernAIDescription}>Smart recorder</Text>
              </LinearGradient>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.modernAICard}
              onPress={() => {
                const targetCourse = displayCourses[0] || { name: 'Curriculum', code: 'PLAN' };
                setSelectedCourse(targetCourse);
                setShowPerformancePrediction(true);
              }}
            >
              <LinearGradient colors={['#F59E0B', '#D97706']} style={styles.modernAIGradient}>
                <Ionicons name="trending-up" size={28} color="#FFFFFF" />
                <Text style={styles.modernAITitle}>Performance AI</Text>
                <Text style={styles.modernAIDescription}>Success prediction</Text>
              </LinearGradient>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.modernAICard}
              onPress={() => {
                const targetCourse = displayCourses[0] || { name: 'Curriculum', code: 'PLAN' };
                setSelectedCourse(targetCourse);
                setShowContentGenerator(true);
              }}
            >
              <LinearGradient colors={['#10B981', '#065F46']} style={styles.modernAIGradient}>
                <Ionicons name="create" size={28} color="#FFFFFF" />
                <Text style={styles.modernAITitle}>Content Gen</Text>
                <Text style={styles.modernAIDescription}>AI Resource creator</Text>
              </LinearGradient>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.modernAICard}
              onPress={() => {
                const targetCourse = displayCourses[0] || { name: 'Curriculum', code: 'PLAN' };
                setSelectedCourse(targetCourse);
                setShowAILessonPlanner(true);
              }}
            >
              <LinearGradient colors={['#3B82F6', '#1E40AF']} style={styles.modernAIGradient}>
                <Ionicons name="calendar" size={28} color="#FFFFFF" />
                <Text style={styles.modernAITitle}>Lesson Planner</Text>
                <Text style={styles.modernAIDescription}>AI Schedule</Text>
              </LinearGradient>
            </TouchableOpacity>

            <TouchableOpacity style={styles.modernAICard} onPress={() => navigation.navigate('Chat')}>
              <LinearGradient colors={['#6366F1', '#8B5CF6']} style={styles.modernAIGradient}>
                <Ionicons name="chatbubbles" size={28} color="#FFFFFF" />
                <Text style={styles.modernAITitle}>Course Chats</Text>
                <Text style={styles.modernAIDescription}>Connect with students</Text>
              </LinearGradient>
            </TouchableOpacity>

            <TouchableOpacity style={styles.modernAICard} onPress={() => navigation.navigate('Materials')}>
              <LinearGradient colors={['#10B981', '#059669']} style={styles.modernAIGradient}>
                <Ionicons name="library" size={28} color="#FFFFFF" />
                <Text style={styles.modernAITitle}>Materials</Text>
                <Text style={styles.modernAIDescription}>Course documents</Text>
              </LinearGradient>
            </TouchableOpacity>

            <TouchableOpacity style={styles.modernAICard} onPress={() => navigation.navigate('CallHistory')}>
              <LinearGradient colors={['#ffecd2', '#fcb69f']} style={styles.modernAIGradient}>
                <Ionicons name="call" size={28} color="#FFFFFF" />
                <Text style={styles.modernAITitle}>Voice Calls</Text>
                <Text style={styles.modernAIDescription}>Direct student calls</Text>
              </LinearGradient>
            </TouchableOpacity>

            <TouchableOpacity style={styles.modernAICard} onPress={() => setShowVoiceRecorder(true)}>
              <LinearGradient colors={['#8E2DE2', '#4A00E0']} style={styles.modernAIGradient}>
                <Ionicons name="mic" size={28} color="#FFFFFF" />
                <Text style={styles.modernAITitle}>Voice Note</Text>
                <Text style={styles.modernAIDescription}>Record and share</Text>
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
            {displayCourses.length === 0 ? (
              <View style={[styles.emptyStateCard, isDark && styles.darkCard]}>
                <Ionicons name="school" size={40} color={isDark ? '#64748B' : '#94A3B8'} />
                <Text style={[styles.emptyStateTitle, isDark && styles.darkSectionTitle]}>No assigned courses</Text>
                <Text style={styles.emptyStateText}>Contact your department head to assign teaching modules.</Text>
              </View>
            ) : (
              Object.entries(coursesByLevel).map(([level, courses]) => (
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
              ))
            )}
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

        <View style={{ height: 100 }} />
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

      {showAILessonPlanner && (
        <SmartScheduleOptimizer
          visible={showAILessonPlanner}
          onClose={() => setShowAILessonPlanner(false)}
          user={user}
          courses={displayCourses}
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

      {showAIPatentNavigator && (
        <AIPatentNavigator
          visible={showAIPatentNavigator}
          onClose={() => setShowAIPatentNavigator(false)}
          lecturerName={user?.name}
        />
      )}

      {/* 🌟 Welcome Guide for Discovering Amazing Lecturer Features */}
      <FeatureWelcomeGuide
        visible={showWelcomeGuide}
        onClose={() => setShowWelcomeGuide(false)}
        userType="lecturer"
      />

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
      {/* Floating Professor AI Assistant */}
      <TouchableOpacity 
        style={styles.floatingAIButton}
        onPress={() => setShowAILectureAssistant(true)}
        activeOpacity={0.8}
      >
        <LinearGradient
          colors={["#8B5CF6", "#6D28D9"]}
          style={styles.floatingAIButtonGradient}
        >
          <Ionicons name="bulb" size={28} color="#FFFFFF" />
          <Text style={styles.floatingAIText}>Professor AI</Text>
        </LinearGradient>
      </TouchableOpacity>

      {/* Global University Hub Modal */}
      <GlobalUniversityHub
        visible={showGlobalHub}
        onClose={() => setShowGlobalHub(false)}
        user={user}
        initialTab={initialHubTab}
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
  topBar: {
    backgroundColor: '#4F46E5',
    paddingVertical: 15,
    paddingHorizontal: 20,
    paddingTop: 45,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  discoverButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  discoverButtonText: {
    fontSize: 12,
    color: '#FFFFFF',
    fontWeight: '700',
    marginLeft: 4,
  },
  themeToggle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  darkTopBar: {
    backgroundColor: '#1E293B',
  },
  topBarTitle: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: 'bold',
  },
  darkTopBarTitle: {
    color: '#F8FAFC',
  },
  welcomeCardContainer: {
    marginTop: 20,
    marginBottom: 10,
  },
  welcomeCard: {
    backgroundColor: '#10B981',
    borderRadius: 20,
    padding: 20,
    alignItems: 'center',
    position: 'relative',
  },
  closeButton: {
    position: 'absolute',
    top: 15,
    right: 15,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 15,
    width: 30,
    height: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
  welcomeEmoji: {
    fontSize: 40,
    marginBottom: 10,
  },
  welcomeTitle: {
    color: '#FFFFFF',
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 8,
    textAlign: 'center',
  },
  welcomeText: {
    color: '#FFFFFF',
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 20,
    paddingHorizontal: 10,
  },
  startTeachingButton: {
    backgroundColor: 'rgba(255,255,255,0.25)',
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 25,
  },
  startTeachingText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  profileCardContainer: {
    marginTop: 10,
  },
  profileCard: {
    borderRadius: 25,
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
  },
  profileAvatarContainer: {
    position: 'relative',
    marginRight: 15,
  },
  profileAvatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  profileAvatarImage: {
    width: '100%',
    height: '100%',
    borderRadius: 30,
  },
  profileAvatarText: {
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: 'bold',
  },
  profileBadge: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    backgroundColor: '#F59E0B',
    width: 20,
    height: 20,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#4F46E5',
  },
  profileInfo: {
    flex: 1,
  },
  profileGreeting: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  profileDepartment: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 14,
    marginBottom: 6,
  },
  profileTeachingInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  profileTeachingText: {
    color: 'rgba(255,255,255,0.9)',
    fontSize: 12,
  },
  profileNotificationBtn: {
    position: 'relative',
    width: 45,
    height: 45,
    borderRadius: 22.5,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 10,
  },
  profileNotificationBadge: {
    position: 'absolute',
    top: -5,
    right: -2,
    backgroundColor: '#EF4444',
    width: 18,
    height: 18,
    borderRadius: 9,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#4F46E5',
  },
  profileNotificationBadgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: 'bold',
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  statBox: {
    width: (width - 40 - 30) / 4,
    borderRadius: 16,
    padding: 10,
    alignItems: 'center',
    justifyContent: 'center',
    height: 110,
  },
  statBoxNumber: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 10,
    marginBottom: 4,
  },
  statBoxLabel: {
    color: 'rgba(255,255,255,0.9)',
    fontSize: 11,
    textAlign: 'center',
  },
  seeHowText: {
    color: '#64748B',
    fontSize: 12,
    fontStyle: 'italic',
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
  // Analytics & Hub Styles
  analyticsCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 20,
    marginTop: 15,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.05)',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
  },
  darkCard: {
    backgroundColor: '#1E293B',
    borderColor: 'rgba(255,255,255,0.1)',
  },
  chartHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
    marginBottom: 20,
  },
  chartTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#64748B',
  },
  chartValue: {
    fontSize: 12,
    fontWeight: '800',
    color: '#10B981',
  },
  chartContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    height: 100,
    paddingHorizontal: 5,
  },
  barItem: {
    alignItems: 'center',
    width: 30,
  },
  barValue: {
    width: 6,
    borderRadius: 3,
    marginBottom: 8,
  },
  barLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: '#94A3B8',
  },
  emptyStateCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 30,
    alignItems: 'center',
    justifyContent: 'center',
    width: width - 40,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: '#94A3B8',
  },
  emptyStateTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1E293B',
    marginTop: 15,
  },
  emptyStateText: {
    fontSize: 14,
    color: '#64748B',
    textAlign: 'center',
    marginTop: 8,
    paddingHorizontal: 20,
  },
  miniStatsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
    backgroundColor: 'rgba(0,0,0,0.02)',
    padding: 15,
    borderRadius: 16,
  },
  miniStat: {
    alignItems: 'center',
  },
  miniStatLabel: {
    fontSize: 9,
    fontWeight: '800',
    color: '#64748B',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  miniStatValue: {
    fontSize: 15,
    fontWeight: '800',
    color: '#1E293B',
  },
  lecturerHubCard: {
    width: width * 0.45,
    height: 120,
    marginRight: 15,
    borderRadius: 24,
    overflow: 'hidden',
    elevation: 6,
    shadowColor: '#6366F1',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
  },
  hubGradient: {
    flex: 1,
    padding: 16,
    justifyContent: 'center',
  },
  hubTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#FFF',
    marginTop: 10,
  },
  hubSub: {
    fontSize: 10,
    color: 'rgba(255,255,255,0.8)',
    marginTop: 4,
  },
  facultyBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(16, 185, 129, 0.2)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    alignSelf: 'flex-start',
    marginTop: 6,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.3)',
  },
  facultyBadgeText: {
    fontSize: 9,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },
  hubIconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  floatingAIButton: {
    position: "absolute",
    bottom: 30,
    right: 20,
    width: 65,
    height: 65,
    borderRadius: 32.5,
    elevation: 12,
    shadowColor: "#8B5CF6",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 10,
    zIndex: 9999,
  },
  floatingAIButtonGradient: {
    width: "100%",
    height: "100%",
    borderRadius: 32.5,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "rgba(255, 255, 255, 0.3)",
  },
  floatingAIText: {
    fontSize: 8,
    color: "#FFFFFF",
    fontWeight: "900",
    marginTop: -2,
    textTransform: "uppercase",
    textAlign: "center",
  },
});