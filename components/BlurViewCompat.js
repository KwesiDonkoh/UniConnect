import React from 'react';
import { View, Platform } from 'react-native';
import { BlurView } from 'expo-blur';
import { useTheme } from './ThemeProvider';
import { Colors } from '../themes/modernTheme';

// Compatible BlurView component with fallback for unsupported platforms
export const BlurViewCompat = ({ 
  children, 
  intensity = 20, 
  style, 
  fallbackColor,
  ...props 
}) => {
  const { isDark } = useTheme();

  // Check if BlurView is supported
  const isBlurSupported = Platform.OS === 'ios' || Platform.OS === 'android';

  if (isBlurSupported) {
    try {
      return (
        <BlurView
          intensity={intensity}
          style={style}
          tint={isDark ? 'dark' : 'light'}
          {...props}
        >
          {children}
        </BlurView>
      );
    } catch (error) {
      console.warn('BlurView not supported, falling back to solid background:', error);
    }
  }

  // Fallback for unsupported platforms or when BlurView fails
  const fallbackStyle = {
    ...style,
    backgroundColor: fallbackColor || (isDark ? Colors.dark.glass : Colors.light.glass),
  };

  return (
    <View style={fallbackStyle} {...props}>
      {children}
    </View>
  );
};

export default BlurViewCompat;
