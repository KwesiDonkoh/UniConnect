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

const SCHOLARSHIPS = [
  {
    id: 's1',
    title: 'Mastercard Foundation Scholars',
    provider: 'Mastercard Foundation',
    amount: 'Full Scholarship',
    deadline: 'June 30, 2024',
    category: 'General',
    image: 'https://images.unsplash.com/photo-1546410531-bb4caa6b424d?w=800',
  },
  {
    id: 's2',
    title: 'Women in STEM Grant',
    provider: 'Google for Education',
    amount: 'GH₵ 10,000',
    deadline: 'July 15, 2024',
    category: 'STEM',
    image: 'https://images.unsplash.com/photo-1573164067507-406c851e9f14?w=800',
  },
  {
    id: 's3',
    title: 'Postgraduate Research Fund',
    provider: 'KNUST Research Comm.',
    amount: 'GH₵ 5,000',
    deadline: 'August 1, 2024',
    category: 'Research',
    image: 'https://images.unsplash.com/photo-1532094349884-543bc11b234d?w=800',
  },
];

export default function ScholarshipScreen({ navigation }) {
  const { isDark } = useTheme();
  const [selectedCat, setSelectedCat] = useState('All');
  const [saved, setSaved] = useState(new Set());

  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, { toValue: 1, duration: 600, useNativeDriver: true }).start();
  }, []);

  const toggleSave = (id) => {
    setSaved(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const categories = ['All', 'STEM', 'General', 'Research', 'Internships'];

  return (
    <SafeAreaView style={[styles.container, isDark && styles.darkContainer]}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color={isDark ? '#FFF' : '#1E293B'} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, isDark && styles.darkText]}>Opportunities Hub</Text>
        <TouchableOpacity style={styles.headerAction}>
          <Ionicons name="bookmarks-outline" size={24} color={isDark ? '#FFF' : '#1E293B'} />
        </TouchableOpacity>
      </View>

      <Animated.View style={{ flex: 1, opacity: fadeAnim }}>
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollBody}>
          
          <View style={[styles.matchCard, isDark && styles.darkCard]}>
            <LinearGradient colors={['#F59E0B', '#D97706']} style={styles.matchGrad}>
              <View style={styles.matchInfo}>
                <Text style={styles.matchTitle}>AI Match Discovery</Text>
                <Text style={styles.matchSub}>Found 12 scholarships matching your profile and GPA.</Text>
                <TouchableOpacity style={styles.matchBtn}>
                  <Text style={styles.matchBtnText}>View My Matches</Text>
                </TouchableOpacity>
              </View>
              <Ionicons name="sparkles" size={60} color="rgba(255,255,255,0.2)" />
            </LinearGradient>
          </View>

          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.catRow}>
            {categories.map(cat => (
              <TouchableOpacity 
                key={cat} 
                style={[styles.catChip, selectedCat === cat && styles.catActive, isDark && selectedCat !== cat && { backgroundColor: '#1E293B', borderColor: '#334155' }]}
                onPress={() => setSelectedCat(cat)}
              >
                <Text style={[styles.catText, selectedCat === cat && styles.catTextActive, isDark && selectedCat !== cat && { color: '#94A3B8' }]}>{cat}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          <View style={styles.list}>
            {SCHOLARSHIPS.filter(s => selectedCat === 'All' || s.category === selectedCat).map(item => (
              <TouchableOpacity key={item.id} style={[styles.card, isDark && styles.darkCard]} activeOpacity={0.95}>
                <Image source={{ uri: item.image }} style={styles.cardImg} />
                <TouchableOpacity style={styles.saveBtn} onPress={() => toggleSave(item.id)}>
                  <Ionicons name={saved.has(item.id) ? 'bookmark' : 'bookmark-outline'} size={20} color={saved.has(item.id) ? '#6366F1' : '#FFF'} />
                </TouchableOpacity>
                <View style={styles.cardBody}>
                  <View style={styles.deadlineRow}>
                    <Ionicons name="calendar-outline" size={14} color="#94A3B8" />
                    <Text style={styles.deadlineText}>Deadline: {item.deadline}</Text>
                  </View>
                  <Text style={[styles.cardTitle, isDark && styles.darkText]}>{item.title}</Text>
                  <Text style={styles.cardProvider}>By {item.provider}</Text>
                  <View style={styles.cardFooter}>
                    <View style={styles.amountBox}>
                      <Text style={styles.amountText}>{item.amount}</Text>
                    </View>
                    <TouchableOpacity style={styles.applyBtn} onPress={() => Alert.alert('External Link', 'Redirecting to scholarship application portal...')}>
                      <Text style={styles.applyText}>Apply Now</Text>
                      <Ionicons name="open-outline" size={14} color="#FFF" />
                    </TouchableOpacity>
                  </View>
                </View>
              </TouchableOpacity>
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
  darkText: { color: '#FFF' },

  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20 },
  backBtn: { width: 44, height: 44, borderRadius: 15, backgroundColor: '#F1F5F9', justifyContent: 'center', alignItems: 'center' },
  headerTitle: { fontSize: 20, fontWeight: '900', color: '#1E293B' },
  headerAction: { width: 44, height: 44, borderRadius: 15, backgroundColor: '#F1F5F9', justifyContent: 'center', alignItems: 'center' },

  scrollBody: { padding: 20 },
  matchCard: { borderRadius: 30, overflow: 'hidden', elevation: 8, marginBottom: 25 },
  matchGrad: { padding: 25, flexDirection: 'row', alignItems: 'center' },
  matchInfo: { flex: 1 },
  matchTitle: { fontSize: 20, fontWeight: '900', color: '#FFF' },
  matchSub: { fontSize: 13, color: 'rgba(255,255,255,0.8)', marginTop: 8, marginBottom: 20, lineHeight: 18 },
  matchBtn: { backgroundColor: '#FFF', paddingHorizontal: 20, paddingVertical: 12, borderRadius: 15, alignSelf: 'flex-start' },
  matchBtnText: { color: '#D97706', fontWeight: '900', fontSize: 13 },

  catRow: { gap: 10, paddingBottom: 10 },
  catChip: { paddingHorizontal: 18, paddingVertical: 10, borderRadius: 15, backgroundColor: '#FFF', borderWidth: 1, borderColor: '#E2E8F0' },
  catActive: { backgroundColor: '#6366F1', borderColor: '#6366F1' },
  catText: { fontSize: 13, fontWeight: '700', color: '#64748B' },
  catTextActive: { color: '#FFF' },

  list: { marginTop: 20, gap: 20 },
  card: { backgroundColor: '#FFF', borderRadius: 30, overflow: 'hidden', elevation: 3 },
  cardImg: { width: '100%', height: 180 },
  saveBtn: { position: 'absolute', top: 20, right: 20, width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(0,0,0,0.3)', justifyContent: 'center', alignItems: 'center' },
  cardBody: { padding: 25 },
  deadlineRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 8 },
  deadlineText: { fontSize: 12, color: '#94A3B8', fontWeight: '700' },
  cardTitle: { fontSize: 18, fontWeight: '900', color: '#1E293B' },
  cardProvider: { fontSize: 14, color: '#6366F1', fontWeight: '700', marginTop: 4 },
  cardFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 25 },
  amountBox: { backgroundColor: '#F0FDF4', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 10 },
  amountText: { fontSize: 14, fontWeight: '900', color: '#16A34A' },
  applyBtn: { backgroundColor: '#6366F1', paddingHorizontal: 20, paddingVertical: 12, borderRadius: 15, flexDirection: 'row', alignItems: 'center', gap: 8 },
  applyText: { color: '#FFF', fontWeight: '900', fontSize: 13 },
});
