import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  SafeAreaView,
  ScrollView,
  Dimensions,
  Animated,
  RefreshControl,
  StatusBar,
  Alert,
  Vibration,
  Image,
  ActivityIndicator,
  Modal,
  Pressable,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../components/ThemeProvider';
import { useApp } from '../context/AppContext';
import achievementsService from '../services/achievementsService';
import AIStudyAssistant from '../components/AIStudyAssistant';
import SmartNoteTaking from '../components/SmartNoteTaking';
import GamifiedProgress from '../components/GamifiedProgress';
import ARStudyMode from '../components/ARStudyMode';
import EnhancedVoiceCall from '../components/EnhancedVoiceCall';
import AIQuizGenerator from '../components/AIQuizGenerator';
import SmartScheduleOptimizer from '../components/SmartScheduleOptimizer';
import FeatureWelcomeGuide from '../components/FeatureWelcomeGuide';
import VoiceRecorder from '../components/VoiceRecorder';
import TextEditor from '../components/TextEditor';
import ProgressTracker from '../components/ProgressTracker';
import SemesterModules from '../components/SemesterModules';
import GameCenter from '../components/GameCenter';
import FocusMode from '../components/FocusMode';
import WeekendActivities from '../components/WeekendActivities';

const { width, height } = Dimensions.get('window');

