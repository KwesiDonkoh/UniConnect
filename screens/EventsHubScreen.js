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
  Modal,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../components/ThemeProvider';

const { width, height } = Dimensions.get('window');

const FEATURED_EVENTS = [
  {
    id: 'e1',
    title: 'University Tech Expo 2024',
    date: 'June 15, 2024',
    time: '10:00 AM',
    location: 'Great Hall, KNUST',
    price: 'Free',
    image: 'https://images.unsplash.com/photo-1540575861501-7ad05823c951?w=800',
    organizer: 'College of Engineering',
    tags: ['Tech', 'Networking', 'Innovation'],
  },
  {
    id: 'e2',
    title: 'Inter-Hall Football Finals',
    date: 'June 20, 2024',
    time: '4:00 PM',
    location: 'Pa Joe Stadium',
    price: 'GH₵ 20',
    image: 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=800',
    organizer: 'Sports Directorate',
    tags: ['Sports', 'Football', 'Entertainment'],
  },
];

const UPCOMING_EVENTS = [
  { id: 'u1', title: 'Career Fair 2024', date: 'June 25', icon: 'briefcase', color: '#6366F1' },
  { id: 'u2', title: 'Art & Culture Fest', date: 'July 2', icon: 'color-palette', color: '#EC4899' },
  { id: 'u3', title: 'Music Night Live', date: 'July 10', icon: 'musical-notes', color: '#F59E0B' },
  { id: 'u4', title: 'Hackathon v3.0', date: 'July 18', icon: 'code-slash', color: '#10B981' },
];

