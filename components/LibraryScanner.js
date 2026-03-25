import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  Animated,
  Dimensions,
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

const { width, height } = Dimensions.get('window');

const LibraryScanner = ({ visible, onClose, isDark }) => {
  const [scanning, setScanning] = useState(false);
  const [scanAnim] = useState(new Animated.Value(0));
  const [scannedResult, setScannedResult] = useState(null);

  const startScan = () => {
    setScanning(true);
    setScannedResult(null);
    Animated.loop(
      Animated.sequence([
        Animated.timing(scanAnim, {
          toValue: 200,
          duration: 1500,
          useNativeDriver: true,
        }),
        Animated.timing(scanAnim, {
          toValue: 0,
          duration: 1500,
          useNativeDriver: true,
        }),
      ])
    ).start();

    setTimeout(() => {
      setScanning(false);
      scanAnim.stopAnimation();
      setScannedResult({
        title: 'Introduction to Algorithms',
        author: 'Thomas H. Cormen',
        isbn: '978-0262033848',
        availability: 'Available in Main Library',
      });
    }, 4000);
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={[styles.container, isDark && styles.darkContainer]}>
          <View style={styles.header}>
            <Text style={[styles.title, isDark && styles.darkText]}>Library Scanner</Text>
            <TouchableOpacity onPress={onClose}>
              <Ionicons name="close-circle" size={28} color={isDark ? '#94A3B8' : '#64748B'} />
            </TouchableOpacity>
          </View>

          <View style={styles.scannerWrapper}>
             <View style={styles.scannerBox}>
                <Ionicons name="book-outline" size={80} color={isDark ? '#475569' : '#CBD5E1'} />
                {scanning && (
                  <Animated.View 
                    style={[
                      styles.scanLine,
                      { transform: [{ translateY: scanAnim }] }
                    ]} 
                  />
                )}
             </View>
             <Text style={styles.hintText}>Point your camera at a book's barcode or cover</Text>
          </View>

          {scannedResult ? (
            <View style={styles.resultCard}>
               <View style={styles.resultHeader}>
                  <Ionicons name="checkmark-circle" size={24} color="#10B981" />
                  <Text style={styles.resultTitle}>Successfully Identified</Text>
               </View>
               <View style={styles.bookInfo}>
                  <Text style={styles.bookTitle}>{scannedResult.title}</Text>
                  <Text style={styles.bookMeta}>By {scannedResult.author}</Text>
                  <Text style={styles.bookMeta}>ISBN: {scannedResult.isbn}</Text>
                  <View style={styles.statusBadge}>
                     <Text style={styles.statusText}>{scannedResult.availability}</Text>
                  </View>
               </View>
               <TouchableOpacity style={styles.reserveBtn}>
                  <Text style={styles.reserveText}>Reserve Book</Text>
               </TouchableOpacity>
            </View>
          ) : (
            <TouchableOpacity style={styles.scanBtn} onPress={scanning ? null : startScan}>
               <LinearGradient colors={['#6366F1', '#4F46E5']} style={styles.scanGradient}>
                  <Ionicons name={scanning ? "sync" : "camera"} size={24} color="#FFFFFF" />
                  <Text style={styles.scanText}>{scanning ? "Scanning..." : "Start Scanning"}</Text>
               </LinearGradient>
            </TouchableOpacity>
          )}

          <TouchableOpacity style={styles.closeBtn} onPress={onClose}>
            <Text style={styles.closeText}>Cancel</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.8)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  container: {
    width: width * 0.9,
    backgroundColor: '#FFFFFF',
    borderRadius: 32,
    padding: 24,
  },
  darkContainer: {
    backgroundColor: '#1E293B',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 32,
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
    color: '#1E293B',
  },
  scannerWrapper: {
    alignItems: 'center',
    marginBottom: 40,
  },
  scannerBox: {
    width: 200,
    height: 250,
    borderWidth: 2,
    borderColor: '#6366F1',
    borderRadius: 20,
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
    backgroundColor: 'rgba(99, 102, 241, 0.05)',
  },
  scanLine: {
    width: '100%',
    height: 4,
    backgroundColor: '#6366F1',
    position: 'absolute',
    top: 0,
    shadowColor: '#6366F1',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 10,
    elevation: 5,
  },
  hintText: {
    fontSize: 14,
    color: '#64748B',
    textAlign: 'center',
    marginTop: 16,
    paddingHorizontal: 20,
  },
  scanBtn: {
    width: '100%',
    marginBottom: 16,
  },
  scanGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 16,
    gap: 12,
  },
  scanText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  resultCard: {
    backgroundColor: '#F8FAFC',
    borderRadius: 24,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  resultHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 16,
  },
  resultTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#10B981',
    textTransform: 'uppercase',
  },
  bookInfo: {
    marginBottom: 20,
  },
  bookTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#1E293B',
    marginBottom: 4,
  },
  bookMeta: {
    fontSize: 14,
    color: '#64748B',
    marginBottom: 2,
  },
  statusBadge: {
    backgroundColor: '#E0F2FE',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    alignSelf: 'flex-start',
    marginTop: 8,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#0284C7',
  },
  reserveBtn: {
    backgroundColor: '#1E293B',
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
  },
  reserveText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
  closeBtn: {
    alignItems: 'center',
  },
  closeText: {
    color: '#64748B',
    fontSize: 14,
    fontWeight: '600',
  },
  darkText: {
    color: '#F8FAFC',
  },
});

export default LibraryScanner;
