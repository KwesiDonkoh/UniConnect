import { 
  collection, 
  query,
  where,
  orderBy,
  getDocs,
  onSnapshot,
  doc,
  getDoc,
  Timestamp
} from 'firebase/firestore';
import { db } from '../config/firebaseConfig';

class AnalyticsService {
  constructor() {
    this.listeners = new Map();
  }

  // Get comprehensive course analytics
  async getCourseAnalytics(courseCode, timeRange = '30d') {
    try {
      const endDate = new Date();
      const startDate = new Date();
      
      // Calculate date range
      switch (timeRange) {
        case '7d':
          startDate.setDate(endDate.getDate() - 7);
          break;
        case '30d':
          startDate.setDate(endDate.getDate() - 30);
          break;
        case '90d':
          startDate.setDate(endDate.getDate() - 90);
          break;
        case '1y':
          startDate.setFullYear(endDate.getFullYear() - 1);
          break;
        default:
          startDate.setDate(endDate.getDate() - 30);
      }

      const analytics = {
        overview: await this.getCourseOverview(courseCode),
        engagement: await this.getEngagementMetrics(courseCode, startDate, endDate),
        assignments: await this.getAssignmentAnalytics(courseCode, startDate, endDate),
        attendance: await this.getAttendanceAnalytics(courseCode, startDate, endDate),
        communication: await this.getCommunicationAnalytics(courseCode, startDate, endDate),
        performance: await this.getPerformanceAnalytics(courseCode),
        trending: await this.getTrendingData(courseCode, startDate, endDate),
      };

      return { success: true, analytics };
    } catch (error) {
      console.error('Error getting course analytics:', error);
      return { success: false, error: error.message };
    }
  }

  // Get course overview statistics
  async getCourseOverview(courseCode) {
    try {
      // Get enrolled students
      const studentsQuery = query(
        collection(db, 'users'),
        where('enrolledCourses', 'array-contains', courseCode),
        where('userType', '==', 'student')
      );
      const studentsSnapshot = await getDocs(studentsQuery);
      const totalStudents = studentsSnapshot.size;

      // Get active students (students who've been active in the last 7 days)
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      
      const activeStudentsQuery = query(
        collection(db, 'userActivity'),
        where('courseCode', '==', courseCode),
        where('lastActive', '>=', Timestamp.fromDate(sevenDaysAgo))
      );
      const activeStudentsSnapshot = await getDocs(activeStudentsQuery);
      const activeStudents = activeStudentsSnapshot.size;

      // Get total assignments
      const assignmentsQuery = query(
        collection(db, 'assignments'),
        where('courseCode', '==', courseCode)
      );
      const assignmentsSnapshot = await getDocs(assignmentsQuery);
      const totalAssignments = assignmentsSnapshot.size;

      // Get total materials
      const materialsQuery = query(
        collection(db, 'courseMaterials'),
        where('courseCode', '==', courseCode)
      );
      const materialsSnapshot = await getDocs(materialsQuery);
      const totalMaterials = materialsSnapshot.size;

      return {
        totalStudents,
        activeStudents,
        totalAssignments,
        totalMaterials,
        engagementRate: totalStudents > 0 ? (activeStudents / totalStudents) * 100 : 0,
      };
    } catch (error) {
      console.error('Error getting course overview:', error);
      return {};
    }
  }

