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
  Alert,
  RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../components/ThemeProvider';

const { width, height } = Dimensions.get('window');

const MARKET_CATEGORIES = [
  { id: 'all', label: 'All', icon: 'grid' },
  { id: 'textbooks', label: 'Textbooks', icon: 'book' },
  { id: 'electronics', label: 'Electronics', icon: 'phone-portrait' },
  { id: 'dorm', label: 'Dorm Life', icon: 'bed' },
  { id: 'fashion', label: 'Fashion', icon: 'shirt' },
  { id: 'services', label: 'Services', icon: 'construct' },
];

const MARKET_ITEMS = [
  {
    id: 'm1',
    title: 'Intro to Algorithms - CLRS 3rd Edition',
    price: 'GH₵ 120',
    category: 'textbooks',
    condition: 'Like New',
    seller: 'David Kwame',
    image: 'https://images.unsplash.com/photo-1543002588-bfa74002ed7e?w=800',
    time: '2h ago',
    description: 'Barely used algorithm textbook. No highlights or markings. Essential for Level 300 students.',
    views: 45,
  },
  {
    id: 'm2',
    title: 'Samsung 24" Curved Monitor',
    price: 'GH₵ 850',
    category: 'electronics',
    condition: 'Gently Used',
    seller: 'Emma Mensah',
    image: 'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=800',
    time: '4h ago',
    description: 'Perfect for coding and gaming. Comes with HDMI cable and original power brick.',
    views: 120,
  },
  {
    id: 'm3',
    title: 'Electric Kettle - 1.5L',
    price: 'GH₵ 65',
    category: 'dorm',
    condition: 'New',
    seller: 'Prince Oti',
    image: 'https://images.unsplash.com/photo-1594212699903-ec8a3eea50f5?w=800',
    time: '6h ago',
    description: 'Brand new electric kettle. Perfect for tea and coffee in the dorm.',
    views: 32,
  },
  {
    id: 'm4',
    title: 'Nike Air Max 270 - Blue',
    price: 'GH₵ 350',
    category: 'fashion',
    condition: 'Used - Good',
    seller: 'Kofi Annan',
    image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800',
    time: '12h ago',
    description: 'Size 42. Very comfortable for walking across campus.',
    views: 89,
  },
  {
    id: 'm5',
    title: 'Custom Laptop Stickers - Pack of 10',
    price: 'GH₵ 25',
    category: 'services',
    condition: 'New',
    seller: 'Crafty Ama',
    image: 'https://images.unsplash.com/photo-1589384273441-c5as26caabfb?w=800',
    time: '1d ago',
    description: 'High-quality waterproof stickers for your laptop or water bottle.',
    views: 210,
  },
];

