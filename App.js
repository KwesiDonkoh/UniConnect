import React, { useState, useEffect } from 'react';
import { View, SafeAreaView, TouchableOpacity, Text } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Provider as PaperProvider } from 'react-native-paper';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';

// Import screens
import SplashScreen from './screens/SplashScreen';
import SimpleLoginScreen from './screens/SimpleLoginScreen';
import SignUpScreen from './screens/SignUpScreen';
import TestLogin from './TestLogin';
import ForgotPasswordScreen from './screens/ForgotPasswordScreen';
// import LevelSelectionScreen from './screens/LevelSelectionScreen'; // Removed - level selection now happens during signup
import HomeDashboard from './screens/HomeDashboard';
import ModernHomeDashboard from './screens/ModernHomeDashboard';
import LecturerDashboard from './screens/LecturerDashboard';
import GroupChatScreen from './screens/GroupChatScreen';
import UploadNotesScreen from './screens/UploadNotesScreen';
import NotificationsScreen from './screens/NotificationsScreen';
import ProfileScreen from './screens/ProfileScreen';
import StudyScreen from './screens/StudyScreen';
import AcademicOverviewScreen from './screens/AcademicOverviewScreen';
import AcademicCalendarScreen from './screens/AcademicCalendarScreen';
import GradebookScreen from './screens/GradebookScreen';
import AnalyticsDashboard from './screens/AnalyticsDashboard';
import StudentsManagementScreen from './screens/StudentsManagementScreen';
import EnhancedStudentsManagementScreen from './screens/EnhancedStudentsManagementScreen';
import CourseRegistrationScreen from './screens/CourseRegistrationScreen';
import AcademicResultsScreen from './screens/AcademicResultsScreen';
import WeekendStudyScreen from './screens/WeekendStudyScreen';
import SemesterModulesScreen from './screens/SemesterModulesScreen';
import ClassScheduleScreen from './screens/ClassScheduleScreen';
import ZoomMeetingScreen from './screens/ZoomMeetingScreen';
import PrivateMessagingScreen from './screens/PrivateMessagingScreen';
import CourseRepresentativeScreen from './screens/CourseRepresentativeScreen';
import ShuttleScreen from './screens/ShuttleScreen';
import GlobalNewsScreen from './screens/GlobalNewsScreen';
import CampusNewsScreen from './screens/CampusNewsScreen';
import GlobalGroupsScreen from './screens/GlobalGroupsScreen';
import MarketplaceScreen from './screens/MarketplaceScreen';
import WellnessScreen from './screens/WellnessScreen';
import EventsHubScreen from './screens/EventsHubScreen';
import AlumniConnectScreen from './screens/AlumniConnectScreen';
import QuizScreen from './screens/QuizScreen';
import CanteenScreen from './screens/CanteenScreen';
import CampusMapScreen from './screens/CampusMapScreen';
import HostelScreen from './screens/HostelScreen';
import ScholarshipScreen from './screens/ScholarshipScreen';
import AcademicInsightScreen from './screens/AcademicInsightScreen';
import WalletScreen from './screens/WalletScreen';
import LibraryScreen from './screens/LibraryScreen';
import RadioScreen from './screens/RadioScreen';
import ElectionScreen from './screens/ElectionScreen';
import CareerScreen from './screens/CareerScreen';
import DiningScreen from './screens/DiningScreen';
import ToDoScreen from './screens/ToDoScreen';
import SafetyScreen from './screens/SafetyScreen';
import SupportHubScreen from './screens/SupportHubScreen';
import CampusLifeScreen from './screens/CampusLifeScreen';
import AIResearchAssistantScreen from './screens/AIResearchAssistantScreen';
import CampusSocialHub from './screens/CampusSocialHub';
import PerformanceAnalyticsScreen from './screens/PerformanceAnalyticsScreen';
import PersonalisedTimetableScreen from './screens/PersonalisedTimetableScreen';
import AssignmentDeadlineScreen from './screens/AssignmentDeadlineScreen';
import DigitalLibraryVaultScreen from './screens/DigitalLibraryVaultScreen';
import SmartAttendanceScreen from './screens/SmartAttendanceScreen';
import CampusNavigationScreen from './screens/CampusNavigationScreen';
import EventsSeminarHubScreen from './screens/EventsSeminarHubScreen';
import FeesPaymentsScreen from './screens/FeesPaymentsScreen';
import ComplaintsSystemScreen from './screens/ComplaintsSystemScreen';

