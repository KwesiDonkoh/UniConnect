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
  TextInput,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../components/ThemeProvider';

const { width, height } = Dimensions.get('window');

const HOSTEL_STATS = [
  { label: 'Laundry', value: '2 available', icon: 'shirt', color: '#10B981' },
  { label: 'Water', value: 'Normal', icon: 'water', color: '#3B82F6' },
  { label: 'WiFi', value: 'Excellent', icon: 'wifi', color: '#6366F1' },
];

const ANNOUNCEMENTS = [
  { id: 'a1', title: 'Generator Maintenance', time: '1h ago', type: 'System' },
  { id: 'a2', title: 'Hostel Week starts Monday!', time: '4h ago', type: 'Social' },
];

export default function HostelScreen({ navigation }) {
  const { isDark } = useTheme();
  const [activeTab, setActiveTab] = useState('Overview');
  const [maintenanceMsg, setMaintenanceMsg] = useState('');

  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, { toValue: 1, duration: 600, useNativeDriver: true }).start();
  }, []);

  const handleMaintenance = () => {
    if (!maintenanceMsg) return;
    Alert.alert('Request Sent', 'Hostel maintenance has been notified. Expect a technician within 24 hours.');
    setMaintenanceMsg('');
  };

  return (
    <SafeAreaView style={[styles.container, isDark && styles.darkContainer]}>
      <StatusBar barStyle="light-content" />
      
      {/* Hero Header */}
      <LinearGradient colors={['#1F2937', '#111827']} style={styles.header}>
        <View style={styles.headerRow}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={24} color="#FFF" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Unity Hall Hub</Text>
          <TouchableOpacity style={styles.headerAction}>
            <Ionicons name="notifications" size={24} color="#FFF" />
          </TouchableOpacity>
        </View>

        <View style={styles.roomInfo}>
          <View>
            <Text style={styles.roomLabel}>Current Room</Text>
            <Text style={styles.roomValue}>Room 302, Floor 3</Text>
          </View>
          <View style={styles.digitTag}>
            <Text style={styles.digitText}>KNUST</Text>
          </View>
        </View>

        <View style={styles.statsRow}>
          {HOSTEL_STATS.map((stat, i) => (
            <View key={i} style={styles.statItem}>
              <View style={[styles.statIcon, { backgroundColor: stat.color + '20' }]}>
                <Ionicons name={stat.icon} size={18} color={stat.color} />
              </View>
              <Text style={styles.statLabel}>{stat.label}</Text>
              <Text style={styles.statValue}>{stat.value}</Text>
            </View>
          ))}
        </View>
      </LinearGradient>

      <Animated.View style={{ flex: 1, opacity: fadeAnim }}>
        <View style={styles.tabBar}>
          {['Overview', 'Maintenance', 'Social'].map(tab => (
            <TouchableOpacity 
              key={tab} 
              style={[styles.tab, activeTab === tab && styles.tabActive]}
              onPress={() => setActiveTab(tab)}
            >
              <Text style={[styles.tabText, activeTab === tab && styles.tabTextActive, isDark && activeTab !== tab && { color: '#94A3B8' }]}>{tab}</Text>
              {activeTab === tab && <View style={styles.tabLine} />}
            </TouchableOpacity>
          ))}
        </View>

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollBody}>
          
          {activeTab === 'Overview' && (
            <>
              <Text style={[styles.sectionTitle, isDark && styles.darkText]}>Recent Announcements</Text>
              {ANNOUNCEMENTS.map(item => (
                <View key={item.id} style={[styles.annCard, isDark && styles.darkCard]}>
                  <View style={styles.annIcon}>
                    <Ionicons name={item.type === 'System' ? 'hammer' : 'megaphone'} size={20} color="#6366F1" />
                  </View>
                  <View style={styles.annInfo}>
                    <Text style={[styles.annTitle, isDark && styles.darkText]}>{item.title}</Text>
                    <Text style={styles.annTime}>{item.time} • {item.type}</Text>
                  </View>
                  <Ionicons name="chevron-forward" size={18} color="#CBD5E1" />
                </View>
              ))}

              <View style={[styles.bookingBanner, isDark && styles.darkCard]}>
                <LinearGradient colors={['#A855F7', '#7C3AED']} style={styles.bookGrad}>
                  <View style={styles.bookInfo}>
                    <Text style={styles.bookTitle}>Room Swapping 2024</Text>
                    <Text style={styles.bookSub}>Applications for next semester swaps now open.</Text>
                    <TouchableOpacity style={styles.bookBtn}>
                      <Text style={styles.bookBtnText}>Learn More</Text>
                    </TouchableOpacity>
                  </View>
                  <Ionicons name="swap-horizontal" size={60} color="rgba(255,255,255,0.2)" />
                </LinearGradient>
              </View>
            </>
          )}

          {activeTab === 'Maintenance' && (
            <View style={[styles.formCard, isDark && styles.darkCard]}>
              <Text style={[styles.formTitle, isDark && styles.darkText]}>Request Maintenance</Text>
              <Text style={styles.formSub}>Reporting plumbing, electrical, or furniture issues.</Text>
              
              <View style={styles.inputBox}>
                <Text style={styles.inputLabel}>Issue Category</Text>
                <TouchableOpacity style={styles.pickerBtn}>
                  <Text style={styles.pickerText}>Plumbing (Sink/Toilet)</Text>
                  <Ionicons name="chevron-down" size={20} color="#94A3B8" />
                </TouchableOpacity>
              </View>

              <View style={styles.inputBox}>
                <Text style={styles.inputLabel}>Description</Text>
                <TextInput
                  style={[styles.textArea, isDark && styles.darkInput]}
                  placeholder="Describe the issue in detail..."
                  placeholderTextColor="#94A3B8"
                  multiline
                  numberOfLines={4}
                  value={maintenanceMsg}
                  onChangeText={setMaintenanceMsg}
                />
              </View>

              <TouchableOpacity style={styles.submitBtn} onPress={handleMaintenance}>
                <LinearGradient colors={['#6366F1', '#4F46E5']} style={styles.submitGrad}>
                  <Text style={styles.submitText}>Submit Request</Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          )}

          {activeTab === 'Social' && (
            <View style={styles.emptySocial}>
              <Ionicons name="chatbubbles-outline" size={64} color="#CBD5E1" />
              <Text style={styles.emptyText}>Social wall features coming in the next update!</Text>
            </View>
          )}

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
  darkText: { color: '#FFF' },
  darkInput: { backgroundColor: '#0F172A', color: '#FFF', borderColor: '#334155' },

  header: { padding: 25, paddingBottom: 40, borderBottomLeftRadius: 40, borderBottomRightRadius: 40 },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 30 },
  backBtn: { width: 44, height: 44, borderRadius: 15, backgroundColor: 'rgba(255,255,255,0.1)', justifyContent: 'center', alignItems: 'center' },
  headerTitle: { fontSize: 20, fontWeight: '900', color: '#FFF' },
  headerAction: { width: 44, height: 44, borderRadius: 15, backgroundColor: 'rgba(255,255,255,0.1)', justifyContent: 'center', alignItems: 'center' },
  roomInfo: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 35 },
  roomLabel: { fontSize: 13, color: 'rgba(255,255,255,0.6)', textTransform: 'uppercase', letterSpacing: 1 },
  roomValue: { fontSize: 24, fontWeight: '900', color: '#FFF', marginTop: 4 },
  digitTag: { backgroundColor: '#FCD34D', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 10 },
  digitText: { fontSize: 12, fontWeight: '900', color: '#1E2937' },
  statsRow: { flexDirection: 'row', justifyContent: 'space-between' },
  statItem: { width: (width - 80) / 3, alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.05)', padding: 15, borderRadius: 25 },
  statIcon: { width: 36, height: 36, borderRadius: 12, justifyContent: 'center', alignItems: 'center', marginBottom: 10 },
  statLabel: { fontSize: 10, color: 'rgba(255,255,255,0.5)', fontWeight: '700' },
  statValue: { fontSize: 12, color: '#FFF', fontWeight: '800', marginTop: 2 },

  tabBar: { flexDirection: 'row', paddingHorizontal: 25, marginTop: 15, borderBottomWidth: 1, borderBottomColor: '#F1F5F9' },
  tab: { marginRight: 25, paddingVertical: 15, alignItems: 'center' },
  tabActive: {},
  tabText: { fontSize: 15, fontWeight: '700', color: '#64748B' },
  tabTextActive: { color: '#6366F1' },
  tabLine: { position: 'absolute', bottom: 0, width: '100%', height: 3, backgroundColor: '#6366F1', borderTopLeftRadius: 3, borderTopRightRadius: 3 },

  scrollBody: { padding: 25 },
  sectionTitle: { fontSize: 18, fontWeight: '900', color: '#1E293B', marginBottom: 15 },
  annCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFF', padding: 18, borderRadius: 22, elevation: 2, marginBottom: 15 },
  annIcon: { width: 44, height: 44, borderRadius: 15, backgroundColor: '#F1F5F9', justifyContent: 'center', alignItems: 'center' },
  annInfo: { flex: 1, marginLeft: 15 },
  annTitle: { fontSize: 15, fontWeight: '800', color: '#1E293B' },
  annTime: { fontSize: 12, color: '#94A3B8', marginTop: 4 },

  bookingBanner: { marginTop: 10, borderRadius: 25, overflow: 'hidden', elevation: 5 },
  bookGrad: { padding: 25, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  bookInfo: { flex: 1 },
  bookTitle: { fontSize: 18, fontWeight: '900', color: '#FFF' },
  bookSub: { fontSize: 12, color: 'rgba(255,255,255,0.8)', marginTop: 8, marginBottom: 15 },
  bookBtn: { backgroundColor: '#FFF', paddingHorizontal: 15, paddingVertical: 10, borderRadius: 12, alignSelf: 'flex-start' },
  bookBtnText: { color: '#7C3AED', fontWeight: '900', fontSize: 13 },

  formCard: { backgroundColor: '#FFF', padding: 25, borderRadius: 25, elevation: 3 },
  formTitle: { fontSize: 18, fontWeight: '900', color: '#1E293B' },
  formSub: { fontSize: 13, color: '#94A3B8', marginTop: 5, marginBottom: 25 },
  inputBox: { marginBottom: 20 },
  inputLabel: { fontSize: 14, fontWeight: '700', color: '#64748B', marginBottom: 10 },
  pickerBtn: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 15, backgroundColor: '#F8FAFC', borderRadius: 15, borderWidth: 1, borderColor: '#E2E8F0' },
  pickerText: { fontSize: 14, color: '#1E293B', fontWeight: '600' },
  textArea: { backgroundColor: '#F8FAFC', padding: 15, borderRadius: 15, borderWidth: 1, borderColor: '#E2E8F0', height: 120, textAlignVertical: 'top' },
  submitBtn: { borderRadius: 18, overflow: 'hidden', marginTop: 10 },
  submitGrad: { padding: 18, alignItems: 'center' },
  submitText: { color: '#FFF', fontSize: 16, fontWeight: '900' },

  emptySocial: { alignItems: 'center', marginTop: 80 },
  emptyText: { fontSize: 14, color: '#94A3B8', marginTop: 20, textAlign: 'center', paddingHorizontal: 40 },
});
