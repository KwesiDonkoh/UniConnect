import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Dimensions,
  ScrollView,
  ActivityIndicator,
  Alert,
  Vibration,
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from './ThemeProvider';

const { width } = Dimensions.get('window');

// Modern Button Component
export const ModernButton = ({
  title,
  onPress,
  variant = 'primary',
  size = 'medium',
  icon,
  iconPosition = 'left',
  loading = false,
  disabled = false,
  gradient = false,
  style,
  textStyle,
  ...props
}) => {
  const { theme } = useTheme();
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 0.96,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      useNativeDriver: true,
    }).start();
  };

  const handlePress = () => {
    Vibration.vibrate(50);
    onPress && onPress();
  };

  const buttonStyles = [
    styles.button,
    styles[`button${size.charAt(0).toUpperCase() + size.slice(1)}`],
    styles[`button${variant.charAt(0).toUpperCase() + variant.slice(1)}`],
    disabled && styles.buttonDisabled,
    style,
  ];

  const ButtonContent = () => (
    <View style={styles.buttonContent}>
      {icon && iconPosition === 'left' && (
        <Ionicons 
          name={icon} 
          size={size === 'small' ? 16 : size === 'large' ? 24 : 20} 
          color={variant === 'secondary' ? theme.colors.text : '#FFFFFF'}
          style={styles.buttonIconLeft}
        />
      )}
      {loading ? (
        <ActivityIndicator 
          size="small" 
          color={variant === 'secondary' ? theme.colors.text : '#FFFFFF'} 
        />
      ) : (
        <Text style={[styles.buttonText, styles[`buttonText${variant.charAt(0).toUpperCase() + variant.slice(1)}`], textStyle]}>
          {title}
        </Text>
      )}
      {icon && iconPosition === 'right' && (
        <Ionicons 
          name={icon} 
          size={size === 'small' ? 16 : size === 'large' ? 24 : 20} 
          color={variant === 'secondary' ? theme.colors.text : '#FFFFFF'}
          style={styles.buttonIconRight}
        />
      )}
    </View>
  );

  if (gradient && (variant === 'primary' || variant === 'success')) {
    return (
      <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
        <TouchableOpacity
          onPressIn={handlePressIn}
          onPressOut={handlePressOut}
          onPress={handlePress}
          disabled={disabled || loading}
          activeOpacity={0.8}
          {...props}
        >
          <LinearGradient
            colors={variant === 'success' ? ['#10B981', '#059669'] : ['#6366F1', '#8B5CF6']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={buttonStyles}
          >
            <ButtonContent />
          </LinearGradient>
        </TouchableOpacity>
      </Animated.View>
    );
  }

  return (
    <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
      <TouchableOpacity
        style={buttonStyles}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        onPress={handlePress}
        disabled={disabled || loading}
        activeOpacity={0.8}
        {...props}
      >
        <ButtonContent />
      </TouchableOpacity>
    </Animated.View>
  );
};

