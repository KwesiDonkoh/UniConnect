import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  Vibration,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

const { height } = Dimensions.get('window');

const POMODORO_25 = 25 * 60; // seconds
const POMODORO_50 = 50 * 60;

export default function FocusMode({ visible, onClose, user }) {
  const [phase, setPhase] = useState('idle'); // 'idle' | 'running' | 'paused'
  const [duration, setDuration] = useState(POMODORO_25);
  const [remaining, setRemaining] = useState(POMODORO_25);
  const intervalRef = useRef(null);

  const resetTo = (seconds) => {
    setDuration(seconds);
    setRemaining(seconds);
    setPhase('idle');
    if (intervalRef.current) clearInterval(intervalRef.current);
  };

  useEffect(() => {
    if (!visible) {
      if (intervalRef.current) clearInterval(intervalRef.current);
      return;
    }
    resetTo(duration);
  }, [visible]);

  useEffect(() => {
    if (phase !== 'running' || remaining <= 0) return;
    intervalRef.current = setInterval(() => {
      setRemaining((prev) => {
        if (prev <= 1) {
          if (intervalRef.current) clearInterval(intervalRef.current);
          Vibration.vibrate([0, 200, 100, 200]);
          setPhase('idle');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [phase, remaining]);

  const formatTime = (sec) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const startTimer = (seconds) => {
    setDuration(seconds);
    setRemaining(seconds);
    setPhase('running');
  };

  const togglePause = () => {
    setPhase((p) => (p === 'running' ? 'paused' : 'running'));
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.header}>
            <Text style={styles.headerTitle}>Focus Mode 🍅</Text>
            <TouchableOpacity style={styles.closeButton} onPress={onClose}>
              <Text style={styles.closeText}>✕</Text>
            </TouchableOpacity>
          </View>

          {phase === 'idle' ? (
            <>
              <Text style={styles.prompt}>Choose your focus session</Text>
              <View style={styles.durationRow}>
                <TouchableOpacity
                  style={styles.durationCard}
                  onPress={() => startTimer(POMODORO_25)}
                  activeOpacity={0.8}
                >
                  <LinearGradient colors={['#10B981', '#059669']} style={styles.durationGradient}>
                    <Ionicons name="timer" size={32} color="#FFFFFF" />
                    <Text style={styles.durationLabel}>25 min</Text>
                    <Text style={styles.durationSub}>Classic Pomodoro</Text>
                  </LinearGradient>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.durationCard}
                  onPress={() => startTimer(POMODORO_50)}
                  activeOpacity={0.8}
                >
                  <LinearGradient colors={['#8B5CF6', '#7C3AED']} style={styles.durationGradient}>
                    <Ionicons name="time" size={32} color="#FFFFFF" />
                    <Text style={styles.durationLabel}>50 min</Text>
                    <Text style={styles.durationSub}>Deep focus</Text>
                  </LinearGradient>
                </TouchableOpacity>
              </View>
            </>
          ) : (
            <>
              <View style={styles.timerCircle}>
                <Text style={styles.timerText}>{formatTime(remaining)}</Text>
                <Text style={styles.timerSub}>
                  {phase === 'paused' ? 'Paused' : 'Stay focused'}
                </Text>
              </View>
              <View style={styles.timerActions}>
                <TouchableOpacity style={styles.pauseButton} onPress={togglePause}>
                  <Ionicons name={phase === 'paused' ? 'play' : 'pause'} size={24} color="#FFFFFF" />
                  <Text style={styles.pauseButtonText}>{phase === 'paused' ? 'Resume' : 'Pause'}</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.resetButton} onPress={() => resetTo(duration)}>
                  <Text style={styles.resetButtonText}>Reset</Text>
                </TouchableOpacity>
              </View>
            </>
          )}

          <TouchableOpacity style={styles.doneButton} onPress={onClose}>
            <Text style={styles.doneButtonText}>Done</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: height * 0.85,
    padding: 24,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1E293B',
  },
  closeButton: { padding: 8 },
  closeText: { fontSize: 20, color: '#64748B' },
  prompt: {
    fontSize: 16,
    color: '#64748B',
    marginBottom: 16,
    textAlign: 'center',
  },
  durationRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 24,
  },
  durationCard: {
    flex: 1,
    borderRadius: 16,
    overflow: 'hidden',
  },
  durationGradient: {
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 120,
  },
  durationLabel: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFFFFF',
    marginTop: 8,
  },
  durationSub: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.9)',
    marginTop: 4,
  },
  timerCircle: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 32,
    marginBottom: 16,
  },
  timerText: {
    fontSize: 56,
    fontWeight: '700',
    color: '#1E293B',
    fontVariant: ['tabular-nums'],
  },
  timerSub: {
    fontSize: 16,
    color: '#64748B',
    marginTop: 8,
  },
  timerActions: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 16,
    marginBottom: 24,
  },
  pauseButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#6366F1',
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 14,
  },
  pauseButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  resetButton: {
    paddingVertical: 14,
    paddingHorizontal: 20,
  },
  resetButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#64748B',
  },
  doneButton: {
    paddingVertical: 14,
    alignItems: 'center',
    borderRadius: 14,
    backgroundColor: '#F1F5F9',
  },
  doneButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#64748B',
  },
});
