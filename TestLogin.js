import React from 'react';
import { View } from 'react-native';
import { ThemeProvider } from './components/ThemeProvider';
import { AppProvider } from './context/AppContext';
import LoginScreen from './screens/LoginScreen';
import ErrorBoundary from './components/ErrorBoundary';

// Simple test component to view the modernized login screen
export default function TestLogin() {
  const mockNavigation = {
    navigate: (screen) => console.log(`Navigate to: ${screen}`),
  };

  const mockOnLogin = () => {
    console.log('Login pressed!');
  };

  return (
    <ErrorBoundary>
      <ThemeProvider>
        <AppProvider>
          <View style={{ flex: 1 }}>
            <LoginScreen 
              navigation={mockNavigation} 
              onLogin={mockOnLogin} 
            />
          </View>
        </AppProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}
