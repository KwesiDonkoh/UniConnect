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

const CANTEENS = [
  { id: 'c1', name: 'Main Canteen', status: 'Busy', wait: '15m' },
  { id: 'c2', name: 'Engineering Cafe', status: 'Available', wait: '5m' },
  { id: 'c3', name: 'Science Deli', status: 'Moderate', wait: '10m' },
];

const MENU_ITEMS = [
  { id: 'f1', name: 'Jollof Rice with Grilled Chicken', price: 'GH₵ 35', calories: '650 kcal', image: 'https://images.unsplash.com/photo-1567333328061-688a513ca95b?w=400', category: 'Local' },
  { id: 'f2', name: 'Banku & Grilled Tilapia', price: 'GH₵ 45', calories: '720 kcal', image: 'https://images.unsplash.com/photo-1623910300627-7dcb2c6e61f2?w=400', category: 'Local' },
  { id: 'f3', name: 'Classic Cheeseburger', price: 'GH₵ 40', calories: '850 kcal', image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400', category: 'Continental' },
  { id: 'f4', name: 'Assorted Fried Rice', price: 'GH₵ 30', calories: '580 kcal', image: 'https://images.unsplash.com/photo-1603133872878-684f208fb84b?w=400', category: 'Asian' },
  { id: 'f5', name: 'Fresh Fruit Salad', price: 'GH₵ 20', calories: '150 kcal', image: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=400', category: 'Healthy' },
];

export default function CanteenScreen({ navigation }) {
  const { isDark } = useTheme();
  const [selectedCanteen, setSelectedCanteen] = useState(CANTEENS[0]);
  const [cart, setCart] = useState({});
  const [activeCategory, setActiveCategory] = useState('All');

  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, { toValue: 1, duration: 600, useNativeDriver: true }).start();
  }, []);

  const addToCart = (item) => {
    setCart(prev => ({
      ...prev,
      [item.id]: (prev[item.id] || 0) + 1
    }));
  };

  const removeFromCart = (id) => {
    setCart(prev => {
      const next = { ...prev };
      if (next[id] > 1) next[id] -= 1;
      else delete next[id];
      return next;
    });
  };

  const cartCount = Object.values(cart).reduce((a, b) => a + b, 0);
  const cartTotal = Object.entries(cart).reduce((total, [id, qty]) => {
    const item = MENU_ITEMS.find(f => f.id === id);
    const price = parseInt(item.price.replace('GH₵ ', ''));
    return total + (price * qty);
  }, 0);

  const categories = ['All', 'Local', 'Continental', 'Asian', 'Healthy'];

  return (
    <SafeAreaView style={[styles.container, isDark && styles.darkContainer]}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color={isDark ? '#FFF' : '#1E293B'} />
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={[styles.headerTitle, isDark && styles.darkText]}>Smart Canteen</Text>
          <TouchableOpacity style={styles.canteenSelector} onPress={() => Alert.alert('Switch Canteen', 'Choose your preferred cafeteria.')}>
            <Text style={styles.canteenName}>{selectedCanteen.name}</Text>
            <Ionicons name="chevron-down" size={14} color="#6366F1" />
          </TouchableOpacity>
        </View>
        <TouchableOpacity style={styles.historyBtn}>
          <Ionicons name="receipt-outline" size={22} color={isDark ? '#FFF' : '#1E293B'} />
        </TouchableOpacity>
      </View>

      <Animated.View style={{ flex: 1, opacity: fadeAnim }}>
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollBody}>
          
          <View style={[styles.statusStrip, isDark && styles.darkCard]}>
            <View style={styles.statusItem}>
              <Text style={styles.statusValue}>{selectedCanteen.wait}</Text>
              <Text style={styles.statusLabel}>Est. Wait</Text>
            </View>
            <View style={styles.statusDivider} />
            <View style={styles.statusItem}>
              <View style={styles.statusRow}>
                <View style={[styles.statusDot, { backgroundColor: selectedCanteen.status === 'Busy' ? '#EF4444' : '#10B981' }]} />
                <Text style={[styles.statusValue, { color: selectedCanteen.status === 'Busy' ? '#EF4444' : '#10B981' }]}>{selectedCanteen.status}</Text>
              </View>
              <Text style={styles.statusLabel}>Live Traffic</Text>
            </View>
          </View>

          <Text style={[styles.sectionTitle, isDark && styles.darkText]}>Categories</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.catScroll}>
            {categories.map(cat => (
              <TouchableOpacity
                key={cat}
                style={[styles.catChip, activeCategory === cat && styles.catChipActive, isDark && activeCategory !== cat && styles.darkCatChip]}
                onPress={() => setActiveCategory(cat)}
              >
                <Text style={[styles.catText, activeCategory === cat && styles.catTextActive, isDark && activeCategory !== cat && styles.darkSubText]}>{cat}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          <View style={styles.menuList}>
            {MENU_ITEMS.filter(f => activeCategory === 'All' || f.category === activeCategory).map(item => (
              <View key={item.id} style={[styles.foodCard, isDark && styles.darkCard]}>
                <Image source={{ uri: item.image }} style={styles.foodImg} />
                <View style={styles.foodInfo}>
                  <Text style={[styles.foodName, isDark && styles.darkText]}>{item.name}</Text>
                  <Text style={styles.foodCals}>{item.calories} • High Protein</Text>
                  <View style={styles.foodFooter}>
                    <Text style={styles.foodPrice}>{item.price}</Text>
                    <View style={styles.counter}>
                      {cart[item.id] > 0 && (
                        <>
                          <TouchableOpacity style={styles.counterBtn} onPress={() => removeFromCart(item.id)}>
                            <Ionicons name="remove" size={16} color="#6366F1" />
                          </TouchableOpacity>
                          <Text style={[styles.counterVal, isDark && styles.darkText]}>{cart[item.id]}</Text>
                        </>
                      )}
                      <TouchableOpacity style={[styles.counterBtn, { backgroundColor: '#6366F1' }]} onPress={() => addToCart(item)}>
                        <Ionicons name="add" size={16} color="#FFFFFF" />
                      </TouchableOpacity>
                    </View>
                  </View>
                </View>
              </View>
            ))}
          </View>

          <View style={{ height: 120 }} />
        </ScrollView>
      </Animated.View>

      {cartCount > 0 && (
        <View style={[styles.checkoutBar, isDark && styles.darkFooter]}>
          <TouchableOpacity style={styles.checkoutBtn} onPress={() => Alert.alert('Pre-order Placed', `Successful! Your order #${Math.floor(Math.random() * 1000)} will be ready in ${selectedCanteen.wait}.`)}>
            <LinearGradient colors={['#6366F1', '#4F46E5']} style={styles.checkoutGrad}>
              <View style={styles.cartIconBadge}>
                <Ionicons name="cart" size={20} color="#6366F1" />
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>{cartCount}</Text>
                </View>
              </View>
              <Text style={styles.checkoutText}>Continue to Checkout</Text>
              <Text style={styles.checkoutTotal}>GH₵ {cartTotal}</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  darkContainer: { backgroundColor: '#0F172A' },
  darkCard: { backgroundColor: '#1E293B' },
  darkText: { color: '#FFFFFF' },
  darkSubText: { color: '#94A3B8' },
  darkCatChip: { backgroundColor: '#1E293B', borderColor: '#334155' },
  darkFooter: { backgroundColor: '#0F172A', borderTopColor: '#334155' },

  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 20 },
  backBtn: { width: 44, height: 44, borderRadius: 15, backgroundColor: '#F1F5F9', justifyContent: 'center', alignItems: 'center' },
  headerCenter: { flex: 1, alignItems: 'center' },
  headerTitle: { fontSize: 18, fontWeight: '900', color: '#1E293B' },
  canteenSelector: { flexDirection: 'row', alignItems: 'center', gap: 5, marginTop: 2 },
  canteenName: { fontSize: 12, fontWeight: '700', color: '#6366F1' },
  historyBtn: { width: 44, height: 44, borderRadius: 15, backgroundColor: '#F1F5F9', justifyContent: 'center', alignItems: 'center' },

  scrollBody: { padding: 20 },
  statusStrip: { flexDirection: 'row', backgroundColor: '#FFFFFF', padding: 20, borderRadius: 25, elevation: 3, marginBottom: 25 },
  statusItem: { flex: 1, alignItems: 'center' },
  statusValue: { fontSize: 18, fontWeight: '900', color: '#1E293B' },
  statusLabel: { fontSize: 11, color: '#94A3B8', marginTop: 4 },
  statusDivider: { width: 1, height: '70%', alignSelf: 'center', backgroundColor: '#F1F5F9' },
  statusRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  statusDot: { width: 8, height: 8, borderRadius: 4 },

  sectionTitle: { fontSize: 18, fontWeight: '900', color: '#1E293B', marginBottom: 15 },
  catScroll: { gap: 10, paddingBottom: 10 },
  catChip: { paddingHorizontal: 18, paddingVertical: 10, borderRadius: 15, backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#E2E8F0' },
  catChipActive: { backgroundColor: '#6366F1', borderColor: '#6366F1' },
  catText: { fontSize: 13, fontWeight: '700', color: '#64748B' },
  catTextActive: { color: '#FFFFFF' },

  menuList: { marginTop: 15, gap: 15 },
  foodCard: { flexDirection: 'row', backgroundColor: '#FFFFFF', borderRadius: 25, overflow: 'hidden', elevation: 2 },
  foodImg: { width: 110, height: 110 },
  foodInfo: { flex: 1, padding: 15 },
  foodName: { fontSize: 15, fontWeight: '800', color: '#1E293B', marginBottom: 4 },
  foodCals: { fontSize: 11, color: '#94A3B8', marginBottom: 10 },
  foodFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  foodPrice: { fontSize: 16, fontWeight: '900', color: '#6366F1' },
  counter: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  counterBtn: { width: 30, height: 30, borderRadius: 10, backgroundColor: '#F1F5F9', justifyContent: 'center', alignItems: 'center' },
  counterVal: { fontSize: 14, fontWeight: '800', color: '#1E293B' },

  checkoutBar: { position: 'absolute', bottom: 0, width: '100%', padding: 20, borderTopWidth: 1, borderTopColor: '#F1F5F9', backgroundColor: '#FFFFFF' },
  checkoutBtn: { borderRadius: 20, overflow: 'hidden', elevation: 5 },
  checkoutGrad: { flexDirection: 'row', alignItems: 'center', padding: 18, gap: 15 },
  cartIconBadge: { width: 44, height: 44, borderRadius: 15, backgroundColor: '#FFFFFF', justifyContent: 'center', alignItems: 'center' },
  badge: { position: 'absolute', top: -5, right: -5, backgroundColor: '#EF4444', minWidth: 18, paddingHorizontal: 4, height: 18, borderRadius: 9, justifyContent: 'center', alignItems: 'center' },
  badgeText: { fontSize: 10, fontWeight: '900', color: '#FFFFFF' },
  checkoutText: { flex: 1, fontSize: 16, fontWeight: '900', color: '#FFFFFF' },
  checkoutTotal: { fontSize: 18, fontWeight: '900', color: '#FFFFFF' },
});
