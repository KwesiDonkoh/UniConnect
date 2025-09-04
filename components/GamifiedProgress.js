import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Animated,
  Dimensions,
  Modal,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';

const { width, height } = Dimensions.get('window');

export const GamifiedProgress = ({ visible, onClose, user, courses }) => {
  const [selectedTab, setSelectedTab] = useState('overview');
  const [userStats, setUserStats] = useState({
    level: 15,
    xp: 2350,
    xpToNext: 400,
    streak: 12,
    totalStudyHours: 87,
    coursesCompleted: 3,
    achievementsUnlocked: 18,
    rank: 'Scholar',
  });

  const [achievements, setAchievements] = useState([
    {
      id: 1,
      title: 'First Steps',
      description: 'Complete your first study session',
      icon: 'footsteps',
      unlocked: true,
      rarity: 'common',
      xp: 50,
      unlockedDate: '2024-01-15',
    },
    {
      id: 2,
      title: 'Speed Learner',
      description: 'Complete 5 lessons in one day',
      icon: 'flash',
      unlocked: true,
      rarity: 'rare',
      xp: 150,
      unlockedDate: '2024-01-18',
    },
    {
      id: 3,
      title: 'Night Owl',
      description: 'Study after 10 PM for 7 days',
      icon: 'moon',
      unlocked: true,
      rarity: 'epic',
      xp: 300,
      unlockedDate: '2024-01-22',
    },
    {
      id: 4,
      title: 'Perfectionist',
      description: 'Score 100% on 10 quizzes',
      icon: 'star',
      unlocked: false,
      rarity: 'legendary',
      xp: 500,
      progress: 7,
      total: 10,
    },
    {
      id: 5,
      title: 'Social Butterfly',
      description: 'Help 20 classmates with questions',
      icon: 'people',
      unlocked: false,
      rarity: 'rare',
      xp: 200,
      progress: 12,
      total: 20,
    },
  ]);

  const [weeklyProgress, setWeeklyProgress] = useState([
    { day: 'Mon', hours: 3.5, completed: true },
    { day: 'Tue', hours: 2.8, completed: true },
    { day: 'Wed', hours: 4.2, completed: true },
    { day: 'Thu', hours: 1.5, completed: false },
    { day: 'Fri', hours: 3.8, completed: true },
    { day: 'Sat', hours: 2.2, completed: true },
    { day: 'Sun', hours: 4.1, completed: true },
  ]);

  const slideAnim = useRef(new Animated.Value(height)).current;
  const progressAnims = useRef(achievements.map(() => new Animated.Value(0))).current;
  const xpBarAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      Animated.spring(slideAnim, {
        toValue: 0,
        tension: 50,
        friction: 8,
        useNativeDriver: true,
      }).start();

      // Animate progress bars
      progressAnims.forEach((anim, index) => {
        const achievement = achievements[index];
        if (achievement.progress) {
          Animated.timing(anim, {
            toValue: achievement.progress / achievement.total,
            duration: 1000,
            delay: index * 200,
            useNativeDriver: false,
          }).start();
        }
      });

      // Animate XP bar
      Animated.timing(xpBarAnim, {
        toValue: userStats.xp / (userStats.xp + userStats.xpToNext),
        duration: 1500,
        useNativeDriver: false,
      }).start();
    } else {
      Animated.timing(slideAnim, {
        toValue: height,
        duration: 300,
        useNativeDriver: true,
      }).start();
    }
  }, [visible]);

  const getRarityColor = (rarity) => {
    switch (rarity) {
      case 'common': return '#95a5a6';
      case 'rare': return '#3498db';
      case 'epic': return '#9b59b6';
      case 'legendary': return '#f39c12';
      default: return '#95a5a6';
    }
  };

  const getRarityGradient = (rarity) => {
    switch (rarity) {
      case 'common': return ['#95a5a6', '#7f8c8d'];
      case 'rare': return ['#3498db', '#2980b9'];
      case 'epic': return ['#9b59b6', '#8e44ad'];
      case 'legendary': return ['#f39c12', '#e67e22'];
      default: return ['#95a5a6', '#7f8c8d'];
    }
  };

  const calculateLevelProgress = () => {
    return (userStats.xp / (userStats.xp + userStats.xpToNext)) * 100;
  };

  const renderOverviewTab = () => (
    <ScrollView showsVerticalScrollIndicator={false}>
      {/* Level & XP Card */}
      <LinearGradient
        colors={['#667eea', '#764ba2']}
        style={styles.levelCard}
      >
        <View style={styles.levelHeader}>
          <View style={styles.levelBadge}>
            <Text style={styles.levelNumber}>{userStats.level}</Text>
          </View>
          <View style={styles.levelInfo}>
            <Text style={styles.levelTitle}>Level {userStats.level}</Text>
            <Text style={styles.rankTitle}>{userStats.rank}</Text>
          </View>
        </View>
        
        <View style={styles.xpContainer}>
          <Text style={styles.xpText}>
            {userStats.xp.toLocaleString()} / {(userStats.xp + userStats.xpToNext).toLocaleString()} XP
          </Text>
          <View style={styles.xpBar}>
            <Animated.View 
              style={[
                styles.xpBarFill,
                {
                  width: xpBarAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: ['0%', '100%'],
                  }),
                }
              ]} 
            />
          </View>
          <Text style={styles.xpToNext}>
            {userStats.xpToNext.toLocaleString()} XP to next level
          </Text>
        </View>
      </LinearGradient>

      {/* Stats Grid */}
      <View style={styles.statsGrid}>
        <View style={styles.statCard}>
          <Ionicons name="flame" size={24} color="#ff6b6b" />
          <Text style={styles.statNumber}>{userStats.streak}</Text>
          <Text style={styles.statLabel}>Day Streak</Text>
        </View>
        
        <View style={styles.statCard}>
          <Ionicons name="time" size={24} color="#4ecdc4" />
          <Text style={styles.statNumber}>{userStats.totalStudyHours}h</Text>
          <Text style={styles.statLabel}>Study Time</Text>
        </View>
        
        <View style={styles.statCard}>
          <Ionicons name="trophy" size={24} color="#ffe66d" />
          <Text style={styles.statNumber}>{userStats.achievementsUnlocked}</Text>
          <Text style={styles.statLabel}>Achievements</Text>
        </View>
        
        <View style={styles.statCard}>
          <Ionicons name="checkmark-circle" size={24} color="#a8e6cf" />
          <Text style={styles.statNumber}>{userStats.coursesCompleted}</Text>
          <Text style={styles.statLabel}>Completed</Text>
        </View>
      </View>

      {/* Weekly Progress */}
      <View style={styles.weeklyCard}>
        <Text style={styles.cardTitle}>Weekly Progress</Text>
        <View style={styles.weeklyChart}>
          {weeklyProgress.map((day, index) => (
            <View key={index} style={styles.dayColumn}>
              <View style={styles.barContainer}>
                <View 
                  style={[
                    styles.progressBar,
                    { 
                      height: (day.hours / 5) * 60,
                      backgroundColor: day.completed ? '#4ecdc4' : '#ddd'
                    }
                  ]} 
                />
              </View>
              <Text style={styles.dayLabel}>{day.day}</Text>
              <Text style={styles.hoursLabel}>{day.hours}h</Text>
            </View>
          ))}
        </View>
      </View>

      {/* Recent Achievements */}
      <View style={styles.recentAchievements}>
        <Text style={styles.cardTitle}>Recent Achievements</Text>
        {achievements.filter(a => a.unlocked).slice(0, 3).map((achievement) => (
          <View key={achievement.id} style={styles.achievementRow}>
            <LinearGradient
              colors={getRarityGradient(achievement.rarity)}
              style={styles.achievementIcon}
            >
              <Ionicons name={achievement.icon} size={20} color="#fff" />
            </LinearGradient>
            <View style={styles.achievementInfo}>
              <Text style={styles.achievementTitle}>{achievement.title}</Text>
              <Text style={styles.achievementDesc}>{achievement.description}</Text>
            </View>
            <View style={styles.achievementXp}>
              <Text style={styles.xpBadge}>+{achievement.xp} XP</Text>
            </View>
          </View>
        ))}
      </View>
    </ScrollView>
  );

  const renderAchievementsTab = () => (
    <ScrollView showsVerticalScrollIndicator={false}>
      {achievements.map((achievement, index) => (
        <View key={achievement.id} style={styles.achievementCard}>
          <View style={styles.achievementCardHeader}>
            <LinearGradient
              colors={getRarityGradient(achievement.rarity)}
              style={[
                styles.achievementCardIcon,
                !achievement.unlocked && styles.achievementLocked
              ]}
            >
              <Ionicons 
                name={achievement.unlocked ? achievement.icon : 'lock-closed'} 
                size={24} 
                color="#fff" 
              />
            </LinearGradient>
            
            <View style={styles.achievementCardInfo}>
              <Text style={[
                styles.achievementCardTitle,
                !achievement.unlocked && styles.achievementLockedText
              ]}>
                {achievement.title}
              </Text>
              <Text style={styles.achievementCardDesc}>
                {achievement.description}
              </Text>
              <Text style={[styles.rarityBadge, { color: getRarityColor(achievement.rarity) }]}>
                {achievement.rarity.toUpperCase()}
              </Text>
            </View>
            
            <View style={styles.achievementReward}>
              <Text style={styles.achievementXpLarge}>
                +{achievement.xp} XP
              </Text>
            </View>
          </View>
          
          {!achievement.unlocked && achievement.progress && (
            <View style={styles.progressSection}>
              <Text style={styles.progressText}>
                Progress: {achievement.progress}/{achievement.total}
              </Text>
              <View style={styles.progressBarContainer}>
                <Animated.View 
                  style={[
                    styles.progressBarFill,
                    {
                      width: progressAnims[index].interpolate({
                        inputRange: [0, 1],
                        outputRange: ['0%', '100%'],
                      }),
                    }
                  ]} 
                />
              </View>
            </View>
          )}
          
          {achievement.unlocked && (
            <View style={styles.unlockedSection}>
              <Ionicons name="checkmark-circle" size={16} color="#4CAF50" />
              <Text style={styles.unlockedText}>
                Unlocked on {new Date(achievement.unlockedDate).toLocaleDateString()}
              </Text>
            </View>
          )}
        </View>
      ))}
    </ScrollView>
  );

  const renderLeaderboardTab = () => (
    <ScrollView showsVerticalScrollIndicator={false}>
      <View style={styles.leaderboardCard}>
        <Text style={styles.cardTitle}>Class Ranking</Text>
        
        {/* Your Position */}
        <View style={[styles.leaderboardRow, styles.currentUser]}>
          <View style={styles.rankBadge}>
            <Text style={styles.rankNumber}>7</Text>
          </View>
          <View style={styles.userInfo}>
            <Text style={styles.userName}>You ({user?.name || 'Student'})</Text>
            <Text style={styles.userStats}>{userStats.xp.toLocaleString()} XP • Level {userStats.level}</Text>
          </View>
          <View style={styles.trendIcon}>
            <Ionicons name="trending-up" size={20} color="#4CAF50" />
          </View>
        </View>

        {/* Top Students */}
        {[
          { rank: 1, name: 'Sarah Johnson', xp: 4250, level: 22, trend: 'up' },
          { rank: 2, name: 'Michael Chen', xp: 3890, level: 20, trend: 'same' },
          { rank: 3, name: 'Emma Davis', xp: 3654, level: 19, trend: 'down' },
          { rank: 4, name: 'James Wilson', xp: 3201, level: 18, trend: 'up' },
          { rank: 5, name: 'Lisa Anderson', xp: 2987, level: 17, trend: 'up' },
          { rank: 6, name: 'David Brown', xp: 2765, level: 16, trend: 'same' },
        ].map((student) => (
          <View key={student.rank} style={styles.leaderboardRow}>
            <View style={[
              styles.rankBadge,
              student.rank <= 3 && styles.topThreeBadge
            ]}>
              <Text style={[
                styles.rankNumber,
                student.rank <= 3 && styles.topThreeText
              ]}>
                {student.rank}
              </Text>
            </View>
            <View style={styles.userInfo}>
              <Text style={styles.userName}>{student.name}</Text>
              <Text style={styles.userStats}>
                {student.xp.toLocaleString()} XP • Level {student.level}
              </Text>
            </View>
            <View style={styles.trendIcon}>
              <Ionicons 
                name={
                  student.trend === 'up' ? 'trending-up' : 
                  student.trend === 'down' ? 'trending-down' : 'remove'
                } 
                size={20} 
                color={
                  student.trend === 'up' ? '#4CAF50' : 
                  student.trend === 'down' ? '#f44336' : '#999'
                } 
              />
            </View>
          </View>
        ))}
      </View>
    </ScrollView>
  );

  if (!visible) return null;

  return (
    <Modal visible={visible} transparent animationType="none">
      <View style={styles.overlay}>
        <Animated.View 
          style={[
            styles.container,
            { transform: [{ translateY: slideAnim }] }
          ]}
        >
          {/* Header */}
          <LinearGradient
            colors={['#667eea', '#764ba2']}
            style={styles.header}
          >
            <View style={styles.headerContent}>
              <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                <Ionicons name="close" size={24} color="#fff" />
              </TouchableOpacity>
              
              <Text style={styles.headerTitle}>Progress Tracker</Text>
              
              <View style={styles.headerStats}>
                <Text style={styles.headerLevel}>Lv.{userStats.level}</Text>
              </View>
            </View>
          </LinearGradient>

          {/* Tab Navigation */}
          <View style={styles.tabContainer}>
            {[
              { id: 'overview', label: 'Overview', icon: 'stats-chart' },
              { id: 'achievements', label: 'Achievements', icon: 'trophy' },
              { id: 'leaderboard', label: 'Ranking', icon: 'podium' },
            ].map((tab) => (
              <TouchableOpacity
                key={tab.id}
                style={[
                  styles.tab,
                  selectedTab === tab.id && styles.activeTab
                ]}
                onPress={() => setSelectedTab(tab.id)}
              >
                <Ionicons 
                  name={tab.icon} 
                  size={20} 
                  color={selectedTab === tab.id ? '#667eea' : '#999'} 
                />
                <Text style={[
                  styles.tabLabel,
                  selectedTab === tab.id && styles.activeTabLabel
                ]}>
                  {tab.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Content */}
          <View style={styles.content}>
            {selectedTab === 'overview' && renderOverviewTab()}
            {selectedTab === 'achievements' && renderAchievementsTab()}
            {selectedTab === 'leaderboard' && renderLeaderboardTab()}
          </View>
        </Animated.View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  container: {
    flex: 1,
    marginTop: 50,
    backgroundColor: '#fff',
    borderTopLeftRadius: 25,
    borderTopRightRadius: 25,
  },
  header: {
    paddingTop: 20,
    paddingBottom: 15,
    paddingHorizontal: 20,
    borderTopLeftRadius: 25,
    borderTopRightRadius: 25,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  closeButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
  },
  headerStats: {
    alignItems: 'flex-end',
  },
  headerLevel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#f8f9fa',
    paddingHorizontal: 20,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 15,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  activeTab: {
    borderBottomColor: '#667eea',
  },
  tabLabel: {
    fontSize: 14,
    color: '#999',
    marginLeft: 6,
    fontWeight: '500',
  },
  activeTabLabel: {
    color: '#667eea',
    fontWeight: '600',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  
  // Overview Tab Styles
  levelCard: {
    borderRadius: 20,
    padding: 25,
    marginBottom: 20,
  },
  levelHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  levelBadge: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  levelNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
  },
  levelInfo: {
    flex: 1,
  },
  levelTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
  },
  rankTitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.8)',
    marginTop: 4,
  },
  xpContainer: {
    alignItems: 'center',
  },
  xpText: {
    fontSize: 16,
    color: '#fff',
    fontWeight: '600',
    marginBottom: 10,
  },
  xpBar: {
    width: '100%',
    height: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 4,
    marginBottom: 8,
  },
  xpBarFill: {
    height: '100%',
    backgroundColor: '#fff',
    borderRadius: 4,
  },
  xpToNext: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  statCard: {
    width: '48%',
    backgroundColor: '#fff',
    borderRadius: 15,
    padding: 20,
    alignItems: 'center',
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 10,
  },
  statLabel: {
    fontSize: 12,
    color: '#999',
    marginTop: 5,
    textAlign: 'center',
  },
  
  weeklyCard: {
    backgroundColor: '#fff',
    borderRadius: 15,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 15,
  },
  weeklyChart: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    height: 80,
  },
  dayColumn: {
    alignItems: 'center',
    flex: 1,
  },
  barContainer: {
    height: 60,
    justifyContent: 'flex-end',
    marginBottom: 5,
  },
  progressBar: {
    width: 20,
    borderRadius: 10,
  },
  dayLabel: {
    fontSize: 12,
    color: '#666',
    fontWeight: '500',
  },
  hoursLabel: {
    fontSize: 10,
    color: '#999',
    marginTop: 2,
  },
  
  recentAchievements: {
    backgroundColor: '#fff',
    borderRadius: 15,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  achievementRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  achievementIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  achievementInfo: {
    flex: 1,
  },
  achievementTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  achievementDesc: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  achievementXp: {
    backgroundColor: '#f0f8ff',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  xpBadge: {
    fontSize: 12,
    color: '#667eea',
    fontWeight: '600',
  },
  
  // Achievements Tab Styles
  achievementCard: {
    backgroundColor: '#fff',
    borderRadius: 15,
    padding: 20,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  achievementCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  achievementCardIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  achievementLocked: {
    opacity: 0.5,
  },
  achievementCardInfo: {
    flex: 1,
  },
  achievementCardTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  achievementLockedText: {
    color: '#999',
  },
  achievementCardDesc: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  rarityBadge: {
    fontSize: 12,
    fontWeight: '600',
    marginTop: 6,
  },
  achievementReward: {
    alignItems: 'flex-end',
  },
  achievementXpLarge: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#667eea',
  },
  progressSection: {
    marginTop: 15,
    paddingTop: 15,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  progressText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  progressBarContainer: {
    height: 6,
    backgroundColor: '#f0f0f0',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#667eea',
    borderRadius: 3,
  },
  unlockedSection: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 15,
    paddingTop: 15,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  unlockedText: {
    fontSize: 12,
    color: '#4CAF50',
    marginLeft: 6,
    fontWeight: '500',
  },
  
  // Leaderboard Tab Styles
  leaderboardCard: {
    backgroundColor: '#fff',
    borderRadius: 15,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  leaderboardRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  currentUser: {
    backgroundColor: '#f0f8ff',
    borderRadius: 10,
    paddingHorizontal: 15,
    marginBottom: 15,
    borderBottomWidth: 0,
  },
  rankBadge: {
    width: 35,
    height: 35,
    borderRadius: 17.5,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  topThreeBadge: {
    backgroundColor: '#FFD700',
  },
  rankNumber: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#666',
  },
  topThreeText: {
    color: '#fff',
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  userStats: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  trendIcon: {
    marginLeft: 10,
  },
});

export default GamifiedProgress;
