import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  Dimensions,
  Animated,
  FlatList,
  RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { StatusBar } from 'expo-status-bar';
import { useApp } from '../context/AppContext';
import { Colors } from '../themes/modernTheme';

// Import AI components
import AILectureAssistant from '../components/AILectureAssistant';
import SmartGradingSystem from '../components/SmartGradingSystem';
import LectureAnalyticsDashboard from '../components/LectureAnalyticsDashboard';
import AIContentGenerator from '../components/AIContentGenerator';
import AIQuizGenerator from '../components/AIQuizGenerator';
import SmartLectureRecorder from '../components/SmartLectureRecorder';
import VirtualClassroom from '../components/VirtualClassroom';
import AIPerformancePrediction from '../components/AIPerformancePrediction';
import AIPlagiarismDetector from '../components/AIPlagiarismDetector';

const { width, height } = Dimensions.get('window');

export default function UltimateAmazingLecturerDashboard({ navigation }) {
  // Enhanced safety checks with detailed error handling
  let appContext;
  let user = null;
  let csModules = [];
  
  try {
    appContext = useApp();
    console.log('🏫 UltimateLecturerDashboard - App context received:', {
      hasContext: !!appContext,
      hasUser: !!appContext?.user,
      hasCsModules: !!appContext?.csModules,
      contextKeys: appContext ? Object.keys(appContext) : []
    });
    
    // Safe destructuring with fallbacks
    if (appContext && typeof appContext === 'object') {
      user = appContext.user || null;
      csModules = appContext.csModules || [];
    }
  } catch (error) {
    console.error('❌ Error getting app context in UltimateLecturerDashboard:', error);
    appContext = {
      user: null,
      csModules: [],
      notifications: [],
      chatMessages: [],
      isAuthenticated: false,
      isLoading: true,
      signOut: () => {},
      updateUserData: () => {},
    };
    user = null;
    csModules = [];
  }

  const [refreshing, setRefreshing] = useState(false);
  const [showAILectureAssistant, setShowAILectureAssistant] = useState(false);
  const [showSmartGrading, setShowSmartGrading] = useState(false);
  const [showAnalytics, setShowAnalytics] = useState(false);
  const [showContentGenerator, setShowContentGenerator] = useState(false);
  const [showQuizGenerator, setShowQuizGenerator] = useState(false);
  const [showLectureRecorder, setShowLectureRecorder] = useState(false);
  const [showVirtualClassroom, setShowVirtualClassroom] = useState(false);
  const [showPerformancePrediction, setShowPerformancePrediction] = useState(false);
  const [showPlagiarismDetector, setShowPlagiarismDetector] = useState(false);

  // Early return if user data is not available
  if (!user) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar style="light" />
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading...</Text>
        </View>
      </SafeAreaView>
    );
  }

  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 800,
      useNativeDriver: true,
    }).start();
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 1000);
  };

  // AI Teaching Features with current colors
  const aiFeatures = [
    {
      id: 'lecture-assistant',
      title: 'AI Lecture Assistant',
      subtitle: 'Smart teaching companion',
      icon: 'school-outline',
      gradient: [Colors.primary[600], Colors.primary[500]],
      onPress: () => setShowAILectureAssistant(true),
    },
    {
      id: 'smart-grading',
      title: 'Smart Grading System',
      subtitle: 'Automated assessment',
      icon: 'checkmark-circle-outline',
      gradient: [Colors.success[600], Colors.success[500]],
      onPress: () => setShowSmartGrading(true),
    },
    {
      id: 'analytics',
      title: 'Lecture Analytics',
      subtitle: 'Performance insights',
      icon: 'analytics-outline',
      gradient: [Colors.warning[500], Colors.warning[400]],
      onPress: () => setShowAnalytics(true),
    },
    {
      id: 'content-generator',
      title: 'AI Content Generator',
      subtitle: 'Create materials instantly',
      icon: 'bulb-outline',
      gradient: [Colors.secondary[600], Colors.secondary[500]],
      onPress: () => setShowContentGenerator(true),
    },
    {
      id: 'quiz-generator',
      title: 'AI Quiz Generator',
      subtitle: 'Generate assessments',
      icon: 'help-circle-outline',
      gradient: [Colors.error[500], Colors.error[400]],
      onPress: () => setShowQuizGenerator(true),
    },
    {
      id: 'lecture-recorder',
      title: 'Smart Lecture Recorder',
      subtitle: 'Record with AI features',
      icon: 'videocam-outline',
      gradient: [Colors.primary[700], Colors.primary[600]],
      onPress: () => setShowLectureRecorder(true),
    },
    {
      id: 'plagiarism-detector',
      title: 'AI Plagiarism Detector',
      subtitle: 'Advanced plagiarism detection',
      icon: 'shield-checkmark-outline',
      gradient: [Colors.error[600], Colors.error[500]],
      onPress: () => setShowPlagiarismDetector(true),
    },
  ];

  // Quick Actions with current colors
  const quickActions = [
    {
      id: 'virtual-classroom',
      title: 'Virtual Classroom',
      icon: 'desktop-outline',
      color: Colors.primary[500],
      onPress: () => setShowVirtualClassroom(true),
    },
    {
      id: 'performance-prediction',
      title: 'Performance Prediction',
      icon: 'trending-up-outline',
      color: Colors.success[500],
      onPress: () => setShowPerformancePrediction(true),
    },
    {
      id: 'messaging',
      title: 'Student Messages',
      icon: 'mail-outline',
      color: Colors.warning[500],
      onPress: () => navigation.navigate('MessagingWithCalls'),
    },
    {
      id: 'materials',
      title: 'Upload Materials',
      icon: 'cloud-upload-outline',
      color: Colors.secondary[500],
      onPress: () => navigation.navigate('UploadNotes'),
    },
  ];

  const renderAIFeatureCard = ({ item }) => (
    <TouchableOpacity
      style={styles.aiFeatureCard}
      onPress={item.onPress}
      activeOpacity={0.8}
    >
      <LinearGradient
        colors={item.gradient}
        style={styles.aiFeatureGradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <View style={styles.aiFeatureIcon}>
          <Ionicons name={item.icon} size={32} color="white" />
        </View>
        <View style={styles.aiFeatureContent}>
          <Text style={styles.aiFeatureTitle}>{item.title}</Text>
          <Text style={styles.aiFeatureSubtitle}>{item.subtitle}</Text>
        </View>
        <Ionicons name="chevron-forward" size={24} color="rgba(255,255,255,0.8)" />
      </LinearGradient>
    </TouchableOpacity>
  );

  const renderQuickAction = ({ item }) => (
    <TouchableOpacity
      style={styles.quickActionCard}
      onPress={item.onPress}
      activeOpacity={0.8}
    >
      <View style={[styles.quickActionIcon, { backgroundColor: `${item.color}15` }]}>
        <Ionicons name={item.icon} size={28} color={item.color} />
      </View>
      <Text style={styles.quickActionTitle}>{item.title}</Text>
    </TouchableOpacity>
  );

  // Statistics with current colors
  const stats = [
    {
      title: 'Total Students',
      value: '127',
      icon: 'people',
      color: Colors.primary[500],
      change: '+12%',
    },
    {
      title: 'Active Courses',
      value: '8',
      icon: 'book',
      color: Colors.success[500],
      change: '+2',
    },
    {
      title: 'Avg. Performance',
      value: '87%',
      icon: 'trending-up',
      color: Colors.warning[500],
      change: '+5%',
    },
    {
      title: 'Engagement Rate',
      value: '94%',
      icon: 'heart',
      color: Colors.error[500],
      change: '+8%',
    },
  ];

  const renderStatCard = ({ item }) => (
    <View style={styles.statCard}>
      <View style={styles.statHeader}>
        <View style={[styles.statIconContainer, { backgroundColor: `${item.color}15` }]}>
          <Ionicons name={item.icon} size={24} color={item.color} />
        </View>
        <View style={[styles.changeIndicator, { backgroundColor: Colors.success[100] }]}>
          <Text style={[styles.changeText, { color: Colors.success[600] }]}>{item.change}</Text>
        </View>
      </View>
      <Text style={styles.statValue}>{item.value}</Text>
      <Text style={styles.statTitle}>{item.title}</Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="light" />
      
      {/* Header */}
      <LinearGradient
        colors={[Colors.primary[600], Colors.primary[500]]}
        style={styles.header}
      >
        <View style={styles.headerContent}>
          <View>
            <Text style={styles.greeting}>Welcome back,</Text>
            <Text style={styles.userName}>{user.name || 'Professor'}</Text>
            <Text style={styles.subtitle}>Ultimate Teaching Dashboard</Text>
          </View>
          <TouchableOpacity
            style={styles.profileButton}
            onPress={() => navigation.navigate('Profile')}
          >
            <View style={styles.avatarContainer}>
              <Ionicons name="person" size={24} color={Colors.primary[600]} />
            </View>
          </TouchableOpacity>
        </View>
      </LinearGradient>

      <Animated.ScrollView
        style={[styles.content, { opacity: fadeAnim }]}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        showsVerticalScrollIndicator={false}
      >
        {/* Statistics */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Teaching Overview</Text>
          <FlatList
            data={stats}
            renderItem={renderStatCard}
            keyExtractor={item => item.title}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.statsContainer}
          />
        </View>

        {/* AI Features */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>AI-Powered Teaching Tools</Text>
          <FlatList
            data={aiFeatures}
            renderItem={renderAIFeatureCard}
            keyExtractor={item => item.id}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.aiFeaturesList}
          />
        </View>

        {/* Quick Actions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <FlatList
            data={quickActions}
            renderItem={renderQuickAction}
            keyExtractor={item => item.id}
            numColumns={2}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.quickActionsList}
          />
        </View>

        {/* Recent Activity */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Recent Activity</Text>
          <View style={styles.activityCard}>
            <View style={styles.activityItem}>
              <View style={[styles.activityIcon, { backgroundColor: Colors.success[100] }]}>
                <Ionicons name="checkmark-circle" size={20} color={Colors.success[600]} />
              </View>
              <View style={styles.activityContent}>
                <Text style={styles.activityTitle}>Assignment Graded</Text>
                <Text style={styles.activityTime}>2 hours ago</Text>
              </View>
            </View>
            <View style={styles.activityItem}>
              <View style={[styles.activityIcon, { backgroundColor: Colors.primary[100] }]}>
                <Ionicons name="people" size={20} color={Colors.primary[600]} />
              </View>
              <View style={styles.activityContent}>
                <Text style={styles.activityTitle}>New Student Enrolled</Text>
                <Text style={styles.activityTime}>5 hours ago</Text>
              </View>
            </View>
            <View style={styles.activityItem}>
              <View style={[styles.activityIcon, { backgroundColor: Colors.warning[100] }]}>
                <Ionicons name="document-text" size={20} color={Colors.warning[600]} />
              </View>
              <View style={styles.activityContent}>
                <Text style={styles.activityTitle}>Material Uploaded</Text>
                <Text style={styles.activityTime}>1 day ago</Text>
              </View>
            </View>
          </View>
        </View>
      </Animated.ScrollView>

      {/* AI Component Modals */}
      {showAILectureAssistant && (
        <AILectureAssistant
          visible={showAILectureAssistant}
          onClose={() => setShowAILectureAssistant(false)}
          user={user}
          course={csModules[0]}
        />
      )}

      {showSmartGrading && (
        <SmartGradingSystem
          visible={showSmartGrading}
          onClose={() => setShowSmartGrading(false)}
          user={user}
          course={csModules[0]}
        />
      )}

      {showAnalytics && (
        <LectureAnalyticsDashboard
          visible={showAnalytics}
          onClose={() => setShowAnalytics(false)}
          user={user}
          course={csModules[0]}
        />
      )}

      {showContentGenerator && (
        <AIContentGenerator
          visible={showContentGenerator}
          onClose={() => setShowContentGenerator(false)}
          user={user}
          course={csModules[0]}
        />
      )}

      {showQuizGenerator && (
        <AIQuizGenerator
          visible={showQuizGenerator}
          onClose={() => setShowQuizGenerator(false)}
          user={user}
          course={csModules[0]}
        />
      )}

      {showLectureRecorder && (
        <SmartLectureRecorder
          visible={showLectureRecorder}
          onClose={() => setShowLectureRecorder(false)}
          user={user}
          course={csModules[0]}
        />
      )}

      {showVirtualClassroom && (
        <VirtualClassroom
          visible={showVirtualClassroom}
          onClose={() => setShowVirtualClassroom(false)}
          user={user}
          course={csModules[0]}
        />
      )}

      {showPerformancePrediction && (
        <AIPerformancePrediction
          visible={showPerformancePrediction}
          onClose={() => setShowPerformancePrediction(false)}
          user={user}
          course={csModules[0]}
        />
      )}

      {showPlagiarismDetector && (
        <AIPlagiarismDetector
          visible={showPlagiarismDetector}
          onClose={() => setShowPlagiarismDetector(false)}
          user={user}
          course={csModules[0]}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.neutral[50],
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: Colors.neutral[600],
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 30,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  greeting: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.8)',
    marginBottom: 4,
  },
  userName: {
    fontSize: 28,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.7)',
  },
  profileButton: {
    padding: 4,
  },
  avatarContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'white',
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    flex: 1,
  },
  section: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.neutral[800],
    marginBottom: 16,
  },
  statsContainer: {
    gap: 12,
  },
  statCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 16,
    width: 140,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  statIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  changeIndicator: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  changeText: {
    fontSize: 12,
    fontWeight: '600',
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.neutral[800],
    marginBottom: 4,
  },
  statTitle: {
    fontSize: 12,
    color: Colors.neutral[600],
    fontWeight: '500',
  },
  aiFeaturesList: {
    gap: 12,
  },
  aiFeatureCard: {
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  aiFeatureGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
  },
  aiFeatureIcon: {
    marginRight: 16,
  },
  aiFeatureContent: {
    flex: 1,
  },
  aiFeatureTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 4,
  },
  aiFeatureSubtitle: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
  },
  quickActionsList: {
    gap: 12,
  },
  quickActionCard: {
    flex: 1,
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    marginHorizontal: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  quickActionIcon: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  quickActionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.neutral[700],
    textAlign: 'center',
  },
  activityCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  activityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.neutral[100],
  },
  activityIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  activityContent: {
    flex: 1,
  },
  activityTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.neutral[800],
    marginBottom: 2,
  },
  activityTime: {
    fontSize: 14,
    color: Colors.neutral[500],
  },
});
