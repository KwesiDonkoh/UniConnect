import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../components/ThemeProvider';
import { useApp } from '../context/AppContext';

const { width } = Dimensions.get('window');

export default function PerformanceAnalyticsScreen({ navigation }) {
  const { isDark } = useTheme();
  const { user } = useApp();
  const [targetGPA, setTargetGPA] = useState(3.8);

  const isLecturer = user?.userType === 'lecturer';

  const renderGPAForecaster = () => (
    <View style={[styles.analyticsCard, isDark && styles.darkCard]}>
      <Text style={[styles.cardTitle, isDark && { color: '#FFF' }]}>GPA Forecaster AI</Text>
      <Text style={styles.cardSubtitle}>Slide to predict your cumulative GPA based on target semester grades.</Text>
      
      <View style={styles.gpaDisplay}>
        <Text style={styles.gpaLabel}>Current: 3.52</Text>
        <Text style={styles.gpaValue}>{targetGPA.toFixed(2)}</Text>
        <Text style={styles.gpaLabel}>Target</Text>
      </View>

      <View style={styles.sliderContainer}>
        <View style={styles.sliderTrack}>
          <LinearGradient 
            colors={['#4F46E5', '#10B981']} 
            start={{ x: 0, y: 0 }} 
            end={{ x: 1, y: 0 }} 
            style={[styles.sliderFill, { width: `${(targetGPA / 4.0) * 100}%` }]} 
          />
        </View>
        <TouchableOpacity 
          style={styles.sliderKnob} 
          onPress={() => setTargetGPA(prev => Math.min(prev + 0.1, 4.0))}
        />
      </View>

      <View style={styles.insightBox}>
        <Ionicons name="bulb" size={18} color="#F59E0B" />
        <Text style={styles.insightText}>
          To reach <Text style={{ fontWeight: '800' }}>3.80</Text>, you need an average of <Text style={{ fontWeight: '800' }}>3.92</Text> in your next 3 semesters.
        </Text>
      </View>
    </View>
  );

  const renderAttendanceHeatmap = () => (
    <View style={[styles.analyticsCard, isDark && styles.darkCard]}>
      <Text style={[styles.cardTitle, isDark && { color: '#FFF' }]}>Attendance Heatmap</Text>
      <View style={styles.heatmapRow}>
        {['M', 'T', 'W', 'T', 'F'].map(day => (
          <View key={day} style={styles.heatmapCol}>
            <Text style={styles.dayLabel}>{day}</Text>
            {[1, 2, 3, 4].map(idx => (
              <View 
                key={idx} 
                style={[
                  styles.heatBox, 
                  { backgroundColor: Math.random() > 0.3 ? '#10B981' : '#F1F5F9' },
                  isDark && { borderColor: '#334155' }
                ]} 
              />
            ))}
          </View>
        ))}
      </View>
      <View style={styles.heatmapLegend}>
        <Text style={styles.legendText}>Low</Text>
        <View style={[styles.heatBox, { backgroundColor: '#F1F5F9' }]} />
        <View style={[styles.heatBox, { backgroundColor: '#BBF7D0' }]} />
        <View style={[styles.heatBox, { backgroundColor: '#4ADE80' }]} />
        <View style={[styles.heatBox, { backgroundColor: '#10B981' }]} />
        <Text style={styles.legendText}>High</Text>
      </View>
    </View>
  );

  const renderLecturerInsights = () => (
    <View style={styles.lecturerView}>
      <View style={[styles.analyticsCard, isDark && styles.darkCard]}>
        <Text style={[styles.cardTitle, isDark && { color: '#FFF' }]}>Cluster Performance</Text>
        <Text style={styles.cardSubtitle}>Student grouping based on engagement and grade trajectory.</Text>
        
        <View style={styles.clusterChart}>
          <View style={[styles.cluster, { backgroundColor: '#EEF2FF', width: '60%' }]}>
            <Text style={styles.clusterValue}>65%</Text>
            <Text style={styles.clusterLabel}>On Track</Text>
          </View>
          <View style={{ flexDirection: 'row', width: '40%', gap: 10 }}>
            <View style={[styles.cluster, { backgroundColor: '#FEF2F2', flex: 1 }]}>
               <Text style={[styles.clusterValue, { color: '#EF4444' }]}>20%</Text>
               <Text style={styles.clusterLabel}>At Risk</Text>
            </View>
            <View style={[styles.cluster, { backgroundColor: '#ECFDF5', flex: 1 }]}>
               <Text style={[styles.clusterValue, { color: '#10B981' }]}>15%</Text>
               <Text style={styles.clusterLabel}>Advancing</Text>
            </View>
          </View>
        </View>

        <TouchableOpacity style={styles.reachOutBtn}>
           <Text style={styles.reachOutText}>Reach out to "At Risk" students</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={[styles.container, isDark && styles.darkContainer]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="chevron-back" size={24} color={isDark ? '#FFF' : '#1E293B'} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, isDark && { color: '#FFF' }]}>Performance Analytics</Text>
        <TouchableOpacity>
          <Ionicons name="share-outline" size={24} color={isDark ? '#FFF' : '#1E293B'} />
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        <View style={styles.welcomeSection}>
           <Text style={styles.welcomeSubtitle}>Academic Year 2025/2026</Text>
           <Text style={[styles.welcomeTitle, isDark && { color: '#FFF' }]}>
             {isLecturer ? 'Course Insights' : 'Your Progress'}
           </Text>
        </View>

        {!isLecturer && renderGPAForecaster()}
        {renderAttendanceHeatmap()}
        {isLecturer && renderLecturerInsights()}

        {/* Global Standings */}
        <View style={[styles.analyticsCard, isDark && styles.darkCard]}>
          <Text style={[styles.cardTitle, isDark && { color: '#FFF' }]}>Department Standing</Text>
          <View style={styles.rankContainer}>
             <View style={styles.rankCircle}>
                <Text style={styles.rankNumber}>#14</Text>
                <Text style={styles.rankOf}>of 450</Text>
             </View>
             <View style={styles.rankInfo}>
                <Text style={[styles.rankHighlight, isDark && { color: '#FFF' }]}>Top 3% of Department</Text>
                <Text style={styles.rankSub}>You are performing better than 97% of your peers in Engineering Mathematics.</Text>
             </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  darkContainer: {
    backgroundColor: '#0F172A',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#1E293B',
  },
  scrollContent: {
    paddingBottom: 100,
  },
  welcomeSection: {
    paddingHorizontal: 20,
    marginTop: 10,
    marginBottom: 20,
  },
  welcomeSubtitle: {
    fontSize: 13,
    color: '#64748B',
    fontWeight: '600',
  },
  welcomeTitle: {
    fontSize: 26,
    fontWeight: '900',
    color: '#1E293B',
    marginTop: 4,
  },
  analyticsCard: {
    backgroundColor: '#FFF',
    marginHorizontal: 20,
    borderRadius: 24,
    padding: 20,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  darkCard: {
    backgroundColor: '#1E293B',
    borderColor: '#334155',
  },
  cardTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: '#1E293B',
    marginBottom: 4,
  },
  cardSubtitle: {
    fontSize: 12,
    color: '#64748B',
    lineHeight: 18,
    marginBottom: 20,
  },
  gpaDisplay: {
    alignItems: 'center',
    marginVertical: 10,
  },
  gpaValue: {
    fontSize: 48,
    fontWeight: '900',
    color: '#4F46E5',
  },
  gpaLabel: {
    fontSize: 12,
    color: '#94A3B8',
    fontWeight: '700',
  },
  sliderContainer: {
    marginVertical: 20,
    position: 'relative',
    height: 30,
    justifyContent: 'center',
  },
  sliderTrack: {
    height: 8,
    backgroundColor: '#F1F5F9',
    borderRadius: 4,
    overflow: 'hidden',
  },
  sliderFill: {
    height: '100%',
  },
  sliderKnob: {
    position: 'absolute',
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#FFF',
    borderWidth: 4,
    borderColor: '#4F46E5',
    right: 0,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
  },
  insightBox: {
    flexDirection: 'row',
    backgroundColor: '#FFFBEB',
    padding: 12,
    borderRadius: 12,
    alignItems: 'center',
    gap: 10,
  },
  insightText: {
    flex: 1,
    fontSize: 13,
    color: '#D97706',
    lineHeight: 18,
  },
  heatmapRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  heatmapCol: {
    alignItems: 'center',
    gap: 8,
  },
  dayLabel: {
    fontSize: 11,
    color: '#94A3B8',
    fontWeight: '700',
    marginBottom: 4,
  },
  heatBox: {
    width: 32,
    height: 32,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#FFF',
  },
  heatmapLegend: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    marginTop: 20,
    gap: 8,
  },
  legendText: {
    fontSize: 11,
    color: '#94A3B8',
    fontWeight: '600',
  },
  clusterChart: {
    flexDirection: 'row',
    height: 120,
    gap: 10,
  },
  cluster: {
    borderRadius: 16,
    padding: 15,
    justifyContent: 'center',
    alignItems: 'center',
  },
  clusterValue: {
    fontSize: 24,
    fontWeight: '900',
    color: '#4F46E5',
  },
  clusterLabel: {
    fontSize: 11,
    color: '#64748B',
    fontWeight: '700',
    marginTop: 4,
  },
  reachOutBtn: {
    marginTop: 20,
    backgroundColor: '#F8FAFC',
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  reachOutText: {
    color: '#4F46E5',
    fontSize: 14,
    fontWeight: '700',
  },
  rankContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 20,
  },
  rankCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#EEF2FF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  rankNumber: {
    fontSize: 24,
    fontWeight: '900',
    color: '#4F46E5',
  },
  rankOf: {
    fontSize: 10,
    color: '#64748B',
    fontWeight: '700',
  },
  rankInfo: {
    flex: 1,
  },
  rankHighlight: {
    fontSize: 16,
    fontWeight: '800',
    color: '#1E293B',
    marginBottom: 4,
  },
  rankSub: {
    fontSize: 12,
    color: '#64748B',
    lineHeight: 18,
  },
  lecturerView: {
    marginTop: 10,
  },
});
