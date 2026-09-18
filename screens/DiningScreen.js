import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, SafeAreaView, Dimensions, Image, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { useTheme } from '../components/ThemeProvider';
import { useApp } from '../context/AppContext';

const { width } = Dimensions.get('window');

export default function DiningScreen({ navigation }) {
  const { isDark } = useTheme();
  const { diningCart, setDiningCart, walletBalance } = useApp();
  const [activeTab, setActiveTab] = useState('on');

  const onCampus = [
    { id: 1, name: 'Main Canteen', type: 'Buffet', open: '7am - 9pm', rating: 4.2, image: 'https://images.unsplash.com/photo-1544148103-0773bf10d330?w=400', price: 15 },
    { id: 2, name: 'Faculty Hub', type: 'Cafeteria', open: '8am - 6pm', rating: 3.8, image: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=400', price: 12 },
    { id: 3, name: 'Night Market', type: 'Various', open: '6pm - 12am', rating: 4.5, image: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=400', price: 10 },
  ];

  const offCampus = [
    { id: 4, name: 'Student Grills', type: 'Fast Food', dist: '0.2 km', rating: 4.7, image: 'https://images.unsplash.com/photo-1561758033-d89a9ad46330?w=400', price: 25 },
    { id: 5, name: 'The Village Pot', type: 'Traditional', dist: '0.5 km', rating: 4.1, image: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=400', price: 20 },
    { id: 6, name: 'Pizza Junction', type: 'Italian', dist: '1.2 km', rating: 4.0, image: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=400', price: 45 },
  ];

  const data = activeTab === 'on' ? onCampus : offCampus;

  const addToCart = (item) => {
    setDiningCart([...diningCart, { ...item, cartId: Date.now() }]);
    Alert.alert('Added to Cart', `${item.name} has been added. Check your cart to checkout.`);
  };

  return (
    <SafeAreaView style={[styles.container, isDark && styles.darkContainer]}>
      <LinearGradient colors={isDark ? ['#0F172A', '#1E1B4B'] : ['#FDFCFB', '#E2D1C3']} style={styles.background}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color={isDark ? '#FFF' : '#1E293B'} />
          </TouchableOpacity>
          <View>
            <Text style={[styles.headerTitle, isDark && styles.darkText]}>Dining Hub</Text>
            <Text style={styles.balanceText}>Wallet: GH₵ {walletBalance.toFixed(2)}</Text>
          </View>
          <TouchableOpacity style={styles.cartBtn} onPress={() => Alert.alert('Your Cart', diningCart.length > 0 ? `You have ${diningCart.length} items. Total: GH₵ ${diningCart.reduce((s, i) => s + i.price, 0).toFixed(2)}` : 'Cart is empty')}>
             <Ionicons name="cart" size={20} color="#FFF" />
             {diningCart.length > 0 && (
               <View style={styles.badge}><Text style={styles.badgeText}>{diningCart.length}</Text></View>
             )}
          </TouchableOpacity>
        </View>

        <View style={styles.tabBar}>
          {['on', 'off'].map((tab) => (
            <TouchableOpacity 
              key={tab}
              style={[styles.tab, activeTab === tab && styles.activeTab]}
              onPress={() => setActiveTab(tab)}
            >
              <Text style={[styles.tabText, activeTab === tab && styles.activeTabText]}>{tab === 'on' ? 'On Campus' : 'Out of Campus'}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
          {data.map((item) => (
            <TouchableOpacity key={item.id} style={styles.restaurantCard} onPress={() => Alert.alert(item.name, `Rating: ${item.rating} stars. Pre-order now to skip the queue!`)}>
              <Image source={{ uri: item.image }} style={styles.cardImage} />
              <LinearGradient colors={['transparent', 'rgba(0,0,0,0.8)']} style={styles.imageOverlay} />
              
              <View style={styles.cardContent}>
                <View style={styles.cardHeader}>
                  <View style={styles.titleArea}>
                    <Text style={styles.restaurantName}>{item.name}</Text>
                    <Text style={styles.typeText}>{item.type} • GH₵ {item.price}</Text>
                  </View>
                  <View style={styles.ratingBox}>
                    <Ionicons name="star" size={14} color="#F59E0B" />
                    <Text style={styles.ratingText}>{item.rating}</Text>
                  </View>
                </View>
                
                <View style={styles.cardFooter}>
                  <View style={styles.detailRow}>
                    <Ionicons name={activeTab === 'on' ? "time-outline" : "location-outline"} size={16} color="rgba(255,255,255,0.8)" />
                    <Text style={styles.detailText}>{activeTab === 'on' ? item.open : item.dist}</Text>
                  </View>
                  <TouchableOpacity style={styles.orderBtn} onPress={() => addToCart(item)}>
                    <Text style={styles.orderText}>Pre-order</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </TouchableOpacity>
          ))}

          {/* Meal Plan Promo */}
          <BlurView intensity={30} tint={isDark ? 'dark' : 'light'} style={styles.mealPlanCard}>
            <LinearGradient colors={['rgba(245, 158, 11, 0.1)', 'rgba(245, 158, 11, 0.05)']} style={styles.mealPlanGradient}>
              <View style={styles.mealPlanInfo}>
                <Text style={[styles.mealPlanTitle, isDark && styles.darkText]}>Student Meal Plan</Text>
                <Text style={styles.mealPlanSub}>Save 15% on campus dining by subscribing.</Text>
              </View>
              <TouchableOpacity style={styles.subscribeBtn} onPress={() => Alert.alert('Subscription', 'Subscribe to the meal plan for GH₵ 500/semester?')}>
                <Text style={styles.subscribeText}>Subscribe</Text>
              </TouchableOpacity>
            </LinearGradient>
          </BlurView>
        </ScrollView>
      </LinearGradient>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  darkContainer: { backgroundColor: '#0F172A' },
  background: { flex: 1 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 20 },
  backButton: { width: 44, height: 44, borderRadius: 15, backgroundColor: 'rgba(0,0,0,0.05)', alignItems: 'center', justifyContent: 'center' },
  headerTitle: { fontSize: 20, fontWeight: '900', color: '#1E293B' },
  balanceText: { fontSize: 12, color: '#64748B', fontWeight: '600' },
  cartBtn: { width: 45, height: 45, borderRadius: 15, backgroundColor: '#4F46E5', alignItems: 'center', justifyContent: 'center' },
  badge: { position: 'absolute', top: -5, right: -5, backgroundColor: '#EF4444', height: 20, width: 20, borderRadius: 10, alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: '#FFF' },
  badgeText: { color: '#FFF', fontSize: 10, fontWeight: '800' },
  tabBar: { flexDirection: 'row', paddingHorizontal: 20, marginBottom: 15 },
  tab: { flex: 1, paddingVertical: 12, alignItems: 'center', borderBottomWidth: 2, borderBottomColor: 'transparent' },
  activeTab: { borderBottomColor: '#4F46E5' },
  tabText: { fontSize: 15, fontWeight: '700', color: '#64748B' },
  activeTabText: { color: '#4F46E5' },
  scrollContent: { padding: 20 },
  restaurantCard: { height: 200, borderRadius: 30, overflow: 'hidden', marginBottom: 20, elevation: 8 },
  cardImage: { ...StyleSheet.absoluteFillObject },
  imageOverlay: { ...StyleSheet.absoluteFillObject },
  cardContent: { flex: 1, justifyContent: 'flex-end', padding: 20 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 },
  titleArea: { flex: 1 },
  restaurantName: { fontSize: 18, fontWeight: '800', color: '#FFF' },
  typeText: { fontSize: 13, color: 'rgba(255,255,255,0.7)', marginTop: 2 },
  ratingBox: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.5)', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 10 },
  ratingText: { color: '#FFF', fontSize: 12, fontWeight: '700', marginLeft: 4 },
  cardFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  detailRow: { flexDirection: 'row', alignItems: 'center' },
  detailText: { color: '#FFF', fontSize: 13, marginLeft: 6, fontWeight: '600' },
  orderBtn: { backgroundColor: '#4F46E5', paddingHorizontal: 15, paddingVertical: 8, borderRadius: 12 },
  orderText: { color: '#FFF', fontSize: 12, fontWeight: '800' },
  mealPlanCard: { borderRadius: 24, overflow: 'hidden', marginTop: 10, marginBottom: 40 },
  mealPlanGradient: { padding: 25, flexDirection: 'row', alignItems: 'center' },
  mealPlanInfo: { flex: 1 },
  mealPlanTitle: { fontSize: 18, fontWeight: '800', color: '#1E293B' },
  mealPlanSub: { fontSize: 13, color: '#64748B', marginTop: 5 },
  subscribeBtn: { backgroundColor: '#F59E0B', paddingHorizontal: 15, paddingVertical: 10, borderRadius: 12 },
  subscribeText: { color: '#FFF', fontWeight: '800', fontSize: 12 },
  darkText: { color: '#FFF' },
});
