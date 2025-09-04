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
  TextInput,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

const { width, height } = Dimensions.get('window');

export const AIContentGenerator = ({ visible, onClose, course, user }) => {
  const [selectedContentType, setSelectedContentType] = useState('slides');
  const [generationParams, setGenerationParams] = useState({
    topic: '',
    difficulty: 'intermediate',
    duration: '50',
    style: 'engaging'
  });
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedContent, setGeneratedContent] = useState(null);
  const [generationProgress, setGenerationProgress] = useState(0);
  
  const slideAnim = useRef(new Animated.Value(height)).current;
  const progressAnim = useRef(new Animated.Value(0)).current;

  const contentTypes = [
    {
      id: 'slides',
      name: 'Presentation Slides',
      icon: 'albums',
      color: '#4CAF50',
      description: 'AI-generated slide decks with visuals',
      features: ['Auto-layout', 'Smart visuals', 'Speaker notes', 'Interactive elements']
    },
    {
      id: 'quiz',
      name: 'Quiz & Assessment',
      icon: 'help-circle',
      color: '#2196F3',
      description: 'Comprehensive quizzes and tests',
      features: ['Multiple formats', 'Auto-grading', 'Difficulty scaling', 'Analytics']
    },
    {
      id: 'assignments',
      name: 'Assignments',
      icon: 'document-text',
      color: '#FF9800',
      description: 'Project-based learning tasks',
      features: ['Rubrics included', 'Peer review', 'Real-world context', 'Skill alignment']
    },
    {
      id: 'exercises',
      name: 'Practice Exercises',
      icon: 'fitness',
      color: '#9C27B0',
      description: 'Hands-on coding challenges',
      features: ['Auto-testing', 'Hints system', 'Progressive difficulty', 'Solution guides']
    },
    {
      id: 'notes',
      name: 'Study Notes',
      icon: 'book',
      color: '#FF5722',
      description: 'Comprehensive study materials',
      features: ['Structured content', 'Key highlights', 'Examples', 'References']
    },
    {
      id: 'videos',
      name: 'Video Scripts',
      icon: 'videocam',
      color: '#795548',
      description: 'Educational video content',
      features: ['Engaging scripts', 'Visual cues', 'Timing notes', 'Interactive segments']
    }
  ];

  const difficultyLevels = [
    { id: 'beginner', name: 'Beginner', color: '#4CAF50', description: 'Basic concepts and fundamentals' },
    { id: 'intermediate', name: 'Intermediate', color: '#FF9800', description: 'Building on foundations' },
    { id: 'advanced', name: 'Advanced', color: '#F44336', description: 'Complex topics and applications' },
    { id: 'expert', name: 'Expert', color: '#9C27B0', description: 'Cutting-edge and specialized' }
  ];

  const teachingStyles = [
    { id: 'engaging', name: 'Engaging & Interactive', icon: 'flash' },
    { id: 'structured', name: 'Structured & Methodical', icon: 'list' },
    { id: 'practical', name: 'Practical & Hands-on', icon: 'hammer' },
    { id: 'theoretical', name: 'Theoretical & Deep', icon: 'library' },
    { id: 'visual', name: 'Visual & Graphic', icon: 'images' },
    { id: 'storytelling', name: 'Storytelling & Narrative', icon: 'book-outline' }
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

  const generateContent = async () => {
    if (!generationParams.topic.trim()) {
      Alert.alert('Missing Topic', 'Please enter a topic for content generation.');
      return;
    }

    setIsGenerating(true);
    setGenerationProgress(0);
    
    // Simulate AI content generation with progress
    const progressInterval = setInterval(() => {
      setGenerationProgress(prev => {
        if (prev >= 100) {
          clearInterval(progressInterval);
          setIsGenerating(false);
          showGeneratedContent();
          return 100;
        }
        return prev + Math.random() * 15;
      });
    }, 300);
  };

  const showGeneratedContent = () => {
    const contentType = contentTypes.find(ct => ct.id === selectedContentType);
    const mockContent = generateMockContent(selectedContentType, generationParams);
    setGeneratedContent(mockContent);
    
    Alert.alert(
      '🎉 Content Generated!',
      `Your ${contentType.name.toLowerCase()} for "${generationParams.topic}" has been created successfully!\n\n✨ Features included:\n${contentType.features.map(f => `• ${f}`).join('\n')}\n\n📊 Quality Score: 94%\n⏱️ Generation Time: ${Math.floor(Math.random() * 30 + 10)}s`,
      [
        { text: 'Preview', onPress: () => {} },
        { text: 'Download', onPress: () => {} },
        { text: 'Great!', style: 'default' }
      ]
    );
  };

  const generateMockContent = (type, params) => {
    switch (type) {
      case 'slides':
        return {
          type: 'Presentation Slides',
          title: `${params.topic} - Interactive Presentation`,
          slides: [
            { title: 'Introduction', content: `Welcome to ${params.topic}`, notes: 'Start with an engaging hook' },
            { title: 'Core Concepts', content: 'Fundamental principles explained', notes: 'Use interactive elements here' },
            { title: 'Practical Examples', content: 'Real-world applications', notes: 'Include live demonstrations' },
            { title: 'Hands-on Activity', content: 'Student participation time', notes: 'Break into small groups' },
            { title: 'Summary & Next Steps', content: 'Key takeaways and preview', notes: 'End with clear action items' }
          ],
          estimatedTime: `${params.duration} minutes`,
          interactiveElements: 12,
          visuals: 18
        };
      case 'quiz':
        return {
          type: 'Quiz & Assessment',
          title: `${params.topic} - Comprehensive Assessment`,
          questions: [
            { type: 'Multiple Choice', question: `What is the primary concept in ${params.topic}?`, points: 5 },
            { type: 'Short Answer', question: `Explain how ${params.topic} applies to real scenarios`, points: 10 },
            { type: 'Code Analysis', question: 'Analyze the following implementation', points: 15 },
            { type: 'Problem Solving', question: 'Design a solution using the concepts learned', points: 20 }
          ],
          totalPoints: 50,
          estimatedTime: '30 minutes',
          difficultyDistribution: { easy: 30, medium: 50, hard: 20 }
        };
      default:
        return {
          type: contentType.name,
          title: `${params.topic} - ${contentType.name}`,
          description: `Comprehensive ${contentType.name.toLowerCase()} covering ${params.topic}`,
          sections: 5,
          pages: Math.floor(Math.random() * 20 + 10),
          interactiveElements: Math.floor(Math.random() * 10 + 5)
        };
    }
  };

  const renderContentTypeCard = (contentType) => (
    <TouchableOpacity
      key={contentType.id}
      style={[
        styles.contentTypeCard,
        selectedContentType === contentType.id && { borderColor: contentType.color, borderWidth: 2 }
      ]}
      onPress={() => setSelectedContentType(contentType.id)}
    >
      <LinearGradient
        colors={[contentType.color, `${contentType.color}80`]}
        style={styles.contentTypeIcon}
      >
        <Ionicons name={contentType.icon} size={24} color="#fff" />
      </LinearGradient>
      
      <Text style={styles.contentTypeName}>{contentType.name}</Text>
      <Text style={styles.contentTypeDescription}>{contentType.description}</Text>
      
      <View style={styles.contentTypeFeatures}>
        {contentType.features.slice(0, 2).map((feature, index) => (
          <View key={index} style={styles.featureTag}>
            <Text style={styles.featureText}>{feature}</Text>
          </View>
        ))}
      </View>
      
      {selectedContentType === contentType.id && (
        <View style={[styles.selectedIndicator, { backgroundColor: contentType.color }]}>
          <Ionicons name="checkmark" size={16} color="#fff" />
        </View>
      )}
    </TouchableOpacity>
  );

  const renderParameterSection = () => (
    <View style={styles.parametersSection}>
      <Text style={styles.sectionTitle}>🎯 Generation Parameters</Text>
      
      {/* Topic Input */}
      <View style={styles.parameterGroup}>
        <Text style={styles.parameterLabel}>📚 Topic/Subject</Text>
        <TextInput
          style={styles.topicInput}
          value={generationParams.topic}
          onChangeText={(text) => setGenerationParams(prev => ({ ...prev, topic: text }))}
          placeholder="e.g., Binary Trees, Machine Learning, Database Design..."
          placeholderTextColor="#999"
        />
      </View>

      {/* Difficulty Level */}
      <View style={styles.parameterGroup}>
        <Text style={styles.parameterLabel}>📊 Difficulty Level</Text>
        <View style={styles.difficultyButtons}>
          {difficultyLevels.map((level) => (
            <TouchableOpacity
              key={level.id}
              style={[
                styles.difficultyButton,
                generationParams.difficulty === level.id && { backgroundColor: level.color }
              ]}
              onPress={() => setGenerationParams(prev => ({ ...prev, difficulty: level.id }))}
            >
              <Text style={[
                styles.difficultyButtonText,
                generationParams.difficulty === level.id && { color: '#fff' }
              ]}>
                {level.name}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Duration */}
      <View style={styles.parameterGroup}>
        <Text style={styles.parameterLabel}>⏱️ Duration (minutes)</Text>
        <View style={styles.durationSlider}>
          <View style={styles.durationOptions}>
            {['30', '45', '50', '75', '90'].map((duration) => (
              <TouchableOpacity
                key={duration}
                style={[
                  styles.durationOption,
                  generationParams.duration === duration && styles.selectedDurationOption
                ]}
                onPress={() => setGenerationParams(prev => ({ ...prev, duration }))}
              >
                <Text style={[
                  styles.durationOptionText,
                  generationParams.duration === duration && styles.selectedDurationOptionText
                ]}>
                  {duration}min
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </View>

      {/* Teaching Style */}
      <View style={styles.parameterGroup}>
        <Text style={styles.parameterLabel}>🎨 Teaching Style</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View style={styles.styleOptions}>
            {teachingStyles.map((style) => (
              <TouchableOpacity
                key={style.id}
                style={[
                  styles.styleOption,
                  generationParams.style === style.id && styles.selectedStyleOption
                ]}
                onPress={() => setGenerationParams(prev => ({ ...prev, style: style.id }))}
              >
                <Ionicons 
                  name={style.icon} 
                  size={16} 
                  color={generationParams.style === style.id ? '#fff' : '#667eea'} 
                />
                <Text style={[
                  styles.styleOptionText,
                  generationParams.style === style.id && styles.selectedStyleOptionText
                ]}>
                  {style.name}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>
      </View>
    </View>
  );

  const renderGenerationProgress = () => (
    <View style={styles.progressContainer}>
      <Text style={styles.progressTitle}>🤖 AI is creating your content...</Text>
      <View style={styles.progressBar}>
        <Animated.View 
          style={[
            styles.progressFill,
            { width: `${generationProgress}%` }
          ]} 
        />
      </View>
      <Text style={styles.progressText}>{Math.round(generationProgress)}% complete</Text>
      
      <View style={styles.progressSteps}>
        <View style={styles.progressStep}>
          <Ionicons name="checkmark-circle" size={16} color="#4CAF50" />
          <Text style={styles.progressStepText}>Analyzing topic</Text>
        </View>
        <View style={styles.progressStep}>
          <Ionicons name="checkmark-circle" size={16} color="#4CAF50" />
          <Text style={styles.progressStepText}>Structuring content</Text>
        </View>
        <View style={[styles.progressStep, generationProgress < 70 && { opacity: 0.5 }]}>
          <Ionicons 
            name={generationProgress >= 70 ? "checkmark-circle" : "ellipse-outline"} 
            size={16} 
            color={generationProgress >= 70 ? "#4CAF50" : "#ccc"} 
          />
          <Text style={styles.progressStepText}>Generating visuals</Text>
        </View>
        <View style={[styles.progressStep, generationProgress < 90 && { opacity: 0.5 }]}>
          <Ionicons 
            name={generationProgress >= 90 ? "checkmark-circle" : "ellipse-outline"} 
            size={16} 
            color={generationProgress >= 90 ? "#4CAF50" : "#ccc"} 
          />
          <Text style={styles.progressStepText}>Finalizing output</Text>
        </View>
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
                <Text style={styles.headerTitle}>🤖 AI Content Generator</Text>
                <Text style={styles.headerSubtitle}>
                  Create professional course materials instantly
                </Text>
              </View>
              
              <View style={styles.aiPoweredBadge}>
                <Ionicons name="sparkles" size={20} color="#fff" />
              </View>
            </View>
          </LinearGradient>

          <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
            {/* Content Type Selection */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>📝 What would you like to create?</Text>
              <Text style={styles.sectionSubtitle}>
                Choose the type of educational content to generate
              </Text>
              <View style={styles.contentTypesGrid}>
                {contentTypes.map(renderContentTypeCard)}
              </View>
            </View>

            {/* Generation Parameters */}
            {renderParameterSection()}

            {/* Generation Progress */}
            {isGenerating && renderGenerationProgress()}

            {/* Generate Button */}
            {!isGenerating && (
              <TouchableOpacity 
                style={styles.generateButton}
                onPress={generateContent}
              >
                <LinearGradient
                  colors={['#4CAF50', '#45a049']}
                  style={styles.generateButtonGradient}
                >
                  <Ionicons name="flash" size={24} color="#fff" />
                  <Text style={styles.generateButtonText}>Generate Content</Text>
                </LinearGradient>
              </TouchableOpacity>
            )}

            {/* AI Features Showcase */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>✨ AI-Powered Features</Text>
              <View style={styles.featuresGrid}>
                <View style={styles.featureCard}>
                  <Ionicons name="brain" size={32} color="#4CAF50" />
                  <Text style={styles.featureTitle}>Smart Content</Text>
                  <Text style={styles.featureDescription}>
                    AI analyzes your topic and creates relevant, engaging content
                  </Text>
                </View>
                <View style={styles.featureCard}>
                  <Ionicons name="images" size={32} color="#2196F3" />
                  <Text style={styles.featureTitle}>Auto Visuals</Text>
                  <Text style={styles.featureDescription}>
                    Automatically generates diagrams, charts, and illustrations
                  </Text>
                </View>
                <View style={styles.featureCard}>
                  <Ionicons name="people" size={32} color="#FF9800" />
                  <Text style={styles.featureTitle}>Engagement Focus</Text>
                  <Text style={styles.featureDescription}>
                    Optimized for student interaction and participation
                  </Text>
                </View>
                <View style={styles.featureCard}>
                  <Ionicons name="school" size={32} color="#9C27B0" />
                  <Text style={styles.featureTitle}>Pedagogy-Based</Text>
                  <Text style={styles.featureDescription}>
                    Built on proven educational methodologies
                  </Text>
                </View>
              </View>
            </View>

            {/* Recent Generations */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>📚 Recent Generations</Text>
              <View style={styles.recentList}>
                <View style={styles.recentItem}>
                  <Ionicons name="albums" size={20} color="#4CAF50" />
                  <View style={styles.recentInfo}>
                    <Text style={styles.recentTitle}>Data Structures Slides</Text>
                    <Text style={styles.recentMeta}>25 slides • 2 hours ago</Text>
                  </View>
                  <TouchableOpacity style={styles.recentAction}>
                    <Ionicons name="download" size={16} color="#667eea" />
                  </TouchableOpacity>
                </View>
                <View style={styles.recentItem}>
                  <Ionicons name="help-circle" size={20} color="#2196F3" />
                  <View style={styles.recentInfo}>
                    <Text style={styles.recentTitle}>Algorithm Quiz</Text>
                    <Text style={styles.recentMeta}>15 questions • Yesterday</Text>
                  </View>
                  <TouchableOpacity style={styles.recentAction}>
                    <Ionicons name="download" size={16} color="#667eea" />
                  </TouchableOpacity>
                </View>
                <View style={styles.recentItem}>
                  <Ionicons name="document-text" size={20} color="#FF9800" />
                  <View style={styles.recentInfo}>
                    <Text style={styles.recentTitle}>Database Assignment</Text>
                    <Text style={styles.recentMeta}>Project-based • 3 days ago</Text>
                  </View>
                  <TouchableOpacity style={styles.recentAction}>
                    <Ionicons name="download" size={16} color="#667eea" />
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </ScrollView>
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
  
  // Content Types
  contentTypesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  contentTypeCard: {
    width: '48%',
    backgroundColor: '#f8f9fa',
    borderRadius: 15,
    padding: 16,
    marginBottom: 16,
    alignItems: 'center',
    position: 'relative',
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  contentTypeIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  contentTypeName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
    textAlign: 'center',
  },
  contentTypeDescription: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
    marginBottom: 12,
  },
  contentTypeFeatures: {
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
  
  // Parameters
  parametersSection: {
    backgroundColor: '#f8f9fa',
    borderRadius: 15,
    padding: 20,
    marginBottom: 30,
  },
  parameterGroup: {
    marginBottom: 20,
  },
  parameterLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  topicInput: {
    backgroundColor: '#fff',
    borderRadius: 10,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: '#333',
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  difficultyButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  difficultyButton: {
    backgroundColor: '#fff',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    marginRight: 8,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  difficultyButtonText: {
    fontSize: 14,
    color: '#333',
    fontWeight: '500',
  },
  durationSlider: {
    marginTop: 8,
  },
  durationOptions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  durationOption: {
    backgroundColor: '#fff',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  selectedDurationOption: {
    backgroundColor: '#667eea',
    borderColor: '#667eea',
  },
  durationOptionText: {
    fontSize: 14,
    color: '#333',
    fontWeight: '500',
  },
  selectedDurationOptionText: {
    color: '#fff',
  },
  styleOptions: {
    flexDirection: 'row',
    paddingHorizontal: 4,
  },
  styleOption: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginRight: 8,
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  selectedStyleOption: {
    backgroundColor: '#667eea',
    borderColor: '#667eea',
  },
  styleOptionText: {
    fontSize: 12,
    color: '#667eea',
    fontWeight: '500',
    marginLeft: 6,
  },
  selectedStyleOptionText: {
    color: '#fff',
  },
  
  // Progress
  progressContainer: {
    backgroundColor: '#f0f8ff',
    borderRadius: 15,
    padding: 20,
    marginBottom: 30,
    alignItems: 'center',
  },
  progressTitle: {
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
    backgroundColor: '#4CAF50',
    borderRadius: 4,
  },
  progressText: {
    fontSize: 14,
    color: '#4CAF50',
    fontWeight: '600',
    marginBottom: 20,
  },
  progressSteps: {
    width: '100%',
  },
  progressStep: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  progressStepText: {
    fontSize: 14,
    color: '#333',
    marginLeft: 8,
  },
  
  // Generate Button
  generateButton: {
    marginBottom: 30,
  },
  generateButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 25,
  },
  generateButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
    marginLeft: 8,
  },
  
  // Features
  featuresGrid: {
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
  
  // Recent
  recentList: {
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    padding: 16,
  },
  recentItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
  },
  recentInfo: {
    flex: 1,
    marginLeft: 12,
  },
  recentTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  recentMeta: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  recentAction: {
    padding: 8,
  },
});

export default AIContentGenerator;
