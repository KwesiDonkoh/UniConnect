import React from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, Dimensions, ScrollView } from 'react-native';
import { BlurView } from 'expo-blur';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

const { width, height } = Dimensions.get('window');

const SmartBooking = ({ visible, onClose, isDark }) => {
  const rooms = [
    { name: 'Library Pod A3', status: 'Available', time: 'Now', color: '#10B981' },
    { name: 'Neural Lab 02', status: 'Booked', time: 'Until 2PM', color: '#EF4444' },
    { name: 'Creative Studio', status: 'Available', time: 'In 30m', color: '#F59E0B' },
  ];

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <BlurView intensity={95} tint={isDark ? 'dark' : 'light'} style={StyleSheet.absoluteFill} />
        
        <View style={[styles.modalContent, isDark && styles.darkModal]}>
          <TouchableOpacity style={styles.closeBtn} onPress={onClose}>
            <Ionicons name="close" size={28} color={isDark ? '#FFF' : '#000'} />
          </TouchableOpacity>

          <View style={styles.header}>
            <Ionicons name="scan" size={40} color="#F43F5E" />
            <Text style={[styles.title, isDark && styles.whiteText]}>Smart Booking</Text>
            <Text style={styles.subtitle}>AR FACILITY RESERVATION</Text>
          </View>

          <View style={styles.arPreview}>
            <Ionicons name="cube-outline" size={60} color="#F43F5E" />
            <Text style={styles.arText}>AR HOLOGRAPHIC MAP LIVE</Text>
          </View>

          <ScrollView style={styles.roomList} showsVerticalScrollIndicator={false}>
            <Text style={styles.sectionHeader}>NEARBY FACILITIES</Text>
            {rooms.map(room => (
              <View key={room.name} style={[styles.roomCard, isDark && styles.darkCard]}>
                <View style={styles.roomInfo}>
                  <Text style={[styles.roomName, isDark && styles.whiteText]}>{room.name}</Text>
                  <Text style={styles.roomTime}>{room.time}</Text>
                </View>
                <TouchableOpacity style={[styles.statusBadge, { backgroundColor: room.status === 'Available' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)' }]}>
                  <Text style={[styles.statusText, { color: room.color }]}>{room.status}</Text>
                </TouchableOpacity>
              </View>
            ))}
          </ScrollView>

          <TouchableOpacity style={styles.bookBtn} onPress={onClose}>
            <LinearGradient colors={['#F43F5E', '#E11D48']} style={styles.gradient}>
              <Text style={styles.bookText}>SCAN ROOM QR</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  modalContent: { width: width * 0.9, height: height * 0.85, backgroundColor: '#FFF', borderRadius: 40, padding: 30 },
  darkModal: { backgroundColor: '#0F172A' },
  closeBtn: { alignSelf: 'flex-end' },
  header: { alignItems: 'center', marginBottom: 20 },
  title: { fontSize: 24, fontWeight: '900', color: '#1E293B', marginTop: 10 },
  whiteText: { color: '#FFF' },
  subtitle: { fontSize: 9, fontWeight: '900', color: '#F43F5E', letterSpacing: 2, marginTop: 4 },
  arPreview: { height: 160, backgroundColor: 'rgba(244, 63, 94, 0.05)', borderRadius: 24, justifyContent: 'center', alignItems: 'center', borderWidth: 2, borderColor: 'rgba(244, 63, 94, 0.2)', borderStyle: 'dashed', marginBottom: 30 },
  arText: { fontSize: 10, fontWeight: '900', color: '#F43F5E', marginTop: 10, letterSpacing: 1 },
  roomList: { flex: 1 },
  sectionHeader: { fontSize: 12, fontWeight: '900', color: '#94A3B8', marginBottom: 15 },
  roomCard: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: '#F8FAFC', padding: 15, borderRadius: 16, marginBottom: 12 },
  darkCard: { backgroundColor: 'rgba(255,255,255,0.05)' },
  roomName: { fontSize: 14, fontWeight: '800', color: '#1E293B' },
  roomTime: { fontSize: 11, color: '#64748B', marginTop: 4 },
  statusBadge: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 10 },
  statusText: { fontSize: 10, fontWeight: '900' },
  bookBtn: { height: 60, borderRadius: 20, overflow: 'hidden', marginTop: 15 },
  gradient: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  bookText: { color: '#FFF', fontWeight: '900', letterSpacing: 1 },
});

export default SmartBooking;
