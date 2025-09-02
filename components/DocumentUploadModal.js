import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  ScrollView,
  TextInput,
  Alert,
  ActivityIndicator,
  Animated,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import fileUploadService from '../services/fileUploadService';
import { useApp } from '../context/AppContext';

const { width, height } = Dimensions.get('window');

export const DocumentUploadModal = ({ 
  visible, 
  onClose, 
  selectedCourse, 
  onUploadComplete 
}) => {
  const { user } = useApp();
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('materials');

  const slideAnim = useRef(new Animated.Value(height)).current;

  React.useEffect(() => {
    if (visible) {
      Animated.spring(slideAnim, {
        toValue: 0,
        tension: 50,
        friction: 8,
        useNativeDriver: true,
      }).start();
    } else {
      Animated.timing(slideAnim, {
        toValue: height,
        duration: 300,
        useNativeDriver: true,
      }).start();
    }
  }, [visible]);

  const categories = [
    { id: 'materials', name: 'Course Materials', icon: 'book-outline', color: '#6366F1' },
    { id: 'assignments', name: 'Assignments', icon: 'clipboard-outline', color: '#F59E0B' },
    { id: 'notes', name: 'Lecture Notes', icon: 'document-text-outline', color: '#10B981' },
    { id: 'resources', name: 'Resources', icon: 'library-outline', color: '#EC4899' },
  ];

  const documentTypes = [
    { 
      id: 'document', 
      name: 'Documents', 
      icon: 'document-outline', 
      color: '#6366F1',
      description: 'PDF, Word, Excel, PowerPoint'
    },
    { 
      id: 'image', 
      name: 'Images', 
      icon: 'image-outline', 
      color: '#10B981',
      description: 'Photos, screenshots, diagrams'
    },
    { 
      id: 'any', 
      name: 'All Files', 
      icon: 'folder-outline', 
      color: '#F59E0B',
      description: 'Any file type'
    },
  ];

  const handleFileSelection = async (type) => {
    try {
      const result = await fileUploadService.pickFile(type);
      
      if (result.success && result.files) {
        setSelectedFiles(prev => [...prev, ...result.files]);
        Alert.alert(
          'Files Selected! 📎',
          `${result.files.length} file(s) ready for upload`,
          [{ text: 'OK' }]
        );
      } else if (result.error && result.error !== 'File selection cancelled') {
        Alert.alert('Selection Error', result.error);
      }
    } catch (error) {
      console.error('File selection error:', error);
      Alert.alert('Error', 'Failed to select files. Please try again.');
    }
  };

  const handleUpload = async () => {
    if (selectedFiles.length === 0) {
      Alert.alert('No Files', 'Please select files to upload');
      return;
    }

    if (!selectedCourse) {
      Alert.alert('No Course', 'Please select a course first');
      return;
    }

    setIsUploading(true);
    setUploadProgress(0);

    try {
      const uploadPromises = selectedFiles.map(async (file, index) => {
        const result = await fileUploadService.uploadFile(
          file,
          selectedCourse.code,
          category,
          (progress) => {
            const totalProgress = ((index + progress / 100) / selectedFiles.length) * 100;
            setUploadProgress(totalProgress);
          }
        );

        if (result.success) {
          // Save additional metadata
          const materialData = {
            id: result.fileId,
            originalFileName: file.name,
            fileUrl: result.downloadURL,
            fileSize: file.size,
            fileType: file.type,
            courseCode: selectedCourse.code,
            courseName: selectedCourse.name,
            uploadedBy: user?.uid,
            uploaderName: user?.fullName || user?.name || 'Unknown User',
            uploaderType: user?.userType || 'student',
            description: description.trim(),
            category,
            tags: [selectedCourse.code, user?.academicLevel || user?.userType, category],
            isSharedWithClassmates: true,
            accessLevel: 'course',
            uploadedAt: new Date().toISOString(),
          };

          // Save to course materials collection
          await fileUploadService.saveChatFileToMaterials(result.downloadURL, materialData);
        }

        return result;
      });

      const results = await Promise.all(uploadPromises);
      const successful = results.filter(r => r.success);
      const failed = results.filter(r => !r.success);

      if (successful.length > 0) {
        Alert.alert(
          'Upload Complete! 🎉',
          `${successful.length} file(s) uploaded successfully and shared with your coursemates!`,
          [{ 
            text: 'Great!', 
            onPress: () => {
              setSelectedFiles([]);
              setDescription('');
              setUploadProgress(0);
              onUploadComplete?.(successful);
              onClose();
            }
          }]
        );
      }

      if (failed.length > 0) {
        Alert.alert(
          'Partial Upload',
          `${failed.length} file(s) failed to upload. Please try again.`
        );
      }
    } catch (error) {
      console.error('Upload error:', error);
      Alert.alert('Upload Failed', 'An error occurred during upload. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };

  const removeFile = (fileId) => {
    setSelectedFiles(prev => prev.filter(f => f.id !== fileId));
  };

  const getFileIcon = (fileType) => {
    if (fileType.includes('pdf')) return 'document-text';
    if (fileType.includes('word') || fileType.includes('doc')) return 'document';
    if (fileType.includes('excel') || fileType.includes('sheet')) return 'grid';
    if (fileType.includes('powerpoint') || fileType.includes('presentation')) return 'easel';
    if (fileType.includes('image')) return 'image';
    if (fileType.includes('video')) return 'videocam';
    return 'document-outline';
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <Animated.View 
          style={[
            styles.modalContainer,
            { transform: [{ translateY: slideAnim }] }
          ]}
        >
          <LinearGradient
            colors={['#6366F1', '#8B5CF6']}
            style={styles.header}
          >
            <Text style={styles.title}>Upload Documents</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Ionicons name="close" size={24} color="#FFFFFF" />
            </TouchableOpacity>
          </LinearGradient>

          <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
            {/* Course Info */}
            <View style={styles.courseInfo}>
              <Ionicons name="book" size={20} color="#6366F1" />
              <Text style={styles.courseText}>
                {selectedCourse?.name || 'No course selected'}
              </Text>
            </View>

            {/* Category Selection */}
            <Text style={styles.sectionTitle}>Category</Text>
            <View style={styles.categoryGrid}>
              {categories.map((cat) => (
                <TouchableOpacity
                  key={cat.id}
                  style={[
                    styles.categoryItem,
                    category === cat.id && { backgroundColor: cat.color + '20', borderColor: cat.color }
                  ]}
                  onPress={() => setCategory(cat.id)}
                >
                  <Ionicons 
                    name={cat.icon} 
                    size={20} 
                    color={category === cat.id ? cat.color : '#64748B'} 
                  />
                  <Text style={[
                    styles.categoryText,
                    category === cat.id && { color: cat.color, fontWeight: '600' }
                  ]}>
                    {cat.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* File Type Selection */}
            <Text style={styles.sectionTitle}>Select Files</Text>
            <View style={styles.fileTypeGrid}>
              {documentTypes.map((type) => (
                <TouchableOpacity
                  key={type.id}
                  style={[styles.fileTypeItem, { borderColor: type.color }]}
                  onPress={() => handleFileSelection(type.id)}
                >
                  <Ionicons name={type.icon} size={24} color={type.color} />
                  <Text style={styles.fileTypeName}>{type.name}</Text>
                  <Text style={styles.fileTypeDesc}>{type.description}</Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Selected Files */}
            {selectedFiles.length > 0 && (
              <>
                <Text style={styles.sectionTitle}>Selected Files ({selectedFiles.length})</Text>
                {selectedFiles.map((file) => (
                  <View key={file.id} style={styles.fileItem}>
                    <View style={styles.fileInfo}>
                      <Ionicons 
                        name={getFileIcon(file.type)} 
                        size={20} 
                        color="#6366F1" 
                      />
                      <View style={styles.fileDetails}>
                        <Text style={styles.fileName} numberOfLines={1}>
                          {file.name}
                        </Text>
                        <Text style={styles.fileSize}>
                          {formatFileSize(file.size)}
                        </Text>
                      </View>
                    </View>
                    <TouchableOpacity
                      onPress={() => removeFile(file.id)}
                      style={styles.removeButton}
                    >
                      <Ionicons name="trash-outline" size={18} color="#EF4444" />
                    </TouchableOpacity>
                  </View>
                ))}
              </>
            )}

            {/* Description */}
            <Text style={styles.sectionTitle}>Description (Optional)</Text>
            <TextInput
              style={styles.descriptionInput}
              placeholder="Add a description for these files..."
              value={description}
              onChangeText={setDescription}
              multiline
              numberOfLines={3}
              textAlignVertical="top"
            />

            {/* Upload Progress */}
            {isUploading && (
              <View style={styles.progressContainer}>
                <Text style={styles.progressText}>Uploading... {Math.round(uploadProgress)}%</Text>
                <View style={styles.progressBar}>
                  <View style={[styles.progressFill, { width: `${uploadProgress}%` }]} />
                </View>
              </View>
            )}
          </ScrollView>

          {/* Upload Button */}
          <View style={styles.footer}>
            <TouchableOpacity
              style={[
                styles.uploadButton,
                (selectedFiles.length === 0 || isUploading) && styles.uploadButtonDisabled
              ]}
              onPress={handleUpload}
              disabled={selectedFiles.length === 0 || isUploading}
            >
              {isUploading ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <Ionicons name="cloud-upload" size={20} color="#FFFFFF" />
              )}
              <Text style={styles.uploadButtonText}>
                {isUploading ? 'Uploading...' : `Upload ${selectedFiles.length} file(s)`}
              </Text>
            </TouchableOpacity>
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
    justifyContent: 'flex-end',
  },
  modalContainer: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: height * 0.9,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  closeButton: {
    padding: 4,
  },
  content: {
    padding: 20,
  },
  courseInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    padding: 12,
    borderRadius: 8,
    marginBottom: 20,
  },
  courseText: {
    marginLeft: 8,
    fontSize: 16,
    fontWeight: '600',
    color: '#1E293B',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1E293B',
    marginBottom: 12,
    marginTop: 8,
  },
  categoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 20,
  },
  categoryItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    padding: 12,
    borderRadius: 8,
    marginRight: 8,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  categoryText: {
    marginLeft: 8,
    fontSize: 14,
    color: '#64748B',
  },
  fileTypeGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  fileTypeItem: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 12,
    marginHorizontal: 4,
    borderWidth: 2,
    borderColor: '#E2E8F0',
  },
  fileTypeName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1E293B',
    marginTop: 8,
  },
  fileTypeDesc: {
    fontSize: 12,
    color: '#64748B',
    textAlign: 'center',
    marginTop: 4,
  },
  fileItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#F8FAFC',
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
  },
  fileInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  fileDetails: {
    marginLeft: 12,
    flex: 1,
  },
  fileName: {
    fontSize: 14,
    fontWeight: '500',
    color: '#1E293B',
  },
  fileSize: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
  },
  removeButton: {
    padding: 8,
  },
  descriptionInput: {
    backgroundColor: '#F8FAFC',
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    color: '#1E293B',
    marginBottom: 20,
    minHeight: 80,
  },
  progressContainer: {
    marginBottom: 20,
  },
  progressText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#6366F1',
    marginBottom: 8,
  },
  progressBar: {
    height: 4,
    backgroundColor: '#E2E8F0',
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#6366F1',
  },
  footer: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
  },
  uploadButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#6366F1',
    padding: 16,
    borderRadius: 12,
  },
  uploadButtonDisabled: {
    backgroundColor: '#CBD5E1',
  },
  uploadButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
});

export default DocumentUploadModal;
