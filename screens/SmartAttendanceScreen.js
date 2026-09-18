import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  Dimensions,
  Animated,
  StatusBar,
  Alert,
  Modal,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../components/ThemeProvider';
import { useApp } from '../context/AppContext';

const { width } = Dimensions.get('window');

const COURSES = [
  { code: 'CSM301', name: 'Operating Systems', attended: 22, total: 30, color: '#6366F1', lecturer: 'Dr. Mensah' },
  { code: 'CSM305', name: 'Database Systems', attended: 26, total: 30, color: '#10B981', lecturer: 'Prof. Adu' },
  { code: 'CSM303', name: 'Computer Networks', attended: 18, total: 30, color: '#EF4444', lecturer: 'Dr. Boateng' },
  { code: 'CSM309', name: 'Software Engineering', attended: 28, total: 30, color: '#F59E0B', lecturer: 'Dr. Asante' },
  { code: 'CSM311', name: 'Algorithm Analysis', attended: 20, total: 30, color: '#8B5CF6', lecturer: 'Prof. Osei' },
  { code: 'CSM307', name: 'Web Development', attended: 24, total: 27, color: '#EC4899', lecturer: 'Mr. Frimpong' },
];

const CALENDAR = Array.from({ length: 30 }, (_, i) => ({
  day: i + 1,
  status: Math.random() > 0.2 ? (Math.random() > 0.85 ? 'absent' : 'present') : 'holiday',
}));

const ATT_THRESHOLD = 75; // minimum attendance %

