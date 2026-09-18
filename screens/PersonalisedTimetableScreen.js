import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  Dimensions,
  Animated,
  StatusBar,
  Alert,
  Modal,
  TextInput,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../components/ThemeProvider';
import { useApp } from '../context/AppContext';

const { width } = Dimensions.get('window');

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const FULL_DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

const SAMPLE_TIMETABLE = {
  Mon: [
    { id: '1', code: 'CSM301', name: 'Operating Systems', room: 'Hall A3', time: '08:00', end: '10:00', color: '#6366F1', lecturer: 'Dr. Mensah' },
    { id: '2', code: 'CSM305', name: 'Database Systems', room: 'LT2', time: '12:00', end: '14:00', color: '#10B981', lecturer: 'Prof. Adu' },
    { id: '3', code: 'CSM309', name: 'Software Engineering', room: 'Hall B1', time: '15:00', end: '17:00', color: '#F59E0B', lecturer: 'Dr. Asante' },
  ],
  Tue: [
    { id: '4', code: 'CSM303', name: 'Computer Networks', room: 'Hall A1', time: '09:00', end: '11:00', color: '#EF4444', lecturer: 'Dr. Boateng' },
    { id: '5', code: 'CSM311', name: 'Algorithm Analysis', room: 'LT3', time: '14:00', end: '16:00', color: '#8B5CF6', lecturer: 'Prof. Osei' },
  ],
  Wed: [
    { id: '6', code: 'CSM301', name: 'Operating Systems Lab', room: 'Lab 1', time: '10:00', end: '12:00', color: '#6366F1', lecturer: 'Dr. Mensah' },
    { id: '7', code: 'CSM307', name: 'Web Development', room: 'Lab 2', time: '14:00', end: '16:00', color: '#EC4899', lecturer: 'Mr. Frimpong' },
  ],
  Thu: [
    { id: '8', code: 'CSM305', name: 'Database Lab', room: 'Lab 3', time: '08:00', end: '10:00', color: '#10B981', lecturer: 'Prof. Adu' },
    { id: '9', code: 'CSM309', name: 'Software Project', room: 'Hall C2', time: '13:00', end: '15:00', color: '#F59E0B', lecturer: 'Dr. Asante' },
  ],
  Fri: [
    { id: '10', code: 'CSM303', name: 'Networks Lab', room: 'Lab 4', time: '09:00', end: '11:00', color: '#EF4444', lecturer: 'Dr. Boateng' },
    { id: '11', code: 'CSM311', name: 'Algorithms Tutorial', room: 'LT1', time: '15:00', end: '17:00', color: '#8B5CF6', lecturer: 'Prof. Osei' },
  ],
  Sat: [
    { id: '12', code: 'ELECTIVE', name: 'Entrepreneurship', room: 'Hall A2', time: '10:00', end: '12:00', color: '#0EA5E9', lecturer: 'Mr. Darkwah' },
  ],
};

const AI_TIPS = [
  '💡 Your heaviest day is Monday. Consider meal-prepping Sunday night.',
  '🧠 You have a 2-hour gap on Tuesday. Perfect for the Algorithm assignment.',
  '⚡ Wednesday lab back-to-back detected. Pack snacks and bring charger.',
  '📚 Light Saturday schedule — ideal for weekly review and quiz practice.',
  '🎯 You are on track to complete all credits this semester. Keep it up!',
];

