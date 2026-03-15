import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  ScrollView,
  TextInput,
  Dimensions,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

const { width, height } = Dimensions.get('window');

export const AIPatentNavigator = ({ visible, onClose, lecturerName }) => {
  const [query, setQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [results, setResults] = useState([]);

  const searchPatents = () => {
    if (!query.trim()) return;
    setIsSearching(true);
    // Simulate AI Patent search
    setTimeout(() => {
      setResults([
        { id: '1', title: 'Neural Network Adaptive Learning', patentNo: 'US-2024-00123', match: '98% AI Match', description: 'Method for optimizing student learning paths using recursive neural networks.' },
        { id: '2', title: 'Blockchain Academic Verification', patentNo: 'EP-2023-44561', match: '92% AI Match', description: 'Decentralized system for verifying and storing academic credentials securely.' },
        { id: '3', title: 'VR Interactive Lecture System', patentNo: 'JP-2024-77812', match: '85% AI Match', description: 'Immersive virtual reality environment for real-time collaborative lecturing.' },
      ]);
      setIsSearching(false);
    }, 1500);
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.content}>
          <LinearGradient
            colors={['#4F46E5', '#7C3AED']}
            style={styles.header}
          >
            <View style={styles.headerTop}>
              <Text style={styles.title}>AI Patent Navigator</Text>
              <TouchableOpacity onPress={onClose}>
                <Ionicons name="close-circle" size={28} color="#FFFFFF" />
              </TouchableOpacity>
            </View>
            <Text style={styles.subtitle}>Navigate world research & patents at your fingertips</Text>
            
            <View style={styles.searchContainer}>
              <TextInput
                style={styles.input}
                placeholder="Search research, patents, journals..."
                placeholderTextColor="rgba(255,255,255,0.6)"
                value={query}
                onChangeText={setQuery}
              />
              <TouchableOpacity style={styles.searchBtn} onPress={searchPatents}>
                <Ionicons name="search" size={20} color="#4F46E5" />
              </TouchableOpacity>
            </View>
          </LinearGradient>

          <ScrollView style={styles.resultsList} showsVerticalScrollIndicator={false}>
            {isSearching ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#4F46E5" />
                <Text style={styles.loadingText}>AI is scanning global patent databases...</Text>
              </View>
            ) : results.length > 0 ? (
              results.map((item) => (
                <View key={item.id} style={styles.patentCard}>
                  <View style={styles.patentBadge}>
                    <Text style={styles.patentBadgeText}>{item.match}</Text>
                  </View>
                  <Text style={styles.patentTitle}>{item.title}</Text>
                  <Text style={styles.patentNo}>{item.patentNo}</Text>
                  <Text style={styles.patentDesc}>{item.description}</Text>
                  <TouchableOpacity style={styles.viewPatentBtn}>
                    <Text style={styles.viewPatentText}>View Full Analysis</Text>
                    <Ionicons name="arrow-forward" size={14} color="#6366F1" />
                  </TouchableOpacity>
                </View>
              ))
            ) : (
              <View style={styles.emptyState}>
                <Ionicons name="flask-outline" size={64} color="#CBD5E1" />
                <Text style={styles.emptyTitle}>Start Your Research</Text>
                <Text style={styles.emptyText}>Enter keywords to find relevant international patents and academic papers.</Text>
              </View>
            )}
            <View style={{ height: 40 }} />
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'flex-end',
  },
  content: {
    backgroundColor: '#F8FAFC',
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    height: height * 0.85,
    overflow: 'hidden',
  },
  header: {
    padding: 24,
    paddingTop: 32,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  subtitle: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
    marginBottom: 24,
  },
  searchContainer: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: 16,
    padding: 4,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  input: {
    flex: 1,
    color: '#FFFFFF',
    paddingHorizontal: 16,
    fontSize: 16,
  },
  searchBtn: {
    backgroundColor: '#FFFFFF',
    width: 48,
    height: 48,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  resultsList: {
    flex: 1,
    padding: 20,
  },
  patentCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
  },
  patentBadge: {
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
    marginBottom: 12,
  },
  patentBadgeText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#10B981',
  },
  patentTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1E293B',
    marginBottom: 4,
  },
  patentNo: {
    fontSize: 12,
    color: '#6366F1',
    fontWeight: '600',
    marginBottom: 12,
  },
  patentDesc: {
    fontSize: 14,
    color: '#64748B',
    lineHeight: 20,
    marginBottom: 16,
  },
  viewPatentBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  viewPatentText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#6366F1',
  },
  loadingContainer: {
    marginTop: 40,
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    color: '#64748B',
    fontSize: 14,
  },
  emptyState: {
    marginTop: 60,
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1E293B',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 20,
  },
});
