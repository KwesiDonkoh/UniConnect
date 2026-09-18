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
  TextInput,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../components/ThemeProvider';

const { width } = Dimensions.get('window');

const BUILDINGS = [
  { id: '1', name: 'Main Auditorium', type: 'Academic', icon: 'musical-notes', color: '#6366F1', dist: '120m', desc: 'Large lecture hall, capacity 800+', floor: 'Ground Floor' },
  { id: '2', name: 'Science Block A', type: 'Academic', icon: 'flask', color: '#10B981', dist: '250m', desc: 'Physics, Chemistry, Biology labs', floor: 'Floors 1–3' },
  { id: '3', name: 'CS & Engineering Block', type: 'Academic', icon: 'laptop', color: '#8B5CF6', dist: '350m', desc: 'Computing labs, lecture rooms', floor: 'Floors 1–4' },
  { id: '4', name: 'University Library', type: 'Academic', icon: 'library', color: '#F59E0B', dist: '200m', desc: 'Main library, reading rooms, archives', floor: 'Floors 1–5' },
  { id: '5', name: 'Student Union Center', type: 'Social', icon: 'people', color: '#EC4899', dist: '180m', desc: 'SRC offices, food court, gym', floor: 'Ground–1' },
  { id: '6', name: 'Cafeteria & Canteen', type: 'Food', icon: 'fast-food', color: '#EF4444', dist: '90m', desc: 'Main dining hall, open 7am–9pm', floor: 'Ground Floor' },
  { id: '7', name: 'Chancellor Hall Hostel', type: 'Hostel', icon: 'home', color: '#0EA5E9', dist: '450m', desc: 'Male hostel block A–D, 400 rooms', floor: 'Floors 1–6' },
  { id: '8', name: 'Jubilee Hostel', type: 'Hostel', icon: 'home', color: '#6366F1', dist: '600m', desc: 'Female hostel, A–C blocks', floor: 'Floors 1–5' },
  { id: '9', name: 'University Health Center', type: 'Services', icon: 'medical', color: '#10B981', dist: '300m', desc: 'Medical clinic, pharmacy, counseling', floor: 'Ground Floor' },
  { id: '10', name: 'Shuttle Bus Terminal', type: 'Transport', icon: 'bus', color: '#A855F7', dist: '80m', desc: 'Main gate shuttle stop, 6am–8pm', floor: 'Main Gate' },
  { id: '11', name: 'Sports Complex', type: 'Recreation', icon: 'football', color: '#F97316', dist: '700m', desc: 'Football field, swimming pool, courts', floor: 'Open Ground' },
  { id: '12', name: 'Administration Block', type: 'Admin', icon: 'business', color: '#64748B', dist: '400m', desc: 'Registrar, Bursary, Vice-Chancellor', floor: 'Floors 1–3' },
];

const CATEGORIES = ['All', 'Academic', 'Food', 'Hostel', 'Services', 'Transport', 'Social', 'Admin', 'Recreation'];

const QUICK_LOCS = [
  { label: 'Current Class', icon: 'school', color: '#6366F1' },
  { label: 'Cafeteria', icon: 'fast-food', color: '#EF4444' },
  { label: 'Library', icon: 'library', color: '#F59E0B' },
  { label: 'Shuttle Stop', icon: 'bus', color: '#A855F7' },
];

