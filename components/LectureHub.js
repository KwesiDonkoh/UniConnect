import React from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, Dimensions, ScrollView, Image } from 'react-native';
import { BlurView } from 'expo-blur';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

const { width, height } = Dimensions.get('window');

const LectureHub = ({ visible, onClose, isDark }) => {
  const recordings = [
    { id: 1, title: 'Introduction to Neural Networks', date: 'Oct 24, 2026', views: '1.2k', duration: '45:20', tutor: 'Dr. Arthur King', color: '#6366F1' },
    { id: 2, title: 'Advanced React Native Superapps', date: 'Oct 22, 2026', views: '850', duration: '58:15', tutor: 'Prof. Darko', color: '#10B981' },
    { id: 3, title: 'Algorithm Complexity Analysis', date: 'Oct 20, 2026', views: '2.1k', duration: '32:40', tutor: 'Dr. Sarah Osei', color: '#F59E0B' },
  ];

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <BlurView intensity={90} tint={isDark ? 'dark' : 'light'} style={StyleSheet.absoluteFill} />
        
        <View style={[styles.modalContent, isDark && styles.darkModal]}>
          <View style={styles.header}>
            <View>
              <Text style={[styles.title, isDark && styles.whiteText]}>Lecture Hub</Text>
              <Text style={styles.subtitle}>NEURAL VIDEO RECORDINGS</Text>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <Ionicons name="close" size={24} color={isDark ? '#FFF' : '#64748B'} />
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false}>
            {/* Featured Live Stream */}
            <TouchableOpacity style={styles.liveCard}>
               <Image 
                 source={{ uri: 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&q=80&w=1000' }} 
                 style={styles.liveThumb}
               />
               <View style={styles.liveOverlay}>
                  <View style={styles.liveBadge}>
                     <View style={styles.liveDot} />
                     <Text style={styles.liveText}>LIVE NOW</Text>
                  </View>
                  <Text style={styles.liveTitle}>Distributed Systems Lecture 12</Text>
                  <Text style={styles.liveAnalytics}>👁️ 452 Students Watching</Text>
               </View>
            </TouchableOpacity>

            <Text style={styles.sectionTitle}>PREVIOUS RECORDINGS</Text>
            
            {recordings.map((video) => (
              <TouchableOpacity key={video.id} style={[styles.videoCard, isDark && styles.darkCard]}>
                <View style={styles.videoInfo}>
                  <View style={[styles.playIcon, { backgroundColor: video.color + '20' }]}>
                    <Ionicons name="play" size={20} color={video.color} />
                  </View>
                  <View style={{ flex: 1, marginLeft: 15 }}>
                    <Text style={[styles.videoTitle, isDark && styles.whiteText]} numberOfLines={1}>{video.title}</Text>
                    <Text style={styles.videoMeta}>{video.tutor} • {video.date}</Text>
                  </View>
                  <View style={styles.durationBadge}>
                     <Text style={styles.durationText}>{video.duration}</Text>
                  </View>
                </View>
                <View style={styles.videoFooter}>
                   <View style={styles.footerStat}>
                      <Ionicons name="eye-outline" size={14} color="#94A3B8" />
                      <Text style={styles.statLabel}>{video.views}</Text>
                   </View>
                   <TouchableOpacity style={styles.downloadBtn}>
                      <Ionicons name="download-outline" size={18} color="#6366F1" />
                      <Text style={styles.downloadLabel}>OFFLINE CACHE</Text>
                   </TouchableOpacity>
                </View>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: { flex: 1 },
  modalContent: { 
    width: '100%', 
    height: '100%', 
    backgroundColor: '#FFFFFF', 
    padding: 25,
    paddingTop: 60
  },
  darkModal: { backgroundColor: '#0F172A' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 30 },
  title: { fontSize: 28, fontWeight: '900', color: '#1E293B' },
  subtitle: { fontSize: 10, fontWeight: '900', color: '#6366F1', letterSpacing: 2, marginTop: 4 },
  whiteText: { color: '#FFF' },
  closeBtn: { padding: 10, backgroundColor: '#F1F5F9', borderRadius: 25 },
  liveCard: { height: 200, borderRadius: 30, overflow: 'hidden', marginBottom: 30, elevation: 10 },
  liveThumb: { width: '100%', height: '100%' },
  liveOverlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.4)', padding: 20, justifyContent: 'flex-end' },
  liveBadge: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#EF4444', paddingHorizontal: 10, paddingVertical: 5, borderRadius: 8, alignSelf: 'flex-start', marginBottom: 10 },
  liveDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#FFF', marginRight: 6 },
  liveText: { color: '#FFF', fontSize: 10, fontWeight: '900' },
  liveTitle: { color: '#FFF', fontSize: 18, fontWeight: '900' },
  liveAnalytics: { color: 'rgba(255,255,255,0.8)', fontSize: 12, marginTop: 4 },
  sectionTitle: { fontSize: 14, fontWeight: '900', color: '#94A3B8', letterSpacing: 1, marginBottom: 20 },
  videoCard: { backgroundColor: '#F8FAFC', borderRadius: 24, padding: 15, marginBottom: 15 },
  darkCard: { backgroundColor: 'rgba(255,255,255,0.05)' },
  videoInfo: { flexDirection: 'row', alignItems: 'center' },
  playIcon: { width: 45, height: 45, borderRadius: 15, justifyContent: 'center', alignItems: 'center' },
  videoTitle: { fontSize: 15, fontWeight: '800', color: '#1E293B' },
  videoMeta: { fontSize: 11, color: '#64748B', marginTop: 3 },
  durationBadge: { backgroundColor: '#1E293B', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 },
  durationText: { color: '#FFF', fontSize: 10, fontWeight: '900' },
  videoFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 15, paddingTop: 15, borderTopWidth: 1, borderTopColor: 'rgba(0,0,0,0.05)' },
  footerStat: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  statLabel: { fontSize: 12, color: '#94A3B8', fontWeight: '700' },
  downloadBtn: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: '#EEF2FF', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 10 },
  downloadLabel: { fontSize: 10, fontWeight: '900', color: '#6366F1' },
});

export default LectureHub;
