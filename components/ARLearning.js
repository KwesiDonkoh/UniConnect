import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Animated,
  Dimensions,
  Alert,
  Modal,
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

const { width, height } = Dimensions.get('window');

export default function ARLearning({ visible, onClose, user }) {
  const [arExperiences, setArExperiences] = useState([]);
  const [currentExperience, setCurrentExperience] = useState(null);
  const [isScanning, setIsScanning] = useState(false);
  const [scanProgress, setScanProgress] = useState(0);
  
  const slideAnim = useRef(new Animated.Value(height)).current;
  const scanAnim = useRef(new Animated.Value(0)).current;

  const arCategories = [
    {
      id: 'anatomy',
      name: 'Human Anatomy',
      icon: 'body',
      color: '#EF4444',
      description: '3D models of human body systems',
      experiences: [
        { id: 1, name: 'Skeletal System', difficulty: 'Beginner', duration: '15 min' },
        { id: 2, name: 'Muscular System', difficulty: 'Intermediate', duration: '20 min' },
        { id: 3, name: 'Nervous System', difficulty: 'Advanced', duration: '25 min' },
      ]
    },
    {
      id: 'chemistry',
      name: 'Chemistry Lab',
      icon: 'flask',
      color: '#8B5CF6',
      description: 'Interactive molecular structures',
      experiences: [
        { id: 4, name: 'Molecular Bonds', difficulty: 'Beginner', duration: '10 min' },
        { id: 5, name: 'Chemical Reactions', difficulty: 'Intermediate', duration: '15 min' },
        { id: 6, name: 'Crystal Structures', difficulty: 'Advanced', duration: '20 min' },
      ]
    },
    {
      id: 'physics',
      name: 'Physics Simulations',
      icon: 'flash',
      color: '#F59E0B',
      description: 'Real-time physics experiments',
      experiences: [
        { id: 7, name: 'Gravity & Motion', difficulty: 'Beginner', duration: '12 min' },
        { id: 8, name: 'Wave Properties', difficulty: 'Intermediate', duration: '18 min' },
        { id: 9, name: 'Quantum Physics', difficulty: 'Advanced', duration: '30 min' },
      ]
    },
    {
      id: 'mathematics',
      name: 'Math Visualization',
      icon: 'calculator',
      color: '#10B981',
      description: '3D geometric shapes and functions',
      experiences: [
        { id: 10, name: '3D Geometry', difficulty: 'Beginner', duration: '15 min' },
        { id: 11, name: 'Function Graphs', difficulty: 'Intermediate', duration: '20 min' },
        { id: 12, name: 'Calculus Concepts', difficulty: 'Advanced', duration: '25 min' },
      ]
    },
    {
      id: 'history',
      name: 'Historical Sites',
      icon: 'business',
      color: '#06B6D4',
      description: 'Virtual tours of ancient places',
      experiences: [
        { id: 13, name: 'Ancient Rome', difficulty: 'Beginner', duration: '20 min' },
        { id: 14, name: 'Egyptian Pyramids', difficulty: 'Intermediate', duration: '25 min' },
        { id: 15, name: 'Medieval Castles', difficulty: 'Advanced', duration: '30 min' },
      ]
    },
    {
      id: 'geography',
      name: 'Earth & Space',
      icon: 'earth',
      color: '#84CC16',
      description: 'Explore planets and landscapes',
      experiences: [
        { id: 16, name: 'Solar System', difficulty: 'Beginner', duration: '18 min' },
        { id: 17, name: 'Ocean Depths', difficulty: 'Intermediate', duration: '22 min' },
        { id: 18, name: 'Galaxy Exploration', difficulty: 'Advanced', duration: '35 min' },
      ]
    }
  ];

  useEffect(() => {
    if (visible) {
      Animated.spring(slideAnim, {
        toValue: 0,
        tension: 50,
        friction: 8,
        useNativeDriver: true,
      }).start();
    } else {
      Animated.timing(slideAnim, {
        toValue: height,
        duration: 300,
        useNativeDriver: true,
      }).start();
    }
  }, [visible]);

  useEffect(() => {
    if (isScanning) {
      const interval = setInterval(() => {
        setScanProgress(prev => {
          if (prev >= 100) {
            setIsScanning(false);
            setScanProgress(0);
            Alert.alert('AR Experience Ready!', 'Your augmented reality learning experience is now available.');
            return 0;
          }
          return prev + 10;
        });
      }, 200);

      return () => clearInterval(interval);
    }
  }, [isScanning]);

  const startARExperience = (experience) => {
    setCurrentExperience(experience);
    setIsScanning(true);
    setScanProgress(0);
    
    // Simulate AR scanning
    Animated.loop(
      Animated.sequence([
        Animated.timing(scanAnim, { toValue: 1, duration: 1000, useNativeDriver: true }),
        Animated.timing(scanAnim, { toValue: 0, duration: 1000, useNativeDriver: true }),
      ])
    ).start();
  };

  const renderExperience = (experience) => (
    <TouchableOpacity
      key={experience.id}
      style={styles.experienceCard}
      onPress={() => startARExperience(experience)}
    >
      <LinearGradient
        colors={['#F8FAFC', '#E2E8F0']}
        style={styles.experienceGradient}
      >
        <View style={styles.experienceHeader}>
          <Text style={styles.experienceName}>{experience.name}</Text>
          <View style={styles.experienceBadge}>
            <Text style={styles.experienceDifficulty}>{experience.difficulty}</Text>
          </View>
        </View>
        
        <View style={styles.experienceFooter}>
          <View style={styles.experienceInfo}>
            <Ionicons name="time" size={14} color="#64748B" />
            <Text style={styles.experienceDuration}>{experience.duration}</Text>
          </View>
          
          <TouchableOpacity style={styles.startButton}>
            <Ionicons name="play" size={16} color="#10B981" />
            <Text style={styles.startButtonText}>Start</Text>
          </TouchableOpacity>
        </View>
      </LinearGradient>
    </TouchableOpacity>
  );

  const renderCategory = (category) => (
    <View key={category.id} style={styles.categorySection}>
      <View style={styles.categoryHeader}>
        <View style={styles.categoryIcon}>
          <Ionicons name={category.icon} size={24} color={category.color} />
        </View>
        <View style={styles.categoryInfo}>
          <Text style={styles.categoryName}>{category.name}</Text>
          <Text style={styles.categoryDescription}>{category.description}</Text>
        </View>
      </View>
      
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.experiencesContainer}>
        {category.experiences.map(renderExperience)}
      </ScrollView>
    </View>
  );

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="none"
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <TouchableOpacity style={styles.backdrop} onPress={onClose} />
        <Animated.View
          style={[
            styles.modalContent,
            {
              transform: [{ translateY: slideAnim }],
            },
          ]}
        >
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.headerTitle}>AR Learning</Text>
            <View style={styles.headerActions}>
              <TouchableOpacity style={styles.closeButton} onPress={onClose}>
                <Ionicons name="close" size={24} color="#64748B" />
              </TouchableOpacity>
            </View>
          </View>

          {isScanning ? (
            /* AR Scanning */
            <View style={styles.scanningSection}>
              <View style={styles.scanningContent}>
                <Animated.View
                  style={[
                    styles.scanCircle,
                    {
                      opacity: scanAnim,
                      transform: [{ scale: scanAnim.interpolate({
                        inputRange: [0, 1],
                        outputRange: [0.8, 1.2]
                      })}]
                    }
                  ]}
                >
                  <Ionicons name="scan" size={48} color="#10B981" />
                </Animated.View>
                
                <Text style={styles.scanningTitle}>Scanning Environment</Text>
                <Text style={styles.scanningSubtitle}>
                  Preparing your AR experience...
                </Text>
                
                <View style={styles.progressContainer}>
                  <View style={styles.progressBar}>
                    <View style={[styles.progressFill, { width: `${scanProgress}%` }]} />
                  </View>
                  <Text style={styles.progressText}>{scanProgress}%</Text>
                </View>
                
                <TouchableOpacity
                  style={styles.cancelScanButton}
                  onPress={() => {
                    setIsScanning(false);
                    setScanProgress(0);
                  }}
                >
                  <Text style={styles.cancelScanText}>Cancel</Text>
                </TouchableOpacity>
              </View>
            </View>
          ) : currentExperience ? (
            /* AR Experience View */
            <View style={styles.experienceViewSection}>
              <View style={styles.experienceViewHeader}>
                <TouchableOpacity
                  style={styles.backButton}
                  onPress={() => setCurrentExperience(null)}
                >
                  <Ionicons name="arrow-back" size={20} color="#64748B" />
                  <Text style={styles.backButtonText}>Back to Categories</Text>
                </TouchableOpacity>
                
                <Text style={styles.currentExperienceTitle}>{currentExperience.name}</Text>
              </View>
              
              <View style={styles.arCanvasContainer}>
                <View style={styles.arCanvas}>
                  <Ionicons name="cube" size={64} color="#94A3B8" />
                  <Text style={styles.arCanvasText}>AR Experience Active</Text>
                  <Text style={styles.arCanvasSubtext}>
                    Point your camera at the target area to begin
                  </Text>
                  
                  <View style={styles.arControls}>
                    <TouchableOpacity style={styles.arControlButton}>
                      <Ionicons name="camera" size={20} color="#4F46E5" />
                      <Text style={styles.arControlText}>Capture</Text>
                    </TouchableOpacity>
                    
                    <TouchableOpacity style={styles.arControlButton}>
                      <Ionicons name="information-circle" size={20} color="#F59E0B" />
                      <Text style={styles.arControlText}>Info</Text>
                    </TouchableOpacity>
                    
                    <TouchableOpacity style={styles.arControlButton}>
                      <Ionicons name="share" size={20} color="#10B981" />
                      <Text style={styles.arControlText}>Share</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            </View>
          ) : (
            /* AR Categories */
            <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
              <View style={styles.introSection}>
                <Text style={styles.introTitle}>Explore Learning in 3D</Text>
                <Text style={styles.introSubtitle}>
                  Use augmented reality to visualize complex concepts and make learning interactive
                </Text>
              </View>
              
              {arCategories.map(renderCategory)}
            </ScrollView>
          )}
        </Animated.View>
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
  backdrop: {
    flex: 1,
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: height * 0.9,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1E293B',
  },
  closeButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: '#F1F5F9',
  },
  content: {
    flex: 1,
  },
  introSection: {
    padding: 20,
    backgroundColor: '#F8FAFC',
    margin: 20,
    borderRadius: 16,
    alignItems: 'center',
  },
  introTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1E293B',
    marginBottom: 8,
    textAlign: 'center',
  },
  introSubtitle: {
    fontSize: 14,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 20,
  },
  categorySection: {
    marginBottom: 24,
    paddingHorizontal: 20,
  },
  categoryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  categoryIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#F8FAFC',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  categoryInfo: {
    flex: 1,
  },
  categoryName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1E293B',
    marginBottom: 4,
  },
  categoryDescription: {
    fontSize: 14,
    color: '#64748B',
    lineHeight: 20,
  },
  experiencesContainer: {
    flexDirection: 'row',
  },
  experienceCard: {
    width: 200,
    marginRight: 16,
    borderRadius: 16,
    overflow: 'hidden',
  },
  experienceGradient: {
    padding: 16,
    minHeight: 120,
  },
  experienceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  experienceName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1E293B',
    flex: 1,
    marginRight: 8,
  },
  experienceBadge: {
    backgroundColor: '#EEF2FF',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  experienceDifficulty: {
    fontSize: 10,
    color: '#4F46E5',
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  experienceFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  experienceInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  experienceDuration: {
    fontSize: 12,
    color: '#64748B',
  },
  startButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  startButtonText: {
    fontSize: 12,
    color: '#10B981',
    fontWeight: '600',
  },
  scanningSection: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  scanningContent: {
    alignItems: 'center',
  },
  scanCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#F0FDF4',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  scanningTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1E293B',
    marginBottom: 8,
    textAlign: 'center',
  },
  scanningSubtitle: {
    fontSize: 16,
    color: '#64748B',
    textAlign: 'center',
    marginBottom: 24,
  },
  progressContainer: {
    width: '100%',
    marginBottom: 24,
  },
  progressBar: {
    height: 8,
    backgroundColor: '#E2E8F0',
    borderRadius: 4,
    marginBottom: 8,
  },
  progressFill: {
    height: 8,
    backgroundColor: '#10B981',
    borderRadius: 4,
  },
  progressText: {
    fontSize: 14,
    color: '#64748B',
    textAlign: 'center',
  },
  cancelScanButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 20,
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: '#FECACA',
  },
  cancelScanText: {
    color: '#DC2626',
    fontSize: 14,
    fontWeight: '600',
  },
  experienceViewSection: {
    flex: 1,
  },
  experienceViewHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,
    gap: 6,
  },
  backButtonText: {
    color: '#64748B',
    fontSize: 14,
    fontWeight: '500',
  },
  currentExperienceTitle: {
    flex: 1,
    fontSize: 18,
    fontWeight: '600',
    color: '#1E293B',
  },
  arCanvasContainer: {
    flex: 1,
    backgroundColor: '#000000',
    justifyContent: 'center',
    alignItems: 'center',
  },
  arCanvas: {
    alignItems: 'center',
    padding: 40,
  },
  arCanvasText: {
    fontSize: 24,
    fontWeight: '700',
    color: '#FFFFFF',
    marginTop: 16,
    marginBottom: 8,
    textAlign: 'center',
  },
  arCanvasSubtext: {
    fontSize: 16,
    color: '#94A3B8',
    textAlign: 'center',
    marginBottom: 32,
  },
  arControls: {
    flexDirection: 'row',
    gap: 16,
  },
  arControlButton: {
    alignItems: 'center',
    padding: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 16,
    minWidth: 80,
  },
  arControlText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '500',
    marginTop: 8,
  },
});
