import { 
  collection, 
  addDoc, 
  query, 
  where, 
  orderBy, 
  onSnapshot, 
  serverTimestamp, 
  doc, 
  updateDoc,
  getDocs,
  setDoc
} from 'firebase/firestore';
import { db } from '../config/firebaseConfig';

class AchievementsService {
  constructor() {
    this.currentUserId = null;
    this.achievementListeners = new Map();
  }

  setCurrentUser(user) {
    this.currentUserId = user?.uid || null;
  }

  // Achievement definitions
  getAchievementDefinitions() {
    return {
      // Study Achievements
      first_message: {
        id: 'first_message',
        title: 'First Message',
        description: 'Send your first message in a course chat',
        icon: '💬',
        category: 'communication',
        points: 10,
        rarity: 'common'
      },
      voice_pioneer: {
        id: 'voice_pioneer',
        title: 'Voice Pioneer',
        description: 'Send your first voice message',
        icon: '🎤',
        category: 'communication',
        points: 15,
        rarity: 'common'
      },
      video_caller: {
        id: 'video_caller',
        title: 'Video Caller',
        description: 'Make your first video call',
        icon: '📹',
        category: 'communication',
        points: 20,
        rarity: 'uncommon'
      },
      file_sharer: {
        id: 'file_sharer',
        title: 'File Sharer',
        description: 'Upload your first course material',
        icon: '📁',
        category: 'academic',
        points: 15,
        rarity: 'common'
      },
      study_streak_3: {
        id: 'study_streak_3',
        title: 'Study Streak',
        description: 'Study for 3 consecutive days',
        icon: '🔥',
        category: 'study',
        points: 25,
        rarity: 'uncommon'
      },
      study_streak_7: {
        id: 'study_streak_7',
        title: 'Weekly Warrior',
        description: 'Study for 7 consecutive days',
        icon: '⚡',
        category: 'study',
        points: 50,
        rarity: 'rare'
      },
      early_bird: {
        id: 'early_bird',
        title: 'Early Bird',
        description: 'Log in before 7 AM',
        icon: '🌅',
        category: 'habit',
        points: 10,
        rarity: 'common'
      },
      night_owl: {
        id: 'night_owl',
        title: 'Night Owl',
        description: 'Study after 10 PM',
        icon: '🦉',
        category: 'habit',
        points: 10,
        rarity: 'common'
      },
      social_butterfly: {
        id: 'social_butterfly',
        title: 'Social Butterfly',
        description: 'Send 50 messages in course chats',
        icon: '🦋',
        category: 'social',
        points: 30,
        rarity: 'uncommon'
      },
      course_completionist: {
        id: 'course_completionist',
        title: 'Course Completionist',
        description: 'Complete all materials in a course',
        icon: '🏆',
        category: 'academic',
        points: 100,
        rarity: 'epic'
      },
      perfect_attendance: {
        id: 'perfect_attendance',
        title: 'Perfect Attendance',
        description: 'Log in every day for a month',
        icon: '📅',
        category: 'habit',
        points: 75,
        rarity: 'rare'
      },
      mentor: {
        id: 'mentor',
        title: 'Mentor',
        description: 'Help 10 students with questions',
        icon: '👨‍🏫',
        category: 'social',
        points: 60,
        rarity: 'rare'
      }
    };
  }

  // Award achievement to user
  async awardAchievement(userId, achievementId) {
    try {
      const achievements = this.getAchievementDefinitions();
      const achievement = achievements[achievementId];
      
      if (!achievement) {
        console.error('Achievement not found:', achievementId);
        return { success: false, error: 'Achievement not found' };
      }

      // Check if user already has this achievement
      const userAchievementsRef = collection(db, 'userAchievements');
      const q = query(
        userAchievementsRef,
        where('userId', '==', userId),
        where('achievementId', '==', achievementId)
      );
      
      const existingAchievements = await getDocs(q);
      if (!existingAchievements.empty) {
        return { success: false, error: 'Achievement already awarded' };
      }

      // Award the achievement
      const achievementData = {
        userId,
        achievementId,
        title: achievement.title,
        description: achievement.description,
        icon: achievement.icon,
        category: achievement.category,
        points: achievement.points,
        rarity: achievement.rarity,
        awardedAt: serverTimestamp(),
        isNew: true
      };

      await addDoc(userAchievementsRef, achievementData);

      // Update user's total points
      await this.updateUserPoints(userId, achievement.points);

      console.log(`Achievement awarded: ${achievement.title} to user ${userId}`);
      return { success: true, achievement: achievementData };
    } catch (error) {
      console.error('Error awarding achievement:', error);
      return { success: false, error: error.message };
    }
  }

