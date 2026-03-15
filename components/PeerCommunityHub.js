import React, { useState } from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { StudyStatus, StudyStories, Leaderboard, StudyBuddyFinder } from './SocialFeatures';

const { width, height } = Dimensions.get('window');

export default function PeerCommunityHub({ visible, onClose, user }) {
  const [showStatus, setShowStatus] = useState(false);
  const [showStories, setShowStories] = useState(false);
  const [showLeaderboard, setShowLeaderboard] = useState(false);
  const [showBuddyFinder, setShowBuddyFinder] = useState(false);

  const hubActions = [
    { id: 'buddy', title: 'Find Study Buddy', desc: 'Connect with peers', icon: 'people', color: '#6366F1', action: () => setShowBuddyFinder(true) },
    { id: 'leaderboard', title: 'Leaderboard', desc: 'View top students', icon: 'trophy', color: '#F59E0B', action: () => setShowLeaderboard(true) },
    { id: 'stories', title: 'Study Stories', desc: 'Share your progress', icon: 'book', color: '#10B981', action: () => setShowStories(true) },
    { id: 'status', title: 'Update Status', desc: 'Let friends know', icon: 'location', color: '#EC4899', action: () => setShowStatus(true) },
  ];

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.header}>
            <View>
              <Text style={styles.headerTitle}>Peer Community Hub</Text>
              <Text style={styles.headerSubtitle}>Learn together, grow together</Text>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}><Ionicons name="close" size={24} color="#64748B" /></TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false} style={styles.mainScroll}>
            <View style={styles.actionsGrid}>
              {hubActions.map(action => (
                <TouchableOpacity key={action.id} style={styles.actionCard} onPress={action.action}>
                  <View style={[styles.iconBox, { backgroundColor: action.color + '20' }]}>
                    <Ionicons name={action.icon} size={28} color={action.color} />
                  </View>
                  <Text style={styles.actionTitle}>{action.title}</Text>
                  <Text style={styles.actionDesc}>{action.desc}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={styles.sectionTitle}>Recent Activity</Text>
            <View style={styles.activityFeed}>
              <View style={styles.activityCard}>
                <Text style={styles.activityEmoji}>👋</Text>
                <View style={styles.activityContent}>
                  <Text style={styles.activityText}><Text style={styles.bold}>Emma</Text> joined the <Text style={styles.bold}>Algorithms</Text> study group.</Text>
                  <Text style={styles.activityTime}>10 mins ago</Text>
                </View>
              </View>
              <View style={styles.activityCard}>
                <Text style={styles.activityEmoji}>🏆</Text>
                <View style={styles.activityContent}>
                  <Text style={styles.activityText}><Text style={styles.bold}>Alex</Text> reached a 7-day study streak!</Text>
                  <Text style={styles.activityTime}>1 hour ago</Text>
                </View>
              </View>
            </View>
          </ScrollView>
        </View>

        {/* Existing Social Modals */}
        <StudyStatus visible={showStatus} onClose={() => setShowStatus(false)} />
        <StudyStories visible={showStories} onClose={() => setShowStories(false)} />
        <Leaderboard visible={showLeaderboard} onClose={() => setShowLeaderboard(false)} />
        <StudyBuddyFinder visible={showBuddyFinder} onClose={() => setShowBuddyFinder(false)} />
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalContent: { backgroundColor: '#F8FAFC', borderTopLeftRadius: 30, borderTopRightRadius: 30, height: height * 0.9, paddingTop: 20 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, marginBottom: 20 },
  headerTitle: { fontSize: 22, fontWeight: 'bold', color: '#1E293B' },
  headerSubtitle: { fontSize: 13, color: '#64748B' },
  closeButton: { padding: 8, backgroundColor: '#F1F5F9', borderRadius: 20 },
  mainScroll: { paddingHorizontal: 20 },
  actionsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 15, marginBottom: 30 },
  actionCard: { width: (width - 55) / 2, backgroundColor: '#FFFFFF', padding: 20, borderRadius: 24, elevation: 1, alignItems: 'flex-start' },
  iconBox: { width: 50, height: 50, borderRadius: 15, justifyContent: 'center', alignItems: 'center', marginBottom: 15 },
  actionTitle: { fontSize: 16, fontWeight: 'bold', color: '#1E293B' },
  actionDesc: { fontSize: 12, color: '#64748B', marginTop: 4 },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', color: '#334155', marginBottom: 15 },
  activityFeed: { gap: 12, paddingBottom: 40 },
  activityCard: { flexDirection: 'row', backgroundColor: '#FFFFFF', padding: 15, borderRadius: 20, alignItems: 'center', gap: 15, elevation: 1 },
  activityEmoji: { fontSize: 24 },
  activityContent: { flex: 1 },
  activityText: { fontSize: 14, color: '#334155', lineHeight: 20 },
  activityTime: { fontSize: 11, color: '#94A3B8', marginTop: 4 },
  bold: { fontWeight: 'bold', color: '#1E293B' }
});
