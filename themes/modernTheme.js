import { Dimensions } from 'react-native';

const { width, height } = Dimensions.get('window');

// Modern Color Palette
export const Colors = {
  // Primary Brand Colors
  primary: {
    50: '#EEF2FF',
    100: '#E0E7FF',
    200: '#C7D2FE',
    300: '#A5B4FC',
    400: '#818CF8',
    500: '#6366F1',
    600: '#4F46E5',
    700: '#4338CA',
    800: '#3730A3',
    900: '#312E81',
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
  
  // Dark Mode Colors
  dark: {
    bg: '#0F0F23',
    surface: '#1A1A2E',
    card: '#16213E',
    border: '#2A2A4A',
    text: '#FFFFFF',
    textSecondary: '#B4B4CC',
    accent: '#6366F1',
  },
  
  // Light Mode Colors
  light: {
    bg: '#FFFFFF',
    surface: '#F8FAFC',
    card: '#FFFFFF',
    border: '#E2E8F0',
    text: '#1E293B',
    textSecondary: '#64748B',
    accent: '#6366F1',
  },
  
  // Gradient Colors
  gradients: {
    primary: ['#6366F1', '#8B5CF6'],
    secondary: ['#EC4899', '#8B5CF6'],
    success: ['#10B981', '#059669'],
    sunset: ['#F59E0B', '#EF4444'],
    ocean: ['#0EA5E9', '#3B82F6'],
    purple: ['#8B5CF6', '#EC4899'],
    green: ['#22C55E', '#10B981'],
  },
};

// Typography System
export const Typography = {
  // Font Families
  fonts: {
    primary: 'System',
    secondary: 'System',
    mono: 'Courier New',
  },
  
  // Font Sizes
  sizes: {
    xs: 12,
    sm: 14,
    base: 16,
    lg: 18,
    xl: 20,
    '2xl': 24,
    '3xl': 30,
    '4xl': 36,
    '5xl': 48,
    '6xl': 60,
  },
  
  // Font Weights
  weights: {
    light: '300',
    normal: '400',
    medium: '500',
    semibold: '600',
    bold: '700',
    extrabold: '800',
  },
  
  // Line Heights
  lineHeights: {
    tight: 1.25,
    normal: 1.5,
    relaxed: 1.75,
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

// Shadow System
export const Shadows = {
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 4,
  },
  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.15,
    shadowRadius: 15,
    elevation: 8,
  },
  xl: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 20 },
    shadowOpacity: 0.25,
    shadowRadius: 25,
    elevation: 12,
  },
  colored: {
    primary: {
      shadowColor: '#6366F1',
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.3,
      shadowRadius: 12,
      elevation: 8,
    },
    success: {
      shadowColor: '#10B981',
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.3,
      shadowRadius: 12,
      elevation: 8,
    },
  },
};

// Animation Timing
export const Animations = {
  timing: {
    fast: 150,
    normal: 300,
    slow: 500,
  },
  easing: {
    ease: 'ease',
    easeIn: 'ease-in',
    easeOut: 'ease-out',
    easeInOut: 'ease-in-out',
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

// Component Styles
export const Components = {
  // Button Styles
  button: {
    base: {
      borderRadius: BorderRadius.lg,
      paddingVertical: Spacing.md,
      paddingHorizontal: Spacing.lg,
      alignItems: 'center',
      justifyContent: 'center',
      flexDirection: 'row',
    },
    primary: {
      backgroundColor: Colors.primary[600],
    },
    secondary: {
      backgroundColor: Colors.neutral[100],
      borderWidth: 1,
      borderColor: Colors.neutral[300],
    },
    success: {
      backgroundColor: Colors.success[600],
    },
    warning: {
      backgroundColor: Colors.warning[500],
    },
    error: {
      backgroundColor: Colors.error[600],
    },
  },
  
  // Card Styles
  card: {
    base: {
      backgroundColor: Colors.light.card,
      borderRadius: BorderRadius.xl,
      padding: Spacing.lg,
      ...Shadows.md,
    },
    elevated: {
      ...Shadows.lg,
    },
  },
  
  // Input Styles
  input: {
    base: {
      borderWidth: 1,
      borderColor: Colors.neutral[300],
      borderRadius: BorderRadius.lg,
      paddingHorizontal: Spacing.md,
      paddingVertical: Spacing.sm,
      fontSize: Typography.sizes.base,
    },
    focused: {
      borderColor: Colors.primary[500],
      ...Shadows.colored.primary,
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
