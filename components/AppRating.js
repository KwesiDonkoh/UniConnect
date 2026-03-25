import React, { useState } from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, Dimensions, Animated } from 'react-native';
import { BlurView } from 'expo-blur';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

const { width, height } = Dimensions.get('window');

const AppRating = ({ visible, onClose, isDark }) => {
  const [rating, setRating] = useState(0);

  const stars = [1, 2, 3, 4, 5];

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <BlurView intensity={100} tint={isDark ? 'dark' : 'light'} style={StyleSheet.absoluteFill} />
        
        <View style={[styles.modalContent, isDark && styles.darkModal]}>
          <Text style={[styles.title, isDark && styles.whiteText]}>Rate UniConnect</Text>
          <Text style={styles.subtitle}>HELP US DEFINE THE FUTURE</Text>

          <View style={styles.starRow}>
            {stars.map(s => (
              <TouchableOpacity key={s} onPress={() => setRating(s)}>
                <Ionicons 
                  name={rating >= s ? "star" : "star-outline"} 
                  size={42} 
                  color={rating >= s ? "#F59E0B" : "#94A3B8"} 
                />
              </TouchableOpacity>
            ))}
          </View>

          <Text style={styles.ratingText}>
            {rating === 0 ? "Tap a star to rate" : 
             rating <= 2 ? "We'll work harder! 🚀" :
             rating <= 4 ? "Getting there! ✨" : "You're a Legend! 💎"}
          </Text>

          <TouchableOpacity style={styles.submitBtn} onPress={onClose}>
            <LinearGradient colors={['#6366F1', '#A855F7']} style={styles.btnGradient}>
              <Text style={styles.btnText}>SUBMIT RATING</Text>
            </LinearGradient>
          </TouchableOpacity>

          <TouchableOpacity onPress={onClose} style={styles.skipBtn}>
            <Text style={styles.skipText}>MAYBE LATER</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  modalContent: { width: width * 0.85, padding: 40, backgroundColor: '#FFF', borderRadius: 32, alignItems: 'center' },
  darkModal: { backgroundColor: '#0F172A' },
  title: { fontSize: 24, fontWeight: '900', color: '#1E293B', textAlign: 'center' },
  whiteText: { color: '#FFF' },
  subtitle: { fontSize: 10, fontWeight: '900', color: '#6366F1', letterSpacing: 2, marginTop: 4, marginBottom: 30 },
  starRow: { flexDirection: 'row', gap: 8, marginBottom: 20 },
  ratingText: { fontSize: 16, fontWeight: '700', color: '#64748B', marginBottom: 30 },
  submitBtn: { width: '100%', height: 55, borderRadius: 16, overflow: 'hidden' },
  btnGradient: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  btnText: { color: '#FFF', fontWeight: '900', letterSpacing: 1 },
  skipBtn: { marginTop: 20 },
  skipText: { fontSize: 12, fontWeight: '700', color: '#94A3B8' },
});

export default AppRating;
