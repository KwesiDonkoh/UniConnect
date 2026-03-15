import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  ScrollView,
  Animated,
  Vibration,
  Alert
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

const { width, height } = Dimensions.get('window');

const TRIVIA_QUESTIONS = [
  {
    id: 1,
    category: 'Computer Science',
    question: 'What does CPU stand for?',
    options: ['Central Processing Unit', 'Computer Personal Unit', 'Central Process Utility', 'Common Power Unit'],
    correct: 0,
    points: 10
  },
  {
    id: 2,
    category: 'Mathematics',
    question: 'What is the value of Pi to two decimal places?',
    options: ['3.12', '3.14', '3.16', '3.18'],
    correct: 1,
    points: 10
  },
  {
    id: 3,
    category: 'Physics',
    question: 'Who developed the theory of relativity?',
    options: ['Isaac Newton', 'Nikola Tesla', 'Albert Einstein', 'Stephen Hawking'],
    correct: 2,
    points: 15
  },
  {
    id: 4,
    category: 'Computer Science',
    question: 'Which language is primarily used for React Native?',
    options: ['Python', 'Java', 'JavaScript', 'C++'],
    correct: 2,
    points: 10
  },
  {
    id: 5,
    category: 'General',
    question: 'Which university is known for its "Ivory Tower"?',
    options: ['Oxford', 'Harvard', 'Stanford', 'University of Texas'],
    correct: 3,
    points: 20
  }
];