export default function PersonalisedTimetableScreen({ navigation }) {
  const { isDark } = useTheme();
  const { user } = useApp();

  const todayIndex = new Date().getDay() === 0 ? 5 : Math.min(new Date().getDay() - 1, 5);
  const [selectedDay, setSelectedDay] = useState(todayIndex);
  const [view, setView] = useState('day'); // 'day' | 'week'
  const [showAddModal, setShowAddModal] = useState(false);
  const [countdown, setCountdown] = useState('');
  const [tipIndex, setTipIndex] = useState(0);

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 600, useNativeDriver: true }),
      Animated.timing(slideAnim, { toValue: 0, duration: 600, useNativeDriver: true }),
    ]).start();

    const tipTimer = setInterval(() => setTipIndex(i => (i + 1) % AI_TIPS.length), 5000);
    return () => clearInterval(tipTimer);
  }, []);

  // Compute next class countdown
  useEffect(() => {
    const tick = () => {
      const now = new Date();
      const todayKey = DAYS[todayIndex];
      const todayClasses = SAMPLE_TIMETABLE[todayKey] || [];
      const nowMin = now.getHours() * 60 + now.getMinutes();

      const next = todayClasses.find(c => {
        const [h, m] = c.time.split(':').map(Number);
        return h * 60 + m > nowMin;
      });

      if (next) {
        const [h, m] = next.time.split(':').map(Number);
        const diff = h * 60 + m - nowMin;
        const hrs = Math.floor(diff / 60);
        const mins = diff % 60;
        setCountdown(`${next.name} in ${hrs > 0 ? `${hrs}h ` : ''}${mins}m`);
      } else {
        setCountdown('No more classes today 🎉');
      }
    };
    tick();
    const t = setInterval(tick, 60000);
    return () => clearInterval(t);
  }, [todayIndex]);

  const dayClasses = SAMPLE_TIMETABLE[DAYS[selectedDay]] || [];

  const theme = {
    bg: isDark ? '#020617' : '#F8FAFC',
    card: isDark ? '#1E293B' : '#FFFFFF',
    text: isDark ? '#F1F5F9' : '#1E293B',
    sub: isDark ? '#94A3B8' : '#64748B',
    border: isDark ? '#334155' : '#E2E8F0',
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.bg }]}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />

      {/* Header */}
      <LinearGradient colors={isDark ? ['#1E1B4B', '#020617'] : ['#4F46E5', '#6366F1']} style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color="#FFF" />
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>My Timetable</Text>
          <Text style={styles.headerSub}>{FULL_DAYS[selectedDay]}</Text>
        </View>
        <TouchableOpacity style={styles.addBtn} onPress={() => setShowAddModal(true)}>
          <Ionicons name="add" size={24} color="#FFF" />
        </TouchableOpacity>
      </LinearGradient>

      <Animated.ScrollView
        style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scroll}
      >
        {/* Next Class Countdown */}
        <View style={[styles.countdownCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
          <LinearGradient colors={['#6366F1', '#8B5CF6']} style={styles.countdownIcon}>
            <Ionicons name="time" size={22} color="#FFF" />
          </LinearGradient>
          <View style={styles.countdownInfo}>
            <Text style={[styles.countdownLabel, { color: theme.sub }]}>NEXT CLASS</Text>
            <Text style={[styles.countdownValue, { color: theme.text }]}>{countdown}</Text>
          </View>
          <View style={[styles.liveIndicator]}>
            <View style={styles.liveDot} />
            <Text style={styles.liveText}>LIVE</Text>
          </View>
        </View>

        {/* AI Tip Banner */}
        <View style={[styles.tipBanner, { backgroundColor: isDark ? '#1E293B' : '#EEF2FF' }]}>
          <Ionicons name="sparkles" size={16} color="#6366F1" />
          <Text style={[styles.tipText, { color: theme.text }]}>{AI_TIPS[tipIndex]}</Text>
        </View>

        {/* View Toggle */}
        <View style={styles.viewToggleRow}>
          {['day', 'week'].map(v => (
            <TouchableOpacity
              key={v}
              style={[styles.viewTab, view === v && styles.viewTabActive]}
              onPress={() => setView(v)}
            >
              <Text style={[styles.viewTabText, view === v && styles.viewTabTextActive]}>
                {v === 'day' ? 'Day View' : 'Week View'}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Day Selector */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.dayScroll}
          contentContainerStyle={styles.dayScrollContent}>
          {DAYS.map((day, i) => {
            const count = (SAMPLE_TIMETABLE[day] || []).length;
            const isToday = i === todayIndex;
            return (
              <TouchableOpacity
                key={day}
                style={[styles.dayChip, selectedDay === i && styles.dayChipActive, isToday && selectedDay !== i && styles.dayChipToday]}
                onPress={() => setSelectedDay(i)}
              >
                <Text style={[styles.dayChipText, selectedDay === i && styles.dayChipTextActive]}>{day}</Text>
                {count > 0 && (
                  <View style={[styles.dayDot, selectedDay === i && styles.dayDotActive]} />
                )}
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {/* Class List */}
        {view === 'day' ? (
          dayClasses.length === 0 ? (
            <View style={styles.emptyState}>
              <Ionicons name="cafe" size={48} color={theme.sub} />
              <Text style={[styles.emptyTitle, { color: theme.text }]}>Free Day! 🎉</Text>
              <Text style={[styles.emptySub, { color: theme.sub }]}>No classes scheduled. Enjoy your break.</Text>
            </View>
          ) : (
            dayClasses.map((cls, i) => (
              <TouchableOpacity
                key={cls.id}
                style={[styles.classCard, { backgroundColor: theme.card, borderColor: theme.border }]}
                onPress={() => Alert.alert(cls.code, `${cls.name}\n📍 ${cls.room}\n⏰ ${cls.time} – ${cls.end}\n👨‍🏫 ${cls.lecturer}`)}
                activeOpacity={0.85}
              >
                <View style={[styles.colorBar, { backgroundColor: cls.color }]} />
                <View style={styles.classInfo}>
                  <View style={styles.classRow}>
                    <Text style={[styles.classCode, { color: cls.color }]}>{cls.code}</Text>
                    <Text style={[styles.classTime, { color: theme.sub }]}>{cls.time} – {cls.end}</Text>
                  </View>
                  <Text style={[styles.className, { color: theme.text }]}>{cls.name}</Text>
                  <View style={styles.classMeta}>
                    <Ionicons name="location" size={12} color={theme.sub} />
                    <Text style={[styles.classMetaText, { color: theme.sub }]}>{cls.room}</Text>
                    <Ionicons name="person" size={12} color={theme.sub} style={{ marginLeft: 8 }} />
                    <Text style={[styles.classMetaText, { color: theme.sub }]}>{cls.lecturer}</Text>
                  </View>
                </View>
                <Ionicons name="chevron-forward" size={18} color={theme.sub} />
              </TouchableOpacity>
            ))
          )
        ) : (
          // Week View: compact grid
          <View style={styles.weekGrid}>
            {DAYS.map((day, di) => (
              <View key={day} style={[styles.weekDayCol, di < DAYS.length - 1 && { borderRightWidth: 1, borderRightColor: theme.border }]}>
                <Text style={[styles.weekDayLabel, { color: di === todayIndex ? '#6366F1' : theme.sub }]}>{day}</Text>
                {(SAMPLE_TIMETABLE[day] || []).map(cls => (
                  <View key={cls.id} style={[styles.weekClassChip, { backgroundColor: cls.color }]}>
                    <Text style={styles.weekClassCode} numberOfLines={1}>{cls.code.replace('CSM', '')}</Text>
                    <Text style={styles.weekClassTime}>{cls.time}</Text>
                  </View>
                ))}
              </View>
            ))}
          </View>
        )}

        <View style={{ height: 40 }} />
      </Animated.ScrollView>

      {/* Add Event Modal */}
      <Modal visible={showAddModal} transparent animationType="slide" onRequestClose={() => setShowAddModal(false)}>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalSheet, { backgroundColor: theme.card }]}>
            <Text style={[styles.modalTitle, { color: theme.text }]}>Add Custom Event</Text>
            <TextInput placeholder="Event title" placeholderTextColor={theme.sub}
              style={[styles.input, { color: theme.text, borderColor: theme.border }]} />
            <TextInput placeholder="Room / Location" placeholderTextColor={theme.sub}
              style={[styles.input, { color: theme.text, borderColor: theme.border }]} />
            <View style={styles.modalActions}>
              <TouchableOpacity style={[styles.modalBtn, { borderColor: theme.border }]} onPress={() => setShowAddModal(false)}>
                <Text style={{ color: theme.sub, fontWeight: '700' }}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.modalBtnPrimary} onPress={() => {
                setShowAddModal(false);
                Alert.alert('Event Added!', 'Your custom event has been saved to your timetable.');
              }}>
                <Text style={{ color: '#FFF', fontWeight: '700' }}>Save</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, paddingTop: 16, paddingBottom: 20 },
  backBtn: { width: 40, alignItems: 'flex-start' },
  headerCenter: { flex: 1, alignItems: 'center' },
  headerTitle: { fontSize: 20, fontWeight: '900', color: '#FFF' },
  headerSub: { fontSize: 12, color: 'rgba(255,255,255,0.7)', marginTop: 2 },
  addBtn: { width: 40, alignItems: 'flex-end' },
  scroll: { paddingBottom: 30 },
  countdownCard: { flexDirection: 'row', alignItems: 'center', margin: 20, padding: 16, borderRadius: 20, borderWidth: 1, gap: 12 },
  countdownIcon: { width: 44, height: 44, borderRadius: 14, justifyContent: 'center', alignItems: 'center' },
  countdownInfo: { flex: 1 },
  countdownLabel: { fontSize: 10, fontWeight: '900', letterSpacing: 1 },
  countdownValue: { fontSize: 15, fontWeight: '800', marginTop: 2 },
  liveIndicator: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  liveDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#10B981' },
  liveText: { fontSize: 10, fontWeight: '900', color: '#10B981', letterSpacing: 1 },
  tipBanner: { flexDirection: 'row', alignItems: 'center', gap: 8, marginHorizontal: 20, padding: 12, borderRadius: 14, marginBottom: 16 },
  tipText: { flex: 1, fontSize: 12, fontWeight: '600', lineHeight: 18 },
  viewToggleRow: { flexDirection: 'row', marginHorizontal: 20, marginBottom: 16, backgroundColor: 'rgba(99,102,241,0.1)', borderRadius: 14, padding: 4 },
  viewTab: { flex: 1, paddingVertical: 8, borderRadius: 10, alignItems: 'center' },
  viewTabActive: { backgroundColor: '#6366F1' },
  viewTabText: { fontSize: 13, fontWeight: '700', color: '#6366F1' },
  viewTabTextActive: { color: '#FFF' },
  dayScroll: { marginBottom: 16 },
  dayScrollContent: { paddingHorizontal: 20, gap: 10 },
  dayChip: { paddingHorizontal: 16, paddingVertical: 10, borderRadius: 14, backgroundColor: 'rgba(99,102,241,0.08)', alignItems: 'center', minWidth: 52 },
  dayChipActive: { backgroundColor: '#6366F1' },
  dayChipToday: { borderWidth: 2, borderColor: '#6366F1' },
  dayChipText: { fontSize: 13, fontWeight: '800', color: '#6366F1' },
  dayChipTextActive: { color: '#FFF' },
  dayDot: { width: 5, height: 5, borderRadius: 3, backgroundColor: '#6366F1', marginTop: 4 },
  dayDotActive: { backgroundColor: '#FFF' },
  classCard: { flexDirection: 'row', alignItems: 'center', marginHorizontal: 20, marginBottom: 12, borderRadius: 20, borderWidth: 1, overflow: 'hidden', paddingRight: 16 },
  colorBar: { width: 6, height: '100%', minHeight: 80 },
  classInfo: { flex: 1, padding: 14 },
  classRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  classCode: { fontSize: 12, fontWeight: '900', letterSpacing: 0.5 },
  classTime: { fontSize: 12, fontWeight: '700' },
  className: { fontSize: 16, fontWeight: '800', marginTop: 4 },
  classMeta: { flexDirection: 'row', alignItems: 'center', marginTop: 6, gap: 4 },
  classMetaText: { fontSize: 11, fontWeight: '600' },
  emptyState: { alignItems: 'center', paddingVertical: 60, gap: 12 },
  emptyTitle: { fontSize: 22, fontWeight: '900' },
  emptySub: { fontSize: 14, fontWeight: '600', textAlign: 'center', paddingHorizontal: 40 },
  weekGrid: { flexDirection: 'row', marginHorizontal: 16, borderWidth: 1, borderColor: '#E2E8F0', borderRadius: 16, overflow: 'hidden' },
  weekDayCol: { flex: 1, padding: 6 },
  weekDayLabel: { fontSize: 10, fontWeight: '900', textAlign: 'center', marginBottom: 6 },
  weekClassChip: { borderRadius: 8, padding: 4, marginBottom: 4 },
  weekClassCode: { fontSize: 9, fontWeight: '900', color: '#FFF' },
  weekClassTime: { fontSize: 8, color: 'rgba(255,255,255,0.8)' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalSheet: { borderTopLeftRadius: 28, borderTopRightRadius: 28, padding: 28, gap: 14 },
  modalTitle: { fontSize: 20, fontWeight: '900', marginBottom: 8 },
  input: { borderWidth: 1, borderRadius: 14, paddingHorizontal: 16, paddingVertical: 12, fontSize: 15, fontWeight: '600' },
  modalActions: { flexDirection: 'row', gap: 12, marginTop: 8 },
  modalBtn: { flex: 1, paddingVertical: 14, borderRadius: 14, borderWidth: 1, alignItems: 'center' },
  modalBtnPrimary: { flex: 1, paddingVertical: 14, borderRadius: 14, backgroundColor: '#6366F1', alignItems: 'center' },
});
