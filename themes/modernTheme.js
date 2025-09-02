import { Dimensions, Platform } from 'react-native';

const { width, height } = Dimensions.get('window');

// Ultra-Modern Color Palette - 2024 Design System
export const Colors = {
  // Primary Brand Colors - Enhanced with modern gradients
  primary: {
    50: '#F0F4FF',
    100: '#E5EDFF',
    200: '#C7D7FE',
    300: '#A5B8FC',
    400: '#8B95F8',
    500: '#6366F1', // Main brand color
    600: '#5B5DF1',
    700: '#4F46E5',
    800: '#4338CA',
    900: '#3730A3',
    950: '#2D1B69',
  },
  
  // Secondary Colors
  secondary: {
    50: '#FDF4FF',
    100: '#FAE8FF',
    200: '#F5D0FE',
    300: '#F0ABFC',
    400: '#E879F9',
    500: '#D946EF',
    600: '#C026D3',
    700: '#A21CAF',
    800: '#86198F',
    900: '#701A75',
  },
  
  // Success Colors
  success: {
    50: '#ECFDF5',
    100: '#D1FAE5',
    200: '#A7F3D0',
    300: '#6EE7B7',
    400: '#34D399',
    500: '#10B981',
    600: '#059669',
    700: '#047857',
    800: '#065F46',
    900: '#064E3B',
  },
  
  // Warning Colors
  warning: {
    50: '#FFFBEB',
    100: '#FEF3C7',
    200: '#FDE68A',
    300: '#FCD34D',
    400: '#FBBF24',
    500: '#F59E0B',
    600: '#D97706',
    700: '#B45309',
    800: '#92400E',
    900: '#78350F',
  },
  
  // Error Colors
  error: {
    50: '#FEF2F2',
    100: '#FEE2E2',
    200: '#FECACA',
    300: '#FCA5A5',
    400: '#F87171',
    500: '#EF4444',
    600: '#DC2626',
    700: '#B91C1C',
    800: '#991B1B',
    900: '#7F1D1D',
  },
  
  // Neutral Colors
  neutral: {
    50: '#FAFAFA',
    100: '#F5F5F5',
    200: '#E5E5E5',
    300: '#D4D4D4',
    400: '#A3A3A3',
    500: '#737373',
    600: '#525252',
    700: '#404040',
    800: '#262626',
    900: '#171717',
  },
  
  // Ultra-Modern Dark Mode Colors
  dark: {
    bg: '#0A0A0F',
    surface: '#12121A',
    surfaceElevated: '#1A1A25',
    card: '#1E1E2E',
    cardElevated: '#252538',
    border: '#2A2A40',
    borderSubtle: '#1F1F35',
    text: '#FFFFFF',
    textSecondary: '#B4B4CC',
    textTertiary: '#8B8BA3',
    accent: '#6366F1',
    accentHover: '#7C7CF5',
    overlay: 'rgba(0, 0, 0, 0.8)',
    glass: 'rgba(255, 255, 255, 0.05)',
    glassBorder: 'rgba(255, 255, 255, 0.1)',
  },
  
  // Ultra-Modern Light Mode Colors
  light: {
    bg: '#FEFEFE',
    surface: '#F8FAFC',
    surfaceElevated: '#FFFFFF',
    card: '#FFFFFF',
    cardElevated: '#F8FAFC',
    border: '#E2E8F0',
    borderSubtle: '#F1F5F9',
    text: '#0F172A',
    textSecondary: '#475569',
    textTertiary: '#64748B',
    accent: '#6366F1',
    accentHover: '#5B5DF1',
    overlay: 'rgba(15, 23, 42, 0.8)',
    glass: 'rgba(255, 255, 255, 0.7)',
    glassBorder: 'rgba(255, 255, 255, 0.2)',
  },
  
  // Ultra-Modern Gradient System
  gradients: {
    // Primary gradients
    primary: ['#6366F1', '#8B5CF6'],
    primarySubtle: ['#F0F4FF', '#E5EDFF'],
    primaryReverse: ['#8B5CF6', '#6366F1'],
    
    // Secondary gradients
    secondary: ['#EC4899', '#8B5CF6'],
    secondarySubtle: ['#FDF4FF', '#FAE8FF'],
    
    // Status gradients
    success: ['#10B981', '#059669'],
    successSubtle: ['#ECFDF5', '#D1FAE5'],
    warning: ['#F59E0B', '#EF4444'],
    warningSubtle: ['#FFFBEB', '#FEF3C7'],
    error: ['#EF4444', '#DC2626'],
    errorSubtle: ['#FEF2F2', '#FEE2E2'],
    
    // Themed gradients
    sunset: ['#F97316', '#EF4444', '#EC4899'],
    ocean: ['#0EA5E9', '#3B82F6', '#6366F1'],
    forest: ['#059669', '#10B981', '#22C55E'],
    cosmic: ['#7C3AED', '#8B5CF6', '#EC4899'],
    aurora: ['#10B981', '#0EA5E9', '#8B5CF6'],
    
    // Glass effects
    glass: ['rgba(255, 255, 255, 0.1)', 'rgba(255, 255, 255, 0.05)'],
    glassDark: ['rgba(0, 0, 0, 0.1)', 'rgba(0, 0, 0, 0.05)'],
  },
};

