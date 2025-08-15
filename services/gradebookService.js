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
  writeBatch,
  increment
} from 'firebase/firestore';
import { db } from '../config/firebaseConfig';

class GradebookService {
  constructor() {
    this.gradebookListeners = new Map();
  }

  // Create grade category
  async createGradeCategory(courseCode, categoryData) {
    try {
      const category = {
        ...categoryData,
        courseCode,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      };

      const docRef = await addDoc(collection(db, 'gradeCategories'), category);
      
      return { success: true, categoryId: docRef.id };
    } catch (error) {
      console.error('Error creating grade category:', error);
      return { success: false, error: error.message };
    }
  }

  // Add grade entry
  async addGrade(gradeData) {
    try {
      const grade = {
        ...gradeData,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        status: 'finalized',
      };

      const docRef = await addDoc(collection(db, 'grades'), grade);
      
      // Update student's overall grade
      await this.updateStudentOverallGrade(gradeData.studentId, gradeData.courseCode);
      
      // Notify student about new grade
      await this.notifyStudentAboutGrade(gradeData.studentId, gradeData);
      
      return { success: true, gradeId: docRef.id };
    } catch (error) {
      console.error('Error adding grade:', error);
      return { success: false, error: error.message };
    }
  }

  // Update grade
  async updateGrade(gradeId, updates) {
    try {
      const gradeRef = doc(db, 'grades', gradeId);
      const gradeDoc = await getDoc(gradeRef);
      
      if (!gradeDoc.exists()) {
        return { success: false, error: 'Grade not found' };
      }

      const currentGrade = gradeDoc.data();
      
      await updateDoc(gradeRef, {
        ...updates,
        updatedAt: serverTimestamp(),
      });
      
      // Update student's overall grade if points changed
      if (updates.points !== undefined) {
        await this.updateStudentOverallGrade(currentGrade.studentId, currentGrade.courseCode);
      }
      
      return { success: true };
    } catch (error) {
      console.error('Error updating grade:', error);
      return { success: false, error: error.message };
    }
  }

  // Get student grades for course
  async getStudentGrades(studentId, courseCode) {
    try {
      const q = query(
        collection(db, 'grades'),
        where('studentId', '==', studentId),
        where('courseCode', '==', courseCode),
        orderBy('createdAt', 'desc')
      );
      
      const snapshot = await getDocs(q);
      const grades = [];
      
      snapshot.forEach(doc => {
        const data = doc.data();
        grades.push({
          id: doc.id,
          ...data,
          createdAt: data.createdAt?.toDate(),
          updatedAt: data.updatedAt?.toDate(),
          dueDate: data.dueDate?.toDate(),
        });
      });
      
      // Calculate summary statistics
      const summary = await this.calculateGradeSummary(grades, courseCode);
      
      return { success: true, grades, summary };
    } catch (error) {
      console.error('Error getting student grades:', error);
      return { success: false, error: error.message };
    }
  }

  // Get course gradebook
  async getCourseGradebook(courseCode) {
    try {
      // Get all students in the course
      const studentsQuery = query(
        collection(db, 'users'),
        where('enrolledCourses', 'array-contains', courseCode),
        where('userType', '==', 'student')
      );
      const studentsSnapshot = await getDocs(studentsQuery);
      
      // Get all grades for the course
      const gradesQuery = query(
        collection(db, 'grades'),
        where('courseCode', '==', courseCode),
        orderBy('createdAt', 'desc')
      );
      const gradesSnapshot = await getDocs(gradesQuery);
      
      // Get grade categories
      const categoriesQuery = query(
        collection(db, 'gradeCategories'),
        where('courseCode', '==', courseCode),
        orderBy('weight', 'desc')
      );
      const categoriesSnapshot = await getDocs(categoriesQuery);
      
      // Process data
      const students = [];
      const grades = [];
      const categories = [];
      
      studentsSnapshot.forEach(doc => {
        students.push({ id: doc.id, ...doc.data() });
      });
      
      gradesSnapshot.forEach(doc => {
        const data = doc.data();
        grades.push({
          id: doc.id,
          ...data,
          createdAt: data.createdAt?.toDate(),
          updatedAt: data.updatedAt?.toDate(),
          dueDate: data.dueDate?.toDate(),
        });
      });
      
      categoriesSnapshot.forEach(doc => {
        categories.push({ id: doc.id, ...doc.data() });
      });
      
      // Create gradebook matrix
      const gradebook = this.createGradebookMatrix(students, grades, categories);
      
      return { success: true, gradebook, students, grades, categories };
    } catch (error) {
      console.error('Error getting course gradebook:', error);
      return { success: false, error: error.message };
    }
  }