export default function EventsHubScreen({ navigation }) {
  const { isDark } = useTheme();
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [showDetail, setShowDetail] = useState(false);
  const [bookedEvents, setBookedEvents] = useState(new Set());

  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, { toValue: 1, duration: 600, useNativeDriver: true }).start();
  }, []);

  const handleBooking = (id) => {
    setBookedEvents(prev => {
      const next = new Set(prev);
      next.add(id);
      return next;
    });
    Alert.alert('Ticket Booked!', 'Your e-ticket has been generated and saved to your profile.');
  };

  return (
    <SafeAreaView style={[styles.container, isDark && styles.darkContainer]}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color={isDark ? '#FFFFFF' : '#1E293B'} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, isDark && styles.darkText]}>Events Hub</Text>
        <TouchableOpacity style={styles.calendarBtn}>
          <Ionicons name="calendar-outline" size={24} color={isDark ? '#FFFFFF' : '#1E293B'} />
        </TouchableOpacity>
      </View>

      <Animated.View style={{ flex: 1, opacity: fadeAnim }}>
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollBody}>
          
          <Text style={[styles.sectionTitle, isDark && styles.darkText]}>Featured Events</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.featuredScroll}>
            {FEATURED_EVENTS.map(event => (
              <TouchableOpacity
                key={event.id}
                style={[styles.featuredCard, isDark && styles.darkCard]}
                onPress={() => { setSelectedEvent(event); setShowDetail(true); }}
                activeOpacity={0.9}
              >
                <Image source={{ uri: event.image }} style={styles.featuredImage} />
                <LinearGradient colors={['transparent', 'rgba(0,0,0,0.85)']} style={styles.featuredOverlay}>
                  <View style={styles.tagRow}>
                    {event.tags.map(tag => (
                      <View key={tag} style={styles.tagPill}>
                        <Text style={styles.tagText}>{tag}</Text>
                      </View>
                    ))}
                  </View>
                  <Text style={styles.featuredTitle}>{event.title}</Text>
                  <View style={styles.featuredMeta}>
                    <Ionicons name="location-outline" size={12} color="#CBD5E1" />
                    <Text style={styles.featuredLocText}>{event.location}</Text>
                  </View>
                  <View style={styles.priceBadge}>
                    <Text style={styles.priceText}>{event.price}</Text>
                  </View>
                </LinearGradient>
              </TouchableOpacity>
            ))}
          </ScrollView>

          <View style={styles.upcomingSection}>
            <Text style={[styles.sectionTitle, isDark && styles.darkText]}>This Month</Text>
            {UPCOMING_EVENTS.map(item => (
              <TouchableOpacity key={item.id} style={[styles.upcomingCard, isDark && styles.darkCard]}>
                <View style={[styles.upcomingIcon, { backgroundColor: item.color + '20' }]}>
                  <Ionicons name={item.icon} size={22} color={item.color} />
                </View>
                <View style={styles.upcomingInfo}>
                  <Text style={[styles.upcomingTitle, isDark && styles.darkText]}>{item.title}</Text>
                  <Text style={styles.upcomingDate}>{item.date} • Expected 500+ attendees</Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color="#94A3B8" />
              </TouchableOpacity>
            ))}
          </View>

          <View style={[styles.ticketCard, isDark && styles.darkCard]}>
            <LinearGradient colors={['#6366F1', '#4F46E5']} style={styles.ticketIconWrap}>
              <Ionicons name="qr-code" size={32} color="#FFFFFF" />
            </LinearGradient>
            <View style={styles.ticketTextWrap}>
              <Text style={[styles.ticketTitle, isDark && styles.darkText]}>My Tickets</Text>
              <Text style={[styles.ticketDesc, isDark && styles.darkSubText]}>You have {bookedEvents.size} active tickets for upcoming events.</Text>
            </View>
            <TouchableOpacity style={styles.viewTicketsBtn}>
              <Text style={styles.viewTicketsText}>View</Text>
            </TouchableOpacity>
          </View>

          <View style={{ height: 100 }} />
        </ScrollView>
      </Animated.View>

      {/* Event Detail Modal */}
      <Modal visible={showDetail} animationType="slide" onRequestClose={() => setShowDetail(false)}>
        <SafeAreaView style={[styles.modalContainer, isDark && styles.darkContainer]}>
          {selectedEvent && (
            <>
              <Image source={{ uri: selectedEvent.image }} style={styles.detailImage} />
              <TouchableOpacity style={styles.modalClose} onPress={() => setShowDetail(false)}>
                <Ionicons name="close" size={22} color="#FFFFFF" />
              </TouchableOpacity>
              
              <ScrollView style={styles.detailBody} showsVerticalScrollIndicator={false}>
                <View style={styles.detailHeader}>
                  <Text style={[styles.detailTitle, isDark && styles.darkText]}>{selectedEvent.title}</Text>
                  <Text style={styles.detailOrganizer}>By {selectedEvent.organizer}</Text>
                </View>

                <View style={[styles.infoRow, isDark && styles.darkBorder]}>
                  <View style={styles.infoItem}>
                    <Ionicons name="calendar-outline" size={20} color="#6366F1" />
                    <View>
                      <Text style={[styles.infoVal, isDark && styles.darkText]}>{selectedEvent.date}</Text>
                      <Text style={styles.infoLbl}>{selectedEvent.time}</Text>
                    </View>
                  </View>
                  <View style={styles.infoItem}>
                    <Ionicons name="location-outline" size={20} color="#10B981" />
                    <View>
                      <Text style={[styles.infoVal, isDark && styles.darkText]}>{selectedEvent.location}</Text>
                      <Text style={styles.infoLbl}>Campus Venue</Text>
                    </View>
                  </View>
                </View>

                <Text style={[styles.aboutHeader, isDark && styles.darkText]}>About Event</Text>
                <Text style={[styles.aboutText, isDark && styles.darkSubText]}>
                  Join us for the most anticipated {selectedEvent.title} this semester. This event brings together students, faculty, and industry experts for a day of sharing, learning, and celebration. {'\n\n'}
                  Don't miss out on the networking opportunities, live sessions, and refreshments. Limited slots available!
                </Text>

                <View style={{ height: 100 }} />
              </ScrollView>

              <View style={[styles.footer, isDark && styles.darkFooter]}>
                <View>
                  <Text style={styles.footerPriceLbl}>Admission</Text>
                  <Text style={[styles.footerPriceVal, isDark && styles.darkText]}>{selectedEvent.price}</Text>
                </View>
                <TouchableOpacity
                  style={[styles.bookBtn, bookedEvents.has(selectedEvent.id) && { backgroundColor: '#10B981' }]}
                  onPress={() => handleBooking(selectedEvent.id)}
                  disabled={bookedEvents.has(selectedEvent.id)}
                >
                  <Text style={styles.bookBtnText}>{bookedEvents.has(selectedEvent.id) ? 'Booked ✓' : 'Book Ticket'}</Text>
                </TouchableOpacity>
              </View>
            </>
          )}
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  darkContainer: { backgroundColor: '#0F172A' },
  darkCard: { backgroundColor: '#1E293B' },
  darkText: { color: '#FFFFFF' },
  darkSubText: { color: '#94A3B8' },
  darkFooter: { backgroundColor: '#0F172A', borderTopColor: '#334155' },
  darkBorder: { borderTopColor: '#334155', borderBottomColor: '#334155' },

  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20 },
  backBtn: { width: 44, height: 44, borderRadius: 15, backgroundColor: '#F1F5F9', justifyContent: 'center', alignItems: 'center', ...(false && { backgroundColor: '#1E293B' }) },
  headerTitle: { fontSize: 20, fontWeight: '900', color: '#1E293B' },
  calendarBtn: { width: 44, height: 44, borderRadius: 15, backgroundColor: '#F1F5F9', justifyContent: 'center', alignItems: 'center' },

  scrollBody: { padding: 20 },
  sectionTitle: { fontSize: 18, fontWeight: '900', color: '#1E293B', marginBottom: 15 },
  featuredScroll: { gap: 15, paddingBottom: 10 },
  featuredCard: { width: width * 0.75, height: 200, borderRadius: 25, overflow: 'hidden', elevation: 5 },
  featuredImage: { width: '100%', height: '100%' },
  featuredOverlay: { position: 'absolute', bottom: 0, left: 0, right: 0, height: '70%', padding: 20, justifyContent: 'flex-end' },
  tagRow: { flexDirection: 'row', gap: 6, marginBottom: 8 },
  tagPill: { backgroundColor: 'rgba(255,255,255,0.2)', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 },
  tagText: { fontSize: 10, color: '#FFFFFF', fontWeight: '800' },
  featuredTitle: { fontSize: 18, fontWeight: '900', color: '#FFFFFF', marginBottom: 5 },
  featuredMeta: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  featuredLocText: { fontSize: 12, color: '#CBD5E1' },
  priceBadge: { position: 'absolute', top: 20, right: 20, backgroundColor: '#6366F1', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 12 },
  priceText: { color: '#FFFFFF', fontWeight: '800', fontSize: 12 },

  upcomingSection: { marginTop: 30 },
  upcomingCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFFFFF', padding: 15, borderRadius: 20, elevation: 1, marginBottom: 12 },
  upcomingIcon: { width: 48, height: 48, borderRadius: 16, justifyContent: 'center', alignItems: 'center' },
  upcomingInfo: { flex: 1, marginLeft: 15 },
  upcomingTitle: { fontSize: 15, fontWeight: '800', color: '#1E293B' },
  upcomingDate: { fontSize: 12, color: '#94A3B8', marginTop: 4 },

  ticketCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F1F5F9', padding: 20, borderRadius: 25, marginTop: 20 },
  ticketIconWrap: { width: 64, height: 64, borderRadius: 22, justifyContent: 'center', alignItems: 'center' },
  ticketTextWrap: { flex: 1, marginLeft: 15 },
  ticketTitle: { fontSize: 16, fontWeight: '800', color: '#1E293B' },
  ticketDesc: { fontSize: 12, color: '#64748B', marginTop: 4 },
  viewTicketsBtn: { backgroundColor: '#FFFFFF', paddingHorizontal: 15, paddingVertical: 8, borderRadius: 12, elevation: 1 },
  viewTicketsText: { fontSize: 13, fontWeight: '700', color: '#6366F1' },

  modalContainer: { flex: 1, backgroundColor: '#FFFFFF' },
  detailImage: { width: '100%', height: 300 },
  modalClose: { position: 'absolute', top: 50, right: 20, width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' },
  detailBody: { padding: 25, marginTop: -30, backgroundColor: '#FFFFFF', borderTopLeftRadius: 35, borderTopRightRadius: 35 },
  detailHeader: { marginBottom: 20 },
  detailTitle: { fontSize: 24, fontWeight: '900', color: '#1E293B', marginBottom: 5 },
  detailOrganizer: { fontSize: 14, color: '#6366F1', fontWeight: '700' },
  infoRow: { flexDirection: 'row', paddingVertical: 20, borderTopWidth: 1, borderBottomWidth: 1, borderColor: '#F1F5F9', marginBottom: 25 },
  infoItem: { flex: 1, flexDirection: 'row', gap: 12, alignItems: 'center' },
  infoVal: { fontSize: 15, fontWeight: '800', color: '#1E293B' },
  infoLbl: { fontSize: 12, color: '#94A3B8' },
  aboutHeader: { fontSize: 18, fontWeight: '800', color: '#1E293B', marginBottom: 12 },
  aboutText: { fontSize: 15, color: '#64748B', lineHeight: 24 },

  footer: { position: 'absolute', bottom: 0, width: '100%', backgroundColor: '#FFFFFF', padding: 25, borderTopWidth: 1, borderTopColor: '#F1F5F9', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  footerPriceLbl: { fontSize: 12, color: '#94A3B8', fontWeight: '700' },
  footerPriceVal: { fontSize: 20, fontWeight: '900', color: '#1E293B' },
  bookBtn: { backgroundColor: '#6366F1', paddingHorizontal: 30, paddingVertical: 15, borderRadius: 15 },
  bookBtnText: { color: '#FFFFFF', fontWeight: '900', fontSize: 16 },
});
