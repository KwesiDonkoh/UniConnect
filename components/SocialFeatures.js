import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  ScrollView,
  TextInput,
  Animated,
  Dimensions,
  Alert,
  Vibration,
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

const { width, height } = Dimensions.get('window');

// Study Status Component
export const StudyStatus = ({ visible, onClose }) => {
  const [currentStatus, setCurrentStatus] = useState('studying');
  const [customMessage, setCustomMessage] = useState('');
  
  const statuses = [
    { id: 'studying', icon: '📚', label: 'Studying', color: '#6366F1' },
    { id: 'break', icon: '☕', label: 'Taking a break', color: '#10B981' },
    { id: 'exam', icon: '📝', label: 'Exam prep', color: '#EF4444' },
    { id: 'project', icon: '💻', label: 'Working on project', color: '#F59E0B' },
    { id: 'group', icon: '👥', label: 'Group study', color: '#8B5CF6' },
    { id: 'available', icon: '✅', label: 'Available to chat', color: '#10B981' },
    { id: 'busy', icon: '🔕', label: 'Do not disturb', color: '#EF4444' },
  ];

  const updateStatus = (statusId) => {
    setCurrentStatus(statusId);
    Vibration.vibrate(50);
    Alert.alert('Status Updated', 'Your study status has been updated!');
  };

  return (
    <Modal visible={visible} transparent animationType="slide">
      <View style={styles.modalOverlay}>
        <View style={styles.statusContainer}>
          <View style={styles.statusHeader}>
            <Text style={styles.statusTitle}>📍 Study Status</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Ionicons name="close" size={20} color="#64748B" />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.statusList}>
            {statuses.map((status) => (
              <TouchableOpacity
                key={status.id}
                style={[
                  styles.statusOption,
                  currentStatus === status.id && styles.statusOptionActive
                ]}
                onPress={() => updateStatus(status.id)}
              >
                <View style={styles.statusIcon}>
                  <Text style={styles.statusEmoji}>{status.icon}</Text>
                </View>
                <Text style={[
                  styles.statusLabel,
                  currentStatus === status.id && styles.statusLabelActive
                ]}>
                  {status.label}
                </Text>
                {currentStatus === status.id && (
                  <Ionicons name="checkmark-circle" size={20} color={status.color} />
                )}
              </TouchableOpacity>
            ))}

            <View style={styles.customStatus}>
              <Text style={styles.customStatusLabel}>Custom Message:</Text>
              <TextInput
                style={styles.customStatusInput}
                placeholder="What are you working on?"
                value={customMessage}
                onChangeText={setCustomMessage}
                maxLength={100}
              />
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

// Study Stories Component
export const StudyStories = ({ visible, onClose }) => {
  const [stories] = useState([
    {
      id: 1,
      user: 'Sarah M.',
      avatar: '👩‍🎓',
      content: 'Just finished my algorithms assignment! 🎉',
      timestamp: '2h ago',
      likes: 12,
      type: 'achievement'
    },
    {
      id: 2,
      user: 'Mike Chen',
      avatar: '👨‍💻',
      content: 'Study group session was amazing today! We solved 10 coding problems.',
      timestamp: '4h ago',
      likes: 8,
      type: 'study'
    },
    {
      id: 3,
      user: 'Emma Wilson',
      avatar: '👩‍🔬',
      content: 'Database exam prep going strong! 💪',
      timestamp: '6h ago',
      likes: 15,
      type: 'exam'
    },
  ]);

  const [newStory, setNewStory] = useState('');

  const shareStory = () => {
    if (newStory.trim()) {
      Alert.alert('Story Shared!', 'Your study update has been shared with your classmates.');
      setNewStory('');
      Vibration.vibrate(50);
    }
  };

  const getStoryIcon = (type) => {
    switch (type) {
      case 'achievement': return '🏆';
      case 'study': return '📚';
      case 'exam': return '📝';
      default: return '📖';
    }
  };

  return (
    <Modal visible={visible} transparent animationType="slide">
      <View style={styles.modalOverlay}>
        <View style={styles.storiesContainer}>
          <View style={styles.storiesHeader}>
            <Text style={styles.storiesTitle}>📖 Study Stories</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Ionicons name="close" size={20} color="#64748B" />
            </TouchableOpacity>
          </View>

          {/* Create Story */}
          <View style={styles.createStory}>
            <TextInput
              style={styles.storyInput}
              placeholder="Share your study progress..."
              value={newStory}
              onChangeText={setNewStory}
              multiline
              maxLength={200}
            />
            <TouchableOpacity
              style={styles.shareButton}
              onPress={shareStory}
              disabled={!newStory.trim()}
            >
              <Text style={[
                styles.shareButtonText,
                !newStory.trim() && styles.shareButtonTextDisabled
              ]}>
                Share
              </Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.storiesList}>
            {stories.map((story) => (
              <View key={story.id} style={styles.storyCard}>
                <View style={styles.storyHeader}>
                  <View style={styles.storyUser}>
                    <Text style={styles.userAvatar}>{story.avatar}</Text>
                    <View>
                      <Text style={styles.userName}>{story.user}</Text>
                      <Text style={styles.storyTime}>{story.timestamp}</Text>
                    </View>
                  </View>
                  <Text style={styles.storyTypeIcon}>{getStoryIcon(story.type)}</Text>
                </View>

                <Text style={styles.storyContent}>{story.content}</Text>

                <View style={styles.storyActions}>
                  <TouchableOpacity 
                    style={styles.storyAction}
                    onPress={() => Vibration.vibrate(50)}
                  >
                    <Ionicons name="heart-outline" size={20} color="#EF4444" />
                    <Text style={styles.storyActionText}>{story.likes}</Text>
                  </TouchableOpacity>
                  
                  <TouchableOpacity style={styles.storyAction}>
                    <Ionicons name="chatbubble-outline" size={20} color="#6366F1" />
                    <Text style={styles.storyActionText}>Comment</Text>
                  </TouchableOpacity>
                  
                  <TouchableOpacity style={styles.storyAction}>
                    <Ionicons name="share-outline" size={20} color="#10B981" />
                    <Text style={styles.storyActionText}>Share</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

// Leaderboard Component
export const Leaderboard = ({ visible, onClose }) => {
  const [activeTab, setActiveTab] = useState('weekly');
  const [leaderboard] = useState({
    weekly: [
      { id: 1, name: 'Alex Chen', avatar: '👨‍💻', points: 2450, rank: 1, streak: 12 },
      { id: 2, name: 'Sarah Kim', avatar: '👩‍🎓', points: 2380, rank: 2, streak: 8 },
      { id: 3, name: 'Mike Johnson', avatar: '👨‍🔬', points: 2290, rank: 3, streak: 15 },
      { id: 4, name: 'Emma Davis', avatar: '👩‍💼', points: 2150, rank: 4, streak: 6 },
      { id: 5, name: 'You', avatar: '🎓', points: 2080, rank: 5, streak: 7 },
    ],
    monthly: [
      { id: 1, name: 'Sarah Kim', avatar: '👩‍🎓', points: 9850, rank: 1, streak: 25 },
      { id: 2, name: 'Alex Chen', avatar: '👨‍💻', points: 9720, rank: 2, streak: 28 },
      { id: 3, name: 'You', avatar: '🎓', points: 8940, rank: 3, streak: 21 },
      { id: 4, name: 'Mike Johnson', avatar: '👨‍🔬', points: 8650, rank: 4, streak: 19 },
      { id: 5, name: 'Emma Davis', avatar: '👩‍💼', points: 8420, rank: 5, streak: 16 },
    ],
  });

  const getRankColor = (rank) => {
    switch (rank) {
      case 1: return '#F59E0B';
      case 2: return '#94A3B8';
      case 3: return '#CD7C2F';
      default: return '#6366F1';
    }
  };

  const getRankIcon = (rank) => {
    switch (rank) {
      case 1: return '🥇';
      case 2: return '🥈';
      case 3: return '🥉';
      default: return `${rank}`;
    }
  };

  return (
    <Modal visible={visible} transparent animationType="slide">
      <View style={styles.modalOverlay}>
        <View style={styles.leaderboardContainer}>
          <View style={styles.leaderboardHeader}>
            <Text style={styles.leaderboardTitle}>🏆 Leaderboard</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Ionicons name="close" size={20} color="#64748B" />
            </TouchableOpacity>
          </View>

          {/* Tabs */}
          <View style={styles.tabs}>
            {['weekly', 'monthly'].map((tab) => (
              <TouchableOpacity
                key={tab}
                style={[styles.tab, activeTab === tab && styles.tabActive]}
                onPress={() => setActiveTab(tab)}
              >
                <Text style={[
                  styles.tabText,
                  activeTab === tab && styles.tabTextActive
                ]}>
                  {tab.charAt(0).toUpperCase() + tab.slice(1)}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <ScrollView style={styles.leaderboardList}>
            {leaderboard[activeTab].map((user, index) => (
              <View 
                key={user.id} 
                style={[
                  styles.leaderboardItem,
                  user.name === 'You' && styles.currentUser,
                  index < 3 && styles.topThree
                ]}
              >
                <View style={styles.userRank}>
                  <Text style={[styles.rankText, { color: getRankColor(user.rank) }]}>
                    {getRankIcon(user.rank)}
                  </Text>
                </View>

                <View style={styles.userInfo}>
                  <Text style={styles.userAvatar}>{user.avatar}</Text>
                  <View style={styles.userDetails}>
                    <Text style={[styles.userName, user.name === 'You' && styles.currentUserName]}>
                      {user.name}
                    </Text>
                    <View style={styles.userStats}>
                      <Text style={styles.userPoints}>{user.points.toLocaleString()} pts</Text>
                      <View style={styles.streak}>
                        <Ionicons name="flame" size={12} color="#F59E0B" />
                        <Text style={styles.streakText}>{user.streak}</Text>
                      </View>
                    </View>
                  </View>
                </View>

                {user.name === 'You' && (
                  <View style={styles.yourBadge}>
                    <Text style={styles.yourBadgeText}>YOU</Text>
                  </View>
                )}
              </View>
            ))}
          </ScrollView>

          <View style={styles.leaderboardFooter}>
            <Text style={styles.footerText}>
              Keep studying to climb the ranks! 🚀
            </Text>
          </View>
        </View>
      </View>
    </Modal>
  );
};

// Study Buddy Finder
export const StudyBuddyFinder = ({ visible, onClose }) => {
  const [buddies] = useState([
    {
      id: 1,
      name: 'Alex Chen',
      avatar: '👨‍💻',
      level: '300',
      subjects: ['Algorithms', 'Data Structures'],
      studyTime: 'Evenings',
      location: 'Library',
      compatibility: 95,
      status: 'online'
    },
    {
      id: 2,
      name: 'Sarah Kim',
      avatar: '👩‍🎓',
      level: '300',
      subjects: ['Database Systems', 'Web Dev'],
      studyTime: 'Afternoons',
      location: 'Coffee Shop',
      compatibility: 88,
      status: 'studying'
    },
    {
      id: 3,
      name: 'Mike Johnson',
      avatar: '👨‍🔬',
      level: '400',
      subjects: ['Machine Learning', 'AI'],
      studyTime: 'Mornings',
      location: 'Online',
      compatibility: 92,
      status: 'available'
    },
  ]);

  const connectWithBuddy = (buddy) => {
    Alert.alert(
      'Connect with Study Buddy',
      `Send a study request to ${buddy.name}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Connect',
          onPress: () => {
            Vibration.vibrate(50);
            Alert.alert('Request Sent!', `Your study request has been sent to ${buddy.name}.`);
          }
        }
      ]
    );
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'online': return '#10B981';
      case 'studying': return '#F59E0B';
      case 'available': return '#6366F1';
      default: return '#94A3B8';
    }
  };

  return (
    <Modal visible={visible} transparent animationType="slide">
      <View style={styles.modalOverlay}>
        <View style={styles.buddyContainer}>
          <View style={styles.buddyHeader}>
            <Text style={styles.buddyTitle}>👥 Find Study Buddies</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Ionicons name="close" size={20} color="#64748B" />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.buddyList}>
            {buddies.map((buddy) => (
              <View key={buddy.id} style={styles.buddyCard}>
                <View style={styles.buddyInfo}>
                  <View style={styles.buddyAvatar}>
                    <Text style={styles.avatarText}>{buddy.avatar}</Text>
                    <View style={[styles.statusDot, { backgroundColor: getStatusColor(buddy.status) }]} />
                  </View>
                  
                  <View style={styles.buddyDetails}>
                    <Text style={styles.buddyName}>{buddy.name}</Text>
                    <Text style={styles.buddyLevel}>Level {buddy.level}</Text>
                    
                    <View style={styles.buddySubjects}>
                      {buddy.subjects.map((subject, index) => (
                        <View key={index} style={styles.subjectTag}>
                          <Text style={styles.subjectText}>{subject}</Text>
                        </View>
                      ))}
                    </View>
                    
                    <Text style={styles.buddyPrefs}>
                      🕐 {buddy.studyTime} • 📍 {buddy.location}
                    </Text>
                  </View>
                </View>

                <View style={styles.buddyActions}>
                  <View style={styles.compatibility}>
                    <Text style={styles.compatibilityText}>{buddy.compatibility}%</Text>
                    <Text style={styles.compatibilityLabel}>match</Text>
                  </View>
                  
                  <TouchableOpacity
                    style={styles.connectButton}
                    onPress={() => connectWithBuddy(buddy)}
                  >
                    <Ionicons name="person-add" size={16} color="#FFFFFF" />
                    <Text style={styles.connectText}>Connect</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F1F5F9',
    justifyContent: 'center',
    alignItems: 'center',
  },

  // Status Styles
  statusContainer: {
    width: width * 0.9,
    maxWidth: 400,
    maxHeight: '80%',
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
  },
  statusHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  statusTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1E293B',
  },
  statusList: {
    padding: 16,
  },
  statusOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
    backgroundColor: '#F8FAFC',
  },
  statusOptionActive: {
    backgroundColor: '#EEF2FF',
    borderWidth: 2,
    borderColor: '#6366F1',
  },
  statusIcon: {
    marginRight: 12,
  },
  statusEmoji: {
    fontSize: 24,
  },
  statusLabel: {
    flex: 1,
    fontSize: 16,
    color: '#64748B',
  },
  statusLabelActive: {
    color: '#1E293B',
    fontWeight: '600',
  },
  customStatus: {
    marginTop: 16,
    padding: 16,
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
  },
  customStatusLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  customStatusInput: {
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
  },

  // Stories Styles
  storiesContainer: {
    width: width * 0.95,
    height: height * 0.8,
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
  },
  storiesHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  storiesTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1E293B',
  },
  createStory: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  storyInput: {
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    padding: 12,
    fontSize: 16,
    minHeight: 80,
    textAlignVertical: 'top',
    marginBottom: 8,
  },
  shareButton: {
    alignSelf: 'flex-end',
    backgroundColor: '#6366F1',
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 20,
  },
  shareButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  shareButtonTextDisabled: {
    color: '#94A3B8',
  },
  storiesList: {
    flex: 1,
    padding: 16,
  },
  storyCard: {
    backgroundColor: '#F8FAFC',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
  },
  storyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  storyUser: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  userAvatar: {
    fontSize: 32,
    marginRight: 12,
  },
  userName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1E293B',
  },
  storyTime: {
    fontSize: 12,
    color: '#94A3B8',
  },
  storyTypeIcon: {
    fontSize: 20,
  },
  storyContent: {
    fontSize: 16,
    color: '#374151',
    lineHeight: 24,
    marginBottom: 16,
  },
  storyActions: {
    flexDirection: 'row',
    gap: 24,
  },
  storyAction: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  storyActionText: {
    fontSize: 14,
    color: '#64748B',
  },

  // Leaderboard Styles
  leaderboardContainer: {
    width: width * 0.9,
    maxHeight: '80%',
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
  },
  leaderboardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  leaderboardTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1E293B',
  },
  tabs: {
    flexDirection: 'row',
    padding: 16,
    gap: 8,
  },
  tab: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
  },
  tabActive: {
    backgroundColor: '#6366F1',
  },
  tabText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#64748B',
  },
  tabTextActive: {
    color: '#FFFFFF',
  },
  leaderboardList: {
    flex: 1,
    padding: 16,
  },
  leaderboardItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
    backgroundColor: '#F8FAFC',
  },
  currentUser: {
    backgroundColor: '#EEF2FF',
    borderWidth: 2,
    borderColor: '#6366F1',
  },
  topThree: {
    backgroundColor: '#FEF3C7',
  },
  userRank: {
    width: 40,
    alignItems: 'center',
  },
  rankText: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  userInfo: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 12,
  },
  userDetails: {
    flex: 1,
    marginLeft: 12,
  },
  currentUserName: {
    color: '#6366F1',
    fontWeight: 'bold',
  },
  userStats: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  userPoints: {
    fontSize: 14,
    color: '#64748B',
  },
  streak: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  streakText: {
    fontSize: 12,
    color: '#F59E0B',
    fontWeight: '600',
  },
  yourBadge: {
    backgroundColor: '#6366F1',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  yourBadgeText: {
    fontSize: 10,
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  leaderboardFooter: {
    padding: 20,
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  footerText: {
    fontSize: 14,
    color: '#64748B',
    textAlign: 'center',
  },

  // Study Buddy Styles
  buddyContainer: {
    width: width * 0.9,
    maxHeight: '80%',
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
  },
  buddyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  buddyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1E293B',
  },
  buddyList: {
    flex: 1,
    padding: 16,
  },
  buddyCard: {
    backgroundColor: '#F8FAFC',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  buddyInfo: {
    flex: 1,
    flexDirection: 'row',
  },
  buddyAvatar: {
    position: 'relative',
    marginRight: 12,
  },
  avatarText: {
    fontSize: 32,
  },
  statusDot: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    width: 12,
    height: 12,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  buddyDetails: {
    flex: 1,
  },
  buddyName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1E293B',
    marginBottom: 2,
  },
  buddyLevel: {
    fontSize: 12,
    color: '#64748B',
    marginBottom: 8,
  },
  buddySubjects: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 4,
    marginBottom: 8,
  },
  subjectTag: {
    backgroundColor: '#EEF2FF',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
  },
  subjectText: {
    fontSize: 10,
    color: '#6366F1',
    fontWeight: '600',
  },
  buddyPrefs: {
    fontSize: 12,
    color: '#64748B',
  },
  buddyActions: {
    alignItems: 'flex-end',
    justifyContent: 'space-between',
  },
  compatibility: {
    alignItems: 'center',
  },
  compatibilityText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#10B981',
  },
  compatibilityLabel: {
    fontSize: 10,
    color: '#64748B',
  },
  connectButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#6366F1',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    gap: 4,
  },
  connectText: {
    fontSize: 12,
    color: '#FFFFFF',
    fontWeight: '600',
  },
});
