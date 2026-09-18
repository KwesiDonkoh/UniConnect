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
  TextInput,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../components/ThemeProvider';

const { width } = Dimensions.get('window');

const CATEGORIES = ['All', 'Textbooks', 'Past Questions', 'Notes', 'Research', 'Videos'];

const MATERIALS = [
  { id: '1', title: 'Operating Systems - Silberschatz', type: 'Textbook', course: 'CSM301', size: '4.2 MB', pages: 944, downloads: 1240, bookmarked: true, category: 'Textbooks', color: '#6366F1', downloaded: true },
  { id: '2', title: 'Database Systems Complete Guide', type: 'Textbook', course: 'CSM305', size: '6.8 MB', pages: 1200, downloads: 980, bookmarked: false, category: 'Textbooks', color: '#10B981', downloaded: false },
  { id: '3', title: 'CSM301 Past Questions 2019-2023', type: 'Past Q', course: 'CSM301', size: '1.1 MB', pages: 45, downloads: 3200, bookmarked: true, category: 'Past Questions', color: '#F59E0B', downloaded: true },
  { id: '4', title: 'Algorithm Analysis Notes - Prof. Osei', type: 'Notes', course: 'CSM311', size: '860 KB', pages: 88, downloads: 560, bookmarked: false, category: 'Notes', color: '#8B5CF6', downloaded: false },
  { id: '5', title: 'Software Engineering SRS Template', type: 'Notes', course: 'CSM309', size: '420 KB', pages: 22, downloads: 890, bookmarked: false, category: 'Notes', color: '#EC4899', downloaded: false },
  { id: '6', title: 'Computer Networks Tanenbaum 5th Ed', type: 'Textbook', course: 'CSM303', size: '8.1 MB', pages: 950, downloads: 2100, bookmarked: false, category: 'Textbooks', color: '#EF4444', downloaded: false },
  { id: '7', title: 'Machine Learning Research Papers 2024', type: 'Research', course: 'CSM411', size: '2.3 MB', pages: 120, downloads: 430, bookmarked: true, category: 'Research', color: '#0EA5E9', downloaded: true },
  { id: '8', title: 'CSM305 Past Questions 2020-2023', type: 'Past Q', course: 'CSM305', size: '900 KB', pages: 38, downloads: 2800, bookmarked: false, category: 'Past Questions', color: '#F59E0B', downloaded: false },
];

