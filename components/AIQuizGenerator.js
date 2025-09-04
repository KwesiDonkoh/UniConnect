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
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';

const { width, height } = Dimensions.get('window');

export const AIQuizGenerator = ({ visible, onClose, course, topic }) => {
  const [currentQuiz, setCurrentQuiz] = useState(null);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [score, setScore] = useState(0);
  const [quizCompleted, setQuizCompleted] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [difficulty, setDifficulty] = useState('intermediate');
  const [quizType, setQuizType] = useState('multiple-choice');
  const [timeRemaining, setTimeRemaining] = useState(30);
  const [timerActive, setTimerActive] = useState(false);

  const slideAnim = useRef(new Animated.Value(height)).current;
  const progressAnim = useRef(new Animated.Value(0)).current;
  const scoreAnim = useRef(new Animated.Value(0)).current;
  const timerRef = useRef(null);

  const difficultyLevels = [
    { id: 'beginner', name: 'Beginner', color: '#4CAF50', description: 'Basic concepts' },
    { id: 'intermediate', name: 'Intermediate', color: '#FF9800', description: 'Moderate challenge' },
    { id: 'advanced', name: 'Advanced', color: '#F44336', description: 'Expert level' },
  ];

  const quizTypes = [
    { id: 'multiple-choice', name: 'Multiple Choice', icon: 'list-circle', description: '4 options per question' },
    { id: 'true-false', name: 'True/False', icon: 'checkmark-circle', description: 'Simple yes/no questions' },
    { id: 'fill-blank', name: 'Fill in Blanks', icon: 'create', description: 'Complete the sentence' },
  ];

  const sampleQuizzes = {
    'multiple-choice': {
      beginner: [
        {
          question: "What is the primary function of RAM in a computer?",
          options: ["Store data permanently", "Temporary data storage", "Process instructions", "Display graphics"],
          correct: 1,
          explanation: "RAM (Random Access Memory) provides temporary storage for data that the CPU needs quick access to."
        },
        {
          question: "Which programming language is known for web development?",
          options: ["C++", "JavaScript", "Assembly", "COBOL"],
          correct: 1,
          explanation: "JavaScript is widely used for web development, both frontend and backend."
        },
        {
          question: "What does CPU stand for?",
          options: ["Computer Processing Unit", "Central Processing Unit", "Core Processing Unit", "Central Program Unit"],
          correct: 1,
          explanation: "CPU stands for Central Processing Unit, the brain of the computer."
        }
      ],
      intermediate: [
        {
          question: "In object-oriented programming, what is encapsulation?",
          options: ["Hiding implementation details", "Creating multiple classes", "Inheriting from parent classes", "Overloading methods"],
          correct: 0,
          explanation: "Encapsulation is the practice of hiding internal implementation details and exposing only necessary interfaces."
        },
        {
          question: "What is the time complexity of binary search?",
          options: ["O(n)", "O(log n)", "O(n²)", "O(1)"],
          correct: 1,
          explanation: "Binary search has O(log n) time complexity because it eliminates half the search space in each iteration."
        }
      ],
      advanced: [
        {
          question: "In distributed systems, what is the CAP theorem?",
          options: ["Consistency, Availability, Partition tolerance", "Cache, API, Performance", "Compute, Access, Process", "Code, Algorithm, Protocol"],
          correct: 0,
          explanation: "CAP theorem states that a distributed system can only guarantee two out of three: Consistency, Availability, and Partition tolerance."
        }
      ]
    }
  };

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
      resetQuiz();
    }
  }, [visible]);

  useEffect(() => {
    if (timerActive && timeRemaining > 0) {
      timerRef.current = setTimeout(() => {
        setTimeRemaining(prev => prev - 1);
      }, 1000);
    } else if (timeRemaining === 0 && timerActive) {
      handleTimeUp();
    }

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [timeRemaining, timerActive]);

  const resetQuiz = () => {
    setCurrentQuiz(null);
    setCurrentQuestion(0);
    setSelectedAnswer(null);
    setScore(0);
    setQuizCompleted(false);
    setTimeRemaining(30);
    setTimerActive(false);
  };

  const generateQuiz = () => {
    setIsGenerating(true);
    
    setTimeout(() => {
      const quizData = sampleQuizzes[quizType]?.[difficulty] || sampleQuizzes['multiple-choice']['beginner'];
      setCurrentQuiz({
        title: `${course?.name || 'Computer Science'} - ${difficulty.charAt(0).toUpperCase() + difficulty.slice(1)} Quiz`,
        questions: quizData,
        timeLimit: 30,
        passingScore: 70
      });
      setIsGenerating(false);
      setTimerActive(true);
      
      // Animate progress bar
      Animated.timing(progressAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: false,
      }).start();
    }, 2000);
  };

  const handleAnswer = (answerIndex) => {
    if (selectedAnswer !== null) return;
    
    setSelectedAnswer(answerIndex);
    setTimerActive(false);
    
    const isCorrect = answerIndex === currentQuiz.questions[currentQuestion].correct;
    if (isCorrect) {
      setScore(prev => prev + 1);
      // Animate score
      Animated.spring(scoreAnim, {
        toValue: 1,
        tension: 100,
        friction: 8,
        useNativeDriver: true,
      }).start(() => {
        Animated.spring(scoreAnim, {
          toValue: 0,
          tension: 100,
          friction: 8,
          useNativeDriver: true,
        }).start();
      });
    }
    
    setTimeout(() => {
      nextQuestion();
    }, 2000);
  };

  const nextQuestion = () => {
    if (currentQuestion < currentQuiz.questions.length - 1) {
      setCurrentQuestion(prev => prev + 1);
      setSelectedAnswer(null);
      setTimeRemaining(30);
      setTimerActive(true);
      
      // Update progress
      const progress = (currentQuestion + 1) / currentQuiz.questions.length;
      Animated.timing(progressAnim, {
        toValue: progress,
        duration: 500,
        useNativeDriver: false,
      }).start();
    } else {
      completeQuiz();
    }
  };

  const handleTimeUp = () => {
    setTimerActive(false);
    Alert.alert('⏰ Time\'s Up!', 'Moving to next question...', [
      { text: 'OK', onPress: nextQuestion }
    ]);
  };

  const completeQuiz = () => {
    setQuizCompleted(true);
    setTimerActive(false);
    
    const percentage = Math.round((score / currentQuiz.questions.length) * 100);
    const passed = percentage >= currentQuiz.passingScore;
    
    const messages = {
      excellent: "🏆 Outstanding! You're a true master!",
      good: "🎉 Great job! You really know your stuff!",
      average: "👍 Good effort! Keep studying to improve!",
      poor: "📚 Don't worry! Review the material and try again!"
    };
    
    let message = messages.poor;
    if (percentage >= 90) message = messages.excellent;
    else if (percentage >= 75) message = messages.good;
    else if (percentage >= 60) message = messages.average;
    
    setTimeout(() => {
      Alert.alert(
        passed ? '🎉 Quiz Completed!' : '📚 Keep Learning!',
        `${message}\n\nScore: ${score}/${currentQuiz.questions.length} (${percentage}%)\n\n+${score * 10} XP earned!`,
        [
          { text: 'Review Answers', onPress: () => {} },
          { text: 'New Quiz', onPress: resetQuiz },
          { text: 'Done', onPress: onClose }
        ]
      );
    }, 1000);
  };

  const renderQuizSetup = () => (
    <ScrollView showsVerticalScrollIndicator={false}>
      <View style={styles.setupContainer}>
        <Text style={styles.setupTitle}>Create Your AI-Generated Quiz</Text>
        <Text style={styles.setupSubtitle}>
          Personalized questions based on {course?.name || 'your course content'}
        </Text>

        {/* Difficulty Selection */}
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>Difficulty Level</Text>
          <View style={styles.optionsGrid}>
            {difficultyLevels.map((level) => (
              <TouchableOpacity
                key={level.id}
                style={[
                  styles.optionCard,
                  difficulty === level.id && styles.optionCardSelected,
                  { borderColor: level.color }
                ]}
                onPress={() => setDifficulty(level.id)}
              >
                <View style={[styles.optionIcon, { backgroundColor: level.color }]}>
                  <Ionicons 
                    name={
                      level.id === 'beginner' ? 'leaf' :
                      level.id === 'intermediate' ? 'flash' : 'flame'
                    } 
                    size={20} 
                    color="#fff" 
                  />
                </View>
                <Text style={[
                  styles.optionName,
                  difficulty === level.id && { color: level.color }
                ]}>
                  {level.name}
                </Text>
                <Text style={styles.optionDescription}>{level.description}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Quiz Type Selection */}
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>Question Type</Text>
          <View style={styles.typeList}>
            {quizTypes.map((type) => (
              <TouchableOpacity
                key={type.id}
                style={[
                  styles.typeCard,
                  quizType === type.id && styles.typeCardSelected
                ]}
                onPress={() => setQuizType(type.id)}
              >
                <Ionicons 
                  name={type.icon} 
                  size={24} 
                  color={quizType === type.id ? '#667eea' : '#666'} 
                />
                <View style={styles.typeInfo}>
                  <Text style={[
                    styles.typeName,
                    quizType === type.id && styles.typeNameSelected
                  ]}>
                    {type.name}
                  </Text>
                  <Text style={styles.typeDescription}>{type.description}</Text>
                </View>
                {quizType === type.id && (
                  <Ionicons name="checkmark-circle" size={20} color="#667eea" />
                )}
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Generate Button */}
        <TouchableOpacity
          style={styles.generateButton}
          onPress={generateQuiz}
          disabled={isGenerating}
        >
          <LinearGradient
            colors={['#667eea', '#764ba2']}
            style={styles.generateButtonGradient}
          >
            {isGenerating ? (
              <>
                <Animated.View style={[styles.generatingIcon, { transform: [{ rotate: '45deg' }] }]}>
                  <Ionicons name="sparkles" size={24} color="#fff" />
                </Animated.View>
                <Text style={styles.generateButtonText}>Generating Quiz...</Text>
              </>
            ) : (
              <>
                <Ionicons name="sparkles" size={24} color="#fff" />
                <Text style={styles.generateButtonText}>Generate AI Quiz</Text>
              </>
            )}
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );

  const renderQuiz = () => {
    const question = currentQuiz.questions[currentQuestion];
    const progress = (currentQuestion + 1) / currentQuiz.questions.length;

    return (
      <View style={styles.quizContainer}>
        {/* Quiz Header */}
        <View style={styles.quizHeader}>
          <View style={styles.progressContainer}>
            <Text style={styles.progressText}>
              Question {currentQuestion + 1} of {currentQuiz.questions.length}
            </Text>
            <View style={styles.progressBar}>
              <Animated.View 
                style={[
                  styles.progressFill,
                  {
                    width: progressAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: ['0%', '100%'],
                    }),
                  }
                ]} 
              />
            </View>
          </View>
          
          <View style={styles.timerContainer}>
            <Ionicons name="time" size={16} color="#667eea" />
            <Text style={[
              styles.timerText,
              timeRemaining <= 10 && styles.timerWarning
            ]}>
              {timeRemaining}s
            </Text>
          </View>
        </View>

        {/* Question */}
        <ScrollView style={styles.questionContainer}>
          <Text style={styles.questionText}>{question.question}</Text>
          
          <View style={styles.optionsContainer}>
            {question.options.map((option, index) => {
              let optionStyle = styles.optionButton;
              let textStyle = styles.optionButtonText;
              
              if (selectedAnswer !== null) {
                if (index === question.correct) {
                  optionStyle = [styles.optionButton, styles.correctOption];
                  textStyle = [styles.optionButtonText, styles.correctOptionText];
                } else if (index === selectedAnswer && selectedAnswer !== question.correct) {
                  optionStyle = [styles.optionButton, styles.incorrectOption];
                  textStyle = [styles.optionButtonText, styles.incorrectOptionText];
                }
              }
              
              return (
                <TouchableOpacity
                  key={index}
                  style={optionStyle}
                  onPress={() => handleAnswer(index)}
                  disabled={selectedAnswer !== null}
                >
                  <View style={styles.optionContent}>
                    <View style={styles.optionLetter}>
                      <Text style={styles.optionLetterText}>
                        {String.fromCharCode(65 + index)}
                      </Text>
                    </View>
                    <Text style={textStyle}>{option}</Text>
                  </View>
                  {selectedAnswer !== null && index === question.correct && (
                    <Ionicons name="checkmark-circle" size={20} color="#4CAF50" />
                  )}
                  {selectedAnswer === index && selectedAnswer !== question.correct && (
                    <Ionicons name="close-circle" size={20} color="#f44336" />
                  )}
                </TouchableOpacity>
              );
            })}
          </View>
          
          {selectedAnswer !== null && (
            <View style={styles.explanationContainer}>
              <Ionicons name="information-circle" size={20} color="#667eea" />
              <Text style={styles.explanationText}>{question.explanation}</Text>
            </View>
          )}
        </ScrollView>

        {/* Score Display */}
        <Animated.View 
          style={[
            styles.scoreContainer,
            { transform: [{ scale: scoreAnim.interpolate({ inputRange: [0, 1], outputRange: [1, 1.2] }) }] }
          ]}
        >
          <Text style={styles.scoreText}>Score: {score}/{currentQuiz.questions.length}</Text>
        </Animated.View>
      </View>
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
                <Text style={styles.headerTitle}>AI Quiz Generator</Text>
                <Text style={styles.headerSubtitle}>
                  {currentQuiz ? currentQuiz.title : 'Smart personalized quizzes'}
                </Text>
              </View>
              
              <View style={styles.aiBadge}>
                <Ionicons name="sparkles" size={20} color="#fff" />
              </View>
            </View>
          </LinearGradient>

          {/* Content */}
          <View style={styles.content}>
            {!currentQuiz && renderQuizSetup()}
            {currentQuiz && !quizCompleted && renderQuiz()}
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
  aiBadge: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  
  // Setup Screen Styles
  setupContainer: {
    flex: 1,
  },
  setupTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
    marginBottom: 8,
  },
  setupSubtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 30,
  },
  sectionContainer: {
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 15,
  },
  optionsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  optionCard: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    borderRadius: 15,
    padding: 20,
    marginHorizontal: 4,
    borderWidth: 2,
    borderColor: '#e9ecef',
  },
  optionCardSelected: {
    backgroundColor: '#f0f8ff',
  },
  optionIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  optionName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  optionDescription: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
  },
  typeList: {
    gap: 12,
  },
  typeCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    borderRadius: 15,
    padding: 16,
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  typeCardSelected: {
    backgroundColor: '#f0f8ff',
    borderColor: '#667eea',
  },
  typeInfo: {
    flex: 1,
    marginLeft: 12,
  },
  typeName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  typeNameSelected: {
    color: '#667eea',
  },
  typeDescription: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  generateButton: {
    marginTop: 20,
    borderRadius: 15,
    overflow: 'hidden',
  },
  generateButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 18,
    paddingHorizontal: 24,
  },
  generatingIcon: {
    marginRight: 12,
  },
  generateButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    marginLeft: 12,
  },
  
  // Quiz Screen Styles
  quizContainer: {
    flex: 1,
  },
  quizHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  progressContainer: {
    flex: 1,
    marginRight: 20,
  },
  progressText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  progressBar: {
    height: 6,
    backgroundColor: '#e9ecef',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#667eea',
    borderRadius: 3,
  },
  timerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0f8ff',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
  },
  timerText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#667eea',
    marginLeft: 4,
  },
  timerWarning: {
    color: '#f44336',
  },
  questionContainer: {
    flex: 1,
  },
  questionText: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333',
    lineHeight: 28,
    marginBottom: 24,
  },
  optionsContainer: {
    gap: 12,
  },
  optionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#f8f9fa',
    borderRadius: 15,
    padding: 16,
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  correctOption: {
    backgroundColor: '#e8f5e8',
    borderColor: '#4CAF50',
  },
  incorrectOption: {
    backgroundColor: '#ffeaea',
    borderColor: '#f44336',
  },
  optionContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  optionLetter: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#667eea',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  optionLetterText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
  },
  optionButtonText: {
    fontSize: 16,
    color: '#333',
    flex: 1,
  },
  correctOptionText: {
    color: '#2e7d32',
  },
  incorrectOptionText: {
    color: '#c62828',
  },
  explanationContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#f0f8ff',
    borderRadius: 12,
    padding: 16,
    marginTop: 20,
  },
  explanationText: {
    fontSize: 14,
    color: '#333',
    lineHeight: 20,
    marginLeft: 8,
    flex: 1,
  },
  scoreContainer: {
    alignItems: 'center',
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: '#e9ecef',
    marginTop: 20,
  },
  scoreText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#667eea',
  },
});

export default AIQuizGenerator;
