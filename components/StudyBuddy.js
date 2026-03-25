import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, FlatList, Image, Animated, ActivityIndicator, Easing } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors, Shadows } from '../themes/modernTheme';
import { useApp } from '../context/AppContext';

const DEFAULT_BUDDIES = [
  { id: 1, name: 'Alice Smith', level: '300', course: 'CSM395', avatar: 'https://i.pravatar.cc/150?img=1', status: 'Online', matchScore: 98 },
  { id: 2, name: 'Bob Johnson', level: '100', course: 'CSM151', avatar: 'https://i.pravatar.cc/150?img=2', status: 'Away', matchScore: 85 },
  { id: 3, name: 'Charlie Brown', level: '200', course: 'CSM291', avatar: 'https://i.pravatar.cc/150?img=3', status: 'Online', matchScore: 78 },
  { id: 4, name: 'Diana Ross', level: '400', course: 'CSM495', avatar: 'https://i.pravatar.cc/150?img=4', status: 'Online', matchScore: 92 },
  { id: 5, name: 'Emmanuel O.', level: '300', course: 'CSM395', avatar: 'https://i.pravatar.cc/150?img=5', status: 'Offline', matchScore: 95 },
  { id: 6, name: 'Fiona G.', level: '300', course: 'CSM395', avatar: 'https://i.pravatar.cc/150?img=9', status: 'Online', matchScore: 88 },
];

