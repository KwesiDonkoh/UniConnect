import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Dimensions,
  Animated,
  StatusBar,
  Modal,
  Alert,
  FlatList,
  RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../components/ThemeProvider';
import { useApp } from '../context/AppContext';

const { width, height } = Dimensions.get('window');

const INTERESTS = [
  'Computer Science', 'Engineering', 'Medicine', 'Law', 'Business', 'Arts',
  'Mathematics', 'Physics', 'Chemistry', 'Architecture', 'Agriculture', 'Nursing',
];

const GROUPS = [
  {
    id: 'g1',
    name: 'AI & Machine Learning Global',
    description: 'A worldwide community of students and researchers pushing the boundaries of artificial intelligence.',
    members: 4821,
    university: 'Multi-University',
    category: 'Technology',
    tags: ['AI', 'ML', 'Deep Learning'],
    color: '#6366F1',
    gradient: ['#6366F1', '#4F46E5'],
    icon: 'hardware-chip',
    isJoined: false,
    posts: 234,
    online: 127,
    isVerified: true,
  },
  {
    id: 'g2',
    name: 'KNUST CS Students — Level 300',
    description: 'The official hub for all 300-level Computer Science students at KNUST.',
    members: 312,
    university: 'KNUST',
    category: 'Academic',
    tags: ['KNUST', 'CS', 'Level 300'],
    color: '#10B981',
    gradient: ['#10B981', '#059669'],
    icon: 'school',
    isJoined: true,
    posts: 1043,
    online: 45,
    isVerified: true,
  },
  {
    id: 'g3',
    name: 'African Tech Founders Network',
    description: 'Connect with tech entrepreneurs and startup founders across Africa to share ideas, resources, and partnerships.',
    members: 9234,
    university: 'Pan-African',
    category: 'Entrepreneurship',
    tags: ['Startup', 'Fintech', 'Africa'],
    color: '#F59E0B',
    gradient: ['#F59E0B', '#D97706'],
    icon: 'rocket',
    isJoined: false,
    posts: 5621,
    online: 423,
    isVerified: true,
  },
  {
    id: 'g4',
    name: 'Research & Publication Lab',
    description: 'A collaborative space for students to co-author papers, find mentors, and publish academic research globally.',
    members: 2103,
    university: 'Global',
    category: 'Research',
    tags: ['Research', 'Academic Writing', 'Publications'],
    color: '#8B5CF6',
    gradient: ['#8B5CF6', '#7C3AED'],
    icon: 'flask',
    isJoined: false,
    posts: 876,
    online: 68,
    isVerified: true,
  },
  {
    id: 'g5',
    name: 'Global Debate Club',
    description: 'Sharpen your argumentation skills through structured debates on global issues, policy, and innovation with students worldwide.',
    members: 1567,
    university: 'International',
    category: 'Skills',
    tags: ['Debate', 'Public Speaking', 'Leadership'],
    color: '#EC4899',
    gradient: ['#EC4899', '#BE185D'],
    icon: 'mic',
    isJoined: true,
    posts: 432,
    online: 31,
    isVerified: false,
  },
  {
    id: 'g6',
    name: 'Developers & Hackers Ghana',
    description: 'The official coding community for Ghanaian developers — from hackathons to open-source projects.',
    members: 2891,
    university: 'Ghana',
    category: 'Technology',
    tags: ['Coding', 'Hackathon', 'Open Source'],
    color: '#0EA5E9',
    gradient: ['#0EA5E9', '#0284C7'],
    icon: 'code-slash',
    isJoined: false,
    posts: 1231,
    online: 89,
    isVerified: true,
  },
];

const SUGGESTED = [
  { id: 's1', name: 'Women in STEM', members: 5432, color: '#EC4899', icon: 'female' },
  { id: 's2', name: 'Game Dev Club', members: 1203, color: '#8B5CF6', icon: 'game-controller' },
  { id: 's3', name: 'Data Science Hub', members: 3420, color: '#0EA5E9', icon: 'bar-chart' },
  { id: 's4', name: 'Cybersecurity Watch', members: 2100, color: '#EF4444', icon: 'shield' },
];

