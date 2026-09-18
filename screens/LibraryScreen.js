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

const BOOKS = [
  { id: 'b1', title: 'Data Structures & Algorithms', author: 'Mark Allen Weiss', cover: 'https://images.unsplash.com/photo-1516979187457-637abb4f9353?w=400', available: true },
  { id: 'b2', title: 'Operating System Concepts', author: 'Abraham Silberschatz', cover: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=400', available: false },
  { id: 'b3', title: 'Digital Logic Design', author: 'M. Morris Mano', cover: 'https://images.unsplash.com/photo-1495446815901-a7297e633e8d?w=400', available: true },
];

const FLOORS = [
  { id: 1, name: 'Ground Floor', seats: '12/45', status: 'Moderate' },
  { id: 2, name: 'First Floor', seats: '5/40', status: 'Available' },
  { id: 3, name: 'Silent Zone (3F)', seats: '0/25', status: 'Full' },
];

export default function LibraryScreen({ navigation }) {
  const { isDark } = useTheme();
  const [activeTab, setActiveTab] = useState('Books');
  const [selectedFloor, setSelectedFloor] = useState(null);

  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, { toValue: 1, duration: 600, useNativeDriver: true }).start();
  }, []);

  const handleSeatBooking = (floor) => {
    if (floor.status === 'Full') {
      Alert.alert('No Availability', 'This floor is currently full. Try another floor or check back later.');
      return;
    }
    Alert.alert('Seat Reserved', `A study seat on ${floor.name} has been reserved for you for 2 hours.`);
  };

  return (
    <SafeAreaView style={[styles.container, isDark && styles.darkContainer]}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color={isDark ? '#FFF' : '#1E293B'} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, isDark && styles.darkText]}>Library Hub</Text>
        <TouchableOpacity style={styles.headerAction}>
          <Ionicons name="search" size={24} color={isDark ? '#FFF' : '#1E293B'} />
        </TouchableOpacity>
      </View>

      <Animated.View style={{ flex: 1, opacity: fadeAnim }}>
        <View style={styles.tabRow}>
          {['Books', 'Study Seats', 'Resources'].map(tab => (
            <TouchableOpacity 
              key={tab} 
              style={[styles.tab, activeTab === tab && styles.tabActive, isDark && activeTab !== tab && { backgroundColor: '#1E293B' }]}
              onPress={() => setActiveTab(tab)}
            >
              <Text style={[styles.tabText, activeTab === tab && styles.tabTextActive, isDark && activeTab !== tab && { color: '#94A3B8' }]}>{tab}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollBody}>
          
          {activeTab === 'Books' && (
            <>
              <View style={[styles.dueCard, isDark && styles.darkCard]}>
                <LinearGradient colors={['#6366F1', '#8B5CF6']} style={styles.dueGrad}>
                  <View style={styles.dueInfo}>
                    <Text style={styles.dueTitle}>Items Due Soon</Text>
                    <Text style={styles.dueSub}>You have 1 book due in 2 days. Renew now?</Text>
                    <TouchableOpacity style={styles.renewBtn}>
                      <Text style={styles.renewBtnText}>Renew Items</Text>
                    </TouchableOpacity>
                  </View>
                  <Ionicons name="time" size={64} color="rgba(255,255,255,0.2)" />
                </LinearGradient>
              </View>

              <Text style={[styles.sectionTitle, isDark && styles.darkText]}>Popular Textbooks</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.bookScroll}>
                {BOOKS.map(book => (
                  <TouchableOpacity key={book.id} style={[styles.bookCard, isDark && styles.darkCard]}>
                    <Image source={{ uri: book.cover }} style={styles.bookCover} />
                    <View style={styles.bookInfo}>
                      <Text style={[styles.bookTitle, isDark && styles.darkText]} numberOfLines={2}>{book.title}</Text>
                      <Text style={styles.bookAuthor}>{book.author}</Text>
                      <View style={styles.availRow}>
                         <View style={[styles.dot, { backgroundColor: book.available ? '#10B981' : '#EF4444' }]} />
                         <Text style={[styles.availText, { color: book.available ? '#10B981' : '#EF4444' }]}>{book.available ? 'Available' : 'Reserved'}</Text>
                      </View>
                    </View>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </>
          )}

          {activeTab === 'Study Seats' && (
            <View style={styles.seatSection}>
               <Text style={[styles.sectionTitle, isDark && styles.darkText]}>Duo & Silent Zones</Text>
               <View style={styles.floorGrid}>
                  {FLOORS.map(floor => (
                    <TouchableOpacity 
                      key={floor.id} 
                      style={[styles.floorCard, isDark && styles.darkCard, floor.status === 'Full' && { opacity: 0.7 }]}
                      onPress={() => handleSeatBooking(floor)}
                    >
                      <View style={[styles.statusBadge, { backgroundColor: floor.status === 'Available' ? '#10B98120' : (floor.status === 'Full' ? '#EF444420' : '#F59E0B20') }]}>
                        <Text style={[styles.statusText, { color: floor.status === 'Available' ? '#10B981' : (floor.status === 'Full' ? '#EF4444' : '#F59E0B') }]}>{floor.status}</Text>
                      </View>
                      <Text style={[styles.floorName, isDark && styles.darkText]}>{floor.name}</Text>
                      <View style={styles.capacityBar}>
                         <View style={[styles.capacityFill, { width: floor.seats.split('/')[0] + '0%', backgroundColor: floor.status === 'Available' ? '#10B981' : '#F59E0B' }]} />
                      </View>
                      <Text style={styles.capacityText}>{floor.seats} seats remaining</Text>
                      <TouchableOpacity style={[styles.bookSeatBtn, floor.status === 'Full' && { backgroundColor: '#E2E8F0' }]}>
                         <Text style={[styles.bookSeatBtnText, floor.status === 'Full' && { color: '#94A3B8' }]}>Reserve Seat</Text>
                      </TouchableOpacity>
                    </TouchableOpacity>
                  ))}
               </View>
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

  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20 },
  backBtn: { width: 44, height: 44, borderRadius: 15, backgroundColor: '#F1F5F9', justifyContent: 'center', alignItems: 'center' },
  headerTitle: { fontSize: 20, fontWeight: '900', color: '#1E293B' },
  headerAction: { width: 44, height: 44, borderRadius: 15, backgroundColor: '#F1F5F9', justifyContent: 'center', alignItems: 'center' },

  tabRow: { flexDirection: 'row', gap: 10, paddingHorizontal: 20, marginBottom: 15 },
  tab: { paddingHorizontal: 20, paddingVertical: 12, borderRadius: 15, backgroundColor: '#F1F5F9', flex: 1, alignItems: 'center' },
  tabActive: { backgroundColor: '#6366F1' },
  tabText: { fontSize: 13, fontWeight: '800', color: '#64748B' },
  tabTextActive: { color: '#FFF' },

  scrollBody: { padding: 20 },
  dueCard: { borderRadius: 30, overflow: 'hidden', elevation: 5, marginBottom: 30 },
  dueGrad: { padding: 25, flexDirection: 'row', alignItems: 'center' },
  dueInfo: { flex: 1 },
  dueTitle: { fontSize: 18, fontWeight: '900', color: '#FFF' },
  dueSub: { fontSize: 12, color: 'rgba(255,255,255,0.8)', marginTop: 8, marginBottom: 15, lineHeight: 18 },
  renewBtn: { backgroundColor: '#FFF', paddingHorizontal: 15, paddingVertical: 10, borderRadius: 12, alignSelf: 'flex-start' },
  renewBtnText: { color: '#6366F1', fontWeight: '900', fontSize: 13 },

  sectionTitle: { fontSize: 18, fontWeight: '900', color: '#1E293B', marginBottom: 20 },
  bookScroll: { gap: 15, paddingBottom: 10 },
  bookCard: { width: 160, backgroundColor: '#FFF', borderRadius: 25, elevation: 2, overflow: 'hidden' },
  bookCover: { width: '100%', height: 220 },
  bookInfo: { padding: 15 },
  bookTitle: { fontSize: 14, fontWeight: '800', color: '#1E293B', height: 40 },
  bookAuthor: { fontSize: 11, color: '#94A3B8', marginTop: 4, marginBottom: 10 },
  availRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  dot: { width: 8, height: 8, borderRadius: 4 },
  availText: { fontSize: 10, fontWeight: '900' },

  seatSection: { marginTop: 10 },
  floorGrid: { gap: 15 },
  floorCard: { backgroundColor: '#FFF', padding: 20, borderRadius: 25, elevation: 2 },
  statusBadge: { alignSelf: 'flex-start', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8, marginBottom: 12 },
  statusText: { fontSize: 10, fontWeight: '900', textTransform: 'uppercase' },
  floorName: { fontSize: 18, fontWeight: '900', color: '#1E293B', marginBottom: 15 },
  capacityBar: { height: 6, backgroundColor: '#F1F5F9', borderRadius: 3, marginBottom: 10 },
  capacityFill: { height: '100%', borderRadius: 3 },
  capacityText: { fontSize: 11, color: '#94A3B8', fontWeight: '700', marginBottom: 20 },
  bookSeatBtn: { backgroundColor: '#6366F120', paddingVertical: 12, borderRadius: 12, alignItems: 'center' },
  bookSeatBtnText: { color: '#6366F1', fontSize: 14, fontWeight: '800' },
});
