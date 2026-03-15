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
  PanResponder,
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
import MindMap from '../components/MindMap';
import KnowledgeTree from '../components/KnowledgeTree';
import GlobalUniversityHub from '../components/GlobalUniversityHub';
import PeerCommunityHub from '../components/PeerCommunityHub';

const { width, height } = Dimensions.get('window');

export default function ModernHomeDashboard({ navigation }) {
  const { csModules, notifications, user } = useApp();
  const { isDark, toggleTheme: toggleGlobalTheme } = useTheme();
  
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
  const [showIdModal, setShowIdModal] = useState(false);
  const [showHubDetail, setShowHubDetail] = useState(false);
  const [selectedHubCategory, setSelectedHubCategory] = useState(null);
  const [showGlobalHub, setShowGlobalHub] = useState(false);
  const [showPeerHub, setShowPeerHub] = useState(false);
  const [showResourceDetail, setShowResourceDetail] = useState(false);
  const [selectedResource, setSelectedResource] = useState(null);
  const [pulseMessage, setPulseMessage] = useState("University News: New research grant announced for CS students...");
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
  
  // Draggable Floating Buttons
  const pan = useRef(new Animated.ValueXY({ x: 0, y: 0 })).current;
  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: () => {
        pan.setOffset({
          x: pan.x._value,
          y: pan.y._value
        });
      },
      onPanResponderMove: Animated.event(
        [null, { dx: pan.x, dy: pan.y }],
        { useNativeDriver: false }
      ),
      onPanResponderRelease: () => {
        pan.flattenOffset();
      }
    })
  ).current;
  
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
            colors={isDark ? ['#020617', '#1E1B4B'] : ['#4F46E5', '#818CF8']}
            style={styles.loadingCard}
          >
            <Ionicons name="school" size={48} color="#FFFFFF" />
            <Text style={styles.loadingText}>UniConnect</Text>
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

  const toggleLocalTheme = () => {
    toggleGlobalTheme();
    Vibration.vibrate(50);
  };

  // Global Pulse simulation
  useEffect(() => {
    const pulses = [
      "University News: New research grant announced for CS students...",
      "Global: 1,240 students are currently studying worldwide 🌎",
      "Ama shared 'Operating Systems' notes in Level 300 Hub",
      "Tech Alert: International Cybersecurity Summit starts in 2 days",
      "Achievement: 450 students completed the 'AI Ethics' quiz today",
    ];
    let index = 0;
    const interval = setInterval(() => {
      index = (index + 1) % pulses.length;
      setPulseMessage(pulses[index]);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const openHubDetail = (category) => {
    setSelectedHubCategory(category);
    setShowHubDetail(true);
    Vibration.vibrate(50);
  };

  const openResourceDetail = (resource) => {
    setSelectedResource(resource);
    setShowResourceDetail(true);
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
            colors={isDark ? ['#020617', '#0F172A'] : ['#4F46E5', '#6366F1']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.modernHeader}
          >
            <View style={styles.headerContent}>
              <View style={styles.userInfo}>
                <TouchableOpacity 
                  style={styles.idCardContainer}
                  onPress={() => setShowIdModal(true)}
                  activeOpacity={0.9}
                >
                  <LinearGradient
                    colors={isDark ? ['#1E293B', '#0F172A'] : ['#FFFFFF', '#F8FAFC']}
                    style={styles.idCard}
                  >
                    {/* ID Card Decorative Elements */}
                    <View style={styles.idCardChip} />
                    <View style={styles.idCardStrip} />
                    
                    <View style={styles.idCardHeader}>
                      <View style={styles.uniBranding}>
                        <View style={styles.uniLogoContainer}>
                          <Ionicons name="school" size={14} color="#FFFFFF" />
                        </View>
                        <View>
                          <Text style={[styles.uniName, isDark && styles.darkText]}>UNIVERSITY CONNECT</Text>
                          <Text style={[styles.uniTagline, isDark && styles.darkTextSecondary]}>Excellence in Connectivity</Text>
                        </View>
                      </View>
                      <View style={styles.verifiedBadge}>
                        <Ionicons name="shield-checkmark" size={10} color="#10B981" />
                        <Text style={styles.verifiedText}>OFFICIAL ID</Text>
                      </View>
                    </View>

                    <View style={styles.idCardBody}>
                      <View style={styles.idCardLeft}>
                        <View style={styles.idAvatarWrapper}>
                          {user.photoURL || user.profileImage || user.avatar ? (
                            <Image 
                              source={{ uri: user.photoURL || user.profileImage || user.avatar }} 
                              style={styles.idAvatar} 
                            />
                          ) : (
                            <View style={styles.idAvatarPlaceholder}>
                              <Text style={styles.idAvatarLetter}>
                                {user.name ? user.name.charAt(0).toUpperCase() : 'S'}
                              </Text>
                            </View>
                          )}
                          <TouchableOpacity 
                            style={styles.idCameraBadge}
                            onPress={(e) => {
                              e.stopPropagation();
                              Alert.alert('Update Profile Photo', 'Would you like to change your profile picture?', [
                                { text: 'Cancel', style: 'cancel' },
                                { text: 'Choose from Gallery', onPress: () => Alert.alert('Simulated', 'Image picker would open here.') },
                                { text: 'Take Photo', onPress: () => Alert.alert('Simulated', 'Camera would open here.') },
                                { text: 'Remove Photo', style: 'destructive', onPress: () => Alert.alert('Simulated', 'Photo would be removed.') }
                              ]);
                            }}
                          >
                            <Ionicons name="camera" size={10} color="#FFFFFF" />
                          </TouchableOpacity>
                        </View>
                      </View>

                      <View style={styles.idCardRight}>
                        <Text style={[styles.idName, isDark && styles.darkText]} numberOfLines={1}>
                          {user.name?.toUpperCase() || 'STUDENT NAME'}
                        </Text>
                        
                        <View style={styles.idInfoGrid}>
                          <View style={styles.idInfoItem}>
                            <Text style={[styles.idInfoLabel, isDark && styles.darkTextSecondary]}>IDENTIFICATION NO.</Text>
                            <Text style={[styles.idInfoValue, isDark && styles.darkText]}>{user.studentId || 'CST-2024-001'}</Text>
                          </View>
                          
                          <View style={styles.idInfoRow}>
                            <View style={[styles.idInfoItem, { flex: 1 }]}>
                              <Text style={[styles.idInfoLabel, isDark && styles.darkTextSecondary]}>LEVEL</Text>
                              <Text style={[styles.idInfoValue, isDark && styles.darkText]}>{user.academicLevel || '100'}</Text>
                            </View>
                            <View style={[styles.idInfoItem, { flex: 1 }]}>
                              <Text style={[styles.idInfoLabel, isDark && styles.darkTextSecondary]}>STATUS</Text>
                              <Text style={[styles.idInfoValue, { color: '#10B981', fontWeight: '800' }]}>ACTIVE</Text>
                            </View>
                          </View>

                          <View style={styles.idInfoItem}>
                            <Text style={[styles.idInfoLabel, isDark && styles.darkTextSecondary]}>PROGRAM OF STUDY</Text>
                            <Text style={[styles.idInfoValue, isDark && styles.darkText]} numberOfLines={1}>
                              {user.department || 'BSc. Computer Science'}
                            </Text>
                          </View>
                        </View>
                      </View>
                    </View>

                    <View style={styles.idCardFooter}>
                      <View style={styles.barcodeContainer}>
                        <View style={[styles.barcodeLine, isDark && styles.darkBarcode]} />
                        <View style={[styles.barcodeLine, { width: 2, marginHorizontal: 1 }, isDark && styles.darkBarcode]} />
                        <View style={[styles.barcodeLine, { width: 4, marginHorizontal: 2 }, isDark && styles.darkBarcode]} />
                        <View style={[styles.barcodeLine, isDark && styles.darkBarcode]} />
                        <View style={[styles.barcodeLine, { width: 3, marginHorizontal: 1 }, isDark && styles.darkBarcode]} />
                        <View style={[styles.barcodeLine, { width: 1, marginHorizontal: 3 }, isDark && styles.darkBarcode]} />
                        <View style={[styles.barcodeLine, { width: 5, marginHorizontal: 1 }, isDark && styles.darkBarcode]} />
                        <View style={[styles.barcodeLine, isDark && styles.darkBarcode]} />
                      </View>
                      <Text style={[styles.expiryText, isDark && styles.darkText]}>VALID THRU: 08/2026</Text>
                    </View>
                  </LinearGradient>
                </TouchableOpacity>
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
                  onPress={toggleLocalTheme}
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

            {/* University Global Pulse Feed */}
            <View style={styles.pulseSection}>
              <View style={styles.pulseRow}>
                <View style={styles.pulseIndicator} />
                <Text style={styles.pulseText}>{pulseMessage}</Text>
              </View>
            </View>

            {/* University Global Hub - New Section */}
            <View style={styles.hubSection}>
              <View style={styles.hubHeaderRow}>
                <View style={styles.sectionTitleRow}>
                  <Ionicons name="globe" size={20} color={isDark ? '#818CF8' : '#4F46E5'} />
                  <Text style={[styles.sectionTitle, isDark && styles.darkSectionTitle, { marginBottom: 0 }]}>Global University Hub</Text>
                </View>
                <TouchableOpacity onPress={() => navigation.navigate('AcademicOverview')}>
                  <Text style={styles.seeAllText}>Explore Hub</Text>
                </TouchableOpacity>
              </View>
              
              <ScrollView 
                horizontal 
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.hubScroll}
              >
                <TouchableOpacity 
                  style={styles.hubCard}
                  onPress={() => openHubDetail('News')}
                >
                  <LinearGradient
                    colors={['#6366F1', '#4F46E5']}
                    style={styles.hubCardGradient}
                  >
                    <Ionicons name="newspaper" size={24} color="#FFFFFF" />
                    <Text style={styles.hubCardTitle}>Global News</Text>
                    <Text style={styles.hubCardSub}>Academic AI trends 2024</Text>
                  </LinearGradient>
                </TouchableOpacity>

                <TouchableOpacity 
                  style={styles.hubCard}
                  onPress={() => openHubDetail('Events')}
                >
                  <LinearGradient
                    colors={['#10B981', '#059669']}
                    style={styles.hubCardGradient}
                  >
                    <Ionicons name="calendar" size={24} color="#FFFFFF" />
                    <Text style={styles.hubCardTitle}>Campus Events</Text>
                    <Text style={styles.hubCardSub}>Tech Innovation Summit</Text>
                  </LinearGradient>
                </TouchableOpacity>

                <TouchableOpacity 
                  style={styles.hubCard}
                  onPress={() => openHubDetail('Groups')}
                >
                  <LinearGradient
                    colors={['#F59E0B', '#D97706']}
                    style={styles.hubCardGradient}
                  >
                    <Ionicons name="people" size={24} color="#FFFFFF" />
                    <Text style={styles.hubCardTitle}>Global Groups</Text>
                    <Text style={styles.hubCardSub}>Connect with scholars</Text>
                  </LinearGradient>
                </TouchableOpacity>
              </ScrollView>
            </View>

            {/* Peer Community Hub - New Section */}
            <View style={styles.hubSection}>
              <View style={styles.hubHeaderRow}>
                <View style={styles.sectionTitleRow}>
                  <Ionicons name="people" size={20} color={isDark ? '#34D399' : '#059669'} />
                  <Text style={[styles.sectionTitle, isDark && styles.darkSectionTitle, { marginBottom: 0 }]}>Peer Community Hub</Text>
                </View>
                <TouchableOpacity onPress={() => setShowPeerHub(true)}>
                  <Text style={[styles.seeAllText, { color: '#059669' }]}>Browse Notes</Text>
                </TouchableOpacity>
              </View>
              
              <Text style={styles.communitySub}>New materials from Level {user.academicLevel} peers</Text>

              <ScrollView 
                horizontal 
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.hubScroll}
              >
                <TouchableOpacity 
                  style={styles.resourceCard}
                  onPress={() => openResourceDetail({ title: 'Operating Systems', author: 'Kwesi', time: '2h ago', icon: 'document-text', color: '#6366F1' })}
                >
                  <View style={[styles.resourceIcon, { backgroundColor: 'rgba(99, 102, 241, 0.1)' }]}>
                    <Ionicons name="document-text" size={20} color="#6366F1" />
                  </View>
                  <View style={styles.resourceInfo}>
                    <Text style={[styles.resourceTitle, isDark && styles.darkText]} numberOfLines={1}>Operating Systems</Text>
                    <Text style={styles.resourceMeta}>by Kwesi • 2h ago</Text>
                  </View>
                </TouchableOpacity>

                <TouchableOpacity 
                  style={styles.resourceCard}
                  onPress={() => openResourceDetail({ title: 'React Native Guide', author: 'Ama', time: '5h ago', icon: 'code-slash', color: '#10B981' })}
                >
                  <View style={[styles.resourceIcon, { backgroundColor: 'rgba(16, 185, 129, 0.1)' }]}>
                    <Ionicons name="code-slash" size={20} color="#10B981" />
                  </View>
                  <View style={styles.resourceInfo}>
                    <Text style={[styles.resourceTitle, isDark && styles.darkText]} numberOfLines={1}>React Native Guide</Text>
                    <Text style={styles.resourceMeta}>by Ama • 5h ago</Text>
                  </View>
                </TouchableOpacity>

                <TouchableOpacity 
                  style={styles.resourceCard}
                  onPress={() => openResourceDetail({ title: 'Data Structures', author: 'Kofi', time: '1d ago', icon: 'flask', color: '#F59E0B' })}
                >
                  <View style={[styles.resourceIcon, { backgroundColor: 'rgba(245, 158, 11, 0.1)' }]}>
                    <Ionicons name="flask" size={20} color="#F59E0B" />
                  </View>
                  <View style={styles.resourceInfo}>
                    <Text style={[styles.resourceTitle, isDark && styles.darkText]} numberOfLines={1}>Data Structures</Text>
                    <Text style={styles.resourceMeta}>by Kofi • 1d ago</Text>
                  </View>
                </TouchableOpacity>
              </ScrollView>
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
                onPress={() => navigation.navigate('CallHistory')}
                activeOpacity={0.8}
              >
                <LinearGradient
                  colors={['#ffecd2', '#fcb69f']}
                  style={styles.quickActionGradient}
                >
                    <Ionicons name="call" size={22} color="#FFFFFF" />
                </LinearGradient>
                <Text style={[styles.quickActionText, isDark && styles.darkText]}>Voice Calls</Text>
                <Text style={styles.quickActionSubtext}>Make HD calls</Text>
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
                    <Ionicons name="analytics" size={22} color="#FFFFFF" />
                </LinearGradient>
                <Text style={[styles.quickActionText, isDark && styles.darkText]}>Results</Text>
                <Text style={styles.quickActionSubtext}>Grades & GPA</Text>
              </TouchableOpacity>
              </View>

              {/* Row 6: Communication Tools */}
              <View style={styles.quickActionRow}>
                <TouchableOpacity 
                  style={[styles.quickActionCard, isDark && styles.darkCard]}
                  onPress={() => setShowVoiceRecorder(true)}
                  activeOpacity={0.8}
                >
                  <LinearGradient
                    colors={['#8E2DE2', '#4A00E0']}
                    style={styles.quickActionGradient}
                  >
                      <Ionicons name="mic" size={22} color="#FFFFFF" />
                  </LinearGradient>
                  <Text style={[styles.quickActionText, isDark && styles.darkText]}>Voice Record</Text>
                  <Text style={styles.quickActionSubtext}>Send audio</Text>
                </TouchableOpacity>

                <TouchableOpacity 
                  style={[styles.quickActionCard, isDark && styles.darkCard]}
                  onPress={() => navigation.navigate('MessagingWithCalls')}
                  activeOpacity={0.8}
                >
                  <LinearGradient
                    colors={['#f12711', '#f5af19']}
                    style={styles.quickActionGradient}
                  >
                      <Ionicons name="document-attach" size={22} color="#FFFFFF" />
                  </LinearGradient>
                  <Text style={[styles.quickActionText, isDark && styles.darkText]}>Send Files</Text>
                  <Text style={styles.quickActionSubtext}>Share documents</Text>
                </TouchableOpacity>

                <View style={[styles.quickActionCard, { backgroundColor: 'transparent', elevation: 0, borderWidth: 0 }]} />
              </View>

              {/* Row 7: Progress & Modules */}
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
                onPress={() => setShowMindMap(true)}
              >
                <LinearGradient
                  colors={['#EC4899', '#BE185D']}
                  style={styles.additionalFeatureGradient}
                >
                  <Ionicons name="git-network" size={24} color="#FFFFFF" />
                  <Text style={styles.additionalFeatureText}>Mind Maps</Text>
                </LinearGradient>
              </TouchableOpacity>

                <TouchableOpacity 
                style={[styles.additionalFeatureCard, isDark && styles.darkCard]}
                onPress={() => setShowKnowledgeTree(true)}
              >
                <LinearGradient
                  colors={['#10B981', '#059669']}
                  style={styles.additionalFeatureGradient}
                >
                  <Ionicons name="leaf" size={24} color="#FFFFFF" />
                  <Text style={styles.additionalFeatureText}>Knowledge Tree</Text>
                </LinearGradient>
              </TouchableOpacity>

                <TouchableOpacity 
                style={[styles.additionalFeatureCard, isDark && styles.darkCard]}
                onPress={() => setShowWeekendActivities(true)}
              >
                <LinearGradient
                  colors={['#F59E0B', '#D97706']}
                  style={styles.additionalFeatureGradient}
                >
                  <Ionicons name="calendar-outline" size={24} color="#FFFFFF" />
                  <Text style={styles.additionalFeatureText}>Weekend</Text>
                </LinearGradient>
              </TouchableOpacity>

                <TouchableOpacity 
                style={[styles.additionalFeatureCard, isDark && styles.darkCard]}
                onPress={() => setShowGameCenter(true)}
              >
                <LinearGradient
                  colors={['#8B5CF6', '#7C3AED']}
                  style={styles.additionalFeatureGradient}
                >
                  <Ionicons name="game-controller" size={24} color="#FFFFFF" />
                  <Text style={styles.additionalFeatureText}>Game Center</Text>
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
                    <Ionicons name="trending-up-outline" size={24} color="#FFFFFF" />
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

      {/* Study Group Picker Modal */}
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

      {/* Feature Modals */}
      <AIStudyAssistant visible={showAIAssistant} onClose={() => setShowAIAssistant(false)} course={selectedCourse} />
      <SmartNoteTaking visible={showSmartNotes} onClose={() => setShowSmartNotes(false)} course={selectedCourse} />
      <GamifiedProgress visible={showProgress} onClose={() => setShowProgress(false)} user={user} courses={csModules} />
      <ARStudyMode visible={showARMode} onClose={() => setShowARMode(false)} course={selectedCourse} topic="Interactive Learning" />
      <EnhancedVoiceCall visible={showVoiceCall} onClose={() => setShowVoiceCall(false)} participant={callParticipant} onCallEnd={() => setShowVoiceCall(false)} />
      <AIQuizGenerator visible={showQuizGenerator} onClose={() => setShowQuizGenerator(false)} course={selectedCourse} topic="AI-Generated Questions" />
      <SmartScheduleOptimizer visible={showScheduleOptimizer} onClose={() => setShowScheduleOptimizer(false)} user={user} courses={csModules} />
      <FeatureWelcomeGuide visible={showWelcomeGuide} onClose={() => setShowWelcomeGuide(false)} userType="student" />
      <VoiceRecorder visible={showVoiceRecorder} onClose={() => setShowVoiceRecorder(false)} onSend={(data) => Alert.alert('Success', 'Voice recording sent!')} courseCode={selectedCourse?.code} />
      <TextEditor visible={showTextEditor} onClose={() => setShowTextEditor(false)} onSave={(data) => Alert.alert('Success', 'Text saved!')} courseCode={selectedCourse?.code} />
      <ProgressTracker visible={showProgressTracker} onClose={() => setShowProgressTracker(false)} user={user} courses={csModules} />
      <SemesterModules visible={showSemesterModules} onClose={() => setShowSemesterModules(false)} user={user} courses={csModules} />
      <GameCenter visible={showGameCenter} onClose={() => setShowGameCenter(false)} user={user} />
      <FocusMode visible={showFocusMode} onClose={() => setShowFocusMode(false)} user={user} />
      <WeekendActivities visible={showWeekendActivities} onClose={() => setShowWeekendActivities(false)} user={user} />
      <MindMap visible={showMindMap} onClose={() => setShowMindMap(false)} user={user} />
      <KnowledgeTree visible={showKnowledgeTree} onClose={() => setShowKnowledgeTree(false)} user={user} />
      <GlobalUniversityHub visible={showGlobalHub} onClose={() => setShowGlobalHub(false)} user={user} />
      <PeerCommunityHub visible={showPeerHub} onClose={() => setShowPeerHub(false)} user={user} />

      {/* New Interactive Identity Modal */}
      <Modal visible={showIdModal} transparent animationType="fade" onRequestClose={() => setShowIdModal(false)}>
        <View style={styles.fullModalOverlay}>
          <TouchableOpacity style={styles.modalBlur} activeOpacity={1} onPress={() => setShowIdModal(false)} />
          <Animated.View style={styles.idModalContent}>
            <LinearGradient colors={['#4F46E5', '#3730A3']} style={styles.idModalGradient}>
              <View style={styles.idModalHeader}>
                <Text style={styles.idModalTitle}>Digital Student Identity</Text>
                <TouchableOpacity onPress={() => setShowIdModal(false)}>
                  <Ionicons name="close-circle" size={28} color="#FFFFFF" />
                </TouchableOpacity>
              </View>
              <View style={styles.qrContainer}>
                <View style={styles.qrCode}>
                   <Ionicons name="qr-code" size={180} color="#1E293B" />
                   <View style={styles.qrScanLine} />
                </View>
                <Text style={styles.qrHint}>Scan at University Entry Points</Text>
              </View>
              <View style={styles.idModalDetails}>
                <View style={styles.idModalRow}>
                  <Text style={styles.idModalLabel}>HOLDER</Text>
                  <Text style={styles.idModalValue}>{user.name}</Text>
                </View>
                <View style={styles.idModalRow}>
                  <Text style={styles.idModalLabel}>UNIVERSITY ID</Text>
                  <Text style={styles.idModalValue}>{user.studentId}</Text>
                </View>
                <View style={styles.idModalStatus}>
                   <View style={styles.statusDotActive} />
                   <Text style={styles.statusTextActive}>ACTIVE SESSION</Text>
                </View>
              </View>
            </LinearGradient>
          </Animated.View>
        </View>
      </Modal>

      {/* Hub Detail Modal */}
      <Modal visible={showHubDetail} transparent animationType="slide" onRequestClose={() => setShowHubDetail(false)}>
        <View style={styles.fullModalOverlay}>
          <View style={[styles.hubDetailContent, isDark && styles.darkHubDetail]}>
            <View style={styles.hubModalHeader}>
              <Text style={[styles.hubModalTitle, isDark && styles.darkText]}>University {selectedHubCategory}</Text>
              <TouchableOpacity onPress={() => setShowHubDetail(false)}>
                <Ionicons name="close-circle" size={28} color={isDark ? '#FFFFFF' : '#64748B'} />
              </TouchableOpacity>
            </View>
            <ScrollView contentContainerStyle={styles.hubDetailScroll}>
              {[1, 2, 3].map((_, i) => (
                <View key={i} style={[styles.hubDetailItem, isDark && styles.darkHubItem]}>
                  <View style={styles.hubDetailIcon}>
                    <Ionicons name={selectedHubCategory === 'News' ? 'newspaper' : 'calendar'} size={24} color="#6366F1" />
                  </View>
                  <View style={styles.hubDetailInfo}>
                    <Text style={[styles.hubItemTitle, isDark && styles.darkText]}>
                      {selectedHubCategory === 'News' ? `Update on AI Research #${i+1}` : `Tech Talk Event Group #${i+1}`}
                    </Text>
                    <Text style={styles.hubItemSub}>Posted by University Admin • 1h ago</Text>
                  </View>
                </View>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Resource Detail Modal */}
      <Modal visible={showResourceDetail} transparent animationType="slide" onRequestClose={() => setShowResourceDetail(false)}>
        <View style={styles.fullModalOverlay}>
          <View style={[styles.resourceDetailContent, isDark && styles.darkResourceContent]}>
            {selectedResource && (
              <>
                <View style={[styles.resourceDetailHeader, { backgroundColor: selectedResource.color }]}>
                  <Ionicons name={selectedResource.icon} size={48} color="#FFFFFF" />
                  <Text style={styles.resourceDetailTitle}>{selectedResource.title}</Text>
                  <Text style={styles.resourceDetailMeta}>Shared by {selectedResource.author}</Text>
                </View>
                <View style={styles.resourceActions}>
                  <TouchableOpacity style={styles.actionBtn}>
                    <Ionicons name="eye" size={20} color="#6366F1" />
                    <Text style={styles.actionBtnText}>Preview</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={[styles.actionBtn, { backgroundColor: '#6366F1' }]}>
                    <Ionicons name="download" size={20} color="#FFFFFF" />
                    <Text style={[styles.actionBtnText, { color: '#FFFFFF' }]}>Download</Text>
                  </TouchableOpacity>
                </View>
                <TouchableOpacity style={styles.closeResourceBtn} onPress={() => setShowResourceDetail(false)}>
                  <Text style={styles.closeResourceText}>Close</Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        </View>
      </Modal>
      {/* Restore Plus Button (Fixed) */}
      <TouchableOpacity 
        style={styles.floatingPlusButtonFixed}
        onPress={() => setShowQuickActionsModal(true)}
        activeOpacity={0.8}
      >
        <LinearGradient
          colors={["#10B981", "#059669"]}
          style={styles.floatingPlusGradient}
        >
          <Ionicons name="add" size={32} color="#FFFFFF" />
        </LinearGradient>
      </TouchableOpacity>

      {/* Standalone Draggable AI Assistant */}
      <Animated.View 
        style={[
          styles.draggableContainer,
          {
            transform: [{ translateX: pan.x }, { translateY: pan.y }]
          }
        ]}
        {...panResponder.panHandlers}
      >
        <TouchableOpacity 
          style={styles.floatingAIButton}
          onPress={() => setShowAIAssistant(true)}
          activeOpacity={0.8}
        >
          <LinearGradient
            colors={["#6366F1", "#8B5CF6"]}
            style={styles.floatingAIButtonGradient}
          >
            <Ionicons name="sparkles" size={28} color="#FFFFFF" />
            <Text style={styles.floatingAIText}>Ask AI</Text>
          </LinearGradient>
        </TouchableOpacity>
      </Animated.View>
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
  idCardContainer: {
    padding: 1,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    width: width - 40,
  },
  idCard: {
    padding: 18,
    borderRadius: 20,
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.5)',
  },
  idCardChip: {
    position: 'absolute',
    top: 60,
    left: 20,
    width: 35,
    height: 25,
    backgroundColor: '#FFD700',
    borderRadius: 4,
    opacity: 0.8,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.1)',
  },
  idCardStrip: {
    position: 'absolute',
    top: 50,
    right: -20,
    width: 100,
    height: 100,
    backgroundColor: 'rgba(99, 102, 241, 0.05)',
    borderRadius: 50,
  },
  idCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.05)',
  },
  uniBranding: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  uniName: {
    fontSize: 10,
    fontWeight: '900',
    color: '#1E293B',
    letterSpacing: 1.5,
  },
  idInfoLabel: {
    fontSize: 6.5,
    color: '#64748B',
    fontWeight: '700',
    letterSpacing: 0.3,
    marginBottom: 0,
  },
  idInfoValue: {
    fontSize: 9,
    fontWeight: '700',
    color: '#1E293B',
  },
  idDetailLabel: {
    fontSize: 8,
    fontWeight: '700',
    color: '#64748B',
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  idDetailValue: {
    fontSize: 12,
    fontWeight: '800',
    color: '#334155',
  },
  darkTextSecondary: {
    color: '#94A3B8',
  },
  darkBarcode: {
    backgroundColor: '#F8FAFC',
  },
  verifiedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
    gap: 4,
  },
  verifiedText: {
    fontSize: 7,
    fontWeight: '900',
    color: '#10B981',
    marginLeft: 3,
  },
  uniLogoContainer: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#4F46E5',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  uniTagline: {
    fontSize: 7,
    color: '#64748B',
    fontWeight: '600',
  },
  idCameraBadge: {
    position: 'absolute',
    bottom: -5,
    right: -5,
    backgroundColor: '#6366F1',
    width: 22,
    height: 22,
    borderRadius: 11,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  idInfoGrid: {
    gap: 4,
  },
  idInfoItem: {
    marginBottom: 1,
  },
  idInfoRow: {
    flexDirection: 'row',
    gap: 8,
  },
  idInfoLabel: {
    fontSize: 6.5,
    color: '#64748B',
    fontWeight: '700',
    letterSpacing: 0.3,
    marginBottom: 0,
  },
  idInfoValue: {
    fontSize: 9,
    fontWeight: '700',
    color: '#1E293B',
  },
  idCardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    marginTop: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(226, 232, 240, 0.5)',
    paddingTop: 8,
  },
  barcodeContainer: {
    flexDirection: 'row',
    height: 10,
    alignItems: 'center',
  },
  barcodeLine: {
    width: 1,
    height: '100%',
    backgroundColor: '#1E293B',
    marginHorizontal: 0.5,
  },
  expiryText: {
    fontSize: 6.5,
    fontWeight: '700',
    color: '#64748B',
  },
  idCardBody: {
    flexDirection: 'row',
    gap: 16,
  },
  idCardLeft: {
    justifyContent: 'flex-start',
  },
  idAvatarWrapper: {
    width: 80,
    height: 80,
    borderRadius: 12,
    borderWidth: 3,
    borderColor: '#FFFFFF',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    overflow: 'visible',
  },
  idAvatar: {
    width: '100%',
    height: '100%',
    borderRadius: 9,
  },
  idAvatarPlaceholder: {
    width: '100%',
    height: '100%',
    borderRadius: 9,
    backgroundColor: '#6366F1',
    justifyContent: 'center',
    alignItems: 'center',
  },
  idAvatarLetter: {
    color: '#FFFFFF',
    fontSize: 32,
    fontWeight: 'bold',
  },
  idAvatarBadge: {
    position: 'absolute',
    bottom: -6,
    right: -6,
    backgroundColor: '#1E293B',
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  idCardRight: {
    flex: 1,
    justifyContent: 'center',
  },
  idName: {
    fontSize: 18,
    fontWeight: '800',
    color: '#1E293B',
    marginBottom: 8,
  },
  idDetailsGrid: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 8,
  },
  idDetailItem: {
    flex: 0,
  },
  idDetailLabel: {
    fontSize: 8,
    fontWeight: '700',
    color: '#64748B',
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  idDetailValue: {
    fontSize: 12,
    fontWeight: '800',
    color: '#334155',
  },
  idDeptItem: {
    marginTop: 4,
  },
  darkText: {
    color: '#F8FAFC',
  },
  onlineStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
    backgroundColor: 'rgba(52, 211, 153, 0.15)',
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(52, 211, 153, 0.2)',
  },
  onlineIndicator: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#10B981',
    marginRight: 6,
  },
  onlineText: {
    fontSize: 10,
    color: '#10B981',
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  discoverButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#10B981', // Solid Emerald
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 24,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
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
  hubSection: {
    marginTop: 25,
    paddingHorizontal: 20,
  },
  hubHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  seeAllText: {
    fontSize: 12,
    color: '#6366F1',
    fontWeight: '700',
  },
  hubScroll: {
    paddingRight: 20,
  },
  hubCard: {
    width: width * 0.4,
    height: 110,
    marginRight: 15,
    borderRadius: 20,
    overflow: 'hidden',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
  },
  hubCardGradient: {
    flex: 1,
    padding: 16,
    justifyContent: 'center',
  },
  hubCardTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#FFFFFF',
    marginTop: 8,
  },
  hubCardSub: {
    fontSize: 10,
    color: 'rgba(255, 255, 255, 0.8)',
    marginTop: 2,
  },
  communitySub: {
    fontSize: 12,
    color: '#94A3B8',
    marginBottom: 12,
  },
  resourceCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    padding: 12,
    borderRadius: 16,
    marginRight: 12,
    width: 200,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  resourceIcon: {
    width: 40,
    height: 40,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  resourceInfo: {
    marginLeft: 12,
    flex: 1,
  },
  resourceTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#1E293B',
  },
  resourceMeta: {
    fontSize: 10,
    color: '#94A3B8',
    marginTop: 2,
  },
  pulseSection: {
    backgroundColor: 'rgba(99, 102, 241, 0.1)',
    paddingVertical: 8,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(99, 102, 241, 0.2)',
  },
  pulseRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  pulseIndicator: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#10B981',
  },
  pulseText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#6366F1',
    letterSpacing: 0.3,
  },
  themeToggle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#F59E0B', // Solid Amber
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  notificationButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#6366F1', // Solid Indigo
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
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
  floatingAIButton: {
    width: 65,
    height: 65,
    borderRadius: 32.5,
    elevation: 12,
    shadowColor: "#6366F1",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 10,
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
    fontSize: 9,
    color: "#FFFFFF",
    fontWeight: "900",
    marginTop: -2,
    textTransform: "uppercase",
  },
  draggableContainer: {
    position: 'absolute',
    bottom: 50,
    right: 20,
    zIndex: 10000,
  },
  floatingPlusButtonFixed: {
    position: 'absolute',
    bottom: 130,
    right: 20,
    width: 60,
    height: 60,
    borderRadius: 30,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    zIndex: 9999,
  },
  floatingPlusButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
  },
  floatingPlusGradient: {
    flex: 1,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