// Import theme provider
import { ThemeProvider } from './components/ThemeProvider';
import ErrorBoundary from './components/ErrorBoundary';
import errorReporter from './utils/errorReporting';
import platformHealth from './utils/platformHealth';

// Import context
import { AppProvider, useApp } from './context/AppContext';
import { useTheme } from './components/ThemeProvider';

import AsyncStorage from '@react-native-async-storage/async-storage';
import authService from './services/authService';

// Using original working dashboard components

// Import messaging screens with calling features
import SafeMessagingScreen from './screens/SafeMessagingScreen';
import MessagingWithCallsScreen from './screens/MessagingWithCallsScreen';
import SimpleCallHistoryScreen from './screens/SimpleCallHistoryScreen';

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

// Theme will be provided by ThemeProvider

// Use the original ProfileScreen that works


function StudentTabs() {
  const { isDark } = useTheme();

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;

          if (route.name === 'Home') {
            iconName = focused ? 'home' : 'home-outline';
          } else if (route.name === 'Chat') {
            iconName = focused ? 'chatbubbles' : 'chatbubbles-outline';
          } else if (route.name === 'Materials') {
            iconName = focused ? 'library' : 'library-outline';
          } else if (route.name === 'Notifications') {
            iconName = focused ? 'notifications' : 'notifications-outline';
          } else if (route.name === 'Schedule') {
            iconName = focused ? 'calendar' : 'calendar-outline';
          } else if (route.name === 'Profile') {
            iconName = focused ? 'person' : 'person-outline';
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: isDark ? '#8B5CF6' : '#6366F1',
        tabBarInactiveTintColor: isDark ? '#64748B' : '#94A3B8',
        headerShown: false,
        tabBarStyle: {
          height: 80,
          backgroundColor: isDark ? '#1E293B' : '#FFFFFF',
          borderTopWidth: 0,
          borderTopColor: isDark ? '#334155' : '#E2E8F0',
          shadowColor: '#000',
          shadowOffset: { width: 0, height: -4 },
          shadowOpacity: isDark ? 0.3 : 0.1,
          shadowRadius: 12,
          elevation: 8,
          paddingBottom: 12,
          paddingTop: 8,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '600',
          marginTop: 4,
          color: isDark ? '#F8FAFC' : '#1E293B',
        },
      })}
    >
      <Tab.Screen name="Home" component={ModernHomeDashboard} options={{ title: 'Home' }} />
      <Tab.Screen name="Chat" component={GroupChatScreen} options={{ title: 'Chat' }} />
      <Tab.Screen name="Materials" component={UploadNotesScreen} options={{ title: 'Materials' }} />
      <Tab.Screen name="Notifications" component={NotificationsScreen} options={{ title: 'Notifications' }} />
      <Tab.Screen name="Schedule" component={ClassScheduleScreen} options={{ title: 'Schedule' }} />
      <Tab.Screen name="Profile" component={ProfileScreen} options={{ title: 'Profile' }} />
    </Tab.Navigator>
  );
}

