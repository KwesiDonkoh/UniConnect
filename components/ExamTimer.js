import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, Animated, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

const { width } = Dimensions.get('window');

const ExamTimer = ({ visible, onClose, isDark }) => {
  const [timeLeft, setTimeLeft] = useState({ days: 12, hours: 5, minutes: 47, seconds: 22 });
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(300)).current;

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.timing(fadeAnim, { toValue: 1, duration: 400, useNativeDriver: true }),
        Animated.spring(slideAnim, { toValue: 0, tension: 50, friction: 8, useNativeDriver: true })
      ]).start();
    } else {
      fadeAnim.setValue(0);
      slideAnim.setValue(300);
    }
  }, [visible]);

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev.seconds > 0) return { ...prev, seconds: prev.seconds - 1 };
        if (prev.minutes > 0) return { ...prev, minutes: prev.minutes - 1, seconds: 59 };
        if (prev.hours > 0) return { ...prev, hours: prev.hours - 1, minutes: 59, seconds: 59 };
        if (prev.days > 0) return { ...prev, days: prev.days - 1, hours: 23, minutes: 59, seconds: 59 };
        return prev;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const CountdownCircle = ({ value, label, color, secondaryColor }) => (
    <View style={styles.circleContainer}>
      <View style={[styles.circle, { borderColor: secondaryColor }]}>
        <Text style={[styles.circleValue, { color: color }]}>{String(value).padStart(2, '0')}</Text>
        <Text style={styles.circleLabel}>{label}</Text>
      </View>
    </View>
  );

  return (
    <Modal visible={visible} animationType="none" transparent>
      <Animated.View style={[styles.modalOverlay, { opacity: fadeAnim }]}>
        <Animated.View style={[styles.modalWrapper, { transform: [{ translateY: slideAnim }] }]}>
          <TouchableOpacity style={styles.closeArea} onPress={onClose} activeOpacity={1} />
          
          <View style={styles.modalContent}>
            <LinearGradient
              colors={isDark ? ['#1E293B', '#0F172A'] : ['#FFFFFF', '#F8FAFC']}
              style={styles.glassContainer}
            >
              <View style={styles.handleContainer}>
                <View style={[styles.handle, isDark && styles.handleDark]} />
              </View>

              <View style={styles.header}>
                <View>
                  <Text style={[styles.title, isDark && styles.textWhite]}>Exam Countdown</Text>
                  <Text style={[styles.subtitle, isDark && styles.textSubWhite]}>Your academic milestone</Text>
                </View>
                <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
                  <Ionicons name="close-circle" size={32} color={isDark ? '#94A3B8' : '#64748B'} />
                </TouchableOpacity>
              </View>

              <View style={styles.examCard}>
                <LinearGradient colors={['#F59E0B', '#D97706']} style={styles.examCardGradient}>
                  <View style={styles.examBadge}>
                    <Ionicons name="calendar" size={16} color="#FFFFFF" />
                    <Text style={styles.examBadgeText}>Mid-Semester Exams</Text>
                  </View>
                  <Text style={styles.examDate}>Monday, May 15, 2024</Text>
                </LinearGradient>
              </View>

              <View style={styles.countdownRow}>
                <CountdownCircle value={timeLeft.days} label="DAYS" color="#F59E0B" secondaryColor="rgba(245, 158, 11, 0.1)" />
                <CountdownCircle value={timeLeft.hours} label="HRS" color="#6366F1" secondaryColor="rgba(99, 102, 241, 0.1)" />
                <CountdownCircle value={timeLeft.minutes} label="MIN" color="#8B5CF6" secondaryColor="rgba(139, 92, 246, 0.1)" />
                <CountdownCircle value={timeLeft.seconds} label="SEC" color="#EC4899" secondaryColor="rgba(236, 72, 153, 0.1)" />
              </View>

              <View style={[styles.tipCard, isDark && styles.darkTipCard]}>
                <View style={styles.tipIcon}>
                  <Ionicons name="bulb" size={24} color="#F59E0B" />
                </View>
                <View style={styles.tipContent}>
                  <Text style={[styles.tipTitle, isDark && styles.textWhite]}>Study Tip</Text>
                  <Text style={[styles.tipText, isDark && styles.textSubWhite]}>
                    "The best way to predict your future is to create it. Start reviewing your notes today!"
                  </Text>
                </View>
              </View>

              <TouchableOpacity style={styles.actionBtn}>
                <LinearGradient colors={['#6366F1', '#4F46E5']} style={styles.actionGradient}>
                  <Ionicons name="notifications" size={20} color="#FFFFFF" />
                  <Text style={styles.actionBtnText}>Remind Me</Text>
                </LinearGradient>
              </TouchableOpacity>
            </LinearGradient>
          </View>
        </Animated.View>
      </Animated.View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'flex-end',
  },
  modalWrapper: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  closeArea: {
    flex: 1,
  },
  modalContent: {
    height: '75%',
    borderTopLeftRadius: 40,
    borderTopRightRadius: 40,
    overflow: 'hidden',
  },
  glassContainer: {
    flex: 1,
    padding: 24,
  },
  handleContainer: {
    alignItems: 'center',
    marginBottom: 20,
    marginTop: -10,
  },
  handle: {
    width: 44,
    height: 5,
    borderRadius: 3,
    backgroundColor: 'rgba(0,0,0,0.1)',
  },
  handleDark: {
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 30,
  },
  title: {
    fontSize: 26,
    fontWeight: '900',
    color: '#0F172A',
    letterSpacing: -1,
  },
  subtitle: {
    fontSize: 14,
    color: '#64748B',
    fontWeight: '500',
  },
  closeBtn: {
    padding: 4,
  },
  examCard: {
    borderRadius: 24,
    overflow: 'hidden',
    marginBottom: 30,
  },
  examCardGradient: {
    padding: 20,
    alignItems: 'center',
  },
  examBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    gap: 6,
    marginBottom: 10,
  },
  examBadgeText: {
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: 12,
    textTransform: 'uppercase',
  },
  examDate: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '900',
  },
  countdownRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 30,
  },
  circleContainer: {
    alignItems: 'center',
  },
  circle: {
    width: (width - 80) / 4,
    height: (width - 80) / 4,
    borderRadius: (width - 80) / 8,
    borderWidth: 4,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.02)',
  },
  circleValue: {
    fontSize: 22,
    fontWeight: '900',
  },
  circleLabel: {
    fontSize: 10,
    color: '#64748B',
    fontWeight: '800',
    marginTop: -2,
  },
  tipCard: {
    flexDirection: 'row',
    backgroundColor: '#FFFBEB',
    padding: 16,
    borderRadius: 24,
    gap: 16,
    marginBottom: 30,
  },
  darkTipCard: {
    backgroundColor: 'rgba(251, 191, 36, 0.1)',
  },
  tipIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(245, 158, 11, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  tipContent: {
    flex: 1,
  },
  tipTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#92400E',
    marginBottom: 4,
  },
  tipText: {
    fontSize: 13,
    color: '#B45309',
    lineHeight: 18,
    fontStyle: 'italic',
  },
  actionBtn: {
    borderRadius: 20,
    overflow: 'hidden',
  },
  actionGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    gap: 10,
  },
  actionBtnText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '800',
  },
  textWhite: { color: '#F8FAFC' },
  textSubWhite: { color: '#94A3B8' },
});

export default ExamTimer;
