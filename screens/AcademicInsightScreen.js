import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  Animated,
  StatusBar,
  TextInput,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../components/ThemeProvider';

const { width, height } = Dimensions.get('window');

export default function AcademicInsightScreen({ navigation }) {
  const { isDark } = useTheme();
  const [currentGPA, setCurrentGPA] = useState('3.8');
  const [targetGPA, setTargetGPA] = useState('3.9');
  const [predictedGPA, setPredictedGPA] = useState(3.85);

  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, { toValue: 1, duration: 600, useNativeDriver: true }).start();
  }, []);

  const calculatePredictor = () => {
    // Simple simulation logic
    const curr = parseFloat(currentGPA) || 0;
    const targ = parseFloat(targetGPA) || 0;
    const pred = (curr + targ) / 2;
    setPredictedGPA(pred.toFixed(2));
    Alert.alert('Analysis Complete', `Based on your target, your predicted semester GPA is ${pred.toFixed(2)}. Consistent effort needed!`);
  };

  return (
    <SafeAreaView style={[styles.container, isDark && styles.darkContainer]}>
      <StatusBar barStyle="light-content" />
      
      {/* Header */}
      <LinearGradient colors={['#4F46E5', '#3730A3']} style={styles.header}>
        <View style={styles.headerRow}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={24} color="#FFF" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Academic Insight</Text>
          <TouchableOpacity style={styles.headerAction}>
            <Ionicons name="share-social" size={24} color="#FFF" />
          </TouchableOpacity>
        </View>

        <View style={styles.chartContainer}>
           <View style={styles.mainGpaCircle}>
              <Text style={styles.gpaValue}>{predictedGPA}</Text>
              <Text style={styles.gpaLabel}>Predicted CWA</Text>
           </View>
           <View style={styles.insightStats}>
              <View style={styles.statBox}>
                <Text style={styles.statVal}>85%</Text>
                <Text style={styles.statLbl}>Efficiency</Text>
              </View>
              <View style={styles.statBox}>
                <Text style={styles.statVal}>Top 5%</Text>
                <Text style={styles.statLbl}>Ranking</Text>
              </View>
           </View>
        </View>
      </LinearGradient>

      <Animated.View style={{ flex: 1, opacity: fadeAnim }}>
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollBody}>
          
          <View style={[styles.toolCard, isDark && styles.darkCard]}>
            <Text style={[styles.toolTitle, isDark && styles.darkText]}>GPA Goal Predictor</Text>
            <Text style={styles.toolSub}>Simulate your final grade based on projected module scores.</Text>
            
            <View style={styles.inputGroup}>
              <View style={styles.inputBox}>
                <Text style={styles.inputLabel}>Current GPA</Text>
                <TextInput 
                  style={[styles.input, isDark && styles.darkInput]} 
                  value={currentGPA} 
                  onChangeText={setCurrentGPA}
                  keyboardType="numeric"
                />
              </View>
              <View style={styles.inputBox}>
                <Text style={styles.inputLabel}>Target GPA</Text>
                <TextInput 
                  style={[styles.input, isDark && styles.darkInput]} 
                  value={targetGPA} 
                  onChangeText={setTargetGPA}
                  keyboardType="numeric"
                />
              </View>
            </View>

            <TouchableOpacity style={styles.calcBtn} onPress={calculatePredictor}>
               <Text style={styles.calcText}>Run AI Analysis</Text>
               <Ionicons name="flash" size={18} color="#FFF" />
            </TouchableOpacity>
          </View>

          <Text style={[styles.sectionTitle, isDark && styles.darkText]}>Module Insights</Text>
          <View style={styles.moduleList}>
            {[
              { name: 'Data Structures', grade: 'A', trend: 'up' },
              { name: 'Discrete Math', grade: 'B+', trend: 'steady' },
              { name: 'OS Design', grade: 'A', trend: 'up' },
            ].map((mod, i) => (
              <View key={i} style={[styles.modItem, isDark && styles.darkCard]}>
                <Text style={[styles.modName, isDark && styles.darkText]}>{mod.name}</Text>
                <View style={styles.modMeta}>
                  <View style={styles.gradeBadge}>
                    <Text style={styles.gradeText}>{mod.grade}</Text>
                  </View>
                  <Ionicons 
                    name={mod.trend === 'up' ? 'trending-up' : 'remove'} 
                    size={20} 
                    color={mod.trend === 'up' ? '#10B981' : '#94A3B8'} 
                  />
                </View>
              </View>
            ))}
          </View>

          <View style={{ height: 100 }} />
        </ScrollView>
      </Animated.View>

    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  darkContainer: { backgroundColor: '#0F172A' },
  darkCard: { backgroundColor: '#1E293B' },
  darkText: { color: '#FFF' },
  darkInput: { backgroundColor: '#0F172A', color: '#FFF', borderColor: '#334155' },

  header: { padding: 25, paddingBottom: 50, borderBottomLeftRadius: 40, borderBottomRightRadius: 40 },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 30 },
  backBtn: { width: 44, height: 44, borderRadius: 15, backgroundColor: 'rgba(255,255,255,0.1)', justifyContent: 'center', alignItems: 'center' },
  headerTitle: { fontSize: 20, fontWeight: '900', color: '#FFF' },
  headerAction: { width: 44, height: 44, borderRadius: 15, backgroundColor: 'rgba(255,255,255,0.1)', justifyContent: 'center', alignItems: 'center' },

  chartContainer: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-around' },
  mainGpaCircle: { width: 140, height: 140, borderRadius: 70, backgroundColor: 'rgba(255,255,255,0.15)', justifyContent: 'center', alignItems: 'center', borderWidth: 4, borderColor: '#FFF' },
  gpaValue: { fontSize: 38, fontWeight: '900', color: '#FFF' },
  gpaLabel: { fontSize: 11, color: 'rgba(255,255,255,0.7)', fontWeight: '700', marginTop: 4 },
  insightStats: { gap: 20 },
  statBox: { alignItems: 'flex-start' },
  statVal: { fontSize: 18, fontWeight: '900', color: '#FFF' },
  statLbl: { fontSize: 11, color: 'rgba(255,255,255,0.6)', fontWeight: '700' },

  scrollBody: { padding: 25 },
  toolCard: { backgroundColor: '#FFF', padding: 25, borderRadius: 30, elevation: 5, marginTop: -30 },
  toolTitle: { fontSize: 18, fontWeight: '900', color: '#1E293B' },
  toolSub: { fontSize: 13, color: '#94A3B8', marginTop: 5, marginBottom: 25 },
  inputGroup: { flexDirection: 'row', gap: 15, marginBottom: 20 },
  inputBox: { flex: 1 },
  inputLabel: { fontSize: 12, fontWeight: '800', color: '#64748B', marginBottom: 8, textTransform: 'uppercase' },
  input: { backgroundColor: '#F8FAFC', padding: 15, borderRadius: 15, borderWidth: 1, borderColor: '#E2E8F0', fontSize: 16, fontWeight: '800', color: '#1E293B' },
  calcBtn: { backgroundColor: '#4F46E5', padding: 18, borderRadius: 20, alignItems: 'center', flexDirection: 'row', justifyContent: 'center', gap: 12, elevation: 4 },
  calcText: { color: '#FFF', fontSize: 16, fontWeight: '900' },

  sectionTitle: { fontSize: 18, fontWeight: '900', color: '#1E293B', marginTop: 30, marginBottom: 15 },
  moduleList: { gap: 12 },
  modItem: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#FFF', padding: 20, borderRadius: 20, elevation: 1 },
  modName: { fontSize: 15, fontWeight: '800', color: '#1E293B' },
  modMeta: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  gradeBadge: { backgroundColor: '#EEF2FF', paddingHorizontal: 10, paddingVertical: 5, borderRadius: 8 },
  gradeText: { color: '#6366F1', fontWeight: '900', fontSize: 14 },
});