export default function MarketplaceScreen({ navigation }) {
  const { isDark } = useTheme();
  const [activeCategory, setActiveCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedItem, setSelectedItem] = useState(null);
  const [showItemDetail, setShowItemDetail] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [showSellModal, setShowSellModal] = useState(false);

  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, { toValue: 1, duration: 600, useNativeDriver: true }).start();
  }, []);

  const filteredItems = MARKET_ITEMS.filter(item => {
    const matchCat = activeCategory === 'all' || item.category === activeCategory;
    const matchSearch = !searchQuery || item.title.toLowerCase().includes(searchQuery.toLowerCase());
    return matchCat && matchSearch;
  });

  const handleRefresh = async () => {
    setRefreshing(true);
    await new Promise(r => setTimeout(r, 1000));
    setRefreshing(false);
  };

  const renderMarketItem = ({ item }) => (
    <TouchableOpacity
      style={[styles.itemCard, isDark && styles.darkCard]}
      onPress={() => { setSelectedItem(item); setShowItemDetail(true); }}
      activeOpacity={0.9}
    >
      <Image source={{ uri: item.image }} style={styles.itemImage} resizeMode="cover" />
      <View style={styles.itemInfo}>
        <Text style={styles.itemPrice}>{item.price}</Text>
        <Text style={[styles.itemTitle, isDark && styles.darkText]} numberOfLines={2}>{item.title}</Text>
        <View style={styles.itemMeta}>
          <Text style={styles.itemCondition}>{item.condition}</Text>
          <Text style={styles.itemTime}>{item.time}</Text>
        </View>
        <View style={styles.sellerRow}>
          <View style={styles.sellerAvatar}>
            <Text style={styles.sellerInitial}>{item.seller.charAt(0)}</Text>
          </View>
          <Text style={styles.sellerName}>{item.seller}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={[styles.container, isDark && styles.darkContainer]}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />

      {/* Header */}
      <LinearGradient colors={isDark ? ['#0F172A', '#1E293B'] : ['#10B981', '#059669']} style={styles.header}>
        <View style={styles.headerRow}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
          </TouchableOpacity>
          <View style={styles.headerCenter}>
            <Text style={styles.headerTitle}>🛍 Student Market</Text>
            <Text style={styles.headerSub}>Buy & Sell on Campus</Text>
          </View>
          <TouchableOpacity style={styles.headerAction} onPress={() => setShowSellModal(true)}>
            <Ionicons name="add-circle" size={24} color="#FFFFFF" />
          </TouchableOpacity>
        </View>

        {/* Search */}
        <View style={styles.searchBar}>
          <Ionicons name="search" size={18} color="#94A3B8" />
          <TextInput
            style={styles.searchInput}
            placeholder="Search for items..."
            placeholderTextColor="rgba(255,255,255,0.5)"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
      </LinearGradient>

      <Animated.View style={{ flex: 1, opacity: fadeAnim }}>
        {/* Categories */}
        <View style={styles.catSection}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.catContent}>
            {MARKET_CATEGORIES.map(cat => (
              <TouchableOpacity
                key={cat.id}
                style={[styles.catChip, activeCategory === cat.id && styles.catChipActive, isDark && activeCategory !== cat.id && styles.darkCatChip]}
                onPress={() => setActiveCategory(cat.id)}
              >
                <Ionicons name={cat.icon} size={16} color={activeCategory === cat.id ? '#FFFFFF' : (isDark ? '#94A3B8' : '#64748B')} />
                <Text style={[styles.catText, activeCategory === cat.id && styles.catTextActive, isDark && activeCategory !== cat.id && styles.darkCatText]}>
                  {cat.label}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        <FlatList
          data={filteredItems}
          renderItem={renderMarketItem}
          keyExtractor={item => item.id}
          numColumns={2}
          contentContainerStyle={styles.itemList}
          columnWrapperStyle={styles.itemRow}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} colors={['#10B981']} />}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Ionicons name="cart-outline" size={64} color="#CBD5E1" />
              <Text style={styles.emptyText}>No items found matching your search.</Text>
            </View>
          }
        />
      </Animated.View>

      {/* Sell Button Mobile Style */}
      <TouchableOpacity style={styles.sellFab} onPress={() => setShowSellModal(true)}>
        <LinearGradient colors={['#10B981', '#059669']} style={styles.sellFabGradient}>
          <Ionicons name="camera" size={24} color="#FFFFFF" />
          <Text style={styles.sellFabText}>Sell Item</Text>
        </LinearGradient>
      </TouchableOpacity>

      {/* Item Detail Modal */}
      <Modal visible={showItemDetail} animationType="slide" transparent={false} onRequestClose={() => setShowItemDetail(false)}>
        <SafeAreaView style={[styles.detailContainer, isDark && styles.darkContainer]}>
          {selectedItem && (
            <>
              <ScrollView showsVerticalScrollIndicator={false}>
                <Image source={{ uri: selectedItem.image }} style={styles.detailImage} />
                <TouchableOpacity style={styles.detailBack} onPress={() => setShowItemDetail(false)}>
                  <Ionicons name="close" size={24} color="#FFFFFF" />
                </TouchableOpacity>

                <View style={styles.detailBody}>
                  <View style={styles.priceRow}>
                    <Text style={styles.detailPrice}>{selectedItem.price}</Text>
                    <View style={styles.detailViews}>
                      <Ionicons name="eye-outline" size={16} color="#94A3B8" />
                      <Text style={styles.viewsText}>{selectedItem.views} views</Text>
                    </View>
                  </View>

                  <Text style={[styles.detailTitle, isDark && styles.darkText]}>{selectedItem.title}</Text>

                  <View style={styles.detailMetaRow}>
                    <View style={[styles.metaBadge, isDark && styles.darkMetaBadge]}>
                      <Text style={styles.metaLabel}>Condition</Text>
                      <Text style={[styles.metaValue, isDark && styles.darkText]}>{selectedItem.condition}</Text>
                    </View>
                    <View style={[styles.metaBadge, isDark && styles.darkMetaBadge]}>
                      <Text style={styles.metaLabel}>Category</Text>
                      <Text style={[styles.metaValue, isDark && styles.darkText]}>{selectedItem.category}</Text>
                    </View>
                  </View>

                  <Text style={[styles.descriptionHeader, isDark && styles.darkText]}>Description</Text>
                  <Text style={[styles.detailDescription, isDark && styles.darkSubText]}>{selectedItem.description}</Text>

                  <View style={[styles.sellerCard, isDark && styles.darkCard]}>
                    <View style={styles.sellerInfoRow}>
                      <View style={styles.largeSellerAvatar}>
                        <Text style={styles.largeSellerInitial}>{selectedItem.seller.charAt(0)}</Text>
                      </View>
                      <View>
                        <Text style={[styles.largeSellerName, isDark && styles.darkText]}>{selectedItem.seller}</Text>
                        <Text style={styles.sellerMemberSince}>Member since Jan 2024</Text>
                      </View>
                    </View>
                    <TouchableOpacity style={styles.viewProfileBtn}>
                      <Text style={styles.viewProfileText}>View Seller Profile</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </ScrollView>

              <View style={[styles.detailFooter, isDark && styles.darkFooter]}>
                <TouchableOpacity style={[styles.chatBtn, isDark && styles.darkChatBtn]} onPress={() => Alert.alert('Chat Initiated', 'Connecting you with the seller...')}>
                  <Ionicons name="chatbubbles-outline" size={20} color={isDark ? '#FFFFFF' : '#10B981'} />
                  <Text style={[styles.chatBtnText, isDark && styles.darkText]}>Chat</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.buyBtn} onPress={() => Alert.alert('Order Placed', 'The seller has been notified. Arrange meeting on campus.')}>
                  <Text style={styles.buyBtnText}>Send Interest</Text>
                </TouchableOpacity>
              </View>
            </>
          )}
        </SafeAreaView>
      </Modal>

      {/* Sell Item Modal Placeholder */}
      <Modal visible={showSellModal} animationType="slide" onRequestClose={() => setShowSellModal(false)}>
        <SafeAreaView style={[styles.sellContainer, isDark && styles.darkContainer]}>
          <View style={styles.sellHeader}>
            <TouchableOpacity onPress={() => setShowSellModal(false)}>
              <Ionicons name="close" size={28} color={isDark ? '#FFFFFF' : '#1E293B'} />
            </TouchableOpacity>
            <Text style={[styles.sellTitle, isDark && styles.darkText]}>Post New Item</Text>
            <View style={{ width: 28 }} />
          </View>
          <ScrollView style={styles.sellForm}>
            <TouchableOpacity style={styles.imagePickerPlaceholder}>
              <Ionicons name="camera-outline" size={48} color="#94A3B8" />
              <Text style={styles.imagePickerText}>Upload Item Photos</Text>
            </TouchableOpacity>

            <Text style={[styles.formLabel, isDark && styles.darkText]}>Title *</Text>
            <TextInput style={[styles.formInput, isDark && styles.darkInput]} placeholder="What are you selling?" placeholderTextColor="#94A3B8" />

            <Text style={[styles.formLabel, isDark && styles.darkText]}>Price (GH₵) *</Text>
            <TextInput style={[styles.formInput, isDark && styles.darkInput]} placeholder="0.00" keyboardType="numeric" placeholderTextColor="#94A3B8" />

            <Text style={[styles.formLabel, isDark && styles.darkText]}>Category</Text>
            <View style={styles.formCatGrid}>
              {MARKET_CATEGORIES.slice(1).map(cat => (
                <TouchableOpacity key={cat.id} style={styles.formCatChip}>
                  <Text style={styles.formCatText}>{cat.label}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={[styles.formLabel, isDark && styles.darkText]}>Description</Text>
            <TextInput style={[styles.formInput, styles.formTextArea, isDark && styles.darkInput]} placeholder="Tell buyers more about the item..." multiline numberOfLines={4} placeholderTextColor="#94A3B8" />

            <TouchableOpacity style={styles.submitBtn} onPress={() => { Alert.alert('Success', 'Your item has been listed!'); setShowSellModal(false); }}>
              <LinearGradient colors={['#10B981', '#059669']} style={styles.submitGradient}>
                <Text style={styles.submitBtnText}>List Item Now</Text>
              </LinearGradient>
            </TouchableOpacity>
          </ScrollView>
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  darkContainer: { backgroundColor: '#0F172A' },
  darkCard: { backgroundColor: '#1E293B' },
  darkText: { color: '#F1F5F9' },
  darkSubText: { color: '#94A3B8' },
  darkInput: { backgroundColor: '#1E293B', borderColor: '#334155', color: '#FFFFFF' },
  darkCatChip: { backgroundColor: '#1E293B', borderColor: '#334155' },
  darkCatText: { color: '#94A3B8' },
  darkMetaBadge: { backgroundColor: '#1E293B' },
  darkFooter: { backgroundColor: '#0F172A', borderTopColor: '#334155' },
  darkChatBtn: { borderColor: '#334155' },

  header: { paddingTop: 20, paddingBottom: 25, paddingHorizontal: 20 },
  headerRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 20 },
  backBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.2)', justifyContent: 'center', alignItems: 'center' },
  headerCenter: { flex: 1, alignItems: 'center' },
  headerTitle: { fontSize: 20, fontWeight: '900', color: '#FFFFFF' },
  headerSub: { fontSize: 12, color: 'rgba(255,255,255,0.7)', marginTop: 2 },
  headerAction: { width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.2)', justifyContent: 'center', alignItems: 'center' },
  searchBar: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: 15, paddingHorizontal: 15, paddingVertical: 10 },
  searchInput: { flex: 1, marginLeft: 10, color: '#FFFFFF', fontSize: 14 },

  catSection: { marginTop: 10, paddingVertical: 10 },
  catContent: { paddingHorizontal: 20, gap: 10 },
  catChip: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 15, paddingVertical: 10, borderRadius: 20, backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#E2E8F0', gap: 8, elevation: 1 },
  catChipActive: { backgroundColor: '#10B981', borderColor: '#10B981' },
  catText: { fontSize: 13, fontWeight: '700', color: '#64748B' },
  catTextActive: { color: '#FFFFFF' },

  itemList: { paddingHorizontal: 15, paddingTop: 10, paddingBottom: 100 },
  itemRow: { justifyContent: 'space-between' },
  itemCard: { width: (width - 45) / 2, backgroundColor: '#FFFFFF', borderRadius: 20, marginBottom: 15, overflow: 'hidden', elevation: 3 },
  itemImage: { width: '100%', height: 140 },
  itemInfo: { padding: 12 },
  itemPrice: { fontSize: 16, fontWeight: '900', color: '#059669', marginBottom: 4 },
  itemTitle: { fontSize: 13, fontWeight: '700', color: '#1E293B', lineHeight: 18, marginBottom: 8 },
  itemMeta: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  itemCondition: { fontSize: 10, color: '#64748B', fontWeight: '600' },
  itemTime: { fontSize: 10, color: '#94A3B8' },
  sellerRow: { flexDirection: 'row', alignItems: 'center', gap: 6, borderTopWidth: 1, borderTopColor: '#F1F5F9', paddingTop: 8 },
  sellerAvatar: { width: 18, height: 18, borderRadius: 9, backgroundColor: '#EEF2FF', justifyContent: 'center', alignItems: 'center' },
  sellerInitial: { fontSize: 10, fontWeight: '900', color: '#6366F1' },
  sellerName: { fontSize: 11, color: '#64748B' },

  emptyContainer: { flex: 1, alignItems: 'center', marginTop: 100 },
  emptyText: { fontSize: 14, color: '#94A3B8', marginTop: 20 },

  sellFab: { position: 'absolute', bottom: 30, width: 160, alignSelf: 'center', borderRadius: 30, elevation: 8, overflow: 'hidden' },
  sellFabGradient: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10, paddingVertical: 15 },
  sellFabText: { color: '#FFFFFF', fontWeight: '900', fontSize: 16 },

  detailContainer: { flex: 1, backgroundColor: '#FFFFFF' },
  detailImage: { width: '100%', height: 350 },
  detailBack: { position: 'absolute', top: 50, right: 20, width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' },
  detailBody: { padding: 25, marginTop: -30, backgroundColor: '#FFFFFF', borderTopLeftRadius: 35, borderTopRightRadius: 35 },
  priceRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15 },
  detailPrice: { fontSize: 28, fontWeight: '900', color: '#059669' },
  detailViews: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  viewsText: { fontSize: 12, color: '#94A3B8' },
  detailTitle: { fontSize: 22, fontWeight: '900', color: '#1E293B', lineHeight: 28, marginBottom: 20 },
  detailMetaRow: { flexDirection: 'row', gap: 12, marginBottom: 25 },
  metaBadge: { flex: 1, backgroundColor: '#F8FAFC', padding: 12, borderRadius: 15 },
  metaLabel: { fontSize: 10, fontWeight: '700', color: '#94A3B8', textTransform: 'uppercase', marginBottom: 4 },
  metaValue: { fontSize: 14, fontWeight: '700', color: '#1E293B' },
  descriptionHeader: { fontSize: 18, fontWeight: '800', color: '#1E293B', marginBottom: 10 },
  detailDescription: { fontSize: 15, color: '#475569', lineHeight: 22, marginBottom: 30 },
  sellerCard: { backgroundColor: '#F8FAFC', padding: 20, borderRadius: 25, marginBottom: 100 },
  sellerInfoRow: { flexDirection: 'row', alignItems: 'center', gap: 15, marginBottom: 15 },
  largeSellerAvatar: { width: 50, height: 50, borderRadius: 25, backgroundColor: '#EEF2FF', justifyContent: 'center', alignItems: 'center' },
  largeSellerInitial: { fontSize: 22, fontWeight: '900', color: '#6366F1' },
  largeSellerName: { fontSize: 18, fontWeight: '800', color: '#1E293B' },
  sellerMemberSince: { fontSize: 12, color: '#94A3B8' },
  viewProfileBtn: { paddingVertical: 10, alignItems: 'center', borderTopWidth: 1, borderTopColor: '#E2E8F0', marginTop: 5 },
  viewProfileText: { fontSize: 13, fontWeight: '700', color: '#10B981' },

  detailFooter: { position: 'absolute', bottom: 0, width: '100%', backgroundColor: '#FFFFFF', borderTopWidth: 1, borderTopColor: '#F1F5F9', padding: 20, flexDirection: 'row', gap: 15 },
  chatBtn: { flex: 1, height: 55, borderRadius: 15, borderWidth: 1, borderColor: '#E2E8F0', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10 },
  chatBtnText: { fontSize: 16, fontWeight: '800', color: '#1E293B' },
  buyBtn: { flex: 2, height: 55, borderRadius: 15, backgroundColor: '#10B981', alignItems: 'center', justifyContent: 'center' },
  buyBtnText: { color: '#FFFFFF', fontSize: 16, fontWeight: '900' },

  sellContainer: { flex: 1, backgroundColor: '#F8FAFC' },
  sellHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 20, borderBottomWidth: 1, borderBottomColor: '#E2E8F0' },
  sellTitle: { fontSize: 18, fontWeight: '900', color: '#1E293B' },
  sellForm: { padding: 25 },
  imagePickerPlaceholder: { width: '100%', height: 180, backgroundColor: '#F1F5F9', borderRadius: 25, borderStyle: 'dashed', borderWidth: 2, borderColor: '#CBD5E1', justifyContent: 'center', alignItems: 'center', gap: 10, marginBottom: 30 },
  imagePickerText: { fontSize: 14, color: '#94A3B8', fontWeight: '700' },
  formLabel: { fontSize: 14, fontWeight: '700', color: '#1E293B', marginBottom: 10, marginTop: 10 },
  formInput: { backgroundColor: '#FFFFFF', borderRadius: 15, borderWidth: 1, borderColor: '#E2E8F0', padding: 15, fontSize: 15, color: '#1E293B' },
  formTextArea: { height: 120, textAlignVertical: 'top' },
  formCatGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginTop: 5, marginBottom: 15 },
  formCatChip: { paddingHorizontal: 15, paddingVertical: 10, borderRadius: 12, backgroundColor: '#F1F5F9' },
  formCatText: { fontSize: 12, fontWeight: '700', color: '#64748B' },
  submitBtn: { height: 60, borderRadius: 20, overflow: 'hidden', marginTop: 40, marginBottom: 50 },
  submitGradient: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  submitBtnText: { color: '#FFFFFF', fontWeight: '900', fontSize: 18, letterSpacing: 1 },
});