const StudyBuddy = ({ visible, onClose, isDark }) => {
  const { user, csModules } = useApp();
  const [buddies, setBuddies] = useState(DEFAULT_BUDDIES);
  const [isMatching, setIsMatching] = useState(false);
  const [matchSuccess, setMatchSuccess] = useState(null);
  
  // Animations
  const slideAnim = useRef(new Animated.Value(300)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const radarAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      filterBuddies();
      Animated.parallel([
        Animated.spring(slideAnim, { toValue: 0, tension: 50, friction: 8, useNativeDriver: true }),
        Animated.timing(fadeAnim, { toValue: 1, duration: 400, useNativeDriver: true })
      ]).start();
    } else {
      slideAnim.setValue(300);
      fadeAnim.setValue(0);
      setIsMatching(false);
      setMatchSuccess(null);
    }
  }, [visible]);

  useEffect(() => {
    let pulse, radar;
    if (isMatching && !matchSuccess) {
      pulse = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, { toValue: 1.2, duration: 800, useNativeDriver: true, easing: Easing.inOut(Easing.ease) }),
          Animated.timing(pulseAnim, { toValue: 1, duration: 800, useNativeDriver: true, easing: Easing.inOut(Easing.ease) })
        ])
      );
      pulse.start();

      radar = Animated.loop(
        Animated.timing(radarAnim, { toValue: 1, duration: 2000, useNativeDriver: true, easing: Easing.out(Easing.quad) })
      );
      radar.start();
    } else {
      pulseAnim.setValue(1);
      radarAnim.setValue(0);
    }
    return () => {
      pulse?.stop();
      radar?.stop();
    };
  }, [isMatching, matchSuccess]);

  const filterBuddies = () => {
    if (user?.academicLevel) {
      const sorted = [...DEFAULT_BUDDIES].sort((a, b) => {
        // Boost score if same level
        let scoreA = a.level === String(user.academicLevel) ? a.matchScore + 20 : a.matchScore;
        let scoreB = b.level === String(user.academicLevel) ? b.matchScore + 20 : b.matchScore;
        return scoreB - scoreA;
      });
      setBuddies(sorted);
    }
  };

  const handleSmartMatch = () => {
    setIsMatching(true);
    setMatchSuccess(null);
    
    // Simulate AI computing the perfect match
    setTimeout(() => {
      const bestMatch = buddies.find(b => b.status === 'Online') || buddies[0];
      setMatchSuccess(bestMatch);
    }, 3000);
  };

  return (
    <Modal visible={visible} animationType="none" transparent>
      <Animated.View style={[styles.modalOverlay, { opacity: fadeAnim }]}>
        <Animated.View style={[
          styles.modalWrapper, 
          isDark ? styles.darkWrapper : styles.lightWrapper,
          { transform: [{ translateY: slideAnim }] }
        ]}>
          <TouchableOpacity style={styles.closeArea} onPress={onClose} activeOpacity={1} />
          
          <LinearGradient
            colors={isDark ? ['#1E293B', '#0F172A'] : ['#FFFFFF', '#F8FAFC']}
            style={styles.modalContent}
          >
            <View style={styles.handleContainer}>
              <View style={[styles.handle, isDark && styles.handleDark]} />
            </View>

            <View style={styles.header}>
              <View>
                <Text style={[styles.title, isDark && styles.textWhite]}>Study Buddy</Text>
                <Text style={[styles.subtitle, isDark && styles.textSubWhite]}>Find peers studying your courses</Text>
              </View>
              <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
                <Ionicons name="close-circle" size={28} color={isDark ? '#64748B' : '#94A3B8'} />
              </TouchableOpacity>
            </View>

            {isMatching ? (
              <View style={styles.matchingContainer}>
                {matchSuccess ? (
                  <Animated.View style={[styles.successCard, { opacity: fadeAnim, transform: [{ scale: fadeAnim }] }]}>
                    <LinearGradient colors={['#10B981', '#059669']} style={styles.successGradient}>
                      <View style={styles.successIconBadge}>
                        <Ionicons name="checkmark-sharp" size={40} color="#10B981" />
                      </View>
                      <Text style={styles.successTitle}>Match Found!</Text>
                      
                      <View style={styles.matchedUser}>
                        <Image source={{uri: matchSuccess.avatar}} style={styles.matchedAvatar} />
                        <Text style={styles.matchedName}>{matchSuccess.name}</Text>
                        <Text style={styles.matchedInfo}>Level {matchSuccess.level} • {matchSuccess.course}</Text>
                        <View style={styles.matchScoreBadge}>
                          <Text style={styles.matchScoreText}>{matchSuccess.matchScore}% Match</Text>
                        </View>
                      </View>

                      <TouchableOpacity style={styles.chatBtn} onPress={() => {
                        setIsMatching(false);
                        onClose();
                      }}>
                        <Text style={styles.chatBtnText}>Start Chatting</Text>
                      </TouchableOpacity>
                    </LinearGradient>
                  </Animated.View>
                ) : (
                  <View style={styles.radarContainer}>
                    <Animated.View style={[styles.radarRing, { transform: [{scale: radarAnim}], opacity: radarAnim.interpolate({inputRange: [0, 1], outputRange: [1, 0]}) }]} />
                    <Animated.View style={[styles.radarRing, { transform: [{scale: pulseAnim}] }]} >
                      <LinearGradient colors={['#EC4899', '#BE185D']} style={styles.radarCore}>
                        <Ionicons name="search" size={32} color="#FFFFFF" />
                      </LinearGradient>
                    </Animated.View>
                    <Text style={[styles.matchingText, isDark && styles.textWhite]}>AI is analyzing your courses...</Text>
                    <Text style={styles.matchingSub}>Finding the perfect study partner</Text>
                  </View>
                )}
              </View>
            ) : (
              <>
                <View style={[styles.searchBar, isDark && styles.darkSearchBar]}>
                  <Ionicons name="search" size={20} color={isDark ? '#94A3B8' : '#64748B'} />
                  <Text style={[styles.searchPlaceholder, isDark && styles.textSubWhite]}>Search peers or courses...</Text>
                </View>

                <FlatList
                  data={buddies}
                  keyExtractor={item => item.id.toString()}
                  renderItem={({ item }) => (
                    <TouchableOpacity style={[styles.buddyCard, isDark && styles.darkCard]}>
                      <View style={styles.avatarContainer}>
                        <Image source={{ uri: item.avatar }} style={styles.avatar} />
                        <View style={[styles.statusDotOuter, isDark && {borderColor: '#1E293B'}]}>
                          <View style={[styles.statusDot, { backgroundColor: item.status === 'Online' ? '#10B981' : item.status === 'Away' ? '#F59E0B' : '#94A3B8' }]} />
                        </View>
                      </View>
                      
                      <View style={styles.info}>
                        <Text style={[styles.name, isDark && styles.textWhite]}>{item.name}</Text>
                        <View style={{flexDirection: 'row', alignItems: 'center', marginTop: 4}}>
                          <View style={styles.levelBadge}>
                            <Text style={styles.levelText}>Lvl {item.level}</Text>
                          </View>
                          <Text style={styles.subInfo}>{item.course}</Text>
                        </View>
                      </View>
                      
                      <View style={styles.actionBox}>
                        <Text style={[styles.scoreText, { color: item.matchScore > 90 ? '#10B981' : '#6366F1'}]}>{item.matchScore}%</Text>
                        <TouchableOpacity style={[styles.connectBtn, isDark && styles.darkConnectBtn]}>
                          <Ionicons name="chatbubble" size={16} color={isDark ? '#FFFFFF' : '#4F46E5'} />
                        </TouchableOpacity>
                      </View>
                    </TouchableOpacity>
                  )}
                  contentContainerStyle={styles.list}
                  showsVerticalScrollIndicator={false}
                />

                <TouchableOpacity style={styles.matchBtn} onPress={handleSmartMatch}>
                  <LinearGradient colors={['#EC4899', '#BE185D']} style={styles.matchGradient} start={{x: 0, y: 0}} end={{x: 1, y: 1}}>
                    <Ionicons name="sparkles" size={24} color="#FFFFFF" />
                    <View>
                      <Text style={styles.matchBtnText}>AI Smart Match</Text>
                      <Text style={styles.matchBtnSub}>Find your ideal partner instantly</Text>
                    </View>
                  </LinearGradient>
                </TouchableOpacity>
              </>
            )}
          </LinearGradient>
        </Animated.View>
      </Animated.View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalWrapper: { flex: 1, justifyContent: 'flex-end' },
  closeArea: { flex: 1 },
  modalContent: { borderTopLeftRadius: 32, borderTopRightRadius: 32, padding: 24, height: '85%', ...Shadows.lg },
  handleContainer: { alignItems: 'center', marginBottom: 15, marginTop: -10 },
  handle: { width: 40, height: 5, borderRadius: 3, backgroundColor: '#CBD5E1' },
  handleDark: { backgroundColor: '#334155' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 },
  title: { fontSize: 26, fontWeight: '800', color: '#0F172A', letterSpacing: -0.5 },
  subtitle: { fontSize: 14, color: '#64748B', marginTop: 2 },
  closeBtn: { padding: 4 },
  
  searchBar: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F1F5F9', padding: 16, borderRadius: 16, marginBottom: 20, gap: 12 },
  darkSearchBar: { backgroundColor: '#1E293B' },
  searchPlaceholder: { color: '#64748B', fontSize: 16 },
  
  list: { gap: 12, paddingBottom: 20 },
  buddyCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFFFFF', padding: 16, borderRadius: 20, ...Shadows.sm, borderWidth: 1, borderColor: '#F1F5F9' },
  darkCard: { backgroundColor: 'rgba(30,41,59,0.5)', borderColor: '#334155' },
  
  avatarContainer: { position: 'relative' },
  avatar: { width: 52, height: 52, borderRadius: 26 },
  statusDotOuter: { position: 'absolute', bottom: 0, right: 0, backgroundColor: '#FFFFFF', borderRadius: 8, padding: 2 },
  statusDot: { width: 10, height: 10, borderRadius: 5 },
  
  info: { flex: 1, marginLeft: 16 },
  name: { fontSize: 16, fontWeight: '700', color: '#1E293B' },
  levelBadge: { backgroundColor: 'rgba(99, 102, 241, 0.1)', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 6, marginRight: 8 },
  levelText: { fontSize: 12, fontWeight: '700', color: '#6366F1' },
  subInfo: { fontSize: 13, color: '#64748B', fontWeight: '500' },
  
  actionBox: { alignItems: 'flex-end', justifyContent: 'space-between', height: 48 },
  scoreText: { fontSize: 13, fontWeight: '800' },
  connectBtn: { backgroundColor: 'rgba(79, 70, 229, 0.1)', padding: 8, borderRadius: 12 },
  darkConnectBtn: { backgroundColor: 'rgba(255, 255, 255, 0.1)' },
  
  matchBtn: { borderRadius: 20, overflow: 'hidden', marginTop: 10, marginBottom: 20, ...Shadows.md },
  matchGradient: { flexDirection: 'row', alignItems: 'center', padding: 20, gap: 16 },
  matchBtnText: { color: '#FFFFFF', fontSize: 18, fontWeight: '800' },
  matchBtnSub: { color: 'rgba(255,255,255,0.8)', fontSize: 13, marginTop: 2 },
  
  matchingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', marginTop: -40 },
  radarContainer: { alignItems: 'center', justifyContent: 'center' },
  radarRing: { width: 120, height: 120, borderRadius: 60, backgroundColor: 'rgba(236, 72, 153, 0.2)', position: 'absolute', justifyContent: 'center', alignItems: 'center' },
  radarCore: { width: 80, height: 80, borderRadius: 40, justifyContent: 'center', alignItems: 'center', ...Shadows.md },
  matchingText: { fontSize: 18, fontWeight: '700', color: '#1E293B', marginTop: 100 },
  matchingSub: { fontSize: 14, color: '#64748B', marginTop: 8 },

  successCard: { width: '100%', borderRadius: 24, overflow: 'hidden', ...Shadows.lg },
  successGradient: { padding: 30, alignItems: 'center' },
  successIconBadge: { width: 80, height: 80, borderRadius: 40, backgroundColor: '#FFFFFF', justifyContent: 'center', alignItems: 'center', marginBottom: 20, ...Shadows.md },
  successTitle: { fontSize: 24, fontWeight: '800', color: '#FFFFFF', marginBottom: 24 },
  
  matchedUser: { alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.15)', padding: 20, borderRadius: 20, width: '100%' },
  matchedAvatar: { width: 100, height: 100, borderRadius: 50, borderWidth: 4, borderColor: '#FFFFFF', marginBottom: 16 },
  matchedName: { fontSize: 22, fontWeight: '800', color: '#FFFFFF' },
  matchedInfo: { fontSize: 15, color: 'rgba(255,255,255,0.8)', marginTop: 4, marginBottom: 12 },
  matchScoreBadge: { backgroundColor: '#FFFFFF', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 12 },
  matchScoreText: { color: '#10B981', fontWeight: '800', fontSize: 14 },
  
  chatBtn: { backgroundColor: '#FFFFFF', width: '100%', padding: 16, borderRadius: 16, alignItems: 'center', marginTop: 24 },
  chatBtnText: { color: '#10B981', fontSize: 16, fontWeight: '800' },

  textWhite: { color: '#F8FAFC' },
  textSubWhite: { color: '#94A3B8' },
});

export default StudyBuddy;
