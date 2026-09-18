import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  Animated,
  StatusBar,
  Alert,
  Modal,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../components/ThemeProvider';

const { width, height } = Dimensions.get('window');

const QUIZ_CATEGORIES = [
  { id: 'cs', name: 'Computer Science', icon: 'code-slash', color: '#6366F1' },
  { id: 'math', name: 'Mathematics', icon: 'calculator', color: '#10B981' },
  { id: 'eng', name: 'Engineering', icon: 'settings', color: '#F59E0B' },
  { id: 'med', name: 'Medicine', icon: 'medical', color: '#EF4444' },
];

const QUESTIONS = {
  cs: [
    { id: 1, q: 'What is the time complexity of searching in a balanced BST?', options: ['O(n)', 'O(log n)', 'O(n^2)', 'O(1)'], correct: 1 },
    { id: 2, q: 'Which data structure is LIFO?', options: ['Queue', 'Stack', 'Array', 'Linked List'], correct: 1 },
  ],
  math: [
    { id: 1, q: 'What is the value of pi to two decimal places?', options: ['3.12', '3.14', '3.16', '3.18'], correct: 1 },
    { id: 2, q: 'Solve: 5x + 3 = 18', options: ['x=2', 'x=3', 'x=2.5', 'x=4'], correct: 1 },
  ],
  eng: [
    { id: 1, q: 'Which law states V = IR?', options: ["Newton's Law", "Ohm's Law", "Hooke's Law", "Boyle's Law"], correct: 1 },
    { id: 2, q: 'What is the primary alloy in steel?', options: ['Copper', 'Carbon', 'Zinc', 'Aluminum'], correct: 1 },
  ],
  med: [
    { id: 1, q: 'How many chambers are in the human heart?', options: ['2', '3', '4', '5'], correct: 2 },
    { id: 2, q: 'Which vitamin is produced when skin is exposed to sunlight?', options: ['Vit A', 'Vit B', 'Vit C', 'Vit D'], correct: 3 },
  ],
};

