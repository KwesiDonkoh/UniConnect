import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, Dimensions, Animated } from 'react-native';
import { BlurView } from 'expo-blur';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

const { width, height } = Dimensions.get('window');

const NeuralAttendance = ({ visible, onClose, isDark }) => {
  const [verifying, setVerifying] = useState(false);
  const scanAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (verifying) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(scanAnim, { toValue: height * 0.3, duration: 1500, useNativeDriver: false }),
          Animated.timing(scanAnim, { toValue: 0, duration: 1500, useNativeDriver: false }),
        ])
      ).start();
    }
  }, [verifying]);

  const startScan = () => {
    setVerifying(true);
    setTimeout(() => {
      setVerifying(false);
      onClose();
    }, 4000);
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <BlurView intensity={100} tint="dark" style={StyleSheet.absoluteFill} />
        
        <View style={styles.modalContent}>
          <Text style={styles.title}>Neural Biometric Attendance</Text>
          <Text style={styles.subtitle}>SECURE LECTURE VERIFICATION</Text>

          <View style={styles.scannerWrapper}>
            <View style={styles.faceBounds} />
            {verifying && <Animated.View style={[styles.scanLine, { top: scanAnim }]} />}
            <Ionicons name="person-circle-outline" size={200} color="rgba(16, 185, 129, 0.2)" />
          </View>

          <Text style={styles.statusText}>
            {verifying ? "SCANNING BIOMETRIC DATA..." : "ALIGN FACE TO VERIFY ATTENDANCE"}
          </Text>

          <TouchableOpacity style={styles.scanBtn} onPress={startScan} disabled={verifying}>
            <LinearGradient colors={['#10B981', '#059669']} style={styles.gradient}>
              <Text style={styles.btnText}>{verifying ? "VERIFYING..." : "INITIALIZE SCAN"}</Text>
            </LinearGradient>
          </TouchableOpacity>

          {!verifying && (
            <TouchableOpacity onPress={onClose} style={styles.cancelBtn}>
              <Text style={styles.cancelText}>CANCEL</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </Modal>
  );
};

// Internal Ref fix for Animated
const WrappedNeuralAttendance = (props) => {
  const ref = React.useRef();
  const scanAnim = React.useRef(new Animated.Value(0)).current;
  return <NeuralAttendance {...props} scanAnim={scanAnim} />;
};

// Actually re-implementing properly to avoid the 'useRef' error again
const NeuralAttendanceFix = ({ visible, onClose, isDark }) => {
  const [verifying, setVerifying] = useState(false);
  const scanAnim = React.useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (verifying) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(scanAnim, { toValue: 200, duration: 2000, useNativeDriver: false }),
          Animated.timing(scanAnim, { toValue: 0, duration: 2000, useNativeDriver: false }),
        ])
      ).start();
    }
  }, [verifying]);

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <BlurView intensity={100} tint="dark" style={StyleSheet.absoluteFill} />
        <View style={styles.modalContent}>
          <Text style={styles.title}>Neural Attendance</Text>
          <Text style={styles.subtitle}>SECURE IDENTITY LOG</Text>
          <View style={styles.scannerWrapper}>
             <View style={styles.faceBounds} />
             {verifying && <Animated.View style={[styles.scanLine, { top: scanAnim }]} />}
             <Ionicons name="scan-circle" size={180} color={verifying ? "#10B981" : "rgba(255,255,255,0.1)"} />
          </View>
          <TouchableOpacity style={styles.scanBtn} onPress={() => setVerifying(true)}>
             <LinearGradient colors={['#10B981', '#059669']} style={styles.gradient}>
                <Text style={styles.btnText}>{verifying ? "VERIFYING..." : "START BIOMETRIC SCAN"}</Text>
             </LinearGradient>
          </TouchableOpacity>
          <TouchableOpacity onPress={onClose} style={{ marginTop: 20 }}>
            <Text style={{ color: '#94A3B8', fontWeight: 'bold' }}>CANCEL</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  modalContent: { width: width * 0.85, padding: 30, backgroundColor: 'rgba(15, 23, 42, 0.95)', borderRadius: 40, alignItems: 'center', borderWidth: 1, borderColor: 'rgba(16, 185, 129, 0.3)' },
  title: { fontSize: 22, fontWeight: '900', color: '#FFF', textAlign: 'center' },
  subtitle: { fontSize: 10, fontWeight: '900', color: '#10B981', letterSpacing: 2, marginTop: 4, marginBottom: 30 },
  scannerWrapper: { width: 250, height: 250, justifyContent: 'center', alignItems: 'center', marginBottom: 30, position: 'relative' },
  faceBounds: { position: 'absolute', width: 200, height: 200, borderWidth: 2, borderColor: 'rgba(16, 185, 129, 0.5)', borderRadius: 30, borderStyle: 'dashed' },
  scanLine: { position: 'absolute', left: 25, width: 200, height: 2, backgroundColor: '#10B981', zIndex: 10, shadowColor: '#10B981', shadowRadius: 10, shadowOpacity: 0.8 },
  scanBtn: { width: '100%', height: 60, borderRadius: 20, overflow: 'hidden' },
  gradient: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  btnText: { color: '#FFF', fontWeight: '900', letterSpacing: 1 },
});

export default NeuralAttendanceFix;