// Modern Typography System - Enhanced for 2024
export const Typography = {
  // Font Families - System font stack for optimal performance
  fonts: {
    primary: Platform.select({
      ios: 'SF Pro Display',
      android: 'Roboto',
      default: 'System',
    }),
    secondary: Platform.select({
      ios: 'SF Pro Text',
      android: 'Roboto',
      default: 'System',
    }),
    mono: Platform.select({
      ios: 'SF Mono',
      android: 'Roboto Mono',
      default: 'Courier New',
    }),
  },
  
  // Enhanced Font Sizes with fluid scaling
  sizes: {
    '2xs': 10,
    xs: 12,
    sm: 14,
    base: 16,
    lg: 18,
    xl: 20,
    '2xl': 24,
    '3xl': 28,
    '4xl': 32,
    '5xl': 40,
    '6xl': 48,
    '7xl': 56,
    '8xl': 64,
    '9xl': 72,
  },
  
  // Enhanced Font Weights
  weights: {
    thin: '100',
    extralight: '200',
    light: '300',
    normal: '400',
    medium: '500',
    semibold: '600',
    bold: '700',
    extrabold: '800',
    black: '900',
  },
  
  // Enhanced Line Heights
  lineHeights: {
    none: 1,
    tight: 1.25,
    snug: 1.375,
    normal: 1.5,
    relaxed: 1.625,
    loose: 2,
  },
  
  // Letter Spacing
  letterSpacing: {
    tighter: -0.05,
    tight: -0.025,
    normal: 0,
    wide: 0.025,
    wider: 0.05,
    widest: 0.1,
  },
};

// Spacing System
export const Spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  '2xl': 48,
  '3xl': 64,
  '4xl': 96,
};

// Border Radius
export const BorderRadius = {
  none: 0,
  sm: 4,
  md: 8,
  lg: 12,
  xl: 16,
  '2xl': 24,
  '3xl': 32,
  full: 9999,
};

// Ultra-Modern Shadow & Effects System
export const Shadows = {
  // Subtle shadows
  none: {
    shadowColor: 'transparent',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0,
    shadowRadius: 0,
    elevation: 0,
  },
  xs: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 1,
    elevation: 1,
  },
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
  },
  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 8,
  },
  xl: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 16 },
    shadowOpacity: 0.15,
    shadowRadius: 24,
    elevation: 12,
  },
  '2xl': {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 24 },
    shadowOpacity: 0.2,
    shadowRadius: 32,
    elevation: 16,
  },
  
  // Colored shadows for modern effects
  colored: {
    primary: {
      shadowColor: '#6366F1',
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.25,
      shadowRadius: 16,
      elevation: 8,
    },
    secondary: {
      shadowColor: '#EC4899',
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.25,
      shadowRadius: 16,
      elevation: 8,
    },
    success: {
      shadowColor: '#10B981',
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.25,
      shadowRadius: 16,
      elevation: 8,
    },
    warning: {
      shadowColor: '#F59E0B',
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.25,
      shadowRadius: 16,
      elevation: 8,
    },
    error: {
      shadowColor: '#EF4444',
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.25,
      shadowRadius: 16,
      elevation: 8,
    },
  },
  
  // Modern glass effects
  glass: {
    light: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.1,
      shadowRadius: 12,
      elevation: 4,
    },
    dark: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.3,
      shadowRadius: 12,
      elevation: 4,
    },
  },
  
  // Inner shadows (for pressed states)
  inner: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: -2, // Negative elevation for inner shadow effect
  },
};

