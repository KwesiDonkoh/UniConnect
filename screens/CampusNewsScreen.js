import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Dimensions,
  Animated,
  StatusBar,
  Image,
  Modal,
  Alert,
  RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../components/ThemeProvider';
import { useApp } from '../context/AppContext';

const { width, height } = Dimensions.get('window');

const CAMPUS_NEWS = [
  {
    id: 'cn1',
    headline: 'KNUST Wins Best African University Innovation Award at World Tech Summit 2025',
    category: 'Achievement',
    department: 'University PR',
    time: '1h ago',
    image: 'https://images.unsplash.com/photo-1541339907198-e08756dedf3f?w=800',
    summary: 'KNUST has been recognized as the most innovative African university at the World Technology Summit held in Dubai, beating 240 institutions from 38 countries.',
    isUrgent: true,
    likes: 2341,
    comments: 187,
    views: 8400,
  },
  {
    id: 'cn2',
    headline: 'New State-of-the-Art Robotics Lab Opens at College of Engineering',
    category: 'Facilities',
    department: 'COE',
    time: '3h ago',
    image: 'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=800',
    summary: 'The newly inaugurated Robotics and Automation Lab at KNUST\'s College of Engineering features over 100 collaborative robots and is now open to all engineering students.',
    isUrgent: false,
    likes: 987,
    comments: 64,
    views: 3200,
  },
  {
    id: 'cn3',
    headline: 'Emergency: Library Extended Hours Until Exam Period Ends — Open 24/7',
    category: 'Alert',
    department: 'Library Services',
    time: '30min ago',
    image: 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=800',
    summary: 'The main university library and all faculty libraries will remain open 24 hours a day during the upcoming examination period, from June 1 to June 30.',
    isUrgent: true,
    likes: 1456,
    comments: 98,
    views: 9100,
  },
  {
    id: 'cn4',
    headline: 'CSM Final Year Project Exhibition — Register Before June 15',
    category: 'Academic',
    department: 'Computer Science Dept',
    time: '5h ago',
    image: 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=800',
    summary: 'Final year computer science students must register their project exhibition slots by June 15. The expo will be held on June 28-29 in the Great Hall.',
    isUrgent: false,
    likes: 678,
    comments: 45,
    views: 2100,
  },
  {
    id: 'cn5',
    headline: 'KNUST Launches Free Mental Health Counseling Initiative for Students',
    category: 'Wellness',
    department: 'Student Affairs',
    time: '1d ago',
    image: 'https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=800',
    summary: 'The university has partnered with Mind Ghana to provide free mental health counseling services to all enrolled students, with sessions available both online and in-person.',
    isUrgent: false,
    likes: 3241,
    comments: 229,
    views: 11200,
  },
  {
    id: 'cn6',
    headline: 'Annual Cultural Festival "Akwasidae" Set for Next Weekend',
    category: 'Events',
    department: 'SRC',
    time: '2d ago',
    image: 'https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?w=800',
    summary: 'The KNUST Student Representative Council announces the annual Akwasidae Cultural Festival featuring traditional performances, food, arts, and a live concert.',
    isUrgent: false,
    likes: 4120,
    comments: 312,
    views: 14500,
  },
];

const NOTICE_BOARD = [
  { id: 'n1', title: 'Exam Timetable Released', type: 'exam', time: '2h ago', dept: 'Academic Registry' },
  { id: 'n2', title: 'Fees Deadline Extended to June 30', type: 'finance', time: '4h ago', dept: 'Finance Office' },
  { id: 'n3', title: 'New Bus Route via Main Gate Added', type: 'transport', time: '1d ago', dept: 'Transport Office' },
  { id: 'n4', title: 'Scholarship Applications Now Open', type: 'scholarship', time: '2d ago', dept: 'Scholarships Dept' },
  { id: 'n5', title: 'Campus Electricity Maintenance — Block D', type: 'maintenance', time: '3h ago', dept: 'Estate Office' },
];

const CATEGORIES = ['All', 'Achievement', 'Academic', 'Alert', 'Events', 'Facilities', 'Wellness'];

const noticeTypeConfig = {
  exam: { icon: 'document-text', color: '#6366F1' },
  finance: { icon: 'cash', color: '#10B981' },
  transport: { icon: 'bus', color: '#A855F7' },
  scholarship: { icon: 'school', color: '#F59E0B' },
  maintenance: { icon: 'build', color: '#EF4444' },
};

