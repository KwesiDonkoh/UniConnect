import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Alert,
  Animated,
  StatusBar,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useApp } from '../context/AppContext';
import BlurViewCompat from '../components/BlurViewCompat';
import { useTheme } from '../components/ThemeProvider';
import { ModernButton, ModernInput, ModernCard } from '../components/ModernUI';
import { Colors, Typography, Spacing, BorderRadius, Shadows, Animations } from '../themes/modernTheme';

export default function LoginScreen({ navigation, onLogin }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { signIn } = useApp();
  const { theme, isDark } = useTheme();

  // Animation refs
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;
  const logoRotateAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Entrance animations
    Animated.sequence([
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: Animations.timing.slow,
          useNativeDriver: true,
        }),
        Animated.spring(slideAnim, {
          toValue: 0,
          ...Animations.spring.gentle,
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          ...Animations.spring.wobbly,
        }),
      ]),
      // Logo rotation animation
      Animated.loop(
        Animated.timing(logoRotateAnim, {
          toValue: 1,
          duration: 10000,
          useNativeDriver: true,
        })
      ),
    ]).start();
  }, []);

  const logoRotation = logoRotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  const handleLogin = async () => {
    if (!email.trim() || !password.trim()) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    setIsLoading(true);

    try {
      const result = await signIn(email.trim(), password);
      
      if (result.success) {
        // Authentication successful, onLogin will be called automatically via auth state change
        onLogin();
      } else {
        Alert.alert('Login Failed', result.error);
      }
    } catch (error) {
      Alert.alert('Error', 'An unexpected error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <StatusBar 
        barStyle={isDark ? 'light-content' : 'dark-content'} 
        backgroundColor="transparent" 
        translucent 
      />
      <LinearGradient
        colors={isDark ? Colors.gradients.cosmic : Colors.gradients.primarySubtle}
        style={styles.gradient}
      >
        <KeyboardAvoidingView
          style={styles.container}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
          <Animated.View 
            style={[
              styles.content,
              {
                opacity: fadeAnim,
                transform: [{ translateY: slideAnim }],
              }
            ]}
          >
            {/* Modern Header with Animated Logo */}
            <Animated.View 
              style={[
                styles.header,
                { transform: [{ scale: scaleAnim }] }
              ]}
            >
              <Animated.View 
                style={[
                  styles.logoContainer,
                  { transform: [{ rotate: logoRotation }] }
                ]}
              >
                <LinearGradient
                  colors={Colors.gradients.primary}
                  style={styles.logoGradient}
                >
                  <Ionicons name="school" size={48} color="#FFFFFF" />
                </LinearGradient>
              </Animated.View>
              
              <Text style={[
                styles.title,
                {
                  fontFamily: Typography.fonts.primary,
                  fontSize: Typography.sizes['4xl'],
                  fontWeight: Typography.weights.bold,
                  color: isDark ? Colors.dark.text : Colors.light.text,
                }
              ]}>
                UniConnect
              </Text>
              
              <Text style={[
                styles.subtitle,
                {
                  fontFamily: Typography.fonts.secondary,
                  fontSize: Typography.sizes.lg,
                  color: isDark ? Colors.dark.textSecondary : Colors.light.textSecondary,
                }
              ]}>
                Sign in to your account
              </Text>
            </Animated.View>

            {/* Modern Form Card */}
            <Animated.View style={{ transform: [{ translateY: slideAnim }] }}>
              <ModernCard variant="glass" style={styles.formCard}>
                <ModernInput
                  label="University Email"
                  value={email}
                  onChangeText={setEmail}
                  icon="mail-outline"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoComplete="email"
                  variant="glass"
                />

                <ModernInput
                  label="Password"
                  value={password}
                  onChangeText={setPassword}
                  icon="lock-closed-outline"
                  rightIcon={showPassword ? 'eye-outline' : 'eye-off-outline'}
                  onRightIconPress={() => setShowPassword(!showPassword)}
                  secureTextEntry={!showPassword}
                  autoComplete="password"
                  variant="glass"
                />

                <ModernButton
                  gradient={Colors.gradients.primary}
                  onPress={handleLogin}
                  disabled={isLoading}
                  loading={isLoading}
                  size="large"
                  style={styles.loginButton}
                >
                  {isLoading ? 'Signing In...' : 'Log In'}
                </ModernButton>

                <TouchableOpacity 
                  style={styles.forgotPassword}
                  onPress={() => navigation.navigate('ForgotPassword')}
                >
                  <Text style={[
                    styles.forgotPasswordText,
                    {
                      fontFamily: Typography.fonts.secondary,
                      color: Colors.primary[600],
                    }
                  ]}>
                    Forgot your password?
                  </Text>
                </TouchableOpacity>
              </ModernCard>
            </Animated.View>

            {/* Modern Sign Up Section */}
            <Animated.View 
              style={[
                styles.signUpContainer,
                { opacity: fadeAnim }
              ]}
            >
              <Text style={[
                styles.signUpText,
                {
                  fontFamily: Typography.fonts.secondary,
                  color: isDark ? Colors.dark.textSecondary : Colors.light.textSecondary,
                }
              ]}>
                Don't have an account?{' '}
              </Text>
              <TouchableOpacity onPress={() => navigation.navigate('SignUp')}>
                <Text style={[
                  styles.signUpLink,
                  {
                    fontFamily: Typography.fonts.secondary,
                    fontWeight: Typography.weights.semibold,
                    color: Colors.primary[600],
                  }
                ]}>
                  Sign Up
                </Text>
              </TouchableOpacity>
            </Animated.View>
          </Animated.View>
        </KeyboardAvoidingView>
      </LinearGradient>
    </>
  );
}

const styles = StyleSheet.create({
  gradient: {
    flex: 1,
  },
  container: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: Spacing.xl,
    paddingTop: StatusBar.currentHeight || 0,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: Spacing['3xl'],
  },
  logoContainer: {
    marginBottom: Spacing.lg,
  },
  logoGradient: {
    width: 80,
    height: 80,
    borderRadius: BorderRadius.full,
    alignItems: 'center',
    justifyContent: 'center',
    ...Shadows.xl,
  },
  title: {
    marginBottom: Spacing.sm,
    textAlign: 'center',
  },
  subtitle: {
    textAlign: 'center',
  },
  formCard: {
    marginBottom: Spacing.xl,
  },
  loginButton: {
    marginTop: Spacing.md,
  },
  forgotPassword: {
    alignItems: 'center',
    marginTop: Spacing.md,
    padding: Spacing.sm,
  },
  forgotPasswordText: {
    fontSize: Typography.sizes.sm,
  },
  signUpContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: Spacing.lg,
  },
  signUpText: {
    fontSize: Typography.sizes.base,
  },
  signUpLink: {
    fontSize: Typography.sizes.base,
  },
});