// Modern Card Component
export const ModernCard = ({ 
  children, 
  style, 
  elevated = false, 
  gradient = false,
  gradientColors,
  onPress,
  ...props 
}) => {
  const { theme } = useTheme();
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    if (onPress) {
      Animated.spring(scaleAnim, {
        toValue: 0.98,
        useNativeDriver: true,
      }).start();
    }
  };

  const handlePressOut = () => {
    if (onPress) {
      Animated.spring(scaleAnim, {
        toValue: 1,
        useNativeDriver: true,
      }).start();
    }
  };

  const cardStyles = [
    styles.card,
    elevated && styles.cardElevated,
    { backgroundColor: theme.colors.card },
    style,
  ];

  const CardContent = () => <View style={cardStyles}>{children}</View>;

  if (gradient) {
    return (
      <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
        {onPress ? (
          <TouchableOpacity
            onPressIn={handlePressIn}
            onPressOut={handlePressOut}
            onPress={onPress}
            activeOpacity={0.9}
            {...props}
          >
            <LinearGradient
              colors={gradientColors || ['#6366F1', '#8B5CF6']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={cardStyles}
            >
              {children}
            </LinearGradient>
          </TouchableOpacity>
        ) : (
          <LinearGradient
            colors={gradientColors || ['#6366F1', '#8B5CF6']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={cardStyles}
          >
            {children}
          </LinearGradient>
        )}
      </Animated.View>
    );
  }

  if (onPress) {
    return (
      <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
        <TouchableOpacity
          style={cardStyles}
          onPressIn={handlePressIn}
          onPressOut={handlePressOut}
          onPress={onPress}
          activeOpacity={0.9}
          {...props}
        >
          {children}
        </TouchableOpacity>
      </Animated.View>
    );
  }

  return <CardContent />;
};

// Modern Badge Component
export const ModernBadge = ({ 
  text, 
  variant = 'primary', 
  size = 'medium',
  style,
  textStyle 
}) => {
  const { theme } = useTheme();

  const badgeStyles = [
    styles.badge,
    styles[`badge${variant.charAt(0).toUpperCase() + variant.slice(1)}`],
    styles[`badge${size.charAt(0).toUpperCase() + size.slice(1)}`],
    style,
  ];

  return (
    <View style={badgeStyles}>
      <Text style={[styles.badgeText, styles[`badgeText${variant.charAt(0).toUpperCase() + variant.slice(1)}`], textStyle]}>
        {text}
      </Text>
    </View>
  );
};

// Modern Avatar Component
export const ModernAvatar = ({ 
  source, 
  name, 
  size = 40, 
  online = false,
  style,
  onPress 
}) => {
  const { theme } = useTheme();
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    if (onPress) {
      Animated.spring(scaleAnim, {
        toValue: 0.9,
        useNativeDriver: true,
      }).start();
    }
  };

  const handlePressOut = () => {
    if (onPress) {
      Animated.spring(scaleAnim, {
        toValue: 1,
        useNativeDriver: true,
      }).start();
    }
  };

  const avatarStyle = [
    styles.avatar,
    { 
      width: size, 
      height: size, 
      borderRadius: size / 2,
      backgroundColor: theme.colors.surface,
    },
    style,
  ];

  const getInitials = (name) => {
    if (!name) return 'U';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  const AvatarContent = () => (
    <View style={avatarStyle}>
      {source ? (
        <Image source={source} style={avatarStyle} />
      ) : (
        <View style={[avatarStyle, { justifyContent: 'center', alignItems: 'center' }]}>
          <Text style={[styles.avatarText, { fontSize: size * 0.4, color: theme.colors.text }]}>
            {getInitials(name)}
          </Text>
        </View>
      )}
      {online && (
        <View style={[styles.onlineIndicator, { 
          width: size * 0.25, 
          height: size * 0.25, 
          borderRadius: size * 0.125,
          bottom: size * 0.05,
          right: size * 0.05,
        }]} />
      )}
    </View>
  );

  if (onPress) {
    return (
      <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
        <TouchableOpacity
          onPressIn={handlePressIn}
          onPressOut={handlePressOut}
          onPress={onPress}
          activeOpacity={0.8}
        >
          <AvatarContent />
        </TouchableOpacity>
      </Animated.View>
    );
  }

  return <AvatarContent />;
};

// Modern Progress Bar
export const ModernProgressBar = ({ 
  progress = 0, 
  color, 
  backgroundColor,
  height = 8,
  animated = true,
  style 
}) => {
  const { theme } = useTheme();
  const progressAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (animated) {
      Animated.timing(progressAnim, {
        toValue: progress,
        duration: 500,
        useNativeDriver: false,
      }).start();
    } else {
      progressAnim.setValue(progress);
    }
  }, [progress, animated]);

  return (
    <View style={[
      styles.progressBar,
      { 
        height,
        backgroundColor: backgroundColor || theme.colors.surface,
      },
      style,
    ]}>
      <Animated.View
        style={[
          styles.progressFill,
          {
            height,
            backgroundColor: color || theme.colors.accent,
            width: progressAnim.interpolate({
              inputRange: [0, 1],
              outputRange: ['0%', '100%'],
            }),
          },
        ]}
      />
    </View>
  );
};

