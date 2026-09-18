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

const { width } = Dimensions.get('window');

const PRIORITY_CONFIG = {
  urgent: { label: 'URGENT', color: '#EF4444', bg: '#FEF2F2', icon: 'alert-circle' },
  high: { label: 'HIGH', color: '#F59E0B', bg: '#FFFBEB', icon: 'warning' },
  normal: { label: 'NORMAL', color: '#10B981', bg: '#ECFDF5', icon: 'checkmark-circle' },
};

const INITIAL_ASSIGNMENTS = [
  { id: '1', title: 'Neural Networks Project', course: 'CSM411', priority: 'urgent', due: new Date(Date.now() + 2 * 24 * 3600 * 1000), status: 'in-progress', progress: 65, description: 'Implement a 3-layer neural network for image classification using PyTorch.', submissions: 'PDF + Code ZIP' },
  { id: '2', title: 'Database ER Diagram', course: 'CSM305', priority: 'high', due: new Date(Date.now() + 4 * 24 * 3600 * 1000), status: 'not-started', progress: 0, description: 'Design and normalize an ER diagram for the university registration system.', submissions: 'PDF' },
  { id: '3', title: 'OS Scheduling Report', course: 'CSM301', priority: 'high', due: new Date(Date.now() + 6 * 24 * 3600 * 1000), status: 'in-progress', progress: 40, description: 'Compare Round Robin and Priority Scheduling algorithms with simulation results.', submissions: 'Word Document' },
  { id: '4', title: 'Software SRS Document', course: 'CSM309', priority: 'normal', due: new Date(Date.now() + 10 * 24 * 3600 * 1000), status: 'not-started', progress: 0, description: 'Write a Software Requirements Specification for your group project.', submissions: 'Word Document + Diagrams' },
  { id: '5', title: 'Algorithm Complexity Lab', course: 'CSM311', priority: 'normal', due: new Date(Date.now() + 12 * 24 * 3600 * 1000), status: 'completed', progress: 100, description: 'Implement and benchmark sorting algorithms with Big-O analysis.', submissions: 'PDF + Code' },
];

function getCountdown(due) {
  const diff = due - Date.now();
  if (diff <= 0) return { text: 'OVERDUE', color: '#EF4444' };
  const days = Math.floor(diff / 86400000);
  const hrs = Math.floor((diff % 86400000) / 3600000);
  if (days === 0) return { text: `${hrs}h left`, color: '#EF4444' };
  if (days === 1) return { text: `1d ${hrs}h left`, color: '#F59E0B' };
  if (days <= 3) return { text: `${days}d left`, color: '#F59E0B' };
  return { text: `${days}d left`, color: '#10B981' };
}

