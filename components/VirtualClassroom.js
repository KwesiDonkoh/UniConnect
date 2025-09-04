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

export const VirtualClassroom = ({ visible, onClose, course, user }) => {
  const [classroomMode, setClassroomMode] = useState('traditional'); // traditional, ar, vr, hybrid
  const [isLive, setIsLive] = useState(false);
  const [connectedStudents, setConnectedStudents] = useState([]);
  const [selectedTool, setSelectedTool] = useState(null);
  
  const slideAnim = useRef(new Animated.Value(height)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;

  const classroomModes = [
    {
      id: 'traditional',
      name: 'Traditional',
      icon: 'desktop',
      color: '#667eea',
      description: 'Standard video classroom',
      features: ['HD Video', 'Screen Share', 'Chat', 'Whiteboard']
    },
    {
      id: 'ar',
      name: 'AR Enhanced',
      icon: 'cube',
      color: '#4CAF50',
      description: 'Augmented reality learning',
      features: ['3D Models', 'Interactive Objects', 'Spatial Audio', 'Gesture Control']
    },
    {
      id: 'vr',
      name: 'VR Immersive',
      icon: 'glasses',
      color: '#FF9800',
      description: 'Full virtual environment',
      features: ['Virtual Campus', 'Avatar Interaction', '360° Content', 'Haptic Feedback']
    },
    {
      id: 'hybrid',
      name: 'Hybrid Reality',
      icon: 'layers',
      color: '#9C27B0',
      description: 'Best of all worlds',
      features: ['Multi-Modal', 'AI Assistant', 'Smart Switching', 'Cross-Platform']
    }
  ];

  const virtualTools = [
    {
      id: 'whiteboard',
      name: '3D Whiteboard',
      icon: 'create',
      color: '#2196F3',
      description: 'Interactive 3D drawing space'
    },
    {
      id: 'models',
      name: '3D Models',
      icon: 'cube-outline',
      color: '#4CAF50',
      description: 'Manipulable 3D objects'
    },
    {
      id: 'simulation',
      name: 'Simulations',
      icon: 'play-circle',
      color: '#FF5722',
      description: 'Interactive simulations'
    },
    {
      id: 'collaboration',
      name: 'Collaboration Space',
      icon: 'people-circle',
      color: '#9C27B0',
      description: 'Group work environment'
    },
    {
      id: 'assessment',
      name: 'Live Assessment',
      icon: 'checkmark-circle',
      color: '#FF9800',
      description: 'Real-time quizzes and polls'
    },
    {
      id: 'recording',
      name: '360° Recording',
      icon: 'videocam',
      color: '#795548',
      description: 'Immersive lecture capture'
    }
  ];

  const connectedStudentsList = [
    { id: 1, name: 'Sarah Johnson', avatar: '👩‍💻', status: 'active', mode: 'ar', engagement: 95 },
    { id: 2, name: 'Michael Chen', avatar: '👨‍💻', status: 'active', mode: 'traditional', engagement: 87 },
    { id: 3, name: 'Emma Davis', avatar: '👩‍🎓', status: 'active', mode: 'vr', engagement: 92 },
    { id: 4, name: 'Alex Thompson', avatar: '👨‍🎓', status: 'away', mode: 'hybrid', engagement: 78 },
    { id: 5, name: 'Lisa Wang', avatar: '👩‍💼', status: 'active', mode: 'ar', engagement: 89 },
    { id: 6, name: 'David Kim', avatar: '👨‍💼', status: 'active', mode: 'traditional', engagement: 84 },
  ];

  useEffect(() => {
    if (visible) {
      Animated.spring(slideAnim, {
        toValue: 0,
        tension: 50,
        friction: 8,
        useNativeDriver: true,
      }).start();
      setConnectedStudents(connectedStudentsList);
    } else {
      Animated.timing(slideAnim, {
        toValue: height,
        duration: 300,
        useNativeDriver: true,
      }).start();
    }
  }, [visible]);

  useEffect(() => {
    if (isLive) {
      const pulseAnimation = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.2,
            duration: 1000,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 1000,
            useNativeDriver: true,
          }),
        ])
      );
      pulseAnimation.start();
      return () => pulseAnimation.stop();
    }
  }, [isLive]);

  const startVirtualClass = () => {
    Alert.alert(
      '🚀 Start Virtual Classroom?',
      `Launch ${classroomModes.find(m => m.id === classroomMode)?.name} classroom for ${course?.name || 'your course'}?\n\n✨ Features included:\n${classroomModes.find(m => m.id === classroomMode)?.features.map(f => `• ${f}`).join('\n')}`,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Start Class', 
          onPress: () => {
            setIsLive(true);
            Alert.alert('🎉 Classroom Live!', 'Your virtual classroom is now active. Students can join using the class code: VR-CS-2024');
          }
        }
      ]
    );
  };

  const endVirtualClass = () => {
    Alert.alert(
      'End Virtual Class?',
      'Are you sure you want to end the current session? This will disconnect all students.',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'End Class', 
          style: 'destructive',
          onPress: () => {
            setIsLive(false);
            setConnectedStudents([]);
            Alert.alert('✅ Class Ended', 'Virtual classroom session has been ended. Recording saved automatically.');
          }
        }
      ]
    );
  };

  const launchTool = (tool) => {
    setSelectedTool(tool);
    Alert.alert(
      `🛠️ Launch ${tool.name}?`,
      `${tool.description}\n\nThis will open the tool for all connected students in the virtual classroom.`,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Launch', 
          onPress: () => {
            Alert.alert('🎉 Tool Launched!', `${tool.name} is now active for all students. They can interact with it in real-time.`);
          }
        }
      ]
    );
  };

  const renderModeCard = (mode) => (
    <TouchableOpacity
      key={mode.id}
      style={[
        styles.modeCard,
        classroomMode === mode.id && { borderColor: mode.color, borderWidth: 2 }
      ]}
      onPress={() => setClassroomMode(mode.id)}
    >
      <LinearGradient
        colors={[mode.color, `${mode.color}80`]}
        style={styles.modeIconContainer}
      >
        <Ionicons name={mode.icon} size={24} color="#fff" />
      </LinearGradient>
      
      <Text style={styles.modeName}>{mode.name}</Text>
      <Text style={styles.modeDescription}>{mode.description}</Text>
      
      <View style={styles.modeFeatures}>
        {mode.features.slice(0, 2).map((feature, index) => (
          <View key={index} style={styles.featureTag}>
            <Text style={styles.featureText}>{feature}</Text>
          </View>
        ))}
      </View>
      
      {classroomMode === mode.id && (
        <View style={[styles.selectedIndicator, { backgroundColor: mode.color }]}>
          <Ionicons name="checkmark" size={16} color="#fff" />
        </View>
      )}
    </TouchableOpacity>
  );

  const renderToolCard = (tool) => (
    <TouchableOpacity
      key={tool.id}
      style={styles.toolCard}
      onPress={() => launchTool(tool)}
    >
      <View style={[styles.toolIcon, { backgroundColor: `${tool.color}20` }]}>
        <Ionicons name={tool.icon} size={24} color={tool.color} />
      </View>
      <Text style={styles.toolName}>{tool.name}</Text>
      <Text style={styles.toolDescription}>{tool.description}</Text>
    </TouchableOpacity>
  );

  const renderStudentCard = (student) => (
    <View key={student.id} style={styles.studentCard}>
      <Text style={styles.studentAvatar}>{student.avatar}</Text>
      <View style={styles.studentInfo}>
        <Text style={styles.studentName}>{student.name}</Text>
        <View style={styles.studentMeta}>
          <View style={[
            styles.statusIndicator,
            { backgroundColor: student.status === 'active' ? '#4CAF50' : '#FF9800' }
          ]} />
          <Text style={styles.studentMode}>{student.mode}</Text>
        </View>
      </View>
      <View style={styles.engagementMeter}>
        <Text style={styles.engagementLabel}>Engagement</Text>
        <View style={styles.engagementBar}>
          <View 
            style={[
              styles.engagementFill, 
              { 
                width: `${student.engagement}%`,
                backgroundColor: student.engagement > 90 ? '#4CAF50' : student.engagement > 75 ? '#FF9800' : '#FF5722'
              }
            ]} 
          />
        </View>
        <Text style={styles.engagementScore}>{student.engagement}%</Text>
      </View>
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
                <Text style={styles.headerTitle}>🌐 Virtual Classroom</Text>
                <Text style={styles.headerSubtitle}>
                  {isLive ? '🔴 LIVE' : 'Next-generation learning environment'}
                </Text>
              </View>
              
              {isLive && (
                <Animated.View 
                  style={[
                    styles.liveIndicator,
                    { transform: [{ scale: pulseAnim }] }
                  ]}
                >
                  <Ionicons name="radio" size={20} color="#fff" />
                </Animated.View>
              )}
            </View>
          </LinearGradient>

          <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
            {/* Classroom Mode Selection */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>🎯 Choose Classroom Mode</Text>
              <Text style={styles.sectionSubtitle}>
                Select the learning environment that best fits your lesson
              </Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                <View style={styles.modesContainer}>
                  {classroomModes.map(renderModeCard)}
                </View>
              </ScrollView>
            </View>

            {/* Class Controls */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>🎮 Class Controls</Text>
              <View style={styles.controlsContainer}>
                {!isLive ? (
                  <TouchableOpacity 
                    style={styles.startButton}
                    onPress={startVirtualClass}
                  >
                    <LinearGradient
                      colors={['#4CAF50', '#45a049']}
                      style={styles.buttonGradient}
                    >
                      <Ionicons name="play" size={24} color="#fff" />
                      <Text style={styles.buttonText}>Start Virtual Class</Text>
                    </LinearGradient>
                  </TouchableOpacity>
                ) : (
                  <TouchableOpacity 
                    style={styles.endButton}
                    onPress={endVirtualClass}
                  >
                    <LinearGradient
                      colors={['#FF5722', '#e64a19']}
                      style={styles.buttonGradient}
                    >
                      <Ionicons name="stop" size={24} color="#fff" />
                      <Text style={styles.buttonText}>End Class</Text>
                    </LinearGradient>
                  </TouchableOpacity>
                )}
                
                <View style={styles.classInfo}>
                  <View style={styles.infoItem}>
                    <Ionicons name="people" size={16} color="#667eea" />
                    <Text style={styles.infoText}>{connectedStudents.length} Students</Text>
                  </View>
                  <View style={styles.infoItem}>
                    <Ionicons name="time" size={16} color="#667eea" />
                    <Text style={styles.infoText}>{isLive ? '25:34' : 'Not started'}</Text>
                  </View>
                </View>
              </View>
            </View>

            {/* Virtual Tools */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>🛠️ Virtual Teaching Tools</Text>
              <Text style={styles.sectionSubtitle}>
                Interactive tools to enhance your virtual lessons
              </Text>
              <View style={styles.toolsGrid}>
                {virtualTools.map(renderToolCard)}
              </View>
            </View>

            {/* Connected Students */}
            {isLive && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>👥 Connected Students</Text>
                <Text style={styles.sectionSubtitle}>
                  Real-time engagement and participation tracking
                </Text>
                {connectedStudents.map(renderStudentCard)}
              </View>
            )}

            {/* Class Statistics */}
            {isLive && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>📊 Live Class Analytics</Text>
                <View style={styles.statsContainer}>
                  <View style={styles.statCard}>
                    <Text style={styles.statNumber}>87%</Text>
                    <Text style={styles.statLabel}>Avg Engagement</Text>
                    <Ionicons name="trending-up" size={16} color="#4CAF50" />
                  </View>
                  <View style={styles.statCard}>
                    <Text style={styles.statNumber}>23</Text>
                    <Text style={styles.statLabel}>Questions Asked</Text>
                    <Ionicons name="help-circle" size={16} color="#2196F3" />
                  </View>
                  <View style={styles.statCard}>
                    <Text style={styles.statNumber}>95%</Text>
                    <Text style={styles.statLabel}>Attendance</Text>
                    <Ionicons name="checkmark-circle" size={16} color="#4CAF50" />
                  </View>
                </View>
              </View>
            )}

            {/* VR/AR Features Showcase */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>✨ Advanced Features</Text>
              <View style={styles.featuresContainer}>
                <View style={styles.featureCard}>
                  <Ionicons name="eye" size={32} color="#4CAF50" />
                  <Text style={styles.featureTitle}>Eye Tracking</Text>
                  <Text style={styles.featureDescription}>
                    Monitor student attention and focus patterns
                  </Text>
                </View>
                <View style={styles.featureCard}>
                  <Ionicons name="hand-left" size={32} color="#2196F3" />
                  <Text style={styles.featureTitle}>Gesture Control</Text>
                  <Text style={styles.featureDescription}>
                    Natural hand movements for interaction
                  </Text>
                </View>
                <View style={styles.featureCard}>
                  <Ionicons name="volume-high" size={32} color="#FF9800" />
                  <Text style={styles.featureTitle}>Spatial Audio</Text>
                  <Text style={styles.featureDescription}>
                    3D positioned audio for immersion
                  </Text>
                </View>
                <View style={styles.featureCard}>
                  <Ionicons name="planet" size={32} color="#9C27B0" />
                  <Text style={styles.featureTitle}>Virtual Worlds</Text>
                  <Text style={styles.featureDescription}>
                    Custom environments for any subject
                  </Text>
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
  liveIndicator: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FF5722',
    justifyContent: 'center',
    alignItems: 'center',
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
  
  // Mode Selection
  modesContainer: {
    flexDirection: 'row',
    paddingHorizontal: 4,
  },
  modeCard: {
    width: 160,
    backgroundColor: '#f8f9fa',
    borderRadius: 15,
    padding: 16,
    marginRight: 16,
    alignItems: 'center',
    position: 'relative',
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  modeIconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  modeName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
    textAlign: 'center',
  },
  modeDescription: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
    marginBottom: 12,
  },
  modeFeatures: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
  featureTag: {
    backgroundColor: '#e9ecef',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
    margin: 2,
  },
  featureText: {
    fontSize: 10,
    color: '#666',
  },
  selectedIndicator: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  
  // Controls
  controlsContainer: {
    alignItems: 'center',
  },
  startButton: {
    width: '100%',
    marginBottom: 16,
  },
  endButton: {
    width: '100%',
    marginBottom: 16,
  },
  buttonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 25,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
    marginLeft: 8,
  },
  classInfo: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
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
  
  // Tools
  toolsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  toolCard: {
    width: '48%',
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    alignItems: 'center',
  },
  toolIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  toolName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
    textAlign: 'center',
  },
  toolDescription: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
  },
  
  // Students
  studentCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  studentAvatar: {
    fontSize: 32,
    marginRight: 12,
  },
  studentInfo: {
    flex: 1,
  },
  studentName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  studentMeta: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  studentMode: {
    fontSize: 12,
    color: '#666',
    textTransform: 'capitalize',
  },
  engagementMeter: {
    alignItems: 'center',
    minWidth: 80,
  },
  engagementLabel: {
    fontSize: 10,
    color: '#666',
    marginBottom: 4,
  },
  engagementBar: {
    width: 60,
    height: 4,
    backgroundColor: '#e9ecef',
    borderRadius: 2,
    marginBottom: 4,
  },
  engagementFill: {
    height: '100%',
    borderRadius: 2,
  },
  engagementScore: {
    fontSize: 12,
    fontWeight: '600',
    color: '#333',
  },
  
  // Stats
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statCard: {
    flex: 1,
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginHorizontal: 4,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 8,
    textAlign: 'center',
  },
  
  // Features
  featuresContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  featureCard: {
    width: '48%',
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    alignItems: 'center',
  },
  featureTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginTop: 12,
    marginBottom: 8,
    textAlign: 'center',
  },
  featureDescription: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
    lineHeight: 16,
  },
});

export default VirtualClassroom;
