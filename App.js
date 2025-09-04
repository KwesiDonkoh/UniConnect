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
import LoginScreen from './screens/LoginScreen';
import TestLogin from './TestLogin';
import SignUpScreen from './screens/SignUpScreen';
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
import CourseRegistrationScreen from './screens/CourseRegistrationScreen';
import AcademicResultsScreen from './screens/AcademicResultsScreen';
import WeekendStudyScreen from './screens/WeekendStudyScreen';
import SemesterModulesScreen from './screens/SemesterModulesScreen';
import ClassScheduleScreen from './screens/ClassScheduleScreen';
import ZoomMeetingScreen from './screens/ZoomMeetingScreen';
import PrivateMessagingScreen from './screens/PrivateMessagingScreen';
import CourseRepresentativeScreen from './screens/CourseRepresentativeScreen';

// Import theme provider
import { ThemeProvider } from './components/ThemeProvider';
import ErrorBoundary from './components/ErrorBoundary';
import errorReporter from './utils/errorReporting';
import platformHealth from './utils/platformHealth';

// Import context
import { AppProvider, useApp } from './context/AppContext';

import AsyncStorage from '@react-native-async-storage/async-storage';
import authService from './services/authService';

// Import the new Ultimate screens
import UltimateAmazingStudentDashboard from './screens/UltimateAmazingStudentDashboard';
import UltimateAmazingLecturerDashboard from './screens/UltimateAmazingLecturerDashboard';
import UltimateAmazingProfileScreen from './screens/UltimateAmazingProfileScreen';

// Import safe messaging screen (no calling features)
import SafeMessagingScreen from './screens/SafeMessagingScreen';

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

const theme = {
  colors: {
    primary: '#4F46E5',
    accent: '#818CF8',
    background: '#FFFFFF',
    surface: '#F8FAFC',
    text: '#1E293B',
    placeholder: '#64748B',
  },
};

// Use the original ProfileScreen that works


function StudentTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;

          if (route.name === 'Home') {
            iconName = focused ? 'home' : 'home-outline';
          } else if (route.name === 'Chat') {
            iconName = focused ? 'chatbubbles' : 'chatbubbles-outline';
          } else if (route.name === 'Upload') {
            iconName = focused ? 'cloud-upload' : 'cloud-upload-outline';
          } else if (route.name === 'Profile') {
            iconName = focused ? 'person' : 'person-outline';
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#6C63FF',
        tabBarInactiveTintColor: 'gray',
        headerShown: false,
      })}
    >
      <Tab.Screen name="Home" component={UltimateAmazingStudentDashboard} />
      <Tab.Screen name="Chat" component={GroupChatScreen} />
      <Tab.Screen name="Upload" component={UploadNotesScreen} />
      <Tab.Screen name="Profile" component={UltimateAmazingProfileScreen} />
    </Tab.Navigator>
  );
}

function LecturerTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;

          if (route.name === 'Dashboard') {
            iconName = focused ? 'grid' : 'grid-outline';
          } else if (route.name === 'Students') {
            iconName = focused ? 'people' : 'people-outline';
          } else if (route.name === 'Materials') {
            iconName = focused ? 'folder' : 'folder-outline';
          } else if (route.name === 'Profile') {
            iconName = focused ? 'person' : 'person-outline';
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#6C63FF',
        tabBarInactiveTintColor: 'gray',
        headerShown: false,
      })}
    >
      <Tab.Screen name="Dashboard" component={UltimateAmazingLecturerDashboard} />
      <Tab.Screen name="Students" component={StudentsManagementScreen} />
      <Tab.Screen name="Materials" component={UploadNotesScreen} />
      <Tab.Screen name="Profile" component={UltimateAmazingProfileScreen} />
    </Tab.Navigator>
  );
}

// Root App Component with Provider
export default function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider>
        <PaperProvider theme={theme}>
          <AppProvider>
            <SafeAreaView style={{ flex: 1, backgroundColor: theme.colors.primary }}>
              <View style={{ backgroundColor: theme.colors.primary, height: 0 }} />
              <StatusBar style="light" />
              <AppContent />
            </SafeAreaView>
          </AppProvider>
        </PaperProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

// Main App Content Component
function AppContent() {
  const { isAuthenticated, isLoading, user } = useApp();
  
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
          <Stack.Screen name="Login" component={LoginScreen} />
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
                     name="CourseRepresentative"
                     component={CourseRepresentativeScreen}
                     options={{ headerShown: false }}
                   />
        </Stack.Navigator>
      )}
    </NavigationContainer>
  );
}