const FILTERS = ['All', 'Joined', 'Technology', 'Academic', 'Research', 'Skills', 'Entrepreneurship'];

export default function GlobalGroupsScreen({ navigation }) {
  const { isDark } = useTheme();
  const { user } = useApp();
  const [activeFilter, setActiveFilter] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [joinedGroups, setJoinedGroups] = useState(new Set(['g2', 'g5']));
  const [groups, setGroups] = useState(GROUPS);
  const [showGroupDetail, setShowGroupDetail] = useState(false);
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [newGroupName, setNewGroupName] = useState('');
  const [newGroupDesc, setNewGroupDesc] = useState('');
  const [selectedInterests, setSelectedInterests] = useState([]);
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, { toValue: 1, duration: 700, useNativeDriver: true }).start();
  }, []);

  const filteredGroups = groups.filter(g => {
    const matchFilter = activeFilter === 'All' ||
      (activeFilter === 'Joined' && joinedGroups.has(g.id)) ||
      g.category === activeFilter;
    const matchSearch = !searchQuery || g.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      g.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchFilter && matchSearch;
  });

  const handleJoinToggle = (groupId) => {
    setJoinedGroups(prev => {
      const next = new Set(prev);
      if (next.has(groupId)) {
        next.delete(groupId);
        Alert.alert('Left Group', 'You have left this group.');
      } else {
        next.add(groupId);
        Alert.alert('🎉 Joined!', 'Welcome to the group! You can now participate in discussions.');
      }
      return next;
    });
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await new Promise(r => setTimeout(r, 1000));
    setRefreshing(false);
  };

  const toggleInterest = (interest) => {
    setSelectedInterests(prev =>
      prev.includes(interest) ? prev.filter(i => i !== interest) : [...prev, interest]
    );
  };

  const handleCreateGroup = () => {
    if (!newGroupName.trim()) { Alert.alert('Error', 'Group name is required'); return; }
    const newGroup = {
      id: `g${Date.now()}`,
      name: newGroupName,
      description: newGroupDesc || 'A new community group',
      members: 1,
      university: user?.university || 'KNUST',
      category: selectedInterests[0] || 'Academic',
      tags: selectedInterests.slice(0, 3),
      color: '#6366F1',
      gradient: ['#6366F1', '#4F46E5'],
      icon: 'people',
      isJoined: true,
      posts: 0,
      online: 1,
      isVerified: false,
    };
    setGroups(prev => [newGroup, ...prev]);
    setJoinedGroups(prev => new Set([...prev, newGroup.id]));
    setShowCreateModal(false);
    setNewGroupName('');
    setNewGroupDesc('');
    setSelectedInterests([]);
    Alert.alert('✅ Group Created!', `"${newGroupName}" is now live. Invite your friends to join!`);
  };

  const renderGroupCard = (group) => {
    const isJoined = joinedGroups.has(group.id);
    return (
      <TouchableOpacity
        key={group.id}
        style={[styles.groupCard, isDark && styles.darkCard]}
        onPress={() => { setSelectedGroup(group); setShowGroupDetail(true); }}
        activeOpacity={0.88}
      >
        <LinearGradient colors={group.gradient} style={styles.groupCardHeader}>
          <View style={styles.groupIconWrap}>
            <Ionicons name={group.icon} size={26} color="#FFFFFF" />
          </View>
          {group.isVerified && (
            <View style={styles.verifiedBadge}>
              <Ionicons name="checkmark-circle" size={16} color="#FFFFFF" />
              <Text style={styles.verifiedTxt}>Verified</Text>
            </View>
          )}
        </LinearGradient>
        <View style={styles.groupCardBody}>
          <View style={styles.groupNameRow}>
            <Text style={[styles.groupName, isDark && styles.darkText]} numberOfLines={1}>{group.name}</Text>
            <View style={styles.onlineIndicator}>
              <View style={styles.onlineDot} />
              <Text style={styles.onlineTxt}>{group.online}</Text>
            </View>
          </View>
          <Text style={[styles.groupUni, isDark && styles.darkSubText]}>{group.university}</Text>
          <Text style={[styles.groupDesc, isDark && styles.darkSubText]} numberOfLines={2}>{group.description}</Text>
          <View style={styles.groupTags}>
            {group.tags.slice(0, 2).map((tag, i) => (
              <View key={i} style={[styles.tagPill, { backgroundColor: group.color + '20' }]}>
                <Text style={[styles.tagPillTxt, { color: group.color }]}>#{tag}</Text>
              </View>
            ))}
          </View>
          <View style={styles.groupFooter}>
            <View style={styles.groupStats}>
              <Ionicons name="people" size={14} color="#94A3B8" />
              <Text style={[styles.groupStatTxt, isDark && styles.darkSubText]}>{group.members.toLocaleString()} members</Text>
            </View>
            <TouchableOpacity
              style={[styles.joinBtn, isJoined && styles.joinedBtn, { borderColor: group.color }]}
              onPress={() => handleJoinToggle(group.id)}
            >
              <Text style={[styles.joinBtnTxt, isJoined && styles.joinedBtnTxt, !isJoined && { color: group.color }]}>
                {isJoined ? '✓ Joined' : 'Join'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={[styles.container, isDark && styles.darkContainer]}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />

      {/* Header */}
      <LinearGradient colors={isDark ? ['#0F172A', '#1E293B'] : ['#D97706', '#F59E0B']} style={styles.header}>
        <View style={styles.headerRow}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
          </TouchableOpacity>
          <View style={styles.headerCenter}>
            <Text style={styles.headerTitle}>🌍 Global Groups</Text>
            <Text style={styles.headerSub}>Connect with scholars worldwide</Text>
          </View>
          <TouchableOpacity style={styles.createBtn} onPress={() => setShowCreateModal(true)}>
            <Ionicons name="add" size={22} color="#FFFFFF" />
          </TouchableOpacity>
        </View>

        {/* Search */}
        <View style={styles.searchBar}>
          <Ionicons name="search" size={17} color="rgba(255,255,255,0.6)" />
          <TextInput
            style={styles.searchInput}
            placeholder="Search groups..."
            placeholderTextColor="rgba(255,255,255,0.5)"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Ionicons name="close-circle" size={18} color="rgba(255,255,255,0.7)" />
            </TouchableOpacity>
          )}
        </View>
      </LinearGradient>

      <Animated.View style={{ flex: 1, opacity: fadeAnim }}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} colors={['#F59E0B']} />}
        >
          {/* Stats Banner */}
          <View style={[styles.statsBanner, isDark && styles.darkStatsBanner]}>
            <View style={styles.statItem}>
              <Text style={[styles.statNum, isDark && styles.darkText]}>24,891</Text>
              <Text style={[styles.statLbl, isDark && styles.darkSubText]}>Total Members</Text>
            </View>
            <View style={[styles.statDivider, isDark && { backgroundColor: '#334155' }]} />
            <View style={styles.statItem}>
              <Text style={[styles.statNum, isDark && styles.darkText]}>{groups.length}</Text>
              <Text style={[styles.statLbl, isDark && styles.darkSubText]}>Active Groups</Text>
            </View>
            <View style={[styles.statDivider, isDark && { backgroundColor: '#334155' }]} />
            <View style={styles.statItem}>
              <Text style={[styles.statNum, isDark && styles.darkText]}>{joinedGroups.size}</Text>
              <Text style={[styles.statLbl, isDark && styles.darkSubText]}>You're In</Text>
            </View>
          </View>

          {/* Filter Chips */}
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterScroll} contentContainerStyle={styles.filterContent}>
            {FILTERS.map(f => (
              <TouchableOpacity
                key={f}
                style={[styles.filterChip, activeFilter === f && styles.filterChipActive, isDark && activeFilter !== f && styles.darkFilterChip]}
                onPress={() => setActiveFilter(f)}
              >
                <Text style={[styles.filterTxt, activeFilter === f && styles.filterTxtActive, isDark && activeFilter !== f && styles.darkFilterTxt]}>
                  {f}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          {/* Suggested for You */}
          {activeFilter === 'All' && !searchQuery && (
            <View style={styles.suggestSection}>
              <Text style={[styles.sectionTitle, isDark && styles.darkText]}>Suggested for You</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.suggestScroll}>
                {SUGGESTED.map(s => (
                  <TouchableOpacity key={s.id} style={[styles.suggestCard, isDark && styles.darkSuggestCard]} activeOpacity={0.85}>
                    <View style={[styles.suggestIcon, { backgroundColor: s.color + '20' }]}>
                      <Ionicons name={s.icon} size={24} color={s.color} />
                    </View>
                    <Text style={[styles.suggestName, isDark && styles.darkText]} numberOfLines={2}>{s.name}</Text>
                    <Text style={[styles.suggestMembers, isDark && styles.darkSubText]}>{s.members.toLocaleString()} members</Text>
                    <TouchableOpacity style={[styles.suggestJoinBtn, { backgroundColor: s.color }]}>
                      <Text style={styles.suggestJoinTxt}>Join</Text>
                    </TouchableOpacity>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          )}

          {/* Groups List */}
          <View style={styles.groupsSection}>
            <Text style={[styles.sectionTitle, isDark && styles.darkText]}>
              {activeFilter === 'All' ? 'All Groups' : activeFilter}
              <Text style={[styles.countTxt, isDark && styles.darkSubText]}> ({filteredGroups.length})</Text>
            </Text>
            {filteredGroups.map(g => renderGroupCard(g))}
          </View>

          <View style={{ height: 100 }} />
        </ScrollView>
      </Animated.View>

      {/* Group Detail Modal */}
      <Modal visible={showGroupDetail} animationType="slide" onRequestClose={() => setShowGroupDetail(false)}>
        <SafeAreaView style={[styles.modalContainer, isDark && styles.darkContainer]}>
          {selectedGroup && (
            <>
              <LinearGradient colors={selectedGroup.gradient} style={styles.detailHero}>
                <TouchableOpacity onPress={() => setShowGroupDetail(false)} style={styles.detailBack}>
                  <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
                </TouchableOpacity>
                <View style={styles.detailHeroContent}>
                  <View style={styles.detailIconWrap}>
                    <Ionicons name={selectedGroup.icon} size={40} color="#FFFFFF" />
                  </View>
                  {selectedGroup.isVerified && (
                    <View style={styles.detailVerified}>
                      <Ionicons name="checkmark-circle" size={14} color="#FFFFFF" />
                      <Text style={styles.detailVerifiedTxt}>Verified Group</Text>
                    </View>
                  )}
                  <Text style={styles.detailName}>{selectedGroup.name}</Text>
                  <Text style={styles.detailUni}>{selectedGroup.university}</Text>
                </View>
              </LinearGradient>

              <ScrollView style={[styles.detailBody, isDark && { backgroundColor: '#0F172A' }]} showsVerticalScrollIndicator={false}>
                {/* Stats Row */}
                <View style={[styles.detailStats, isDark && styles.darkCard]}>
                  <View style={styles.detailStatItem}>
                    <Text style={[styles.detailStatNum, isDark && styles.darkText]}>{selectedGroup.members.toLocaleString()}</Text>
                    <Text style={[styles.detailStatLbl, isDark && styles.darkSubText]}>Members</Text>
                  </View>
                  <View style={[styles.detailStatDiv, isDark && { backgroundColor: '#334155' }]} />
                  <View style={styles.detailStatItem}>
                    <Text style={[styles.detailStatNum, isDark && styles.darkText]}>{selectedGroup.posts.toLocaleString()}</Text>
                    <Text style={[styles.detailStatLbl, isDark && styles.darkSubText]}>Posts</Text>
                  </View>
                  <View style={[styles.detailStatDiv, isDark && { backgroundColor: '#334155' }]} />
                  <View style={styles.detailStatItem}>
                    <View style={styles.onlineRow}>
                      <View style={styles.onlineDot} />
                      <Text style={[styles.detailStatNum, isDark && styles.darkText]}>{selectedGroup.online}</Text>
                    </View>
                    <Text style={[styles.detailStatLbl, isDark && styles.darkSubText]}>Online</Text>
                  </View>
                </View>

                {/* About */}
                <View style={styles.detailSection}>
                  <Text style={[styles.detailSectionTitle, isDark && styles.darkText]}>About</Text>
                  <Text style={[styles.detailDesc, isDark && styles.darkSubText]}>{selectedGroup.description}</Text>
                </View>

                {/* Tags */}
                <View style={styles.detailSection}>
                  <Text style={[styles.detailSectionTitle, isDark && styles.darkText]}>Topics</Text>
                  <View style={styles.detailTags}>
                    {selectedGroup.tags.map((tag, i) => (
                      <View key={i} style={[styles.tagPill, { backgroundColor: selectedGroup.color + '20' }]}>
                        <Text style={[styles.tagPillTxt, { color: selectedGroup.color }]}>#{tag}</Text>
                      </View>
                    ))}
                  </View>
                </View>

                {/* Recent Activity (simulated) */}
                <View style={styles.detailSection}>
                  <Text style={[styles.detailSectionTitle, isDark && styles.darkText]}>Recent Activity</Text>
                  {[
                    { user: 'Kofi M.', msg: 'Shared a resource: "Introduction to Transformer Models"', time: '2h ago' },
                    { user: 'Ama S.', msg: 'Posted a question about deep learning optimization', time: '4h ago' },
                    { user: 'Kwesi O.', msg: 'Organized a virtual meetup for next Friday', time: '1d ago' },
                  ].map((activity, i) => (
                    <View key={i} style={[styles.activityItem, isDark && { borderBottomColor: '#334155' }]}>
                      <View style={[styles.activityAvatar, { backgroundColor: selectedGroup.color + '30' }]}>
                        <Text style={[styles.activityAvatarTxt, { color: selectedGroup.color }]}>
                          {activity.user.charAt(0)}
                        </Text>
                      </View>
                      <View style={styles.activityContent}>
                        <Text style={[styles.activityUser, isDark && styles.darkText]}>{activity.user}</Text>
                        <Text style={[styles.activityMsg, isDark && styles.darkSubText]}>{activity.msg}</Text>
                        <Text style={[styles.activityTime, isDark && styles.darkSubText]}>{activity.time}</Text>
                      </View>
                    </View>
                  ))}
                </View>

                {/* Join Button */}
                <TouchableOpacity
                  style={[styles.bigJoinBtn, joinedGroups.has(selectedGroup.id) && styles.bigLeaveBtn]}
                  onPress={() => {
                    handleJoinToggle(selectedGroup.id);
                    setShowGroupDetail(false);
                  }}
                >
                  <LinearGradient
                    colors={joinedGroups.has(selectedGroup.id) ? ['#EF4444', '#DC2626'] : selectedGroup.gradient}
                    style={styles.bigJoinBtnGrad}
                  >
                    <Ionicons name={joinedGroups.has(selectedGroup.id) ? 'exit' : 'person-add'} size={20} color="#FFFFFF" />
                    <Text style={styles.bigJoinBtnTxt}>
                      {joinedGroups.has(selectedGroup.id) ? 'Leave Group' : 'Join Group'}
                    </Text>
                  </LinearGradient>
                </TouchableOpacity>

                <View style={{ height: 40 }} />
              </ScrollView>
            </>
          )}
        </SafeAreaView>
      </Modal>

      {/* Create Group Modal */}
      <Modal visible={showCreateModal} animationType="slide" onRequestClose={() => setShowCreateModal(false)}>
        <SafeAreaView style={[styles.modalContainer, isDark && styles.darkContainer]}>
          <View style={[styles.createHeader, isDark && { borderBottomColor: '#334155' }]}>
            <TouchableOpacity onPress={() => setShowCreateModal(false)}>
              <Ionicons name="close" size={26} color={isDark ? '#FFFFFF' : '#1E293B'} />
            </TouchableOpacity>
            <Text style={[styles.createTitle, isDark && styles.darkText]}>Create New Group</Text>
            <TouchableOpacity onPress={handleCreateGroup}>
              <Text style={styles.createAction}>Create</Text>
            </TouchableOpacity>
          </View>
          <ScrollView style={styles.createBody} showsVerticalScrollIndicator={false}>
            <LinearGradient colors={['#6366F1', '#8B5CF6']} style={styles.createHeroArea}>
              <View style={styles.createIconPlaceholder}>
                <Ionicons name="people" size={40} color="rgba(255,255,255,0.5)" />
              </View>
              <Text style={styles.createHeroText}>New Community</Text>
            </LinearGradient>

            <View style={styles.createForm}>
              <Text style={[styles.formLabel, isDark && styles.darkText]}>Group Name *</Text>
              <TextInput
                style={[styles.formInput, isDark && styles.darkInput]}
                placeholder="e.g. AI Research Club KNUST"
                placeholderTextColor="#94A3B8"
                value={newGroupName}
                onChangeText={setNewGroupName}
              />
              <Text style={[styles.formLabel, isDark && styles.darkText]}>Description</Text>
              <TextInput
                style={[styles.formInput, styles.formTextArea, isDark && styles.darkInput]}
                placeholder="What is this group about?"
                placeholderTextColor="#94A3B8"
                multiline
                numberOfLines={4}
                value={newGroupDesc}
                onChangeText={setNewGroupDesc}
              />
              <Text style={[styles.formLabel, isDark && styles.darkText]}>Interests / Topics</Text>
              <View style={styles.interestGrid}>
                {INTERESTS.map(interest => (
                  <TouchableOpacity
                    key={interest}
                    style={[styles.interestChip, selectedInterests.includes(interest) && styles.interestChipActive, isDark && !selectedInterests.includes(interest) && styles.darkInterestChip]}
                    onPress={() => toggleInterest(interest)}
                  >
                    <Text style={[styles.interestTxt, selectedInterests.includes(interest) && styles.interestTxtActive, isDark && !selectedInterests.includes(interest) && styles.darkInterestTxt]}>
                      {interest}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
            <View style={{ height: 60 }} />
          </ScrollView>
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  darkContainer: { backgroundColor: '#0F172A' },
  darkCard: { backgroundColor: '#1E293B' },
  darkText: { color: '#F8FAFC' },
  darkSubText: { color: '#94A3B8' },
  darkFilterChip: { backgroundColor: '#1E293B', borderColor: '#334155' },
  darkFilterTxt: { color: '#94A3B8' },
  darkStatsBanner: { backgroundColor: '#1E293B' },
  darkSuggestCard: { backgroundColor: '#1E293B' },
  darkInput: { backgroundColor: '#1E293B', borderColor: '#334155', color: '#F8FAFC' },
  darkInterestChip: { backgroundColor: '#1E293B', borderColor: '#334155' },
  darkInterestTxt: { color: '#94A3B8' },

  header: { paddingTop: 10, paddingBottom: 20, paddingHorizontal: 20 },
  headerRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 16 },
  backBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.2)', justifyContent: 'center', alignItems: 'center' },
  headerCenter: { flex: 1, alignItems: 'center' },
  headerTitle: { fontSize: 20, fontWeight: '800', color: '#FFFFFF' },
  headerSub: { fontSize: 12, color: 'rgba(255,255,255,0.7)', marginTop: 2 },
  createBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.25)', justifyContent: 'center', alignItems: 'center' },
  searchBar: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.15)', borderRadius: 16, paddingHorizontal: 15, paddingVertical: 10, gap: 10 },
  searchInput: { flex: 1, color: '#FFFFFF', fontSize: 14 },

  statsBanner: { flexDirection: 'row', backgroundColor: '#FFFFFF', marginHorizontal: 20, marginTop: 16, borderRadius: 18, padding: 16, elevation: 3 },
  statItem: { flex: 1, alignItems: 'center' },
  statNum: { fontSize: 20, fontWeight: '900', color: '#1E293B' },
  statLbl: { fontSize: 11, color: '#94A3B8', marginTop: 3 },
  statDivider: { width: 1, height: '80%', alignSelf: 'center', backgroundColor: '#E2E8F0' },

  filterScroll: { marginTop: 14 },
  filterContent: { paddingHorizontal: 20, gap: 8 },
  filterChip: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#E2E8F0', elevation: 1 },
  filterChipActive: { backgroundColor: '#F59E0B', borderColor: '#F59E0B' },
  filterTxt: { fontSize: 13, fontWeight: '600', color: '#64748B' },
  filterTxtActive: { color: '#FFFFFF' },

  suggestSection: { marginHorizontal: 20, marginTop: 20 },
  sectionTitle: { fontSize: 18, fontWeight: '800', color: '#1E293B', marginBottom: 14 },
  countTxt: { fontSize: 13, fontWeight: '400', color: '#94A3B8' },
  suggestScroll: { gap: 12, paddingVertical: 4 },
  suggestCard: { width: 130, backgroundColor: '#FFFFFF', borderRadius: 18, padding: 16, alignItems: 'center', elevation: 3 },
  suggestIcon: { width: 52, height: 52, borderRadius: 18, justifyContent: 'center', alignItems: 'center', marginBottom: 10 },
  suggestName: { fontSize: 13, fontWeight: '700', color: '#1E293B', textAlign: 'center', marginBottom: 4 },
  suggestMembers: { fontSize: 10, color: '#94A3B8', marginBottom: 10 },
  suggestJoinBtn: { paddingHorizontal: 20, paddingVertical: 8, borderRadius: 20 },
  suggestJoinTxt: { fontSize: 12, fontWeight: '800', color: '#FFFFFF' },

  groupsSection: { marginHorizontal: 20, marginTop: 20 },
  groupCard: { backgroundColor: '#FFFFFF', borderRadius: 22, marginBottom: 16, overflow: 'hidden', elevation: 4 },
  groupCardHeader: { height: 90, padding: 16, justifyContent: 'space-between', flexDirection: 'row', alignItems: 'flex-start' },
  groupIconWrap: { width: 52, height: 52, borderRadius: 18, backgroundColor: 'rgba(255,255,255,0.25)', justifyContent: 'center', alignItems: 'center' },
  verifiedBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: 'rgba(255,255,255,0.25)', paddingHorizontal: 10, paddingVertical: 5, borderRadius: 20 },
  verifiedTxt: { fontSize: 11, color: '#FFFFFF', fontWeight: '700' },
  groupCardBody: { padding: 16 },
  groupNameRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 3 },
  groupName: { fontSize: 16, fontWeight: '800', color: '#1E293B', flex: 1 },
  onlineIndicator: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  onlineDot: { width: 7, height: 7, borderRadius: 4, backgroundColor: '#10B981' },
  onlineTxt: { fontSize: 11, color: '#10B981', fontWeight: '600' },
  groupUni: { fontSize: 11, color: '#94A3B8', marginBottom: 6 },
  groupDesc: { fontSize: 13, color: '#64748B', marginBottom: 10, lineHeight: 18 },
  groupTags: { flexDirection: 'row', gap: 8, marginBottom: 12 },
  tagPill: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20 },
  tagPillTxt: { fontSize: 11, fontWeight: '700' },
  groupFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  groupStats: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  groupStatTxt: { fontSize: 12, color: '#94A3B8' },
  joinBtn: { paddingHorizontal: 20, paddingVertical: 8, borderRadius: 20, borderWidth: 1.5 },
  joinedBtn: { backgroundColor: '#F1F5F9', borderColor: '#E2E8F0' },
  joinBtnTxt: { fontSize: 13, fontWeight: '700' },
  joinedBtnTxt: { color: '#10B981' },

  modalContainer: { flex: 1, backgroundColor: '#F8FAFC' },
  detailHero: { height: 220, justifyContent: 'flex-end', padding: 24 },
  detailBack: { position: 'absolute', top: 50, left: 20, width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(0,0,0,0.3)', justifyContent: 'center', alignItems: 'center' },
  detailHeroContent: { alignItems: 'center' },
  detailIconWrap: { width: 72, height: 72, borderRadius: 24, backgroundColor: 'rgba(255,255,255,0.25)', justifyContent: 'center', alignItems: 'center', marginBottom: 8 },
  detailVerified: { flexDirection: 'row', alignItems: 'center', gap: 4, marginBottom: 6 },
  detailVerifiedTxt: { fontSize: 11, color: 'rgba(255,255,255,0.85)', fontWeight: '700' },
  detailName: { fontSize: 20, fontWeight: '900', color: '#FFFFFF', textAlign: 'center' },
  detailUni: { fontSize: 12, color: 'rgba(255,255,255,0.7)', marginTop: 4 },
  detailBody: { flex: 1, padding: 20 },
  detailStats: { flexDirection: 'row', backgroundColor: '#FFFFFF', borderRadius: 18, padding: 16, marginBottom: 20, elevation: 3 },
  detailStatItem: { flex: 1, alignItems: 'center' },
  detailStatNum: { fontSize: 20, fontWeight: '900', color: '#1E293B' },
  detailStatLbl: { fontSize: 11, color: '#94A3B8', marginTop: 3 },
  detailStatDiv: { width: 1, height: '80%', alignSelf: 'center', backgroundColor: '#E2E8F0' },
  onlineRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  detailSection: { marginBottom: 22 },
  detailSectionTitle: { fontSize: 16, fontWeight: '800', color: '#1E293B', marginBottom: 10 },
  detailDesc: { fontSize: 14, color: '#64748B', lineHeight: 21 },
  detailTags: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  activityItem: { flexDirection: 'row', gap: 12, paddingBottom: 14, marginBottom: 14, borderBottomWidth: 1, borderBottomColor: '#F1F5F9' },
  activityAvatar: { width: 40, height: 40, borderRadius: 14, justifyContent: 'center', alignItems: 'center' },
  activityAvatarTxt: { fontSize: 16, fontWeight: '900' },
  activityContent: { flex: 1 },
  activityUser: { fontSize: 14, fontWeight: '700', color: '#1E293B', marginBottom: 3 },
  activityMsg: { fontSize: 12, color: '#64748B', lineHeight: 17, marginBottom: 3 },
  activityTime: { fontSize: 11, color: '#94A3B8' },
  bigJoinBtn: { borderRadius: 20, overflow: 'hidden', marginHorizontal: 0 },
  bigLeaveBtn: {},
  bigJoinBtnGrad: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10, padding: 18, borderRadius: 20 },
  bigJoinBtnTxt: { fontSize: 16, fontWeight: '800', color: '#FFFFFF' },

  createHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 20, borderBottomWidth: 1, borderBottomColor: '#E2E8F0' },
  createTitle: { fontSize: 17, fontWeight: '800', color: '#1E293B' },
  createAction: { fontSize: 16, fontWeight: '700', color: '#6366F1' },
  createBody: { flex: 1 },
  createHeroArea: { height: 140, justifyContent: 'center', alignItems: 'center', gap: 8 },
  createIconPlaceholder: { width: 64, height: 64, borderRadius: 22, backgroundColor: 'rgba(255,255,255,0.2)', justifyContent: 'center', alignItems: 'center' },
  createHeroText: { fontSize: 14, color: 'rgba(255,255,255,0.7)', fontWeight: '600' },
  createForm: { padding: 20 },
  formLabel: { fontSize: 14, fontWeight: '700', color: '#1E293B', marginBottom: 8, marginTop: 16 },
  formInput: { backgroundColor: '#F8FAFC', borderWidth: 1, borderColor: '#E2E8F0', borderRadius: 16, padding: 14, fontSize: 14, color: '#1E293B' },
  formTextArea: { height: 100, textAlignVertical: 'top' },
  interestGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 4 },
  interestChip: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#E2E8F0' },
  interestChipActive: { backgroundColor: '#6366F1', borderColor: '#6366F1' },
  interestTxt: { fontSize: 12, fontWeight: '600', color: '#64748B' },
  interestTxtActive: { color: '#FFFFFF' },
});
