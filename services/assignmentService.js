import { 
  collection, 
  addDoc, 
  serverTimestamp, 
  doc, 
  updateDoc,
  getDoc,
  query,
  where,
  orderBy,
  onSnapshot,
  getDocs,
  deleteDoc,
  arrayUnion,
  arrayRemove,
  increment
} from 'firebase/firestore';
import { db } from '../config/firebaseConfig';

class AssignmentService {
  constructor() {
    this.assignmentListeners = new Map();
    this.submissionListeners = new Map();
  }

  // Create new assignment
  async createAssignment(assignmentData) {
    try {
      const assignment = {
        ...assignmentData,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        status: 'active',
        totalSubmissions: 0,
        gradedSubmissions: 0,
        averageGrade: 0,
        submissions: [],
      };

      const docRef = await addDoc(collection(db, 'assignments'), assignment);
      
      // Send notification to students
      await this.notifyStudentsAboutAssignment(docRef.id, assignmentData);
      
      return { success: true, assignmentId: docRef.id };
    } catch (error) {
      console.error('Error creating assignment:', error);
      return { success: false, error: error.message };
    }
  }

  // Update assignment
  async updateAssignment(assignmentId, updates) {
    try {
      await updateDoc(doc(db, 'assignments', assignmentId), {
        ...updates,
        updatedAt: serverTimestamp(),
      });
      
      return { success: true };
    } catch (error) {
      console.error('Error updating assignment:', error);
      return { success: false, error: error.message };
    }
  }

  // Submit assignment
  async submitAssignment(assignmentId, submissionData) {
    try {
      const submission = {
        ...submissionData,
        assignmentId,
        submittedAt: serverTimestamp(),
        status: 'submitted',
        grade: null,
        feedback: '',
        gradedAt: null,
        gradedBy: null,
        attempts: 1,
      };

      // Add submission to submissions collection
      const submissionRef = await addDoc(collection(db, 'submissions'), submission);
      
      // Update assignment with submission count
      await updateDoc(doc(db, 'assignments', assignmentId), {
        totalSubmissions: increment(1),
        submissions: arrayUnion(submissionRef.id),
        updatedAt: serverTimestamp(),
      });
      
      return { success: true, submissionId: submissionRef.id };
    } catch (error) {
      console.error('Error submitting assignment:', error);
      return { success: false, error: error.message };
    }
  }

  // Grade submission
  async gradeSubmission(submissionId, grade, feedback, gradedBy) {
    try {
      const submissionRef = doc(db, 'submissions', submissionId);
      const submissionDoc = await getDoc(submissionRef);
      
      if (!submissionDoc.exists()) {
        return { success: false, error: 'Submission not found' };
      }

      const submissionData = submissionDoc.data();
      
      await updateDoc(submissionRef, {
        grade,
        feedback,
        gradedBy,
        gradedAt: serverTimestamp(),
        status: 'graded',
      });

      // Update assignment statistics
      const assignmentRef = doc(db, 'assignments', submissionData.assignmentId);
      const assignmentDoc = await getDoc(assignmentRef);
      
      if (assignmentDoc.exists()) {
        const assignmentData = assignmentDoc.data();
        const newGradedCount = (assignmentData.gradedSubmissions || 0) + 1;
        
        // Calculate new average grade
        const submissions = await this.getAssignmentSubmissions(submissionData.assignmentId);
        const gradedSubmissions = submissions.filter(s => s.grade !== null);
        const totalGrade = gradedSubmissions.reduce((sum, s) => sum + s.grade, 0);
        const averageGrade = totalGrade / gradedSubmissions.length;
        
        await updateDoc(assignmentRef, {
          gradedSubmissions: newGradedCount,
          averageGrade,
          updatedAt: serverTimestamp(),
        });
      }
      
      // Notify student about grade
      await this.notifyStudentAboutGrade(submissionData.studentId, submissionId, grade);
      
      return { success: true };
    } catch (error) {
      console.error('Error grading submission:', error);
      return { success: false, error: error.message };
    }
  }

  // Get assignments for course
  async getCourseAssignments(courseCode, userType = 'student') {
    try {
      let q = query(
        collection(db, 'assignments'),
        where('courseCode', '==', courseCode),
        orderBy('createdAt', 'desc')
      );
      
      if (userType === 'student') {
        q = query(q, where('status', '==', 'active'));
      }
      
      const snapshot = await getDocs(q);
      const assignments = [];
      
      snapshot.forEach(doc => {
        const data = doc.data();
        assignments.push({
          id: doc.id,
          ...data,
          createdAt: data.createdAt?.toDate(),
          updatedAt: data.updatedAt?.toDate(),
          dueDate: data.dueDate?.toDate(),
        });
      });
      
      return { success: true, assignments };
    } catch (error) {
      console.error('Error getting course assignments:', error);
      return { success: false, error: error.message };
    }
  }

  // Get assignment submissions
  async getAssignmentSubmissions(assignmentId) {
    try {
      const q = query(
        collection(db, 'submissions'),
        where('assignmentId', '==', assignmentId),
        orderBy('submittedAt', 'desc')
      );
      
      const snapshot = await getDocs(q);
      const submissions = [];
      
      snapshot.forEach(doc => {
        const data = doc.data();
        submissions.push({
          id: doc.id,
          ...data,
          submittedAt: data.submittedAt?.toDate(),
          gradedAt: data.gradedAt?.toDate(),
        });
      });
      
      return submissions;
    } catch (error) {
      console.error('Error getting assignment submissions:', error);
      return [];
    }
  }