export default function QuizScreen({ navigation }) {
  const { isDark } = useTheme();
  const [activeCategory, setActiveCategory] = useState(null);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [score, setScore] = useState(0);
  const [quizFinished, setQuizFinished] = useState(false);
  const [selectedOption, setSelectedOption] = useState(null);
  const [timer, setTimer] = useState(15);
  const [quizStarted, setQuizStarted] = useState(false);
  const [showLeaderboard, setShowLeaderboard] = useState(false);

  const scrollX = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    let interval;
    if (quizStarted && !quizFinished && timer > 0) {
      interval = setInterval(() => {
        setTimer(t => t - 1);
      }, 1000);
    } else if (timer === 0 && quizStarted && !quizFinished) {
      handleNext();
    }
    return () => clearInterval(interval);
  }, [quizStarted, quizFinished, timer]);

  const handleStart = (cat) => {
    setActiveCategory(cat);
    setQuizStarted(true);
    setTimer(15);
  };

  const handleOptionSelect = (idx) => {
    if (selectedOption !== null) return;
    setSelectedOption(idx);
    if (idx === QUESTIONS[activeCategory.id][currentQuestion].correct) {
      setScore(s => s + 1);
    }
  };

  const handleNext = () => {
    const nextQ = currentQuestion + 1;
    if (nextQ < QUESTIONS[activeCategory.id].length) {
      setCurrentQuestion(nextQ);
      setSelectedOption(null);
      setTimer(15);
    } else {
      setQuizFinished(true);
    }
  };

  const resetQuiz = () => {
    setQuizStarted(false);
    setQuizFinished(false);
    setCurrentQuestion(0);
    setScore(0);
    setSelectedOption(null);
    setActiveCategory(null);
  };

  if (activeCategory && quizStarted && !quizFinished) {
    const q = QUESTIONS[activeCategory.id][currentQuestion];
    return (
      <SafeAreaView style={[styles.container, isDark && styles.darkContainer]}>
        <StatusBar barStyle="light-content" />
        <LinearGradient colors={[activeCategory.color, activeCategory.color + 'DD']} style={styles.quizHeader}>
          <View style={styles.quizHeaderRow}>
            <TouchableOpacity onPress={resetQuiz}>
              <Ionicons name="close" size={28} color="#FFFFFF" />
            </TouchableOpacity>
            <Text style={styles.quizHeaderTitle}>{activeCategory.name} Quiz</Text>
            <View style={styles.timerCircle}>
              <Text style={styles.timerText}>{timer}</Text>
            </View>
          </View>
          <View style={styles.progressBg}>
            <View style={[styles.progressFill, { width: `${((currentQuestion + 1) / QUESTIONS[activeCategory.id].length) * 100}%` }]} />
          </View>
        </LinearGradient>

        <View style={styles.questionContainer}>
          <Text style={[styles.qNum, isDark && styles.darkSubText]}>QUESTION {currentQuestion + 1} OF {QUESTIONS[activeCategory.id].length}</Text>
          <Text style={[styles.questionText, isDark && styles.darkText]}>{q.q}</Text>

          <View style={styles.optionsContainer}>
            {q.options.map((opt, i) => {
              const isCorrect = i === q.correct;
              const isSelected = i === selectedOption;
              const bgColor = isSelected ? (isCorrect ? '#10B98120' : '#EF444420') : (isDark ? '#1E293B' : '#F1F5F9');
              const borderColor = isSelected ? (isCorrect ? '#10B981' : '#EF4444') : 'transparent';

              return (
                <TouchableOpacity
                  key={i}
                  style={[styles.optionBtn, { backgroundColor: bgColor, borderColor }, isDark && selectedOption === null && { borderColor: '#334155' }]}
                  onPress={() => handleOptionSelect(i)}
                  activeOpacity={0.8}
                >
                  <View style={[styles.optionIcon, isSelected && { backgroundColor: isCorrect ? '#10B981' : '#EF4444' }]}>
                    <Text style={[styles.optionLetter, isSelected && { color: '#FFF' }]}>{String.fromCharCode(65 + i)}</Text>
                  </View>
                  <Text style={[styles.optionText, isDark && styles.darkText, isSelected && { fontWeight: '800' }]}>{opt}</Text>
                  {isSelected && (
                    <Ionicons name={isCorrect ? 'checkmark-circle' : 'close-circle'} size={24} color={isCorrect ? '#10B981' : '#EF4444'} />
                  )}
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        <View style={styles.quizFooter}>
          <TouchableOpacity style={[styles.nextBtn, selectedOption === null && styles.disabledBtn]} disabled={selectedOption === null} onPress={handleNext}>
            <Text style={styles.nextBtnText}>
              {currentQuestion + 1 === QUESTIONS[activeCategory.id].length ? 'Finish Quiz' : 'Next Question'}
            </Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  if (quizFinished) {
    return (
      <SafeAreaView style={[styles.container, isDark && styles.darkContainer]}>
        <View style={styles.resultContainer}>
          <LinearGradient colors={['#6366F1', '#A855F7']} style={styles.resultCard}>
            <Ionicons name="trophy" size={80} color="#FCD34D" />
            <Text style={styles.resultCongrats}>Great Effort!</Text>
            <View style={styles.scoreCircle}>
              <Text style={styles.scoreText}>{score}/{QUESTIONS[activeCategory.id].length}</Text>
            </View>
            <Text style={styles.resultStats}>You answered {score} questions correctly in {activeCategory.name}.</Text>
            <TouchableOpacity style={styles.closeResultBtn} onPress={resetQuiz}>
              <Text style={styles.closeResultText}>Back to Quizzes</Text>
            </TouchableOpacity>
          </LinearGradient>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, isDark && styles.darkContainer]}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color={isDark ? '#FFF' : '#1E293B'} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, isDark && styles.darkText]}>AI Quizzify</Text>
        <TouchableOpacity style={styles.statsIcon} onPress={() => setShowLeaderboard(true)}>
          <Ionicons name="stats-chart" size={22} color="#6366F1" />
        </TouchableOpacity>
      </View>

      <Modal visible={showLeaderboard} animationType="slide" transparent>
        <SafeAreaView style={[styles.container, isDark && styles.darkContainer, { flex: 1 }]}>
          <View style={styles.header}>
            <TouchableOpacity onPress={() => setShowLeaderboard(false)} style={styles.backBtn}>
              <Ionicons name="close" size={24} color={isDark ? '#FFF' : '#1E293B'} />
            </TouchableOpacity>
            <Text style={[styles.headerTitle, isDark && styles.darkText]}>Global Leaderboard</Text>
            <View style={styles.statsIcon}><Ionicons name="trophy" size={22} color="#F59E0B" /></View>
          </View>
          <ScrollView contentContainerStyle={{ padding: 20 }}>
            {['Alice Johnson', 'Bob Smith', 'Carol Davis', 'David Wilson', 'Emma Brown'].map((name, i) => (
              <View key={i} style={[styles.challengeCard, isDark && styles.darkCard, { marginBottom: 15, borderLeftColor: i === 0 ? '#F59E0B' : (i === 1 ? '#94A3B8' : '#B45309') }]}>
                <Text style={{ fontSize: 24, paddingRight: 15, fontWeight: 'bold' }}>#{i + 1}</Text>
                <View style={styles.challengeInfo}>
                  <Text style={[styles.challengeTitle, isDark && styles.darkText]}>{name}</Text>
                  <Text style={styles.challengeSub}>{1000 - i * 50} UniPoints</Text>
                </View>
              </View>
            ))}
          </ScrollView>
        </SafeAreaView>
      </Modal>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollBody}>
        <View style={[styles.heroCard, isDark && styles.darkCard]}>
          <LinearGradient colors={['#6366F1', '#4F46E5']} style={styles.heroGrad}>
            <View style={styles.heroInfo}>
              <Text style={styles.heroTitle}>Sharpen Your Mind</Text>
              <Text style={styles.heroSub}>Practice with AI-generated quizzes from your course modules.</Text>
            </View>
            <View style={styles.heroIconBox}>
              <Ionicons name="rocket" size={40} color="#FFFFFF" />
            </View>
          </LinearGradient>
        </View>

        <Text style={[styles.sectionTitle, isDark && styles.darkText]}>Pick a Category</Text>
        <View style={styles.categoryGrid}>
          {QUIZ_CATEGORIES.map(cat => (
            <TouchableOpacity
              key={cat.id}
              style={[styles.categoryCard, isDark && styles.darkCard]}
              onPress={() => handleStart(cat)}
            >
              <View style={[styles.catIconBox, { backgroundColor: cat.color + '20' }]}>
                <Ionicons name={cat.icon} size={32} color={cat.color} />
              </View>
              <Text style={[styles.catName, isDark && styles.darkText]}>{cat.name}</Text>
              <Text style={styles.catCount}>12 Quizzes</Text>
              <View style={styles.catFooter}>
                <Ionicons name="people" size={12} color="#94A3B8" />
                <Text style={styles.catAttendees}>2.4k taken</Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>

        <View style={[styles.challengeCard, isDark && styles.darkCard]}>
          <View style={styles.challengeInfo}>
            <Text style={[styles.challengeTitle, isDark && styles.darkText]}>Daily Challenge</Text>
            <Text style={styles.challengeSub}>Complete a random quiz and earn 50 UniPoints!</Text>
          </View>
          <TouchableOpacity style={styles.challengeBtn}>
            <Text style={styles.challengeBtnText}>Start</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  darkContainer: { backgroundColor: '#0F172A' },
  darkCard: { backgroundColor: '#1E293B' },
  darkText: { color: '#FFFFFF' },
  darkSubText: { color: '#94A3B8' },

  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 20 },
  backBtn: { width: 44, height: 44, borderRadius: 15, backgroundColor: '#F1F5F9', justifyContent: 'center', alignItems: 'center', ...(false && { backgroundColor: '#1E293B' }) },
  headerTitle: { fontSize: 20, fontWeight: '900', color: '#1E293B' },
  statsIcon: { width: 44, height: 44, borderRadius: 15, backgroundColor: '#F1F5F9', justifyContent: 'center', alignItems: 'center' },

  scrollBody: { padding: 20 },
  heroCard: { borderRadius: 25, overflow: 'hidden', marginBottom: 25, elevation: 5 },
  heroGrad: { padding: 25, flexDirection: 'row', alignItems: 'center', gap: 20 },
  heroInfo: { flex: 1 },
  heroTitle: { fontSize: 22, fontWeight: '900', color: '#FFFFFF' },
  heroSub: { fontSize: 13, color: 'rgba(255,255,255,0.8)', marginTop: 8, lineHeight: 18 },
  heroIconBox: { width: 70, height: 70, borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.2)', justifyContent: 'center', alignItems: 'center' },

  sectionTitle: { fontSize: 18, fontWeight: '900', color: '#1E293B', marginBottom: 15 },
  categoryGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
  categoryCard: { width: (width - 55) / 2, backgroundColor: '#FFFFFF', padding: 20, borderRadius: 25, elevation: 2, marginBottom: 15 },
  catIconBox: { width: 60, height: 60, borderRadius: 20, justifyContent: 'center', alignItems: 'center', marginBottom: 12 },
  catName: { fontSize: 15, fontWeight: '800', color: '#1E293B', marginBottom: 4 },
  catCount: { fontSize: 11, color: '#94A3B8', fontWeight: '700', marginBottom: 10 },
  catFooter: { flexDirection: 'row', alignItems: 'center', gap: 5, borderTopWidth: 1, borderTopColor: '#F1F5F9', paddingTop: 8 },
  catAttendees: { fontSize: 10, color: '#94A3B8', fontWeight: '600' },

  challengeCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFFFFF', padding: 20, borderRadius: 25, elevation: 2, marginTop: 10, borderLeftWidth: 6, borderLeftColor: '#F59E0B' },
  challengeInfo: { flex: 1 },
  challengeTitle: { fontSize: 16, fontWeight: '800', color: '#1E293B', marginBottom: 4 },
  challengeSub: { fontSize: 12, color: '#64748B' },
  challengeBtn: { backgroundColor: '#F59E0B', paddingHorizontal: 20, paddingVertical: 10, borderRadius: 12 },
  challengeBtnText: { color: '#FFFFFF', fontWeight: '800', fontSize: 14 },

  quizHeader: { padding: 25, paddingBottom: 40, borderBottomLeftRadius: 35, borderBottomRightRadius: 35 },
  quizHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 25 },
  quizHeaderTitle: { fontSize: 18, fontWeight: '900', color: '#FFFFFF' },
  timerCircle: { width: 44, height: 44, borderRadius: 22, backgroundColor: 'rgba(255,255,255,0.2)', justifyContent: 'center', alignItems: 'center', borderWidth: 2, borderColor: '#FFFFFF' },
  timerText: { color: '#FFFFFF', fontWeight: '900', fontSize: 16 },
  progressBg: { height: 6, backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: 3, overflow: 'hidden' },
  progressFill: { height: '100%', backgroundColor: '#FFFFFF' },

  questionContainer: { padding: 25, marginTop: 10 },
  qNum: { fontSize: 12, fontWeight: '800', color: '#94A3B8', marginBottom: 10, letterSpacing: 1 },
  questionText: { fontSize: 20, fontWeight: '800', color: '#1E293B', lineHeight: 28, marginBottom: 30 },
  optionsContainer: { gap: 15 },
  optionBtn: { flexDirection: 'row', alignItems: 'center', padding: 16, borderRadius: 20, borderWidth: 2, borderColor: 'transparent' },
  optionIcon: { width: 36, height: 36, borderRadius: 12, backgroundColor: '#E2E8F0', justifyContent: 'center', alignItems: 'center', marginRight: 15 },
  optionLetter: { fontSize: 16, fontWeight: '900', color: '#64748B' },
  optionText: { flex: 1, fontSize: 15, color: '#475569', fontWeight: '600' },
  quizFooter: { position: 'absolute', bottom: 40, width: width, paddingHorizontal: 25 },
  nextBtn: { backgroundColor: '#6366F1', padding: 18, borderRadius: 20, alignItems: 'center', elevation: 4 },
  disabledBtn: { backgroundColor: '#CBD5E1', elevation: 0 },
  nextBtnText: { color: '#FFFFFF', fontSize: 16, fontWeight: '900' },

  resultContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 30 },
  resultCard: { width: '100%', padding: 40, borderRadius: 40, alignItems: 'center' },
  resultCongrats: { fontSize: 26, fontWeight: '900', color: '#FFFFFF', marginTop: 20, marginBottom: 10 },
  scoreCircle: { width: 120, height: 120, borderRadius: 60, backgroundColor: 'rgba(255,255,255,0.2)', justifyContent: 'center', alignItems: 'center', marginVertical: 25, borderWidth: 4, borderColor: '#FFFFFF' },
  scoreText: { fontSize: 36, fontWeight: '900', color: '#FFFFFF' },
  resultStats: { textAlign: 'center', color: 'rgba(255,255,255,0.85)', fontSize: 15, lineHeight: 22, marginBottom: 35 },
  closeResultBtn: { backgroundColor: '#FFFFFF', paddingHorizontal: 30, paddingVertical: 15, borderRadius: 20 },
  closeResultText: { color: '#6366F1', fontWeight: '900', fontSize: 16 },
});
