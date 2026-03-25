import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, ScrollView, TextInput, Animated, Easing, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useApp } from '../context/AppContext';

const { width } = Dimensions.get('window');

const GRADES = ['A', 'B+', 'B', 'C+', 'C', 'D+', 'D', 'F'];
const GRADE_POINTS = { 'A': 4.0, 'B+': 3.5, 'B': 3.0, 'C+': 2.5, 'C': 2.0, 'D+': 1.5, 'D': 1.0, 'F': 0 };

const GPACalculator = ({ visible, onClose, isDark }) => {
  const { csModules, user } = useApp();
  const [courses, setCourses] = useState([]);
  const [targetGPA, setTargetGPA] = useState('3.50');
  const [isImporting, setIsImporting] = useState(false);
  
  // Animations
  const slideAnim = useRef(new Animated.Value(300)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const progressAnim = useRef(new Animated.Value(0)).current;

  // Start animation when visible
  useEffect(() => {
    if (visible) {
      if (courses.length === 0) {
        addEmptyCourse();
      }
      Animated.parallel([
        Animated.spring(slideAnim, {
          toValue: 0,
          tension: 50,
          friction: 8,
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 400,
          useNativeDriver: true,
        })
      ]).start();
      
      animateProgress();
    } else {
      slideAnim.setValue(300);
      fadeAnim.setValue(0);
      progressAnim.setValue(0);
    }
  }, [visible]);

  useEffect(() => {
    animateProgress();
  }, [courses]);

  const animateProgress = () => {
    const currentGPA = parseFloat(calculateGPA());
    Animated.timing(progressAnim, {
      toValue: currentGPA / 4.0,
      duration: 1000,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: false,
    }).start();
  };

  const addEmptyCourse = () => {
    setCourses([...courses, { id: Date.now(), name: '', grade: 'A', credits: '3' }]);
  };

  const importFromProfile = () => {
    setIsImporting(true);
    setTimeout(() => {
      let myCourses = [];
      if (Array.isArray(csModules) && csModules.length > 0) {
        myCourses = csModules.map((c, i) => ({
          id: Date.now() + i,
          name: c.code || c.name || `Course ${i+1}`,
          grade: 'A',
          credits: c.credits ? String(c.credits) : '3'
        }));
      } else if (user?.academicLevel && csModules?.[user.academicLevel]) {
        myCourses = csModules[user.academicLevel].map((c, i) => ({
          id: Date.now() + i,
          name: c.code || c.name || `Course ${i+1}`,
          grade: 'A',
          credits: c.credits ? String(c.credits) : '3'
        }));
      }

      if (myCourses.length > 0) {
        setCourses(myCourses);
      } else {
        addEmptyCourse();
      }
      setIsImporting(false);
    }, 600);
  };

  const updateCourse = (id, field, value) => {
    setCourses(courses.map(c => c.id === id ? { ...c, [field]: value } : c));
  };

  const removeCourse = (id) => {
    if (courses.length > 1) {
      setCourses(courses.filter(c => c.id !== id));
    }
  };

  const calculateGPA = () => {
    let totalPoints = 0;
    let totalCredits = 0;
    
    courses.forEach(c => {
      const g = GRADE_POINTS[c.grade] || 0;
      const cr = parseFloat(c.credits) || 0;
      totalPoints += g * cr;
      totalCredits += cr;
    });

    return totalCredits > 0 ? (totalPoints / totalCredits).toFixed(2) : '0.00';
  };

  const getGpaColor = (gpa) => {
    if (gpa >= 3.6) return ['#10B981', '#059669']; // Excellent - Green
    if (gpa >= 3.0) return ['#3B82F6', '#2563EB']; // Good - Blue
    if (gpa >= 2.0) return ['#F59E0B', '#D97706']; // Average - Orange
    return ['#EF4444', '#DC2626']; // Poor - Red
  };

  const currentGPA = calculateGPA();
  const gpaColors = getGpaColor(parseFloat(currentGPA));
  const progressWidth = progressAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0%', '100%']
  });

  return (
    <Modal visible={visible} animationType="none" transparent>
      <Animated.View style={[styles.modalOverlay, { opacity: fadeAnim }]}>
        <Animated.View style={[styles.modalWrapper, { transform: [{ translateY: slideAnim }] }]}>
          <TouchableOpacity style={styles.closeArea} onPress={onClose} activeOpacity={1} />
          <View style={styles.modalContent}>
            <LinearGradient
              colors={isDark ? ['rgba(30, 41, 59, 0.95)', 'rgba(15, 23, 42, 0.98)'] : ['rgba(255, 255, 255, 0.95)', 'rgba(248, 250, 252, 0.98)']}
              style={styles.glassContainer}
            >
              <View style={styles.handleContainer}>
                <View style={[styles.handle, isDark && styles.handleDark]} />
              </View>

              <View style={styles.header}>
                <View>
                  <Text style={[styles.title, isDark && styles.textWhite]}>GPA Predictor</Text>
                  <Text style={[styles.subtitle, isDark && styles.textSubWhite]}>Simulate your results</Text>
                </View>
                <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
                  <Ionicons name="close-circle" size={32} color={isDark ? '#94A3B8' : '#64748B'} />
                </TouchableOpacity>
              </View>

              <View style={styles.topActions}>
                <TouchableOpacity style={styles.importBtn} onPress={importFromProfile} disabled={isImporting}>
                  <LinearGradient colors={['#6366F1', '#4F46E5']} style={styles.importBtnGradient}>
                    <Ionicons name="flash" size={16} color="#FFFFFF" />
                    <Text style={styles.importBtnText}>{isImporting ? 'Syncing...' : 'Auto-fill Courses'}</Text>
                  </LinearGradient>
                </TouchableOpacity>
              </View>

              {/* Premium Interactive GPA Score Card */}
              <View style={styles.resultCard}>
                <LinearGradient colors={gpaColors} style={styles.resultGradient} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
                  <View style={styles.statsRow}>
                    <View style={styles.mainScore}>
                      <Text style={styles.scoreLabel}>Current GPA</Text>
                      <Text style={styles.scoreValue}>{currentGPA}</Text>
                    </View>
                    <View style={styles.targetSection}>
                      <View style={styles.targetBox}>
                        <Text style={styles.targetLabel}>Target</Text>
                        <TextInput
                          style={styles.targetInput}
                          value={targetGPA}
                          onChangeText={setTargetGPA}
                          keyboardType="numeric"
                          maxLength={4}
                          selectTextOnFocus
                        />
                      </View>
                    </View>
                  </View>

                  <View style={styles.progressContainer}>
                    <View style={styles.track}>
                      <Animated.View style={[styles.fill, { width: progressWidth }]} />
                    </View>
                    <View style={styles.scaleRow}>
                      <Text style={styles.scaleText}>0.0</Text>
                      <Text style={styles.scaleText}>2.0</Text>
                      <Text style={styles.scaleText}>4.0</Text>
                    </View>
                  </View>
                </LinearGradient>
              </View>

              {/* Courses List */}
              <View style={styles.labelsRow}>
                <Text style={[styles.columnLabel, { flex: 2 }, isDark && styles.textSubWhite]}>Course ID/Name</Text>
                <Text style={[styles.columnLabel, { width: 70, textAlign: 'center' }, isDark && styles.textSubWhite]}>Grade</Text>
                <Text style={[styles.columnLabel, { width: 50, textAlign: 'center' }, isDark && styles.textSubWhite]}>Cr.</Text>
                <View style={{ width: 30 }} />
              </View>

              <ScrollView style={styles.courseList} showsVerticalScrollIndicator={false} contentContainerStyle={{paddingBottom: 20}}>
                {courses.map((course, index) => (
                  <View key={course.id} style={[styles.courseItem, isDark && styles.darkItem]}>
                    {/* Course Name */}
                    <TextInput
                      style={[styles.input, { flex: 2 }, isDark && styles.textWhite]}
                      placeholder="e.g. CSM 395"
                      placeholderTextColor={isDark ? '#64748B' : '#94A3B8'}
                      value={course.name}
                      onChangeText={(v) => updateCourse(course.id, 'name', v)}
                    />
                    
                    {/* Grade Selector - Minimalist */}
                    <TouchableOpacity 
                      style={[styles.gradeSelector, isDark && styles.darkInputArea]}
                      onPress={() => {
                        const nextGradeIdx = (GRADES.indexOf(course.grade) + 1) % GRADES.length;
                        updateCourse(course.id, 'grade', GRADES[nextGradeIdx]);
                      }}
                    >
                      <Text style={[styles.gradeText, { color: GRADE_POINTS[course.grade] >= 3.0 ? '#10B981' : GRADE_POINTS[course.grade] >= 2.0 ? '#F59E0B' : '#EF4444' }]}>
                        {course.grade}
                      </Text>
                    </TouchableOpacity>

                    {/* Credits */}
                    <TextInput
                      style={[styles.input, styles.creditInput, isDark && styles.darkInputArea, isDark && styles.textWhite]}
                      value={course.credits}
                      onChangeText={(v) => updateCourse(course.id, 'credits', v.replace(/[^0-9]/g, ''))}
                      keyboardType="numeric"
                      maxLength={1}
                      selectTextOnFocus
                    />
                    
                    {/* Delete */}
                    <TouchableOpacity style={styles.deleteBtn} onPress={() => removeCourse(course.id)}>
                      <Ionicons name="trash-outline" size={20} color={isDark ? '#64748B' : '#94A3B8'} />
                    </TouchableOpacity>
                  </View>
                ))}

                <TouchableOpacity style={styles.addBtnSolid} onPress={addEmptyCourse}>
                  <Ionicons name="add" size={20} color={isDark ? '#94A3B8' : '#64748B'} />
                  <Text style={[styles.addTextSolid, isDark && {color: '#94A3B8'}]}>Add Another Course</Text>
                </TouchableOpacity>
              </ScrollView>
            </LinearGradient>
          </View>
        </Animated.View>
      </Animated.View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'flex-end',
  },
  modalWrapper: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  closeArea: {
    flex: 1,
  },
  modalContent: {
    height: '92%',
    borderTopLeftRadius: 40,
    borderTopRightRadius: 40,
    overflow: 'hidden',
  },
  glassContainer: {
    flex: 1,
    padding: 24,
  },
  handleContainer: {
    alignItems: 'center',
    marginBottom: 20,
    marginTop: -10,
  },
  handle: {
    width: 44,
    height: 5,
    borderRadius: 3,
    backgroundColor: 'rgba(0,0,0,0.1)',
  },
  handleDark: {
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: '900',
    color: '#0F172A',
    letterSpacing: -1,
  },
  subtitle: {
    fontSize: 14,
    color: '#64748B',
    fontWeight: '500',
  },
  topActions: {
    marginBottom: 24,
  },
  importBtn: {
    borderRadius: 16,
    overflow: 'hidden',
    alignSelf: 'flex-start',
  },
  importBtnGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    gap: 8,
  },
  importBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },
  resultCard: {
    borderRadius: 32,
    overflow: 'hidden',
    shadowColor: '#6366F1',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 12,
    marginBottom: 24,
  },
  resultGradient: {
    padding: 24,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  mainScore: {
    flex: 1,
  },
  scoreLabel: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 12,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 4,
  },
  scoreValue: {
    color: '#FFFFFF',
    fontSize: 64,
    fontWeight: '900',
    letterSpacing: -2,
    lineHeight: 70,
  },
  targetSection: {
    alignItems: 'flex-end',
  },
  targetBox: {
    backgroundColor: 'rgba(255,255,255,0.15)',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    width: 90,
  },
  targetLabel: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 10,
    fontWeight: '800',
    textTransform: 'uppercase',
  },
  targetInput: {
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: '900',
    textAlign: 'center',
    padding: 0,
    marginTop: 2,
  },
  progressContainer: {
    marginTop: 8,
  },
  track: {
    height: 10,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 5,
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: 5,
  },
  scaleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  scaleText: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: 11,
    fontWeight: '800',
  },
  courseList: {
    flex: 1,
  },
  labelsRow: {
    flexDirection: 'row',
    paddingHorizontal: 8,
    marginBottom: 12,
    paddingRight: 40,
  },
  columnLabel: {
    fontSize: 11,
    color: '#64748B',
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  courseItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.02)',
    marginBottom: 12,
    gap: 12,
  },
  darkItem: {
    backgroundColor: 'rgba(255,255,255,0.05)',
  },
  input: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1E293B',
    flex: 1,
  },
  gradeSelector: {
    width: 60,
    height: 44,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  darkInputArea: {
    backgroundColor: '#1E293B',
  },
  gradeText: {
    fontSize: 16,
    fontWeight: '900',
  },
  creditInput: {
    width: 44,
    height: 44,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    textAlign: 'center',
    fontSize: 16,
    fontWeight: '800',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  deleteBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  addBtnSolid: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    marginTop: 8,
    gap: 10,
    borderRadius: 20,
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: 'rgba(99, 102, 241, 0.3)',
  },
  addTextSolid: {
    color: '#6366F1',
    fontSize: 15,
    fontWeight: '800',
  },
  textWhite: { color: '#F8FAFC' },
  textSubWhite: { color: '#94A3B8' },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  darkContainer: {
    backgroundColor: '#0F172A',
  },
  loadingCard: {
    padding: 30,
    borderRadius: 30,
    alignItems: 'center',
    gap: 15,
  },
  loadingText: {
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: '900',
  },
});

export default GPACalculator;
