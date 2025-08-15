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

const { width, height } = Dimensions.get('window');

export default function ClassScheduleScreen({ navigation }) {
  const { user, csModules } = useApp();
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

      // Sample timetable data for Level 300 Computer Science
      const sampleSchedule = {
        'Monday': {
          '8:00 AM': {
            courseCode: 'CSM301',
            courseName: 'Advanced Software Engineering',
            lecturer: 'Dr. King',
            room: 'Lab 1',
            duration: 2,
            credits: 3,
            type: 'Lecture',
            color: '#4F46E5'
          },
          '10:00 AM': {
            courseCode: 'MATH301',
            courseName: 'Statistics for Computer Science',
            lecturer: 'Dr. Scott',
            room: 'Room 201',
            duration: 1.5,
            credits: 3,
            type: 'Lecture',
            color: '#10B981'
          },
          '2:00 PM': {
            courseCode: 'CSM311',
            courseName: 'Database Management Systems',
            lecturer: 'Prof. Wright',
            room: 'Lab 2',
            duration: 2,
            credits: 3,
            type: 'Practical',
            color: '#F59E0B'
          }
        },
        'Tuesday': {
          '9:00 AM': {
            courseCode: 'CSM321',
            courseName: 'Computer Networks',
            lecturer: 'Dr. Lopez',
            room: 'Room 305',
            duration: 2,
            type: 'Lecture',
            color: '#8B5CF6'
          },
          '1:00 PM': {
            courseCode: 'CSM331',
            courseName: 'Artificial Intelligence',
            lecturer: 'Prof. Hill',
            room: 'Lab 3',
            duration: 2,
            type: 'Practical',
            color: '#EF4444'
          }
        },
        'Wednesday': {
          '8:00 AM': {
            courseCode: 'CSM301',
            courseName: 'Advanced Software Engineering',
            lecturer: 'Dr. King',
            room: 'Lab 1',
            duration: 1.5,
            type: 'Tutorial',
            color: '#4F46E5'
          },
          '11:00 AM': {
            courseCode: 'CSM311',
            courseName: 'Database Management Systems',
            lecturer: 'Prof. Wright',
            room: 'Room 203',
            duration: 1,
            type: 'Lecture',
            color: '#F59E0B'
          },
          '3:00 PM': {
            courseCode: 'CSM321',
            courseName: 'Computer Networks',
            lecturer: 'Dr. Lopez',
            room: 'Lab 2',
            duration: 1.5,
            type: 'Practical',
            color: '#8B5CF6'
          }
        },
        'Thursday': {
          '9:00 AM': {
            courseCode: 'MATH301',
            courseName: 'Statistics for Computer Science',
            lecturer: 'Dr. Scott',
            room: 'Room 201',
            duration: 2,
            type: 'Lecture',
            color: '#10B981'
          },
          '2:00 PM': {
            courseCode: 'CSM331',
            courseName: 'Artificial Intelligence',
            lecturer: 'Prof. Hill',
            room: 'Room 304',
            duration: 1,
            type: 'Lecture',
            color: '#EF4444'
          }
        },
        'Friday': {
          '8:00 AM': {
            courseCode: 'CSM301',
            courseName: 'Advanced Software Engineering',
            lecturer: 'Dr. King',
            room: 'Lab 1',
            duration: 3,
            type: 'Project Work',
            color: '#4F46E5'
          },
          '1:00 PM': {
            courseCode: 'CSM311',
            courseName: 'Database Management Systems',
            lecturer: 'Prof. Wright',
            room: 'Lab 2',
            duration: 2,
            type: 'Practical',
            color: '#F59E0B'
          }
        }
      };

      // Merge sample schedule with timetable
      Object.keys(sampleSchedule).forEach(day => {
        Object.keys(sampleSchedule[day]).forEach(time => {
          timetable[day][time] = sampleSchedule[day][time];
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
    const [time, period] = startTime.split(' ');
    const [hours, minutes] = time.split(':').map(Number);
    
    let totalMinutes = (period === 'PM' && hours !== 12 ? hours + 12 : hours) * 60 + minutes;
    totalMinutes += duration * 60;
    
    const endHours = Math.floor(totalMinutes / 60) % 24;
    const endMinutes = totalMinutes % 60;
    
    const displayHours = endHours > 12 ? endHours - 12 : endHours === 0 ? 12 : endHours;
    const displayPeriod = endHours >= 12 ? 'PM' : 'AM';
    
    return `${displayHours}:${endMinutes.toString().padStart(2, '0')} ${displayPeriod}`;
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
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.weeklyContainer}>
        {days.map((day, dayIndex) => (
          <View key={day} style={styles.dayColumn}>
            <View style={styles.dayHeader}>
              <Text style={styles.dayName}>{day.slice(0, 3)}</Text>
              <Text style={styles.dayDate}>
                {weekDates[dayIndex].getDate()}/{weekDates[dayIndex].getMonth() + 1}
              </Text>
            </View>
            
            <ScrollView style={styles.daySchedule}>
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
                        <Text style={styles.classRoom} numberOfLines={1}>
                          {classData.room}
                        </Text>
                        <Text style={styles.classType} numberOfLines={1}>
                          {classData.type}
                        </Text>
                        <Text style={styles.classDuration}>
                          {classData.duration}h
                        </Text>
                        <Text style={styles.classCredits}>
                          {classData.credits || 3}cr
                        </Text>
                      </TouchableOpacity>
                    ) : (
                      <View style={styles.emptySlot} />
                    )}
                  </View>
                );
              })}
            </ScrollView>
          </View>
        ))}
      </ScrollView>
    );
  };

  const renderDailyView = () => {
    const selectedDayName = days[selectedDay];
    const daySchedule = timetableData[selectedDayName] || {};
    
    return (
      <ScrollView showsVerticalScrollIndicator={false} style={styles.dailyContainer}>
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
                    style={[styles.dailyClassCard, { borderLeftColor: classData.color }]}
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
                    <Text style={styles.dailyClassName}>{classData.courseName}</Text>
                    <View style={styles.dailyClassDetails}>
                      <Text style={styles.dailyClassLecturer}>👨‍🏫 {classData.lecturer}</Text>
                      <Text style={styles.dailyClassRoom}>📍 {classData.room}</Text>
                      <Text style={styles.dailyClassType}>📝 {classData.type}</Text>
                    </View>
                  </TouchableOpacity>
                ) : (
                  <View style={styles.dailyEmptySlot}>
                    <Text style={styles.dailyEmptyText}>No class scheduled</Text>
                  </View>
                )}
              </View>
            </View>
          );
        })}
      </ScrollView>
    );
  };

  const renderUpcomingClasses = () => (
    <View style={styles.upcomingSection}>
      <Text style={styles.upcomingTitle}>🕐 Upcoming Classes</Text>
      {upcomingClasses.length > 0 ? (
        <FlatList
          data={upcomingClasses}
          keyExtractor={(item, index) => `${item.courseCode}-${index}`}
          horizontal
          showsHorizontalScrollIndicator={false}
          renderItem={({ item }) => (
            <TouchableOpacity
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
          )}
        />
      ) : (
        <View style={styles.noUpcomingClasses}>
          <Text style={styles.noUpcomingText}>No upcoming classes today! 🎉</Text>
        </View>
      )}
    </View>
  );

  if (!user) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#4F46E5" />
          <Text style={styles.loadingText}>Loading schedule...</Text>
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
        <Text style={styles.headerTitle}>Class Schedule</Text>
        <TouchableOpacity onPress={() => Alert.alert('Settings', 'Schedule settings coming soon!')}>
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
});