export default function SmartAttendanceScreen({ navigation }) {
  const { isDark } = useTheme();
  const { user } = useApp();
  const [selected, setSelected] = useState(null);
  const [showScanner, setShowScanner] = useState(false);
  const [showAppeal, setShowAppeal] = useState(false);
  const [scanPhase, setScanPhase] = useState(0); // 0=idle, 1=scanning, 2=done
  const [appealCourse, setAppealCourse] = useState(null);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scanAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, { toValue: 1, duration: 600, useNativeDriver: true }).start();
  }, []);

  const theme = {
    bg: isDark ? '#020617' : '#F8FAFC',
    card: isDark ? '#1E293B' : '#FFFFFF',
    text: isDark ? '#F1F5F9' : '#1E293B',
    sub: isDark ? '#94A3B8' : '#64748B',
    border: isDark ? '#334155' : '#E2E8F0',
  };

  const overallAtt = Math.round(COURSES.reduce((s, c) => s + (c.attended / c.total), 0) / COURSES.length * 100);
  const atRisk = COURSES.filter(c => (c.attended / c.total) * 100 < ATT_THRESHOLD);

  const startScan = () => {
    setScanPhase(1);
    setShowScanner(true);
    Animated.loop(
      Animated.timing(scanAnim, { toValue: 1, duration: 1500, useNativeDriver: true })
    ).start();
    setTimeout(() => {
      setScanPhase(2);
      scanAnim.stopAnimation();
    }, 3000);
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.bg }]}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />

      {/* Header */}
      <LinearGradient colors={isDark ? ['#1A1A2E', '#020617'] : ['#EF4444', '#DC2626']} style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color="#FFF" />
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>Smart Attendance</Text>
          <Text style={styles.headerSub}>GPS & QR Verified · {overallAtt}% overall</Text>
        </View>
        <View style={[styles.livePin, { opacity: 1 }]}>
          <View style={styles.liveDot} />
          <Text style={styles.liveText}>GPS ON</Text>
        </View>
      </LinearGradient>

      <Animated.ScrollView style={{ opacity: fadeAnim }} showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scroll}>

        {/* Overall Gauge */}
        <View style={[styles.gaugeCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
          <View style={styles.gaugeLeft}>
            <Text style={[styles.gaugeLabel, { color: theme.sub }]}>OVERALL ATTENDANCE</Text>
            <Text style={[styles.gaugePct, { color: overallAtt >= ATT_THRESHOLD ? '#10B981' : '#EF4444' }]}>{overallAtt}%</Text>
            <Text style={[styles.gaugeStatus, { color: overallAtt >= ATT_THRESHOLD ? '#10B981' : '#EF4444' }]}>
              {overallAtt >= ATT_THRESHOLD ? '✅ Eligible for Exams' : '⚠️ Below Minimum Threshold'}
            </Text>
          </View>
          <View style={styles.gaugeRight}>
            <View style={styles.gaugeCircle}>
              <LinearGradient colors={overallAtt >= ATT_THRESHOLD ? ['#10B981', '#059669'] : ['#EF4444', '#DC2626']}
                style={styles.gaugeCircleInner}>
                <Text style={styles.gaugeCircleNum}>{overallAtt}%</Text>
              </LinearGradient>
            </View>
          </View>
        </View>

        {/* Quick Scan Button */}
        <TouchableOpacity style={styles.scanBtn} onPress={startScan} activeOpacity={0.9}>
          <LinearGradient colors={['#6366F1', '#8B5CF6']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.scanBtnInner}>
            <Ionicons name="qr-code" size={28} color="#FFF" />
            <View>
              <Text style={styles.scanBtnTitle}>QR Check-In</Text>
              <Text style={styles.scanBtnSub}>Scan to record attendance now</Text>
            </View>
          </LinearGradient>
        </TouchableOpacity>

        {/* At Risk Alert */}
        {atRisk.length > 0 && (
          <View style={[styles.riskBanner]}>
            <LinearGradient colors={['#FEF2F2', '#FEE2E2']} style={styles.riskBannerInner}>
              <Ionicons name="warning" size={18} color="#EF4444" />
              <Text style={styles.riskText}>
                <Text style={{ fontWeight: '900' }}>{atRisk.length} course{atRisk.length > 1 ? 's' : ''}</Text> below {ATT_THRESHOLD}% threshold — risk of exam suspension.
              </Text>
            </LinearGradient>
          </View>
        )}

        {/* Per-Course Cards */}
        <Text style={[styles.sectionHeader, { color: theme.sub }]}>COURSE ATTENDANCE</Text>
        {COURSES.map(c => {
          const pct = Math.round((c.attended / c.total) * 100);
          const isRisk = pct < ATT_THRESHOLD;
          const needed = Math.max(0, Math.ceil((ATT_THRESHOLD * c.total / 100) - c.attended));
          return (
            <TouchableOpacity key={c.code} style={[styles.courseCard, { backgroundColor: theme.card, borderColor: isRisk ? '#EF4444' : theme.border }]}
              onPress={() => setSelected(c)} activeOpacity={0.85}>
              <View style={[styles.courseColorBar, { backgroundColor: c.color }]} />
              <View style={styles.courseInfo}>
                <View style={styles.courseTop}>
                  <Text style={[styles.courseCode, { color: c.color }]}>{c.code}</Text>
                  <Text style={[styles.coursePct, { color: isRisk ? '#EF4444' : '#10B981' }]}>{pct}%</Text>
                </View>
                <Text style={[styles.courseName, { color: theme.text }]}>{c.name}</Text>
                <View style={[styles.attBar, { backgroundColor: isDark ? '#334155' : '#F1F5F9' }]}>
                  <LinearGradient colors={isRisk ? ['#EF4444', '#F97316'] : [c.color, c.color + 'CC']}
                    start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
                    style={[styles.attBarFill, { width: `${pct}%` }]} />
                  <View style={[styles.attBarThreshold, { left: `${ATT_THRESHOLD}%` }]} />
                </View>
                <Text style={[styles.courseStats, { color: theme.sub }]}>
                  {c.attended}/{c.total} classes attended
                  {isRisk && needed > 0 ? ` · Attend ${needed} more to qualify` : ''}
                </Text>
              </View>
              {isRisk && (
                <TouchableOpacity style={styles.appealBtn}
                  onPress={() => { setAppealCourse(c); setShowAppeal(true); }}>
                  <Text style={styles.appealBtnText}>Appeal</Text>
                </TouchableOpacity>
              )}
            </TouchableOpacity>
          );
        })}

        {/* Monthly Calendar */}
        <Text style={[styles.sectionHeader, { color: theme.sub, marginTop: 24 }]}>JUNE 2026 — ATTENDANCE CALENDAR</Text>
        <View style={[styles.calCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
          <View style={styles.calGrid}>
            {CALENDAR.map(d => (
              <View key={d.day} style={[styles.calDay,
                { backgroundColor: d.status === 'present' ? '#10B981' : d.status === 'absent' ? '#EF4444' : isDark ? '#334155' : '#F1F5F9' }]}>
                <Text style={[styles.calDayNum, { color: d.status === 'holiday' ? (isDark ? '#94A3B8' : '#CBD5E1') : '#FFF' }]}>{d.day}</Text>
              </View>
            ))}
          </View>
          <View style={styles.calLegend}>
            {[['#10B981', 'Present'], ['#EF4444', 'Absent'], [isDark ? '#334155' : '#F1F5F9', 'Holiday']].map(([color, label]) => (
              <View key={label} style={styles.calLegendItem}>
                <View style={[styles.calLegendDot, { backgroundColor: color }]} />
                <Text style={[styles.calLegendText, { color: theme.sub }]}>{label}</Text>
              </View>
            ))}
          </View>
        </View>

        <View style={{ height: 40 }} />
      </Animated.ScrollView>

      {/* QR Scanner Modal */}
      <Modal visible={showScanner} transparent animationType="fade" onRequestClose={() => { setScanPhase(0); setShowScanner(false); }}>
        <View style={styles.scanModal}>
          <View style={[styles.scanSheet, { backgroundColor: '#1E293B' }]}>
            <Text style={styles.scanTitle}>
              {scanPhase === 0 ? 'Ready to Scan' : scanPhase === 1 ? 'Scanning QR Code...' : '✅ Attendance Verified!'}
            </Text>
            <View style={styles.scanFrame}>
              <View style={[styles.scanCorner, styles.scanCornerTL]} />
              <View style={[styles.scanCorner, styles.scanCornerTR]} />
              <View style={[styles.scanCorner, styles.scanCornerBL]} />
              <View style={[styles.scanCorner, styles.scanCornerBR]} />
              {scanPhase === 1 && (
                <Animated.View style={[styles.scanLine, {
                  transform: [{ translateY: scanAnim.interpolate({ inputRange: [0, 1], outputRange: [0, 160] }) }]
                }]} />
              )}
              {scanPhase === 2 && <Ionicons name="checkmark-circle" size={64} color="#10B981" />}
              {scanPhase === 1 && <Ionicons name="qr-code" size={80} color="rgba(255,255,255,0.2)" />}
            </View>
            {scanPhase === 2 && (
              <View style={styles.scanSuccess}>
                <Text style={styles.scanSuccessTitle}>CSM301 - Operating Systems</Text>
                <Text style={styles.scanSuccessSub}>GPS Verified · Hall A3 · 08:42 AM</Text>
              </View>
            )}
            <TouchableOpacity style={styles.scanClose} onPress={() => { setScanPhase(0); setShowScanner(false); }}>
              <Text style={styles.scanCloseText}>{scanPhase === 2 ? 'Done' : 'Cancel'}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Appeal Modal */}
      <Modal visible={showAppeal} transparent animationType="slide" onRequestClose={() => setShowAppeal(false)}>
        <View style={styles.modalOverlay}>
          <View style={[styles.appealSheet, { backgroundColor: theme.card }]}>
            <View style={styles.detailHandle} />
            <Text style={[styles.appealTitle, { color: theme.text }]}>Submit Attendance Appeal</Text>
            {appealCourse && <Text style={[styles.appealCourse, { color: '#6366F1' }]}>{appealCourse.code} - {appealCourse.name}</Text>}
            <Text style={[styles.appealDesc, { color: theme.sub }]}>State your reason for missed classes. The school authority will review and respond within 3 working days.</Text>
            {['Medical Emergency', 'Family Bereavement', 'University Representation', 'Other (with evidence)'].map(r => (
              <TouchableOpacity key={r} style={[styles.appealOption, { borderColor: theme.border }]}
                onPress={() => { setShowAppeal(false); Alert.alert('Appeal Submitted', `Your appeal for "${r}" has been submitted. Track status in Complaints System.`); }}>
                <Ionicons name="radio-button-on" size={18} color="#6366F1" />
                <Text style={[styles.appealOptionText, { color: theme.text }]}>{r}</Text>
              </TouchableOpacity>
            ))}
            <TouchableOpacity style={[styles.appealCancel, { borderColor: theme.border }]} onPress={() => setShowAppeal(false)}>
              <Text style={{ color: theme.sub, fontWeight: '700' }}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, paddingTop: 16, paddingBottom: 20 },
  backBtn: { width: 40 },
  headerCenter: { flex: 1, alignItems: 'center' },
  headerTitle: { fontSize: 20, fontWeight: '900', color: '#FFF' },
  headerSub: { fontSize: 11, color: 'rgba(255,255,255,0.75)', marginTop: 2 },
  livePin: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: 'rgba(0,0,0,0.3)', paddingHorizontal: 10, paddingVertical: 5, borderRadius: 20 },
  liveDot: { width: 7, height: 7, borderRadius: 4, backgroundColor: '#10B981' },
  liveText: { fontSize: 9, fontWeight: '900', color: '#FFF', letterSpacing: 1 },
  scroll: { paddingBottom: 30 },
  gaugeCard: { flexDirection: 'row', margin: 20, borderRadius: 22, padding: 20, borderWidth: 1, alignItems: 'center' },
  gaugeLeft: { flex: 1 },
  gaugeLabel: { fontSize: 10, fontWeight: '900', letterSpacing: 1, marginBottom: 6 },
  gaugePct: { fontSize: 40, fontWeight: '900' },
  gaugeStatus: { fontSize: 12, fontWeight: '700', marginTop: 4 },
  gaugeRight: { marginLeft: 20 },
  gaugeCircle: { width: 80, height: 80, borderRadius: 40, overflow: 'hidden' },
  gaugeCircleInner: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  gaugeCircleNum: { fontSize: 18, fontWeight: '900', color: '#FFF' },
  scanBtn: { marginHorizontal: 20, marginBottom: 16, borderRadius: 20, overflow: 'hidden', elevation: 8 },
  scanBtnInner: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 24, paddingVertical: 18, gap: 16 },
  scanBtnTitle: { fontSize: 18, fontWeight: '900', color: '#FFF' },
  scanBtnSub: { fontSize: 12, color: 'rgba(255,255,255,0.8)', marginTop: 2 },
  riskBanner: { marginHorizontal: 20, marginBottom: 16, borderRadius: 16, overflow: 'hidden' },
  riskBannerInner: { flexDirection: 'row', alignItems: 'center', padding: 14, gap: 10 },
  riskText: { flex: 1, fontSize: 13, color: '#B91C1C', lineHeight: 18 },
  sectionHeader: { fontSize: 11, fontWeight: '900', letterSpacing: 1, marginHorizontal: 20, marginBottom: 12 },
  courseCard: { flexDirection: 'row', alignItems: 'center', marginHorizontal: 20, marginBottom: 12, borderRadius: 20, borderWidth: 1, overflow: 'hidden', paddingRight: 14 },
  courseColorBar: { width: 6, minHeight: 90 },
  courseInfo: { flex: 1, padding: 14 },
  courseTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  courseCode: { fontSize: 12, fontWeight: '900', letterSpacing: 0.5 },
  coursePct: { fontSize: 18, fontWeight: '900' },
  courseName: { fontSize: 14, fontWeight: '800', marginVertical: 6 },
  attBar: { height: 8, borderRadius: 4, overflow: 'hidden', position: 'relative' },
  attBarFill: { height: '100%', borderRadius: 4 },
  attBarThreshold: { position: 'absolute', top: -2, width: 2, height: 12, backgroundColor: '#1E293B', borderRadius: 1 },
  courseStats: { fontSize: 11, fontWeight: '600', marginTop: 6 },
  appealBtn: { backgroundColor: '#FEF2F2', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 10 },
  appealBtnText: { fontSize: 11, fontWeight: '900', color: '#EF4444' },
  calCard: { marginHorizontal: 20, borderRadius: 20, padding: 16, borderWidth: 1 },
  calGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  calDay: { width: (width - 80) / 7 - 3, height: (width - 80) / 7 - 3, borderRadius: 8, justifyContent: 'center', alignItems: 'center' },
  calDayNum: { fontSize: 11, fontWeight: '700' },
  calLegend: { flexDirection: 'row', gap: 16, marginTop: 14, justifyContent: 'center' },
  calLegendItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  calLegendDot: { width: 10, height: 10, borderRadius: 5 },
  calLegendText: { fontSize: 11, fontWeight: '600' },
  scanModal: { flex: 1, backgroundColor: 'rgba(0,0,0,0.85)', justifyContent: 'center', alignItems: 'center' },
  scanSheet: { width: width * 0.85, borderRadius: 28, padding: 28, alignItems: 'center', gap: 20 },
  scanTitle: { fontSize: 18, fontWeight: '900', color: '#FFF' },
  scanFrame: { width: 180, height: 180, justifyContent: 'center', alignItems: 'center', position: 'relative', overflow: 'hidden' },
  scanCorner: { position: 'absolute', width: 30, height: 30, borderColor: '#6366F1', borderWidth: 4 },
  scanCornerTL: { top: 0, left: 0, borderRightWidth: 0, borderBottomWidth: 0 },
  scanCornerTR: { top: 0, right: 0, borderLeftWidth: 0, borderBottomWidth: 0 },
  scanCornerBL: { bottom: 0, left: 0, borderRightWidth: 0, borderTopWidth: 0 },
  scanCornerBR: { bottom: 0, right: 0, borderLeftWidth: 0, borderTopWidth: 0 },
  scanLine: { position: 'absolute', top: 0, left: 0, right: 0, height: 2, backgroundColor: '#6366F1' },
  scanSuccess: { alignItems: 'center', gap: 4 },
  scanSuccessTitle: { fontSize: 15, fontWeight: '900', color: '#FFF' },
  scanSuccessSub: { fontSize: 12, color: '#94A3B8' },
  scanClose: { backgroundColor: '#6366F1', paddingHorizontal: 40, paddingVertical: 14, borderRadius: 20 },
  scanCloseText: { fontSize: 15, fontWeight: '900', color: '#FFF' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  appealSheet: { borderTopLeftRadius: 28, borderTopRightRadius: 28, padding: 24, gap: 12 },
  detailHandle: { width: 40, height: 4, borderRadius: 2, backgroundColor: '#94A3B8', alignSelf: 'center', marginBottom: 8 },
  appealTitle: { fontSize: 20, fontWeight: '900' },
  appealCourse: { fontSize: 13, fontWeight: '800' },
  appealDesc: { fontSize: 13, lineHeight: 20 },
  appealOption: { flexDirection: 'row', alignItems: 'center', gap: 12, borderWidth: 1, borderRadius: 14, padding: 14 },
  appealOptionText: { fontSize: 14, fontWeight: '700' },
  appealCancel: { borderWidth: 1, borderRadius: 14, paddingVertical: 14, alignItems: 'center', marginTop: 4 },
});
