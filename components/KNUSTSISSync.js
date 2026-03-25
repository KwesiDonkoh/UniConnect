import React, { useState, useRef } from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, Dimensions, Animated, Easing } from 'react-native';
import { BlurView } from 'expo-blur';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

const { width, height } = Dimensions.get('window');

const KNUSTSISSync = ({ visible, onClose, isDark, onSyncComplete }) => {
  const [syncing, setSyncing] = useState(false);
  const spinAnim = useRef(new Animated.Value(0)).current;

  const startSync = () => {
    setSyncing(true);
    Animated.loop(
      Animated.timing(spinAnim, {
        toValue: 1,
        duration: 2000,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    ).start();

    setTimeout(() => {
      setSyncing(false);
      spinAnim.stopAnimation();
      spinAnim.setValue(0);
      if (onSyncComplete) onSyncComplete();
    }, 4000);
  };

  const spin = spinAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <BlurView intensity={90} tint={isDark ? 'dark' : 'light'} style={StyleSheet.absoluteFill} />
        
        <View style={[styles.modalContent, isDark && styles.darkModal]}>
          <View style={styles.header}>
            <Text style={[styles.title, isDark && styles.whiteText]}>SIS Global Sync</Text>
            <TouchableOpacity onPress={onClose}>
              <Ionicons name="close" size={28} color={isDark ? '#FFF' : '#000'} />
            </TouchableOpacity>
          </View>

          <View style={styles.syncBody}>
            <View style={styles.logoContainer}>
              <LinearGradient colors={['#A855F7', '#6366F1']} style={styles.syncRing}>
                <Animated.View style={{ transform: [{ rotate: spin }] }}>
                  <Ionicons name="sync" size={60} color="#FFFFFF" />
                </Animated.View>
              </LinearGradient>
              {syncing && <Text style={styles.syncingStatus}>SYNCHRONIZING...</Text>}
            </View>

            <View style={[styles.syncLog, isDark && styles.darkLog]}>
              <View style={styles.logRow}>
                <Ionicons name="checkmark-circle" size={16} color="#10B981" />
                <Text style={styles.logText}>Identity verified with KNUST Portal</Text>
              </View>
              <View style={styles.logRow}>
                <Ionicons name="checkmark-circle" size={16} color="#10B981" />
                <Text style={styles.logText}>Semester 2 module list retrieved</Text>
              </View>
              <View style={styles.logRow}>
                <Ionicons name={syncing ? "ellipsis-horizontal" : "time-outline"} size={16} color="#64748B" />
                <Text style={styles.logText}>Financial clearance status: PENDING</Text>
              </View>
            </View>

            <TouchableOpacity 
              style={[styles.syncBtn, syncing && styles.btnDisabled]} 
              onPress={startSync}
              disabled={syncing}
            >
              <LinearGradient colors={['#6366F1', '#8B5CF6']} style={styles.btnGradient}>
                <Text style={styles.btnText}>{syncing ? 'SYNC IN PROGRESS' : 'INITIALIZE PORTAL SYNC'}</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  modalContent: { width: width * 0.9, padding: 30, backgroundColor: '#FFF', borderRadius: 40 },
  darkModal: { backgroundColor: '#1E293B' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 40 },
  title: { fontSize: 24, fontWeight: '900', color: '#1E293B' },
  whiteText: { color: '#FFF' },
  syncBody: { alignItems: 'center' },
  logoContainer: { alignItems: 'center', marginBottom: 40 },
  syncRing: { width: 120, height: 120, borderRadius: 60, justifyContent: 'center', alignItems: 'center', elevation: 10, shadowColor: '#6366F1', shadowOffset: { width: 0, height: 5 }, shadowOpacity: 0.3, shadowRadius: 10 },
  syncingStatus: { marginTop: 15, fontSize: 12, fontWeight: '800', color: '#6366F1', letterSpacing: 2 },
  syncLog: { width: '100%', padding: 20, backgroundColor: '#F8FAFC', borderRadius: 25, marginBottom: 40 },
  darkLog: { backgroundColor: '#334155' },
  logRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 12 },
  logText: { fontSize: 13, color: '#64748B', fontWeight: '600' },
  syncBtn: { width: '100%', borderRadius: 20, overflow: 'hidden' },
  btnDisabled: { opacity: 0.7 },
  btnGradient: { padding: 20, alignItems: 'center' },
  btnText: { color: '#FFF', fontWeight: '900', letterSpacing: 1 },
});

export default KNUSTSISSync;
