import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  Animated,
  Alert,
  Vibration,
  Dimensions,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

const { width } = Dimensions.get('window');

// Pomodoro Timer Component
export const PomodoroTimer = ({ visible, onClose }) => {
  const [timeLeft, setTimeLeft] = useState(25 * 60); // 25 minutes
  const [isRunning, setIsRunning] = useState(false);
  const [isBreak, setIsBreak] = useState(false);
  const [sessions, setSessions] = useState(0);
  
  const progressAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    let interval = null;
    if (isRunning && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft(time => time - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      handleTimerComplete();
    }
    return () => clearInterval(interval);
  }, [isRunning, timeLeft]);

  useEffect(() => {
    const totalTime = isBreak ? 5 * 60 : 25 * 60;
    const progress = 1 - (timeLeft / totalTime);
    
    Animated.timing(progressAnim, {
      toValue: progress,
      duration: 500,
      useNativeDriver: false,
    }).start();
  }, [timeLeft, isBreak]);

  const handleTimerComplete = () => {
    setIsRunning(false);
    Vibration.vibrate([500, 500, 500]);
    
    if (isBreak) {
      Alert.alert('Break Complete!', 'Ready to focus again?', [
        { text: 'Start Session', onPress: startNewSession }
      ]);
    } else {
      setSessions(prev => prev + 1);
      Alert.alert('Session Complete!', 'Great work! Time for a break.', [
        { text: 'Start Break', onPress: startBreak }
      ]);
    }
  };

  const startNewSession = () => {
    setTimeLeft(25 * 60);
    setIsBreak(false);
    setIsRunning(true);
  };

  const startBreak = () => {
    setTimeLeft(5 * 60);
    setIsBreak(true);
    setIsRunning(true);
  };

  const toggleTimer = () => {
    setIsRunning(!isRunning);
    
    if (!isRunning) {
      Animated.sequence([
        Animated.timing(scaleAnim, {
          toValue: 1.1,
          duration: 100,
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 1,
          duration: 100,
          useNativeDriver: true,
        }),
      ]).start();
    }
  };

  const resetTimer = () => {
    setIsRunning(false);
    setTimeLeft(isBreak ? 5 * 60 : 25 * 60);
    progressAnim.setValue(0);
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <Modal visible={visible} transparent animationType="slide">
      <View style={styles.modalOverlay}>
        <View style={styles.pomodoroContainer}>
          <LinearGradient
            colors={isBreak ? ['#10B981', '#059669'] : ['#6366F1', '#8B5CF6']}
            style={styles.pomodoroCard}
          >
            <TouchableOpacity style={styles.closeButton} onPress={onClose}>
              <Ionicons name="close" size={24} color="#FFFFFF" />
            </TouchableOpacity>

            <Text style={styles.pomodoroTitle}>
              {isBreak ? '☕ Break Time' : '🍅 Focus Time'}
            </Text>

            <View style={styles.timerContainer}>
              <Animated.View style={[
                styles.timerCircle,
                { transform: [{ scale: scaleAnim }] }
              ]}>
                <View style={styles.progressRing}>
                  <Animated.View
                    style={[
                      styles.progressFill,
                      {
                        height: progressAnim.interpolate({
                          inputRange: [0, 1],
                          outputRange: ['0%', '100%'],
                        }),
                      },
                    ]}
                  />
                </View>
                <Text style={styles.timerText}>{formatTime(timeLeft)}</Text>
              </Animated.View>
            </View>

            <View style={styles.timerControls}>
              <TouchableOpacity
                style={styles.controlButton}
                onPress={toggleTimer}
              >
                <Ionicons 
                  name={isRunning ? 'pause' : 'play'} 
                  size={24} 
                  color="#FFFFFF" 
                />
              </TouchableOpacity>
              
              <TouchableOpacity
                style={styles.controlButton}
                onPress={resetTimer}
              >
                <Ionicons name="refresh" size={24} color="#FFFFFF" />
              </TouchableOpacity>
            </View>

            <View style={styles.sessionCounter}>
              <Text style={styles.sessionText}>Sessions Completed: {sessions}</Text>
            </View>
          </LinearGradient>
        </View>
      </View>
    </Modal>
  );
};

