import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, SafeAreaView, Dimensions, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { useTheme } from '../components/ThemeProvider';

const { width } = Dimensions.get('window');

export default function CampusLifeScreen({ navigation }) {
  const { isDark } = useTheme();
  const [activeTab, setActiveTab] = useState('Events');

  const events = [
    { id: 1, title: 'Tech Carnival 2024', date: 'June 15', loc: 'Great Hall', image: 'https://images.unsplash.com/photo-1540575861501-7ce05b4d1ef9?w=500' },
    { id: 2, title: 'Annual SRC Debate', date: 'June 20', loc: 'Auditorium 1', image: 'https://images.unsplash.com/photo-1475721027785-f74eccf877e2?w=500' },
  ];

  const sports = [
    { id: 3, title: 'Inter-Hall Football Finals', date: 'June 18', loc: 'Paustian Stadium', image: 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=500' },
    { id: 4, title: 'Grand Athletics Day', date: 'June 25', loc: 'Sports Complex', image: 'https://images.unsplash.com/photo-1461896756670-f06b9c6f3ad8?w=500' },
  ];

  const data = activeTab === 'Events' ? events : sports;

  return (
    <SafeAreaView style={[styles.container, isDark && styles.darkContainer]}>
      <LinearGradient colors={isDark ? ['#0F172A', '#1E1B4B'] : ['#FAF5FF', '#FFFFFF']} style={styles.background}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color={isDark ? '#FFF' : '#1E293B'} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, isDark && styles.darkText]}>Campus Life</Text>
          <TouchableOpacity style={styles.calendarBtn}>
             <Ionicons name="calendar" size={20} color="#9333EA" />
          </TouchableOpacity>
        </View>

        <View style={styles.tabContainer}>
          {['Events', 'Sports'].map(tab => (
            <TouchableOpacity 
              key={tab} 
              style={[styles.tab, activeTab === tab && styles.activeTab]}
              onPress={() => setActiveTab(tab)}
            >
              <Text style={[styles.tabText, activeTab === tab && styles.activeTabText]}>{tab}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
          <Text style={[styles.sectionTitle, isDark && styles.darkText]}>Upcoming {activeTab}</Text>
          {data.map((item) => (
            <TouchableOpacity key={item.id} style={styles.eventCard}>
              <Image source={{ uri: item.image }} style={styles.eventImage} />
              <BlurView intensity={20} tint="dark" style={styles.eventOverlay}>
                <View style={styles.dateBadge}>
                  <Text style={styles.dateText}>{item.date.split(' ')[0]}</Text>
                  <Text style={styles.dayText}>{item.date.split(' ')[1]}</Text>
                </View>
                <View style={styles.eventInfo}>
                   <Text style={styles.eventTitle}>{item.title}</Text>
                   <View style={styles.locRow}>
                      <Ionicons name="location" size={14} color="#FFF" />
                      <Text style={styles.locText}>{item.loc}</Text>
                   </View>
                </View>
                <TouchableOpacity style={styles.ticketBtn}>
                   <Ionicons name="ticket" size={20} color="#FFF" />
                </TouchableOpacity>
              </BlurView>
            </TouchableOpacity>
          ))}

          {/* Social Wall Promo */}
          <BlurView intensity={isDark ? 30 : 50} tint={isDark ? 'dark' : 'light'} style={styles.socialCard}>
            <View style={styles.socialHeader}>
              <Ionicons name="logo-instagram" size={30} color="#E1306C" />
              <Text style={[styles.socialTitle, isDark && styles.darkText]}>UniConnect Social Wall</Text>
            </View>
            <Text style={styles.socialSub}>See what's happening around campus in real-time. Share your moments!</Text>
            <TouchableOpacity style={styles.joinSocialBtn}>
              <Text style={styles.joinSocialText}>Join Social Wall</Text>
            </TouchableOpacity>
          </BlurView>
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
  backButton: { width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(147, 51, 234, 0.05)', alignItems: 'center', justifyContent: 'center' },
  headerTitle: { fontSize: 22, fontWeight: '800', color: '#1E293B' },
  calendarBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(147, 51, 234, 0.1)', alignItems: 'center', justifyContent: 'center' },
  tabContainer: { flexDirection: 'row', paddingHorizontal: 20, marginBottom: 20 },
  tab: { flex: 1, paddingVertical: 12, alignItems: 'center', borderBottomWidth: 3, borderBottomColor: 'transparent' },
  activeTab: { borderBottomColor: '#9333EA' },
  tabText: { fontSize: 16, fontWeight: '700', color: '#64748B' },
  activeTabText: { color: '#9333EA' },
  scrollContent: { padding: 20 },
  sectionTitle: { fontSize: 18, fontWeight: '800', color: '#1E293B', marginBottom: 15 },
  eventCard: { height: 220, borderRadius: 30, overflow: 'hidden', marginBottom: 20, elevation: 10 },
  eventImage: { ...StyleSheet.absoluteFillObject },
  eventOverlay: { position: 'absolute', bottom: 15, left: 15, right: 15, height: 80, borderRadius: 20, padding: 15, flexDirection: 'row', alignItems: 'center' },
  dateBadge: { backgroundColor: '#FFF', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 15, alignItems: 'center', marginRight: 15 },
  dateText: { fontSize: 12, fontWeight: '700', color: '#666' },
  dayText: { fontSize: 18, fontWeight: '900', color: '#9333EA' },
  eventInfo: { flex: 1 },
  eventTitle: { fontSize: 16, fontWeight: '800', color: '#FFF' },
  locRow: { flexDirection: 'row', alignItems: 'center', marginTop: 4 },
  locText: { color: 'rgba(255,255,255,0.8)', fontSize: 12, marginLeft: 5 },
  ticketBtn: { width: 45, height: 45, borderRadius: 15, backgroundColor: 'rgba(147, 51, 234, 0.8)', alignItems: 'center', justifyContent: 'center' },
  socialCard: { padding: 25, borderRadius: 30, overflow: 'hidden', marginTop: 10, marginBottom: 40 },
  socialHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  socialTitle: { fontSize: 18, fontWeight: '800', marginLeft: 15, color: '#1E293B' },
  socialSub: { fontSize: 13, color: '#64748B', lineHeight: 18 },
  joinSocialBtn: { backgroundColor: '#9333EA', paddingVertical: 12, borderRadius: 15, alignItems: 'center', marginTop: 20 },
  joinSocialText: { color: '#FFF', fontWeight: '800' },
  darkText: { color: '#FFF' },
});
