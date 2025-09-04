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

export const FeatureWelcomeGuide = ({ visible, onClose, userType = 'student' }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const slideAnim = useRef(new Animated.Value(height)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  const studentFeatures = [
    {
      title: '🤖 AI Study Assistant',
      description: 'Your personal AI tutor that helps with homework, explains concepts, and creates custom study plans just for you!',
      icon: 'sparkles',
      color: '#667eea',
      benefits: ['24/7 homework help', 'Personalized explanations', 'Smart study plans', 'Progress tracking']
    },
    {
      title: '📝 Smart Note-Taking',
      description: 'AI-powered notes that auto-summarize lectures, highlight key points, and connect related concepts!',
      icon: 'document-text',
      color: '#4CAF50',
      benefits: ['Auto-summarization', 'Key point detection', 'Concept linking', 'Smart search']
    },
    {
      title: '🎮 Gamified Learning',
      description: 'Earn XP, unlock achievements, and climb leaderboards while studying. Learning has never been this fun!',
      icon: 'trophy',
      color: '#FF9800',
      benefits: ['XP system', 'Achievements', 'Leaderboards', 'Study streaks']
    },
    {
      title: '🌟 AR Study Mode',
      description: 'Study in augmented reality! Visualize complex concepts in 3D and interact with virtual learning materials.',
      icon: 'cube',
      color: '#9C27B0',
      benefits: ['3D visualizations', 'Interactive models', 'Immersive learning', 'Virtual labs']
    },
    {
      title: '🎯 AI Quiz Generator',
      description: 'Generate unlimited practice quizzes tailored to your learning level and study progress!',
      icon: 'help-circle',
      color: '#2196F3',
      benefits: ['Unlimited quizzes', 'Adaptive difficulty', 'Instant feedback', 'Performance analytics']
    },
    {
      title: '📅 Smart Schedule',
      description: 'AI optimizes your study schedule based on your habits, deadlines, and learning patterns!',
      icon: 'calendar',
      color: '#FF5722',
      benefits: ['Optimized timing', 'Deadline tracking', 'Habit analysis', 'Smart reminders']
    },
    {
      title: '📞 HD Voice Calls',
      description: 'Crystal-clear voice calls with AI noise reduction for perfect study group discussions!',
      icon: 'call',
      color: '#795548',
      benefits: ['HD audio quality', 'AI noise reduction', 'Group calls', 'Screen sharing']
    }
  ];

  const lecturerFeatures = [
    {
      title: '🤖 AI Lecture Assistant',
      description: 'Your intelligent teaching companion that creates lesson plans, generates content, and provides engagement strategies!',
      icon: 'school',
      color: '#667eea',
      benefits: ['Instant lesson plans', 'Content generation', 'Engagement strategies', 'Assessment tools']
    },
    {
      title: '⚡ Smart Grading System',
      description: '94% accurate AI auto-grading that saves hours of work while providing better feedback than manual grading!',
      icon: 'flash',
      color: '#4CAF50',
      benefits: ['94% accuracy', '240+ min saved', 'Better feedback', 'Batch processing']
    },
    {
      title: '🌐 Virtual Classroom',
      description: 'Teach in AR/VR environments with immersive 3D tools that boost student engagement by 87%!',
      icon: 'cube',
      color: '#FF9800',
      benefits: ['AR/VR teaching', '87% engagement', '3D tools', 'Interactive spaces']
    },
    {
      title: '🎨 AI Content Generator',
      description: 'Create complete presentations, quizzes, and assignments in under a minute with AI-powered generation!',
      icon: 'sparkles',
      color: '#9C27B0',
      benefits: ['45-sec presentations', 'Auto-visuals', 'Multi-format', 'Pedagogy-based']
    },
    {
      title: '📊 Teaching Analytics',
      description: 'Deep insights into student performance with predictive analytics and personalized teaching recommendations!',
      icon: 'analytics',
      color: '#2196F3',
      benefits: ['Real-time insights', 'Predictive analytics', 'Teaching tips', 'Performance tracking']
    },
    {
      title: '🎬 Smart Recording',
      description: 'Record lectures with AI transcription, key point detection, and automatic chapter creation!',
      icon: 'videocam',
      color: '#795548',
      benefits: ['98% transcription', 'Key points', 'Auto chapters', 'Engagement tracking']
    },
    {
      title: '🔍 Plagiarism Detector',
      description: '96% accurate plagiarism detection with semantic analysis and advanced paraphrasing detection!',
      icon: 'shield-checkmark',
      color: '#607D8B',
      benefits: ['96% accuracy', 'Semantic analysis', 'Paraphrase detection', '65B+ sources']
    },
    {
      title: '🔮 AI Performance Prediction',
      description: '92% accurate machine learning predictions of student success with early intervention recommendations!',
      icon: 'brain',
      color: '#E91E63',
      benefits: ['92% ML accuracy', 'Early intervention', 'Risk assessment', 'Success prediction']
    }
  ];

  const features = userType === 'lecturer' ? lecturerFeatures : studentFeatures;

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.spring(slideAnim, {
          toValue: 0,
          tension: 50,
          friction: 8,
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true,
        })
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: height,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        })
      ]).start();
    }
  }, [visible]);

  const nextStep = () => {
    if (currentStep < features.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      onClose();
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const skipGuide = () => {
    onClose();
  };

  if (!visible) return null;

  const currentFeature = features[currentStep];

  return (
    <Modal visible={visible} transparent animationType="none">
      <View style={styles.overlay}>
        <Animated.View 
          style={[
            styles.container,
            { 
              transform: [{ translateY: slideAnim }],
              opacity: fadeAnim
            }
          ]}
        >
          {/* Header */}
          <LinearGradient
            colors={['#667eea', '#764ba2']}
            style={styles.header}
          >
            <View style={styles.headerContent}>
              <View style={styles.headerInfo}>
                <Text style={styles.headerTitle}>
                  🚀 Welcome to the Future of {userType === 'lecturer' ? 'Teaching' : 'Learning'}!
                </Text>
                <Text style={styles.headerSubtitle}>
                  Discover amazing AI-powered features that will transform your experience
                </Text>
              </View>
              <TouchableOpacity onPress={skipGuide} style={styles.skipButton}>
                <Text style={styles.skipButtonText}>Skip</Text>
              </TouchableOpacity>
            </View>
          </LinearGradient>

          {/* Progress Indicator */}
          <View style={styles.progressContainer}>
            <View style={styles.progressBar}>
              <View 
                style={[
                  styles.progressFill, 
                  { width: `${((currentStep + 1) / features.length) * 100}%` }
                ]} 
              />
            </View>
            <Text style={styles.progressText}>
              {currentStep + 1} of {features.length}
            </Text>
          </View>

          {/* Feature Content */}
          <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
            <View style={styles.featureContainer}>
              {/* Feature Icon */}
              <View style={styles.featureIconContainer}>
                <LinearGradient
                  colors={[currentFeature.color, `${currentFeature.color}80`]}
                  style={styles.featureIconGradient}
                >
                  <Ionicons name={currentFeature.icon} size={48} color="#fff" />
                </LinearGradient>
              </View>

              {/* Feature Title */}
              <Text style={styles.featureTitle}>{currentFeature.title}</Text>

              {/* Feature Description */}
              <Text style={styles.featureDescription}>{currentFeature.description}</Text>

              {/* Benefits List */}
              <View style={styles.benefitsContainer}>
                <Text style={styles.benefitsTitle}>✨ Key Benefits:</Text>
                {currentFeature.benefits.map((benefit, index) => (
                  <Animated.View 
                    key={index}
                    style={[
                      styles.benefitItem,
                      {
                        opacity: fadeAnim,
                        transform: [{
                          translateX: fadeAnim.interpolate({
                            inputRange: [0, 1],
                            outputRange: [50, 0]
                          })
                        }]
                      }
                    ]}
                  >
                    <View style={[styles.benefitDot, { backgroundColor: currentFeature.color }]} />
                    <Text style={styles.benefitText}>{benefit}</Text>
                  </Animated.View>
                ))}
              </View>

              {/* Feature Preview */}
              <View style={styles.previewContainer}>
                <LinearGradient
                  colors={[`${currentFeature.color}10`, `${currentFeature.color}05`]}
                  style={styles.previewCard}
                >
                  <Ionicons name="eye" size={24} color={currentFeature.color} />
                  <Text style={[styles.previewText, { color: currentFeature.color }]}>
                    Tap any feature card in your dashboard to try it out!
                  </Text>
                </LinearGradient>
              </View>
            </View>
          </ScrollView>

          {/* Navigation */}
          <View style={styles.navigation}>
            <TouchableOpacity 
              style={[styles.navButton, currentStep === 0 && styles.navButtonDisabled]}
              onPress={prevStep}
              disabled={currentStep === 0}
            >
              <Ionicons 
                name="chevron-back" 
                size={20} 
                color={currentStep === 0 ? "#ccc" : "#667eea"} 
              />
              <Text style={[
                styles.navButtonText, 
                currentStep === 0 && styles.navButtonTextDisabled
              ]}>
                Previous
              </Text>
            </TouchableOpacity>

            <View style={styles.stepIndicators}>
              {features.map((_, index) => (
                <View
                  key={index}
                  style={[
                    styles.stepDot,
                    index === currentStep && styles.stepDotActive,
                    index === currentStep && { backgroundColor: currentFeature.color }
                  ]}
                />
              ))}
            </View>

            <TouchableOpacity style={styles.navButton} onPress={nextStep}>
              <Text style={styles.navButtonText}>
                {currentStep === features.length - 1 ? 'Get Started' : 'Next'}
              </Text>
              <Ionicons name="chevron-forward" size={20} color="#667eea" />
            </TouchableOpacity>
          </View>
        </Animated.View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  container: {
    width: width * 0.9,
    maxHeight: height * 0.85,
    backgroundColor: '#fff',
    borderRadius: 25,
    overflow: 'hidden',
  },
  header: {
    paddingTop: 20,
    paddingBottom: 15,
    paddingHorizontal: 20,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerInfo: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  skipButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 15,
  },
  skipButtonText: {
    fontSize: 14,
    color: '#fff',
    fontWeight: '500',
  },
  
  // Progress
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: '#f8f9fa',
  },
  progressBar: {
    flex: 1,
    height: 6,
    backgroundColor: '#e9ecef',
    borderRadius: 3,
    marginRight: 12,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#667eea',
    borderRadius: 3,
  },
  progressText: {
    fontSize: 12,
    color: '#666',
    fontWeight: '500',
    minWidth: 60,
    textAlign: 'right',
  },
  
  // Content
  content: {
    flex: 1,
    padding: 20,
  },
  featureContainer: {
    alignItems: 'center',
  },
  featureIconContainer: {
    marginBottom: 20,
  },
  featureIconGradient: {
    width: 100,
    height: 100,
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 8,
  },
  featureTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
    marginBottom: 16,
  },
  featureDescription: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 24,
  },
  
  // Benefits
  benefitsContainer: {
    width: '100%',
    marginBottom: 24,
  },
  benefitsTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 16,
    textAlign: 'center',
  },
  benefitItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    paddingHorizontal: 16,
  },
  benefitDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 12,
  },
  benefitText: {
    fontSize: 16,
    color: '#333',
    flex: 1,
  },
  
  // Preview
  previewContainer: {
    width: '100%',
    marginBottom: 20,
  },
  previewCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    justifyContent: 'center',
  },
  previewText: {
    fontSize: 14,
    fontWeight: '500',
    marginLeft: 8,
    textAlign: 'center',
  },
  
  // Navigation
  navigation: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 20,
    backgroundColor: '#f8f9fa',
  },
  navButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    minWidth: 80,
  },
  navButtonDisabled: {
    opacity: 0.5,
  },
  navButtonText: {
    fontSize: 16,
    color: '#667eea',
    fontWeight: '500',
    marginHorizontal: 4,
  },
  navButtonTextDisabled: {
    color: '#ccc',
  },
  stepIndicators: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  stepDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#e9ecef',
    marginHorizontal: 3,
  },
  stepDotActive: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
});

export default FeatureWelcomeGuide;
