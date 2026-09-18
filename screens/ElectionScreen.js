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
  Image,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../components/ThemeProvider';

const { width, height } = Dimensions.get('window');

const CANDIDATES = [
  { id: 'c1', name: 'Nana Ama Boateng', post: 'SRC President', color: '#6366F1', votes: '45%', slogan: 'Integrity & Innovation', image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400' },
  { id: 'c2', name: 'John Doe', post: 'SRC President', color: '#10B981', votes: '30%', slogan: 'Empowering Every Student', image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400' },
  { id: 'c3', name: 'Sarah Mensah', post: 'SRC President', color: '#F59E0B', votes: '25%', slogan: 'Unity in Diversity', image: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400' },
];

export default function ElectionScreen({ navigation }) {
  const { isDark } = useTheme();
  const [hasVoted, setHasVoted] = useState(false);
  const [selectedCandidate, setSelectedCandidate] = useState(null);

  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, { toValue: 1, duration: 600, useNativeDriver: true }).start();
  }, []);

  const castVote = () => {
    if (!selectedCandidate) {
      Alert.alert('Selection Required', 'Please select a candidate to cast your vote.');
      return;
    }
    Alert.alert(
      'Confirm Vote',
      `Are you sure you want to vote for ${selectedCandidate.name}? This action cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Yes, Vote', onPress: () => { setHasVoted(true); Alert.alert('Success', 'Your vote has been securely recorded on the blockchain.'); } }
      ]
    );
  };

  return (
    <SafeAreaView style={[styles.container, isDark && styles.darkContainer]}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color={isDark ? '#FFF' : '#1E293B'} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, isDark && styles.darkText]}>SRC Elections 2024</Text>
        <TouchableOpacity style={styles.headerAction}>
          <Ionicons name="information-circle-outline" size={24} color={isDark ? '#FFF' : '#1E293B'} />
        </TouchableOpacity>
      </View>

      <Animated.View style={{ flex: 1, opacity: fadeAnim }}>
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollBody}>
          
          <View style={[styles.countdownCard, isDark && styles.darkCard]}>
             <LinearGradient colors={['#EF4444', '#B91C1C']} style={styles.countdownGrad}>
                <View style={styles.countdownInfo}>
                   <Text style={styles.countLabel}>Polls Close In</Text>
                   <View style={styles.timerRow}>
                      <View style={styles.timerBox}><Text style={styles.timerVal}>08</Text><Text style={styles.timerUnit}>Hrs</Text></View>
                      <Text style={styles.timerSep}>:</Text>
                      <View style={styles.timerBox}><Text style={styles.timerVal}>45</Text><Text style={styles.timerUnit}>Min</Text></View>
                      <Text style={styles.timerSep}>:</Text>
                      <View style={styles.timerBox}><Text style={styles.timerVal}>22</Text><Text style={styles.timerUnit}>Sec</Text></View>
                   </View>
                </View>
                <Ionicons name="shield-checkmark" size={60} color="rgba(255,255,255,0.2)" />
             </LinearGradient>
          </View>

          <Text style={[styles.sectionTitle, isDark && styles.darkText]}>Presidential Candidates</Text>
          {CANDIDATES.map(cand => (
            <TouchableOpacity 
              key={cand.id} 
              style={[styles.candCard, isDark && styles.darkCard, selectedCandidate?.id === cand.id && { borderColor: cand.color, borderWidth: 2 }]}
              onPress={() => !hasVoted && setSelectedCandidate(cand)}
              disabled={hasVoted}
            >
              <Image source={{ uri: cand.image }} style={styles.candImg} />
              <View style={styles.candInfo}>
                <Text style={[styles.candName, isDark && styles.darkText]}>{cand.name}</Text>
                <Text style={[styles.candSlogan, { color: cand.color }]}>"{cand.slogan}"</Text>
                {hasVoted && (
                  <View style={styles.voteProgContainer}>
                    <View style={[styles.voteProgBar, { width: cand.votes, backgroundColor: cand.color }]} />
                    <Text style={styles.votePercent}>{cand.votes} of total votes</Text>
                  </View>
                )}
              </View>
              {!hasVoted && (
                <View style={[styles.radio, selectedCandidate?.id === cand.id && { backgroundColor: cand.color, borderColor: cand.color }]}>
                  {selectedCandidate?.id === cand.id && <Ionicons name="checkmark" size={14} color="#FFF" />}
                </View>
              )}
            </TouchableOpacity>
          ))}

          <View style={{ height: 100 }} />
        </ScrollView>
      </Animated.View>

      {!hasVoted && (
        <View style={[styles.footer, isDark && styles.darkFooter]}>
           <TouchableOpacity style={[styles.voteBtn, !selectedCandidate && { opacity: 0.6 }]} onPress={castVote} disabled={!selectedCandidate}>
             <LinearGradient colors={['#6366F1', '#4F46E5']} style={styles.voteGrad}>
                <Ionicons name="finger-print" size={24} color="#FFF" />
                <Text style={styles.voteText}>Confirm & Cast Vote</Text>
             </LinearGradient>
           </TouchableOpacity>
        </View>
      )}

    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  darkContainer: { backgroundColor: '#0F172A' },
  darkCard: { backgroundColor: '#1E293B' },
  darkText: { color: '#FFF' },
  darkFooter: { backgroundColor: '#0F172A', borderTopColor: '#334155' },

  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20 },
  backBtn: { width: 44, height: 44, borderRadius: 15, backgroundColor: '#F1F5F9', justifyContent: 'center', alignItems: 'center' },
  headerTitle: { fontSize: 18, fontWeight: '900', color: '#1E293B' },
  headerAction: { width: 44, height: 44, borderRadius: 15, backgroundColor: '#F1F5F9', justifyContent: 'center', alignItems: 'center' },

  scrollBody: { padding: 20 },
  countdownCard: { borderRadius: 30, overflow: 'hidden', elevation: 8, marginBottom: 30 },
  countdownGrad: { padding: 25, flexDirection: 'row', alignItems: 'center' },
  countdownInfo: { flex: 1 },
  countLabel: { fontSize: 13, color: 'rgba(255,255,255,0.7)', fontWeight: '800', textTransform: 'uppercase', marginBottom: 12 },
  timerRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  timerBox: { alignItems: 'center' },
  timerVal: { fontSize: 28, fontWeight: '900', color: '#FFF' },
  timerUnit: { fontSize: 9, color: 'rgba(255,255,255,0.7)', fontWeight: '800' },
  timerSep: { fontSize: 24, fontWeight: '900', color: 'rgba(255,255,255,0.5)', marginTop: -15 },

  sectionTitle: { fontSize: 18, fontWeight: '900', color: '#1E293B', marginBottom: 20 },
  candCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFF', padding: 15, borderRadius: 25, elevation: 2, marginBottom: 15, borderWidth: 2, borderColor: 'transparent' },
  candImg: { width: 70, height: 70, borderRadius: 20 },
  candInfo: { flex: 1, marginLeft: 15 },
  candName: { fontSize: 16, fontWeight: '900', color: '#1E293B' },
  candSlogan: { fontSize: 12, fontWeight: '700', fontStyle: 'italic', marginTop: 4 },
  radio: { width: 24, height: 24, borderRadius: 12, borderWidth: 2, borderColor: '#E2E8F0', justifyContent: 'center', alignItems: 'center' },
  voteProgContainer: { marginTop: 12, gap: 5 },
  voteProgBar: { height: 6, borderRadius: 3 },
  votePercent: { fontSize: 10, color: '#94A3B8', fontWeight: '800' },

  footer: { position: 'absolute', bottom: 0, width: '100%', padding: 25, borderTopWidth: 1, borderTopColor: '#F1F5F9', backgroundColor: '#FFF' },
  voteBtn: { borderRadius: 20, overflow: 'hidden', elevation: 5 },
  voteGrad: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', padding: 18, gap: 12 },
  voteText: { color: '#FFF', fontSize: 16, fontWeight: '900' },
});