  // Get engagement metrics
  async getEngagementMetrics(courseCode, startDate, endDate) {
    try {
      // Chat activity
      const chatQuery = query(
        collection(db, 'chatMessages', courseCode, 'messages'),
        where('timestamp', '>=', Timestamp.fromDate(startDate)),
        where('timestamp', '<=', Timestamp.fromDate(endDate)),
        orderBy('timestamp', 'desc')
      );
      const chatSnapshot = await getDocs(chatQuery);
      
      // Process chat data
      const chatMetrics = this.processChatMetrics(chatSnapshot);

      // Material downloads
      const materialsQuery = query(
        collection(db, 'materialDownloads'),
        where('courseCode', '==', courseCode),
        where('downloadedAt', '>=', Timestamp.fromDate(startDate)),
        where('downloadedAt', '<=', Timestamp.fromDate(endDate))
      );
      const materialsSnapshot = await getDocs(materialsQuery);

      // Assignment submissions
      const submissionsQuery = query(
        collection(db, 'submissions'),
        where('courseCode', '==', courseCode),
        where('submittedAt', '>=', Timestamp.fromDate(startDate)),
        where('submittedAt', '<=', Timestamp.fromDate(endDate))
      );
      const submissionsSnapshot = await getDocs(submissionsQuery);

      return {
        chatMessages: chatSnapshot.size,
        materialDownloads: materialsSnapshot.size,
        assignmentSubmissions: submissionsSnapshot.size,
        dailyActivity: this.generateDailyActivityChart(startDate, endDate, [
          { data: chatSnapshot, field: 'timestamp' },
          { data: materialsSnapshot, field: 'downloadedAt' },
          { data: submissionsSnapshot, field: 'submittedAt' }
        ]),
        topContributors: chatMetrics.topContributors,
        peakHours: chatMetrics.peakHours,
      };
    } catch (error) {
      console.error('Error getting engagement metrics:', error);
      return {};
    }
  }

  // Get assignment analytics
  async getAssignmentAnalytics(courseCode, startDate, endDate) {
    try {
      const assignmentsQuery = query(
        collection(db, 'assignments'),
        where('courseCode', '==', courseCode),
        where('createdAt', '>=', Timestamp.fromDate(startDate)),
        where('createdAt', '<=', Timestamp.fromDate(endDate))
      );
      const assignmentsSnapshot = await getDocs(assignmentsQuery);

      const assignments = [];
      assignmentsSnapshot.forEach(doc => {
        assignments.push({ id: doc.id, ...doc.data() });
      });

      // Calculate assignment metrics
      const totalAssignments = assignments.length;
      const totalSubmissions = assignments.reduce((sum, a) => sum + (a.totalSubmissions || 0), 0);
      const gradedSubmissions = assignments.reduce((sum, a) => sum + (a.gradedSubmissions || 0), 0);
      const averageGrade = assignments.length > 0 ? 
        assignments.reduce((sum, a) => sum + (a.averageGrade || 0), 0) / assignments.length : 0;

      // Get submission trends
      const submissionTrends = await this.getSubmissionTrends(courseCode, startDate, endDate);

      return {
        totalAssignments,
        totalSubmissions,
        gradedSubmissions,
        pendingGrading: totalSubmissions - gradedSubmissions,
        averageGrade: Math.round(averageGrade * 100) / 100,
        submissionRate: totalAssignments > 0 ? (totalSubmissions / totalAssignments) * 100 : 0,
        trends: submissionTrends,
        gradeDistribution: await this.getGradeDistribution(courseCode),
      };
    } catch (error) {
      console.error('Error getting assignment analytics:', error);
      return {};
    }
  }

  // Get attendance analytics
  async getAttendanceAnalytics(courseCode, startDate, endDate) {
    try {
      const attendanceQuery = query(
        collection(db, 'attendance'),
        where('courseCode', '==', courseCode),
        where('date', '>=', Timestamp.fromDate(startDate)),
        where('date', '<=', Timestamp.fromDate(endDate))
      );
      const attendanceSnapshot = await getDocs(attendanceQuery);

      const attendanceRecords = [];
      attendanceSnapshot.forEach(doc => {
        attendanceRecords.push(doc.data());
      });

      // Calculate attendance metrics
      const totalClasses = new Set(attendanceRecords.map(r => r.classId)).size;
      const totalAttendance = attendanceRecords.filter(r => r.status === 'present').length;
      const totalAbsences = attendanceRecords.filter(r => r.status === 'absent').length;
      const attendanceRate = totalAttendance + totalAbsences > 0 ? 
        (totalAttendance / (totalAttendance + totalAbsences)) * 100 : 0;

      return {
        totalClasses,
        averageAttendanceRate: Math.round(attendanceRate * 100) / 100,
        totalPresent: totalAttendance,
        totalAbsent: totalAbsences,
        attendanceTrends: this.generateAttendanceTrends(attendanceRecords),
        studentAttendance: this.getStudentAttendanceRanking(attendanceRecords),
      };
    } catch (error) {
      console.error('Error getting attendance analytics:', error);
      return {};
    }
  }

