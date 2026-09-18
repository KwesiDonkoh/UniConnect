import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  Dimensions,
  Animated,
  StatusBar,
  Alert,
  Modal,
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../components/ThemeProvider';

const { width } = Dimensions.get('window');

const FEATURED = [
  { id: 'f1', title: 'KNUST Tech Summit 2026', date: 'Jun 10, 2026', time: '09:00 AM', venue: 'Great Hall', type: 'Seminar', color: '#6366F1', spots: 243, capacity: 500, rsvp: false, speaker: 'Dr. Kwame Mensah', tags: ['AI', 'Tech', 'Innovation'] },
  { id: 'f2', title: 'Annual Cultural Festival', date: 'Jun 15, 2026', time: '03:00 PM', venue: 'Sports Complex', type: 'Cultural', color: '#EC4899', spots: 120, capacity: 2000, rsvp: true, speaker: 'SRC President', tags: ['Culture', 'Music', 'Dance'] },
  { id: 'f3', title: 'Startup Pitch Night', date: 'Jun 18, 2026', time: '06:00 PM', venue: 'Lecture Theatre 1', type: 'Workshop', color: '#10B981', spots: 45, capacity: 100, rsvp: false, speaker: 'Alumni Panel', tags: ['Startup', 'Pitch', 'Funding'] },
];

const UPCOMING = [
  { id: 'u1', title: 'Mental Health Seminar', date: 'Jun 7', time: '2:00 PM', type: 'Health', color: '#F59E0B', venue: 'Health Center', rsvp: false },
  { id: 'u2', title: 'Chess Club Tournament', date: 'Jun 8', time: '10:00 AM', type: 'Sports', color: '#EF4444', venue: 'SRC Room B', rsvp: true },
  { id: 'u3', title: 'Cybersecurity Workshop', date: 'Jun 12', time: '1:00 PM', type: 'Workshop', color: '#8B5CF6', venue: 'CS Lab 2', rsvp: false },
  { id: 'u4', title: 'Career Fair 2026', date: 'Jun 14', time: '9:00 AM', type: 'Career', color: '#0EA5E9', venue: 'University Mall', rsvp: false },
  { id: 'u5', title: 'Drama Society Showcase', date: 'Jun 20', time: '7:00 PM', type: 'Arts', color: '#F472B6', venue: 'Theater Hall', rsvp: true },
  { id: 'u6', title: 'Research Symposium', date: 'Jun 22', time: '10:00 AM', type: 'Academic', color: '#6366F1', venue: 'Main Hall', rsvp: false },
];

