import React from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, Dimensions } from 'react-native';
import { BlurView } from 'expo-blur';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

const { width, height } = Dimensions.get('window');

const SmartHallPass = ({ visible, onClose, isDark, user }) => {
  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <BlurView intensity={90} tint={isDark ? 'dark' : 'light'} style={StyleSheet.absoluteFill} />
        
        <View style={[styles.modalContent, isDark && styles.darkModal]}>
          <View style={styles.header}>
            <Text style={[styles.title, isDark && styles.whiteText]}>Smart Hall Pass</Text>
            <TouchableOpacity onPress={onClose}>
              <Ionicons name="close-circle" size={32} color={isDark ? '#FFF' : '#000'} />
            </TouchableOpacity>
          </View>

          <View style={styles.passBody}>
            <LinearGradient colors={['#10B981', '#059669']} style={styles.passCard}>
              <View style={styles.passHeader}>
                <Ionicons name="shield-checkmark" size={40} color="#FFFFFF" />
                <View>
                  <Text style={styles.passBrand}>KNUST SECURE PASS</Text>
                  <Text style={styles.passType}>OFFICIAL DIGITAL CLEARANCE</Text>
                </View>
              </View>

              <View style={styles.qrPlaceholder}>
                <Ionicons name="qr-code" size={180} color="#FFFFFF" />
              </View>

              <View style={styles.passFooter}>
                <View>
                  <Text style={styles.footerLabel}>HOLDER</Text>
                  <Text style={styles.footerValue}>{user?.fullName || 'KWESI DONKOH'}</Text>
                </View>
                <View style={styles.alignRight}>
                  <Text style={styles.footerLabel}>EXPIRES</Text>
                  <Text style={styles.footerValue}>23:59 PM</Text>
                </View>
              </View>
            </LinearGradient>

            <View style={styles.usageInfo}>
              <Ionicons name="information-circle-outline" size={20} color="#64748B" />
              <Text style={styles.infoText}>This pass is valid for today's campus access and hall entry. Show this code to security personnel.</Text>
            </View>

            <TouchableOpacity style={styles.actionBtn}>
              <Text style={styles.actionText}>RE-GENERATE CODE</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: { flex: 1, justifyContent: 'flex-end' },
  modalContent: { height: height * 0.85, backgroundColor: '#FFF', borderTopLeftRadius: 40, borderTopRightRadius: 40, padding: 30 },
  darkModal: { backgroundColor: '#0F172A' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 30 },
  title: { fontSize: 28, fontWeight: '900', color: '#1E293B' },
  whiteText: { color: '#FFF' },
  passBody: { flex: 1, alignItems: 'center' },
  passCard: { width: '100%', borderRadius: 30, padding: 25, elevation: 15, shadowColor: '#10B981', shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.3, shadowRadius: 20 },
  passHeader: { flexDirection: 'row', alignItems: 'center', gap: 15, marginBottom: 40 },
  passBrand: { color: '#FFF', fontSize: 18, fontWeight: '800' },
  passType: { color: 'rgba(255,255,255,0.7)', fontSize: 10, letterSpacing: 1 },
  qrPlaceholder: { alignSelf: 'center', marginBottom: 40 },
  passFooter: { flexDirection: 'row', justifyContent: 'space-between' },
  footerLabel: { color: 'rgba(255,255,255,0.6)', fontSize: 10, fontWeight: '700' },
  footerValue: { color: '#FFF', fontSize: 16, fontWeight: '800', marginTop: 2 },
  alignRight: { alignItems: 'flex-end' },
  usageInfo: { flexDirection: 'row', gap: 10, marginTop: 40, paddingHorizontal: 10 },
  infoText: { flex: 1, color: '#64748B', fontSize: 13, lineHeight: 18 },
  actionBtn: { width: '100%', padding: 20, backgroundColor: '#1E293B', borderRadius: 20, marginTop: 'auto', alignItems: 'center' },
  actionText: { color: '#FFF', fontWeight: '800', letterSpacing: 1 },
});

export default SmartHallPass;