export default function CampusNewsScreen({ navigation }) {
  const { isDark } = useTheme();
  const { user } = useApp();
  const [activeCategory, setActiveCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedArticle, setSelectedArticle] = useState(null);
  const [showArticle, setShowArticle] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [likedNews, setLikedNews] = useState(new Set());
  const [savedNews, setSavedNews] = useState(new Set());
  const [showAlerts, setShowAlerts] = useState(true);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;
  const alertPulse = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 700, useNativeDriver: true }),
      Animated.timing(slideAnim, { toValue: 0, duration: 700, useNativeDriver: true }),
    ]).start();

    // Pulse animation for urgent badge
    Animated.loop(
      Animated.sequence([
        Animated.timing(alertPulse, { toValue: 1.15, duration: 700, useNativeDriver: true }),
        Animated.timing(alertPulse, { toValue: 1, duration: 700, useNativeDriver: true }),
      ])
    ).start();
  }, []);

  const filteredNews = CAMPUS_NEWS.filter(item => {
    const matchCat = activeCategory === 'All' || item.category === activeCategory;
    const matchSearch = !searchQuery || item.headline.toLowerCase().includes(searchQuery.toLowerCase());
    return matchCat && matchSearch;
  });

  const urgentNews = CAMPUS_NEWS.filter(n => n.isUrgent);
  const topStory = filteredNews[0];

  const handleRefresh = async () => {
    setRefreshing(true);
    await new Promise(r => setTimeout(r, 1000));
    setRefreshing(false);
  };

  const toggleLike = (id) => {
    setLikedNews(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  const toggleSave = (id) => {
    setSavedNews(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  const getCategoryColor = (cat) => {
    const map = {
      Achievement: '#6366F1', Facilities: '#0EA5E9', Alert: '#EF4444',
      Academic: '#8B5CF6', Events: '#F59E0B', Wellness: '#10B981',
    };
    return map[cat] || '#64748B';
  };

  return (
    <SafeAreaView style={[styles.container, isDark && styles.darkContainer]}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />

      {/* Header */}
      <LinearGradient colors={isDark ? ['#0F172A', '#1E293B'] : ['#7C3AED', '#8B5CF6']} style={styles.header}>
        <View style={styles.headerRow}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
          </TouchableOpacity>
          <View style={styles.headerCenter}>
            <Text style={styles.headerTitle}>🏛 Campus News</Text>
            <Text style={styles.headerSub}>{user?.university || 'KNUST'} • Live Updates</Text>
          </View>
          <View style={styles.headerActions}>
            <TouchableOpacity style={styles.headerBtn} onPress={() => Alert.alert('Notifications', 'You\'ll be notified of important campus updates.')}>
              <Ionicons name="notifications" size={20} color="#FFFFFF" />
              <View style={styles.notifDot} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Search */}
        <View style={styles.searchBar}>
          <Ionicons name="search" size={17} color="#94A3B8" />
          <TextInput
            style={styles.searchInput}
            placeholder="Search campus news..."
            placeholderTextColor="rgba(255,255,255,0.5)"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Ionicons name="close-circle" size={18} color="#94A3B8" />
            </TouchableOpacity>
          )}
        </View>
      </LinearGradient>

      <Animated.View style={{ flex: 1, opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} colors={['#8B5CF6']} />}
        >
          {/* Urgent Alerts Banner */}
          {urgentNews.length > 0 && showAlerts && (
            <View style={[styles.alertBanner, isDark && styles.darkAlertBanner]}>
              <View style={styles.alertLeft}>
                <Animated.View style={[styles.alertPulse, { transform: [{ scale: alertPulse }] }]} />
                <Text style={[styles.alertLabel, isDark && { color: '#FCA5A5' }]}>🚨 {urgentNews.length} URGENT</Text>
              </View>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.alertScroll}>
                {urgentNews.map(item => (
                  <TouchableOpacity key={item.id} style={styles.alertChip} onPress={() => { setSelectedArticle(item); setShowArticle(true); }}>
                    <Text style={styles.alertChipText} numberOfLines={1}>{item.headline}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
              <TouchableOpacity onPress={() => setShowAlerts(false)}>
                <Ionicons name="close" size={16} color={isDark ? '#94A3B8' : '#EF4444'} />
              </TouchableOpacity>
            </View>
          )}

          {/* Category Filter */}
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.catScroll} contentContainerStyle={styles.catContent}>
            {CATEGORIES.map(cat => (
              <TouchableOpacity
                key={cat}
                style={[styles.catChip, activeCategory === cat && styles.catChipActive, isDark && activeCategory !== cat && styles.darkCatChip]}
                onPress={() => setActiveCategory(cat)}
              >
                {cat !== 'All' && <View style={[styles.catDot, { backgroundColor: getCategoryColor(cat) }]} />}
                <Text style={[styles.catText, activeCategory === cat && styles.catTextActive, isDark && activeCategory !== cat && styles.darkCatText]}>
                  {cat}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          {/* Notice Board */}
          <View style={[styles.noticeSec, isDark && styles.darkNotice]}>
            <View style={styles.noticeHeader}>
              <Ionicons name="clipboard" size={16} color="#8B5CF6" />
              <Text style={[styles.noticeTitel, isDark && styles.darkText]}>Notice Board</Text>
              <TouchableOpacity style={styles.seeAll}>
                <Text style={styles.seeAllText}>See All</Text>
              </TouchableOpacity>
            </View>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 10 }}>
              {NOTICE_BOARD.map(notice => {
                const cfg = noticeTypeConfig[notice.type] || { icon: 'information-circle', color: '#6366F1' };
                return (
                  <TouchableOpacity key={notice.id} style={[styles.noticeCard, isDark && styles.darkNoticeCard]}>
                    <View style={[styles.noticeIcon, { backgroundColor: cfg.color + '20' }]}>
                      <Ionicons name={cfg.icon} size={18} color={cfg.color} />
                    </View>
                    <Text style={[styles.noticeTitle, isDark && styles.darkText]} numberOfLines={2}>{notice.title}</Text>
                    <Text style={[styles.noticeDept, isDark && styles.darkSubText]}>{notice.dept}</Text>
                    <Text style={[styles.noticeTime, isDark && styles.darkSubText]}>{notice.time}</Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </View>

          {/* Top Story */}
          {topStory && !searchQuery && (
            <View style={styles.topStorySection}>
              <Text style={[styles.sectionTitle, isDark && styles.darkText]}>Top Story</Text>
              <TouchableOpacity style={styles.topStoryCard} onPress={() => { setSelectedArticle(topStory); setShowArticle(true); }} activeOpacity={0.9}>
                <Image source={{ uri: topStory.image }} style={styles.topStoryImage} />
                <LinearGradient colors={['transparent', 'rgba(0,0,0,0.9)']} style={styles.topStoryOverlay}>
                  <View style={[styles.categoryPill, { backgroundColor: getCategoryColor(topStory.category) }]}>
                    {topStory.isUrgent && <Ionicons name="alert-circle" size={12} color="#FFFFFF" />}
                    <Text style={styles.catPillText}>{topStory.category}</Text>
                  </View>
                  <Text style={styles.topStoryTitle} numberOfLines={2}>{topStory.headline}</Text>
                  <View style={styles.topStoryMeta}>
                    <Text style={styles.topStoryDept}>{topStory.department} • {topStory.time}</Text>
                    <View style={styles.topStoryStats}>
                      <Ionicons name="eye-outline" size={13} color="rgba(255,255,255,0.7)" />
                      <Text style={styles.topStatText}>{topStory.views.toLocaleString()}</Text>
                    </View>
                  </View>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          )}

          {/* News Feed */}
          <View style={styles.feedSection}>
            <Text style={[styles.sectionTitle, isDark && styles.darkText]}>
              {searchQuery ? `"${searchQuery}"` : 'Campus Feed'}
            </Text>
            {filteredNews.map((item, idx) => (
              <TouchableOpacity
                key={item.id}
                style={[styles.feedCard, isDark && styles.darkFeedCard]}
                onPress={() => { setSelectedArticle(item); setShowArticle(true); }}
                activeOpacity={0.85}
              >
                {item.isUrgent && (
                  <View style={styles.urgentBadge}>
                    <Text style={styles.urgentText}>🚨 URGENT</Text>
                  </View>
                )}
                <View style={styles.feedCardContent}>
                  <Image source={{ uri: item.image }} style={styles.feedThumb} />
                  <View style={styles.feedInfo}>
                    <View style={[styles.feedCatBadge, { backgroundColor: getCategoryColor(item.category) + '20' }]}>
                      <Text style={[styles.feedCatText, { color: getCategoryColor(item.category) }]}>{item.category}</Text>
                    </View>
                    <Text style={[styles.feedHeadline, isDark && styles.darkText]} numberOfLines={2}>{item.headline}</Text>
                    <Text style={[styles.feedDept, isDark && styles.darkSubText]}>{item.department} • {item.time}</Text>
                    <View style={styles.feedStats}>
                      <TouchableOpacity style={styles.statItem} onPress={() => toggleLike(item.id)}>
                        <Ionicons name={likedNews.has(item.id) ? 'heart' : 'heart-outline'} size={14} color={likedNews.has(item.id) ? '#EF4444' : '#94A3B8'} />
                        <Text style={[styles.statCount, isDark && styles.darkSubText]}>{item.likes + (likedNews.has(item.id) ? 1 : 0)}</Text>
                      </TouchableOpacity>
                      <View style={styles.statItem}>
                        <Ionicons name="chatbubble-outline" size={13} color="#94A3B8" />
                        <Text style={[styles.statCount, isDark && styles.darkSubText]}>{item.comments}</Text>
                      </View>
                      <View style={styles.statItem}>
                        <Ionicons name="eye-outline" size={13} color="#94A3B8" />
                        <Text style={[styles.statCount, isDark && styles.darkSubText]}>{item.views.toLocaleString()}</Text>
                      </View>
                      <TouchableOpacity onPress={() => toggleSave(item.id)}>
                        <Ionicons name={savedNews.has(item.id) ? 'bookmark' : 'bookmark-outline'} size={15} color={savedNews.has(item.id) ? '#8B5CF6' : '#94A3B8'} />
                      </TouchableOpacity>
                    </View>
                  </View>
                </View>
              </TouchableOpacity>
            ))}
          </View>

          <View style={{ height: 100 }} />
        </ScrollView>
      </Animated.View>

      {/* Article Detail Modal */}
      <Modal visible={showArticle} animationType="slide" onRequestClose={() => setShowArticle(false)}>
        <SafeAreaView style={[styles.articleContainer, isDark && styles.darkContainer]}>
          {selectedArticle && (
            <>
              <Image source={{ uri: selectedArticle.image }} style={styles.articleImage} />
              <LinearGradient colors={['rgba(0,0,0,0.65)', 'transparent']} style={styles.articleImgOverlay}>
                <TouchableOpacity onPress={() => setShowArticle(false)} style={styles.articleBackBtn}>
                  <Ionicons name="close" size={22} color="#FFFFFF" />
                </TouchableOpacity>
              </LinearGradient>
              <ScrollView style={[styles.articleBody, isDark && { backgroundColor: '#0F172A' }]} showsVerticalScrollIndicator={false}>
                {selectedArticle.isUrgent && (
                  <View style={styles.urgentBanner}>
                    <Ionicons name="alert-circle" size={16} color="#FFFFFF" />
                    <Text style={styles.urgentBannerText}>URGENT ANNOUNCEMENT</Text>
                  </View>
                )}
                <View style={[styles.articleCatRow, { borderLeftColor: getCategoryColor(selectedArticle.category) }]}>
                  <Text style={[styles.articleCatTxt, { color: getCategoryColor(selectedArticle.category) }]}>{selectedArticle.category}</Text>
                  <Text style={[styles.articleDeptTxt, isDark && styles.darkSubText]}>{selectedArticle.department}</Text>
                </View>
                <Text style={[styles.articleTitle, isDark && styles.darkText]}>{selectedArticle.headline}</Text>
                <Text style={[styles.articleTimeTxt, isDark && styles.darkSubText]}>{selectedArticle.time}</Text>
                <Text style={[styles.articleBody2, isDark && styles.darkSubText]}>{selectedArticle.summary}</Text>
                <Text style={[styles.articleBody2, isDark && styles.darkSubText]}>
                  {'\n'}University administration encourages all students and staff to take note of this announcement. Additional details will be shared via official channels and on the UniConnect platform.{'\n\n'}
                  For inquiries, please contact {selectedArticle.department} directly through the official university portal or visit their office during working hours.
                </Text>
                <View style={styles.articleEngagement}>
                  <TouchableOpacity style={styles.engBtn} onPress={() => toggleLike(selectedArticle.id)}>
                    <Ionicons name={likedNews.has(selectedArticle.id) ? 'heart' : 'heart-outline'} size={22} color={likedNews.has(selectedArticle.id) ? '#EF4444' : '#94A3B8'} />
                    <Text style={[styles.engTxt, isDark && styles.darkSubText]}>{selectedArticle.likes} Likes</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.engBtn}>
                    <Ionicons name="chatbubble-outline" size={22} color="#94A3B8" />
                    <Text style={[styles.engTxt, isDark && styles.darkSubText]}>{selectedArticle.comments} Comments</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.engBtn} onPress={() => toggleSave(selectedArticle.id)}>
                    <Ionicons name={savedNews.has(selectedArticle.id) ? 'bookmark' : 'bookmark-outline'} size={22} color={savedNews.has(selectedArticle.id) ? '#8B5CF6' : '#94A3B8'} />
                    <Text style={[styles.engTxt, isDark && styles.darkSubText]}>Save</Text>
                  </TouchableOpacity>
                </View>
                <View style={{ height: 80 }} />
              </ScrollView>
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
  darkText: { color: '#F8FAFC' },
  darkSubText: { color: '#94A3B8' },
  darkFeedCard: { backgroundColor: '#1E293B' },
  darkCatChip: { backgroundColor: '#1E293B', borderColor: '#334155' },
  darkCatText: { color: '#94A3B8' },
  darkNotice: { backgroundColor: '#1E293B' },
  darkNoticeCard: { backgroundColor: '#0F172A', borderColor: '#334155' },
  darkAlertBanner: { backgroundColor: '#1E0A0A', borderColor: '#7F1D1D' },

  header: { paddingTop: 10, paddingBottom: 20, paddingHorizontal: 20 },
  headerRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 16 },
  backBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.2)', justifyContent: 'center', alignItems: 'center' },
  headerCenter: { flex: 1, alignItems: 'center' },
  headerTitle: { fontSize: 20, fontWeight: '800', color: '#FFFFFF' },
  headerSub: { fontSize: 12, color: 'rgba(255,255,255,0.7)', marginTop: 2 },
  headerActions: { flexDirection: 'row', gap: 8 },
  headerBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.15)', justifyContent: 'center', alignItems: 'center' },
  notifDot: { position: 'absolute', top: 8, right: 8, width: 8, height: 8, borderRadius: 4, backgroundColor: '#EF4444' },
  searchBar: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.15)', borderRadius: 16, paddingHorizontal: 15, paddingVertical: 10, gap: 10 },
  searchInput: { flex: 1, color: '#FFFFFF', fontSize: 14 },

  alertBanner: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FEF2F2', borderWidth: 1, borderColor: '#FECACA', marginHorizontal: 16, marginTop: 12, borderRadius: 12, padding: 10, gap: 8 },
  alertLeft: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  alertPulse: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#EF4444' },
  alertLabel: { fontSize: 11, fontWeight: '800', color: '#EF4444' },
  alertScroll: { flex: 1 },
  alertChip: { backgroundColor: '#FEE2E2', borderRadius: 20, paddingHorizontal: 10, paddingVertical: 4, marginRight: 8 },
  alertChipText: { fontSize: 11, color: '#B91C1C', fontWeight: '600', maxWidth: 150 },

  catScroll: { marginTop: 12 },
  catContent: { paddingHorizontal: 20, paddingVertical: 4, gap: 8 },
  catChip: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#E2E8F0', gap: 6, elevation: 1 },
  catChipActive: { backgroundColor: '#8B5CF6', borderColor: '#8B5CF6' },
  catDot: { width: 6, height: 6, borderRadius: 3 },
  catText: { fontSize: 13, fontWeight: '600', color: '#64748B' },
  catTextActive: { color: '#FFFFFF' },

  noticeSec: { margin: 16, padding: 16, backgroundColor: '#FFFFFF', borderRadius: 20, elevation: 3 },
  noticeHeader: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 12 },
  noticeTitel: { fontSize: 15, fontWeight: '700', color: '#1E293B', flex: 1 },
  seeAll: { marginLeft: 'auto' },
  seeAllText: { fontSize: 12, color: '#8B5CF6', fontWeight: '600' },
  noticeCard: { width: 130, padding: 14, backgroundColor: '#F8FAFC', borderRadius: 16, borderWidth: 1, borderColor: '#E2E8F0' },
  noticeIcon: { width: 36, height: 36, borderRadius: 12, justifyContent: 'center', alignItems: 'center', marginBottom: 8 },
  noticeTitle: { fontSize: 12, fontWeight: '700', color: '#1E293B', marginBottom: 4, lineHeight: 16 },
  noticeDept: { fontSize: 10, color: '#64748B', marginBottom: 4 },
  noticeTime: { fontSize: 10, color: '#94A3B8' },

  topStorySection: { marginHorizontal: 20, marginTop: 8 },
  sectionTitle: { fontSize: 18, fontWeight: '800', color: '#1E293B', marginBottom: 14 },
  topStoryCard: { borderRadius: 24, overflow: 'hidden', height: 220, elevation: 5 },
  topStoryImage: { width: '100%', height: '100%', position: 'absolute' },
  topStoryOverlay: { flex: 1, padding: 20, justifyContent: 'flex-end' },
  categoryPill: { flexDirection: 'row', alignItems: 'center', gap: 4, alignSelf: 'flex-start', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20, marginBottom: 8 },
  catPillText: { fontSize: 11, color: '#FFFFFF', fontWeight: '800' },
  topStoryTitle: { fontSize: 17, fontWeight: '800', color: '#FFFFFF', lineHeight: 22, marginBottom: 8 },
  topStoryMeta: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  topStoryDept: { fontSize: 11, color: 'rgba(255,255,255,0.7)' },
  topStoryStats: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  topStatText: { fontSize: 11, color: 'rgba(255,255,255,0.7)' },

  feedSection: { marginHorizontal: 20, marginTop: 20 },
  feedCard: { backgroundColor: '#FFFFFF', borderRadius: 18, marginBottom: 14, overflow: 'hidden', elevation: 3 },
  urgentBadge: { backgroundColor: '#FEE2E2', paddingHorizontal: 12, paddingVertical: 4 },
  urgentText: { fontSize: 10, fontWeight: '900', color: '#EF4444' },
  feedCardContent: { flexDirection: 'row', padding: 12, gap: 12 },
  feedThumb: { width: 100, height: 100, borderRadius: 12 },
  feedInfo: { flex: 1 },
  feedCatBadge: { alignSelf: 'flex-start', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8, marginBottom: 6 },
  feedCatText: { fontSize: 9, fontWeight: '800' },
  feedHeadline: { fontSize: 13, fontWeight: '700', color: '#1E293B', lineHeight: 18, marginBottom: 4 },
  feedDept: { fontSize: 11, color: '#94A3B8', marginBottom: 8 },
  feedStats: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  statItem: { flexDirection: 'row', alignItems: 'center', gap: 3 },
  statCount: { fontSize: 11, color: '#94A3B8' },

  articleContainer: { flex: 1, backgroundColor: '#FFFFFF' },
  articleImage: { width: '100%', height: 260 },
  articleImgOverlay: { position: 'absolute', top: 0, left: 0, right: 0, height: 100, paddingTop: 50, paddingHorizontal: 20 },
  articleBackBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' },
  articleBody: { flex: 1, padding: 22, marginTop: -28, borderTopLeftRadius: 28, borderTopRightRadius: 28, backgroundColor: '#FFFFFF' },
  urgentBanner: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: '#EF4444', padding: 10, borderRadius: 10, marginBottom: 16 },
  urgentBannerText: { color: '#FFFFFF', fontWeight: '800', fontSize: 12 },
  articleCatRow: { borderLeftWidth: 4, paddingLeft: 10, marginBottom: 12, flexDirection: 'row', alignItems: 'center', gap: 10 },
  articleCatTxt: { fontSize: 13, fontWeight: '800', textTransform: 'uppercase' },
  articleDeptTxt: { fontSize: 12, color: '#64748B' },
  articleTitle: { fontSize: 21, fontWeight: '900', color: '#1E293B', lineHeight: 27, marginBottom: 8 },
  articleTimeTxt: { fontSize: 12, color: '#94A3B8', marginBottom: 16 },
  articleBody2: { fontSize: 15, color: '#475569', lineHeight: 24 },
  articleEngagement: { flexDirection: 'row', gap: 16, marginTop: 24, paddingTop: 16, borderTopWidth: 1, borderTopColor: '#F1F5F9' },
  engBtn: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  engTxt: { fontSize: 13, color: '#64748B', fontWeight: '600' },
});
