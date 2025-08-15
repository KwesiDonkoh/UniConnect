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
  Modal,
  FlatList,
  TextInput,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useApp } from '../context/AppContext';

const { width, height } = Dimensions.get('window');

export default function AcademicCalendarScreen({ navigation }) {
  const { user, csModules } = useApp();
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [events, setEvents] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [showEventModal, setShowEventModal] = useState(false);
  const [showCreateEventModal, setShowCreateEventModal] = useState(false);
  const [viewMode, setViewMode] = useState('month'); // 'month', 'week', 'agenda'
  const [newEvent, setNewEvent] = useState({
    title: '',
    type: 'class',
    date: new Date(),
    time: '',
    endTime: '',
    location: '',
    course: '',
    description: ''
  });

  // Animation refs
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;

  useEffect(() => {
    if (user?.uid) {
      loadAcademicEvents();
      startAnimations();
    }
  }, [user?.uid]);

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

  const loadAcademicEvents = () => {
    // Sample academic events - in a real app, this would come from an API
    const academicEvents = [
      {
        id: '1',
        title: 'CS101 - Programming Fundamentals',
        type: 'class',
        date: new Date(2024, 11, 16, 9, 0), // December 16, 2024, 9:00 AM
        endDate: new Date(2024, 11, 16, 10, 30),
        location: 'Room 101',
        instructor: 'Dr. Smith',
        color: '#3B82F6'
      },
      {
        id: '2',
        title: 'CS102 - OOP Assignment Due',
        type: 'assignment',
        date: new Date(2024, 11, 18, 23, 59),
        course: 'CS102',
        color: '#EF4444'
      },
      {
        id: '3',
        title: 'Database Systems Midterm',
        type: 'exam',
        date: new Date(2024, 11, 20, 14, 0),
        endDate: new Date(2024, 11, 20, 16, 0),
        course: 'CS301',
        location: 'Exam Hall A',
        color: '#F59E0B'
      },
      {
        id: '4',
        title: 'Study Group - Data Structures',
        type: 'study',
        date: new Date(2024, 11, 17, 16, 0),
        endDate: new Date(2024, 11, 17, 18, 0),
        course: 'CS201',
        location: 'Library Room 3',
        color: '#10B981'
      },
      {
        id: '5',
        title: 'Winter Break Begins',
        type: 'holiday',
        date: new Date(2024, 11, 22),
        color: '#8B5CF6'
      },
      {
        id: '6',
        title: 'CS201 - Data Structures Lab',
        type: 'lab',
        date: new Date(2024, 11, 19, 13, 0),
        endDate: new Date(2024, 11, 19, 15, 0),
        location: 'Computer Lab 2',
        instructor: 'Prof. Johnson',
        color: '#06B6D4'
      }
    ];

    setEvents(academicEvents);
  };

  const getDaysInMonth = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days = [];
    
    // Add empty cells for days before the first day of the month
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }
    
    // Add days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(new Date(year, month, day));
    }
    
    return days;
  };

  const getEventsForDate = (date) => {
    if (!date) return [];
    return events.filter(event => {
      const eventDate = new Date(event.date);
      return eventDate.toDateString() === date.toDateString();
    });
  };

  const formatTime = (date) => {
    return date.toLocaleTimeString('en-US', { 
      hour: 'numeric', 
      minute: '2-digit',
      hour12: true 
    });
  };

  const formatDate = (date) => {
    return date.toLocaleDateString('en-US', { 
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getEventIcon = (type) => {
    switch (type) {
      case 'class': return 'school';
      case 'assignment': return 'document-text';
      case 'exam': return 'clipboard';
      case 'study': return 'people';
      case 'lab': return 'desktop';
      case 'holiday': return 'sunny';
      default: return 'calendar';
    }
  };

  const navigateMonth = (direction) => {
    const newMonth = new Date(currentMonth);
    newMonth.setMonth(currentMonth.getMonth() + direction);
    setCurrentMonth(newMonth);
  };

  const createEvent = async () => {
    if (!newEvent.title.trim()) {
      Alert.alert('Error', 'Please enter an event title');
      return;
    }

    try {
      const eventId = `event_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      const eventDate = new Date(newEvent.date);
      
      // Parse time if provided
      if (newEvent.time) {
        const [hours, minutes] = newEvent.time.split(':');
        eventDate.setHours(parseInt(hours), parseInt(minutes));
      }

      let endDate = null;
      if (newEvent.endTime) {
        endDate = new Date(eventDate);
        const [endHours, endMinutes] = newEvent.endTime.split(':');
        endDate.setHours(parseInt(endHours), parseInt(endMinutes));
      }

      const newEventData = {
        id: eventId,
        title: newEvent.title,
        type: newEvent.type,
        date: eventDate,
        endDate: endDate,
        location: newEvent.location,
        course: newEvent.course,
        description: newEvent.description,
        color: getEventTypeColor(newEvent.type),
        createdBy: user?.uid,
        createdAt: new Date()
      };

      // Add to events list
      setEvents(prev => [...prev, newEventData]);

      // Reset form
      setNewEvent({
        title: '',
        type: 'class',
        date: new Date(),
        time: '',
        endTime: '',
        location: '',
        course: '',
        description: ''
      });

      setShowCreateEventModal(false);
      Alert.alert('Success', 'Event created successfully!');
    } catch (error) {
      console.error('Error creating event:', error);
      Alert.alert('Error', 'Failed to create event. Please try again.');
    }
  };

  const getEventTypeColor = (type) => {
    switch (type) {
      case 'class': return '#3B82F6';
      case 'assignment': return '#EF4444';
      case 'exam': return '#F59E0B';
      case 'study': return '#10B981';
      case 'lab': return '#06B6D4';
      case 'holiday': return '#8B5CF6';
      default: return '#6B7280';
    }
  };

  const renderCalendarDay = (date, index) => {
    if (!date) {
      return <View key={index} style={styles.emptyDay} />;
    }

    const dayEvents = getEventsForDate(date);
    const isSelected = selectedDate.toDateString() === date.toDateString();
    const isToday = new Date().toDateString() === date.toDateString();

    return (
      <TouchableOpacity
        key={index}
        style={[
          styles.calendarDay,
          isSelected && styles.selectedDay,
          isToday && styles.todayDay
        ]}
        onPress={() => setSelectedDate(date)}
      >
        <Text style={[
          styles.dayNumber,
          isSelected && styles.selectedDayText,
          isToday && styles.todayDayText
        ]}>
          {date.getDate()}
        </Text>
        {dayEvents.length > 0 && (
          <View style={styles.eventIndicators}>
            {dayEvents.slice(0, 3).map((event, i) => (
              <View
                key={i}
                style={[styles.eventDot, { backgroundColor: event.color }]}
              />
            ))}
          </View>
        )}
      </TouchableOpacity>
    );
  };

  const renderEventItem = ({ item }) => (
    <TouchableOpacity
      style={[styles.eventCard, { borderLeftColor: item.color }]}
      onPress={() => {
        setSelectedEvent(item);
        setShowEventModal(true);
      }}
    >
      <View style={styles.eventHeader}>
        <View style={[styles.eventIcon, { backgroundColor: `${item.color}20` }]}>
          <Ionicons name={getEventIcon(item.type)} size={20} color={item.color} />
        </View>
        <View style={styles.eventInfo}>
          <Text style={styles.eventTitle}>{item.title}</Text>
          <Text style={styles.eventTime}>
            {formatTime(new Date(item.date))}
            {item.endDate && ` - ${formatTime(new Date(item.endDate))}`}
          </Text>
          {item.location && (
            <Text style={styles.eventLocation}>📍 {item.location}</Text>
          )}
        </View>
        <View style={[styles.eventTypeBadge, { backgroundColor: item.color }]}>
          <Text style={styles.eventTypeText}>{item.type.toUpperCase()}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  const renderAgendaView = () => {
    const upcomingEvents = events
      .filter(event => new Date(event.date) >= new Date())
      .sort((a, b) => new Date(a.date) - new Date(b.date))
      .slice(0, 10);

    return (
      <View style={styles.agendaContainer}>
        <Text style={styles.agendaTitle}>Upcoming Events</Text>
        <FlatList
          data={upcomingEvents}
          renderItem={renderEventItem}
          keyExtractor={(item) => item.id}
          showsVerticalScrollIndicator={false}
        />
      </View>
    );
  };

  if (!user) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#4F46E5" />
          <Text style={styles.loadingText}>Loading calendar...</Text>
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
        <Text style={styles.headerTitle}>Academic Calendar</Text>
        <TouchableOpacity onPress={() => setShowCreateEventModal(true)}>
          <Ionicons name="add" size={24} color="#4F46E5" />
        </TouchableOpacity>
      </View>

      {/* View Mode Selector */}
      <View style={styles.viewModeSelector}>
        {['month', 'agenda'].map((mode) => (
          <TouchableOpacity
            key={mode}
            style={[styles.viewModeButton, viewMode === mode && styles.activeViewMode]}
            onPress={() => setViewMode(mode)}
          >
            <Text style={[
              styles.viewModeText,
              viewMode === mode && styles.activeViewModeText
            ]}>
              {mode.charAt(0).toUpperCase() + mode.slice(1)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}>
          {viewMode === 'month' ? (
            <>
              {/* Month Navigation */}
              <View style={styles.monthNavigation}>
                <TouchableOpacity onPress={() => navigateMonth(-1)}>
                  <Ionicons name="chevron-back" size={24} color="#4F46E5" />
                </TouchableOpacity>
                <Text style={styles.monthTitle}>
                  {currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                </Text>
                <TouchableOpacity onPress={() => navigateMonth(1)}>
                  <Ionicons name="chevron-forward" size={24} color="#4F46E5" />
                </TouchableOpacity>
              </View>

              {/* Calendar Grid */}
              <View style={styles.calendar}>
                {/* Day Headers */}
                <View style={styles.dayHeaders}>
                  {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
                    <Text key={day} style={styles.dayHeader}>{day}</Text>
                  ))}
                </View>

                {/* Calendar Days */}
                <View style={styles.calendarGrid}>
                  {getDaysInMonth(currentMonth).map(renderCalendarDay)}
                </View>
              </View>

              {/* Selected Date Events */}
              <View style={styles.selectedDateSection}>
                <Text style={styles.selectedDateTitle}>
                  Events for {formatDate(selectedDate)}
                </Text>
                {getEventsForDate(selectedDate).length === 0 ? (
                  <View style={styles.noEvents}>
                    <Ionicons name="calendar-outline" size={48} color="#94A3B8" />
                    <Text style={styles.noEventsText}>No events scheduled</Text>
                  </View>
                ) : (
                  <FlatList
                    data={getEventsForDate(selectedDate)}
                    renderItem={renderEventItem}
                    keyExtractor={(item) => item.id}
                    showsVerticalScrollIndicator={false}
                  />
                )}
              </View>
            </>
          ) : (
            renderAgendaView()
          )}
        </Animated.View>
      </ScrollView>

      {/* Event Details Modal */}
      <Modal
        visible={showEventModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowEventModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.eventModal}>
            {selectedEvent && (
              <>
                <View style={styles.modalHeader}>
                  <View style={[styles.modalEventIcon, { backgroundColor: `${selectedEvent.color}20` }]}>
                    <Ionicons name={getEventIcon(selectedEvent.type)} size={24} color={selectedEvent.color} />
                  </View>
                  <TouchableOpacity onPress={() => setShowEventModal(false)}>
                    <Ionicons name="close" size={24} color="#64748B" />
                  </TouchableOpacity>
                </View>
                
                <Text style={styles.modalEventTitle}>{selectedEvent.title}</Text>
                <Text style={styles.modalEventDate}>
                  {formatDate(new Date(selectedEvent.date))}
                </Text>
                <Text style={styles.modalEventTime}>
                  {formatTime(new Date(selectedEvent.date))}
                  {selectedEvent.endDate && ` - ${formatTime(new Date(selectedEvent.endDate))}`}
                </Text>
                
                {selectedEvent.location && (
                  <View style={styles.modalEventDetail}>
                    <Ionicons name="location" size={16} color="#64748B" />
                    <Text style={styles.modalEventDetailText}>{selectedEvent.location}</Text>
                  </View>
                )}
                
                {selectedEvent.instructor && (
                  <View style={styles.modalEventDetail}>
                    <Ionicons name="person" size={16} color="#64748B" />
                    <Text style={styles.modalEventDetailText}>{selectedEvent.instructor}</Text>
                  </View>
                )}
                
                {selectedEvent.course && (
                  <View style={styles.modalEventDetail}>
                    <Ionicons name="book" size={16} color="#64748B" />
                    <Text style={styles.modalEventDetailText}>{selectedEvent.course}</Text>
                  </View>
                )}
                
                <View style={styles.modalActions}>
                  <TouchableOpacity
                    style={[styles.modalButton, { backgroundColor: selectedEvent.color }]}
                    onPress={() => {
                      setShowEventModal(false);
                      Alert.alert('Reminder Set', 'You will be reminded about this event!');
                    }}
                  >
                    <Ionicons name="notifications" size={16} color="#FFFFFF" />
                    <Text style={styles.modalButtonText}>Set Reminder</Text>
                  </TouchableOpacity>
                </View>
              </>
            )}
          </View>
        </View>
      </Modal>

      {/* Create Event Modal */}
      <Modal
        visible={showCreateEventModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowCreateEventModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.createEventModal}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Create Event</Text>
              <TouchableOpacity onPress={() => setShowCreateEventModal(false)}>
                <Ionicons name="close" size={24} color="#64748B" />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.createEventForm}>
              {/* Event Title */}
              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>Event Title *</Text>
                <TextInput
                  style={styles.formInput}
                  value={newEvent.title}
                  onChangeText={(text) => setNewEvent(prev => ({...prev, title: text}))}
                  placeholder="Enter event title"
                />
              </View>

              {/* Event Type */}
              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>Event Type</Text>
                <View style={styles.eventTypeContainer}>
                  {['class', 'assignment', 'exam', 'study', 'lab', 'holiday'].map((type) => (
                    <TouchableOpacity
                      key={type}
                      style={[
                        styles.eventTypeButton,
                        newEvent.type === type && styles.selectedEventType,
                        { backgroundColor: newEvent.type === type ? getEventTypeColor(type) : '#F1F5F9' }
                      ]}
                      onPress={() => setNewEvent(prev => ({...prev, type}))}
                    >
                      <Text style={[
                        styles.eventTypeText,
                        newEvent.type === type && styles.selectedEventTypeText
                      ]}>
                        {type.charAt(0).toUpperCase() + type.slice(1)}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              {/* Date */}
              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>Date</Text>
                <TouchableOpacity 
                  style={styles.formInput}
                  onPress={() => {
                    // For simplicity, we'll set it to selected date
                    setNewEvent(prev => ({...prev, date: selectedDate}));
                  }}
                >
                  <Text style={styles.dateText}>
                    {newEvent.date.toLocaleDateString('en-US', { 
                      weekday: 'long', 
                      year: 'numeric', 
                      month: 'long', 
                      day: 'numeric' 
                    })}
                  </Text>
                </TouchableOpacity>
              </View>

              {/* Time */}
              <View style={styles.formRow}>
                <View style={[styles.formGroup, {flex: 1, marginRight: 8}]}>
                  <Text style={styles.formLabel}>Start Time</Text>
                  <TextInput
                    style={styles.formInput}
                    value={newEvent.time}
                    onChangeText={(text) => setNewEvent(prev => ({...prev, time: text}))}
                    placeholder="09:00"
                  />
                </View>
                <View style={[styles.formGroup, {flex: 1, marginLeft: 8}]}>
                  <Text style={styles.formLabel}>End Time</Text>
                  <TextInput
                    style={styles.formInput}
                    value={newEvent.endTime}
                    onChangeText={(text) => setNewEvent(prev => ({...prev, endTime: text}))}
                    placeholder="10:30"
                  />
                </View>
              </View>

              {/* Location */}
              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>Location</Text>
                <TextInput
                  style={styles.formInput}
                  value={newEvent.location}
                  onChangeText={(text) => setNewEvent(prev => ({...prev, location: text}))}
                  placeholder="Room number or venue"
                />
              </View>

              {/* Course */}
              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>Course</Text>
                <TextInput
                  style={styles.formInput}
                  value={newEvent.course}
                  onChangeText={(text) => setNewEvent(prev => ({...prev, course: text}))}
                  placeholder="Course code (e.g., CSM101)"
                />
              </View>

              {/* Description */}
              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>Description</Text>
                <TextInput
                  style={[styles.formInput, styles.textArea]}
                  value={newEvent.description}
                  onChangeText={(text) => setNewEvent(prev => ({...prev, description: text}))}
                  placeholder="Event description (optional)"
                  multiline
                  numberOfLines={3}
                />
              </View>
            </ScrollView>

            <View style={styles.createEventActions}>
              <TouchableOpacity
                style={styles.cancelEventButton}
                onPress={() => setShowCreateEventModal(false)}
              >
                <Text style={styles.cancelEventButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.createEventButton}
                onPress={createEvent}
              >
                <Text style={styles.createEventButtonText}>Create Event</Text>
              </TouchableOpacity>
            </View>
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
  viewModeSelector: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    marginHorizontal: 20,
    marginVertical: 16,
    borderRadius: 12,
    padding: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  viewModeButton: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderRadius: 8,
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
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  monthNavigation: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  monthTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1E293B',
  },
  calendar: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  dayHeaders: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 16,
  },
  dayHeader: {
    fontSize: 14,
    fontWeight: '600',
    color: '#64748B',
    textAlign: 'center',
    width: (width - 72) / 7,
  },
  calendarGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  emptyDay: {
    width: (width - 72) / 7,
    height: 50,
  },
  calendarDay: {
    width: (width - 72) / 7,
    height: 50,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  selectedDay: {
    backgroundColor: '#4F46E5',
    borderRadius: 8,
  },
  todayDay: {
    backgroundColor: '#F1F5F9',
    borderRadius: 8,
  },
  dayNumber: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1E293B',
  },
  selectedDayText: {
    color: '#FFFFFF',
  },
  todayDayText: {
    color: '#4F46E5',
  },
  eventIndicators: {
    flexDirection: 'row',
    position: 'absolute',
    bottom: 4,
    gap: 2,
  },
  eventDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
  },
  selectedDateSection: {
    marginBottom: 20,
  },
  selectedDateTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1E293B',
    marginBottom: 16,
  },
  noEvents: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  noEventsText: {
    fontSize: 16,
    color: '#64748B',
    marginTop: 12,
  },
  agendaContainer: {
    marginBottom: 20,
  },
  agendaTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1E293B',
    marginBottom: 16,
  },
  eventCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderLeftWidth: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  eventHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  eventIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  eventInfo: {
    flex: 1,
  },
  eventTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1E293B',
    marginBottom: 4,
  },
  eventTime: {
    fontSize: 14,
    color: '#64748B',
    marginBottom: 2,
  },
  eventLocation: {
    fontSize: 12,
    color: '#64748B',
  },
  eventTypeBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  eventTypeText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  eventModal: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 24,
    width: width * 0.9,
    maxHeight: height * 0.8,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  modalEventIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalEventTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1E293B',
    marginBottom: 8,
  },
  modalEventDate: {
    fontSize: 16,
    color: '#64748B',
    marginBottom: 4,
  },
  modalEventTime: {
    fontSize: 16,
    fontWeight: '600',
    color: '#4F46E5',
    marginBottom: 16,
  },
  modalEventDetail: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 8,
  },
  modalEventDetailText: {
    fontSize: 14,
    color: '#64748B',
  },
  modalActions: {
    marginTop: 24,
  },
  modalButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 12,
    gap: 8,
  },
  modalButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  // Create Event Modal Styles
  createEventModal: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    maxHeight: height * 0.85,
    width: width * 0.9,
  },
  createEventForm: {
    maxHeight: height * 0.6,
    paddingHorizontal: 24,
  },
  formGroup: {
    marginBottom: 20,
  },
  formRow: {
    flexDirection: 'row',
  },
  formLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1E293B',
    marginBottom: 8,
  },
  formInput: {
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: '#1E293B',
    backgroundColor: '#FFFFFF',
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  dateText: {
    fontSize: 16,
    color: '#1E293B',
  },
  eventTypeContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  eventTypeButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  selectedEventType: {
    borderColor: 'transparent',
  },
  eventTypeText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#64748B',
  },
  selectedEventTypeText: {
    color: '#FFFFFF',
  },
  createEventActions: {
    flexDirection: 'row',
    padding: 24,
    gap: 12,
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
  },
  cancelEventButton: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    alignItems: 'center',
  },
  cancelEventButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#64748B',
  },
  createEventButton: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 12,
    backgroundColor: '#4F46E5',
    alignItems: 'center',
  },
  createEventButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});
