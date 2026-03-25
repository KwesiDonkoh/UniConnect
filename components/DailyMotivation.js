import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
  Dimensions,
  TextInput,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

const { width } = Dimensions.get('window');

const DailyMotivation = ({ visible, onClose, isDark }) => {
  const [goals, setGoals] = useState([
    { id: 1, text: 'Complete Math Assignment', completed: false },
    { id: 2, text: 'Read Chapter 4 of AI', completed: true },
  ]);
  const [newGoal, setNewGoal] = useState('');

  const quotes = [
    "The only way to do great work is to love what you do. – Steve Jobs",
    "Believe you can and you're halfway there. – Theodore Roosevelt",
    "Success is not final, failure is not fatal: it is the courage to continue that counts. – Winston Churchill",
    "It always seems impossible until it's done. – Nelson Mandela",
    "Your education is a dress rehearsal for a life that is yours to lead. – Nora Ephron"
  ];

  const randomQuote = quotes[Math.floor(Math.random() * quotes.length)];

  const addGoal = () => {
    if (newGoal.trim()) {
      setGoals([...goals, { id: Date.now(), text: newGoal, completed: false }]);
      setNewGoal('');
    }
  };

  const toggleGoal = (id) => {
    setGoals(goals.map(g => g.id === id ? { ...g, completed: !g.completed } : g));
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={[styles.container, isDark && styles.darkContainer]}>
          <View style={styles.header}>
            <Text style={[styles.title, isDark && styles.darkText]}>Daily Inspiration</Text>
            <TouchableOpacity onPress={onClose}>
              <Ionicons name="close-circle" size={28} color={isDark ? '#94A3B8' : '#64748B'} />
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false}>
            <LinearGradient colors={['#FDF2F8', '#FCE7F3']} style={styles.quoteCard}>
               <Ionicons name="chatbox-ellipses" size={32} color="#EC4899" style={styles.quoteIcon} />
               <Text style={styles.quoteText}>{randomQuote}</Text>
            </LinearGradient>

            <View style={styles.section}>
              <Text style={[styles.sectionTitle, isDark && styles.darkText]}>My Daily Goals</Text>
              
              <View style={styles.inputRow}>
                <TextInput
                  style={[styles.input, isDark && styles.darkInput]}
                  placeholder="What's your focus today?"
                  placeholderTextColor={isDark ? '#94A3B8' : '#64748B'}
                  value={newGoal}
                  onChangeText={setNewGoal}
                />
                <TouchableOpacity style={styles.addBtn} onPress={addGoal}>
                  <Ionicons name="add" size={24} color="#FFFFFF" />
                </TouchableOpacity>
              </View>

              {goals.map((goal) => (
                <TouchableOpacity 
                  key={goal.id} 
                  style={[styles.goalItem, isDark && styles.darkCard, goal.completed && styles.goalCompleted]}
                  onPress={() => toggleGoal(goal.id)}
                >
                  <Ionicons 
                    name={goal.completed ? "checkmark-circle" : "ellipse-outline"} 
                    size={24} 
                    color={goal.completed ? "#10B981" : "#6366F1"} 
                  />
                  <Text style={[styles.goalText, isDark && styles.darkText, goal.completed && styles.goalTextCompleted]}>
                     {goal.text}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <View style={styles.rewardCard}>
               <Ionicons name="trophy" size={28} color="#FCD34D" />
               <View style={styles.rewardInfo}>
                  <Text style={styles.rewardTitle}>Achieve your goals!</Text>
                  <Text style={styles.rewardSub}>Completing daily goals increases your productivity rank.</Text>
               </View>
            </View>
          </ScrollView>

          <TouchableOpacity style={styles.closeBtn} onPress={onClose}>
            <Text style={styles.closeText}>Back to Dashboard</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  container: {
    height: '85%',
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    padding: 24,
  },
  darkContainer: {
    backgroundColor: '#0F172A',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
    color: '#1E293B',
  },
  quoteCard: {
    padding: 24,
    borderRadius: 24,
    marginBottom: 32,
    position: 'relative',
  },
  quoteIcon: {
    position: 'absolute',
    top: 10,
    left: 10,
    opacity: 0.1,
  },
  quoteText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#BE185D',
    fontStyle: 'italic',
    textAlign: 'center',
    lineHeight: 26,
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 16,
  },
  inputRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 20,
  },
  input: {
    flex: 1,
    backgroundColor: '#F1F5F9',
    padding: 12,
    borderRadius: 12,
    fontSize: 14,
    color: '#1E293B',
  },
  darkInput: {
    backgroundColor: '#1E293B',
    color: '#FFFFFF',
  },
  addBtn: {
    backgroundColor: '#6366F1',
    width: 48,
    height: 48,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  goalItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    padding: 16,
    borderRadius: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    gap: 12,
  },
  goalCompleted: {
    borderColor: '#10B981',
    backgroundColor: '#F0FDF4',
  },
  darkCard: {
    backgroundColor: '#1E293B',
    borderColor: '#334155',
  },
  goalText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1E293B',
  },
  goalTextCompleted: {
    textDecorationLine: 'line-through',
    color: '#64748B',
  },
  rewardCard: {
    flexDirection: 'row',
    backgroundColor: '#FFFBEB',
    padding: 16,
    borderRadius: 16,
    alignItems: 'center',
    gap: 16,
    marginBottom: 32,
  },
  rewardInfo: {
    flex: 1,
  },
  rewardTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#92400E',
  },
  rewardSub: {
    fontSize: 12,
    color: '#B45309',
  },
  closeBtn: {
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 20,
  },
  closeText: {
    color: '#6366F1',
    fontWeight: '700',
    fontSize: 16,
  },
  darkText: {
    color: '#F8FAFC',
  },
});

export default DailyMotivation;
