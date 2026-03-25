import React from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, ScrollView, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

const AICampusMap = ({ visible, onClose }) => {
  const landmarks = [
    { title: 'Unity Hall', status: 'Active', icon: 'business', color: '#6366F1' },
    { title: 'Main Library', status: 'Quiet', icon: 'library', color: '#10B981' },
    { title: 'Great Hall', status: 'Event', icon: 'star', color: '#F59E0B' },
    { title: 'Engineering Hub', status: 'Open', icon: 'cog', color: '#EF4444' },
  ];

  return (
    <Modal visible={visible} transparent animationType="slide">
      <View style={styles.overlay}>
        <View style={styles.container}>
          <LinearGradient colors={['#F8FAFC', '#F1F5F9']} style={styles.card}>
            <View style={styles.header}>
              <View>
                <Text style={styles.title}>AI Campus Map</Text>
                <Text style={styles.subtitle}>Smart Navigation & Tracking</Text>
              </View>
              <TouchableOpacity onPress={onClose}>
                <Ionicons name="close-circle" size={32} color="#64748B" />
              </TouchableOpacity>
            </View>

            <View style={styles.mapPlaceholder}>
              <LinearGradient colors={['#E2E8F0', '#CBD5E1']} style={styles.mapGradient}>
                <Ionicons name="map" size={80} color="rgba(99, 102, 241, 0.4)" />
                <View style={styles.marker}>
                   <View style={styles.markerPulse} />
                   <Ionicons name="location" size={24} color="#EF4444" />
                </View>
              </LinearGradient>
            </View>

            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.landmarkList}>
               {landmarks.map((mark, i) => (
                 <TouchableOpacity key={i} style={styles.markCard}>
                   <View style={[styles.markIcon, { backgroundColor: mark.color }]}>
                     <Ionicons name={mark.icon} size={20} color="#FFFFFF" />
                   </View>
                   <Text style={styles.markTitle}>{mark.title}</Text>
                   <View style={styles.badge}>
                      <Text style={styles.badgeText}>{mark.status}</Text>
                   </View>
                 </TouchableOpacity>
               ))}
            </ScrollView>

            <TouchableOpacity style={styles.mainButton} onPress={onClose}>
              <Text style={styles.buttonText}>Launch AR Guide</Text>
              <Ionicons name="scan-outline" size={20} color="#FFFFFF" />
            </TouchableOpacity>
          </LinearGradient>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'flex-end' },
  container: { height: '80%', width: '100%', borderTopLeftRadius: 30, borderTopRightRadius: 30, overflow: 'hidden' },
  card: { flex: 1, padding: 24 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 },
  title: { fontSize: 24, fontWeight: '900', color: '#1E293B' },
  subtitle: { fontSize: 14, color: '#64748B', fontWeight: '600' },
  mapPlaceholder: { height: 250, borderRadius: 24, overflow: 'hidden', marginBottom: 24 },
  mapGradient: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  marker: { position: 'absolute', top: '40%', left: '50%' },
  markerPulse: { position: 'absolute', width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(239, 68, 68, 0.3)', top: -8, left: -8 },
  landmarkList: { marginBottom: 24 },
  markCard: { width: 120, backgroundColor: '#FFFFFF', padding: 16, borderRadius: 20, marginRight: 12, alignItems: 'center', elevation: 2 },
  markIcon: { width: 40, height: 40, borderRadius: 10, justifyContent: 'center', alignItems: 'center', marginBottom: 8 },
  markTitle: { fontSize: 13, fontWeight: '700', color: '#1E293B', marginBottom: 4 },
  badge: { backgroundColor: '#F1F5F9', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 8 },
  badgeText: { fontSize: 10, color: '#64748B', fontWeight: '800' },
  mainButton: { backgroundColor: '#6366F1', flexDirection: 'row', paddingVertical: 16, borderRadius: 16, alignItems: 'center', justifyContent: 'center', gap: 10 },
  buttonText: { color: '#FFFFFF', fontWeight: '800', fontSize: 16 },
});

export default AICampusMap;
