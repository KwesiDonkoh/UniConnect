import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  Dimensions,
  Animated,
  RefreshControl,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import analyticsService from '../services/analyticsService';

const { width } = Dimensions.get('window');

export default function AnalyticsDashboard({ navigation, route }) {
  const { courseCode, courseName } = route.params;
  
  const [analytics, setAnalytics] = useState(null);
  const [timeRange, setTimeRange] = useState('30d');
  const [selectedView, setSelectedView] = useState('overview');
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;

  const timeRanges = [
    { id: '7d', name: '7 Days' },
    { id: '30d', name: '30 Days' },
    { id: '90d', name: '90 Days' },
    { id: '1y', name: '1 Year' },
  ];

  const viewTabs = [
    { id: 'overview', name: 'Overview', icon: 'analytics' },
    { id: 'engagement', name: 'Engagement', icon: 'people' },
    { id: 'performance', name: 'Performance', icon: 'trending-up' },
    { id: 'assignments', name: 'Assignments', icon: 'clipboard' },
  ];

  useEffect(() => {
    loadAnalytics();
    
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 600,
        useNativeDriver: true,
      }),
    ]).start();
  }, [timeRange]);

  const loadAnalytics = async () => {
    try {
      setIsLoading(true);
      const result = await analyticsService.getCourseAnalytics(courseCode, timeRange);
      
      if (result.success) {
        setAnalytics(result.analytics);
      }
    } catch (error) {
      console.error('Error loading analytics:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadAnalytics();
    setRefreshing(false);
  };

  const renderOverviewCards = () => {
    if (!analytics?.overview) return null;

    const { overview } = analytics;
    
    const cards = [
      {
        title: 'Total Students',
        value: overview.totalStudents,
        icon: 'people',
        color: '#6366F1',
        change: '+5.2%',
      },
      {
        title: 'Active Students',
        value: overview.activeStudents,
        icon: 'pulse',
        color: '#10B981',
        change: '+12.4%',
      },
      {
        title: 'Engagement Rate',
        value: `${Math.round(overview.engagementRate)}%`,
        icon: 'trending-up',
        color: '#F59E0B',
        change: '+8.1%',
      },
      {
        title: 'Assignments',
        value: overview.totalAssignments,
        icon: 'clipboard',
        color: '#EC4899',
        change: '+2',
      },
    ];

    return (
      <View style={styles.cardsContainer}>
        {cards.map((card, index) => (
          <Animated.View
            key={card.title}
            style={[
              styles.card,
              {
                transform: [{
                  translateY: slideAnim.interpolate({
                    inputRange: [0, 50],
                    outputRange: [0, 50],
                  }),
                }],
              },
            ]}
          >
            <LinearGradient
              colors={[card.color, `${card.color}CC`]}
              style={styles.cardGradient}
            >
              <View style={styles.cardContent}>
                <View style={styles.cardHeader}>
                  <Ionicons name={card.icon} size={24} color="#FFFFFF" />
                  <Text style={styles.cardChange}>{card.change}</Text>
                </View>
                <Text style={styles.cardValue}>{card.value}</Text>
                <Text style={styles.cardTitle}>{card.title}</Text>
              </View>
            </LinearGradient>
          </Animated.View>
        ))}
      </View>
    );
  };

  const renderEngagementView = () => {
    if (!analytics?.engagement) return null;

    const { engagement } = analytics;

    return (
      <View style={styles.viewContent}>
        {/* Activity Summary */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Activity Summary</Text>
          <View style={styles.activityGrid}>
            <View style={styles.activityItem}>
              <Text style={styles.activityValue}>{engagement.chatMessages}</Text>
              <Text style={styles.activityLabel}>Chat Messages</Text>
              <Ionicons name="chatbubbles" size={24} color="#6366F1" />
            </View>
            <View style={styles.activityItem}>
              <Text style={styles.activityValue}>{engagement.materialDownloads}</Text>
              <Text style={styles.activityLabel}>Downloads</Text>
              <Ionicons name="download" size={24} color="#10B981" />
            </View>
            <View style={styles.activityItem}>
              <Text style={styles.activityValue}>{engagement.assignmentSubmissions}</Text>
              <Text style={styles.activityLabel}>Submissions</Text>
              <Ionicons name="send" size={24} color="#F59E0B" />
            </View>
          </View>
        </View>

        {/* Top Contributors */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Top Contributors</Text>
          {engagement.topContributors?.map((contributor, index) => (
            <View key={contributor.userId} style={styles.contributorItem}>
              <View style={styles.contributorRank}>
                <Text style={styles.rankNumber}>{index + 1}</Text>
              </View>
              <View style={styles.contributorInfo}>
                <Text style={styles.contributorName}>Student {contributor.userId.slice(-4)}</Text>
                <Text style={styles.contributorCount}>{contributor.messageCount} messages</Text>
              </View>
              <View style={styles.contributorBadge}>
                <Ionicons name="trophy" size={16} color="#F59E0B" />
              </View>
            </View>
          ))}
        </View>
      </View>
    );
  };

  const renderPerformanceView = () => {
    if (!analytics?.performance) return null;

    const { performance } = analytics;

    return (
      <View style={styles.viewContent}>
        {/* Grade Overview */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Grade Overview</Text>
          <View style={styles.gradeStats}>
            <View style={styles.gradeStat}>
              <Text style={styles.gradeValue}>{performance.averageGrade}</Text>
              <Text style={styles.gradeLabel}>Average Grade</Text>
            </View>
            <View style={styles.gradeStat}>
              <Text style={styles.gradeValue}>{performance.highestGrade}</Text>
              <Text style={styles.gradeLabel}>Highest Grade</Text>
            </View>
            <View style={styles.gradeStat}>
              <Text style={styles.gradeValue}>{performance.lowestGrade}</Text>
              <Text style={styles.gradeLabel}>Lowest Grade</Text>
            </View>
          </View>
        </View>

        {/* Grade Distribution */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Grade Distribution</Text>
          <View style={styles.distributionChart}>
            {Object.entries(performance.performanceDistribution || {}).map(([grade, count]) => (
              <View key={grade} style={styles.distributionItem}>
                <Text style={styles.distributionGrade}>{grade}</Text>
                <View style={styles.distributionBar}>
                  <View 
                    style={[
                      styles.distributionFill,
                      { 
                        width: `${(count / Math.max(...Object.values(performance.performanceDistribution))) * 100}%`,
                        backgroundColor: getGradeColor(grade),
                      }
                    ]} 
                  />
                </View>
                <Text style={styles.distributionCount}>{count}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Top Performers */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Top Performers</Text>
          {performance.topPerformers?.slice(0, 5).map((performer, index) => (
            <View key={performer.studentId} style={styles.performerItem}>
              <View style={[styles.performerRank, { backgroundColor: getRankColor(index) }]}>
                <Text style={styles.performerRankText}>{index + 1}</Text>
              </View>
              <View style={styles.performerInfo}>
                <Text style={styles.performerName}>Student {performer.studentId.slice(-4)}</Text>
                <Text style={styles.performerGrade}>{performer.averageGrade}% average</Text>
              </View>
              <View style={styles.performerBadge}>
                <Ionicons name="star" size={16} color="#F59E0B" />
              </View>
            </View>
          ))}
        </View>
      </View>
    );
  };

  const renderAssignmentsView = () => {
    if (!analytics?.assignments) return null;

    const { assignments } = analytics;

    return (
      <View style={styles.viewContent}>
        {/* Assignment Stats */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Assignment Statistics</Text>
          <View style={styles.assignmentStats}>
            <View style={styles.assignmentStat}>
              <Text style={styles.assignmentValue}>{assignments.totalAssignments}</Text>
              <Text style={styles.assignmentLabel}>Total Assignments</Text>
            </View>
            <View style={styles.assignmentStat}>
              <Text style={styles.assignmentValue}>{assignments.totalSubmissions}</Text>
              <Text style={styles.assignmentLabel}>Total Submissions</Text>
            </View>
            <View style={styles.assignmentStat}>
              <Text style={styles.assignmentValue}>{assignments.pendingGrading}</Text>
              <Text style={styles.assignmentLabel}>Pending Grading</Text>
            </View>
          </View>
        </View>

        {/* Submission Rate */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Submission Rate</Text>
          <View style={styles.submissionRate}>
            <View style={styles.submissionRateBar}>
              <View 
                style={[
                  styles.submissionRateFill,
                  { width: `${assignments.submissionRate}%` }
                ]} 
              />
            </View>
            <Text style={styles.submissionRateText}>{Math.round(assignments.submissionRate)}%</Text>
          </View>
        </View>

        {/* Grade Distribution */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Assignment Grade Distribution</Text>
          <View style={styles.gradeDistribution}>
            {Object.entries(assignments.gradeDistribution || {}).map(([grade, count]) => (
              <View key={grade} style={styles.gradeDistributionItem}>
                <View style={[styles.gradeCircle, { backgroundColor: getGradeColor(grade) }]}>
                  <Text style={styles.gradeCircleText}>{grade}</Text>
                </View>
                <Text style={styles.gradeDistributionCount}>{count}</Text>
              </View>
            ))}
          </View>
        </View>
      </View>
    );
  };

  const getGradeColor = (grade) => {
    if (grade.startsWith('A')) return '#10B981';
    if (grade.startsWith('B')) return '#3B82F6';
    if (grade.startsWith('C')) return '#F59E0B';
    if (grade.startsWith('D')) return '#EF4444';
    return '#6B7280';
  };

  const getRankColor = (index) => {
    switch (index) {
      case 0: return '#F59E0B';
      case 1: return '#94A3B8';
      case 2: return '#CD7C2F';
      default: return '#6366F1';
    }
  };

  const renderCurrentView = () => {
    switch (selectedView) {
      case 'overview':
        return renderOverviewCards();
      case 'engagement':
        return renderEngagementView();
      case 'performance':
        return renderPerformanceView();
      case 'assignments':
        return renderAssignmentsView();
      default:
        return renderOverviewCards();
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <LinearGradient
        colors={['#6366F1', '#8B5CF6']}
        style={styles.header}
      >
        <View style={styles.headerContent}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
          </TouchableOpacity>
          
          <View style={styles.headerInfo}>
            <Text style={styles.headerTitle}>Analytics</Text>
            <Text style={styles.headerSubtitle}>{courseName}</Text>
          </View>
          
          <TouchableOpacity style={styles.exportButton}>
            <Ionicons name="share" size={20} color="#FFFFFF" />
          </TouchableOpacity>
        </View>

        {/* Time Range Selector */}
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          style={styles.timeRangeScroll}
          contentContainerStyle={styles.timeRangeContainer}
        >
          {timeRanges.map((range) => (
            <TouchableOpacity
              key={range.id}
              style={[
                styles.timeRangeButton,
                timeRange === range.id && styles.timeRangeButtonActive
              ]}
              onPress={() => setTimeRange(range.id)}
            >
              <Text style={[
                styles.timeRangeText,
                timeRange === range.id && styles.timeRangeTextActive
              ]}>
                {range.name}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </LinearGradient>

      {/* View Tabs */}
      <View style={styles.tabsContainer}>
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.tabs}
        >
          {viewTabs.map((tab) => (
            <TouchableOpacity
              key={tab.id}
              style={[
                styles.tab,
                selectedView === tab.id && styles.tabActive
              ]}
              onPress={() => setSelectedView(tab.id)}
            >
              <Ionicons 
                name={tab.icon} 
                size={20} 
                color={selectedView === tab.id ? '#6366F1' : '#64748B'} 
              />
              <Text style={[
                styles.tabText,
                selectedView === tab.id && styles.tabTextActive
              ]}>
                {tab.name}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Content */}
      <Animated.View 
        style={[
          styles.content,
          {
            opacity: fadeAnim,
          },
        ]}
      >
        <ScrollView 
          style={styles.scrollView}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              colors={['#6366F1']}
              tintColor="#6366F1"
            />
          }
        >
          {isLoading ? (
            <View style={styles.loadingContainer}>
              <Text style={styles.loadingText}>Loading analytics...</Text>
            </View>
          ) : (
            renderCurrentView()
          )}
        </ScrollView>
      </Animated.View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  header: {
    paddingTop: Platform.OS === 'ios' ? 0 : 20,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  headerInfo: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  headerSubtitle: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
    marginTop: 2,
  },
  exportButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  timeRangeScroll: {
    marginTop: 16,
  },
  timeRangeContainer: {
    paddingHorizontal: 16,
    paddingBottom: 16,
    gap: 8,
  },
  timeRangeButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  timeRangeButtonActive: {
    backgroundColor: '#FFFFFF',
  },
  timeRangeText: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
    fontWeight: '500',
  },
  timeRangeTextActive: {
    color: '#6366F1',
  },
  tabsContainer: {
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  tabs: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 8,
  },
  tab: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: '#F8FAFC',
    gap: 6,
  },
  tabActive: {
    backgroundColor: '#EEF2FF',
  },
  tabText: {
    fontSize: 14,
    color: '#64748B',
    fontWeight: '500',
  },
  tabTextActive: {
    color: '#6366F1',
  },
  content: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  loadingContainer: {
    padding: 40,
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: '#64748B',
  },
  cardsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 16,
    gap: 12,
  },
  card: {
    width: (width - 44) / 2,
    borderRadius: 16,
    overflow: 'hidden',
  },
  cardGradient: {
    padding: 16,
    height: 120,
    justifyContent: 'space-between',
  },
  cardContent: {
    flex: 1,
    justifyContent: 'space-between',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  cardChange: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.8)',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
  },
  cardValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  cardTitle: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.9)',
  },
  viewContent: {
    padding: 16,
  },
  section: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1E293B',
    marginBottom: 16,
  },
  activityGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  activityItem: {
    alignItems: 'center',
    flex: 1,
  },
  activityValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1E293B',
    marginBottom: 4,
  },
  activityLabel: {
    fontSize: 12,
    color: '#64748B',
    marginBottom: 8,
  },
  contributorItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  contributorRank: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#6366F1',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  rankNumber: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  contributorInfo: {
    flex: 1,
  },
  contributorName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1E293B',
  },
  contributorCount: {
    fontSize: 14,
    color: '#64748B',
  },
  contributorBadge: {
    padding: 4,
  },
  gradeStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  gradeStat: {
    alignItems: 'center',
    flex: 1,
  },
  gradeValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1E293B',
  },
  gradeLabel: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 4,
  },
  distributionChart: {
    gap: 8,
  },
  distributionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  distributionGrade: {
    width: 60,
    fontSize: 14,
    fontWeight: '500',
    color: '#1E293B',
  },
  distributionBar: {
    flex: 1,
    height: 20,
    backgroundColor: '#F1F5F9',
    borderRadius: 10,
    overflow: 'hidden',
  },
  distributionFill: {
    height: 20,
    borderRadius: 10,
  },
  distributionCount: {
    width: 30,
    fontSize: 14,
    fontWeight: '500',
    color: '#64748B',
    textAlign: 'right',
  },
  performerItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  performerRank: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  performerRankText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  performerInfo: {
    flex: 1,
  },
  performerName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1E293B',
  },
  performerGrade: {
    fontSize: 14,
    color: '#64748B',
  },
  performerBadge: {
    padding: 4,
  },
  assignmentStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  assignmentStat: {
    alignItems: 'center',
    flex: 1,
  },
  assignmentValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1E293B',
  },
  assignmentLabel: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 4,
    textAlign: 'center',
  },
  submissionRate: {
    alignItems: 'center',
  },
  submissionRateBar: {
    width: '100%',
    height: 20,
    backgroundColor: '#F1F5F9',
    borderRadius: 10,
    overflow: 'hidden',
    marginBottom: 8,
  },
  submissionRateFill: {
    height: 20,
    backgroundColor: '#10B981',
    borderRadius: 10,
  },
  submissionRateText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#10B981',
  },
  gradeDistribution: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  gradeDistributionItem: {
    alignItems: 'center',
  },
  gradeCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  gradeCircleText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  gradeDistributionCount: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1E293B',
  },
});
