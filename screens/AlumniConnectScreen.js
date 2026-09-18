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

const ALUMNI = [
  {
    id: 'a1',
    name: 'Dr. Thomas Mensah',
    role: 'Fiber Optics Pioneer',
    company: 'Innovation Center',
    degree: 'Chemical Engineering, 1974',
    image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800',
    bio: 'Renowned world inventor with 7 patents in fiber optics in 6 years. Key contributor to the development of fiber optic technology.',
    mentoring: true,
  },
  {
    id: 'a2',
    name: 'Esther Afua Ocloo',
    role: 'Entrepreneur & Microfinance Leader',
    company: 'Sustainable Food Lab',
    degree: 'Home Economics, 1941',
    image: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=800',
    bio: 'Pioneer of micro-lending and successful business leader. Dedicated to empowering women in business across Ghana.',
    mentoring: false,
  },
  {
    id: 'a3',
    name: 'Kojo Oppong Nkrumah',
    role: 'Public Servant & Lawyer',
    company: 'Government Office',
    degree: 'B.A. Commerce, 2005',
    image: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=800',
    bio: 'Former broadcaster and current policy maker. Passionate about governance and legal frameworks in emerging markets.',
    mentoring: true,
  },
];

export default function AlumniConnectScreen({ navigation }) {
  const { isDark } = useTheme();
  const [activeTab, setActiveTab] = useState('Featured');
  const [connectedAlumni, setConnectedAlumni] = useState(new Set());

  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, { toValue: 1, duration: 700, useNativeDriver: true }).start();
  }, []);

  const handleConnect = (name) => {
    setConnectedAlumni(prev => {
      const next = new Set(prev);
      next.add(name);
      return next;
    });
    Alert.alert('Connection Requested', `A request has been sent to ${name}. You will be notified when they accept.`);
  };

  return (
    <SafeAreaView style={[styles.container, isDark && styles.darkContainer]}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color={isDark ? '#FFFFFF' : '#1E293B'} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, isDark && styles.darkText]}>Alumni Connect</Text>
        <TouchableOpacity style={styles.searchBtn}>
          <Ionicons name="search-outline" size={24} color={isDark ? '#FFFFFF' : '#1E293B'} />
        </TouchableOpacity>
      </View>

      <Animated.View style={{ flex: 1, opacity: fadeAnim }}>
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollBody}>
          
          <View style={[styles.networkBanner, isDark && styles.darkCard]}>
            <LinearGradient colors={['#6366F1', '#8B5CF6']} style={styles.bannerGrad}>
              <View style={styles.bannerInfo}>
                <Text style={styles.bannerTitle}>Join the KNUST Network</Text>
                <Text style={styles.bannerSub}>Connect with 50,000+ alumni globally.</Text>
                <TouchableOpacity style={styles.joinBtn}>
                  <Text style={styles.joinBtnText}>Join Now</Text>
                </TouchableOpacity>
              </View>
              <Image source={{ uri: 'https://images.unsplash.com/photo-1521737711867-e3b97375f902?w=200' }} style={styles.bannerImg} />
            </LinearGradient>
          </View>

          <View style={styles.tabRow}>
            {['Featured', 'Mentors', 'Global'].map(tab => (
              <TouchableOpacity
                key={tab}
                style={[styles.tab, activeTab === tab && styles.activeTab]}
                onPress={() => setActiveTab(tab)}
              >
                <Text style={[styles.tabText, activeTab === tab && styles.activeTabText]}>{tab}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <View style={styles.alumniList}>
            {ALUMNI.map(alum => (
              <View key={alum.id} style={[styles.alumCard, isDark && styles.darkCard]}>
                <View style={styles.alumHeader}>
                  <Image source={{ uri: alum.image }} style={styles.alumImg} />
                  <View style={styles.alumInfo}>
                    <View style={styles.nameRow}>
                      <Text style={[styles.alumName, isDark && styles.darkText]}>{alum.name}</Text>
                      {alum.mentoring && (
                        <View style={styles.mentorBadge}>
                          <Text style={styles.mentorText}>MENTOR</Text>
                        </View>
                      )}
                    </View>
                    <Text style={styles.alumRole}>{alum.role}</Text>
                    <Text style={styles.alumDegree}>{alum.degree}</Text>
                  </View>
                </View>
                <Text style={[styles.alumBio, isDark && styles.darkSubText]} numberOfLines={3}>{alum.bio}</Text>
                <View style={styles.alumFooter}>
                  <View style={styles.alumCompany}>
                    <Ionicons name="business-outline" size={14} color="#94A3B8" />
                    <Text style={styles.companyText}>{alum.company}</Text>
                  </View>
                  <TouchableOpacity
                    style={[styles.connectBtn, connectedAlumni.has(alum.name) && styles.connectedBtn]}
                    onPress={() => handleConnect(alum.name)}
                    disabled={connectedAlumni.has(alum.name)}
                  >
                    <Text style={[styles.connectBtnText, connectedAlumni.has(alum.name) && styles.connectedBtnText]}>
                      {connectedAlumni.has(alum.name) ? 'Request Sent ✓' : 'Connect'}
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))}
          </View>

          <View style={{ height: 100 }} />
        </ScrollView>
      </Animated.View>

    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  darkContainer: { backgroundColor: '#0F172A' },
  darkCard: { backgroundColor: '#1E293B' },
  darkText: { color: '#FFFFFF' },
  darkSubText: { color: '#94A3B8' },

  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20 },
  backBtn: { width: 44, height: 44, borderRadius: 15, backgroundColor: '#F1F5F9', justifyContent: 'center', alignItems: 'center' },
  headerTitle: { fontSize: 20, fontWeight: '900', color: '#1E293B' },
  searchBtn: { width: 44, height: 44, borderRadius: 15, backgroundColor: '#F1F5F9', justifyContent: 'center', alignItems: 'center' },

  scrollBody: { padding: 20 },
  networkBanner: { height: 150, borderRadius: 25, overflow: 'hidden', marginBottom: 25 },
  bannerGrad: { flex: 1, flexDirection: 'row', padding: 20, alignItems: 'center' },
  bannerInfo: { flex: 1 },
  bannerTitle: { fontSize: 18, fontWeight: '900', color: '#FFFFFF' },
  bannerSub: { fontSize: 11, color: 'rgba(255,255,255,0.8)', marginTop: 4, marginBottom: 15 },
  joinBtn: { backgroundColor: '#FFFFFF', paddingHorizontal: 15, paddingVertical: 8, borderRadius: 10, alignSelf: 'flex-start' },
  joinBtnText: { color: '#6366F1', fontWeight: '800', fontSize: 12 },
  bannerImg: { width: 100, height: 100, borderRadius: 50, opacity: 0.8 },

  tabRow: { flexDirection: 'row', gap: 10, marginBottom: 25 },
  tab: { paddingHorizontal: 20, paddingVertical: 10, borderRadius: 12, backgroundColor: '#F1F5F9' },
  activeTab: { backgroundColor: '#1E293B' },
  tabText: { fontSize: 14, fontWeight: '700', color: '#64748B' },
  activeTabText: { color: '#FFFFFF' },

  alumniList: { gap: 15 },
  alumCard: { backgroundColor: '#FFFFFF', padding: 20, borderRadius: 25, elevation: 2 },
  alumHeader: { flexDirection: 'row', gap: 15, marginBottom: 15 },
  alumImg: { width: 60, height: 60, borderRadius: 20 },
  alumInfo: { flex: 1 },
  nameRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  alumName: { fontSize: 16, fontWeight: '800', color: '#1E293B' },
  mentorBadge: { backgroundColor: '#10B98120', paddingHorizontal: 6, paddingVertical: 3, borderRadius: 6 },
  mentorText: { fontSize: 8, fontWeight: '900', color: '#10B981' },
  alumRole: { fontSize: 13, color: '#6366F1', fontWeight: '700', marginTop: 2 },
  alumDegree: { fontSize: 11, color: '#94A3B8', marginTop: 2 },
  alumBio: { fontSize: 13, color: '#64748B', lineHeight: 18, marginBottom: 15 },
  alumFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderTopWidth: 1, borderTopColor: '#F1F5F9', paddingTop: 15 },
  alumCompany: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  companyText: { fontSize: 12, color: '#94A3B8', fontWeight: '600' },
  connectBtn: { paddingHorizontal: 15, paddingVertical: 9, borderRadius: 12, backgroundColor: '#6366F1' },
  connectedBtn: { backgroundColor: '#F1F5F9' },
  connectBtnText: { color: '#FFFFFF', fontSize: 12, fontWeight: '800' },
  connectedBtnText: { color: '#10B981' },
});
