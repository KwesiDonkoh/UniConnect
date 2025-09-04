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
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { StatusBar } from 'expo-status-bar';
import { useApp } from '../context/AppContext';
import { Colors } from '../themes/modernTheme';

const { width, height } = Dimensions.get('window');

export default function EnhancedModernHomeDashboard({ navigation }) {
  const { user, csModules, notifications } = useApp();
  const [refreshing, setRefreshing] = useState(false);
  const [timeOfDay, setTimeOfDay] = useState('');

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;

  useEffect(() => {
    // Set time of day greeting
    const hour = new Date().getHours();
    if (hour < 12) setTimeOfDay('Good Morning');
    else if (hour < 17) setTimeOfDay('Good Afternoon');
    else setTimeOfDay('Good Evening');

    // Start animations
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 50,
        friction: 8,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 1500);
  };

  // Enhanced features with current colors
  const enhancedFeatures = [
    {
      id: 'smart-study',
      title: 'Smart Study Hub',
      subtitle: 'AI-powered learning experience',
      icon: 'library-outline',
      gradient: [Colors.primary[600], Colors.primary[500]],
      badge: 'NEW',
      onPress: () => navigation.navigate('Study'),
    },
    {
      id: 'intelligent-chat',
      title: 'Intelligent Chat',
      subtitle: 'Enhanced group discussions',
      icon: 'chatbubbles-outline',
      gradient: [Colors.success[600], Colors.success[500]],
      badge: 'ENHANCED',
      onPress: () => navigation.navigate('GroupChat'),
    },
    {
      id: 'performance-analytics',
      title: 'Performance Analytics',
      subtitle: 'Deep insights into your progress',
      icon: 'analytics-outline',
      gradient: [Colors.warning[500], Colors.warning[400]],
      badge: 'PRO',
      onPress: () => navigation.navigate('AcademicOverview'),
    },
    {
      id: 'ai-assistant',
      title: 'AI Study Assistant',
      subtitle: 'Your personal learning companion',
      icon: 'bulb-outline',
      gradient: [Colors.secondary[600], Colors.secondary[500]],
      badge: 'AI',
      onPress: () => navigation.navigate('AIStudyAssistant'),
    },
    {
      id: 'virtual-classroom',
      title: 'Virtual Classroom',
      subtitle: 'Immersive learning environment',
      icon: 'desktop-outline',
      gradient: [Colors.error[500], Colors.error[400]],
      badge: 'LIVE',
      onPress: () => navigation.navigate('ZoomMeeting'),
    },
    {
      id: 'smart-calendar',
      title: 'Smart Calendar',
      subtitle: 'Intelligent schedule management',
      icon: 'calendar-outline',
      gradient: [Colors.primary[500], Colors.primary[400]],
      badge: 'SMART',
      onPress: () => navigation.navigate('AcademicCalendar'),
    },
  ];

  // Enhanced stats with current colors
  const enhancedStats = [
    {
      title: 'Learning Score',
      value: '92',
      unit: '%',
      icon: 'trending-up',
      color: Colors.primary[500],
      change: '+8%',
      subtitle: 'This week',
    },
    {
      title: 'Study Hours',
      value: '24.5',
      unit: 'hrs',
      icon: 'time',
      color: Colors.success[500],
      change: '+3.2',
      subtitle: 'This week',
    },
    {
      title: 'Completed',
      value: '18',
      unit: '',
      icon: 'checkmark-circle',
      color: Colors.warning[500],
      change: '+5',
      subtitle: 'Assignments',
    },
    {
      title: 'Rank',
      value: '3',
      unit: 'rd',
      icon: 'trophy',
      color: Colors.error[500],
      change: '+1',
      subtitle: 'In class',
    },
  ];

  // Enhanced recommendations with current colors
  const recommendations = [
    {
      id: '1',
      title: 'Complete Data Structures Quiz',
      subtitle: 'Due in 2 days',
      icon: 'help-circle',
      color: Colors.warning[500],
      priority: 'high',
    },
    {
      id: '2',
      title: 'Join Algorithm Study Group',
      subtitle: 'Starting in 1 hour',
      icon: 'people',
      color: Colors.success[500],
      priority: 'medium',
    },
    {
      id: '3',
      title: 'Review Machine Learning Notes',
      subtitle: 'Exam next week',
      icon: 'document-text',
      color: Colors.primary[500],
      priority: 'high',
    },
  ];

  const renderEnhancedFeature = ({ item, index }) => (
    <Animated.View
      style={[
        styles.featureContainer,
        {
          transform: [{ scale: scaleAnim }],
          opacity: fadeAnim,
        },
      ]}
    >
      <TouchableOpacity
        style={styles.enhancedFeatureCard}
        onPress={item.onPress}
        activeOpacity={0.8}
      >
        <LinearGradient
          colors={item.gradient}
          style={styles.enhancedFeatureGradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          {item.badge && (
            <View style={styles.featureBadge}>
              <Text style={styles.badgeText}>{item.badge}</Text>
            </View>
          )}
          <View style={styles.enhancedFeatureIcon}>
            <Ionicons name={item.icon} size={32} color="white" />
          </View>
          <Text style={styles.enhancedFeatureTitle}>{item.title}</Text>
          <Text style={styles.enhancedFeatureSubtitle}>{item.subtitle}</Text>
        </LinearGradient>
      </TouchableOpacity>
    </Animated.View>
  );

  const renderEnhancedStat = ({ item }) => (
    <View style={styles.enhancedStatCard}>
      <View style={styles.statHeader}>
        <View style={[styles.enhancedStatIcon, { backgroundColor: `${item.color}15` }]}>
          <Ionicons name={item.icon} size={20} color={item.color} />
        </View>
        <View style={[styles.changeIndicator, { backgroundColor: Colors.success[100] }]}>
          <Text style={[styles.changeText, { color: Colors.success[600] }]}>{item.change}</Text>
        </View>
      </View>
      <View style={styles.statValueContainer}>
        <Text style={styles.enhancedStatValue}>{item.value}</Text>
        <Text style={styles.statUnit}>{item.unit}</Text>
      </View>
      <Text style={styles.enhancedStatTitle}>{item.title}</Text>
      <Text style={styles.statSubtitle}>{item.subtitle}</Text>
    </View>
  );

  const renderRecommendation = ({ item }) => (
    <View style={styles.recommendationCard}>
      <View style={[styles.recommendationIcon, { backgroundColor: `${item.color}15` }]}>
        <Ionicons name={item.icon} size={20} color={item.color} />
      </View>
      <View style={styles.recommendationContent}>
        <Text style={styles.recommendationTitle}>{item.title}</Text>
        <Text style={styles.recommendationSubtitle}>{item.subtitle}</Text>
      </View>
      <View style={[
        styles.priorityBadge,
        { backgroundColor: item.priority === 'high' ? Colors.error[100] : Colors.warning[100] }
      ]}>
        <Text style={[
          styles.priorityText,
          { color: item.priority === 'high' ? Colors.error[600] : Colors.warning[600] }
        ]}>
          {item.priority.toUpperCase()}
        </Text>
      </View>
    </View>
  );

  if (!user) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar style="light" />
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading enhanced dashboard...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="light" />
      
      {/* Enhanced Header */}
      <LinearGradient
        colors={[Colors.primary[600], Colors.primary[500], Colors.primary[400]]}
        style={styles.enhancedHeader}
      >
        <View style={styles.headerContent}>
          <View>
            <Text style={styles.timeGreeting}>{timeOfDay},</Text>
            <Text style={styles.userName}>{user.name || 'Student'}</Text>
            <Text style={styles.subtitle}>Enhanced learning experience awaits</Text>
          </View>
          <TouchableOpacity
            style={styles.profileButton}
            onPress={() => navigation.navigate('Profile')}
          >
            <LinearGradient
              colors={['rgba(255,255,255,0.2)', 'rgba(255,255,255,0.1)']}
              style={styles.profileGradient}
            >
              <Ionicons name="person" size={24} color="white" />
            </LinearGradient>
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
        {/* Enhanced Stats */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Performance Overview</Text>
          <FlatList
            data={enhancedStats}
            renderItem={renderEnhancedStat}
            keyExtractor={item => item.title}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.statsContainer}
          />
        </View>

        {/* Enhanced Features */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Enhanced Features</Text>
          <FlatList
            data={enhancedFeatures}
            renderItem={renderEnhancedFeature}
            keyExtractor={item => item.id}
            numColumns={2}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.enhancedFeaturesList}
          />
        </View>

        {/* Smart Recommendations */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Smart Recommendations</Text>
          <View style={styles.recommendationsContainer}>
            <FlatList
              data={recommendations}
              renderItem={renderRecommendation}
              keyExtractor={item => item.id}
              scrollEnabled={false}
            />
          </View>
        </View>

        {/* Quick Actions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <View style={styles.quickActionsGrid}>
            <TouchableOpacity
              style={styles.quickActionCard}
              onPress={() => navigation.navigate('UploadNotes')}
            >
              <LinearGradient
                colors={[Colors.primary[500], Colors.primary[400]]}
                style={styles.quickActionGradient}
              >
                <Ionicons name="cloud-upload-outline" size={24} color="white" />
                <Text style={styles.quickActionText}>Upload</Text>
              </LinearGradient>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.quickActionCard}
              onPress={() => navigation.navigate('Notifications')}
            >
              <LinearGradient
                colors={[Colors.warning[500], Colors.warning[400]]}
                style={styles.quickActionGradient}
              >
                <Ionicons name="notifications-outline" size={24} color="white" />
                <Text style={styles.quickActionText}>Alerts</Text>
              </LinearGradient>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.quickActionCard}
              onPress={() => navigation.navigate('ClassSchedule')}
            >
              <LinearGradient
                colors={[Colors.success[500], Colors.success[400]]}
                style={styles.quickActionGradient}
              >
                <Ionicons name="calendar-outline" size={24} color="white" />
                <Text style={styles.quickActionText}>Schedule</Text>
              </LinearGradient>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.quickActionCard}
              onPress={() => navigation.navigate('CourseRepresentative')}
            >
              <LinearGradient
                colors={[Colors.secondary[500], Colors.secondary[400]]}
                style={styles.quickActionGradient}
              >
                <Ionicons name="people-outline" size={24} color="white" />
                <Text style={styles.quickActionText}>Rep</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </View>
      </Animated.ScrollView>
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
  enhancedHeader: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 40,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  timeGreeting: {
    fontSize: 18,
    color: 'rgba(255,255,255,0.9)',
    marginBottom: 4,
  },
  userName: {
    fontSize: 32,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
  },
  profileButton: {
    borderRadius: 25,
    overflow: 'hidden',
  },
  profileGradient: {
    width: 50,
    height: 50,
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
    fontSize: 22,
    fontWeight: 'bold',
    color: Colors.neutral[800],
    marginBottom: 20,
  },
  statsContainer: {
    gap: 16,
  },
  enhancedStatCard: {
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 20,
    width: 160,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  statHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  enhancedStatIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
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
  statValueContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: 8,
  },
  enhancedStatValue: {
    fontSize: 28,
    fontWeight: 'bold',
    color: Colors.neutral[800],
  },
  statUnit: {
    fontSize: 16,
    color: Colors.neutral[600],
    marginLeft: 2,
  },
  enhancedStatTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.neutral[700],
    marginBottom: 2,
  },
  statSubtitle: {
    fontSize: 12,
    color: Colors.neutral[500],
  },
  enhancedFeaturesList: {
    gap: 16,
  },
  featureContainer: {
    flex: 1,
    marginHorizontal: 4,
  },
  enhancedFeatureCard: {
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 6,
  },
  enhancedFeatureGradient: {
    padding: 20,
    alignItems: 'center',
    minHeight: 140,
    position: 'relative',
  },
  featureBadge: {
    position: 'absolute',
    top: 12,
    right: 12,
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  badgeText: {
    color: 'white',
    fontSize: 10,
    fontWeight: 'bold',
  },
  enhancedFeatureIcon: {
    marginBottom: 12,
  },
  enhancedFeatureTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: 'white',
    textAlign: 'center',
    marginBottom: 6,
  },
  enhancedFeatureSubtitle: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.8)',
    textAlign: 'center',
  },
  recommendationsContainer: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  recommendationCard: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.neutral[100],
  },
  recommendationIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  recommendationContent: {
    flex: 1,
  },
  recommendationTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.neutral[800],
    marginBottom: 2,
  },
  recommendationSubtitle: {
    fontSize: 14,
    color: Colors.neutral[600],
  },
  priorityBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  priorityText: {
    fontSize: 10,
    fontWeight: 'bold',
  },
  quickActionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  quickActionCard: {
    flex: 1,
    minWidth: (width - 60) / 2,
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
    minHeight: 80,
  },
  quickActionText: {
    color: 'white',
    fontSize: 14,
    fontWeight: 'bold',
    marginTop: 8,
  },
});