import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  Animated,
  StatusBar,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { useApp } from '../context/AppContext';
import { useTheme } from '../components/ThemeProvider';
import { ModernButton, ModernInput, ModernCard } from '../components/ModernUI';
import AuthBackground from '../components/AuthBackground';
import AuthFeatureShowcase from '../components/AuthFeatureShowcase';

const { width, height } = Dimensions.get('window');

export default function SimpleLoginScreen({ navigation }) {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { signIn } = useApp();
  const { isDark } = useTheme();

  const handleLogin = async () => {
    if (!formData.email || !formData.password) {
      Alert.alert('Neural Error', 'Identify yourself! (Fill in all fields)');
      return;
    }
    setIsLoading(true);
    try {
      const result = await signIn(formData.email.trim(), formData.password);
      if (!result.success) Alert.alert('Access Denied', result.error);
    } catch (e) {
      Alert.alert('System Error', 'Connection to Neural Nexus failed.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthBackground isDark={isDark}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} translucent backgroundColor="transparent" />
      
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.container}
      >
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          <View style={styles.headerArea}>
            <Text style={[styles.brandTitle, isDark && styles.textWhite]}>UniConnect</Text>
            <View style={styles.accentLine} />
            <Text style={[styles.brandSubtitle, isDark && styles.textWhite70]}>PREMIUM ACADEMIC ACCESS</Text>
          </View>

          <View style={styles.showcaseBox}>
            <AuthFeatureShowcase isDark={isDark} />
          </View>

          <View style={styles.glassContainer}>
            <BlurView intensity={Platform.OS === 'ios' ? 90 : 150} tint={isDark ? 'dark' : 'light'} style={styles.absoluteBlur} />
            <View style={styles.formCard}>
              <Text style={[styles.formTitle, isDark && styles.textWhite]}>Sign In</Text>
              <Text style={styles.formSubtitle}>Access your university digital twin</Text>

              <ModernInput
                label="UNIVERSITY EMAIL"
                value={formData.email}
                onChangeText={(t) => setFormData({ ...formData, email: t })}
                icon="mail-outline"
                placeholder="k.donkoh@knust.edu"
                autoCapitalize="none"
              />

              <ModernInput
                label="SECURE KEY"
                value={formData.password}
                onChangeText={(t) => setFormData({ ...formData, password: t })}
                icon="key-outline"
                secureTextEntry={!showPassword}
                placeholder="••••••••"
                rightIcon={showPassword ? "eye-off-outline" : "eye-outline"}
                onRightIconPress={() => setShowPassword(!showPassword)}
              />

              <TouchableOpacity style={styles.forgotBtn}>
                <Text style={styles.forgotText}>Recover Access Key</Text>
              </TouchableOpacity>

              <ModernButton
                gradient={isDark ? ['#4F46E5', '#7C3AED'] : ['#1E293B', '#334155']}
                onPress={handleLogin}
                loading={isLoading}
                style={styles.loginBtn}
              >
                AUTHORIZE & SYNC
              </ModernButton>

              <TouchableOpacity 
                style={styles.signupBtn} 
                onPress={() => navigation.navigate('SignUp')}
              >
                <Text style={styles.signupText}>
                  New here? <Text style={styles.signupLink}>CREATE PROFILE</Text>
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </AuthBackground>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContent: { paddingTop: 100, paddingHorizontal: 25, paddingBottom: 60 },
  headerArea: { alignItems: 'center', marginBottom: 40 },
  brandTitle: { fontSize: 48, fontWeight: '200', color: '#1E293B', letterSpacing: -2 },
  accentLine: { width: 50, height: 3, backgroundColor: '#6366F1', marginVertical: 10, borderRadius: 2 },
  textWhite: { color: '#FFFFFF' },
  brandSubtitle: { fontSize: 11, fontWeight: '800', color: '#64748B', letterSpacing: 4 },
  textWhite70: { color: 'rgba(255,255,255,0.7)' },
  showcaseBox: { height: 180, marginBottom: 40 },
  glassContainer: { borderRadius: 40, overflow: 'hidden', borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' },
  absoluteBlur: { ...StyleSheet.absoluteFillObject },
  formCard: { padding: 30 },
  formTitle: { fontSize: 32, fontWeight: '800', color: '#1E293B', marginBottom: 5 },
  formSubtitle: { fontSize: 16, color: '#64748B', marginBottom: 30 },
  forgotBtn: { alignSelf: 'flex-end', marginBottom: 25 },
  forgotText: { fontSize: 14, color: '#6366F1', fontWeight: '600' },
  loginBtn: { height: 60, borderRadius: 20 },
  signupBtn: { marginTop: 30, alignItems: 'center' },
  signupText: { fontSize: 15, color: '#64748B' },
  signupLink: { color: '#6366F1', fontWeight: '900' },
});
