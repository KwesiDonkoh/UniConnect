import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, SafeAreaView, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { useTheme } from '../components/ThemeProvider';

const { width } = Dimensions.get('window');

export default function SafetyScreen({ navigation }) {
  const { isDark } = useTheme();

  return (
    <SafeAreaView style={[styles.container, isDark && styles.darkContainer]}>
      <LinearGradient colors={isDark ? ['#450A0A', '#0F172A'] : ['#FFF1F2', '#FFFFFF']} style={styles.background}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color={isDark ? '#FFF' : '#1E293B'} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, isDark && styles.darkText]}>Campus Safety</Text>
          <View style={{ width: 40 }} />
        </View>

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
          {/* Emergency SOS */}
          <TouchableOpacity style={styles.sosButton}>
            <LinearGradient colors={['#EF4444', '#B91C1C']} style={styles.sosGradient}>
              <Ionicons name="notifications" size={40} color="#FFF" />
              <Text style={styles.sosTitle}>EMERGENCY SOS</Text>
              <Text style={styles.sosSub}>Tap to alert campus security of your location.</Text>
            </LinearGradient>
          </TouchableOpacity>

          {/* Report Conduct / Consent */}
          <Text style={[styles.sectionTitle, isDark && styles.darkText]}>Reporting & Support</Text>
          <BlurView intensity={30} tint={isDark ? 'dark' : 'light'} style={styles.reportCard}>
            <View style={styles.reportHeader}>
              <View style={styles.iconCircle}>
                <Ionicons name="shield-checkmark" size={24} color="#BE123C" />
              </View>
              <View style={styles.reportInfo}>
                <Text style={[styles.reportTitle, isDark && styles.darkText]}>Report a Conduct/Consent Issue</Text>
                <Text style={styles.reportSub}>Secure, confidential reporting for harassment or misconduct.</Text>
              </View>
            </View>
            <TouchableOpacity style={styles.reportActionBtn}>
              <Text style={styles.reportActionText}>Start Secure Report</Text>
              <Ionicons name="lock-closed" size={14} color="#FFF" style={{ marginLeft: 8 }} />
            </TouchableOpacity>
          </BlurView>

          {/* Safety Resources */}
          <View style={styles.grid}>
             <TouchableOpacity style={styles.smallCard}>
                <Ionicons name="walk" size={30} color="#4F46E5" />
                <Text style={[styles.smallCardTitle, isDark && styles.darkText]}>Safe Walk</Text>
                <Text style={styles.smallCardSub}>Request escort</Text>
             </TouchableOpacity>
             <TouchableOpacity style={styles.smallCard}>
                <Ionicons name="eye" size={30} color="#10B981" />
                <Text style={[styles.smallCardTitle, isDark && styles.darkText]}>Report Tip</Text>
                <Text style={styles.smallCardSub}>Anonymous info</Text>
             </TouchableOpacity>
          </View>

          {/* Contacts */}
          <View style={styles.contactsBox}>
            <Text style={[styles.contactHeader, isDark && styles.darkText]}>Key Contacts</Text>
            <View style={styles.contactItem}>
              <Text style={styles.contactName}>Main Security Dispatch</Text>
              <Text style={styles.contactPhone}>032 206 1234</Text>
            </View>
            <View style={styles.contactItem}>
              <Text style={styles.contactName}>Health Services (Night)</Text>
              <Text style={styles.contactPhone}>032 206 5678</Text>
            </View>
          </View>
        </ScrollView>
      </LinearGradient>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  darkContainer: { backgroundColor: '#0F172A' },
  background: { flex: 1 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 20 },
  backButton: { width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(0,0,0,0.05)', alignItems: 'center', justifyContent: 'center' },
  headerTitle: { fontSize: 22, fontWeight: '800', color: '#1E293B' },
  scrollContent: { padding: 20 },
  sosButton: { borderRadius: 30, overflow: 'hidden', elevation: 10, shadowColor: '#EF4444', shadowOpacity: 0.3, shadowRadius: 15, marginBottom: 30 },
  sosGradient: { padding: 30, alignItems: 'center' },
  sosTitle: { fontSize: 24, fontWeight: '900', color: '#FFF', marginTop: 10 },
  sosSub: { fontSize: 13, color: 'rgba(255,255,255,0.8)', marginTop: 5, textAlign: 'center' },
  sectionTitle: { fontSize: 20, fontWeight: '800', color: '#1E293B', marginBottom: 15 },
  reportCard: { padding: 20, borderRadius: 24, overflow: 'hidden', borderWidth: 1, borderColor: 'rgba(0,0,0,0.05)', marginBottom: 25 },
  reportHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 20 },
  iconCircle: { width: 50, height: 50, borderRadius: 25, backgroundColor: '#FFF1F2', alignItems: 'center', justifyContent: 'center' },
  reportInfo: { flex: 1, marginLeft: 15 },
  reportTitle: { fontSize: 16, fontWeight: '800', color: '#1E293B' },
  reportSub: { fontSize: 12, color: '#64748B', marginTop: 4 },
  reportActionBtn: { backgroundColor: '#BE123C', paddingVertical: 12, borderRadius: 12, flexDirection: 'row', alignItems: 'center', justifyContent: 'center' },
  reportActionText: { color: '#FFF', fontWeight: '800', fontSize: 14 },
  grid: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 30 },
  smallCard: { width: (width - 60) / 2, backgroundColor: '#F8FAFC', padding: 20, borderRadius: 20, alignItems: 'center' },
  smallCardTitle: { fontSize: 16, fontWeight: '700', color: '#1E293B', marginTop: 10 },
  smallCardSub: { fontSize: 12, color: '#64748B', marginTop: 2 },
  contactsBox: { backgroundColor: '#F1F5F9', padding: 20, borderRadius: 20 },
  contactHeader: { fontSize: 16, fontWeight: '800', color: '#1E293B', marginBottom: 15 },
  contactItem: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: 'rgba(0,0,0,0.05)' },
  contactName: { fontSize: 14, color: '#475569', fontWeight: '600' },
  contactPhone: { fontSize: 14, color: '#4F46E5', fontWeight: '800' },
  darkText: { color: '#FFF' },
});
