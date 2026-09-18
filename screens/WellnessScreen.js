import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, SafeAreaView, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { useTheme } from '../components/ThemeProvider';

const { width } = Dimensions.get('window');

export default function WellnessScreen({ navigation }) {
  const { isDark } = useTheme();

  const wellbeingTips = [
    { id: 1, title: 'Mindful Breathing', icon: 'leaf', color: '#10B981', sub: '5 min exercise' },
    { id: 2, title: 'Sleep Hygiene', icon: 'moon', color: '#6366F1', sub: 'Better rest tips' },
    { id: 3, title: 'Hydration Track', icon: 'water', color: '#3B82F6', sub: '8 glasses today' },
    { id: 4, title: 'Study Breaks', icon: 'timer', color: '#F59E0B', sub: 'Pomodoro method' },
  ];

  return (
    <SafeAreaView style={[styles.container, isDark && styles.darkContainer]}>
      <LinearGradient colors={isDark ? ['#1E1B4B', '#0F172A'] : ['#EEF2FF', '#FFFFFF']} style={styles.background}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color={isDark ? '#FFF' : '#1E293B'} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, isDark && styles.darkText]}>Student Wellness</Text>
          <View style={{ width: 40 }} />
        </View>

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
          {/* Daily Mood */}
          <BlurView intensity={isDark ? 40 : 80} tint={isDark ? 'dark' : 'light'} style={styles.moodCard}>
            <Text style={[styles.moodTitle, isDark && styles.darkText]}>How are you feeling today?</Text>
            <View style={styles.moodRow}>
              {['😊', '😐', '😔', '🤯', '😴'].map((mood, i) => (
                <TouchableOpacity key={i} style={styles.moodItem}>
                  <Text style={styles.moodEmoji}>{mood}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </BlurView>

          {/* Quick Actions */}
          <Text style={[styles.sectionTitle, isDark && styles.darkText]}>Wellness Toolkit</Text>
          <View style={styles.grid}>
            {wellbeingTips.map((item) => (
              <TouchableOpacity key={item.id} style={styles.card}>
                <LinearGradient colors={[item.color + '20', item.color + '10']} style={styles.cardGradient}>
                  <View style={[styles.iconBox, { backgroundColor: item.color }]}>
                    <Ionicons name={item.icon} size={24} color="#FFF" />
                  </View>
                  <Text style={[styles.cardTitle, isDark && styles.darkText]}>{item.title}</Text>
                  <Text style={styles.cardSub}>{item.sub}</Text>
                </LinearGradient>
              </TouchableOpacity>
            ))}
          </View>

          {/* Counseling Section */}
          <TouchableOpacity style={styles.counselingCard}>
            <LinearGradient colors={['#EC4899', '#D946EF']} style={styles.counselingGradient}>
              <View style={styles.counselingInfo}>
                <Text style={styles.counselingTitle}>Talk to a Counselor</Text>
                <Text style={styles.counselingSubtitle}>Confidential support for your mental health.</Text>
              </View>
              <Ionicons name="chatbubbles" size={32} color="#FFF" />
            </LinearGradient>
          </TouchableOpacity>

          {/* Emergency Support */}
          <View style={styles.emergencyBox}>
            <Ionicons name="alert-circle" size={24} color="#EF4444" />
            <Text style={styles.emergencyText}>Immediate Help: Call Campus SOS 24/7</Text>
            <TouchableOpacity style={styles.callBtn}>
              <Text style={styles.callBtnText}>Call Now</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </LinearGradient>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  darkContainer: { backgroundColor: '#0F172A' },
  background: { flex: 1 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 20 },
  backButton: { width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(99, 102, 241, 0.1)', alignItems: 'center', justifyContent: 'center' },
  headerTitle: { fontSize: 22, fontWeight: '800', color: '#1E293B' },
  scrollContent: { padding: 20 },
  moodCard: { padding: 20, borderRadius: 24, overflow: 'hidden', marginBottom: 25, borderWidth: 1, borderColor: 'rgba(255,255,255,0.2)' },
  moodTitle: { fontSize: 18, fontWeight: '700', color: '#1E293B', marginBottom: 15, textAlign: 'center' },
  moodRow: { flexDirection: 'row', justifyContent: 'space-around' },
  moodEmoji: { fontSize: 32 },
  sectionTitle: { fontSize: 20, fontWeight: '800', color: '#1E293B', marginBottom: 15 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
  card: { width: (width - 60) / 2, height: 140, borderRadius: 20, overflow: 'hidden', marginBottom: 20 },
  cardGradient: { flex: 1, padding: 15, alignItems: 'center', justifyContent: 'center' },
  iconBox: { width: 50, height: 50, borderRadius: 15, alignItems: 'center', justifyContent: 'center', marginBottom: 10 },
  cardTitle: { fontSize: 15, fontWeight: '700', color: '#1E293B', textAlign: 'center' },
  cardSub: { fontSize: 12, color: '#64748B', marginTop: 4 },
  counselingCard: { borderRadius: 24, overflow: 'hidden', marginTop: 10, elevation: 5 },
  counselingGradient: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 25 },
  counselingInfo: { flex: 1 },
  counselingTitle: { fontSize: 22, fontWeight: '800', color: '#FFF' },
  counselingSubtitle: { fontSize: 14, color: 'rgba(255,255,255,0.8)', marginTop: 5 },
  emergencyBox: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FEF2F2', padding: 15, borderRadius: 15, marginTop: 30, borderWidth: 1, borderColor: '#FEE2E2' },
  emergencyText: { flex: 1, marginLeft: 10, fontSize: 13, color: '#991B1B', fontWeight: '600' },
  callBtn: { backgroundColor: '#EF4444', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 10 },
  callBtnText: { color: '#FFF', fontWeight: '800', fontSize: 12 },
  darkText: { color: '#FFF' },
});
