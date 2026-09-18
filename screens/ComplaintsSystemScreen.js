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
  Switch,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../components/ThemeProvider';
import { useApp } from '../context/AppContext';
import AsyncStorage from '@react-native-async-storage/async-storage';

const { width } = Dimensions.get('window');

const CATEGORIES = [
  { id: 'academic', label: 'Academic', icon: 'school', color: '#6366F1' },
  { id: 'facility', label: 'Facility', icon: 'business', color: '#3B82F6' },
  { id: 'welfare', label: 'Welfare', icon: 'heart', color: '#EC4899' },
  { id: 'safety', label: 'Safety', icon: 'shield-checkmark', color: '#EF4444' },
  { id: 'finance', label: 'Finance', icon: 'card', color: '#10B981' },
  { id: 'it', label: 'IT Support', icon: 'laptop', color: '#8B5CF6' },
  { id: 'other', label: 'Other', icon: 'ellipsis-horizontal', color: '#64748B' },
];

const SAMPLE_COMPLAINTS = [
  { id: 'c1', title: 'Lecture Hall AC Not Working', category: 'facility', date: 'May 28', status: 'resolved', response: 'AC unit was repaired on Jun 1. Thank you for reporting.', priority: 'high' },
  { id: 'c2', title: 'Results Not Uploaded for CSM301', category: 'academic', date: 'Jun 1', status: 'in-review', response: null, priority: 'urgent' },
  { id: 'c3', title: 'Hostel Water Supply Irregular', category: 'facility', date: 'Jun 2', status: 'submitted', response: null, priority: 'high' },
];

const STATUS_CONFIG = {
  submitted: { label: 'Submitted', color: '#F59E0B', icon: 'time' },
  'in-review': { label: 'In Review', color: '#3B82F6', icon: 'eye' },
  resolved: { label: 'Resolved', color: '#10B981', icon: 'checkmark-circle' },
};

// Offline Vault Materials (local cache simulation)
const OFFLINE_VAULT = [
  { id: 'ov1', title: 'Operating Systems - Silberschatz', type: 'PDF', size: '4.2 MB', course: 'CSM301' },
  { id: 'ov2', title: 'CSM301 Past Questions 2019-2023', type: 'PDF', size: '1.1 MB', course: 'CSM301' },
  { id: 'ov3', title: 'Machine Learning Research Papers', type: 'PDF', size: '2.3 MB', course: 'CSM411' },
  { id: 'ov4', title: 'Algorithm Analysis Notes', type: 'PDF', size: '860 KB', course: 'CSM311' },
  { id: 'ov5', title: 'My Lecture Notes - Nov 2025', type: 'Smart Note', size: '340 KB', course: 'CSM305' },
];