// Modern Floating Action Button
export const ModernFAB = ({ 
  icon, 
  onPress, 
  variant = 'primary',
  size = 'medium',
  style 
}) => {
  const { theme } = useTheme();
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;

  const handlePressIn = () => {
    Animated.parallel([
      Animated.spring(scaleAnim, {
        toValue: 0.9,
        useNativeDriver: true,
      }),
      Animated.timing(rotateAnim, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const handlePressOut = () => {
    Animated.parallel([
      Animated.spring(scaleAnim, {
        toValue: 1,
        useNativeDriver: true,
      }),
      Animated.timing(rotateAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const handlePress = () => {
    Vibration.vibrate(50);
    onPress && onPress();
  };

  const fabSize = size === 'small' ? 48 : size === 'large' ? 64 : 56;
  const iconSize = size === 'small' ? 20 : size === 'large' ? 28 : 24;

  const rotate = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '15deg'],
  });

  return (
    <Animated.View style={[
      { transform: [{ scale: scaleAnim }, { rotate }] },
      style,
    ]}>
      <TouchableOpacity
        style={[
          styles.fab,
          styles[`fab${variant.charAt(0).toUpperCase() + variant.slice(1)}`],
          {
            width: fabSize,
            height: fabSize,
            borderRadius: fabSize / 2,
          },
        ]}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        onPress={handlePress}
        activeOpacity={0.8}
      >
        <LinearGradient
          colors={variant === 'primary' ? ['#6366F1', '#8B5CF6'] : ['#10B981', '#059669']}
          style={[styles.fabGradient, {
            width: fabSize,
            height: fabSize,
            borderRadius: fabSize / 2,
          }]}
        >
          <Ionicons name={icon} size={iconSize} color="#FFFFFF" />
        </LinearGradient>
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  // Button Styles
  button: {
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  buttonSmall: {
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  buttonMedium: {
    paddingVertical: 12,
    paddingHorizontal: 24,
  },
  buttonLarge: {
    paddingVertical: 16,
    paddingHorizontal: 32,
  },
  buttonPrimary: {
    backgroundColor: '#6366F1',
  },
  buttonSecondary: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  buttonSuccess: {
    backgroundColor: '#10B981',
  },
  buttonWarning: {
    backgroundColor: '#F59E0B',
  },
  buttonError: {
    backgroundColor: '#EF4444',
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  buttonTextSecondary: {
    color: '#374151',
  },
  buttonIconLeft: {
    marginRight: 8,
  },
  buttonIconRight: {
    marginLeft: 8,
  },

  // Card Styles
  card: {
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  cardElevated: {
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 15,
    elevation: 8,
  },

  // Badge Styles
  badge: {
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
    alignSelf: 'flex-start',
  },
  badgeSmall: {
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  badgeMedium: {
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  badgeLarge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  badgePrimary: {
    backgroundColor: '#EEF2FF',
  },
  badgeSuccess: {
    backgroundColor: '#ECFDF5',
  },
  badgeWarning: {
    backgroundColor: '#FFFBEB',
  },
  badgeError: {
    backgroundColor: '#FEF2F2',
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '600',
  },
  badgeTextPrimary: {
    color: '#4338CA',
  },
  badgeTextSuccess: {
    color: '#047857',
  },
  badgeTextWarning: {
    color: '#B45309',
  },
  badgeTextError: {
    color: '#B91C1C',
  },

  // Avatar Styles
  avatar: {
    position: 'relative',
    overflow: 'hidden',
  },
  avatarText: {
    fontWeight: '600',
  },
  onlineIndicator: {
    position: 'absolute',
    backgroundColor: '#10B981',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },

  // Progress Bar Styles
  progressBar: {
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    borderRadius: 4,
  },

  // FAB Styles
  fab: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 15,
    elevation: 8,
  },
  fabPrimary: {
    backgroundColor: '#6366F1',
  },
  fabSuccess: {
    backgroundColor: '#10B981',
  },
  fabGradient: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default {
  ModernButton,
  ModernCard,
  ModernBadge,
  ModernAvatar,
  ModernProgressBar,
  ModernFAB,
};
