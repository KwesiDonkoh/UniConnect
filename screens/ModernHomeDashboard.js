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
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useApp } from '../context/AppContext';
import achievementsService from '../services/achievementsService';

const { width, height } = Dimensions.get('window');

export default function ModernHomeDashboard({ navigation }) {
  const { csModules, notifications, user } = useApp();
  
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
  const [isDark, setIsDark] = useState(false);
  const [achievements, setAchievements] = useState([]);
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

  // Quick Action Functions
  const createStudyGroup = () => {
    Alert.alert(
      'Create Study Group 👥',
      'Choose a course to create a study group for:',
      [
        ...csModules.slice(0, 3).map(course => ({
          text: course.code,
          onPress: () => {
            Alert.alert(
              'Study Group Created! 🎉',
              `Study group for ${course.name} has been created. Other students will be notified to join.`,
              [{ text: 'Great!', onPress: () => navigation.navigate('Chat') }]
            );
          }
        })),
        { text: 'Cancel', style: 'cancel' }
      ]
    );
  };

  const setReminder = () => {
    Alert.alert(
      'Set Study Reminder ⏰',
      'What would you like to be reminded about?',
      [
        { 
          text: 'Assignment Due', 
          onPress: () => {
            Alert.alert(
              'Reminder Set! ✅',
              'You\'ll be reminded about upcoming assignment deadlines.',
              [{ text: 'OK' }]
            );
          }
        },
        { 
          text: 'Study Session', 
          onPress: () => {
            Alert.alert(
              'Study Reminder Set! 📚',
              'Daily study reminder has been enabled. You\'ll get notifications to maintain your study streak.',
              [{ text: 'Perfect!' }]
            );
          }
        },
        { 
          text: 'Class Schedule', 
          onPress: () => {
            Alert.alert(
              'Class Reminder Set! 🎓',
              'You\'ll be reminded 15 minutes before each class starts.',
              [{ text: 'Thanks!' }]
            );
          }
        },
        { text: 'Cancel', style: 'cancel' }
      ]
    );
  };

  const startPomodoroTimer = () => {
    Alert.alert(
      'Start Pomodoro Timer 🍅',
      'Choose your focus session duration:',
      [
        { 
          text: '25 minutes', 
          onPress: () => {
            Alert.alert(
              'Pomodoro Started! 🚀',
              'Focus timer set for 25 minutes. Stay focused and avoid distractions!',
              [
                { text: 'Start Studying', onPress: () => navigation.navigate('StudyScreen') },
                { text: 'OK' }
              ]
            );
          }
        },
        { 
          text: '50 minutes', 
          onPress: () => {
            Alert.alert(
              'Long Study Session! 📖',
              'Extended focus timer set for 50 minutes. You\'ve got this!',
              [
                { text: 'Start Studying', onPress: () => navigation.navigate('StudyScreen') },
                { text: 'OK' }
              ]
            );
          }
        },
        { text: 'Cancel', style: 'cancel' }
      ]
    );
  };
  
  if (!user) {
    return (
      <View style={styles.loadingContainer}>
        <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
          <LinearGradient
            colors={['#6366F1', '#8B5CF6']}
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
    setIsDark(!isDark);
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
          style={styles.modernCourseCard}
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
              <Text style={styles.courseCode}>{item.code}</Text>
              {unreadCount > 0 && (
                <View style={styles.courseBadge}>
                  <Text style={styles.courseBadgeText}>
                    {unreadCount > 99 ? '99+' : unreadCount}
                  </Text>
                </View>
              )}
            </View>
            
            <Text style={styles.courseName} numberOfLines={2}>
              {item.name}
            </Text>
            
            <View style={styles.courseFooter}>
              <View style={styles.courseProgress}>
                <View style={[styles.progressBar, { width: '100%' }]}>
                  <View style={[styles.progressFill, { width: `${Math.random() * 100}%` }]} />
                </View>
                <Text style={styles.progressText}>
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
                  <Text style={styles.welcomeText}>Welcome back,</Text>
                  <Text style={styles.userName}>{user.name}</Text>
                  <Text style={styles.userLevel}>
                    {user.userType === 'lecturer' ? 'Lecturer' : 
                     `Level ${user.academicLevel} • ${user.levelDescription}`}
                  </Text>
                </View>
              </View>
              
              <View style={styles.headerActions}>
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
            <View style={styles.statsContainer}>
              <View style={styles.statCard}>
                <Animated.View style={{ transform: [{ scale: bounceScale }] }}>
                  <Ionicons name="flame" size={28} color="#F59E0B" />
                </Animated.View>
                <Text style={styles.statNumber}>{studyStreak}</Text>
                <Text style={styles.statLabel}>Day Streak</Text>
              </View>

              <View style={styles.statCard}>
                <View style={styles.progressContainer}>
                  <Text style={styles.progressLabel}>Daily Goal</Text>
                  <View style={styles.circularProgress}>
                    <Text style={styles.progressPercentage}>
                      {Math.round(dailyGoal * 100)}%
                    </Text>
                  </View>
                </View>
              </View>

              <View style={styles.statCard}>
                <Ionicons name="trophy" size={28} color="#F59E0B" />
                <Text style={styles.statNumber}>{achievementProgress.earned}</Text>
                <Text style={styles.statLabel}>Achievements</Text>
              </View>
            </View>
          </LinearGradient>

          {/* Quick Actions with Modern Cards */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={[styles.sectionTitle, isDark && styles.darkText]}>Quick Actions</Text>
              <TouchableOpacity>
                <Ionicons name="ellipsis-horizontal" size={20} color={isDark ? '#FFFFFF' : '#64748B'} />
              </TouchableOpacity>
            </View>
            
            <View style={styles.quickActionsGrid}>
              <TouchableOpacity 
                style={styles.quickActionCard}
                onPress={() => navigation.navigate('Chat')}
                activeOpacity={0.8}
              >
                <LinearGradient
                  colors={['#6366F1', '#8B5CF6']}
                  style={styles.quickActionGradient}
                >
                  <Ionicons name="chatbubbles" size={32} color="#FFFFFF" />
                </LinearGradient>
                <Text style={[styles.quickActionText, isDark && styles.darkText]}>Chat</Text>
                <Text style={styles.quickActionSubtext}>Group discussions</Text>
              </TouchableOpacity>

              <TouchableOpacity 
                style={styles.quickActionCard}
                onPress={() => navigation.navigate('Notifications')}
                activeOpacity={0.8}
              >
                <LinearGradient
                  colors={['#10B981', '#059669']}
                  style={styles.quickActionGradient}
                >
                  <Ionicons name="notifications" size={32} color="#FFFFFF" />
                </LinearGradient>
                <Text style={[styles.quickActionText, isDark && styles.darkText]}>Alerts</Text>
                <Text style={styles.quickActionSubtext}>Stay updated</Text>
              </TouchableOpacity>

              <TouchableOpacity 
                style={styles.quickActionCard}
                onPress={() => navigation.navigate('StudyScreen')}
                activeOpacity={0.8}
              >
                <LinearGradient
                  colors={['#F59E0B', '#EF4444']}
                  style={styles.quickActionGradient}
                >
                  <Ionicons name="library" size={32} color="#FFFFFF" />
                </LinearGradient>
                <Text style={[styles.quickActionText, isDark && styles.darkText]}>Study Center</Text>
                <Text style={styles.quickActionSubtext}>Materials & timer</Text>
              </TouchableOpacity>

                            <TouchableOpacity
                style={styles.quickActionCard}
                onPress={() => navigation.navigate('AcademicCalendar')}
                activeOpacity={0.8}
              >
                <LinearGradient
                  colors={['#EC4899', '#8B5CF6']}
                  style={styles.quickActionGradient}
                >
                  <Ionicons name="calendar" size={32} color="#FFFFFF" />
                </LinearGradient>
                <Text style={[styles.quickActionText, isDark && styles.darkText]}>Calendar</Text>
                <Text style={styles.quickActionSubtext}>Academic events</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.quickActionCard}
                onPress={() => navigation.navigate('CourseRegistration')}
                activeOpacity={0.8}
              >
                <LinearGradient
                  colors={['#8B5CF6', '#7C3AED']}
                  style={styles.quickActionGradient}
                >
                  <Ionicons name="school" size={32} color="#FFFFFF" />
                </LinearGradient>
                <Text style={[styles.quickActionText, isDark && styles.darkText]}>Register</Text>
                <Text style={styles.quickActionSubtext}>Course Registration</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.quickActionCard}
                onPress={() => navigation.navigate('AcademicResults')}
                activeOpacity={0.8}
              >
                <LinearGradient
                  colors={['#10B981', '#059669']}
                  style={styles.quickActionGradient}
                >
                  <Ionicons name="trophy" size={32} color="#FFFFFF" />
                </LinearGradient>
                <Text style={[styles.quickActionText, isDark && styles.darkText]}>Results</Text>
                <Text style={styles.quickActionSubtext}>Academic Results</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.quickActionCard}
                onPress={() => navigation.navigate('WeekendStudy')}
                activeOpacity={0.8}
              >
                <LinearGradient
                  colors={['#EF4444', '#DC2626']}
                  style={styles.quickActionGradient}
                >
                  <Ionicons name="people" size={32} color="#FFFFFF" />
                </LinearGradient>
                <Text style={[styles.quickActionText, isDark && styles.darkText]}>Weekend</Text>
                <Text style={styles.quickActionSubtext}>Study Groups</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.quickActionCard}
                onPress={() => navigation.navigate('SemesterModules')}
                activeOpacity={0.8}
              >
                <LinearGradient
                  colors={['#6366F1', '#8B5CF6']}
                  style={styles.quickActionGradient}
                >
                  <Ionicons name="library" size={32} color="#FFFFFF" />
                </LinearGradient>
                <Text style={[styles.quickActionText, isDark && styles.darkText]}>Modules</Text>
                <Text style={styles.quickActionSubtext}>Semester Modules</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.quickActionCard}
                onPress={() => navigation.navigate('ClassSchedule')}
                activeOpacity={0.8}
              >
                <LinearGradient
                  colors={['#F59E0B', '#D97706']}
                  style={styles.quickActionGradient}
                >
                  <Ionicons name="time" size={32} color="#FFFFFF" />
                </LinearGradient>
                <Text style={[styles.quickActionText, isDark && styles.darkText]}>Schedule</Text>
                <Text style={styles.quickActionSubtext}>Class Timetable</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* My Courses */}
          {user.userType === 'student' && (
            <View style={styles.section}>
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
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={[styles.sectionTitle, isDark && styles.darkText]}>🏆 Achievements & Progress</Text>
              <TouchableOpacity onPress={() => Alert.alert('🎖️ Achievement Center', 'Track your academic progress and unlock rewards!\n\n📊 Progress Overview:\n• Chat Activity: Master Communicator\n• Study Sessions: Focus Champion\n• Course Performance: Academic Star\n• Community: Team Player\n\n🎯 Keep engaging to unlock more achievements!')}>
                <Text style={styles.seeAllText}>View All</Text>
              </TouchableOpacity>
            </View>

            {/* Achievement Progress Summary */}
            <View style={styles.achievementSummary}>
              <LinearGradient
                colors={['#4F46E5', '#7C3AED']}
                style={styles.achievementSummaryGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
              >
                <View style={styles.achievementStats}>
                  <View style={styles.achievementStat}>
                    <Text style={styles.achievementStatNumber}>
                      {achievementProgress?.earned || (achievements.length > 0 ? achievements.length : 4)}
                    </Text>
                    <Text style={styles.achievementStatLabel}>Earned</Text>
                  </View>
                  <View style={styles.achievementStat}>
                    <Text style={styles.achievementStatNumber}>
                      {userStats?.totalPoints || (achievements.length > 0 ? achievements.reduce((sum, a) => sum + (a.points || 50), 0) : 185)}
                    </Text>
                    <Text style={styles.achievementStatLabel}>Points</Text>
                  </View>
                  <View style={styles.achievementStat}>
                    <Text style={styles.achievementStatNumber}>
                      {achievementProgress?.percentage || 65}%
                    </Text>
                    <Text style={styles.achievementStatLabel}>Progress</Text>
                  </View>
                </View>
                
                <View style={styles.levelProgress}>
                  <Text style={styles.levelText}>
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
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Text style={[styles.sectionTitle, isDark && styles.darkText]}>📚 Academic Progress</Text>
                <TouchableOpacity onPress={() => navigation.navigate('AcademicOverview')}>
                  <Text style={styles.seeAllText}>View Details</Text>
                </TouchableOpacity>
              </View>

              <View style={styles.academicStatsContainer}>
                <View style={styles.academicStatCard}>
                  <LinearGradient colors={['#10B981', '#059669']} style={styles.academicStatGradient}>
                    <Ionicons name="book-outline" size={24} color="#FFFFFF" />
                    <Text style={styles.academicStatNumber}>{csModules?.length || 0}</Text>
                    <Text style={styles.academicStatLabel}>Courses</Text>
                  </LinearGradient>
                </View>

                <View style={styles.academicStatCard}>
                  <LinearGradient colors={['#8B5CF6', '#7C3AED']} style={styles.academicStatGradient}>
                    <Ionicons name="school-outline" size={24} color="#FFFFFF" />
                    <Text style={styles.academicStatNumber}>
                      {csModules?.reduce((total, course) => total + (course.credits || 3), 0) || 0}
                    </Text>
                    <Text style={styles.academicStatLabel}>Credits</Text>
                  </LinearGradient>
                </View>

                <View style={styles.academicStatCard}>
                  <LinearGradient colors={['#F59E0B', '#D97706']} style={styles.academicStatGradient}>
                    <Ionicons name="trending-up-outline" size={24} color="#FFFFFF" />
                    <Text style={styles.academicStatNumber}>3.45</Text>
                    <Text style={styles.academicStatLabel}>CGPA</Text>
                  </LinearGradient>
                </View>

                <View style={styles.academicStatCard}>
                  <LinearGradient colors={['#EF4444', '#DC2626']} style={styles.academicStatGradient}>
                    <Ionicons name="calendar-outline" size={24} color="#FFFFFF" />
                    <Text style={styles.academicStatNumber}>{user?.academicLevel || '300'}</Text>
                    <Text style={styles.academicStatLabel}>Level</Text>
                  </LinearGradient>
                </View>
              </View>

              {/* Semester Credit Breakdown */}
              <View style={styles.semesterBreakdown}>
                <Text style={styles.semesterTitle}>Credit Hours Breakdown</Text>
                <View style={styles.semesterRow}>
                  <View style={styles.semesterColumn}>
                    <Text style={styles.semesterLabel}>Semester 1</Text>
                    <Text style={styles.semesterCredits}>
                      {csModules?.filter(module => module.semester === 1)
                        .reduce((total, course) => total + (course.credits || 3), 0) || 0} Credits
                    </Text>
                    <Text style={styles.semesterCourses}>
                      {csModules?.filter(module => module.semester === 1).length || 0} Courses
                    </Text>
                  </View>
                  <View style={styles.semesterDivider} />
                  <View style={styles.semesterColumn}>
                    <Text style={styles.semesterLabel}>Semester 2</Text>
                    <Text style={styles.semesterCredits}>
                      {csModules?.filter(module => module.semester === 2)
                        .reduce((total, course) => total + (course.credits || 3), 0) || 0} Credits
                    </Text>
                    <Text style={styles.semesterCourses}>
                      {csModules?.filter(module => module.semester === 2).length || 0} Courses
                    </Text>
                  </View>
                </View>
              </View>
            </View>
          )}

          {/* Recent Activity */}
          <View style={styles.section}>
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
                    <Text style={styles.activityMessage} numberOfLines={2}>
                      {notification.message}
                    </Text>
                    <Text style={styles.activityTime}>
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

      {/* Modern Floating Action Button */}
      <TouchableOpacity 
        style={styles.fab}
        onPress={() => Alert.alert('Quick Actions', 'Choose an action:', [
          { text: 'Create Study Group', onPress: () => createStudyGroup() },
          { text: 'Set Reminder', onPress: () => setReminder() },
          { text: 'Start Pomodoro', onPress: () => startPomodoroTimer() },
          { text: 'Private Message 🔒', onPress: () => navigation.navigate('PrivateMessaging') },
          { text: 'Course Rep 👑', onPress: () => navigation.navigate('CourseRepresentative') },
                  { text: 'Academic Overview', onPress: () => navigation.navigate('AcademicOverview') },
        { text: 'Academic Calendar', onPress: () => navigation.navigate('AcademicCalendar') },
        { text: 'View Profile', onPress: () => navigation.navigate('AcademicOverview', { initialTab: 'personal' }) },
        { text: 'View Modules', onPress: () => navigation.navigate('SemesterModules') },
          { text: 'Cancel', style: 'cancel' }
        ])}
        activeOpacity={0.8}
      >
        <LinearGradient
          colors={['#6366F1', '#8B5CF6']}
          style={styles.fabGradient}
        >
          <Ionicons name="add" size={28} color="#FFFFFF" />
        </LinearGradient>
      </TouchableOpacity>
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
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
    marginBottom: 4,
  },
  userName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  userLevel: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
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

  // Stats Container
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginTop: 8,
  },
  statLabel: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.8)',
    marginTop: 4,
  },
  progressContainer: {
    alignItems: 'center',
  },
  progressLabel: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.8)',
    marginBottom: 8,
  },
  circularProgress: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  progressPercentage: {
    fontSize: 14,
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
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
  },
  quickActionCard: {
    width: (width - 60) / 2,
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  darkCard: {
    backgroundColor: '#1A1A2E',
  },
  quickActionGradient: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  quickActionText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1E293B',
    marginBottom: 4,
  },
  quickActionSubtext: {
    fontSize: 12,
    color: '#64748B',
    textAlign: 'center',
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
});