  // Get communication analytics
  async getCommunicationAnalytics(courseCode, startDate, endDate) {
    try {
      // Voice/Video calls
      const callsQuery = query(
        collection(db, 'calls'),
        where('courseCode', '==', courseCode),
        where('createdAt', '>=', Timestamp.fromDate(startDate)),
        where('createdAt', '<=', Timestamp.fromDate(endDate))
      );
      const callsSnapshot = await getDocs(callsQuery);

      // Voice messages
      const voiceMessagesQuery = query(
        collection(db, 'chatMessages', courseCode, 'messages'),
        where('type', '==', 'voice'),
        where('timestamp', '>=', Timestamp.fromDate(startDate)),
        where('timestamp', '<=', Timestamp.fromDate(endDate))
      );
      const voiceMessagesSnapshot = await getDocs(voiceMessagesQuery);

      return {
        totalCalls: callsSnapshot.size,
        voiceMessages: voiceMessagesSnapshot.size,
        callDuration: 0, // Would need to calculate from call data
        communicationTrends: this.generateCommunicationTrends(startDate, endDate, callsSnapshot, voiceMessagesSnapshot),
      };
    } catch (error) {
      console.error('Error getting communication analytics:', error);
      return {};
    }
  }

  // Get performance analytics
  async getPerformanceAnalytics(courseCode) {
    try {
      // Get all submissions for the course
      const submissionsQuery = query(
        collection(db, 'submissions'),
        where('courseCode', '==', courseCode),
        where('grade', '!=', null)
      );
      const submissionsSnapshot = await getDocs(submissionsQuery);

      const submissions = [];
      submissionsSnapshot.forEach(doc => {
        submissions.push(doc.data());
      });

      // Calculate performance metrics
      const grades = submissions.map(s => s.grade);
      const averageGrade = grades.length > 0 ? grades.reduce((sum, g) => sum + g, 0) / grades.length : 0;
      const highestGrade = grades.length > 0 ? Math.max(...grades) : 0;
      const lowestGrade = grades.length > 0 ? Math.min(...grades) : 0;

      // Performance distribution
      const performanceDistribution = this.calculatePerformanceDistribution(grades);

      // Top performers
      const topPerformers = this.getTopPerformers(submissions);

      return {
        averageGrade: Math.round(averageGrade * 100) / 100,
        highestGrade,
        lowestGrade,
        totalGradedAssignments: submissions.length,
        performanceDistribution,
        topPerformers,
        improvementTrends: this.calculateImprovementTrends(submissions),
      };
    } catch (error) {
      console.error('Error getting performance analytics:', error);
      return {};
    }
  }