export default function DigitalLibraryVaultScreen({ navigation }) {
  const { isDark } = useTheme();
  const [category, setCategory] = useState('All');
  const [search, setSearch] = useState('');
  const [materials, setMaterials] = useState(MATERIALS);
  const [selected, setSelected] = useState(null);
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, { toValue: 1, duration: 600, useNativeDriver: true }).start();
  }, []);

  const theme = {
    bg: isDark ? '#020617' : '#F8FAFC',
    card: isDark ? '#1E293B' : '#FFFFFF',
    text: isDark ? '#F1F5F9' : '#1E293B',
    sub: isDark ? '#94A3B8' : '#64748B',
    border: isDark ? '#334155' : '#E2E8F0',
    input: isDark ? '#0F172A' : '#F1F5F9',
  };

  const filtered = materials.filter(m => {
    const matchCat = category === 'All' || m.category === category;
    const matchSearch = m.title.toLowerCase().includes(search.toLowerCase()) ||
      m.course.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSearch;
  });

  const bookmarked = materials.filter(m => m.bookmarked);
  const downloaded = materials.filter(m => m.downloaded);

  const toggleBookmark = (id) => {
    setMaterials(prev => prev.map(m => m.id === id ? { ...m, bookmarked: !m.bookmarked } : m));
  };

  const toggleDownload = (id) => {
    const m = materials.find(x => x.id === id);
    if (m?.downloaded) return;
    Alert.alert('Downloading...', `"${m?.title}" is being saved to your offline vault.`, [
      { text: 'OK', onPress: () => setMaterials(prev => prev.map(x => x.id === id ? { ...x, downloaded: true } : x)) }
    ]);
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.bg }]}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />

      {/* Header */}
      <LinearGradient colors={isDark ? ['#064E3B', '#020617'] : ['#10B981', '#059669']} style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color="#FFF" />
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>Digital Library Vault</Text>
          <Text style={styles.headerSub}>{materials.length} resources · {downloaded.length} offline</Text>
        </View>
        <TouchableOpacity style={styles.iconBtn} onPress={() => Alert.alert('Upload', 'Share your materials with the community!')}>
          <Ionicons name="cloud-upload" size={22} color="#FFF" />
        </TouchableOpacity>
      </LinearGradient>

      <Animated.ScrollView style={{ opacity: fadeAnim }} showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scroll}>

        {/* Search Bar */}
        <View style={[styles.searchBox, { backgroundColor: theme.input, borderColor: theme.border }]}>
          <Ionicons name="search" size={18} color={theme.sub} />
          <TextInput placeholder="Search titles, courses..." placeholderTextColor={theme.sub}
            value={search} onChangeText={setSearch}
            style={[styles.searchInput, { color: theme.text }]} />
          {search.length > 0 && (
            <TouchableOpacity onPress={() => setSearch('')}>
              <Ionicons name="close-circle" size={18} color={theme.sub} />
            </TouchableOpacity>
          )}
        </View>

        {/* Vault Stats */}
        <View style={styles.vaultStats}>
          {[
            { label: 'Resources', value: materials.length, icon: 'library', color: '#10B981' },
            { label: 'Bookmarked', value: bookmarked.length, icon: 'bookmark', color: '#F59E0B' },
            { label: 'Offline', value: downloaded.length, icon: 'cloud-offline', color: '#6366F1' },
          ].map(s => (
            <View key={s.label} style={[styles.vaultStatCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
              <LinearGradient colors={[s.color, s.color + 'CC']} style={styles.vaultStatIcon}>
                <Ionicons name={s.icon} size={18} color="#FFF" />
              </LinearGradient>
              <Text style={[styles.vaultStatNum, { color: theme.text }]}>{s.value}</Text>
              <Text style={[styles.vaultStatLabel, { color: theme.sub }]}>{s.label}</Text>
            </View>
          ))}
        </View>

        {/* Offline Note */}
        <View style={[styles.offlineBanner, { backgroundColor: isDark ? '#1E293B' : '#EFF6FF' }]}>
          <Ionicons name="cloud-offline" size={16} color="#6366F1" />
          <Text style={[styles.offlineBannerText, { color: theme.text }]}>
            <Text style={{ fontWeight: '900', color: '#6366F1' }}>{downloaded.length} books</Text> saved to your local vault — available without internet.
          </Text>
        </View>

        {/* Category Filter */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.catScroll}
          contentContainerStyle={styles.catContent}>
          {CATEGORIES.map(c => (
            <TouchableOpacity key={c} style={[styles.catChip, category === c && styles.catChipActive]}
              onPress={() => setCategory(c)}>
              <Text style={[styles.catText, category === c && styles.catTextActive]}>{c}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Materials List */}
        {filtered.length === 0 ? (
          <View style={styles.empty}>
            <Ionicons name="search" size={48} color={theme.sub} />
            <Text style={[styles.emptyTitle, { color: theme.text }]}>No results found</Text>
          </View>
        ) : (
          filtered.map(m => (
            <TouchableOpacity key={m.id} style={[styles.matCard, { backgroundColor: theme.card, borderColor: theme.border }]}
              onPress={() => setSelected(m)} activeOpacity={0.85}>
              <View style={[styles.matIcon, { backgroundColor: m.color + '20' }]}>
                <Ionicons name={m.category === 'Past Questions' ? 'help-circle' : m.category === 'Research' ? 'flask' : m.category === 'Videos' ? 'videocam' : m.category === 'Notes' ? 'document-text' : 'book'} size={24} color={m.color} />
              </View>
              <View style={styles.matInfo}>
                <Text style={[styles.matTitle, { color: theme.text }]} numberOfLines={2}>{m.title}</Text>
                <View style={styles.matMeta}>
                  <Text style={[styles.matCourse, { color: m.color }]}>{m.course}</Text>
                  <Text style={[styles.matSize, { color: theme.sub }]}>{m.size} · {m.pages}p</Text>
                </View>
                <View style={styles.matStats}>
                  <Ionicons name="download" size={11} color={theme.sub} />
                  <Text style={[styles.matStatText, { color: theme.sub }]}>{m.downloads.toLocaleString()}</Text>
                </View>
              </View>
              <View style={styles.matActions}>
                <TouchableOpacity onPress={() => toggleBookmark(m.id)} style={styles.iconActionBtn}>
                  <Ionicons name={m.bookmarked ? 'bookmark' : 'bookmark-outline'} size={20}
                    color={m.bookmarked ? '#F59E0B' : theme.sub} />
                </TouchableOpacity>
                <TouchableOpacity onPress={() => toggleDownload(m.id)} style={styles.iconActionBtn}>
                  <Ionicons name={m.downloaded ? 'cloud-done' : 'cloud-download-outline'} size={20}
                    color={m.downloaded ? '#10B981' : theme.sub} />
                </TouchableOpacity>
              </View>
            </TouchableOpacity>
          ))
        )}
        <View style={{ height: 40 }} />
      </Animated.ScrollView>

      {/* Detail Modal */}
      <Modal visible={!!selected} transparent animationType="slide" onRequestClose={() => setSelected(null)}>
        <View style={styles.modalOverlay}>
          {selected && (
            <View style={[styles.detailSheet, { backgroundColor: theme.card }]}>
              <View style={styles.detailHandle} />
              <View style={[styles.detailIcon, { backgroundColor: selected.color + '20' }]}>
                <Ionicons name="book" size={32} color={selected.color} />
              </View>
              <Text style={[styles.detailTitle, { color: theme.text }]}>{selected.title}</Text>
              <Text style={[styles.detailCourse, { color: selected.color }]}>{selected.course} · {selected.type}</Text>
              <View style={styles.detailMeta}>
                {[
                  { label: 'SIZE', value: selected.size },
                  { label: 'PAGES', value: selected.pages },
                  { label: 'DOWNLOADS', value: selected.downloads.toLocaleString() },
                ].map(d => (
                  <View key={d.label} style={styles.detailMetaItem}>
                    <Text style={[styles.metaLabel, { color: theme.sub }]}>{d.label}</Text>
                    <Text style={[styles.metaValue, { color: theme.text }]}>{d.value}</Text>
                  </View>
                ))}
              </View>
              <View style={styles.detailBtns}>
                <TouchableOpacity style={[styles.dBtn, { borderColor: theme.border }]} onPress={() => setSelected(null)}>
                  <Text style={{ color: theme.sub, fontWeight: '700' }}>Back</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.dBtnPrimary, { backgroundColor: selected.color }]}
                  onPress={() => { toggleDownload(selected.id); setSelected(null); }}>
                  <Ionicons name={selected.downloaded ? 'cloud-done' : 'cloud-download'} size={18} color="#FFF" />
                  <Text style={{ color: '#FFF', fontWeight: '800' }}>{selected.downloaded ? 'Saved Offline' : 'Download'}</Text>
                </TouchableOpacity>
              </View>
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
  iconBtn: { width: 40, alignItems: 'flex-end' },
  scroll: { paddingBottom: 30 },
  searchBox: { flexDirection: 'row', alignItems: 'center', margin: 20, paddingHorizontal: 16, paddingVertical: 12, borderRadius: 16, borderWidth: 1, gap: 10 },
  searchInput: { flex: 1, fontSize: 15, fontWeight: '600' },
  vaultStats: { flexDirection: 'row', paddingHorizontal: 20, gap: 12, marginBottom: 16 },
  vaultStatCard: { flex: 1, borderRadius: 18, padding: 14, alignItems: 'center', borderWidth: 1, gap: 6 },
  vaultStatIcon: { width: 38, height: 38, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
  vaultStatNum: { fontSize: 22, fontWeight: '900' },
  vaultStatLabel: { fontSize: 10, fontWeight: '700' },
  offlineBanner: { flexDirection: 'row', alignItems: 'center', gap: 8, marginHorizontal: 20, padding: 12, borderRadius: 14, marginBottom: 16 },
  offlineBannerText: { flex: 1, fontSize: 12, fontWeight: '600', lineHeight: 18 },
  catScroll: { marginBottom: 16 },
  catContent: { paddingHorizontal: 20, gap: 10 },
  catChip: { paddingHorizontal: 18, paddingVertical: 8, borderRadius: 20, backgroundColor: 'rgba(16,185,129,0.08)' },
  catChipActive: { backgroundColor: '#10B981' },
  catText: { fontSize: 13, fontWeight: '700', color: '#10B981' },
  catTextActive: { color: '#FFF' },
  matCard: { flexDirection: 'row', alignItems: 'center', marginHorizontal: 20, marginBottom: 12, borderRadius: 18, padding: 14, borderWidth: 1, gap: 12 },
  matIcon: { width: 52, height: 52, borderRadius: 16, justifyContent: 'center', alignItems: 'center' },
  matInfo: { flex: 1, gap: 4 },
  matTitle: { fontSize: 14, fontWeight: '800', lineHeight: 20 },
  matMeta: { flexDirection: 'row', gap: 8, alignItems: 'center' },
  matCourse: { fontSize: 11, fontWeight: '800' },
  matSize: { fontSize: 11, fontWeight: '600' },
  matStats: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  matStatText: { fontSize: 11, fontWeight: '600' },
  matActions: { gap: 8 },
  iconActionBtn: { padding: 4 },
  empty: { alignItems: 'center', paddingVertical: 60, gap: 12 },
  emptyTitle: { fontSize: 18, fontWeight: '900' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  detailSheet: { borderTopLeftRadius: 28, borderTopRightRadius: 28, padding: 24, gap: 12, alignItems: 'center' },
  detailHandle: { width: 40, height: 4, borderRadius: 2, backgroundColor: '#94A3B8', marginBottom: 8 },
  detailIcon: { width: 72, height: 72, borderRadius: 22, justifyContent: 'center', alignItems: 'center' },
  detailTitle: { fontSize: 20, fontWeight: '900', textAlign: 'center' },
  detailCourse: { fontSize: 13, fontWeight: '800' },
  detailMeta: { flexDirection: 'row', gap: 20, paddingVertical: 16 },
  detailMetaItem: { alignItems: 'center', gap: 4 },
  metaLabel: { fontSize: 9, fontWeight: '900', letterSpacing: 1 },
  metaValue: { fontSize: 16, fontWeight: '900' },
  detailBtns: { flexDirection: 'row', gap: 12, width: '100%', marginTop: 8 },
  dBtn: { flex: 1, paddingVertical: 14, borderRadius: 14, borderWidth: 1, alignItems: 'center' },
  dBtnPrimary: { flex: 1, paddingVertical: 14, borderRadius: 14, alignItems: 'center', flexDirection: 'row', justifyContent: 'center', gap: 6 },
});
