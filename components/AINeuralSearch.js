import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Animated,
  Dimensions,
  Vibration,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';

const { width, height } = Dimensions.get('window');

const AINeuralSearch = ({ visible, onClose, navigation, isDark }) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const slideAnim = useRef(new Animated.Value(-height)).current;
  const inputRef = useRef(null);

  useEffect(() => {
    if (visible) {
      Animated.spring(slideAnim, {
        toValue: 0,
        tension: 50,
        friction: 8,
        useNativeDriver: true,
      }).start();
      setTimeout(() => inputRef.current?.focus(), 500);
    } else {
      Animated.timing(slideAnim, {
        toValue: -height,
        duration: 300,
        useNativeDriver: true,
      }).start();
    }
  }, [visible]);

  const allFeatures = [
    { id: 'attendance', label: 'Take Attendance', sub: 'Lecturer tool', icon: 'qr-code', color: '#6366F1' },
    { id: 'gpa', label: 'GPA Calculator', sub: 'Academic tools', icon: 'calculator', color: '#10B981' },
    { id: 'hallpass', label: 'Smart Hall Pass', sub: 'Digital ID', icon: 'card', color: '#F59E0B' },
    { id: 'map', label: 'Campus AI Map', sub: 'Indoor navigation', icon: 'map', color: '#EF4444' },
    { id: 'notes', label: 'Smart AI Notes', sub: 'Study assistant', icon: 'document-text', color: '#8B5CF6' },
    { id: 'quiz', label: 'AI Quiz Generator', sub: 'Self assessment', icon: 'help-circle', color: '#F472B6' },
    { id: 'profile', label: 'Profile Settings', sub: 'Account management', icon: 'person', color: '#64748B' },
    { id: 'chat', label: 'Messenger', sub: 'Student community', icon: 'chatbubbles', color: '#38BDF8' },
  ];

  const handleSearch = (text) => {
    setQuery(text);
    if (text.length > 1) {
      setSearching(true);
      // Simulate neural fuzzy search
      const filtered = allFeatures.filter(f => 
        f.label.toLowerCase().includes(text.toLowerCase()) || 
        f.sub.toLowerCase().includes(text.toLowerCase())
      );
      setResults(filtered);
    } else {
      setResults([]);
      setSearching(false);
    }
  };

  const navigateToFeature = (feature) => {
    Vibration.vibrate(20);
    onClose();
    // Assuming navigation logic based on ID
    if (feature.id === 'profile') navigation.navigate('Profile');
    else if (feature.id === 'chat') navigation.navigate('MessagingWithCalls');
    else {
      // For modal-based features, the dashboard handles them via state
      // This is a simulation of the "Neural" jump
      Alert.alert('Neural Jump 🧠', `Opening ${feature.label}...`);
    }
  };

  return (
    <Modal visible={visible} transparent animationType="none" onRequestClose={onClose}>
      <BlurView intensity={isDark ? 40 : 80} tint={isDark ? 'dark' : 'light'} style={StyleSheet.absoluteFill}>
        <Animated.View style={[styles.container, { transform: [{ translateY: slideAnim }] }]}>
          <View style={[styles.innerContainer, isDark && styles.darkInner]}>
            <View style={styles.searchHeader}>
              <Ionicons name="sparkles" size={24} color="#6366F1" />
              <TextInput
                ref={inputRef}
                style={[styles.input, isDark && styles.darkText]}
                placeholder="Neural search for features, apps, people..."
                placeholderTextColor={isDark ? '#94A3B8' : '#64748B'}
                value={query}
                onChangeText={handleSearch}
                autoFocus
              />
              <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
                <Ionicons name="close-circle" size={28} color={isDark ? '#FFFFFF' : '#64748B'} />
              </TouchableOpacity>
            </View>

            <ScrollView contentContainerStyle={styles.resultsList}>
              {results.length > 0 ? (
                results.map((item) => (
                  <TouchableOpacity 
                    key={item.id} 
                    style={[styles.resultCard, isDark && styles.darkResultCard]}
                    onPress={() => navigateToFeature(item)}
                  >
                    <View style={[styles.iconBg, { backgroundColor: item.color + '20' }]}>
                      <Ionicons name={item.icon} size={22} color={item.color} />
                    </View>
                    <View style={styles.resultInfo}>
                      <Text style={[styles.resultLabel, isDark && styles.darkText]}>{item.label}</Text>
                      <Text style={styles.resultSub}>{item.sub}</Text>
                    </View>
                    <Ionicons name="chevron-forward" size={18} color="#94A3B8" />
                  </TouchableOpacity>
                ))
              ) : query.length > 1 ? (
                <View style={styles.emptyState}>
                  <Ionicons name="search-outline" size={48} color="#CBD5E1" />
                  <Text style={styles.emptyText}>No matches found for "{query}"</Text>
                </View>
              ) : (
                <View style={styles.suggestions}>
                  <Text style={styles.suggestionTitle}>QUICK COMMANDS</Text>
                  {allFeatures.slice(0, 4).map((item) => (
                    <TouchableOpacity 
                      key={item.id} 
                      style={styles.suggestionChip}
                      onPress={() => navigateToFeature(item)}
                    >
                      <Ionicons name={item.icon} size={16} color="#6366F1" />
                      <Text style={styles.suggestionChipText}>{item.label}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              )}
            </ScrollView>

            <View style={styles.footer}>
              <Text style={styles.footerText}>Neural AI Engine v2.0 • KNUST Smart App</Text>
            </View>
          </View>
        </Animated.View>
      </BlurView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, paddingHorizontal: 15, paddingTop: Platform.OS === 'ios' ? 60 : 40 },
  innerContainer: { 
    backgroundColor: '#FFFFFF', 
    borderRadius: 30, 
    height: height * 0.7, 
    overflow: 'hidden',
    elevation: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
  },
  darkInner: { backgroundColor: '#1E293B' },
  searchHeader: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    padding: 20, 
    borderBottomWidth: 1, 
    borderBottomColor: '#F1F5F9' 
  },
  input: { flex: 1, marginLeft: 15, fontSize: 18, fontWeight: '500', color: '#1E293B' },
  darkText: { color: '#FFFFFF' },
  closeBtn: { marginLeft: 10 },
  resultsList: { padding: 20 },
  resultCard: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    padding: 15, 
    backgroundColor: '#F8FAFC', 
    borderRadius: 20, 
    marginBottom: 10 
  },
  darkResultCard: { backgroundColor: '#334155' },
  iconBg: { width: 44, height: 44, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  resultInfo: { flex: 1, marginLeft: 15 },
  resultLabel: { fontSize: 16, fontWeight: '700', color: '#1E293B' },
  resultSub: { fontSize: 12, color: '#64748B', marginTop: 2 },
  emptyState: { alignItems: 'center', marginTop: 100 },
  emptyText: { color: '#94A3B8', marginTop: 15, fontSize: 16 },
  suggestions: { marginTop: 10 },
  suggestionTitle: { fontSize: 12, fontWeight: '800', color: '#94A3B8', marginBottom: 15, letterSpacing: 1 },
  suggestionChip: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    backgroundColor: '#EEF2FF', 
    paddingHorizontal: 20, 
    paddingVertical: 12, 
    borderRadius: 15, 
    marginBottom: 10 
  },
  suggestionChipText: { marginLeft: 10, color: '#6366F1', fontWeight: '700' },
  footer: { padding: 15, alignItems: 'center', backgroundColor: '#F8FAFC' },
  footerText: { fontSize: 10, color: '#94A3B8', fontWeight: '600' },
});

export default AINeuralSearch;
