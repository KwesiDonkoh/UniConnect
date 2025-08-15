import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  Dimensions,
  FlatList,
  Alert,
  Animated,
  ActivityIndicator,
  Modal,
  TextInput,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useApp } from '../context/AppContext';

const { width, height } = Dimensions.get('window');

export default function WeekendStudyScreen({ navigation }) {
  const { user, csModules } = useApp();
  const [selectedTab, setSelectedTab] = useState('study_groups');
  const [studyGroups, setStudyGroups] = useState([]);
  const [studySessions, setStudySessions] = useState([]);
  const [pomodoroSessions, setPomodoroSessions] = useState([]);
  const [goals, setGoals] = useState([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [createType, setCreateType] = useState('group');
  const [isLoading, setIsLoading] = useState(false);

  // Form states
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    course: '',
    timeSlot: '',
    duration: '2',
    maxParticipants: '8',
    location: 'Online',
    type: 'study_group'
  });

  // Pomodoro states
  const [pomodoroTimer, setPomodoroTimer] = useState(25 * 60); // 25 minutes
  const [isRunning, setIsRunning] = useState(false);
  const [currentSession, setCurrentSession] = useState('focus'); // focus, short_break, long_break
  const [completedPomodoros, setCompletedPomodoros] = useState(0);

  // Animation refs
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;

  useEffect(() => {
    if (user?.uid) {
      loadWeekendData();
      startAnimations();
    }
  }, [user?.uid]);

  useEffect(() => {
    let interval;
    if (isRunning && pomodoroTimer > 0) {
      interval = setInterval(() => {
        setPomodoroTimer(timer => timer - 1);
      }, 1000);
    } else if (pomodoroTimer === 0) {
      handlePomodoroComplete();
    }

    return () => clearInterval(interval);
  }, [isRunning, pomodoroTimer]);

  const startAnimations = () => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 600,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const loadWeekendData = async () => {
    try {
      setIsLoading(true);

      // Mock study groups data
      const mockStudyGroups = [
        {
          id: 'sg1',
          title: 'Object-Oriented Programming Study Group',
          course: 'CSM281',
          courseName: 'Object Oriented Programming with JAVA',
          description: 'Weekend intensive review of OOP concepts, design patterns, and Java frameworks.',
          timeSlot: 'Saturday 10:00 AM - 12:00 PM',
          maxParticipants: 8,
          currentParticipants: 5,
          participants: [
            { id: '1', name: 'Alice Johnson', avatar: '👩‍💻' },
            { id: '2', name: 'Bob Smith', avatar: '👨‍💻' },
            { id: '3', name: 'Carol Wilson', avatar: '👩‍🎓' },
            { id: '4', name: 'David Brown', avatar: '👨‍🎓' },
            { id: '5', name: 'Emma Davis', avatar: '👩‍💼' }
          ],
          location: 'Online (Zoom)',
          organizer: 'Alice Johnson',
          tags: ['Java', 'OOP', 'Design Patterns'],
          difficulty: 'Intermediate',
          createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
          isJoined: true
        },
        {
          id: 'sg2',
          title: 'Data Structures & Algorithms Marathon',
          course: 'CSM271',
          courseName: 'Data Structures and Algorithms',
          description: 'Intensive weekend session covering advanced data structures, algorithm optimization, and problem-solving techniques.',
          timeSlot: 'Sunday 2:00 PM - 6:00 PM',
          maxParticipants: 10,
          currentParticipants: 7,
          participants: [
            { id: '6', name: 'Frank Miller', avatar: '👨‍🔬' },
            { id: '7', name: 'Grace Lee', avatar: '👩‍🔬' },
            { id: '8', name: 'Henry Chen', avatar: '👨‍💻' }
          ],
          location: 'Library Study Room 3',
          organizer: 'Frank Miller',
          tags: ['Algorithms', 'Data Structures', 'Problem Solving'],
          difficulty: 'Advanced',
          createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
          isJoined: false
        },
        {
          id: 'sg3',
          title: 'Database Design Workshop',
          course: 'CSM361',
          courseName: 'Database Management Systems',
          description: 'Hands-on workshop for database design, SQL optimization, and NoSQL concepts.',
          timeSlot: 'Saturday 2:00 PM - 5:00 PM',
          maxParticipants: 6,
          currentParticipants: 4,
          participants: [
            { id: '9', name: 'Ivy Rodriguez', avatar: '👩‍💻' },
            { id: '10', name: 'Jack Thompson', avatar: '👨‍💻' }
          ],
          location: 'Computer Lab B',
          organizer: 'Ivy Rodriguez',
          tags: ['Database', 'SQL', 'NoSQL'],
          difficulty: 'Intermediate',
          createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
          isJoined: false
        }
      ];

      // Mock study sessions
      const mockStudySessions = [
        {
          id: 'ss1',
          title: 'Advanced Java Programming Deep Dive',
          type: 'intensive_session',
          course: 'CSM281',
          description: 'Deep dive into advanced Java concepts including concurrency, JVM internals, and performance optimization.',
          duration: '4 hours',
          timeSlot: 'Saturday 9:00 AM - 1:00 PM',
          instructor: 'Dr. Sarah Chen',
          materials: ['Lecture slides', 'Code examples', 'Practice problems'],
          prerequisites: ['Basic Java knowledge', 'OOP concepts'],
          difficulty: 'Advanced',
          registeredCount: 15,
          maxCapacity: 20,
          isRegistered: true,
          location: 'Auditorium A'
        },
        {
          id: 'ss2',
          title: 'Algorithm Problem Solving Bootcamp',
          type: 'bootcamp',
          course: 'CSM271',
          description: 'Intensive problem-solving session with focus on competitive programming and technical interviews.',
          duration: '6 hours',
          timeSlot: 'Sunday 10:00 AM - 4:00 PM',
          instructor: 'Prof. Michael Roberts',
          materials: ['Problem sets', 'Solution guides', 'Online judge access'],
          prerequisites: ['Data structures knowledge', 'Basic algorithms'],
          difficulty: 'Expert',
          registeredCount: 12,
          maxCapacity: 15,
          isRegistered: false,
          location: 'Computer Lab A'
        }
      ];

      // Mock goals
      const mockGoals = [
        {
          id: 'g1',
          title: 'Complete Java OOP Chapter',
          description: 'Finish reading and practicing exercises from Chapter 8-12',
          course: 'CSM281',
          targetDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
          progress: 75,
          priority: 'high',
          status: 'in_progress',
          tasks: [
            { id: 't1', title: 'Read Chapter 8', completed: true },
            { id: 't2', title: 'Complete Chapter 8 exercises', completed: true },
            { id: 't3', title: 'Read Chapter 9', completed: true },
            { id: 't4', title: 'Complete Chapter 9 exercises', completed: false },
            { id: 't5', title: 'Read Chapter 10-12', completed: false }
          ]
        },
        {
          id: 'g2',
          title: 'Master Binary Trees',
          description: 'Understand and implement various binary tree algorithms',
          course: 'CSM271',
          targetDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
          progress: 30,
          priority: 'medium',
          status: 'in_progress',
          tasks: [
            { id: 't6', title: 'Study tree traversal methods', completed: true },
            { id: 't7', title: 'Implement BST operations', completed: false },
            { id: 't8', title: 'Practice tree problems', completed: false },
            { id: 't9', title: 'Learn AVL trees', completed: false }
          ]
        }
      ];

      setStudyGroups(mockStudyGroups);
      setStudySessions(mockStudySessions);
      setGoals(mockGoals);

    } catch (error) {
      console.error('Error loading weekend data:', error);
      Alert.alert('Error', 'Failed to load weekend study data');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePomodoroComplete = () => {
    setIsRunning(false);
    
    if (currentSession === 'focus') {
      setCompletedPomodoros(prev => prev + 1);
      const isLongBreak = (completedPomodoros + 1) % 4 === 0;
      setCurrentSession(isLongBreak ? 'long_break' : 'short_break');
      setPomodoroTimer(isLongBreak ? 15 * 60 : 5 * 60); // 15 min or 5 min break
      Alert.alert('Focus Session Complete! 🎉', `Time for a ${isLongBreak ? 'long' : 'short'} break!`);
    } else {
      setCurrentSession('focus');
      setPomodoroTimer(25 * 60); // Back to 25 min focus
      Alert.alert('Break Over! 💪', 'Ready for another focus session?');
    }
  };

  const togglePomodoro = () => {
    setIsRunning(!isRunning);
  };

  const resetPomodoro = () => {
    setIsRunning(false);
    setCurrentSession('focus');
    setPomodoroTimer(25 * 60);
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const createItem = async () => {
    if (!formData.title.trim()) {
      Alert.alert('Error', 'Please enter a title');
      return;
    }

    try {
      setIsLoading(true);
      
      // Simulate creation
      await new Promise(resolve => setTimeout(resolve, 1500));

      if (createType === 'group') {
        const newGroup = {
          id: `sg_${Date.now()}`,
          title: formData.title,
          description: formData.description,
          course: formData.course,
          timeSlot: `${formData.timeSlot} (${formData.duration} hours)`,
          maxParticipants: parseInt(formData.maxParticipants),
          currentParticipants: 1,
          participants: [{ id: user?.uid, name: user?.name || 'You', avatar: '👤' }],
          location: formData.location,
          organizer: user?.name || 'You',
          tags: formData.course ? [formData.course] : [],
          difficulty: 'Beginner',
          createdAt: new Date(),
          isJoined: true
        };
        setStudyGroups(prev => [newGroup, ...prev]);
      } else if (createType === 'goal') {
        const newGoal = {
          id: `g_${Date.now()}`,
          title: formData.title,
          description: formData.description,
          course: formData.course,
          targetDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
          progress: 0,
          priority: 'medium',
          status: 'in_progress',
          tasks: []
        };
        setGoals(prev => [newGoal, ...prev]);
      }

      setShowCreateModal(false);
      setFormData({
        title: '',
        description: '',
        course: '',
        timeSlot: '',
        duration: '2',
        maxParticipants: '8',
        location: 'Online',
        type: 'study_group'
      });

      Alert.alert('Success! 🎉', `${createType === 'group' ? 'Study group' : 'Goal'} created successfully!`);

    } catch (error) {
      Alert.alert('Error', 'Failed to create item. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const joinStudyGroup = async (groupId) => {
    try {
      setStudyGroups(prev => prev.map(group => 
        group.id === groupId 
          ? { 
              ...group, 
              isJoined: true,
              currentParticipants: group.currentParticipants + 1,
              participants: [...group.participants, { id: user?.uid, name: user?.name || 'You', avatar: '👤' }]
            }
          : group
      ));
      Alert.alert('Joined! 🎉', 'You have successfully joined the study group!');
    } catch (error) {
      Alert.alert('Error', 'Failed to join study group');
    }
  };

  const renderStudyGroup = ({ item }) => (
    <View style={styles.studyGroupCard}>
      <View style={styles.cardHeader}>
        <View style={styles.cardHeaderLeft}>
          <Text style={styles.cardTitle}>{item.title}</Text>
          <Text style={styles.cardCourse}>{item.courseName}</Text>
          <Text style={styles.cardTimeSlot}>⏰ {item.timeSlot}</Text>
          <Text style={styles.cardLocation}>📍 {item.location}</Text>
        </View>
        <View style={styles.cardHeaderRight}>
          <View style={[styles.difficultyBadge, 
            { backgroundColor: item.difficulty === 'Advanced' ? '#EF4444' : 
                                 item.difficulty === 'Intermediate' ? '#F59E0B' : '#10B981' }
          ]}>
            <Text style={styles.difficultyText}>{item.difficulty}</Text>
          </View>
          <Text style={styles.participantCount}>
            {item.currentParticipants}/{item.maxParticipants} joined
          </Text>
        </View>
      </View>

      <Text style={styles.cardDescription}>{item.description}</Text>

      <View style={styles.tagsContainer}>
        {item.tags.map((tag, index) => (
          <View key={index} style={styles.tag}>
            <Text style={styles.tagText}>{tag}</Text>
          </View>
        ))}
      </View>

      <View style={styles.participantsPreview}>
        {item.participants.slice(0, 3).map((participant, index) => (
          <View key={participant.id} style={[styles.participantAvatar, { marginLeft: index > 0 ? -8 : 0 }]}>
            <Text style={styles.participantAvatarText}>{participant.avatar}</Text>
          </View>
        ))}
        {item.participants.length > 3 && (
          <View style={[styles.participantAvatar, { marginLeft: -8 }]}>
            <Text style={styles.participantAvatarText}>+{item.participants.length - 3}</Text>
          </View>
        )}
      </View>

      <View style={styles.cardActions}>
        {item.isJoined ? (
          <TouchableOpacity style={styles.joinedButton}>
            <Ionicons name="checkmark-circle" size={20} color="#10B981" />
            <Text style={styles.joinedButtonText}>Joined</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity 
            style={styles.joinButton}
            onPress={() => joinStudyGroup(item.id)}
          >
            <Ionicons name="add-circle" size={20} color="#FFFFFF" />
            <Text style={styles.joinButtonText}>Join Group</Text>
          </TouchableOpacity>
        )}
        
        <TouchableOpacity style={styles.detailsButton}>
          <Ionicons name="information-circle" size={20} color="#4F46E5" />
          <Text style={styles.detailsButtonText}>Details</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderStudySession = ({ item }) => (
    <View style={styles.sessionCard}>
      <LinearGradient
        colors={item.type === 'bootcamp' ? ['#EF4444', '#DC2626'] : ['#4F46E5', '#7C3AED']}
        style={styles.sessionCardGradient}
      >
        <View style={styles.sessionHeader}>
          <Text style={styles.sessionTitle}>{item.title}</Text>
          <Text style={styles.sessionInstructor}>👨‍🏫 {item.instructor}</Text>
          <Text style={styles.sessionTime}>⏰ {item.timeSlot}</Text>
          <Text style={styles.sessionDuration}>📝 {item.duration}</Text>
        </View>

        <Text style={styles.sessionDescription}>{item.description}</Text>

        <View style={styles.sessionStats}>
          <View style={styles.sessionStat}>
            <Text style={styles.sessionStatLabel}>Registered</Text>
            <Text style={styles.sessionStatValue}>{item.registeredCount}/{item.maxCapacity}</Text>
          </View>
          <View style={styles.sessionStat}>
            <Text style={styles.sessionStatLabel}>Difficulty</Text>
            <Text style={styles.sessionStatValue}>{item.difficulty}</Text>
          </View>
          <View style={styles.sessionStat}>
            <Text style={styles.sessionStatLabel}>Location</Text>
            <Text style={styles.sessionStatValue}>{item.location}</Text>
          </View>
        </View>

        <TouchableOpacity 
          style={[styles.registerButton, item.isRegistered && styles.registeredButton]}
          onPress={() => {
            if (!item.isRegistered) {
              Alert.alert('Register', `Would you like to register for "${item.title}"?`, [
                { text: 'Cancel', style: 'cancel' },
                { text: 'Register', onPress: () => Alert.alert('Success!', 'You have been registered for the session.') }
              ]);
            }
          }}
        >
          <Ionicons 
            name={item.isRegistered ? "checkmark-circle" : "add-circle"} 
            size={20} 
            color="#FFFFFF" 
          />
          <Text style={styles.registerButtonText}>
            {item.isRegistered ? 'Registered' : 'Register'}
          </Text>
        </TouchableOpacity>
      </LinearGradient>
    </View>
  );

  const renderGoal = ({ item }) => (
    <View style={styles.goalCard}>
      <View style={styles.goalHeader}>
        <Text style={styles.goalTitle}>{item.title}</Text>
        <View style={[styles.priorityBadge, 
          { backgroundColor: item.priority === 'high' ? '#EF4444' : 
                             item.priority === 'medium' ? '#F59E0B' : '#10B981' }
        ]}>
          <Text style={styles.priorityText}>{item.priority.toUpperCase()}</Text>
        </View>
      </View>

      <Text style={styles.goalDescription}>{item.description}</Text>
      <Text style={styles.goalCourse}>📚 {item.course}</Text>

      <View style={styles.progressContainer}>
        <View style={styles.progressHeader}>
          <Text style={styles.progressLabel}>Progress</Text>
          <Text style={styles.progressPercent}>{item.progress}%</Text>
        </View>
        <View style={styles.progressBar}>
          <View style={[styles.progressFill, { width: `${item.progress}%` }]} />
        </View>
      </View>

      <View style={styles.tasksPreview}>
        <Text style={styles.tasksLabel}>Tasks ({item.tasks.filter(t => t.completed).length}/{item.tasks.length})</Text>
        {item.tasks.slice(0, 3).map((task) => (
          <View key={task.id} style={styles.taskItem}>
            <Ionicons 
              name={task.completed ? "checkmark-circle" : "ellipse-outline"} 
              size={16} 
              color={task.completed ? "#10B981" : "#94A3B8"} 
            />
            <Text style={[styles.taskText, task.completed && styles.taskCompleted]}>
              {task.title}
            </Text>
          </View>
        ))}
        {item.tasks.length > 3 && (
          <Text style={styles.moreTasksText}>+{item.tasks.length - 3} more tasks</Text>
        )}
      </View>
    </View>
  );

  const renderPomodoroTimer = () => (
    <View style={styles.pomodoroContainer}>
      <LinearGradient
        colors={currentSession === 'focus' ? ['#4F46E5', '#7C3AED'] : ['#10B981', '#059669']}
        style={styles.pomodoroGradient}
      >
        <Text style={styles.pomodoroTitle}>
          {currentSession === 'focus' ? '🎯 Focus Time' : 
           currentSession === 'short_break' ? '☕ Short Break' : '🌟 Long Break'}
        </Text>
        
        <Text style={styles.pomodoroTimer}>{formatTime(pomodoroTimer)}</Text>
        
        <Text style={styles.pomodoroSession}>
          Session {completedPomodoros + 1} • {completedPomodoros} completed
        </Text>

        <View style={styles.pomodoroControls}>
          <TouchableOpacity 
            style={styles.pomodoroButton}
            onPress={togglePomodoro}
          >
            <Ionicons 
              name={isRunning ? "pause" : "play"} 
              size={24} 
              color="#FFFFFF" 
            />
            <Text style={styles.pomodoroButtonText}>
              {isRunning ? 'Pause' : 'Start'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.pomodoroButton, styles.pomodoroSecondaryButton]}
            onPress={resetPomodoro}
          >
            <Ionicons name="refresh" size={24} color="#4F46E5" />
            <Text style={[styles.pomodoroButtonText, styles.pomodoroSecondaryButtonText]}>
              Reset
            </Text>
          </TouchableOpacity>
        </View>
      </LinearGradient>
    </View>
  );

  const tabItems = [
    { id: 'study_groups', label: 'Study Groups', icon: 'people' },
    { id: 'sessions', label: 'Sessions', icon: 'school' },
    { id: 'pomodoro', label: 'Pomodoro', icon: 'timer' },
    { id: 'goals', label: 'Goals', icon: 'flag' }
  ];

  if (!user) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#4F46E5" />
          <Text style={styles.loadingText}>Loading weekend study...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#1E293B" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Weekend Study 📚</Text>
        <TouchableOpacity onPress={() => setShowCreateModal(true)}>
          <Ionicons name="add" size={24} color="#4F46E5" />
        </TouchableOpacity>
      </View>

      <Animated.View style={{ flex: 1, opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}>
        {/* Tab Navigation */}
        <View style={styles.tabContainer}>
          {tabItems.map((tab) => (
            <TouchableOpacity
              key={tab.id}
              style={[styles.tabItem, selectedTab === tab.id && styles.activeTab]}
              onPress={() => setSelectedTab(tab.id)}
            >
              <Ionicons 
                name={tab.icon} 
                size={20} 
                color={selectedTab === tab.id ? "#4F46E5" : "#94A3B8"} 
              />
              <Text style={[
                styles.tabLabel,
                selectedTab === tab.id && styles.activeTabLabel
              ]}>
                {tab.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Content */}
        <View style={styles.content}>
          {isLoading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#4F46E5" />
              <Text style={styles.loadingText}>Loading...</Text>
            </View>
          ) : (
            <>
              {selectedTab === 'study_groups' && (
                <FlatList
                  data={studyGroups}
                  renderItem={renderStudyGroup}
                  keyExtractor={(item) => item.id}
                  showsVerticalScrollIndicator={false}
                  contentContainerStyle={styles.listContainer}
                />
              )}

              {selectedTab === 'sessions' && (
                <FlatList
                  data={studySessions}
                  renderItem={renderStudySession}
                  keyExtractor={(item) => item.id}
                  showsVerticalScrollIndicator={false}
                  contentContainerStyle={styles.listContainer}
                />
              )}

              {selectedTab === 'pomodoro' && (
                <ScrollView contentContainerStyle={styles.pomodoroContent}>
                  {renderPomodoroTimer()}
                  
                  <View style={styles.pomodoroTips}>
                    <Text style={styles.tipsTitle}>🧠 Pomodoro Tips</Text>
                    <Text style={styles.tipItem}>• Focus for 25 minutes, then take a 5-minute break</Text>
                    <Text style={styles.tipItem}>• After 4 pomodoros, take a 15-30 minute break</Text>
                    <Text style={styles.tipItem}>• Turn off distractions during focus time</Text>
                    <Text style={styles.tipItem}>• Use breaks to stretch or hydrate</Text>
                  </View>
                </ScrollView>
              )}

              {selectedTab === 'goals' && (
                <FlatList
                  data={goals}
                  renderItem={renderGoal}
                  keyExtractor={(item) => item.id}
                  showsVerticalScrollIndicator={false}
                  contentContainerStyle={styles.listContainer}
                />
              )}
            </>
          )}
        </View>
      </Animated.View>

      {/* Create Modal */}
      <Modal
        visible={showCreateModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowCreateModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.createModal}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Create New</Text>
              <TouchableOpacity onPress={() => setShowCreateModal(false)}>
                <Ionicons name="close" size={24} color="#64748B" />
              </TouchableOpacity>
            </View>

            <View style={styles.createTypeSelector}>
              {[
                { id: 'group', label: 'Study Group', icon: 'people' },
                { id: 'goal', label: 'Study Goal', icon: 'flag' }
              ].map((type) => (
                <TouchableOpacity
                  key={type.id}
                  style={[styles.typeButton, createType === type.id && styles.selectedType]}
                  onPress={() => setCreateType(type.id)}
                >
                  <Ionicons 
                    name={type.icon} 
                    size={24} 
                    color={createType === type.id ? "#FFFFFF" : "#64748B"} 
                  />
                  <Text style={[
                    styles.typeButtonText,
                    createType === type.id && styles.selectedTypeText
                  ]}>
                    {type.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <ScrollView style={styles.formContainer}>
              <TextInput
                style={styles.formInput}
                placeholder="Title"
                value={formData.title}
                onChangeText={(text) => setFormData(prev => ({...prev, title: text}))}
              />

              <TextInput
                style={[styles.formInput, styles.textArea]}
                placeholder="Description"
                value={formData.description}
                onChangeText={(text) => setFormData(prev => ({...prev, description: text}))}
                multiline
                numberOfLines={3}
              />

              <TextInput
                style={styles.formInput}
                placeholder="Course (e.g., CSM281)"
                value={formData.course}
                onChangeText={(text) => setFormData(prev => ({...prev, course: text}))}
              />

              {createType === 'group' && (
                <>
                  <TextInput
                    style={styles.formInput}
                    placeholder="Time Slot (e.g., Saturday 10:00 AM)"
                    value={formData.timeSlot}
                    onChangeText={(text) => setFormData(prev => ({...prev, timeSlot: text}))}
                  />

                  <TextInput
                    style={styles.formInput}
                    placeholder="Duration (hours)"
                    value={formData.duration}
                    onChangeText={(text) => setFormData(prev => ({...prev, duration: text}))}
                    keyboardType="numeric"
                  />

                  <TextInput
                    style={styles.formInput}
                    placeholder="Max Participants"
                    value={formData.maxParticipants}
                    onChangeText={(text) => setFormData(prev => ({...prev, maxParticipants: text}))}
                    keyboardType="numeric"
                  />

                  <TextInput
                    style={styles.formInput}
                    placeholder="Location"
                    value={formData.location}
                    onChangeText={(text) => setFormData(prev => ({...prev, location: text}))}
                  />
                </>
              )}
            </ScrollView>

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => setShowCreateModal(false)}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.createButton}
                onPress={createItem}
                disabled={isLoading}
              >
                {isLoading ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                  <>
                    <Ionicons name="add" size={20} color="#FFFFFF" />
                    <Text style={styles.createButtonText}>Create</Text>
                  </>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#64748B',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1E293B',
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 16,
    gap: 4,
  },
  activeTab: {
    borderBottomWidth: 2,
    borderBottomColor: '#4F46E5',
  },
  tabLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#94A3B8',
  },
  activeTabLabel: {
    color: '#4F46E5',
  },
  content: {
    flex: 1,
  },
  listContainer: {
    padding: 20,
  },
  studyGroupCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  cardHeaderLeft: {
    flex: 1,
  },
  cardHeaderRight: {
    alignItems: 'flex-end',
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1E293B',
    marginBottom: 4,
  },
  cardCourse: {
    fontSize: 14,
    fontWeight: '600',
    color: '#4F46E5',
    marginBottom: 8,
  },
  cardTimeSlot: {
    fontSize: 12,
    color: '#64748B',
    marginBottom: 2,
  },
  cardLocation: {
    fontSize: 12,
    color: '#64748B',
  },
  difficultyBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginBottom: 8,
  },
  difficultyText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  participantCount: {
    fontSize: 12,
    color: '#64748B',
  },
  cardDescription: {
    fontSize: 14,
    color: '#64748B',
    lineHeight: 20,
    marginBottom: 16,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 16,
  },
  tag: {
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  tagText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#4F46E5',
  },
  participantsPreview: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  participantAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#E2E8F0',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  participantAvatarText: {
    fontSize: 12,
  },
  cardActions: {
    flexDirection: 'row',
    gap: 12,
  },
  joinButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    backgroundColor: '#4F46E5',
    borderRadius: 12,
    gap: 8,
  },
  joinButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  joinedButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    backgroundColor: '#F0FDF4',
    borderRadius: 12,
    gap: 8,
  },
  joinedButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#10B981',
  },
  detailsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    gap: 4,
  },
  detailsButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#4F46E5',
  },
  sessionCard: {
    borderRadius: 16,
    marginBottom: 16,
    overflow: 'hidden',
  },
  sessionCardGradient: {
    padding: 20,
  },
  sessionHeader: {
    marginBottom: 16,
  },
  sessionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  sessionInstructor: {
    fontSize: 14,
    color: '#E2E8F0',
    marginBottom: 4,
  },
  sessionTime: {
    fontSize: 14,
    color: '#E2E8F0',
    marginBottom: 4,
  },
  sessionDuration: {
    fontSize: 14,
    color: '#E2E8F0',
  },
  sessionDescription: {
    fontSize: 14,
    color: '#E2E8F0',
    lineHeight: 20,
    marginBottom: 20,
  },
  sessionStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  sessionStat: {
    alignItems: 'center',
  },
  sessionStatLabel: {
    fontSize: 12,
    color: '#E2E8F0',
    marginBottom: 4,
  },
  sessionStatValue: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  registerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 12,
    gap: 8,
  },
  registeredButton: {
    backgroundColor: 'rgba(16, 185, 129, 0.3)',
  },
  registerButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  pomodoroContent: {
    padding: 20,
  },
  pomodoroContainer: {
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 24,
  },
  pomodoroGradient: {
    padding: 32,
    alignItems: 'center',
  },
  pomodoroTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 16,
  },
  pomodoroTimer: {
    fontSize: 48,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  pomodoroSession: {
    fontSize: 14,
    color: '#E2E8F0',
    marginBottom: 32,
  },
  pomodoroControls: {
    flexDirection: 'row',
    gap: 16,
  },
  pomodoroButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 24,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 12,
    gap: 8,
  },
  pomodoroSecondaryButton: {
    backgroundColor: '#FFFFFF',
  },
  pomodoroButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  pomodoroSecondaryButtonText: {
    color: '#4F46E5',
  },
  pomodoroTips: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
  },
  tipsTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1E293B',
    marginBottom: 16,
  },
  tipItem: {
    fontSize: 14,
    color: '#64748B',
    lineHeight: 20,
    marginBottom: 8,
  },
  goalCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  goalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  goalTitle: {
    flex: 1,
    fontSize: 16,
    fontWeight: '700',
    color: '#1E293B',
    marginRight: 12,
  },
  priorityBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  priorityText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  goalDescription: {
    fontSize: 14,
    color: '#64748B',
    lineHeight: 20,
    marginBottom: 8,
  },
  goalCourse: {
    fontSize: 12,
    color: '#4F46E5',
    marginBottom: 16,
  },
  progressContainer: {
    marginBottom: 16,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  progressLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1E293B',
  },
  progressPercent: {
    fontSize: 14,
    fontWeight: '700',
    color: '#4F46E5',
  },
  progressBar: {
    height: 8,
    backgroundColor: '#E2E8F0',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#4F46E5',
  },
  tasksPreview: {
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
    paddingTop: 16,
  },
  tasksLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1E293B',
    marginBottom: 12,
  },
  taskItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4,
    gap: 8,
  },
  taskText: {
    fontSize: 14,
    color: '#64748B',
  },
  taskCompleted: {
    textDecorationLine: 'line-through',
    color: '#94A3B8',
  },
  moreTasksText: {
    fontSize: 12,
    color: '#94A3B8',
    fontStyle: 'italic',
    marginTop: 8,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  createModal: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    width: width * 0.9,
    maxHeight: height * 0.8,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 24,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1E293B',
  },
  createTypeSelector: {
    flexDirection: 'row',
    padding: 20,
    gap: 12,
  },
  typeButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    backgroundColor: '#F1F5F9',
    borderRadius: 12,
    gap: 8,
  },
  selectedType: {
    backgroundColor: '#4F46E5',
  },
  typeButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#64748B',
  },
  selectedTypeText: {
    color: '#FFFFFF',
  },
  formContainer: {
    maxHeight: height * 0.4,
    paddingHorizontal: 24,
  },
  formInput: {
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: '#1E293B',
    backgroundColor: '#FFFFFF',
    marginBottom: 16,
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  modalActions: {
    flexDirection: 'row',
    padding: 24,
    gap: 12,
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#64748B',
  },
  createButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 12,
    backgroundColor: '#4F46E5',
    gap: 8,
  },
  createButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});
