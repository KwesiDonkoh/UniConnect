import React, { useState } from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, TextInput, Dimensions, KeyboardAvoidingView, Platform } from 'react-native';
import { BlurView } from 'expo-blur';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

const { width, height } = Dimensions.get('window');

const AppFeedback = ({ visible, onClose, isDark }) => {
  const [feedback, setFeedback] = useState('');
  const [category, setCategory] = useState('Suggest');

  const categories = ['Suggest', 'Bug', 'Other'];

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
        <View style={styles.overlay}>
          <BlurView intensity={100} tint={isDark ? 'dark' : 'light'} style={StyleSheet.absoluteFill} />
          
          <View style={[styles.modalContent, isDark && styles.darkModal]}>
            <View style={styles.header}>
              <Text style={[styles.title, isDark && styles.whiteText]}>Feedback & Suggestions</Text>
              <TouchableOpacity onPress={onClose}>
                <Ionicons name="close-circle" size={32} color={isDark ? '#FFF' : '#000'} />
              </TouchableOpacity>
            </View>

            <View style={styles.categoryRow}>
              {categories.map(cat => (
                <TouchableOpacity 
                  key={cat} 
                  style={[styles.catBtn, category === cat && styles.catBtnActive]} 
                  onPress={() => setCategory(cat)}
                >
                  <Text style={[styles.catText, category === cat && styles.catTextActive]}>{cat}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <TextInput
              style={[styles.input, isDark && styles.darkInput]}
              placeholder="Tell us what's on your mind..."
              placeholderTextColor="#94A3B8"
              multiline
              value={feedback}
              onChangeText={setFeedback}
            />

            <TouchableOpacity style={styles.submitBtn} onPress={onClose}>
              <LinearGradient colors={['#6366F1', '#A855F7']} style={styles.gradient}>
                <Text style={styles.submitText}>SEND TO UNICONNECT HQ</Text>
                <Ionicons name="paper-plane" size={18} color="#FFF" />
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: { flex: 1, justifyContent: 'flex-end' },
  modalContent: { height: height * 0.75, backgroundColor: '#FFF', borderTopLeftRadius: 40, borderTopRightRadius: 40, padding: 30 },
  darkModal: { backgroundColor: '#0F172A' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  title: { fontSize: 22, fontWeight: '900', color: '#1E293B', flex: 1 },
  whiteText: { color: '#FFF' },
  categoryRow: { flexDirection: 'row', gap: 10, marginBottom: 20 },
  catBtn: { paddingHorizontal: 20, paddingVertical: 10, borderRadius: 20, backgroundColor: 'rgba(99, 102, 241, 0.05)' },
  catBtnActive: { backgroundColor: '#6366F1' },
  catText: { fontSize: 12, fontWeight: '700', color: '#6366F1' },
  catTextActive: { color: '#FFF' },
  input: { flex: 1, backgroundColor: '#F8FAFC', borderRadius: 20, padding: 20, fontSize: 16, color: '#1E293B', textAlignVertical: 'top' },
  darkInput: { backgroundColor: 'rgba(255,255,255,0.05)', color: '#FFF' },
  submitBtn: { marginTop: 20, height: 60, borderRadius: 20, overflow: 'hidden' },
  gradient: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10 },
  submitText: { color: '#FFF', fontWeight: '900', letterSpacing: 1 },
});

export default AppFeedback;
