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

export default function EnhancedLecturerDashboard({ navigation }) {
  const { user, csModules, notifications } = useApp();
  const [refreshing, setRefreshing] = useState(false);
  const [selectedView, setSelectedView] = useState('dashboard');

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(20)).current;

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

  // Enhanced teaching metrics with current colors
  const teachingMetrics = [
    {
      title: 'Total Students',
      value: '247',
      icon: 'people',
      color: Colors.primary[500],
      change: '+12',
      subtitle: 'Active enrollments',
    },
    {
      title: 'Course Rating',
      value: '4.8',
      icon: 'star',
      color: Colors.warning[500],
      change: '+0.3',
      subtitle: 'Student feedback',
    },
    {
      title: 'Assignments',
      value: '18',
      icon: 'clipboard',
      color: Colors.success[500],
      change: '+3',
      subtitle: 'This semester',
    },
    {
      title: 'Engagement',
      value: '92%',
      icon: 'trending-up',
      color: Colors.error[500],
      change: '+8%',
      subtitle: 'Class participation',
    },
  ];

  // Enhanced courses with current colors
  const enhancedCourses = csModules?.map((course, index) => ({
    ...course,
    students: Math.floor(Math.random() * 50) + 20,
    completion: Math.floor(Math.random() * 30) + 70,
    nextClass: `${Math.floor(Math.random() * 3) + 1} days`,
    assignments: Math.floor(Math.random() * 5) + 2,
    gradient: [
      [Colors.primary[600], Colors.primary[500]],
      [Colors.success[600], Colors.success[500]],
      [Colors.warning[500], Colors.warning[400]],
      [Colors.secondary[600], Colors.secondary[500]],
      [Colors.error[500], Colors.error[400]],
    ][index % 5],
  })) || [];

  // Enhanced teaching tools with current colors
  const teachingTools = [
    {
      id: 'ai-grading',
      title: 'AI Grading System',
      subtitle: 'Automated assessment tools',
      icon: 'checkmark-circle-outline',
      gradient: [Colors.success[600], Colors.success[500]],
      onPress: () => navigation.navigate('SmartGrading'),
    },
    {
      id: 'lecture-analytics',
      title: 'Lecture Analytics',
      subtitle: 'Student engagement insights',
      icon: 'analytics-outline',
      gradient: [Colors.primary[600], Colors.primary[500]],
      onPress: () => navigation.navigate('LectureAnalytics'),
    },
    {
      id: 'content-generator',
      title: 'Content Generator',
      subtitle: 'Create materials with AI',
      icon: 'bulb-outline',
      gradient: [Colors.secondary[600], Colors.secondary[500]],
      onPress: () => navigation.navigate('AIContentGenerator'),
    },
    {
      id: 'virtual-classroom',
      title: 'Virtual Classroom',
      subtitle: 'Interactive online sessions',
      icon: 'desktop-outline',
      gradient: [Colors.warning[500], Colors.warning[400]],
      onPress: () => navigation.navigate('VirtualClassroom'),
    },
  ];

  // Recent activities with current colors
  const recentActivities = [
    {
      id: '1',
      title: 'Assignment Graded',
      subtitle: 'Data Structures - 45 submissions',
      time: '2 hours ago',
      icon: 'checkmark-circle',
      color: Colors.success[500],
    },
    {
      id: '2',
      title: 'New Student Enrolled',
      subtitle: 'CSM251 - Database Systems',
      time: '4 hours ago',
      icon: 'person-add',
      color: Colors.primary[500],
    },
    {
      id: '3',
      title: 'Material Uploaded',
      subtitle: 'Algorithm Analysis Slides',
      time: '1 day ago',
      icon: 'cloud-upload',
      color: Colors.warning[500],
    },
    {
      id: '4',
      title: 'Quiz Created',
      subtitle: 'Machine Learning Basics',
      time: '2 days ago',
      icon: 'help-circle',
      color: Colors.secondary[500],
    },
  ];

  const renderMetric = ({ item }) => (
    <View style={styles.metricCard}>
      <View style={styles.metricHeader}>
        <View style={[styles.metricIcon, { backgroundColor: `${item.color}15` }]}>
          <Ionicons name={item.icon} size={24} color={item.color} />
        </View>
        <View style={styles.changeContainer}>
          <Ionicons name="trending-up" size={14} color={Colors.success[500]} />
          <Text style={[styles.changeText, { color: Colors.success[500] }]}>
            {item.change}
          </Text>
        </View>
      </View>
      <Text style={styles.metricValue}>{item.value}</Text>
      <Text style={styles.metricTitle}>{item.title}</Text>
      <Text style={styles.metricSubtitle}>{item.subtitle}</Text>
    </View>
  );

  const renderEnhancedCourse = ({ item, index }) => (
    <Animated.View
      style={[
        styles.courseContainer,
        {
          transform: [
            {
              translateY: slideAnim.interpolate({
                inputRange: [0, 20],
                outputRange: [0, 20],
              }),
            },
          ],
          opacity: fadeAnim,
        },
      ]}
    >
      <TouchableOpacity
        style={styles.enhancedCourseCard}
        onPress={() => navigation.navigate('StudentsManagement', { course: item })}
        activeOpacity={0.8}
      >
        <LinearGradient
          colors={item.gradient}
          style={styles.courseGradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <View style={styles.courseHeader}>
            <View>
              <Text style={styles.courseCode}>{item.code}</Text>
              <Text style={styles.courseName}>{item.name}</Text>
            </View>
            <View style={styles.studentCount}>
              <Ionicons name="people" size={16} color="white" />
              <Text style={styles.studentCountText}>{item.students}</Text>
            </View>
          </View>
          <View style={styles.courseStats}>
            <View style={styles.courseStat}>
              <Text style={styles.courseStatValue}>{item.completion}%</Text>
              <Text style={styles.courseStatLabel}>Completion</Text>
            </View>
            <View style={styles.courseStat}>
              <Text style={styles.courseStatValue}>{item.assignments}</Text>
              <Text style={styles.courseStatLabel}>Assignments</Text>
            </View>
            <View style={styles.courseStat}>
              <Text style={styles.courseStatValue}>{item.nextClass}</Text>
              <Text style={styles.courseStatLabel}>Next Class</Text>
            </View>
          </View>
        </LinearGradient>
      </TouchableOpacity>
    </Animated.View>
  );

  const renderTeachingTool = ({ item }) => (
    <TouchableOpacity
      style={styles.toolCard}
      onPress={item.onPress}
      activeOpacity={0.8}
    >
      <LinearGradient
        colors={item.gradient}
        style={styles.toolGradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <Ionicons name={item.icon} size={28} color="white" />
        <Text style={styles.toolTitle}>{item.title}</Text>
        <Text style={styles.toolSubtitle}>{item.subtitle}</Text>
      </LinearGradient>
    </TouchableOpacity>
  );

  const renderActivity = ({ item }) => (
    <View style={styles.activityItem}>
      <View style={[styles.activityIcon, { backgroundColor: `${item.color}15` }]}>
        <Ionicons name={item.icon} size={20} color={item.color} />
      </View>
      <View style={styles.activityContent}>
        <Text style={styles.activityTitle}>{item.title}</Text>
        <Text style={styles.activitySubtitle}>{item.subtitle}</Text>
      </View>
      <Text style={styles.activityTime}>{item.time}</Text>
    </View>
  );

  if (!user) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar style="light" />
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading enhanced lecturer dashboard...</Text>
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
            <Text style={styles.greeting}>Enhanced Teaching Hub</Text>
            <Text style={styles.userName}>Prof. {user.name || 'Lecturer'}</Text>
            <Text style={styles.subtitle}>Empowering education with technology</Text>
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
        {/* Teaching Metrics */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Teaching Overview</Text>
          <FlatList
            data={teachingMetrics}
            renderItem={renderMetric}
            keyExtractor={item => item.title}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.metricsContainer}
          />
        </View>

        {/* Enhanced Courses */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Your Courses</Text>
          <FlatList
            data={enhancedCourses}
            renderItem={renderEnhancedCourse}
            keyExtractor={item => item.id}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.coursesContainer}
          />
        </View>

        {/* Teaching Tools */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>AI Teaching Tools</Text>
          <FlatList
            data={teachingTools}
            renderItem={renderTeachingTool}
            keyExtractor={item => item.id}
            numColumns={2}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.toolsContainer}
          />
        </View>

        {/* Recent Activities */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Recent Activities</Text>
          <View style={styles.activitiesContainer}>
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
              onPress={() => navigation.navigate('UploadNotes')}
            >
              <LinearGradient
                colors={[Colors.primary[500], Colors.primary[400]]}
                style={styles.quickActionGradient}
              >
                <Ionicons name="cloud-upload-outline" size={24} color="white" />
                <Text style={styles.quickActionText}>Upload Material</Text>
              </LinearGradient>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.quickAction}
              onPress={() => navigation.navigate('StudentsManagement')}
            >
              <LinearGradient
                colors={[Colors.success[500], Colors.success[400]]}
                style={styles.quickActionGradient}
              >
                <Ionicons name="people-outline" size={24} color="white" />
                <Text style={styles.quickActionText}>Manage Students</Text>
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
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.neutral[800],
    marginBottom: 16,
  },
  metricsContainer: {
    gap: 16,
  },
  metricCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 16,
    width: 150,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  metricHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  metricIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  changeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  changeText: {
    fontSize: 12,
    fontWeight: '600',
  },
  metricValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.neutral[800],
    marginBottom: 4,
  },
  metricTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.neutral[700],
    marginBottom: 2,
  },
  metricSubtitle: {
    fontSize: 12,
    color: Colors.neutral[500],
  },
  coursesContainer: {
    gap: 16,
  },
  courseContainer: {
    marginBottom: 4,
  },
  enhancedCourseCard: {
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  courseGradient: {
    padding: 20,
  },
  courseHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  courseCode: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 4,
  },
  courseName: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
  },
  studentCount: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    gap: 6,
  },
  studentCountText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: 'white',
  },
  courseStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  courseStat: {
    alignItems: 'center',
  },
  courseStatValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 4,
  },
  courseStatLabel: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.8)',
  },
  toolsContainer: {
    gap: 16,
  },
  toolCard: {
    flex: 1,
    marginHorizontal: 4,
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  toolGradient: {
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 120,
  },
  toolTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: 'white',
    textAlign: 'center',
    marginTop: 12,
    marginBottom: 4,
  },
  toolSubtitle: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.8)',
    textAlign: 'center',
  },
  activitiesContainer: {
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
    fontSize: 14,
    fontWeight: 'bold',
    marginTop: 8,
  },
});