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
import { useApp } from '../context/AppContext';

const { width } = Dimensions.get('window');

const FEE_ITEMS = [
  { id: '1', label: 'Tuition Fee', amount: 4500, paid: 4500, due: 'Jan 2026', status: 'paid' },
  { id: '2', label: 'Facilities Fee', amount: 800, paid: 800, due: 'Jan 2026', status: 'paid' },
  { id: '3', label: 'Technology Levy', amount: 200, paid: 200, due: 'Jan 2026', status: 'paid' },
  { id: '4', label: 'Hostel Fee (Sem 2)', amount: 1200, paid: 0, due: 'Jun 2026', status: 'overdue' },
  { id: '5', label: 'Registration Fee (Sem 2)', amount: 150, paid: 0, due: 'Jun 2026', status: 'pending' },
  { id: '6', label: 'Medical Insurance', amount: 120, paid: 120, due: 'Jan 2026', status: 'paid' },
];

const PAYMENT_HISTORY = [
  { id: 'p1', type: 'Tuition + Levies', amount: 5500, date: 'Jan 15, 2026', ref: 'TXN-20260115-001', method: 'Mobile Money', status: 'success' },
  { id: 'p2', type: 'Hostel Deposit', amount: 300, date: 'Jan 20, 2026', ref: 'TXN-20260120-042', method: 'Card', status: 'success' },
  { id: 'p3', type: 'Registration', amount: 150, date: 'Processing...', ref: 'TXN-20260601-007', method: 'Mobile Money', status: 'pending' },
];

const PAYMENT_METHODS = [
  { id: 'm1', label: 'MTN MoMo', icon: 'phone-portrait', color: '#F59E0B', sub: 'Instant transfer' },
  { id: 'm2', label: 'Vodafone Cash', icon: 'phone-portrait', color: '#EF4444', sub: 'Instant transfer' },
  { id: 'm3', label: 'Visa/Mastercard', icon: 'card', color: '#3B82F6', sub: 'Credit/Debit card' },
  { id: 'm4', label: 'Bank Transfer', icon: 'business', color: '#10B981', sub: '1-3 business days' },
];

