import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  Animated,
  Easing,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';

const { width, height } = Dimensions.get('window');

const MentalHealthCorner = ({ visible, onClose, isDark }) => {
  const [phase, setPhase] = useState('Breathe In'); // Breathe In, Hold, Breathe Out
  const [pulseAnim] = useState(new Animated.Value(1));
  const [timer, setTimer] = useState(4);

  useEffect(() => {
    if (!visible) return;

    let interval;
    const runAnimation = () => {
      // Breathe In (4s)
      setPhase('Inhale');
      setTimer(4);
      Animated.timing(pulseAnim, {
        toValue: 1.5,
        duration: 4000,
        easing: Easing.inOut(Easing.ease),
        useNativeDriver: true,
      }).start(() => {
        // Hold (4s)
        setPhase('Hold');
        setTimer(4);
        setTimeout(() => {
          // Breathe Out (4s)
          setPhase('Exhale');
          setTimer(4);
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 4000,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }).start(() => {
             // Restart loop
             runAnimation();
          });
        }, 4000);
      });
    };

    runAnimation();

    interval = setInterval(() => {
      setTimer((prev) => (prev > 1 ? prev - 1 : 4));
    }, 1000);

    return () => clearInterval(interval);
  }, [visible]);

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <BlurView intensity={80} tint={isDark ? 'dark' : 'light'} style={StyleSheet.absoluteFill} />
        
        <View style={[styles.container, isDark && styles.darkContainer]}>
          <TouchableOpacity style={styles.closeBtn} onPress={onClose}>
            <Ionicons name="close-circle" size={32} color={isDark ? '#94A3B8' : '#64748B'} />
          </TouchableOpacity>

          <Text style={[styles.title, isDark && styles.darkText]}>Mindful Moment</Text>
          <Text style={styles.subtitle}>Relax your mind and focus on your breath</Text>

          <View style={styles.circleContainer}>
            <Animated.View
              style={[
                styles.pulseCircle,
                {
                  transform: [{ scale: pulseAnim }],
                  backgroundColor: phase === 'Inhale' ? '#818CF8' : phase === 'Hold' ? '#34D399' : '#F472B6',
                },
              ]}
            />
            <View style={styles.innerCircle}>
                <Text style={styles.phaseText}>{phase}</Text>
                <Text style={styles.timerText}>{timer}s</Text>
            </View>
          </View>

          <View style={styles.tipsContainer}>
             <View style={[styles.tipCard, isDark && styles.darkTipCard]}>
                <Ionicons name="leaf" size={24} color="#10B981" />
                <Text style={[styles.tipText, isDark && styles.darkText]}>Find a comfortable seated position with your back straight.</Text>
             </View>
             <View style={[styles.tipCard, isDark && styles.darkTipCard]}>
                <Ionicons name="notifications-off" size={24} color="#6366F1" />
                <Text style={[styles.tipText, isDark && styles.darkText]}>Minimize distractions for at least 2 minutes.</Text>
             </View>
          </View>

          <TouchableOpacity style={styles.doneBtn} onPress={onClose}>
            <LinearGradient colors={['#6366F1', '#4F46E5']} style={styles.doneGradient}>
              <Text style={styles.doneText}>I Feel Better Now</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  container: {
    width: width * 0.9,
    backgroundColor: '#FFFFFF',
    borderRadius: 32,
    padding: 24,
    alignItems: 'center',
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
  },
  darkContainer: {
    backgroundColor: '#1E293B',
  },
  closeBtn: {
    alignSelf: 'flex-end',
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
    color: '#1E293B',
    marginTop: 8,
  },
  subtitle: {
    fontSize: 14,
    color: '#64748B',
    textAlign: 'center',
    marginTop: 8,
    marginBottom: 40,
  },
  circleContainer: {
    width: 200,
    height: 200,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 50,
  },
  pulseCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    position: 'absolute',
    opacity: 0.2,
  },
  innerCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#FFFFFF',
    borderWidth: 2,
    borderColor: '#E2E8F0',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
  },
  phaseText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#4F46E5',
  },
  timerText: {
    fontSize: 24,
    fontWeight: '800',
    color: '#1E293B',
  },
  tipsContainer: {
    width: '100%',
    gap: 12,
    marginBottom: 32,
  },
  tipCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    padding: 16,
    borderRadius: 16,
    gap: 12,
  },
  darkTipCard: {
    backgroundColor: '#334155',
  },
  tipText: {
    flex: 1,
    fontSize: 13,
    color: '#475569',
    lineHeight: 18,
  },
  darkText: {
    color: '#F8FAFC',
  },
  doneBtn: {
    width: '100%',
  },
  doneGradient: {
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: 'center',
  },
  doneText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
});

export default MentalHealthCorner;