  // Get student submission for assignment
  async getStudentSubmission(assignmentId, studentId) {
    try {
      const q = query(
        collection(db, 'submissions'),
        where('assignmentId', '==', assignmentId),
        where('studentId', '==', studentId)
      );
      
      const snapshot = await getDocs(q);
      
      if (!snapshot.empty) {
        const doc = snapshot.docs[0];
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          submittedAt: data.submittedAt?.toDate(),
          gradedAt: data.gradedAt?.toDate(),
        };
      }
      
      return null;
    } catch (error) {
      console.error('Error getting student submission:', error);
      return null;
    }
  }

  // Listen to assignments real-time
  listenToAssignments(courseCode, callback, userType = 'student') {
    try {
      let q = query(
        collection(db, 'assignments'),
        where('courseCode', '==', courseCode),
        orderBy('createdAt', 'desc')
      );
      
      if (userType === 'student') {
        q = query(q, where('status', '==', 'active'));
      }
      
      const unsubscribe = onSnapshot(q, (snapshot) => {
        const assignments = [];
        snapshot.forEach(doc => {
          const data = doc.data();
          assignments.push({
            id: doc.id,
            ...data,
            createdAt: data.createdAt?.toDate(),
            updatedAt: data.updatedAt?.toDate(),
            dueDate: data.dueDate?.toDate(),
          });
        });
        callback(assignments);
      });
      
      this.assignmentListeners.set(`${courseCode}_${userType}`, unsubscribe);
      return unsubscribe;
    } catch (error) {
      console.error('Error listening to assignments:', error);
      callback([]);
    }
  }

  // Listen to submissions real-time
  listenToSubmissions(assignmentId, callback) {
    try {
      const q = query(
        collection(db, 'submissions'),
        where('assignmentId', '==', assignmentId),
        orderBy('submittedAt', 'desc')
      );
      
      const unsubscribe = onSnapshot(q, (snapshot) => {
        const submissions = [];
        snapshot.forEach(doc => {
          const data = doc.data();
          submissions.push({
            id: doc.id,
            ...data,
            submittedAt: data.submittedAt?.toDate(),
            gradedAt: data.gradedAt?.toDate(),
          });
        });
        callback(submissions);
      });
      
      this.submissionListeners.set(assignmentId, unsubscribe);
      return unsubscribe;
    } catch (error) {
      console.error('Error listening to submissions:', error);
      callback([]);
    }
  }

  // Delete assignment
  async deleteAssignment(assignmentId) {
    try {
      // Delete all submissions first
      const submissions = await this.getAssignmentSubmissions(assignmentId);
      const deletePromises = submissions.map(sub => 
        deleteDoc(doc(db, 'submissions', sub.id))
      );
      await Promise.all(deletePromises);
      
      // Delete assignment
      await deleteDoc(doc(db, 'assignments', assignmentId));
      
      return { success: true };
    } catch (error) {
      console.error('Error deleting assignment:', error);
      return { success: false, error: error.message };
    }
  }

  // Get assignment analytics
  async getAssignmentAnalytics(assignmentId) {
    try {
      const assignmentDoc = await getDoc(doc(db, 'assignments', assignmentId));
      if (!assignmentDoc.exists()) {
        return { success: false, error: 'Assignment not found' };
      }

      const submissions = await this.getAssignmentSubmissions(assignmentId);
      
      const analytics = {
        totalSubmissions: submissions.length,
        gradedSubmissions: submissions.filter(s => s.grade !== null).length,
        pendingSubmissions: submissions.filter(s => s.grade === null).length,
        averageGrade: submissions.length > 0 ? 
          submissions.reduce((sum, s) => sum + (s.grade || 0), 0) / submissions.filter(s => s.grade !== null).length : 0,
        submissionRate: 0, // Would need total enrolled students
        gradeDistribution: this.calculateGradeDistribution(submissions),
        lateSubmissions: submissions.filter(s => 
          s.submittedAt > assignmentDoc.data().dueDate?.toDate()
        ).length,
      };
      
      return { success: true, analytics };
    } catch (error) {
      console.error('Error getting assignment analytics:', error);
      return { success: false, error: error.message };
    }
  }

  // Calculate grade distribution
  calculateGradeDistribution(submissions) {
    const gradedSubmissions = submissions.filter(s => s.grade !== null);
    const distribution = {
      'A (90-100)': 0,
      'B (80-89)': 0,
      'C (70-79)': 0,
      'D (60-69)': 0,
      'F (0-59)': 0,
    };
    
    gradedSubmissions.forEach(submission => {
      const grade = submission.grade;
      if (grade >= 90) distribution['A (90-100)']++;
      else if (grade >= 80) distribution['B (80-89)']++;
      else if (grade >= 70) distribution['C (70-79)']++;
      else if (grade >= 60) distribution['D (60-69)']++;
      else distribution['F (0-59)']++;
    });
    
    return distribution;
  }

  // Notify students about new assignment
  async notifyStudentsAboutAssignment(assignmentId, assignmentData) {
    try {
      // This would integrate with your notification service
      // For now, we'll just log it
      console.log(`New assignment notification: ${assignmentData.title} for ${assignmentData.courseCode}`);
      return { success: true };
    } catch (error) {
      console.error('Error notifying students:', error);
      return { success: false, error: error.message };
    }
  }

  // Notify student about grade
  async notifyStudentAboutGrade(studentId, submissionId, grade) {
    try {
      // This would integrate with your notification service
      console.log(`Grade notification: Student ${studentId} received grade ${grade} for submission ${submissionId}`);
      return { success: true };
    } catch (error) {
      console.error('Error notifying student about grade:', error);
      return { success: false, error: error.message };
    }
  }

  // Clean up listeners
  cleanup() {
    this.assignmentListeners.forEach(unsubscribe => unsubscribe());
    this.submissionListeners.forEach(unsubscribe => unsubscribe());
    this.assignmentListeners.clear();
    this.submissionListeners.clear();
  }
}

export default new AssignmentService();
