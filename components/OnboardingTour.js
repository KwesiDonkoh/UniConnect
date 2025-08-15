import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  Animated,
  Dimensions,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

const { width, height } = Dimensions.get('window');

export const OnboardingTour = ({ visible, onComplete }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const slideAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(1)).current;

  const onboardingSteps = [
    {
      id: 1,
      title: 'Welcome to UniConnect! 🎓',
      subtitle: 'Your ultimate student companion',
      description: 'Connect with classmates, manage your studies, and excel academically with our comprehensive platform.',
      icon: 'school',
      color: '#6366F1',
    },
    {
      id: 2,
      title: 'Stay Connected 💬',
      subtitle: 'Group chats & communication',
      description: 'Join course-specific group chats, make voice/video calls, and collaborate with your peers in real-time.',
      icon: 'chatbubbles',
      color: '#10B981',
    },
    {
      id: 3,
      title: 'Study Smart 📚',
      subtitle: 'Productivity tools & gamification',
      description: 'Use pomodoro timers, track study streaks, earn achievements, and compete on leaderboards.',
      icon: 'trophy',
      color: '#F59E0B',
    },
    {
      id: 4,
      title: 'Never Miss Anything 🔔',
      subtitle: 'Smart notifications',
      description: 'Get instant alerts for assignments, exams, materials, and important announcements.',
      icon: 'notifications',
      color: '#EF4444',
    },
    {
      id: 5,
      title: 'Find Study Buddies 👥',
      subtitle: 'Social learning',
      description: 'Connect with study partners, join study groups, share your progress, and learn together.',
      icon: 'people',
      color: '#8B5CF6',
    },
    {
      id: 6,
      title: 'Ready to Excel! 🚀',
      subtitle: 'Your journey begins now',
      description: 'You\'re all set! Start exploring, connecting, and achieving your academic goals.',
      icon: 'rocket',
      color: '#EC4899',
    },
  ];

  const nextStep = () => {
    if (currentStep < onboardingSteps.length - 1) {
      Animated.sequence([
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: currentStep + 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
      
      setCurrentStep(currentStep + 1);
    } else {
      onComplete();
    }
  };

  const skipTour = () => {
    onComplete();
  };

  const currentStepData = onboardingSteps[currentStep];

  return (
    <Modal visible={visible} transparent={false} animationType="fade">
      <LinearGradient
        colors={[currentStepData.color, `${currentStepData.color}CC`]}
        style={styles.container}
      >
        {/* Skip Button */}
        <TouchableOpacity style={styles.skipButton} onPress={skipTour}>
          <Text style={styles.skipText}>Skip Tour</Text>
        </TouchableOpacity>

        <Animated.View 
          style={[
            styles.content,
            {
              opacity: fadeAnim,
              transform: [
                {
                  translateX: slideAnim.interpolate({
                    inputRange: [0, onboardingSteps.length - 1],
                    outputRange: [0, -width * (onboardingSteps.length - 1)],
                  }),
                },
              ],
            },
          ]}
        >
          <View style={styles.iconContainer}>
            <View style={styles.iconCircle}>
              <Ionicons 
                name={currentStepData.icon} 
                size={80} 
                color="#FFFFFF" 
              />
            </View>
          </View>

          <View style={styles.textContainer}>
            <Text style={styles.title}>{currentStepData.title}</Text>
            <Text style={styles.subtitle}>{currentStepData.subtitle}</Text>
            <Text style={styles.description}>{currentStepData.description}</Text>
          </View>
        </Animated.View>

        {/* Progress Indicator */}
        <View style={styles.progressContainer}>
          <View style={styles.progressBar}>
            {onboardingSteps.map((_, index) => (
              <View
                key={index}
                style={[
                  styles.progressDot,
                  index <= currentStep && styles.progressDotActive,
                ]}
              />
            ))}
          </View>
          
          <Text style={styles.progressText}>
            {currentStep + 1} of {onboardingSteps.length}
          </Text>
        </View>

        {/* Navigation */}
        <View style={styles.navigation}>
          <TouchableOpacity
            style={[styles.navButton, styles.nextButton]}
            onPress={nextStep}
          >
            <Text style={styles.nextButtonText}>
              {currentStep < onboardingSteps.length - 1 ? 'Next' : 'Get Started'}
            </Text>
            <Ionicons 
              name={currentStep < onboardingSteps.length - 1 ? 'arrow-forward' : 'checkmark'} 
              size={20} 
              color="#FFFFFF" 
            />
          </TouchableOpacity>
        </View>

        {/* Floating Elements for Visual Appeal */}
        <View style={styles.floatingElements}>
          <Animated.View style={[styles.floatingElement, styles.float1]} />
          <Animated.View style={[styles.floatingElement, styles.float2]} />
          <Animated.View style={[styles.floatingElement, styles.float3]} />
        </View>
      </LinearGradient>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  skipButton: {
    position: 'absolute',
    top: 60,
    right: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  skipText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    width: width,
  },
  iconContainer: {
    marginBottom: 60,
  },
  iconCircle: {
    width: 160,
    height: 160,
    borderRadius: 80,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  textContainer: {
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 18,
    color: 'rgba(255, 255, 255, 0.9)',
    textAlign: 'center',
    marginBottom: 20,
    fontWeight: '500',
  },
  description: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'center',
    lineHeight: 24,
    maxWidth: 320,
  },
  progressContainer: {
    alignItems: 'center',
    marginBottom: 40,
  },
  progressBar: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 12,
  },
  progressDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
  },
  progressDotActive: {
    backgroundColor: '#FFFFFF',
  },
  progressText: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 14,
  },
  navigation: {
    alignItems: 'center',
  },
  navButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  nextButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 25,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  nextButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
  },
  floatingElements: {
    position: 'absolute',
    width: '100%',
    height: '100%',
  },
  floatingElement: {
    position: 'absolute',
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  float1: {
    top: '20%',
    left: '10%',
  },
  float2: {
    top: '60%',
    right: '15%',
  },
  float3: {
    bottom: '30%',
    left: '20%',
  },
});
