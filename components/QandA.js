import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, FlatList, TextInput } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Shadows } from '../themes/modernTheme';

const QandA = ({ visible, onClose, isDark }) => {
  const [questions] = useState([
    { id: 1, text: 'How do I solve linear equations with three variables?', author: 'John Doe', answers: 3, likes: 12, category: 'Mathematics' },
    { id: 2, text: 'What is the best way to implement a BFS algorithm in Java?', author: 'Jane Smith', answers: 5, likes: 24, category: 'Computing' },
    { id: 3, text: 'Can anyone explain the difference between HSL and RGB?', author: 'Mike Ross', answers: 2, likes: 8, category: 'Design' },
  ]);

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.modalOverlay}>
        <LinearGradient
          colors={isDark ? ['#1E293B', '#0F172A'] : ['#FFFFFF', '#F8FAFC']}
          style={styles.modalContent}
        >
          <View style={styles.header}>
            <Text style={[styles.title, isDark && styles.textWhite]}>Q&A Forum</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <Ionicons name="close" size={24} color={isDark ? '#FFFFFF' : '#64748B'} />
            </TouchableOpacity>
          </View>

          <View style={styles.searchBar}>
            <TextInput 
              style={[styles.searchInput, isDark && styles.textWhite]} 
              placeholder="Ask anything..." 
              placeholderTextColor="#94A3B8"
            />
            <TouchableOpacity style={styles.askBtn}>
              <LinearGradient colors={['#6366F1', '#4F46E5']} style={styles.askGradient}>
                <Ionicons name="send" size={18} color="#FFFFFF" />
              </LinearGradient>
            </TouchableOpacity>
          </View>

          <FlatList
            data={questions}
            keyExtractor={item => item.id.toString()}
            renderItem={({ item }) => (
              <TouchableOpacity style={[styles.qCard, isDark && styles.darkCard]}>
                <View style={styles.qHeader}>
                  <View style={styles.categoryBadge}>
                    <Text style={styles.categoryText}>{item.category}</Text>
                  </View>
                  <Text style={styles.authorText}>by {item.author}</Text>
                </View>
                <Text style={[styles.qText, isDark && styles.textWhite]} numberOfLines={2}>{item.text}</Text>
                <View style={styles.qFooter}>
                  <View style={styles.stat}>
                    <Ionicons name="chatbubble-ellipses-outline" size={16} color="#64748B" />
                    <Text style={styles.statText}>{item.answers} Answers</Text>
                  </View>
                  <View style={styles.stat}>
                    <Ionicons name="heart-outline" size={16} color="#64748B" />
                    <Text style={styles.statText}>{item.likes} Likes</Text>
                  </View>
                </View>
              </TouchableOpacity>
            )}
            contentContainerStyle={styles.list}
          />
        </LinearGradient>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalContent: { borderTopLeftRadius: 32, borderTopRightRadius: 32, padding: 24, height: '80%' },
  header: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 20 },
  title: { fontSize: 24, fontWeight: '800' },
  closeBtn: { padding: 4 },
  searchBar: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F1F5F9', borderRadius: 20, paddingLeft: 16, marginBottom: 24, paddingVertical: 4 },
  searchInput: { flex: 1, height: 44, fontSize: 16, color: '#1E293B' },
  askBtn: { marginRight: 4 },
  askGradient: { width: 36, height: 36, borderRadius: 18, justifyContent: 'center', alignItems: 'center' },
  list: { gap: 16 },
  qCard: { backgroundColor: '#FFFFFF', padding: 16, borderRadius: 24, ...Shadows.sm },
  darkCard: { backgroundColor: 'rgba(255,255,255,0.05)' },
  qHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  categoryBadge: { backgroundColor: 'rgba(99, 102, 241, 0.1)', paddingVertical: 4, paddingHorizontal: 10, borderRadius: 8 },
  categoryText: { color: '#6366F1', fontSize: 11, fontWeight: '700' },
  authorText: { fontSize: 12, color: '#94A3B8' },
  qText: { fontSize: 16, fontWeight: '600', color: '#1E293B', marginBottom: 12 },
  qFooter: { flexDirection: 'row', gap: 20 },
  stat: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  statText: { fontSize: 13, color: '#64748B', fontWeight: '500' },
  textWhite: { color: '#FFFFFF' },
});

export default QandA;
