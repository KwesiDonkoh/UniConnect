import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Animated,
  Dimensions,
  Modal,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

const { width, height } = Dimensions.get('window');

export const LectureAnalyticsDashboard = ({ visible, onClose, course, user }) => {
  const [selectedPeriod, setSelectedPeriod] = useState('week');
  const [selectedMetric, setSelectedMetric] = useState('engagement');
  
  const slideAnim = useRef(new Animated.Value(height)).current;

  // Sample analytics data
  const analyticsData = {
    engagement: {
      current: 87,
      change: +12,
      trend: 'up',
      details: 'Students are 12% more engaged than last week',
    },
    attendance: {
      current: 94,
      change: +3,
      trend: 'up',
      details: 'Attendance improved by 3% this week',
    },
    participation: {
      current: 76,
      change: -5,
      trend: 'down',
      details: 'Participation slightly decreased, consider interactive activities',
    },
    comprehension: {
      current: 82,
      change: +8,
      trend: 'up',
      details: 'Understanding levels improved significantly',
    },
  };

  const recentLectures = [
    {
      id: 1,
      title: 'Data Structures: Binary Trees',
      date: '2024-02-14',
      duration: '50 min',
      attendance: 28,
      totalStudents: 30,
      engagementScore: 89,
      questions: 15,
      highlights: ['High engagement during live coding', 'Great questions about recursion'],
      concerns: ['2 students seemed lost during complex examples'],
    },
    {
      id: 2,
      title: 'Algorithm Complexity Analysis',
      date: '2024-02-12',
      duration: '50 min',
      attendance: 26,
      totalStudents: 30,
      engagementScore: 78,
      questions: 8,
      highlights: ['Good grasp of Big O notation', 'Interactive examples worked well'],
      concerns: ['Need more practice problems', 'Some confusion with worst-case scenarios'],
    },
    {
      id: 3,
      title: 'Sorting Algorithms Deep Dive',
      date: '2024-02-10',
      duration: '50 min',
      attendance: 29,
      totalStudents: 30,
      engagementScore: 92,
      questions: 22,
      highlights: ['Excellent visualization impact', 'Students loved the sorting race'],
      concerns: ['Ran slightly over time', 'Need to pace bubble sort explanation'],
    },
  ];

  const studentInsights = [
    {
      type: 'struggling',
      count: 4,
      icon: 'help-circle',
      color: '#FF5722',
      title: 'Students Needing Support',
      description: 'Based on quiz scores and participation patterns',
      students: ['Michael Chen', 'Lisa Wang', 'David Kim', 'Anna Rodriguez'],
    },
    {
      type: 'excelling',
      count: 8,
      icon: 'trophy',
      color: '#4CAF50',
      title: 'Top Performers',
      description: 'Consistently high engagement and scores',
      students: ['Sarah Johnson', 'Alex Thompson', 'Maria Garcia', 'John Smith'],
    },
    {
      type: 'improving',
      count: 6,
      icon: 'trending-up',
      color: '#2196F3',
      title: 'Showing Improvement',
      description: 'Positive trajectory in recent assessments',
      students: ['Emma Davis', 'Chris Wilson', 'Sophie Brown', 'Ryan Lee'],
    },
  ];

  const teachingRecommendations = [
    {
      id: 1,
      priority: 'high',
      type: 'engagement',
      title: 'Increase Interactive Elements',
      description: 'Add more hands-on coding exercises during lectures',
      impact: 'Could improve engagement by 15-20%',
      timeToImplement: '1 week',
      icon: 'flash',
    },
    {
      id: 2,
      priority: 'medium',
      type: 'comprehension',
      title: 'Implement Concept Checks',
      description: 'Add quick polls every 15 minutes to gauge understanding',
      impact: 'Better real-time feedback and comprehension',
      timeToImplement: '2 days',
      icon: 'checkmark-circle',
    },
    {
      id: 3,
      priority: 'medium',
      type: 'participation',
      title: 'Create Discussion Groups',
      description: 'Form small groups for peer-to-peer learning',
      impact: 'Increase participation among quieter students',
      timeToImplement: '1 week',
      icon: 'people',
    },
    {
      id: 4,
      priority: 'low',
      type: 'resources',
      title: 'Develop Video Supplements',
      description: 'Create short recap videos for complex topics',
      impact: 'Support different learning styles',
      timeToImplement: '3 weeks',
      icon: 'videocam',
    },
  ];

  useEffect(() => {
    if (visible) {
      Animated.spring(slideAnim, {
        toValue: 0,
        tension: 50,
        friction: 8,
        useNativeDriver: true,
      }).start();
    } else {
      Animated.timing(slideAnim, {
        toValue: height,
        duration: 300,
        useNativeDriver: true,
      }).start();
    }
  }, [visible]);

  const renderMetricCard = (key, data) => (
    <TouchableOpacity
      key={key}
      style={[
        styles.metricCard,
        selectedMetric === key && styles.selectedMetricCard
      ]}
      onPress={() => setSelectedMetric(key)}
    >
      <View style={styles.metricHeader}>
        <Text style={styles.metricTitle}>{key.charAt(0).toUpperCase() + key.slice(1)}</Text>
        <View style={[
          styles.trendIndicator,
          { backgroundColor: data.trend === 'up' ? '#4CAF50' : '#FF5722' }
        ]}>
          <Ionicons 
            name={data.trend === 'up' ? 'trending-up' : 'trending-down'} 
            size={12} 
            color="#fff" 
          />
        </View>
      </View>
      <Text style={styles.metricValue}>{data.current}%</Text>
      <Text style={[
        styles.metricChange,
        { color: data.trend === 'up' ? '#4CAF50' : '#FF5722' }
      ]}>
        {data.change > 0 ? '+' : ''}{data.change}% this {selectedPeriod}
      </Text>
    </TouchableOpacity>
  );

  const renderLectureCard = (lecture) => (
    <View key={lecture.id} style={styles.lectureCard}>
      <View style={styles.lectureHeader}>
        <View style={styles.lectureInfo}>
          <Text style={styles.lectureTitle}>{lecture.title}</Text>
          <Text style={styles.lectureDate}>{lecture.date} • {lecture.duration}</Text>
        </View>
        <View style={styles.engagementBadge}>
          <Text style={styles.engagementScore}>{lecture.engagementScore}</Text>
          <Text style={styles.engagementLabel}>engagement</Text>
        </View>
      </View>

      <View style={styles.lectureStats}>
        <View style={styles.statItem}>
          <Ionicons name="people" size={16} color="#667eea" />
          <Text style={styles.statText}>{lecture.attendance}/{lecture.totalStudents}</Text>
          <Text style={styles.statLabel}>attendance</Text>
        </View>
        <View style={styles.statItem}>
          <Ionicons name="help-circle" size={16} color="#4CAF50" />
          <Text style={styles.statText}>{lecture.questions}</Text>
          <Text style={styles.statLabel}>questions</Text>
        </View>
      </View>

      <View style={styles.lectureInsights}>
        <View style={styles.insightSection}>
          <Text style={styles.insightTitle}>🌟 Highlights</Text>
          {lecture.highlights.map((highlight, index) => (
            <Text key={index} style={styles.insightText}>• {highlight}</Text>
          ))}
        </View>
        <View style={styles.insightSection}>
          <Text style={styles.insightTitle}>⚠️ Areas to Address</Text>
          {lecture.concerns.map((concern, index) => (
            <Text key={index} style={styles.insightText}>• {concern}</Text>
          ))}
        </View>
      </View>
    </View>
  );

  const renderStudentInsight = (insight) => (
    <View key={insight.type} style={styles.insightCard}>
      <View style={styles.insightHeader}>
        <View style={[styles.insightIcon, { backgroundColor: insight.color }]}>
          <Ionicons name={insight.icon} size={20} color="#fff" />
        </View>
        <View style={styles.insightInfo}>
          <Text style={styles.insightCardTitle}>{insight.title}</Text>
          <Text style={styles.insightDescription}>{insight.description}</Text>
        </View>
        <View style={styles.insightCount}>
          <Text style={[styles.insightNumber, { color: insight.color }]}>
            {insight.count}
          </Text>
        </View>
      </View>
      <View style={styles.studentList}>
        {insight.students.slice(0, 3).map((student, index) => (
          <Text key={index} style={styles.studentName}>
            {student}{index < Math.min(2, insight.students.length - 1) ? ', ' : ''}
          </Text>
        ))}
        {insight.students.length > 3 && (
          <Text style={styles.moreStudents}>+{insight.students.length - 3} more</Text>
        )}
      </View>
    </View>
  );

  const renderRecommendation = (rec) => (
    <View key={rec.id} style={styles.recommendationCard}>
      <View style={styles.recommendationHeader}>
        <View style={[
          styles.priorityBadge,
          { backgroundColor: rec.priority === 'high' ? '#FF5722' : rec.priority === 'medium' ? '#FF9800' : '#4CAF50' }
        ]}>
          <Text style={styles.priorityText}>{rec.priority.toUpperCase()}</Text>
        </View>
        <View style={styles.recommendationIcon}>
          <Ionicons name={rec.icon} size={20} color="#667eea" />
        </View>
      </View>
      
      <Text style={styles.recommendationTitle}>{rec.title}</Text>
      <Text style={styles.recommendationDescription}>{rec.description}</Text>
      
      <View style={styles.recommendationFooter}>
        <View style={styles.impactInfo}>
          <Text style={styles.impactLabel}>Expected Impact:</Text>
          <Text style={styles.impactText}>{rec.impact}</Text>
        </View>
        <View style={styles.timeInfo}>
          <Ionicons name="time" size={14} color="#666" />
          <Text style={styles.timeText}>{rec.timeToImplement}</Text>
        </View>
      </View>
      
      <TouchableOpacity style={styles.implementButton}>
        <Text style={styles.implementButtonText}>Implement</Text>
      </TouchableOpacity>
    </View>
  );

  if (!visible) return null;

  return (
    <Modal visible={visible} transparent animationType="none">
      <View style={styles.overlay}>
        <Animated.View 
          style={[
            styles.container,
            { transform: [{ translateY: slideAnim }] }
          ]}
        >
          {/* Header */}
          <LinearGradient
            colors={['#667eea', '#764ba2']}
            style={styles.header}
          >
            <View style={styles.headerContent}>
              <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                <Ionicons name="close" size={24} color="#fff" />
              </TouchableOpacity>
              
              <View style={styles.headerInfo}>
                <Text style={styles.headerTitle}>📊 Lecture Analytics</Text>
                <Text style={styles.headerSubtitle}>
                  Deep insights into your teaching effectiveness
                </Text>
              </View>
              
              <View style={styles.aiPoweredBadge}>
                <Ionicons name="analytics" size={20} color="#fff" />
              </View>
            </View>
          </LinearGradient>

          {/* Period Selector */}
          <View style={styles.periodSelector}>
            {['week', 'month', 'semester'].map((period) => (
              <TouchableOpacity
                key={period}
                style={[
                  styles.periodButton,
                  selectedPeriod === period && styles.selectedPeriodButton
                ]}
                onPress={() => setSelectedPeriod(period)}
              >
                <Text style={[
                  styles.periodButtonText,
                  selectedPeriod === period && styles.selectedPeriodButtonText
                ]}>
                  This {period.charAt(0).toUpperCase() + period.slice(1)}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
            {/* Key Metrics */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>📈 Key Performance Metrics</Text>
              <View style={styles.metricsGrid}>
                {Object.entries(analyticsData).map(([key, data]) => renderMetricCard(key, data))}
              </View>
              <View style={styles.metricDetails}>
                <Text style={styles.metricDetailsText}>
                  {analyticsData[selectedMetric].details}
                </Text>
              </View>
            </View>

            {/* Recent Lectures */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>🎓 Recent Lecture Analysis</Text>
              {recentLectures.map(renderLectureCard)}
            </View>

            {/* Student Insights */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>👥 Student Performance Insights</Text>
              {studentInsights.map(renderStudentInsight)}
            </View>

            {/* AI Recommendations */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>🧠 AI Teaching Recommendations</Text>
              <Text style={styles.sectionSubtitle}>
                Personalized suggestions to enhance your teaching effectiveness
              </Text>
              {teachingRecommendations.map(renderRecommendation)}
            </View>

            {/* Teaching Effectiveness Score */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>⭐ Overall Teaching Effectiveness</Text>
              <View style={styles.effectivenessCard}>
                <View style={styles.effectivenessScore}>
                  <Text style={styles.effectivenessNumber}>8.7</Text>
                  <Text style={styles.effectivenessLabel}>out of 10</Text>
                </View>
                <View style={styles.effectivenessBreakdown}>
                  <View style={styles.breakdownItem}>
                    <Text style={styles.breakdownLabel}>Content Delivery</Text>
                    <View style={styles.breakdownBar}>
                      <View style={[styles.breakdownFill, { width: '90%' }]} />
                    </View>
                    <Text style={styles.breakdownScore}>9.0</Text>
                  </View>
                  <View style={styles.breakdownItem}>
                    <Text style={styles.breakdownLabel}>Student Engagement</Text>
                    <View style={styles.breakdownBar}>
                      <View style={[styles.breakdownFill, { width: '87%' }]} />
                    </View>
                    <Text style={styles.breakdownScore}>8.7</Text>
                  </View>
                  <View style={styles.breakdownItem}>
                    <Text style={styles.breakdownLabel}>Learning Outcomes</Text>
                    <View style={styles.breakdownBar}>
                      <View style={[styles.breakdownFill, { width: '82%' }]} />
                    </View>
                    <Text style={styles.breakdownScore}>8.2</Text>
                  </View>
                </View>
              </View>
            </View>
          </ScrollView>
        </Animated.View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  container: {
    flex: 1,
    marginTop: 50,
    backgroundColor: '#fff',
    borderTopLeftRadius: 25,
    borderTopRightRadius: 25,
  },
  header: {
    paddingTop: 20,
    paddingBottom: 15,
    paddingHorizontal: 20,
    borderTopLeftRadius: 25,
    borderTopRightRadius: 25,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  closeButton: {
    padding: 8,
    marginRight: 12,
  },
  headerInfo: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
  },
  headerSubtitle: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
    marginTop: 2,
  },
  aiPoweredBadge: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  
  // Period Selector
  periodSelector: {
    flexDirection: 'row',
    backgroundColor: '#f8f9fa',
    paddingHorizontal: 20,
    paddingVertical: 15,
  },
  periodButton: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 20,
    marginHorizontal: 4,
    backgroundColor: 'transparent',
  },
  selectedPeriodButton: {
    backgroundColor: '#667eea',
  },
  periodButtonText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    fontWeight: '500',
  },
  selectedPeriodButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
  
  // Content
  content: {
    flex: 1,
    padding: 20,
  },
  section: {
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 16,
  },
  
  // Metrics
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  metricCard: {
    width: '48%',
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  selectedMetricCard: {
    borderColor: '#667eea',
    backgroundColor: '#f0f8ff',
  },
  metricHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  metricTitle: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  trendIndicator: {
    width: 20,
    height: 20,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  metricValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  metricChange: {
    fontSize: 12,
    fontWeight: '500',
  },
  metricDetails: {
    backgroundColor: '#f0f8ff',
    borderRadius: 8,
    padding: 12,
  },
  metricDetailsText: {
    fontSize: 14,
    color: '#667eea',
    textAlign: 'center',
  },
  
  // Lecture Cards
  lectureCard: {
    backgroundColor: '#fff',
    borderRadius: 15,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  lectureHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  lectureInfo: {
    flex: 1,
  },
  lectureTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  lectureDate: {
    fontSize: 14,
    color: '#666',
  },
  engagementBadge: {
    alignItems: 'center',
    backgroundColor: '#e8f5e8',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
  },
  engagementScore: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#4CAF50',
  },
  engagementLabel: {
    fontSize: 10,
    color: '#4CAF50',
  },
  lectureStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 16,
    paddingVertical: 12,
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
  },
  statItem: {
    alignItems: 'center',
  },
  statText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginTop: 4,
  },
  statLabel: {
    fontSize: 10,
    color: '#666',
    marginTop: 2,
  },
  lectureInsights: {
    marginTop: 16,
  },
  insightSection: {
    marginBottom: 12,
  },
  insightTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 6,
  },
  insightText: {
    fontSize: 13,
    color: '#666',
    lineHeight: 18,
    marginBottom: 2,
  },
  
  // Student Insights
  insightCard: {
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  insightHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  insightIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  insightInfo: {
    flex: 1,
  },
  insightCardTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 2,
  },
  insightDescription: {
    fontSize: 12,
    color: '#666',
  },
  insightCount: {
    alignItems: 'center',
  },
  insightNumber: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  studentList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  studentName: {
    fontSize: 12,
    color: '#333',
  },
  moreStudents: {
    fontSize: 12,
    color: '#666',
    fontStyle: 'italic',
  },
  
  // Recommendations
  recommendationCard: {
    backgroundColor: '#fff',
    borderRadius: 15,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  recommendationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  priorityBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  priorityText: {
    fontSize: 10,
    color: '#fff',
    fontWeight: 'bold',
  },
  recommendationIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#f0f8ff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  recommendationTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  recommendationDescription: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
    marginBottom: 16,
  },
  recommendationFooter: {
    marginBottom: 16,
  },
  impactInfo: {
    marginBottom: 8,
  },
  impactLabel: {
    fontSize: 12,
    color: '#666',
    fontWeight: '500',
  },
  impactText: {
    fontSize: 13,
    color: '#4CAF50',
    fontWeight: '500',
  },
  timeInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  timeText: {
    fontSize: 12,
    color: '#666',
    marginLeft: 4,
  },
  implementButton: {
    backgroundColor: '#667eea',
    paddingVertical: 10,
    borderRadius: 20,
    alignItems: 'center',
  },
  implementButtonText: {
    fontSize: 14,
    color: '#fff',
    fontWeight: '600',
  },
  
  // Effectiveness Score
  effectivenessCard: {
    backgroundColor: '#f8f9fa',
    borderRadius: 15,
    padding: 20,
  },
  effectivenessScore: {
    alignItems: 'center',
    marginBottom: 24,
  },
  effectivenessNumber: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#4CAF50',
  },
  effectivenessLabel: {
    fontSize: 14,
    color: '#666',
  },
  effectivenessBreakdown: {
    marginTop: 16,
  },
  breakdownItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  breakdownLabel: {
    flex: 1,
    fontSize: 14,
    color: '#333',
  },
  breakdownBar: {
    flex: 2,
    height: 6,
    backgroundColor: '#e9ecef',
    borderRadius: 3,
    marginHorizontal: 12,
  },
  breakdownFill: {
    height: '100%',
    backgroundColor: '#4CAF50',
    borderRadius: 3,
  },
  breakdownScore: {
    fontSize: 14,
    fontWeight: '600',
    color: '#4CAF50',
    minWidth: 30,
    textAlign: 'right',
  },
});

export default LectureAnalyticsDashboard;
