import React from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, Dimensions, ScrollView } from 'react-native';
import { BlurView } from 'expo-blur';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

const { width, height } = Dimensions.get('window');

const GlobalGrantLedger = ({ visible, onClose, isDark }) => {
  const grants = [
    { source: 'UNESCO / Global Fund', amount: '$45,000', project: 'AI for Rural Edu', date: 'APR 2026' },
    { source: 'Microsoft Research', amount: '$12,500', project: 'Neural Architectures', date: 'MAR 2026' },
    { source: 'KNUST VC Fund', amount: 'GH₵ 20,000', project: 'Campus Digitization', date: 'FEB 2026' },
  ];

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <BlurView intensity={100} tint={isDark ? 'dark' : 'light'} style={StyleSheet.absoluteFill} />
        
        <View style={[styles.modalContent, isDark && styles.darkModal]}>
          <TouchableOpacity style={styles.closeBtn} onPress={onClose}>
            <Ionicons name="close" size={28} color={isDark ? '#FFF' : '#000'} />
          </TouchableOpacity>

          <View style={styles.header}>
            <Ionicons name="cash" size={40} color="#10B981" />
            <Text style={[styles.title, isDark && styles.whiteText]}>Global Grant Ledger</Text>
            <Text style={styles.subtitle}>RESEARCH FUNDING HUB</Text>
          </View>

          <View style={styles.totalBox}>
            <Text style={styles.totalLabel}>TOTAL RESEARCH FUNDING</Text>
            <Text style={styles.totalVal}>$57,500.00</Text>
          </View>

          <ScrollView style={styles.grantScroll} showsVerticalScrollIndicator={false}>
            {grants.map(grant => (
              <View key={grant.source} style={[styles.grantCard, isDark && styles.darkCard]}>
                <View style={styles.grantHeader}>
                  <Text style={styles.grantSource}>{grant.source}</Text>
                  <Text style={styles.grantDate}>{grant.date}</Text>
                </View>
                <Text style={[styles.grantProject, isDark && styles.whiteText]}>{grant.project}</Text>
                <Text style={styles.grantAmount}>{grant.amount}</Text>
              </View>
            ))}
          </ScrollView>

          <TouchableOpacity style={styles.applyBtn}>
            <LinearGradient colors={['#10B981', '#059669']} style={styles.gradient}>
              <Text style={styles.applyText}>FIND NEW GRANTS</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  modalContent: { width: width * 0.9, height: height * 0.8, padding: 30, backgroundColor: '#FFF', borderRadius: 40 },
  darkModal: { backgroundColor: '#020617' },
  closeBtn: { alignSelf: 'flex-end' },
  header: { alignItems: 'center', marginBottom: 20 },
  title: { fontSize: 22, fontWeight: '900', textAlign: 'center' },
  whiteText: { color: '#FFF' },
  subtitle: { fontSize: 10, fontWeight: '900', color: '#10B981', letterSpacing: 2, marginTop: 4 },
  totalBox: { backgroundColor: 'rgba(16, 185, 129, 0.05)', padding: 25, borderRadius: 24, alignItems: 'center', marginVertical: 20 },
  totalLabel: { fontSize: 10, fontWeight: '900', color: '#10B981', marginBottom: 4 },
  totalVal: { fontSize: 32, fontWeight: '900', color: '#1E293B' },
  grantScroll: { flex: 1 },
  grantCard: { padding: 20, backgroundColor: '#F8FAFC', borderRadius: 20, marginBottom: 15 },
  darkCard: { backgroundColor: 'rgba(255,255,255,0.05)' },
  grantHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  grantSource: { fontSize: 10, fontWeight: '900', color: '#64748B' },
  grantDate: { fontSize: 9, color: '#94A3B8' },
  grantProject: { fontSize: 15, fontWeight: '800', color: '#1E293B' },
  grantAmount: { fontSize: 14, fontWeight: '900', color: '#10B981', marginTop: 10 },
  applyBtn: { height: 60, borderRadius: 20, overflow: 'hidden', marginTop: 15 },
  gradient: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  applyText: { color: '#FFF', fontWeight: '900', letterSpacing: 1 },
});

export default GlobalGrantLedger;