// Quick Notes Component
export const QuickNotes = ({ visible, onClose }) => {
  const [notes, setNotes] = useState([
    { id: 1, title: 'Study Plan', content: 'Complete algorithms assignment by Friday', color: '#6366F1' },
    { id: 2, title: 'Meeting', content: 'Group project discussion at 3 PM', color: '#10B981' },
  ]);
  const [selectedNote, setSelectedNote] = useState(null);

  const createNewNote = () => {
    const newNote = {
      id: Date.now(),
      title: 'New Note',
      content: '',
      color: '#F59E0B',
    };
    setNotes([newNote, ...notes]);
    setSelectedNote(newNote);
  };

  return (
    <Modal visible={visible} transparent animationType="slide">
      <View style={styles.modalOverlay}>
        <View style={styles.notesContainer}>
          <View style={styles.notesHeader}>
            <Text style={styles.notesTitle}>📝 Quick Notes</Text>
            <View style={styles.notesActions}>
              <TouchableOpacity onPress={createNewNote} style={styles.addButton}>
                <Ionicons name="add" size={20} color="#FFFFFF" />
              </TouchableOpacity>
              <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                <Ionicons name="close" size={20} color="#64748B" />
              </TouchableOpacity>
            </View>
          </View>

          <ScrollView style={styles.notesList}>
            {notes.map((note) => (
              <TouchableOpacity
                key={note.id}
                style={[styles.noteCard, { borderLeftColor: note.color }]}
                onPress={() => setSelectedNote(note)}
              >
                <Text style={styles.noteTitle}>{note.title}</Text>
                <Text style={styles.notePreview} numberOfLines={2}>
                  {note.content || 'Tap to add content...'}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

// Study Groups Component
export const StudyGroups = ({ visible, onClose }) => {
  const [groups] = useState([
    {
      id: 1,
      name: 'Data Structures Study Group',
      members: 8,
      subject: 'CSC 207',
      nextSession: 'Today 6:00 PM',
      color: '#6366F1',
    },
    {
      id: 2,
      name: 'Algorithms Practice',
      members: 12,
      subject: 'CSC 301',
      nextSession: 'Tomorrow 4:00 PM',
      color: '#10B981',
    },
    {
      id: 3,
      name: 'Database Design Workshop',
      members: 6,
      subject: 'CSC 343',
      nextSession: 'Friday 2:00 PM',
      color: '#F59E0B',
    },
  ]);

  return (
    <Modal visible={visible} transparent animationType="slide">
      <View style={styles.modalOverlay}>
        <View style={styles.groupsContainer}>
          <View style={styles.groupsHeader}>
            <Text style={styles.groupsTitle}>👥 Study Groups</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Ionicons name="close" size={20} color="#64748B" />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.groupsList}>
            {groups.map((group) => (
              <TouchableOpacity
                key={group.id}
                style={styles.groupCard}
                onPress={() => Alert.alert('Join Group', `Join ${group.name}?`, [
                  { text: 'Cancel', style: 'cancel' },
                  { text: 'Join', onPress: () => Vibration.vibrate(50) }
                ])}
              >
                <LinearGradient
                  colors={[group.color, `${group.color}CC`]}
                  style={styles.groupGradient}
                >
                  <View style={styles.groupInfo}>
                    <Text style={styles.groupName}>{group.name}</Text>
                    <Text style={styles.groupSubject}>{group.subject}</Text>
                    <Text style={styles.groupSession}>{group.nextSession}</Text>
                  </View>
                  <View style={styles.groupStats}>
                    <View style={styles.memberCount}>
                      <Ionicons name="people" size={16} color="#FFFFFF" />
                      <Text style={styles.memberText}>{group.members}</Text>
                    </View>
                  </View>
                </LinearGradient>
              </TouchableOpacity>
            ))}

            <TouchableOpacity
              style={styles.createGroupCard}
              onPress={() => Alert.alert('Create Group', 'Create a new study group?')}
            >
              <Ionicons name="add-circle" size={32} color="#6366F1" />
              <Text style={styles.createGroupText}>Create New Group</Text>
            </TouchableOpacity>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },

  // Pomodoro Styles
  pomodoroContainer: {
    width: width * 0.9,
    maxWidth: 350,
  },
  pomodoroCard: {
    borderRadius: 24,
    padding: 32,
    alignItems: 'center',
  },
  pomodoroTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 32,
  },
  timerContainer: {
    marginBottom: 32,
  },
  timerCircle: {
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  progressRing: {
    position: 'absolute',
    width: 200,
    height: 200,
    borderRadius: 100,
    overflow: 'hidden',
  },
  progressFill: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
  },
  timerText: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  timerControls: {
    flexDirection: 'row',
    gap: 20,
    marginBottom: 20,
  },
  controlButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  sessionCounter: {
    alignItems: 'center',
  },
  sessionText: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  closeButton: {
    position: 'absolute',
    top: 16,
    right: 16,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },

  // Notes Styles
  notesContainer: {
    width: width * 0.9,
    maxWidth: 400,
    maxHeight: '80%',
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
  },
  notesHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  notesTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1E293B',
  },
  notesActions: {
    flexDirection: 'row',
    gap: 8,
  },
  addButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#6366F1',
    justifyContent: 'center',
    alignItems: 'center',
  },
  notesList: {
    padding: 16,
  },
  noteCard: {
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderLeftWidth: 4,
  },
  noteTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1E293B',
    marginBottom: 4,
  },
  notePreview: {
    fontSize: 14,
    color: '#64748B',
  },

  // Groups Styles
  groupsContainer: {
    width: width * 0.9,
    maxWidth: 400,
    maxHeight: '80%',
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
  },
  groupsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  groupsTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1E293B',
  },
  groupsList: {
    padding: 16,
  },
  groupCard: {
    borderRadius: 16,
    marginBottom: 12,
    overflow: 'hidden',
  },
  groupGradient: {
    padding: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  groupInfo: {
    flex: 1,
  },
  groupName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  groupSubject: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
    marginBottom: 4,
  },
  groupSession: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  groupStats: {
    alignItems: 'flex-end',
  },
  memberCount: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  memberText: {
    fontSize: 12,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  createGroupCard: {
    backgroundColor: '#F8FAFC',
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#E2E8F0',
    borderStyle: 'dashed',
  },
  createGroupText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#6366F1',
    marginTop: 8,
  },
});
