import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  Alert,
  ActivityIndicator,
  Platform,
  Image,
  Dimensions,
  FlatList,
  Modal,
  TextInput,
  Animated,
  RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useApp } from '../context/AppContext';
import fileUploadService from '../services/fileUploadService';

const { width, height } = Dimensions.get('window');

export default function UploadNotesScreen({ navigation }) {
  const { user, csModules } = useApp();
  
  // State management
  const [selectedTab, setSelectedTab] = useState('upload');
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [sharedMaterials, setSharedMaterials] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showCourseModal, setShowCourseModal] = useState(false);
  const [showFileModal, setShowFileModal] = useState(false);
  const [selectedMaterial, setSelectedMaterial] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [materialDescription, setMaterialDescription] = useState('');
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Animation
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;

  useEffect(() => {
    if (user?.uid) {
      loadSharedMaterials();
      startAnimations();
    }
  }, [user?.uid, selectedCourse]);

  const startAnimations = () => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 500,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const getAvailableModules = () => {
    return csModules && Array.isArray(csModules) ? csModules : [];
  };

  const loadSharedMaterials = async () => {
    if (!selectedCourse) return;
    
    try {
      setIsLoading(true);
      const result = await fileUploadService.getCourseMaterials(selectedCourse.code);
      if (result.success) {
        setSharedMaterials(result.materials || []);
      } else {
        console.error('Error loading materials:', result.error);
      }
    } catch (error) {
      console.error('Error loading shared materials:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const onRefresh = async () => {
    setIsRefreshing(true);
    await loadSharedMaterials();
    setIsRefreshing(false);
  };

  const selectFiles = async (fileType = 'all') => {
    try {
      let result;
      
      switch (fileType) {
        case 'camera':
          result = await fileUploadService.takePhoto();
          break;
        case 'video':
          result = await fileUploadService.recordVideo();
          break;
        case 'image':
          result = await fileUploadService.pickImage();
          break;
        case 'document':
          result = await fileUploadService.pickFile('document');
          break;
        default:
          result = await fileUploadService.pickFile();
          break;
      }

      if (result.success) {
        const files = result.files || [result.file];
        setSelectedFiles(prev => [...prev, ...files]);
        Alert.alert('Success', `${files.length} file(s) selected! 📁`);
      } else {
        Alert.alert('Error', result.error || 'Failed to select files');
      }
    } catch (error) {
      console.error('Error selecting files:', error);
      Alert.alert('Error', 'Failed to select files');
    }
  };

  const removeFile = (index) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleUpload = async () => {
    if (selectedFiles.length === 0) {
      Alert.alert('No Files', 'Please select files to upload');
      return;
    }

    if (!selectedCourse) {
      Alert.alert('No Course Selected', 'Please select a course to upload to');
      return;
    }

    if (!materialDescription.trim()) {
      Alert.alert('Description Required', 'Please provide a description for your materials');
      return;
    }

    try {
      setIsUploading(true);
      setUploadProgress(0);

      const uploadPromises = selectedFiles.map(async (file, index) => {
        try {
          const result = await fileUploadService.uploadFile(
            file, 
            selectedCourse.code, 
            'materials',
            (progress) => {
              const totalProgress = ((index * 100) + progress) / selectedFiles.length;
              setUploadProgress(totalProgress);
            }
          );

          if (result.success) {
            // Save additional metadata for enhanced features
            const materialData = {
              id: result.fileId,
              originalFileName: file.name,
              fileUrl: result.downloadURL,
              fileSize: file.size || file.actualSize || 0,
              fileType: file.type,
              courseCode: selectedCourse.code,
              courseName: selectedCourse.name,
              uploadedBy: user?.uid,
              uploaderName: user?.fullName || user?.name || 'Unknown User',
              uploaderType: user?.userType || 'student',
              description: materialDescription.trim(),
              tags: [selectedCourse.code, user?.academicLevel || user?.userType, 'upload'],
              isSharedWithClassmates: true,
              accessLevel: 'course',
              likes: 0,
              comments: [],
              downloads: 0,
              category: getFileCategory(file.type),
              uploadedAt: new Date().toISOString(),
            };

            // Save to course materials collection for sharing
            await fileUploadService.saveChatFileToMaterials(result.downloadURL, materialData);
          }

          return result;
        } catch (error) {
          console.error('Upload error for file:', file.name, error);
          return { success: false, error: error.message, fileName: file.name };
        }
      });

      const results = await Promise.all(uploadPromises);
      const successful = results.filter(r => r.success);
      const failed = results.filter(r => !r.success);

      if (successful.length > 0) {
        Alert.alert(
          'Upload Complete! 🎉',
          `${successful.length} file(s) uploaded successfully and shared with your coursemates!`,
          [{ text: 'Great!', onPress: () => {
            setSelectedFiles([]);
            setMaterialDescription('');
            loadSharedMaterials();
            setSelectedTab('shared');
          }}]
        );
      }

      if (failed.length > 0) {
        const failedFileNames = failed.map(f => f.fileName || 'Unknown file').join(', ');
        const errorDetails = failed.map(f => f.error).join('; ');
        Alert.alert(
          'Partial Upload', 
          `${failed.length} file(s) failed to upload:\n${failedFileNames}\n\nErrors: ${errorDetails}`,
          [
            { text: 'Retry Failed', onPress: () => {
              // Keep only failed files for retry
              const failedFiles = selectedFiles.filter((_, index) => !results[index].success);
              setSelectedFiles(failedFiles);
            }},
            { text: 'OK' }
          ]
        );
      }

    } catch (error) {
      console.error('Upload error:', error);
      Alert.alert('Upload Failed', 'Failed to upload files. Please try again.');
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  const getFileCategory = (mimeType) => {
    if (!mimeType) return 'other';
    
    if (mimeType.includes('pdf')) return 'pdf';
    if (mimeType.includes('image')) return 'image';
    if (mimeType.includes('video')) return 'video';
    if (mimeType.includes('audio')) return 'audio';
    if (mimeType.includes('text') || mimeType.includes('document')) return 'document';
    if (mimeType.includes('spreadsheet') || mimeType.includes('excel')) return 'spreadsheet';
    if (mimeType.includes('presentation') || mimeType.includes('powerpoint')) return 'presentation';
    
    return 'other';
  };

  const getFileIcon = (type) => {
    const category = getFileCategory(type);
    
    switch (category) {
      case 'pdf': return 'document-text';
      case 'image': return 'image';
      case 'video': return 'videocam';
      case 'audio': return 'musical-notes';
      case 'document': return 'document';
      case 'spreadsheet': return 'grid';
      case 'presentation': return 'easel';
      default: return 'attach';
    }
  };

  const getFileIconColor = (type) => {
    const category = getFileCategory(type);
    
    switch (category) {
      case 'pdf': return '#EF4444';
      case 'image': return '#10B981';
      case 'video': return '#8B5CF6';
      case 'audio': return '#F59E0B';
      case 'document': return '#3B82F6';
      case 'spreadsheet': return '#059669';
      case 'presentation': return '#DC2626';
      default: return '#6B7280';
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const downloadMaterial = async (material) => {
    try {
      Alert.alert(
        'Download Material',
        `Download "${material.originalFileName}"?`,
        [
          { text: 'Cancel', style: 'cancel' },
          { 
            text: 'Download', 
            onPress: async () => {
              // In a real app, you would implement actual download functionality
              // For now, we'll just show a success message
              Alert.alert('Download Started', 'The file download will begin shortly!');
              
              // Update download count
              // await fileUploadService.incrementDownloadCount(material.id);
            }
          }
        ]
      );
    } catch (error) {
      console.error('Download error:', error);
      Alert.alert('Error', 'Failed to download file');
    }
  };

  const likeMaterial = async (materialId) => {
    try {
      // In a real app, you would implement like functionality
      Alert.alert('Liked!', 'You liked this material! 👍');
    } catch (error) {
      console.error('Like error:', error);
    }
  };

  const filteredMaterials = sharedMaterials.filter(material => {
    const matchesSearch = material.originalFileName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         material.description?.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesFilter = filterType === 'all' || getFileCategory(material.fileType) === filterType;
    
    return matchesSearch && matchesFilter;
  });

  const renderUploadTab = () => (
    <ScrollView showsVerticalScrollIndicator={false} style={styles.tabContent}>
      {/* Course Selection */}
      <View style={styles.sectionCard}>
        <Text style={styles.sectionTitle}>📚 Select Course</Text>
        <TouchableOpacity
          style={styles.courseSelector}
          onPress={() => setShowCourseModal(true)}
        >
          <View style={styles.courseSelectorContent}>
            {selectedCourse ? (
              <>
                <View style={styles.selectedCourseInfo}>
                  <Text style={styles.selectedCourseCode}>{selectedCourse.code}</Text>
                  <Text style={styles.selectedCourseName}>{selectedCourse.name}</Text>
                </View>
                <Ionicons name="chevron-down" size={20} color="#4F46E5" />
              </>
            ) : (
              <>
                <Text style={styles.coursePlaceholder}>Choose a course to upload to</Text>
                <Ionicons name="chevron-down" size={20} color="#94A3B8" />
              </>
            )}
          </View>
        </TouchableOpacity>
      </View>

      {/* File Selection */}
      <View style={styles.sectionCard}>
        <Text style={styles.sectionTitle}>📁 Select Files</Text>
        
        <View style={styles.fileTypeGrid}>
          <TouchableOpacity style={styles.fileTypeButton} onPress={() => selectFiles('camera')}>
            <LinearGradient colors={['#10B981', '#059669']} style={styles.fileTypeGradient}>
              <Ionicons name="camera" size={24} color="#FFFFFF" />
            </LinearGradient>
            <Text style={styles.fileTypeText}>Camera</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.fileTypeButton} onPress={() => selectFiles('video')}>
            <LinearGradient colors={['#8B5CF6', '#7C3AED']} style={styles.fileTypeGradient}>
              <Ionicons name="videocam" size={24} color="#FFFFFF" />
            </LinearGradient>
            <Text style={styles.fileTypeText}>Video</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.fileTypeButton} onPress={() => selectFiles('image')}>
            <LinearGradient colors={['#F59E0B', '#D97706']} style={styles.fileTypeGradient}>
              <Ionicons name="image" size={24} color="#FFFFFF" />
            </LinearGradient>
            <Text style={styles.fileTypeText}>Photos</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.fileTypeButton} onPress={() => selectFiles('document')}>
            <LinearGradient colors={['#EF4444', '#DC2626']} style={styles.fileTypeGradient}>
              <Ionicons name="document-text" size={24} color="#FFFFFF" />
            </LinearGradient>
            <Text style={styles.fileTypeText}>Documents</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          style={styles.browseFilesButton}
          onPress={() => selectFiles()}
        >
          <Ionicons name="folder-open" size={20} color="#4F46E5" />
          <Text style={styles.browseFilesText}>Browse All Files</Text>
        </TouchableOpacity>
      </View>

      {/* Selected Files */}
      {selectedFiles.length > 0 && (
        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>📎 Selected Files ({selectedFiles.length})</Text>
          
          {selectedFiles.map((file, index) => (
            <View key={index} style={styles.selectedFileItem}>
              <View style={styles.fileIconContainer}>
                <Ionicons 
                  name={getFileIcon(file.type)} 
                  size={24} 
                  color={getFileIconColor(file.type)} 
                />
              </View>
              <View style={styles.fileDetails}>
                <Text style={styles.fileName} numberOfLines={1}>{file.name}</Text>
                <Text style={styles.fileSize}>{formatFileSize(file.size || file.actualSize || 0)}</Text>
              </View>
              <TouchableOpacity
                style={styles.removeFileButton}
                onPress={() => removeFile(index)}
              >
                <Ionicons name="close-circle" size={20} color="#EF4444" />
              </TouchableOpacity>
            </View>
          ))}
        </View>
      )}

      {/* Description */}
      {selectedFiles.length > 0 && (
        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>📝 Description</Text>
          <TextInput
            style={styles.descriptionInput}
            placeholder="Describe what you're sharing with your coursemates..."
            value={materialDescription}
            onChangeText={setMaterialDescription}
            multiline
            numberOfLines={3}
            textAlignVertical="top"
          />
        </View>
      )}

      {/* Upload Button */}
      {selectedFiles.length > 0 && selectedCourse && (
        <View style={styles.uploadButtonContainer}>
          <TouchableOpacity
            style={[styles.uploadButton, isUploading && styles.uploadButtonDisabled]}
            onPress={handleUpload}
            disabled={isUploading}
          >
            <LinearGradient
              colors={isUploading ? ['#94A3B8', '#64748B'] : ['#4F46E5', '#7C3AED']}
              style={styles.uploadButtonGradient}
            >
              {isUploading ? (
                <>
                  <ActivityIndicator size="small" color="#FFFFFF" />
                  <Text style={styles.uploadButtonText}>
                    Uploading... {Math.round(uploadProgress)}%
                  </Text>
                </>
              ) : (
                <>
                  <Ionicons name="cloud-upload" size={20} color="#FFFFFF" />
                  <Text style={styles.uploadButtonText}>
                    Share with Coursemates ({selectedFiles.length} files)
                  </Text>
                </>
              )}
            </LinearGradient>
          </TouchableOpacity>

          {isUploading && (
            <View style={styles.progressContainer}>
              <View style={styles.progressBar}>
                <View style={[styles.progressFill, { width: `${uploadProgress}%` }]} />
              </View>
            </View>
          )}
        </View>
      )}
    </ScrollView>
  );

  const renderSharedTab = () => (
    <View style={styles.tabContent}>
      {/* Search and Filter */}
      <View style={styles.searchFilterContainer}>
        <View style={styles.searchContainer}>
          <Ionicons name="search" size={20} color="#94A3B8" />
          <TextInput
            style={styles.searchInput}
            placeholder="Search materials..."
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterContainer}>
          {['all', 'pdf', 'image', 'video', 'document'].map((filter) => (
            <TouchableOpacity
              key={filter}
              style={[
                styles.filterButton,
                filterType === filter && styles.activeFilter
              ]}
              onPress={() => setFilterType(filter)}
            >
              <Text style={[
                styles.filterText,
                filterType === filter && styles.activeFilterText
              ]}>
                {filter.charAt(0).toUpperCase() + filter.slice(1)}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Materials List */}
      <FlatList
        data={filteredMaterials}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} />
        }
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.materialCard}
            onPress={() => {
              setSelectedMaterial(item);
              setShowFileModal(true);
            }}
          >
            <View style={styles.materialHeader}>
              <View style={styles.materialIconContainer}>
                <Ionicons 
                  name={getFileIcon(item.fileType)} 
                  size={24} 
                  color={getFileIconColor(item.fileType)} 
                />
              </View>
              <View style={styles.materialInfo}>
                <Text style={styles.materialFileName} numberOfLines={1}>
                  {item.originalFileName}
                </Text>
                <Text style={styles.materialDescription} numberOfLines={2}>
                  {item.description}
                </Text>
                <View style={styles.materialMeta}>
                  <Text style={styles.materialUploader}>
                    👤 {item.uploaderName}
                  </Text>
                  <Text style={styles.materialDate}>
                    📅 {new Date(item.uploadedAt).toLocaleDateString()}
                  </Text>
                </View>
              </View>
            </View>

            <View style={styles.materialActions}>
              <TouchableOpacity
                style={styles.materialActionButton}
                onPress={() => likeMaterial(item.id)}
              >
                <Ionicons name="heart-outline" size={16} color="#EF4444" />
                <Text style={styles.materialActionText}>{item.likes || 0}</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.materialActionButton}
                onPress={() => downloadMaterial(item)}
              >
                <Ionicons name="download-outline" size={16} color="#10B981" />
                <Text style={styles.materialActionText}>{item.downloads || 0}</Text>
              </TouchableOpacity>

              <View style={styles.materialSize}>
                <Text style={styles.materialSizeText}>
                  {formatFileSize(item.fileSize || 0)}
                </Text>
              </View>
            </View>
          </TouchableOpacity>
        )}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Ionicons name="folder-open-outline" size={64} color="#CBD5E1" />
            <Text style={styles.emptyTitle}>No Materials Found</Text>
            <Text style={styles.emptyText}>
              {selectedCourse 
                ? `No materials shared for ${selectedCourse.code} yet.`
                : 'Select a course to view shared materials.'
              }
            </Text>
          </View>
        }
      />
    </View>
  );

  const tabItems = [
    { id: 'upload', label: 'Upload', icon: 'cloud-upload' },
    { id: 'shared', label: 'Shared Materials', icon: 'folder-open' }
  ];

  if (!user) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#4F46E5" />
          <Text style={styles.loadingText}>Loading...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#1E293B" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Study Materials</Text>
        <TouchableOpacity onPress={() => Alert.alert('Help', 'Share notes, PDFs, images and other study materials with your coursemates!')}>
          <Ionicons name="help-circle-outline" size={24} color="#4F46E5" />
        </TouchableOpacity>
      </View>

      <Animated.View style={{ flex: 1, opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}>
        {/* Tab Navigation */}
        <View style={styles.tabContainer}>
          {tabItems.map((tab) => (
            <TouchableOpacity
              key={tab.id}
              style={[styles.tabItem, selectedTab === tab.id && styles.activeTab]}
              onPress={() => setSelectedTab(tab.id)}
            >
              <Ionicons 
                name={tab.icon} 
                size={20} 
                color={selectedTab === tab.id ? "#4F46E5" : "#94A3B8"} 
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
        {selectedTab === 'upload' && renderUploadTab()}
        {selectedTab === 'shared' && renderSharedTab()}
      </Animated.View>

      {/* Course Selection Modal */}
      <Modal
        visible={showCourseModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowCourseModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.courseModal}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select Course</Text>
              <TouchableOpacity onPress={() => setShowCourseModal(false)}>
                <Ionicons name="close" size={24} color="#64748B" />
              </TouchableOpacity>
            </View>

            <FlatList
              data={getAvailableModules()}
              keyExtractor={(item) => item.code}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.courseItem}
                  onPress={() => {
                    setSelectedCourse(item);
                    setShowCourseModal(false);
                  }}
                >
                  <View style={styles.courseItemContent}>
                    <Text style={styles.courseItemCode}>{item.code}</Text>
                    <Text style={styles.courseItemName}>{item.name}</Text>
                  </View>
                  <Ionicons name="chevron-forward" size={20} color="#94A3B8" />
                </TouchableOpacity>
              )}
            />
          </View>
        </View>
      </Modal>

      {/* File Details Modal */}
      <Modal
        visible={showFileModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowFileModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.fileModal}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Material Details</Text>
              <TouchableOpacity onPress={() => setShowFileModal(false)}>
                <Ionicons name="close" size={24} color="#64748B" />
              </TouchableOpacity>
            </View>

            {selectedMaterial && (
              <ScrollView style={styles.modalContent}>
                <View style={styles.filePreview}>
                  <View style={styles.filePreviewIcon}>
                    <Ionicons 
                      name={getFileIcon(selectedMaterial.fileType)} 
                      size={48} 
                      color={getFileIconColor(selectedMaterial.fileType)} 
                    />
                  </View>
                  <Text style={styles.filePreviewName}>
                    {selectedMaterial.originalFileName}
                  </Text>
                  <Text style={styles.filePreviewSize}>
                    {formatFileSize(selectedMaterial.fileSize || 0)}
                  </Text>
                </View>

                <View style={styles.fileDetailsSection}>
                  <Text style={styles.fileDetailTitle}>Description</Text>
                  <Text style={styles.fileDetailText}>
                    {selectedMaterial.description || 'No description provided'}
                  </Text>
                </View>

                <View style={styles.fileDetailsSection}>
                  <Text style={styles.fileDetailTitle}>Shared by</Text>
                  <Text style={styles.fileDetailText}>
                    {selectedMaterial.uploaderName} ({selectedMaterial.uploaderType})
                  </Text>
                </View>

                <View style={styles.fileDetailsSection}>
                  <Text style={styles.fileDetailTitle}>Uploaded on</Text>
                  <Text style={styles.fileDetailText}>
                    {new Date(selectedMaterial.uploadedAt).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </Text>
                </View>

                <View style={styles.fileStatsContainer}>
                  <View style={styles.fileStat}>
                    <Ionicons name="heart" size={20} color="#EF4444" />
                    <Text style={styles.fileStatText}>{selectedMaterial.likes || 0} likes</Text>
                  </View>
                  <View style={styles.fileStat}>
                    <Ionicons name="download" size={20} color="#10B981" />
                    <Text style={styles.fileStatText}>{selectedMaterial.downloads || 0} downloads</Text>
                  </View>
                </View>

                <TouchableOpacity
                  style={styles.downloadButton}
                  onPress={() => {
                    setShowFileModal(false);
                    downloadMaterial(selectedMaterial);
                  }}
                >
                  <LinearGradient
                    colors={['#10B981', '#059669']}
                    style={styles.downloadButtonGradient}
                  >
                    <Ionicons name="download" size={20} color="#FFFFFF" />
                    <Text style={styles.downloadButtonText}>Download Material</Text>
                  </LinearGradient>
                </TouchableOpacity>
              </ScrollView>
            )}
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#64748B',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1E293B',
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 16,
    gap: 4,
  },
  activeTab: {
    borderBottomWidth: 2,
    borderBottomColor: '#4F46E5',
  },
  tabLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#94A3B8',
  },
  activeTabLabel: {
    color: '#4F46E5',
  },
  tabContent: {
    flex: 1,
    padding: 20,
  },
  sectionCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1E293B',
    marginBottom: 16,
  },
  courseSelector: {
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    overflow: 'hidden',
  },
  courseSelectorContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
  },
  selectedCourseInfo: {
    flex: 1,
  },
  selectedCourseCode: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1E293B',
    marginBottom: 4,
  },
  selectedCourseName: {
    fontSize: 14,
    color: '#64748B',
  },
  coursePlaceholder: {
    fontSize: 16,
    color: '#94A3B8',
  },
  fileTypeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 16,
  },
  fileTypeButton: {
    alignItems: 'center',
    minWidth: (width - 80) / 4,
  },
  fileTypeGradient: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  fileTypeText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#64748B',
    textAlign: 'center',
  },
  browseFilesButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: '#4F46E5',
    borderRadius: 12,
    gap: 8,
  },
  browseFilesText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#4F46E5',
  },
  selectedFileItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  fileIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F8FAFC',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  fileDetails: {
    flex: 1,
  },
  fileName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1E293B',
    marginBottom: 4,
  },
  fileSize: {
    fontSize: 12,
    color: '#94A3B8',
  },
  removeFileButton: {
    padding: 4,
  },
  descriptionInput: {
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: '#1E293B',
    backgroundColor: '#FFFFFF',
    minHeight: 80,
  },
  uploadButtonContainer: {
    marginVertical: 20,
  },
  uploadButton: {
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 12,
  },
  uploadButtonDisabled: {
    opacity: 0.7,
  },
  uploadButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    gap: 8,
  },
  uploadButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  progressContainer: {
    marginTop: 8,
  },
  progressBar: {
    height: 4,
    backgroundColor: '#E2E8F0',
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#4F46E5',
  },
  searchFilterContainer: {
    marginBottom: 20,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#1E293B',
    marginLeft: 12,
  },
  filterContainer: {
    flexDirection: 'row',
  },
  filterButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#F1F5F9',
    marginRight: 8,
  },
  activeFilter: {
    backgroundColor: '#4F46E5',
  },
  filterText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#64748B',
  },
  activeFilterText: {
    color: '#FFFFFF',
  },
  materialCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  materialHeader: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  materialIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#F8FAFC',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  materialInfo: {
    flex: 1,
  },
  materialFileName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1E293B',
    marginBottom: 4,
  },
  materialDescription: {
    fontSize: 14,
    color: '#64748B',
    lineHeight: 20,
    marginBottom: 8,
  },
  materialMeta: {
    flexDirection: 'row',
    gap: 16,
  },
  materialUploader: {
    fontSize: 12,
    color: '#94A3B8',
  },
  materialDate: {
    fontSize: 12,
    color: '#94A3B8',
  },
  materialActions: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  materialActionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  materialActionText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#64748B',
  },
  materialSize: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    backgroundColor: '#F1F5F9',
    borderRadius: 8,
  },
  materialSizeText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#4F46E5',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
    paddingHorizontal: 20,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#64748B',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    color: '#94A3B8',
    textAlign: 'center',
    lineHeight: 20,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  courseModal: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    width: width * 0.9,
    maxHeight: height * 0.6,
  },
  fileModal: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    width: width * 0.9,
    maxHeight: height * 0.8,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 24,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1E293B',
  },
  courseItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  courseItemContent: {
    flex: 1,
  },
  courseItemCode: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1E293B',
    marginBottom: 4,
  },
  courseItemName: {
    fontSize: 14,
    color: '#64748B',
  },
  modalContent: {
    padding: 24,
    maxHeight: height * 0.5,
  },
  filePreview: {
    alignItems: 'center',
    paddingVertical: 20,
    marginBottom: 20,
  },
  filePreviewIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#F8FAFC',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  filePreviewName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1E293B',
    textAlign: 'center',
    marginBottom: 8,
  },
  filePreviewSize: {
    fontSize: 14,
    color: '#64748B',
  },
  fileDetailsSection: {
    marginBottom: 16,
  },
  fileDetailTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#64748B',
    marginBottom: 4,
  },
  fileDetailText: {
    fontSize: 16,
    color: '#1E293B',
    lineHeight: 24,
  },
  fileStatsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 16,
    marginVertical: 16,
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
  },
  fileStat: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  fileStatText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#64748B',
  },
  downloadButton: {
    borderRadius: 12,
    overflow: 'hidden',
    marginTop: 20,
  },
  downloadButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    gap: 8,
  },
  downloadButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});