import React, { useRef, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  Animated,
  StyleSheet,
  Dimensions,
  Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from './ThemeProvider';
import { Colors, Typography, Spacing, BorderRadius, Shadows, Animations } from '../themes/modernTheme';

const { width } = Dimensions.get('window');

// Modern Button Component with micro-interactions
export const ModernButton = ({ 
  children, 
  variant = 'primary', 
  size = 'medium',
  onPress, 
  disabled = false,
  loading = false,
  icon,
  gradient,
  style,
  ...props 
}) => {
  const { theme, isDark } = useTheme();
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const opacityAnim = useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    Animated.parallel([
      Animated.spring(scaleAnim, {
        toValue: 0.95,
        ...Animations.spring.gentle,
      }),
      Animated.timing(opacityAnim, {
        toValue: 0.8,
        duration: Animations.timing.fast,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const handlePressOut = () => {
    Animated.parallel([
      Animated.spring(scaleAnim, {
        toValue: 1,
        ...Animations.spring.gentle,
      }),
      Animated.timing(opacityAnim, {
        toValue: 1,
        duration: Animations.timing.fast,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const getButtonStyle = () => {
    const baseStyle = {
      ...theme.components.button.base,
      opacity: disabled ? 0.5 : 1,
    };

    const sizeStyles = {
      small: { paddingVertical: Spacing.sm, paddingHorizontal: Spacing.md, minHeight: 36 },
      medium: { paddingVertical: Spacing.md, paddingHorizontal: Spacing.lg, minHeight: 44 },
      large: { paddingVertical: Spacing.lg, paddingHorizontal: Spacing.xl, minHeight: 52 },
    };

    return {
      ...baseStyle,
      ...sizeStyles[size],
      ...theme.components.button[variant],
    };
  };

  const ButtonContent = () => (
    <View style={styles.buttonContent}>
      {icon && (
        <Ionicons 
          name={icon} 
          size={size === 'small' ? 16 : size === 'large' ? 24 : 20} 
          color={variant.includes('outline') ? Colors.primary[600] : '#FFFFFF'}
          style={children ? { marginRight: Spacing.sm } : {}}
        />
      )}
      {typeof children === 'string' ? (
        <Text style={[
          styles.buttonText,
          { 
            fontSize: size === 'small' ? Typography.sizes.sm : size === 'large' ? Typography.sizes.lg : Typography.sizes.base,
            color: variant.includes('outline') ? Colors.primary[600] : '#FFFFFF',
            fontWeight: Typography.weights.semibold,
          }
        ]}>
          {children}
        </Text>
      ) : children}
      {loading && (
        <Animated.View style={[styles.loadingIndicator, { marginLeft: children ? Spacing.sm : 0 }]}>
          <Ionicons name="reload" size={16} color="#FFFFFF" />
        </Animated.View>
      )}
    </View>
  );

  if (gradient) {
    return (
      <Animated.View 
        style={[
          { transform: [{ scale: scaleAnim }], opacity: opacityAnim },
          style
        ]}
      >
        <TouchableOpacity
          onPressIn={handlePressIn}
          onPressOut={handlePressOut}
          onPress={disabled ? undefined : onPress}
          disabled={disabled || loading}
          activeOpacity={1}
          {...props}
        >
          <LinearGradient
            colors={gradient}
            style={[getButtonStyle(), { backgroundColor: 'transparent' }]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
          >
            <ButtonContent />
          </LinearGradient>
        </TouchableOpacity>
      </Animated.View>
    );
  }

  return (
    <Animated.View 
      style={[
        { transform: [{ scale: scaleAnim }], opacity: opacityAnim },
        style
      ]}
    >
      <TouchableOpacity
        style={getButtonStyle()}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        onPress={disabled ? undefined : onPress}
        disabled={disabled || loading}
        activeOpacity={1}
        {...props}
      >
        <ButtonContent />
      </TouchableOpacity>
    </Animated.View>
  );
};

// Modern Card Component with glassmorphism
export const ModernCard = ({ 
  children, 
  variant = 'base',
  interactive = false,
  onPress,
  style,
  ...props 
}) => {
  const { theme, isDark } = useTheme();
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const shadowAnim = useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    if (interactive) {
      Animated.parallel([
        Animated.spring(scaleAnim, {
          toValue: 0.98,
          ...Animations.spring.gentle,
        }),
        Animated.timing(shadowAnim, {
          toValue: 1.5,
          duration: Animations.timing.fast,
          useNativeDriver: false,
        }),
      ]).start();
    }
  };

  const handlePressOut = () => {
    if (interactive) {
      Animated.parallel([
        Animated.spring(scaleAnim, {
          toValue: 1,
          ...Animations.spring.gentle,
        }),
        Animated.timing(shadowAnim, {
          toValue: 1,
          duration: Animations.timing.fast,
          useNativeDriver: false,
        }),
      ]).start();
    }
  };

  const cardStyle = {
    ...theme.components.card[variant],
    ...(interactive && theme.components.card.interactive),
  };

  if (variant === 'glass') {
    return (
      <Animated.View 
        style={[
          { transform: [{ scale: scaleAnim }] },
          style
        ]}
      >
        <TouchableOpacity
          onPressIn={handlePressIn}
          onPressOut={handlePressOut}
          onPress={onPress}
          disabled={!interactive}
          activeOpacity={1}
          {...props}
        >
          <BlurView intensity={20} style={cardStyle}>
            {children}
          </BlurView>
        </TouchableOpacity>
      </Animated.View>
    );
  }

  if (interactive && onPress) {
    return (
      <Animated.View 
        style={[
          { transform: [{ scale: scaleAnim }] },
          style
        ]}
      >
        <TouchableOpacity
          style={cardStyle}
          onPressIn={handlePressIn}
          onPressOut={handlePressOut}
          onPress={onPress}
          activeOpacity={1}
          {...props}
        >
          {children}
        </TouchableOpacity>
      </Animated.View>
    );
  }

  return (
    <View style={[cardStyle, style]} {...props}>
      {children}
    </View>
  );
};

// Modern Input Component with floating labels
export const ModernInput = ({ 
  label,
  value,
  onChangeText,
  error,
  success,
  icon,
  rightIcon,
  onRightIconPress,
  variant = 'base',
  style,
  ...props 
}) => {
  const { theme, isDark } = useTheme();
  const labelAnim = useRef(new Animated.Value(value ? 1 : 0)).current;
  const borderColorAnim = useRef(new Animated.Value(0)).current;
  const isFocused = useRef(false);

  useEffect(() => {
    Animated.timing(labelAnim, {
      toValue: value || isFocused.current ? 1 : 0,
      duration: Animations.timing.normal,
      useNativeDriver: false,
    }).start();
  }, [value]);

  const handleFocus = () => {
    isFocused.current = true;
    Animated.parallel([
      Animated.timing(labelAnim, {
        toValue: 1,
        duration: Animations.timing.normal,
        useNativeDriver: false,
      }),
      Animated.timing(borderColorAnim, {
        toValue: 1,
        duration: Animations.timing.normal,
        useNativeDriver: false,
      }),
    ]).start();
  };

  const handleBlur = () => {
    isFocused.current = false;
    Animated.parallel([
      Animated.timing(labelAnim, {
        toValue: value ? 1 : 0,
        duration: Animations.timing.normal,
        useNativeDriver: false,
      }),
      Animated.timing(borderColorAnim, {
        toValue: 0,
        duration: Animations.timing.normal,
        useNativeDriver: false,
      }),
    ]).start();
  };

  const getInputStyle = () => {
    let inputStyle = theme.components.input[variant];
    
    if (error) {
      inputStyle = { ...inputStyle, ...theme.components.input.error };
    } else if (success) {
      inputStyle = { ...inputStyle, ...theme.components.input.success };
    }
    
    return inputStyle;
  };

  const animatedBorderColor = borderColorAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [Colors.neutral[200], Colors.primary[500]],
  });

  const animatedLabelStyle = {
    position: 'absolute',
    left: Spacing.lg,
    top: labelAnim.interpolate({
      inputRange: [0, 1],
      outputRange: [16, -8],
    }),
    fontSize: labelAnim.interpolate({
      inputRange: [0, 1],
      outputRange: [Typography.sizes.base, Typography.sizes.sm],
    }),
    color: labelAnim.interpolate({
      inputRange: [0, 1],
      outputRange: [Colors.neutral[400], Colors.primary[600]],
    }),
    backgroundColor: theme.colors.bg,
    paddingHorizontal: Spacing.xs,
    zIndex: 1,
  };

  return (
    <View style={[styles.inputContainer, style]}>
      {label && (
        <Animated.Text style={animatedLabelStyle}>
          {label}
        </Animated.Text>
      )}
      <Animated.View style={[getInputStyle(), { borderColor: animatedBorderColor }]}>
        {icon && (
          <Ionicons 
            name={icon} 
            size={20} 
            color={Colors.neutral[400]} 
            style={styles.inputIcon}
          />
        )}
        <TextInput
          style={[styles.textInput, { flex: 1 }]}
          value={value}
          onChangeText={onChangeText}
          onFocus={handleFocus}
          onBlur={handleBlur}
          placeholderTextColor={Colors.neutral[400]}
          {...props}
        />
        {rightIcon && (
          <TouchableOpacity onPress={onRightIconPress} style={styles.rightIcon}>
            <Ionicons 
              name={rightIcon} 
              size={20} 
              color={Colors.neutral[400]} 
            />
          </TouchableOpacity>
        )}
      </Animated.View>
      {error && (
        <Text style={styles.errorText}>{error}</Text>
      )}
      {success && (
        <Text style={styles.successText}>{success}</Text>
      )}
    </View>
  );
};

// Modern Badge Component
export const ModernBadge = ({ 
  children, 
  variant = 'primary',
  size = 'medium',
  style,
  ...props 
}) => {
  const { theme } = useTheme();
  
  const sizeStyles = {
    small: { paddingHorizontal: Spacing.xs, paddingVertical: 2 },
    medium: { paddingHorizontal: Spacing.sm, paddingVertical: Spacing.xs },
    large: { paddingHorizontal: Spacing.md, paddingVertical: Spacing.sm },
  };

  const textSizes = {
    small: Typography.sizes.xs,
    medium: Typography.sizes.sm,
    large: Typography.sizes.base,
  };

  return (
    <View 
      style={[
        theme.components.badge.base,
        theme.components.badge[variant],
        sizeStyles[size],
        style
      ]} 
      {...props}
    >
      <Text style={[
        styles.badgeText, 
        { 
          fontSize: textSizes[size],
          color: Colors[variant][700],
          fontWeight: Typography.weights.medium,
        }
      ]}>
        {children}
      </Text>
    </View>
  );
};

// Modern Floating Action Button
export const ModernFAB = ({ 
  icon,
  onPress,
  variant = 'primary',
  size = 'medium',
  style,
  ...props 
}) => {
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 0.9,
      ...Animations.spring.gentle,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      ...Animations.spring.bouncy,
    }).start();
  };

  const sizeStyles = {
    small: { width: 40, height: 40 },
    medium: { width: 56, height: 56 },
    large: { width: 64, height: 64 },
  };

  const iconSizes = {
    small: 20,
    medium: 24,
    large: 28,
  };

  return (
    <Animated.View style={[{ transform: [{ scale: scaleAnim }] }, style]}>
      <TouchableOpacity
        style={[
          styles.fab,
          sizeStyles[size],
          { backgroundColor: Colors[variant][600] },
          Shadows.xl,
        ]}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        onPress={onPress}
        activeOpacity={1}
        {...props}
      >
        <Ionicons 
          name={icon} 
          size={iconSizes[size]} 
          color="#FFFFFF" 
        />
      </TouchableOpacity>
    </Animated.View>
  );
};

// Modern List Item Component
export const ModernListItem = ({ 
  title,
  subtitle,
  leftIcon,
  rightIcon,
  onPress,
  style,
  ...props 
}) => {
  const { theme } = useTheme();
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 0.98,
      ...Animations.spring.gentle,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      ...Animations.spring.gentle,
    }).start();
  };

  return (
    <Animated.View style={[{ transform: [{ scale: scaleAnim }] }, style]}>
      <TouchableOpacity
        style={[theme.components.listItem.base]}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        onPress={onPress}
        activeOpacity={1}
        {...props}
      >
        <View style={styles.listItemContent}>
          {leftIcon && (
            <View style={styles.listItemIcon}>
              <Ionicons name={leftIcon} size={24} color={Colors.primary[600]} />
            </View>
          )}
          <View style={styles.listItemText}>
            <Text style={styles.listItemTitle}>{title}</Text>
            {subtitle && (
              <Text style={styles.listItemSubtitle}>{subtitle}</Text>
            )}
          </View>
          {rightIcon && (
            <Ionicons name={rightIcon} size={20} color={Colors.neutral[400]} />
          )}
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  // Button Styles
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    fontFamily: Typography.fonts.primary,
    textAlign: 'center',
  },
  loadingIndicator: {
    opacity: 0.8,
  },

  // Input Styles
  inputContainer: {
    marginVertical: Spacing.sm,
  },
  textInput: {
    fontFamily: Typography.fonts.secondary,
    fontSize: Typography.sizes.base,
    color: Colors.neutral[900],
    paddingVertical: 0, // Remove default padding
  },
  inputIcon: {
    marginRight: Spacing.sm,
  },
  rightIcon: {
    marginLeft: Spacing.sm,
    padding: Spacing.xs,
  },
  errorText: {
    fontSize: Typography.sizes.sm,
    color: Colors.error[600],
    marginTop: Spacing.xs,
    marginLeft: Spacing.sm,
    fontFamily: Typography.fonts.secondary,
  },
  successText: {
    fontSize: Typography.sizes.sm,
    color: Colors.success[600],
    marginTop: Spacing.xs,
    marginLeft: Spacing.sm,
    fontFamily: Typography.fonts.secondary,
  },

  // Badge Styles
  badgeText: {
    fontFamily: Typography.fonts.secondary,
    textAlign: 'center',
  },

  // FAB Styles
  fab: {
    borderRadius: BorderRadius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },

  // List Item Styles
  listItemContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  listItemIcon: {
    marginRight: Spacing.md,
  },
  listItemText: {
    flex: 1,
  },
  listItemTitle: {
    fontSize: Typography.sizes.base,
    fontWeight: Typography.weights.medium,
    color: Colors.neutral[900],
    fontFamily: Typography.fonts.primary,
  },
  listItemSubtitle: {
    fontSize: Typography.sizes.sm,
    color: Colors.neutral[600],
    marginTop: 2,
    fontFamily: Typography.fonts.secondary,
  },
});

export default {
  ModernButton,
  ModernCard,
  ModernInput,
  ModernBadge,
  ModernFAB,
  ModernListItem,
};
