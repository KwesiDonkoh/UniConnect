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
  FlatList,
  Image,
  Modal,
  Share,
  RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../components/ThemeProvider';

const { width, height } = Dimensions.get('window');

const CATEGORIES = [
  { id: 'all', label: 'All', icon: 'globe' },
  { id: 'technology', label: 'Technology', icon: 'hardware-chip' },
  { id: 'research', label: 'Research', icon: 'flask' },
  { id: 'science', label: 'Science', icon: 'telescope' },
  { id: 'career', label: 'Career', icon: 'briefcase' },
  { id: 'sports', label: 'Sports', icon: 'trophy' },
  { id: 'culture', label: 'Culture', icon: 'earth' },
];

const GLOBAL_NEWS = [
  {
    id: '1',
    headline: 'AI Breakthrough: New Language Model Surpasses Human Benchmarks in Medical Diagnosis',
    category: 'technology',
    source: 'MIT Technology Review',
    time: '2h ago',
    readTime: '4 min read',
    image: 'https://images.unsplash.com/photo-1677442135703-1787eea5ce01?w=800',
    summary: 'Researchers at MIT and Stanford have developed a new large language model that demonstrates unprecedented accuracy in medical diagnostics, potentially revolutionizing healthcare delivery worldwide.',
    tags: ['AI', 'Healthcare', 'Machine Learning'],
    likes: 1243,
    comments: 87,
    bookmarked: false,
  },
  {
    id: '2',
    headline: 'Global Student Innovation Fund Launches $50M Grant Program for African Universities',
    category: 'research',
    source: 'Nature Education',
    time: '4h ago',
    readTime: '3 min read',
    image: 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=800',
    summary: 'A new international fund targeting African universities has been established, with KNUST and University of Ghana among the first beneficiaries of the groundbreaking research initiative.',
    tags: ['Education', 'Africa', 'Research Funding'],
    likes: 876,
    comments: 54,
    bookmarked: true,
  },
  {
    id: '3',
    headline: 'Quantum Computing Reaches New Milestone: Error Rate Below 1% Achieved',
    category: 'science',
    source: 'Science Magazine',
    time: '6h ago',
    readTime: '5 min read',
    image: 'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=800',
    summary: 'Google and IBM jointly announced a significant quantum computing milestone, achieving error rates below 1% — a crucial threshold for practical quantum applications in cryptography and drug discovery.',
    tags: ['Quantum', 'Computing', 'Innovation'],
    likes: 2104,
    comments: 143,
    bookmarked: false,
  },
  {
    id: '4',
    headline: 'Top 10 Emerging Tech Skills That Will Define the 2025 Job Market',
    category: 'career',
    source: 'World Economic Forum',
    time: '8h ago',
    readTime: '6 min read',
    image: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800',
    summary: 'The World Economic Forum releases its annual future-of-work report, highlighting generative AI, green technology engineering, and cybersecurity as the most in-demand emerging skills globally.',
    tags: ['Career', 'Skills', 'Future of Work'],
    likes: 3421,
    comments: 221,
    bookmarked: false,
  },
  {
    id: '5',
    headline: 'Africa Cup of Nations 2025: Ghana Advances After Stunning Victory',
    category: 'sports',
    source: 'BBC Sports',
    time: '1h ago',
    readTime: '2 min read',
    image: 'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?w=800',
    summary: 'Ghana secured a spot in the quarter-finals with a dramatic last-minute goal, igniting celebrations across the country and university campuses nationwide.',
    tags: ['Football', 'Ghana', 'AFCON'],
    likes: 5612,
    comments: 389,
    bookmarked: false,
  },
  {
    id: '6',
    headline: 'UNESCO World Heritage: Ghana\'s Traditional Kente Weaving Earns Global Recognition',
    category: 'culture',
    source: 'UNESCO',
    time: '12h ago',
    readTime: '3 min read',
    image: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800',
    summary: 'Ghana\'s iconic Kente cloth weaving tradition has been added to the UNESCO Intangible Cultural Heritage list, honoring the Ashanti and Ewe people\'s centuries-old artistry.',
    tags: ['Culture', 'Ghana', 'UNESCO'],
    likes: 4231,
    comments: 178,
    bookmarked: true,
  },
];

const TRENDING_TOPICS = ['#AI2025', '#QuantumLeap', '#AfricaTech', '#GhanaSports', '#KNUSTInnovates'];

