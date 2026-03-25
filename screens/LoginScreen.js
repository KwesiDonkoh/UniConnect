import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Alert,
  Animated,
  StatusBar,
  Dimensions,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useApp } from '../context/AppContext';
import { useTheme } from '../components/ThemeProvider';
import AuthFeatureShowcase from '../components/AuthFeatureShowcase';

import { Colors, Typography, Spacing, BorderRadius, Shadows, Animations } from '../themes/modernTheme';

const { width, height } = Dimensions.get('window');

export default function LoginScreen({ navigation, onLogin }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { signIn } = useApp();
  const { isDark } = useTheme();

  // Animation refs
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;
  const logoRotateAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.sequence([
      Animated.delay(200),
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.spring(slideAnim, {
          toValue: 0,
          tension: 40,
          friction: 8,
          useNativeDriver: true,
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          tension: 50,
          friction: 7,
          useNativeDriver: true,
        }),
      ]),
      Animated.loop(
        Animated.timing(logoRotateAnim, {
          toValue: 1,
          duration: 15000,
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
        if (onLogin) onLogin();
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
    <LinearGradient
      colors={isDark ? ['#020617', '#1E1B4B'] : ['#F8FAFC', '#E2E8F0']}
      style={styles.container}
    >
      <StatusBar 
        barStyle={isDark ? 'light-content' : 'dark-content'} 
        backgroundColor="transparent" 
        translucent 
      />
      <KeyboardAvoidingView
        style={styles.inner}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          <Animated.View 
            style={[
              styles.headerArea,
              {
                opacity: fadeAnim,
                transform: [{ translateY: slideAnim }, { scale: scaleAnim }],
              }
            ]}
          >
            <Animated.View style={[styles.logoRing, { transform: [{ rotate: logoRotation }] }]}>
              <LinearGradient colors={['#6366F1', '#A855F7']} style={styles.logoGradient}>
                <Ionicons name="school" size={44} color="#FFFFFF" />
              </LinearGradient>
            </Animated.View>
            <Text style={[styles.brandTitle, isDark && styles.textWhite]}>UniConnect</Text>
            <Text style={styles.brandSubtitle}>Gateway to Excellence</Text>
          </Animated.View>

          <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}>
            <AuthFeatureShowcase isDark={isDark} />
            <ModernCard variant="glass" style={styles.formCard}>

              <Text style={styles.formTitle}>Welcome Back</Text>
              <Text style={styles.formSubtitle}>Sign in to continue your journey</Text>

              <ModernInput
                label="University Email"
                value={email}
                onChangeText={setEmail}
                icon="mail-outline"
                keyboardType="email-address"
                autoCapitalize="none"
                variant="glass"
              />

              <ModernInput
                label="Password"
                value={password}
                onChangeText={setPassword}
                icon="lock-closed-outline"
                rightIcon={showPassword ? 'eye-off-outline' : 'eye-outline'}
                onRightIconPress={() => setShowPassword(!showPassword)}
                secureTextEntry={!showPassword}
                variant="glass"
              />

              <TouchableOpacity 
                style={styles.forgotBtn}
                onPress={() => navigation.navigate('ForgotPassword')}
              >
                <Text style={styles.forgotText}>Forgot Password?</Text>
              </TouchableOpacity>

              <ModernButton
                gradient={Colors.gradients.primary}
                onPress={handleLogin}
                loading={isLoading}
                style={styles.loginBtn}
              >
                {isLoading ? 'Authenticating...' : 'Sign In'}
              </ModernButton>

              <View style={styles.dividerContainer}>
                <View style={styles.dividerLine} />
                <Text style={styles.dividerText}>OR</Text>
                <View style={styles.dividerLine} />
              </View>

              <View style={styles.socialRow}>
                <TouchableOpacity style={styles.socialBtn}>
                  <Ionicons name="logo-google" size={24} color="#EA4335" />
                </TouchableOpacity>
                <TouchableOpacity style={styles.socialBtn}>
                  <Ionicons name="logo-apple" size={24} color={isDark ? "#FFFFFF" : "#000000"} />
                </TouchableOpacity>
                <TouchableOpacity style={styles.socialBtn}>
                  <Ionicons name="logo-facebook" size={24} color="#1877F2" />
                </TouchableOpacity>
              </View>

              <TouchableOpacity style={styles.biometricBtn} onPress={() => Alert.alert('Biometrics', 'Biometric authentication would start here.')}>
                <Ionicons name="finger-print-outline" size={20} color="#6366F1" />
                <Text style={styles.biometricText}>Sign in with Biometrics</Text>
              </TouchableOpacity>
            </ModernCard>

            <TouchableOpacity 
              style={styles.signUpArea} 
              onPress={() => navigation.navigate('SignUp')}
            >
              <Text style={styles.signUpText}>
                New here? <Text style={styles.signUpLink}>Create an account</Text>
              </Text>
            </TouchableOpacity>
          </Animated.View>
        </ScrollView>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  inner: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingTop: 100,
    paddingHorizontal: 24,
    paddingBottom: 40,
    justifyContent: 'center',
  },
  headerArea: {
    alignItems: 'center',
    marginBottom: 48,
  },
  logoRing: {
    width: 88,
    height: 88,
    borderRadius: 44,
    padding: 3,
    backgroundColor: 'rgba(99, 102, 241, 0.2)',
    marginBottom: 16,
    ...Shadows.xl,
  },
  logoGradient: {
    flex: 1,
    borderRadius: 41,
    justifyContent: 'center',
    alignItems: 'center',
  },
  brandTitle: {
    fontSize: 36,
    fontWeight: '900',
    color: '#1E293B',
    letterSpacing: -1.5,
  },
  brandSubtitle: {
    fontSize: 16,
    color: '#6366F1',
    fontWeight: '600',
    marginTop: -4,
    letterSpacing: 2,
    textTransform: 'uppercase',
  },
  formCard: {
    padding: 24,
    borderRadius: 32,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  formTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: '#1E293B',
    marginBottom: 4,
  },
  formSubtitle: {
    fontSize: 14,
    color: '#64748B',
    marginBottom: 24,
  },
  forgotBtn: {
    alignSelf: 'flex-end',
    marginTop: -8,
    marginBottom: 16,
    padding: 8,
  },
  forgotText: {
    color: '#6366F1',
    fontSize: 13,
    fontWeight: '600',
  },
  loginBtn: {
    borderRadius: 20,
    height: 56,
  },
  signUpArea: {
    marginTop: 32,
    alignItems: 'center',
  },
  signUpText: {
    color: '#64748B',
    fontSize: 15,
  },
  signUpLink: {
    color: '#6366F1',
    fontWeight: '800',
  },
  textWhite: { color: '#FFFFFF' },
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 20,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: 'rgba(148, 163, 184, 0.2)',
  },
  dividerText: {
    marginHorizontal: 16,
    color: '#64748B',
    fontSize: 12,
    fontWeight: '700',
  },
  socialRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 16,
    marginBottom: 20,
  },
  socialBtn: {
    width: 56,
    height: 56,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  biometricBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    borderRadius: 12,
    backgroundColor: 'rgba(99, 102, 241, 0.05)',
    borderWidth: 1,
    borderColor: 'rgba(99, 102, 241, 0.1)',
  },
  biometricText: {
    marginLeft: 8,
    color: '#6366F1',
    fontSize: 14,
    fontWeight: '600',
  },
});

