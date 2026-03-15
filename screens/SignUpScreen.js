import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Alert,
  ScrollView,
  Animated,
  StatusBar,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useApp } from '../context/AppContext';
import { useTheme } from '../components/ThemeProvider';
import { ModernButton, ModernInput, ModernCard } from '../components/ModernUI';
import { Colors, Typography, Spacing, BorderRadius, Shadows, Animations } from '../themes/modernTheme';

const { width, height } = Dimensions.get('window');

export default function SignUpScreen({ navigation }) {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    fullName: '',
    identifier: '',
    email: '',
    password: '',
    confirmPassword: '',
    userType: 'student',
    academicLevel: '100',
    teachingCourses: [],
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { signUp } = useApp();
  const { isDark } = useTheme();

  // Animation Refs
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;
  const progressAnim = useRef(new Animated.Value(0.25)).current;

  useEffect(() => {
    startEntranceAnimation();
  }, [step]);

  const startEntranceAnimation = () => {
    fadeAnim.setValue(0);
    slideAnim.setValue(30);
    
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
      Animated.spring(slideAnim, {
        toValue: 0,
        tension: 50,
        friction: 7,
        useNativeDriver: true,
      }),
      Animated.timing(progressAnim, {
        toValue: (step / 4),
        duration: 300,
        useNativeDriver: false,
      })
    ]).start();
  };

  const userTypes = [
    { id: 'student', title: 'Student', icon: 'school-outline', desc: 'Join as a learner' },
    { id: 'lecturer', title: 'Lecturer', icon: 'briefcase-outline', desc: 'Join as an educator' },
  ];

  const academicLevels = [
    { id: '100', title: 'Level 100', icon: 'star-outline' },
    { id: '200', title: 'Level 200', icon: 'ribbon-outline' },
    { id: '300', title: 'Level 300', icon: 'medal-outline' },
    { id: '400', title: 'Level 400', icon: 'trophy-outline' },
  ];

  const allCourses = [
    { id: 'csm151', code: 'CSM151', name: 'Information Technology I', level: '100' },
    { id: 'csm157', code: 'CSM157', name: 'Structured Program Design', level: '100' },
    { id: 'csm281', code: 'CSM281', name: 'Java Programming', level: '200' },
    { id: 'csm395', code: 'CSM395', name: 'Artificial Intelligence', level: '300' },
    { id: 'csm495', code: 'CSM495', name: 'Software Engineering', level: '400' },
    { id: 'csm478', code: 'CSM478', name: 'Computer Networks', level: '400' },
  ];

  const toggleCourse = (courseId) => {
    setFormData(prev => ({
      ...prev,
      teachingCourses: prev.teachingCourses.includes(courseId)
        ? prev.teachingCourses.filter(id => id !== courseId)
        : [...prev.teachingCourses, courseId]
    }));
  };

  const nextStep = () => {
    if (step === 1 && !formData.fullName) {
      Alert.alert('Incomplete', 'Please tell us your name.');
      return;
    }
    if (step === 2 && !formData.identifier) {
      Alert.alert('Incomplete', 'Identification is required.');
      return;
    }
    setStep(s => s + 1);
  };

  const handleSignUp = async () => {
    if (formData.password !== formData.confirmPassword) {
      Alert.alert('Error', 'Passwords do not match.');
      return;
    }
    setIsLoading(true);
    try {
      const result = await signUp(formData.email.trim(), formData.password, formData);
      if (result.success) {
        Alert.alert('Success', 'Welcome to UniConnect!');
      } else {
        Alert.alert('Error', result.error);
      }
    } catch (e) {
      Alert.alert('Error', 'Something went wrong.');
    } finally {
      setIsLoading(false);
    }
  };

  const renderStepIndicator = () => (
    <View style={styles.progressContainer}>
      <Animated.View style={[styles.progressBar, { width: progressAnim.interpolate({
        inputRange: [0, 1],
        outputRange: ['0%', '100%']
      }) }]} />
    </View>
  );

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}>
            <Text style={styles.stepTitle}>Let's start with the basics</Text>
            <Text style={styles.stepSubtitle}>How should we call you and what's your role?</Text>
            
            <ModernInput
              label="Full Name"
              value={formData.fullName}
              onChangeText={(val) => setFormData(p => ({ ...p, fullName: val }))}
              icon="person-outline"
              variant="glass"
            />

            <View style={styles.typeGrid}>
              {userTypes.map(type => (
                <TouchableOpacity
                  key={type.id}
                  onPress={() => setFormData(p => ({ ...p, userType: type.id }))}
                  style={[styles.typeCard, formData.userType === type.id && styles.typeCardActive]}
                >
                  <Ionicons name={type.icon} size={32} color={formData.userType === type.id ? '#FFFFFF' : '#6366F1'} />
                  <Text style={[styles.typeName, formData.userType === type.id && styles.textWhite]}>{type.title}</Text>
                  <Text style={[styles.typeDesc, formData.userType === type.id && styles.textWhite70]}>{type.desc}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <ModernButton onPress={nextStep} gradient={Colors.gradients.primary} style={styles.nextBtn}>
              Continue
            </ModernButton>
          </Animated.View>
        );

      case 2:
        return (
          <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}>
            <Text style={styles.stepTitle}>Academic Identity</Text>
            <Text style={styles.stepSubtitle}>Provide your university credentials</Text>

            <ModernInput
              label={formData.userType === 'student' ? "Student ID" : "Staff ID"}
              value={formData.identifier}
              onChangeText={(val) => setFormData(p => ({ ...p, identifier: val }))}
              icon="card-outline"
              variant="glass"
              autoCapitalize="characters"
            />

            <ModernInput
              label="University Email"
              value={formData.email}
              onChangeText={(val) => setFormData(p => ({ ...p, email: val }))}
              icon="mail-outline"
              variant="glass"
              keyboardType="email-address"
            />

            <ModernButton onPress={nextStep} gradient={Colors.gradients.primary} style={styles.nextBtn}>
              Continue
            </ModernButton>
          </Animated.View>
        );

      case 3:
        return (
          <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}>
            <Text style={styles.stepTitle}>{formData.userType === 'student' ? 'Academic Level' : 'Teaching Assignment'}</Text>
            <Text style={styles.stepSubtitle}>{formData.userType === 'student' ? 'Which level are you in?' : 'Select courses you instruct'}</Text>

            {formData.userType === 'student' ? (
              <View style={styles.levelGrid}>
                {academicLevels.map(lvl => (
                  <TouchableOpacity
                    key={lvl.id}
                    onPress={() => setFormData(p => ({ ...p, academicLevel: lvl.id }))}
                    style={[styles.levelCard, formData.academicLevel === lvl.id && styles.levelCardActive]}
                  >
                    <Ionicons name={lvl.icon} size={24} color={formData.academicLevel === lvl.id ? '#FFFFFF' : '#6366F1'} />
                    <Text style={[styles.lvlText, formData.academicLevel === lvl.id && styles.textWhite]}>{lvl.title}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            ) : (
              <ScrollView style={styles.courseScroll} showsVerticalScrollIndicator={false}>
                {allCourses.map(course => (
                  <TouchableOpacity
                    key={course.id}
                    onPress={() => toggleCourse(course.id)}
                    style={[styles.courseRow, formData.teachingCourses.includes(course.id) && styles.courseRowActive]}
                  >
                    <View>
                      <Text style={[styles.courseCode, formData.teachingCourses.includes(course.id) && styles.textWhite]}>{course.code}</Text>
                      <Text style={[styles.courseName, formData.teachingCourses.includes(course.id) && styles.textWhite70]}>{course.name}</Text>
                    </View>
                    {formData.teachingCourses.includes(course.id) && <Ionicons name="checkmark-circle" size={24} color="#FFFFFF" />}
                  </TouchableOpacity>
                ))}
              </ScrollView>
            )}

            <ModernButton onPress={nextStep} gradient={Colors.gradients.primary} style={styles.nextBtn}>
              Almost there
            </ModernButton>
          </Animated.View>
        );

      case 4:
        return (
          <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}>
            <Text style={styles.stepTitle}>Secure your access</Text>
            <Text style={styles.stepSubtitle}>Create a strong password for your account</Text>

            <ModernInput
              label="Password"
              value={formData.password}
              onChangeText={(val) => setFormData(p => ({ ...p, password: val }))}
              icon="lock-closed-outline"
              secureTextEntry={!showPassword}
              rightIcon={showPassword ? "eye-off-outline" : "eye-outline"}
              onRightIconPress={() => setShowPassword(!showPassword)}
              variant="glass"
            />

            <ModernInput
              label="Confirm Password"
              value={formData.confirmPassword}
              onChangeText={(val) => setFormData(p => ({ ...p, confirmPassword: val }))}
              icon="shield-checkmark-outline"
              secureTextEntry={true}
              variant="glass"
            />

            <ModernButton 
              onPress={handleSignUp} 
              gradient={Colors.gradients.primary} 
              loading={isLoading}
              style={styles.nextBtn}
            >
              Finish Registration
            </ModernButton>
          </Animated.View>
        );
    }
  };

  return (
    <LinearGradient
      colors={isDark ? ['#020617', '#1E1B4B'] : ['#F8FAFC', '#E2E8F0']}
      style={styles.container}
    >
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} translucent backgroundColor="transparent" />
      
      <TouchableOpacity 
        style={styles.backBtn} 
        onPress={() => step > 1 ? setStep(s => s - 1) : navigation.goBack()}
      >
        <Ionicons name="chevron-back" size={28} color={isDark ? '#FFFFFF' : '#1E293B'} />
      </TouchableOpacity>

      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.inner}
      >
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
          <View style={styles.headerArea}>
            <View style={styles.logoRing}>
              <LinearGradient colors={['#6366F1', '#A855F7']} style={styles.logoGradient}>
                <Ionicons name="school" size={40} color="#FFFFFF" />
              </LinearGradient>
            </View>
            <Text style={[styles.brandTitle, isDark && styles.textWhite]}>UniConnect</Text>
            {renderStepIndicator()}
          </View>

          <ModernCard variant="glass" style={styles.formContent}>
            {renderStep()}
          </ModernCard>

          {step === 1 && (
            <TouchableOpacity style={styles.loginHint} onPress={() => navigation.navigate('Login')}>
              <Text style={styles.hintText}>Already a member? <Text style={styles.linkText}>Sign In</Text></Text>
            </TouchableOpacity>
          )}
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
  backBtn: {
    position: 'absolute',
    top: StatusBar.currentHeight + 10,
    left: 20,
    zIndex: 10,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollContent: {
    paddingTop: 80,
    paddingHorizontal: 24,
    paddingBottom: 40,
  },
  headerArea: {
    alignItems: 'center',
    marginBottom: 32,
  },
  logoRing: {
    width: 80,
    height: 80,
    borderRadius: 40,
    padding: 3,
    backgroundColor: 'rgba(99, 102, 241, 0.2)',
    marginBottom: 16,
  },
  logoGradient: {
    flex: 1,
    borderRadius: 37,
    justifyContent: 'center',
    alignItems: 'center',
  },
  brandTitle: {
    fontSize: 32,
    fontWeight: '900',
    color: '#1E293B',
    letterSpacing: -1,
  },
  progressContainer: {
    width: 120,
    height: 4,
    backgroundColor: 'rgba(0,0,0,0.05)',
    borderRadius: 2,
    marginTop: 16,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    backgroundColor: '#6366F1',
    borderRadius: 2,
  },
  formContent: {
    padding: 24,
    borderRadius: 32,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  stepTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: '#1E293B',
    marginBottom: 8,
  },
  stepSubtitle: {
    fontSize: 15,
    color: '#64748B',
    marginBottom: 24,
    lineHeight: 22,
  },
  typeGrid: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 16,
  },
  typeCard: {
    flex: 1,
    padding: 16,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.4)',
    borderWidth: 1,
    borderColor: 'rgba(99, 102, 241, 0.1)',
    alignItems: 'center',
  },
  typeCardActive: {
    backgroundColor: '#6366F1',
    borderColor: '#6366F1',
    elevation: 8,
    shadowColor: '#6366F1',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  typeName: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1E293B',
    marginTop: 12,
  },
  typeDesc: {
    fontSize: 11,
    color: '#64748B',
    textAlign: 'center',
    marginTop: 4,
  },
  levelGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  levelCard: {
    width: (width - 100) / 2,
    padding: 16,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.4)',
    borderWidth: 1,
    borderColor: 'rgba(99, 102, 241, 0.1)',
    alignItems: 'center',
  },
  levelCardActive: {
    backgroundColor: '#6366F1',
    borderColor: '#6366F1',
  },
  lvlText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1E293B',
    marginTop: 8,
  },
  courseScroll: {
    maxHeight: 300,
  },
  courseRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.4)',
    marginBottom: 8,
    borderWidth: 1,
    borderColor: 'rgba(99, 102, 241, 0.1)',
  },
  courseRowActive: {
    backgroundColor: '#6366F1',
    borderColor: '#6366F1',
  },
  courseCode: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1E293B',
  },
  courseName: {
    fontSize: 12,
    color: '#64748B',
  },
  nextBtn: {
    marginTop: 32,
    borderRadius: 20,
  },
  loginHint: {
    marginTop: 32,
    alignItems: 'center',
  },
  hintText: {
    color: '#64748B',
    fontSize: 15,
  },
  linkText: {
    color: '#6366F1',
    fontWeight: '800',
  },
  textWhite: { color: '#FFFFFF' },
  textWhite70: { color: 'rgba(255,255,255,0.7)' },
});
 