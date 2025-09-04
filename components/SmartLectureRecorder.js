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

export const SmartLectureRecorder = ({ visible, onClose, course, user }) => {
  const [isRecording, setIsRecording] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [selectedTab, setSelectedTab] = useState('record');
  const [aiFeatures, setAiFeatures] = useState({
    transcription: true,
    keyPoints: true,
    questionDetection: true,
    engagementAnalysis: true,
    autoChapters: true,
  });

  const slideAnim = useRef(new Animated.Value(height)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const waveAnim = useRef(new Animated.Value(0)).current;

  const recordingFeatures = [
    {
      id: 'transcription',
      name: 'Live Transcription',
      icon: 'document-text',
      color: '#4CAF50',
      description: 'Real-time speech-to-text with 98% accuracy'
    },
    {
      id: 'keyPoints',
      name: 'Key Points Detection',
      icon: 'star',
      color: '#FF9800',
      description: 'AI identifies and highlights important concepts'
    },
    {
      id: 'questionDetection',
      name: 'Question Analysis',
      icon: 'help-circle',
      color: '#2196F3',
      description: 'Tracks student questions and engagement'
    },
    {
      id: 'engagementAnalysis',
      name: 'Engagement Tracking',
      icon: 'trending-up',
      color: '#9C27B0',
      description: 'Monitors attention and participation levels'
    },
    {
      id: 'autoChapters',
      name: 'Auto Chapters',
      icon: 'albums',
      color: '#FF5722',
      description: 'Creates timestamped topic sections'
    },
  ];

  const recentRecordings = [
    {
      id: 1,
      title: 'Data Structures: Binary Trees',
      date: '2024-02-14',
      duration: '52:34',
      size: '245 MB',
      transcriptionReady: true,
      keyPoints: 15,
      questions: 8,
      engagement: 87,
      thumbnail: '🌳',
    },
    {
      id: 2,
      title: 'Algorithm Complexity Analysis',
      date: '2024-02-12',
      duration: '48:12',
      size: '220 MB',
      transcriptionReady: true,
      keyPoints: 12,
      questions: 5,
      engagement: 78,
      thumbnail: '📊',
    },
    {
      id: 3,
      title: 'Sorting Algorithms Deep Dive',
      date: '2024-02-10',
      duration: '55:20',
      size: '268 MB',
      transcriptionReady: true,
      keyPoints: 18,
      questions: 12,
      engagement: 92,
      thumbnail: '🔄',
    },
  ];

  const liveTranscription = [
    { time: '00:45:23', speaker: 'Professor', text: 'Now let\'s examine how binary trees maintain their balanced structure...' },
    { time: '00:45:45', speaker: 'Student', text: 'Professor, could you explain the difference between AVL and Red-Black trees?' },
    { time: '00:46:02', speaker: 'Professor', text: 'Excellent question! AVL trees are more rigidly balanced...' },
    { time: '00:46:28', speaker: 'Student', text: 'So AVL trees have faster lookups but slower insertions?' },
    { time: '00:46:41', speaker: 'Professor', text: 'Exactly! You\'ve grasped the key trade-off. Let me show you with an example...' },
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
    let interval;
    if (isRecording && !isPaused) {
      interval = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);

      // Recording pulse animation
      const pulseAnimation = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, { toValue: 1.2, duration: 1000, useNativeDriver: true }),
          Animated.timing(pulseAnim, { toValue: 1, duration: 1000, useNativeDriver: true }),
        ])
      );
      pulseAnimation.start();

      // Wave animation
      const waveAnimation = Animated.loop(
        Animated.timing(waveAnim, { toValue: 1, duration: 2000, useNativeDriver: true })
      );
      waveAnimation.start();

      return () => {
        clearInterval(interval);
        pulseAnimation.stop();
        waveAnimation.stop();
      };
    } else if (interval) {
      clearInterval(interval);
    }
  }, [isRecording, isPaused]);

  const formatTime = (seconds) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    if (hrs > 0) {
      return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const startRecording = () => {
    Alert.alert(
      '🎬 Start Smart Recording?',
      `Begin recording "${course?.name || 'your lecture'}" with AI-powered features?\n\n✨ Active Features:\n${Object.entries(aiFeatures).filter(([_, enabled]) => enabled).map(([key, _]) => `• ${recordingFeatures.find(f => f.id === key)?.name}`).join('\n')}`,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Start Recording', 
          onPress: () => {
            setIsRecording(true);
            setRecordingTime(0);
            Alert.alert('🔴 Recording Started!', 'Your lecture is now being recorded with AI analysis. All features are active and processing in real-time.');
          }
        }
      ]
    );
  };

  const stopRecording = () => {
    Alert.alert(
      'Stop Recording?',
      `End recording session?\n\nDuration: ${formatTime(recordingTime)}\nEstimated size: ${Math.round(recordingTime * 0.8)} MB`,
      [
        { text: 'Continue Recording', style: 'cancel' },
        { 
          text: 'Stop & Process', 
          style: 'destructive',
          onPress: () => {
            setIsRecording(false);
            setIsPaused(false);
            Alert.alert('✅ Recording Complete!', `Your lecture has been saved and is being processed by AI.\n\n📊 Processing includes:\n• Speech transcription\n• Key points extraction\n• Question analysis\n• Engagement metrics\n• Auto-generated chapters\n\nYou'll be notified when processing is complete (usually 2-3 minutes).`);
          }
        }
      ]
    );
  };

  const togglePause = () => {
    setIsPaused(!isPaused);
    Alert.alert(
      isPaused ? '▶️ Recording Resumed' : '⏸️ Recording Paused',
      isPaused ? 'AI analysis has resumed.' : 'AI analysis is paused.'
    );
  };

  const renderRecordingTab = () => (
    <ScrollView showsVerticalScrollIndicator={false}>
      <View style={styles.tabContent}>
        <Text style={styles.tabTitle}>🎬 Smart Lecture Recording</Text>
        <Text style={styles.tabSubtitle}>
          AI-powered recording with real-time analysis and transcription
        </Text>

        {/* Recording Status */}
        <View style={styles.recordingStatus}>
          {isRecording ? (
            <View style={styles.activeRecording}>
              <Animated.View style={[styles.recordingIndicator, { transform: [{ scale: pulseAnim }] }]}>
                <View style={styles.recordingDot} />
              </Animated.View>
              <View style={styles.recordingInfo}>
                <Text style={styles.recordingTitle}>Recording: {course?.name || 'Lecture'}</Text>
                <Text style={styles.recordingTime}>{formatTime(recordingTime)}</Text>
                <Text style={styles.recordingStatus}>
                  {isPaused ? '⏸️ PAUSED' : '🔴 LIVE'}
                </Text>
              </View>
            </View>
          ) : (
            <View style={styles.readyToRecord}>
              <Ionicons name="videocam" size={48} color="#667eea" />
              <Text style={styles.readyTitle}>Ready to Record</Text>
              <Text style={styles.readySubtitle}>All AI features configured and ready</Text>
            </View>
          )}
        </View>

        {/* Recording Controls */}
        <View style={styles.controlsSection}>
          {!isRecording ? (
            <TouchableOpacity style={styles.startButton} onPress={startRecording}>
              <LinearGradient colors={['#FF5722', '#e64a19']} style={styles.controlButtonGradient}>
                <Ionicons name="radio-button-on" size={24} color="#fff" />
                <Text style={styles.controlButtonText}>Start Recording</Text>
              </LinearGradient>
            </TouchableOpacity>
          ) : (
            <View style={styles.activeControls}>
              <TouchableOpacity style={styles.pauseButton} onPress={togglePause}>
                <Ionicons name={isPaused ? "play" : "pause"} size={24} color="#fff" />
              </TouchableOpacity>
              <TouchableOpacity style={styles.stopButton} onPress={stopRecording}>
                <Ionicons name="stop" size={24} color="#fff" />
              </TouchableOpacity>
            </View>
          )}
        </View>

        {/* AI Features Toggle */}
        <View style={styles.featuresSection}>
          <Text style={styles.sectionTitle}>🤖 AI Features</Text>
          {recordingFeatures.map((feature) => (
            <View key={feature.id} style={styles.featureToggle}>
              <View style={styles.featureInfo}>
                <View style={[styles.featureIcon, { backgroundColor: `${feature.color}20` }]}>
                  <Ionicons name={feature.icon} size={20} color={feature.color} />
                </View>
                <View style={styles.featureText}>
                  <Text style={styles.featureName}>{feature.name}</Text>
                  <Text style={styles.featureDescription}>{feature.description}</Text>
                </View>
              </View>
              <TouchableOpacity
                style={[
                  styles.toggleSwitch,
                  aiFeatures[feature.id] && { backgroundColor: feature.color }
                ]}
                onPress={() => setAiFeatures(prev => ({ ...prev, [feature.id]: !prev[feature.id] }))}
              >
                <View style={[
                  styles.toggleThumb,
                  aiFeatures[feature.id] && styles.toggleThumbActive
                ]} />
              </TouchableOpacity>
            </View>
          ))}
        </View>

        {/* Live Transcription (only when recording) */}
        {isRecording && (
          <View style={styles.liveSection}>
            <Text style={styles.sectionTitle}>📝 Live Transcription</Text>
            <View style={styles.transcriptionContainer}>
              {liveTranscription.map((item, index) => (
                <View key={index} style={styles.transcriptionItem}>
                  <Text style={styles.transcriptionTime}>{item.time}</Text>
                  <Text style={[
                    styles.transcriptionSpeaker,
                    { color: item.speaker === 'Professor' ? '#667eea' : '#4CAF50' }
                  ]}>
                    {item.speaker}:
                  </Text>
                  <Text style={styles.transcriptionText}>{item.text}</Text>
                </View>
              ))}
            </View>
          </View>
        )}
      </View>
    </ScrollView>
  );

  const renderRecordingsTab = () => (
    <ScrollView showsVerticalScrollIndicator={false}>
      <View style={styles.tabContent}>
        <Text style={styles.tabTitle}>📚 Recorded Lectures</Text>
        <Text style={styles.tabSubtitle}>
          Your AI-processed lecture recordings with smart analysis
        </Text>

        {recentRecordings.map((recording) => (
          <View key={recording.id} style={styles.recordingCard}>
            <View style={styles.recordingHeader}>
              <Text style={styles.recordingThumbnail}>{recording.thumbnail}</Text>
              <View style={styles.recordingDetails}>
                <Text style={styles.recordingCardTitle}>{recording.title}</Text>
                <Text style={styles.recordingMeta}>
                  {recording.date} • {recording.duration} • {recording.size}
                </Text>
              </View>
              <TouchableOpacity style={styles.playButton}>
                <Ionicons name="play" size={20} color="#fff" />
              </TouchableOpacity>
            </View>

            <View style={styles.recordingStats}>
              <View style={styles.statItem}>
                <Ionicons name="document-text" size={16} color="#4CAF50" />
                <Text style={styles.statText}>Transcribed</Text>
              </View>
              <View style={styles.statItem}>
                <Ionicons name="star" size={16} color="#FF9800" />
                <Text style={styles.statText}>{recording.keyPoints} key points</Text>
              </View>
              <View style={styles.statItem}>
                <Ionicons name="help-circle" size={16} color="#2196F3" />
                <Text style={styles.statText}>{recording.questions} questions</Text>
              </View>
              <View style={styles.statItem}>
                <Ionicons name="trending-up" size={16} color="#9C27B0" />
                <Text style={styles.statText}>{recording.engagement}% engagement</Text>
              </View>
            </View>

            <View style={styles.recordingActions}>
              <TouchableOpacity style={styles.actionButton}>
                <Ionicons name="document-text" size={16} color="#667eea" />
                <Text style={styles.actionButtonText}>Transcript</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.actionButton}>
                <Ionicons name="analytics" size={16} color="#667eea" />
                <Text style={styles.actionButtonText}>Analytics</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.actionButton}>
                <Ionicons name="share" size={16} color="#667eea" />
                <Text style={styles.actionButtonText}>Share</Text>
              </TouchableOpacity>
            </View>
          </View>
        ))}
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
                <Text style={styles.headerTitle}>🎬 Smart Lecture Recorder</Text>
                <Text style={styles.headerSubtitle}>
                  {isRecording ? `🔴 Recording: ${formatTime(recordingTime)}` : 'AI-powered lecture recording'}
                </Text>
              </View>
              
              <View style={styles.aiPoweredBadge}>
                <Ionicons name="videocam" size={20} color="#fff" />
              </View>
            </View>
          </LinearGradient>

          {/* Tab Navigation */}
          <View style={styles.tabContainer}>
            {[
              { id: 'record', label: 'Record', icon: 'radio-button-on' },
              { id: 'recordings', label: 'Recordings', icon: 'albums' },
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
            {selectedTab === 'record' && renderRecordingTab()}
            {selectedTab === 'recordings' && renderRecordingsTab()}
          </View>
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
  
  // Recording Status
  recordingStatus: {
    backgroundColor: '#f8f9fa',
    borderRadius: 15,
    padding: 20,
    marginBottom: 20,
    alignItems: 'center',
  },
  activeRecording: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  recordingIndicator: {
    marginRight: 16,
  },
  recordingDot: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#FF5722',
  },
  recordingInfo: {
    flex: 1,
  },
  recordingTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  recordingTime: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FF5722',
    marginTop: 4,
  },
  recordingStatus: {
    fontSize: 12,
    color: '#FF5722',
    fontWeight: '600',
    marginTop: 2,
  },
  readyToRecord: {
    alignItems: 'center',
  },
  readyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginTop: 12,
  },
  readySubtitle: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  
  // Controls
  controlsSection: {
    marginBottom: 30,
  },
  startButton: {
    marginBottom: 16,
  },
  controlButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 25,
  },
  controlButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
    marginLeft: 8,
  },
  activeControls: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 20,
  },
  pauseButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#FF9800',
    justifyContent: 'center',
    alignItems: 'center',
  },
  stopButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#FF5722',
    justifyContent: 'center',
    alignItems: 'center',
  },
  
  // Features
  featuresSection: {
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 16,
  },
  featureToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    marginBottom: 8,
  },
  featureInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  featureIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  featureText: {
    flex: 1,
  },
  featureName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  featureDescription: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  toggleSwitch: {
    width: 44,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#e9ecef',
    justifyContent: 'center',
    paddingHorizontal: 2,
  },
  toggleThumb: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  },
  toggleThumbActive: {
    alignSelf: 'flex-end',
  },
  
  // Live Transcription
  liveSection: {
    marginTop: 20,
  },
  transcriptionContainer: {
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    padding: 16,
    maxHeight: 200,
  },
  transcriptionItem: {
    marginBottom: 12,
  },
  transcriptionTime: {
    fontSize: 10,
    color: '#999',
    marginBottom: 2,
  },
  transcriptionSpeaker: {
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 4,
  },
  transcriptionText: {
    fontSize: 14,
    color: '#333',
    lineHeight: 18,
  },
  
  // Recording Cards
  recordingCard: {
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
  recordingHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  recordingThumbnail: {
    fontSize: 32,
    marginRight: 12,
  },
  recordingDetails: {
    flex: 1,
  },
  recordingCardTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  recordingMeta: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  playButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#667eea',
    justifyContent: 'center',
    alignItems: 'center',
  },
  recordingStats: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 12,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,
    marginBottom: 4,
  },
  statText: {
    fontSize: 12,
    color: '#666',
    marginLeft: 4,
  },
  recordingActions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0f8ff',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 15,
  },
  actionButtonText: {
    fontSize: 12,
    color: '#667eea',
    marginLeft: 4,
    fontWeight: '500',
  },
});

export default SmartLectureRecorder;
