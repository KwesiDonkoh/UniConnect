import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  Animated,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';

const { width } = Dimensions.get('window');

const HolographicWidgets = ({ isDark }) => {
  return (
    <View style={styles.outerContainer}>
      <View style={styles.row}>
        {/* GPA Widget */}
        <BlurView intensity={20} tint={isDark ? 'dark' : 'light'} style={styles.widget}>
          <LinearGradient colors={['rgba(99, 102, 241, 0.2)', 'rgba(139, 92, 246, 0.2)']} style={styles.widgetGradient}>
            <View style={styles.widgetHeader}>
              <Ionicons name="stats-chart" size={14} color="#6366F1" />
              <Text style={styles.widgetLabel}>PREDICTED GPA</Text>
            </View>
            <Text style={[styles.widgetValue, isDark && styles.darkText]}>3.85</Text>
            <View style={styles.trendRow}>
              <Ionicons name="caret-up" size={12} color="#10B981" />
              <Text style={styles.trendText}>+0.25</Text>
            </View>
          </LinearGradient>
        </BlurView>

        {/* Streak Widget */}
        <BlurView intensity={20} tint={isDark ? 'dark' : 'light'} style={styles.widget}>
          <LinearGradient colors={['rgba(245, 158, 11, 0.2)', 'rgba(239, 68, 68, 0.2)']} style={styles.widgetGradient}>
            <View style={styles.widgetHeader}>
              <Ionicons name="flame" size={14} color="#F59E0B" />
              <Text style={styles.widgetLabel}>STUDY STREAK</Text>
            </View>
            <Text style={[styles.widgetValue, isDark && styles.darkText]}>14D</Text>
            <View style={styles.trendRow}>
              <Text style={styles.trendText}>Expert Level</Text>
            </View>
          </LinearGradient>
        </BlurView>

        {/* Level Widget */}
        <BlurView intensity={20} tint={isDark ? 'dark' : 'light'} style={styles.widget}>
          <LinearGradient colors={['rgba(16, 185, 129, 0.2)', 'rgba(5, 150, 105, 0.2)']} style={styles.widgetGradient}>
            <View style={styles.widgetHeader}>
              <Ionicons name="school" size={14} color="#10B981" />
              <Text style={styles.widgetLabel}>ACAD. LEVEL</Text>
            </View>
            <Text style={[styles.widgetValue, isDark && styles.darkText]}>300</Text>
            <View style={styles.trendRow}>
              <Text style={styles.trendText}>Sem. 2 Active</Text>
            </View>
          </LinearGradient>
        </BlurView>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  outerContainer: { 
    paddingHorizontal: 15, 
    marginTop: 10,
    zIndex: 100,
  },
  row: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    gap: 10,
  },
  widget: { 
    flex: 1, 
    borderRadius: 20, 
    overflow: 'hidden', 
    height: 85,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  widgetGradient: { 
    flex: 1, 
    padding: 10, 
    justifyContent: 'space-between' 
  },
  widgetHeader: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    gap: 5 
  },
  widgetLabel: { 
    fontSize: 8, 
    fontWeight: '800', 
    color: '#94A3B8', 
    letterSpacing: 0.5 
  },
  widgetValue: { 
    fontSize: 20, 
    fontWeight: '900', 
    color: '#1E293B',
    marginTop: 2,
  },
  darkText: { color: '#FFFFFF' },
  trendRow: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    gap: 2 
  },
  trendText: { 
    fontSize: 9, 
    fontWeight: '700', 
    color: '#64748B' 
  },
});

export default HolographicWidgets;
