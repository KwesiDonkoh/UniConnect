import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Animated,
  Dimensions,
  Vibration,
  Alert,
  TextInput,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

const { width } = Dimensions.get('window');

const AttendanceManagement = ({ isDark, onClose, courseCode = 'CS 402' }) => {
  const [view, setView] = useState('main'); // 'main', 'scanner', 'list'
  const [students, setStudents] = useState([
    { id: '1', name: 'Kwesi Donkoh', studentId: '20230001', status: 'present' },
    { id: '2', name: 'Ama Serwaa', studentId: '20230002', status: 'absent' },
    { id: '3', name: 'Yaw Boateng', studentId: '20230003', status: 'present' },
    { id: '4', name: 'Esi Mensah', studentId: '20230004', status: 'absent' },
    { id: '5', name: 'Kofi Owusu', studentId: '20230005', status: 'present' },
    { id: '6', name: 'Akua Addo', studentId: '20230006', status: 'absent' },
  ]);
  const [searchQuery, setSearchQuery] = useState('');
  const [scanning, setScanning] = useState(false);
  const scanAnim = new Animated.Value(0);

  useEffect(() => {
    if (scanning) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(scanAnim, { toValue: 1, duration: 2000, useNativeDriver: true }),
          Animated.timing(scanAnim, { toValue: 0, duration: 2000, useNativeDriver: true }),
        ])
      ).start();
    } else {
      scanAnim.stopAnimation();
    }
  }, [scanning]);

  const toggleStatus = (id) => {
    setStudents(prev => prev.map(s => s.id === id ? { ...s, status: s.status === 'present' ? 'absent' : 'present' } : s));
    Vibration.vibrate(20);
  };

  const markAll = (status) => {
    setStudents(prev => prev.map(s => ({ ...s, status })));
    Alert.alert('Success ✅', `All students marked as ${status}.`);
  };

  const startScanner = () => {
    setView('scanner');
    setScanning(true);
  };

  const simulateScan = () => {
    Vibration.vibrate([100, 50, 100]);
    Alert.alert('Student Scanned 📱', 'Kwame Nkrumah (20230999) has been marked present.', [
      { text: 'OK', onPress: () => setScanning(false) }
    ]);
  };

  const filteredStudents = students.filter(s => 
    s.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    s.studentId.includes(searchQuery)
  );

  const stats = {
    present: students.filter(s => s.status === 'present').length,
    absent: students.filter(s => s.status === 'absent').length,
    total: students.length
  };

  return (
    <View style={[styles.container, isDark && styles.darkContainer]}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.closeBtn} onPress={onClose}>
          <Ionicons name="chevron-back" size={24} color={isDark ? '#FFFFFF' : '#1E293B'} />
        </TouchableOpacity>
        <Text style={[styles.title, isDark && styles.darkText]}>Attendance: {courseCode}</Text>
        <View style={{ width: 40 }} />
      </View>

      {view === 'main' && (
        <ScrollView contentContainerStyle={styles.mainContent}>
          <View style={[styles.statsRow, isDark && styles.darkStatsRow]}>
            <View style={styles.statCard}>
              <Text style={styles.statLabel}>Present</Text>
              <Text style={[styles.statValue, { color: '#10B981' }]}>{stats.present}</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statLabel}>Absent</Text>
              <Text style={[styles.statValue, { color: '#EF4444' }]}>{stats.absent}</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statLabel}>Success</Text>
              <Text style={[styles.statValue, { color: '#6366F1' }]}>{Math.round((stats.present / stats.total) * 100)}%</Text>
            </View>
          </View>

          <TouchableOpacity style={styles.primaryAction} onPress={startScanner}>
            <LinearGradient colors={['#6366F1', '#4F46E5']} style={styles.primaryGradient}>
              <Ionicons name="qr-code" size={32} color="#FFFFFF" />
              <Text style={styles.primaryActionText}>Launch QR Scanner</Text>
            </LinearGradient>
          </TouchableOpacity>

          <TouchableOpacity style={styles.secondaryAction} onPress={() => setView('list')}>
            <LinearGradient colors={['#10B981', '#059669']} style={styles.primaryGradient}>
              <Ionicons name="list" size={32} color="#FFFFFF" />
              <Text style={styles.primaryActionText}>Manual Attendance List</Text>
            </LinearGradient>
          </TouchableOpacity>

          <View style={styles.shortcuts}>
            <TouchableOpacity style={styles.shortcutBtn} onPress={() => markAll('present')}>
              <Text style={styles.shortcutText}>Mark All Present</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.shortcutBtn, { backgroundColor: '#FEE2E2' }]} onPress={() => markAll('absent')}>
              <Text style={[styles.shortcutText, { color: '#EF4444' }]}>Reset List</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      )}

      {view === 'scanner' && (
        <View style={styles.scannerView}>
          <View style={styles.scannerOverlay}>
            <View style={styles.scannerFrame}>
              <Animated.View style={[
                styles.scannerLine,
                { transform: [{ translateY: scanAnim.interpolate({ inputRange: [0, 1], outputRange: [0, 250] }) }] }
              ]} />
            </View>
            <Text style={styles.scannerHint}>Align student ID QR code within the frame</Text>
            <TouchableOpacity style={styles.simulateBtn} onPress={simulateScan}>
              <Text style={styles.simulateBtnText}>Simulate Scan</Text>
            </TouchableOpacity>
          </View>
          <TouchableOpacity style={styles.backFab} onPress={() => setView('main')}>
            <Ionicons name="close" size={32} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
      )}

      {view === 'list' && (
        <View style={styles.listView}>
          <View style={[styles.searchContainer, isDark && styles.darkSearch]}>
            <Ionicons name="search" size={20} color={isDark ? '#94A3B8' : '#64748B'} />
            <TextInput
              style={[styles.searchInput, isDark && styles.darkText]}
              placeholder="Search student or ID..."
              placeholderTextColor={isDark ? '#94A3B8' : '#94A3B8'}
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
          </View>

          <ScrollView style={styles.studentScroll}>
            {filteredStudents.map((student) => (
              <TouchableOpacity 
                key={student.id} 
                style={[styles.studentCard, isDark && styles.darkStudentCard]} 
                onPress={() => toggleStatus(student.id)}
              >
                <View style={styles.studentInfo}>
                  <Text style={[styles.studentName, isDark && styles.darkText]}>{student.name}</Text>
                  <Text style={styles.studentId}>{student.studentId}</Text>
                </View>
                <View style={[
                  styles.statusBadge, 
                  { backgroundColor: student.status === 'present' ? '#DCFCE7' : '#FEE2E2' }
                ]}>
                  <Text style={[
                    styles.statusText, 
                    { color: student.status === 'present' ? '#10B981' : '#EF4444' }
                  ]}>{student.status.toUpperCase()}</Text>
                </View>
              </TouchableOpacity>
            ))}
          </ScrollView>
          <TouchableOpacity style={styles.backFab} onPress={() => setView('main')}>
            <Ionicons name="checkmark-done" size={32} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  darkContainer: { backgroundColor: '#0F172A' },
  header: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'space-between', 
    padding: 20, 
    paddingTop: 40 
  },
  title: { fontSize: 20, fontWeight: '700', color: '#1E293B' },
  darkText: { color: '#FFFFFF' },
  closeBtn: { padding: 8 },
  mainContent: { padding: 20 },
  statsRow: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    marginBottom: 30,
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 15,
    elevation: 2
  },
  darkStatsRow: { backgroundColor: '#1E293B' },
  statCard: { alignItems: 'center', flex: 1 },
  statLabel: { fontSize: 12, color: '#64748B', marginBottom: 5 },
  statValue: { fontSize: 22, fontWeight: '800' },
  primaryAction: { height: 160, borderRadius: 24, overflow: 'hidden', marginBottom: 15 },
  secondaryAction: { height: 120, borderRadius: 24, overflow: 'hidden', marginBottom: 15 },
  primaryGradient: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  primaryActionText: { color: '#FFFFFF', fontSize: 18, fontWeight: '700', marginTop: 10 },
  shortcuts: { flexDirection: 'row', justifyContent: 'space-between' },
  shortcutBtn: { 
    flex: 0.48, 
    height: 50, 
    backgroundColor: '#EEF2FF', 
    borderRadius: 15, 
    alignItems: 'center', 
    justifyContent: 'center' 
  },
  shortcutText: { color: '#6366F1', fontWeight: '600' },
  scannerView: { flex: 1, backgroundColor: '#000000' },
  scannerOverlay: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  scannerFrame: { 
    width: 250, 
    height: 250, 
    borderWidth: 2, 
    borderColor: '#6366F1', 
    borderRadius: 20,
    overflow: 'hidden'
  },
  scannerLine: { height: 2, backgroundColor: '#6366F1', width: '100%' },
  scannerHint: { color: '#FFFFFF', marginTop: 30, fontSize: 16, textAlign: 'center' },
  simulateBtn: { 
    marginTop: 50, 
    paddingHorizontal: 30, 
    paddingVertical: 15, 
    backgroundColor: '#6366F1', 
    borderRadius: 30 
  },
  simulateBtnText: { color: '#FFFFFF', fontWeight: '700' },
  backFab: { 
    position: 'absolute', 
    bottom: 30, 
    alignSelf: 'center', 
    width: 70, 
    height: 70, 
    borderRadius: 35, 
    backgroundColor: '#6366F1', 
    alignItems: 'center', 
    justifyContent: 'center',
    elevation: 5 
  },
  listView: { flex: 1, padding: 20 },
  searchContainer: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    backgroundColor: '#FFFFFF', 
    borderRadius: 15, 
    paddingHorizontal: 15,
    height: 50,
    marginBottom: 20
  },
  darkSearch: { backgroundColor: '#1E293B' },
  searchInput: { flex: 1, marginLeft: 10, fontSize: 16 },
  studentScroll: { flex: 1 },
  studentCard: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    padding: 15,
    borderRadius: 15,
    marginBottom: 10
  },
  darkStudentCard: { backgroundColor: '#1E293B' },
  studentName: { fontSize: 16, fontWeight: '600', color: '#1E293B' },
  studentId: { fontSize: 12, color: '#64748B', marginTop: 2 },
  statusBadge: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20 },
  statusText: { fontSize: 10, fontWeight: '800' },
});

export default AttendanceManagement;