export default function FeesPaymentsScreen({ navigation }) {
  const { isDark } = useTheme();
  const { user } = useApp();
  const [showPayModal, setShowPayModal] = useState(false);
  const [showReceiptModal, setShowReceiptModal] = useState(false);
  const [selectedFee, setSelectedFee] = useState(null);
  const [selectedReceipt, setSelectedReceipt] = useState(null);
  const [selectedMethod, setSelectedMethod] = useState(null);
  const [payPhase, setPayPhase] = useState(0); // 0=select, 1=confirm, 2=processing, 3=done
  const [momoNum, setMomoNum] = useState('');
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
  };

  const totalFees = FEE_ITEMS.reduce((s, f) => s + f.amount, 0);
  const totalPaid = FEE_ITEMS.reduce((s, f) => s + f.paid, 0);
  const outstanding = totalFees - totalPaid;

  const startPayment = (fee) => {
    setSelectedFee(fee);
    setPayPhase(0);
    setShowPayModal(true);
  };

  const processPayment = () => {
    setPayPhase(2);
    setTimeout(() => setPayPhase(3), 2500);
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.bg }]}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />

      {/* Header */}
      <LinearGradient colors={isDark ? ['#064E3B', '#020617'] : ['#10B981', '#0EA5E9']} style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color="#FFF" />
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>Fees & Payments</Text>
          <Text style={styles.headerSub}>Academic Year 2025/2026</Text>
        </View>
        <TouchableOpacity onPress={() => Alert.alert('Help', 'Contact the Bursary at bursary@knust.edu.gh or visit Ext. 2340')}>
          <Ionicons name="help-circle" size={24} color="#FFF" />
        </TouchableOpacity>
      </LinearGradient>

      <Animated.ScrollView style={{ opacity: fadeAnim }} showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scroll}>

        {/* Balance Card */}
        <LinearGradient colors={['#10B981', '#0EA5E9']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
          style={styles.balanceCard}>
          <Text style={styles.balanceLabel}>OUTSTANDING BALANCE</Text>
          <Text style={styles.balanceAmount}>GH₵ {outstanding.toLocaleString()}.00</Text>
          <View style={styles.balanceRow}>
            <View style={styles.balanceItem}>
              <Text style={styles.balanceItemLabel}>Total Fees</Text>
              <Text style={styles.balanceItemValue}>GH₵{totalFees.toLocaleString()}</Text>
            </View>
            <View style={styles.balanceDivider} />
            <View style={styles.balanceItem}>
              <Text style={styles.balanceItemLabel}>Paid</Text>
              <Text style={styles.balanceItemValue}>GH₵{totalPaid.toLocaleString()}</Text>
            </View>
            <View style={styles.balanceDivider} />
            <View style={styles.balanceItem}>
              <Text style={styles.balanceItemLabel}>Balance</Text>
              <Text style={[styles.balanceItemValue, { color: '#FEF3C7' }]}>GH₵{outstanding.toLocaleString()}</Text>
            </View>
          </View>
          <View style={styles.balanceBar}>
            <View style={[styles.balanceBarFill, { width: `${(totalPaid / totalFees) * 100}%` }]} />
          </View>
          <Text style={styles.balanceBarLabel}>{Math.round((totalPaid / totalFees) * 100)}% paid</Text>
        </LinearGradient>

        {/* Notification if overdue */}
        {FEE_ITEMS.some(f => f.status === 'overdue') && (
          <View style={styles.overdueBanner}>
            <Ionicons name="warning" size={16} color="#EF4444" />
            <Text style={styles.overdueText}>
              You have <Text style={{ fontWeight: '900' }}>overdue fees</Text>. Please pay to avoid academic hold.
            </Text>
          </View>
        )}

        {/* Fee Breakdown */}
        <Text style={[styles.sectionHeader, { color: theme.sub }]}>FEE BREAKDOWN</Text>
        {FEE_ITEMS.map(f => (
          <View key={f.id} style={[styles.feeCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
            <View style={styles.feeLeft}>
              <Text style={[styles.feeName, { color: theme.text }]}>{f.label}</Text>
              <Text style={[styles.feeDue, { color: theme.sub }]}>Due: {f.due}</Text>
            </View>
            <View style={styles.feeRight}>
              <Text style={[styles.feeAmount, { color: theme.text }]}>GH₵{f.amount.toLocaleString()}</Text>
              {f.status === 'paid' ? (
                <View style={styles.paidBadge}>
                  <Ionicons name="checkmark-circle" size={12} color="#10B981" />
                  <Text style={styles.paidText}>PAID</Text>
                </View>
              ) : (
                <TouchableOpacity style={[styles.payNowBtn, { backgroundColor: f.status === 'overdue' ? '#EF4444' : '#6366F1' }]}
                  onPress={() => startPayment(f)}>
                  <Text style={styles.payNowText}>Pay Now</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        ))}

        {/* Financial Aid */}
        <View style={[styles.aidCard, { backgroundColor: isDark ? '#1E293B' : '#F0FDF4' }]}>
          <LinearGradient colors={['#10B981', '#059669']} style={styles.aidIcon}>
            <Ionicons name="ribbon" size={20} color="#FFF" />
          </LinearGradient>
          <View style={styles.aidInfo}>
            <Text style={[styles.aidTitle, { color: theme.text }]}>Financial Aid & Scholarships</Text>
            <Text style={[styles.aidSub, { color: theme.sub }]}>Check your scholarship status and apply for bursaries</Text>
          </View>
          <TouchableOpacity onPress={() => navigation.navigate('Scholarships')}>
            <Ionicons name="chevron-forward" size={20} color="#10B981" />
          </TouchableOpacity>
        </View>

        {/* Payment History */}
        <Text style={[styles.sectionHeader, { color: theme.sub, marginTop: 24 }]}>PAYMENT HISTORY</Text>
        {PAYMENT_HISTORY.map(p => (
          <TouchableOpacity key={p.id} style={[styles.histCard, { backgroundColor: theme.card, borderColor: theme.border }]}
            onPress={() => { setSelectedReceipt(p); setShowReceiptModal(true); }} activeOpacity={0.85}>
            <View style={[styles.histIcon, { backgroundColor: p.status === 'success' ? '#ECFDF5' : '#FFFBEB' }]}>
              <Ionicons name={p.status === 'success' ? 'checkmark-circle' : 'time'} size={22}
                color={p.status === 'success' ? '#10B981' : '#F59E0B'} />
            </View>
            <View style={styles.histInfo}>
              <Text style={[styles.histType, { color: theme.text }]}>{p.type}</Text>
              <Text style={[styles.histDate, { color: theme.sub }]}>{p.date} · {p.method}</Text>
            </View>
            <View style={styles.histRight}>
              <Text style={[styles.histAmount, { color: theme.text }]}>GH₵{p.amount.toLocaleString()}</Text>
              <Text style={[styles.histStatus, { color: p.status === 'success' ? '#10B981' : '#F59E0B' }]}>
                {p.status === 'success' ? 'Verified' : 'Pending'}
              </Text>
            </View>
          </TouchableOpacity>
        ))}

        <View style={{ height: 40 }} />
      </Animated.ScrollView>

      {/* Payment Modal */}
      <Modal visible={showPayModal} transparent animationType="slide" onRequestClose={() => { setShowPayModal(false); setPayPhase(0); }}>
        <View style={styles.modalOverlay}>
          <View style={[styles.paySheet, { backgroundColor: theme.card }]}>
            {payPhase === 3 ? (
              <View style={styles.successContent}>
                <LinearGradient colors={['#10B981', '#059669']} style={styles.successIcon}>
                  <Ionicons name="checkmark" size={40} color="#FFF" />
                </LinearGradient>
                <Text style={[styles.successTitle, { color: theme.text }]}>Payment Successful! 🎉</Text>
                <Text style={[styles.successSub, { color: theme.sub }]}>
                  GH₵{selectedFee?.amount.toLocaleString()} paid for {selectedFee?.label}
                </Text>
                <Text style={[styles.successRef, { color: theme.sub }]}>
                  Ref: TXN-{Date.now().toString().slice(-10)}
                </Text>
                <TouchableOpacity style={styles.successBtn} onPress={() => { setShowPayModal(false); setPayPhase(0); }}>
                  <Text style={{ color: '#FFF', fontWeight: '900', fontSize: 16 }}>Done</Text>
                </TouchableOpacity>
              </View>
            ) : payPhase === 2 ? (
              <View style={styles.processingContent}>
                <Animated.View>
                  <Ionicons name="hourglass" size={48} color="#6366F1" />
                </Animated.View>
                <Text style={[styles.processingTitle, { color: theme.text }]}>Processing Payment...</Text>
                <Text style={[styles.processingSub, { color: theme.sub }]}>Please do not close this screen</Text>
              </View>
            ) : (
              <>
                <View style={styles.payHandle} />
                <Text style={[styles.payTitle, { color: theme.text }]}>
                  {payPhase === 0 ? 'Choose Payment Method' : 'Confirm Payment'}
                </Text>
                {payPhase === 0 ? (
                  <>
                    <Text style={[styles.payAmount, { color: '#6366F1' }]}>GH₵ {selectedFee?.amount.toLocaleString()}.00</Text>
                    <Text style={[styles.payFeeLabel, { color: theme.sub }]}>{selectedFee?.label}</Text>
                    {PAYMENT_METHODS.map(m => (
                      <TouchableOpacity key={m.id} style={[styles.methodBtn, { borderColor: selectedMethod?.id === m.id ? m.color : theme.border },
                        selectedMethod?.id === m.id && { backgroundColor: m.color + '10' }]}
                        onPress={() => setSelectedMethod(m)}>
                        <LinearGradient colors={[m.color, m.color + 'CC']} style={styles.methodIcon}>
                          <Ionicons name={m.icon} size={18} color="#FFF" />
                        </LinearGradient>
                        <View style={styles.methodInfo}>
                          <Text style={[styles.methodLabel, { color: theme.text }]}>{m.label}</Text>
                          <Text style={[styles.methodSub, { color: theme.sub }]}>{m.sub}</Text>
                        </View>
                        {selectedMethod?.id === m.id && <Ionicons name="checkmark-circle" size={20} color={m.color} />}
                      </TouchableOpacity>
                    ))}
                    <TouchableOpacity style={[styles.nextBtn, !selectedMethod && { opacity: 0.4 }]}
                      disabled={!selectedMethod} onPress={() => setPayPhase(1)}>
                      <Text style={{ color: '#FFF', fontWeight: '900', fontSize: 16 }}>Continue</Text>
                    </TouchableOpacity>
                  </>
                ) : (
                  <>
                    <View style={[styles.confirmCard, { backgroundColor: isDark ? '#0F172A' : '#F8FAFC' }]}>
                      {[
                        { label: 'Item', value: selectedFee?.label },
                        { label: 'Amount', value: `GH₵ ${selectedFee?.amount.toLocaleString()}.00` },
                        { label: 'Method', value: selectedMethod?.label },
                        { label: 'Date', value: new Date().toLocaleDateString() },
                      ].map(r => (
                        <View key={r.label} style={[styles.confirmRow, { borderBottomColor: theme.border }]}>
                          <Text style={[styles.confirmLabel, { color: theme.sub }]}>{r.label}</Text>
                          <Text style={[styles.confirmValue, { color: theme.text }]}>{r.value}</Text>
                        </View>
                      ))}
                    </View>
                    {(selectedMethod?.id === 'm1' || selectedMethod?.id === 'm2') && (
                      <TextInput placeholder="Enter MoMo number" placeholderTextColor={theme.sub}
                        value={momoNum} onChangeText={setMomoNum} keyboardType="phone-pad"
                        style={[styles.momoInput, { color: theme.text, borderColor: theme.border }]} />
                    )}
                    <TouchableOpacity style={styles.confirmBtn} onPress={processPayment}>
                      <LinearGradient colors={['#10B981', '#059669']} style={styles.confirmBtnInner}>
                        <Ionicons name="lock-closed" size={18} color="#FFF" />
                        <Text style={{ color: '#FFF', fontWeight: '900', fontSize: 16 }}>Pay Now — Secure</Text>
                      </LinearGradient>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.cancelBtn} onPress={() => setPayPhase(0)}>
                      <Text style={{ color: theme.sub, fontWeight: '700' }}>Go Back</Text>
                    </TouchableOpacity>
                  </>
                )}
              </>
            )}
          </View>
        </View>
      </Modal>

      {/* Receipt Modal */}
      <Modal visible={showReceiptModal} transparent animationType="slide" onRequestClose={() => setShowReceiptModal(false)}>
        <View style={styles.modalOverlay}>
          {selectedReceipt && (
            <View style={[styles.receiptSheet, { backgroundColor: theme.card }]}>
              <View style={styles.payHandle} />
              <Text style={[styles.receiptTitle, { color: theme.text }]}>Payment Receipt</Text>
              <View style={[styles.receiptStamp, { backgroundColor: selectedReceipt.status === 'success' ? '#ECFDF5' : '#FFFBEB' }]}>
                <Ionicons name={selectedReceipt.status === 'success' ? 'checkmark-circle' : 'time'} size={28}
                  color={selectedReceipt.status === 'success' ? '#10B981' : '#F59E0B'} />
                <Text style={[styles.receiptStampText, { color: selectedReceipt.status === 'success' ? '#10B981' : '#F59E0B' }]}>
                  {selectedReceipt.status === 'success' ? 'VERIFIED' : 'PENDING'}
                </Text>
              </View>
              {[
                { label: 'Description', value: selectedReceipt.type },
                { label: 'Amount', value: `GH₵ ${selectedReceipt.amount.toLocaleString()}.00` },
                { label: 'Date', value: selectedReceipt.date },
                { label: 'Method', value: selectedReceipt.method },
                { label: 'Reference', value: selectedReceipt.ref },
              ].map(r => (
                <View key={r.label} style={[styles.receiptRow, { borderBottomColor: theme.border }]}>
                  <Text style={[styles.confirmLabel, { color: theme.sub }]}>{r.label}</Text>
                  <Text style={[styles.confirmValue, { color: theme.text }]}>{r.value}</Text>
                </View>
              ))}
              <TouchableOpacity style={[styles.downloadBtn, { borderColor: '#6366F1' }]}
                onPress={() => { setShowReceiptModal(false); Alert.alert('Downloaded', 'Receipt saved to your downloads.'); }}>
                <Ionicons name="download" size={18} color="#6366F1" />
                <Text style={{ color: '#6366F1', fontWeight: '800' }}>Download PDF Receipt</Text>
              </TouchableOpacity>
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
  balanceCard: { margin: 20, borderRadius: 24, padding: 22, gap: 12 },
  balanceLabel: { fontSize: 10, fontWeight: '900', color: 'rgba(255,255,255,0.75)', letterSpacing: 1 },
  balanceAmount: { fontSize: 38, fontWeight: '900', color: '#FFF' },
  balanceRow: { flexDirection: 'row', justifyContent: 'space-around' },
  balanceItem: { alignItems: 'center', gap: 4 },
  balanceItemLabel: { fontSize: 11, color: 'rgba(255,255,255,0.75)', fontWeight: '600' },
  balanceItemValue: { fontSize: 16, fontWeight: '900', color: '#FFF' },
  balanceDivider: { width: 1, backgroundColor: 'rgba(255,255,255,0.3)' },
  balanceBar: { height: 6, backgroundColor: 'rgba(255,255,255,0.3)', borderRadius: 3, overflow: 'hidden' },
  balanceBarFill: { height: '100%', backgroundColor: '#FFF', borderRadius: 3 },
  balanceBarLabel: { fontSize: 11, color: 'rgba(255,255,255,0.8)', fontWeight: '700', textAlign: 'right' },
  overdueBanner: { flexDirection: 'row', alignItems: 'center', gap: 8, marginHorizontal: 20, marginBottom: 16, backgroundColor: '#FEF2F2', padding: 14, borderRadius: 14 },
  overdueText: { flex: 1, fontSize: 13, color: '#B91C1C', lineHeight: 18 },
  sectionHeader: { fontSize: 11, fontWeight: '900', letterSpacing: 1, marginHorizontal: 20, marginBottom: 12 },
  feeCard: { flexDirection: 'row', alignItems: 'center', marginHorizontal: 20, marginBottom: 10, borderRadius: 18, padding: 16, borderWidth: 1 },
  feeLeft: { flex: 1 },
  feeName: { fontSize: 15, fontWeight: '800' },
  feeDue: { fontSize: 12, fontWeight: '600', marginTop: 2 },
  feeRight: { alignItems: 'flex-end', gap: 6 },
  feeAmount: { fontSize: 17, fontWeight: '900' },
  paidBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: '#ECFDF5', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  paidText: { fontSize: 10, fontWeight: '900', color: '#10B981', letterSpacing: 0.5 },
  payNowBtn: { paddingHorizontal: 14, paddingVertical: 7, borderRadius: 10 },
  payNowText: { fontSize: 12, fontWeight: '900', color: '#FFF' },
  aidCard: { flexDirection: 'row', alignItems: 'center', marginHorizontal: 20, padding: 16, borderRadius: 18, gap: 12 },
  aidIcon: { width: 44, height: 44, borderRadius: 14, justifyContent: 'center', alignItems: 'center' },
  aidInfo: { flex: 1 },
  aidTitle: { fontSize: 15, fontWeight: '800' },
  aidSub: { fontSize: 12, fontWeight: '600', marginTop: 2 },
  histCard: { flexDirection: 'row', alignItems: 'center', marginHorizontal: 20, marginBottom: 10, borderRadius: 18, padding: 14, borderWidth: 1, gap: 12 },
  histIcon: { width: 44, height: 44, borderRadius: 14, justifyContent: 'center', alignItems: 'center' },
  histInfo: { flex: 1 },
  histType: { fontSize: 14, fontWeight: '800' },
  histDate: { fontSize: 12, fontWeight: '600', marginTop: 2 },
  histRight: { alignItems: 'flex-end' },
  histAmount: { fontSize: 16, fontWeight: '900' },
  histStatus: { fontSize: 11, fontWeight: '700', marginTop: 2 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  paySheet: { borderTopLeftRadius: 28, borderTopRightRadius: 28, padding: 24, gap: 14, maxHeight: '90%' },
  payHandle: { width: 40, height: 4, borderRadius: 2, backgroundColor: '#94A3B8', alignSelf: 'center', marginBottom: 8 },
  payTitle: { fontSize: 20, fontWeight: '900' },
  payAmount: { fontSize: 32, fontWeight: '900' },
  payFeeLabel: { fontSize: 14, fontWeight: '600', marginTop: -8 },
  methodBtn: { flexDirection: 'row', alignItems: 'center', gap: 12, borderWidth: 1.5, borderRadius: 14, padding: 14 },
  methodIcon: { width: 40, height: 40, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
  methodInfo: { flex: 1 },
  methodLabel: { fontSize: 15, fontWeight: '800' },
  methodSub: { fontSize: 12, fontWeight: '600' },
  nextBtn: { backgroundColor: '#6366F1', paddingVertical: 16, borderRadius: 18, alignItems: 'center' },
  confirmCard: { borderRadius: 14, padding: 16, gap: 12 },
  confirmRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 10, borderBottomWidth: 1 },
  confirmLabel: { fontSize: 12, fontWeight: '700' },
  confirmValue: { fontSize: 14, fontWeight: '900' },
  momoInput: { borderWidth: 1, borderRadius: 14, paddingHorizontal: 16, paddingVertical: 12, fontSize: 16, fontWeight: '700' },
  confirmBtn: { borderRadius: 18, overflow: 'hidden' },
  confirmBtnInner: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, paddingVertical: 16 },
  cancelBtn: { alignItems: 'center', paddingVertical: 12 },
  successContent: { alignItems: 'center', gap: 16, paddingVertical: 20 },
  successIcon: { width: 80, height: 80, borderRadius: 40, justifyContent: 'center', alignItems: 'center' },
  successTitle: { fontSize: 22, fontWeight: '900' },
  successSub: { fontSize: 14, fontWeight: '600', textAlign: 'center' },
  successRef: { fontSize: 12, fontWeight: '700' },
  successBtn: { backgroundColor: '#10B981', paddingHorizontal: 40, paddingVertical: 14, borderRadius: 20 },
  processingContent: { alignItems: 'center', gap: 16, paddingVertical: 40 },
  processingTitle: { fontSize: 20, fontWeight: '900' },
  processingSub: { fontSize: 14, fontWeight: '600' },
  receiptSheet: { borderTopLeftRadius: 28, borderTopRightRadius: 28, padding: 24, gap: 14 },
  receiptTitle: { fontSize: 20, fontWeight: '900' },
  receiptStamp: { flexDirection: 'row', alignItems: 'center', gap: 8, padding: 12, borderRadius: 12 },
  receiptStampText: { fontSize: 13, fontWeight: '900', letterSpacing: 1 },
  receiptRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 10, borderBottomWidth: 1 },
  downloadBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, paddingVertical: 14, borderRadius: 14, borderWidth: 1.5 },
});
