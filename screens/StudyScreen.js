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
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useApp } from '../context/AppContext';
import achievementsService from '../services/achievementsService';

const { width, height } = Dimensions.get('window');

export default function StudyScreen({ navigation }) {
  const { user, csModules } = useApp();
  const [selectedTab, setSelectedTab] = useState('overview');
  const [studyStats, setStudyStats] = useState({
    totalHours: 0,
    completedCourses: 0,
    currentStreak: 0,
    weeklyGoal: 20,
    weeklyProgress: 0
  });
  const [studyMaterials, setStudyMaterials] = useState([]);
  const [recentActivity, setRecentActivity] = useState([]);
  const [studyPlan, setStudyPlan] = useState([]);
  const [showTimer, setShowTimer] = useState(false);
  const [studyTime, setStudyTime] = useState(0);
  const [isStudying, setIsStudying] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState(null);

  // Animation refs
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;

  useEffect(() => {
    if (user?.uid) {
      loadStudyData();
      startAnimations();
    }
  }, [user?.uid]);

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

  const loadStudyData = async () => {
    try {
      // Load study statistics
      setStudyStats({
        totalHours: 47.5,
        completedCourses: 3,
        currentStreak: 7,
        weeklyGoal: 20,
        weeklyProgress: 14.5
      });

      // Load study materials
      setStudyMaterials([
        {
          id: '1',
          title: 'Data Structures & Algorithms',
          course: 'CS201',
          type: 'PDF',
          progress: 75,
          lastAccessed: '2 hours ago',
          size: '2.4 MB'
        },
        {
          id: '2',
          title: 'Object-Oriented Programming',
          course: 'CS102',
          type: 'Video',
          progress: 100,
          lastAccessed: '1 day ago',
          size: '45 MB'
        },
        {
          id: '3',
          title: 'Database Design Principles',
          course: 'CS301',
          type: 'PDF',
          progress: 45,
          lastAccessed: '3 days ago',
          size: '1.8 MB'
        }
      ]);

      // Load recent activity
      setRecentActivity([
        {
          id: '1',
          action: 'Completed Chapter 5',
          course: 'CS201',
          time: '2 hours ago',
          icon: 'checkmark-circle',
          color: '#10B981'
        },
        {
          id: '2',
          action: 'Started new assignment',
          course: 'CS102',
          time: '1 day ago',
          icon: 'document-text',
          color: '#3B82F6'
        },
        {
          id: '3',
          action: 'Joined study group',
          course: 'CS301',
          time: '2 days ago',
          icon: 'people',
          color: '#8B5CF6'
        }
      ]);

      // Load study plan
      setStudyPlan([
        {
          id: '1',
          title: 'Review Data Structures',
          course: 'CS201',
          timeSlot: '9:00 - 10:30 AM',
          status: 'pending',
          priority: 'high'
        },
        {
          id: '2',
          title: 'Complete Lab Assignment',
          course: 'CS102',
          timeSlot: '2:00 - 4:00 PM',
          status: 'pending',
          priority: 'medium'
        },
        {
          id: '3',
          title: 'Database Project',
          course: 'CS301',
          timeSlot: '7:00 - 9:00 PM',
          status: 'completed',
          priority: 'high'
        }
      ]);
    } catch (error) {
      console.error('Error loading study data:', error);
    }
  };

  const startStudySession = (course) => {
    setSelectedCourse(course);
    setShowTimer(true);
    setIsStudying(true);
    setStudyTime(0);
    
    // Award achievement for starting study session
    achievementsService.checkAndAwardAchievements(user.uid, 'study_session_start');
  };

  const stopStudySession = () => {
    setIsStudying(false);
    setShowTimer(false);
    
    if (studyTime > 0) {
      Alert.alert(
        'Study Session Complete! 🎓',
        `Great job! You studied for ${Math.floor(studyTime / 60)} minutes.\n\nKeep up the excellent work!`,
        [{ text: 'Continue', onPress: () => setStudyTime(0) }]
      );
      
      // Award achievement for completing study session
      achievementsService.checkAndAwardAchievements(user.uid, 'study_session_complete', {
        duration: studyTime
      });
    }
  };

  // Study timer effect
  useEffect(() => {
    let interval = null;
    if (isStudying) {
      interval = setInterval(() => {
        setStudyTime(time => time + 1);
      }, 1000);
    } else if (!isStudying && studyTime !== 0) {
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [isStudying, studyTime]);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const renderOverview = () => (
    <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}>
      {/* Study Stats Cards */}
      <View style={styles.statsContainer}>
        <View style={styles.statCard}>
          <LinearGradient colors={['#3B82F6', '#1D4ED8']} style={styles.statGradient}>
            <Ionicons name="time" size={24} color="#FFFFFF" />
            <Text style={styles.statNumber}>{studyStats.totalHours}h</Text>
            <Text style={styles.statLabel}>Total Hours</Text>
          </LinearGradient>
        </View>
        
        <View style={styles.statCard}>
          <LinearGradient colors={['#10B981', '#059669']} style={styles.statGradient}>
            <Ionicons name="trophy" size={24} color="#FFFFFF" />
            <Text style={styles.statNumber}>{studyStats.completedCourses}</Text>
            <Text style={styles.statLabel}>Completed</Text>
          </LinearGradient>
        </View>
        
        <View style={styles.statCard}>
          <LinearGradient colors={['#F59E0B', '#D97706']} style={styles.statGradient}>
            <Ionicons name="flame" size={24} color="#FFFFFF" />
            <Text style={styles.statNumber}>{studyStats.currentStreak}</Text>
            <Text style={styles.statLabel}>Day Streak</Text>
          </LinearGradient>
        </View>
      </View>

      {/* Weekly Progress */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Weekly Progress</Text>
        <View style={styles.progressCard}>
          <View style={styles.progressHeader}>
            <Text style={styles.progressText}>
              {studyStats.weeklyProgress}h / {studyStats.weeklyGoal}h
            </Text>
            <Text style={styles.progressPercent}>
              {Math.round((studyStats.weeklyProgress / studyStats.weeklyGoal) * 100)}%
            </Text>
          </View>
          <View style={styles.progressBar}>
            <View 
              style={[
                styles.progressFill, 
                { width: `${(studyStats.weeklyProgress / studyStats.weeklyGoal) * 100}%` }
              ]} 
            />
          </View>
        </View>
      </View>

      {/* Quick Actions */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Quick Study</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View style={styles.quickActionsRow}>
            {csModules.slice(0, 4).map((course, index) => (
              <TouchableOpacity 
                key={course.id}
                style={styles.quickActionCard}
                onPress={() => startStudySession(course)}
              >
                <LinearGradient
                  colors={['#6366F1', '#8B5CF6']}
                  style={styles.quickActionGradient}
                >
                  <Text style={styles.quickActionIcon}>📚</Text>
                  <Text style={styles.quickActionTitle}>{course.name}</Text>
                  <Text style={styles.quickActionSubtitle}>Start Session</Text>
                </LinearGradient>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>
      </View>

      {/* Recent Activity */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Recent Activity</Text>
        {recentActivity.map((activity, index) => (
          <View key={activity.id} style={styles.activityItem}>
            <View style={[styles.activityIcon, { backgroundColor: `${activity.color}20` }]}>
              <Ionicons name={activity.icon} size={16} color={activity.color} />
            </View>
            <View style={styles.activityContent}>
              <Text style={styles.activityTitle}>{activity.action}</Text>
              <Text style={styles.activitySubtitle}>{activity.course} • {activity.time}</Text>
            </View>
          </View>
        ))}
      </View>
    </Animated.View>
  );

  const renderMaterials = () => (
    <View style={styles.tabContent}>
      <Text style={styles.sectionTitle}>Study Materials</Text>
      {studyMaterials.map((material, index) => (
        <TouchableOpacity key={material.id} style={styles.materialCard}>
          <View style={styles.materialIcon}>
            <Ionicons 
              name={material.type === 'PDF' ? 'document-text' : 'play-circle'} 
              size={24} 
              color={material.type === 'PDF' ? '#EF4444' : '#3B82F6'} 
            />
          </View>
          <View style={styles.materialContent}>
            <Text style={styles.materialTitle}>{material.title}</Text>
            <Text style={styles.materialSubtitle}>{material.course} • {material.size}</Text>
            <View style={styles.materialProgress}>
              <View style={styles.materialProgressBar}>
                <View 
                  style={[styles.materialProgressFill, { width: `${material.progress}%` }]} 
                />
              </View>
              <Text style={styles.materialProgressText}>{material.progress}%</Text>
            </View>
          </View>
          <TouchableOpacity style={styles.materialAction}>
            <Ionicons name="chevron-forward" size={20} color="#94A3B8" />
          </TouchableOpacity>
        </TouchableOpacity>
      ))}
    </View>
  );

  const renderPlan = () => (
    <View style={styles.tabContent}>
      <Text style={styles.sectionTitle}>Today's Study Plan</Text>
      {studyPlan.map((item, index) => (
        <View key={item.id} style={styles.planItem}>
          <View style={styles.planTime}>
            <Text style={styles.planTimeText}>{item.timeSlot}</Text>
          </View>
          <View style={[
            styles.planContent,
            item.status === 'completed' && styles.planContentCompleted
          ]}>
            <View style={styles.planHeader}>
              <Text style={[
                styles.planTitle,
                item.status === 'completed' && styles.planTitleCompleted
              ]}>
                {item.title}
              </Text>
              <View style={[
                styles.priorityBadge,
                { backgroundColor: item.priority === 'high' ? '#FEE2E2' : '#FEF3C7' }
              ]}>
                <Text style={[
                  styles.priorityText,
                  { color: item.priority === 'high' ? '#DC2626' : '#D97706' }
                ]}>
                  {item.priority}
                </Text>
              </View>
            </View>
            <Text style={styles.planCourse}>{item.course}</Text>
            {item.status === 'completed' && (
              <View style={styles.completedBadge}>
                <Ionicons name="checkmark" size={12} color="#FFFFFF" />
                <Text style={styles.completedText}>Completed</Text>
              </View>
            )}
          </View>
        </View>
      ))}
    </View>
  );

  if (!user) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#4F46E5" />
          <Text style={styles.loadingText}>Loading study data...</Text>
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
        <Text style={styles.headerTitle}>Study Center</Text>
        <TouchableOpacity onPress={() => setShowTimer(true)}>
          <Ionicons name="timer" size={24} color="#4F46E5" />
        </TouchableOpacity>
      </View>

      {/* Tab Navigation */}
      <View style={styles.tabContainer}>
        {[
          { key: 'overview', label: 'Overview', icon: 'grid' },
          { key: 'materials', label: 'Materials', icon: 'library' },
          { key: 'plan', label: 'Plan', icon: 'calendar' }
        ].map((tab) => (
          <TouchableOpacity
            key={tab.key}
            style={[styles.tab, selectedTab === tab.key && styles.activeTab]}
            onPress={() => setSelectedTab(tab.key)}
          >
            <Ionicons 
              name={tab.icon} 
              size={20} 
              color={selectedTab === tab.key ? '#4F46E5' : '#64748B'} 
            />
            <Text style={[
              styles.tabText,
              selectedTab === tab.key && styles.activeTabText
            ]}>
              {tab.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Content */}
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {selectedTab === 'overview' && renderOverview()}
        {selectedTab === 'materials' && renderMaterials()}
        {selectedTab === 'plan' && renderPlan()}
      </ScrollView>

      {/* Study Timer Modal */}
      <Modal
        visible={showTimer}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowTimer(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.timerModal}>
            <Text style={styles.timerTitle}>Study Session</Text>
            {selectedCourse && (
              <Text style={styles.timerCourse}>{selectedCourse.name}</Text>
            )}
            <Text style={styles.timerDisplay}>{formatTime(studyTime)}</Text>
            
            <View style={styles.timerButtons}>
              <TouchableOpacity
                style={[styles.timerButton, styles.startButton]}
                onPress={() => setIsStudying(!isStudying)}
              >
                <Ionicons 
                  name={isStudying ? 'pause' : 'play'} 
                  size={24} 
                  color="#FFFFFF" 
                />
                <Text style={styles.timerButtonText}>
                  {isStudying ? 'Pause' : 'Start'}
                </Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[styles.timerButton, styles.stopButton]}
                onPress={stopStudySession}
              >
                <Ionicons name="stop" size={24} color="#FFFFFF" />
                <Text style={styles.timerButtonText}>Stop</Text>
              </TouchableOpacity>
            </View>
            
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setShowTimer(false)}
            >
              <Text style={styles.closeButtonText}>Close</Text>
            </TouchableOpacity>
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
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  activeTab: {
    borderBottomColor: '#4F46E5',
  },
  tabText: {
    marginLeft: 8,
    fontSize: 14,
    fontWeight: '600',
    color: '#64748B',
  },
  activeTabText: {
    color: '#4F46E5',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1E293B',
    marginBottom: 16,
  },
  statsContainer: {
    flexDirection: 'row',
    marginBottom: 24,
    gap: 12,
  },
  statCard: {
    flex: 1,
    borderRadius: 16,
    overflow: 'hidden',
  },
  statGradient: {
    padding: 20,
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 24,
    fontWeight: '800',
    color: '#FFFFFF',
    marginTop: 8,
  },
  statLabel: {
    fontSize: 12,
    color: '#FFFFFF',
    opacity: 0.9,
    marginTop: 4,
  },
  progressCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  progressText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1E293B',
  },
  progressPercent: {
    fontSize: 16,
    fontWeight: '700',
    color: '#4F46E5',
  },
  progressBar: {
    height: 8,
    backgroundColor: '#E2E8F0',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: 8,
    backgroundColor: '#4F46E5',
    borderRadius: 4,
  },
  quickActionsRow: {
    flexDirection: 'row',
    gap: 12,
  },
  quickActionCard: {
    width: 120,
    borderRadius: 16,
    overflow: 'hidden',
  },
  quickActionGradient: {
    padding: 16,
    alignItems: 'center',
  },
  quickActionIcon: {
    fontSize: 24,
    marginBottom: 8,
  },
  quickActionTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FFFFFF',
    textAlign: 'center',
  },
  quickActionSubtitle: {
    fontSize: 10,
    color: '#FFFFFF',
    opacity: 0.8,
    marginTop: 4,
  },
  activityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  activityIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  activityContent: {
    flex: 1,
  },
  activityTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1E293B',
  },
  activitySubtitle: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
  },
  tabContent: {
    paddingTop: 8,
  },
  materialCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  materialIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  materialContent: {
    flex: 1,
  },
  materialTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1E293B',
    marginBottom: 4,
  },
  materialSubtitle: {
    fontSize: 12,
    color: '#64748B',
    marginBottom: 8,
  },
  materialProgress: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  materialProgressBar: {
    flex: 1,
    height: 4,
    backgroundColor: '#E2E8F0',
    borderRadius: 2,
    marginRight: 8,
  },
  materialProgressFill: {
    height: 4,
    backgroundColor: '#10B981',
    borderRadius: 2,
  },
  materialProgressText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#10B981',
  },
  materialAction: {
    padding: 8,
  },
  planItem: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  planTime: {
    width: 80,
    paddingTop: 4,
  },
  planTimeText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#64748B',
  },
  planContent: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginLeft: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  planContentCompleted: {
    backgroundColor: '#F0FDF4',
    borderWidth: 1,
    borderColor: '#BBF7D0',
  },
  planHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  planTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1E293B',
    flex: 1,
  },
  planTitleCompleted: {
    textDecorationLine: 'line-through',
    color: '#64748B',
  },
  planCourse: {
    fontSize: 12,
    color: '#64748B',
  },
  priorityBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
    marginLeft: 8,
  },
  priorityText: {
    fontSize: 10,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  completedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#10B981',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: 'flex-start',
    marginTop: 8,
  },
  completedText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#FFFFFF',
    marginLeft: 4,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  timerModal: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 32,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
    width: width * 0.8,
  },
  timerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1E293B',
    marginBottom: 8,
  },
  timerCourse: {
    fontSize: 16,
    color: '#64748B',
    marginBottom: 24,
  },
  timerDisplay: {
    fontSize: 48,
    fontWeight: '800',
    color: '#4F46E5',
    marginBottom: 32,
    fontFamily: 'monospace',
  },
  timerButtons: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 24,
  },
  timerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
    gap: 8,
  },
  startButton: {
    backgroundColor: '#10B981',
  },
  stopButton: {
    backgroundColor: '#EF4444',
  },
  timerButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  closeButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
  },
  closeButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#64748B',
  },
});