export default function CampusNavigationScreen({ navigation }) {
  const { isDark } = useTheme();
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All');
  const [navigating, setNavigating] = useState(null);
  const [stepIndex, setStepIndex] = useState(0);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, { toValue: 1, duration: 600, useNativeDriver: true }).start();
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1.15, duration: 1000, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 1, duration: 1000, useNativeDriver: true }),
      ])
    ).start();
  }, []);

  const theme = {
    bg: isDark ? '#020617' : '#F8FAFC',
    card: isDark ? '#1E293B' : '#FFFFFF',
    text: isDark ? '#F1F5F9' : '#1E293B',
    sub: isDark ? '#94A3B8' : '#64748B',
    border: isDark ? '#334155' : '#E2E8F0',
    input: isDark ? '#0F172A' : '#F1F5F9',
  };

  const filtered = BUILDINGS.filter(b => {
    const matchSearch = b.name.toLowerCase().includes(search.toLowerCase()) ||
      b.type.toLowerCase().includes(search.toLowerCase());
    const matchCat = category === 'All' || b.type === category;
    return matchSearch && matchCat;
  });

  const STEPS = navigating ? [
    `📍 Start from your current location (GPS detected)`,
    `➡️ Head towards the main pathway (North direction)`,
    `🔵 Pass the Chancellor Hall entrance on your left`,
    `🏛️ ${navigating.name} is ${navigating.dist} ahead on your right`,
    `✅ You have arrived at ${navigating.name}!`,
  ] : [];

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.bg }]}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />

      {/* Header */}
      <LinearGradient colors={isDark ? ['#0C1445', '#020617'] : ['#3B82F6', '#1D4ED8']} style={styles.header}>
        <TouchableOpacity onPress={() => { if (navigating) setNavigating(null); else navigation.goBack(); }} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color="#FFF" />
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>{navigating ? 'Navigating...' : 'Campus Navigation'}</Text>
          <Text style={styles.headerSub}>{navigating ? navigating.name : 'Find any building on campus'}</Text>
        </View>
        <Animated.View style={{ transform: [{ scale: pulseAnim }] }}>
          <Ionicons name="location" size={24} color="#10B981" />
        </Animated.View>
      </LinearGradient>

      {navigating ? (
        // Navigation Mode
        <Animated.ScrollView style={{ opacity: fadeAnim }} contentContainerStyle={styles.scroll}>
          {/* Simulated Map */}
          <View style={[styles.mapBox, { backgroundColor: isDark ? '#0F172A' : '#EFF6FF' }]}>
            <LinearGradient colors={['#3B82F6', '#6366F1']} style={styles.mapOverlay} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
              {/* Simulated route lines */}
              <View style={styles.mapDot}>
                <Animated.View style={[styles.mapPulse, { transform: [{ scale: pulseAnim }] }]} />
                <Ionicons name="person" size={18} color="#FFF" />
              </View>
              <View style={styles.mapRoute} />
              <View style={[styles.mapDest, { backgroundColor: navigating.color }]}>
                <Ionicons name={navigating.icon} size={16} color="#FFF" />
              </View>
            </LinearGradient>
            <Text style={[styles.mapDist, { color: theme.text }]}>📍 {navigating.dist} away · ~{parseInt(navigating.dist) < 200 ? '2' : parseInt(navigating.dist) < 400 ? '5' : '8'} min walk</Text>
          </View>

          {/* Step-by-Step */}
          <Text style={[styles.sectionHeader, { color: theme.sub }]}>TURN-BY-TURN DIRECTIONS</Text>
          {STEPS.map((step, i) => (
            <TouchableOpacity key={i} style={[styles.stepCard, { backgroundColor: theme.card, borderColor: theme.border },
              i === stepIndex && { borderColor: '#3B82F6', borderWidth: 2 }]}
              onPress={() => setStepIndex(i)} activeOpacity={0.8}>
              <View style={[styles.stepNum, { backgroundColor: i <= stepIndex ? '#3B82F6' : (isDark ? '#334155' : '#F1F5F9') }]}>
                {i < stepIndex ? <Ionicons name="checkmark" size={14} color="#FFF" /> :
                  <Text style={[styles.stepNumText, { color: i === stepIndex ? '#FFF' : theme.sub }]}>{i + 1}</Text>}
              </View>
              <Text style={[styles.stepText, { color: i > stepIndex ? theme.sub : theme.text }]}>{step}</Text>
            </TouchableOpacity>
          ))}
          <TouchableOpacity style={styles.nextStepBtn} onPress={() => {
            if (stepIndex < STEPS.length - 1) setStepIndex(s => s + 1);
            else { setNavigating(null); Alert.alert('🎉 Arrived!', `You have arrived at ${navigating.name}.`); }
          }}>
            <LinearGradient colors={['#3B82F6', '#6366F1']} style={styles.nextStepInner}>
              <Text style={styles.nextStepText}>{stepIndex < STEPS.length - 1 ? 'Next Step' : 'Arrived!'}</Text>
              <Ionicons name={stepIndex < STEPS.length - 1 ? 'arrow-forward' : 'checkmark'} size={20} color="#FFF" />
            </LinearGradient>
          </TouchableOpacity>
          <View style={{ height: 40 }} />
        </Animated.ScrollView>
      ) : (
        <Animated.ScrollView style={{ opacity: fadeAnim }} showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scroll}>

          {/* Search */}
          <View style={[styles.searchBox, { backgroundColor: theme.input, borderColor: theme.border }]}>
            <Ionicons name="search" size={18} color={theme.sub} />
            <TextInput placeholder="Search buildings, halls, hostels..." placeholderTextColor={theme.sub}
              value={search} onChangeText={setSearch}
              style={[styles.searchInput, { color: theme.text }]} />
            {search.length > 0 && (
              <TouchableOpacity onPress={() => setSearch('')}>
                <Ionicons name="close-circle" size={18} color={theme.sub} />
              </TouchableOpacity>
            )}
          </View>

          {/* Quick Access */}
          <Text style={[styles.sectionHeader, { color: theme.sub }]}>QUICK ACCESS</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.quickScroll}
            contentContainerStyle={styles.quickContent}>
            {QUICK_LOCS.map(q => (
              <TouchableOpacity key={q.label}
                style={[styles.quickCard, { backgroundColor: theme.card, borderColor: theme.border }]}
                onPress={() => {
                  const match = BUILDINGS.find(b => b.name.toLowerCase().includes(q.label.toLowerCase().split(' ')[0]));
                  if (match) { setNavigating(match); setStepIndex(0); }
                  else Alert.alert('Navigate to', q.label);
                }}>
                <LinearGradient colors={[q.color, q.color + 'CC']} style={styles.quickIcon}>
                  <Ionicons name={q.icon} size={20} color="#FFF" />
                </LinearGradient>
                <Text style={[styles.quickLabel, { color: theme.text }]}>{q.label}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          {/* Category Filter */}
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.catScroll}
            contentContainerStyle={styles.catContent}>
            {CATEGORIES.map(c => (
              <TouchableOpacity key={c} style={[styles.catChip, category === c && styles.catChipActive]}
                onPress={() => setCategory(c)}>
                <Text style={[styles.catText, category === c && styles.catTextActive]}>{c}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          {/* Building List */}
          <Text style={[styles.sectionHeader, { color: theme.sub }]}>CAMPUS BUILDINGS ({filtered.length})</Text>
          {filtered.map(b => (
            <TouchableOpacity key={b.id} style={[styles.bCard, { backgroundColor: theme.card, borderColor: theme.border }]}
              onPress={() => Alert.alert(b.name, `${b.desc}\n\n📍 ${b.dist} from current location\n🏢 ${b.floor}`, [
                { text: 'Navigate', onPress: () => { setNavigating(b); setStepIndex(0); } },
                { text: 'Cancel', style: 'cancel' }
              ])}
              activeOpacity={0.85}>
              <View style={[styles.bIcon, { backgroundColor: b.color + '20' }]}>
                <Ionicons name={b.icon} size={24} color={b.color} />
              </View>
              <View style={styles.bInfo}>
                <Text style={[styles.bName, { color: theme.text }]}>{b.name}</Text>
                <Text style={[styles.bDesc, { color: theme.sub }]} numberOfLines={1}>{b.desc}</Text>
                <View style={styles.bMeta}>
                  <View style={[styles.bTypeBadge, { backgroundColor: b.color + '20' }]}>
                    <Text style={[styles.bTypeText, { color: b.color }]}>{b.type}</Text>
                  </View>
                  <Text style={[styles.bDist, { color: theme.sub }]}>{b.dist}</Text>
                </View>
              </View>
              <TouchableOpacity style={[styles.navBtn, { backgroundColor: b.color }]}
                onPress={() => { setNavigating(b); setStepIndex(0); }}>
                <Ionicons name="navigate" size={18} color="#FFF" />
              </TouchableOpacity>
            </TouchableOpacity>
          ))}
          <View style={{ height: 40 }} />
        </Animated.ScrollView>
      )}
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
  scroll: { paddingBottom: 30 },
  mapBox: { margin: 20, borderRadius: 20, overflow: 'hidden' },
  mapOverlay: { height: 200, justifyContent: 'center', alignItems: 'center', position: 'relative' },
  mapDot: { position: 'absolute', top: 50, left: 80, alignItems: 'center', justifyContent: 'center' },
  mapPulse: { position: 'absolute', width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.3)' },
  mapRoute: { width: 120, height: 4, backgroundColor: '#FFF', borderRadius: 2, opacity: 0.6 },
  mapDest: { position: 'absolute', bottom: 50, right: 80, width: 40, height: 40, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
  mapDist: { padding: 12, textAlign: 'center', fontWeight: '700', fontSize: 13 },
  sectionHeader: { fontSize: 11, fontWeight: '900', letterSpacing: 1, marginHorizontal: 20, marginBottom: 12, marginTop: 8 },
  stepCard: { flexDirection: 'row', alignItems: 'center', marginHorizontal: 20, marginBottom: 10, borderRadius: 16, padding: 14, borderWidth: 1, gap: 12 },
  stepNum: { width: 28, height: 28, borderRadius: 14, justifyContent: 'center', alignItems: 'center' },
  stepNumText: { fontSize: 13, fontWeight: '800' },
  stepText: { flex: 1, fontSize: 14, fontWeight: '600', lineHeight: 20 },
  nextStepBtn: { marginHorizontal: 20, marginTop: 16, borderRadius: 20, overflow: 'hidden' },
  nextStepInner: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10, paddingVertical: 16 },
  nextStepText: { fontSize: 16, fontWeight: '900', color: '#FFF' },
  searchBox: { flexDirection: 'row', alignItems: 'center', margin: 20, paddingHorizontal: 16, paddingVertical: 12, borderRadius: 16, borderWidth: 1, gap: 10 },
  searchInput: { flex: 1, fontSize: 15, fontWeight: '600' },
  quickScroll: { marginBottom: 16 },
  quickContent: { paddingHorizontal: 20, gap: 12 },
  quickCard: { alignItems: 'center', padding: 14, borderRadius: 18, borderWidth: 1, gap: 8, minWidth: 90 },
  quickIcon: { width: 44, height: 44, borderRadius: 14, justifyContent: 'center', alignItems: 'center' },
  quickLabel: { fontSize: 11, fontWeight: '700', textAlign: 'center' },
  catScroll: { marginBottom: 16 },
  catContent: { paddingHorizontal: 20, gap: 10 },
  catChip: { paddingHorizontal: 18, paddingVertical: 8, borderRadius: 20, backgroundColor: 'rgba(59,130,246,0.08)' },
  catChipActive: { backgroundColor: '#3B82F6' },
  catText: { fontSize: 13, fontWeight: '700', color: '#3B82F6' },
  catTextActive: { color: '#FFF' },
  bCard: { flexDirection: 'row', alignItems: 'center', marginHorizontal: 20, marginBottom: 12, borderRadius: 20, padding: 14, borderWidth: 1, gap: 12 },
  bIcon: { width: 54, height: 54, borderRadius: 16, justifyContent: 'center', alignItems: 'center' },
  bInfo: { flex: 1, gap: 4 },
  bName: { fontSize: 15, fontWeight: '800' },
  bDesc: { fontSize: 12, fontWeight: '600' },
  bMeta: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 4 },
  bTypeBadge: { paddingHorizontal: 10, paddingVertical: 3, borderRadius: 8 },
  bTypeText: { fontSize: 10, fontWeight: '900' },
  bDist: { fontSize: 11, fontWeight: '700' },
  navBtn: { width: 40, height: 40, borderRadius: 14, justifyContent: 'center', alignItems: 'center' },
});