export default function GameCenter({ visible, onClose, user }) {
  const [gameState, setGameState] = useState('menu'); // menu, playing, results
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(15);
  const [selectedOption, setSelectedOption] = useState(null);
  const [isAnswered, setIsAnswered] = useState(false);

  useEffect(() => {
    let timer;
    if (gameState === 'playing' && timeLeft > 0 && !isAnswered) {
      timer = setInterval(() => {
        setTimeLeft(prev => prev - 1);
      }, 1000);
    } else if (timeLeft === 0 && !isAnswered) {
      handleAnswer(-1); // Timeout
    }
    return () => clearInterval(timer);
  }, [gameState, timeLeft, isAnswered]);

  const startGame = () => {
    setGameState('playing');
    setCurrentQuestion(0);
    setScore(0);
    setTimeLeft(15);
    setSelectedOption(null);
    setIsAnswered(false);
  };

  const handleAnswer = (index) => {
    if (isAnswered) return;
    
    setSelectedOption(index);
    setIsAnswered(true);
    
    const correct = TRIVIA_QUESTIONS[currentQuestion].correct;
    if (index === correct) {
      setScore(prev => prev + TRIVIA_QUESTIONS[currentQuestion].points);
      Vibration.vibrate(50);
    } else {
      Vibration.vibrate([0, 50, 50, 50]);
    }

    setTimeout(() => {
      if (currentQuestion < TRIVIA_QUESTIONS.length - 1) {
        setCurrentQuestion(prev => prev + 1);
        setTimeLeft(15);
        setSelectedOption(null);
        setIsAnswered(false);
      } else {
        setGameState('results');
      }
    }, 1500);
  };

  const renderMenu = () => (
    <View style={styles.menuContainer}>
      <LinearGradient colors={['#4F46E5', '#7C3AED']} style={styles.heroCard}>
        <Ionicons name="game-controller" size={60} color="#FFFFFF" />
        <Text style={styles.heroTitle}>Academic Arena</Text>
        <Text style={styles.heroSubtitle}>Challenge your knowledge and earn XP!</Text>
      </LinearGradient>

      <View style={styles.gameOptions}>
        <TouchableOpacity style={styles.playButton} onPress={startGame}>
          <LinearGradient colors={['#10B981', '#059669']} style={styles.playGradient}>
            <Ionicons name="play" size={24} color="#FFFFFF" />
            <Text style={styles.playText}>Start Trivia Challenge</Text>
          </LinearGradient>
        </TouchableOpacity>

        <TouchableOpacity style={styles.secondaryButton}>
          <Ionicons name="trophy-outline" size={20} color="#6366F1" />
          <Text style={styles.secondaryButtonText}>Leaderboard</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.secondaryButton}>
          <Ionicons name="medal-outline" size={20} color="#6366F1" />
          <Text style={styles.secondaryButtonText}>Achievements</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderPlaying = () => {
    const question = TRIVIA_QUESTIONS[currentQuestion];
    return (
      <View style={styles.playingContainer}>
        <View style={styles.gameHeader}>
          <View style={styles.progressHeader}>
            <Text style={styles.questionCount}>Question {currentQuestion + 1}/{TRIVIA_QUESTIONS.length}</Text>
            <View style={styles.timerContainer}>
              <Ionicons name="timer-outline" size={20} color={timeLeft < 5 ? '#EF4444' : '#6366F1'} />
              <Text style={[styles.timerText, timeLeft < 5 && { color: '#EF4444' }]}>{timeLeft}s</Text>
            </View>
          </View>
          <View style={styles.progressBar}>
            <View style={[styles.progressFill, { width: `${((currentQuestion + 1) / TRIVIA_QUESTIONS.length) * 100}%` }]} />
          </View>
        </View>

        <View style={styles.questionCard}>
          <Text style={styles.categoryBadge}>{question.category}</Text>
          <Text style={styles.questionText}>{question.question}</Text>
        </View>

        <View style={styles.optionsGrid}>
          {question.options.map((option, index) => {
            let optionStyle = styles.optionButton;
            if (isAnswered) {
              if (index === question.correct) optionStyle = [styles.optionButton, styles.correctOption];
              else if (index === selectedOption) optionStyle = [styles.optionButton, styles.wrongOption];
            }

            return (
              <TouchableOpacity
                key={index}
                style={optionStyle}
                onPress={() => handleAnswer(index)}
                disabled={isAnswered}
              >
                <Text style={[styles.optionText, isAnswered && (index === question.correct || index === selectedOption) && { color: '#FFFFFF' }]}>
                  {option}
                </Text>
                {isAnswered && index === question.correct && <Ionicons name="checkmark-circle" size={20} color="#FFFFFF" />}
                {isAnswered && index === selectedOption && index !== question.correct && <Ionicons name="close-circle" size={20} color="#FFFFFF" />}
              </TouchableOpacity>
            );
          })}
        </View>
      </View>
    );
  };

  const renderResults = () => (
    <View style={styles.resultsContainer}>
      <View style={styles.resultsCard}>
        <Ionicons name="trophy" size={80} color="#F59E0B" />
        <Text style={styles.resultsTitle}>Challenge Complete!</Text>
        <Text style={styles.resultsScore}>{score} XP</Text>
        <Text style={styles.resultsText}>Great job! You answered {TRIVIA_QUESTIONS.length} questions.</Text>
        
        <TouchableOpacity style={styles.playAgainButton} onPress={startGame}>
          <Text style={styles.playAgainText}>Play Again</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.backToMenuButton} onPress={() => setGameState('menu')}>
          <Text style={styles.backToMenuText}>Back to Menu</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <Modal visible={visible} transparent={true} animationType="slide" onRequestClose={onClose}>
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.header}>
            <Text style={styles.headerTitle}>Game Center</Text>
            <TouchableOpacity style={styles.closeButton} onPress={onClose}>
              <Ionicons name="close" size={24} color="#64748B" />
            </TouchableOpacity>
          </View>
          
          <ScrollView showsVerticalScrollIndicator={false}>
            {gameState === 'menu' && renderMenu()}
            {gameState === 'playing' && renderPlaying()}
            {gameState === 'results' && renderResults()}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "flex-end"
  },
  modalContent: {
    backgroundColor: "#F8FAFC",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    height: height * 0.9,
    padding: 20
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "700",
    color: "#1E293B"
  },
  closeButton: {
    padding: 8,
    backgroundColor: '#F1F5F9',
    borderRadius: 20
  },
  menuContainer: {
    flex: 1
  },
  heroCard: {
    padding: 30,
    borderRadius: 20,
    alignItems: 'center',
    marginBottom: 25
  },
  heroTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginTop: 15
  },
  heroSubtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'center',
    marginTop: 10
  },
  gameOptions: {
    gap: 15
  },
  playButton: {
    borderRadius: 15,
    overflow: 'hidden',
    elevation: 4
  },
  playGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 18,
    gap: 10
  },
  playText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold'
  },
  secondaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 18,
    backgroundColor: '#FFFFFF',
    borderRadius: 15,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    gap: 10
  },
  secondaryButtonText: {
    color: '#1E293B',
    fontSize: 16,
    fontWeight: '600'
  },
  playingContainer: {
    flex: 1
  },
  gameHeader: {
    marginBottom: 25
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10
  },
  questionCount: {
    fontSize: 16,
    color: '#64748B',
    fontWeight: '600'
  },
  timerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15
  },
  timerText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#6366F1'
  },
  progressBar: {
    height: 8,
    backgroundColor: '#E2E8F0',
    borderRadius: 4,
    overflow: 'hidden'
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#6366F1'
  },
  questionCard: {
    backgroundColor: '#FFFFFF',
    padding: 25,
    borderRadius: 20,
    marginBottom: 25,
    elevation: 2
  },
  categoryBadge: {
    alignSelf: 'flex-start',
    backgroundColor: '#EEF2FF',
    color: '#4F46E5',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    fontSize: 12,
    fontWeight: 'bold',
    marginBottom: 15,
    textTransform: 'uppercase'
  },
  questionText: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1E293B',
    lineHeight: 28
  },
  optionsGrid: {
    gap: 12
  },
  optionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    padding: 18,
    borderRadius: 15,
    borderWidth: 1,
    borderColor: '#E2E8F0'
  },
  correctOption: {
    backgroundColor: '#10B981',
    borderColor: '#059669'
  },
  wrongOption: {
    backgroundColor: '#EF4444',
    borderColor: '#DC2626'
  },
  optionText: {
    fontSize: 16,
    color: '#1E293B',
    fontWeight: '500'
  },
  resultsContainer: {
    flex: 1,
    paddingVertical: 40
  },
  resultsCard: {
    backgroundColor: '#FFFFFF',
    padding: 40,
    borderRadius: 25,
    alignItems: 'center',
    elevation: 4
  },
  resultsTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1E293B',
    marginTop: 20
  },
  resultsScore: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#6366F1',
    marginVertical: 15
  },
  resultsText: {
    fontSize: 16,
    color: '#64748B',
    textAlign: 'center',
    marginBottom: 30
  },
  playAgainButton: {
    backgroundColor: '#6366F1',
    paddingHorizontal: 40,
    paddingVertical: 15,
    borderRadius: 25,
    marginBottom: 15,
    width: '100%',
    alignItems: 'center'
  },
  playAgainText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold'
  },
  backToMenuButton: {
    paddingVertical: 15,
    width: '100%',
    alignItems: 'center'
  },
  backToMenuText: {
    color: '#64748B',
    fontSize: 16,
    fontWeight: '600'
  }
});
