import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Image,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../components/ThemeProvider';
import { useApp } from '../context/AppContext';

const { width } = Dimensions.get('window');

const FEED_ITEMS = [
  {
    id: '1',
    user: 'Kofi Arhin',
    role: 'Student',
    time: '1h ago',
    content: 'Does anyone have the simplified notes for CS301 (Distributed Systems)? I am finding the Raft algorithm a bit tricky.',
    type: 'bounty',
    reward: '50 Pts',
    likes: 12,
    replies: 4,
  },
  {
    id: '2',
    user: 'Dr. Sarah Chen',
    role: 'Lecturer',
    time: '3h ago',
    content: 'Reminder: The AI Research Hub workshop starts tomorrow at 10 AM in Room 402. We will have a special guest from Google DeepMind.',
    type: 'announcement',
    likes: 45,
    replies: 8,
  },
  {
    id: '3',
    user: 'Ama Serwaa',
    role: 'Student',
    time: '5h ago',
    content: 'The new shuttle schedule is out! Much better frequency for the Engineering block.',
    type: 'social',
    likes: 30,
    replies: 2,
  },
];

export default function CampusSocialHub({ navigation }) {
  const { isDark } = useTheme();
  const { user } = useApp();

  const renderFeedItem = (item) => (
    <View key={item.id} style={[styles.feedCard, isDark && styles.darkCard]}>
      <View style={styles.feedHeader}>
        <View style={[styles.avatar, { backgroundColor: isDark ? '#4F46E5' : '#EEF2FF' }]}>
          <Text style={styles.avatarText}>{item.user[0]}</Text>
        </View>
        <View style={styles.userInfo}>
          <View style={styles.userNameRow}>
            <Text style={[styles.userName, isDark && { color: '#FFF' }]}>{item.user}</Text>
            {item.role === 'Lecturer' && (
              <Ionicons name="checkmark-circle" size={14} color="#4F46E5" style={{ marginLeft: 4 }} />
            )}
          </View>
          <Text style={styles.userRole}>{item.role} • {item.time}</Text>
        </View>
        {item.type === 'bounty' && (
          <View style={styles.bountyBadge}>
            <Text style={styles.bountyText}>{item.reward}</Text>
          </View>
        )}
      </View>

      <Text style={[styles.feedContent, isDark && { color: '#CBD5E1' }]}>{item.content}</Text>

      <View style={styles.feedFooter}>
        <TouchableOpacity style={styles.footerAction}>
          <Ionicons name="heart-outline" size={20} color="#64748B" />
          <Text style={styles.footerActionText}>{item.likes}</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.footerAction}>
          <Ionicons name="chatbubble-outline" size={20} color="#64748B" />
          <Text style={styles.footerActionText}>{item.replies}</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.footerAction}>
          <Ionicons name="share-social-outline" size={20} color="#64748B" />
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.replyBtn}>
          <Text style={styles.replyBtnText}>Reply</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={[styles.container, isDark && styles.darkContainer]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="chevron-back" size={24} color={isDark ? '#FFF' : '#1E293B'} />
        </TouchableOpacity>
        <View>
          <Text style={[styles.headerTitle, isDark && { color: '#FFF' }]}>Campus Social Hub</Text>
          <Text style={styles.headerSubtitle}>{user?.department || 'Computer Science'} Feed</Text>
        </View>
        <TouchableOpacity>
          <Ionicons name="search" size={24} color={isDark ? '#FFF' : '#1E293B'} />
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* Trending Section */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, isDark && { color: '#FFF' }]}>Trending Topics</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.trendingScroll}>
            {['#CS301_Notes', '#Hackathon2026', '#Room402_Event', '#ShuttleLife'].map((tag, idx) => (
              <TouchableOpacity key={idx} style={[styles.tagCard, isDark && styles.darkCard]}>
                <Text style={styles.tagText}>{tag}</Text>
                <Text style={styles.tagStats}>2.4k posts</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Post Creation Entry */}
        <TouchableOpacity style={[styles.inputPlaceholder, isDark && styles.darkCard]}>
          <View style={[styles.avatar, { width: 36, height: 36, backgroundColor: '#4F46E5' }]}>
            <Text style={[styles.avatarText, { fontSize: 14 }]}>{user?.name?.[0] || 'U'}</Text>
          </View>
          <Text style={styles.placeholderText}>What's on your mind, {user?.name?.split(' ')[0]}?</Text>
          <Ionicons name="image-outline" size={24} color="#64748B" />
        </TouchableOpacity>

        {/* The Feed */}
        <View style={styles.feedContainer}>
          {FEED_ITEMS.map(renderFeedItem)}
        </View>

        {/* Study Rooms Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, isDark && { color: '#FFF' }]}>Live Study Groups</Text>
            <TouchableOpacity>
              <Text style={styles.seeAllText}>Create Room</Text>
            </TouchableOpacity>
          </View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.trendingScroll}>
            {[
              { id: '1', title: 'Calculus Final Prep', members: 12, colors: ['#4F46E5', '#6366F1'] },
              { id: '2', title: 'OS Kernel Logic', members: 8, colors: ['#10B981', '#34D399'] },
              { id: '3', title: 'Data Structures', members: 15, colors: ['#F59E0B', '#FBBF24'] },
            ].map(room => (
              <TouchableOpacity key={room.id} style={styles.roomCard}>
                <LinearGradient colors={room.colors} style={styles.roomGradient}>
                  <Text style={styles.roomTitle}>{room.title}</Text>
                  <View style={styles.roomFooter}>
                    <Ionicons name="people" size={14} color="#FFF" />
                    <Text style={styles.roomMembers}>{room.members} Studying</Text>
                  </View>
                  <TouchableOpacity style={styles.joinBtn}>
                    <Text style={styles.joinBtnText}>Join Now</Text>
                  </TouchableOpacity>
                </LinearGradient>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      </ScrollView>

      {/* Floating Action Button */}
      <TouchableOpacity style={styles.fab}>
        <LinearGradient colors={['#4F46E5', '#3730A3']} style={styles.fabGradient}>
          <Ionicons name="add" size={30} color="#FFF" />
        </LinearGradient>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  darkContainer: {
    backgroundColor: '#0F172A',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#1E293B',
  },
  headerSubtitle: {
    fontSize: 12,
    color: '#64748B',
    textAlign: 'center',
    fontWeight: '600',
  },
  scrollContent: {
    paddingBottom: 100,
  },
  section: {
    marginTop: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: '#1E293B',
    paddingHorizontal: 20,
    marginBottom: 12,
  },
  seeAllText: {
    fontSize: 13,
    color: '#4F46E5',
    fontWeight: '700',
  },
  trendingScroll: {
    paddingLeft: 20,
  },
  tagCard: {
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: 16,
    marginRight: 12,
    minWidth: 140,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  darkCard: {
    backgroundColor: '#1E293B',
    borderColor: '#334155',
  },
  tagText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#4F46E5',
    marginBottom: 4,
  },
  tagStats: {
    fontSize: 11,
    color: '#64748B',
    fontWeight: '600',
  },
  inputPlaceholder: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
    marginHorizontal: 20,
    marginTop: 25,
    padding: 12,
    borderRadius: 20,
    gap: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  placeholderText: {
    flex: 1,
    color: '#94A3B8',
    fontSize: 14,
    fontWeight: '500',
  },
  feedContainer: {
    marginTop: 20,
    paddingHorizontal: 20,
    gap: 15,
  },
  feedCard: {
    backgroundColor: '#FFF',
    borderRadius: 24,
    padding: 20,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  feedHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  avatarText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFF',
  },
  userInfo: {
    flex: 1,
  },
  userNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  userName: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1E293B',
  },
  userRole: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
  },
  bountyBadge: {
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  bountyText: {
    color: '#D97706',
    fontSize: 11,
    fontWeight: '800',
  },
  feedContent: {
    fontSize: 14,
    color: '#475569',
    lineHeight: 20,
    marginBottom: 16,
  },
  feedFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 15,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    gap: 15,
  },
  footerAction: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  footerActionText: {
    fontSize: 13,
    color: '#64748B',
    fontWeight: '600',
  },
  replyBtn: {
    marginLeft: 'auto',
  },
  replyBtnText: {
    color: '#4F46E5',
    fontSize: 13,
    fontWeight: '800',
  },
  roomCard: {
    width: 180,
    height: 160,
    marginRight: 15,
    borderRadius: 24,
    overflow: 'hidden',
  },
  roomGradient: {
    flex: 1,
    padding: 16,
    justifyContent: 'space-between',
  },
  roomTitle: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '800',
    lineHeight: 20,
  },
  roomFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  roomMembers: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 11,
    fontWeight: '600',
  },
  joinBtn: {
    backgroundColor: '#FFF',
    paddingVertical: 8,
    borderRadius: 10,
    alignItems: 'center',
  },
  joinBtnText: {
    color: '#4F46E5',
    fontSize: 12,
    fontWeight: '800',
  },
  fab: {
    position: 'absolute',
    bottom: 30,
    right: 20,
    width: 60,
    height: 60,
    borderRadius: 30,
    shadowColor: '#4F46E5',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 15,
    elevation: 8,
  },
  fabGradient: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
