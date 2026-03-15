import React from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

const { width, height } = Dimensions.get('window');

export default function ProgressTracker({ visible, onClose, user, courses }) {
  // Simulated data for trends
  const gpaTrend = [3.2, 3.4, 3.3, 3.45, 3.52];
  const semesters = ['Sem 1', 'Sem 2', 'Sem 3', 'Sem 4', 'Current'];
  
  const totalCreditsRequired = 120;
  const creditsEarned = courses?.reduce((sum, c) => sum + (c.credits || 3), 0) || 45;
  const completionPercentage = (creditsEarned / totalCreditsRequired) * 100;

  return (
    <Modal visible={visible} transparent={true} animationType="slide" onRequestClose={onClose}>
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.header}>
            <View>
              <Text style={styles.headerTitle}>Progress Tracker</Text>
              <Text style={styles.headerSubtitle}>Academic Analytics & Trends</Text>
            </View>
            <TouchableOpacity style={styles.closeButton} onPress={onClose}>
              <Ionicons name="close" size={24} color="#64748B" />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.scrollContent} showsVerticalScrollIndicator={false}>
            {/* GPA Overview Card */}
            <LinearGradient colors={['#6366F1', '#4F46E5']} style={styles.gpaCard}>
              <Text style={styles.gpaLabel}>Current CGPA</Text>
              <Text style={styles.gpaValue}>3.45</Text>
              <View style={styles.gpaTrendContainer}>
                <Ionicons name="trending-up" size={20} color="#10B981" />
                <Text style={styles.gpaTrendText}>+0.12 from last semester</Text>
              </View>
            </LinearGradient>

            {/* Credit Progress */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Degree Completion</Text>
              <View style={styles.statsRow}>
                <View style={styles.statBox}>
                  <Text style={styles.statNumber}>{creditsEarned}</Text>
                  <Text style={styles.statLabel}>Credits Earned</Text>
                </View>
                <View style={styles.statDivider} />
                <View style={styles.statBox}>
                  <Text style={styles.statNumber}>{totalCreditsRequired - creditsEarned}</Text>
                  <Text style={styles.statLabel}>Credits Left</Text>
                </View>
              </View>
              
              <View style={styles.progressTrack}>
                <View style={[styles.progressFill, { width: `${completionPercentage}%` }]} />
              </View>
              <Text style={styles.completionText}>{completionPercentage.toFixed(1)}% of your degree completed</Text>
            </View>

            {/* GPA Trend Chart (Mockup) */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>GPA Trend</Text>
              <View style={styles.chartContainer}>
                <View style={styles.chartLines}>
                  {[4.0, 3.0, 2.0, 1.0].map(val => (
                    <View key={val} style={styles.chartLineRow}>
                      <Text style={styles.chartYLabel}>{val.toFixed(1)}</Text>
                      <View style={styles.chartLine} />
                    </View>
                  ))}
                </View>
                <View style={styles.chartBars}>
                  {gpaTrend.map((gpa, index) => (
                    <View key={index} style={styles.chartBarColumn}>
                      <View style={[styles.chartBar, { height: (gpa / 4.0) * 120 }]} />
                      <Text style={styles.chartXLabel}>{semesters[index]}</Text>
                    </View>
                  ))}
                </View>
              </View>
            </View>

            {/* Recommendations */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Smart Recommendations</Text>
              <TouchableOpacity style={styles.recommendationCard}>
                <View style={styles.recommendationIcon}>
                  <Ionicons name="bulb-outline" size={24} color="#F59E0B" />
                </View>
                <View style={styles.recommendationContent}>
                  <Text style={styles.recommendationTitle}>Boost your CGPA</Text>
                  <Text style={styles.recommendationText}>Pick up two 4-credit courses next semester to significantly impact your average.</Text>
                </View>
              </TouchableOpacity>
            </View>
          </ScrollView>
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
    backgroundColor: '#F8FAFC',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    height: height * 0.9,
    paddingTop: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1E293B',
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#64748B',
  },
  closeButton: {
    padding: 8,
    backgroundColor: '#F1F5F9',
    borderRadius: 20,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  gpaCard: {
    borderRadius: 20,
    padding: 30,
    alignItems: 'center',
    marginBottom: 25,
    elevation: 4,
    shadowColor: '#6366F1',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.2,
    shadowRadius: 15,
  },
  gpaLabel: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 16,
    fontWeight: '600',
  },
  gpaValue: {
    color: '#FFFFFF',
    fontSize: 48,
    fontWeight: '800',
    marginVertical: 10,
  },
  gpaTrendContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
  },
  gpaTrendText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '600',
  },
  section: {
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1E293B',
    marginBottom: 15,
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    padding: 20,
    borderRadius: 20,
    marginBottom: 15,
    elevation: 1,
  },
  statBox: {
    flex: 1,
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1E293B',
  },
  statLabel: {
    fontSize: 13,
    color: '#64748B',
    marginTop: 4,
  },
  statDivider: {
    width: 1,
    height: 40,
    backgroundColor: '#F1F5F9',
  },
  progressTrack: {
    height: 12,
    backgroundColor: '#E2E8F0',
    borderRadius: 6,
    overflow: 'hidden',
    marginBottom: 10,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#6366F1',
    borderRadius: 6,
  },
  completionText: {
    fontSize: 14,
    color: '#64748B',
    textAlign: 'center',
  },
  chartContainer: {
    backgroundColor: '#FFFFFF',
    padding: 20,
    borderRadius: 20,
    height: 200,
    elevation: 1,
  },
  chartLines: {
    position: 'absolute',
    top: 20,
    left: 45,
    right: 20,
    height: 120,
    justifyContent: 'space-between',
  },
  chartLineRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  chartYLabel: {
    fontSize: 10,
    color: '#94A3B8',
    width: 25,
  },
  chartLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#F1F5F9',
  },
  chartBars: {
    position: 'absolute',
    top: 20,
    left: 45,
    right: 20,
    height: 120,
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'flex-end',
  },
  chartBarColumn: {
    alignItems: 'center',
  },
  chartBar: {
    width: 24,
    backgroundColor: '#6366F1',
    borderTopLeftRadius: 4,
    borderTopRightRadius: 4,
  },
  chartXLabel: {
    fontSize: 10,
    color: '#94A3B8',
    marginTop: 25,
  },
  recommendationCard: {
    flexDirection: 'row',
    backgroundColor: '#FFFBEB',
    padding: 20,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#FEF3C7',
    gap: 15,
  },
  recommendationIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#FEF3C7',
    justifyContent: 'center',
    alignItems: 'center',
  },
  recommendationContent: {
    flex: 1,
  },
  recommendationTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#92400E',
    marginBottom: 4,
  },
  recommendationText: {
    fontSize: 14,
    color: '#B45309',
    lineHeight: 20,
  },
});
