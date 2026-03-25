import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, Easing, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

const { width } = Dimensions.get('window');

const FEATURES = [
  { id: 1, title: 'KNUST SIS Sync', icon: 'sync-circle-outline', colors: ['#6366F1', '#8B5CF6'] },
  { id: 2, title: 'AI Study Tutors', icon: 'sparkles-outline', colors: ['#10B981', '#34D399'] },
  { id: 3, title: 'Course Analytics', icon: 'stats-chart-outline', colors: ['#F59E0B', '#FBBF24'] },
  { id: 4, title: 'Smart Hall Pass', icon: 'key-outline', colors: ['#EC4899', '#F472B6'] },
  { id: 5, title: 'Academic Compass', icon: 'compass-outline', colors: ['#0EA5E9', '#38BDF8'] },
  { id: 6, title: 'Peer Collaboration', icon: 'people-outline', colors: ['#8B5CF6', '#D946EF'] },
];

// Duplicate features to create an infinite scroll effect
const SCROLL_DATA = [...FEATURES, ...FEATURES, ...FEATURES];
const ITEM_WIDTH = 180;

export default function AuthFeatureShowcase({ isDark }) {
  const scrollAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Continuous scrolling animation
    Animated.loop(
      Animated.timing(scrollAnim, {
        toValue: -1 * (FEATURES.length * ITEM_WIDTH),
        duration: 25000,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    ).start();
  }, []);

  return (
    <View style={styles.container}>
      <Text style={[styles.title, isDark && { color: 'rgba(255,255,255,0.6)' }]}>
        Experience the Future of KNUST
      </Text>
      <View style={styles.carouselContainer}>
        <Animated.View style={[styles.scrollRow, { transform: [{ translateX: scrollAnim }] }]}>
          {SCROLL_DATA.map((item, index) => (
            <View key={`${item.id}-${index}`} style={[styles.featureCard, isDark && styles.featureCardDark]}>
              <LinearGradient 
                colors={item.colors} 
                start={{x: 0, y: 0}} 
                end={{x: 1, y: 1}} 
                style={styles.iconWrap}
              >
                <Ionicons name={item.icon} size={20} color="#FFF" />
              </LinearGradient>
              <View style={styles.textContainer}>
                <Text style={[styles.featureTitle, isDark && { color: '#FFF' }]}>{item.title}</Text>
                <View style={styles.activePill}>
                  <View style={styles.activeDot} />
                  <Text style={styles.activeText}>NEXT-GEN</Text>
                </View>
              </View>
            </View>
          ))}
        </Animated.View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingVertical: 20,
    marginBottom: 24,
    width: '100%',
  },
  title: {
    fontSize: 11,
    fontWeight: '900',
    color: '#64748B',
    textAlign: 'center',
    marginBottom: 16,
    textTransform: 'uppercase',
    letterSpacing: 2,
  },
  carouselContainer: {
    overflow: 'hidden',
    height: 70,
  },
  scrollRow: {
    flexDirection: 'row',
    alignItems: 'center',
    width: FEATURES.length * ITEM_WIDTH * 3,
  },
  featureCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.7)',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 18,
    marginHorizontal: 8,
    width: ITEM_WIDTH - 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 3,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.5)',
  },
  featureCardDark: {
    backgroundColor: 'rgba(30,41,59,0.4)',
    borderColor: 'rgba(255,255,255,0.1)',
  },
  iconWrap: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  textContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  featureTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: '#1E293B',
    letterSpacing: -0.3,
  },
  activePill: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
  },
  activeDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#10B981',
    marginRight: 4,
  },
  activeText: {
    fontSize: 8,
    fontWeight: '900',
    color: '#10B981',
    letterSpacing: 0.5,
  },
});
