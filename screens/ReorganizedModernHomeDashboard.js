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

export default function ReorganizedModernHomeDashboard({ navigation }) {
  const { user, csModules, notifications } = useApp();
  const [refreshing, setRefreshing] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('all');

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;

  useEffect(() => {
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
    ]).start();
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 1500);
  };

  // Reorganized categories with current colors
  const categories = [
    { id: 'all', name: 'All', icon: 'grid-outline', color: Colors.neutral[600] },
    { id: 'study', name: 'Study', icon: 'book-outline', color: Colors.primary[500] },
    { id: 'assignments', name: 'Tasks', icon: 'clipboard-outline', color: Colors.warning[500] },
    { id: 'communication', name: 'Chat', icon: 'chatbubbles-outline', color: Colors.success[500] },
    { id: 'ai', name: 'AI Tools', icon: 'bulb-outline', color: Colors.secondary[500] },
  ];

  // Reorganized features with current colors
  const features = [
    // Study Features
    {
      id: 'study-materials',
      title: 'Study Materials',
      subtitle: 'Access your course content',
      icon: 'library-outline',
      category: 'study',
      gradient: [Colors.primary[600], Colors.primary[500]],
      onPress: () => navigation.navigate('Study'),
    },
    {
      id: 'academic-overview',
      title: 'Academic Overview',
      subtitle: 'Track your progress',
      icon: 'analytics-outline',
      category: 'study',
      gradient: [Colors.primary[500], Colors.primary[400]],
      onPress: () => navigation.navigate('AcademicOverview'),
    },
    {
      id: 'semester-modules',
      title: 'Semester Modules',
      subtitle: 'View current courses',
      icon: 'school-outline',
      category: 'study',
      gradient: [Colors.primary[700], Colors.primary[600]],
      onPress: () => navigation.navigate('SemesterModules'),
    },

    // Assignment Features
    {
      id: 'assignments',
      title: 'Assignments',
      subtitle: 'Manage your tasks',
      icon: 'clipboard-outline',
      category: 'assignments',
      gradient: [Colors.warning[500], Colors.warning[400]],
      onPress: () => navigation.navigate('Gradebook'),
    },
    {
      id: 'calendar',
      title: 'Academic Calendar',
      subtitle: 'Important dates',
      icon: 'calendar-outline',
      category: 'assignments',
      gradient: [Colors.warning[600], Colors.warning[500]],
      onPress: () => navigation.navigate('AcademicCalendar'),
    },
    {
      id: 'results',
      title: 'Academic Results',
      subtitle: 'View your grades',
      icon: 'trophy-outline',
      category: 'assignments',
      gradient: [Colors.warning[400], Colors.warning[300]],
      onPress: () => navigation.navigate('AcademicResults'),
    },

    // Communication Features
    {
      id: 'group-chat',
      title: 'Group Discussion',
      subtitle: 'Connect with classmates',
      icon: 'people-outline',
      category: 'communication',
      gradient: [Colors.success[600], Colors.success[500]],
      onPress: () => navigation.navigate('GroupChat'),
    },
    {
      id: 'private-messaging',
      title: 'Private Messages',
      subtitle: 'Direct conversations',
      icon: 'mail-outline',
      category: 'communication',
      gradient: [Colors.success[500], Colors.success[400]],
      onPress: () => navigation.navigate('MessagingWithCalls'),
    },
    {
      id: 'zoom-meetings',
      title: 'Virtual Meetings',
      subtitle: 'Join online classes',
      icon: 'videocam-outline',
      category: 'communication',
      gradient: [Colors.success[700], Colors.success[600]],
      onPress: () => navigation.navigate('ZoomMeeting'),
    },

    // AI Features
    {
      id: 'ai-study',
      title: 'AI Study Assistant',
      subtitle: 'Smart learning companion',
      icon: 'bulb-outline',
      category: 'ai',
      gradient: [Colors.secondary[600], Colors.secondary[500]],
      onPress: () => navigation.navigate('AIStudyAssistant'),
    },
    {
      id: 'ai-quiz',
      title: 'AI Quiz Generator',
      subtitle: 'Create practice tests',
      icon: 'help-circle-outline',
      category: 'ai',
      gradient: [Colors.secondary[500], Colors.secondary[400]],
      onPress: () => navigation.navigate('AIQuizGenerator'),
    },
    {
      id: 'ai-performance',
      title: 'Performance Prediction',
      subtitle: 'AI-powered insights',
      icon: 'trending-up-outline',
      category: 'ai',
      gradient: [Colors.secondary[700], Colors.secondary[600]],
      onPress: () => navigation.navigate('AIPerformancePrediction'),
    },
  ];

  // Filter features based on selected category
  const filteredFeatures = selectedCategory === 'all' 
    ? features 
    : features.filter(feature => feature.category === selectedCategory);

  // Quick stats with current colors
  const quickStats = [
    {
      title: 'GPA',
      value: '3.8',
      icon: 'star',
      color: Colors.primary[500],
      trend: '+0.2',
    },
    {
      title: 'Courses',
      value: csModules?.length?.toString() || '0',
      icon: 'book',
      color: Colors.success[500],
      trend: '+1',
    },
    {
      title: 'Tasks',
      value: '8',
      icon: 'clipboard',
      color: Colors.warning[500],
      trend: '-2',
    },
    {
      title: 'Streak',
      value: '12',
      icon: 'flame',
      color: Colors.error[500],
      trend: '+1',
    },
  ];

  const renderCategory = ({ item }) => (
    <TouchableOpacity
      style={[
        styles.categoryButton,
        selectedCategory === item.id && styles.activeCategoryButton,
        { borderColor: item.color }
      ]}
      onPress={() => setSelectedCategory(item.id)}
    >
      <Ionicons 
        name={item.icon} 
        size={20} 
        color={selectedCategory === item.id ? 'white' : item.color} 
      />
      <Text 
        style={[
          styles.categoryText,
          selectedCategory === item.id && styles.activeCategoryText,
          { color: selectedCategory === item.id ? 'white' : item.color }
        ]}
      >
        {item.name}
      </Text>
    </TouchableOpacity>
  );

  const renderFeature = ({ item, index }) => (
    <Animated.View
      style={[
        styles.featureContainer,
        {
          transform: [
            {
              translateY: slideAnim.interpolate({
                inputRange: [0, 30],
                outputRange: [0, 30],
              }),
            },
          ],
          opacity: fadeAnim,
        },
      ]}
    >
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
    </Animated.View>
  );

  const renderQuickStat = ({ item }) => (
    <View style={styles.statCard}>
      <View style={[styles.statIcon, { backgroundColor: `${item.color}15` }]}>
        <Ionicons name={item.icon} size={24} color={item.color} />
      </View>
      <Text style={styles.statValue}>{item.value}</Text>
      <Text style={styles.statTitle}>{item.title}</Text>
      <View style={styles.trendContainer}>
        <Ionicons 
          name={item.trend.startsWith('+') ? 'trending-up' : 'trending-down'} 
          size={12} 
          color={item.trend.startsWith('+') ? Colors.success[500] : Colors.error[500]} 
        />
        <Text 
          style={[
            styles.trendText,
            { color: item.trend.startsWith('+') ? Colors.success[500] : Colors.error[500] }
          ]}
        >
          {item.trend}
        </Text>
      </View>
    </View>
  );

  if (!user) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar style="light" />
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading reorganized dashboard...</Text>
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
            <Text style={styles.greeting}>Welcome back,</Text>
            <Text style={styles.userName}>{user.name || 'Student'}</Text>
            <Text style={styles.subtitle}>Reorganized for better experience</Text>
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
          <Text style={styles.sectionTitle}>Quick Overview</Text>
          <FlatList
            data={quickStats}
            renderItem={renderQuickStat}
            keyExtractor={item => item.title}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.statsContainer}
          />
        </View>

        {/* Category Filter */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Categories</Text>
          <FlatList
            data={categories}
            renderItem={renderCategory}
            keyExtractor={item => item.id}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.categoriesContainer}
          />
        </View>

        {/* Features */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            {selectedCategory === 'all' ? 'All Features' : 
             categories.find(cat => cat.id === selectedCategory)?.name + ' Features'}
          </Text>
          <FlatList
            data={filteredFeatures}
            renderItem={renderFeature}
            keyExtractor={item => item.id}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.featuresList}
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
                <Text style={styles.activityTitle}>Assignment Submitted</Text>
                <Text style={styles.activityTime}>2 hours ago</Text>
              </View>
            </View>
            <View style={styles.activityItem}>
              <View style={[styles.activityIcon, { backgroundColor: Colors.primary[100] }]}>
                <Ionicons name="book" size={20} color={Colors.primary[600]} />
              </View>
              <View style={styles.activityContent}>
                <Text style={styles.activityTitle}>Study Session Completed</Text>
                <Text style={styles.activityTime}>5 hours ago</Text>
              </View>
            </View>
            <View style={styles.activityItem}>
              <View style={[styles.activityIcon, { backgroundColor: Colors.warning[100] }]}>
                <Ionicons name="mail" size={20} color={Colors.warning[600]} />
              </View>
              <View style={styles.activityContent}>
                <Text style={styles.activityTitle}>New Message Received</Text>
                <Text style={styles.activityTime}>1 day ago</Text>
              </View>
            </View>
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
    width: 120,
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
    marginBottom: 8,
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
    marginBottom: 4,
  },
  trendContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  trendText: {
    fontSize: 12,
    fontWeight: '600',
  },
  categoriesContainer: {
    gap: 12,
  },
  categoryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    backgroundColor: 'white',
    gap: 8,
  },
  activeCategoryButton: {
    backgroundColor: Colors.primary[500],
    borderColor: Colors.primary[500],
  },
  categoryText: {
    fontSize: 14,
    fontWeight: '600',
  },
  activeCategoryText: {
    color: 'white',
  },
  featuresList: {
    gap: 12,
  },
  featureContainer: {
    marginBottom: 4,
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
  activityCard: {
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
  activityTime: {
    fontSize: 12,
    color: Colors.neutral[500],
  },
});