import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  Alert,
  Animated,
  Dimensions,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import fileUploadService from '../services/fileUploadService';

const { width, height } = Dimensions.get('window');

export default function FileUploadScreen({ navigation, route }) {
  const { courseCode, courseName } = route.params;
  
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [uploadProgress, setUploadProgress] = useState({});
  const [isUploading, setIsUploading] = useState(false);
  const [category, setCategory] = useState('materials');
  
  const slideAnim = useRef(new Animated.Value(50)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  const categories = [
    { id: 'materials', name: 'Course Materials', icon: 'book', color: '#6366F1' },
    { id: 'assignments', name: 'Assignments', icon: 'clipboard', color: '#F59E0B' },
    { id: 'lectures', name: 'Lecture Notes', icon: 'school', color: '#10B981' },
    { id: 'resources', name: 'Resources', icon: 'library', color: '#EC4899' },
  ];

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 600,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const pickFiles = async (type = 'any') => {
    try {
      const result = await fileUploadService.pickFile(type);
      
      if (result.success) {
        const newFiles = result.files.map(file => ({
          ...file,
          id: Date.now() + Math.random(),
          uploadProgress: 0,
          uploaded: false,
        }));
        
        setSelectedFiles([...selectedFiles, ...newFiles]);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to select files');
    }
  };

  const removeFile = (fileId) => {
    setSelectedFiles(selectedFiles.filter(f => f.id !== fileId));
    // Remove from progress tracking
    const newProgress = { ...uploadProgress };
    delete newProgress[fileId];
    setUploadProgress(newProgress);
  };

  const uploadFiles = async () => {
    if (selectedFiles.length === 0) {
      Alert.alert('No Files', 'Please select files to upload');
      return;
    }

    setIsUploading(true);
    
    try {
      const uploadPromises = selectedFiles.map(async (file, index) => {
        const result = await fileUploadService.uploadFile(
          file, 
          courseCode, 
          category,
          (progress) => {
            setUploadProgress(prev => ({
              ...prev,
              [file.id]: progress
            }));
          }
        );
        
        if (result.success) {
          setSelectedFiles(prev => 
            prev.map(f => 
              f.id === file.id ? { ...f, uploaded: true } : f
            )
          );
        }
        
        return result;
      });

      const results = await Promise.all(uploadPromises);
      const successful = results.filter(r => r.success).length;
      const failed = results.filter(r => !r.success).length;

      if (successful > 0) {
        Alert.alert(
          'Upload Complete', 
          `Successfully uploaded ${successful} file(s)${failed > 0 ? `, ${failed} failed` : ''}`,
          [
            { text: 'OK', onPress: () => navigation.goBack() }
          ]
        );
      } else {
        Alert.alert('Upload Failed', 'All uploads failed. Please try again.');
      }
    } catch (error) {
      Alert.alert('Error', 'Upload failed. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };

  const renderFileItem = (file) => (
    <Animated.View key={file.id} style={styles.fileItem}>
      <View style={styles.fileInfo}>
        <View style={[styles.fileIcon, { backgroundColor: getFileTypeColor(file.type) }]}>
          <Ionicons 
            name={fileUploadService.getFileIcon(file.type)} 
            size={24} 
            color="#FFFFFF" 
          />
        </View>
        
        <View style={styles.fileDetails}>
          <Text style={styles.fileName} numberOfLines={1}>{file.name}</Text>
          <Text style={styles.fileSize}>{fileUploadService.formatFileSize(file.size)}</Text>
          
          {/* Upload Progress */}
          {uploadProgress[file.id] !== undefined && (
            <View style={styles.progressContainer}>
              <View style={styles.progressBar}>
                <Animated.View 
                  style={[
                    styles.progressFill,
                    { width: `${uploadProgress[file.id]}%` }
                  ]} 
                />
              </View>
              <Text style={styles.progressText}>{Math.round(uploadProgress[file.id])}%</Text>
            </View>
          )}
          
          {file.uploaded && (
            <View style={styles.uploadedIndicator}>
              <Ionicons name="checkmark-circle" size={16} color="#10B981" />
              <Text style={styles.uploadedText}>Uploaded</Text>
            </View>
          )}
        </View>
      </View>
      
      {!isUploading && (
        <TouchableOpacity 
          style={styles.removeButton}
          onPress={() => removeFile(file.id)}
        >
          <Ionicons name="close-circle" size={20} color="#EF4444" />
        </TouchableOpacity>
      )}
    </Animated.View>
  );

  const getFileTypeColor = (type) => {
    if (type.startsWith('image/')) return '#EC4899';
    if (type.startsWith('video/')) return '#8B5CF6';
    if (type.startsWith('audio/')) return '#10B981';
    if (type.includes('pdf')) return '#EF4444';
    if (type.includes('word') || type.includes('doc')) return '#3B82F6';
    if (type.includes('excel') || type.includes('sheet')) return '#10B981';
    if (type.includes('powerpoint') || type.includes('presentation')) return '#F59E0B';
    return '#6B7280';
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <LinearGradient
        colors={['#6366F1', '#8B5CF6']}
        style={styles.header}
      >
        <View style={styles.headerContent}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
          </TouchableOpacity>
          
          <View style={styles.headerInfo}>
            <Text style={styles.headerTitle}>Upload Files</Text>
            <Text style={styles.headerSubtitle}>{courseName}</Text>
          </View>
          
          <View style={styles.headerActions}>
            <TouchableOpacity style={styles.headerAction}>
              <Ionicons name="information-circle" size={24} color="rgba(255,255,255,0.8)" />
            </TouchableOpacity>
          </View>
        </View>
      </LinearGradient>

      <Animated.View 
        style={[
          styles.content,
          {
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }],
          },
        ]}
      >
        <ScrollView 
          style={styles.scrollView}
          showsVerticalScrollIndicator={false}
        >
          {/* Category Selection */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Select Category</Text>
            <ScrollView 
              horizontal 
              showsHorizontalScrollIndicator={false}
              style={styles.categoriesScroll}
            >
              {categories.map((cat) => (
                <TouchableOpacity
                  key={cat.id}
                  style={[
                    styles.categoryItem,
                    category === cat.id && styles.categoryItemActive,
                    { backgroundColor: category === cat.id ? cat.color : '#F8FAFC' }
                  ]}
                  onPress={() => setCategory(cat.id)}
                >
                  <Ionicons 
                    name={cat.icon} 
                    size={20} 
                    color={category === cat.id ? '#FFFFFF' : cat.color} 
                  />
                  <Text style={[
                    styles.categoryText,
                    { color: category === cat.id ? '#FFFFFF' : '#64748B' }
                  ]}>
                    {cat.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          {/* File Selection Options */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Select Files</Text>
            <View style={styles.fileOptions}>
              <TouchableOpacity 
                style={styles.fileOption}
                onPress={() => pickFiles('any')}
              >
                <LinearGradient
                  colors={['#6366F1', '#8B5CF6']}
                  style={styles.fileOptionGradient}
                >
                  <Ionicons name="document" size={28} color="#FFFFFF" />
                </LinearGradient>
                <Text style={styles.fileOptionText}>Documents</Text>
                <Text style={styles.fileOptionSubtext}>PDF, DOC, TXT</Text>
              </TouchableOpacity>

              <TouchableOpacity 
                style={styles.fileOption}
                onPress={() => pickFiles('image')}
              >
                <LinearGradient
                  colors={['#EC4899', '#F97316']}
                  style={styles.fileOptionGradient}
                >
                  <Ionicons name="image" size={28} color="#FFFFFF" />
                </LinearGradient>
                <Text style={styles.fileOptionText}>Images</Text>
                <Text style={styles.fileOptionSubtext}>JPG, PNG, GIF</Text>
              </TouchableOpacity>

              <TouchableOpacity 
                style={styles.fileOption}
                onPress={() => pickFiles('video')}
              >
                <LinearGradient
                  colors={['#8B5CF6', '#A855F7']}
                  style={styles.fileOptionGradient}
                >
                  <Ionicons name="videocam" size={28} color="#FFFFFF" />
                </LinearGradient>
                <Text style={styles.fileOptionText}>Videos</Text>
                <Text style={styles.fileOptionSubtext}>MP4, AVI, MOV</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Selected Files */}
          {selectedFiles.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>
                Selected Files ({selectedFiles.length})
              </Text>
              <View style={styles.filesList}>
                {selectedFiles.map(renderFileItem)}
              </View>
            </View>
          )}

          {/* Upload Guidelines */}
          <View style={styles.section}>
            <View style={styles.guidelinesCard}>
              <View style={styles.guidelinesHeader}>
                <Ionicons name="information-circle" size={20} color="#3B82F6" />
                <Text style={styles.guidelinesTitle}>Upload Guidelines</Text>
              </View>
              <View style={styles.guidelinesList}>
                <Text style={styles.guidelineItem}>• Maximum file size: 100MB per file</Text>
                <Text style={styles.guidelineItem}>• Supported formats: PDF, DOC, DOCX, PPT, PPTX, XLS, XLSX, TXT, JPG, PNG, GIF, MP4, AVI, MOV</Text>
                <Text style={styles.guidelineItem}>• Files will be available to all course members</Text>
                <Text style={styles.guidelineItem}>• Inappropriate content will be removed</Text>
              </View>
            </View>
          </View>
        </ScrollView>

        {/* Upload Button */}
        {selectedFiles.length > 0 && (
          <View style={styles.uploadContainer}>
            <TouchableOpacity 
              style={[styles.uploadButton, isUploading && styles.uploadButtonDisabled]}
              onPress={uploadFiles}
              disabled={isUploading}
            >
              <LinearGradient
                colors={isUploading ? ['#94A3B8', '#64748B'] : ['#10B981', '#059669']}
                style={styles.uploadButtonGradient}
              >
                {isUploading ? (
                  <>
                    <ActivityIndicator color="#FFFFFF" />
                    <Text style={styles.uploadButtonText}>Uploading...</Text>
                  </>
                ) : (
                  <>
                    <Ionicons name="cloud-upload" size={20} color="#FFFFFF" />
                    <Text style={styles.uploadButtonText}>
                      Upload {selectedFiles.length} File{selectedFiles.length > 1 ? 's' : ''}
                    </Text>
                  </>
                )}
              </LinearGradient>
            </TouchableOpacity>
          </View>
        )}
      </Animated.View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  header: {
    paddingTop: Platform.OS === 'ios' ? 0 : 20,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  headerInfo: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  headerSubtitle: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
    marginTop: 2,
  },
  headerActions: {
    flexDirection: 'row',
    gap: 8,
  },
  headerAction: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  section: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1E293B',
    marginBottom: 12,
  },
  categoriesScroll: {
    marginHorizontal: -16,
    paddingHorizontal: 16,
  },
  categoryItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    marginRight: 8,
    gap: 8,
  },
  categoryItemActive: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  categoryText: {
    fontSize: 14,
    fontWeight: '500',
  },
  fileOptions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  fileOption: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  fileOptionGradient: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  fileOptionText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1E293B',
    marginBottom: 4,
  },
  fileOptionSubtext: {
    fontSize: 12,
    color: '#64748B',
    textAlign: 'center',
  },
  filesList: {
    gap: 8,
  },
  fileItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  fileInfo: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  fileIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  fileDetails: {
    flex: 1,
  },
  fileName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1E293B',
    marginBottom: 2,
  },
  fileSize: {
    fontSize: 12,
    color: '#64748B',
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
    gap: 8,
  },
  progressBar: {
    flex: 1,
    height: 4,
    backgroundColor: '#E5E7EB',
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: {
    height: 4,
    backgroundColor: '#10B981',
    borderRadius: 2,
  },
  progressText: {
    fontSize: 10,
    color: '#64748B',
    width: 30,
  },
  uploadedIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
    gap: 4,
  },
  uploadedText: {
    fontSize: 12,
    color: '#10B981',
    fontWeight: '500',
  },
  removeButton: {
    padding: 4,
  },
  guidelinesCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  guidelinesHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 8,
  },
  guidelinesTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1E293B',
  },
  guidelinesList: {
    gap: 6,
  },
  guidelineItem: {
    fontSize: 14,
    color: '#64748B',
    lineHeight: 20,
  },
  uploadContainer: {
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  uploadButton: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  uploadButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    gap: 8,
  },
  uploadButtonDisabled: {
    opacity: 0.7,
  },
  uploadButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});
