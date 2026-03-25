import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors, Shadows } from '../themes/modernTheme';

const PomodoroTimer = ({ visible, onClose, isDark }) => {
  const [minutes, setMinutes] = useState(25);
  const [seconds, setSeconds] = useState(0);
  const [isActive, setIsActive] = useState(false);
  const [mode, setMode] = useState('Work'); // Work, Short Break, Long Break

  useEffect(() => {
    let interval = null;
    if (isActive && (minutes > 0 || seconds > 0)) {
      interval = setInterval(() => {
        if (seconds === 0) {
          setMinutes(minutes - 1);
          setSeconds(59);
        } else {
          setSeconds(seconds - 1);
        }
      }, 1000);
    } else if (minutes === 0 && seconds === 0) {
      clearInterval(interval);
      setIsActive(false);
      // Logic for switching modes could go here
    }
    return () => clearInterval(interval);
  }, [isActive, minutes, seconds]);

  const toggleTimer = () => setIsActive(!isActive);
  
  const resetTimer = (m = 25, label = 'Work') => {
    setIsActive(false);
    setMinutes(m);
    setSeconds(0);
    setMode(label);
  };

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.modalOverlay}>
        <LinearGradient
          colors={isDark ? ['#1E293B', '#0F172A'] : ['#FFFFFF', '#F1F5F9']}
          style={styles.modalContent}
        >
          <View style={styles.header}>
            <Text style={[styles.title, isDark && styles.textWhite]}>Pomodoro Focus</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <Ionicons name="close" size={24} color={isDark ? '#FFFFFF' : '#64748B'} />
            </TouchableOpacity>
          </View>

          <View style={styles.timerContainer}>
            <LinearGradient
              colors={['#6366F1', '#A855F7']}
              style={styles.timerRing}
            >
              <View style={[styles.timerInside, isDark && { backgroundColor: '#1E293B' }]}>
                <Text style={[styles.timerText, isDark && styles.textWhite]}>
                  {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
                </Text>
                <Text style={styles.modeText}>{mode}</Text>
              </View>
            </LinearGradient>
          </View>

          <View style={styles.presetContainer}>
            <TouchableOpacity onPress={() => resetTimer(25, 'Work')} style={styles.presetBtn}>
              <Text style={[styles.presetText, mode === 'Work' && styles.activeText]}>Work</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => resetTimer(5, 'Short Break')} style={styles.presetBtn}>
              <Text style={[styles.presetText, mode === 'Short Break' && styles.activeText]}>Short</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => resetTimer(15, 'Long Break')} style={styles.presetBtn}>
              <Text style={[styles.presetText, mode === 'Long Break' && styles.activeText]}>Long</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.controls}>
            <TouchableOpacity onPress={toggleTimer} style={styles.mainAction}>
              <LinearGradient colors={['#6366F1', '#4F46E5']} style={styles.actionGradient}>
                <Ionicons name={isActive ? "pause" : "play"} size={32} color="#FFFFFF" />
              </LinearGradient>
            </TouchableOpacity>
            
            <TouchableOpacity onPress={() => resetTimer(25, 'Work')} style={styles.resetBtn}>
              <Ionicons name="refresh" size={24} color={isDark ? '#94A3B8' : '#64748B'} />
            </TouchableOpacity>
          </View>
        </LinearGradient>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalContent: { borderTopLeftRadius: 32, borderTopRightRadius: 32, padding: 24, height: '70%', alignItems: 'center' },
  header: { flexDirection: 'row', justifyContent: 'space-between', width: '100%', marginBottom: 30 },
  title: { fontSize: 24, fontWeight: '800', color: '#1E293B' },
  closeBtn: { padding: 4 },
  timerContainer: { marginBottom: 40 },
  timerRing: { width: 220, height: 220, borderRadius: 110, padding: 10, ...Shadows.lg },
  timerInside: { flex: 1, backgroundColor: '#FFFFFF', borderRadius: 100, justifyContent: 'center', alignItems: 'center' },
  timerText: { fontSize: 48, fontWeight: '900', color: '#1E293B', fontVariant: ['tabular-nums'] },
  modeText: { fontSize: 16, color: '#6366F1', fontWeight: '700', marginTop: 4 },
  presetContainer: { flexDirection: 'row', gap: 20, marginBottom: 40 },
  presetBtn: { paddingVertical: 8, paddingHorizontal: 16, borderRadius: 20, backgroundColor: 'rgba(0,0,0,0.05)' },
  presetText: { fontWeight: '700', color: '#64748B' },
  activeText: { color: '#6366F1' },
  controls: { flexDirection: 'row', alignItems: 'center', gap: 30 },
  mainAction: { width: 80, height: 80, borderRadius: 40, overflow: 'hidden', ...Shadows.md },
  actionGradient: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  resetBtn: { padding: 10 },
  textWhite: { color: '#FFFFFF' },
});

export default PomodoroTimer;
