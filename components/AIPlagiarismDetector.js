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
  TextInput,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

const { width, height } = Dimensions.get('window');

export const AIPlagiarismDetector = ({ visible, onClose, course, user }) => {
  const [selectedTab, setSelectedTab] = useState('scan');
  const [isScanning, setIsScanning] = useState(false);
  const [scanProgress, setScanProgress] = useState(0);
  const [scanResults, setScanResults] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);

  const slideAnim = useRef(new Animated.Value(height)).current;
  const progressAnim = useRef(new Animated.Value(0)).current;

  const detectionMethods = [
    {
      id: 'semantic',
      name: 'Semantic Analysis',
      icon: 'brain',
      color: '#4CAF50',
      description: 'AI understands meaning, not just words',
      accuracy: '96%'
    },
    {
      id: 'fingerprinting',
      name: 'Document Fingerprinting',
      icon: 'finger-print',
      color: '#2196F3',
      description: 'Unique document signatures',
      accuracy: '94%'
    },
    {
      id: 'stylometric',
      name: 'Writing Style Analysis',
      icon: 'create',
      color: '#FF9800',
      description: 'Analyzes individual writing patterns',
      accuracy: '89%'
    },
    {
      id: 'crosslingual',
      name: 'Cross-Language Detection',
      icon: 'globe',
      color: '#9C27B0',
      description: 'Detects translation plagiarism',
      accuracy: '92%'
    },
    {
      id: 'paraphrasing',
      name: 'Paraphrase Detection',
      icon: 'repeat',
      color: '#FF5722',
      description: 'Finds sophisticated rewrites',
      accuracy: '91%'
    },
  ];

  const sampleSubmissions = [
    {
      id: 1,
      studentName: 'Alex Thompson',
      assignment: 'Data Structures Essay',
      submittedAt: '2024-02-14 11:30 AM',
      plagiarismScore: 15,
      risk: 'medium',
      sources: 3,
      flags: ['Paraphrasing detected', 'Similar structure'],
      originalityScore: 85,
      wordCount: 1250,
    },
    {
      id: 2,
      studentName: 'Sarah Johnson',
      assignment: 'Algorithm Analysis',
      submittedAt: '2024-02-14 10:15 AM',
      plagiarismScore: 3,
      risk: 'low',
      sources: 1,
      flags: ['Common phrases only'],
      originalityScore: 97,
      wordCount: 980,
    },
    {
      id: 3,
      studentName: 'Michael Chen',
      assignment: 'Database Design Report',
      submittedAt: '2024-02-13 09:45 PM',
      plagiarismScore: 42,
      risk: 'high',
      sources: 8,
      flags: ['Direct copying', 'Multiple sources', 'Inconsistent style'],
      originalityScore: 58,
      wordCount: 1500,
    },
    {
      id: 4,
      studentName: 'Emma Davis',
      assignment: 'Software Engineering Principles',
      submittedAt: '2024-02-13 08:20 PM',
      plagiarismScore: 8,
      risk: 'low',
      sources: 2,
      flags: ['Standard definitions', 'Proper citations'],
      originalityScore: 92,
      wordCount: 1100,
    },
  ];

  const detectionSources = [
    { name: 'Academic Databases', count: '50M+ papers', icon: 'school' },
    { name: 'Web Content', count: '15B+ pages', icon: 'globe' },
    { name: 'Student Submissions', count: '500M+ documents', icon: 'document-text' },
    { name: 'Books & Publications', count: '10M+ books', icon: 'library' },
    { name: 'Code Repositories', count: '100M+ repos', icon: 'code-slash' },
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

  const startScan = () => {
    Alert.alert(
      '🔍 Start AI Plagiarism Scan?',
      `Scan all submissions for "${course?.name || 'your course'}" using advanced AI detection?\n\n🤖 AI Methods:\n${detectionMethods.map(m => `• ${m.name} (${m.accuracy})`).join('\n')}\n\n📊 Sources: 65B+ documents`,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Start Scan', 
          onPress: () => {
            setIsScanning(true);
            setScanProgress(0);
            
            // Simulate AI scanning progress
            const interval = setInterval(() => {
              setScanProgress(prev => {
                if (prev >= 100) {
                  clearInterval(interval);
                  setIsScanning(false);
                  setScanResults({
                    totalSubmissions: 28,
                    flagged: 3,
                    highRisk: 1,
                    mediumRisk: 2,
                    lowRisk: 25,
                    averageOriginality: 89,
                    processingTime: '2m 34s'
                  });
                  Alert.alert(
                    '✅ Scan Complete!',
                    `AI plagiarism scan finished!\n\n📊 Results:\n• 28 submissions scanned\n• 3 flagged for review\n• 89% average originality\n• Processing time: 2m 34s\n\n🎯 Accuracy: 96% with semantic analysis`,
                    [{ text: 'View Results', onPress: () => setSelectedTab('results') }]
                  );
                  return 100;
                }
                return prev + Math.random() * 8;
              });
            }, 200);
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

  const getRiskIcon = (risk) => {
    switch (risk) {
      case 'high': return 'warning';
      case 'medium': return 'alert-circle';
      case 'low': return 'checkmark-circle';
      default: return 'help-circle';
    }
  };

  const renderScanTab = () => (
    <ScrollView showsVerticalScrollIndicator={false}>
      <View style={styles.tabContent}>
        <Text style={styles.tabTitle}>🔍 AI Plagiarism Detection</Text>
        <Text style={styles.tabSubtitle}>
          Advanced AI-powered plagiarism detection with 96% accuracy
        </Text>

        {/* Detection Methods */}
        <View style={styles.methodsSection}>
          <Text style={styles.sectionTitle}>🤖 AI Detection Methods</Text>
          {detectionMethods.map((method) => (
            <View key={method.id} style={styles.methodCard}>
              <View style={[styles.methodIcon, { backgroundColor: `${method.color}20` }]}>
                <Ionicons name={method.icon} size={24} color={method.color} />
              </View>
              <View style={styles.methodInfo}>
                <View style={styles.methodHeader}>
                  <Text style={styles.methodName}>{method.name}</Text>
                  <View style={[styles.accuracyBadge, { backgroundColor: method.color }]}>
                    <Text style={styles.accuracyText}>{method.accuracy}</Text>
                  </View>
                </View>
                <Text style={styles.methodDescription}>{method.description}</Text>
              </View>
            </View>
          ))}
        </View>

        {/* Detection Sources */}
        <View style={styles.sourcesSection}>
          <Text style={styles.sectionTitle}>📚 Detection Sources</Text>
          <View style={styles.sourcesGrid}>
            {detectionSources.map((source, index) => (
              <View key={index} style={styles.sourceCard}>
                <Ionicons name={source.icon} size={24} color="#667eea" />
                <Text style={styles.sourceName}>{source.name}</Text>
                <Text style={styles.sourceCount}>{source.count}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Scan Controls */}
        <View style={styles.scanSection}>
          <Text style={styles.sectionTitle}>🚀 Start Plagiarism Scan</Text>
          
          {isScanning ? (
            <View style={styles.scanningContainer}>
              <Text style={styles.scanningTitle}>AI is analyzing submissions...</Text>
              <View style={styles.progressContainer}>
                <View style={styles.progressBar}>
                  <View style={[styles.progressFill, { width: `${scanProgress}%` }]} />
                </View>
                <Text style={styles.progressText}>{Math.round(scanProgress)}%</Text>
              </View>
              <View style={styles.scanningSteps}>
                <View style={styles.scanStep}>
                  <Ionicons name="checkmark-circle" size={16} color="#4CAF50" />
                  <Text style={styles.scanStepText}>Document preprocessing</Text>
                </View>
                <View style={[styles.scanStep, scanProgress < 40 && { opacity: 0.5 }]}>
                  <Ionicons 
                    name={scanProgress >= 40 ? "checkmark-circle" : "ellipse-outline"} 
                    size={16} 
                    color={scanProgress >= 40 ? "#4CAF50" : "#ccc"} 
                  />
                  <Text style={styles.scanStepText}>Semantic analysis</Text>
                </View>
                <View style={[styles.scanStep, scanProgress < 70 && { opacity: 0.5 }]}>
                  <Ionicons 
                    name={scanProgress >= 70 ? "checkmark-circle" : "ellipse-outline"} 
                    size={16} 
                    color={scanProgress >= 70 ? "#4CAF50" : "#ccc"} 
                  />
                  <Text style={styles.scanStepText}>Source comparison</Text>
                </View>
                <View style={[styles.scanStep, scanProgress < 90 && { opacity: 0.5 }]}>
                  <Ionicons 
                    name={scanProgress >= 90 ? "checkmark-circle" : "ellipse-outline"} 
                    size={16} 
                    color={scanProgress >= 90 ? "#4CAF50" : "#ccc"} 
                  />
                  <Text style={styles.scanStepText}>Generating report</Text>
                </View>
              </View>
            </View>
          ) : (
            <TouchableOpacity style={styles.scanButton} onPress={startScan}>
              <LinearGradient colors={['#FF5722', '#e64a19']} style={styles.scanButtonGradient}>
                <Ionicons name="search" size={24} color="#fff" />
                <Text style={styles.scanButtonText}>Start AI Plagiarism Scan</Text>
              </LinearGradient>
            </TouchableOpacity>
          )}

          <View style={styles.scanInfo}>
            <View style={styles.infoItem}>
              <Ionicons name="documents" size={16} color="#667eea" />
              <Text style={styles.infoText}>28 submissions ready</Text>
            </View>
            <View style={styles.infoItem}>
              <Ionicons name="time" size={16} color="#667eea" />
              <Text style={styles.infoText}>~3 minutes scan time</Text>
            </View>
          </View>
        </View>
      </View>
    </ScrollView>
  );

  const renderResultsTab = () => (
    <ScrollView showsVerticalScrollIndicator={false}>
      <View style={styles.tabContent}>
        <Text style={styles.tabTitle}>📊 Scan Results</Text>
        <Text style={styles.tabSubtitle}>
          AI-powered plagiarism analysis results
        </Text>

        {/* Results Summary */}
        {scanResults && (
          <View style={styles.summarySection}>
            <Text style={styles.sectionTitle}>📈 Scan Summary</Text>
            <View style={styles.summaryCards}>
              <View style={styles.summaryCard}>
                <Text style={styles.summaryNumber}>{scanResults.totalSubmissions}</Text>
                <Text style={styles.summaryLabel}>Total Scanned</Text>
              </View>
              <View style={styles.summaryCard}>
                <Text style={[styles.summaryNumber, { color: '#FF5722' }]}>{scanResults.flagged}</Text>
                <Text style={styles.summaryLabel}>Flagged</Text>
              </View>
              <View style={styles.summaryCard}>
                <Text style={[styles.summaryNumber, { color: '#4CAF50' }]}>{scanResults.averageOriginality}%</Text>
                <Text style={styles.summaryLabel}>Avg Originality</Text>
              </View>
            </View>
          </View>
        )}

        {/* Individual Results */}
        <View style={styles.resultsSection}>
          <Text style={styles.sectionTitle}>🎯 Individual Results</Text>
          {sampleSubmissions.map((submission) => (
            <View key={submission.id} style={styles.resultCard}>
              <View style={styles.resultHeader}>
                <View style={styles.studentInfo}>
                  <Text style={styles.studentName}>{submission.studentName}</Text>
                  <Text style={styles.assignmentName}>{submission.assignment}</Text>
                  <Text style={styles.submissionTime}>{submission.submittedAt}</Text>
                </View>
                <View style={styles.riskIndicator}>
                  <View style={[styles.riskBadge, { backgroundColor: getRiskColor(submission.risk) }]}>
                    <Ionicons name={getRiskIcon(submission.risk)} size={16} color="#fff" />
                    <Text style={styles.riskText}>{submission.risk.toUpperCase()}</Text>
                  </View>
                </View>
              </View>

              <View style={styles.scoreSection}>
                <View style={styles.scoreItem}>
                  <Text style={styles.scoreLabel}>Plagiarism Score</Text>
                  <Text style={[styles.scoreValue, { color: getRiskColor(submission.risk) }]}>
                    {submission.plagiarismScore}%
                  </Text>
                </View>
                <View style={styles.scoreItem}>
                  <Text style={styles.scoreLabel}>Originality Score</Text>
                  <Text style={[styles.scoreValue, { color: '#4CAF50' }]}>
                    {submission.originalityScore}%
                  </Text>
                </View>
                <View style={styles.scoreItem}>
                  <Text style={styles.scoreLabel}>Sources Found</Text>
                  <Text style={styles.scoreValue}>{submission.sources}</Text>
                </View>
              </View>

              <View style={styles.flagsSection}>
                <Text style={styles.flagsTitle}>🚩 Detection Flags:</Text>
                {submission.flags.map((flag, index) => (
                  <Text key={index} style={styles.flagItem}>• {flag}</Text>
                ))}
              </View>

              <View style={styles.resultActions}>
                <TouchableOpacity style={styles.detailButton}>
                  <Ionicons name="document-text" size={16} color="#667eea" />
                  <Text style={styles.detailButtonText}>View Report</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.compareButton}>
                  <Ionicons name="git-compare" size={16} color="#667eea" />
                  <Text style={styles.compareButtonText}>Compare Sources</Text>
                </TouchableOpacity>
                {submission.risk === 'high' && (
                  <TouchableOpacity style={styles.flagButton}>
                    <Ionicons name="flag" size={16} color="#FF5722" />
                    <Text style={styles.flagButtonText}>Flag for Review</Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>
          ))}
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
                <Text style={styles.headerTitle}>🔍 AI Plagiarism Detector</Text>
                <Text style={styles.headerSubtitle}>
                  96% accuracy with advanced semantic analysis
                </Text>
              </View>
              
              <View style={styles.aiPoweredBadge}>
                <Ionicons name="shield-checkmark" size={20} color="#fff" />
              </View>
            </View>
          </LinearGradient>

          {/* Tab Navigation */}
          <View style={styles.tabContainer}>
            {[
              { id: 'scan', label: 'Scan', icon: 'search' },
              { id: 'results', label: 'Results', icon: 'analytics' },
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
            {selectedTab === 'scan' && renderScanTab()}
            {selectedTab === 'results' && renderResultsTab()}
          </View>
        </Animated.View>
      </View>
    </Modal>
  );
};

// Comprehensive styles (similar structure to previous components)
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
  
  // Methods Section
  methodsSection: {
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 16,
  },
  methodCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  methodIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  methodInfo: {
    flex: 1,
  },
  methodHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  methodName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  accuracyBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  accuracyText: {
    fontSize: 10,
    color: '#fff',
    fontWeight: 'bold',
  },
  methodDescription: {
    fontSize: 14,
    color: '#666',
    lineHeight: 18,
  },
  
  // Sources Section
  sourcesSection: {
    marginBottom: 30,
  },
  sourcesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  sourceCard: {
    width: '48%',
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginBottom: 12,
  },
  sourceName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginTop: 8,
    textAlign: 'center',
  },
  sourceCount: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
  
  // Scan Section
  scanSection: {
    marginBottom: 30,
  },
  scanButton: {
    marginBottom: 16,
  },
  scanButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 25,
  },
  scanButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
    marginLeft: 8,
  },
  scanInfo: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  infoText: {
    fontSize: 14,
    color: '#667eea',
    marginLeft: 6,
    fontWeight: '500',
  },
  
  // Scanning Progress
  scanningContainer: {
    backgroundColor: '#f0f8ff',
    borderRadius: 15,
    padding: 20,
    marginBottom: 16,
    alignItems: 'center',
  },
  scanningTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 16,
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    marginBottom: 20,
  },
  progressBar: {
    flex: 1,
    height: 8,
    backgroundColor: '#e9ecef',
    borderRadius: 4,
    marginRight: 12,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#4CAF50',
    borderRadius: 4,
  },
  progressText: {
    fontSize: 14,
    color: '#4CAF50',
    fontWeight: '600',
    minWidth: 35,
  },
  scanningSteps: {
    width: '100%',
  },
  scanStep: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  scanStepText: {
    fontSize: 14,
    color: '#333',
    marginLeft: 8,
  },
  
  // Results Section
  summarySection: {
    marginBottom: 30,
  },
  summaryCards: {
    flexDirection: 'row',
    justifyContent: 'space-between',
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
    marginBottom: 4,
  },
  summaryLabel: {
    fontSize: 12,
    color: '#666',
  },
  
  // Result Cards
  resultsSection: {
    marginTop: 20,
  },
  resultCard: {
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
  resultHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
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
  assignmentName: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  submissionTime: {
    fontSize: 12,
    color: '#999',
    marginTop: 2,
  },
  riskIndicator: {
    alignItems: 'center',
  },
  riskBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  riskText: {
    fontSize: 10,
    color: '#fff',
    fontWeight: 'bold',
    marginLeft: 4,
  },
  
  // Scores
  scoreSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  scoreItem: {
    alignItems: 'center',
  },
  scoreLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
  },
  scoreValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  
  // Flags
  flagsSection: {
    marginBottom: 16,
  },
  flagsTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  flagItem: {
    fontSize: 13,
    color: '#FF5722',
    marginBottom: 2,
  },
  
  // Actions
  resultActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  detailButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0f8ff',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 15,
  },
  detailButtonText: {
    fontSize: 12,
    color: '#667eea',
    marginLeft: 4,
  },
  compareButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0f8ff',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 15,
  },
  compareButtonText: {
    fontSize: 12,
    color: '#667eea',
    marginLeft: 4,
  },
  flagButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffebee',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 15,
  },
  flagButtonText: {
    fontSize: 12,
    color: '#FF5722',
    marginLeft: 4,
  },
});

export default AIPlagiarismDetector;
