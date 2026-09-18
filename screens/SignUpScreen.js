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
import AuthFeatureShowcase from '../components/AuthFeatureShowcase';
import AuthBackground from '../components/AuthBackground';
import { BlurView } from 'expo-blur';

import * as ImagePicker from 'expo-image-picker';
import { Colors, Typography, Spacing, BorderRadius, Shadows, Animations } from '../themes/modernTheme';
import { UNIVERSITY_DATA } from '../data/universityData';

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
    degreeType: 'Undergraduate',
    university: '',
    college: '',
    programme: '',
    department: '',
    selectedCourses: [],
    profileImage: null,
  });
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState(0); // 0 to 1
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

  const degreeTypes = [
    { id: 'Undergraduate', title: 'Undergraduate', icon: 'school-outline' },
    { id: 'Postgraduate', title: 'Postgraduate', icon: 'ribbon-outline' },
    { id: 'PhD', title: 'Doctorate / PhD', icon: 'medal-outline' },
    { id: 'Others', title: 'Others', icon: 'ellipsis-horizontal-outline' },
  ];

  const academicLevels = [
    { id: '100', title: 'Year 1', icon: 'star-outline' },
    { id: '200', title: 'Year 2', icon: 'ribbon-outline' },
    { id: '300', title: 'Year 3', icon: 'medal-outline' },
    { id: '400', title: 'Year 4', icon: 'trophy-outline' },
    { id: '500', title: 'Year 5+', icon: 'infinite-outline' },
  ];

  const collegeIcons = {
    'CHSS': 'book-outline',
    'COE': 'settings-outline',
    'CABE': 'business-outline',
    'CANR': 'leaf-outline',
    'COS': 'flask-outline',
    'CHS': 'medical-outline'
  };

  const allCourses = [
    // Level 100
    { id: 'csm151', code: 'CSM151', name: 'Information Technology I', level: '100' },
    { id: 'csm157', code: 'CSM157', name: 'Structured Program Design', level: '100' },
    { id: 'mat157', code: 'MAT157', name: 'Algebra & Geometry', level: '100' },
    { id: 'phi157', code: 'PHI157', name: 'Logic & Critical Thinking', level: '100' },
    // Level 200
    { id: 'csm281', code: 'CSM281', name: 'Java Programming', level: '200' },
    { id: 'csm291', code: 'CSM291', name: 'Data Structures', level: '200' },
    { id: 'mat257', code: 'MAT257', name: 'Applied Calculus', level: '200' },
    { id: 'ee281', code: 'EE281', name: 'Linear Electronics', level: '200' },
    // Level 300
    { id: 'csm395', code: 'CSM395', name: 'Artificial Intelligence', level: '300' },
    { id: 'csm391', code: 'CSM391', name: 'Database Management Systems', level: '300' },
    { id: 'csm351', code: 'CSM351', name: 'Operating Systems', level: '300' },
    { id: 'ee361', code: 'EE361', name: 'Microprocessor Systems', level: '300' },
    // Level 400
    { id: 'csm495', code: 'CSM495', name: 'Software Engineering', level: '400' },
    { id: 'csm478', code: 'CSM478', name: 'Computer Networks', level: '400' },
    { id: 'csm498', code: 'CSM498', name: 'Final Year Project', level: '400' },
    { id: 'csm461', code: 'CSM461', name: 'Information Security', level: '400' },
  ];

  const toggleCourse = (courseId) => {
    setFormData(prev => ({
      ...prev,
      selectedCourses: prev.selectedCourses.includes(courseId)
        ? prev.selectedCourses.filter(id => id !== courseId)
        : [...prev.selectedCourses, courseId]
    }));
  };

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.7,
    });

    if (!result.canceled) {
      setFormData(prev => ({ ...prev, profileImage: result.assets[0].uri }));
    }
  };

  const calculatePasswordStrength = (pass) => {
    let strength = 0;
    if (pass.length > 5) strength += 0.2;
    if (pass.length > 8) strength += 0.2;
    if (/[A-Z]/.test(pass)) strength += 0.2;
    if (/[0-9]/.test(pass)) strength += 0.2;
    if (/[!@#$%^&*]/.test(pass)) strength += 0.2;
    setPasswordStrength(strength);
  };

  const nextStep = () => {
    if (step === 1 && !formData.fullName) {
      Alert.alert('Incomplete', 'Please tell us your name.');
      return;
    }
    if (step === 2 && (!formData.identifier || !formData.university || (formData.university.includes('KNUST') && (!formData.college || !formData.programme)))) {
      Alert.alert('Incomplete', 'Identification, University and academic details are required.');
      return;
    }
    setStep(s => s + 1);
  };

  const handleSignUp = async () => {
    if (formData.password !== formData.confirmPassword) {
      Alert.alert('Error', 'Passwords do not match.');
      return;
    }
    if (!acceptTerms) {
      Alert.alert('Terms & Conditions', 'Please accept the terms and conditions to proceed.');
      return;
    }
    if (passwordStrength < 0.6) {
      Alert.alert('Weak Password', 'Please choose a stronger password.');
      return;
    }
    setIsLoading(true);
    const finalUserData = {
      ...formData,
      ...(formData.userType === 'student'
        ? { readingCourses: formData.selectedCourses }
        : { teachingCourses: formData.selectedCourses })
    };
    delete finalUserData.selectedCourses; // Clean up before sending

    try {
      const result = await signUp(formData.email.trim(), formData.password, finalUserData);
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
      <Animated.View style={[styles.progressBar, {
        width: progressAnim.interpolate({
          inputRange: [0, 1],
          outputRange: ['0%', '100%']
        })
      }]} />
    </View>
  );

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}>
            <View style={styles.stepHeader}>
              <View style={styles.stepBadge}>
                <Text style={styles.stepBadgeText}>Step 1</Text>
              </View>
              <Text style={styles.stepTitle}>Let's start with the basics</Text>
              <Text style={styles.stepSubtitle}>Tell us who you are to personalize your experience.</Text>
            </View>

            <View style={styles.profileSection}>
              <TouchableOpacity onPress={pickImage} style={styles.imagePicker}>
                {formData.profileImage ? (
                  <Animated.Image source={{ uri: formData.profileImage }} style={styles.profilePrev} />
                ) : (
                  <LinearGradient colors={['#EEF2FF', '#E0E7FF']} style={styles.imagePlaceholder}>
                    <Ionicons name="camera" size={32} color="#6366F1" />
                    <Text style={styles.imagePlaceholderText}>ADD PHOTO</Text>
                  </LinearGradient>
                )}
              </TouchableOpacity>
            </View>

            <ModernInput
              label="Full Name"
              value={formData.fullName}
              onChangeText={(val) => setFormData(p => ({ ...p, fullName: val }))}
              icon="person"
              variant="outline"
              placeholder="e.g. John Doe"
            />

            <View style={styles.typeSelectorHeader}>
              <Text style={styles.inputLabel}>I am joining as a...</Text>
            </View>

            <View style={styles.typeGrid}>
              {userTypes.map(type => (
                <TouchableOpacity
                  key={type.id}
                  onPress={() => setFormData(p => ({ ...p, userType: type.id }))}
                  style={[styles.typeCard, formData.userType === type.id && styles.typeCardActive]}
                >
                  <View style={[styles.typeIconContainer, formData.userType === type.id && styles.typeIconContainerActive]}>
                    <Ionicons name={type.icon} size={28} color={formData.userType === type.id ? '#FFFFFF' : '#6366F1'} />
                  </View>
                  <Text style={[styles.typeName, formData.userType === type.id && styles.textWhite]}>{type.title}</Text>
                  <Text style={[styles.typeDesc, formData.userType === type.id && styles.textWhite70]}>{type.desc}</Text>
                  {formData.userType === type.id && (
                    <View style={styles.checkBadge}>
                      <Ionicons name="checkmark-circle" size={20} color="#FFFFFF" />
                    </View>
                  )}
                </TouchableOpacity>
              ))}
            </View>

            <ModernButton onPress={nextStep} gradient={Colors.gradients.primary} style={styles.nextBtn}>
              Continue to Step 2
            </ModernButton>
          </Animated.View>
        );

      case 2:
        return (
          <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}>
            <View style={styles.stepHeader}>
              <View style={styles.stepBadge}>
                <Text style={styles.stepBadgeText}>Step 2</Text>
              </View>
              <Text style={styles.stepTitle}>Academic Identity</Text>
              <Text style={styles.stepSubtitle}>Provide your institutional credentials for verification.</Text>
            </View>

            <View style={styles.inputGroup}>
              <ModernInput
                label={formData.userType === 'student' ? "Institutional ID" : "Staff ID"}
                placeholder={formData.userType === 'student' ? "e.g. 20684123" : "e.g. 123456"}
                value={formData.identifier}
                onChangeText={(val) => setFormData(p => ({ ...p, identifier: val }))}
                icon="card"
                variant="outline"
                autoCapitalize="characters"
                keyboardType="number-pad"
              />

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Academic Status</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.typeScroll}>
                  {degreeTypes.map(type => (
                    <TouchableOpacity
                      key={type.id}
                      onPress={() => setFormData(p => ({ ...p, degreeType: type.id }))}
                      style={[
                        styles.typeCard,
                        formData.degreeType === type.id && styles.typeCardActive,
                        isDark && styles.darkTypeCard
                      ]}
                    >
                      <Ionicons 
                        name={type.icon} 
                        size={24} 
                        color={formData.degreeType === type.id ? '#FFFFFF' : '#6366F1'} 
                      />
                      <Text style={[
                        styles.typeTitle,
                        formData.degreeType === type.id && styles.textWhite,
                        isDark && (formData.degreeType === type.id ? styles.textWhite : styles.textWhite70)
                      ]}>
                        {type.title}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>

                {formData.degreeType === 'Undergraduate' && (
                  <>
                    <Text style={[styles.inputLabel, { marginTop: 15 }]}>Year / Level</Text>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.typeScroll}>
                      {academicLevels.map(level => (
                        <TouchableOpacity
                          key={level.id}
                          onPress={() => setFormData(p => ({ ...p, academicLevel: level.id }))}
                          style={[
                            styles.levelCircle,
                            formData.academicLevel === level.id && styles.levelCircleActive,
                            isDark && styles.darkLevelCircle
                          ]}
                        >
                          <Text style={[
                            styles.levelText,
                            formData.academicLevel === level.id && styles.textWhite,
                            isDark && (formData.academicLevel === level.id ? styles.textWhite : styles.textWhite70)
                          ]}>
                            {level.id}
                          </Text>
                        </TouchableOpacity>
                      ))}
                    </ScrollView>
                  </>
                )}
              </View>

              <View style={styles.academicSection}>
                <Text style={styles.inputLabel}>Select Your University</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.deptScroll}>
                  {UNIVERSITY_DATA.universities.map(uni => (
                    <TouchableOpacity
                      key={uni.id}
                      onPress={() => setFormData(p => ({ ...p, university: uni.name, college: '', programme: '', department: '' }))}
                      style={[
                        styles.deptBadge,
                        formData.university === uni.name && styles.deptBadgeActive,
                        isDark && styles.darkDeptBadge
                      ]}
                    >
                      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                        <Ionicons 
                          name="business-outline" 
                          size={16} 
                          color={formData.university === uni.name ? '#FFFFFF' : '#6366F1'} 
                          style={{ marginRight: 8 }} 
                        />
                        <Text style={[
                          styles.deptBadgeText,
                          formData.university === uni.name && styles.textWhite,
                          isDark && (formData.university === uni.name ? styles.textWhite : styles.textWhite70)
                        ]}>
                          {uni.name}
                        </Text>
                      </View>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>

              {formData.university && (formData.university.includes('Kwame Nkrumah') || formData.university.includes('KNUST')) ? (
                <>
                  <View style={styles.academicSection}>
                    <Text style={styles.inputLabel}>Select Your College</Text>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.deptScroll}>
                      {UNIVERSITY_DATA.knustColleges.map(college => (
                        <TouchableOpacity
                          key={college.id}
                          onPress={() => setFormData(p => ({ ...p, college: college.name, programme: '', department: college.name }))}
                          style={[
                            styles.deptBadge,
                            formData.college === college.name && styles.deptBadgeActive,
                            isDark && styles.darkDeptBadge
                          ]}
                        >
                          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                            <Ionicons 
                              name={collegeIcons[college.id] || 'school-outline'} 
                              size={16} 
                              color={formData.college === college.name ? '#FFFFFF' : '#6366F1'} 
                              style={{ marginRight: 8 }} 
                            />
                            <Text style={[
                              styles.deptBadgeText,
                              formData.college === college.name && styles.textWhite,
                              isDark && (formData.college === college.name ? styles.textWhite : styles.textWhite70)
                            ]}>
                              {college.name}
                            </Text>
                          </View>
                        </TouchableOpacity>
                      ))}
                    </ScrollView>
                  </View>

                  {formData.college && (
                    <View style={styles.academicSection}>
                      <Text style={styles.inputLabel}>Select Your Programme / Course</Text>
                      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.deptScroll}>
                        {UNIVERSITY_DATA.knustColleges.find(c => c.name === formData.college)?.programmes.map(prog => (
                          <TouchableOpacity
                            key={prog}
                            onPress={() => setFormData(p => ({ ...p, programme: prog }))}
                            style={[
                              styles.deptBadge,
                              formData.programme === prog && styles.deptBadgeActive,
                              isDark && styles.darkDeptBadge
                            ]}
                          >
                            <Text style={[
                              styles.deptBadgeText,
                              formData.programme === prog && styles.textWhite,
                              isDark && (formData.programme === prog ? styles.textWhite : styles.textWhite70)
                            ]}>
                              {prog}
                            </Text>
                          </TouchableOpacity>
                        ))}
                      </ScrollView>
                    </View>
                  )}
                </>
              ) : formData.university ? (
                <>
                  <ModernInput
                    label="Faculty / Department"
                    value={formData.department}
                    onChangeText={(val) => setFormData(p => ({ ...p, department: val, college: val }))}
                    icon="business"
                    variant="outline"
                    placeholder="e.g. Faculty of Arts"
                  />
                  <ModernInput
                    label="Programme / Course"
                    value={formData.programme}
                    onChangeText={(val) => setFormData(p => ({ ...p, programme: val }))}
                    icon="book"
                    variant="outline"
                    placeholder="e.g. BSc. Economics"
                  />
                </>
              ) : null}

              <ModernInput
                label="University Email"
                value={formData.email}
                onChangeText={(val) => setFormData(p => ({ ...p, email: val }))}
                icon="mail"
                variant="outline"
                placeholder="name@university.edu"
                keyboardType="email-address"
              />
            </View>

            <ModernButton onPress={nextStep} gradient={Colors.gradients.primary} style={styles.nextBtn}>
              Continue to Step 3
            </ModernButton>
          </Animated.View>
        );

      case 3:
        const filteredCourses = allCourses.filter(c => c.level === formData.academicLevel);
        const displayCoursesList = formData.userType === 'student' ? filteredCourses : allCourses;

        return (
          <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}>
            <View style={styles.stepHeader}>
              <View style={styles.stepBadge}>
                <Text style={styles.stepBadgeText}>Step 3</Text>
              </View>
              <Text style={styles.stepTitle}>{formData.userType === 'student' ? 'Academic Program' : 'Teaching Assignment'}</Text>
              <Text style={styles.stepSubtitle}>{formData.userType === 'student' ? 'Configure your level and active courses.' : 'Select the modules you are currently instructing.'}</Text>
            </View>

            {formData.userType === 'student' && (
              <View style={styles.levelSelector}>
                <Text style={styles.inputLabel}>Select Your Current Level</Text>
                <View style={styles.levelGrid}>
                  {academicLevels.map(lvl => (
                    <TouchableOpacity
                      key={lvl.id}
                      onPress={() => setFormData(p => ({ ...p, academicLevel: lvl.id, selectedCourses: [] }))}
                      style={[styles.levelCard, formData.academicLevel === lvl.id && styles.levelCardActive]}
                    >
                      <View style={[styles.levelIconCircle, formData.academicLevel === lvl.id && styles.levelIconCircleActive]}>
                        <Ionicons name={lvl.icon} size={18} color={formData.academicLevel === lvl.id ? '#FFFFFF' : '#6366F1'} />
                      </View>
                      <Text style={[styles.lvlText, formData.academicLevel === lvl.id && styles.textWhite]}>{lvl.title}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            )}

            <View style={styles.courseSection}>
              <Text style={styles.courseSelectHeader}>
                {formData.userType === 'student' ? `Level ${formData.academicLevel} Modules` : 'Available Departmental Courses'}
              </Text>

              <ScrollView style={styles.courseScroll} showsVerticalScrollIndicator={false}>
                {displayCoursesList.map(course => (
                  <TouchableOpacity
                    key={course.id}
                    onPress={() => toggleCourse(course.id)}
                    style={[styles.courseRow, formData.selectedCourses.includes(course.id) && styles.courseRowActive]}
                  >
                    <View style={styles.courseInfo}>
                      <Text style={[styles.courseCode, formData.selectedCourses.includes(course.id) && styles.textWhite]}>{course.code}</Text>
                      <Text style={[styles.courseName, formData.selectedCourses.includes(course.id) && styles.textWhite70]}>{course.name}</Text>
                    </View>
                    <View style={[styles.courseCheck, formData.selectedCourses.includes(course.id) && styles.courseCheckActive]}>
                      <Ionicons
                        name={formData.selectedCourses.includes(course.id) ? "checkmark" : "add"}
                        size={16}
                        color={formData.selectedCourses.includes(course.id) ? "#FFFFFF" : "#6366F1"}
                      />
                    </View>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>

            <ModernButton onPress={nextStep} gradient={Colors.gradients.primary} style={styles.nextBtn}>
              Continue to Step 4
            </ModernButton>
          </Animated.View>
        );

      case 4:
        return (
          <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}>
            <View style={styles.stepHeader}>
              <View style={styles.stepBadge}>
                <Text style={styles.stepBadgeText}>Step 4</Text>
              </View>
              <Text style={styles.stepTitle}>Security & Access</Text>
              <Text style={styles.stepSubtitle}>Create a strong password to protect your academic account.</Text>
            </View>

            <View style={styles.securityGroup}>

              <ModernInput
                label="Create Password"
                value={formData.password}
                onChangeText={(val) => {
                  setFormData(p => ({ ...p, password: val }));
                  calculatePasswordStrength(val);
                }}
                icon="lock-closed"
                secureTextEntry={!showPassword}
                variant="outline"
                placeholder="••••••••"
                rightIcon={showPassword ? "eye-off" : "eye"}
                onRightIconPress={() => setShowPassword(!showPassword)}
              />

              <View style={styles.strengthWrapper}>
                <View style={styles.strengthBarContainer}>
                  {[0.2, 0.4, 0.6, 0.8, 1.0].map((threshold, i) => (
                    <View
                      key={i}
                      style={[
                        styles.strengthSegment,
                        passwordStrength >= threshold && {
                          backgroundColor: passwordStrength <= 0.4 ? '#EF4444' : passwordStrength <= 0.6 ? '#F59E0B' : '#10B981'
                        }
                      ]}
                    />
                  ))}
                </View>
                <Text style={[
                  styles.strengthMessage,
                  { color: passwordStrength <= 0.4 ? '#EF4444' : passwordStrength <= 0.6 ? '#F59E0B' : '#10B981' }
                ]}>
                  {passwordStrength <= 0.4 ? 'Weak' : passwordStrength <= 0.6 ? 'Moderate' : 'Strong Password'}
                </Text>
              </View>

              <ModernInput
                label="Confirm Password"
                value={formData.confirmPassword}
                onChangeText={(val) => setFormData(p => ({ ...p, confirmPassword: val }))}
                icon="shield-checkmark"
                secureTextEntry={!showPassword}
                variant="outline"
                placeholder="••••••••"
              />
            </View>

            <View style={styles.agreementSection}>
              <TouchableOpacity
                style={styles.tcRow}
                onPress={() => setAcceptTerms(!acceptTerms)}
                activeOpacity={0.7}
              >
                <View style={[styles.checkbox, acceptTerms && styles.checkboxChecked]}>
                  {acceptTerms && <Ionicons name="checkmark" size={14} color="#FFFFFF" />}
                </View>
                <Text style={[styles.tcText, isDark && styles.textWhite70]}>
                  I agree to the <Text style={styles.tcLink}>Terms of Service</Text> and <Text style={styles.tcLink}>Privacy Policy</Text>
                </Text>
              </TouchableOpacity>
            </View>

            <ModernButton
              onPress={handleSignUp}
              gradient={Colors.gradients.primary}
              style={styles.nextBtn}
              loading={isLoading}
            >
              Create My Account
            </ModernButton>
          </Animated.View>
        );
    }
  };

  return (
    <AuthBackground isDark={isDark}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} translucent backgroundColor="transparent" />

      <TouchableOpacity
        style={styles.backBtn}
        onPress={() => step > 1 ? setStep(s => s - 1) : navigation.goBack()}
      >
        <BlurView intensity={20} style={styles.blurBack}>
          <Ionicons name="chevron-back" size={28} color={isDark ? '#FFFFFF' : '#1E293B'} />
        </BlurView>
      </TouchableOpacity>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.inner}
      >
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
          <View style={styles.headerArea}>
            <Text style={[styles.brandTitle, isDark && styles.textWhite]}>UniConnect</Text>
            <View style={styles.accentLine} />
            <Text style={[styles.brandSubtitle, isDark && styles.textWhite70]}>MEMBER ENROLLMENT</Text>
            {renderStepIndicator()}
          </View>

          <View style={styles.authShowcaseWrapper}>
            <AuthFeatureShowcase isDark={isDark} />
          </View>

          <View style={styles.glassContainer}>
            <BlurView intensity={Platform.OS === 'ios' ? 90 : 150} tint={isDark ? 'dark' : 'light'} style={styles.absoluteBlur} />
            <View style={styles.formContent}>
              {renderStep()}
            </View>
          </View>

          {step === 1 && (
            <TouchableOpacity style={styles.loginHint} onPress={() => navigation.navigate('Login')}>
              <Text style={styles.hintText}>Returning user? <Text style={styles.linkText}>SIGN IN ACCESS</Text></Text>
            </TouchableOpacity>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </AuthBackground>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  inner: { flex: 1 },
  backBtn: { position: 'absolute', top: 50, left: 20, zIndex: 10 },
  blurBack: { width: 44, height: 44, borderRadius: 22, overflow: 'hidden', justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' },
  scrollContent: { paddingTop: 100, paddingHorizontal: 24, paddingBottom: 60 },
  headerArea: { alignItems: 'center', marginBottom: 40 },
  brandTitle: { fontSize: 40, fontWeight: '200', color: '#1E293B', letterSpacing: -1 },
  accentLine: { width: 40, height: 2, backgroundColor: '#6366F1', marginVertical: 8, borderRadius: 1 },
  brandSubtitle: { fontSize: 10, color: '#64748B', fontWeight: '800', letterSpacing: 3 },
  textWhite: { color: '#FFFFFF' },
  textWhite70: { color: 'rgba(255,255,255,0.7)' },
  authShowcaseWrapper: { height: 160, marginBottom: 30 },
  progressContainer: { width: 100, height: 3, backgroundColor: 'rgba(99,102,241,0.1)', borderRadius: 2, marginTop: 20, overflow: 'hidden' },
  progressBar: { height: '100%', backgroundColor: '#6366F1', borderRadius: 2 },
  glassContainer: { borderRadius: 32, overflow: 'hidden', borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' },
  absoluteBlur: { ...StyleSheet.absoluteFillObject },
  formContent: { padding: 25 },
  stepTitle: { fontSize: 26, fontWeight: '800', color: '#1E293B', marginBottom: 8 },
  stepSubtitle: { fontSize: 14, color: '#64748B', marginBottom: 25, lineHeight: 20 },
  loginHint: { marginTop: 30, alignItems: 'center' },
  hintText: { fontSize: 14, color: '#64748B', fontWeight: '500' },
  linkText: { color: '#6366F1', fontWeight: '900' },
  // ... rest of the existing styles (typeGrid, typeCard etc.) remain same
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
  levelCircle: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    ...Shadows.small,
  },
  darkLevelCircle: {
    backgroundColor: '#1E293B',
    borderColor: '#334155',
  },
  levelCircleActive: {
    backgroundColor: '#6366F1',
    borderColor: '#6366F1',
  },
  levelText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#64748B',
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
    paddingHorizontal: 8,
  },
  stepHeader: {
    marginBottom: 24,
  },
  stepBadge: {
    backgroundColor: 'rgba(99, 102, 241, 0.1)',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 8,
    alignSelf: 'flex-start',
    marginBottom: 12,
  },
  stepBadgeText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#6366F1',
    textTransform: 'uppercase',
  },
  typeSelectorHeader: {
    marginTop: 24,
    marginBottom: 8,
  },
  typeIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#EEF2FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  typeIconContainerActive: {
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  checkBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
  },
  inputGroup: {
    gap: 16,
  },
  academicSection: {
    marginBottom: 8,
  },
  deptScroll: {
    gap: 10,
    paddingVertical: 8,
  },
  levelSelector: {
    marginBottom: 24,
  },
  levelIconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#EEF2FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 4,
  },
  levelIconCircleActive: {
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  courseCheck: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(99, 102, 241, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  courseCheckActive: {
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  securityGroup: {
    gap: 16,
  },
  strengthWrapper: {
    marginTop: -8,
    marginBottom: 8,
  },
  strengthBarContainer: {
    flexDirection: 'row',
    gap: 4,
    height: 4,
    marginBottom: 6,
  },
  strengthSegment: {
    flex: 1,
    height: '100%',
    backgroundColor: 'rgba(0,0,0,0.05)',
    borderRadius: 2,
  },
  strengthMessage: {
    fontSize: 12,
    fontWeight: '700',
  },
  agreementSection: {
    marginTop: 24,
  },
  deptBadge: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.4)',
    borderWidth: 1,
    borderColor: 'rgba(99, 102, 241, 0.1)',
  },
  darkDeptBadge: {
    backgroundColor: '#1E293B',
    borderColor: '#334155',
  },
  deptBadgeActive: {
    backgroundColor: '#6366F1',
    borderColor: '#6366F1',
  },
  deptBadgeText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#1E293B',
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '700',
    color: '#6366F1',
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 1,
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
  profileSection: {
    alignItems: 'center',
    marginBottom: 16,
  },
  imagePicker: {
    width: 96,
    height: 96,
    borderRadius: 48,
    overflow: 'hidden',
  },
  imagePlaceholder: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: 'rgba(99, 102, 241, 0.1)',
    borderWidth: 2,
    borderColor: 'rgba(99, 102, 241, 0.3)',
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
  },
  imagePlaceholderText: {
    fontSize: 11,
    color: '#6366F1',
    fontWeight: '600',
    marginTop: 4,
  },
  profilePrev: {
    width: 96,
    height: 96,
    borderRadius: 48,
  },
  strengthContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: -8,
    marginBottom: 12,
    gap: 12,
  },
  strengthBarBg: {
    flex: 1,
    height: 6,
    backgroundColor: 'rgba(0,0,0,0.06)',
    borderRadius: 3,
    overflow: 'hidden',
  },
  strengthBarFill: {
    height: 6,
    borderRadius: 3,
  },
  strengthLabel: {
    fontSize: 12,
    fontWeight: '700',
    width: 60,
    textAlign: 'right',
  },
  tcRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    gap: 12,
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: '#6366F1',
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxChecked: {
    backgroundColor: '#6366F1',
    borderColor: '#6366F1',
  },
  tcText: {
    flex: 1,
    fontSize: 13,
    color: '#64748B',
  },
  tcLink: {
    color: '#6366F1',
    fontWeight: '700',
  },
  courseSelectHeader: {
    fontSize: 14,
    fontWeight: '800',
    color: '#6366F1',
    marginTop: 24,
    marginBottom: 12,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  courseInfo: {
    flex: 1,
  },
});
