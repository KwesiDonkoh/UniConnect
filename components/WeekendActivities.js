import React, { useState } from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  ScrollView,
  Image,
  Alert
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

const { width, height } = Dimensions.get('window');

const WEEKEND_CHALLENGES = [
  {
    id: 1,
    title: 'Code Sprint',
    description: 'Solve 3 coding problems in the practice lab.',
    reward: '50 XP',
    icon: 'terminal',
    color: '#6366F1'
  },
  {
    id: 2,
    title: 'Research Review',
    description: 'Read and summarize 2 research papers in the hub.',
    reward: '40 XP',
    icon: 'document-text',
    color: '#10B981'
  },
  {
    id: 3,
    title: 'Group Guru',
    description: 'Lead a study group session for at least 1 hour.',
    reward: '100 XP',
    icon: 'people',
    color: '#8B5CF6'
  }
];

export default function WeekendActivities({ visible, onClose, user }) {
  const [activeChallenges, setActiveChallenges] = useState([1, 2]);

  const acceptChallenge = (id) => {
    Alert.alert('Challenge Accepted! ⚔️', 'Good luck! Complete the tasks to earn your reward.');
  };

  return (
    <Modal visible={visible} transparent={true} animationType="slide" onRequestClose={onClose}>
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.header}>
            <View>
              <Text style={styles.headerTitle}>Weekend Warrior</Text>
              <Text style={styles.headerSubtitle}>Exclusive Weekend Challenges & Events</Text>
            </View>
            <TouchableOpacity style={styles.closeButton} onPress={onClose}>
              <Ionicons name="close" size={24} color="#64748B" />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.scrollContent} showsVerticalScrollIndicator={false}>
            {/* Weekend Hero Section */}
            <LinearGradient colors={['#F59E0B', '#D97706']} style={styles.heroCard}>
              <View style={styles.heroContent}>
                <Ionicons name="flash" size={40} color="#FFFFFF" />
                <View>
                  <Text style={styles.heroTitle}>2x XP Active!</Text>
                  <Text style={styles.heroSubtitle}>Study this weekend to boost your level faster.</Text>
                </View>
              </View>
            </LinearGradient>

            {/* Active Challenges Section */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>🔥 Active Challenges</Text>
              {WEEKEND_CHALLENGES.map((challenge) => (
                <View key={challenge.id} style={styles.challengeCard}>
                  <View style={[styles.iconBox, { backgroundColor: challenge.color + '20' }]}>
                    <Ionicons name={challenge.icon} size={24} color={challenge.color} />
                  </View>
                  <View style={styles.challengeInfo}>
                    <Text style={styles.challengeTitle}>{challenge.title}</Text>
                    <Text style={styles.challengeDesc}>{challenge.description}</Text>
                    <View style={styles.rewardBadge}>
                      <Ionicons name="star" size={14} color="#F59E0B" />
                      <Text style={styles.rewardText}>Reward: {challenge.reward}</Text>
                    </View>
                  </View>
                  <TouchableOpacity 
                    style={[styles.acceptButton, activeChallenges.includes(challenge.id) && styles.acceptedButton]}
                    onPress={() => acceptChallenge(challenge.id)}
                  >
                    <Text style={[styles.acceptText, activeChallenges.includes(challenge.id) && styles.acceptedText]}>
                      {activeChallenges.includes(challenge.id) ? 'Pending' : 'Accept'}
                    </Text>
                  </TouchableOpacity>
                </View>
              ))}
            </View>

            {/* Upcoming Meetups Section */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>🤝 Student Meetups</Text>
              <TouchableOpacity style={styles.meetupCard}>
                <Image 
                  source={{ uri: 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60' }} 
                  style={styles.meetupImage}
                />
                <View style={styles.meetupInfo}>
                  <Text style={styles.meetupTitle}>CS Level 300 Pizza Study</Text>
                  <Text style={styles.meetupTime}>Sat, 2:00 PM • Campus Lounge</Text>
                  <View style={styles.attendeesRow}>
                    <View style={styles.attendeesAvatars}>
                      <Text style={styles.avatarText}>🧑‍🏫 👩‍🎓 👨‍🎓</Text>
                    </View>
                    <Text style={styles.attendeeCount}>+12 attending</Text>
                  </View>
                </View>
                <TouchableOpacity style={styles.joinButton}>
                  <Text style={styles.joinText}>Join</Text>
                </TouchableOpacity>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </View>
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
  modalContent: {
    backgroundColor: '#F8FAFC',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    height: height * 0.9,
    paddingTop: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1E293B',
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#64748B',
  },
  closeButton: {
    padding: 8,
    backgroundColor: '#F1F5F9',
    borderRadius: 20,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  heroCard: {
    borderRadius: 20,
    padding: 20,
    marginBottom: 25,
    elevation: 4,
  },
  heroContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 15,
  },
  heroTitle: {
    color: '#FFFFFF',
    fontSize: 22,
    fontWeight: '800',
  },
  heroSubtitle: {
    color: 'rgba(255, 255, 255, 0.9)',
    fontSize: 13,
  },
  section: {
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1E293B',
    marginBottom: 15,
  },
  challengeCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 20,
    marginBottom: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
  },
  iconBox: {
    width: 50,
    height: 50,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  challengeInfo: {
    flex: 1,
  },
  challengeTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1E293B',
  },
  challengeDesc: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
  },
  rewardBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 6,
  },
  rewardText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#F59E0B',
  },
  acceptButton: {
    backgroundColor: '#6366F1',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 12,
  },
  acceptedButton: {
    backgroundColor: '#F1F5F9',
  },
  acceptText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: 'bold',
  },
  acceptedText: {
    color: '#94A3B8',
  },
  meetupCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    overflow: 'hidden',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
  },
  meetupImage: {
    width: '100%',
    height: 120,
  },
  meetupInfo: {
    padding: 16,
  },
  meetupTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1E293B',
  },
  meetupTime: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 4,
  },
  attendeesRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
    gap: 10,
  },
  attendeesAvatars: {
    flexDirection: 'row',
  },
  avatarText: {
    fontSize: 16,
  },
  attendeeCount: {
    fontSize: 12,
    color: '#64748B',
    fontWeight: '500',
  },
  joinButton: {
    position: 'absolute',
    right: 16,
    bottom: 16,
    backgroundColor: '#10B981',
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 12,
  },
  joinText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: 'bold',
  },
});
