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
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

const { width, height } = Dimensions.get('window');

export const AIPerformancePrediction = ({ visible, onClose, course, user }) => {
  const [selectedTab, setSelectedTab] = useState('predictions');
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisProgress, setAnalysisProgress] = useState(0);

  const slideAnim = useRef(new Animated.Value(height)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;

  // Sample student performance data with AI predictions
  const studentPredictions = [
    {
      id: 1,
      name: 'Sarah Johnson',
      studentId: 'CST2019001',
      currentGrade: 'A-',
      currentScore: 87,
      predictedFinalGrade: 'A',
      predictedScore: 91,
      riskLevel: 'low',
      confidence: 94,
      trend: 'improving',
      factors: {
        attendance: 95,
        engagement: 89,
        assignments: 92,
        quizzes: 85,
        participation: 91,
        studyTime: 88
      },
      recommendations: [
        'Continue current study pattern',
        'Consider advanced topics for extra credit',
        'Mentor struggling classmates'
      ],
      interventions: [],
      probabilitySuccess: 96,
      timeToGraduation: '1.5 years',
      careerReadiness: 'Excellent'
    },
    {
      id: 2,
      name: 'Michael Chen',
      studentId: 'CST2019002',
      currentGrade: 'C+',
      currentScore: 72,
      predictedFinalGrade: 'B-',
      predictedScore: 78,
      riskLevel: 'medium',
      confidence: 87,
      trend: 'stable',
      factors: {
        attendance: 78,
        engagement: 65,
        assignments: 74,
        quizzes: 71,
        participation: 58,
        studyTime: 62
      },
      recommendations: [
        'Increase study group participation',
        'Schedule weekly office hours',
        'Focus on assignment quality over quantity'
      ],
      interventions: ['Study group assignment', 'Weekly check-ins'],
      probabilitySuccess: 82,
      timeToGraduation: '2.2 years',
      careerReadiness: 'Good with support'
    },
    {
      id: 3,
      name: 'Emma Davis',
      studentId: 'CST2019003',
      currentGrade: 'B+',
      currentScore: 84,
      predictedFinalGrade: 'A-',
      predictedScore: 88,
      riskLevel: 'low',
      confidence: 91,
      trend: 'improving',
      factors: {
        attendance: 92,
        engagement: 86,
        assignments: 88,
        quizzes: 82,
        participation: 79,
        studyTime: 85
      },
      recommendations: [
        'Increase class participation',
        'Join advanced study sessions',
        'Consider leadership roles in group projects'
      ],
      interventions: [],
      probabilitySuccess: 93,
      timeToGraduation: '1.8 years',
      careerReadiness: 'Very Good'
    },
    {
      id: 4,
      name: 'Alex Rodriguez',
      studentId: 'CST2019004',
      currentGrade: 'D+',
      currentScore: 58,
      predictedFinalGrade: 'C-',
      predictedScore: 65,
      riskLevel: 'high',
      confidence: 89,
      trend: 'declining',
      factors: {
        attendance: 62,
        engagement: 45,
        assignments: 55,
        quizzes: 48,
        participation: 35,
        studyTime: 41
      },
      recommendations: [
        'Immediate academic intervention required',
        'One-on-one tutoring sessions',
        'Reduce course load if necessary',
        'Connect with academic advisor'
      ],
      interventions: ['Urgent tutoring', 'Academic probation watch', 'Counseling referral'],
      probabilitySuccess: 68,
      timeToGraduation: '3+ years',
      careerReadiness: 'Needs significant support'
    },
    {
      id: 5,
      name: 'Lisa Wang',
      studentId: 'CST2019005',
      currentGrade: 'B',
      currentScore: 81,
      predictedFinalGrade: 'B+',
      predictedScore: 85,
      riskLevel: 'low',
      confidence: 92,
      trend: 'steady',
      factors: {
        attendance: 88,
        engagement: 83,
        assignments: 85,
        quizzes: 79,
        participation: 74,
        studyTime: 82
      },
      recommendations: [
        'Maintain consistent effort',
        'Explore internship opportunities',
        'Consider specialization tracks'
      ],
      interventions: [],
      probabilitySuccess: 89,
      timeToGraduation: '2 years',
      careerReadiness: 'Good'
    }
  ];

  const classInsights = {
    totalStudents: 28,
    atRiskStudents: 3,
    improvingStudents: 8,
    stableStudents: 17,
    averagePredictedGrade: 82,
    classSuccessRate: 87,
    interventionsActive: 5,
    recommendationsGenerated: 47
  };

  const predictionFactors = [
    {
      id: 'attendance',
      name: 'Attendance Rate',
      icon: 'calendar',
      weight: 25,
      description: 'Class attendance and punctuality patterns'
    },
    {
      id: 'engagement',
      name: 'Engagement Score',
      icon: 'trending-up',
      weight: 20,
      description: 'Participation, questions, and interaction levels'
    },
    {
      id: 'assignments',
      name: 'Assignment Performance',
      icon: 'document-text',
      weight: 20,
      description: 'Quality and timeliness of submitted work'
    },
    {
      id: 'quizzes',
      name: 'Quiz Scores',
      icon: 'help-circle',
      weight: 15,
      description: 'Performance on regular assessments'
    },
    {
      id: 'studyTime',
      name: 'Study Patterns',
      icon: 'time',
      weight: 12,
      description: 'Time spent on course materials and practice'
    },
    {
      id: 'participation',
      name: 'Class Participation',
      icon: 'people',
      weight: 8,
      description: 'Active involvement in discussions and activities'
    }
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

  useEffect(() => {
    if (isAnalyzing) {
      const pulseAnimation = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, { toValue: 1.2, duration: 1000, useNativeDriver: true }),
          Animated.timing(pulseAnim, { toValue: 1, duration: 1000, useNativeDriver: true }),
        ])
      );
      pulseAnimation.start();
      return () => pulseAnimation.stop();
    }
  }, [isAnalyzing]);

  const startAnalysis = () => {
    Alert.alert(
      '🤖 Start AI Performance Analysis?',
      `Analyze all students in "${course?.name || 'your course'}" using advanced machine learning?\n\n🧠 AI will analyze:\n• Learning patterns\n• Engagement metrics\n• Performance trends\n• Risk factors\n• Success predictors\n\n⚡ Processing time: ~30 seconds`,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Start Analysis', 
          onPress: () => {
            setIsAnalyzing(true);
            setAnalysisProgress(0);
            
            // Simulate AI analysis progress
            const interval = setInterval(() => {
              setAnalysisProgress(prev => {
                if (prev >= 100) {
                  clearInterval(interval);
                  setIsAnalyzing(false);
                  Alert.alert(
                    '✅ AI Analysis Complete!',
                    `Performance predictions generated for ${classInsights.totalStudents} students!\n\n📊 Results:\n• ${classInsights.atRiskStudents} students need intervention\n• ${classInsights.improvingStudents} students showing improvement\n• ${classInsights.interventionsActive} active interventions recommended\n• ${classInsights.classSuccessRate}% predicted class success rate`,
                    [{ text: 'View Results', onPress: () => setSelectedTab('predictions') }]
                  );
                  return 100;
                }
                return prev + Math.random() * 12;
              });
            }, 250);
          }
        }
      ]
    );
  };

  const getRiskColor = (risk) => {
    switch (risk) {
      case 'high': return '#FF5722';
      case 'medium': return '#FF9800';
      case 'low': return '#4CAF50';
      default: return '#666';
    }
  };

  const getTrendIcon = (trend) => {
    switch (trend) {
      case 'improving': return 'trending-up';
      case 'declining': return 'trending-down';
      case 'stable': return 'remove';
      default: return 'help-circle';
    }
  };

  const getTrendColor = (trend) => {
    switch (trend) {
      case 'improving': return '#4CAF50';
      case 'declining': return '#FF5722';
      case 'stable': return '#FF9800';
      default: return '#666';
    }
  };

  const renderPredictionsTab = () => (
    <ScrollView showsVerticalScrollIndicator={false}>
      <View style={styles.tabContent}>
        <Text style={styles.tabTitle}>🔮 AI Performance Predictions</Text>
        <Text style={styles.tabSubtitle}>
          Machine learning-powered predictions with 92% accuracy
        </Text>

        {/* Class Overview */}
        <View style={styles.overviewSection}>
          <Text style={styles.sectionTitle}>📊 Class Overview</Text>
          <View style={styles.overviewCards}>
            <View style={styles.overviewCard}>
              <Ionicons name="people" size={24} color="#667eea" />
              <Text style={styles.overviewNumber}>{classInsights.totalStudents}</Text>
              <Text style={styles.overviewLabel}>Total Students</Text>
            </View>
            <View style={styles.overviewCard}>
              <Ionicons name="warning" size={24} color="#FF5722" />
              <Text style={[styles.overviewNumber, { color: '#FF5722' }]}>{classInsights.atRiskStudents}</Text>
              <Text style={styles.overviewLabel}>At Risk</Text>
            </View>
            <View style={styles.overviewCard}>
              <Ionicons name="trending-up" size={24} color="#4CAF50" />
              <Text style={[styles.overviewNumber, { color: '#4CAF50' }]}>{classInsights.improvingStudents}</Text>
              <Text style={styles.overviewLabel}>Improving</Text>
            </View>
            <View style={styles.overviewCard}>
              <Ionicons name="checkmark-circle" size={24} color="#2196F3" />
              <Text style={[styles.overviewNumber, { color: '#2196F3' }]}>{classInsights.classSuccessRate}%</Text>
              <Text style={styles.overviewLabel}>Success Rate</Text>
            </View>
          </View>
        </View>

        {/* Start Analysis Button */}
        {!isAnalyzing && (
          <TouchableOpacity style={styles.analysisButton} onPress={startAnalysis}>
            <LinearGradient colors={['#667eea', '#764ba2']} style={styles.analysisButtonGradient}>
              <Ionicons name="analytics" size={24} color="#fff" />
              <Text style={styles.analysisButtonText}>Run AI Analysis</Text>
            </LinearGradient>
          </TouchableOpacity>
        )}

        {/* Analysis Progress */}
        {isAnalyzing && (
          <View style={styles.analysisProgress}>
            <Animated.View style={[styles.analysisIcon, { transform: [{ scale: pulseAnim }] }]}>
              <Ionicons name="brain" size={32} color="#667eea" />
            </Animated.View>
            <Text style={styles.analysisTitle}>AI is analyzing student performance...</Text>
            <View style={styles.progressBar}>
              <View style={[styles.progressFill, { width: `${analysisProgress}%` }]} />
            </View>
            <Text style={styles.progressText}>{Math.round(analysisProgress)}% complete</Text>
          </View>
        )}

        {/* Student Predictions */}
        <View style={styles.predictionsSection}>
          <Text style={styles.sectionTitle}>🎯 Individual Predictions</Text>
          {studentPredictions.map((student) => (
            <TouchableOpacity
              key={student.id}
              style={styles.studentCard}
              onPress={() => setSelectedStudent(student)}
            >
              <View style={styles.studentHeader}>
                <View style={styles.studentInfo}>
                  <Text style={styles.studentName}>{student.name}</Text>
                  <Text style={styles.studentId}>{student.studentId}</Text>
                </View>
                <View style={styles.predictionSummary}>
                  <View style={styles.gradeComparison}>
                    <Text style={styles.currentGrade}>Current: {student.currentGrade}</Text>
                    <Ionicons name="arrow-forward" size={16} color="#666" />
                    <Text style={styles.predictedGrade}>Predicted: {student.predictedFinalGrade}</Text>
                  </View>
                  <View style={[styles.riskBadge, { backgroundColor: getRiskColor(student.riskLevel) }]}>
                    <Text style={styles.riskText}>{student.riskLevel.toUpperCase()} RISK</Text>
                  </View>
                </View>
              </View>

              <View style={styles.studentMetrics}>
                <View style={styles.metricItem}>
                  <Ionicons name="trending-up" size={16} color="#4CAF50" />
                  <Text style={styles.metricText}>{student.probabilitySuccess}% success</Text>
                </View>
                <View style={styles.metricItem}>
                  <Ionicons name={getTrendIcon(student.trend)} size={16} color={getTrendColor(student.trend)} />
                  <Text style={styles.metricText}>{student.trend}</Text>
                </View>
                <View style={styles.metricItem}>
                  <Ionicons name="shield-checkmark" size={16} color="#667eea" />
                  <Text style={styles.metricText}>{student.confidence}% confidence</Text>
                </View>
              </View>

              {student.interventions.length > 0 && (
                <View style={styles.interventionsPreview}>
                  <Text style={styles.interventionsTitle}>🚨 Active Interventions:</Text>
                  <Text style={styles.interventionsText}>
                    {student.interventions.slice(0, 2).join(', ')}
                    {student.interventions.length > 2 && ` +${student.interventions.length - 2} more`}
                  </Text>
                </View>
              )}
            </TouchableOpacity>
          ))}
        </View>
      </View>
    </ScrollView>
  );

  const renderFactorsTab = () => (
    <ScrollView showsVerticalScrollIndicator={false}>
      <View style={styles.tabContent}>
        <Text style={styles.tabTitle}>🧠 AI Prediction Factors</Text>
        <Text style={styles.tabSubtitle}>
          Machine learning model uses these key factors for predictions
        </Text>

        {/* Prediction Model Overview */}
        <View style={styles.modelSection}>
          <Text style={styles.sectionTitle}>🤖 AI Model Information</Text>
          <View style={styles.modelCard}>
            <View style={styles.modelHeader}>
              <Ionicons name="brain" size={32} color="#667eea" />
              <View style={styles.modelInfo}>
                <Text style={styles.modelTitle}>Advanced Neural Network</Text>
                <Text style={styles.modelDescription}>Deep learning model trained on 50,000+ student records</Text>
              </View>
            </View>
            <View style={styles.modelStats}>
              <View style={styles.modelStat}>
                <Text style={styles.modelStatNumber}>92%</Text>
                <Text style={styles.modelStatLabel}>Accuracy</Text>
              </View>
              <View style={styles.modelStat}>
                <Text style={styles.modelStatNumber}>50K+</Text>
                <Text style={styles.modelStatLabel}>Training Data</Text>
              </View>
              <View style={styles.modelStat}>
                <Text style={styles.modelStatNumber}>6</Text>
                <Text style={styles.modelStatLabel}>Key Factors</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Prediction Factors */}
        <View style={styles.factorsSection}>
          <Text style={styles.sectionTitle}>📊 Prediction Factors & Weights</Text>
          {predictionFactors.map((factor) => (
            <View key={factor.id} style={styles.factorCard}>
              <View style={styles.factorHeader}>
                <View style={styles.factorIcon}>
                  <Ionicons name={factor.icon} size={24} color="#667eea" />
                </View>
                <View style={styles.factorInfo}>
                  <Text style={styles.factorName}>{factor.name}</Text>
                  <Text style={styles.factorDescription}>{factor.description}</Text>
                </View>
                <View style={styles.factorWeight}>
                  <Text style={styles.weightNumber}>{factor.weight}%</Text>
                  <Text style={styles.weightLabel}>weight</Text>
                </View>
              </View>
              <View style={styles.weightBar}>
                <View style={[styles.weightFill, { width: `${factor.weight * 4}%` }]} />
              </View>
            </View>
          ))}
        </View>

        {/* AI Insights */}
        <View style={styles.insightsSection}>
          <Text style={styles.sectionTitle}>💡 AI Model Insights</Text>
          <View style={styles.insightCard}>
            <Ionicons name="bulb" size={20} color="#FF9800" />
            <View style={styles.insightContent}>
              <Text style={styles.insightTitle}>Attendance is Critical</Text>
              <Text style={styles.insightText}>
                Students with 90%+ attendance have 85% higher success rates
              </Text>
            </View>
          </View>
          <View style={styles.insightCard}>
            <Ionicons name="trending-up" size={20} color="#4CAF50" />
            <View style={styles.insightContent}>
              <Text style={styles.insightTitle}>Engagement Predicts Success</Text>
              <Text style={styles.insightText}>
                High engagement scores correlate with 78% better final grades
              </Text>
            </View>
          </View>
          <View style={styles.insightCard}>
            <Ionicons name="time" size={20} color="#2196F3" />
            <View style={styles.insightContent}>
              <Text style={styles.insightTitle}>Early Intervention Works</Text>
              <Text style={styles.insightText}>
                Students receiving early support improve by average 23 points
              </Text>
            </View>
          </View>
        </View>
      </View>
    </ScrollView>
  );

  const renderStudentDetailModal = () => {
    if (!selectedStudent) return null;

    return (
      <Modal visible={!!selectedStudent} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{selectedStudent.name}</Text>
              <TouchableOpacity onPress={() => setSelectedStudent(null)}>
                <Ionicons name="close" size={24} color="#666" />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalContent}>
              {/* Prediction Summary */}
              <View style={styles.predictionCard}>
                <Text style={styles.predictionTitle}>🔮 AI Prediction Summary</Text>
                <View style={styles.predictionDetails}>
                  <View style={styles.predictionItem}>
                    <Text style={styles.predictionLabel}>Current Performance</Text>
                    <Text style={styles.predictionValue}>{selectedStudent.currentGrade} ({selectedStudent.currentScore}%)</Text>
                  </View>
                  <View style={styles.predictionItem}>
                    <Text style={styles.predictionLabel}>Predicted Final Grade</Text>
                    <Text style={styles.predictionValue}>{selectedStudent.predictedFinalGrade} ({selectedStudent.predictedScore}%)</Text>
                  </View>
                  <View style={styles.predictionItem}>
                    <Text style={styles.predictionLabel}>Success Probability</Text>
                    <Text style={styles.predictionValue}>{selectedStudent.probabilitySuccess}%</Text>
                  </View>
                  <View style={styles.predictionItem}>
                    <Text style={styles.predictionLabel}>Confidence Level</Text>
                    <Text style={styles.predictionValue}>{selectedStudent.confidence}%</Text>
                  </View>
                </View>
              </View>

              {/* Performance Factors */}
              <View style={styles.factorsCard}>
                <Text style={styles.factorsTitle}>📊 Performance Factors</Text>
                {Object.entries(selectedStudent.factors).map(([key, value]) => {
                  const factor = predictionFactors.find(f => f.id === key);
                  if (!factor) return null;
                  
                  return (
                    <View key={key} style={styles.factorRow}>
                      <Text style={styles.factorRowName}>{factor.name}</Text>
                      <View style={styles.factorRowBar}>
                        <View style={[styles.factorRowFill, { width: `${value}%`, backgroundColor: value >= 80 ? '#4CAF50' : value >= 60 ? '#FF9800' : '#FF5722' }]} />
                      </View>
                      <Text style={styles.factorRowValue}>{value}%</Text>
                    </View>
                  );
                })}
              </View>

              {/* Recommendations */}
              <View style={styles.recommendationsCard}>
                <Text style={styles.recommendationsTitle}>💡 AI Recommendations</Text>
                {selectedStudent.recommendations.map((rec, index) => (
                  <View key={index} style={styles.recommendationItem}>
                    <Ionicons name="bulb" size={16} color="#FF9800" />
                    <Text style={styles.recommendationText}>{rec}</Text>
                  </View>
                ))}
              </View>

              {/* Active Interventions */}
              {selectedStudent.interventions.length > 0 && (
                <View style={styles.interventionsCard}>
                  <Text style={styles.interventionsCardTitle}>🚨 Active Interventions</Text>
                  {selectedStudent.interventions.map((intervention, index) => (
                    <View key={index} style={styles.interventionItem}>
                      <Ionicons name="medical" size={16} color="#FF5722" />
                      <Text style={styles.interventionText}>{intervention}</Text>
                    </View>
                  ))}
                </View>
              )}
            </ScrollView>
          </View>
        </View>
      </Modal>
    );
  };

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
                <Text style={styles.headerTitle}>🔮 AI Performance Prediction</Text>
                <Text style={styles.headerSubtitle}>
                  92% accurate machine learning predictions
                </Text>
              </View>
              
              <View style={styles.aiPoweredBadge}>
                <Ionicons name="brain" size={20} color="#fff" />
              </View>
            </View>
          </LinearGradient>

          {/* Tab Navigation */}
          <View style={styles.tabContainer}>
            {[
              { id: 'predictions', label: 'Predictions', icon: 'analytics' },
              { id: 'factors', label: 'AI Factors', icon: 'brain' },
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
            {selectedTab === 'predictions' && renderPredictionsTab()}
            {selectedTab === 'factors' && renderFactorsTab()}
          </View>

          {/* Student Detail Modal */}
          {renderStudentDetailModal()}
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
  
  // Tab Navigation
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
  
  // Content
  content: {
    flex: 1,
  },
  tabContent: {
    padding: 20,
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
  
  // Overview Section
  overviewSection: {
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 16,
  },
  overviewCards: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  overviewCard: {
    width: '48%',
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginBottom: 12,
  },
  overviewNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 8,
  },
  overviewLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
  
  // Analysis Button
  analysisButton: {
    marginBottom: 30,
  },
  analysisButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 25,
  },
  analysisButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
    marginLeft: 8,
  },
  
  // Analysis Progress
  analysisProgress: {
    backgroundColor: '#f0f8ff',
    borderRadius: 15,
    padding: 20,
    marginBottom: 30,
    alignItems: 'center',
  },
  analysisIcon: {
    marginBottom: 16,
  },
  analysisTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 16,
  },
  progressBar: {
    width: '100%',
    height: 8,
    backgroundColor: '#e9ecef',
    borderRadius: 4,
    marginBottom: 12,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#667eea',
    borderRadius: 4,
  },
  progressText: {
    fontSize: 14,
    color: '#667eea',
    fontWeight: '600',
  },
  
  // Student Predictions
  predictionsSection: {
    marginTop: 20,
  },
  studentCard: {
    backgroundColor: '#fff',
    borderRadius: 15,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  studentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
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
  predictionSummary: {
    alignItems: 'flex-end',
  },
  gradeComparison: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  currentGrade: {
    fontSize: 12,
    color: '#666',
    marginRight: 6,
  },
  predictedGrade: {
    fontSize: 12,
    color: '#4CAF50',
    fontWeight: '600',
    marginLeft: 6,
  },
  riskBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  riskText: {
    fontSize: 10,
    color: '#fff',
    fontWeight: 'bold',
  },
  studentMetrics: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  metricItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  metricText: {
    fontSize: 12,
    color: '#666',
    marginLeft: 4,
  },
  interventionsPreview: {
    backgroundColor: '#ffebee',
    borderRadius: 8,
    padding: 12,
  },
  interventionsTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FF5722',
    marginBottom: 4,
  },
  interventionsText: {
    fontSize: 12,
    color: '#FF5722',
  },
  
  // Model Section
  modelSection: {
    marginBottom: 30,
  },
  modelCard: {
    backgroundColor: '#f8f9fa',
    borderRadius: 15,
    padding: 20,
  },
  modelHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  modelInfo: {
    flex: 1,
    marginLeft: 12,
  },
  modelTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  modelDescription: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  modelStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  modelStat: {
    alignItems: 'center',
  },
  modelStatNumber: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#667eea',
  },
  modelStatLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
  
  // Factors Section
  factorsSection: {
    marginBottom: 30,
  },
  factorCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  factorHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  factorIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f0f8ff',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  factorInfo: {
    flex: 1,
  },
  factorName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  factorDescription: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  factorWeight: {
    alignItems: 'center',
  },
  weightNumber: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#667eea',
  },
  weightLabel: {
    fontSize: 10,
    color: '#666',
  },
  weightBar: {
    height: 4,
    backgroundColor: '#e9ecef',
    borderRadius: 2,
  },
  weightFill: {
    height: '100%',
    backgroundColor: '#667eea',
    borderRadius: 2,
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
  
  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    width: width * 0.9,
    maxHeight: height * 0.8,
    backgroundColor: '#fff',
    borderRadius: 20,
    overflow: 'hidden',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  modalContent: {
    flex: 1,
    padding: 20,
  },
  
  // Prediction Card
  predictionCard: {
    backgroundColor: '#f0f8ff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
  },
  predictionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  predictionDetails: {
    gap: 8,
  },
  predictionItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  predictionLabel: {
    fontSize: 14,
    color: '#666',
  },
  predictionValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  
  // Factors Card
  factorsCard: {
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
  },
  factorsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  factorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  factorRowName: {
    fontSize: 14,
    color: '#333',
    width: 120,
  },
  factorRowBar: {
    flex: 1,
    height: 6,
    backgroundColor: '#e9ecef',
    borderRadius: 3,
    marginHorizontal: 12,
  },
  factorRowFill: {
    height: '100%',
    borderRadius: 3,
  },
  factorRowValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    width: 40,
    textAlign: 'right',
  },
  
  // Recommendations Card
  recommendationsCard: {
    backgroundColor: '#fff8e1',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
  },
  recommendationsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  recommendationItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  recommendationText: {
    fontSize: 14,
    color: '#666',
    marginLeft: 8,
    flex: 1,
  },
  
  // Interventions Card
  interventionsCard: {
    backgroundColor: '#ffebee',
    borderRadius: 12,
    padding: 16,
  },
  interventionsCardTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  interventionItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  interventionText: {
    fontSize: 14,
    color: '#FF5722',
    marginLeft: 8,
    flex: 1,
  },
});

export default AIPerformancePrediction;