export default function AssignmentDeadlineScreen({ navigation }) {
  const { isDark } = useTheme();
  const [assignments, setAssignments] = useState(INITIAL_ASSIGNMENTS);
  const [filter, setFilter] = useState('all'); // all | urgent | in-progress | completed
  const [selected, setSelected] = useState(null);
  const [addModal, setAddModal] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newCourse, setNewCourse] = useState('');
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, { toValue: 1, duration: 600, useNativeDriver: true }).start();
  }, []);

  const theme = {
    bg: isDark ? '#020617' : '#F8FAFC',
    card: isDark ? '#1E293B' : '#FFFFFF',
    text: isDark ? '#F1F5F9' : '#1E293B',
    sub: isDark ? '#94A3B8' : '#64748B',
    border: isDark ? '#334155' : '#E2E8F0',
  };

  const filtered = assignments.filter(a => {
    if (filter === 'all') return a.status !== 'completed';
    if (filter === 'urgent') return a.priority === 'urgent' && a.status !== 'completed';
    if (filter === 'in-progress') return a.status === 'in-progress';
    if (filter === 'completed') return a.status === 'completed';
    return true;
  });

  const stats = {
    total: assignments.length,
    done: assignments.filter(a => a.status === 'completed').length,
    urgent: assignments.filter(a => a.priority === 'urgent' && a.status !== 'completed').length,
    overdue: assignments.filter(a => a.due < Date.now() && a.status !== 'completed').length,
  };

  const markComplete = (id) => {
    setAssignments(prev => prev.map(a => a.id === id ? { ...a, status: 'completed', progress: 100 } : a));
    setSelected(null);
    Alert.alert('✅ Done!', 'Assignment marked as completed. Great work!');
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.bg }]}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />

      {/* Header */}
      <LinearGradient colors={isDark ? ['#1B0A2E', '#020617'] : ['#F59E0B', '#EF4444']} style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color="#FFF" />
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>Assignment Deadlines</Text>
          <Text style={styles.headerSub}>{stats.total - stats.done} pending · {stats.urgent} urgent</Text>
        </View>
        <TouchableOpacity style={styles.addBtn} onPress={() => setAddModal(true)}>
          <Ionicons name="add" size={24} color="#FFF" />
        </TouchableOpacity>
      </LinearGradient>

      <Animated.ScrollView style={{ opacity: fadeAnim }} showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scroll}>

        {/* Stats Row */}
        <View style={styles.statsRow}>
          {[
            { label: 'Total', value: stats.total, color: '#6366F1' },
            { label: 'Done', value: stats.done, color: '#10B981' },
            { label: 'Urgent', value: stats.urgent, color: '#EF4444' },
            { label: 'Overdue', value: stats.overdue, color: '#F97316' },
          ].map(s => (
            <View key={s.label} style={[styles.statChip, { backgroundColor: theme.card, borderColor: theme.border }]}>
              <Text style={[styles.statNum, { color: s.color }]}>{s.value}</Text>
              <Text style={[styles.statLabel, { color: theme.sub }]}>{s.label}</Text>
            </View>
          ))}
        </View>

        {/* Overall Progress */}
        <View style={[styles.overallCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
          <View style={styles.overallRow}>
            <Text style={[styles.overallTitle, { color: theme.text }]}>Overall Completion</Text>
            <Text style={[styles.overallPct, { color: '#6366F1' }]}>{Math.round((stats.done / stats.total) * 100)}%</Text>
          </View>
          <View style={styles.progressBarTrack}>
            <LinearGradient
              colors={['#6366F1', '#10B981']}
              start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
              style={[styles.progressBarFill, { width: `${(stats.done / stats.total) * 100}%` }]}
            />
          </View>
        </View>

        {/* Filter Tabs */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterScroll}
          contentContainerStyle={styles.filterContent}>
          {['all', 'urgent', 'in-progress', 'completed'].map(f => (
            <TouchableOpacity key={f} style={[styles.filterTab, filter === f && styles.filterTabActive]}
              onPress={() => setFilter(f)}>
              <Text style={[styles.filterText, filter === f && styles.filterTextActive]}>
                {f === 'all' ? 'All Pending' : f === 'in-progress' ? 'In Progress' : f.charAt(0).toUpperCase() + f.slice(1)}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Assignment Cards */}
        {filtered.map(a => {
          const cd = getCountdown(a.due);
          const p = PRIORITY_CONFIG[a.priority];
          const isCompleted = a.status === 'completed';
          return (
            <TouchableOpacity key={a.id} style={[styles.aCard, { backgroundColor: theme.card, borderColor: theme.border },
              isCompleted && { opacity: 0.6 }]}
              onPress={() => setSelected(a)} activeOpacity={0.85}>
              <View style={styles.aCardTop}>
                <View style={[styles.priorityBadge, { backgroundColor: isDark ? 'rgba(0,0,0,0.3)' : p.bg }]}>
                  <Ionicons name={p.icon} size={12} color={p.color} />
                  <Text style={[styles.priorityText, { color: p.color }]}>{p.label}</Text>
                </View>
                <Text style={[styles.countdownBadge, { color: cd.color }]}>{cd.text}</Text>
              </View>
              <Text style={[styles.aTitle, { color: theme.text }]}>{a.title}</Text>
              <Text style={[styles.aCourse, { color: '#6366F1' }]}>{a.course}</Text>
              <View style={styles.progressRow}>
                <View style={[styles.aBar, { backgroundColor: isDark ? '#334155' : '#F1F5F9' }]}>
                  <LinearGradient colors={isCompleted ? ['#10B981', '#059669'] : ['#6366F1', '#8B5CF6']}
                    start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
                    style={[styles.aBarFill, { width: `${a.progress}%` }]} />
                </View>
                <Text style={[styles.progressPct, { color: theme.sub }]}>{a.progress}%</Text>
              </View>
              {isCompleted && (
                <View style={styles.completedBadge}>
                  <Ionicons name="checkmark-circle" size={14} color="#10B981" />
                  <Text style={styles.completedText}>Submitted</Text>
                </View>
              )}
            </TouchableOpacity>
          );
        })}
        <View style={{ height: 40 }} />
      </Animated.ScrollView>

      {/* Assignment Detail Modal */}
      <Modal visible={!!selected} transparent animationType="slide" onRequestClose={() => setSelected(null)}>
        <View style={styles.modalOverlay}>
          {selected && (
            <View style={[styles.detailSheet, { backgroundColor: theme.card }]}>
              <View style={styles.detailHandle} />
              <Text style={[styles.detailTitle, { color: theme.text }]}>{selected.title}</Text>
              <Text style={[styles.detailCourse, { color: '#6366F1' }]}>{selected.course}</Text>
              <Text style={[styles.detailDesc, { color: theme.sub }]}>{selected.description}</Text>
              <View style={[styles.detailRow, { borderTopColor: theme.border }]}>
                <View style={styles.detailItem}>
                  <Text style={[styles.detailLabel, { color: theme.sub }]}>DUE DATE</Text>
                  <Text style={[styles.detailValue, { color: theme.text }]}>
                    {selected.due.toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short' })}
                  </Text>
                </View>
                <View style={styles.detailItem}>
                  <Text style={[styles.detailLabel, { color: theme.sub }]}>TIME LEFT</Text>
                  <Text style={[styles.detailValue, { color: getCountdown(selected.due).color }]}>
                    {getCountdown(selected.due).text}
                  </Text>
                </View>
                <View style={styles.detailItem}>
                  <Text style={[styles.detailLabel, { color: theme.sub }]}>SUBMIT AS</Text>
                  <Text style={[styles.detailValue, { color: theme.text }]}>{selected.submissions}</Text>
                </View>
              </View>
              <View style={styles.detailActions}>
                <TouchableOpacity style={[styles.detailBtn, { borderColor: theme.border }]}
                  onPress={() => setSelected(null)}>
                  <Text style={{ color: theme.sub, fontWeight: '700' }}>Close</Text>
                </TouchableOpacity>
                {selected.status !== 'completed' && (
                  <TouchableOpacity style={styles.detailBtnPrimary} onPress={() => markComplete(selected.id)}>
                    <Ionicons name="checkmark" size={18} color="#FFF" />
                    <Text style={{ color: '#FFF', fontWeight: '800' }}>Mark Done</Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>
          )}
        </View>
      </Modal>

      {/* Add Modal */}
      <Modal visible={addModal} transparent animationType="slide" onRequestClose={() => setAddModal(false)}>
        <View style={styles.modalOverlay}>
          <View style={[styles.detailSheet, { backgroundColor: theme.card }]}>
            <Text style={[styles.detailTitle, { color: theme.text }]}>Add Assignment</Text>
            <TextInput placeholder="Assignment title" placeholderTextColor={theme.sub}
              value={newTitle} onChangeText={setNewTitle}
              style={[styles.input, { color: theme.text, borderColor: theme.border }]} />
            <TextInput placeholder="Course code (e.g. CSM301)" placeholderTextColor={theme.sub}
              value={newCourse} onChangeText={setNewCourse}
              style={[styles.input, { color: theme.text, borderColor: theme.border }]} />
            <View style={styles.detailActions}>
              <TouchableOpacity style={[styles.detailBtn, { borderColor: theme.border }]}
                onPress={() => setAddModal(false)}>
                <Text style={{ color: theme.sub, fontWeight: '700' }}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.detailBtnPrimary} onPress={() => {
                if (!newTitle.trim()) { Alert.alert('Error', 'Please enter a title'); return; }
                const na = { id: String(Date.now()), title: newTitle, course: newCourse || 'CUSTOM', priority: 'normal', due: new Date(Date.now() + 7 * 86400000), status: 'not-started', progress: 0, description: 'Custom assignment.', submissions: 'TBD' };
                setAssignments(prev => [na, ...prev]);
                setNewTitle(''); setNewCourse('');
                setAddModal(false);
                Alert.alert('Added!', 'Assignment added to your tracker.');
              }}>
                <Text style={{ color: '#FFF', fontWeight: '800' }}>Save</Text>
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
  backBtn: { width: 40 },
  headerCenter: { flex: 1, alignItems: 'center' },
  headerTitle: { fontSize: 20, fontWeight: '900', color: '#FFF' },
  headerSub: { fontSize: 11, color: 'rgba(255,255,255,0.75)', marginTop: 2 },
  addBtn: { width: 40, alignItems: 'flex-end' },
  scroll: { paddingBottom: 30 },
  statsRow: { flexDirection: 'row', paddingHorizontal: 20, paddingTop: 16, gap: 10 },
  statChip: { flex: 1, borderRadius: 16, padding: 12, alignItems: 'center', borderWidth: 1 },
  statNum: { fontSize: 22, fontWeight: '900' },
  statLabel: { fontSize: 10, fontWeight: '700', marginTop: 2 },
  overallCard: { margin: 20, borderRadius: 20, padding: 16, borderWidth: 1 },
  overallRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  overallTitle: { fontSize: 15, fontWeight: '800' },
  overallPct: { fontSize: 20, fontWeight: '900' },
  progressBarTrack: { height: 8, backgroundColor: '#F1F5F9', borderRadius: 4, overflow: 'hidden' },
  progressBarFill: { height: '100%', borderRadius: 4 },
  filterScroll: { marginBottom: 12 },
  filterContent: { paddingHorizontal: 20, gap: 10 },
  filterTab: { paddingHorizontal: 18, paddingVertical: 8, borderRadius: 20, backgroundColor: 'rgba(99,102,241,0.08)' },
  filterTabActive: { backgroundColor: '#6366F1' },
  filterText: { fontSize: 13, fontWeight: '700', color: '#6366F1' },
  filterTextActive: { color: '#FFF' },
  aCard: { marginHorizontal: 20, marginBottom: 12, borderRadius: 20, padding: 16, borderWidth: 1 },
  aCardTop: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  priorityBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 10 },
  priorityText: { fontSize: 10, fontWeight: '900', letterSpacing: 0.5 },
  countdownBadge: { fontSize: 12, fontWeight: '800' },
  aTitle: { fontSize: 16, fontWeight: '800', marginBottom: 4 },
  aCourse: { fontSize: 12, fontWeight: '700', marginBottom: 10 },
  progressRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  aBar: { flex: 1, height: 6, borderRadius: 3, overflow: 'hidden' },
  aBarFill: { height: '100%', borderRadius: 3 },
  progressPct: { fontSize: 11, fontWeight: '700', minWidth: 30, textAlign: 'right' },
  completedBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 8 },
  completedText: { fontSize: 12, fontWeight: '700', color: '#10B981' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  detailSheet: { borderTopLeftRadius: 28, borderTopRightRadius: 28, padding: 24, gap: 12 },
  detailHandle: { width: 40, height: 4, borderRadius: 2, backgroundColor: '#94A3B8', alignSelf: 'center', marginBottom: 8 },
  detailTitle: { fontSize: 20, fontWeight: '900' },
  detailCourse: { fontSize: 13, fontWeight: '800' },
  detailDesc: { fontSize: 14, lineHeight: 20 },
  detailRow: { flexDirection: 'row', borderTopWidth: 1, paddingTop: 16, gap: 12 },
  detailItem: { flex: 1 },
  detailLabel: { fontSize: 9, fontWeight: '900', letterSpacing: 1, marginBottom: 4 },
  detailValue: { fontSize: 13, fontWeight: '800' },
  detailActions: { flexDirection: 'row', gap: 12 },
  detailBtn: { flex: 1, paddingVertical: 14, borderRadius: 14, borderWidth: 1, alignItems: 'center' },
  detailBtnPrimary: { flex: 1, paddingVertical: 14, borderRadius: 14, backgroundColor: '#6366F1', alignItems: 'center', flexDirection: 'row', justifyContent: 'center', gap: 6 },
  input: { borderWidth: 1, borderRadius: 14, paddingHorizontal: 16, paddingVertical: 12, fontSize: 15, fontWeight: '600' },
});