export default function GlobalNewsScreen({ navigation }) {
  const { isDark } = useTheme();
  const [activeCategory, setActiveCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [news, setNews] = useState(GLOBAL_NEWS);
  const [selectedArticle, setSelectedArticle] = useState(null);
  const [showArticle, setShowArticle] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [bookmarks, setBookmarks] = useState(new Set(['2', '6']));
  const [likedArticles, setLikedArticles] = useState(new Set());
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, { toValue: 1, duration: 600, useNativeDriver: true }).start();
  }, []);

  const filteredNews = news.filter(article => {
    const matchCat = activeCategory === 'all' || article.category === activeCategory;
    const matchSearch = !searchQuery || article.headline.toLowerCase().includes(searchQuery.toLowerCase());
    return matchCat && matchSearch;
  });

  const featuredArticle = filteredNews[0];
  const remainingNews = filteredNews.slice(1);

  const handleRefresh = async () => {
    setRefreshing(true);
    await new Promise(r => setTimeout(r, 1200));
    setRefreshing(false);
  };

  const toggleBookmark = (id) => {
    setBookmarks(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  const toggleLike = (id) => {
    setLikedArticles(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  const openArticle = (article) => {
    setSelectedArticle(article);
    setShowArticle(true);
  };

  const shareArticle = async (article) => {
    try {
      await Share.share({ message: `${article.headline}\n\nRead more on UniConnect Global News`, title: article.headline });
    } catch { }
  };

  const getCategoryColor = (cat) => {
    const colors = {
      technology: '#6366F1', research: '#8B5CF6', science: '#0EA5E9',
      career: '#10B981', sports: '#F59E0B', culture: '#EC4899', all: '#6366F1'
    };
    return colors[cat] || '#6366F1';
  };

  const renderFeaturedArticle = () => {
    if (!featuredArticle) return null;
    return (
      <TouchableOpacity style={styles.featuredCard} onPress={() => openArticle(featuredArticle)} activeOpacity={0.9}>
        <Image source={{ uri: featuredArticle.image }} style={styles.featuredImage} />
        <LinearGradient colors={['transparent', 'rgba(0,0,0,0.85)']} style={styles.featuredOverlay}>
          <View style={styles.featuredBadge}>
            <View style={[styles.catDot, { backgroundColor: getCategoryColor(featuredArticle.category) }]} />
            <Text style={styles.featuredBadgeText}>{featuredArticle.source}</Text>
          </View>
          <Text style={styles.featuredHeadline} numberOfLines={3}>{featuredArticle.headline}</Text>
          <View style={styles.featuredMeta}>
            <Text style={styles.featuredTime}>{featuredArticle.time} • {featuredArticle.readTime}</Text>
            <View style={styles.featuredActions}>
              <TouchableOpacity onPress={() => toggleBookmark(featuredArticle.id)} style={styles.iconBtn}>
                <Ionicons name={bookmarks.has(featuredArticle.id) ? 'bookmark' : 'bookmark-outline'} size={20} color="#FFFFFF" />
              </TouchableOpacity>
              <TouchableOpacity onPress={() => shareArticle(featuredArticle)} style={styles.iconBtn}>
                <Ionicons name="share-outline" size={20} color="#FFFFFF" />
              </TouchableOpacity>
            </View>
          </View>
        </LinearGradient>
      </TouchableOpacity>
    );
  };

  const renderNewsCard = ({ item }) => (
    <TouchableOpacity
      style={[styles.newsCard, isDark && styles.darkCard]}
      onPress={() => openArticle(item)}
      activeOpacity={0.85}
    >
      <Image source={{ uri: item.image }} style={styles.newsThumb} />
      <View style={styles.newsContent}>
        <View style={styles.newsTopRow}>
          <View style={[styles.catBadge, { backgroundColor: getCategoryColor(item.category) + '20' }]}>
            <Text style={[styles.catBadgeText, { color: getCategoryColor(item.category) }]}>
              {item.category.toUpperCase()}
            </Text>
          </View>
          <Text style={[styles.newsTime, isDark && styles.darkSubText]}>{item.time}</Text>
        </View>
        <Text style={[styles.newsHeadline, isDark && styles.darkText]} numberOfLines={2}>{item.headline}</Text>
        <Text style={[styles.newsSource, isDark && styles.darkSubText]}>{item.source} • {item.readTime}</Text>
        <View style={styles.newsFooter}>
          <TouchableOpacity style={styles.likeRow} onPress={() => toggleLike(item.id)}>
            <Ionicons name={likedArticles.has(item.id) ? 'heart' : 'heart-outline'} size={14} color={likedArticles.has(item.id) ? '#EF4444' : '#94A3B8'} />
            <Text style={[styles.footerCount, isDark && styles.darkSubText]}>{item.likes + (likedArticles.has(item.id) ? 1 : 0)}</Text>
          </TouchableOpacity>
          <View style={styles.likeRow}>
            <Ionicons name="chatbubble-outline" size={14} color="#94A3B8" />
            <Text style={[styles.footerCount, isDark && styles.darkSubText]}>{item.comments}</Text>
          </View>
          <TouchableOpacity onPress={() => toggleBookmark(item.id)}>
            <Ionicons name={bookmarks.has(item.id) ? 'bookmark' : 'bookmark-outline'} size={16} color={bookmarks.has(item.id) ? '#6366F1' : '#94A3B8'} />
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={[styles.container, isDark && styles.darkContainer]}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />

      {/* Header */}
      <LinearGradient colors={isDark ? ['#0F172A', '#1E293B'] : ['#4F46E5', '#6366F1']} style={styles.header}>
        <View style={styles.headerRow}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
          </TouchableOpacity>
          <View style={styles.headerCenter}>
            <Text style={styles.headerTitle}>🌐 Global News</Text>
            <Text style={styles.headerSub}>Stay informed worldwide</Text>
          </View>
          <TouchableOpacity style={styles.headerAction}>
            <Ionicons name="notifications-outline" size={22} color="#FFFFFF" />
          </TouchableOpacity>
        </View>

        {/* Search */}
        <View style={styles.searchBar}>
          <Ionicons name="search" size={18} color="#94A3B8" />
          <TextInput
            style={styles.searchInput}
            placeholder="Search global news..."
            placeholderTextColor="#94A3B8"
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

      <Animated.View style={{ flex: 1, opacity: fadeAnim }}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} colors={['#6366F1']} />}
        >
          {/* Categories */}
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.catScroll} contentContainerStyle={styles.catContent}>
            {CATEGORIES.map(cat => (
              <TouchableOpacity
                key={cat.id}
                style={[styles.catChip, activeCategory === cat.id && { backgroundColor: getCategoryColor(cat.id) }]}
                onPress={() => setActiveCategory(cat.id)}
              >
                <Ionicons name={cat.icon} size={14} color={activeCategory === cat.id ? '#FFFFFF' : (isDark ? '#94A3B8' : '#64748B')} />
                <Text style={[styles.catChipText, activeCategory === cat.id && { color: '#FFFFFF' }, isDark && activeCategory !== cat.id && { color: '#94A3B8' }]}>
                  {cat.label}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          {/* Trending */}
          <View style={[styles.trendingSection, isDark && styles.darkSection]}>
            <View style={styles.trendingHeader}>
              <Ionicons name="trending-up" size={16} color="#EF4444" />
              <Text style={[styles.trendingTitle, isDark && styles.darkText]}>Trending</Text>
            </View>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.trendingScroll}>
              {TRENDING_TOPICS.map((topic, i) => (
                <TouchableOpacity key={i} style={[styles.trendingChip, isDark && styles.darkTrendChip]}>
                  <Text style={[styles.trendingChipText, isDark && styles.darkText]}>{topic}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          {/* Featured Article */}
          {!searchQuery && (
            <View style={styles.featuredSection}>
              <Text style={[styles.sectionTitle, isDark && styles.darkText]}>Featured</Text>
              {renderFeaturedArticle()}
            </View>
          )}

          {/* News List */}
          <View style={styles.listSection}>
            <Text style={[styles.sectionTitle, isDark && styles.darkText]}>
              {searchQuery ? `Results for "${searchQuery}"` : 'Latest Stories'}
              <Text style={[styles.countText, isDark && styles.darkSubText]}> ({filteredNews.length})</Text>
            </Text>
            {(searchQuery ? filteredNews : remainingNews).map(item => (
              <View key={item.id}>{renderNewsCard({ item })}</View>
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
              <LinearGradient colors={['rgba(0,0,0,0.7)', 'transparent']} style={styles.articleImageOverlay}>
                <TouchableOpacity onPress={() => setShowArticle(false)} style={styles.articleBack}>
                  <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
                </TouchableOpacity>
                <View style={styles.articleTopActions}>
                  <TouchableOpacity onPress={() => toggleBookmark(selectedArticle.id)} style={styles.articleActionBtn}>
                    <Ionicons name={bookmarks.has(selectedArticle.id) ? 'bookmark' : 'bookmark-outline'} size={22} color="#FFFFFF" />
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => shareArticle(selectedArticle)} style={styles.articleActionBtn}>
                    <Ionicons name="share-social" size={22} color="#FFFFFF" />
                  </TouchableOpacity>
                </View>
              </LinearGradient>
              <ScrollView style={styles.articleBody} showsVerticalScrollIndicator={false}>
                <View style={styles.articleMeta}>
                  <View style={[styles.catBadge, { backgroundColor: getCategoryColor(selectedArticle.category) + '20' }]}>
                    <Text style={[styles.catBadgeText, { color: getCategoryColor(selectedArticle.category) }]}>
                      {selectedArticle.category.toUpperCase()}
                    </Text>
                  </View>
                  <Text style={[styles.articleTime, isDark && styles.darkSubText]}>{selectedArticle.time} • {selectedArticle.readTime}</Text>
                </View>
                <Text style={[styles.articleTitle, isDark && styles.darkText]}>{selectedArticle.headline}</Text>
                <View style={styles.articleSourceRow}>
                  <View style={styles.sourceAvatar}>
                    <Ionicons name="newspaper" size={16} color="#6366F1" />
                  </View>
                  <Text style={[styles.articleSource, isDark && styles.darkSubText]}>{selectedArticle.source}</Text>
                </View>
                <Text style={[styles.articleSummary, isDark && styles.darkSubText]}>{selectedArticle.summary}</Text>
                <Text style={[styles.articleSummary, isDark && styles.darkSubText]}>
                  {'\n'}This development marks a significant shift in how universities and research institutions approach collaborative problem-solving. Experts from across the globe are weighing in on the long-term implications for academia and industry alike.{'\n\n'}
                  Students and educators are encouraged to explore the resources and opportunities this creates in their respective fields. The intersection of technology, policy, and human potential continues to shape the global educational landscape.
                </Text>
                <View style={styles.articleTags}>
                  {selectedArticle.tags.map((tag, i) => (
                    <View key={i} style={[styles.tagChip, isDark && { backgroundColor: '#1E293B' }]}>
                      <Text style={[styles.tagText, isDark && styles.darkSubText]}>#{tag}</Text>
                    </View>
                  ))}
                </View>
                <View style={styles.articleEngagement}>
                  <TouchableOpacity style={styles.engageBtn} onPress={() => toggleLike(selectedArticle.id)}>
                    <Ionicons name={likedArticles.has(selectedArticle.id) ? 'heart' : 'heart-outline'} size={20} color={likedArticles.has(selectedArticle.id) ? '#EF4444' : (isDark ? '#94A3B8' : '#64748B')} />
                    <Text style={[styles.engageBtnText, isDark && styles.darkSubText]}>{selectedArticle.likes} Likes</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.engageBtn}>
                    <Ionicons name="chatbubble-outline" size={20} color={isDark ? '#94A3B8' : '#64748B'} />
                    <Text style={[styles.engageBtnText, isDark && styles.darkSubText]}>{selectedArticle.comments} Comments</Text>
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
  darkCard: { backgroundColor: '#1E293B' },
  darkSection: { backgroundColor: '#1E293B' },
  darkText: { color: '#F8FAFC' },
  darkSubText: { color: '#94A3B8' },
  darkTrendChip: { backgroundColor: '#1E293B', borderColor: '#334155' },

  header: { paddingTop: 10, paddingBottom: 20, paddingHorizontal: 20 },
  headerRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 16 },
  backBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.2)', justifyContent: 'center', alignItems: 'center' },
  headerCenter: { flex: 1, alignItems: 'center' },
  headerTitle: { fontSize: 20, fontWeight: '800', color: '#FFFFFF' },
  headerSub: { fontSize: 12, color: 'rgba(255,255,255,0.7)', marginTop: 2 },
  headerAction: { width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.15)', justifyContent: 'center', alignItems: 'center' },
  searchBar: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.15)', borderRadius: 16, paddingHorizontal: 15, paddingVertical: 10, gap: 10 },
  searchInput: { flex: 1, color: '#FFFFFF', fontSize: 14 },

  catScroll: { marginTop: 12 },
  catContent: { paddingHorizontal: 20, paddingVertical: 4, gap: 10 },
  catChip: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, backgroundColor: '#FFFFFF', gap: 6, borderWidth: 1, borderColor: '#E2E8F0', elevation: 1 },
  catChipText: { fontSize: 13, fontWeight: '600', color: '#64748B' },

  trendingSection: { marginHorizontal: 20, marginTop: 16, padding: 14, borderRadius: 16, backgroundColor: '#FFFFFF', elevation: 2 },
  trendingHeader: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 10 },
  trendingTitle: { fontSize: 13, fontWeight: '700', color: '#1E293B' },
  trendingScroll: { gap: 8 },
  trendingChip: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20, backgroundColor: '#FEF3C7', borderWidth: 1, borderColor: '#FDE68A' },
  trendingChipText: { fontSize: 12, fontWeight: '700', color: '#92400E' },

  featuredSection: { marginHorizontal: 20, marginTop: 20 },
  sectionTitle: { fontSize: 18, fontWeight: '800', color: '#1E293B', marginBottom: 12 },
  countText: { fontSize: 14, fontWeight: '400', color: '#94A3B8' },
  featuredCard: { borderRadius: 24, overflow: 'hidden', elevation: 6, height: 240 },
  featuredImage: { width: '100%', height: '100%', position: 'absolute' },
  featuredOverlay: { flex: 1, padding: 20, justifyContent: 'flex-end' },
  featuredBadge: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 8 },
  catDot: { width: 8, height: 8, borderRadius: 4 },
  featuredBadgeText: { fontSize: 11, color: 'rgba(255,255,255,0.85)', fontWeight: '600' },
  featuredHeadline: { fontSize: 17, fontWeight: '800', color: '#FFFFFF', lineHeight: 22, marginBottom: 10 },
  featuredMeta: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  featuredTime: { fontSize: 11, color: 'rgba(255,255,255,0.7)' },
  featuredActions: { flexDirection: 'row', gap: 8 },
  iconBtn: { width: 32, height: 32, borderRadius: 16, backgroundColor: 'rgba(255,255,255,0.2)', justifyContent: 'center', alignItems: 'center' },

  listSection: { marginHorizontal: 20, marginTop: 20 },
  newsCard: { flexDirection: 'row', backgroundColor: '#FFFFFF', borderRadius: 18, marginBottom: 14, overflow: 'hidden', elevation: 3 },
  newsThumb: { width: 110, height: 120 },
  newsContent: { flex: 1, padding: 12 },
  newsTopRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 },
  catBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8 },
  catBadgeText: { fontSize: 9, fontWeight: '800' },
  newsTime: { fontSize: 10, color: '#94A3B8' },
  newsHeadline: { fontSize: 13, fontWeight: '700', color: '#1E293B', lineHeight: 18, marginBottom: 4 },
  newsSource: { fontSize: 11, color: '#94A3B8', marginBottom: 8 },
  newsFooter: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  likeRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  footerCount: { fontSize: 11, color: '#94A3B8' },

  articleContainer: { flex: 1, backgroundColor: '#FFFFFF' },
  articleImage: { width: '100%', height: 300 },
  articleImageOverlay: { position: 'absolute', top: 0, left: 0, right: 0, height: 120, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', paddingTop: 50, paddingHorizontal: 20 },
  articleBack: { width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'center', alignItems: 'center' },
  articleTopActions: { flexDirection: 'row', gap: 10 },
  articleActionBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'center', alignItems: 'center' },
  articleBody: { flex: 1, padding: 24, marginTop: -30, backgroundColor: '#FFFFFF', borderTopLeftRadius: 30, borderTopRightRadius: 30 },
  articleMeta: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 14 },
  articleTime: { fontSize: 12, color: '#94A3B8' },
  articleTitle: { fontSize: 22, fontWeight: '900', color: '#1E293B', lineHeight: 28, marginBottom: 16 },
  articleSourceRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 20 },
  sourceAvatar: { width: 32, height: 32, borderRadius: 16, backgroundColor: '#EEF2FF', justifyContent: 'center', alignItems: 'center' },
  articleSource: { fontSize: 13, fontWeight: '600', color: '#64748B' },
  articleSummary: { fontSize: 15, color: '#475569', lineHeight: 24 },
  articleTags: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 20 },
  tagChip: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20, backgroundColor: '#EEF2FF' },
  tagText: { fontSize: 12, color: '#6366F1', fontWeight: '600' },
  articleEngagement: { flexDirection: 'row', gap: 20, marginTop: 20, paddingTop: 16, borderTopWidth: 1, borderTopColor: '#F1F5F9' },
  engageBtn: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  engageBtnText: { fontSize: 13, color: '#64748B', fontWeight: '600' },
});
