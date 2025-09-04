import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Animated,
  Dimensions,
  Alert,
  Modal,
  TextInput,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';

const { width, height } = Dimensions.get('window');

export const SmartGradingSystem = ({ visible, onClose, course, user }) => {
  const [selectedTab, setSelectedTab] = useState('auto-grade');
  const [assignments, setAssignments] = useState([
    {
      id: 1,
      title: 'Data Structures Assignment #3',
      type: 'coding',
      submissions: 28,
      graded: 15,
      avgScore: 78,
      dueDate: '2024-02-15',
      status: 'grading',
      aiGradable: true,
    },
    {
      id: 2,
      title: 'Algorithm Analysis Essay',
      type: 'essay',
      submissions: 25,
      graded: 8,
      avgScore: 82,
      dueDate: '2024-02-10',
      status: 'grading',
      aiGradable: true,
    },
    {
      id: 3,
      title: 'Database Design Project',
      type: 'project',
      submissions: 22,
      graded: 22,
      avgScore: 85,
      dueDate: '2024-02-05',
      status: 'completed',
      aiGradable: false,
    },
  ]);

  const [gradingProgress, setGradingProgress] = useState({});
  const [selectedAssignment, setSelectedAssignment] = useState(null);
  const [isGrading, setIsGrading] = useState(false);

  const slideAnim = useRef(new Animated.Value(height)).current;
  const progressAnim = useRef(new Animated.Value(0)).current;

  const gradingModes = [
    {
      id: 'auto-grade',
      name: 'AI Auto-Grade',
      icon: 'flash',
      color: '#4CAF50',
      description: 'Instant AI-powered grading'
    },
    {
      id: 'assisted',
      name: 'AI Assisted',
      icon: 'people',
      color: '#FF9800',
      description: 'AI suggestions + your review'
    },
    {
      id: 'analytics',
      name: 'Grade Analytics',
      icon: 'analytics',
      color: '#9C27B0',
      description: 'Performance insights'
    },
    {
      id: 'feedback',
      name: 'Smart Feedback',
      icon: 'chatbubble-ellipses',
      color: '#2196F3',
      description: 'AI-generated feedback'
    }
  ];

  const sampleSubmissions = [
    {
      id: 1,
      studentName: 'Sarah Johnson',
      studentId: 'CST2019001',
      submittedAt: '2024-02-14 11:30 AM',
      aiScore: 92,
      confidence: 95,
      feedback: 'Excellent implementation with clean code structure. Minor optimization opportunity in the sorting algorithm.',
      highlights: ['Clean code', 'Good documentation', 'Efficient algorithm'],
      issues: ['Minor optimization needed'],
      plagiarismScore: 2,
    },
    {
      id: 2,
      studentName: 'Michael Chen',
      studentId: 'CST2019002',
      submittedAt: '2024-02-14 10:15 AM',
      aiScore: 78,
      confidence: 88,
      feedback: 'Good understanding of concepts. Code works correctly but lacks proper error handling and documentation.',
      highlights: ['Correct logic', 'Meets requirements'],
      issues: ['Missing error handling', 'Poor documentation'],
      plagiarismScore: 15,
    },
    {
      id: 3,
      studentName: 'Emma Davis',
      studentId: 'CST2019003',
      submittedAt: '2024-02-13 09:45 PM',
      aiScore: 85,
      confidence: 92,
      feedback: 'Well-structured solution with creative approach. Consider edge case handling for better robustness.',
      highlights: ['Creative solution', 'Good structure', 'Clear comments'],
      issues: ['Edge cases not handled'],
      plagiarismScore: 5,
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

  const startAIGrading = (assignment) => {
    setSelectedAssignment(assignment);
    setIsGrading(true);
    setGradingProgress({ ...gradingProgress, [assignment.id]: 0 });

    // Simulate AI grading progress
    const interval = setInterval(() => {
      setGradingProgress(prev => {
        const currentProgress = prev[assignment.id] || 0;
        if (currentProgress >= 100) {
          clearInterval(interval);
          setIsGrading(false);
          Alert.alert(
            '🎉 AI Grading Complete!',
            `Successfully graded ${assignment.submissions} submissions!\n\n✅ Average processing time: 2.3 seconds per submission\n📊 Confidence level: 94%\n🚀 Time saved: ${Math.round(assignment.submissions * 8.5)} minutes`,
            [
              { text: 'View Results', onPress: () => setSelectedTab('results') },
              { text: 'Great!', style: 'default' }
            ]
          );
          return { ...prev, [assignment.id]: 100 };
        }
        return { ...prev, [assignment.id]: currentProgress + 2 };
      });
    }, 100);
  };

  const renderAutoGradeTab = () => (
    <ScrollView showsVerticalScrollIndicator={false}>
      <View style={styles.tabContent}>
        <Text style={styles.tabTitle}>🤖 AI Auto-Grading Dashboard</Text>
        <Text style={styles.tabSubtitle}>
          Intelligent grading with 94% accuracy rate - faster than ever!
        </Text>

        {/* Grading Queue */}
        <View style={styles.queueSection}>
          <Text style={styles.sectionTitle}>📋 Grading Queue</Text>
          {assignments.filter(a => a.status === 'grading').map((assignment) => (
            <View key={assignment.id} style={styles.assignmentCard}>
              <View style={styles.assignmentHeader}>
                <View style={styles.assignmentIcon}>
                  <Ionicons 
                    name={assignment.type === 'coding' ? 'code' : assignment.type === 'essay' ? 'document-text' : 'folder'} 
                    size={24} 
                    color="#667eea" 
                  />
                </View>
                <View style={styles.assignmentInfo}>
                  <Text style={styles.assignmentTitle}>{assignment.title}</Text>
                  <Text style={styles.assignmentMeta}>
                    {assignment.submissions} submissions • Due: {assignment.dueDate}
                  </Text>
                </View>
                <View style={styles.assignmentStats}>
                  <Text style={styles.gradedCount}>{assignment.graded}/{assignment.submissions}</Text>
                  <Text style={styles.gradedLabel}>graded</Text>
                </View>
              </View>

              {gradingProgress[assignment.id] !== undefined && (
                <View style={styles.progressSection}>
                  <View style={styles.progressHeader}>
                    <Text style={styles.progressText}>
                      AI Grading in Progress... {gradingProgress[assignment.id]}%
                    </Text>
                    <Ionicons name="flash" size={16} color="#4CAF50" />
                  </View>
                  <View style={styles.progressBar}>
                    <View 
                      style={[
                        styles.progressFill, 
                        { width: `${gradingProgress[assignment.id]}%` }
                      ]} 
                    />
                  </View>
                </View>
              )}

              <View style={styles.assignmentActions}>
                {assignment.aiGradable ? (
                  <TouchableOpacity
                    style={[styles.actionButton, styles.aiGradeButton]}
                    onPress={() => startAIGrading(assignment)}
                    disabled={isGrading}
                  >
                    <Ionicons name="flash" size={16} color="#fff" />
                    <Text style={styles.actionButtonText}>
                      {isGrading ? 'Grading...' : 'AI Grade All'}
                    </Text>
                  </TouchableOpacity>
                ) : (
                  <View style={styles.manualGradeNote}>
                    <Ionicons name="information-circle" size={16} color="#FF9800" />
                    <Text style={styles.manualGradeText}>Requires manual review</Text>
                  </View>
                )}
                
                <TouchableOpacity style={[styles.actionButton, styles.previewButton]}>
                  <Ionicons name="eye" size={16} color="#667eea" />
                  <Text style={[styles.actionButtonText, { color: '#667eea' }]}>Preview</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))}
        </View>

        {/* AI Grading Settings */}
        <View style={styles.settingsSection}>
          <Text style={styles.sectionTitle}>⚙️ AI Grading Configuration</Text>
          
          <View style={styles.settingCard}>
            <View style={styles.settingHeader}>
              <Ionicons name="shield-checkmark" size={20} color="#4CAF50" />
              <Text style={styles.settingTitle}>Confidence Threshold</Text>
            </View>
            <Text style={styles.settingDescription}>
              Only auto-grade submissions with AI confidence ≥ 85%
            </Text>
            <View style={styles.confidenceSlider}>
              <Text style={styles.confidenceValue}>85%</Text>
            </View>
          </View>

          <View style={styles.settingCard}>
            <View style={styles.settingHeader}>
              <Ionicons name="document-text" size={20} color="#2196F3" />
              <Text style={styles.settingTitle}>Feedback Generation</Text>
            </View>
            <Text style={styles.settingDescription}>
              Automatically generate personalized feedback for each student
            </Text>
            <TouchableOpacity style={styles.toggleButton}>
              <Text style={styles.toggleButtonText}>Enabled</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.settingCard}>
            <View style={styles.settingHeader}>
              <Ionicons name="search" size={20} color="#FF5722" />
              <Text style={styles.settingTitle}>Plagiarism Detection</Text>
            </View>
            <Text style={styles.settingDescription}>
              Scan for potential plagiarism and similarity issues
            </Text>
            <TouchableOpacity style={styles.toggleButton}>
              <Text style={styles.toggleButtonText}>Enabled</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </ScrollView>
  );

  const renderResultsTab = () => (
    <ScrollView showsVerticalScrollIndicator={false}>
      <View style={styles.tabContent}>
        <Text style={styles.tabTitle}>📊 Grading Results</Text>
        <Text style={styles.tabSubtitle}>
          AI-graded submissions with detailed analysis
        </Text>

        {/* Results Summary */}
        <View style={styles.summaryCards}>
          <View style={styles.summaryCard}>
            <Ionicons name="checkmark-circle" size={24} color="#4CAF50" />
            <Text style={styles.summaryNumber}>28</Text>
            <Text style={styles.summaryLabel}>Auto-Graded</Text>
          </View>
          <View style={styles.summaryCard}>
            <Ionicons name="time" size={24} color="#FF9800" />
            <Text style={styles.summaryNumber}>2.3s</Text>
            <Text style={styles.summaryLabel}>Avg Time</Text>
          </View>
          <View style={styles.summaryCard}>
            <Ionicons name="trending-up" size={24} color="#2196F3" />
            <Text style={styles.summaryNumber}>94%</Text>
            <Text style={styles.summaryLabel}>Accuracy</Text>
          </View>
        </View>

        {/* Individual Results */}
        <View style={styles.resultsSection}>
          <Text style={styles.sectionTitle}>🎯 Individual Results</Text>
          {sampleSubmissions.map((submission) => (
            <View key={submission.id} style={styles.resultCard}>
              <View style={styles.resultHeader}>
                <View style={styles.studentInfo}>
                  <Text style={styles.studentName}>{submission.studentName}</Text>
                  <Text style={styles.studentId}>{submission.studentId}</Text>
                </View>
                <View style={styles.scoreContainer}>
                  <Text style={styles.aiScore}>{submission.aiScore}</Text>
                  <Text style={styles.scoreLabel}>AI Score</Text>
                  <View style={styles.confidenceBadge}>
                    <Text style={styles.confidenceText}>{submission.confidence}%</Text>
                  </View>
                </View>
              </View>

              <View style={styles.feedbackSection}>
                <Text style={styles.feedbackTitle}>🤖 AI Feedback:</Text>
                <Text style={styles.feedbackText}>{submission.feedback}</Text>
              </View>

              <View style={styles.highlightsSection}>
                <View style={styles.highlights}>
                  <Text style={styles.highlightsTitle}>✅ Strengths:</Text>
                  {submission.highlights.map((highlight, index) => (
                    <Text key={index} style={styles.highlightItem}>• {highlight}</Text>
                  ))}
                </View>
                <View style={styles.issues}>
                  <Text style={styles.issuesTitle}>⚠️ Areas for Improvement:</Text>
                  {submission.issues.map((issue, index) => (
                    <Text key={index} style={styles.issueItem}>• {issue}</Text>
                  ))}
                </View>
              </View>

              <View style={styles.resultActions}>
                <View style={styles.plagiarismIndicator}>
                  <Ionicons 
                    name="shield-checkmark" 
                    size={16} 
                    color={submission.plagiarismScore < 10 ? "#4CAF50" : "#FF9800"} 
                  />
                  <Text style={[
                    styles.plagiarismText,
                    { color: submission.plagiarismScore < 10 ? "#4CAF50" : "#FF9800" }
                  ]}>
                    {submission.plagiarismScore}% similarity
                  </Text>
                </View>
                <TouchableOpacity style={styles.reviewButton}>
                  <Ionicons name="eye" size={16} color="#667eea" />
                  <Text style={styles.reviewButtonText}>Review</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.approveButton}>
                  <Ionicons name="checkmark" size={16} color="#fff" />
                  <Text style={styles.approveButtonText}>Approve</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))}
        </View>
      </View>
    </ScrollView>
  );

  const renderAnalyticsTab = () => (
    <ScrollView showsVerticalScrollIndicator={false}>
      <View style={styles.tabContent}>
        <Text style={styles.tabTitle}>📈 Grade Analytics</Text>
        <Text style={styles.tabSubtitle}>
          Deep insights into student performance and grading patterns
        </Text>

        {/* Performance Overview */}
        <View style={styles.analyticsCards}>
          <View style={styles.analyticsCard}>
            <Text style={styles.analyticsTitle}>Class Average</Text>
            <Text style={styles.analyticsValue}>82.3</Text>
            <View style={styles.analyticsChange}>
              <Ionicons name="trending-up" size={14} color="#4CAF50" />
              <Text style={styles.analyticsChangeText}>+5.2 from last assignment</Text>
            </View>
          </View>
          
          <View style={styles.analyticsCard}>
            <Text style={styles.analyticsTitle}>Top Performer</Text>
            <Text style={styles.analyticsValue}>96</Text>
            <Text style={styles.analyticsStudent}>Sarah Johnson</Text>
          </View>
        </View>

        {/* Grade Distribution */}
        <View style={styles.distributionSection}>
          <Text style={styles.sectionTitle}>📊 Grade Distribution</Text>
          <View style={styles.gradeChart}>
            <View style={styles.gradeBar}>
              <View style={[styles.gradeBarFill, { height: '90%', backgroundColor: '#4CAF50' }]} />
              <Text style={styles.gradeLabel}>A (90-100)</Text>
              <Text style={styles.gradeCount}>8 students</Text>
            </View>
            <View style={styles.gradeBar}>
              <View style={[styles.gradeBarFill, { height: '60%', backgroundColor: '#8BC34A' }]} />
              <Text style={styles.gradeLabel}>B (80-89)</Text>
              <Text style={styles.gradeCount}>12 students</Text>
            </View>
            <View style={styles.gradeBar}>
              <View style={[styles.gradeBarFill, { height: '40%', backgroundColor: '#FF9800' }]} />
              <Text style={styles.gradeLabel}>C (70-79)</Text>
              <Text style={styles.gradeCount}>6 students</Text>
            </View>
            <View style={styles.gradeBar}>
              <View style={[styles.gradeBarFill, { height: '20%', backgroundColor: '#FF5722' }]} />
              <Text style={styles.gradeLabel}>D (60-69)</Text>
              <Text style={styles.gradeCount}>2 students</Text>
            </View>
          </View>
        </View>

        {/* AI Insights */}
        <View style={styles.insightsSection}>
          <Text style={styles.sectionTitle}>🧠 AI Insights</Text>
          <View style={styles.insightCard}>
            <Ionicons name="bulb" size={20} color="#FF9800" />
            <View style={styles.insightContent}>
              <Text style={styles.insightTitle}>Learning Gap Detected</Text>
              <Text style={styles.insightText}>
                40% of students struggled with recursion concepts. Consider additional examples.
              </Text>
            </View>
          </View>
          <View style={styles.insightCard}>
            <Ionicons name="trending-up" size={20} color="#4CAF50" />
            <View style={styles.insightContent}>
              <Text style={styles.insightTitle}>Improvement Trend</Text>
              <Text style={styles.insightText}>
                Class performance improved 15% compared to previous assignment.
              </Text>
            </View>
          </View>
          <View style={styles.insightCard}>
            <Ionicons name="people" size={20} color="#2196F3" />
            <View style={styles.insightContent}>
              <Text style={styles.insightTitle}>Collaboration Opportunity</Text>
              <Text style={styles.insightText}>
                Consider pairing high performers with students needing support.
              </Text>
            </View>
          </View>
        </View>
      </View>
    </ScrollView>
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
                <Text style={styles.headerTitle}>Smart Grading System</Text>
                <Text style={styles.headerSubtitle}>
                  AI-powered grading with 94% accuracy
                </Text>
              </View>
              
              <View style={styles.aiBadge}>
                <Ionicons name="flash" size={20} color="#fff" />
              </View>
            </View>
          </LinearGradient>

          {/* Tab Navigation */}
          <View style={styles.tabContainer}>
            {[
              { id: 'auto-grade', label: 'Auto-Grade', icon: 'flash' },
              { id: 'results', label: 'Results', icon: 'checkmark-circle' },
              { id: 'analytics', label: 'Analytics', icon: 'analytics' },
            ].map((tab) => (
              <TouchableOpacity
                key={tab.id}
                style={[
                  styles.tab,
                  selectedTab === tab.id && styles.activeTab
                ]}
                onPress={() => setSelectedTab(tab.id)}
              >
                <Ionicons 
                  name={tab.icon} 
                  size={18} 
                  color={selectedTab === tab.id ? '#667eea' : '#999'} 
                />
                <Text style={[
                  styles.tabLabel,
                  selectedTab === tab.id && styles.activeTabLabel
                ]}>
                  {tab.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Content */}
          <View style={styles.content}>
            {selectedTab === 'auto-grade' && renderAutoGradeTab()}
            {selectedTab === 'results' && renderResultsTab()}
            {selectedTab === 'analytics' && renderAnalyticsTab()}
          </View>
        </Animated.View>
      </View>
    </Modal>
  );
};

// Styles would be comprehensive but similar to previous components
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
  aiBadge: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#f8f9fa',
    paddingHorizontal: 20,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 15,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  activeTab: {
    borderBottomColor: '#667eea',
  },
  tabLabel: {
    fontSize: 14,
    color: '#999',
    marginLeft: 6,
    fontWeight: '500',
  },
  activeTabLabel: {
    color: '#667eea',
    fontWeight: '600',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  
  // Tab content styles
  tabContent: {
    flex: 1,
  },
  tabTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  tabSubtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 24,
  },
  
  // Assignment cards
  queueSection: {
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 16,
  },
  assignmentCard: {
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
  assignmentHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  assignmentIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f0f8ff',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  assignmentInfo: {
    flex: 1,
  },
  assignmentTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  assignmentMeta: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  assignmentStats: {
    alignItems: 'center',
  },
  gradedCount: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#667eea',
  },
  gradedLabel: {
    fontSize: 12,
    color: '#666',
  },
  
  // Progress section
  progressSection: {
    marginBottom: 16,
  },
  progressHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  progressText: {
    fontSize: 14,
    color: '#4CAF50',
    fontWeight: '500',
  },
  progressBar: {
    height: 6,
    backgroundColor: '#e9ecef',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#4CAF50',
    borderRadius: 3,
  },
  
  // Action buttons
  assignmentActions: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    marginRight: 10,
  },
  aiGradeButton: {
    backgroundColor: '#4CAF50',
  },
  previewButton: {
    backgroundColor: '#f0f8ff',
    borderWidth: 1,
    borderColor: '#667eea',
  },
  actionButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#fff',
    marginLeft: 6,
  },
  manualGradeNote: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff3e0',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 15,
  },
  manualGradeText: {
    fontSize: 12,
    color: '#FF9800',
    marginLeft: 6,
  },
  
  // Settings section
  settingsSection: {
    marginTop: 20,
  },
  settingCard: {
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  settingHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginLeft: 8,
  },
  settingDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 12,
  },
  confidenceSlider: {
    alignItems: 'flex-end',
  },
  confidenceValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#4CAF50',
  },
  toggleButton: {
    backgroundColor: '#4CAF50',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
    alignSelf: 'flex-start',
  },
  toggleButtonText: {
    fontSize: 12,
    color: '#fff',
    fontWeight: '500',
  },
  
  // Results tab styles
  summaryCards: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  summaryCard: {
    flex: 1,
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginHorizontal: 4,
  },
  summaryNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 8,
  },
  summaryLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
  
  // Result cards
  resultsSection: {
    marginTop: 20,
  },
  resultCard: {
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
  resultHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  studentInfo: {
    flex: 1,
  },
  studentName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  studentId: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  scoreContainer: {
    alignItems: 'center',
  },
  aiScore: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#4CAF50',
  },
  scoreLabel: {
    fontSize: 12,
    color: '#666',
  },
  confidenceBadge: {
    backgroundColor: '#e8f5e8',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginTop: 4,
  },
  confidenceText: {
    fontSize: 10,
    color: '#4CAF50',
    fontWeight: '500',
  },
  
  // Feedback section
  feedbackSection: {
    marginBottom: 16,
  },
  feedbackTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  feedbackText: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  
  // Highlights section
  highlightsSection: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  highlights: {
    flex: 1,
    marginRight: 12,
  },
  issues: {
    flex: 1,
  },
  highlightsTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: '#4CAF50',
    marginBottom: 6,
  },
  issuesTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FF9800',
    marginBottom: 6,
  },
  highlightItem: {
    fontSize: 12,
    color: '#4CAF50',
    marginBottom: 2,
  },
  issueItem: {
    fontSize: 12,
    color: '#FF9800',
    marginBottom: 2,
  },
  
  // Result actions
  resultActions: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  plagiarismIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  plagiarismText: {
    fontSize: 12,
    marginLeft: 4,
    fontWeight: '500',
  },
  reviewButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0f8ff',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 15,
    marginRight: 8,
  },
  reviewButtonText: {
    fontSize: 12,
    color: '#667eea',
    marginLeft: 4,
  },
  approveButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#4CAF50',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 15,
  },
  approveButtonText: {
    fontSize: 12,
    color: '#fff',
    marginLeft: 4,
  },
  
  // Analytics styles
  analyticsCards: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  analyticsCard: {
    flex: 1,
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 4,
  },
  analyticsTitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  analyticsValue: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
  },
  analyticsChange: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  analyticsChangeText: {
    fontSize: 12,
    color: '#4CAF50',
    marginLeft: 4,
  },
  analyticsStudent: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
  
  // Grade distribution
  distributionSection: {
    marginBottom: 24,
  },
  gradeChart: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    height: 120,
    paddingHorizontal: 16,
  },
  gradeBar: {
    flex: 1,
    alignItems: 'center',
    marginHorizontal: 4,
  },
  gradeBarFill: {
    width: '100%',
    borderRadius: 4,
    marginBottom: 8,
  },
  gradeLabel: {
    fontSize: 10,
    color: '#666',
    textAlign: 'center',
    marginBottom: 4,
  },
  gradeCount: {
    fontSize: 10,
    color: '#333',
    fontWeight: '500',
    textAlign: 'center',
  },
  
  // Insights
  insightsSection: {
    marginTop: 20,
  },
  insightCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  insightContent: {
    flex: 1,
    marginLeft: 12,
  },
  insightTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  insightText: {
    fontSize: 14,
    color: '#666',
    lineHeight: 18,
  },
});

export default SmartGradingSystem;
