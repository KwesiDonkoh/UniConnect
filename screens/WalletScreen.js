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
import FinanceModal from '../components/FinanceModal';

const { width, height } = Dimensions.get('window');

const TRANSACTIONS = [
  { id: 't1', name: 'Main Canteen', date: 'Today, 12:45 PM', amount: '-GH₵ 35.00', icon: 'fast-food', color: '#F59E0B' },
  { id: 't2', name: 'Wallet Top-up', date: 'Yesterday, 09:12 AM', amount: '+GH₵ 200.00', icon: 'add-circle', color: '#10B981' },
  { id: 't3', name: 'Shuttle Trip', date: 'Yesterday, 04:30 PM', amount: '-GH₵ 5.00', icon: 'bus', color: '#6366F1' },
  { id: 't4', name: 'Library Late Fee', date: 'May 28', amount: '-GH₵ 10.00', icon: 'library', color: '#EF4444' },
];

export default function WalletScreen({ navigation }) {
  const { isDark } = useTheme();
  const [balance, setBalance] = useState(157.50);
  const [flipped, setFlipped] = useState(false);
  const [showFinance, setShowFinance] = useState(false);
  const flipAnim = useRef(new Animated.Value(0)).current;

  const flipCard = () => {
    const toValue = flipped ? 0 : 1;
    Animated.spring(flipAnim, {
      toValue,
      friction: 8,
      tension: 10,
      useNativeDriver: true,
    }).start();
    setFlipped(!flipped);
  };

  const frontInterpolate = flipAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '180deg'],
  });

  const backInterpolate = flipAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['180deg', '360deg'],
  });

  const frontOpacity = flipAnim.interpolate({
    inputRange: [0, 0.5, 0.501, 1],
    outputRange: [1, 1, 0, 0],
  });

  const backOpacity = flipAnim.interpolate({
    inputRange: [0, 0.5, 0.501, 1],
    outputRange: [0, 0, 1, 1],
  });

  return (
    <SafeAreaView style={[styles.container, isDark && styles.darkContainer]}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={[styles.backBtn, isDark && styles.darkCard]}>
          <Ionicons name="arrow-back" size={24} color={isDark ? '#FFF' : '#1E293B'} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, isDark && styles.darkText]}>Student Wallet</Text>
        <TouchableOpacity style={[styles.headerAction, isDark && styles.darkCard]} onPress={() => Alert.alert('Settings', 'Manage linked bank accounts & MOMO.')}>
          <Ionicons name="settings-outline" size={24} color={isDark ? '#FFF' : '#1E293B'} />
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollBody}>
        
        {/* Animated Digital ID / Wallet Balance */}
        <TouchableOpacity activeOpacity={1} onPress={flipCard} style={styles.cardWrapper}>
          {/* Front Side: Balance & Quick Info */}
          <Animated.View style={[styles.card, { transform: [{ rotateY: frontInterpolate }], opacity: frontOpacity }]}>
            <LinearGradient colors={['#6366F1', '#4F46E5', '#3730A3']} style={styles.cardGrad}>
              <View style={styles.cardTop}>
                <View>
                  <Text style={styles.cardLabel}>Current Balance</Text>
                  <Text style={styles.balanceValue}>GH₵ {balance.toFixed(2)}</Text>
                </View>
                <Image source={{ uri: 'https://images.unsplash.com/photo-1599566150163-29194dcaad36?w=200' }} style={styles.cardAvatar} />
              </View>
              <View style={styles.cardBottom}>
                <View>
                  <Text style={styles.cardName}>KWESI DONKOR</Text>
                  <Text style={styles.cardId}>ID: 20784402</Text>
                </View>
                <View style={styles.nfcWrap}>
                  <Ionicons name="wifi" size={24} color="#FFF" style={{ transform: [{ rotate: '90deg' }] }} />
                  <Text style={styles.nfcText}>Tap to Pay</Text>
                </View>
              </View>
            </LinearGradient>
          </Animated.View>

          {/* Back Side: QR Code for Terminals */}
          <Animated.View style={[styles.card, styles.cardBack, { transform: [{ rotateY: backInterpolate }], opacity: backOpacity }]}>
            <LinearGradient colors={['#1E293B', '#0F172A']} style={styles.cardGrad}>
              <Text style={styles.qrTitle}>Dynamic Terminal Access</Text>
              <View style={styles.qrContainer}>
                <Ionicons name="qr-code" size={120} color="#FFF" />
              </View>
              <Text style={styles.qrCodeText}>SCAN FOR CAMPUS SERVICES</Text>
            </LinearGradient>
          </Animated.View>
        </TouchableOpacity>

        {/* Quick Actions */}
        <View style={styles.actionRow}>
          {[
            { label: 'Top Up', icon: 'add', color: '#10B981', action: () => setShowFinance(true) },
            { label: 'Transfer', icon: 'swap-horizontal', color: '#6366F1', action: () => Alert.alert('Send Money', 'Transfer to:\n• Another Student\n• Personal Account\n• Faculty Payment') },
            { label: 'Vouchers', icon: 'gift', color: '#F59E0B', action: () => Alert.alert('UniVouchers', 'Redeem your academic rewards here.') },
            { label: 'History', icon: 'time', color: '#EF4444', action: () => Alert.alert('Full Statement', 'Generating PDF statement for current semester...') },
          ].map((act, i) => (
            <TouchableOpacity key={i} style={styles.actionBtn} onPress={act.action}>
               <View style={[styles.actionIcon, isDark && styles.darkCard, { backgroundColor: isDark ? '#1E293B' : act.color + '15' }]}>
                 <Ionicons name={act.icon} size={24} color={act.color} />
               </View>
               <Text style={[styles.actionLabel, isDark && styles.darkText]}>{act.label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Recent Transactions */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, isDark && styles.darkText]}>Recent History</Text>
            <TouchableOpacity>
              <Text style={styles.seeAll}>Full Log</Text>
            </TouchableOpacity>
          </View>
          
          {TRANSACTIONS.map(tx => (
            <View key={tx.id} style={[styles.txCard, isDark && styles.darkCard]}>
              <View style={[styles.txIcon, { backgroundColor: tx.color + '15' }]}>
                <Ionicons name={tx.icon} size={20} color={tx.color} />
              </View>
              <View style={styles.txInfo}>
                <Text style={[styles.txName, isDark && styles.darkText]}>{tx.name}</Text>
                <Text style={styles.txDate}>{tx.date}</Text>
              </View>
              <Text style={[styles.txAmount, { color: tx.amount.startsWith('+') ? '#10B981' : (isDark ? '#FFF' : '#1E293B') }]}>
                {tx.amount}
              </Text>
            </View>
          ))}
        </View>

        {/* Financial Health / Insights */}
        <View style={[styles.insightCard, isDark && styles.darkCard]}>
          <View style={styles.insightHeader}>
            <LinearGradient colors={['#6366F1', '#4F46E5']} style={styles.insightIcon}>
              <Ionicons name="stats-chart" size={18} color="#FFF" />
            </LinearGradient>
            <View>
              <Text style={[styles.insightTitle, isDark && styles.darkText]}>Spending Pulse</Text>
              <Text style={styles.insightSub}>Weekly analytic summary</Text>
            </View>
          </View>
          <View style={styles.barWrap}>
             <View style={[styles.bar, { height: '40%' }]} />
             <View style={[styles.bar, { height: '60%' }]} />
             <View style={[styles.bar, { height: '35%', backgroundColor: '#6366F1', shadowColor: '#6366F1', shadowOpacity: 0.5, shadowRadius: 10, elevation: 5 }]} />
             <View style={[styles.bar, { height: '80%' }]} />
             <View style={[styles.bar, { height: '50%' }]} />
          </View>
          <View style={styles.tipBox}>
            <Ionicons name="bulb" size={18} color="#F59E0B" />
            <Text style={styles.insightDesc}>You've saved GH₵ 45.00 this week on dining. Smart choices! 🚀</Text>
          </View>
        </View>

        <View style={{ height: 120 }} />
      </ScrollView>

      {/* Floating Scan Button */}
      <TouchableOpacity style={styles.scanFab} onPress={() => Alert.alert('Universal Scanner', 'Preparing AR terminal link...')}>
        <LinearGradient colors={['#6366F1', '#4F46E5']} style={styles.scanGrad}>
          <Ionicons name="scan-outline" size={28} color="#FFF" />
          <Text style={styles.scanText}>PAY / ID</Text>
        </LinearGradient>
      </TouchableOpacity>

      <FinanceModal 
        visible={showFinance} 
        onClose={() => setShowFinance(false)} 
        isDark={isDark}
        onTopUpSuccess={(amt) => setBalance(prev => prev + amt)}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  darkContainer: { backgroundColor: '#0F172A' },
  darkCard: { backgroundColor: '#1E293B' },
  darkText: { color: '#FFF' },

  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingTop: 10, marginBottom: 20 },
  backBtn: { width: 44, height: 44, borderRadius: 15, backgroundColor: '#FFF', justifyContent: 'center', alignItems: 'center', elevation: 2 },
  headerTitle: { fontSize: 22, fontWeight: '900', color: '#1E293B' },
  headerAction: { width: 44, height: 44, borderRadius: 15, backgroundColor: '#FFF', justifyContent: 'center', alignItems: 'center', elevation: 2 },

  scrollBody: { paddingHorizontal: 20 },
  
  cardWrapper: { height: 220, marginBottom: 30 },
  card: { ...StyleSheet.absoluteFillObject, borderRadius: 30, backfaceVisibility: 'hidden', elevation: 15 },
  cardBack: { top: 0 },
  cardGrad: { flex: 1, borderRadius: 30, padding: 25, justifyContent: 'space-between' },
  
  cardTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  cardLabel: { fontSize: 13, color: 'rgba(255,255,255,0.7)', fontWeight: '600' },
  balanceValue: { fontSize: 36, fontWeight: '900', color: '#FFF', marginTop: 5 },
  cardAvatar: { width: 55, height: 55, borderRadius: 18, borderWidth: 2, borderColor: 'rgba(255,255,255,0.4)' },
  
  cardBottom: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end' },
  cardName: { fontSize: 18, fontWeight: '800', color: '#FFF', letterSpacing: 1 },
  cardId: { color: 'rgba(255,255,255,0.8)', fontSize: 13, marginTop: 2, fontWeight: '700' },
  nfcWrap: { alignItems: 'center' },
  nfcText: { fontSize: 9, color: '#FFF', fontWeight: '900', marginTop: 4 },

  qrTitle: { color: '#FFF', textAlign: 'center', fontSize: 14, fontWeight: '800', opacity: 0.8 },
  qrContainer: { alignSelf: 'center', padding: 15, backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: 20 },
  qrCodeText: { color: '#FFF', textAlign: 'center', fontSize: 11, fontWeight: '900', letterSpacing: 2, opacity: 0.6 },

  actionRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 35 },
  actionBtn: { alignItems: 'center', flex: 1 },
  actionIcon: { width: 60, height: 60, borderRadius: 22, backgroundColor: '#FFF', justifyContent: 'center', alignItems: 'center', marginBottom: 10, elevation: 3 },
  actionLabel: { fontSize: 12, fontWeight: '800', color: '#475569' },

  section: { marginBottom: 30 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15 },
  sectionTitle: { fontSize: 19, fontWeight: '900', color: '#1E293B' },
  seeAll: { fontSize: 14, color: '#6366F1', fontWeight: '800' },
  txCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFF', padding: 16, borderRadius: 25, elevation: 1, marginBottom: 12 },
  txIcon: { width: 48, height: 48, borderRadius: 16, justifyContent: 'center', alignItems: 'center' },
  txInfo: { flex: 1, marginLeft: 16 },
  txName: { fontSize: 15, fontWeight: '800', color: '#1E293B' },
  txDate: { fontSize: 12, color: '#94A3B8', marginTop: 2, fontWeight: '600' },
  txAmount: { fontSize: 16, fontWeight: '900' },

  insightCard: { backgroundColor: '#FFF', padding: 25, borderRadius: 35, elevation: 5 },
  insightHeader: { flexDirection: 'row', alignItems: 'center', gap: 15, marginBottom: 25 },
  insightIcon: { width: 40, height: 40, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
  insightTitle: { fontSize: 17, fontWeight: '900', color: '#1E293B' },
  insightSub: { fontSize: 12, color: '#94A3B8', fontWeight: '700' },
  barWrap: { flexDirection: 'row', height: 120, alignItems: 'flex-end', justifyContent: 'space-around', marginBottom: 25 },
  bar: { width: 30, backgroundColor: '#F1F5F9', borderRadius: 10 },
  tipBox: { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: '#F8FAFC', padding: 15, borderRadius: 20 },
  insightDesc: { flex: 1, fontSize: 13, color: '#64748B', fontWeight: '600', lineHeight: 18 },

  scanFab: { position: 'absolute', bottom: 30, alignSelf: 'center', height: 65, borderRadius: 32, elevation: 12, overflow: 'hidden' },
  scanGrad: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 30, height: '100%', gap: 12 },
  scanText: { color: '#FFF', fontSize: 16, fontWeight: '900' },
});
