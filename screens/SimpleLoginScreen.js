import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Alert,
  ScrollView,
  SafeAreaView,
  StatusBar,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useApp } from '../context/AppContext';

export default function SimpleLoginScreen({ navigation }) {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
    userType: 'student',
    academicLevel: '100',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  const { signIn, signUp } = useApp();

  const userTypes = [
    { id: 'student', title: 'Student', icon: 'school' },
    { id: 'lecturer', title: 'Lecturer', icon: 'library' },
  ];

  const academicLevels = [
    { id: '100', level: '100 Level' },
    { id: '200', level: '200 Level' },
    { id: '300', level: '300 Level' },
    { id: '400', level: '400 Level' },
  ];

  const handleSubmit = async () => {
    if (isLogin) {
      // Handle Login
      if (!formData.email.trim() || !formData.password.trim()) {
        Alert.alert('Error', 'Please fill in all fields');
        return;
      }

      setIsLoading(true);
      try {
        const result = await signIn(formData.email.trim(), formData.password);
        if (!result.success) {
          Alert.alert('Login Failed', result.error);
        }
      } catch (error) {
        Alert.alert('Error', 'An unexpected error occurred');
      } finally {
        setIsLoading(false);
      }
    } else {
      // Handle Sign Up
      if (!formData.fullName.trim() || !formData.email.trim() || !formData.password.trim()) {
        Alert.alert('Error', 'Please fill in all required fields');
        return;
      }

      if (formData.password !== formData.confirmPassword) {
        Alert.alert('Error', 'Passwords do not match');
        return;
      }

      if (formData.password.length < 6) {
        Alert.alert('Error', 'Password must be at least 6 characters');
        return;
      }

      setIsLoading(true);
      try {
        const signUpData = {
          fullName: formData.fullName.trim(),
          email: formData.email.trim(),
          password: formData.password,
          userType: formData.userType,
          ...(formData.userType === 'student' && { academicLevel: formData.academicLevel }),
        };

        const result = await signUp(signUpData);
        if (!result.success) {
          Alert.alert('Sign Up Failed', result.error);
        } else {
          Alert.alert('Success', 'Account created successfully! Please log in.');
          setIsLogin(true);
          setFormData({ ...formData, password: '', confirmPassword: '' });
        }
      } catch (error) {
        Alert.alert('Error', 'An unexpected error occurred');
      } finally {
        setIsLoading(false);
      }
    }
  };

  const toggleMode = () => {
    setIsLogin(!isLogin);
    setFormData({
      fullName: '',
      email: '',
      password: '',
      confirmPassword: '',
      userType: 'student',
      academicLevel: '100',
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#4338ca" />
      
      <LinearGradient
        colors={['#4338ca', '#6366F1', '#8B5CF6']}
        style={styles.header}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <View style={styles.logoContainer}>
          <Ionicons name="school" size={62} color="#FFFFFF" />
          <Text style={styles.appName}>UniConnect</Text>
          <Text style={styles.tagline}>Connect, Learn, Excel</Text>
        </View>
      </LinearGradient>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.formContainer}
      >
        <ScrollView showsVerticalScrollIndicator={false}>
          <View style={styles.form}>
            <Text style={styles.title}>
              {isLogin ? 'Welcome Back!' : 'Create Account'}
            </Text>
            <Text style={styles.subtitle}>
              {isLogin ? 'Sign in to continue your learning journey' : 'Join our educational community'}
            </Text>

            {!isLogin && (
              <View style={styles.inputContainer}>
                <Text style={styles.label}>Full Name</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Enter your full name"
                  value={formData.fullName}
                  onChangeText={(text) => setFormData({ ...formData, fullName: text })}
                  autoCapitalize="words"
                />
              </View>
            )}

            <View style={styles.inputContainer}>
              <Text style={styles.label}>Email</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter your email"
                value={formData.email}
                onChangeText={(text) => setFormData({ ...formData, email: text })}
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>Password</Text>
              <View style={styles.passwordContainer}>
                <TextInput
                  style={[styles.input, styles.inputInsidePassword]}
                  placeholder="Enter your password"
                  value={formData.password}
                  onChangeText={(text) => setFormData({ ...formData, password: text })}
                  secureTextEntry={!showPassword}
                />
                <TouchableOpacity
                  style={styles.eyeButton}
                  onPress={() => setShowPassword(!showPassword)}
                >
                  <Ionicons
                    name={showPassword ? 'eye-off' : 'eye'}
                    size={20}
                    color="#64748B"
                  />
                </TouchableOpacity>
              </View>
            </View>

            {!isLogin && (
              <>
                <View style={styles.inputContainer}>
                  <Text style={styles.label}>Confirm Password</Text>
                  <View style={styles.passwordContainer}>
                    <TextInput
                      style={[styles.input, styles.inputInsidePassword]}
                      placeholder="Confirm your password"
                      value={formData.confirmPassword}
                      onChangeText={(text) => setFormData({ ...formData, confirmPassword: text })}
                      secureTextEntry={!showConfirmPassword}
                    />
                    <TouchableOpacity
                      style={styles.eyeButton}
                      onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                    >
                      <Ionicons
                        name={showConfirmPassword ? 'eye-off' : 'eye'}
                        size={20}
                        color="#64748B"
                      />
                    </TouchableOpacity>
                  </View>
                </View>

                <View style={styles.inputContainer}>
                  <Text style={styles.label}>I am a...</Text>
                  <View style={styles.userTypeContainer}>
                    {userTypes.map((type) => (
                      <TouchableOpacity
                        key={type.id}
                        style={[
                          styles.userTypeButton,
                          formData.userType === type.id && styles.userTypeButtonActive
                        ]}
                        onPress={() => setFormData({ ...formData, userType: type.id })}
                      >
                        <Ionicons
                          name={type.icon}
                          size={20}
                          color={formData.userType === type.id ? 'white' : '#64748B'}
                        />
                        <Text
                          style={[
                            styles.userTypeText,
                            formData.userType === type.id && styles.userTypeTextActive
                          ]}
                        >
                          {type.title}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>

                {formData.userType === 'student' && (
                  <View style={styles.inputContainer}>
                    <Text style={styles.label}>Academic Level</Text>
                    <View style={styles.levelContainer}>
                      {academicLevels.map((level) => (
                        <TouchableOpacity
                          key={level.id}
                          style={[
                            styles.levelButton,
                            formData.academicLevel === level.id && styles.levelButtonActive
                          ]}
                          onPress={() => setFormData({ ...formData, academicLevel: level.id })}
                        >
                          <Text
                            style={[
                              styles.levelText,
                              formData.academicLevel === level.id && styles.levelTextActive
                          ]}
                          >
                            {level.level}
                          </Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  </View>
                )}
              </>
            )}

            <TouchableOpacity
              style={[styles.submitButtonWrap, isLoading && styles.submitButtonDisabled]}
              onPress={handleSubmit}
              disabled={isLoading}
              activeOpacity={0.85}
            >
              <LinearGradient
                colors={isLoading ? ['#94A3B8', '#64748B'] : ['#6366F1', '#8B5CF6']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.submitButton}
              >
                {isLoading ? (
                  <Text style={styles.submitButtonText}>Please wait...</Text>
                ) : (
                  <Text style={styles.submitButtonText}>
                    {isLogin ? 'Sign In' : 'Create Account'}
                  </Text>
                )}
              </LinearGradient>
            </TouchableOpacity>

            <TouchableOpacity style={styles.toggleButton} onPress={toggleMode}>
              <Text style={styles.toggleText}>
                {isLogin ? "Don't have an account? " : 'Already have an account? '}
                <Text style={styles.toggleTextBold}>
                  {isLogin ? 'Sign Up' : 'Sign In'}
                </Text>
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  header: {
    height: 250,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  logoContainer: {
    alignItems: 'center',
  },
  appName: {
    fontSize: 34,
    fontWeight: '800',
    color: '#FFFFFF',
    marginTop: 14,
    marginBottom: 6,
    letterSpacing: 1,
  },
  tagline: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.95)',
    fontWeight: '500',
  },
  formContainer: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    marginTop: -32,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -6 },
    shadowOpacity: 0.08,
    shadowRadius: 20,
    elevation: 12,
  },
  form: {
    padding: 28,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: '#1E293B',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#64748B',
    textAlign: 'center',
    marginBottom: 28,
  },
  inputContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  input: {
    borderWidth: 2,
    borderColor: '#E2E8F0',
    borderRadius: 14,
    padding: 16,
    fontSize: 16,
    backgroundColor: '#F8FAFC',
  },
  passwordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#E2E8F0',
    borderRadius: 14,
    backgroundColor: '#F8FAFC',
  },
  inputInsidePassword: {
    borderWidth: 0,
    flex: 1,
  },
  eyeButton: {
    padding: 16,
  },
  userTypeContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  userTypeButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 12,
    backgroundColor: '#F9FAFB',
    gap: 8,
  },
  userTypeButtonActive: {
    backgroundColor: '#4F46E5',
    borderColor: '#4F46E5',
  },
  userTypeText: {
    fontSize: 16,
    color: '#64748B',
    fontWeight: '500',
  },
  userTypeTextActive: {
    color: 'white',
  },
  levelContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  levelButton: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    backgroundColor: '#F9FAFB',
  },
  levelButtonActive: {
    backgroundColor: '#4F46E5',
    borderColor: '#4F46E5',
  },
  levelText: {
    fontSize: 16,
    color: '#64748B',
    fontWeight: '500',
  },
  levelTextActive: {
    color: 'white',
  },
  submitButtonWrap: {
    marginTop: 12,
    marginBottom: 20,
    borderRadius: 14,
    overflow: 'hidden',
    shadowColor: '#6366F1',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 10,
    elevation: 6,
  },
  submitButton: {
    padding: 18,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  submitButtonDisabled: {
    opacity: 0.8,
  },
  submitButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700',
  },
  toggleButton: {
    alignItems: 'center',
  },
  toggleText: {
    fontSize: 16,
    color: '#64748B',
  },
  toggleTextBold: {
    color: '#4F46E5',
    fontWeight: '600',
  },
});
