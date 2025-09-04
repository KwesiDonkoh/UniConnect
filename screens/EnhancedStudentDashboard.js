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

export default function EnhancedStudentDashboard({ navigation }) {
  const { user, csModules, notifications } = useApp();
  const [refreshing, setRefreshing] = useState(false);
  const [selectedTab, setSelectedTab] = useState('overview');

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

  // Enhanced tabs with current colors
  const tabs = [
    { id: 'overview', name: 'Overview', icon: 'grid-outline' },
    { id: 'courses', name: 'Courses', icon: 'book-outline' },
    { id: 'assignments', name: 'Tasks', icon: 'clipboard-outline' },
    { id: 'progress', name: 'Progress', icon: 'trending-up-outline' },
  ];

  // Enhanced metrics with current colors
  const metrics = [
    {
      title: 'Overall GPA',
      value: '3.85',
      icon: 'school',
      color: Colors.primary[500],
      trend: '+0.15',
      description: 'Excellent progress',
    },
    {
      title: 'Credits Earned',
      value: '48',
      icon: 'trophy',
      color: Colors.success[500],
      trend: '+6',
      description: 'This semester',
    },
    {
      title: 'Attendance',
      value: '94%',
      icon: 'calendar',
      color: Colors.warning[500],
      trend: '+2%',
      description: 'Above average',
    },
    {
      title: 'Study Hours',
      value: '127',
      icon: 'time',
      color: Colors.error[500],
      trend: '+23',
      description: 'This month',
    },
  ];

  // Enhanced course cards with current colors
  const enhancedCourses = csModules?.map((course, index) => ({
    ...course,
    progress: Math.floor(Math.random() * 40) + 60, // Random progress 60-100%
    nextClass: `${Math.floor(Math.random() * 3) + 1} days`,
    assignments: Math.floor(Math.random() * 5) + 1,
    gradient: [
      [Colors.primary[600], Colors.primary[500]],
      [Colors.success[600], Colors.success[500]],
      [Colors.warning[500], Colors.warning[400]],
      [Colors.secondary[600], Colors.secondary[500]],
      [Colors.error[500], Colors.error[400]],
    ][index % 5],
  })) || [];

  // Enhanced assignments with current colors
  const assignments = [
    {
      id: '1',
      title: 'Data Structures Final Project',
      course: 'CSM251',
      dueDate: '2 days',
      priority: 'high',
      progress: 75,
      color: Colors.error[500],
    },
    {
      id: '2',
      title: 'Algorithm Analysis Report',
      course: 'CSM253',
      dueDate: '5 days',
      priority: 'medium',
      progress: 45,
      color: Colors.warning[500],
    },
    {
      id: '3',
      title: 'Database Design Quiz',
      course: 'CSM257',
      dueDate: '1 week',
      priority: 'low',
      progress: 20,
      color: Colors.success[500],
    },
  ];

  const renderTab = ({ item }) => (
    <TouchableOpacity
      style={[
        styles.tab,
        selectedTab === item.id && styles.activeTab,
      ]}
      onPress={() => setSelectedTab(item.id)}
    >
      <Ionicons 
        name={item.icon} 
        size={20} 
        color={selectedTab === item.id ? Colors.primary[600] : Colors.neutral[500]} 
      />
      <Text 
        style={[
          styles.tabText,
          selectedTab === item.id && styles.activeTabText,
        ]}
      >
        {item.name}
      </Text>
    </TouchableOpacity>
  );

  const renderMetric = ({ item }) => (
    <View style={styles.metricCard}>
      <View style={styles.metricHeader}>
        <View style={[styles.metricIcon, { backgroundColor: `${item.color}15` }]}>
          <Ionicons name={item.icon} size={24} color={item.color} />
        </View>
        <View style={styles.trendContainer}>
          <Ionicons 
            name={item.trend.startsWith('+') ? 'trending-up' : 'trending-down'} 
            size={16} 
            color={Colors.success[500]} 
          />
          <Text style={[styles.trendText, { color: Colors.success[500] }]}>
            {item.trend}
          </Text>
        </View>
      </View>
      <Text style={styles.metricValue}>{item.value}</Text>
      <Text style={styles.metricTitle}>{item.title}</Text>
      <Text style={styles.metricDescription}>{item.description}</Text>
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
        style={styles.enhancedCourseCard}
        onPress={() => navigation.navigate('Study', { course: item })}
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
            <View style={styles.progressCircle}>
              <Text style={styles.progressText}>{item.progress}%</Text>
            </View>
          </View>
          <View style={styles.courseFooter}>
            <View style={styles.courseInfo}>
              <Ionicons name="calendar-outline" size={16} color="rgba(255,255,255,0.8)" />
              <Text style={styles.courseInfoText}>Next: {item.nextClass}</Text>
            </View>
            <View style={styles.courseInfo}>
              <Ionicons name="clipboard-outline" size={16} color="rgba(255,255,255,0.8)" />
              <Text style={styles.courseInfoText}>{item.assignments} tasks</Text>
            </View>
          </View>
        </LinearGradient>
      </TouchableOpacity>
    </Animated.View>
  );

  const renderAssignment = ({ item }) => (
    <View style={styles.assignmentCard}>
      <View style={[styles.assignmentIcon, { backgroundColor: `${item.color}15` }]}>
        <Ionicons name="clipboard" size={20} color={item.color} />
      </View>
      <View style={styles.assignmentContent}>
        <Text style={styles.assignmentTitle}>{item.title}</Text>
        <Text style={styles.assignmentCourse}>{item.course}</Text>
        <View style={styles.progressBar}>
          <View 
            style={[
              styles.progressFill, 
              { width: `${item.progress}%`, backgroundColor: item.color }
            ]} 
          />
        </View>
        <Text style={styles.progressLabel}>{item.progress}% complete</Text>
      </View>
      <View style={styles.assignmentMeta}>
        <Text style={styles.dueDate}>Due in {item.dueDate}</Text>
        <View style={[
          styles.priorityBadge,
          { 
            backgroundColor: item.priority === 'high' ? Colors.error[100] : 
                           item.priority === 'medium' ? Colors.warning[100] : Colors.success[100]
          }
        ]}>
          <Text style={[
            styles.priorityText,
            { 
              color: item.priority === 'high' ? Colors.error[600] : 
                     item.priority === 'medium' ? Colors.warning[600] : Colors.success[600]
            }
          ]}>
            {item.priority.toUpperCase()}
          </Text>
        </View>
      </View>
    </View>
  );

  const renderTabContent = () => {
    switch (selectedTab) {
      case 'overview':
        return (
          <View>
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Performance Metrics</Text>
              <FlatList
                data={metrics}
                renderItem={renderMetric}
                keyExtractor={item => item.title}
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.metricsContainer}
              />
            </View>
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Recent Activity</Text>
              <View style={styles.activityContainer}>
                <View style={styles.activityItem}>
                  <View style={[styles.activityIcon, { backgroundColor: Colors.success[100] }]}>
                    <Ionicons name="checkmark-circle" size={20} color={Colors.success[600]} />
                  </View>
                  <Text style={styles.activityText}>Completed Database Quiz</Text>
                  <Text style={styles.activityTime}>2h ago</Text>
                </View>
                <View style={styles.activityItem}>
                  <View style={[styles.activityIcon, { backgroundColor: Colors.primary[100] }]}>
                    <Ionicons name="book" size={20} color={Colors.primary[600]} />
                  </View>
                  <Text style={styles.activityText}>Studied Algorithm Analysis</Text>
                  <Text style={styles.activityTime}>5h ago</Text>
                </View>
                <View style={styles.activityItem}>
                  <View style={[styles.activityIcon, { backgroundColor: Colors.warning[100] }]}>
                    <Ionicons name="people" size={20} color={Colors.warning[600]} />
                  </View>
                  <Text style={styles.activityText}>Joined Study Group</Text>
                  <Text style={styles.activityTime}>1d ago</Text>
                </View>
              </View>
            </View>
          </View>
        );
      case 'courses':
        return (
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
        );
      case 'assignments':
        return (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Active Assignments</Text>
            <FlatList
              data={assignments}
              renderItem={renderAssignment}
              keyExtractor={item => item.id}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.assignmentsContainer}
            />
          </View>
        );
      case 'progress':
        return (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Academic Progress</Text>
            <View style={styles.progressContainer}>
              <Text style={styles.comingSoonText}>
                Detailed progress analytics coming soon!
              </Text>
            </View>
          </View>
        );
      default:
        return null;
    }
  };

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
      
      {/* Header */}
      <LinearGradient
        colors={[Colors.primary[600], Colors.primary[500]]}
        style={styles.header}
      >
        <View style={styles.headerContent}>
          <View>
            <Text style={styles.greeting}>Enhanced Dashboard</Text>
            <Text style={styles.userName}>{user.name || 'Student'}</Text>
            <Text style={styles.subtitle}>Track your academic journey</Text>
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

      {/* Tabs */}
      <View style={styles.tabsContainer}>
        <FlatList
          data={tabs}
          renderItem={renderTab}
          keyExtractor={item => item.id}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.tabsList}
        />
      </View>

      {/* Content */}
      <Animated.ScrollView
        style={[styles.content, { opacity: fadeAnim }]}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        showsVerticalScrollIndicator={false}
      >
        {renderTabContent()}
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
  tabsContainer: {
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: Colors.neutral[200],
  },
  tabsList: {
    paddingHorizontal: 20,
  },
  tab: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 20,
    marginRight: 8,
    borderRadius: 12,
  },
  activeTab: {
    backgroundColor: Colors.primary[50],
  },
  tabText: {
    marginLeft: 8,
    fontSize: 14,
    fontWeight: '500',
    color: Colors.neutral[600],
  },
  activeTabText: {
    color: Colors.primary[600],
    fontWeight: '600',
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
    width: 140,
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
  trendContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  trendText: {
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
    fontSize: 12,
    fontWeight: '600',
    color: Colors.neutral[700],
    marginBottom: 2,
  },
  metricDescription: {
    fontSize: 10,
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
  progressCircle: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  progressText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: 'white',
  },
  courseFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  courseInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  courseInfoText: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.8)',
  },
  assignmentsContainer: {
    gap: 12,
  },
  assignmentCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  assignmentIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  assignmentContent: {
    flex: 1,
    marginRight: 12,
  },
  assignmentTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.neutral[800],
    marginBottom: 2,
  },
  assignmentCourse: {
    fontSize: 12,
    color: Colors.neutral[600],
    marginBottom: 8,
  },
  progressBar: {
    height: 4,
    backgroundColor: Colors.neutral[200],
    borderRadius: 2,
    marginBottom: 4,
  },
  progressFill: {
    height: '100%',
    borderRadius: 2,
  },
  progressLabel: {
    fontSize: 10,
    color: Colors.neutral[500],
  },
  assignmentMeta: {
    alignItems: 'flex-end',
  },
  dueDate: {
    fontSize: 12,
    color: Colors.neutral[600],
    marginBottom: 8,
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
  activityContainer: {
    backgroundColor: 'white',
    borderRadius: 12,
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
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  activityText: {
    flex: 1,
    fontSize: 14,
    color: Colors.neutral[700],
  },
  activityTime: {
    fontSize: 12,
    color: Colors.neutral[500],
  },
  progressContainer: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 40,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  comingSoonText: {
    fontSize: 16,
    color: Colors.neutral[500],
    textAlign: 'center',
  },
});