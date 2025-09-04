import * as DocumentPicker from 'expo-document-picker';
import * as ImagePicker from 'expo-image-picker';
import * as FileSystem from 'expo-file-system';
import { 
  collection, 
  addDoc, 
  serverTimestamp, 
  doc, 
  updateDoc,
  query,
  where,
  orderBy,
  getDocs,
  deleteDoc
} from 'firebase/firestore';
import { 
  ref, 
  uploadBytes, 
  getDownloadURL, 
  deleteObject 
} from 'firebase/storage';
import { db, storage } from '../config/firebaseConfig';

class EnhancedFileUploadService {
  constructor() {
    this.maxFileSize = 50 * 1024 * 1024; // 50MB
    this.allowedTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'image/jpeg',
      'image/jpg',
      'image/png',
      'text/plain',
      'video/mp4',
      'audio/mpeg'
    ];
  }

  // Pick document from device
  async pickDocument() {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: '*/*',
        copyToCacheDirectory: true,
        multiple: false,
      });

      if (result.canceled) {
        return { success: false, error: 'Document selection cancelled' };
      }

      const file = result.assets[0];
      
      // Validate file
      const validation = this.validateFile(file);
      if (!validation.isValid) {
        return { success: false, error: validation.error };
      }

      return { success: true, file };
    } catch (error) {
      console.error('Error picking document:', error);
      return { success: false, error: 'Failed to pick document' };
    }
  }

  // Pick image from device
  async pickImage(fromCamera = false) {
    try {
      let result;

      if (fromCamera) {
        // Request camera permissions
        const permissionResult = await ImagePicker.requestCameraPermissionsAsync();
        if (permissionResult.granted === false) {
          return { success: false, error: 'Camera permission denied' };
        }

        result = await ImagePicker.launchCameraAsync({
          mediaTypes: ImagePicker.MediaTypeOptions.Images,
          allowsEditing: true,
          aspect: [4, 3],
          quality: 0.8,
        });
      } else {
        // Request media library permissions
        const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (permissionResult.granted === false) {
          return { success: false, error: 'Media library permission denied' };
        }

        result = await ImagePicker.launchImageLibraryAsync({
          mediaTypes: ImagePicker.MediaTypeOptions.Images,
          allowsEditing: true,
          aspect: [4, 3],
          quality: 0.8,
        });
      }

      if (result.canceled) {
        return { success: false, error: 'Image selection cancelled' };
      }

      const file = {
        uri: result.assets[0].uri,
        name: `image_${Date.now()}.jpg`,
        type: 'image/jpeg',
        size: result.assets[0].fileSize || 0,
      };

      // Validate file
      const validation = this.validateFile(file);
      if (!validation.isValid) {
        return { success: false, error: validation.error };
      }

      return { success: true, file };
    } catch (error) {
      console.error('Error picking image:', error);
      return { success: false, error: 'Failed to pick image' };
    }
  }

  // Validate file before upload
  validateFile(file) {
    if (!file) {
      return { isValid: false, error: 'No file provided' };
    }

    // Check file size
    if (file.size > this.maxFileSize) {
      return { 
        isValid: false, 
        error: `File size exceeds ${this.maxFileSize / (1024 * 1024)}MB limit` 
      };
    }

    // Check file type (optional - can be relaxed)
    if (file.type && !this.allowedTypes.includes(file.type)) {
      return { 
        isValid: false, 
        error: 'File type not supported' 
      };
    }

    return { isValid: true };
  }

  // Upload file to Firebase Storage
  async uploadFile(file, userInfo = {}, courseCode = '', onProgress = null) {
    try {
      console.log('Starting file upload:', file.name);

      // Read file as blob
      const response = await fetch(file.uri);
      const blob = await response.blob();

      // Create unique filename
      const timestamp = Date.now();
      const fileName = `${timestamp}_${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
      const filePath = `uploads/${userInfo.uid || 'anonymous'}/${courseCode}/${fileName}`;

      // Create storage reference
      const storageRef = ref(storage, filePath);

      // Upload file
      const uploadTask = uploadBytes(storageRef, blob);

      // Wait for upload to complete
      const snapshot = await uploadTask;
      console.log('File uploaded successfully');

      // Get download URL
      const downloadURL = await getDownloadURL(snapshot.ref);

      // Save file metadata to Firestore
      const fileData = {
        fileName: file.name,
        originalName: file.name,
        fileSize: file.size,
        fileType: file.type || 'unknown',
        filePath: filePath,
        downloadURL: downloadURL,
        uploadedBy: userInfo.uid || 'anonymous',
        uploaderName: userInfo.name || 'Anonymous',
        uploaderType: userInfo.userType || 'student',
        courseCode: courseCode || 'general',
        uploadedAt: serverTimestamp(),
        isPublic: true,
        downloads: 0,
        tags: [],
        description: '',
      };

      // Add to Firestore
      const docRef = await addDoc(collection(db, 'uploadedFiles'), fileData);
      
      console.log('File metadata saved to Firestore:', docRef.id);

      return {
        success: true,
        fileId: docRef.id,
        downloadURL: downloadURL,
        fileName: file.name,
        message: 'File uploaded successfully'
      };

    } catch (error) {
      console.error('Error uploading file:', error);
      return {
        success: false,
        error: error.message || 'Failed to upload file'
      };
    }
  }

  // Get uploaded files for a user or course
  async getUploadedFiles(filters = {}) {
    try {
      let q = collection(db, 'uploadedFiles');

      // Apply filters
      if (filters.courseCode) {
        q = query(q, where('courseCode', '==', filters.courseCode));
      }

      if (filters.uploadedBy) {
        q = query(q, where('uploadedBy', '==', filters.uploadedBy));
      }

      if (filters.fileType) {
        q = query(q, where('fileType', '==', filters.fileType));
      }

      // Order by upload date (newest first)
      q = query(q, orderBy('uploadedAt', 'desc'));

      const querySnapshot = await getDocs(q);
      const files = [];

      querySnapshot.forEach((doc) => {
        files.push({
          id: doc.id,
          ...doc.data(),
          uploadedAt: doc.data().uploadedAt?.toDate() || new Date(),
        });
      });

      return {
        success: true,
        files: files
      };

    } catch (error) {
      console.error('Error fetching files:', error);
      return {
        success: false,
        error: error.message || 'Failed to fetch files',
        files: []
      };
    }
  }

  // Delete file
  async deleteFile(fileId, filePath) {
    try {
      // Delete from Storage
      if (filePath) {
        const storageRef = ref(storage, filePath);
        await deleteObject(storageRef);
      }

      // Delete from Firestore
      await deleteDoc(doc(db, 'uploadedFiles', fileId));

      return {
        success: true,
        message: 'File deleted successfully'
      };

    } catch (error) {
      console.error('Error deleting file:', error);
      return {
        success: false,
        error: error.message || 'Failed to delete file'
      };
    }
  }

  // Update file metadata
  async updateFileMetadata(fileId, updates) {
    try {
      const fileRef = doc(db, 'uploadedFiles', fileId);
      await updateDoc(fileRef, {
        ...updates,
        updatedAt: serverTimestamp(),
      });

      return {
        success: true,
        message: 'File updated successfully'
      };

    } catch (error) {
      console.error('Error updating file:', error);
      return {
        success: false,
        error: error.message || 'Failed to update file'
      };
    }
  }

  // Increment download count
  async incrementDownloadCount(fileId) {
    try {
      const fileRef = doc(db, 'uploadedFiles', fileId);
      const currentDoc = await getDocs(fileRef);
      
      if (currentDoc.exists()) {
        const currentDownloads = currentDoc.data().downloads || 0;
        await updateDoc(fileRef, {
          downloads: currentDownloads + 1,
          lastDownloaded: serverTimestamp(),
        });
      }

      return { success: true };
    } catch (error) {
      console.error('Error incrementing download count:', error);
      return { success: false, error: error.message };
    }
  }

  // Get file statistics
  async getFileStatistics(userId) {
    try {
      const q = query(
        collection(db, 'uploadedFiles'),
        where('uploadedBy', '==', userId)
      );

      const querySnapshot = await getDocs(q);
      let totalSize = 0;
      let totalDownloads = 0;
      const fileTypes = {};

      querySnapshot.forEach((doc) => {
        const data = doc.data();
        totalSize += data.fileSize || 0;
        totalDownloads += data.downloads || 0;
        
        const type = data.fileType || 'unknown';
        fileTypes[type] = (fileTypes[type] || 0) + 1;
      });

      return {
        success: true,
        statistics: {
          totalFiles: querySnapshot.size,
          totalSize: totalSize,
          totalDownloads: totalDownloads,
          fileTypes: fileTypes,
        }
      };

    } catch (error) {
      console.error('Error getting file statistics:', error);
      return {
        success: false,
        error: error.message || 'Failed to get statistics'
      };
    }
  }
}

export default new EnhancedFileUploadService();
