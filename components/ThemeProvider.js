import React, { createContext, useContext, useState, useEffect } from 'react';
import { Appearance } from 'react-native';
import { StatusBar } from 'expo-status-bar'; // Fix: Use expo-status-bar instead
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LightTheme, DarkTheme } from '../themes/modernTheme';

const ThemeContext = createContext();

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

export const ThemeProvider = ({ children }) => {
  const [isDark, setIsDark] = useState(false);
  const [theme, setTheme] = useState(LightTheme);

  useEffect(() => {
    loadTheme();
    
    // Listen to system theme changes
    const subscription = Appearance.addChangeListener(({ colorScheme }) => {
      if (colorScheme === 'dark') {
        switchToDark();
      } else {
        switchToLight();
      }
    });

    return () => subscription?.remove?.();
  }, []);

  const loadTheme = async () => {
    try {
      const savedTheme = await AsyncStorage.getItem('theme');
      if (savedTheme === 'dark') {
        switchToDark();
      } else if (savedTheme === 'light') {
        switchToLight();
      } else {
        // Follow system theme
        const systemTheme = Appearance.getColorScheme();
        if (systemTheme === 'dark') {
          switchToDark();
        } else {
          switchToLight();
        }
      }
    } catch (error) {
      console.error('Error loading theme:', error);
    }
  };

  const switchToLight = async () => {
    setIsDark(false);
    setTheme(LightTheme);
    StatusBar.setBarStyle('dark-content');
    try {
      await AsyncStorage.setItem('theme', 'light');
    } catch (error) {
      console.error('Error saving theme:', error);
    }
  };

  const switchToDark = async () => {
    setIsDark(true);
    setTheme(DarkTheme);
    StatusBar.setBarStyle('light-content');
    try {
      await AsyncStorage.setItem('theme', 'dark');
    } catch (error) {
      console.error('Error saving theme:', error);
    }
  };

  const toggleTheme = () => {
    if (isDark) {
      switchToLight();
    } else {
      switchToDark();
    }
  };

  const value = {
    theme,
    isDark,
    toggleTheme,
    switchToLight,
    switchToDark,
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};
