import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Dimensions,
  Alert,
  Vibration,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { PomodoroTimer, QuickNotes, StudyGroups } from './StudyTools';
import { StudyStatus, StudyStories, Leaderboard, StudyBuddyFinder } from './SocialFeatures';

const { width } = Dimensions.get('window');

export const FloatingMenu = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [activeModal, setActiveModal] = useState(null);
  
  const rotateAnim = useRef(new Animated.Value(0)).current;
  const scaleAnims = useRef([
    new Animated.Value(0),
    new Animated.Value(0),
    new Animated.Value(0),
    new Animated.Value(0),
    new Animated.Value(0),
    new Animated.Value(0),
  ]).current;

  const menuItems = [
    { id: 'pomodoro', icon: 'timer', label: 'Pomodoro', color: '#EF4444' },
    { id: 'notes', icon: 'document-text', label: 'Quick Notes', color: '#F59E0B' },
    { id: 'groups', icon: 'people', label: 'Study Groups', color: '#10B981' },
    { id: 'status', icon: 'radio', label: 'Study Status', color: '#6366F1' },
    { id: 'stories', icon: 'book', label: 'Study Stories', color: '#8B5CF6' },
    { id: 'leaderboard', icon: 'trophy', label: 'Leaderboard', color: '#EC4899' },
  ];

  const toggleMenu = () => {
    const toValue = isOpen ? 0 : 1;
    setIsOpen(!isOpen);
    Vibration.vibrate(50);

    Animated.parallel([
      Animated.timing(rotateAnim, {
        toValue,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.stagger(50, 
        scaleAnims.map(anim => 
          Animated.spring(anim, {
            toValue,
            tension: 100,
            friction: 8,
            useNativeDriver: true,
          })
        )
      ),
    ]).start();
  };

  const handleMenuItemPress = (itemId) => {
    setActiveModal(itemId);
    toggleMenu();
    Vibration.vibrate(30);
  };

  const closeModal = () => {
    setActiveModal(null);
  };

  const rotation = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '45deg'],
  });

  const getMenuItemPosition = (index) => {
    const angle = (index * 60) - 90; // Spread items in an arc
    const radius = 80;
    const x = Math.cos(angle * Math.PI / 180) * radius;
    const y = Math.sin(angle * Math.PI / 180) * radius;
    return { x, y };
  };

  return (
    <>
      <View style={styles.container}>
        {/* Menu Items */}
        {menuItems.map((item, index) => {
          const position = getMenuItemPosition(index);
          return (
            <Animated.View
              key={item.id}
              style={[
                styles.menuItem,
                {
                  transform: [
                    { scale: scaleAnims[index] },
                    {
                      translateX: scaleAnims[index].interpolate({
                        inputRange: [0, 1],
                        outputRange: [0, position.x],
                      }),
                    },
                    {
                      translateY: scaleAnims[index].interpolate({
                        inputRange: [0, 1],
                        outputRange: [0, position.y],
                      }),
                    },
                  ],
                },
              ]}
            >
              <TouchableOpacity
                style={[styles.menuButton, { backgroundColor: item.color }]}
                onPress={() => handleMenuItemPress(item.id)}
                activeOpacity={0.8}
              >
                <Ionicons name={item.icon} size={20} color="#FFFFFF" />
              </TouchableOpacity>
              
              {isOpen && (
                <Text style={styles.menuLabel}>{item.label}</Text>
              )}
            </Animated.View>
          );
        })}

        {/* Main FAB */}
        <TouchableOpacity
          style={styles.fab}
          onPress={toggleMenu}
          activeOpacity={0.8}
        >
          <LinearGradient
            colors={['#6366F1', '#8B5CF6']}
            style={styles.fabGradient}
          >
            <Animated.View style={{ transform: [{ rotate: rotation }] }}>
              <Ionicons name="add" size={28} color="#FFFFFF" />
            </Animated.View>
          </LinearGradient>
        </TouchableOpacity>
      </View>

      {/* Modals */}
      <PomodoroTimer 
        visible={activeModal === 'pomodoro'} 
        onClose={closeModal} 
      />
      
      <QuickNotes 
        visible={activeModal === 'notes'} 
        onClose={closeModal} 
      />
      
      <StudyGroups 
        visible={activeModal === 'groups'} 
        onClose={closeModal} 
      />
      
      <StudyStatus 
        visible={activeModal === 'status'} 
        onClose={closeModal} 
      />
      
      <StudyStories 
        visible={activeModal === 'stories'} 
        onClose={closeModal} 
      />
      
      <Leaderboard 
        visible={activeModal === 'leaderboard'} 
        onClose={closeModal} 
      />
    </>
  );
};

// Quick Access Toolbar (for top of screen)
export const QuickAccessToolbar = () => {
  const [activeModal, setActiveModal] = useState(null);

  const quickActions = [
    { id: 'pomodoro', icon: 'timer', color: '#EF4444' },
    { id: 'notes', icon: 'document-text', color: '#F59E0B' },
    { id: 'status', icon: 'radio', color: '#6366F1' },
    { id: 'leaderboard', icon: 'trophy', color: '#EC4899' },
  ];

  const handleActionPress = (actionId) => {
    setActiveModal(actionId);
    Vibration.vibrate(30);
  };

  return (
    <>
      <View style={styles.toolbar}>
        {quickActions.map((action) => (
          <TouchableOpacity
            key={action.id}
            style={[styles.toolbarButton, { backgroundColor: `${action.color}20` }]}
            onPress={() => handleActionPress(action.id)}
            activeOpacity={0.7}
          >
            <Ionicons name={action.icon} size={20} color={action.color} />
          </TouchableOpacity>
        ))}
      </View>

      {/* Modals */}
      <PomodoroTimer 
        visible={activeModal === 'pomodoro'} 
        onClose={() => setActiveModal(null)} 
      />
      
      <QuickNotes 
        visible={activeModal === 'notes'} 
        onClose={() => setActiveModal(null)} 
      />
      
      <StudyStatus 
        visible={activeModal === 'status'} 
        onClose={() => setActiveModal(null)} 
      />
      
      <Leaderboard 
        visible={activeModal === 'leaderboard'} 
        onClose={() => setActiveModal(null)} 
      />
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 30,
    right: 20,
    width: 200,
    height: 200,
    justifyContent: 'center',
    alignItems: 'center',
  },
  fab: {
    position: 'absolute',
    width: 64,
    height: 64,
    borderRadius: 32,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 15,
    elevation: 8,
  },
  fabGradient: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  menuItem: {
    position: 'absolute',
    alignItems: 'center',
  },
  menuButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 6,
  },
  menuLabel: {
    marginTop: 4,
    fontSize: 10,
    fontWeight: '600',
    color: '#1E293B',
    textAlign: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
  },
  
  // Toolbar Styles
  toolbar: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 20,
    padding: 8,
    marginHorizontal: 20,
    marginTop: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    gap: 8,
  },
  toolbarButton: {
    flex: 1,
    height: 40,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