// Ultra-Modern Animation System
export const Animations = {
  // Timing values
  timing: {
    instant: 0,
    fast: 150,
    normal: 250,
    medium: 350,
    slow: 500,
    slower: 750,
    slowest: 1000,
  },
  
  // Modern easing curves
  easing: {
    linear: 'linear',
    ease: 'ease',
    easeIn: 'ease-in',
    easeOut: 'ease-out',
    easeInOut: 'ease-in-out',
    // Custom cubic-bezier curves for modern feel
    smooth: 'cubic-bezier(0.4, 0.0, 0.2, 1)',
    bounce: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
    elastic: 'cubic-bezier(0.175, 0.885, 0.32, 1.275)',
  },
  
  // Spring configurations for React Native Animated
  spring: {
    gentle: {
      tension: 120,
      friction: 14,
      useNativeDriver: true,
    },
    wobbly: {
      tension: 180,
      friction: 12,
      useNativeDriver: true,
    },
    stiff: {
      tension: 210,
      friction: 20,
      useNativeDriver: true,
    },
    bouncy: {
      tension: 170,
      friction: 8,
      useNativeDriver: true,
    },
  },
  
  // Micro-interactions
  micro: {
    tap: {
      scale: 0.95,
      duration: 100,
    },
    hover: {
      scale: 1.02,
      duration: 200,
    },
    press: {
      scale: 0.98,
      duration: 150,
    },
  },
};

// Device Dimensions
export const Layout = {
  window: {
    width,
    height,
  },
  isSmallDevice: width < 375,
  isLargeDevice: width > 414,
  headerHeight: 44,
  tabBarHeight: 80,
};

