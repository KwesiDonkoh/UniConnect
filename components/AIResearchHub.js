import React from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

const AIResearchHub = ({ visible, onClose }) => {
  const researches = [
    { title: 'Predictive Grading', date: 'Mar 2026', likes: 124, tags: ['ML', 'EdTech'] },
    { title: 'Campus Energy Opt.', date: 'Feb 2026', likes: 98, tags: ['SmartCity', 'AI'] },
    { title: 'Localized LLM', date: 'Jan 2026', likes: 256, tags: ['NLP', 'Twi'] },
  ];

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.overlay}>
        <View style={styles.card}>
          <LinearGradient colors={['#1e293b', '#0f172a']} style={styles.gradient}>
            <View style={styles.header}>
              <View>
                <Text style={styles.title}>KNUST AI Research</Text>
                <Text style={styles.subtitle}>Innovating for Africa</Text>
              </View>
              <TouchableOpacity onPress={onClose}>
                <Ionicons name="close-circle" size={32} color="rgba(255,255,255,0.4)" />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} style={styles.content}>
               {researches.map((res, i) => (
                 <TouchableOpacity key={i} style={styles.resCard}>
                   <View style={styles.cardHeader}>
                      <Text style={styles.resTitle}>{res.title}</Text>
                      <Text style={styles.resDate}>{res.date}</Text>
                   </View>
                   <View style={styles.tagRow}>
                      {res.tags.map(t => <View key={t} style={styles.tag}><Text style={styles.tagText}>{t}</Text></View>)}
                   </View>
                   <View style={styles.stats}>
                      <Ionicons name="heart" size={14} color="#EF4444" />
                      <Text style={styles.statText}>{res.likes} scholars</Text>
                   </View>
                 </TouchableOpacity>
               ))}
            </ScrollView>

            <TouchableOpacity style={styles.mainButton}>
              <Text style={styles.btnText}>Submit Paper</Text>
            </TouchableOpacity>
          </LinearGradient>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.8)', justifyContent: 'center', alignItems: 'center' },
  card: { width: '90%', height: '70%', borderRadius: 24, overflow: 'hidden' },
  gradient: { flex: 1, padding: 24 },
  header: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 24 },
  title: { color: '#FFFFFF', fontSize: 22, fontWeight: '900' },
  subtitle: { color: 'rgba(255,255,255,0.5)', fontSize: 13, fontWeight: '600' },
  content: { flex: 1 },
  resCard: { backgroundColor: 'rgba(255,255,255,0.05)', padding: 16, borderRadius: 16, marginBottom: 16, borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  resTitle: { color: '#FFFFFF', fontSize: 16, fontWeight: '700' },
  resDate: { color: 'rgba(255,255,255,0.5)', fontSize: 12 },
  tagRow: { flexDirection: 'row', gap: 6, marginBottom: 12 },
  tag: { backgroundColor: 'rgba(99, 102, 241, 0.2)', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  tagText: { color: '#6366F1', fontSize: 10, fontWeight: '800' },
  stats: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  statText: { color: 'rgba(255,255,255,0.4)', fontSize: 11, fontWeight: '700' },
  mainButton: { backgroundColor: '#6366F1', paddingVertical: 14, borderRadius: 16, alignItems: 'center', marginTop: 10 },
  btnText: { color: '#FFFFFF', fontWeight: '800' },
});

export default AIResearchHub;
