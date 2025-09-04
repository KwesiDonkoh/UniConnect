import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  SafeAreaView,
  ScrollView,
  Dimensions,
  Animated,
  RefreshControl,
  StatusBar,
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useApp } from '../context/AppContext';
import { Colors } from '../themes/modernTheme';

// Import AI components
import AIStudyAssistant from '../components/AIStudyAssistant';
import AIPerformancePrediction from '../components/AIPerformancePrediction';
import AIQuizGenerator from '../components/AIQuizGenerator';
import AIContentGenerator from '../components/AIContentGenerator';
import AIPlagiarismDetector from '../components/AIPlagiarismDetector';
import SmartNoteTaking from '../components/SmartNoteTaking';
import SmartScheduleOptimizer from '../components/SmartScheduleOptimizer';
import ARStudyMode from '../components/ARStudyMode';
import GamifiedProgress from '../components/GamifiedProgress';
import VirtualClassroom from '../components/VirtualClassroom';

const { width, height } = Dimensions.get('window');

export default function UltimateAmazingStudentDashboard({ navigation }) {
  // Enhanced safety checks with detailed error handling
  let appContext;
  let user = null;
  let csModules = [];
  let notifications = [];
  
  try {
    appContext = useApp();
    console.log('👨‍🎓 StudentDashboard - App context received:', {
      hasContext: !!appContext,
      hasUser: !!appContext?.user,
      hasCsModules: !!appContext?.csModules,
      hasNotifications: !!appContext?.notifications,
      contextKeys: appContext ? Object.keys(appContext) : []
    });
    
    // Safe destructuring with fallbacks
    if (appContext && typeof appContext === 'object') {
      user = appContext.user || null;
      csModules = appContext.csModules || [];
      notifications = appContext.notifications || [];
    }
  } catch (error) {
    console.error('❌ Error getting app context in StudentDashboard:', error);
    appContext = {
      user: null,
      csModules: [],
      notifications: [],
      chatMessages: [],
      isAuthenticated: false,
      isLoading: true,
      signOut: () => {},
      updateUserData: () => {},
    };
    user = null;
    csModules = [];
    notifications = [];
  }
  const [refreshing, setRefreshing] = useState(false);
  const [showAIAssistant, setShowAIAssistant] = useState(false);
  const [showPerformancePrediction, setShowPerformancePrediction] = useState(false);
  const [showQuizGenerator, setShowQuizGenerator] = useState(false);
  const [showContentGenerator, setShowContentGenerator] = useState(false);
  const [showPlagiarismDetector, setShowPlagiarismDetector] = useState(false);
  const [showSmartNotes, setShowSmartNotes] = useState(false);
  const [showScheduleOptimizer, setShowScheduleOptimizer] = useState(false);
  const [showARStudy, setShowARStudy] = useState(false);
  const [showVirtualClassroom, setShowVirtualClassroom] = useState(false);
  const [showGamifiedProgress, setShowGamifiedProgress] = useState(false);

  // Early return if user data is not available
  if (!user) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar style="light" />
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading...</Text>
        </View>
      </SafeAreaView>
    );
  }

  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;

  useEffect(() => {
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
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 1000);
  };

  // AI Features with original colors
  const aiFeatures = [
    { 
      id: 'ai-study-assistant', 
      title: 'AI Study Assistant', 
      icon: 'brain', 
      color: Colors.primary[500],
      onPress: () => setShowAIAssistant(true)
    },
    { 
      id: 'performance-prediction', 
      title: 'Performance Prediction', 
      icon: 'analytics', 
      color: Colors.success[500],
      onPress: () => setShowPerformancePrediction(true)
    },
    { 
      id: 'quiz-generator', 
      title: 'AI Quiz Generator', 
      icon: 'help-circle', 
      color: Colors.warning[500],
      onPress: () => setShowQuizGenerator(true)
    },
    { 
      id: 'content-generator', 
      title: 'Content Generator', 
      icon: 'document-text', 
      color: Colors.secondary[500],
      onPress: () => setShowContentGenerator(true)
    },
    { 
      id: 'plagiarism-detector', 
      title: 'Plagiarism Detector', 
      icon: 'shield-checkmark', 
      color: Colors.error[500],
      onPress: () => setShowPlagiarismDetector(true)
    },
    { 
      id: 'smart-notes', 
      title: 'Smart Notes', 
      icon: 'create', 
      color: Colors.secondary[500],
      onPress: () => setShowSmartNotes(true)
    },
  ];

  const studyTools = [
    { 
      id: 'schedule-optimizer', 
      title: 'Schedule Optimizer', 
      icon: 'calendar', 
      color: Colors.primary[600],
      onPress: () => setShowScheduleOptimizer(true)
    },
    { 
      id: 'ar-study', 
      title: 'AR Study Mode', 
      icon: 'cube', 
      color: Colors.success[600],
      onPress: () => setShowARStudy(true)
    },
    { 
      id: 'virtual-classroom', 
      title: 'Virtual Classroom', 
      icon: 'videocam', 
      color: Colors.primary[600],
      onPress: () => setShowVirtualClassroom(true)
    },
    { 
      id: 'gamified-progress', 
      title: 'Gamified Progress', 
      icon: 'trophy', 
      color: Colors.warning[600],
      onPress: () => setShowGamifiedProgress(true)
    },
  ];

  const renderAIFeature = ({ item }) => (
    <Animated.View style={[styles.featureCard, { opacity: fadeAnim }]}>
      <TouchableOpacity onPress={item.onPress} style={styles.featureButton}>
        <LinearGradient
          colors={[item.color, `${item.color}80`]}
          style={styles.featureGradient}
        >
          <Ionicons name={item.icon} size={32} color="white" />
          <Text style={styles.featureTitle}>{item.title}</Text>
        </LinearGradient>
      </TouchableOpacity>
    </Animated.View>
  );

  const renderStudyTool = ({ item }) => (
    <TouchableOpacity onPress={item.onPress} style={styles.toolCard}>
      <View style={[styles.toolIcon, { backgroundColor: `${item.color}20` }]}>
        <Ionicons name={item.icon} size={24} color={item.color} />
      </View>
      <Text style={styles.toolTitle}>{item.title}</Text>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={Colors.primary[700]} />
      
      {/* Header */}
      <LinearGradient
        colors={[Colors.primary[600], Colors.primary[800]]}
        style={styles.header}
      >
        <View style={styles.headerContent}>
          <View>
            <Text style={styles.welcomeText}>Welcome back,</Text>
            <Text style={styles.userName}>{user?.name || 'Student'}</Text>
          </View>
          <TouchableOpacity onPress={() => navigation.navigate('Profile')}>
            <Image
              source={{ uri: user?.avatar || 'https://i.pravatar.cc/150?img=1' }}
              style={styles.avatar}
            />
          </TouchableOpacity>
        </View>
      </LinearGradient>

      <ScrollView
        style={styles.content}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        showsVerticalScrollIndicator={false}
      >
        {/* AI Features Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🤖 AI-Powered Learning</Text>
          <FlatList
            data={aiFeatures}
            renderItem={renderAIFeature}
            keyExtractor={(item) => item.id}
            numColumns={2}
            scrollEnabled={false}
            contentContainerStyle={styles.featuresGrid}
          />
        </View>

        {/* Study Tools Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>📚 Study Tools</Text>
          <FlatList
            data={studyTools}
            renderItem={renderStudyTool}
            keyExtractor={(item) => item.id}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.toolsList}
          />
        </View>

        {/* Enhanced Communication */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>💬 Enhanced Communication</Text>
          <TouchableOpacity 
            style={styles.commAction}
            onPress={() => navigation.navigate('GroupChat')}
          >
            <LinearGradient
              colors={[Colors.primary[500], Colors.primary[600]]}
              style={styles.commGradient}
            >
              <Ionicons name="chatbubble-ellipses" size={24} color="white" />
              <Text style={styles.commText}>Group Discussions</Text>
              <Text style={styles.commSubtext}>Connect with classmates</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>

        {/* Gamified Progress */}
        <View style={styles.section}>
          <GamifiedProgress />
        </View>
      </ScrollView>

      {/* AI Component Modals */}
      <AIStudyAssistant
        visible={showAIAssistant}
        onClose={() => setShowAIAssistant(false)}
      />
      
      <AIPerformancePrediction
        visible={showPerformancePrediction}
        onClose={() => setShowPerformancePrediction(false)}
      />
      
      <AIQuizGenerator
        visible={showQuizGenerator}
        onClose={() => setShowQuizGenerator(false)}
      />
      
      <AIContentGenerator
        visible={showContentGenerator}
        onClose={() => setShowContentGenerator(false)}
      />
      
      <AIPlagiarismDetector
        visible={showPlagiarismDetector}
        onClose={() => setShowPlagiarismDetector(false)}
      />
      
      <SmartNoteTaking
        visible={showSmartNotes}
        onClose={() => setShowSmartNotes(false)}
      />
      
      <SmartScheduleOptimizer
        visible={showScheduleOptimizer}
        onClose={() => setShowScheduleOptimizer(false)}
      />
      
      <ARStudyMode
        visible={showARStudy}
        onClose={() => setShowARStudy(false)}
      />
      
      <VirtualClassroom
        visible={showVirtualClassroom}
        onClose={() => setShowVirtualClassroom(false)}
      />
      
      <GamifiedProgress
        visible={showGamifiedProgress}
        onClose={() => setShowGamifiedProgress(false)}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.neutral[50],
  },
  header: {
    paddingTop: 20,
    paddingBottom: 30,
    paddingHorizontal: 20,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  welcomeText: {
    color: 'white',
    fontSize: 16,
    opacity: 0.9,
  },
  userName: {
    color: 'white',
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 4,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    borderWidth: 2,
    borderColor: 'white',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  section: {
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.neutral[900],
    marginBottom: 15,
  },
  featuresGrid: {
    gap: 15,
  },
  featureCard: {
    flex: 1,
    margin: 5,
  },
  featureButton: {
    borderRadius: 20,
    overflow: 'hidden',
  },
  featureGradient: {
    padding: 20,
    alignItems: 'center',
    minHeight: 120,
    justifyContent: 'center',
  },
  featureTitle: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: 10,
    textAlign: 'center',
  },
  toolsList: {
    paddingHorizontal: 5,
  },
  toolCard: {
    backgroundColor: 'white',
    padding: 15,
    borderRadius: 15,
    alignItems: 'center',
    marginHorizontal: 10,
    minWidth: 100,
    shadowColor: Colors.neutral[900],
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  toolIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  toolTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.neutral[800],
    textAlign: 'center',
  },
  communicationGrid: {
    flexDirection: 'row',
    gap: 15,
  },
  commAction: {
    flex: 1,
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: Colors.neutral[900],
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 6,
  },
  commGradient: {
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 100,
  },
  commText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: 8,
    textAlign: 'center',
  },
  commSubtext: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 12,
    marginTop: 4,
    textAlign: 'center',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: Colors.neutral[600],
  },
});