  // Calculate student's overall grade
  async calculateStudentOverallGrade(studentId, courseCode) {
    try {
      // Get student's grades
      const gradesQuery = query(
        collection(db, 'grades'),
        where('studentId', '==', studentId),
        where('courseCode', '==', courseCode)
      );
      const gradesSnapshot = await getDocs(gradesQuery);
      
      // Get grade categories with weights
      const categoriesQuery = query(
        collection(db, 'gradeCategories'),
        where('courseCode', '==', courseCode)
      );
      const categoriesSnapshot = await getDocs(categoriesQuery);
      
      const grades = [];
      const categories = {};
      
      gradesSnapshot.forEach(doc => {
        grades.push(doc.data());
      });
      
      categoriesSnapshot.forEach(doc => {
        const data = doc.data();
        categories[data.name] = data;
      });
      
      // Calculate weighted grade
      const calculation = this.calculateWeightedGrade(grades, categories);
      
      return { success: true, ...calculation };
    } catch (error) {
      console.error('Error calculating overall grade:', error);
      return { success: false, error: error.message };
    }
  }

  // Update student's overall grade in database
  async updateStudentOverallGrade(studentId, courseCode) {
    try {
      const calculation = await this.calculateStudentOverallGrade(studentId, courseCode);
      
      if (calculation.success) {
        // Update or create overall grade record
        const overallGradeQuery = query(
          collection(db, 'overallGrades'),
          where('studentId', '==', studentId),
          where('courseCode', '==', courseCode)
        );
        const overallGradeSnapshot = await getDocs(overallGradeQuery);
        
        const gradeData = {
          studentId,
          courseCode,
          overallGrade: calculation.overallGrade,
          letterGrade: calculation.letterGrade,
          gpa: calculation.gpa,
          breakdown: calculation.breakdown,
          updatedAt: serverTimestamp(),
        };
        
        if (overallGradeSnapshot.empty) {
          await addDoc(collection(db, 'overallGrades'), {
            ...gradeData,
            createdAt: serverTimestamp(),
          });
        } else {
          const docRef = overallGradeSnapshot.docs[0].ref;
          await updateDoc(docRef, gradeData);
        }
      }
      
      return calculation;
    } catch (error) {
      console.error('Error updating student overall grade:', error);
      return { success: false, error: error.message };
    }
  }

  // Bulk grade import
  async bulkImportGrades(courseCode, gradesData) {
    try {
      const batch = writeBatch(db);
      const results = [];
      
      for (const gradeData of gradesData) {
        const docRef = doc(collection(db, 'grades'));
        batch.set(docRef, {
          ...gradeData,
          courseCode,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
          status: 'finalized',
        });
        
        results.push({ studentId: gradeData.studentId, gradeId: docRef.id });
      }
      
      await batch.commit();
      
      // Update overall grades for all affected students
      const uniqueStudents = [...new Set(gradesData.map(g => g.studentId))];
      const updatePromises = uniqueStudents.map(studentId => 
        this.updateStudentOverallGrade(studentId, courseCode)
      );
      await Promise.all(updatePromises);
      
      return { success: true, imported: results.length, results };
    } catch (error) {
      console.error('Error bulk importing grades:', error);
      return { success: false, error: error.message };
    }
  }

  // Generate grade report
  async generateGradeReport(courseCode, reportType = 'summary') {
    try {
      const gradebook = await this.getCourseGradebook(courseCode);
      
      if (!gradebook.success) {
        return gradebook;
      }
      
      let report;
      
      switch (reportType) {
        case 'summary':
          report = this.generateSummaryReport(gradebook);
          break;
        case 'detailed':
          report = this.generateDetailedReport(gradebook);
          break;
        case 'analytics':
          report = this.generateAnalyticsReport(gradebook);
          break;
        default:
          report = this.generateSummaryReport(gradebook);
      }
      
      return { success: true, report };
    } catch (error) {
      console.error('Error generating grade report:', error);
      return { success: false, error: error.message };
    }
  }

  // Listen to grade updates
  listenToGrades(courseCode, studentId, callback) {
    try {
      let q;
      
      if (studentId) {
        q = query(
          collection(db, 'grades'),
          where('studentId', '==', studentId),
          where('courseCode', '==', courseCode),
          orderBy('createdAt', 'desc')
        );
      } else {
        q = query(
          collection(db, 'grades'),
          where('courseCode', '==', courseCode),
          orderBy('createdAt', 'desc')
        );
      }
      
      const unsubscribe = onSnapshot(q, (snapshot) => {
        const grades = [];
        snapshot.forEach(doc => {
          const data = doc.data();
          grades.push({
            id: doc.id,
            ...data,
            createdAt: data.createdAt?.toDate(),
            updatedAt: data.updatedAt?.toDate(),
            dueDate: data.dueDate?.toDate(),
          });
        });
        callback(grades);
      });
      
      const key = studentId ? `${courseCode}_${studentId}` : courseCode;
      this.gradebookListeners.set(key, unsubscribe);
      return unsubscribe;
    } catch (error) {
      console.error('Error listening to grades:', error);
      callback([]);
    }
  }

  // Helper methods
  createGradebookMatrix(students, grades, categories) {
    const matrix = {};
    
    students.forEach(student => {
      matrix[student.id] = {
        student,
        grades: grades.filter(g => g.studentId === student.id),
        overallGrade: 0,
        letterGrade: 'F',
      };
    });
    
    return matrix;
  }

