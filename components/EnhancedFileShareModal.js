import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  FlatList,
  Alert,
  ActivityIndicator,
  TextInput,
  Animated,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { StatusBar } from 'expo-status-bar';
import * as DocumentPicker from 'expo-document-picker';
import * as ImagePicker from 'expo-image-picker';
import { Colors } from '../themes/modernTheme';
import enhancedFileUploadService from '../services/enhancedFileUploadService';

const { width, height } = Dimensions.get('window');

export default function EnhancedFileShareModal({ 
  visible, 
  onClose, 
  onFileSent,
  userInfo,
  courseCode 
}) {
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState({});
  const [message, setMessage] = useState('');

  const slideAnim = useRef(new Animated.Value(height)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.spring(slideAnim, {
          toValue: 0,
          tension: 100,
          friction: 8,
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: height,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();
      
      // Reset state when modal closes
      setSelectedFiles([]);
      setMessage('');
      setUploadProgress({});
    }
  }, [visible]);

  const fileTypeOptions = [
    {
      id: 'document',
      title: 'Document',
      icon: 'document-text',
      color: Colors.primary[500],
      description: 'PDF, Word, Excel, etc.',
      onPress: pickDocument,
    },
    {
      id: 'image',
      title: 'Photo',
      icon: 'image',
      color: Colors.success[500],
      description: 'Camera or Gallery',
      onPress: () => showImageOptions(),
    },
    {
      id: 'camera',
      title: 'Camera',
      icon: 'camera',
      color: Colors.warning[500],
      description: 'Take a photo',
      onPress: () => pickImage(true),
    },
    {
      id: 'gallery',
      title: 'Gallery',
      icon: 'images',
      color: Colors.info[500],
      description: 'Choose from gallery',
      onPress: () => pickImage(false),
    },
  ];

  async function pickDocument() {
    try {
      const result = await enhancedFileUploadService.pickDocument();
      if (result.success && result.file) {
        addFileToSelection(result.file);
      } else if (result.error) {
        Alert.alert('Error', result.error);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to pick document');
    }
  }

  async function pickImage(fromCamera = false) {
    try {
      const result = await enhancedFileUploadService.pickImage(fromCamera);
      if (result.success && result.file) {
        addFileToSelection(result.file);
      } else if (result.error) {
        Alert.alert('Error', result.error);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to pick image');
    }
  }

  function showImageOptions() {
    Alert.alert(
      'Select Image',
      'Choose how you want to select an image',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Camera', onPress: () => pickImage(true) },
        { text: 'Gallery', onPress: () => pickImage(false) },
      ]
    );
  }

  function addFileToSelection(file) {
    const fileWithId = {
      ...file,
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      selected: true,
    };
    setSelectedFiles(prev => [...prev, fileWithId]);
  }

  function removeFile(fileId) {
    setSelectedFiles(prev => prev.filter(file => file.id !== fileId));
  }

  async function handleSendFiles() {
    if (selectedFiles.length === 0) {
      Alert.alert('No Files', 'Please select at least one file to send');
      return;
    }

    setUploading(true);
    const uploadResults = [];

    try {
      for (const file of selectedFiles) {
        setUploadProgress(prev => ({ ...prev, [file.id]: 0 }));

        const result = await enhancedFileUploadService.uploadFile(
          file,
          userInfo,
          courseCode,
          (progress) => {
            setUploadProgress(prev => ({ 
              ...prev, 
              [file.id]: Math.round(progress * 100) 
            }));
          }
        );

        uploadResults.push({
          file: file,
          result: result,
        });

        if (result.success) {
          setUploadProgress(prev => ({ ...prev, [file.id]: 100 }));
        }
      }

      // Check if all uploads were successful
      const failedUploads = uploadResults.filter(ur => !ur.result.success);
      
      if (failedUploads.length === 0) {
        Alert.alert('Success', 'All files uploaded successfully!');
        if (onFileSent) {
          onFileSent(uploadResults.map(ur => ur.result), message);
        }
        onClose();
      } else {
        Alert.alert(
          'Upload Issues', 
          `${failedUploads.length} file(s) failed to upload. Check your connection and try again.`
        );
      }

    } catch (error) {
      Alert.alert('Error', 'Failed to upload files. Please try again.');
    } finally {
      setUploading(false);
      setUploadProgress({});
    }
  }

  const getFileIcon = (type) => {
    if (type?.includes('image')) return 'image';
    if (type?.includes('video')) return 'videocam';
    if (type?.includes('audio')) return 'musical-notes';
    if (type?.includes('pdf')) return 'document-text';
    return 'document';
  };

  const getFileColor = (type) => {
    if (type?.includes('image')) return Colors.success[500];
    if (type?.includes('video')) return Colors.warning[500];
    if (type?.includes('audio')) return Colors.secondary[500];
    if (type?.includes('pdf')) return Colors.error[500];
    return Colors.primary[500];
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const renderFileTypeOption = ({ item }) => (
    <TouchableOpacity
      style={styles.fileTypeCard}
      onPress={item.onPress}
      disabled={uploading}
    >
      <LinearGradient
        colors={[item.color, `${item.color}80`]}
        style={styles.fileTypeGradient}
      >
        <Ionicons name={item.icon} size={32} color="white" />
        <Text style={styles.fileTypeTitle}>{item.title}</Text>
        <Text style={styles.fileTypeDescription}>{item.description}</Text>
      </LinearGradient>
    </TouchableOpacity>
  );

  const renderSelectedFile = ({ item }) => (
    <View style={styles.selectedFileCard}>
      <View style={styles.selectedFileInfo}>
        <View style={[
          styles.selectedFileIcon, 
          { backgroundColor: `${getFileColor(item.type)}20` }
        ]}>
          <Ionicons 
            name={getFileIcon(item.type)} 
            size={24} 
            color={getFileColor(item.type)} 
          />
        </View>
        
        <View style={styles.selectedFileDetails}>
          <Text style={styles.selectedFileName} numberOfLines={1}>
            {item.name}
          </Text>
          <Text style={styles.selectedFileSize}>
            {formatFileSize(item.size)}
          </Text>
          
          {uploadProgress[item.id] !== undefined && (
            <View style={styles.progressContainer}>
              <View style={styles.progressBar}>
                <View 
                  style={[
                    styles.progressFill, 
                    { width: `${uploadProgress[item.id]}%` }
                  ]} 
                />
              </View>
              <Text style={styles.progressText}>
                {uploadProgress[item.id]}%
              </Text>
            </View>
          )}
        </View>
      </View>

      {!uploading && (
        <TouchableOpacity
          onPress={() => removeFile(item.id)}
          style={styles.removeButton}
        >
          <Ionicons name="close-circle" size={24} color={Colors.error[500]} />
        </TouchableOpacity>
      )}
    </View>
  );

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      onRequestClose={onClose}
    >
      <Animated.View
        style={[
          styles.overlay,
          { opacity: fadeAnim },
        ]}
      >
        <Animated.View
          style={[
            styles.modal,
            {
              transform: [{ translateY: slideAnim }],
            },
          ]}
        >
          <StatusBar style="light" />
          
          {/* Header */}
          <LinearGradient
            colors={[Colors.primary[600], Colors.primary[800]]}
            style={styles.header}
          >
            <View style={styles.headerContent}>
              <Text style={styles.headerTitle}>Share Files</Text>
              <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                <Ionicons name="close" size={24} color="white" />
              </TouchableOpacity>
            </View>
          </LinearGradient>

          <View style={styles.content}>
            {selectedFiles.length === 0 ? (
              <>
                <Text style={styles.sectionTitle}>Select File Type</Text>
                <FlatList
                  data={fileTypeOptions}
                  renderItem={renderFileTypeOption}
                  keyExtractor={(item) => item.id}
                  numColumns={2}
                  contentContainerStyle={styles.fileTypeGrid}
                />
              </>
            ) : (
              <>
                <Text style={styles.sectionTitle}>
                  Selected Files ({selectedFiles.length})
                </Text>
                
                <FlatList
                  data={selectedFiles}
                  renderItem={renderSelectedFile}
                  keyExtractor={(item) => item.id}
                  style={styles.selectedFilesList}
                />

                <View style={styles.messageContainer}>
                  <TextInput
                    style={styles.messageInput}
                    placeholder="Add a message (optional)"
                    value={message}
                    onChangeText={setMessage}
                    multiline
                    maxLength={500}
                    placeholderTextColor={Colors.neutral[400]}
                  />
                </View>

                <View style={styles.actionButtons}>
                  <TouchableOpacity
                    style={styles.addMoreButton}
                    onPress={() => {/* Show file type options again */}}
                    disabled={uploading}
                  >
                    <Ionicons name="add" size={20} color={Colors.primary[600]} />
                    <Text style={styles.addMoreText}>Add More</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[
                      styles.sendButton,
                      uploading && styles.sendButtonDisabled
                    ]}
                    onPress={handleSendFiles}
                    disabled={uploading}
                  >
                    {uploading ? (
                      <ActivityIndicator color="white" />
                    ) : (
                      <>
                        <Ionicons name="send" size={20} color="white" />
                        <Text style={styles.sendButtonText}>Send Files</Text>
                      </>
                    )}
                  </TouchableOpacity>
                </View>
              </>
            )}
          </View>
        </Animated.View>
      </Animated.View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modal: {
    backgroundColor: Colors.neutral[50],
    borderTopLeftRadius: 25,
    borderTopRightRadius: 25,
    maxHeight: height * 0.8,
    minHeight: height * 0.5,
  },
  header: {
    borderTopLeftRadius: 25,
    borderTopRightRadius: 25,
    paddingVertical: 20,
    paddingHorizontal: 20,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerTitle: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.neutral[900],
    marginBottom: 15,
  },
  fileTypeGrid: {
    gap: 15,
  },
  fileTypeCard: {
    flex: 1,
    margin: 5,
    borderRadius: 15,
    overflow: 'hidden',
  },
  fileTypeGradient: {
    padding: 20,
    alignItems: 'center',
    minHeight: 120,
    justifyContent: 'center',
  },
  fileTypeTitle: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: 10,
    textAlign: 'center',
  },
  fileTypeDescription: {
    color: 'white',
    fontSize: 12,
    opacity: 0.9,
    marginTop: 5,
    textAlign: 'center',
  },
  selectedFilesList: {
    maxHeight: 200,
    marginBottom: 20,
  },
  selectedFileCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    padding: 15,
    borderRadius: 12,
    marginBottom: 10,
    shadowColor: Colors.neutral[900],
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  selectedFileInfo: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  selectedFileIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  selectedFileDetails: {
    flex: 1,
  },
  selectedFileName: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.neutral[900],
    marginBottom: 4,
  },
  selectedFileSize: {
    fontSize: 12,
    color: Colors.neutral[600],
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  progressBar: {
    flex: 1,
    height: 4,
    backgroundColor: Colors.neutral[200],
    borderRadius: 2,
    marginRight: 10,
  },
  progressFill: {
    height: '100%',
    backgroundColor: Colors.primary[500],
    borderRadius: 2,
  },
  progressText: {
    fontSize: 12,
    color: Colors.primary[600],
    fontWeight: '600',
  },
  removeButton: {
    padding: 5,
  },
  messageContainer: {
    marginBottom: 20,
  },
  messageInput: {
    borderWidth: 1,
    borderColor: Colors.neutral[300],
    borderRadius: 12,
    padding: 15,
    fontSize: 16,
    maxHeight: 100,
    backgroundColor: 'white',
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 15,
  },
  addMoreButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 15,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.primary[500],
    backgroundColor: 'white',
  },
  addMoreText: {
    color: Colors.primary[600],
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  sendButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 15,
    borderRadius: 12,
    backgroundColor: Colors.primary[500],
  },
  sendButtonDisabled: {
    backgroundColor: Colors.neutral[400],
  },
  sendButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
});
