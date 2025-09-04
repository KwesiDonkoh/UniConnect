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
  RefreshControl,
  FlatList,
  Modal,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { StatusBar } from 'expo-status-bar';
import { useApp } from '../context/AppContext';
import { Colors } from '../themes/modernTheme';

// Import AI components
import AIStudyAssistant from '../components/AIStudyAssistant';
import AIPerformancePrediction from '../components/AIPerformancePrediction';
import AIQuizGenerator from '../components/AIQuizGenerator';
import SmartNoteTaking from '../components/SmartNoteTaking';
import GamifiedProgress from '../components/GamifiedProgress';

const { width, height } = Dimensions.get('window');

export default function AmazingStudentDashboard({ navigation }) {
  const { user, csModules, notifications } = useApp();
  const [refreshing, setRefreshing] = useState(false);
  const [selectedFeature, setSelectedFeature] = useState(null);
  
  // AI Feature states
  const [showAIAssistant, setShowAIAssistant] = useState(false);
  const [showPerformancePrediction, setShowPerformancePrediction] = useState(false);
  const [showQuizGenerator, setShowQuizGenerator] = useState(false);
  const [showSmartNotes, setShowSmartNotes] = useState(false);
  const [showGamifiedProgress, setShowGamifiedProgress] = useState(false);

  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 1000,
      useNativeDriver: true,
    }).start();
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 1500);
  };

  // Amazing features with current colors
  const amazingFeatures = [
    {
      id: 'ai-assistant',
      title: 'AI Study Assistant',
      subtitle: 'Your personal learning companion',
      icon: 'school-outline',
      gradient: [Colors.primary[600], Colors.primary[500]],
      onPress: () => setShowAIAssistant(true),
    },
    {
      id: 'performance',
      title: 'Performance Prediction',
      subtitle: 'Track your academic progress',
      icon: 'trending-up-outline',
      gradient: [Colors.success[600], Colors.success[500]],
      onPress: () => setShowPerformancePrediction(true),
    },
    {
      id: 'quiz-generator',
      title: 'Smart Quiz Generator',
      subtitle: 'Create practice tests instantly',
      icon: 'help-circle-outline',
      gradient: [Colors.warning[500], Colors.warning[400]],
      onPress: () => setShowQuizGenerator(true),
    },
    {
      id: 'smart-notes',
      title: 'Smart Note Taking',
      subtitle: 'Intelligent note organization',
      icon: 'document-text-outline',
      gradient: [Colors.secondary[600], Colors.secondary[500]],
      onPress: () => setShowSmartNotes(true),
    },
    {
      id: 'gamified',
      title: 'Gamified Progress',
      subtitle: 'Make learning fun and rewarding',
      icon: 'trophy-outline',
      gradient: [Colors.error[500], Colors.error[400]],
      onPress: () => setShowGamifiedProgress(true),
    },
  ];

  // Quick stats with current colors
  const quickStats = [
    {
      title: 'Current GPA',
      value: '3.8',
      icon: 'school',
      color: Colors.primary[500],
      subtitle: 'Excellent performance',
    },
    {
      title: 'Courses',
      value: csModules?.length || '0',
      icon: 'book',
      color: Colors.success[500],
      subtitle: 'Active enrollments',
    },
    {
      title: 'Assignments',
      value: '12',
      icon: 'clipboard',
      color: Colors.warning[500],
      subtitle: 'Pending submissions',
    },
    {
      title: 'Study Streak',
      value: '7 days',
      icon: 'flame',
      color: Colors.error[500],
      subtitle: 'Keep it up!',
    },
  ];

  // Recent activities with current colors
  const recentActivities = [
    {
      id: '1',
      title: 'Completed Quiz: Data Structures',
      subtitle: 'Score: 85%',
      time: '2 hours ago',
      icon: 'checkmark-circle',
      color: Colors.success[500],
    },
    {
      id: '2',
      title: 'New Assignment: Algorithm Analysis',
      subtitle: 'Due in 3 days',
      time: '5 hours ago',
      icon: 'document-text',
      color: Colors.warning[500],
    },
    {
      id: '3',
      title: 'Study Session: Machine Learning',
      subtitle: 'Duration: 2.5 hours',
      time: '1 day ago',
      icon: 'time',
      color: Colors.primary[500],
    },
  ];

  const renderAmazingFeature = ({ item }) => (
    <TouchableOpacity
      style={styles.featureCard}
      onPress={item.onPress}
      activeOpacity={0.8}
    >
      <LinearGradient
        colors={item.gradient}
        style={styles.featureGradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <View style={styles.featureIcon}>
          <Ionicons name={item.icon} size={28} color="white" />
        </View>
        <View style={styles.featureContent}>
          <Text style={styles.featureTitle}>{item.title}</Text>
          <Text style={styles.featureSubtitle}>{item.subtitle}</Text>
        </View>
        <Ionicons name="chevron-forward" size={20} color="rgba(255,255,255,0.8)" />
      </LinearGradient>
    </TouchableOpacity>
  );

  const renderQuickStat = ({ item }) => (
    <View style={styles.statCard}>
      <View style={[styles.statIcon, { backgroundColor: `${item.color}15` }]}>
        <Ionicons name={item.icon} size={24} color={item.color} />
      </View>
      <Text style={styles.statValue}>{item.value}</Text>
      <Text style={styles.statTitle}>{item.title}</Text>
      <Text style={styles.statSubtitle}>{item.subtitle}</Text>
    </View>
  );

  const renderActivity = ({ item }) => (
    <View style={styles.activityItem}>
      <View style={[styles.activityIcon, { backgroundColor: `${item.color}15` }]}>
        <Ionicons name={item.icon} size={20} color={item.color} />
      </View>
      <View style={styles.activityContent}>
        <Text style={styles.activityTitle}>{item.title}</Text>
        <Text style={styles.activitySubtitle}>{item.subtitle}</Text>
        <Text style={styles.activityTime}>{item.time}</Text>
      </View>
    </View>
  );

  if (!user) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar style="light" />
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading amazing features...</Text>
        </View>
      </SafeAreaView>
    );
  }

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
            <Text style={styles.greeting}>Hello,</Text>
            <Text style={styles.userName}>{user.name || 'Student'}</Text>
            <Text style={styles.subtitle}>Ready for amazing learning?</Text>
          </View>
          <TouchableOpacity
            style={styles.notificationButton}
            onPress={() => navigation.navigate('Notifications')}
          >
            <Ionicons name="notifications-outline" size={24} color="white" />
            {notifications?.length > 0 && (
              <View style={styles.notificationBadge}>
                <Text style={styles.badgeText}>{notifications.length}</Text>
              </View>
            )}
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
        {/* Quick Stats */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Your Progress</Text>
          <FlatList
            data={quickStats}
            renderItem={renderQuickStat}
            keyExtractor={item => item.title}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.statsContainer}
          />
        </View>

        {/* Amazing Features */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Amazing AI Features</Text>
          <FlatList
            data={amazingFeatures}
            renderItem={renderAmazingFeature}
            keyExtractor={item => item.id}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.featuresList}
          />
        </View>

        {/* Recent Activities */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Recent Activities</Text>
          <View style={styles.activitiesCard}>
            <FlatList
              data={recentActivities}
              renderItem={renderActivity}
              keyExtractor={item => item.id}
              scrollEnabled={false}
            />
          </View>
        </View>

        {/* Quick Actions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <View style={styles.quickActions}>
            <TouchableOpacity
              style={styles.quickAction}
              onPress={() => navigation.navigate('Study')}
            >
              <LinearGradient
                colors={[Colors.primary[500], Colors.primary[400]]}
                style={styles.quickActionGradient}
              >
                <Ionicons name="book-outline" size={24} color="white" />
                <Text style={styles.quickActionText}>Study Now</Text>
              </LinearGradient>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.quickAction}
              onPress={() => navigation.navigate('GroupChat')}
            >
              <LinearGradient
                colors={[Colors.success[500], Colors.success[400]]}
                style={styles.quickActionGradient}
              >
                <Ionicons name="people-outline" size={24} color="white" />
                <Text style={styles.quickActionText}>Join Discussion</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </View>
      </Animated.ScrollView>

      {/* AI Component Modals */}
      {showAIAssistant && (
        <AIStudyAssistant
          visible={showAIAssistant}
          onClose={() => setShowAIAssistant(false)}
          user={user}
          course={csModules?.[0]}
        />
      )}

      {showPerformancePrediction && (
        <AIPerformancePrediction
          visible={showPerformancePrediction}
          onClose={() => setShowPerformancePrediction(false)}
          user={user}
          course={csModules?.[0]}
        />
      )}

      {showQuizGenerator && (
        <AIQuizGenerator
          visible={showQuizGenerator}
          onClose={() => setShowQuizGenerator(false)}
          user={user}
          course={csModules?.[0]}
        />
      )}

      {showSmartNotes && (
        <SmartNoteTaking
          visible={showSmartNotes}
          onClose={() => setShowSmartNotes(false)}
          user={user}
          course={csModules?.[0]}
        />
      )}

      {showGamifiedProgress && (
        <GamifiedProgress
          visible={showGamifiedProgress}
          onClose={() => setShowGamifiedProgress(false)}
          user={user}
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
  notificationButton: {
    position: 'relative',
    padding: 8,
  },
  notificationBadge: {
    position: 'absolute',
    top: 4,
    right: 4,
    backgroundColor: Colors.error[500],
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  badgeText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
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
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.neutral[800],
    marginBottom: 4,
  },
  statTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.neutral[700],
    marginBottom: 2,
  },
  statSubtitle: {
    fontSize: 12,
    color: Colors.neutral[500],
    textAlign: 'center',
  },
  featuresList: {
    gap: 12,
  },
  featureCard: {
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  featureGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 18,
  },
  featureIcon: {
    marginRight: 16,
  },
  featureContent: {
    flex: 1,
  },
  featureTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 4,
  },
  featureSubtitle: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
  },
  activitiesCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 16,
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
  activitySubtitle: {
    fontSize: 14,
    color: Colors.neutral[600],
    marginBottom: 2,
  },
  activityTime: {
    fontSize: 12,
    color: Colors.neutral[500],
  },
  quickActions: {
    flexDirection: 'row',
    gap: 12,
  },
  quickAction: {
    flex: 1,
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  quickActionGradient: {
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  quickActionText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: 8,
  },
});