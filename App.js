import React, { useState, useEffect } from 'react';
import { View, SafeAreaView } from 'react-native';
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
          } else if (route.name === 'Notifications') {
            iconName = focused ? 'notifications' : 'notifications-outline';
          } else if (route.name === 'Profile') {
            iconName = focused ? 'person' : 'person-outline';
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: theme.colors.primary,
        tabBarInactiveTintColor: theme.colors.placeholder,
        tabBarStyle: {
          backgroundColor: theme.colors.background,
          borderTopColor: '#E2E8F0',
          paddingBottom: 5,
          paddingTop: 5,
          height: 60,
        },
        headerStyle: {
          backgroundColor: theme.colors.primary,
        },
        headerTintColor: '#FFFFFF',
        headerTitleStyle: {
          fontWeight: 'bold',
        },
      })}
    >
      <Tab.Screen name="Home" component={ModernHomeDashboard} options={{ title: 'Dashboard' }} />
      <Tab.Screen name="Chat" component={GroupChatScreen} options={{ title: 'Group Chat' }} />
      <Tab.Screen name="Upload" component={UploadNotesScreen} options={{ title: 'Upload Notes' }} />
      <Tab.Screen name="Notifications" component={NotificationsScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
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
            iconName = focused ? 'library' : 'library-outline';
          } else if (route.name === 'Chat') {
            iconName = focused ? 'chatbubbles' : 'chatbubbles-outline';
          } else if (route.name === 'Materials') {
            iconName = focused ? 'folder' : 'folder-outline';
          } else if (route.name === 'Notifications') {
            iconName = focused ? 'notifications' : 'notifications-outline';
          } else if (route.name === 'Profile') {
            iconName = focused ? 'person' : 'person-outline';
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: theme.colors.primary,
        tabBarInactiveTintColor: theme.colors.placeholder,
        tabBarStyle: {
          backgroundColor: theme.colors.background,
          borderTopColor: '#E2E8F0',
          paddingBottom: 5,
          paddingTop: 5,
          height: 60,
        },
        headerStyle: {
          backgroundColor: theme.colors.primary,
        },
        headerTintColor: '#FFFFFF',
        headerTitleStyle: {
          fontWeight: 'bold',
        },
      })}
    >
      <Tab.Screen name="Dashboard" component={LecturerDashboard} options={{ title: 'Lecturer Dashboard' }} />
      <Tab.Screen name="Chat" component={GroupChatScreen} options={{ title: 'Course Chats' }} />
      <Tab.Screen name="Materials" component={UploadNotesScreen} options={{ title: 'Course Materials' }} />
      <Tab.Screen name="Notifications" component={NotificationsScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
}

// Root App Component with Provider
export default function App() {
  // TEMPORARY: Show login screen directly for testing
  // Remove this and uncomment the normal flow below when ready
  return <TestLogin />;

  // NORMAL APP FLOW (commented out for testing)
  /*
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
  */
}

// Main App Content Component
function AppContent() {
  const { isAuthenticated, isLoading, user } = useApp();

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
  const [showSplash, setShowSplash] = useState(true);

  useEffect(() => {
    // Show splash screen for 1 second (reduced for testing)
    setTimeout(() => {
      setShowSplash(false);
    }, 1000);
  }, []);

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

  console.log('🚀 Rendering navigation with auth state:', { isAuthenticated, hasUser: !!user });

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {!isAuthenticated || !user ? (
          <>
            <Stack.Screen name="Login">
              {props => <LoginScreen {...props} onLogin={() => {}} />}
            </Stack.Screen>
            <Stack.Screen name="SignUp" component={SignUpScreen} />
            <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
          </>
        ) : (
          <>
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
                     name="CourseRepresentative"
                     component={CourseRepresentativeScreen}
                     options={{ headerShown: false }}
                   />
                 </>
               )}
             </Stack.Navigator>
           </NavigationContainer>
         );
       }