function LecturerTabs() {
  const { isDark } = useTheme();

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;

          if (route.name === 'Dashboard') {
            iconName = focused ? 'grid' : 'grid-outline';
          } else if (route.name === 'Chat') {
            iconName = focused ? 'chatbubbles' : 'chatbubbles-outline';
          } else if (route.name === 'Materials') {
            iconName = focused ? 'library' : 'library-outline';
          } else if (route.name === 'Notifications') {
            iconName = focused ? 'notifications' : 'notifications-outline';
          } else if (route.name === 'Schedule') {
            iconName = focused ? 'calendar' : 'calendar-outline';
          } else if (route.name === 'Students') {
            iconName = focused ? 'people' : 'people-outline';
          } else if (route.name === 'Profile') {
            iconName = focused ? 'person' : 'person-outline';
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: isDark ? '#8B5CF6' : '#6366F1',
        tabBarInactiveTintColor: isDark ? '#64748B' : '#94A3B8',
        headerShown: false,
        tabBarStyle: {
          height: 80,
          backgroundColor: isDark ? '#1E293B' : '#FFFFFF',
          borderTopWidth: 0,
          shadowColor: isDark ? '#000' : '#000',
          shadowOffset: { width: 0, height: -4 },
          shadowOpacity: isDark ? 0.3 : 0.1,
          shadowRadius: 12,
          elevation: 8,
          paddingBottom: 12,
          paddingTop: 8,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '600',
          marginTop: 4,
          color: isDark ? '#FFFFFF' : '#1E293B',
        },
      })}
    >
      <Tab.Screen name="Dashboard" component={LecturerDashboard} options={{ title: 'Dashboard' }} />
      <Tab.Screen name="Chat" component={GroupChatScreen} options={{ title: 'Course Chats' }} />
      <Tab.Screen name="Materials" component={UploadNotesScreen} options={{ title: 'Materials' }} />
      <Tab.Screen name="Notifications" component={NotificationsScreen} options={{ title: 'Notifications' }} />
      <Tab.Screen name="Schedule" component={ClassScheduleScreen} options={{ title: 'Schedule' }} />
      <Tab.Screen name="Students" component={EnhancedStudentsManagementScreen} options={{ title: 'Students' }} />
      <Tab.Screen name="Profile" component={ProfileScreen} options={{ title: 'Profile' }} />
    </Tab.Navigator>
  );
}

// Root App Component with Provider
export default function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider>
        <AppProvider>
          <AppContent />
        </AppProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