// Ultra-Modern Component System
export const Components = {
  // Enhanced Button Styles
  button: {
    base: {
      borderRadius: BorderRadius.xl,
      paddingVertical: Spacing.md,
      paddingHorizontal: Spacing.xl,
      alignItems: 'center',
      justifyContent: 'center',
      flexDirection: 'row',
      minHeight: 48,
      ...Shadows.sm,
    },
    
    // Primary button variants
    primary: {
      backgroundColor: Colors.primary[600],
      ...Shadows.colored.primary,
    },
    primaryGradient: {
      borderRadius: BorderRadius.xl,
      ...Shadows.colored.primary,
    },
    primaryOutline: {
      backgroundColor: 'transparent',
      borderWidth: 2,
      borderColor: Colors.primary[600],
    },
    primaryGhost: {
      backgroundColor: Colors.primary[50],
    },
    
    // Secondary variants
    secondary: {
      backgroundColor: Colors.neutral[100],
      borderWidth: 1,
      borderColor: Colors.neutral[200],
      ...Shadows.sm,
    },
    secondaryGradient: {
      borderRadius: BorderRadius.xl,
      ...Shadows.sm,
    },
    
    // Status variants
    success: {
      backgroundColor: Colors.success[600],
      ...Shadows.colored.success,
    },
    warning: {
      backgroundColor: Colors.warning[500],
      ...Shadows.colored.warning,
    },
    error: {
      backgroundColor: Colors.error[600],
      ...Shadows.colored.error,
    },
    
    // Modern variants
    glass: {
      backgroundColor: Colors.light.glass,
      borderWidth: 1,
      borderColor: Colors.light.glassBorder,
      backdropFilter: 'blur(10px)',
      ...Shadows.glass.light,
    },
    floating: {
      ...Shadows.xl,
      borderRadius: BorderRadius.full,
      minHeight: 56,
      minWidth: 56,
    },
  },
  
  // Enhanced Card Styles
  card: {
    base: {
      backgroundColor: Colors.light.card,
      borderRadius: BorderRadius['2xl'],
      padding: Spacing.lg,
      borderWidth: 1,
      borderColor: Colors.light.borderSubtle,
      ...Shadows.sm,
    },
    elevated: {
      ...Shadows.lg,
      borderWidth: 0,
    },
    interactive: {
      ...Shadows.md,
      borderWidth: 0,
    },
    glass: {
      backgroundColor: Colors.light.glass,
      borderWidth: 1,
      borderColor: Colors.light.glassBorder,
      backdropFilter: 'blur(20px)',
      ...Shadows.glass.light,
    },
    gradient: {
      borderRadius: BorderRadius['2xl'],
      padding: 1, // For border gradient effect
    },
    floating: {
      ...Shadows['2xl'],
      borderRadius: BorderRadius['3xl'],
    },
  },
  
  // Enhanced Input Styles
  input: {
    base: {
      borderWidth: 1,
      borderColor: Colors.neutral[200],
      borderRadius: BorderRadius.xl,
      paddingHorizontal: Spacing.lg,
      paddingVertical: Spacing.md,
      fontSize: Typography.sizes.base,
      fontFamily: Typography.fonts.secondary,
      backgroundColor: Colors.light.surfaceElevated,
      minHeight: 48,
    },
    focused: {
      borderColor: Colors.primary[500],
      borderWidth: 2,
      backgroundColor: Colors.light.card,
      ...Shadows.colored.primary,
    },
    error: {
      borderColor: Colors.error[500],
      borderWidth: 2,
      backgroundColor: Colors.error[50],
    },
    success: {
      borderColor: Colors.success[500],
      borderWidth: 2,
      backgroundColor: Colors.success[50],
    },
    glass: {
      backgroundColor: Colors.light.glass,
      borderColor: Colors.light.glassBorder,
      backdropFilter: 'blur(10px)',
    },
  },
  
  // Modern List Items
  listItem: {
    base: {
      backgroundColor: Colors.light.card,
      borderRadius: BorderRadius.lg,
      padding: Spacing.md,
      marginVertical: Spacing.xs,
      borderWidth: 1,
      borderColor: Colors.light.borderSubtle,
      ...Shadows.xs,
    },
    interactive: {
      ...Shadows.sm,
    },
    pressed: {
      backgroundColor: Colors.light.surface,
      ...Shadows.inner,
    },
  },
  
  // Modern Navigation
  navigation: {
    header: {
      backgroundColor: Colors.light.card,
      borderBottomWidth: 1,
      borderBottomColor: Colors.light.borderSubtle,
      ...Shadows.sm,
    },
    tabBar: {
      backgroundColor: Colors.light.card,
      borderTopWidth: 1,
      borderTopColor: Colors.light.borderSubtle,
      borderRadius: BorderRadius.xl,
      marginHorizontal: Spacing.md,
      marginBottom: Spacing.sm,
      ...Shadows.lg,
    },
  },
  
  // Modern Modals
  modal: {
    overlay: {
      backgroundColor: Colors.light.overlay,
    },
    content: {
      backgroundColor: Colors.light.card,
      borderRadius: BorderRadius['3xl'],
      padding: Spacing.xl,
      margin: Spacing.lg,
      ...Shadows['2xl'],
    },
    glass: {
      backgroundColor: Colors.light.glass,
      borderWidth: 1,
      borderColor: Colors.light.glassBorder,
      backdropFilter: 'blur(20px)',
      ...Shadows.glass.light,
    },
  },
  
  // Modern Badges
  badge: {
    base: {
      borderRadius: BorderRadius.full,
      paddingHorizontal: Spacing.sm,
      paddingVertical: Spacing.xs,
      alignItems: 'center',
      justifyContent: 'center',
    },
    primary: {
      backgroundColor: Colors.primary[100],
    },
    success: {
      backgroundColor: Colors.success[100],
    },
    warning: {
      backgroundColor: Colors.warning[100],
    },
    error: {
      backgroundColor: Colors.error[100],
    },
  },
};

// Theme Modes
export const LightTheme = {
  colors: Colors.light,
  typography: Typography,
  spacing: Spacing,
  borderRadius: BorderRadius,
  shadows: Shadows,
  animations: Animations,
  layout: Layout,
  components: Components,
};

export const DarkTheme = {
  colors: Colors.dark,
  typography: Typography,
  spacing: Spacing,
  borderRadius: BorderRadius,
  shadows: Shadows,
  animations: Animations,
  layout: Layout,
  components: {
    ...Components,
    card: {
      ...Components.card,
      base: {
        ...Components.card.base,
        backgroundColor: Colors.dark.card,
      },
    },
  },
};

export default LightTheme;