export default function ModernHomeDashboard({ navigation }) {
  const { csModules, notifications, user } = useApp();
  const { isDark: themeIsDark, toggleTheme: toggleGlobalTheme } = useTheme();
  
  // Debug logging
  console.log('ModernHomeDashboard - User:', user?.uid, user?.userType);
  console.log('ModernHomeDashboard - Modules:', csModules?.length);
  console.log('ModernHomeDashboard - Notifications:', notifications?.length);
  
  // Early return if user is not loaded yet
  if (!user || !csModules) {
    return (
      <SafeAreaView style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#F8FAFC' }}>
        <ActivityIndicator size="large" color="#6366F1" />
        <Text style={{ fontSize: 16, color: '#64748B', marginTop: 16 }}>Loading dashboard...</Text>
      </SafeAreaView>
    );
  }
  
  // State for animations and gamification
  const [refreshing, setRefreshing] = useState(false);
  const [studyStreak, setStudyStreak] = useState(7);
  const [dailyGoal, setDailyGoal] = useState(0.75);
  const [weeklyProgress, setWeeklyProgress] = useState(0.6);
  const [isDark, setIsDark] = useState(themeIsDark);
  const [achievements, setAchievements] = useState([]);
  
  // New feature modals
  const [showVoiceRecorder, setShowVoiceRecorder] = useState(false);
  const [showTextEditor, setShowTextEditor] = useState(false);
  const [showMindMap, setShowMindMap] = useState(false);
  const [showAIAssistant, setShowAIAssistant] = useState(false);
  const [showSmartNotes, setShowSmartNotes] = useState(false);
  const [showProgress, setShowProgress] = useState(false);
  const [showARMode, setShowARMode] = useState(false);
  const [showVoiceCall, setShowVoiceCall] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [callParticipant, setCallParticipant] = useState(null);
  const [showQuizGenerator, setShowQuizGenerator] = useState(false);
  const [showScheduleOptimizer, setShowScheduleOptimizer] = useState(false);
  const [showGameCenter, setShowGameCenter] = useState(false);
  const [showFocusMode, setShowFocusMode] = useState(false);
  const [showKnowledgeTree, setShowKnowledgeTree] = useState(false);
  const [showTimeTravel, setShowTimeTravel] = useState(false);
  const [showDreamJournal, setShowDreamJournal] = useState(false);
  const [showSmartVoiceNotes, setShowSmartVoiceNotes] = useState(false);
  const [showWelcomeGuide, setShowWelcomeGuide] = useState(false);
  const [showWeekendActivities, setShowWeekendActivities] = useState(false);
  const [showProgressTracker, setShowProgressTracker] = useState(false);
  const [showSemesterModules, setShowSemesterModules] = useState(false);
  const [showQuickActionsModal, setShowQuickActionsModal] = useState(false);
  const [showStudyGroupPicker, setShowStudyGroupPicker] = useState(false);
  const [showReminderPicker, setShowReminderPicker] = useState(false);
  const [achievementProgress, setAchievementProgress] = useState({
    total: 0,
    earned: 0,
    percentage: 0,
    categories: {}
  });
  const [userStats, setUserStats] = useState({
    totalPoints: 0,
    messagesCount: 0,
    filesUploaded: 0,
    callsMade: 0
  });
  
  // Animation refs
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;
  const bounceAnim = useRef(new Animated.Value(0)).current;
  
  const currentLevelModules = user?.academicLevel ? (csModules?.[user.academicLevel] || []) : (csModules?.['100'] || []);
  const unreadNotifications = (notifications || []).filter(n => !n.read).length;
  
  // Initialize animations
  useEffect(() => {
    Animated.sequence([
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          tension: 50,
          friction: 8,
          useNativeDriver: true,
        }),
      ]),
      Animated.loop(
        Animated.sequence([
          Animated.timing(bounceAnim, {
            toValue: 1,
            duration: 1000,
            useNativeDriver: true,
          }),
          Animated.timing(bounceAnim, {
            toValue: 0,
            duration: 1000,
            useNativeDriver: true,
          }),
        ])
      ),
    ]).start();
  }, []);

  // Load user achievements
  useEffect(() => {
    if (user?.uid) {
      loadUserAchievements();
      loadUserStats();
    }
  }, [user?.uid]);

  const loadUserAchievements = async () => {
    if (!user?.uid) return;
    
    try {
      achievementsService.setCurrentUser(user);
      
      // Get user's achievements
      const result = await achievementsService.getUserAchievements(user.uid);
      if (result.success) {
        setAchievements(result.achievements.slice(0, 4)); // Show top 4
      }
      
      // Get achievement progress
      const progressResult = await achievementsService.getAchievementProgress(user.uid);
      if (progressResult.success) {
        setAchievementProgress(progressResult.progress);
      }

      // Award first login achievement
      await achievementsService.checkAndAwardAchievements(user.uid, 'early_login');
    } catch (error) {
      console.error('Error loading achievements:', error);
    }
  };

  const loadUserStats = async () => {
    if (!user?.uid) return;
    
    try {
      setUserStats({
        totalPoints: 275,
        messagesCount: 47,
        filesUploaded: 12,
        callsMade: 8
      });
    } catch (error) {
      console.error('Error loading user stats:', error);
    }
  };

  // Courses list for study group etc. (array - from level or flat)
  const coursesList = Array.isArray(csModules) ? csModules : (currentLevelModules || []);

  // Quick Action: Create Study Group — pick course then confirm
  const createStudyGroup = () => {
    setShowQuickActionsModal(false);
    if (!coursesList.length) {
      Alert.alert('No Courses', 'You have no courses yet. Enroll in courses to create study groups.');
      return;
    }
    setShowStudyGroupPicker(true);
  };

  const confirmStudyGroup = (course) => {
    setShowStudyGroupPicker(false);
    Vibration.vibrate(50);
    Alert.alert(
      'Study Group Created! 🎉',
      `Study group for ${course.name} has been created. Other students will be notified to join.`,
      [
        { text: 'Go to Chat', onPress: () => navigation.navigate('Chat') },
        { text: 'OK' }
      ]
    );
  };

  const setReminder = () => {
    setShowQuickActionsModal(false);
    setShowReminderPicker(true);
  };

  const confirmReminder = (type, title, message) => {
    setShowReminderPicker(false);
    Vibration.vibrate(50);
    Alert.alert(title, message, [{ text: 'OK' }]);
  };

  const startPomodoroTimer = () => {
    setShowQuickActionsModal(false);
    setShowFocusMode(true);
  };
  
  if (!user) {
    return (
      <View style={[styles.loadingContainer, isDark && styles.darkContainer]}>
        <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
          <LinearGradient
            colors={isDark ? ['#1A1A2E', '#16213E'] : ['#6366F1', '#8B5CF6']}
            style={styles.loadingCard}
          >
            <Ionicons name="school" size={48} color="#FFFFFF" />
            <Text style={styles.loadingText}>Loading UniConnect...</Text>
          </LinearGradient>
        </Animated.View>
      </View>
    );
  }

  const handleRefresh = async () => {
    setRefreshing(true);
    await new Promise(resolve => setTimeout(resolve, 1000));
    setRefreshing(false);
    Vibration.vibrate(50);
  };

  const toggleTheme = () => {
    toggleGlobalTheme();
    Vibration.vibrate(50);
  };



  const renderModernCourseCard = ({ item, index }) => {
    const unreadCount = notifications.filter(
      notif => notif.course === item.code && !notif.read
    ).length;

    const animationDelay = index * 100;
    const cardAnim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
      Animated.timing(cardAnim, {
        toValue: 1,
        duration: 600,
        delay: animationDelay,
        useNativeDriver: true,
      }).start();
    }, []);

    return (
      <Animated.View style={{ 
        opacity: cardAnim,
        transform: [{ 
          translateY: cardAnim.interpolate({
            inputRange: [0, 1],
            outputRange: [20, 0],
          })
        }]
      }}>
        <TouchableOpacity
          style={[styles.modernCourseCard, isDark && styles.darkCard]}
          onPress={() => navigation.navigate('Chat', { selectedCourse: item })}
          activeOpacity={0.8}
        >
          <LinearGradient
            colors={[
              item.color || '#6366F1',
              item.color ? `${item.color}CC` : '#8B5CF6'
            ]}
            style={styles.courseGradient}
          >
            <View style={styles.courseHeader}>
              <Text style={[styles.courseCode, isDark && styles.darkText]}>{item.code}</Text>
              {unreadCount > 0 && (
                <View style={styles.courseBadge}>
                  <Text style={styles.courseBadgeText}>
                    {unreadCount > 99 ? '99+' : unreadCount}
                  </Text>
                </View>
              )}
            </View>
            
            <Text style={[styles.courseName, isDark && styles.darkText]} numberOfLines={2}>
              {item.name}
            </Text>
            
            <View style={styles.courseFooter}>
              <View style={styles.courseProgress}>
                <View style={[styles.progressBar, { width: '100%' }]}>
                  <View style={[styles.progressFill, { width: `${Math.random() * 100}%` }]} />
                </View>
                <Text style={[styles.progressText, isDark && styles.darkText]}>
                  {Math.floor(Math.random() * 100)}% Complete
                </Text>
              </View>
              
              <TouchableOpacity style={styles.courseAction}>
                <Ionicons name="arrow-forward" size={20} color="#FFFFFF" />
              </TouchableOpacity>
            </View>
          </LinearGradient>
        </TouchableOpacity>
      </Animated.View>
    );
  };

  const bounceScale = bounceAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 1.05],
  });

  return (
    <SafeAreaView style={[styles.container, isDark && styles.darkContainer]}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />
      
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
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              colors={['#6366F1']}
              tintColor="#6366F1"
            />
          }
        >
          {/* Modern Header with Gradient */}
          <LinearGradient
            colors={isDark ? ['#1A1A2E', '#16213E'] : ['#6366F1', '#8B5CF6']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.modernHeader}
          >
            <View style={styles.headerContent}>
              <View style={styles.userInfo}>
                <TouchableOpacity 
                  style={styles.avatarContainer}
                  onPress={() => navigation.navigate('Profile')}
                >
                  <View style={styles.avatar}>
                    <Text style={styles.avatarText}>
                      {user.name.charAt(0).toUpperCase()}
                    </Text>
                  </View>
                  <View style={styles.onlineIndicator} />
                </TouchableOpacity>
                
                <View style={styles.userDetails}>
                  <View style={styles.greetingSection}>
                    <Text style={styles.welcomeText} numberOfLines={1}>
                      Welcome back, <Text style={styles.userName}>{user.name}</Text>
                    </Text>
                    <View style={styles.credentialsSection}>
                      <View style={styles.credentialGrid}>
                        <View style={styles.credentialRow}> 
                          <View style={styles.credentialItem}>
                            <Ionicons name="person" size={14} color="rgba(255, 255, 255, 0.7)" />
                            <Text style={styles.credentialText} numberOfLines={1}>{user.name}</Text>
                          </View>
                        </View>
                        <View style={styles.credentialRow}>
                          <View style={styles.credentialItem}>
                            <Ionicons name="school" size={14} color="rgba(255, 255, 255, 0.7)" />
                            <Text style={styles.credentialText}>Level {user.academicLevel}</Text>
                          </View>
                          <Text style={styles.credentialSeparator}>•</Text>
                          <View style={styles.credentialItem}>
                            <Ionicons name="id-card" size={14} color="rgba(255, 255, 255, 0.7)" />
                            <Text style={styles.credentialText}>ID: {user.studentId || 'CST2024001'}</Text>
                          </View>
                        </View>
                        <View style={styles.credentialRow}>
                          <View style={styles.credentialItem}>
                            <Ionicons name="mail" size={14} color="rgba(255, 255, 255, 0.7)" />
                            <Text style={styles.credentialText} numberOfLines={1}>{user.email || 'student@university.edu'}</Text>
                          </View>
                        </View>
                      </View>
                    </View>
                  </View>
                  
                  <View style={styles.onlineStatus}>
                    <View style={styles.onlineIndicator} />
                    <Text style={styles.onlineText} numberOfLines={1}>
                      {Math.floor(Math.random() * 50) + 20} people online
                    </Text>
                  </View>
                </View>
              </View>
              
              <View style={styles.headerActions}>
                <TouchableOpacity 
                  style={styles.discoverButton}
                  onPress={() => setShowWelcomeGuide(true)}
                >
                  <Ionicons name="sparkles" size={20} color="#FFFFFF" />
                  <Text style={styles.discoverButtonText}>Discover</Text>
                </TouchableOpacity>
                
                <TouchableOpacity 
                  style={styles.themeToggle}
                  onPress={toggleTheme}
                >
                  <Ionicons 
                    name={isDark ? 'sunny' : 'moon'} 
                    size={24} 
                    color="#FFFFFF" 
                  />
                </TouchableOpacity>
                
                <TouchableOpacity 
                  style={styles.notificationButton}
                  onPress={() => navigation.navigate('Notifications')}
                >
                  <Ionicons name="notifications" size={24} color="#FFFFFF" />
                  {unreadNotifications > 0 && (
                    <View style={styles.notificationBadge}>
                      <Text style={styles.notificationBadgeText}>
                        {unreadNotifications > 99 ? '99+' : unreadNotifications}
                      </Text>
                    </View>
                  )}
                </TouchableOpacity>
              </View>
            </View>

            {/* Study Streak and Progress */}
            <View style={[styles.statsSection, isDark && styles.darkSection]}>
              <Text style={[styles.statsSectionTitle, isDark && styles.darkText]}>Your Progress</Text>
            <View style={styles.statsContainer}>
                <View style={[styles.statCard, isDark && styles.darkCard]}>
                <Animated.View style={{ transform: [{ scale: bounceScale }] }}>
                    <Ionicons name="flame" size={24} color="#F59E0B" />
                </Animated.View>
                  <Text style={[styles.statNumber, isDark && styles.darkText]}>{studyStreak}</Text>
                  <Text style={[styles.statLabel, isDark && styles.darkText]}>Day Streak</Text>
              </View>

                <View style={[styles.statCard, isDark && styles.darkCard]}>
                <View style={styles.progressContainer}>
                    <Text style={[styles.progressLabel, isDark && styles.darkText]}>Daily Goal</Text>
                  <View style={styles.circularProgress}>
                      <Text style={[styles.progressPercentage, isDark && styles.darkText]}>
                      {Math.round(dailyGoal * 100)}%
                    </Text>
                  </View>
                </View>
              </View>

                <View style={[styles.statCard, isDark && styles.darkCard]}>
                  <Ionicons name="trophy" size={24} color="#F59E0B" />
                  <Text style={[styles.statNumber, isDark && styles.darkText]}>{achievementProgress.earned}</Text>
                  <Text style={[styles.statLabel, isDark && styles.darkText]}>Achievements</Text>
                </View>
              </View>
            </View>
          </LinearGradient>



          {/* Quick Actions with Modern Cards */}
          <View style={[styles.section, isDark && styles.darkSection]}>
            <View style={styles.sectionHeader}>
              <Text style={[styles.sectionTitle, isDark && styles.darkText]}>Quick Actions</Text>
              <TouchableOpacity>
                <Ionicons name="ellipsis-horizontal" size={20} color={isDark ? '#FFFFFF' : '#64748B'} />
              </TouchableOpacity>
            </View>
            
            <View style={styles.quickActionsGrid}>
              {/* Row 1: Core Study Tools */}
              <View style={styles.quickActionRow}>
              <TouchableOpacity 
                  style={[styles.quickActionCard, isDark && styles.darkCard]}
                onPress={() => setShowAIAssistant(true)}
                activeOpacity={0.8}
              >
                <LinearGradient
                  colors={['#667eea', '#764ba2']}
                  style={styles.quickActionGradient}
                >
                    <Ionicons name="sparkles" size={22} color="#FFFFFF" />
                </LinearGradient>
                <Text style={[styles.quickActionText, isDark && styles.darkText]}>AI Tutor</Text>
                <Text style={styles.quickActionSubtext}>Smart study buddy</Text>
              </TouchableOpacity>

              <TouchableOpacity 
                  style={[styles.quickActionCard, isDark && styles.darkCard]}
                onPress={() => setShowSmartNotes(true)}
                activeOpacity={0.8}
              >
                <LinearGradient
                  colors={['#4facfe', '#00f2fe']}
                  style={styles.quickActionGradient}
                >
                    <Ionicons name="document-text" size={22} color="#FFFFFF" />
                </LinearGradient>
                <Text style={[styles.quickActionText, isDark && styles.darkText]}>Smart Notes</Text>
                  <Text style={styles.quickActionSubtext}>AI-powered notes</Text>
              </TouchableOpacity>

              <TouchableOpacity 
                  style={[styles.quickActionCard, isDark && styles.darkCard]}
                  onPress={() => setShowMindMap(true)}
                  activeOpacity={0.8}
                >
                  <LinearGradient
                    colors={['#10B981', '#059669']}
                    style={styles.quickActionGradient}
                  >
                    <Ionicons name="git-network" size={22} color="#FFFFFF" />
                  </LinearGradient>
                  <Text style={[styles.quickActionText, isDark && styles.darkText]}>Mind Maps</Text>
                  <Text style={styles.quickActionSubtext}>Visual learning</Text>
                </TouchableOpacity>
              </View>

              {/* Row 2: Interactive Learning */}
              <View style={styles.quickActionRow}>
                <TouchableOpacity 
                  style={[styles.quickActionCard, isDark && styles.darkCard]}
                onPress={() => setShowARMode(true)}
                activeOpacity={0.8}
              >
                <LinearGradient
                  colors={['#fa709a', '#fee140']}
                  style={styles.quickActionGradient}
                >
                    <Ionicons name="cube" size={22} color="#FFFFFF" />
                </LinearGradient>
                <Text style={[styles.quickActionText, isDark && styles.darkText]}>AR Learning</Text>
                  <Text style={styles.quickActionSubtext}>3D visualization</Text>
              </TouchableOpacity>

              <TouchableOpacity 
                  style={[styles.quickActionCard, isDark && styles.darkCard]}
                  onPress={() => setShowGameCenter(true)}
                activeOpacity={0.8}
              >
                <LinearGradient
                    colors={['#FF6B6B', '#4ECDC4']}
                  style={styles.quickActionGradient}
                >
                    <Ionicons name="game-controller" size={22} color="#FFFFFF" />
                </LinearGradient>
                  <Text style={[styles.quickActionText, isDark && styles.darkText]}>Game Center</Text>
                  <Text style={styles.quickActionSubtext}>Learn & play</Text>
              </TouchableOpacity>

              <TouchableOpacity 
                  style={[styles.quickActionCard, isDark && styles.darkCard]}
                  onPress={() => setShowFocusMode(true)}
                  activeOpacity={0.8}
                >
                  <LinearGradient
                    colors={['#8B5CF6', '#7C3AED']}
                    style={styles.quickActionGradient}
                  >
                    <Ionicons name="eye" size={22} color="#FFFFFF" />
                  </LinearGradient>
                  <Text style={[styles.quickActionText, isDark && styles.darkText]}>Focus Mode</Text>
                  <Text style={styles.quickActionSubtext}>Stay focused</Text>
                </TouchableOpacity>
              </View>

              {/* Row 3: Knowledge & Progress */}
              <View style={styles.quickActionRow}>
                <TouchableOpacity 
                  style={[styles.quickActionCard, isDark && styles.darkCard]}
                  onPress={() => setShowKnowledgeTree(true)}
                  activeOpacity={0.8}
                >
                  <LinearGradient
                    colors={['#10B981', '#059669']}
                    style={styles.quickActionGradient}
                  >
                    <Ionicons name="leaf" size={22} color="#FFFFFF" />
                  </LinearGradient>
                  <Text style={[styles.quickActionText, isDark && styles.darkText]}>Knowledge Tree</Text>
                  <Text style={styles.quickActionSubtext}>Learning path</Text>
                </TouchableOpacity>

                <TouchableOpacity 
                  style={[styles.quickActionCard, isDark && styles.darkCard]}
                  onPress={() => setShowTimeTravel(true)}
                  activeOpacity={0.8}
                >
                  <LinearGradient
                    colors={['#F59E0B', '#D97706']}
                    style={styles.quickActionGradient}
                  >
                    <Ionicons name="time" size={22} color="#FFFFFF" />
                  </LinearGradient>
                  <Text style={[styles.quickActionText, isDark && styles.darkText]}>Time Travel</Text>
                  <Text style={styles.quickActionSubtext}>Study history</Text>
                </TouchableOpacity>

                <TouchableOpacity 
                  style={[styles.quickActionCard, isDark && styles.darkCard]}
                  onPress={() => setShowTimeTravel(true)}
                  activeOpacity={0.8}
                >
                  <LinearGradient
                    colors={['#EC4899', '#BE185D']}
                    style={styles.quickActionGradient}
                  >
                    <Ionicons name="moon" size={22} color="#FFFFFF" />
                  </LinearGradient>
                  <Text style={[styles.quickActionText, isDark && styles.darkText]}>Dream Journal</Text>
                  <Text style={styles.quickActionSubtext}>AI insights</Text>
                </TouchableOpacity>
              </View>

              {/* Row 4: Communication & AI */}
              <View style={styles.quickActionRow}>
                <TouchableOpacity 
                  style={[styles.quickActionCard, isDark && styles.darkCard]}
                onPress={() => {
                  setCallParticipant({ name: 'Study Partner', userType: 'Student' });
                  setShowVoiceCall(true);
                }}
                activeOpacity={0.8}
              >
                <LinearGradient
                  colors={['#ffecd2', '#fcb69f']}
                  style={styles.quickActionGradient}
                >
                    <Ionicons name="call" size={22} color="#FFFFFF" />
                </LinearGradient>
                <Text style={[styles.quickActionText, isDark && styles.darkText]}>HD Calls</Text>
                <Text style={styles.quickActionSubtext}>AI noise reduction</Text>
              </TouchableOpacity>

              <TouchableOpacity 
                  style={[styles.quickActionCard, isDark && styles.darkCard]}
                onPress={() => setShowQuizGenerator(true)}
                activeOpacity={0.8}
              >
                <LinearGradient
                  colors={['#ff6b6b', '#ee5a52']}
                  style={styles.quickActionGradient}
                >
                    <Ionicons name="help-circle" size={22} color="#FFFFFF" />
                </LinearGradient>
                <Text style={[styles.quickActionText, isDark && styles.darkText]}>AI Quiz</Text>
                <Text style={styles.quickActionSubtext}>Smart testing</Text>
              </TouchableOpacity>

              <TouchableOpacity 
                  style={[styles.quickActionCard, isDark && styles.darkCard]}
                onPress={() => setShowScheduleOptimizer(true)}
                activeOpacity={0.8}
              >
                <LinearGradient
                  colors={['#74b9ff', '#0984e3']}
                  style={styles.quickActionGradient}
                >
                    <Ionicons name="calendar" size={22} color="#FFFFFF" />
                </LinearGradient>
                  <Text style={[styles.quickActionText, isDark && styles.darkText]}>Schedule AI</Text>
                <Text style={styles.quickActionSubtext}>AI optimized</Text>
              </TouchableOpacity>
              </View>

              {/* Row 5: Academic Tools */}
              <View style={styles.quickActionRow}>
              <TouchableOpacity 
                  style={[styles.quickActionCard, isDark && styles.darkCard]}
                onPress={() => navigation.navigate('AcademicCalendar')}
                activeOpacity={0.8}
              >
                <LinearGradient
                  colors={['#EC4899', '#8B5CF6']}
                  style={styles.quickActionGradient}
                >
                    <Ionicons name="calendar" size={22} color="#FFFFFF" />
                </LinearGradient>
                <Text style={[styles.quickActionText, isDark && styles.darkText]}>Calendar</Text>
                <Text style={styles.quickActionSubtext}>Academic events</Text>
              </TouchableOpacity>

              <TouchableOpacity
                  style={[styles.quickActionCard, isDark && styles.darkCard]}
                onPress={() => navigation.navigate('CourseRegistration')}
                activeOpacity={0.8}
              >
                <LinearGradient
                  colors={['#8B5CF6', '#7C3AED']}
                  style={styles.quickActionGradient}
                >
                    <Ionicons name="school" size={22} color="#FFFFFF" />
                </LinearGradient>
                <Text style={[styles.quickActionText, isDark && styles.darkText]}>Register</Text>
                <Text style={styles.quickActionSubtext}>Course Registration</Text>
              </TouchableOpacity>

              <TouchableOpacity
                  style={[styles.quickActionCard, isDark && styles.darkCard]}
                onPress={() => navigation.navigate('AcademicResults')}
                activeOpacity={0.8}
              >
                <LinearGradient
                  colors={['#10B981', '#059669']}
                  style={styles.quickActionGradient}
                >
                    <Ionicons name="trophy" size={22} color="#FFFFFF" />
                </LinearGradient>
                <Text style={[styles.quickActionText, isDark && styles.darkText]}>Results</Text>
                  <Text style={styles.quickActionSubtext}>Academic performance</Text>
              </TouchableOpacity>
              </View>

              {/* Row 6: Progress & Modules */}
              <View style={styles.quickActionRow}>
              <TouchableOpacity
                  style={[styles.quickActionCard, isDark && styles.darkCard]}
                  onPress={() => setShowProgressTracker(true)}
                activeOpacity={0.8}
              >
                <LinearGradient
                    colors={['#F59E0B', '#D97706']}
                  style={styles.quickActionGradient}
                >
                    <Ionicons name="trending-up" size={22} color="#FFFFFF" />
                </LinearGradient>
                  <Text style={[styles.quickActionText, isDark && styles.darkText]}>Progress</Text>
                  <Text style={styles.quickActionSubtext}>Track learning</Text>
              </TouchableOpacity>

              <TouchableOpacity
                  style={[styles.quickActionCard, isDark && styles.darkCard]}
                  onPress={() => setShowSemesterModules(true)}
                activeOpacity={0.8}
              >
                <LinearGradient
                    colors={['#06B6D4', '#0891B2']}
                  style={styles.quickActionGradient}
                >
                    <Ionicons name="library" size={22} color="#FFFFFF" />
                </LinearGradient>
                <Text style={[styles.quickActionText, isDark && styles.darkText]}>Modules</Text>
                  <Text style={styles.quickActionSubtext}>Semester courses</Text>
              </TouchableOpacity>

              <TouchableOpacity
                  style={[styles.quickActionCard, isDark && styles.darkCard]}
                  onPress={() => setShowWeekendActivities(true)}
                activeOpacity={0.8}
              >
                <LinearGradient
                    colors={['#EC4899', '#BE185D']}
                  style={styles.quickActionGradient}
                >
                    <Ionicons name="sunny" size={22} color="#FFFFFF" />
                </LinearGradient>
                  <Text style={[styles.quickActionText, isDark && styles.darkText]}>Weekend</Text>
                  <Text style={styles.quickActionSubtext}>Study activities</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>

          {/* Additional Student Features */}
          <View style={[styles.section, isDark && styles.darkSection]}>
            <Text style={[styles.sectionTitle, isDark && styles.darkText]}>📚 Academic Tools</Text>
            <View style={styles.additionalFeaturesGrid}>
              <TouchableOpacity 
                style={[styles.additionalFeatureCard, isDark && styles.darkCard]}
                onPress={() => navigation.navigate('GroupDiscussion')}
              >
                <LinearGradient
                  colors={['#EC4899', '#BE185D']}
                  style={styles.additionalFeatureGradient}
                >
                  <Ionicons name="people-circle" size={24} color="#FFFFFF" />
                  <Text style={styles.additionalFeatureText}>Group Discussion</Text>
                </LinearGradient>
              </TouchableOpacity>

              <TouchableOpacity 
                style={[styles.additionalFeatureCard, isDark && styles.darkCard]}
                onPress={() => navigation.navigate('StayUpdated')}
              >
                <LinearGradient
                  colors={['#10B981', '#059669']}
                  style={styles.additionalFeatureGradient}
                >
                  <Ionicons name="notifications-circle" size={24} color="#FFFFFF" />
                  <Text style={styles.additionalFeatureText}>Stay Updated</Text>
                </LinearGradient>
              </TouchableOpacity>

              <TouchableOpacity 
                style={[styles.additionalFeatureCard, isDark && styles.darkCard]}
                onPress={() => navigation.navigate('MaterialsAndTime')}
              >
                <LinearGradient
                  colors={['#F59E0B', '#D97706']}
                  style={styles.additionalFeatureGradient}
                >
                  <Ionicons name="time" size={24} color="#FFFFFF" />
                  <Text style={styles.additionalFeatureText}>Materials & Time</Text>
                </LinearGradient>
              </TouchableOpacity>

              <TouchableOpacity 
                style={[styles.additionalFeatureCard, isDark && styles.darkCard]}
                onPress={() => navigation.navigate('GradeBook')}
              >
                <LinearGradient
                  colors={['#8B5CF6', '#7C3AED']}
                  style={styles.additionalFeatureGradient}
                >
                  <Ionicons name="book" size={24} color="#FFFFFF" />
                  <Text style={styles.additionalFeatureText}>Grade Book</Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          </View>

          {/* My Courses */}
          {user.userType === 'student' && (
            <View style={[styles.section, isDark && styles.darkSection]}>
              <View style={styles.sectionHeader}>
                <Text style={[styles.sectionTitle, isDark && styles.darkText]}>My Courses</Text>
                <TouchableOpacity>
                  <Text style={styles.seeAllText}>See All</Text>
                </TouchableOpacity>
              </View>
              
              <FlatList
                data={currentLevelModules.slice(0, 5)}
                renderItem={renderModernCourseCard}
                keyExtractor={(item) => item.code}
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.coursesList}
              />
            </View>
          )}

          {/* Achievements & Progress */}
          <View style={[styles.section, isDark && styles.darkSection]}>
            <View style={styles.sectionHeader}>
              <Text style={[styles.sectionTitle, isDark && styles.darkText]}>🏆 Achievements & Progress</Text>
              <TouchableOpacity onPress={() => Alert.alert('🎖️ Achievement Center', 'Track your academic progress and unlock rewards!\n\n📊 Progress Overview:\n• Chat Activity: Master Communicator\n• Study Sessions: Focus Champion\n• Course Performance: Academic Star\n• Community: Team Player\n\n🎯 Keep engaging to unlock more achievements!')}>
                <Text style={styles.seeAllText}>View All</Text>
              </TouchableOpacity>
            </View>

            {/* Achievement Progress Summary */}
            <View style={[styles.achievementSummary, isDark && styles.darkCard]}>
              <LinearGradient
                colors={isDark ? ['#1E293B', '#334155'] : ['#4F46E5', '#7C3AED']}
                style={styles.achievementSummaryGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
              >
                <View style={styles.achievementStats}>
                  <View style={styles.achievementStat}>
                    <Text style={[styles.achievementStatNumber, isDark && styles.darkText]}>
                      {achievementProgress?.earned || (achievements.length > 0 ? achievements.length : 4)}
                    </Text>
                    <Text style={[styles.achievementStatLabel, isDark && styles.darkText]}>Earned</Text>
                  </View>
                  <View style={styles.achievementStat}>
                    <Text style={[styles.achievementStatNumber, isDark && styles.darkText]}>
                      {userStats?.totalPoints || (achievements.length > 0 ? achievements.reduce((sum, a) => sum + (a.points || 50), 0) : 185)}
                    </Text>
                    <Text style={[styles.achievementStatLabel, isDark && styles.darkText]}>Points</Text>
                  </View>
                  <View style={styles.achievementStat}>
                    <Text style={[styles.achievementStatNumber, isDark && styles.darkText]}>
                      {achievementProgress?.percentage || 65}%
                    </Text>
                    <Text style={[styles.achievementStatLabel, isDark && styles.darkText]}>Progress</Text>
                  </View>
                </View>
                
                <View style={styles.levelProgress}>
                  <Text style={[styles.levelText, isDark && styles.darkText]}>
                    Level {Math.floor((userStats?.totalPoints || 185) / 100) + 1} • {((userStats?.totalPoints || 185) % 100)} XP to next level
                  </Text>
                  <View style={styles.levelProgressBar}>
                    <View 
                      style={[
                        styles.levelProgressFill, 
                        { width: `${((userStats?.totalPoints || 185) % 100)}%` }
                      ]} 
                    />
                  </View>
                </View>
              </LinearGradient>
            </View>
            
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <View style={styles.achievementsRow}>
                {achievements.length > 0 ? (
                  achievements.map((achievement, index) => (
                    <TouchableOpacity 
                      key={achievement.id}
                      style={[
                        styles.achievementCard,
                        isDark && styles.darkCard
                      ]}
                      onPress={() => {
                        Vibration.vibrate(50);
                        Alert.alert(
                          'Achievement Unlocked! 🏆', 
                          `${achievement.icon} ${achievement.title}\n\n${achievement.description}\n\n+${achievement.points} points`
                        );
                      }}
                      activeOpacity={0.8}
                    >
                      <View style={[
                        styles.achievementIcon,
                        { backgroundColor: achievement.rarity === 'epic' ? '#8B5CF620' : 
                                           achievement.rarity === 'rare' ? '#F59E0B20' : 
                                           '#10B98120' }
                      ]}>
                        <Text style={{ fontSize: 24 }}>
                          {achievement.icon}
                        </Text>
                      </View>
                      <Text style={[
                        styles.achievementText,
                        isDark && styles.darkText
                      ]}>
                        {achievement.title}
                      </Text>
                      <View style={styles.achievementBadge}>
                        <Ionicons name="checkmark" size={12} color="#FFFFFF" />
                      </View>
                    </TouchableOpacity>
                  ))
                ) : (
                  // Enhanced sample achievements with categories
                  [
                    { id: 1, title: 'First Steps', icon: '🎯', points: 10, rarity: 'common', category: 'starter', description: 'Welcome to UniConnect! Your academic journey begins here.' },
                    { id: 2, title: 'Chat Master', icon: '💬', points: 25, rarity: 'uncommon', category: 'communication', description: 'Sent 50 messages in course chats. Great communication!' },
                    { id: 3, title: 'Study Streak', icon: '🔥', points: 50, rarity: 'rare', category: 'study', description: '7-day study streak! You\'re on fire!' },
                    { id: 4, title: 'Course Hero', icon: '🏆', points: 100, rarity: 'epic', category: 'academic', description: 'Achieved 90%+ in 3 courses. Exceptional performance!' },
                    { id: 5, title: 'Team Player', icon: '🤝', points: 30, rarity: 'uncommon', category: 'social', description: 'Joined 5 study groups. Collaboration is key!' },
                    { id: 6, title: 'Early Bird', icon: '🌅', points: 20, rarity: 'common', category: 'habit', description: 'Logged in before 8 AM for 5 days straight!' },
                    { id: 7, title: 'Weekend Warrior', icon: '⚔️', points: 40, rarity: 'rare', category: 'dedication', description: 'Attended weekend study sessions 3 times!' }
                  ].map((achievement, index) => (
                    <TouchableOpacity 
                      key={achievement.id}
                      style={[
                        styles.achievementCard,
                        isDark && styles.darkCard
                      ]}
                      onPress={() => {
                        Vibration.vibrate(50);
                        Alert.alert(
                          `🎉 ${achievement.title}`, 
                          `${achievement.icon} ${achievement.description}\n\n🏅 Category: ${achievement.category.charAt(0).toUpperCase() + achievement.category.slice(1)}\n💎 Rarity: ${achievement.rarity.charAt(0).toUpperCase() + achievement.rarity.slice(1)}\n⭐ Points: +${achievement.points} XP\n\nKeep up the great work!`
                        );
                      }}
                      activeOpacity={0.8}
                    >
                      <View style={[
                        styles.achievementIcon,
                        { backgroundColor: achievement.rarity === 'epic' ? '#8B5CF620' : 
                                           achievement.rarity === 'rare' ? '#F59E0B20' : 
                                           '#10B98120' }
                      ]}>
                        <Text style={{ fontSize: 24 }}>
                          {achievement.icon}
                        </Text>
                      </View>
                      <Text style={[
                        styles.achievementText,
                        isDark && styles.darkText
                      ]}>
                        {achievement.title}
                      </Text>
                      <View style={styles.achievementBadge}>
                        <Ionicons name="checkmark" size={12} color="#FFFFFF" />
                      </View>
                    </TouchableOpacity>
                  ))
                )}
              </View>
            </ScrollView>
          </View>

          {/* Academic Progress & Credits */}
          {user.userType === 'student' && (
            <View style={[styles.section, isDark && styles.darkSection]}>
              <View style={styles.sectionHeader}>
                <Text style={[styles.sectionTitle, isDark && styles.darkText]}>📚 Academic Progress</Text>
                <TouchableOpacity onPress={() => navigation.navigate('AcademicOverview')}>
                  <Text style={styles.seeAllText}>View Details</Text>
                </TouchableOpacity>
              </View>

              <View style={styles.academicStatsContainer}>
                <View style={[styles.academicStatCard, isDark && styles.darkCard]}>
                  <LinearGradient colors={['#10B981', '#059669']} style={styles.academicStatGradient}>
                    <Ionicons name="book-outline" size={24} color="#FFFFFF" />
                    <Text style={styles.academicStatNumber}>{csModules?.length || 0}</Text>
                    <Text style={styles.academicStatLabel}>Courses</Text>
                  </LinearGradient>
                </View>

                <View style={[styles.academicStatCard, isDark && styles.darkCard]}>
                  <LinearGradient colors={['#8B5CF6', '#7C3AED']} style={styles.academicStatGradient}>
                    <Ionicons name="school-outline" size={24} color="#FFFFFF" />
                    <Text style={styles.academicStatNumber}>
                      {csModules?.reduce((total, course) => total + (course.credits || 3), 0) || 0}
                    </Text>
                    <Text style={styles.academicStatLabel}>Credits</Text>
                  </LinearGradient>
                </View>

                <View style={[styles.academicStatCard, isDark && styles.darkCard]}>
                  <LinearGradient colors={['#F59E0B', '#D97706']} style={styles.academicStatGradient}>
                    <Ionicons name="trending-outline" size={24} color="#FFFFFF" />
                    <Text style={styles.academicStatNumber}>3.45</Text>
                    <Text style={styles.academicStatLabel}>CGPA</Text>
                  </LinearGradient>
                </View>

                <View style={[styles.academicStatCard, isDark && styles.darkCard]}>
                  <LinearGradient colors={['#EF4444', '#DC2626']} style={styles.academicStatGradient}>
                    <Ionicons name="calendar-outline" size={24} color="#FFFFFF" />
                    <Text style={styles.academicStatNumber}>{user?.academicLevel || '300'}</Text>
                    <Text style={styles.academicStatLabel}>Level</Text>
                  </LinearGradient>
                </View>
              </View>

              {/* Semester Credit Breakdown */}
              <View style={[styles.semesterBreakdown, isDark && styles.darkCard]}>
                <Text style={[styles.semesterTitle, isDark && styles.darkText]}>Credit Hours Breakdown</Text>
                <View style={styles.semesterRow}>
                  <View style={styles.semesterColumn}>
                    <Text style={[styles.semesterLabel, isDark && styles.darkText]}>Semester 1</Text>
                    <Text style={[styles.semesterCredits, isDark && styles.darkText]}>
                      {csModules?.filter(module => module.semester === 1)
                        .reduce((total, course) => total + (course.credits || 3), 0) || 0} Credits
                    </Text>
                    <Text style={[styles.semesterCourses, isDark && styles.darkText]}>
                      {csModules?.filter(module => module.semester === 1).length || 0} Courses
                    </Text>
                  </View>
                  <View style={styles.semesterDivider} />
                  <View style={styles.semesterColumn}>
                    <Text style={[styles.semesterLabel, isDark && styles.darkText]}>Semester 2</Text>
                    <Text style={[styles.semesterCredits, isDark && styles.darkText]}>
                      {csModules?.filter(module => module.semester === 2)
                        .reduce((total, course) => total + (course.credits || 3), 0) || 0} Credits
                    </Text>
                    <Text style={[styles.semesterCourses, isDark && styles.darkText]}>
                      {csModules?.filter(module => module.semester === 2).length || 0} Courses
                    </Text>
                  </View>
                </View>
              </View>
            </View>
          )}

          {/* Recent Activity */}
                      <View style={[styles.section, isDark && styles.darkSection]}>
            <View style={styles.sectionHeader}>
              <Text style={[styles.sectionTitle, isDark && styles.darkText]}>📋 Recent Activity</Text>
              <TouchableOpacity onPress={() => navigation.navigate('Notifications')}>
                <Text style={styles.seeAllText}>View All</Text>
              </TouchableOpacity>
            </View>
            
            {notifications.slice(0, 3).map((notification, index) => (
              <TouchableOpacity 
                key={notification.id}
                style={[styles.activityCard, isDark && styles.darkCard]}
                onPress={() => navigation.navigate('Notifications')}
                activeOpacity={0.8}
              >
                <View style={styles.activityContent}>
                  <View style={[
                    styles.activityIcon,
                    { backgroundColor: notification.read ? '#F1F5F9' : '#EEF2FF' }
                  ]}>
                    <Ionicons 
                      name={notification.type === 'assignment' ? 'document-text' : 
                            notification.type === 'material' ? 'book' : 
                            notification.type === 'exam' ? 'school' : 'megaphone'} 
                      size={20} 
                      color={notification.read ? '#64748B' : '#4F46E5'} 
                    />
                  </View>
                  
                  <View style={styles.activityDetails}>
                    <Text style={[styles.activityTitle, isDark && styles.darkText]} numberOfLines={1}>
                      {notification.title}
                    </Text>
                    <Text style={[styles.activityMessage, isDark && styles.darkText]} numberOfLines={2}>
                      {notification.message}
                    </Text>
                    <Text style={[styles.activityTime, isDark && styles.darkText]}>
                      {new Date(notification.timestamp).toLocaleDateString()}
                    </Text>
                  </View>
                  
                  {!notification.read && <View style={styles.unreadDot} />}
                </View>
              </TouchableOpacity>
            ))}
          </View>

          {/* Bottom Spacing */}
          <View style={{ height: 120 }} />
        </ScrollView>
      </Animated.View>

      {/* Modern Floating Action Button — opens Quick Actions modal */}
      <TouchableOpacity 
        style={styles.fab}
        onPress={() => { Vibration.vibrate(50); setShowQuickActionsModal(true); }}
        activeOpacity={0.8}
      >
        <LinearGradient
          colors={isDark ? ['#1E293B', '#334155'] : ['#6366F1', '#8B5CF6']}
          style={styles.fabGradient}
        >
          <Ionicons name="add" size={28} color="#FFFFFF" />
        </LinearGradient>
      </TouchableOpacity>

      {/* Quick Actions Modal — all actions with icons */}
      <Modal
        visible={showQuickActionsModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowQuickActionsModal(false)}
      >
        <Pressable style={styles.quickActionsOverlay} onPress={() => setShowQuickActionsModal(false)}>
          <View style={[styles.quickActionsSheet, isDark && styles.quickActionsSheetDark]} onStartShouldSetResponder={() => true}>
            <View style={styles.quickActionsHandle} />
            <Text style={[styles.quickActionsTitle, isDark && styles.darkText]}>Quick Actions</Text>
            <ScrollView showsVerticalScrollIndicator={false} style={styles.quickActionsScroll}>
              {[
                { id: 'studyGroup', icon: 'people', label: 'Create Study Group', sub: 'Invite coursemates', onPress: createStudyGroup, colors: ['#6366F1', '#8B5CF6'] },
                { id: 'reminder', icon: 'alarm', label: 'Set Reminder', sub: 'Assignments & classes', onPress: setReminder, colors: ['#F59E0B', '#D97706'] },
                { id: 'pomodoro', icon: 'timer', label: 'Start Pomodoro', sub: 'Focus timer', onPress: startPomodoroTimer, colors: ['#10B981', '#059669'] },
                { id: 'privateMsg', icon: 'chatbubble-ellipses', label: 'Private Message', sub: 'Direct chat', onPress: () => { setShowQuickActionsModal(false); navigation.navigate('PrivateMessaging'); }, colors: ['#EC4899', '#BE185D'] },
                { id: 'courseRep', icon: 'ribbon', label: 'Course Rep', sub: 'Representatives', onPress: () => { setShowQuickActionsModal(false); navigation.navigate('CourseRepresentative'); }, colors: ['#8B5CF6', '#7C3AED'] },
                { id: 'acadOverview', icon: 'school', label: 'Academic Overview', sub: 'Grades & progress', onPress: () => { setShowQuickActionsModal(false); navigation.navigate('AcademicOverview'); }, colors: ['#3B82F6', '#2563EB'] },
                { id: 'acadCalendar', icon: 'calendar', label: 'Academic Calendar', sub: 'Events & deadlines', onPress: () => { setShowQuickActionsModal(false); navigation.navigate('AcademicCalendar'); }, colors: ['#EC4899', '#8B5CF6'] },
                { id: 'profile', icon: 'person', label: 'View Profile', sub: 'Your account', onPress: () => { setShowQuickActionsModal(false); navigation.navigate('Profile'); }, colors: ['#64748B', '#475569'] },
                { id: 'modules', icon: 'library', label: 'View Modules', sub: 'Semester courses', onPress: () => { setShowQuickActionsModal(false); setShowSemesterModules(true); }, colors: ['#059669', '#047857'] },
              ].map((action) => (
                <TouchableOpacity
                  key={action.id}
                  style={[styles.quickActionRow, isDark && styles.quickActionRowDark]}
                  onPress={action.onPress}
                  activeOpacity={0.7}
                >
                  <LinearGradient colors={action.colors} style={styles.quickActionRowIcon}>
                    <Ionicons name={action.icon} size={22} color="#FFFFFF" />
                  </LinearGradient>
                  <View style={styles.quickActionRowText}>
                    <Text style={[styles.quickActionRowLabel, isDark && styles.darkText]}>{action.label}</Text>
                    <Text style={[styles.quickActionRowSub, isDark && styles.quickActionRowSubDark]}>{action.sub}</Text>
                  </View>
                  <Ionicons name="chevron-forward" size={20} color={isDark ? '#94A3B8' : '#64748B'} />
                </TouchableOpacity>
              ))}
            </ScrollView>
            <TouchableOpacity style={[styles.quickActionsCancel, isDark && styles.quickActionsCancelDark]} onPress={() => setShowQuickActionsModal(false)}>
              <Text style={[styles.quickActionsCancelText, isDark && styles.darkText]}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </Pressable>
      </Modal>

      {/* Study Group Picker Modal — choose course to create group */}
      <Modal visible={showStudyGroupPicker} transparent animationType="fade">
        <Pressable style={styles.quickActionsOverlay} onPress={() => setShowStudyGroupPicker(false)}>
          <View style={[styles.studyGroupPickerCard, isDark && styles.quickActionsSheetDark]} onStartShouldSetResponder={() => true}>
            <Text style={[styles.studyGroupPickerTitle, isDark && styles.darkText]}>Create Study Group 👥</Text>
            <Text style={[styles.studyGroupPickerSub, isDark && styles.quickActionRowSubDark]}>Choose a course</Text>
            <ScrollView style={styles.studyGroupPickerList} showsVerticalScrollIndicator={false}>
              {coursesList.map((course) => (
                <TouchableOpacity
                  key={course.code}
                  style={[styles.studyGroupPickerItem, isDark && styles.quickActionRowDark]}
                  onPress={() => confirmStudyGroup(course)}
                  activeOpacity={0.7}
                >
                  <View style={[styles.studyGroupPickerItemDot, { backgroundColor: course.color || '#6366F1' }]} />
                  <Text style={[styles.studyGroupPickerItemCode, isDark && styles.darkText]}>{course.code}</Text>
                  <Text style={[styles.studyGroupPickerItemName, isDark && styles.quickActionRowSubDark]} numberOfLines={1}>{course.name}</Text>
                  <Ionicons name="chevron-forward" size={18} color={isDark ? '#94A3B8' : '#64748B'} />
                </TouchableOpacity>
              ))}
            </ScrollView>
            <TouchableOpacity style={[styles.quickActionsCancel, isDark && styles.quickActionsCancelDark]} onPress={() => setShowStudyGroupPicker(false)}>
              <Text style={[styles.quickActionsCancelText, isDark && styles.darkText]}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </Pressable>
      </Modal>

      {/* Set Reminder Picker Modal */}
      <Modal visible={showReminderPicker} transparent animationType="fade">
        <Pressable style={styles.quickActionsOverlay} onPress={() => setShowReminderPicker(false)}>
          <View style={[styles.studyGroupPickerCard, isDark && styles.quickActionsSheetDark]} onStartShouldSetResponder={() => true}>
            <Text style={[styles.studyGroupPickerTitle, isDark && styles.darkText]}>Set Reminder ⏰</Text>
            <Text style={[styles.studyGroupPickerSub, isDark && styles.quickActionRowSubDark]}>What would you like to be reminded about?</Text>
            {[
              { type: 'assignment', title: 'Reminder Set! ✅', message: "You'll be reminded about upcoming assignment deadlines.", icon: 'document-text', colors: ['#3B82F6', '#2563EB'] },
              { type: 'study', title: 'Study Reminder Set! 📚', message: "Daily study reminder enabled. You'll get notifications to maintain your streak.", icon: 'book', colors: ['#10B981', '#059669'] },
              { type: 'class', title: 'Class Reminder Set! 🎓', message: "You'll be reminded 15 minutes before each class starts.", icon: 'calendar', colors: ['#8B5CF6', '#7C3AED'] },
            ].map((r) => (
              <TouchableOpacity
                key={r.type}
                style={[styles.quickActionRow, isDark && styles.quickActionRowDark]}
                onPress={() => confirmReminder(r.type, r.title, r.message)}
                activeOpacity={0.7}
              >
                <LinearGradient colors={r.colors} style={styles.quickActionRowIcon}>
                  <Ionicons name={r.icon} size={22} color="#FFFFFF" />
                </LinearGradient>
                <View style={styles.quickActionRowText}>
                  <Text style={[styles.quickActionRowLabel, isDark && styles.darkText]}>
                    {r.type === 'assignment' ? 'Assignment Due' : r.type === 'study' ? 'Study Session' : 'Class Schedule'}
                  </Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color={isDark ? '#94A3B8' : '#64748B'} />
              </TouchableOpacity>
            ))}
            <TouchableOpacity style={[styles.quickActionsCancel, isDark && styles.quickActionsCancelDark]} onPress={() => setShowReminderPicker(false)}>
              <Text style={[styles.quickActionsCancelText, isDark && styles.darkText]}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </Pressable>
      </Modal>

      {/* Amazing New Features Modals */}
      <AIStudyAssistant 
        visible={showAIAssistant}
        onClose={() => setShowAIAssistant(false)}
        course={selectedCourse}
      />

      <SmartNoteTaking
        visible={showSmartNotes}
        onClose={() => setShowSmartNotes(false)}
        course={selectedCourse}
      />

      <GamifiedProgress
        visible={showProgress}
        onClose={() => setShowProgress(false)}
        user={user}
        courses={csModules}
      />

      <ARStudyMode
        visible={showARMode}
        onClose={() => setShowARMode(false)}
        course={selectedCourse}
        topic="Interactive Learning"
      />

      <EnhancedVoiceCall
        visible={showVoiceCall}
        onClose={() => setShowVoiceCall(false)}
        participant={callParticipant}
        onCallEnd={() => setShowVoiceCall(false)}
      />

      <AIQuizGenerator
        visible={showQuizGenerator}
        onClose={() => setShowQuizGenerator(false)}
        course={selectedCourse}
        topic="AI-Generated Questions"
      />

      <SmartScheduleOptimizer
        visible={showScheduleOptimizer}
        onClose={() => setShowScheduleOptimizer(false)}
        user={user}
        courses={csModules}
      />

      {/* 🌟 Welcome Guide for Discovering Amazing Features */}
      <FeatureWelcomeGuide
        visible={showWelcomeGuide}
        onClose={() => setShowWelcomeGuide(false)}
        userType="student"
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

      {/* 🎯 Progress Tracker Modal */}
      <ProgressTracker
        visible={showProgressTracker}
        onClose={() => setShowProgressTracker(false)}
        user={user}
        courses={csModules}
      />

      {/* 📚 Semester Modules Modal */}
      <SemesterModules
        visible={showSemesterModules}
        onClose={() => setShowSemesterModules(false)}
        user={user}
        courses={csModules}
      />

      {/* 🎮 Game Center Modal */}
      <GameCenter
        visible={showGameCenter}
        onClose={() => setShowGameCenter(false)}
        user={user}
      />

      {/* 🎯 Focus Mode Modal */}
      <FocusMode
        visible={showFocusMode}
        onClose={() => setShowFocusMode(false)}
        user={user}
      />

      {/* 🌅 Weekend Activities Modal */}
      <WeekendActivities
        visible={showWeekendActivities}
        onClose={() => setShowWeekendActivities(false)}
        user={user}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  darkContainer: {
    backgroundColor: '#0F0F23',
  },
  darkText: {
    color: '#FFFFFF',
  },
  darkCard: {
    backgroundColor: '#1E293B',
    borderColor: '#334155',
  },
  darkSection: {
    backgroundColor: '#1E293B',
  },
  darkGradient: {
    backgroundColor: '#1E293B',
  },
  darkBorder: {
    borderColor: '#334155',
  },
  darkBackground: {
    backgroundColor: '#0F172A',
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
  },
  loadingCard: {
    padding: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
    marginTop: 16,
  },

  // Modern Header
  modernHeader: {
    paddingTop: 20,
    paddingHorizontal: 20,
    paddingBottom: 30,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 24,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  avatarContainer: {
    position: 'relative',
    marginRight: 16,
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  avatarText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  onlineIndicator: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: '#10B981',
    borderWidth: 3,
    borderColor: '#FFFFFF',
  },
  userDetails: {
    flex: 1,
  },
  welcomeText: {
    fontSize: 18,
    color: '#FFFFFF',
    fontWeight: '600',
    marginBottom: 6,
    textShadowColor: 'rgba(0, 0, 0, 0.2)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  userName: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FCD34D',
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },

  greetingSection: {
    marginBottom: 12,
  },
  credentialsSection: {
    marginTop: 8,
  },
  credentialRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    paddingHorizontal: 0,
  },
  credentialItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flexShrink: 1,
  },
  credentialText: {
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.9)',
    fontWeight: '600',
    lineHeight: 18,
  },
  credentialSeparator: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.35)',
    marginHorizontal: 8,
    fontWeight: '400',
    marginTop: 1,
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
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  discoverButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  discoverButtonText: {
    fontSize: 14,
    color: '#FFFFFF',
    fontWeight: '700',
    marginLeft: 6,
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  themeToggle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  notificationButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  notificationBadge: {
    position: 'absolute',
    top: -2,
    right: -2,
    backgroundColor: '#EF4444',
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  notificationBadgeText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },

  // Stats Section
  statsSection: {
    marginTop: 16,
  },
  statsSectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 12,
    textAlign: 'center',
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  // Stats Container
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 10,
  },
  statCard: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statNumber: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginTop: 6,
  },
  statLabel: {
    fontSize: 11,
    color: 'rgba(255, 255, 255, 0.8)',
    marginTop: 3,
  },
  progressContainer: {
    alignItems: 'center',
  },
  progressLabel: {
    fontSize: 11,
    color: 'rgba(255, 255, 255, 0.8)',
    marginBottom: 6,
  },
  circularProgress: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  progressPercentage: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },



  // Sections
  section: {
    paddingHorizontal: 20,
    marginTop: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1E293B',
  },
  darkText: {
    color: '#FFFFFF',
  },
  seeAllText: {
    fontSize: 14,
    color: '#6366F1',
    fontWeight: '600',
  },

  // Quick Actions
  quickActionsGrid: {
    flexDirection: 'column',
    gap: 16,
  },
  quickActionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  quickActionCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  darkCard: {
    backgroundColor: '#1A1A2E',
  },
  quickActionGradient: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  quickActionText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#1E293B',
    textAlign: 'center',
    marginBottom: 2,
  },
  quickActionSubtext: {
    fontSize: 10,
    color: '#64748B',
    textAlign: 'center',
    fontWeight: '400',
  },

  // Courses
  coursesList: {
    paddingRight: 20,
  },
  modernCourseCard: {
    width: 280,
    marginRight: 16,
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 15,
    elevation: 8,
  },
  courseGradient: {
    padding: 20,
    height: 160,
    justifyContent: 'space-between',
  },
  courseHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },

  courseCode: {
    fontSize: 14,
    fontWeight: '600',
    color: 'rgba(255, 255, 255, 0.9)',
  },
  courseBadge: {
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  courseBadgeText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  courseName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
    lineHeight: 24,
  },
  courseFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  courseProgress: {
    flex: 1,
    marginRight: 12,
  },
  progressBar: {
    height: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 2,
    marginBottom: 4,
  },
  progressFill: {
    height: 4,
    backgroundColor: '#FFFFFF',
    borderRadius: 2,
  },
  progressText: {
    fontSize: 10,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  courseAction: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },

  // Achievements
  achievementsRow: {
    flexDirection: 'row',
    paddingRight: 20,
  },
  achievementCard: {
    width: 120,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    marginRight: 12,
    position: 'relative',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  achievementLocked: {
    opacity: 0.6,
  },
  achievementIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  achievementText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#1E293B',
    textAlign: 'center',
  },
  achievementTextLocked: {
    color: '#94A3B8',
  },
  achievementBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#10B981',
    justifyContent: 'center',
    alignItems: 'center',
  },
  
  // Achievement Summary Styles
  achievementSummary: {
    marginBottom: 20,
    borderRadius: 16,
    overflow: 'hidden',
  },
  achievementSummaryGradient: {
    padding: 20,
  },
  achievementStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  achievementStat: {
    alignItems: 'center',
  },
  achievementStatNumber: {
    fontSize: 24,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  achievementStatLabel: {
    fontSize: 12,
    color: '#E2E8F0',
    textAlign: 'center',
  },
  levelProgress: {
    marginTop: 8,
  },
  levelText: {
    fontSize: 14,
    color: '#E2E8F0',
    marginBottom: 8,
    textAlign: 'center',
  },
  levelProgressBar: {
    height: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 4,
    overflow: 'hidden',
  },
  levelProgressFill: {
    height: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: 4,
  },

  // Academic Progress Styles
  academicStatsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 20,
  },
  academicStatCard: {
    flex: 1,
    minWidth: (width - 64) / 2,
    borderRadius: 16,
    overflow: 'hidden',
  },
  academicStatGradient: {
    padding: 16,
    alignItems: 'center',
    minHeight: 100,
    justifyContent: 'center',
  },
  academicStatNumber: {
    fontSize: 24,
    fontWeight: '700',
    color: '#FFFFFF',
    marginTop: 8,
    marginBottom: 4,
  },
  academicStatLabel: {
    fontSize: 12,
    color: '#E2E8F0',
    textAlign: 'center',
    fontWeight: '600',
  },
  semesterBreakdown: {
    backgroundColor: '#F8FAFC',
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  semesterTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1E293B',
    marginBottom: 16,
    textAlign: 'center',
  },
  semesterRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  semesterColumn: {
    flex: 1,
    alignItems: 'center',
  },
  semesterDivider: {
    width: 1,
    height: 60,
    backgroundColor: '#E2E8F0',
    marginHorizontal: 20,
  },
  semesterLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#64748B',
    marginBottom: 8,
  },
  semesterCredits: {
    fontSize: 18,
    fontWeight: '700',
    color: '#4F46E5',
    marginBottom: 4,
  },
  semesterCourses: {
    fontSize: 12,
    color: '#94A3B8',
  },

  // Activity
  activityCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  activityContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  activityIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  activityDetails: {
    flex: 1,
  },
  activityTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1E293B',
    marginBottom: 2,
  },
  activityMessage: {
    fontSize: 14,
    color: '#64748B',
    marginBottom: 4,
  },
  activityTime: {
    fontSize: 12,
    color: '#94A3B8',
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#6366F1',
  },

  // FAB
  fab: {
    position: 'absolute',
    bottom: 30,
    right: 20,
    width: 64,
    height: 64,
    borderRadius: 32,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 15,
    elevation: 8,
  },
  fabGradient: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },

  // Quick Actions Modal
  quickActionsOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  quickActionsSheet: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 20,
    paddingBottom: 34,
    maxHeight: height * 0.75,
  },
  quickActionsSheetDark: {
    backgroundColor: '#1E293B',
  },
  quickActionsHandle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#CBD5E1',
    alignSelf: 'center',
    marginTop: 12,
    marginBottom: 8,
  },
  quickActionsTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#1E293B',
    marginBottom: 16,
    textAlign: 'center',
  },
  quickActionsScroll: {
    maxHeight: height * 0.5,
  },
  quickActionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 14,
    marginBottom: 10,
  },
  quickActionRowDark: {
    backgroundColor: '#334155',
  },
  quickActionRowIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  quickActionRowText: { flex: 1 },
  quickActionRowLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1E293B',
  },
  quickActionRowSub: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
  },
  quickActionRowSubDark: {
    color: '#94A3B8',
  },
  quickActionsCancel: {
    marginTop: 12,
    paddingVertical: 14,
    borderRadius: 14,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
  },
  quickActionsCancelDark: {
    backgroundColor: '#334155',
  },
  quickActionsCancelText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#64748B',
  },
  studyGroupPickerCard: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 20,
    marginBottom: 80,
    borderRadius: 20,
    padding: 20,
    maxHeight: height * 0.6,
  },
  studyGroupPickerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1E293B',
    marginBottom: 4,
  },
  studyGroupPickerSub: {
    fontSize: 14,
    color: '#64748B',
    marginBottom: 16,
  },
  studyGroupPickerList: {
    maxHeight: height * 0.35,
  },
  studyGroupPickerItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: 12,
    marginBottom: 8,
  },
  studyGroupPickerItemDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 12,
  },
  studyGroupPickerItemCode: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1E293B',
    marginRight: 8,
  },
  studyGroupPickerItemName: {
    flex: 1,
    fontSize: 13,
    color: '#64748B',
  },

  // Profile Section Styles
  profileSection: {
    marginBottom: 24,
    paddingHorizontal: 20,
  },
  profileCard: {
    borderRadius: 20,
    overflow: 'hidden',
  },
  profileGradient: {
    padding: 20,
  },
  profileContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  profileAvatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  profileAvatarText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  profileInfo: {
    flex: 1,
  },
  profileName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  profileRole: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.9)',
    marginBottom: 2,
  },
  profileDetails: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.8)',
  },



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
});
