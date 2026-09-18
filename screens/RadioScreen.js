import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  Animated,
  StatusBar,
  Image,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../components/ThemeProvider';

const { width, height } = Dimensions.get('window');

const SHOWS = [
  { id: 's1', title: 'Morning Drive', host: 'Doreen Adom', time: 'LIVE', listeners: '1.2k', image: 'https://images.unsplash.com/photo-1590602847861-f357a9332bbc?w=400' },
  { id: 's2', title: 'Campus Politics 101', host: 'Felix Kwame', time: '2:00 PM', listeners: '450', image: 'https://images.unsplash.com/photo-1478737270239-2f02b77fc618?w=400' },
];

const PODCASTS = [
  { id: 'p1', title: 'Code & Coffee', eps: '12 episodes', category: 'Tech' },
  { id: 'p2', title: 'Student Struggles', eps: '8 episodes', category: 'Life' },
  { id: 'p3', title: 'Future Leaders', eps: '15 episodes', category: 'Career' },
];

export default function RadioScreen({ navigation }) {
  const { isDark } = useTheme();
  const [isPlaying, setIsPlaying] = useState(false);
  const [activeTab, setActiveTab] = useState('Radio');

  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (isPlaying) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, { toValue: 1.1, duration: 1000, useNativeDriver: true }),
          Animated.timing(pulseAnim, { toValue: 1, duration: 1000, useNativeDriver: true }),
        ])
      ).start();
    } else {
      pulseAnim.setValue(1);
    }
  }, [isPlaying]);

  return (
    <SafeAreaView style={[styles.container, isDark && styles.darkContainer]}>
      <StatusBar barStyle="light-content" />
      
      {/* Dynamic Header */}
      <LinearGradient colors={['#1F2937', '#111827']} style={styles.header}>
        <View style={styles.headerRow}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={24} color="#FFF" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>UniMedia Center</Text>
          <TouchableOpacity style={styles.headerAction}>
            <Ionicons name="options" size={24} color="#FFF" />
          </TouchableOpacity>
        </View>

        <View style={styles.nowPlayingCard}>
          <Text style={styles.liveBadge}>● LIVE STREAM</Text>
          <Animated.Image 
            source={{ uri: SHOWS[0].image }} 
            style={[styles.playImg, { transform: [{ scale: pulseAnim }] }]} 
          />
          <View style={styles.playInfo}>
             <Text style={styles.playTitle}>{SHOWS[0].title}</Text>
             <Text style={styles.playHost}>Hosted by {SHOWS[0].host}</Text>
             <View style={styles.listenersBox}>
                <Ionicons name="headset" size={14} color="#FFF" />
                <Text style={styles.listenersText}>{SHOWS[0].listeners} tuning in</Text>
             </View>
          </View>
          <TouchableOpacity style={styles.playBtn} onPress={() => setIsPlaying(!isPlaying)}>
             <Ionicons name={isPlaying ? 'pause' : 'play'} size={32} color="#FFF" />
          </TouchableOpacity>
        </View>
      </LinearGradient>

      <View style={styles.tabRow}>
        {['Radio', 'Podcasts', 'Videos'].map(tab => (
           <TouchableOpacity key={tab} style={[styles.tab, activeTab === tab && styles.tabActive]} onPress={() => setActiveTab(tab)}>
              <Text style={[styles.tabText, activeTab === tab && styles.tabTextActive, isDark && activeTab !== tab && { color: '#94A3B8' }]}>{tab}</Text>
           </TouchableOpacity>
        ))}
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollBody}>
        
        <Text style={[styles.sectionTitle, isDark && styles.darkText]}>Upcoming Shows</Text>
        <View style={styles.upcomingList}>
          {SHOWS.slice(1).map(show => (
            <TouchableOpacity key={show.id} style={[styles.showCard, isDark && styles.darkCard]}>
              <View style={styles.showTimeBox}>
                <Text style={styles.showTimeText}>{show.time}</Text>
              </View>
              <View style={styles.showInfo}>
                <Text style={[styles.showTitle, isDark && styles.darkText]}>{show.title}</Text>
                <Text style={styles.showHost}>By {show.host}</Text>
              </View>
              <Ionicons name="notifications-outline" size={22} color="#6366F1" />
            </TouchableOpacity>
          ))}
        </View>

        <Text style={[styles.sectionTitle, isDark && styles.darkText]}>Top Podcasts</Text>
        <View style={styles.podcastGrid}>
           {PODCASTS.map(pod => (
             <TouchableOpacity key={pod.id} style={[styles.podCard, isDark && styles.darkCard]}>
               <View style={styles.podThumbnail}>
                 <Ionicons name="mic" size={32} color="#FFF" />
               </View>
               <Text style={[styles.podTitle, isDark && styles.darkText]}>{pod.title}</Text>
               <Text style={styles.podEps}>{pod.eps} • {pod.category}</Text>
             </TouchableOpacity>
           ))}
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>

    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  darkContainer: { backgroundColor: '#0F172A' },
  darkCard: { backgroundColor: '#1E293B' },
  darkText: { color: '#FFF' },

  header: { padding: 25, paddingBottom: 40, borderBottomLeftRadius: 40, borderBottomRightRadius: 40 },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 30 },
  backBtn: { width: 44, height: 44, borderRadius: 15, backgroundColor: 'rgba(255,255,255,0.1)', justifyContent: 'center', alignItems: 'center' },
  headerTitle: { fontSize: 20, fontWeight: '900', color: '#FFF' },
  headerAction: { width: 44, height: 44, borderRadius: 15, backgroundColor: 'rgba(255,255,255,0.1)', justifyContent: 'center', alignItems: 'center' },

  nowPlayingCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.1)', padding: 20, borderRadius: 30, borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' },
  liveBadge: { position: 'absolute', top: -10, left: 20, backgroundColor: '#EF4444', color: '#FFF', fontSize: 10, fontWeight: '900', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 6 },
  playImg: { width: 60, height: 60, borderRadius: 15 },
  playInfo: { flex: 1, marginLeft: 15 },
  playTitle: { color: '#FFF', fontSize: 16, fontWeight: '900' },
  playHost: { color: 'rgba(255,255,255,0.7)', fontSize: 13, marginTop: 2 },
  listenersBox: { flexDirection: 'row', alignItems: 'center', gap: 5, marginTop: 5 },
  listenersText: { color: '#FFF', fontSize: 11, fontWeight: '700' },
  playBtn: { width: 56, height: 56, borderRadius: 28, backgroundColor: '#6366F1', justifyContent: 'center', alignItems: 'center', elevation: 5 },

  tabRow: { flexDirection: 'row', paddingHorizontal: 25, marginTop: 20, gap: 15 },
  tab: { paddingVertical: 10, borderBottomWidth: 3, borderBottomColor: 'transparent' },
  tabActive: { borderBottomColor: '#6366F1' },
  tabText: { fontSize: 15, fontWeight: '800', color: '#64748B' },
  tabTextActive: { color: '#6366F1' },

  scrollBody: { padding: 25 },
  sectionTitle: { fontSize: 18, fontWeight: '900', color: '#1E293B', marginBottom: 20 },
  upcomingList: { gap: 12, marginBottom: 30 },
  showCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFF', padding: 15, borderRadius: 22, elevation: 1 },
  showTimeBox: { backgroundColor: '#F1F5F9', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 12 },
  showTimeText: { fontSize: 12, fontWeight: '800', color: '#6366F1' },
  showInfo: { flex: 1, marginLeft: 15 },
  showTitle: { fontSize: 15, fontWeight: '800', color: '#1E293B' },
  showHost: { fontSize: 12, color: '#94A3B8', marginTop: 2 },

  podcastGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
  podCard: { width: (width - 65) / 2, backgroundColor: '#FFF', padding: 15, borderRadius: 25, elevation: 1, marginBottom: 15, alignItems: 'center' },
  podThumbnail: { width: 60, height: 60, borderRadius: 20, backgroundColor: '#6366F1', justifyContent: 'center', alignItems: 'center', marginBottom: 12 },
  podTitle: { fontSize: 14, fontWeight: '800', color: '#1E293B', textAlign: 'center' },
  podEps: { fontSize: 11, color: '#94A3B8', marginTop: 4 },
});
