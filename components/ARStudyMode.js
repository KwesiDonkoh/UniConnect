import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Dimensions,
  Modal,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';

const { width, height } = Dimensions.get('window');

export const ARStudyMode = ({ visible, onClose, course, topic }) => {
  const [arMode, setArMode] = useState('3d-models'); // 3d-models, interactive-quiz, virtual-lab
  const [isARActive, setIsARActive] = useState(false);
  const [selectedModel, setSelectedModel] = useState(null);
  const [interactionCount, setInteractionCount] = useState(0);
  const [studyProgress, setStudyProgress] = useState(0);

  const slideAnim = useRef(new Animated.Value(height)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;

  const arModels = [
    {
      id: 1,
      name: 'DNA Double Helix',
      subject: 'Biology',
      description: 'Interactive 3D model of DNA structure',
      icon: 'git-network',
      color: '#4CAF50',
      interactions: ['Rotate', 'Zoom', 'Separate strands', 'View bases'],
    },
    {
      id: 2,
      name: 'Solar System',
      subject: 'Physics',
      description: 'Planetary motion and gravitational forces',
      icon: 'planet',
      color: '#FF9800',
      interactions: ['Orbit simulation', 'Scale comparison', 'Distance measurement'],
    },
    {
      id: 3,
      name: 'Chemical Reactions',
      subject: 'Chemistry',
      description: 'Molecular interactions and bond formation',
      icon: 'flask',
      color: '#9C27B0',
      interactions: ['Bond formation', 'Energy visualization', 'Reaction pathways'],
    },
    {
      id: 4,
      name: 'Heart Anatomy',
      subject: 'Biology',
      description: 'Detailed cardiac structure and function',
      icon: 'heart',
      color: '#F44336',
      interactions: ['Cross-section view', 'Blood flow', 'Valve operation'],
    },
  ];

  const quizScenarios = [
    {
      id: 1,
      title: 'Virtual Chemistry Lab',
      description: 'Mix chemicals and observe reactions in AR',
      icon: 'beaker',
      difficulty: 'Intermediate',
      duration: '15 min',
    },
    {
      id: 2,
      title: 'Historical Timeline',
      description: 'Walk through historical events in 3D space',
      icon: 'time',
      difficulty: 'Beginner',
      duration: '20 min',
    },
    {
      id: 3,
      title: 'Mathematical Visualizer',
      description: 'See complex equations come to life',
      icon: 'calculator',
      difficulty: 'Advanced',
      duration: '25 min',
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

  useEffect(() => {
    if (isARActive) {
      // Start pulse animation
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, { toValue: 1.1, duration: 1000, useNativeDriver: true }),
          Animated.timing(pulseAnim, { toValue: 1, duration: 1000, useNativeDriver: true }),
        ])
      ).start();

      // Start rotation animation
      Animated.loop(
        Animated.timing(rotateAnim, {
          toValue: 1,
          duration: 10000,
          useNativeDriver: true,
        })
      ).start();
    }
  }, [isARActive]);

  const startARSession = (model) => {
    setSelectedModel(model);
    setIsARActive(true);
    setStudyProgress(0);
    setInteractionCount(0);
    
    Alert.alert(
      '🚀 AR Mode Activated!',
      `Starting ${model.name} experience. Point your camera at a flat surface and tap to place the 3D model!`,
      [{ text: 'Got it!', style: 'default' }]
    );
  };

  const handleInteraction = (interactionType) => {
    setInteractionCount(prev => prev + 1);
    setStudyProgress(prev => Math.min(prev + 20, 100));
    
    const messages = {
      'Rotate': 'Great! You rotated the model. Notice the different angles reveal new details.',
      'Zoom': 'Excellent zoom! You can see the intricate details up close.',
      'Separate strands': 'Amazing! You separated the DNA strands. See how they complement each other?',
      'View bases': 'Perfect! You\'re viewing the base pairs. Notice the A-T and G-C pairings.',
      'Orbit simulation': 'Fantastic! Watch how gravity affects planetary orbits.',
      'Scale comparison': 'Incredible! See the true scale differences between planets.',
    };

    Alert.alert('🎯 Great Interaction!', messages[interactionType] || 'Awesome exploration!');
  };

  const endARSession = () => {
    setIsARActive(false);
    setSelectedModel(null);
    
    const performanceMessage = interactionCount >= 5 ? 
      'Outstanding exploration! You\'ve mastered this topic!' :
      'Good start! Try more interactions to deepen your understanding.';
    
    Alert.alert(
      '📊 Session Complete!',
      `${performanceMessage}\n\nInteractions: ${interactionCount}\nProgress: ${studyProgress}%\n\n+${interactionCount * 10} XP earned!`,
      [{ text: 'Awesome!', style: 'default' }]
    );
  };

  const renderARInterface = () => (
    <View style={styles.arInterface}>
      <View style={styles.arHeader}>
        <View style={styles.arStatus}>
          <View style={styles.arStatusDot} />
          <Text style={styles.arStatusText}>AR Active</Text>
        </View>
        <TouchableOpacity onPress={endARSession} style={styles.arCloseButton}>
          <Ionicons name="close-circle" size={24} color="#fff" />
        </TouchableOpacity>
      </View>

      <View style={styles.arContent}>
        <Animated.View 
          style={[
            styles.arModelPlaceholder,
            { 
              transform: [
                { scale: pulseAnim },
                { 
                  rotate: rotateAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: ['0deg', '360deg'],
                  })
                }
              ]
            }
          ]}
        >
          <Ionicons name={selectedModel?.icon} size={80} color={selectedModel?.color} />
          <Text style={styles.arModelName}>{selectedModel?.name}</Text>
        </Animated.View>

        <View style={styles.arInstructions}>
          <Text style={styles.arInstructionText}>
            👆 Tap and drag to interact with the model
          </Text>
          <Text style={styles.arInstructionSubtext}>
            Try different gestures to explore all features!
          </Text>
        </View>
      </View>

      <View style={styles.arControls}>
        <View style={styles.progressContainer}>
          <Text style={styles.progressLabel}>Learning Progress</Text>
          <View style={styles.progressBar}>
            <View style={[styles.progressFill, { width: `${studyProgress}%` }]} />
          </View>
          <Text style={styles.progressText}>{studyProgress}%</Text>
        </View>

        <View style={styles.interactionButtons}>
          {selectedModel?.interactions.map((interaction, index) => (
            <TouchableOpacity
              key={index}
              style={styles.interactionButton}
              onPress={() => handleInteraction(interaction)}
            >
              <Text style={styles.interactionButtonText}>{interaction}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    </View>
  );

  const renderModelSelection = () => (
    <View style={styles.modelGrid}>
      {arModels.map((model) => (
        <TouchableOpacity
          key={model.id}
          style={styles.modelCard}
          onPress={() => startARSession(model)}
        >
          <LinearGradient
            colors={[model.color, `${model.color}80`]}
            style={styles.modelCardGradient}
          >
            <View style={styles.modelIcon}>
              <Ionicons name={model.icon} size={32} color="#fff" />
            </View>
            <Text style={styles.modelName}>{model.name}</Text>
            <Text style={styles.modelSubject}>{model.subject}</Text>
            <Text style={styles.modelDescription}>{model.description}</Text>
            
            <View style={styles.modelFeatures}>
              <Text style={styles.featuresTitle}>Interactions:</Text>
              {model.interactions.slice(0, 2).map((interaction, index) => (
                <Text key={index} style={styles.featureItem}>• {interaction}</Text>
              ))}
              {model.interactions.length > 2 && (
                <Text style={styles.featureItem}>• +{model.interactions.length - 2} more</Text>
              )}
            </View>
          </LinearGradient>
        </TouchableOpacity>
      ))}
    </View>
  );

  const renderQuizScenarios = () => (
    <View style={styles.scenarioList}>
      {quizScenarios.map((scenario) => (
        <TouchableOpacity
          key={scenario.id}
          style={styles.scenarioCard}
          onPress={() => Alert.alert('Coming Soon!', 'This AR quiz scenario will be available in the next update!')}
        >
          <View style={styles.scenarioIcon}>
            <Ionicons name={scenario.icon} size={24} color="#667eea" />
          </View>
          <View style={styles.scenarioInfo}>
            <Text style={styles.scenarioTitle}>{scenario.title}</Text>
            <Text style={styles.scenarioDescription}>{scenario.description}</Text>
            <View style={styles.scenarioMeta}>
              <View style={styles.difficultyBadge}>
                <Text style={styles.difficultyText}>{scenario.difficulty}</Text>
              </View>
              <Text style={styles.durationText}>{scenario.duration}</Text>
            </View>
          </View>
          <Ionicons name="chevron-forward" size={20} color="#ccc" />
        </TouchableOpacity>
      ))}
    </View>
  );

  if (!visible) return null;

  if (isARActive) {
    return (
      <Modal visible={visible} transparent={false}>
        <LinearGradient
          colors={['#000', '#1a1a1a']}
          style={styles.arContainer}
        >
          {renderARInterface()}
        </LinearGradient>
      </Modal>
    );
  }

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
                <Text style={styles.headerTitle}>AR Study Mode</Text>
                <Text style={styles.headerSubtitle}>
                  {course?.name || 'Interactive Learning'} • {topic || 'All Topics'}
                </Text>
              </View>
              
              <View style={styles.arBadge}>
                <Ionicons name="cube" size={20} color="#fff" />
              </View>
            </View>
          </LinearGradient>

          {/* Mode Selector */}
          <View style={styles.modeSelector}>
            {[
              { id: '3d-models', label: '3D Models', icon: 'cube' },
              { id: 'interactive-quiz', label: 'AR Quiz', icon: 'help-circle' },
              { id: 'virtual-lab', label: 'Virtual Lab', icon: 'flask' },
            ].map((mode) => (
              <TouchableOpacity
                key={mode.id}
                style={[
                  styles.modeButton,
                  arMode === mode.id && styles.activeModeButton
                ]}
                onPress={() => setArMode(mode.id)}
              >
                <Ionicons 
                  name={mode.icon} 
                  size={20} 
                  color={arMode === mode.id ? '#fff' : '#667eea'} 
                />
                <Text style={[
                  styles.modeButtonText,
                  arMode === mode.id && styles.activeModeButtonText
                ]}>
                  {mode.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Content */}
          <View style={styles.content}>
            {arMode === '3d-models' && (
              <View>
                <Text style={styles.sectionTitle}>Choose a 3D Model to Explore</Text>
                <Text style={styles.sectionSubtitle}>
                  Interactive models that bring your textbooks to life!
                </Text>
                {renderModelSelection()}
              </View>
            )}

            {arMode === 'interactive-quiz' && (
              <View>
                <Text style={styles.sectionTitle}>AR Quiz Scenarios</Text>
                <Text style={styles.sectionSubtitle}>
                  Immersive quizzes in augmented reality
                </Text>
                {renderQuizScenarios()}
              </View>
            )}

            {arMode === 'virtual-lab' && (
              <View style={styles.comingSoon}>
                <Ionicons name="construct" size={60} color="#ccc" />
                <Text style={styles.comingSoonTitle}>Virtual Lab</Text>
                <Text style={styles.comingSoonText}>
                  Conduct experiments safely in AR! This feature is coming soon with:
                </Text>
                <View style={styles.featureList}>
                  <Text style={styles.featureListItem}>• Chemistry experiment simulations</Text>
                  <Text style={styles.featureListItem}>• Physics demonstrations</Text>
                  <Text style={styles.featureListItem}>• Biology dissections</Text>
                  <Text style={styles.featureListItem}>• Engineering prototypes</Text>
                </View>
              </View>
            )}
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
  arBadge: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modeSelector: {
    flexDirection: 'row',
    backgroundColor: '#f8f9fa',
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  modeButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    marginHorizontal: 4,
    borderRadius: 20,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#667eea',
  },
  activeModeButton: {
    backgroundColor: '#667eea',
    borderColor: '#667eea',
  },
  modeButtonText: {
    fontSize: 12,
    color: '#667eea',
    marginLeft: 6,
    fontWeight: '500',
  },
  activeModeButtonText: {
    color: '#fff',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 20,
  },
  modelGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  modelCard: {
    width: '48%',
    marginBottom: 15,
    borderRadius: 15,
    overflow: 'hidden',
  },
  modelCardGradient: {
    padding: 20,
    alignItems: 'center',
  },
  modelIcon: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  modelName: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
    marginBottom: 4,
  },
  modelSubject: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.8)',
    marginBottom: 8,
  },
  modelDescription: {
    fontSize: 11,
    color: 'rgba(255, 255, 255, 0.9)',
    textAlign: 'center',
    lineHeight: 14,
    marginBottom: 12,
  },
  modelFeatures: {
    alignSelf: 'stretch',
  },
  featuresTitle: {
    fontSize: 11,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 4,
  },
  featureItem: {
    fontSize: 10,
    color: 'rgba(255, 255, 255, 0.8)',
    lineHeight: 12,
  },
  scenarioList: {
    flex: 1,
  },
  scenarioCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 15,
    padding: 20,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  scenarioIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#f0f8ff',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  scenarioInfo: {
    flex: 1,
  },
  scenarioTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  scenarioDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  scenarioMeta: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  difficultyBadge: {
    backgroundColor: '#667eea',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginRight: 12,
  },
  difficultyText: {
    fontSize: 10,
    color: '#fff',
    fontWeight: '600',
  },
  durationText: {
    fontSize: 12,
    color: '#999',
  },
  comingSoon: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
  comingSoonTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 20,
    marginBottom: 12,
  },
  comingSoonText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 22,
  },
  featureList: {
    alignItems: 'flex-start',
  },
  featureListItem: {
    fontSize: 14,
    color: '#666',
    marginBottom: 6,
  },
  
  // AR Interface Styles
  arContainer: {
    flex: 1,
  },
  arInterface: {
    flex: 1,
    justifyContent: 'space-between',
  },
  arHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 50,
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  arStatus: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  arStatusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#4CAF50',
    marginRight: 8,
  },
  arStatusText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  arCloseButton: {
    padding: 8,
  },
  arContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  arModelPlaceholder: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 40,
  },
  arModelName: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 15,
  },
  arInstructions: {
    alignItems: 'center',
  },
  arInstructionText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
  arInstructionSubtext: {
    color: 'rgba(255, 255, 255, 0.7)',
    fontSize: 14,
    textAlign: 'center',
    marginTop: 8,
  },
  arControls: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  progressContainer: {
    marginBottom: 20,
  },
  progressLabel: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  progressBar: {
    height: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 3,
    marginBottom: 8,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#4CAF50',
    borderRadius: 3,
  },
  progressText: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 12,
    textAlign: 'right',
  },
  interactionButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
  interactionButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    margin: 6,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  interactionButtonText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '500',
  },
});

export default ARStudyMode;