  calculateWeightedGrade(grades, categories) {
    const categoryTotals = {};
    const categoryMaxPoints = {};
    
    // Group grades by category and calculate totals
    grades.forEach(grade => {
      const category = grade.category || 'Uncategorized';
      
      if (!categoryTotals[category]) {
        categoryTotals[category] = 0;
        categoryMaxPoints[category] = 0;
      }
      
      categoryTotals[category] += grade.points || 0;
      categoryMaxPoints[category] += grade.maxPoints || 0;
    });
    
    // Calculate weighted percentage
    let weightedSum = 0;
    let totalWeight = 0;
    const breakdown = {};
    
    Object.keys(categoryTotals).forEach(categoryName => {
      const category = categories[categoryName];
      const weight = category ? category.weight : 0;
      const percentage = categoryMaxPoints[categoryName] > 0 ? 
        (categoryTotals[categoryName] / categoryMaxPoints[categoryName]) * 100 : 0;
      
      weightedSum += percentage * (weight / 100);
      totalWeight += weight;
      
      breakdown[categoryName] = {
        points: categoryTotals[categoryName],
        maxPoints: categoryMaxPoints[categoryName],
        percentage,
        weight,
      };
    });
    
    const overallGrade = totalWeight > 0 ? weightedSum : 0;
    const letterGrade = this.calculateLetterGrade(overallGrade);
    const gpa = this.calculateGPA(letterGrade);
    
    return {
      overallGrade: Math.round(overallGrade * 100) / 100,
      letterGrade,
      gpa,
      breakdown,
    };
  }

  calculateLetterGrade(percentage) {
    if (percentage >= 97) return 'A+';
    if (percentage >= 93) return 'A';
    if (percentage >= 90) return 'A-';
    if (percentage >= 87) return 'B+';
    if (percentage >= 83) return 'B';
    if (percentage >= 80) return 'B-';
    if (percentage >= 77) return 'C+';
    if (percentage >= 73) return 'C';
    if (percentage >= 70) return 'C-';
    if (percentage >= 67) return 'D+';
    if (percentage >= 63) return 'D';
    if (percentage >= 60) return 'D-';
    return 'F';
  }

  calculateGPA(letterGrade) {
    const gpaScale = {
      'A+': 4.0, 'A': 4.0, 'A-': 3.7,
      'B+': 3.3, 'B': 3.0, 'B-': 2.7,
      'C+': 2.3, 'C': 2.0, 'C-': 1.7,
      'D+': 1.3, 'D': 1.0, 'D-': 0.7,
      'F': 0.0,
    };
    
    return gpaScale[letterGrade] || 0.0;
  }

  async calculateGradeSummary(grades, courseCode) {
    // Calculate basic statistics
    const totalPoints = grades.reduce((sum, g) => sum + (g.points || 0), 0);
    const totalMaxPoints = grades.reduce((sum, g) => sum + (g.maxPoints || 0), 0);
    const percentage = totalMaxPoints > 0 ? (totalPoints / totalMaxPoints) * 100 : 0;
    
    return {
      totalGrades: grades.length,
      totalPoints,
      totalMaxPoints,
      percentage: Math.round(percentage * 100) / 100,
      letterGrade: this.calculateLetterGrade(percentage),
      gpa: this.calculateGPA(this.calculateLetterGrade(percentage)),
    };
  }

  generateSummaryReport(gradebook) {
    // Generate a summary report of the gradebook
    const { students, grades, categories } = gradebook;
    
    return {
      courseStats: {
        totalStudents: students.length,
        totalGrades: grades.length,
        averageGrade: grades.length > 0 ? 
          grades.reduce((sum, g) => sum + (g.points || 0), 0) / grades.length : 0,
      },
      gradeDistribution: this.calculateGradeDistribution(grades),
      categoryBreakdown: categories.map(cat => ({
        name: cat.name,
        weight: cat.weight,
        averageScore: this.calculateCategoryAverage(grades, cat.name),
      })),
    };
  }

  calculateGradeDistribution(grades) {
    const distribution = {
      'A': 0, 'B': 0, 'C': 0, 'D': 0, 'F': 0,
    };
    
    grades.forEach(grade => {
      const percentage = grade.maxPoints > 0 ? (grade.points / grade.maxPoints) * 100 : 0;
      const letterGrade = this.calculateLetterGrade(percentage);
      const category = letterGrade.charAt(0);
      
      if (distribution[category] !== undefined) {
        distribution[category]++;
      }
    });
    
    return distribution;
  }

  // Notification method
  async notifyStudentAboutGrade(studentId, gradeData) {
    try {
      console.log(`Grade notification: Student ${studentId} received grade for ${gradeData.assignmentName}`);
      return { success: true };
    } catch (error) {
      console.error('Error notifying student about grade:', error);
      return { success: false, error: error.message };
    }
  }

  // Clean up listeners
  cleanup() {
    this.gradebookListeners.forEach(unsubscribe => unsubscribe());
    this.gradebookListeners.clear();
  }
}

export default new GradebookService();
