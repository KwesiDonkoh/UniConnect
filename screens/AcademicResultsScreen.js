import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  Dimensions,
  FlatList,
  Alert,
  Animated,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useApp } from '../context/AppContext';

const { width, height } = Dimensions.get('window');

export default function AcademicResultsScreen({ navigation }) {
  const { user, csModules } = useApp();
  const [selectedSemester, setSelectedSemester] = useState('current');
  const [selectedLevel, setSelectedLevel] = useState(user?.academicLevel || '100');
  const [results, setResults] = useState([]);
  const [summary, setSummary] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  // Animation refs
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;

  useEffect(() => {
    if (user?.uid) {
      loadAcademicResults();
      startAnimations();
    }
  }, [user?.uid, selectedLevel, selectedSemester]);

  const startAnimations = () => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 600,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const loadAcademicResults = async () => {
    try {
      setIsLoading(true);
      
      // Mock academic results data
      const mockResults = [
        {
          id: 'csm151',
          courseCode: 'CSM151',
          courseName: 'Information Technology I',
          credits: 3,
          semester: 1,
          level: '100',
          assignments: [
            { name: 'Assignment 1', score: 85, total: 100, weight: 20 },
            { name: 'Assignment 2', score: 78, total: 100, weight: 20 },
            { name: 'Midterm Exam', score: 82, total: 100, weight: 30 },
            { name: 'Final Exam', score: 88, total: 100, weight: 30 },
          ],
          totalScore: 83.1,
          grade: 'B+',
          gpa: 3.3,
          status: 'completed',
          instructor: 'Dr. Sarah Johnson'
        },
        {
          id: 'csm157',
          courseCode: 'CSM157',
          courseName: 'Introduction to Structured Program Design',
          credits: 3,
          semester: 1,
          level: '100',
          assignments: [
            { name: 'Programming Assignment 1', score: 92, total: 100, weight: 25 },
            { name: 'Programming Assignment 2', score: 88, total: 100, weight: 25 },
            { name: 'Midterm Project', score: 90, total: 100, weight: 25 },
            { name: 'Final Project', score: 95, total: 100, weight: 25 },
          ],
          totalScore: 91.25,
          grade: 'A-',
          gpa: 3.7,
          status: 'completed',
          instructor: 'Dr. Emily Rodriguez'
        },
        {
          id: 'math163',
          courseCode: 'MATH163',
          courseName: 'Discrete Mathematics I',
          credits: 3,
          semester: 1,
          level: '100',
          assignments: [
            { name: 'Quiz 1', score: 78, total: 100, weight: 15 },
            { name: 'Quiz 2', score: 85, total: 100, weight: 15 },
            { name: 'Midterm Exam', score: 75, total: 100, weight: 35 },
            { name: 'Final Exam', score: 80, total: 100, weight: 35 },
          ],
          totalScore: 79.05,
          grade: 'B',
          gpa: 3.0,
          status: 'completed',
          instructor: 'Dr. James Wilson'
        },
        {
          id: 'csm281',
          courseCode: 'CSM281',
          courseName: 'Object Oriented Programming with JAVA',
          credits: 3,
          semester: 1,
          level: '200',
          assignments: [
            { name: 'Lab Assignment 1', score: 88, total: 100, weight: 20 },
            { name: 'Lab Assignment 2', score: 85, total: 100, weight: 20 },
            { name: 'Project Milestone', score: 90, total: 100, weight: 30 },
            { name: 'Final Project', score: 87, total: 100, weight: 30 },
          ],
          totalScore: 87.5,
          grade: 'A-',
          gpa: 3.7,
          status: 'in_progress',
          instructor: 'Prof. David Lee'
        }
      ];

      // Filter results based on selected level and semester
      let filteredResults = mockResults.filter(result => result.level === selectedLevel);
      
      if (selectedSemester !== 'all') {
        if (selectedSemester === 'current') {
          filteredResults = filteredResults.filter(result => result.status === 'in_progress');
        } else {
          filteredResults = filteredResults.filter(result => result.semester.toString() === selectedSemester);
        }
      }

      setResults(filteredResults);

      // Calculate summary
      const completedCourses = filteredResults.filter(r => r.status === 'completed');
      const totalCredits = completedCourses.reduce((sum, r) => sum + r.credits, 0);
      const totalGPA = completedCourses.reduce((sum, r) => sum + (r.gpa * r.credits), 0);
      const cgpa = totalCredits > 0 ? (totalGPA / totalCredits).toFixed(2) : '0.00';
      const averageScore = completedCourses.length > 0 
        ? (completedCourses.reduce((sum, r) => sum + r.totalScore, 0) / completedCourses.length).toFixed(1)
        : '0.0';

      setSummary({
        totalCourses: filteredResults.length,
        completedCourses: completedCourses.length,
        totalCredits,
        cgpa,
        averageScore,
        highestGrade: completedCourses.length > 0 ? Math.max(...completedCourses.map(r => r.totalScore)).toFixed(1) : '0.0',
        lowestGrade: completedCourses.length > 0 ? Math.min(...completedCourses.map(r => r.totalScore)).toFixed(1) : '0.0'
      });

    } catch (error) {
      console.error('Error loading academic results:', error);
      Alert.alert('Error', 'Failed to load academic results');
    } finally {
      setIsLoading(false);
    }
  };

  const getGradeColor = (grade) => {
    switch (grade) {
      case 'A+': case 'A': case 'A-': return '#10B981';
      case 'B+': case 'B': case 'B-': return '#F59E0B';
      case 'C+': case 'C': case 'C-': return '#EF4444';
      case 'D+': case 'D': return '#8B5CF6';
      default: return '#6B7280';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed': return '#10B981';
      case 'in_progress': return '#3B82F6';
      case 'failed': return '#EF4444';
      default: return '#6B7280';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'completed': return 'Completed';
      case 'in_progress': return 'In Progress';
      case 'failed': return 'Failed';
      default: return 'Unknown';
    }
  };

  const renderResultCard = ({ item }) => (
    <TouchableOpacity 
      style={styles.resultCard}
      onPress={() => {
        Alert.alert(
          item.courseName,
          `Course Code: ${item.courseCode}\nInstructor: ${item.instructor}\nCredits: ${item.credits}\nTotal Score: ${item.totalScore}%\nGrade: ${item.grade}`,
          [
            { text: 'View Details', onPress: () => showCourseDetails(item) },
            { text: 'OK', style: 'cancel' }
          ]
        );
      }}
    >
      <View style={styles.resultHeader}>
        <LinearGradient
          colors={[getGradeColor(item.grade), getGradeColor(item.grade) + '80']}
          style={styles.gradeCircle}
        >
          <Text style={styles.gradeText}>{item.grade}</Text>
        </LinearGradient>
        
        <View style={styles.courseInfo}>
          <Text style={styles.courseCode}>{item.courseCode}</Text>
          <Text style={styles.courseName}>{item.courseName}</Text>
          <Text style={styles.instructor}>👨‍🏫 {item.instructor}</Text>
        </View>

        <View style={styles.resultStats}>
          <Text style={[styles.totalScore, { color: getGradeColor(item.grade) }]}>
            {item.totalScore}%
          </Text>
          <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) }]}>
            <Text style={styles.statusText}>{getStatusText(item.status)}</Text>
          </View>
        </View>
      </View>

      <View style={styles.assignmentsList}>
        {item.assignments.map((assignment, index) => (
          <View key={index} style={styles.assignmentItem}>
            <Text style={styles.assignmentName}>{assignment.name}</Text>
            <Text style={styles.assignmentScore}>
              {assignment.score}/{assignment.total} ({assignment.weight}%)
            </Text>
          </View>
        ))}
      </View>
    </TouchableOpacity>
  );

  const showCourseDetails = (course) => {
    // Navigate to detailed course results view
    Alert.alert(
      'Course Breakdown',
      course.assignments.map(a => 
        `${a.name}: ${a.score}/${a.total} (${a.weight}%)`
      ).join('\n') + `\n\nTotal: ${course.totalScore}%\nGrade: ${course.grade}\nGPA Points: ${course.gpa}`
    );
  };

  const exportResults = () => {
    Alert.alert(
      'Export Results',
      'Choose export format:',
      [
        { text: 'PDF Transcript', onPress: () => Alert.alert('Success', 'PDF transcript will be sent to your email.') },
        { text: 'Excel Report', onPress: () => Alert.alert('Success', 'Excel report will be sent to your email.') },
        { text: 'Cancel', style: 'cancel' }
      ]
    );
  };

  if (!user) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#4F46E5" />
          <Text style={styles.loadingText}>Loading results...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#1E293B" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Academic Results</Text>
        <TouchableOpacity onPress={exportResults}>
          <Ionicons name="download" size={24} color="#4F46E5" />
        </TouchableOpacity>
      </View>

      <Animated.View style={{ flex: 1, opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}>
        {/* Filters */}
        <View style={styles.filtersContainer}>
          {/* Level Selector */}
          <View style={styles.filterGroup}>
            <Text style={styles.filterLabel}>Level</Text>
            <View style={styles.filterButtons}>
              {['100', '200', '300', '400'].map((level) => (
                <TouchableOpacity
                  key={level}
                  style={[styles.filterButton, selectedLevel === level && styles.selectedFilter]}
                  onPress={() => setSelectedLevel(level)}
                >
                  <Text style={[
                    styles.filterButtonText,
                    selectedLevel === level && styles.selectedFilterText
                  ]}>
                    {level}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Semester Selector */}
          <View style={styles.filterGroup}>
            <Text style={styles.filterLabel}>Period</Text>
            <View style={styles.filterButtons}>
              {[
                { key: 'current', label: 'Current' },
                { key: 'all', label: 'All' },
                { key: '1', label: 'Sem 1' },
                { key: '2', label: 'Sem 2' }
              ].map((period) => (
                <TouchableOpacity
                  key={period.key}
                  style={[styles.filterButton, selectedSemester === period.key && styles.selectedFilter]}
                  onPress={() => setSelectedSemester(period.key)}
                >
                  <Text style={[
                    styles.filterButtonText,
                    selectedSemester === period.key && styles.selectedFilterText
                  ]}>
                    {period.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </View>

        {/* Academic Summary */}
        <View style={styles.summaryContainer}>
          <LinearGradient
            colors={['#4F46E5', '#7C3AED']}
            style={styles.summaryGradient}
          >
            <View style={styles.summaryRow}>
              <View style={styles.summaryItem}>
                <Text style={styles.summaryNumber}>{summary.cgpa}</Text>
                <Text style={styles.summaryLabel}>CGPA</Text>
              </View>
              <View style={styles.summaryItem}>
                <Text style={styles.summaryNumber}>{summary.averageScore}%</Text>
                <Text style={styles.summaryLabel}>Average</Text>
              </View>
              <View style={styles.summaryItem}>
                <Text style={styles.summaryNumber}>{summary.totalCredits}</Text>
                <Text style={styles.summaryLabel}>Credits</Text>
              </View>
            </View>
            
            <View style={styles.summaryRow}>
              <View style={styles.summaryItem}>
                <Text style={styles.summaryNumber}>{summary.completedCourses}</Text>
                <Text style={styles.summaryLabel}>Completed</Text>
              </View>
              <View style={styles.summaryItem}>
                <Text style={styles.summaryNumber}>{summary.highestGrade}%</Text>
                <Text style={styles.summaryLabel}>Highest</Text>
              </View>
              <View style={styles.summaryItem}>
                <Text style={styles.summaryNumber}>{summary.lowestGrade}%</Text>
                <Text style={styles.summaryLabel}>Lowest</Text>
              </View>
            </View>
          </LinearGradient>
        </View>

        {/* Results List */}
        <View style={styles.resultsContainer}>
          <Text style={styles.sectionTitle}>
            Course Results - Level {selectedLevel}
            {selectedSemester !== 'all' && selectedSemester !== 'current' && ` (Semester ${selectedSemester})`}
            {selectedSemester === 'current' && ' (Current Courses)'}
          </Text>
          
          {isLoading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#4F46E5" />
              <Text style={styles.loadingText}>Loading results...</Text>
            </View>
          ) : results.length === 0 ? (
            <View style={styles.emptyState}>
              <Ionicons name="school-outline" size={64} color="#94A3B8" />
              <Text style={styles.emptyStateTitle}>No Results Found</Text>
              <Text style={styles.emptyStateText}>
                {selectedSemester === 'current' 
                  ? 'No courses currently in progress.'
                  : 'No results available for the selected period.'}
              </Text>
            </View>
          ) : (
            <FlatList
              data={results}
              renderItem={renderResultCard}
              keyExtractor={(item) => item.id}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.resultsList}
            />
          )}
        </View>
      </Animated.View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#64748B',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1E293B',
  },
  filtersContainer: {
    backgroundColor: '#FFFFFF',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  filterGroup: {
    marginBottom: 16,
  },
  filterLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1E293B',
    marginBottom: 8,
  },
  filterButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  filterButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    backgroundColor: '#F1F5F9',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  selectedFilter: {
    backgroundColor: '#4F46E5',
    borderColor: '#4F46E5',
  },
  filterButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#64748B',
  },
  selectedFilterText: {
    color: '#FFFFFF',
  },
  summaryContainer: {
    margin: 20,
    borderRadius: 16,
    overflow: 'hidden',
  },
  summaryGradient: {
    padding: 24,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 20,
  },
  summaryItem: {
    alignItems: 'center',
  },
  summaryNumber: {
    fontSize: 24,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  summaryLabel: {
    fontSize: 12,
    color: '#E2E8F0',
    textAlign: 'center',
  },
  resultsContainer: {
    flex: 1,
    paddingHorizontal: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1E293B',
    marginBottom: 16,
  },
  resultsList: {
    paddingBottom: 20,
  },
  resultCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  resultHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  gradeCircle: {
    width: 50,
    height: 50,
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  gradeText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  courseInfo: {
    flex: 1,
  },
  courseCode: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1E293B',
    marginBottom: 4,
  },
  courseName: {
    fontSize: 14,
    color: '#64748B',
    marginBottom: 4,
  },
  instructor: {
    fontSize: 12,
    color: '#64748B',
  },
  resultStats: {
    alignItems: 'flex-end',
  },
  totalScore: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 8,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  assignmentsList: {
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
    paddingTop: 16,
  },
  assignmentItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  assignmentName: {
    fontSize: 14,
    color: '#1E293B',
    flex: 1,
  },
  assignmentScore: {
    fontSize: 14,
    fontWeight: '600',
    color: '#64748B',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyStateTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1E293B',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyStateText: {
    fontSize: 14,
    color: '#64748B',
    textAlign: 'center',
    paddingHorizontal: 40,
  },
});
