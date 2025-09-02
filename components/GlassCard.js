import React from 'react';
import { View, Platform } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from './ThemeProvider';
import { Colors, BorderRadius, Shadows } from '../themes/modernTheme';

// Glass effect card without expo-blur dependency
export const GlassCard = ({ 
  children, 
  style, 
  intensity = 'medium',
  ...props 
}) => {
  const { isDark } = useTheme();

  const getGlassStyle = () => {
    const baseStyle = {
      borderRadius: BorderRadius.xl,
      borderWidth: 1,
      overflow: 'hidden',
      ...Shadows.lg,
    };

    if (isDark) {
      return {
        ...baseStyle,
        backgroundColor: 'rgba(255, 255, 255, 0.05)',
        borderColor: 'rgba(255, 255, 255, 0.1)',
      };
    } else {
      return {
        ...baseStyle,
        backgroundColor: 'rgba(255, 255, 255, 0.7)',
        borderColor: 'rgba(255, 255, 255, 0.2)',
      };
    }
  };

  // Create a subtle gradient overlay for glass effect
  const gradientColors = isDark 
    ? ['rgba(255, 255, 255, 0.08)', 'rgba(255, 255, 255, 0.02)']
    : ['rgba(255, 255, 255, 0.9)', 'rgba(255, 255, 255, 0.6)'];

  return (
    <View style={[getGlassStyle(), style]} {...props}>
      <LinearGradient
        colors={gradientColors}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={{ flex: 1, padding: 0 }}
      >
        <View style={{ flex: 1 }}>
          {children}
        </View>
      </LinearGradient>
    </View>
  );
};

export default GlassCard;
