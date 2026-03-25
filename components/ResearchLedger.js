import React from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, Dimensions, ScrollView } from 'react-native';
import { BlurView } from 'expo-blur';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

const { width, height } = Dimensions.get('window');

const ResearchLedger = ({ visible, onClose, isDark }) => {
  const records = [
    { type: 'Grade Point', value: '4.85 / 5.0', cert: 'VERIFIED_SIS_A+', date: 'MAR 2026' },
    { type: 'Neural Literacy', value: 'Advanced', cert: 'AI_LAB_CERT', date: 'FEB 2026' },
    { type: 'Global Peer Rank', value: 'Top 5%', cert: 'KNUST_COMM_CERT', date: 'JAN 2026' },
    { type: 'Innovation Index', value: '94/100', cert: 'RESEARCH_BLOCK_A', date: 'DEC 2025' },
  ];

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <BlurView intensity={98} tint={isDark ? 'dark' : 'light'} style={StyleSheet.absoluteFill} />
        
        <View style={[styles.modalContent, isDark && styles.darkModal]}>
          <TouchableOpacity style={styles.closeBtn} onPress={onClose}>
            <Ionicons name="close" size={28} color={isDark ? '#FFF' : '#000'} />
          </TouchableOpacity>

          <View style={styles.header}>
            <Ionicons name="shield-checkmark" size={32} color="#10B981" />
            <Text style={[styles.title, isDark && styles.whiteText]}>Research Ledger</Text>
            <Text style={styles.subtitle}>IMMUTABLE ACADEMIC RECORD</Text>
          </View>

          <ScrollView style={styles.ledgerArea} showsVerticalScrollIndicator={false}>
            {records.map((record) => (
              <View key={record.type} style={[styles.recordBlock, isDark && styles.darkBlock]}>
                <View style={styles.blockHeader}>
                  <Text style={styles.blockType}>{record.type}</Text>
                  <Text style={styles.blockDate}>{record.date}</Text>
                </View>
                <Text style={[styles.blockValue, isDark && styles.whiteText]}>{record.value}</Text>
                <View style={styles.blockFooter}>
                  <Ionicons name="cube" size={14} color="#6366F1" />
                  <Text style={styles.certCode}>{record.cert}</Text>
                </View>
              </View>
            ))}
            
            <View style={styles.statusSection}>
              <View style={styles.statusIndicator} />
              <Text style={styles.statusText}>ALL BLOCKS SYNCHRONIZED WITH GLOBAL LEDGER</Text>
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'center' },
  modalContent: { marginHorizontal: 20, maxHeight: height * 0.85, padding: 30, backgroundColor: '#FFF', borderRadius: 32 },
  darkModal: { backgroundColor: '#020617' },
  closeBtn: { alignSelf: 'flex-end', marginBottom: 10 },
  header: { alignItems: 'center', marginBottom: 30 },
  title: { fontSize: 22, fontWeight: '900', color: '#1E293B', marginTop: 10 },
  whiteText: { color: '#FFFFFF' },
  subtitle: { fontSize: 9, fontWeight: '900', color: '#10B981', letterSpacing: 3, marginTop: 4 },
  ledgerArea: { flex: 0 },
  recordBlock: { backgroundColor: '#F8FAFC', padding: 20, borderRadius: 20, marginBottom: 16, borderLeftWidth: 4, borderLeftColor: '#6366F1' },
  darkBlock: { backgroundColor: 'rgba(255,255,255,0.05)' },
  blockHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  blockType: { fontSize: 10, fontWeight: '900', color: '#64748B', textTransform: 'uppercase' },
  blockDate: { fontSize: 9, color: '#94A3B8' },
  blockValue: { fontSize: 20, fontWeight: '800', color: '#1E293B' },
  blockFooter: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 12 },
  certCode: { fontSize: 9, fontWeight: '700', color: '#6366F1', fontStyle: 'italic' },
  statusSection: { alignItems: 'center', marginTop: 20, flexDirection: 'row', justifyContent: 'center', gap: 8 },
  statusIndicator: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#10B981' },
  statusText: { fontSize: 8, fontWeight: '800', color: '#10B981' },
});

export default ResearchLedger;
