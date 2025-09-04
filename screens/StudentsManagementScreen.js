import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  Dimensions,
  Animated,
  RefreshControl,
  FlatList,
  Modal,
  TextInput,
  Alert,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { StatusBar } from 'expo-status-bar';
import { useApp } from '../context/AppContext';
import { Colors } from '../themes/modernTheme';

const { width, height } = Dimensions.get('window');

export default function StudentsManagementScreen({ navigation }) {
  const { user, csModules } = useApp();
  const [refreshing, setRefreshing] = useState(false);
  const [selectedView, setSelectedView] = useState('overview');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLevel, setSelectedLevel] = useState('all');
  const [showStudentDetails, setShowStudentDetails] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);
  
  const fadeAnim = useRef(new Animated.Value(0)).current;

  // Mock student data - in a real app, this would come from a service
  const [studentsData] = useState([
    {
      id: '1',
      name: 'Alice Johnson',
      studentId: 'CST2024001',
      level: '200',
      email: 'alice.johnson@university.edu',
      avatar: '👩‍🎓',
      gpa: 3.8,
      attendance: 92,
      assignments: { completed: 18, total: 20 },
      lastActive: '2 hours ago',
      status: 'active',
      courses: ['CSM251', 'CSM253', 'CSM257'],
    },
    {
      id: '2',
      name: 'Bob Smith',
      studentId: 'CST2024002',
      level: '300',
      email: 'bob.smith@university.edu',
      avatar: '👨‍🎓',
      gpa: 3.5,
      attendance: 88,
      assignments: { completed: 15, total: 18 },
      lastActive: '1 day ago',
      status: 'active',
      courses: ['CSM351', 'CSM353', 'CSM357'],
    },
    {
      id: '3',
      name: 'Carol Davis',
      studentId: 'CST2024003',
      level: '100',
      email: 'carol.davis@university.edu',
      avatar: '👩‍🎓',
      gpa: 3.9,
      attendance: 95,
      assignments: { completed: 22, total: 22 },
      lastActive: '30 minutes ago',
      status: 'active',
      courses: ['CSM151', 'CSM153', 'CSM157'],
    },
    {
      id: '4',
      name: 'David Wilson',
      studentId: 'CST2024004',
      level: '400',
      email: 'david.wilson@university.edu',
      avatar: '👨‍🎓',
      gpa: 3.7,
      attendance: 85,
      assignments: { completed: 12, total: 15 },
      lastActive: '3 days ago',
      status: 'inactive',
      courses: ['CSM451', 'CSM453', 'CSM457'],
    },
    {
      id: '5',
      name: 'Emma Brown',
      studentId: 'CST2024005',
      level: '200',
      email: 'emma.brown@university.edu',
      avatar: '👩‍🎓',
      gpa: 3.6,
      attendance: 90,
      assignments: { completed: 17, total: 20 },
      lastActive: '5 hours ago',
      status: 'active',
      courses: ['CSM251', 'CSM253', 'CSM257'],
    },
  ]);

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 800,
      useNativeDriver: true,
    }).start();
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    // Simulate data refresh
    setTimeout(() => setRefreshing(false), 1500);
  };

  // Filter students based on search and level
  const filteredStudents = studentsData.filter(student => {
    const matchesSearch = student.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         student.studentId.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         student.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesLevel = selectedLevel === 'all' || student.level === selectedLevel;
    return matchesSearch && matchesLevel;
  });

  // Calculate statistics
  const stats = {
    total: studentsData.length,
    active: studentsData.filter(s => s.status === 'active').length,
    averageGPA: (studentsData.reduce((sum, s) => sum + s.gpa, 0) / studentsData.length).toFixed(2),
    averageAttendance: Math.round(studentsData.reduce((sum, s) => sum + s.attendance, 0) / studentsData.length),
  };

  const viewTabs = [
    { id: 'overview', name: 'Overview', icon: 'analytics-outline' },
    { id: 'students', name: 'Students', icon: 'people-outline' },
    { id: 'performance', name: 'Performance', icon: 'trending-up-outline' },
    { id: 'attendance', name: 'Attendance', icon: 'calendar-outline' },
  ];

  const levelFilters = [
    { id: 'all', name: 'All Levels' },
    { id: '100', name: 'Level 100' },
    { id: '200', name: 'Level 200' },
    { id: '300', name: 'Level 300' },
    { id: '400', name: 'Level 400' },
  ];

  const renderStatCard = (title, value, icon, color) => (
    <View style={[styles.statCard, { borderLeftColor: color }]}>
      <View style={styles.statHeader}>
        <Ionicons name={icon} size={24} color={color} />
        <Text style={styles.statTitle}>{title}</Text>
      </View>
      <Text style={[styles.statValue, { color }]}>{value}</Text>
    </View>
  );

  const renderStudentCard = ({ item }) => (
    <TouchableOpacity
      style={styles.studentCard}
      onPress={() => {
        setSelectedStudent(item);
        setShowStudentDetails(true);
      }}
    >
      <View style={styles.studentHeader}>
        <Text style={styles.studentAvatar}>{item.avatar}</Text>
        <View style={styles.studentInfo}>
          <Text style={styles.studentName}>{item.name}</Text>
          <Text style={styles.studentId}>{item.studentId}</Text>
          <Text style={styles.studentLevel}>Level {item.level}</Text>
        </View>
        <View style={styles.studentStatus}>
          <View style={[
            styles.statusIndicator,
            { backgroundColor: item.status === 'active' ? Colors.success[500] : Colors.warning[500] }
          ]} />
          <Text style={[
            styles.statusText,
            { color: item.status === 'active' ? Colors.success[600] : Colors.warning[600] }
          ]}>
            {item.status === 'active' ? 'Active' : 'Inactive'}
          </Text>
        </View>
      </View>

      <View style={styles.studentMetrics}>
        <View style={styles.metric}>
          <Text style={styles.metricLabel}>GPA</Text>
          <Text style={[styles.metricValue, { color: item.gpa >= 3.5 ? Colors.success[600] : Colors.warning[600] }]}>
            {item.gpa}
          </Text>
        </View>
        <View style={styles.metric}>
          <Text style={styles.metricLabel}>Attendance</Text>
          <Text style={[styles.metricValue, { color: item.attendance >= 90 ? Colors.success[600] : Colors.warning[600] }]}>
            {item.attendance}%
          </Text>
        </View>
        <View style={styles.metric}>
          <Text style={styles.metricLabel}>Assignments</Text>
          <Text style={styles.metricValue}>
            {item.assignments.completed}/{item.assignments.total}
          </Text>
        </View>
      </View>

      <Text style={styles.lastActive}>Last active: {item.lastActive}</Text>
    </TouchableOpacity>
  );

  const renderOverview = () => (
    <ScrollView style={styles.tabContent}>
      <View style={styles.statsGrid}>
        {renderStatCard('Total Students', stats.total, 'people', Colors.primary[500])}
        {renderStatCard('Active Students', stats.active, 'checkmark-circle', Colors.success[500])}
        {renderStatCard('Average GPA', stats.averageGPA, 'school', Colors.info[500])}
        {renderStatCard('Avg Attendance', `${stats.averageAttendance}%`, 'calendar', Colors.warning[500])}
      </View>

      <View style={styles.recentActivity}>
        <Text style={styles.sectionTitle}>Recent Activity</Text>
        <View style={styles.activityList}>
          <View style={styles.activityItem}>
            <Ionicons name="document-text" size={20} color={Colors.primary[500]} />
            <Text style={styles.activityText}>5 new assignments submitted</Text>
            <Text style={styles.activityTime}>2 hours ago</Text>
          </View>
          <View style={styles.activityItem}>
            <Ionicons name="person-add" size={20} color={Colors.success[500]} />
            <Text style={styles.activityText}>3 students joined CSM251</Text>
            <Text style={styles.activityTime}>1 day ago</Text>
          </View>
          <View style={styles.activityItem}>
            <Ionicons name="alert-circle" size={20} color={Colors.warning[500]} />
            <Text style={styles.activityText}>Low attendance alert for 2 students</Text>
            <Text style={styles.activityTime}>2 days ago</Text>
          </View>
        </View>
      </View>
    </ScrollView>
  );

  const renderStudentsList = () => (
    <View style={styles.tabContent}>
      <View style={styles.searchAndFilter}>
        <View style={styles.searchContainer}>
          <Ionicons name="search" size={20} color={Colors.neutral[400]} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search students..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholderTextColor={Colors.neutral[400]}
          />
        </View>
        
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          style={styles.filterContainer}
        >
          {levelFilters.map(filter => (
            <TouchableOpacity
              key={filter.id}
              style={[
                styles.filterButton,
                selectedLevel === filter.id && styles.activeFilterButton
              ]}
              onPress={() => setSelectedLevel(filter.id)}
            >
              <Text style={[
                styles.filterButtonText,
                selectedLevel === filter.id && styles.activeFilterButtonText
              ]}>
                {filter.name}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      <FlatList
        data={filteredStudents}
        renderItem={renderStudentCard}
        keyExtractor={item => item.id}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.studentsList}
      />
    </View>
  );

  const renderContent = () => {
    switch (selectedView) {
      case 'overview':
        return renderOverview();
      case 'students':
        return renderStudentsList();
      case 'performance':
        return (
          <View style={styles.tabContent}>
            <Text style={styles.comingSoon}>Performance Analytics Coming Soon</Text>
          </View>
        );
      case 'attendance':
        return (
          <View style={styles.tabContent}>
            <Text style={styles.comingSoon}>Attendance Tracking Coming Soon</Text>
          </View>
        );
      default:
        return renderOverview();
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="light" />
      
      {/* Header */}
      <LinearGradient
        colors={[Colors.primary[600], Colors.primary[500]]}
        style={styles.header}
      >
        <View style={styles.headerContent}>
          <View>
            <Text style={styles.headerTitle}>Students Management</Text>
            <Text style={styles.headerSubtitle}>
              Managing {stats.total} students across all levels
            </Text>
          </View>
          <TouchableOpacity
            style={styles.headerButton}
            onPress={() => Alert.alert('Export', 'Export functionality coming soon!')}
          >
            <Ionicons name="download-outline" size={24} color="white" />
          </TouchableOpacity>
        </View>
      </LinearGradient>

      {/* View Tabs */}
      <View style={styles.tabsContainer}>
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.tabsScrollView}
        >
          {viewTabs.map(tab => (
            <TouchableOpacity
              key={tab.id}
              style={[
                styles.tab,
                selectedView === tab.id && styles.activeTab
              ]}
              onPress={() => setSelectedView(tab.id)}
            >
              <Ionicons 
                name={tab.icon} 
                size={20} 
                color={selectedView === tab.id ? Colors.primary[600] : Colors.neutral[500]} 
              />
              <Text style={[
                styles.tabText,
                selectedView === tab.id && styles.activeTabText
              ]}>
                {tab.name}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Content */}
      <Animated.View style={[styles.content, { opacity: fadeAnim }]}>
        <ScrollView
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          showsVerticalScrollIndicator={false}
        >
          {renderContent()}
        </ScrollView>
      </Animated.View>

      {/* Student Details Modal */}
      <Modal
        visible={showStudentDetails}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowStudentDetails(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            {selectedStudent && (
              <>
                <View style={styles.modalHeader}>
                  <Text style={styles.modalTitle}>Student Details</Text>
                  <TouchableOpacity
                    style={styles.closeButton}
                    onPress={() => setShowStudentDetails(false)}
                  >
                    <Ionicons name="close" size={24} color={Colors.neutral[600]} />
                  </TouchableOpacity>
                </View>

                <ScrollView style={styles.modalBody}>
                  <View style={styles.studentDetailCard}>
                    <Text style={styles.studentDetailAvatar}>{selectedStudent.avatar}</Text>
                    <Text style={styles.studentDetailName}>{selectedStudent.name}</Text>
                    <Text style={styles.studentDetailId}>{selectedStudent.studentId}</Text>
                    <Text style={styles.studentDetailEmail}>{selectedStudent.email}</Text>
                  </View>

                  <View style={styles.detailSection}>
                    <Text style={styles.detailSectionTitle}>Academic Performance</Text>
                    <View style={styles.detailRow}>
                      <Text style={styles.detailLabel}>GPA:</Text>
                      <Text style={styles.detailValue}>{selectedStudent.gpa}</Text>
                    </View>
                    <View style={styles.detailRow}>
                      <Text style={styles.detailLabel}>Attendance:</Text>
                      <Text style={styles.detailValue}>{selectedStudent.attendance}%</Text>
                    </View>
                    <View style={styles.detailRow}>
                      <Text style={styles.detailLabel}>Assignments:</Text>
                      <Text style={styles.detailValue}>
                        {selectedStudent.assignments.completed}/{selectedStudent.assignments.total}
                      </Text>
                    </View>
                  </View>

                  <View style={styles.detailSection}>
                    <Text style={styles.detailSectionTitle}>Enrolled Courses</Text>
                    {selectedStudent.courses.map(course => (
                      <Text key={course} style={styles.courseItem}>{course}</Text>
                    ))}
                  </View>
                </ScrollView>

                <View style={styles.modalActions}>
                  <TouchableOpacity
                    style={styles.actionButton}
                    onPress={() => {
                      setShowStudentDetails(false);
                      // Navigate to messaging
                      navigation.navigate('PrivateMessaging');
                    }}
                  >
                    <Ionicons name="mail" size={20} color="white" />
                    <Text style={styles.actionButtonText}>Message</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.actionButton, styles.secondaryActionButton]}
                    onPress={() => {
                      Alert.alert('View Profile', 'Full profile view coming soon!');
                    }}
                  >
                    <Ionicons name="person" size={20} color={Colors.primary[600]} />
                    <Text style={[styles.actionButtonText, styles.secondaryActionButtonText]}>
                      View Profile
                    </Text>
                  </TouchableOpacity>
                </View>
              </>
            )}
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.neutral[50],
  },
  header: {
    paddingTop: Platform.OS === 'ios' ? 0 : 20,
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
  },
  headerButton: {
    padding: 12,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 12,
  },
  tabsContainer: {
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: Colors.neutral[200],
  },
  tabsScrollView: {
    paddingHorizontal: 20,
  },
  tab: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 20,
    marginRight: 8,
    borderRadius: 12,
  },
  activeTab: {
    backgroundColor: Colors.primary[50],
  },
  tabText: {
    marginLeft: 8,
    fontSize: 14,
    fontWeight: '500',
    color: Colors.neutral[600],
  },
  activeTabText: {
    color: Colors.primary[600],
    fontWeight: '600',
  },
  content: {
    flex: 1,
  },
  tabContent: {
    flex: 1,
    padding: 20,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 24,
  },
  statCard: {
    flex: 1,
    minWidth: (width - 60) / 2,
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 12,
    borderLeftWidth: 4,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  statHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  statTitle: {
    marginLeft: 8,
    fontSize: 12,
    fontWeight: '500',
    color: Colors.neutral[600],
    textTransform: 'uppercase',
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  recentActivity: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.neutral[800],
    marginBottom: 16,
  },
  activityList: {
    gap: 12,
  },
  activityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
  },
  activityText: {
    flex: 1,
    marginLeft: 12,
    fontSize: 14,
    color: Colors.neutral[700],
  },
  activityTime: {
    fontSize: 12,
    color: Colors.neutral[500],
  },
  searchAndFilter: {
    marginBottom: 20,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    marginBottom: 12,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
    fontSize: 16,
    color: Colors.neutral[800],
  },
  filterContainer: {
    flexDirection: 'row',
  },
  filterButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: 'white',
    borderRadius: 20,
    marginRight: 8,
    borderWidth: 1,
    borderColor: Colors.neutral[300],
  },
  activeFilterButton: {
    backgroundColor: Colors.primary[500],
    borderColor: Colors.primary[500],
  },
  filterButtonText: {
    fontSize: 14,
    color: Colors.neutral[600],
    fontWeight: '500',
  },
  activeFilterButtonText: {
    color: 'white',
  },
  studentsList: {
    gap: 12,
  },
  studentCard: {
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 12,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  studentHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  studentAvatar: {
    fontSize: 32,
    marginRight: 12,
  },
  studentInfo: {
    flex: 1,
  },
  studentName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.neutral[800],
    marginBottom: 2,
  },
  studentId: {
    fontSize: 14,
    color: Colors.neutral[600],
    marginBottom: 2,
  },
  studentLevel: {
    fontSize: 12,
    color: Colors.primary[600],
    fontWeight: '500',
  },
  studentStatus: {
    alignItems: 'center',
  },
  statusIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginBottom: 4,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '500',
  },
  studentMetrics: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: Colors.neutral[200],
    borderBottomWidth: 1,
    borderBottomColor: Colors.neutral[200],
    marginBottom: 8,
  },
  metric: {
    alignItems: 'center',
  },
  metricLabel: {
    fontSize: 12,
    color: Colors.neutral[500],
    marginBottom: 4,
  },
  metricValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.neutral[800],
  },
  lastActive: {
    fontSize: 12,
    color: Colors.neutral[500],
    textAlign: 'center',
  },
  comingSoon: {
    textAlign: 'center',
    fontSize: 16,
    color: Colors.neutral[500],
    marginTop: 100,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: width * 0.9,
    maxHeight: height * 0.8,
    backgroundColor: 'white',
    borderRadius: 16,
    overflow: 'hidden',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: Colors.neutral[200],
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.neutral[800],
  },
  closeButton: {
    padding: 4,
  },
  modalBody: {
    flex: 1,
    padding: 20,
  },
  studentDetailCard: {
    alignItems: 'center',
    marginBottom: 24,
  },
  studentDetailAvatar: {
    fontSize: 64,
    marginBottom: 12,
  },
  studentDetailName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.neutral[800],
    marginBottom: 4,
  },
  studentDetailId: {
    fontSize: 16,
    color: Colors.neutral[600],
    marginBottom: 4,
  },
  studentDetailEmail: {
    fontSize: 14,
    color: Colors.primary[600],
  },
  detailSection: {
    marginBottom: 24,
  },
  detailSectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.neutral[800],
    marginBottom: 12,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: Colors.neutral[200],
  },
  detailLabel: {
    fontSize: 14,
    color: Colors.neutral[600],
  },
  detailValue: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.neutral[800],
  },
  courseItem: {
    fontSize: 14,
    color: Colors.neutral[700],
    paddingVertical: 4,
    paddingHorizontal: 12,
    backgroundColor: Colors.neutral[100],
    borderRadius: 8,
    marginBottom: 8,
    textAlign: 'center',
  },
  modalActions: {
    flexDirection: 'row',
    padding: 20,
    gap: 12,
    borderTopWidth: 1,
    borderTopColor: Colors.neutral[200],
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    backgroundColor: Colors.primary[500],
    borderRadius: 12,
  },
  secondaryActionButton: {
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: Colors.primary[500],
  },
  actionButtonText: {
    marginLeft: 8,
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
  },
  secondaryActionButtonText: {
    color: Colors.primary[600],
  },
});
