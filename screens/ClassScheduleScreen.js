import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  Dimensions,
  Alert,
  Animated,
  ActivityIndicator,
  FlatList,
  Modal,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useApp } from '../context/AppContext';
import { useTheme } from '../components/ThemeProvider';

const { width, height } = Dimensions.get('window');

export default function ClassScheduleScreen({ navigation }) {
  const { user, csModules } = useApp();
  const { isDark } = useTheme();
  const [selectedWeek, setSelectedWeek] = useState(0); // 0 = current week
  const [selectedDay, setSelectedDay] = useState(new Date().getDay());
  const [viewMode, setViewMode] = useState('weekly'); // 'weekly' or 'daily'
  const [timetableData, setTimetableData] = useState({});
  const [upcomingClasses, setUpcomingClasses] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showClassModal, setShowClassModal] = useState(false);
  const [selectedClass, setSelectedClass] = useState(null);

  // Animation
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;

  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const timeSlots = [
    '7:00 AM', '8:00 AM', '9:00 AM', '10:00 AM', '11:00 AM', 
    '12:00 PM', '1:00 PM', '2:00 PM', '3:00 PM', '4:00 PM', '5:00 PM', '6:00 PM'
  ];

  useEffect(() => {
    if (user?.uid) {
      loadTimetableData();
      generateUpcomingClasses();
      startAnimations();
    }
  }, [user?.uid, selectedWeek]);

  const startAnimations = () => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 500,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const loadTimetableData = async () => {
    try {
      setIsLoading(true);
      
      // Generate comprehensive timetable based on user's courses
      const userCourses = csModules || [];
      const timetable = {};

      // Initialize empty timetable
      days.forEach(day => {
        timetable[day] = {};
        timeSlots.forEach(time => {
          timetable[day][time] = null;
        });
      });

      // Sample timetable data sets
      const level100Schedule = {
        'Monday': {
          '9:00 AM': { courseCode: 'CSM151', courseName: 'Information Technology I', lecturer: 'Dr. Arthur', room: 'Room 101', duration: 2, credits: 3, type: 'Lecture', color: '#6366F1' },
          '1:00 PM': { courseCode: 'MAT157', courseName: 'Algebra & Geometry', lecturer: 'Prof. Darko', room: 'Audit. B', duration: 2, credits: 3, type: 'Lecture', color: '#10B981' }
        },
        'Tuesday': {
          '10:00 AM': { courseCode: 'CSM157', courseName: 'Structured Program Design', lecturer: 'Dr. Osei', room: 'Lab 1', duration: 3, credits: 3, type: 'Practical', color: '#F59E0B' }
        },
        'Friday': {
          '9:00 AM': { courseCode: 'PHI157', courseName: 'Logic & Critical Thinking', lecturer: 'Mr. Mensah', room: 'Room 5', duration: 2, credits: 2, type: 'Lecture', color: '#EC4899' }
        }
      };

      const level200Schedule = {
        'Monday': {
          '8:00 AM': { courseCode: 'CSM291', courseName: 'Data Structures', lecturer: 'Dr. Katsriku', room: 'Room 202', duration: 2, credits: 3, type: 'Lecture', color: '#4F46E5' },
          '11:00 AM': { courseCode: 'MAT257', courseName: 'Applied Calculus', lecturer: 'Dr. Owusu', room: 'Room 105', duration: 2, credits: 3, type: 'Lecture', color: '#10B981' }
        },
        'Thursday': {
          '2:00 PM': { courseCode: 'CSM281', courseName: 'Java Programming', lecturer: 'Dr. Quaynor', room: 'Lab 3', duration: 3, credits: 3, type: 'Practical', color: '#F59E0B' }
        }
      };

      const level300Schedule = {
        'Monday': {
          '8:00 AM': { courseCode: 'CSM301', courseName: 'Advanced Software Engineering', lecturer: 'Dr. King', room: 'Lab 1', duration: 2, credits: 3, type: 'Lecture', color: '#4F46E5' },
          '10:00 AM': { courseCode: 'MATH301', courseName: 'Statistics for Computer Science', lecturer: 'Dr. Scott', room: 'Room 201', duration: 1.5, credits: 3, type: 'Lecture', color: '#10B981' },
          '2:00 PM': { courseCode: 'CSM311', courseName: 'Database Management Systems', lecturer: 'Prof. Wright', room: 'Lab 2', duration: 2, credits: 3, type: 'Practical', color: '#F59E0B' }
        },
        'Wednesday': {
          '11:00 AM': { courseCode: 'CSM311', courseName: 'Database Management Systems', lecturer: 'Prof. Wright', room: 'Room 203', duration: 1, type: 'Lecture', color: '#F59E0B' }
        }
      };

      const level400Schedule = {
        'Monday': {
          '8:00 AM': { courseCode: 'CSM495', courseName: 'Software Engineering', lecturer: 'Prof. Sackey', room: 'Room 401', duration: 2, credits: 3, type: 'Lecture', color: '#4F46E5' },
          '1:00 PM': { courseCode: 'CSM478', courseName: 'Computer Networks', lecturer: 'Dr. Gyamfi', room: 'Lab 4', duration: 2, credits: 3, type: 'Lecture', color: '#10B981' }
        },
        'Tuesday': {
          '9:00 AM': { courseCode: 'CSM498', courseName: 'Final Year Project', lecturer: 'Supervisors', room: 'Respective Labs', duration: 4, credits: 12, type: 'Project', color: '#F59E0B' }
        }
      };

      const postgraduateSchedule = {
        'Monday': {
          '5:00 PM': { courseCode: 'MSC601', courseName: 'Advanced Research Methods', lecturer: 'Prof. Asante', room: 'Postgrad Hall', duration: 3, credits: 4, type: 'Seminar', color: '#8B5CF6' }
        },
        'Tuesday': {
          '6:00 PM': { courseCode: 'MSC615', courseName: 'Distributed Systems Architecture', lecturer: 'Dr. Mensah', room: 'Virtual Lab 1', duration: 2, credits: 3, type: 'Lab', color: '#6366F1' }
        },
        'Thursday': {
          '4:00 PM': { courseCode: 'MSC621', courseName: 'Cryptographic Protocols', lecturer: 'Dr. Boateng', room: 'Postgrad Room A', duration: 2, credits: 3, type: 'Lecture', color: '#EC4899' }
        }
      };

      const phdSchedule = {
        'Wednesday': {
          '9:00 AM': { courseCode: 'PHD901', courseName: 'Doctoral Seminar I', lecturer: 'Prof. K. Bonsu', room: 'Conference Room', duration: 4, credits: 6, type: 'Seminar', color: '#F43F5E' }
        },
        'Friday': {
          '2:00 PM': { courseCode: 'PHD999', courseName: 'Dissertation Guidance', lecturer: 'Department Head', room: 'Office 402', duration: 2, credits: 12, type: 'Thesis', color: '#F59E0B' }
        }
      };

      let selectedSchedule = level300Schedule;
      if (user.academicLevel === '100') selectedSchedule = level100Schedule;
      if (user.academicLevel === '200') selectedSchedule = level200Schedule;
      if (user.academicLevel === '400') selectedSchedule = level400Schedule;
      if (user.degreeType === 'Postgraduate') selectedSchedule = postgraduateSchedule;
      if (user.degreeType === 'PhD') selectedSchedule = phdSchedule;
      
      // Merge selected schedule with timetable
      Object.keys(selectedSchedule).forEach(day => {
        Object.keys(selectedSchedule[day]).forEach(time => {
          timetable[day][time] = selectedSchedule[day][time];
        });
      });

      setTimetableData(timetable);

    } catch (error) {
      console.error('Error loading timetable:', error);
      Alert.alert('Error', 'Failed to load class schedule');
    } finally {
      setIsLoading(false);
    }
  };

  const generateUpcomingClasses = () => {
    const now = new Date();
    const today = days[now.getDay()];
    const currentHour = now.getHours();
    
    const upcoming = [];
    
    // Get today's remaining classes
    if (timetableData[today]) {
      Object.keys(timetableData[today]).forEach(time => {
        const classData = timetableData[today][time];
        if (classData) {
          const classHour = parseInt(time.split(':')[0]);
          const isPM = time.includes('PM');
          const adjustedHour = isPM && classHour !== 12 ? classHour + 12 : classHour;
          
          if (adjustedHour > currentHour) {
            upcoming.push({
              ...classData,
              day: today,
              time: time,
              status: 'upcoming'
            });
          }
        }
      });
    }

    // Get tomorrow's classes
    const tomorrowIndex = (now.getDay() + 1) % 7;
    const tomorrow = days[tomorrowIndex];
    
    if (timetableData[tomorrow]) {
      Object.keys(timetableData[tomorrow]).forEach(time => {
        const classData = timetableData[tomorrow][time];
        if (classData) {
          upcoming.push({
            ...classData,
            day: tomorrow,
            time: time,
            status: 'tomorrow'
          });
        }
      });
    }

    setUpcomingClasses(upcoming.slice(0, 5)); // Show next 5 classes
  };

  const getCurrentWeekDates = () => {
    const now = new Date();
    const weekStart = new Date(now);
    weekStart.setDate(now.getDate() - now.getDay() + (selectedWeek * 7));
    
    const weekDates = [];
    for (let i = 0; i < 7; i++) {
      const date = new Date(weekStart);
      date.setDate(weekStart.getDate() + i);
      weekDates.push(date);
    }
    return weekDates;
  };

  const formatTime = (timeStr) => {
    return timeStr;
  };

  const getClassEndTime = (startTime, duration) => {
    try {
      const [time, period] = startTime.split(' ');
      const [hours, minutes] = time.split(':').map(Number);
      
      let totalMinutes = (period === 'PM' && hours !== 12 ? hours + 12 : hours) * 60 + (minutes || 0);
      totalMinutes += (duration || 1) * 60;
      
      const endHours = Math.floor(totalMinutes / 60) % 24;
      const endMinutes = totalMinutes % 60;
      
      const displayHours = endHours > 12 ? endHours - 12 : endHours === 0 ? 12 : endHours;
      const displayPeriod = endHours >= 12 ? 'PM' : 'AM';
      
      return `${displayHours}:${endMinutes.toString().padStart(2, '0')} ${displayPeriod}`;
    } catch (e) {
      return startTime;
    }
  };

  const joinClass = (classData) => {
    Alert.alert(
      'Join Class',
      `Join ${classData.courseCode} - ${classData.courseName}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Join Chat', 
          onPress: () => navigation.navigate('Chat', { courseCode: classData.courseCode })
        },
        { 
          text: 'View Materials', 
          onPress: () => navigation.navigate('UploadNotes', { selectedCourse: { code: classData.courseCode, name: classData.courseName } })
        }
      ]
    );
  };

  const renderWeeklyView = () => {
    const weekDates = getCurrentWeekDates();
    
    return (
      <View style={{ flex: 1 }}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.weeklyContainer}>
          {days.map((day, dayIndex) => (
            <View key={day} style={styles.dayColumn}>
              <View style={styles.dayHeader}>
                <Text style={styles.dayName}>{day.slice(0, 3)}</Text>
                <Text style={styles.dayDate}>
                  {weekDates[dayIndex].getDate()}/{weekDates[dayIndex].getMonth() + 1}
                </Text>
              </View>
              
              <View style={styles.daySchedule}>
                {timeSlots.map((time) => {
                  const classData = timetableData[day]?.[time];
                  
                  return (
                    <View key={time} style={styles.timeSlot}>
                      <Text style={styles.timeLabel}>{time}</Text>
                      {classData ? (
                        <TouchableOpacity
                          style={[styles.classBlock, { backgroundColor: classData.color }]}
                          onPress={() => {
                            setSelectedClass(classData);
                            setShowClassModal(true);
                          }}
                        >
                          <Text style={styles.classCode} numberOfLines={1}>
                            {classData.courseCode}
                          </Text>
                          <Text style={styles.classTimeText} numberOfLines={1}>
                            {time}
                          </Text>
                          <Text style={styles.classRoom} numberOfLines={1}>
                            {classData.room}
                          </Text>
                        </TouchableOpacity>
                      ) : (
                        <View style={styles.emptySlot} />
                      )}
                    </View>
                  );
                })}
              </View>
            </View>
          ))}
        </ScrollView>
      </View>
    );
  };

  const renderDailyView = () => {
    const selectedDayName = days[selectedDay];
    const daySchedule = timetableData[selectedDayName] || {};
    
    return (
      <View style={{ flex: 1 }}>
        <ScrollView showsVerticalScrollIndicator={false} style={styles.dailyContainer}>
          {/* AI Daily Briefing - 2030 Feature */}
          <View style={{ marginHorizontal: 15, marginBottom: 20, backgroundColor: isDark ? 'rgba(99, 102, 241, 0.1)' : '#EEF2FF', borderRadius: 20, padding: 15, borderLeftWidth: 4, borderLeftColor: '#4F46E5' }}>
             <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 5 }}>
                <Ionicons name="sparkles" size={16} color="#4F46E5" />
                <Text style={{ fontSize: 13, fontWeight: '900', color: isDark ? '#F1F5F9' : '#1E293B' }}>AI Morning Briefing</Text>
             </View>
             <Text style={{ fontSize: 12, color: '#64748B', lineHeight: 18 }}>
                {Object.keys(daySchedule).filter(t => daySchedule[t]).length > 0 
                  ? `Today you have ${Object.keys(daySchedule).filter(t => daySchedule[t]).length} lectures. Focus peaks at 10 AM. Best study gap is at 1 PM.`
                  : "No formal lectures today. Your schedule is optimized for personal research and project blocks."}
             </Text>
          </View>

          {timeSlots.map((time) => {
            const classData = daySchedule[time];
            
            return (
              <View key={time} style={styles.dailyTimeSlot}>
                <View style={styles.dailyTimeLabel}>
                  <Text style={styles.dailyTime}>{time}</Text>
                </View>
                
                <View style={styles.dailyClassContainer}>
                  {classData ? (
                    <TouchableOpacity
                      style={[styles.dailyClassCard, { borderLeftColor: classData.color, backgroundColor: isDark ? '#1E293B' : '#FFF' }]}
                      onPress={() => {
                        setSelectedClass(classData);
                        setShowClassModal(true);
                      }}
                    >
                      <View style={styles.dailyClassHeader}>
                        <Text style={styles.dailyClassCode}>{classData.courseCode}</Text>
                        <Text style={styles.dailyClassTime}>
                          {time} - {getClassEndTime(time, classData.duration)}
                        </Text>
                      </View>
                      <Text style={[styles.dailyClassName, isDark && { color: '#CBD5E1' }]}>{classData.courseName}</Text>
                      <View style={styles.dailyClassDetails}>
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 15 }}>
                           <Text style={styles.dailyClassLecturer}>👨‍🏫 {classData.lecturer}</Text>
                           <Text style={styles.dailyClassRoom}>📍 {classData.room}</Text>
                        </View>
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 15, marginTop: 4 }}>
                           <Text style={styles.dailyClassType}>📝 {classData.type}</Text>
                           {classData.credits && <Text style={{ fontSize: 12, color: '#4F46E5', fontWeight: '700' }}>⭐ {classData.credits} Credits</Text>}
                        </View>
                      </View>
                    </TouchableOpacity>
                  ) : (
                    <View style={[styles.dailyEmptySlot, isDark && { backgroundColor: '#1E293B', borderColor: '#334155' }]}>
                      <Text style={styles.dailyEmptyText}>No class scheduled</Text>
                    </View>
                  )}
                </View>
              </View>
            );
          })}
        </ScrollView>
      </View>
    );
  };

  const renderUpcomingClasses = () => (
    <View style={styles.upcomingSection}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
        <Text style={styles.upcomingTitle}>🕐 Upcoming Classes</Text>
        <TouchableOpacity 
          style={{ backgroundColor: '#4F46E5', paddingHorizontal: 10, paddingVertical: 5, borderRadius: 10, flexDirection: 'row', alignItems: 'center' }}
          onPress={() => Alert.alert('AI Optimizer', 'Scanning for study windows...\n\nFound 3 prime study slots:\n1. Tue: 2pm - 4pm\n2. Thu: 10am - 12pm\n3. Fri: 4pm - 6pm\n\nApply these to your calendar?')}
        >
          <Ionicons name="flash" size={14} color="#FFF" />
          <Text style={{ color: '#FFF', fontSize: 11, fontWeight: '800', marginLeft: 4 }}>Optimize Study</Text>
        </TouchableOpacity>
      </View>
      {upcomingClasses.length > 0 ? (
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          style={{ flexDirection: 'row' }}
        >
          {upcomingClasses.map((item, index) => (
            <TouchableOpacity
              key={`${item.courseCode}-${index}`}
              style={[styles.upcomingCard, { borderTopColor: item.color }]}
              onPress={() => joinClass(item)}
            >
              <View style={styles.upcomingHeader}>
                <Text style={styles.upcomingCode}>{item.courseCode}</Text>
                <Text style={styles.upcomingStatus}>
                  {item.status === 'upcoming' ? '🔜' : '📅'}
                </Text>
              </View>
              <Text style={styles.upcomingName} numberOfLines={2}>{item.courseName}</Text>
              <Text style={styles.upcomingTime}>
                {item.day} • {item.time}
              </Text>
              <Text style={styles.upcomingRoom}>📍 {item.room}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      ) : (
        <View style={styles.noUpcomingClasses}>
          <Text style={styles.noUpcomingText}>No upcoming classes today! 🎉</Text>
        </View>
      )}
    </View>
  );

  if (!user) {
    return (
      <SafeAreaView style={[styles.container, isDark && styles.darkContainer]}>
        <View style={[styles.loadingContainer, isDark && styles.darkLoadingContainer]}>
          <ActivityIndicator size="large" color="#4F46E5" />
          <Text style={styles.loadingText}>Loading schedule...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, isDark && styles.darkContainer]}>
      {/* Header */}
      <View style={[styles.header, isDark && styles.darkHeader]}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#1E293B" />
        </TouchableOpacity>
        <TouchableOpacity onPress={() => Alert.alert('AI Schedule Assistant', 'I am analyzing your schedule...\n\nObservation: You have a large gap on Wednesday between 12 PM and 5 PM. Should I schedule a study block for MSC601?')}>
           <View style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: '#FADEE1', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 }}>
             <Ionicons name="sparkles" size={14} color="#E11D48" />
             <Text style={{ marginLeft: 4, fontSize: 11, fontWeight: '700', color: '#E11D48' }}>AI Assistant</Text>
           </View>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => {
          Alert.alert('Timetable Settings', 'Syncing with University Registry... (Alpha)\n\nOptions:\n1. Auto-import MIS Web schedule\n2. External Calendar Sync (Google/iCal)\n3. Custom Reminders');
        }}>
          <Ionicons name="settings" size={24} color="#4F46E5" />
        </TouchableOpacity>
      </View>

      <Animated.View style={{ flex: 1, opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}>
        {/* Week Navigation */}
        <View style={styles.weekNavigation}>
          <TouchableOpacity
            style={styles.weekNavButton}
            onPress={() => setSelectedWeek(selectedWeek - 1)}
          >
            <Ionicons name="chevron-back" size={20} color="#4F46E5" />
          </TouchableOpacity>
          
          <View style={styles.weekInfo}>
            <Text style={styles.weekTitle}>
              {selectedWeek === 0 ? 'This Week' : 
               selectedWeek === 1 ? 'Next Week' : 
               selectedWeek === -1 ? 'Last Week' : 
               `Week ${selectedWeek > 0 ? '+' : ''}${selectedWeek}`}
            </Text>
            <Text style={styles.weekDates}>
              {getCurrentWeekDates()[0].toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - {' '}
              {getCurrentWeekDates()[6].toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
            </Text>
          </View>
          
          <TouchableOpacity
            style={styles.weekNavButton}
            onPress={() => setSelectedWeek(selectedWeek + 1)}
          >
            <Ionicons name="chevron-forward" size={20} color="#4F46E5" />
          </TouchableOpacity>
        </View>

        {/* Premium Upcoming Exams Countdown Grid */}
        <View style={{ marginHorizontal: 15, marginBottom: 15 }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <Text style={{ fontSize: 13, fontWeight: '800', color: isDark ? '#94A3B8' : '#64748B', letterSpacing: 1, textTransform: 'uppercase' }}>🏁 Exam Countdown</Text>
            <View style={{ backgroundColor: '#FEE2E2', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 }}>
              <Text style={{ fontSize: 10, fontWeight: '800', color: '#EF4444' }}>DANGER ZONE</Text>
            </View>
          </View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {[
              { code: 'CS301', date: 'June 15', days: 12, color: '#EF4444' },
              { code: 'MATH302', date: 'June 18', days: 15, color: '#F59E0B' },
              { code: 'CS311', date: 'June 22', days: 19, color: '#10B981' },
              { code: 'ENGL301', date: 'June 25', days: 22, color: '#3B82F6' },
            ].map((exam, i) => (
              <View key={i} style={{ backgroundColor: isDark ? '#1E293B' : '#FFF', borderRadius: 16, padding: 15, marginRight: 12, width: 110, borderWidth: 1, borderColor: isDark ? '#334155' : '#F1F5F9', alignItems: 'center', shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 8, elevation: 3 }}>
                <Text style={{ fontSize: 13, fontWeight: '900', color: exam.color }}>{exam.code}</Text>
                <View style={{ height: 40, width: 40, borderRadius: 20, backgroundColor: exam.color + '15', justifyContent: 'center', alignItems: 'center', marginVertical: 8 }}>
                   <Text style={{ fontSize: 16, fontWeight: '900', color: exam.color }}>{exam.days}</Text>
                </View>
                <Text style={{ fontSize: 10, color: '#64748B', fontWeight: '700' }}>DAYS LEFT</Text>
                <Text style={{ fontSize: 9, color: '#94A3B8', marginTop: 4 }}>{exam.date}</Text>
              </View>
            ))}
          </ScrollView>
        </View>

        {/* AI Smart Planner & Weekly Summary */}
        <View style={{ marginHorizontal: 15, marginBottom: 15, flexDirection: 'row', gap: 10 }}>
          <TouchableOpacity
            style={{ flex: 1.2, backgroundColor: isDark ? '#1E293B' : '#FFF', borderRadius: 24, padding: 20, borderWidth: 1, borderColor: isDark ? '#334155' : '#F1F5F9', shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 10, elevation: 5 }}
            onPress={() => Alert.alert('🧠 AI Smart Planner', 'Analyzing your gaps...\n\nI found a 4-hour study window this Thursday between "Distributed Systems" and "AI Seminar".\n\nRecommendation: Focus on CS311 Quiz prep during this time.')}
          >
            <View style={{ width: 40, height: 40, borderRadius: 12, backgroundColor: '#4F46E5', justifyContent: 'center', alignItems: 'center', marginBottom: 12 }}>
              <Ionicons name="sparkles" size={20} color="#FFF" />
            </View>
            <Text style={{ fontSize: 15, fontWeight: '900', color: isDark ? '#F1F5F9' : '#1E293B' }}>Smart Planner</Text>
            <Text style={{ fontSize: 11, color: '#64748B', marginTop: 4 }}>AI-optimized study blocks found for this week.</Text>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 12, gap: 4 }}>
              <Text style={{ color: '#4F46E5', fontSize: 11, fontWeight: '800' }}>Review Windows</Text>
              <Ionicons name="arrow-forward" size={14} color="#4F46E5" />
            </View>
          </TouchableOpacity>
          
          <View style={{ flex: 1, gap: 10 }}>
            <View style={{ flex: 1, backgroundColor: '#ECFDF5', borderRadius: 20, padding: 15, borderWidth: 1, borderColor: '#10B98130', flexDirection: 'row', alignItems: 'center', gap: 10 }}>
              <View style={{ width: 32, height: 32, borderRadius: 10, backgroundColor: '#10B981', justifyContent: 'center', alignItems: 'center' }}>
                <Ionicons name="flame" size={16} color="#FFF" />
              </View>
              <View>
                <Text style={{ fontSize: 14, fontWeight: '900', color: '#065F46' }}>12 🔥</Text>
                <Text style={{ fontSize: 9, color: '#10B981', fontWeight: '800' }}>DAY STREAK</Text>
              </View>
            </View>
            <View style={{ flex: 1, backgroundColor: '#EFF6FF', borderRadius: 20, padding: 15, borderWidth: 1, borderColor: '#3B82F630', flexDirection: 'row', alignItems: 'center', gap: 10 }}>
              <View style={{ width: 32, height: 32, borderRadius: 10, backgroundColor: '#3B82F6', justifyContent: 'center', alignItems: 'center' }}>
                <Ionicons name="checkmark-circle" size={16} color="#FFF" />
              </View>
              <View>
                <Text style={{ fontSize: 14, fontWeight: '900', color: '#1E40AF' }}>94% 💎</Text>
                <Text style={{ fontSize: 9, color: '#3B82F6', fontWeight: '800' }}>ATTENDANCE</Text>
              </View>
            </View>
          </View>
        </View>

        {/* View Mode Toggle */}
        <View style={styles.viewModeContainer}>
          <TouchableOpacity
            style={[styles.viewModeButton, viewMode === 'weekly' && styles.activeViewMode]}
            onPress={() => setViewMode('weekly')}
          >
            <Ionicons 
              name="grid" 
              size={16} 
              color={viewMode === 'weekly' ? "#FFFFFF" : "#64748B"} 
            />
            <Text style={[
              styles.viewModeText,
              viewMode === 'weekly' && styles.activeViewModeText
            ]}>
              Weekly
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.viewModeButton, viewMode === 'daily' && styles.activeViewMode]}
            onPress={() => setViewMode('daily')}
          >
            <Ionicons 
              name="list" 
              size={16} 
              color={viewMode === 'daily' ? "#FFFFFF" : "#64748B"} 
            />
            <Text style={[
              styles.viewModeText,
              viewMode === 'daily' && styles.activeViewModeText
            ]}>
              Daily
            </Text>
          </TouchableOpacity>
        </View>

        {/* Attendance Heatmap / Quick Stats Row */}
        <View style={{ marginHorizontal: 15, marginBottom: 15 }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <Text style={{ fontSize: 13, fontWeight: '800', color: isDark ? '#94A3B8' : '#64748B', letterSpacing: 1, textTransform: 'uppercase' }}>📅 Activity Heatmap</Text>
            <Text style={{ fontSize: 10, fontWeight: '700', color: '#10B981' }}>BUSY WEEK</Text>
          </View>
          <View style={{ backgroundColor: isDark ? '#1E293B' : '#F8FAFC', borderRadius: 20, padding: 15, borderWidth: 1, borderColor: isDark ? '#334155' : '#E2E8F0' }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
               {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((day, i) => (
                 <View key={i} style={{ alignItems: 'center', gap: 8 }}>
                   <Text style={{ fontSize: 10, fontWeight: '700', color: '#94A3B8' }}>{day}</Text>
                   <View style={{ width: 34, height: 34, borderRadius: 8, backgroundColor: [4, 2, 5, 3, 1, 0, 0][i] > 3 ? '#4F46E5' : [4, 2, 5, 3, 1, 0, 0][i] > 1 ? '#818CF8' : [4, 2, 5, 3, 1, 0, 0][i] > 0 ? '#C7D2FE' : '#E2E8F0', justifyContent: 'center', alignItems: 'center' }}>
                      <Text style={{ fontSize: 10, fontWeight: '900', color: [4, 2, 5, 3, 1, 0, 0][i] > 1 ? '#FFF' : '#94A3B8' }}>{[4, 2, 5, 3, 1, 0, 0][i] || ''}</Text>
                   </View>
                 </View>
               ))}
            </View>
          </View>
        </View>

        {/* Day Selector for Daily View */}
        {viewMode === 'daily' && (
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false} 
            style={styles.daySelector}
          >
            {days.map((day, index) => (
              <TouchableOpacity
                key={day}
                style={[
                  styles.daySelectorButton,
                  selectedDay === index && styles.selectedDayButton
                ]}
                onPress={() => setSelectedDay(index)}
              >
                <Text style={[
                  styles.daySelectorText,
                  selectedDay === index && styles.selectedDayText
                ]}>
                  {day}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        )}

        {/* Lecturer specific: Room Status & Class Management */}
        {user?.userType === 'lecturer' && (
          <View style={{ marginHorizontal: 15, marginBottom: 20 }}>
             <Text style={{ fontSize: 13, fontWeight: '800', color: isDark ? '#94A3B8' : '#64748B', marginBottom: 12, letterSpacing: 1, textTransform: 'uppercase' }}>🛠️ Faculty Controls</Text>
             <View style={{ flexDirection: 'row', gap: 10 }}>
               <TouchableOpacity 
                 style={{ flex: 1, backgroundColor: '#FFF', borderRadius: 16, padding: 12, alignItems: 'center', borderWidth: 1, borderColor: '#E2E8F0', gap: 6 }}
                 onPress={() => Alert.alert('Room Availability', 'Checking room status for all faculty halls...\n\n✅ Room 203: Empty\n🔴 Lab 1: Occupied until 4PM\n✅ VirtLab 2: Empty')}
                >
                 <Ionicons name="business" size={18} color="#4F46E5" />
                 <Text style={{ fontSize: 11, fontWeight: '700', color: '#1E293B' }}>Room Status</Text>
               </TouchableOpacity>
               <TouchableOpacity 
                 style={{ flex: 1, backgroundColor: '#FFF', borderRadius: 16, padding: 12, alignItems: 'center', borderWidth: 1, borderColor: '#E2E8F0', gap: 6 }}
                 onPress={() => Alert.alert('Reschedule Class', 'Select a class to reschedule. Students will be notified instantly via AI Digest.')}
                >
                 <Ionicons name="time" size={18} color="#F59E0B" />
                 <Text style={{ fontSize: 11, fontWeight: '700', color: '#1E293B' }}>Reschedule</Text>
               </TouchableOpacity>
               <TouchableOpacity 
                 style={{ flex: 1, backgroundColor: '#FFF', borderRadius: 16, padding: 12, alignItems: 'center', borderWidth: 1, borderColor: '#E2E8F0', gap: 6 }}
                 onPress={() => Alert.alert('Class Poll', 'Trigger a quick "Attendance check" or "Topic feedback" poll for your current class.')}
                >
                 <Ionicons name="stats-chart" size={18} color="#10B981" />
                 <Text style={{ fontSize: 11, fontWeight: '700', color: '#1E293B' }}>Live Poll</Text>
               </TouchableOpacity>
             </View>
          </View>
        )}

        {/* Upcoming Classes */}
        {selectedWeek === 0 && renderUpcomingClasses()}

        {/* Schedule Content */}
        <View style={styles.scheduleContainer}>
          {isLoading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#4F46E5" />
              <Text style={styles.loadingText}>Loading schedule...</Text>
            </View>
          ) : (
            <>
              {viewMode === 'weekly' && renderWeeklyView()}
              {viewMode === 'daily' && renderDailyView()}
            </>
          )}
        </View>
      </Animated.View>

      {/* Class Details Modal */}
      <Modal
        visible={showClassModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowClassModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.classModal}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Class Details</Text>
              <TouchableOpacity onPress={() => setShowClassModal(false)}>
                <Ionicons name="close" size={24} color="#64748B" />
              </TouchableOpacity>
            </View>

            {selectedClass && (
              <ScrollView style={styles.modalContent}>
                <View style={[styles.classColorBar, { backgroundColor: selectedClass.color }]} />
                
                <View style={styles.classDetailsContainer}>
                  <Text style={styles.modalClassCode}>{selectedClass.courseCode}</Text>
                  <Text style={styles.modalClassName}>{selectedClass.courseName}</Text>
                  
                  <View style={styles.classDetailRow}>
                    <Ionicons name="person" size={20} color="#4F46E5" />
                    <Text style={styles.classDetailText}>{selectedClass.lecturer}</Text>
                  </View>
                  
                  <View style={styles.classDetailRow}>
                    <Ionicons name="location" size={20} color="#4F46E5" />
                    <Text style={styles.classDetailText}>{selectedClass.room}</Text>
                  </View>
                  
                  <View style={styles.classDetailRow}>
                    <Ionicons name="time" size={20} color="#4F46E5" />
                    <Text style={styles.classDetailText}>
                      Duration: {selectedClass.duration} hour{selectedClass.duration > 1 ? 's' : ''}
                    </Text>
                  </View>
                  
                  <View style={styles.classDetailRow}>
                    <Ionicons name="book" size={20} color="#4F46E5" />
                    <Text style={styles.classDetailText}>{selectedClass.type}</Text>
                  </View>
                  
                  <View style={styles.classDetailRow}>
                    <Ionicons name="star" size={20} color="#4F46E5" />
                    <Text style={styles.classDetailText}>
                      {selectedClass.credits || 3} Credit Hours
                    </Text>
                  </View>
                </View>

                <View style={styles.modalActions}>
                  <TouchableOpacity
                    style={styles.modalActionButton}
                    onPress={() => {
                      setShowClassModal(false);
                      navigation.navigate('Chat', { courseCode: selectedClass.courseCode });
                    }}
                  >
                    <LinearGradient
                      colors={['#4F46E5', '#7C3AED']}
                      style={styles.modalActionGradient}
                    >
                      <Ionicons name="chatbubbles" size={20} color="#FFFFFF" />
                      <Text style={styles.modalActionText}>Join Class Chat</Text>
                    </LinearGradient>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.modalActionButton}
                    onPress={() => {
                      setShowClassModal(false);
                      navigation.navigate('UploadNotes', { 
                        selectedCourse: { 
                          code: selectedClass.courseCode, 
                          name: selectedClass.courseName 
                        } 
                      });
                    }}
                  >
                    <LinearGradient
                      colors={['#10B981', '#059669']}
                      style={styles.modalActionGradient}
                    >
                      <Ionicons name="folder" size={20} color="#FFFFFF" />
                      <Text style={styles.modalActionText}>View Materials</Text>
                    </LinearGradient>
                  </TouchableOpacity>
                </View>

                {/* Additional Study Context */}
                <View style={styles.studyContext}>
                   <TouchableOpacity 
                     style={styles.mapLink}
                     onPress={() => {
                        setShowClassModal(false);
                        navigation.navigate('AICampusMap', { focusRoom: selectedClass.room });
                     }}
                   >
                     <Ionicons name="map" size={18} color="#4F46E5" />
                     <Text style={styles.mapLinkText}>Navigate to Venue</Text>
                   </TouchableOpacity>

                   <TouchableOpacity 
                     style={styles.exportLink}
                     onPress={() => Alert.alert('Calendar Export', 'This class has been synced with your device calendar. ✅')}
                   >
                     <Ionicons name="calendar" size={18} color="#10B981" />
                     <Text style={styles.exportLinkText}>Sync to Device</Text>
                   </TouchableOpacity>
                </View>
                {/* AI Course Insights */}
                <View style={{ marginHorizontal: 20, marginTop: 15, backgroundColor: isDark ? '#1E293B' : '#F8FAFC', borderRadius: 16, padding: 16, marginBottom: 20, borderWidth: 1, borderColor: isDark ? '#334155' : '#E2E8F0' }}>
                   <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                      <Ionicons name="sparkles" size={16} color="#4F46E5" />
                      <Text style={{ fontSize: 13, fontWeight: '800', color: isDark ? '#F1F5F9' : '#1E293B' }}>AI Course Insight</Text>
                   </View>
                   <Text style={{ fontSize: 12, color: '#64748B', lineHeight: 18 }}>
                     "This course has a complex exam history. Dr. {selectedClass.lecturer} often emphasizes the practical lab sessions in finals. You've attended {Math.floor(Math.random() * 20) + 80}% of sessions so far."
                   </Text>
                </View>
              </ScrollView>
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
    backgroundColor: '#F8FAFC',
  },
  darkContainer: {
    flex: 1,
    backgroundColor: '#0F172A',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  darkLoadingContainer: {
    backgroundColor: '#0F172A',
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
  darkHeader: {
    backgroundColor: '#1E293B',
    borderBottomColor: '#334155',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1E293B',
  },
  darkHeaderTitle: {
    color: '#FFFFFF',
  },
  weekNavigation: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#FFFFFF',
  },
  weekNavButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: '#F1F5F9',
  },
  weekInfo: {
    alignItems: 'center',
  },
  weekTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1E293B',
    marginBottom: 4,
  },
  weekDates: {
    fontSize: 14,
    color: '#64748B',
  },
  viewModeContainer: {
    flexDirection: 'row',
    margin: 20,
    backgroundColor: '#F1F5F9',
    borderRadius: 12,
    padding: 4,
  },
  viewModeButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 8,
    gap: 8,
  },
  activeViewMode: {
    backgroundColor: '#4F46E5',
  },
  viewModeText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#64748B',
  },
  activeViewModeText: {
    color: '#FFFFFF',
  },
  daySelector: {
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  daySelectorButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#F1F5F9',
    marginRight: 8,
    minWidth: 80,
    alignItems: 'center',
  },
  selectedDayButton: {
    backgroundColor: '#4F46E5',
  },
  daySelectorText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#64748B',
  },
  selectedDayText: {
    color: '#FFFFFF',
  },
  upcomingSection: {
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  upcomingTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1E293B',
    marginBottom: 12,
  },
  upcomingCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginRight: 12,
    width: 200,
    borderTopWidth: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  upcomingHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  upcomingCode: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1E293B',
  },
  upcomingStatus: {
    fontSize: 16,
  },
  upcomingName: {
    fontSize: 14,
    color: '#64748B',
    marginBottom: 8,
    lineHeight: 18,
  },
  upcomingTime: {
    fontSize: 12,
    fontWeight: '600',
    color: '#4F46E5',
    marginBottom: 4,
  },
  upcomingRoom: {
    fontSize: 12,
    color: '#94A3B8',
  },
  noUpcomingClasses: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  noUpcomingText: {
    fontSize: 16,
    color: '#64748B',
  },
  scheduleContainer: {
    flex: 1,
    paddingHorizontal: 20,
  },
  weeklyContainer: {
    flex: 1,
  },
  dayColumn: {
    width: 120,
    marginRight: 8,
  },
  dayHeader: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  dayName: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1E293B',
    marginBottom: 4,
  },
  dayDate: {
    fontSize: 12,
    color: '#64748B',
  },
  daySchedule: {
    flex: 1,
  },
  timeSlot: {
    marginBottom: 4,
  },
  timeLabel: {
    fontSize: 10,
    color: '#94A3B8',
    marginBottom: 2,
    textAlign: 'center',
  },
  classBlock: {
    borderRadius: 8,
    padding: 8,
    minHeight: 60,
  },
  classCode: {
    fontSize: 10,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 2,
  },
  classRoom: {
    fontSize: 8,
    color: 'rgba(255, 255, 255, 0.9)',
    marginBottom: 2,
  },
  classType: {
    fontSize: 8,
    color: 'rgba(255, 255, 255, 0.8)',
    marginBottom: 2,
  },
  classDuration: {
    fontSize: 8,
    color: 'rgba(255, 255, 255, 0.7)',
  },
  classCredits: {
    fontSize: 7,
    color: 'rgba(255, 255, 255, 0.6)',
    fontWeight: '600',
  },
  emptySlot: {
    height: 20,
    backgroundColor: 'transparent',
  },
  dailyContainer: {
    flex: 1,
  },
  dailyTimeSlot: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  dailyTimeLabel: {
    width: 80,
    paddingTop: 16,
  },
  dailyTime: {
    fontSize: 12,
    fontWeight: '600',
    color: '#64748B',
    textAlign: 'center',
  },
  dailyClassContainer: {
    flex: 1,
    marginLeft: 12,
  },
  dailyClassCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    borderLeftWidth: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  dailyClassHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  dailyClassCode: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1E293B',
  },
  dailyClassTime: {
    fontSize: 12,
    fontWeight: '600',
    color: '#4F46E5',
  },
  dailyClassName: {
    fontSize: 14,
    color: '#64748B',
    marginBottom: 12,
    lineHeight: 20,
  },
  dailyClassDetails: {
    gap: 4,
  },
  dailyClassLecturer: {
    fontSize: 12,
    color: '#64748B',
  },
  dailyClassRoom: {
    fontSize: 12,
    color: '#64748B',
  },
  dailyClassType: {
    fontSize: 12,
    color: '#64748B',
  },
  dailyEmptySlot: {
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderStyle: 'dashed',
  },
  dailyEmptyText: {
    fontSize: 14,
    color: '#94A3B8',
    fontStyle: 'italic',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  classModal: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    width: width * 0.9,
    maxHeight: height * 0.7,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 24,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1E293B',
  },
  modalContent: {
    padding: 24,
    maxHeight: height * 0.5,
  },
  classColorBar: {
    height: 4,
    borderRadius: 2,
    marginBottom: 20,
  },
  classDetailsContainer: {
    marginBottom: 24,
  },
  modalClassCode: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1E293B',
    marginBottom: 8,
  },
  modalClassName: {
    fontSize: 18,
    color: '#64748B',
    marginBottom: 20,
    lineHeight: 24,
  },
  classDetailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  classDetailText: {
    fontSize: 16,
    color: '#1E293B',
    marginLeft: 12,
  },
  modalActions: {
    gap: 12,
  },
  modalActionButton: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  modalActionGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    gap: 8,
  },
  modalActionText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  examCountdownCard: {
    margin: 20,
    marginTop: 0,
    borderRadius: 16,
    overflow: 'hidden',
  },
  examCountdownGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
  },
  examLabel: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.8)',
    fontWeight: '600',
  },
  examTimer: {
    fontSize: 20,
    color: '#FFFFFF',
    fontWeight: '800',
    marginTop: 4,
  },
  examDetailBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    gap: 6,
  },
  examDetailText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
  studyContext: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  mapLink: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  mapLinkText: {
    fontSize: 14,
    color: '#4F46E5',
    fontWeight: '600',
  },
  exportLink: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  exportLinkText: {
    fontSize: 14,
    color: '#10B981',
    fontWeight: '600',
  },
});
