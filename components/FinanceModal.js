import React, { useState } from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, Dimensions, ScrollView, TextInput, KeyboardAvoidingView, Platform, ActivityIndicator } from 'react-native';
import { BlurView } from 'expo-blur';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

const { width, height } = Dimensions.get('window');

const FinanceModal = ({ visible, onClose, isDark, onTopUpSuccess }) => {
  const [step, setStep] = useState('method'); // 'method', 'details', 'amount', 'loading', 'success'
  const [method, setMethod] = useState(null); // 'momo', 'bank'
  const [vendor, setVendor] = useState(null);
  const [amount, setAmount] = useState('');
  const [accountNumber, setAccountNumber] = useState('');

  const momoVendors = [
    { id: 'mtn', name: 'MTN MoMo', color: '#FFCC00', icon: 'flash' },
    { id: 'voda', name: 'Telecel Cash', color: '#EF4444', icon: 'logo-vimeo' },
    { id: 'at', name: 'AT Money', color: '#003399', icon: 'infinite' },
  ];

  const banks = [
    { id: 'gcb', name: 'GCB Bank', color: '#6366F1' },
    { id: 'ecobank', name: 'Ecobank', color: '#047857' },
    { id: 'stanbic', name: 'Stanbic Bank', color: '#1E40AF' },
  ];

  const handleTopUp = () => {
    if (!amount || isNaN(amount)) return;
    setStep('loading');
    // Simulate real money processing
    setTimeout(() => {
      setStep('success');
      onTopUpSuccess(parseFloat(amount));
    }, 3000);
  };

  const renderStep = () => {
    switch (step) {
      case 'method':
        return (
          <View>
            <Text style={[styles.stepTitle, isDark && styles.whiteText]}>Select Payment Method</Text>
            <TouchableOpacity style={[styles.methodBtn, isDark && styles.darkCard]} onPress={() => { setMethod('momo'); setStep('details'); }}>
              <LinearGradient colors={['#FFD700', '#F59E0B']} style={styles.methodIcon}>
                <Ionicons name="phone-portrait" size={24} color="#000" />
              </LinearGradient>
              <View>
                <Text style={[styles.methodName, isDark && styles.whiteText]}>Mobile Money</Text>
                <Text style={styles.methodSub}>MTN, Telecel, AT Money</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#94A3B8" />
            </TouchableOpacity>

            <TouchableOpacity style={[styles.methodBtn, isDark && styles.darkCard]} onPress={() => { setMethod('bank'); setStep('details'); }}>
              <LinearGradient colors={['#6366F1', '#4F46E5']} style={styles.methodIcon}>
                <Ionicons name="card" size={24} color="#FFF" />
              </LinearGradient>
              <View>
                <Text style={[styles.methodName, isDark && styles.whiteText]}>Bank Account</Text>
                <Text style={styles.methodSub}>GCB, Ecobank, Stanbic...</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#94A3B8" />
            </TouchableOpacity>
          </View>
        );
      
      case 'details':
        return (
          <View>
            <TouchableOpacity onPress={() => setStep('method')} style={styles.backBtn}>
              <Ionicons name="arrow-back" size={20} color="#6366F1" />
              <Text style={styles.backText}>Change Method</Text>
            </TouchableOpacity>
            <Text style={[styles.stepTitle, isDark && styles.whiteText]}>
              {method === 'momo' ? 'Select Network' : 'Select Bank'}
            </Text>
            <View style={styles.vendorGrid}>
              {(method === 'momo' ? momoVendors : banks).map(v => (
                <TouchableOpacity 
                  key={v.id} 
                  style={[styles.vendorCard, vendor?.id === v.id && { borderColor: '#6366F1', borderWidth: 2 }, isDark && styles.darkCard]}
                  onPress={() => setVendor(v)}
                >
                  <View style={[styles.vendorLogo, { backgroundColor: v.color + '20' }]}>
                    <Ionicons name={v.icon || 'business'} size={24} color={v.color} />
                  </View>
                  <Text style={[styles.vendorName, isDark && styles.whiteText]}>{v.name}</Text>
                </TouchableOpacity>
              ))}
            </View>
            {vendor && (
              <TouchableOpacity style={styles.nextBtn} onPress={() => setStep('amount')}>
                <LinearGradient colors={['#6366F1', '#4F46E5']} style={styles.nextGrad}>
                  <Text style={styles.nextText}>Continue</Text>
                </LinearGradient>
              </TouchableOpacity>
            )}
          </View>
        );

      case 'amount':
        return (
          <View>
            <TouchableOpacity onPress={() => setStep('details')} style={styles.backBtn}>
              <Ionicons name="arrow-back" size={20} color="#6366F1" />
              <Text style={styles.backText}>Back to {method === 'momo' ? 'Network' : 'Bank'}</Text>
            </TouchableOpacity>
            <Text style={[styles.stepTitle, isDark && styles.whiteText]}>Enter Amount</Text>
            <View style={[styles.inputBox, isDark && styles.darkCard]}>
              <Text style={styles.currency}>GH₵</Text>
              <TextInput 
                style={[styles.input, isDark && styles.whiteText]}
                placeholder="0.00"
                placeholderTextColor="#94A3B8"
                keyboardType="decimal-pad"
                value={amount}
                onChangeText={setAmount}
                autoFocus
              />
            </View>
            <View style={[styles.inputBox, isDark && styles.darkCard, { marginTop: 15 }]}>
              <Ionicons name={method === 'momo' ? "phone-portrait-outline" : "barcode-outline"} size={20} color="#94A3B8" />
              <TextInput 
                style={[styles.input, isDark && styles.whiteText, { fontSize: 16 }]}
                placeholder={method === 'momo' ? "Wallet Number" : "Account Number"}
                placeholderTextColor="#94A3B8"
                keyboardType="number-pad"
                value={accountNumber}
                onChangeText={setAccountNumber}
              />
            </View>
            <TouchableOpacity style={styles.nextBtn} onPress={handleTopUp}>
              <LinearGradient colors={['#6366F1', '#4F46E5']} style={styles.nextGrad}>
                <Text style={styles.nextText}>Secure Top Up</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        );

      case 'loading':
        return (
          <View style={styles.statusCenter}>
            <ActivityIndicator size="large" color="#6366F1" />
            <Text style={[styles.statusTitle, isDark && styles.whiteText]}>Processing...</Text>
            <Text style={styles.statusSub}>Communicating with {vendor?.name} secure gateway...</Text>
          </View>
        );

      case 'success':
        return (
          <View style={styles.statusCenter}>
            <View style={styles.successIcon}>
              <Ionicons name="checkmark-done" size={60} color="#FFF" />
            </View>
            <Text style={[styles.statusTitle, isDark && styles.whiteText]}>Success!</Text>
            <Text style={styles.statusSub}>GH₵ {amount} has been added to your campus wallet.</Text>
            <TouchableOpacity style={[styles.nextBtn, { width: '100%' }]} onPress={() => { setStep('method'); onClose(); }}>
              <LinearGradient colors={['#10B981', '#059669']} style={styles.nextGrad}>
                <Text style={styles.nextText}>Great!</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        );
    }
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
        <View style={styles.overlay}>
          <BlurView intensity={90} tint={isDark ? 'dark' : 'light'} style={StyleSheet.absoluteFill} />
          <View style={[styles.content, isDark && styles.darkContent]}>
            <View style={styles.handle} />
            <View style={styles.headerRow}>
              <Text style={styles.headerLabel}>FINANCE HUB</Text>
              <TouchableOpacity onPress={onClose} style={styles.closeCircle}>
                <Ionicons name="close" size={20} color={isDark ? '#FFF' : '#64748B'} />
              </TouchableOpacity>
            </View>
            {renderStep()}
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: { flex: 1, justifyContent: 'flex-end' },
  content: { backgroundColor: '#FFF', borderTopLeftRadius: 40, borderTopRightRadius: 40, padding: 25, paddingBottom: 50 },
  darkContent: { backgroundColor: '#1E293B' },
  handle: { width: 40, height: 4, backgroundColor: '#E2E8F0', borderRadius: 2, alignSelf: 'center', marginBottom: 20 },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  headerLabel: { fontSize: 10, fontWeight: '900', color: '#6366F1', letterSpacing: 2 },
  closeCircle: { width: 32, height: 32, borderRadius: 16, backgroundColor: '#F1F5F930', justifyContent: 'center', alignItems: 'center' },
  stepTitle: { fontSize: 22, fontWeight: '900', color: '#1E293B', marginBottom: 25 },
  whiteText: { color: '#FFF' },
  methodBtn: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F8FAFC', padding: 20, borderRadius: 24, marginBottom: 15 },
  darkCard: { backgroundColor: '#0F172A' },
  methodIcon: { width: 50, height: 50, borderRadius: 15, justifyContent: 'center', alignItems: 'center', marginRight: 15 },
  methodName: { fontSize: 16, fontWeight: '800', color: '#1E293B' },
  methodSub: { fontSize: 12, color: '#94A3B8', marginTop: 2 },
  backBtn: { flexDirection: 'row', alignItems: 'center', marginBottom: 15 },
  backText: { color: '#6366F1', fontWeight: '800', marginLeft: 5 },
  vendorGrid: { flexDirection: 'row', justifyContent: 'space-between', flexWrap: 'wrap', gap: 10 },
  vendorCard: { width: (width - 70) / 2, backgroundColor: '#F8FAFC', padding: 20, borderRadius: 24, alignItems: 'center' },
  vendorLogo: { width: 44, height: 44, borderRadius: 14, justifyContent: 'center', alignItems: 'center', marginBottom: 10 },
  vendorName: { fontSize: 13, fontWeight: '800', color: '#1E293B', textAlign: 'center' },
  nextBtn: { marginTop: 30, height: 60, borderRadius: 20, overflow: 'hidden' },
  nextGrad: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  nextText: { color: '#FFF', fontWeight: '900', fontSize: 16 },
  inputBox: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F8FAFC', paddingHorizontal: 20, height: 70, borderRadius: 24 },
  currency: { fontSize: 24, fontWeight: '900', color: '#6366F1', marginRight: 10 },
  input: { flex: 1, fontSize: 32, fontWeight: '900', color: '#1E293B' },
  statusCenter: { alignItems: 'center', paddingVertical: 40 },
  statusTitle: { fontSize: 24, fontWeight: '900', color: '#1E293B', marginTop: 20 },
  statusSub: { fontSize: 14, color: '#94A3B8', textAlign: 'center', marginTop: 10, lineHeight: 20, paddingHorizontal: 20 },
  successIcon: { width: 100, height: 100, borderRadius: 50, backgroundColor: '#10B981', justifyContent: 'center', alignItems: 'center' },
});

export default FinanceModal;
