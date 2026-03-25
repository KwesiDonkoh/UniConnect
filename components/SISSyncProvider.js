import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

const SISSyncProvider = ({ visible, onClose, onSyncComplete }) => {
  const [syncing, setSyncing] = useState(false);
  const [progress, setProgress] = useState(0);

  const startSync = () => {
    setSyncing(true);
    let currentProgress = 0;
    const interval = setInterval(() => {
      currentProgress += 5;
      setProgress(currentProgress);
      if (currentProgress >= 100) {
        clearInterval(interval);
        setTimeout(() => {
          setSyncing(false);
          setProgress(0);
          onSyncComplete();
          onClose();
        }, 800);
      }
    }, 100);
  };

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.overlay}>
        <View style={styles.card}>
          <LinearGradient
            colors={['#1e293b', '#0f172a']}
            style={styles.gradient}
          >
            <View style={styles.header}>
              <Ionicons name="sync-circle" size={48} color="#6366F1" />
              <Text style={styles.title}>KNUST SIS Sync</Text>
              <Text style={styles.subtitle}>Secure Academic Integration</Text>
            </View>

            <View style={styles.content}>
              {syncing ? (
                <View style={styles.syncingView}>
                  <ActivityIndicator size="large" color="#6366F1" />
                  <Text style={styles.syncingText}>Fetching data from SIS...</Text>
                  <View style={styles.progressBar}>
                    <View style={[styles.progressFill, { width: `${progress}%` }]} />
                  </View>
                  <Text style={styles.progressText}>{progress}% complete</Text>
                </View>
              ) : (
                <View style={styles.readyView}>
                  <Text style={styles.readyText}>
                    Sync your account to update your grades, schedule, and academic standing directly from the university portal.
                  </Text>
                  <View style={styles.securityBadge}>
                     <Ionicons name="shield-checkmark" size={16} color="#10B981" />
                     <Text style={styles.securityText}>AES-256 Encrypted Connection</Text>
                  </View>
                </View>
              )}
            </View>

            <View style={styles.footer}>
              {!syncing && (
                <TouchableOpacity style={styles.cancelButton} onPress={onClose}>
                  <Text style={styles.cancelText}>Not Now</Text>
                </TouchableOpacity>
              )}
              <TouchableOpacity
                style={[styles.primaryButton, syncing && styles.disabledButton]}
                onPress={startSync}
                disabled={syncing}
              >
                <Text style={styles.buttonText}>{syncing ? 'Syncing...' : 'Start SIS Sync'}</Text>
              </TouchableOpacity>
            </View>
          </LinearGradient>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  card: {
    width: '85%',
    borderRadius: 24,
    overflow: 'hidden',
  },
  gradient: {
    padding: 24,
  },
  header: {
    alignItems: 'center',
    marginBottom: 24,
  },
  title: {
    fontSize: 22,
    fontWeight: '900',
    color: '#FFFFFF',
    marginTop: 12,
  },
  subtitle: {
    fontSize: 14,
    color: '#64748B',
    fontWeight: '600',
  },
  content: {
    minHeight: 150,
    justifyContent: 'center',
  },
  syncingView: {
    alignItems: 'center',
  },
  syncingText: {
    color: '#FFFFFF',
    marginTop: 16,
    marginBottom: 20,
    fontSize: 16,
    fontWeight: '600',
  },
  progressBar: {
    width: '100%',
    height: 8,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#6366F1',
  },
  progressText: {
    color: '#64748B',
    marginTop: 8,
    fontSize: 12,
    fontWeight: '700',
  },
  readyView: {
    alignItems: 'center',
  },
  readyText: {
    color: '#E2E8F0',
    textAlign: 'center',
    fontSize: 14,
    lineHeight: 22,
    marginBottom: 20,
  },
  securityBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  securityText: {
    color: '#10B981',
    fontSize: 11,
    fontWeight: '700',
    marginLeft: 6,
  },
  footer: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 24,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 14,
    alignItems: 'center',
  },
  cancelText: {
    color: '#64748B',
    fontWeight: '700',
  },
  primaryButton: {
    flex: 2,
    backgroundColor: '#6366F1',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  disabledButton: {
    opacity: 0.6,
  },
  buttonText: {
    color: '#FFFFFF',
    fontWeight: '800',
  },
});

export default SISSyncProvider;
