import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Vibration,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

const DreamJournal = ({ visible, onClose, isDark }) => {
  const [dreamText, setDreamText] = useState('');
  const [mood, setMood] = useState('Peaceful');

  const moods = [
    { label: 'Peaceful', icon: 'sunny', color: '#10B981' },
    { label: 'Intense', icon: 'flash', color: '#EF4444' },
    { label: 'Cloudy', icon: 'cloud', color: '#94A3B8' },
    { label: 'Lucid', icon: 'sparkles', color: '#6366F1' },
  ];

  const saveDream = () => {
    if (!dreamText) return;
    Vibration.vibrate(50);
    Alert.alert('AI Analysis ✨', 'Your dream has been logged. AI suggests this reflects your recent project focus at KNUST.');
    setDreamText('');
    onClose();
  };

  return (
    <Modal visible={visible} transparent animationType="slide">
      <View style={styles.overlay}>
        <View style={[styles.container, isDark && styles.darkContainer]}>
          <View style={styles.header}>
            <View>
              <Text style={[styles.title, isDark && styles.darkText]}>AI Dream Journal 🌙</Text>
              <Text style={styles.subtitle}>Unlock your subconscious insights</Text>
            </View>
            <TouchableOpacity onPress={onClose}>
              <Ionicons name="close-circle" size={32} color={isDark ? '#FFFFFF' : '#64748B'} />
            </TouchableOpacity>
          </View>

          <ScrollView contentContainerStyle={styles.content}>
            <Text style={[styles.sectionTitle, isDark && styles.darkText]}>How was the dream?</Text>
            <View style={styles.moodGrid}>
              {moods.map((m) => (
                <TouchableOpacity 
                  key={m.label} 
                  style={[styles.moodCard, mood === m.label && { borderColor: m.color, borderWidth: 2 }]} 
                  onPress={() => setMood(m.label)}
                >
                  <Ionicons name={m.icon} size={24} color={m.color} />
                  <Text style={[styles.moodLabel, isDark && styles.darkText]}>{m.label}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <View style={[styles.inputContainer, isDark && styles.darkInput]}>
              <TextInput
                style={[styles.input, isDark && styles.darkText]}
                placeholder="Describe your dream here..."
                placeholderTextColor={isDark ? '#94A3B8' : '#94A3B8'}
                multiline
                value={dreamText}
                onChangeText={setDreamText}
              />
            </View>

            <TouchableOpacity style={styles.primaryAction} onPress={saveDream}>
              <LinearGradient colors={['#6366F1', '#4F46E5']} style={styles.primaryGradient}>
                <Ionicons name="sparkles" size={24} color="#FFFFFF" />
                <Text style={styles.primaryActionText}>Analyze Dream with AI</Text>
              </LinearGradient>
            </TouchableOpacity>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  container: { height: '80%', backgroundColor: '#F8FAFC', borderTopLeftRadius: 30, borderTopRightRadius: 30, padding: 20 },
  darkContainer: { backgroundColor: '#0F172A' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 25 },
  title: { fontSize: 22, fontWeight: '800', color: '#1E293B' },
  darkText: { color: '#FFFFFF' },
  subtitle: { color: '#64748B', fontWeight: '500' },
  content: { paddingBottom: 40 },
  sectionTitle: { fontSize: 16, fontWeight: '700', marginBottom: 15 },
  moodGrid: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 25 },
  moodCard: { width: '22%', backgroundColor: '#FFFFFF', padding: 10, borderRadius: 15, alignItems: 'center', elevation: 2 },
  moodLabel: { fontSize: 10, fontWeight: '700', marginTop: 5 },
  inputContainer: { backgroundColor: '#FFFFFF', borderRadius: 20, padding: 15, height: 200, marginBottom: 25, elevation: 1 },
  darkInput: { backgroundColor: '#1E293B' },
  input: { fontSize: 16, textAlignVertical: 'top' },
  primaryAction: { height: 60, borderRadius: 20, overflow: 'hidden' },
  primaryGradient: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center' },
  primaryActionText: { color: '#FFFFFF', fontWeight: '700', fontSize: 16, marginLeft: 10 },
});

export default DreamJournal;