  // Get trending data
  async getTrendingData(courseCode, startDate, endDate) {
    try {
      // Most downloaded materials
      const materialsQuery = query(
        collection(db, 'courseMaterials'),
        where('courseCode', '==', courseCode),
        orderBy('downloads', 'desc')
      );
      const materialsSnapshot = await getDocs(materialsQuery);

      const trendingMaterials = [];
      materialsSnapshot.forEach(doc => {
        if (trendingMaterials.length < 5) {
          trendingMaterials.push(doc.data());
        }
      });

      // Most active discussion topics (based on chat keywords)
      const chatQuery = query(
        collection(db, 'chatMessages', courseCode, 'messages'),
        where('timestamp', '>=', Timestamp.fromDate(startDate)),
        where('timestamp', '<=', Timestamp.fromDate(endDate))
      );
      const chatSnapshot = await getDocs(chatQuery);

      const topics = this.extractTrendingTopics(chatSnapshot);

      return {
        trendingMaterials,
        trendingTopics: topics,
        popularTimes: this.getPopularTimes(chatSnapshot),
      };
    } catch (error) {
      console.error('Error getting trending data:', error);
      return {};
    }
  }

  // Helper methods
  processChatMetrics(chatSnapshot) {
    const messages = [];
    const userCounts = {};
    const hourCounts = new Array(24).fill(0);

    chatSnapshot.forEach(doc => {
      const data = doc.data();
      messages.push(data);
      
      // Count messages per user
      userCounts[data.senderId] = (userCounts[data.senderId] || 0) + 1;
      
      // Count messages per hour
      const hour = data.timestamp?.toDate().getHours() || 0;
      hourCounts[hour]++;
    });

    // Get top contributors
    const topContributors = Object.entries(userCounts)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5)
      .map(([userId, count]) => ({ userId, messageCount: count }));

    // Get peak hours
    const peakHour = hourCounts.indexOf(Math.max(...hourCounts));

    return {
      topContributors,
      peakHours: peakHour,
    };
  }

  generateDailyActivityChart(startDate, endDate, dataSources) {
    const days = [];
    const currentDate = new Date(startDate);
    
    while (currentDate <= endDate) {
      const dayStr = currentDate.toISOString().split('T')[0];
      days.push({
        date: dayStr,
        activity: 0,
      });
      currentDate.setDate(currentDate.getDate() + 1);
    }

    // Process each data source and add to daily activity
    dataSources.forEach(source => {
      source.data.forEach(doc => {
        const data = doc.data();
        const docDate = data[source.field]?.toDate();
        if (docDate) {
          const dayStr = docDate.toISOString().split('T')[0];
          const dayIndex = days.findIndex(d => d.date === dayStr);
          if (dayIndex !== -1) {
            days[dayIndex].activity++;
          }
        }
      });
    });

    return days;
  }

  calculatePerformanceDistribution(grades) {
    const distribution = {
      'A (90-100)': 0,
      'B (80-89)': 0,
      'C (70-79)': 0,
      'D (60-69)': 0,
      'F (0-59)': 0,
    };
    
    grades.forEach(grade => {
      if (grade >= 90) distribution['A (90-100)']++;
      else if (grade >= 80) distribution['B (80-89)']++;
      else if (grade >= 70) distribution['C (70-79)']++;
      else if (grade >= 60) distribution['D (60-69)']++;
      else distribution['F (0-59)']++;
    });
    
    return distribution;
  }

  // Real-time analytics updates
  listenToAnalytics(courseCode, callback) {
    // This would set up real-time listeners for key metrics
    const unsubscribe = onSnapshot(
      collection(db, 'analytics', courseCode),
      (snapshot) => {
        const analytics = {};
        snapshot.forEach(doc => {
          analytics[doc.id] = doc.data();
        });
        callback(analytics);
      }
    );

    this.listeners.set(courseCode, unsubscribe);
    return unsubscribe;
  }

  // Export analytics data
  async exportAnalytics(courseCode, format = 'json') {
    try {
      const analytics = await this.getCourseAnalytics(courseCode);
      
      if (format === 'csv') {
        return this.convertToCSV(analytics.analytics);
      }
      
      return analytics.analytics;
    } catch (error) {
      console.error('Error exporting analytics:', error);
      return null;
    }
  }

  // Clean up listeners
  cleanup() {
    this.listeners.forEach(unsubscribe => unsubscribe());
    this.listeners.clear();
  }
}

export default new AnalyticsService();
