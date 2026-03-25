import React, { useState } from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, ScrollView, TextInput } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

const PeerCollaboration = ({ visible, onClose }) => {
  const [rooms, setRooms] = useState([
    { id: '1', title: 'Data Structures Group', members: 12, topic: 'Binary Trees', active: true },
    { id: '2', title: 'Thermodynamics Study', members: 8, topic: 'Laws of Thermo', active: false },
    { id: '3', title: 'AI Ethics Discussion', members: 24, topic: 'Bias in ML', active: true },
  ]);

  return (
    <Modal visible={visible} transparent animationType="slide">
      <View style={styles.overlay}>
        <View style={styles.container}>
          <LinearGradient colors={['#F8FAFC', '#F1F5F9']} style={styles.card}>
            <View style={styles.header}>
              <View>
                <Text style={styles.title}>Peer Collaboration</Text>
                <Text style={styles.subtitle}>Learn Together, Succeed Together</Text>
              </View>
              <TouchableOpacity onPress={onClose}>
                <Ionicons name="close-circle" size={32} color="#64748B" />
              </TouchableOpacity>
            </View>

            <View style={styles.searchBar}>
              <Ionicons name="search" size={20} color="#94A3B8" />
              <TextInput placeholder="Find a study room..." style={styles.input} placeholderTextColor="#94A3B8" />
            </View>

            <ScrollView contentContainerStyle={styles.content}>
               <Text style={styles.sectionTitle}>Active Study Rooms</Text>
               {rooms.map((room) => (
                 <TouchableOpacity key={room.id} style={styles.roomCard}>
                    <View style={styles.roomInfo}>
                       <Text style={styles.roomTitle}>{room.title}</Text>
                       <Text style={styles.roomTopic}>Topic: {room.topic}</Text>
                       <View style={styles.memberRow}>
                          <Ionicons name="people" size={14} color="#6366F1" />
                          <Text style={styles.memberText}>{room.members} members</Text>
                       </View>
                    </View>
                    {room.active && <View style={styles.activeBadge}><Text style={styles.activeText}>LIVE</Text></View>}
                    <TouchableOpacity style={styles.joinBtn}>
                       <Text style={styles.joinText}>Join</Text>
                    </TouchableOpacity>
                 </TouchableOpacity>
               ))}
            </ScrollView>

            <TouchableOpacity style={styles.createButton}>
               <LinearGradient colors={['#6366F1', '#4F46E5']} style={styles.createGradient}>
                  <Ionicons name="add-circle" size={20} color="#FFFFFF" />
                  <Text style={styles.createText}>Create Study Room</Text>
               </LinearGradient>
            </TouchableOpacity>
          </LinearGradient>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'flex-end' },
  container: { height: '85%', width: '100%', borderTopLeftRadius: 30, borderTopRightRadius: 30, overflow: 'hidden' },
  card: { flex: 1, padding: 24 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  title: { fontSize: 24, fontWeight: '900', color: '#1E293B' },
  subtitle: { fontSize: 14, color: '#64748B', fontWeight: '600' },
  searchBar: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFFFFF', paddingHorizontal: 16, paddingVertical: 12, borderRadius: 16, marginBottom: 24, elevation: 2 },
  input: { flex: 1, marginLeft: 10, fontSize: 14, color: '#1E293B' },
  content: { paddingBottom: 20 },
  sectionTitle: { fontSize: 18, fontWeight: '800', color: '#1E293B', marginBottom: 16 },
  roomCard: { backgroundColor: '#FFFFFF', padding: 16, borderRadius: 20, marginBottom: 12, flexDirection: 'row', alignItems: 'center', elevation: 3 },
  roomInfo: { flex: 1 },
  roomTitle: { fontSize: 16, fontWeight: '700', color: '#1E293B', marginBottom: 4 },
  roomTopic: { fontSize: 12, color: '#64748B', marginBottom: 8 },
  memberRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  memberText: { fontSize: 11, color: '#6366F1', fontWeight: '700' },
  activeBadge: { backgroundColor: 'rgba(239, 68, 68, 0.1)', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 6, marginRight: 10 },
  activeText: { color: '#EF4444', fontSize: 10, fontWeight: '900' },
  joinBtn: { backgroundColor: '#F1F5F9', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 12 },
  joinText: { color: '#6366F1', fontWeight: '800', fontSize: 13 },
  createButton: { marginTop: 10 },
  createGradient: { flexDirection: 'row', paddingVertical: 16, borderRadius: 16, alignItems: 'center', justifyContent: 'center', gap: 10 },
  createText: { color: '#FFFFFF', fontWeight: '800', fontSize: 16 },
});

export default PeerCollaboration;
