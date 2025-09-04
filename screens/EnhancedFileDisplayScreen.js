import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  Dimensions,
  Animated,
  RefreshControl,
  FlatList,
  Modal,
  Alert,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { StatusBar } from 'expo-status-bar';
import { useApp } from '../context/AppContext';
import { Colors } from '../themes/modernTheme';
import enhancedFileUploadService from '../services/enhancedFileUploadService';

const { width, height } = Dimensions.get('window');

export default function EnhancedFileDisplayScreen({ navigation, route }) {
  const { user } = useApp();
  const [refreshing, setRefreshing] = useState(false);
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedFile, setSelectedFile] = useState(null);
  const [showFileModal, setShowFileModal] = useState(false);
  const [filterType, setFilterType] = useState('all');

  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    loadFiles();
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 800,
      useNativeDriver: true,
    }).start();
  }, []);

  const loadFiles = async () => {
    try {
      setLoading(true);
      const result = await enhancedFileUploadService.getUploadedFiles({
        userId: user?.uid,
        courseCode: route?.params?.courseCode,
      });
      
      if (result.success) {
        setFiles(result.files);
      } else {
        Alert.alert('Error', result.error || 'Failed to load files');
      }
    } catch (error) {
      console.error('Error loading files:', error);
      Alert.alert('Error', 'Failed to load files');
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadFiles();
    setRefreshing(false);
  };

  // File type filters with current colors
  const fileFilters = [
    { id: 'all', name: 'All Files', icon: 'folder-outline', color: Colors.neutral[600] },
    { id: 'document', name: 'Documents', icon: 'document-text-outline', color: Colors.primary[500] },
    { id: 'image', name: 'Images', icon: 'image-outline', color: Colors.success[500] },
    { id: 'video', name: 'Videos', icon: 'videocam-outline', color: Colors.warning[500] },
    { id: 'audio', name: 'Audio', icon: 'musical-notes-outline', color: Colors.secondary[500] },
  ];

  // Enhanced file stats with current colors
  const fileStats = [
    {
      title: 'Total Files',
      value: files.length.toString(),
      icon: 'folder',
      color: Colors.primary[500],
      subtitle: 'All uploads',
    },
    {
      title: 'Documents',
      value: files.filter(f => f.type?.includes('document') || f.type?.includes('pdf')).length.toString(),
      icon: 'document-text',
      color: Colors.success[500],
      subtitle: 'PDF, DOC, etc.',
    },
    {
      title: 'Images',
      value: files.filter(f => f.type?.includes('image')).length.toString(),
      icon: 'image',
      color: Colors.warning[500],
      subtitle: 'JPG, PNG, etc.',
    },
    {
      title: 'Storage Used',
      value: `${Math.round(files.reduce((sum, f) => sum + (f.size || 0), 0) / 1024 / 1024)}MB`,
      icon: 'cloud',
      color: Colors.error[500],
      subtitle: 'Total size',
    },
  ];

  const getFileIcon = (file) => {
    const type = file.type?.toLowerCase() || '';
    const name = file.name?.toLowerCase() || '';
    
    if (type.includes('image') || name.includes('.jpg') || name.includes('.png')) {
      return { icon: 'image', color: Colors.success[500] };
    } else if (type.includes('video') || name.includes('.mp4') || name.includes('.mov')) {
      return { icon: 'videocam', color: Colors.warning[500] };
    } else if (type.includes('audio') || name.includes('.mp3') || name.includes('.wav')) {
      return { icon: 'musical-notes', color: Colors.secondary[500] };
    } else if (type.includes('pdf') || name.includes('.pdf')) {
      return { icon: 'document-text', color: Colors.error[500] };
    } else {
      return { icon: 'document', color: Colors.primary[500] };
    }
  };

  const formatFileSize = (bytes) => {
    if (!bytes) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Unknown';
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };

  const handleFilePress = (file) => {
    setSelectedFile(file);
    setShowFileModal(true);
  };

  const handleDownloadFile = async (file) => {
    try {
      Alert.alert('Download', `Downloading ${file.name}...`);
      await enhancedFileUploadService.incrementDownloadCount(file.id);
      // In a real app, you would implement actual file download here
    } catch (error) {
      Alert.alert('Error', 'Failed to download file');
    }
  };

  const handleDeleteFile = async (file) => {
    Alert.alert(
      'Delete File',
      `Are you sure you want to delete ${file.name}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              const result = await enhancedFileUploadService.deleteFile(file.id, file.path);
              if (result.success) {
                setFiles(files.filter(f => f.id !== file.id));
                setShowFileModal(false);
                Alert.alert('Success', 'File deleted successfully');
              } else {
                Alert.alert('Error', result.error || 'Failed to delete file');
              }
            } catch (error) {
              Alert.alert('Error', 'Failed to delete file');
            }
          },
        },
      ]
    );
  };

  const renderFilter = ({ item }) => (
    <TouchableOpacity
      style={[
        styles.filterButton,
        filterType === item.id && styles.activeFilterButton,
        { borderColor: item.color }
      ]}
      onPress={() => setFilterType(item.id)}
    >
      <Ionicons 
        name={item.icon} 
        size={20} 
        color={filterType === item.id ? 'white' : item.color} 
      />
      <Text 
        style={[
          styles.filterText,
          filterType === item.id && styles.activeFilterText,
          { color: filterType === item.id ? 'white' : item.color }
        ]}
      >
        {item.name}
      </Text>
    </TouchableOpacity>
  );

  const renderStat = ({ item }) => (
    <View style={styles.statCard}>
      <View style={[styles.statIcon, { backgroundColor: `${item.color}15` }]}>
        <Ionicons name={item.icon} size={24} color={item.color} />
      </View>
      <Text style={styles.statValue}>{item.value}</Text>
      <Text style={styles.statTitle}>{item.title}</Text>
      <Text style={styles.statSubtitle}>{item.subtitle}</Text>
    </View>
  );

  const renderFile = ({ item, index }) => {
    const fileIcon = getFileIcon(item);
    
    return (
      <Animated.View
        style={[
          styles.fileContainer,
          {
            opacity: fadeAnim,
            transform: [
              {
                translateY: fadeAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [20, 0],
                }),
              },
            ],
          },
        ]}
      >
        <TouchableOpacity
          style={styles.fileCard}
          onPress={() => handleFilePress(item)}
          activeOpacity={0.8}
        >
          <View style={styles.fileHeader}>
            <View style={[styles.fileIcon, { backgroundColor: `${fileIcon.color}15` }]}>
              <Ionicons name={fileIcon.icon} size={28} color={fileIcon.color} />
            </View>
            <View style={styles.fileInfo}>
              <Text style={styles.fileName} numberOfLines={2}>
                {item.name}
              </Text>
              <Text style={styles.fileSize}>{formatFileSize(item.size)}</Text>
            </View>
            <TouchableOpacity
              style={styles.moreButton}
              onPress={() => handleFilePress(item)}
            >
              <Ionicons name="ellipsis-vertical" size={20} color={Colors.neutral[400]} />
            </TouchableOpacity>
          </View>
          
          <View style={styles.fileFooter}>
            <Text style={styles.fileDate}>
              Uploaded {formatDate(item.uploadedAt)}
            </Text>
            <View style={styles.fileStats}>
              <View style={styles.fileStat}>
                <Ionicons name="download-outline" size={14} color={Colors.neutral[500]} />
                <Text style={styles.fileStatText}>{item.downloadCount || 0}</Text>
              </View>
              <View style={styles.fileStat}>
                <Ionicons name="person-outline" size={14} color={Colors.neutral[500]} />
                <Text style={styles.fileStatText}>{item.uploaderName || 'Unknown'}</Text>
              </View>
            </View>
          </View>
        </TouchableOpacity>
      </Animated.View>
    );
  };

  const filteredFiles = filterType === 'all' 
    ? files 
    : files.filter(file => {
        const type = file.type?.toLowerCase() || '';
        const name = file.name?.toLowerCase() || '';
        
        switch (filterType) {
          case 'document':
            return type.includes('document') || type.includes('pdf') || name.includes('.pdf') || name.includes('.doc');
          case 'image':
            return type.includes('image') || name.includes('.jpg') || name.includes('.png');
          case 'video':
            return type.includes('video') || name.includes('.mp4') || name.includes('.mov');
          case 'audio':
            return type.includes('audio') || name.includes('.mp3') || name.includes('.wav');
          default:
            return true;
        }
      });

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="light" />
      
      {/* Header */}
      <LinearGradient
        colors={[Colors.primary[600], Colors.primary[500]]}
        style={styles.header}
      >
        <View style={styles.headerContent}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="arrow-back" size={24} color="white" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Enhanced Files</Text>
          <TouchableOpacity
            style={styles.uploadButton}
            onPress={() => navigation.navigate('UploadNotes')}
          >
            <Ionicons name="add" size={24} color="white" />
          </TouchableOpacity>
        </View>
      </LinearGradient>

      <Animated.ScrollView
        style={[styles.content, { opacity: fadeAnim }]}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        showsVerticalScrollIndicator={false}
      >
        {/* File Stats */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>File Overview</Text>
          <FlatList
            data={fileStats}
            renderItem={renderStat}
            keyExtractor={item => item.title}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.statsContainer}
          />
        </View>

        {/* File Filters */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Filter Files</Text>
          <FlatList
            data={fileFilters}
            renderItem={renderFilter}
            keyExtractor={item => item.id}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.filtersContainer}
          />
        </View>

        {/* Files List */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            {filterType === 'all' ? 'All Files' : fileFilters.find(f => f.id === filterType)?.name} 
            ({filteredFiles.length})
          </Text>
          {loading ? (
            <View style={styles.loadingContainer}>
              <Text style={styles.loadingText}>Loading files...</Text>
            </View>
          ) : filteredFiles.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Ionicons name="folder-open-outline" size={64} color={Colors.neutral[300]} />
              <Text style={styles.emptyTitle}>No files found</Text>
              <Text style={styles.emptySubtitle}>
                {filterType === 'all' ? 'Upload your first file to get started' : `No ${filterType} files available`}
              </Text>
            </View>
          ) : (
            <FlatList
              data={filteredFiles}
              renderItem={renderFile}
              keyExtractor={item => item.id}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.filesContainer}
            />
          )}
        </View>
      </Animated.ScrollView>

      {/* File Detail Modal */}
      <Modal
        visible={showFileModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowFileModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            {selectedFile && (
              <>
                <View style={styles.modalHeader}>
                  <Text style={styles.modalTitle}>File Details</Text>
                  <TouchableOpacity
                    style={styles.closeButton}
                    onPress={() => setShowFileModal(false)}
                  >
                    <Ionicons name="close" size={24} color={Colors.neutral[600]} />
                  </TouchableOpacity>
                </View>

                <ScrollView style={styles.modalBody}>
                  <View style={styles.fileDetailCard}>
                    {(() => {
                      const fileIcon = getFileIcon(selectedFile);
                      return (
                        <View style={[styles.fileDetailIcon, { backgroundColor: `${fileIcon.color}15` }]}>
                          <Ionicons name={fileIcon.icon} size={48} color={fileIcon.color} />
                        </View>
                      );
                    })()}
                    <Text style={styles.fileDetailName}>{selectedFile.name}</Text>
                    <Text style={styles.fileDetailSize}>{formatFileSize(selectedFile.size)}</Text>
                  </View>

                  <View style={styles.detailSection}>
                    <Text style={styles.detailSectionTitle}>Information</Text>
                    <View style={styles.detailRow}>
                      <Text style={styles.detailLabel}>Uploaded:</Text>
                      <Text style={styles.detailValue}>{formatDate(selectedFile.uploadedAt)}</Text>
                    </View>
                    <View style={styles.detailRow}>
                      <Text style={styles.detailLabel}>Type:</Text>
                      <Text style={styles.detailValue}>{selectedFile.type || 'Unknown'}</Text>
                    </View>
                    <View style={styles.detailRow}>
                      <Text style={styles.detailLabel}>Downloads:</Text>
                      <Text style={styles.detailValue}>{selectedFile.downloadCount || 0}</Text>
                    </View>
                    <View style={styles.detailRow}>
                      <Text style={styles.detailLabel}>Course:</Text>
                      <Text style={styles.detailValue}>{selectedFile.courseCode || 'General'}</Text>
                    </View>
                  </View>
                </ScrollView>

                <View style={styles.modalActions}>
                  <TouchableOpacity
                    style={styles.actionButton}
                    onPress={() => handleDownloadFile(selectedFile)}
                  >
                    <LinearGradient
                      colors={[Colors.primary[500], Colors.primary[400]]}
                      style={styles.actionButtonGradient}
                    >
                      <Ionicons name="download-outline" size={20} color="white" />
                      <Text style={styles.actionButtonText}>Download</Text>
                    </LinearGradient>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.actionButton, styles.deleteButton]}
                    onPress={() => handleDeleteFile(selectedFile)}
                  >
                    <View style={styles.deleteButtonContent}>
                      <Ionicons name="trash-outline" size={20} color={Colors.error[500]} />
                      <Text style={[styles.actionButtonText, { color: Colors.error[500] }]}>Delete</Text>
                    </View>
                  </TouchableOpacity>
                </View>
              </>
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
    backgroundColor: Colors.neutral[50],
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 30,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
  },
  uploadButton: {
    padding: 8,
  },
  content: {
    flex: 1,
  },
  section: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.neutral[800],
    marginBottom: 16,
  },
  statsContainer: {
    gap: 12,
  },
  statCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    width: 120,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.neutral[800],
    marginBottom: 4,
  },
  statTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.neutral[700],
    marginBottom: 2,
    textAlign: 'center',
  },
  statSubtitle: {
    fontSize: 10,
    color: Colors.neutral[500],
    textAlign: 'center',
  },
  filtersContainer: {
    gap: 12,
  },
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    backgroundColor: 'white',
    gap: 8,
  },
  activeFilterButton: {
    backgroundColor: Colors.primary[500],
    borderColor: Colors.primary[500],
  },
  filterText: {
    fontSize: 14,
    fontWeight: '600',
  },
  activeFilterText: {
    color: 'white',
  },
  filesContainer: {
    gap: 12,
  },
  fileContainer: {
    marginBottom: 4,
  },
  fileCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  fileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  fileIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  fileInfo: {
    flex: 1,
  },
  fileName: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.neutral[800],
    marginBottom: 4,
  },
  fileSize: {
    fontSize: 14,
    color: Colors.neutral[600],
  },
  moreButton: {
    padding: 8,
  },
  fileFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  fileDate: {
    fontSize: 12,
    color: Colors.neutral[500],
  },
  fileStats: {
    flexDirection: 'row',
    gap: 16,
  },
  fileStat: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  fileStatText: {
    fontSize: 12,
    color: Colors.neutral[500],
  },
  loadingContainer: {
    padding: 40,
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: Colors.neutral[600],
  },
  emptyContainer: {
    padding: 40,
    alignItems: 'center',
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.neutral[600],
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    color: Colors.neutral[500],
    textAlign: 'center',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: width * 0.9,
    maxHeight: height * 0.8,
    backgroundColor: 'white',
    borderRadius: 16,
    overflow: 'hidden',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: Colors.neutral[200],
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.neutral[800],
  },
  closeButton: {
    padding: 4,
  },
  modalBody: {
    flex: 1,
    padding: 20,
  },
  fileDetailCard: {
    alignItems: 'center',
    marginBottom: 24,
  },
  fileDetailIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  fileDetailName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.neutral[800],
    marginBottom: 8,
    textAlign: 'center',
  },
  fileDetailSize: {
    fontSize: 14,
    color: Colors.neutral[600],
  },
  detailSection: {
    marginBottom: 20,
  },
  detailSectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.neutral[800],
    marginBottom: 12,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: Colors.neutral[100],
  },
  detailLabel: {
    fontSize: 14,
    color: Colors.neutral[600],
  },
  detailValue: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.neutral[800],
  },
  modalActions: {
    flexDirection: 'row',
    padding: 20,
    gap: 12,
    borderTopWidth: 1,
    borderTopColor: Colors.neutral[200],
  },
  actionButton: {
    flex: 1,
    borderRadius: 12,
    overflow: 'hidden',
  },
  actionButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    gap: 8,
  },
  actionButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
  },
  deleteButton: {
    borderWidth: 1,
    borderColor: Colors.error[300],
  },
  deleteButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    gap: 8,
  },
});