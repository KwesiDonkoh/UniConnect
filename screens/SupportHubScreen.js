import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, SafeAreaView, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { useTheme } from '../components/ThemeProvider';

const { width } = Dimensions.get('window');

export default function SupportHubScreen({ navigation }) {
  const { isDark } = useTheme();
  const [activeCategory, setActiveCategory] = useState('Academic');

  const content = {
    'Academic': [
      { id: 1, title: 'Find a Tutor', sub: 'Peer-to-peer learning support', icon: 'person-search' },
      { id: 2, title: 'Writing Lab', sub: 'Essay and thesis review', icon: 'create' },
      { id: 3, title: 'Library Guide', sub: 'Accessing digital journals', icon: 'library' },
    ],
    'Tech/WiFi': [
      { id: 4, title: 'WiFi Setup Guide', sub: 'Connect to Uni-Secure network', icon: 'wifi' },
      { id: 5, title: 'ID Card Reset', sub: 'Biometric and NFC issues', icon: 'card' },
      { id: 6, title: 'Software Downloads', sub: 'Office 365, MATLAB, etc.', icon: 'download' },
    ],
    'UniHelp': [
      { id: 7, title: 'General FAQs', sub: 'Answers to common questions', icon: 'help-circle' },
      { id: 8, title: 'Lost & Found', sub: 'Report or claim items', icon: 'search' },
      { id: 9, title: 'Campus Map (Full)', sub: 'Detailed floor plans', icon: 'map' },
    ],
    'Freshers': [
      { id: 10, title: 'Virtual Tours', sub: '360° exploring campus', icon: 'navigate' },
      { id: 11, title: 'Freshers Guide', sub: 'Survival tips for Level 100', icon: 'star' },
      { id: 12, title: 'Join a Club', sub: 'Societies and communities', icon: 'people' },
    ]
  };

  return (
    <SafeAreaView style={[styles.container, isDark && styles.darkContainer]}>
      <LinearGradient colors={isDark ? ['#0F172A', '#1E1B4B'] : ['#F0FDF4', '#FFFFFF']} style={styles.background}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color={isDark ? '#FFF' : '#1E293B'} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, isDark && styles.darkText]}>Support & Info</Text>
          <View style={{ width: 40 }} />
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.catBar}>
          {Object.keys(content).map((cat) => (
            <TouchableOpacity 
              key={cat} 
              style={[styles.catPill, activeCategory === cat && styles.activePill]}
              onPress={() => setActiveCategory(cat)}
            >
              <Text style={[styles.catText, activeCategory === cat && styles.activeCatText]}>{cat}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
          {content[activeCategory].map((item) => (
            <TouchableOpacity key={item.id} style={styles.infoCard}>
              <BlurView intensity={isDark ? 20 : 40} tint={isDark ? 'dark' : 'light'} style={styles.cardBlur}>
                <View style={styles.iconBox}>
                  <Ionicons name={item.icon} size={28} color="#4F46E5" />
                </View>
                <View style={styles.infoText}>
                  <Text style={[styles.infoTitle, isDark && styles.darkText]}>{item.title}</Text>
                  <Text style={styles.infoSub}>{item.sub}</Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color="#CBD5E1" />
              </BlurView>
            </TouchableOpacity>
          ))}

          {/* Quick FAQ Promo */}
          <LinearGradient colors={['#4F46E5', '#7C3AED']} style={styles.promoBox}>
            <Text style={styles.promoTitle}>Can't find what you need?</Text>
            <Text style={styles.promoSub}>Chat with UniBot, our 24/7 AI support assistant.</Text>
            <TouchableOpacity style={styles.promoBtn}>
              <Text style={styles.promoBtnText}>Start AI Chat</Text>
            </TouchableOpacity>
          </LinearGradient>
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
  backButton: { width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(79, 70, 229, 0.05)', alignItems: 'center', justifyContent: 'center' },
  headerTitle: { fontSize: 22, fontWeight: '800', color: '#1E293B' },
  catBar: { paddingHorizontal: 20, marginBottom: 15, maxHeight: 60 },
  catPill: { paddingHorizontal: 18, paddingVertical: 10, borderRadius: 20, backgroundColor: '#F1F5F9', marginRight: 10, height: 40 },
  activePill: { backgroundColor: '#4F46E5' },
  catText: { fontWeight: '700', color: '#64748B' },
  activeCatText: { color: '#FFF' },
  scrollContent: { padding: 20 },
  infoCard: { borderRadius: 24, overflow: 'hidden', marginBottom: 15, borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' },
  cardBlur: { flexDirection: 'row', alignItems: 'center', padding: 20 },
  iconBox: { width: 55, height: 55, borderRadius: 18, backgroundColor: 'rgba(79, 70, 229, 0.1)', alignItems: 'center', justifyContent: 'center', marginRight: 15 },
  infoText: { flex: 1 },
  infoTitle: { fontSize: 16, fontWeight: '800', color: '#1E293B' },
  infoSub: { fontSize: 13, color: '#64748B', marginTop: 4 },
  promoBox: { marginTop: 30, padding: 25, borderRadius: 24, alignItems: 'center' },
  promoTitle: { fontSize: 18, fontWeight: '800', color: '#FFF' },
  promoSub: { fontSize: 13, color: 'rgba(255,255,255,0.8)', marginTop: 8, textAlign: 'center' },
  promoBtn: { backgroundColor: '#FFF', paddingHorizontal: 25, paddingVertical: 12, borderRadius: 15, marginTop: 15 },
  promoBtnText: { color: '#4F46E5', fontWeight: '800' },
  darkText: { color: '#FFF' },
});