export default function EventsSeminarHubScreen({ navigation }) {
  const { isDark } = useTheme();
  const [events, setEvents] = useState([...FEATURED.map(e => ({ ...e })), ...UPCOMING.map(e => ({ ...e }))]);
  const [featured, setFeatured] = useState(FEATURED.map(e => ({ ...e })));
  const [upcoming, setUpcoming] = useState(UPCOMING.map(e => ({ ...e })));
  const [detailEvent, setDetailEvent] = useState(null);
  const [activeTab, setActiveTab] = useState(0);
  const scrollRef = useRef(null);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const carouselTimer = useRef(null);

  useEffect(() => {
    Animated.timing(fadeAnim, { toValue: 1, duration: 600, useNativeDriver: true }).start();
    carouselTimer.current = setInterval(() => {
      setActiveTab(t => {
        const next = (t + 1) % FEATURED.length;
        scrollRef.current?.scrollTo({ x: next * (width - 40), animated: true });
        return next;
      });
    }, 4000);
    return () => clearInterval(carouselTimer.current);
  }, []);

  const theme = {
    bg: isDark ? '#020617' : '#F8FAFC',
    card: isDark ? '#1E293B' : '#FFFFFF',
    text: isDark ? '#F1F5F9' : '#1E293B',
    sub: isDark ? '#94A3B8' : '#64748B',
    border: isDark ? '#334155' : '#E2E8F0',
  };

  const toggleRSVP = (id, isFeatured) => {
    if (isFeatured) {
      setFeatured(prev => prev.map(e => e.id === id ? { ...e, rsvp: !e.rsvp, spots: e.rsvp ? e.spots + 1 : e.spots - 1 } : e));
    } else {
      setUpcoming(prev => prev.map(e => e.id === id ? { ...e, rsvp: !e.rsvp } : e));
    }
    if (detailEvent?.id === id) {
      setDetailEvent(d => ({ ...d, rsvp: !d.rsvp, spots: d.rsvp ? d.spots + 1 : d.spots - 1 }));
    }
    Alert.alert(
      'RSVP Updated!',
      `You have ${events.find(e => e.id === id)?.rsvp ? 'cancelled your RSVP for' : 'RSVP\'d for'} this event.`,
    );
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.bg }]}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />

      {/* Header */}
      <LinearGradient colors={isDark ? ['#1A0533', '#020617'] : ['#8B5CF6', '#6366F1']} style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color="#FFF" />
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>Events & Seminar Hub</Text>
          <Text style={styles.headerSub}>{featured.length + upcoming.length} events this month</Text>
        </View>
        <TouchableOpacity onPress={() => Alert.alert('Calendar', 'Event calendar view coming soon!')}>
          <Ionicons name="calendar" size={24} color="#FFF" />
        </TouchableOpacity>
      </LinearGradient>

      <Animated.ScrollView style={{ opacity: fadeAnim }} showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scroll}>

        {/* RSVPd Count Banner */}
        <View style={[styles.rsvpBanner, { backgroundColor: isDark ? '#1E293B' : '#F5F3FF' }]}>
          <LinearGradient colors={['#8B5CF6', '#6366F1']} style={styles.rsvpIcon}>
            <Ionicons name="ticket" size={16} color="#FFF" />
          </LinearGradient>
          <Text style={[styles.rsvpBannerText, { color: theme.text }]}>
            You have <Text style={{ fontWeight: '900', color: '#6366F1' }}>
              {[...featured, ...upcoming].filter(e => e.rsvp).length} event{[...featured, ...upcoming].filter(e => e.rsvp).length !== 1 ? 's' : ''}</Text> confirmed this month.
          </Text>
          <Ionicons name="chevron-forward" size={16} color={theme.sub} />
        </View>

        {/* Featured Events Carousel */}
        <Text style={[styles.sectionHeader, { color: theme.sub }]}>FEATURED EVENTS</Text>
        <ScrollView
          ref={scrollRef}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          onScroll={e => setActiveTab(Math.round(e.nativeEvent.contentOffset.x / (width - 40)))}
          contentContainerStyle={styles.carouselContent}
          style={styles.carousel}
        >
          {featured.map((ev, idx) => (
            <TouchableOpacity key={ev.id} style={[styles.featCard, { width: width - 40 }]}
              onPress={() => setDetailEvent({ ...ev, isFeatured: true })} activeOpacity={0.9}>
              <LinearGradient colors={[ev.color, ev.color + 'BB']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
                style={styles.featGradient}>
                <View style={styles.featTopRow}>
                  <View style={styles.featTypeBadge}>
                    <Text style={styles.featTypeText}>{ev.type.toUpperCase()}</Text>
                  </View>
                  {ev.rsvp && (
                    <View style={styles.rsvpdBadge}>
                      <Ionicons name="checkmark" size={10} color="#FFF" />
                      <Text style={styles.rsvpdText}>RSVP'd</Text>
                    </View>
                  )}
                </View>
                <Text style={styles.featTitle}>{ev.title}</Text>
                <Text style={styles.featSpeaker}>👤 {ev.speaker}</Text>
                <View style={styles.featMeta}>
                  <View style={styles.featMetaItem}>
                    <Ionicons name="calendar" size={13} color="rgba(255,255,255,0.8)" />
                    <Text style={styles.featMetaText}>{ev.date}</Text>
                  </View>
                  <View style={styles.featMetaItem}>
                    <Ionicons name="time" size={13} color="rgba(255,255,255,0.8)" />
                    <Text style={styles.featMetaText}>{ev.time}</Text>
                  </View>
                  <View style={styles.featMetaItem}>
                    <Ionicons name="location" size={13} color="rgba(255,255,255,0.8)" />
                    <Text style={styles.featMetaText}>{ev.venue}</Text>
                  </View>
                </View>
                <View style={styles.featBottom}>
                  <View style={styles.spotsRow}>
                    <View style={styles.spotsBar}>
                      <View style={[styles.spotsFill, { width: `${((ev.capacity - ev.spots) / ev.capacity) * 100}%` }]} />
                    </View>
                    <Text style={styles.spotsText}>{ev.spots} spots left</Text>
                  </View>
                  <TouchableOpacity style={[styles.rsvpBtn, ev.rsvp && styles.rsvpBtnActive]}
                    onPress={() => toggleRSVP(ev.id, true)}>
                    <Text style={styles.rsvpBtnText}>{ev.rsvp ? '✓ Booked' : 'RSVP'}</Text>
                  </TouchableOpacity>
                </View>
                <View style={styles.tagRow}>
                  {ev.tags.map(t => (
                    <View key={t} style={styles.tag}><Text style={styles.tagText}>#{t}</Text></View>
                  ))}
                </View>
              </LinearGradient>
            </TouchableOpacity>
          ))}
        </ScrollView>
        {/* Carousel Dots */}
        <View style={styles.dots}>
          {featured.map((_, i) => (
            <View key={i} style={[styles.dot, i === activeTab && styles.dotActive]} />
          ))}
        </View>

        {/* Upcoming Events */}
        <Text style={[styles.sectionHeader, { color: theme.sub, marginTop: 24 }]}>UPCOMING EVENTS</Text>
        {upcoming.map(ev => (
          <TouchableOpacity key={ev.id} style={[styles.upcomingCard, { backgroundColor: theme.card, borderColor: theme.border }]}
            onPress={() => setDetailEvent({ ...ev, isFeatured: false })} activeOpacity={0.85}>
            <View style={[styles.upcomingColorChip, { backgroundColor: ev.color }]}>
              <Text style={styles.upcomingDateNum}>{ev.date.split(' ')[1]}</Text>
              <Text style={styles.upcomingDateMon}>{ev.date.split(' ')[0]}</Text>
            </View>
            <View style={styles.upcomingInfo}>
              <Text style={[styles.upcomingTitle, { color: theme.text }]}>{ev.title}</Text>
              <View style={styles.upcomingMeta}>
                <Text style={[styles.upcomingMetaText, { color: theme.sub }]}>{ev.time} · {ev.venue}</Text>
              </View>
              <View style={[styles.upcomingType, { backgroundColor: ev.color + '20' }]}>
                <Text style={[styles.upcomingTypeText, { color: ev.color }]}>{ev.type}</Text>
              </View>
            </View>
            <TouchableOpacity style={[styles.upcomingRsvp, ev.rsvp && { backgroundColor: '#10B981' }]}
              onPress={() => toggleRSVP(ev.id, false)}>
              <Ionicons name={ev.rsvp ? 'checkmark' : 'add'} size={18} color="#FFF" />
            </TouchableOpacity>
          </TouchableOpacity>
        ))}

        <View style={{ height: 40 }} />
      </Animated.ScrollView>

      {/* Event Detail Modal */}
      <Modal visible={!!detailEvent} transparent animationType="slide" onRequestClose={() => setDetailEvent(null)}>
        <View style={styles.modalOverlay}>
          {detailEvent && (
            <View style={[styles.detailSheet, { backgroundColor: theme.card }]}>
              <LinearGradient colors={[detailEvent.color, detailEvent.color + 'BB']} style={styles.detailGradient}>
                <TouchableOpacity style={styles.detailClose} onPress={() => setDetailEvent(null)}>
                  <Ionicons name="close" size={22} color="#FFF" />
                </TouchableOpacity>
                <Text style={styles.detailType}>{detailEvent.type?.toUpperCase()}</Text>
                <Text style={styles.detailTitle}>{detailEvent.title}</Text>
              </LinearGradient>
              <ScrollView contentContainerStyle={styles.detailBody}>
                {[
                  { icon: 'person', label: 'Speaker', value: detailEvent.speaker || 'TBD' },
                  { icon: 'calendar', label: 'Date', value: detailEvent.date },
                  { icon: 'time', label: 'Time', value: detailEvent.time },
                  { icon: 'location', label: 'Venue', value: detailEvent.venue },
                ].map(d => (
                  <View key={d.label} style={[styles.detailInfoRow, { borderBottomColor: theme.border }]}>
                    <Ionicons name={d.icon} size={16} color="#6366F1" />
                    <View style={styles.detailInfoText}>
                      <Text style={[styles.detailInfoLabel, { color: theme.sub }]}>{d.label}</Text>
                      <Text style={[styles.detailInfoValue, { color: theme.text }]}>{d.value}</Text>
                    </View>
                  </View>
                ))}
                <TouchableOpacity style={[styles.detailRsvpBtn, { backgroundColor: detailEvent.rsvp ? '#10B981' : detailEvent.color }]}
                  onPress={() => toggleRSVP(detailEvent.id, detailEvent.isFeatured)}>
                  <Ionicons name={detailEvent.rsvp ? 'checkmark-circle' : 'ticket'} size={20} color="#FFF" />
                  <Text style={styles.detailRsvpText}>{detailEvent.rsvp ? 'Cancel RSVP' : 'Confirm RSVP'}</Text>
                </TouchableOpacity>
              </ScrollView>
            </View>
          )}
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, paddingTop: 16, paddingBottom: 20 },
  backBtn: { width: 40 },
  headerCenter: { flex: 1, alignItems: 'center' },
  headerTitle: { fontSize: 20, fontWeight: '900', color: '#FFF' },
  headerSub: { fontSize: 11, color: 'rgba(255,255,255,0.75)', marginTop: 2 },
  scroll: { paddingBottom: 30 },
  rsvpBanner: { flexDirection: 'row', alignItems: 'center', margin: 20, padding: 14, borderRadius: 16, gap: 10 },
  rsvpIcon: { width: 34, height: 34, borderRadius: 10, justifyContent: 'center', alignItems: 'center' },
  rsvpBannerText: { flex: 1, fontSize: 13, fontWeight: '600' },
  sectionHeader: { fontSize: 11, fontWeight: '900', letterSpacing: 1, marginHorizontal: 20, marginBottom: 12 },
  carousel: { marginBottom: 8 },
  carouselContent: { paddingHorizontal: 20, gap: 12 },
  featCard: { borderRadius: 24, overflow: 'hidden' },
  featGradient: { padding: 22, gap: 10 },
  featTopRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  featTypeBadge: { backgroundColor: 'rgba(255,255,255,0.25)', paddingHorizontal: 12, paddingVertical: 4, borderRadius: 10 },
  featTypeText: { fontSize: 10, fontWeight: '900', color: '#FFF', letterSpacing: 1 },
  rsvpdBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: 'rgba(16,185,129,0.9)', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 10 },
  rsvpdText: { fontSize: 10, fontWeight: '900', color: '#FFF' },
  featTitle: { fontSize: 22, fontWeight: '900', color: '#FFF' },
  featSpeaker: { fontSize: 13, color: 'rgba(255,255,255,0.85)', fontWeight: '600' },
  featMeta: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  featMetaItem: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  featMetaText: { fontSize: 12, color: 'rgba(255,255,255,0.85)', fontWeight: '600' },
  featBottom: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  spotsRow: { flex: 1 },
  spotsBar: { height: 4, backgroundColor: 'rgba(255,255,255,0.3)', borderRadius: 2, marginBottom: 4, overflow: 'hidden' },
  spotsFill: { height: '100%', backgroundColor: '#FFF', borderRadius: 2 },
  spotsText: { fontSize: 11, color: 'rgba(255,255,255,0.8)', fontWeight: '700' },
  rsvpBtn: { backgroundColor: 'rgba(255,255,255,0.25)', paddingHorizontal: 18, paddingVertical: 10, borderRadius: 14 },
  rsvpBtnActive: { backgroundColor: '#10B981' },
  rsvpBtnText: { fontSize: 13, fontWeight: '900', color: '#FFF' },
  tagRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  tag: { backgroundColor: 'rgba(255,255,255,0.2)', paddingHorizontal: 10, paddingVertical: 3, borderRadius: 8 },
  tagText: { fontSize: 11, fontWeight: '700', color: '#FFF' },
  dots: { flexDirection: 'row', justifyContent: 'center', gap: 6, marginBottom: 8 },
  dot: { width: 6, height: 6, borderRadius: 3, backgroundColor: '#CBD5E1' },
  dotActive: { width: 20, backgroundColor: '#6366F1' },
  upcomingCard: { flexDirection: 'row', alignItems: 'center', marginHorizontal: 20, marginBottom: 12, borderRadius: 18, padding: 14, borderWidth: 1, gap: 14 },
  upcomingColorChip: { width: 52, height: 52, borderRadius: 16, justifyContent: 'center', alignItems: 'center' },
  upcomingDateNum: { fontSize: 18, fontWeight: '900', color: '#FFF' },
  upcomingDateMon: { fontSize: 10, fontWeight: '700', color: 'rgba(255,255,255,0.8)' },
  upcomingInfo: { flex: 1, gap: 4 },
  upcomingTitle: { fontSize: 15, fontWeight: '800' },
  upcomingMeta: {},
  upcomingMetaText: { fontSize: 12, fontWeight: '600' },
  upcomingType: { alignSelf: 'flex-start', paddingHorizontal: 10, paddingVertical: 3, borderRadius: 8, marginTop: 4 },
  upcomingTypeText: { fontSize: 10, fontWeight: '900' },
  upcomingRsvp: { width: 40, height: 40, borderRadius: 14, backgroundColor: '#6366F1', justifyContent: 'center', alignItems: 'center' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  detailSheet: { borderTopLeftRadius: 28, borderTopRightRadius: 28, overflow: 'hidden', maxHeight: '80%' },
  detailGradient: { padding: 24, paddingTop: 16 },
  detailClose: { alignSelf: 'flex-end', marginBottom: 8 },
  detailType: { fontSize: 11, fontWeight: '900', color: 'rgba(255,255,255,0.8)', letterSpacing: 1, marginBottom: 6 },
  detailTitle: { fontSize: 22, fontWeight: '900', color: '#FFF' },
  detailBody: { padding: 24, gap: 16 },
  detailInfoRow: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingBottom: 12, borderBottomWidth: 1 },
  detailInfoText: { gap: 2 },
  detailInfoLabel: { fontSize: 10, fontWeight: '900', letterSpacing: 1 },
  detailInfoValue: { fontSize: 15, fontWeight: '800' },
  detailRsvpBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, paddingVertical: 16, borderRadius: 18, marginTop: 8 },
  detailRsvpText: { fontSize: 16, fontWeight: '900', color: '#FFF' },
});