// Main App Content Component
function AppContent() {
  const { isAuthenticated, isLoading, user } = useApp();
  const { isDark } = useTheme();

  // ALL HOOKS MUST BE DECLARED AT THE TOP - BEFORE ANY CONDITIONAL LOGIC
  const [showSplash, setShowSplash] = useState(true);

  // Debug logging to help identify the current state
  useEffect(() => {
    console.log('🔍 App State Debug:', {
      isAuthenticated,
      isLoading,
      hasUser: !!user,
      userType: user?.userType,
    });
  }, [isAuthenticated, isLoading, user]);

  // Initialize platform health check
  useEffect(() => {
    const initializePlatform = async () => {
      try {
        console.log('🚀 Initializing platform health check...');
        await platformHealth.performHealthCheck();

        const status = platformHealth.getHealthStatus();
        if (status.issues.length > 0) {
          console.warn('Platform issues detected:', status.issues);
        }

        console.log('✅ Platform initialization complete');
      } catch (error) {
        errorReporter.logError(error, { context: 'platformInitialization' });
      }
    };

    // Run health check after a short delay to avoid blocking initial render
    const timer = setTimeout(initializePlatform, 2000);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    // Show splash screen for 1 second (reduced for testing)
    setTimeout(() => {
      setShowSplash(false);
    }, 1000);
  }, []);

  // NOW CONDITIONAL LOGIC CAN COME AFTER ALL HOOKS

  // Show splash screen initially
  if (showSplash) {
    return <SplashScreen />;
  }

  // Show loading while checking authentication state (with timeout)
  if (isLoading) {
    return <SplashScreen />;
  }

  // Safety check - if user is authenticated but user object is null, show loading
  if (isAuthenticated && !user) {
    return <SplashScreen />;
  }

  console.log('🚀 Rendering navigation with auth state:', { isAuthenticated, hasUser: !!user, isLoading });
  console.log('📱 Initial route will be:', !isAuthenticated || !user ? "Login" : "MainTabs");
  console.log('🔍 Auth state details:', {
    isAuthenticated,
    user: user ? { uid: user.uid, userType: user.userType } : null,
    isLoading
  });

  return (
    <NavigationContainer>
      {!isAuthenticated || !user ? (
        <Stack.Navigator
          screenOptions={{ headerShown: false }}
          initialRouteName="Login"
        >
          <Stack.Screen name="Login" component={SimpleLoginScreen} />
          <Stack.Screen name="SignUp" component={SignUpScreen} />
          <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
        </Stack.Navigator>
      ) : (
        <Stack.Navigator
          screenOptions={{ headerShown: false }}
          initialRouteName="MainTabs"
        >
          <Stack.Screen
            name="MainTabs"
            component={user?.userType === 'lecturer' ? LecturerTabs : StudentTabs}
          />
          <Stack.Screen
            name="StudyScreen"
            component={StudyScreen}
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="AcademicOverview"
            component={AcademicOverviewScreen}
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="AcademicCalendar"
            component={AcademicCalendarScreen}
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="Gradebook"
            component={GradebookScreen}
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="Analytics"
            component={AnalyticsDashboard}
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="CourseRegistration"
            component={CourseRegistrationScreen}
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="AcademicResults"
            component={AcademicResultsScreen}
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="WeekendStudy"
            component={WeekendStudyScreen}
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="SemesterModules"
            component={SemesterModulesScreen}
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="ClassSchedule"
            component={ClassScheduleScreen}
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="ZoomMeeting"
            component={ZoomMeetingScreen}
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="PrivateMessaging"
            component={PrivateMessagingScreen}
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="SafeMessaging"
            component={SafeMessagingScreen}
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="MessagingWithCalls"
            component={MessagingWithCallsScreen}
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="CallHistory"
            component={SimpleCallHistoryScreen}
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="CourseRepresentative"
            component={CourseRepresentativeScreen}
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="Shuttle"
            component={ShuttleScreen}
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="GlobalNews"
            component={GlobalNewsScreen}
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="CampusNews"
            component={CampusNewsScreen}
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="GlobalGroups"
            component={GlobalGroupsScreen}
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="Marketplace"
            component={MarketplaceScreen}
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="Wellness"
            component={WellnessScreen}
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="EventsHub"
            component={EventsHubScreen}
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="AlumniConnect"
            component={AlumniConnectScreen}
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="Quiz"
            component={QuizScreen}
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="Canteen"
            component={CanteenScreen}
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="CampusMap"
            component={CampusMapScreen}
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="HostelHub"
            component={HostelScreen}
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="Scholarships"
            component={ScholarshipScreen}
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="AcademicInsight"
            component={AcademicInsightScreen}
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="Wallet"
            component={WalletScreen}
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="LibraryHub"
            component={LibraryScreen}
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="Radio"
            component={RadioScreen}
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="Election"
            component={ElectionScreen}
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="Careers"
            component={CareerScreen}
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="Dining"
            component={DiningScreen}
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="Tasks"
            component={ToDoScreen}
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="Safety"
            component={SafetyScreen}
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="SupportHub"
            component={SupportHubScreen}
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="CampusLife"
            component={CampusLifeScreen}
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="AIResearchAssistant"
            component={AIResearchAssistantScreen}
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="CampusSocialHub"
            component={CampusSocialHub}
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="PerformanceAnalytics"
            component={PerformanceAnalyticsScreen}
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="PersonalisedTimetable"
            component={PersonalisedTimetableScreen}
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="AssignmentDeadline"
            component={AssignmentDeadlineScreen}
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="DigitalLibraryVault"
            component={DigitalLibraryVaultScreen}
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="SmartAttendance"
            component={SmartAttendanceScreen}
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="CampusNavigation"
            component={CampusNavigationScreen}
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="EventsSeminarHub"
            component={EventsSeminarHubScreen}
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="FeesPayments"
            component={FeesPaymentsScreen}
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="ComplaintsSystem"
            component={ComplaintsSystemScreen}
            options={{ headerShown: false }}
          />
        </Stack.Navigator>
      )}
    </NavigationContainer>
  );
}