  // Update user's total achievement points
  async updateUserPoints(userId, pointsToAdd) {
    try {
      const userStatsRef = doc(db, 'userStats', userId);
      const userStatsSnapshot = await getDocs(query(collection(db, 'userStats'), where('userId', '==', userId)));
      
      let currentPoints = 0;
      if (!userStatsSnapshot.empty) {
        currentPoints = userStatsSnapshot.docs[0].data().totalPoints || 0;
      }

      const newTotalPoints = currentPoints + pointsToAdd;
      
      await setDoc(userStatsRef, {
        userId,
        totalPoints: newTotalPoints,
        lastUpdated: serverTimestamp()
      }, { merge: true });

      return { success: true, newTotal: newTotalPoints };
    } catch (error) {
      console.error('Error updating user points:', error);
      return { success: false, error: error.message };
    }
  }

  // Get user's achievements
  async getUserAchievements(userId) {
    try {
      const userAchievementsRef = collection(db, 'userAchievements');
      const q = query(
        userAchievementsRef,
        where('userId', '==', userId)
      );
      
      const snapshot = await getDocs(q);
      const achievements = [];
      
      snapshot.forEach((doc) => {
        achievements.push({
          id: doc.id,
          ...doc.data(),
          awardedAt: doc.data().awardedAt?.toDate?.() || new Date()
        });
      });
      
      // Sort in memory to avoid index requirements
      achievements.sort((a, b) => b.awardedAt - a.awardedAt);
      
      return { success: true, achievements };
    } catch (error) {
      console.error('Error getting user achievements:', error);
      return { success: false, error: error.message, achievements: [] };
    }
  }

  // Listen to user's achievements in real-time
  listenToUserAchievements(userId, callback) {
    const userAchievementsRef = collection(db, 'userAchievements');
    const q = query(
      userAchievementsRef,
      where('userId', '==', userId)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const achievements = [];
      snapshot.forEach((doc) => {
        achievements.push({
          id: doc.id,
          ...doc.data(),
          awardedAt: doc.data().awardedAt?.toDate?.() || new Date()
        });
      });
      
      callback(achievements);
    }, (error) => {
      console.error('Error listening to achievements:', error);
      callback([]);
    });

    this.achievementListeners.set(userId, unsubscribe);
    return unsubscribe;
  }

  // Check and award achievements based on user actions
  async checkAndAwardAchievements(userId, action, data = {}) {
    try {
      const achievements = [];

      switch (action) {
        case 'first_message':
          achievements.push('first_message');
          break;
        
        case 'first_voice_message':
          achievements.push('voice_pioneer');
          break;
        
        case 'first_video_call':
          achievements.push('video_caller');
          break;
        
        case 'first_file_upload':
          achievements.push('file_sharer');
          break;
        
        case 'early_login':
          const hour = new Date().getHours();
          if (hour < 7) {
            achievements.push('early_bird');
          } else if (hour >= 22) {
            achievements.push('night_owl');
          }
          break;
        
        case 'message_milestone':
          if (data.messageCount === 50) {
            achievements.push('social_butterfly');
          }
          break;
        
        case 'study_streak':
          if (data.streakDays === 3) {
            achievements.push('study_streak_3');
          } else if (data.streakDays === 7) {
            achievements.push('study_streak_7');
          } else if (data.streakDays === 30) {
            achievements.push('perfect_attendance');
          }
          break;
      }

      // Award all applicable achievements
      const results = [];
      for (const achievementId of achievements) {
        const result = await this.awardAchievement(userId, achievementId);
        if (result.success) {
          results.push(result.achievement);
        }
      }

      return { success: true, newAchievements: results };
    } catch (error) {
      console.error('Error checking achievements:', error);
      return { success: false, error: error.message, newAchievements: [] };
    }
  }

  // Get achievement progress for gamification
  async getAchievementProgress(userId) {
    try {
      const userAchievements = await this.getUserAchievements(userId);
      const allAchievements = this.getAchievementDefinitions();
      
      const progress = {
        total: Object.keys(allAchievements).length,
        earned: userAchievements.achievements.length,
        percentage: Math.round((userAchievements.achievements.length / Object.keys(allAchievements).length) * 100),
        categories: {}
      };

      // Calculate progress by category
      const categories = ['communication', 'academic', 'study', 'habit', 'social'];
      categories.forEach(category => {
        const categoryAchievements = Object.values(allAchievements).filter(a => a.category === category);
        const earnedInCategory = userAchievements.achievements.filter(a => a.category === category);
        
        progress.categories[category] = {
          total: categoryAchievements.length,
          earned: earnedInCategory.length,
          percentage: Math.round((earnedInCategory.length / categoryAchievements.length) * 100)
        };
      });

      return { success: true, progress };
    } catch (error) {
      console.error('Error getting achievement progress:', error);
      return { success: false, error: error.message };
    }
  }

  // Clean up listeners
  cleanup() {
    this.achievementListeners.forEach((unsubscribe) => {
      if (typeof unsubscribe === 'function') {
        unsubscribe();
      }
    });
    this.achievementListeners.clear();
  }
}

const achievementsService = new AchievementsService();
export default achievementsService;