export default function ComplaintsSystemScreen({ navigation }) {
  const { isDark } = useTheme();
  const { user } = useApp();
  const [activeTab, setActiveTab] = useState('submit'); // submit | track | offline
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [selectedDetail, setSelectedDetail] = useState(null);
  const [complaints, setComplaints] = useState(SAMPLE_COMPLAINTS);
  const [submitting, setSubmitting] = useState(false);
  const [isOnline, setIsOnline] = useState(true);
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, { toValue: 1, duration: 600, useNativeDriver: true }).start();
    // Simulate checking connectivity
    const t = setInterval(() => setIsOnline(prev => prev), 5000); // stays online in demo
    return () => clearInterval(t);
  }, []);

  const theme = {
    bg: isDark ? '#020617' : '#F8FAFC',
    card: isDark ? '#1E293B' : '#FFFFFF',
    text: isDark ? '#F1F5F9' : '#1E293B',
    sub: isDark ? '#94A3B8' : '#64748B',
    border: isDark ? '#334155' : '#E2E8F0',
    input: isDark ? '#0F172A' : '#F8FAFC',
  };

  const submitComplaint = async () => {
    if (!selectedCategory) { Alert.alert('Required', 'Please select a category'); return; }
    if (!title.trim()) { Alert.alert('Required', 'Please enter a title'); return; }
    if (!description.trim()) { Alert.alert('Required', 'Please describe your complaint'); return; }

    setSubmitting(true);

    // Save to local storage for offline support
    const newComplaint = {
      id: `c${Date.now()}`,
      title: title.trim(),
      category: selectedCategory,
      date: new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short' }),
      status: isOnline ? 'submitted' : 'pending-sync',
      response: null,
      priority: 'normal',
      anonymous: isAnonymous,
      description: description.trim(),
    };

    try {
      const stored = await AsyncStorage.getItem('complaints') || '[]';
      const arr = JSON.parse(stored);
      arr.unshift(newComplaint);
      await AsyncStorage.setItem('complaints', JSON.stringify(arr));
    } catch (e) { }

    setTimeout(() => {
      setSubmitting(false);
      setComplaints(prev => [newComplaint, ...prev]);
      setTitle(''); setDescription(''); setSelectedCategory(null); setIsAnonymous(false);
      setActiveTab('track');
      Alert.alert(
        isOnline ? '✅ Complaint Submitted!' : '📥 Saved Offline',
        isOnline
          ? 'Your complaint has been received. You\'ll be notified when it\'s reviewed (within 3 working days).'
          : 'Your complaint is saved locally and will be submitted once you reconnect.',
      );
    }, 1500);
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.bg }]}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />

      {/* Header */}
      <LinearGradient colors={isDark ? ['#1A1033', '#020617'] : ['#6366F1', '#8B5CF6']} style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color="#FFF" />
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>Complaints & Offline</Text>
          <Text style={styles.headerSub}>{isOnline ? '🟢 Online' : '🔴 Offline Mode'}</Text>
        </View>
        <View style={[styles.statusDot, { backgroundColor: isOnline ? '#10B981' : '#EF4444' }]} />
      </LinearGradient>

      {/* Tab Bar */}
      <View style={[styles.tabBar, { backgroundColor: theme.card, borderBottomColor: theme.border }]}>
        {[
          { id: 'submit', label: 'Submit', icon: 'create' },
          { id: 'track', label: 'Track', icon: 'list', count: complaints.filter(c => c.status !== 'resolved').length },
          { id: 'offline', label: 'Offline Vault', icon: 'cloud-offline' },
        ].map(t => (
          <TouchableOpacity key={t.id} style={[styles.tabItem, activeTab === t.id && styles.tabItemActive]}
            onPress={() => setActiveTab(t.id)}>
            <View style={styles.tabIconRow}>
              <Ionicons name={t.icon} size={18} color={activeTab === t.id ? '#6366F1' : theme.sub} />
              {t.count > 0 && <View style={styles.tabBadge}><Text style={styles.tabBadgeText}>{t.count}</Text></View>}
            </View>
            <Text style={[styles.tabLabel, activeTab === t.id && styles.tabLabelActive, { color: activeTab === t.id ? '#6366F1' : theme.sub }]}>{t.label}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <Animated.ScrollView style={{ opacity: fadeAnim }} showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scroll}>

        {activeTab === 'submit' && (
          <>
            {/* Offline Banner */}
            {!isOnline && (
              <View style={styles.offlineBanner}>
                <Ionicons name="cloud-offline" size={16} color="#F59E0B" />
                <Text style={styles.offlineBannerText}>You're offline. Complaints will be synced when reconnected.</Text>
              </View>
            )}

            {/* Form */}
            <Text style={[styles.sectionHeader, { color: theme.sub }]}>CATEGORY</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.catScroll}
              contentContainerStyle={styles.catContent}>
              {CATEGORIES.map(c => (
                <TouchableOpacity key={c.id} style={[styles.catCard, selectedCategory === c.id && { borderColor: c.color, borderWidth: 2 },
                { backgroundColor: theme.card }]}
                  onPress={() => setSelectedCategory(c.id)}>
                  <LinearGradient colors={selectedCategory === c.id ? [c.color, c.color + 'CC'] : [isDark ? '#334155' : '#F1F5F9', isDark ? '#334155' : '#F1F5F9']}
                    style={styles.catIcon}>
                    <Ionicons name={c.icon} size={20} color={selectedCategory === c.id ? '#FFF' : theme.sub} />
                  </LinearGradient>
                  <Text style={[styles.catLabel, { color: selectedCategory === c.id ? c.color : theme.sub }]}>{c.label}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            <Text style={[styles.sectionHeader, { color: theme.sub }]}>COMPLAINT DETAILS</Text>
            <View style={[styles.formCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
              <TextInput
                placeholder="Brief title / subject"
                placeholderTextColor={theme.sub}
                value={title}
                onChangeText={setTitle}
                style={[styles.titleInput, { color: theme.text, borderBottomColor: theme.border }]}
              />
              <TextInput
                placeholder="Describe your complaint in detail. Include dates, locations, and any relevant context..."
                placeholderTextColor={theme.sub}
                value={description}
                onChangeText={setDescription}
                multiline
                numberOfLines={5}
                style={[styles.descInput, { color: theme.text }]}
              />
              <TouchableOpacity style={[styles.attachRow, { borderTopColor: theme.border }]}
                onPress={() => Alert.alert('Attach File', 'Choose a photo or document to attach as evidence.')}>
                <Ionicons name="attach" size={18} color={theme.sub} />
                <Text style={[styles.attachText, { color: theme.sub }]}>Attach evidence (photo/document)</Text>
              </TouchableOpacity>
            </View>

            {/* Anonymous Toggle */}
            <View style={[styles.anonRow, { backgroundColor: theme.card, borderColor: theme.border }]}>
              <View style={styles.anonInfo}>
                <Ionicons name="person-remove" size={20} color={isAnonymous ? '#6366F1' : theme.sub} />
                <View>
                  <Text style={[styles.anonTitle, { color: theme.text }]}>Submit Anonymously</Text>
                  <Text style={[styles.anonSub, { color: theme.sub }]}>Your identity will not be revealed to authorities</Text>
                </View>
              </View>
              <Switch value={isAnonymous} onValueChange={setIsAnonymous}
                trackColor={{ false: '#E2E8F0', true: '#C7D2FE' }}
                thumbColor={isAnonymous ? '#6366F1' : '#94A3B8'} />
            </View>

            <TouchableOpacity style={[styles.submitBtn, submitting && { opacity: 0.7 }]}
              onPress={submitComplaint} disabled={submitting}>
              <LinearGradient colors={['#6366F1', '#8B5CF6']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
                style={styles.submitBtnInner}>
                {submitting ? (
                  <Text style={styles.submitBtnText}>Submitting...</Text>
                ) : (
                  <>
                    <Ionicons name={isOnline ? 'send' : 'save'} size={20} color="#FFF" />
                    <Text style={styles.submitBtnText}>{isOnline ? 'Submit Complaint' : 'Save for Later'}</Text>
                  </>
                )}
              </LinearGradient>
            </TouchableOpacity>
          </>
        )}

        {activeTab === 'track' && (
          <>
            {/* Stats */}
            <View style={styles.statsRow}>
              {[
                { label: 'Submitted', count: complaints.filter(c => c.status === 'submitted').length, color: '#F59E0B' },
                { label: 'In Review', count: complaints.filter(c => c.status === 'in-review').length, color: '#3B82F6' },
                { label: 'Resolved', count: complaints.filter(c => c.status === 'resolved').length, color: '#10B981' },
              ].map(s => (
                <View key={s.label} style={[styles.statBox, { backgroundColor: theme.card, borderColor: theme.border }]}>
                  <Text style={[styles.statNum, { color: s.color }]}>{s.count}</Text>
                  <Text style={[styles.statLabel, { color: theme.sub }]}>{s.label}</Text>
                </View>
              ))}
            </View>

            {complaints.map(c => {
              const st = STATUS_CONFIG[c.status] || STATUS_CONFIG.submitted;
              const cat = CATEGORIES.find(x => x.id === c.category);
              return (
                <TouchableOpacity key={c.id} style={[styles.complaintCard, { backgroundColor: theme.card, borderColor: theme.border }]}
                  onPress={() => setSelectedDetail(c)} activeOpacity={0.85}>
                  <View style={[styles.complaintIcon, { backgroundColor: (cat?.color || '#6366F1') + '20' }]}>
                    <Ionicons name={cat?.icon || 'help'} size={20} color={cat?.color || '#6366F1'} />
                  </View>
                  <View style={styles.complaintInfo}>
                    <Text style={[styles.complaintTitle, { color: theme.text }]}>{c.title}</Text>
                    <Text style={[styles.complaintDate, { color: theme.sub }]}>{c.date} · {cat?.label}</Text>
                    <View style={[styles.statusBadge, { backgroundColor: st.color + '20' }]}>
                      <Ionicons name={st.icon} size={12} color={st.color} />
                      <Text style={[styles.statusText, { color: st.color }]}>{st.label}</Text>
                    </View>
                    {c.response && (
                      <Text style={[styles.responsePreview, { color: theme.sub }]} numberOfLines={2}>
                        💬 {c.response}
                      </Text>
                    )}
                  </View>
                  <Ionicons name="chevron-forward" size={18} color={theme.sub} />
                </TouchableOpacity>
              );
            })}
          </>
        )}

        {activeTab === 'offline' && (
          <>
            {/* Offline Status */}
            <View style={[styles.offlineCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
              <LinearGradient colors={isOnline ? ['#10B981', '#059669'] : ['#EF4444', '#DC2626']} style={styles.offlineIcon}>
                <Ionicons name={isOnline ? 'wifi' : 'cloud-offline'} size={28} color="#FFF" />
              </LinearGradient>
              <View style={styles.offlineInfo}>
                <Text style={[styles.offlineStatus, { color: theme.text }]}>
                  {isOnline ? 'Online — Sync Active' : 'Offline Mode Active'}
                </Text>
                <Text style={[styles.offlineSub, { color: theme.sub }]}>
                  {isOnline ? 'All resources are being synced in real-time' : 'Access your locally saved documents below'}
                </Text>
              </View>
              <TouchableOpacity onPress={() => setIsOnline(!isOnline)} style={styles.toggleModeBtn}>
                <Text style={{ fontSize: 11, fontWeight: '900', color: '#6366F1' }}>
                  {isOnline ? 'Simulate Offline' : 'Go Online'}
                </Text>
              </TouchableOpacity>
            </View>

            <Text style={[styles.sectionHeader, { color: theme.sub }]}>LOCAL VAULT ({OFFLINE_VAULT.length} files)</Text>
            <Text style={[styles.vaultNote, { color: theme.sub }]}>
              These files are saved on your device and accessible without internet.
            </Text>

            {OFFLINE_VAULT.map(v => (
              <TouchableOpacity key={v.id} style={[styles.vaultCard, { backgroundColor: theme.card, borderColor: theme.border }]}
                onPress={() => Alert.alert(v.title, `This file is available offline.\nSize: ${v.size}\nCourse: ${v.course}`)}>
                <View style={[styles.vaultCardIcon, { backgroundColor: '#6366F1' + '20' }]}>
                  <Ionicons name={v.type === 'Smart Note' ? 'document-text' : 'document'} size={24} color="#6366F1" />
                </View>
                <View style={styles.vaultCardInfo}>
                  <Text style={[styles.vaultCardTitle, { color: theme.text }]}>{v.title}</Text>
                  <Text style={[styles.vaultCardMeta, { color: theme.sub }]}>{v.course} · {v.size} · {v.type}</Text>
                </View>
                <View style={styles.offlineCheckBadge}>
                  <Ionicons name="cloud-done" size={16} color="#10B981" />
                </View>
              </TouchableOpacity>
            ))}

            {/* Access Other Screens in Offline Mode */}
            <Text style={[styles.sectionHeader, { color: theme.sub, marginTop: 24 }]}>ACCESSIBLE OFFLINE</Text>
            {[
              { label: 'My Timetable', icon: 'calendar', screen: 'PersonalisedTimetable', desc: 'View your weekly schedule' },
              { label: 'Assignments', icon: 'document-text', screen: 'AssignmentDeadline', desc: 'Track deadlines and progress' },
              { label: 'My Attendance', icon: 'scan-circle', screen: 'SmartAttendance', desc: 'Review your attendance records' },
            ].map(item => (
              <TouchableOpacity key={item.label} style={[styles.offlineNavCard, { backgroundColor: theme.card, borderColor: theme.border }]}
                onPress={() => navigation.navigate(item.screen)}>
                <LinearGradient colors={['#6366F1', '#8B5CF6']} style={styles.offlineNavIcon}>
                  <Ionicons name={item.icon} size={20} color="#FFF" />
                </LinearGradient>
                <View style={styles.offlineNavInfo}>
                  <Text style={[styles.offlineNavLabel, { color: theme.text }]}>{item.label}</Text>
                  <Text style={[styles.offlineNavDesc, { color: theme.sub }]}>{item.desc}</Text>
                </View>
                <Ionicons name="chevron-forward" size={18} color={theme.sub} />
              </TouchableOpacity>
            ))}
          </>
        )}
        <View style={{ height: 40 }} />
      </Animated.ScrollView>

      {/* Complaint Detail Modal */}
      <Modal visible={!!selectedDetail} transparent animationType="slide" onRequestClose={() => setSelectedDetail(null)}>
        <View style={styles.modalOverlay}>
          {selectedDetail && (() => {
            const st = STATUS_CONFIG[selectedDetail.status] || STATUS_CONFIG.submitted;
            const cat = CATEGORIES.find(x => x.id === selectedDetail.category);
            return (
              <View style={[styles.detailSheet, { backgroundColor: theme.card }]}>
                <View style={styles.detailHandle} />
                <View style={[styles.statusBadge, { backgroundColor: st.color + '20', alignSelf: 'flex-start' }]}>
                  <Ionicons name={st.icon} size={14} color={st.color} />
                  <Text style={[styles.statusText, { color: st.color }]}>{st.label}</Text>
                </View>
                <Text style={[styles.detailTitle, { color: theme.text }]}>{selectedDetail.title}</Text>
                <Text style={[styles.detailCat, { color: cat?.color || '#6366F1' }]}>{cat?.label} · {selectedDetail.date}</Text>
                {selectedDetail.description && (
                  <Text style={[styles.detailDesc, { color: theme.sub }]}>{selectedDetail.description}</Text>
                )}
                {selectedDetail.response ? (
                  <View style={[styles.responseBox, { backgroundColor: isDark ? '#0F172A' : '#F0FDF4' }]}>
                    <Text style={[styles.responseLabel, { color: '#10B981' }]}>AUTHORITY RESPONSE</Text>
                    <Text style={[styles.responseText, { color: theme.text }]}>{selectedDetail.response}</Text>
                  </View>
                ) : (
                  <View style={[styles.pendingBox, { backgroundColor: isDark ? '#0F172A' : '#FFFBEB' }]}>
                    <Ionicons name="time" size={14} color="#F59E0B" />
                    <Text style={[styles.pendingText, { color: '#92400E' }]}>Awaiting response — usually within 3 working days</Text>
                  </View>
                )}
                <TouchableOpacity style={[styles.closeDetailBtn, { borderColor: theme.border }]}
                  onPress={() => setSelectedDetail(null)}>
                  <Text style={{ color: theme.sub, fontWeight: '700' }}>Close</Text>
                </TouchableOpacity>
              </View>
            );
          })()}
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
  statusDot: { width: 12, height: 12, borderRadius: 6 },
  tabBar: { flexDirection: 'row', borderBottomWidth: 1 },
  tabItem: { flex: 1, paddingVertical: 12, alignItems: 'center', gap: 4 },
  tabItemActive: { borderBottomWidth: 3, borderBottomColor: '#6366F1' },
  tabIconRow: { position: 'relative' },
  tabBadge: { position: 'absolute', top: -6, right: -10, backgroundColor: '#EF4444', width: 16, height: 16, borderRadius: 8, justifyContent: 'center', alignItems: 'center' },
  tabBadgeText: { fontSize: 9, fontWeight: '900', color: '#FFF' },
  tabLabel: { fontSize: 11, fontWeight: '700' },
  tabLabelActive: { fontWeight: '900' },
  scroll: { paddingBottom: 30 },
  offlineBanner: { flexDirection: 'row', alignItems: 'center', gap: 8, margin: 20, backgroundColor: '#FFFBEB', padding: 14, borderRadius: 14 },
  offlineBannerText: { flex: 1, fontSize: 13, color: '#92400E', fontWeight: '600' },
  sectionHeader: { fontSize: 11, fontWeight: '900', letterSpacing: 1, marginHorizontal: 20, marginBottom: 12, marginTop: 20 },
  catScroll: { marginBottom: 8 },
  catContent: { paddingHorizontal: 20, gap: 10 },
  catCard: { alignItems: 'center', padding: 12, borderRadius: 18, borderWidth: 1.5, borderColor: 'transparent', gap: 6, minWidth: 74 },
  catIcon: { width: 42, height: 42, borderRadius: 14, justifyContent: 'center', alignItems: 'center' },
  catLabel: { fontSize: 11, fontWeight: '700', textAlign: 'center' },
  formCard: { marginHorizontal: 20, borderRadius: 20, borderWidth: 1, overflow: 'hidden', marginBottom: 16 },
  titleInput: { paddingHorizontal: 16, paddingVertical: 14, fontSize: 16, fontWeight: '700', borderBottomWidth: 1 },
  descInput: { paddingHorizontal: 16, paddingVertical: 14, fontSize: 14, fontWeight: '600', minHeight: 120, textAlignVertical: 'top' },
  attachRow: { flexDirection: 'row', alignItems: 'center', gap: 10, padding: 14, borderTopWidth: 1 },
  attachText: { fontSize: 13, fontWeight: '600' },
  anonRow: { flexDirection: 'row', alignItems: 'center', marginHorizontal: 20, marginBottom: 20, borderRadius: 18, padding: 16, borderWidth: 1 },
  anonInfo: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 12 },
  anonTitle: { fontSize: 15, fontWeight: '800' },
  anonSub: { fontSize: 12, fontWeight: '600' },
  submitBtn: { marginHorizontal: 20, borderRadius: 22, overflow: 'hidden' },
  submitBtnInner: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10, paddingVertical: 18 },
  submitBtnText: { fontSize: 17, fontWeight: '900', color: '#FFF' },
  statsRow: { flexDirection: 'row', paddingHorizontal: 20, paddingTop: 20, gap: 10, marginBottom: 16 },
  statBox: { flex: 1, borderRadius: 16, padding: 14, alignItems: 'center', borderWidth: 1 },
  statNum: { fontSize: 26, fontWeight: '900' },
  statLabel: { fontSize: 11, fontWeight: '700', marginTop: 2 },
  complaintCard: { flexDirection: 'row', alignItems: 'center', marginHorizontal: 20, marginBottom: 12, borderRadius: 20, padding: 14, borderWidth: 1, gap: 12 },
  complaintIcon: { width: 46, height: 46, borderRadius: 14, justifyContent: 'center', alignItems: 'center' },
  complaintInfo: { flex: 1, gap: 4 },
  complaintTitle: { fontSize: 14, fontWeight: '800' },
  complaintDate: { fontSize: 12, fontWeight: '600' },
  statusBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, alignSelf: 'flex-start', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  statusText: { fontSize: 10, fontWeight: '900', letterSpacing: 0.5 },
  responsePreview: { fontSize: 12, fontWeight: '600', lineHeight: 18, marginTop: 4 },
  offlineCard: { flexDirection: 'row', alignItems: 'center', margin: 20, borderRadius: 20, padding: 16, borderWidth: 1, gap: 12 },
  offlineIcon: { width: 52, height: 52, borderRadius: 16, justifyContent: 'center', alignItems: 'center' },
  offlineInfo: { flex: 1, gap: 4 },
  offlineStatus: { fontSize: 15, fontWeight: '800' },
  offlineSub: { fontSize: 12, fontWeight: '600' },
  toggleModeBtn: { padding: 8 },
  vaultNote: { marginHorizontal: 20, marginBottom: 12, marginTop: -8, fontSize: 13, fontWeight: '600' },
  vaultCard: { flexDirection: 'row', alignItems: 'center', marginHorizontal: 20, marginBottom: 10, borderRadius: 18, padding: 14, borderWidth: 1, gap: 12 },
  vaultCardIcon: { width: 46, height: 46, borderRadius: 14, justifyContent: 'center', alignItems: 'center' },
  vaultCardInfo: { flex: 1 },
  vaultCardTitle: { fontSize: 14, fontWeight: '800' },
  vaultCardMeta: { fontSize: 12, fontWeight: '600', marginTop: 2 },
  offlineCheckBadge: { padding: 6 },
  offlineNavCard: { flexDirection: 'row', alignItems: 'center', marginHorizontal: 20, marginBottom: 10, borderRadius: 18, padding: 14, borderWidth: 1, gap: 12 },
  offlineNavIcon: { width: 42, height: 42, borderRadius: 13, justifyContent: 'center', alignItems: 'center' },
  offlineNavInfo: { flex: 1 },
  offlineNavLabel: { fontSize: 15, fontWeight: '800' },
  offlineNavDesc: { fontSize: 12, fontWeight: '600', marginTop: 2 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  detailSheet: { borderTopLeftRadius: 28, borderTopRightRadius: 28, padding: 24, gap: 12 },
  detailHandle: { width: 40, height: 4, borderRadius: 2, backgroundColor: '#94A3B8', alignSelf: 'center', marginBottom: 8 },
  detailTitle: { fontSize: 20, fontWeight: '900' },
  detailCat: { fontSize: 13, fontWeight: '800' },
  detailDesc: { fontSize: 14, lineHeight: 20 },
  responseBox: { padding: 14, borderRadius: 14, gap: 8 },
  responseLabel: { fontSize: 10, fontWeight: '900', letterSpacing: 1 },
  responseText: { fontSize: 14, fontWeight: '600', lineHeight: 20 },
  pendingBox: { flexDirection: 'row', alignItems: 'center', gap: 8, padding: 14, borderRadius: 14 },
  pendingText: { flex: 1, fontSize: 13, fontWeight: '600' },
  closeDetailBtn: { borderWidth: 1, borderRadius: 14, paddingVertical: 14, alignItems: 'center' },
});
