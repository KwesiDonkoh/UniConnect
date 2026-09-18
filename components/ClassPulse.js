import React, { useState } from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, Dimensions, ScrollView } from 'react-native';
import { BlurView } from 'expo-blur';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

const { width, height } = Dimensions.get('window');

const ClassPulse = ({ visible, onClose, isDark }) => {
  const stats = [
    { label: 'CONFUSION METRIC', value: '12%', color: '#10B981', desc: 'Class is engaged and tracking.' },
    { label: 'ACTIVE PARTICIPANTS', value: '184', color: '#6366F1', desc: 'Out of 200 enrolled students.' },
    { label: 'TOPIC RETENTION', value: '88%', color: '#F59E0B', desc: 'Based on instant micro-quiz data.' },
  ];

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <BlurView intensity={100} tint={isDark ? 'dark' : 'light'} style={StyleSheet.absoluteFill} />
        
        <View style={[styles.modalContent, isDark && styles.darkModal]}>
          <TouchableOpacity style={styles.closeBtn} onPress={onClose}>
            <Ionicons name="close" size={28} color={isDark ? '#FFF' : '#000'} />
          </TouchableOpacity>

          <View style={styles.header}>
            <Ionicons name="pulse" size={40} color="#EF4444" />
            <Text style={[styles.title, isDark && styles.whiteText]}>Class Pulse</Text>
            <Text style={styles.subtitle}>LIVE LECTURE TELEMETRY</Text>
          </View>

          <View style={styles.liveGraphBox}>
            <View style={styles.liveHeader}>
              <View style={styles.onlineDot} />
              <Text style={styles.liveText}>BROADCASTING LIVE</Text>
            </View>
            <Ionicons name="analytics" size={60} color="#EF4444" style={styles.graphIcon} />
            <Text style={styles.graphLabel}>Awaiting peak engagement metrics...</Text>
          </View>

          <ScrollView style={styles.statsScroll} showsVerticalScrollIndicator={false}>
            {stats.map(stat => (
              <View key={stat.label} style={[styles.statCard, isDark && styles.darkCard, { borderLeftColor: stat.color }]}>
                <Text style={styles.statLabel}>{stat.label}</Text>
                <Text style={[styles.statValue, { color: stat.color }]}>{stat.value}</Text>
                <Text style={styles.statDesc}>{stat.desc}</Text>
              </View>
            ))}
          </ScrollView>

          <TouchableOpacity style={styles.resetBtn}>
            <LinearGradient colors={['#EF4444', '#B91C1C']} style={styles.gradient}>
              <Text style={styles.resetText}>RESET PULSE TRACKER</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: { flex: 1, justifyContent: 'flex-end' },
  modalContent: { height: height * 0.85, backgroundColor: '#FFF', borderTopLeftRadius: 40, borderTopRightRadius: 40, padding: 30 },
  darkModal: { backgroundColor: '#0F172A' },
  closeBtn: { alignSelf: 'flex-end' },
  header: { alignItems: 'center', marginBottom: 20 },
  title: { fontSize: 24, fontWeight: '900', color: '#1E293B', marginTop: 10 },
  whiteText: { color: '#FFF' },
  subtitle: { fontSize: 9, fontWeight: '900', color: '#EF4444', letterSpacing: 2, marginTop: 4 },
  liveGraphBox: { backgroundColor: 'rgba(239, 68, 68, 0.05)', height: 160, borderRadius: 24, padding: 20, alignItems: 'center', justifyContent: 'center', marginBottom: 20, borderWidth: 1, borderColor: 'rgba(239, 68, 68, 0.1)' },
  liveHeader: { position: 'absolute', top: 15, left: 15, flexDirection: 'row', alignItems: 'center', gap: 6 },
  onlineDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#EF4444' },
  liveText: { fontSize: 9, fontWeight: '900', color: '#EF4444', letterSpacing: 1 },
  graphIcon: { opacity: 0.5 },
  graphLabel: { fontSize: 10, color: '#94A3B8', marginTop: 10 },
  statsScroll: { flex: 1 },
  statCard: { backgroundColor: '#F8FAFC', padding: 20, borderRadius: 16, marginBottom: 12, borderLeftWidth: 4 },
  darkCard: { backgroundColor: 'rgba(255,255,255,0.05)' },
  statLabel: { fontSize: 10, fontWeight: '900', color: '#64748B', letterSpacing: 1 },
  statValue: { fontSize: 24, fontWeight: '900', marginTop: 4 },
  statDesc: { fontSize: 11, color: '#94A3B8', marginTop: 4 },
  resetBtn: { height: 60, borderRadius: 20, overflow: 'hidden', marginTop: 15 },
  gradient: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  resetText: { color: '#FFF', fontWeight: '900', letterSpacing: 1 },
});

export default ClassPulse;
