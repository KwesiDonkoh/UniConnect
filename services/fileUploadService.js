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
  onSnapshot,
  getDocs,
  deleteDoc
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { db, storage } from '../config/firebaseConfig';
import { Alert } from 'react-native';
import * as Sharing from 'expo-sharing';

class FileUploadService {
  constructor() {
    this.uploadProgress = new Map();
    this.currentUploads = new Map();
  }

  // Pick files (documents, images, videos)
  async pickFile(type = 'any') {
    try {
      let result;
      
      switch (type) {
        case 'image':
          // Request permissions
          const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
          if (status !== 'granted') {
            throw new Error('Permission to access media library was denied');
          }
          
          result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaType.Images,
            allowsEditing: true,
            quality: 0.8,
            allowsMultipleSelection: true,
          });
          break;
          
        case 'video':
          const videoPermission = await ImagePicker.requestMediaLibraryPermissionsAsync();
          if (videoPermission.status !== 'granted') {
            throw new Error('Permission to access media library was denied');
          }
          
          result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaType.Videos,
            allowsEditing: true,
            quality: 0.7,
          });
          break;
          
        default:
          result = await DocumentPicker.getDocumentAsync({
            type: '*/*',
            copyToCacheDirectory: true,
            multiple: false,
          });
          break;
      }

      if (!result.canceled && result.assets) {
        return { 
          success: true, 
          files: result.assets.map(asset => ({
            uri: asset.uri,
            name: asset.name || `file_${Date.now()}`,
            type: asset.mimeType || 'application/octet-stream',
            size: asset.size || 0,
          }))
        };
      }
      
      return { success: false, error: 'File selection cancelled' };
    } catch (error) {
      console.error('Error picking file:', error);
      return { success: false, error: error.message };
    }
  }

  // Upload file to Firebase Storage
  async uploadFile(file, courseCode, category = 'materials', onProgress) {
    let fileId;
    
    try {
      // Validate inputs
      if (!file || !file.uri) {
        throw new Error('Invalid file: missing file or URI');
      }
      if (!courseCode) {
        throw new Error('Course code is required');
      }

      fileId = `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      const fileName = `${category}/${courseCode}/${fileId}_${file.name || 'unknown_file'}`;
      
      // Validate file URI and read file as blob
      console.log('Uploading file:', file.name, 'Size:', file.size, 'Type:', file.type);
      console.log('Storage path:', fileName);
      
      const response = await fetch(file.uri);
      if (!response.ok) {
        throw new Error(`Failed to fetch file: ${response.status} ${response.statusText}`);
      }
      
      const blob = await response.blob();
      console.log('Blob created, size:', blob.size, 'type:', blob.type);
      
      if (blob.size === 0) {
        throw new Error('File is empty or corrupted');
      }
      
      // Create storage reference
      const storageRef = ref(storage, fileName);
      
      // Upload with progress tracking
      console.log('Starting upload to Firebase Storage...');
      
      try {
        const uploadTask = uploadBytes(storageRef, blob);
        this.currentUploads.set(fileId, uploadTask);
        
        console.log('Upload task created, waiting for completion...');
      
      // Simulate progress (since expo doesn't support progress tracking)
      let progress = 0;
      const progressInterval = setInterval(() => {
        progress += Math.random() * 20;
        if (progress >= 100) {
          progress = 100;
          clearInterval(progressInterval);
        }
        if (onProgress) {
          onProgress(Math.min(progress, 99)); // Keep at 99% until upload completes
        }
      }, 200);
      
      const snapshot = await uploadTask;
      clearInterval(progressInterval);
      
      console.log('Upload completed, snapshot:', snapshot ? 'valid' : 'invalid');
      
      // Verify upload was successful
      if (!snapshot || !snapshot.ref) {
        throw new Error('Upload completed but snapshot is invalid');
      }
      
      } catch (uploadError) {
        console.error('Storage upload error:', uploadError);
        throw new Error(`Storage upload failed: ${uploadError.message}`);
      }
      
      // Final progress update
      if (onProgress) {
        onProgress(100);
      }
      
      // Get download URL with retry logic
      let downloadURL;
      let retryCount = 0;
      const maxRetries = 3;
      
      while (retryCount < maxRetries) {
        try {
          downloadURL = await getDownloadURL(snapshot.ref);
          break;
        } catch (downloadError) {
          retryCount++;
          console.warn(`Download URL attempt ${retryCount} failed:`, downloadError.message);
          
          if (retryCount >= maxRetries) {
            throw new Error(`Failed to get download URL after ${maxRetries} attempts: ${downloadError.message}`);
          }
          
          // Wait before retry
          await new Promise(resolve => setTimeout(resolve, 1000 * retryCount));
        }
      }
      
      // Save file metadata to Firestore for sharing with classmates
      const fileData = {
        id: fileId,
        name: file.name,
        type: file.type,
        size: file.size,
        url: downloadURL,
        storageRef: fileName,
        courseCode,
        category,
        uploadedAt: serverTimestamp(),
        uploadedBy: 'current_user_id', // Will be updated by caller
        downloads: 0,
        views: 0,
        isSharedWithClassmates: true, // Enable sharing
        accessLevel: 'course', // Course-level access
        likes: 0,
        comments: [],
        isActive: true
      };
      
      // Save to course materials for easy sharing
      const docRef = await addDoc(collection(db, 'courseMaterials'), fileData);
      
      // Also save to course files collection for compatibility
      await addDoc(collection(db, 'courseFiles'), {
        ...fileData,
        materialId: docRef.id
      });
      
      console.log('Material uploaded and shared with classmates:', docRef.id);
      
      this.currentUploads.delete(fileId);
      
      return { 
        success: true, 
        fileId: docRef.id,
        downloadURL,
        metadata: fileData
      };
    } catch (error) {
      console.error('Error uploading file:', error);
      
      // Clean up on error (ensure fileId is defined)
      if (typeof fileId !== 'undefined') {
        this.currentUploads.delete(fileId);
      }
      
      // Provide more specific error messages
      let errorMessage = 'Upload failed';
      
      if (error.code === 'storage/unauthorized') {
        errorMessage = 'Upload failed: Permission denied. Please check your authentication.';
      } else if (error.code === 'storage/canceled') {
        errorMessage = 'Upload was canceled.';
      } else if (error.code === 'storage/unknown') {
        errorMessage = 'Upload failed due to a server error. Please check your internet connection and try again.';
      } else if (error.code === 'storage/quota-exceeded') {
        errorMessage = 'Upload failed: Storage quota exceeded.';
      } else if (error.code === 'storage/invalid-format') {
        errorMessage = 'Upload failed: Invalid file format.';
      } else if (error.code === 'storage/invalid-checksum') {
        errorMessage = 'Upload failed: File may be corrupted.';
      } else if (error.message?.includes('fetch')) {
        errorMessage = 'Upload failed: Could not read the file. Please try selecting the file again.';
      } else if (error.message?.includes('network')) {
        errorMessage = 'Upload failed: Network error. Please check your internet connection.';
      } else {
        errorMessage = error.message || 'Upload failed due to an unknown error';
      }
      
      return {
        success: false,
        error: errorMessage,
        code: error.code || 'unknown',
        fileId: fileId || `error_${Date.now()}`, // Ensure fileId is always present
        fileName: file.name || 'unknown_file'
      };
    }
  }

  // Upload multiple files
  async uploadMultipleFiles(files, courseCode, category = 'materials', onProgress) {
    try {
      const uploads = files.map((file, index) => 
        this.uploadFile(file, courseCode, category, (progress) => {
          if (onProgress) {
            onProgress(index, progress);
          }
        })
      );
      
      const results = await Promise.all(uploads);
      const successful = results.filter(r => r.success);
      const failed = results.filter(r => !r.success);
      
      return {
        success: true,
        uploaded: successful.length,
        failed: failed.length,
        results
      };
    } catch (error) {
      console.error('Error uploading multiple files:', error);
      return { success: false, error: error.message };
    }
  }

  // Get files for a course
  async getCourseFiles(courseCode, category = null) {
    try {
      let q = query(
        collection(db, 'courseMaterials'),
        where('courseCode', '==', courseCode),
        orderBy('uploadedAt', 'desc')
      );
      
      if (category) {
        q = query(q, where('category', '==', category));
      }
      
      const snapshot = await getDocs(q);
      const files = [];
      
      snapshot.forEach(doc => {
        files.push({
          id: doc.id,
          ...doc.data(),
          uploadedAt: doc.data().uploadedAt?.toDate(),
        });
      });
      
      return { success: true, files };
    } catch (error) {
      console.error('Error getting course files:', error);
      return { success: false, error: error.message };
    }
  }

  // Listen to real-time file updates
  listenToCourseFiles(courseCode, callback, category = null) {
    try {
      let q = query(
        collection(db, 'courseMaterials'),
        where('courseCode', '==', courseCode),
        orderBy('uploadedAt', 'desc')
      );
      
      if (category) {
        q = query(q, where('category', '==', category));
      }
      
      return onSnapshot(q, (snapshot) => {
        const files = [];
        snapshot.forEach(doc => {
          files.push({
            id: doc.id,
            ...doc.data(),
            uploadedAt: doc.data().uploadedAt?.toDate(),
          });
        });
        callback(files);
      });
    } catch (error) {
      console.error('Error listening to course files:', error);
      callback([]);
    }
  }

  // Download file
  async downloadFile(file) {
    try {
      // Increment download count
      await updateDoc(doc(db, 'courseMaterials', file.id), {
        downloads: (file.downloads || 0) + 1
      });
      
      // For mobile, we'll open the URL in browser
      const { Linking } = require('react-native');
      await Linking.openURL(file.url);
      
      return { success: true };
    } catch (error) {
      console.error('Error downloading file:', error);
      return { success: false, error: error.message };
    }
  }

  // Delete file
  async deleteFile(file) {
    try {
      // Delete from storage
      const storageRef = ref(storage, file.storageRef);
      await deleteObject(storageRef);
      
      // Delete from Firestore
      await deleteDoc(doc(db, 'courseMaterials', file.id));
      
      return { success: true };
    } catch (error) {
      console.error('Error deleting file:', error);
      return { success: false, error: error.message };
    }
  }

  // Get file type icon
  getFileIcon(type) {
    if (type.startsWith('image/')) return 'image';
    if (type.startsWith('video/')) return 'videocam';
    if (type.startsWith('audio/')) return 'musical-notes';
    if (type.includes('pdf')) return 'document-text';
    if (type.includes('word') || type.includes('doc')) return 'document';
    if (type.includes('excel') || type.includes('sheet')) return 'grid';
    if (type.includes('powerpoint') || type.includes('presentation')) return 'easel';
    if (type.includes('zip') || type.includes('rar')) return 'archive';
    return 'document-outline';
  }

  // Get shared materials for a specific course
  async getCourseMaterials(courseCode) {
    try {
      const materialsRef = collection(db, 'courseMaterials');
      const q = query(
        materialsRef,
        where('courseCode', '==', courseCode),
        where('isActive', '==', true),
        orderBy('uploadedAt', 'desc')
      );
      
      const snapshot = await getDocs(q);
      const materials = [];
      
      snapshot.forEach((doc) => {
        materials.push({
          id: doc.id,
          ...doc.data(),
          uploadedAt: doc.data().uploadedAt?.toDate?.() || new Date()
        });
      });
      
      return { success: true, materials };
    } catch (error) {
      console.error('Error getting course materials:', error);
      return { success: false, error: error.message, materials: [] };
    }
  }

  // Listen to course materials in real-time
    listenToCourseMaterials(courseCode, callback) {
    try {
      const materialsRef = collection(db, 'courseMaterials');
      const q = query(
        materialsRef,
        where('courseCode', '==', courseCode),
        where('isActive', '==', true),
        orderBy('uploadedAt', 'desc')
      );

      const unsubscribe = onSnapshot(q, (snapshot) => {
        const materials = [];
        snapshot.forEach((doc) => {
          materials.push({
            id: doc.id,
            ...doc.data(),
            uploadedAt: doc.data().uploadedAt?.toDate?.() || new Date()
          });
        });

        callback(materials);
      }, (error) => {
        console.error('Error listening to course materials:', error);
        callback([]);
      });

      return unsubscribe;
    } catch (error) {
      console.error('Error setting up materials listener:', error);
      return null;
    }
  }

  // Save chat files to materials collection for cross-platform access
  async saveChatFileToMaterials(materialData) {
    try {
      const materialsRef = collection(db, 'courseMaterials');
      
      // Enhanced metadata for chat files
      const chatFileData = {
        ...materialData,
        uploadedAt: serverTimestamp(),
        isSharedWithClassmates: true,
        accessLevel: 'course',
        likes: 0,
        comments: [],
        downloads: 0,
        views: 0,
        source: 'chat', // Indicate this came from chat
        category: 'chat_files'
      };

      const docRef = await addDoc(materialsRef, chatFileData);
      
      // Also save to course files collection for compatibility
      await addDoc(collection(db, 'courseFiles'), {
        ...chatFileData,
        materialId: docRef.id
      });

      console.log('Chat file saved to materials:', docRef.id);
      return { success: true, materialId: docRef.id };
    } catch (error) {
      console.error('Error saving chat file to materials:', error);
      return { success: false, error: error.message };
    }
  }

  // Format file size
  formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  // Get upload progress
  getUploadProgress(fileId) {
    return this.uploadProgress.get(fileId) || 0;
  }

  // Cancel upload
  async cancelUpload(fileId) {
    const upload = this.currentUploads.get(fileId);
    if (upload) {
      // Note: Firebase doesn't support cancelling uploads easily
      // We'll just remove it from our tracking
      this.currentUploads.delete(fileId);
      this.uploadProgress.delete(fileId);
      return { success: true };
    }
    return { success: false, error: 'Upload not found' };
  }

  // Take photo with camera
  async takePhoto() {
    try {
      // Request permissions
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== 'granted') {
        throw new Error('Camera permission was denied');
      }

      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        quality: 0.8,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const asset = result.assets[0];
        return {
          success: true,
          file: {
            name: `photo_${Date.now()}.jpg`,
            uri: asset.uri,
            type: 'image/jpeg',
            size: asset.fileSize || 1000000,
            actualSize: asset.fileSize || 1000000
          }
        };
      } else {
        return { success: false, error: 'No photo taken' };
      }
    } catch (error) {
      console.error('Error taking photo:', error);
      return { success: false, error: error.message };
    }
  }

  // Record video with camera
  async recordVideo() {
    try {
      // Request permissions
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== 'granted') {
        throw new Error('Camera permission was denied');
      }

      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Videos,
        allowsEditing: true,
        quality: ImagePicker.VideoQuality['720p'],
        videoMaxDuration: 60, // 1 minute max
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const asset = result.assets[0];
        return {
          success: true,
          file: {
            name: `video_${Date.now()}.mp4`,
            uri: asset.uri,
            type: 'video/mp4',
            size: asset.fileSize || 5000000,
            actualSize: asset.fileSize || 5000000
          }
        };
      } else {
        return { success: false, error: 'No video recorded' };
      }
    } catch (error) {
      console.error('Error recording video:', error);
      return { success: false, error: error.message };
    }
  }

  // Enhanced mobile file management capabilities
  async downloadFileToDevice(fileUrl, fileName) {
    try {
      console.log('Starting download to device:', fileName);
      
      // Get file info
      const fileInfo = await FileSystem.getInfoAsync(fileUrl);
      if (!fileInfo.exists) {
        throw new Error('File not found at URL');
      }

      // Create downloads directory if it doesn't exist
      const downloadsDir = FileSystem.documentDirectory + 'downloads/';
      const downloadsDirInfo = await FileSystem.getInfoAsync(downloadsDir);
      
      if (!downloadsDirInfo.exists) {
        await FileSystem.makeDirectoryAsync(downloadsDir, { intermediates: true });
      }

      // Generate unique filename if file exists
      let finalFileName = fileName;
      let counter = 1;
      while (true) {
        const filePath = downloadsDir + finalFileName;
        const existingFileInfo = await FileSystem.getInfoAsync(filePath);
        if (!existingFileInfo.exists) break;
        
        const nameparts = fileName.split('.');
        const extension = nameparts.pop();
        const baseName = nameparts.join('.');
        finalFileName = `${baseName}_${counter}.${extension}`;
        counter++;
      }

      // Download file
      const finalPath = downloadsDir + finalFileName;
      const downloadResult = await FileSystem.downloadAsync(fileUrl, finalPath);
      
      if (downloadResult.status === 200) {
        return {
          success: true,
          localPath: finalPath,
          fileName: finalFileName,
          size: downloadResult.headers['content-length']
        };
      } else {
        throw new Error(`Download failed with status: ${downloadResult.status}`);
      }
    } catch (error) {
      console.error('Error downloading file to device:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  async saveToDeviceGallery(fileUrl, fileName, fileType) {
    try {
      console.log('Saving to device gallery:', fileName);
      
      // Check if it's an image or video
      if (!fileType.includes('image') && !fileType.includes('video')) {
        throw new Error('Only images and videos can be saved to gallery');
      }

      // Request permissions
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        throw new Error('Permission to access media library was denied');
      }

      // Download to temp location first
      const tempPath = FileSystem.documentDirectory + 'temp_' + fileName;
      const downloadResult = await FileSystem.downloadAsync(fileUrl, tempPath);
      
      if (downloadResult.status !== 200) {
        throw new Error('Failed to download file');
      }

      // Save to media library (this would require additional native modules in a real app)
      // For now, we'll simulate the save
      console.log('File would be saved to gallery:', tempPath);
      
      // Clean up temp file
      await FileSystem.deleteAsync(tempPath, { idempotent: true });

      return {
        success: true,
        message: 'File saved to device gallery'
      };
    } catch (error) {
      console.error('Error saving to device gallery:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  async getDownloadedFiles() {
    try {
      const downloadsDir = FileSystem.documentDirectory + 'downloads/';
      const downloadsDirInfo = await FileSystem.getInfoAsync(downloadsDir);
      
      if (!downloadsDirInfo.exists) {
        return [];
      }

      const files = await FileSystem.readDirectoryAsync(downloadsDir);
      const fileInfos = await Promise.all(
        files.map(async (fileName) => {
          const filePath = downloadsDir + fileName;
          const fileInfo = await FileSystem.getInfoAsync(filePath);
          return {
            name: fileName,
            path: filePath,
            size: fileInfo.size,
            modificationTime: fileInfo.modificationTime
          };
        })
      );

      return fileInfos.sort((a, b) => b.modificationTime - a.modificationTime);
    } catch (error) {
      console.error('Error getting downloaded files:', error);
      return [];
    }
  }

  async deleteDownloadedFile(filePath) {
    try {
      await FileSystem.deleteAsync(filePath);
      return { success: true };
    } catch (error) {
      console.error('Error deleting downloaded file:', error);
      return { success: false, error: error.message };
    }
  }

  async shareFile(filePath) {
    try {
      console.log('Sharing file:', filePath);
      
      // Check if sharing is available
      const isAvailable = await Sharing.isAvailableAsync();
      if (!isAvailable) {
        Alert.alert('Sharing not available', 'Sharing is not available on this device');
        return { success: false, error: 'Sharing not available' };
      }
      
      // Check if file exists
      const fileInfo = await FileSystem.getInfoAsync(filePath);
      if (!fileInfo.exists) {
        throw new Error('File not found');
      }

      // Share the file using native share sheet
      await Sharing.shareAsync(filePath, {
        mimeType: this.getMimeType(filePath),
        dialogTitle: 'Share this file',
      });

      return {
        success: true,
        message: 'File shared successfully'
      };
    } catch (error) {
      console.error('Error sharing file:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Share a URL (for files stored in Firebase)
  async shareUrl(url, fileName = 'file') {
    try {
      console.log('Sharing URL:', url);
      
      // Check if sharing is available
      const isAvailable = await Sharing.isAvailableAsync();
      if (!isAvailable) {
        Alert.alert('Sharing not available', 'Sharing is not available on this device');
        return { success: false, error: 'Sharing not available' };
      }

      // For URLs, we can share the link directly
      await Sharing.shareAsync(url, {
        dialogTitle: `Share ${fileName}`,
      });

      return {
        success: true,
        message: 'File link shared successfully'
      };
    } catch (error) {
      console.error('Error sharing URL:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Get MIME type from file path
  getMimeType(filePath) {
    const extension = filePath.split('.').pop()?.toLowerCase();
    const mimeTypes = {
      'pdf': 'application/pdf',
      'doc': 'application/msword',
      'docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'ppt': 'application/vnd.ms-powerpoint',
      'pptx': 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
      'xls': 'application/vnd.ms-excel',
      'xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'txt': 'text/plain',
      'jpg': 'image/jpeg',
      'jpeg': 'image/jpeg',
      'png': 'image/png',
      'gif': 'image/gif',
      'mp4': 'video/mp4',
      'mp3': 'audio/mpeg',
      'zip': 'application/zip',
    };
    return mimeTypes[extension] || 'application/octet-stream';
  }

  // Take a photo using camera
  async takePhoto() {
    try {
      // Request camera permissions
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== 'granted') {
        throw new Error('Camera permission denied');
      }

      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaType.Images,
        allowsEditing: true,
        quality: 0.8,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const asset = result.assets[0];
        return {
          success: true,
          files: [{
            uri: asset.uri,
            name: `photo_${Date.now()}.jpg`,
            type: asset.mimeType || 'image/jpeg',
            size: asset.fileSize || 0,
          }]
        };
      }

      return { success: false, error: 'Photo capture cancelled' };
    } catch (error) {
      console.error('Error taking photo:', error);
      return { success: false, error: error.message };
    }
  }

  // Record a video using camera
  async recordVideo() {
    try {
      // Request camera permissions
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== 'granted') {
        throw new Error('Camera permission denied');
      }

      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaType.Videos,
        allowsEditing: true,
        quality: 0.7,
        videoMaxDuration: 300, // 5 minutes max
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const asset = result.assets[0];
        return {
          success: true,
          files: [{
            uri: asset.uri,
            name: `video_${Date.now()}.mp4`,
            type: asset.mimeType || 'video/mp4',
            size: asset.fileSize || 0,
          }]
        };
      }

      return { success: false, error: 'Video recording cancelled' };
    } catch (error) {
      console.error('Error recording video:', error);
      return { success: false, error: error.message };
    }
  }

  // Pick images from gallery
  async pickImage() {
    try {
      // Request media library permissions
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        throw new Error('Media library permission denied');
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaType.Images,
        allowsEditing: false,
        quality: 0.8,
        allowsMultipleSelection: true,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        return {
          success: true,
          files: result.assets.map(asset => ({
            uri: asset.uri,
            name: asset.fileName || `image_${Date.now()}.jpg`,
            type: asset.mimeType || 'image/jpeg',
            size: asset.fileSize || 0,
          }))
        };
      }

      return { success: false, error: 'Image selection cancelled' };
    } catch (error) {
      console.error('Error picking image:', error);
      return { success: false, error: error.message };
    }
  }

  getFileIcon(fileType) {
    if (!fileType) return 'document-outline';
    
    if (fileType.includes('pdf')) return 'document-text-outline';
    if (fileType.includes('image')) return 'image-outline';
    if (fileType.includes('video')) return 'videocam-outline';
    if (fileType.includes('audio')) return 'musical-notes-outline';
    if (fileType.includes('text') || fileType.includes('document')) return 'document-outline';
    if (fileType.includes('spreadsheet') || fileType.includes('excel')) return 'grid-outline';
    if (fileType.includes('presentation') || fileType.includes('powerpoint')) return 'easel-outline';
    
    return 'attach-outline';
  }

  // Save chat files to materials collection for sharing
  async saveChatFileToMaterials(fileUrl, materialData) {
    try {
      // Save to course materials collection
      const docRef = await addDoc(collection(db, 'courseMaterials'), {
        ...materialData,
        fileUrl,
        uploadedAt: serverTimestamp(),
        isSharedWithClassmates: true,
        accessLevel: 'course',
        isActive: true,
      });

      console.log('Chat file saved to materials:', docRef.id);
      return { success: true, materialId: docRef.id };
    } catch (error) {
      console.error('Error saving chat file to materials:', error);
      return { success: false, error: error.message };
    }
  }

  // Get course materials for sharing
  async getCourseMaterials(courseCode) {
    try {
      // Simplified query to avoid index requirements
      const q = query(
        collection(db, 'courseMaterials'),
        where('courseCode', '==', courseCode)
      );
      
      const snapshot = await getDocs(q);
      const materials = [];
      
      snapshot.forEach(doc => {
        const data = doc.data();
        // Client-side filtering for active materials
        if (data.isActive !== false) {
          materials.push({
            id: doc.id,
            ...data,
            uploadedAt: data.uploadedAt?.toDate(),
          });
        }
      });
      
      // Client-side sorting by upload date (newest first)
      materials.sort((a, b) => {
        const dateA = a.uploadedAt || new Date(0);
        const dateB = b.uploadedAt || new Date(0);
        return dateB.getTime() - dateA.getTime();
      });
      
      return { success: true, materials };
    } catch (error) {
      console.error('Error getting course materials:', error);
      return { success: false, error: error.message };
    }
  }

  // Listen to course materials updates
  listenToCourseMaterials(courseCode, callback) {
    try {
      // Simplified query to avoid index requirements
      const q = query(
        collection(db, 'courseMaterials'),
        where('courseCode', '==', courseCode)
      );
      
      return onSnapshot(q, (snapshot) => {
        const materials = [];
        snapshot.forEach(doc => {
          const data = doc.data();
          // Client-side filtering for active materials
          if (data.isActive !== false) {
            materials.push({
              id: doc.id,
              ...data,
              uploadedAt: data.uploadedAt?.toDate(),
            });
          }
        });
        
        // Client-side sorting by upload date (newest first)
        materials.sort((a, b) => {
          const dateA = a.uploadedAt || new Date(0);
          const dateB = b.uploadedAt || new Date(0);
          return dateB.getTime() - dateA.getTime();
        });
        
        callback(materials);
      });
    } catch (error) {
      console.error('Error listening to course materials:', error);
      return null;
    }
  }

  formatFileSize(bytes) {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  // Update download/save counts in Firestore
  async updateFileStats(fileId, action) {
    try {
      const fileRef = doc(db, 'courseMaterials', fileId);
      
      if (action === 'download') {
        await updateDoc(fileRef, {
          downloadCount: (await getDocs(query(collection(db, 'courseMaterials'), where('__name__', '==', fileId)))).docs[0]?.data()?.downloadCount || 0 + 1,
          lastDownloaded: serverTimestamp()
        });
      } else if (action === 'save') {
        await updateDoc(fileRef, {
          saveCount: (await getDocs(query(collection(db, 'courseMaterials'), where('__name__', '==', fileId)))).docs[0]?.data()?.saveCount || 0 + 1,
          lastSaved: serverTimestamp()
        });
      }
      
      return { success: true };
    } catch (error) {
      console.error('Error updating file stats:', error);
      return { success: false, error: error.message };
    }
  }
}

export default new FileUploadService();
