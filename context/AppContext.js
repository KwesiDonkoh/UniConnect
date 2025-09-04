import React, { createContext, useContext, useState, useEffect } from 'react';
import authService from '../services/authService';

// Safe import of dummyData with fallback
let dummyData;
try {
  const { dummyData: importedData } = require('../data/dummyData');
  dummyData = importedData;
} catch (error) {
  console.warn('Failed to import dummyData, using fallback:', error);
  dummyData = {
    notifications: [],
    chatMessages: [],
    csModules: {
      '100': [],
      '200': [],
      '300': [],
      '400': []
    }
  };
}

const AppContext = createContext();

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    console.warn('useApp must be used within an AppProvider');
    // Return a default context instead of throwing an error
    return {
      user: null,
      csModules: [],
      notifications: [],
      chatMessages: [],
      isAuthenticated: false,
      isLoading: true,
      signOut: () => {},
      updateUserData: () => {},
    };
  }
  return context;
};

export const AppProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [notifications, setNotifications] = useState(dummyData?.notifications || []);
  const [chatMessages, setChatMessages] = useState(dummyData?.chatMessages || []);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Listen to authentication state changes
  useEffect(() => {
    const unsubscribe = authService.onAuthStateChange(async (firebaseUser) => {
      if (firebaseUser && firebaseUser.userData) {
        // User is signed in - use data from Firestore
        const userData = firebaseUser.userData;
        
        setUser({
          uid: firebaseUser.uid,
          name: userData.fullName || firebaseUser.displayName || 'User',
          identifier: userData.identifier || (userData.userType === 'lecturer' ? 'STAFF000' : 'CST000000'),
          studentId: userData.identifier, // For backward compatibility
          email: firebaseUser.email,
          avatar: firebaseUser.photoURL || 'https://i.pravatar.cc/150?img=1',
          department: userData.department || 'Computer Science',
          userType: userData.userType || 'student',
          // Student-specific fields
          ...(userData.userType === 'student' && {
            academicLevel: userData.academicLevel || '100',
            levelDescription: userData.levelDescription || 'First Year - Foundation',
          }),
          // Lecturer-specific fields
          ...(userData.userType === 'lecturer' && {
            title: userData.title || 'Lecturer',
            teachingCourses: userData.teachingCourses || [],
          }),
        });
        setIsAuthenticated(true);
      } else if (firebaseUser) {
        // Fallback for users without Firestore data (shouldn't happen with new flow)
        setUser({
          uid: firebaseUser.uid,
          name: firebaseUser.displayName || 'User',
          identifier: 'CST000000',
          studentId: 'CST000000',
          email: firebaseUser.email,
          avatar: firebaseUser.photoURL || 'https://i.pravatar.cc/150?img=1',
          department: 'Computer Science',
          userType: 'student',
          academicLevel: '100',
          levelDescription: 'First Year - Foundation',
        });
        setIsAuthenticated(true);
      } else {
        // User is signed out
        setUser(null);
        setIsAuthenticated(false);
      }
      setIsLoading(false);
    });

    // Cleanup subscription on unmount
    return () => unsubscribe();
  }, []);

  // Authentication methods
  const signIn = async (email, password) => {
    const result = await authService.signIn(email, password);
    return result;
  };

  const signUp = async (email, password, userData) => {
    const result = await authService.signUp(email, password, userData);
    return result;
  };

  const signOut = async () => {
    try {
      // Set loading state during logout
      setIsLoading(true);
      
      // Clear user state immediately to prevent component errors
      setUser(null);
      setIsAuthenticated(false);
      
      // Clear any local storage/cache
      setChatMessages([]);
      setNotifications([]);
      
      // Sign out from Firebase
      const result = await authService.signOutUser();
      
      // Ensure loading is cleared regardless of result
      setTimeout(() => {
        setIsLoading(false);
      }, 500); // Small delay to ensure smooth transition
      
      return result.success ? result : { success: true }; // Always return success since we cleared state
    } catch (error) {
      console.error('Logout error:', error);
      // Force clear user state on any error
      setUser(null);
      setIsAuthenticated(false);
      setChatMessages([]);
      setNotifications([]);
      setIsLoading(false);
      return { success: true }; // Return success since we cleared the state
    }
  };

  const sendPasswordReset = async (email) => {
    return await authService.sendPasswordReset(email);
  };

  // Update user data in Firestore
  const updateUserData = async (userData) => {
    if (!user) return { success: false, error: 'No user logged in' };
    
    try {
      const result = await authService.updateUserData(user.uid, userData);
      if (result.success) {
        // Update local user state
        setUser(prev => ({ ...prev, ...userData }));
      }
      return result;
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  // Enhanced course loading with comprehensive error handling
  const getCoursesForUser = () => {
    try {
      if (!user) {
        console.log('📚 No user available, returning empty courses array');
        return [];
      }
      
      // Enhanced safe access to dummyData with multiple fallbacks
      const csModules = dummyData?.csModules || {};
      
      console.log('📚 Loading courses for user:', {
        uid: user?.uid,
        userType: user?.userType,
        academicLevel: user?.academicLevel,
        availableLevels: Object.keys(csModules),
        csModulesType: typeof csModules,
        csModulesKeys: csModules ? Object.keys(csModules) : []
      });
      
      if (user.userType === 'lecturer') {
        try {
          // Extra safety for Object.values and flat operations
          const moduleValues = Object.values(csModules || {});
          const flatModules = moduleValues.flat ? moduleValues.flat() : [];
          const allModules = flatModules.filter ? flatModules.filter(Boolean) : [];
          
          console.log('👨‍🏫 Lecturer - Total modules loaded:', allModules.length);
          return allModules;
        } catch (error) {
          console.error('❌ Error processing lecturer modules:', error);
          return [];
        }
      } else {
        try {
          const studentLevel = user.academicLevel || '100';
          const modules = csModules[studentLevel] || csModules['100'] || [];
          
          console.log(`👨‍🎓 Student Level ${studentLevel} - Modules loaded:`, modules.length);
          return Array.isArray(modules) ? modules : [];
        } catch (error) {
          console.error('❌ Error processing student modules:', error);
          return [];
        }
      }
    } catch (error) {
      console.error('❌ Critical error in getCoursesForUser:', error);
      return [];
    }
  };

  // Create context value with error handling
  let contextValue;
  try {
    contextValue = {
      // User and authentication state
      user,
      setUser,
      isAuthenticated,
      isLoading,
      
      // Authentication methods
      signIn,
      signUp,
      signOut,
      sendPasswordReset,
      updateUserData,
      
      // App state
      notifications: notifications || [],
      setNotifications,
      chatMessages: chatMessages || [],
      setChatMessages,
      csModules: getCoursesForUser(),
    };
    
    console.log('🔧 Context value created successfully:', {
      hasUser: !!contextValue.user,
      userType: contextValue.user?.userType,
      modulesCount: contextValue.csModules?.length || 0,
      notificationsCount: contextValue.notifications?.length || 0,
      chatMessagesCount: contextValue.chatMessages?.length || 0
    });
  } catch (error) {
    console.error('❌ Error creating context value:', error);
    contextValue = {
      user: null,
      setUser: () => {},
      isAuthenticated: false,
      isLoading: true,
      signIn: async () => ({ success: false, error: 'Context error' }),
      signUp: async () => ({ success: false, error: 'Context error' }),
      signOut: async () => ({ success: false, error: 'Context error' }),
      sendPasswordReset: async () => ({ success: false, error: 'Context error' }),
      updateUserData: async () => ({ success: false, error: 'Context error' }),
      notifications: [],
      setNotifications: () => {},
      chatMessages: [],
      setChatMessages: () => {},
      csModules: [],
    };
  }

  return <AppContext.Provider value={contextValue}>{children}</AppContext.Provider>;
};
