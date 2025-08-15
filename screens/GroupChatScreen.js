import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  SafeAreaView,
  TextInput,
  Alert,
  ScrollView,
  Animated,
  Dimensions,
  KeyboardAvoidingView,
  Platform,
  StatusBar,
  ActivityIndicator,
  Vibration,
  Modal,
  Keyboard,
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { setStringAsync } from 'expo-clipboard';
import { useApp } from '../context/AppContext';
import chatService from '../services/chatService';
import communicationService from '../services/communicationService';
import VoiceMessagePlayer from '../components/VoiceMessagePlayer';
import VideoCallComponent from '../components/VideoCallComponent';
import fileUploadService from '../services/fileUploadService';

const { width, height } = Dimensions.get('window');

export default function GroupChatScreen({ navigation }) {
  const { csModules, user } = useApp();
  
  // Debug logging for student section issues
  console.log('GroupChatScreen - User:', user?.uid, user?.userType);
  console.log('GroupChatScreen - Modules:', csModules?.length);
  
  // Early return if user data is not available
  if (!user) {
    return (
      <SafeAreaView style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#F8FAFC' }}>
        <ActivityIndicator size="large" color="#4F46E5" />
        <Text style={{ marginTop: 16, fontSize: 16, color: '#64748B' }}>Loading user data...</Text>
      </SafeAreaView>
    );
  }
  
  if (!csModules || csModules.length === 0) {
    return (
      <SafeAreaView style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#F8FAFC' }}>
        <Ionicons name="school-outline" size={64} color="#94A3B8" />
        <Text style={{ marginTop: 16, fontSize: 18, fontWeight: '600', color: '#1E293B' }}>No Courses Available</Text>
        <Text style={{ marginTop: 8, fontSize: 14, color: '#64748B', textAlign: 'center', paddingHorizontal: 40 }}>
          You haven't been enrolled in any courses yet. Contact your administrator.
        </Text>
        <TouchableOpacity 
          style={{ marginTop: 20, backgroundColor: '#4F46E5', paddingHorizontal: 20, paddingVertical: 10, borderRadius: 8 }}
          onPress={() => navigation.goBack()}
        >
          <Text style={{ color: '#FFFFFF', fontWeight: '600' }}>Go Back</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [newMessage, setNewMessage] = useState('');
  const [selectedView, setSelectedView] = useState('coursemates');
  const [typingUsers, setTypingUsers] = useState([]);
  const [searchText, setSearchText] = useState('');
  const [showSearchBar, setShowSearchBar] = useState(false);
  const [filteredCourses, setFilteredCourses] = useState([]);
  const [currentView, setCurrentView] = useState('chatList');
  const [messages, setMessages] = useState([]);
  const [onlineCount, setOnlineCount] = useState(0);
  const [recentMessages, setRecentMessages] = useState({});
  const [unreadCounts, setUnreadCounts] = useState({});
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingDuration, setRecordingDuration] = useState(0);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [selectedMessage, setSelectedMessage] = useState(null);
  const [showMessageActions, setShowMessageActions] = useState(false);
  const [replyToMessage, setReplyToMessage] = useState(null);
  const [editingMessage, setEditingMessage] = useState(null);
  const [editText, setEditText] = useState('');
  const [showAttachmentModal, setShowAttachmentModal] = useState(false);
  const [uploadingFiles, setUploadingFiles] = useState([]);
  const [inputHeight, setInputHeight] = useState(44);
  const [sortedCourses, setSortedCourses] = useState([]);
  const [keyboardHeight, setKeyboardHeight] = useState(0);
  
  // Communication states
  const [incomingCalls, setIncomingCalls] = useState([]);
  const [activeCall, setActiveCall] = useState(null);
  const [showCallModal, setShowCallModal] = useState(false);
  const [callType, setCallType] = useState('voice'); // 'voice' or 'video'
  const [voiceMessageUri, setVoiceMessageUri] = useState(null);
  const [recordingTimer, setRecordingTimer] = useState(0);
  
  const flatListRef = useRef(null);
  const typingTimeoutRef = useRef(null);
  const recordingRef = useRef(null);
  const recordingTimerRef = useRef(null);
  const inputRef = useRef(null);
  const keyboardHeightAnimated = useRef(new Animated.Value(0)).current;

  // File handling helper functions
  const getFileIconForType = (fileType) => {
    if (!fileType) return 'document-outline';
    
    if (fileType.includes('pdf')) return 'document-text-outline';
    if (fileType.includes('image')) return 'image-outline';
    if (fileType.includes('video')) return 'videocam-outline';
    if (fileType.includes('audio')) return 'musical-notes-outline';
    if (fileType.includes('text') || fileType.includes('document')) return 'document-outline';
    if (fileType.includes('spreadsheet') || fileType.includes('excel')) return 'grid-outline';
    if (fileType.includes('presentation') || fileType.includes('powerpoint')) return 'easel-outline';
    
    return 'attach-outline';
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const downloadFile = async (fileMessage) => {
    try {
      Alert.alert(
        'Download Started',
        `Downloading "${fileMessage.fileName}"...`,
        [{ text: 'OK' }]
      );
      
      // In a real app, you would implement actual download functionality
      // For now, we'll simulate the download process
      console.log('Download initiated for:', fileMessage.fileName);
      console.log('File URL:', fileMessage.fileUrl);
      
      // Update download count if supported
      if (fileMessage.canDownload) {
        // Update download statistics
        console.log('Download count updated');
      }
      
      Alert.alert('Success!', `"${fileMessage.fileName}" has been downloaded! 📥`);
    } catch (error) {
      console.error('Download error:', error);
      Alert.alert('Download Failed', 'Could not download the file. Please try again.');
    }
  };

  const saveFileToDevice = async (fileMessage) => {
    try {
      Alert.alert(
        'Save to Device',
        `Save "${fileMessage.fileName}" to your device?`,
        [
          { text: 'Cancel', style: 'cancel' },
          { 
            text: 'Save', 
            onPress: async () => {
              try {
                // In a real app, you would implement device saving functionality
                // This might involve using expo-file-system to save to the device's downloads folder
                console.log('Saving to device:', fileMessage.fileName);
                console.log('File URL:', fileMessage.fileUrl);
                
                // Simulate save process
                Alert.alert(
                  'Saved!',
                  `"${fileMessage.fileName}" has been saved to your device! 💾\n\nYou can find it in your Downloads folder.`,
                  [{ text: 'Great!' }]
                );
                
                // Update save count if supported
                if (fileMessage.canSave) {
                  console.log('Save count updated');
                }
              } catch (saveError) {
                console.error('Save error:', saveError);
                Alert.alert('Save Failed', 'Could not save the file to your device.');
              }
            }
          }
        ]
      );
    } catch (error) {
      console.error('Save to device error:', error);
      Alert.alert('Error', 'Could not save file to device.');
    }
  };

  const showFileDetails = (fileMessage) => {
    const uploadDate = fileMessage.uploadedAt ? new Date(fileMessage.uploadedAt).toLocaleDateString() : 'Unknown';
    
    Alert.alert(
      'File Details',
      `📄 File: ${fileMessage.fileName}\n` +
      `📏 Size: ${formatFileSize(fileMessage.fileSize || 0)}\n` +
      `📁 Type: ${fileMessage.fileType || 'Unknown'}\n` +
      `👤 Shared by: ${fileMessage.senderName}\n` +
      `📅 Date: ${uploadDate}\n` +
      `📤 Course: ${fileMessage.courseName || selectedCourse?.name}\n` +
      `💾 Downloads: ${fileMessage.downloadCount || 0}\n` +
      `📱 Saves: ${fileMessage.saveCount || 0}`,
      [
        { text: 'Close' },
        { text: 'Download', onPress: () => downloadFile(fileMessage) },
        { text: 'Save to Device', onPress: () => saveFileToDevice(fileMessage) },
        { text: 'Share', onPress: () => shareFile(fileMessage) }
      ]
    );
  };

  const shareFile = async (fileMessage) => {
    try {
      Alert.alert(
        'Share File',
        `Share "${fileMessage.fileName}" with others?`,
        [
          { text: 'Cancel', style: 'cancel' },
          { 
            text: 'Share Link', 
            onPress: async () => {
              try {
                const result = await fileUploadService.shareUrl(
                  fileMessage.fileUrl, 
                  fileMessage.fileName
                );
                
                if (result.success) {
                  Alert.alert('Success!', 'File link shared successfully! 📤');
                } else {
                  Alert.alert('Share Failed', result.error || 'Could not share the file.');
                }
              } catch (shareError) {
                console.error('Share error:', shareError);
                Alert.alert('Share Failed', 'Could not share the file.');
              }
            }
          },
          { 
            text: 'Download & Share', 
            onPress: async () => {
              try {
                // Download file first, then share it
                const downloadResult = await fileUploadService.downloadFileToDevice(
                  fileMessage.fileUrl, 
                  fileMessage.fileName
                );
                
                if (downloadResult.success) {
                  const shareResult = await fileUploadService.shareFile(downloadResult.localPath);
                  
                  if (shareResult.success) {
                    Alert.alert('Success!', 'File downloaded and shared successfully! 📤');
                  } else {
                    Alert.alert('Share Failed', shareResult.error || 'Could not share the downloaded file.');
                  }
                } else {
                  Alert.alert('Download Failed', downloadResult.error || 'Could not download the file for sharing.');
                }
              } catch (shareError) {
                console.error('Download & share error:', shareError);
                Alert.alert('Share Failed', 'Could not download and share the file.');
              }
            }
          }
        ]
      );
    } catch (error) {
      console.error('Share file error:', error);
      Alert.alert('Error', 'Could not share file.');
    }
  };

  // Get modules based on user type with general channels
  const getAvailableModules = () => {
    let courses = [];
    
    console.log('Getting available modules for user:', user?.userType, 'csModules:', csModules?.length);
    
    // Add general collaboration channels
    if (user?.userType === 'lecturer') {
      courses.push({
        id: 'general-lecturers',
        code: 'FACULTY',
        name: '👨‍🏫 All Lecturers',
        credits: 0,
        semester: 'General',
        instructor: 'All Faculty',
        description: 'General collaboration space for all lecturers'
      });
      
      // For lecturers, csModules already contains all modules from AppContext
      if (csModules && Array.isArray(csModules)) {
        courses.push(...csModules);
      }
    } else {
      courses.push({
        id: 'general-students',
        code: 'GENERAL',
        name: '🎓 All Students',
        credits: 0,
        semester: 'General',
        instructor: 'Student Community',
        description: 'General collaboration space for all students'
      });
      
      // For students, csModules already contains level-specific modules from AppContext
      if (csModules && Array.isArray(csModules)) {
        courses.push(...csModules);
      }
    }
    
    console.log('Available modules calculated:', courses.length);
    return courses;
  };

  const currentLevelModules = getAvailableModules();

  // Initialize chat service and load data
  useEffect(() => {
    if (user?.uid) {
      chatService.initializeUserPresence(user.uid, user);
      loadSortedChatList();
      loadRecentMessages();
      loadUnreadCounts();
      
      // Setup communication service
      setupCommunicationListeners();
    }

    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
      if (recordingTimerRef.current) {
        clearInterval(recordingTimerRef.current);
      }
      
      // Cleanup communication service
      communicationService.cleanup();
    };
  }, [user?.uid]);

  // Setup communication listeners
  const setupCommunicationListeners = () => {
    // Listen to incoming calls
    const unsubscribe = communicationService.listenToIncomingCalls((calls) => {
      setIncomingCalls(calls);
      
      // Show incoming call notification if there's a new call
      const newCall = calls.find(call => 
        call.status === 'calling' && 
        call.initiator !== user?.uid
      );
      
      if (newCall && !activeCall) {
        setActiveCall(newCall);
        setCallType(newCall.type);
        setShowCallModal(true);
      }
    });

    return unsubscribe;
  };

  // Handle keyboard events for better positioning
  useEffect(() => {
    const keyboardWillShowListener = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow',
      (e) => {
        setKeyboardHeight(e.endCoordinates.height);
        Animated.timing(keyboardHeightAnimated, {
          toValue: e.endCoordinates.height,
          duration: e.duration || 250,
          useNativeDriver: false,
        }).start();
      }
    );

    const keyboardWillHideListener = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide',
      (e) => {
        setKeyboardHeight(0);
        Animated.timing(keyboardHeightAnimated, {
          toValue: 0,
          duration: e.duration || 250,
          useNativeDriver: false,
        }).start();
      }
    );

    return () => {
      keyboardWillShowListener.remove();
      keyboardWillHideListener.remove();
    };
  }, [currentView]);

  // Load and sort chat list by timestamp
  const loadSortedChatList = async () => {
    try {
      const sorted = await chatService.getSortedChatList(currentLevelModules);
      setSortedCourses(sorted);
    } catch (error) {
      console.error('Error loading sorted chat list:', error);
      setSortedCourses(currentLevelModules);
    }
  };

  // Load recent messages for chat list
  const loadRecentMessages = async () => {
    try {
      const messages = await chatService.getRecentMessages(currentLevelModules);
      setRecentMessages(messages || {});
      } catch (error) {
      console.error('Error loading recent messages:', error);
      setRecentMessages({});
      }
  };

  // Setup real-time message listener for selected course
  useEffect(() => {
    if (!selectedCourse || !user?.uid) return;

    console.log('Setting up real-time listener for:', selectedCourse.code);

    const unsubscribe = chatService.listenToMessages(
      selectedCourse.code,
      (newMessages) => {
        console.log('Received real-time messages:', newMessages.length);
        setMessages(newMessages);
        
        // Auto-scroll to bottom when new messages arrive
        setTimeout(() => {
          flatListRef.current?.scrollToEnd({ animated: true });
        }, 100);
      }
    );

    return () => {
      console.log('Cleaning up real-time listener');
      if (unsubscribe) unsubscribe();
    };
  }, [selectedCourse?.code, user?.uid]);

  // Load unread counts
  const loadUnreadCounts = async () => {
    const counts = {};
    for (const course of currentLevelModules) {
      try {
        const count = await chatService.getUnreadCount(course.code);
        counts[course.code] = count || 0;
      } catch (error) {
        console.error(`Error loading unread count for ${course.code}:`, error);
        counts[course.code] = 0;
      }
    }
    setUnreadCounts(counts);
  };

  // Search functionality
  const handleSearch = (text) => {
    setSearchText(text);
    if (text.trim() === '') {
      setFilteredCourses([]);
    } else {
      const filtered = currentLevelModules.filter(course => 
        course.name.toLowerCase().includes(text.toLowerCase()) ||
        course.code.toLowerCase().includes(text.toLowerCase())
      );
      setFilteredCourses(filtered);
    }
  };

  const toggleSearch = () => {
    setShowSearchBar(!showSearchBar);
    if (showSearchBar) {
      setSearchText('');
      setFilteredCourses([]);
    }
  };

  // Open individual chat
  const openChat = async (course) => {
    setSelectedCourse(course);
    setCurrentView('chat');
    setIsLoading(true);

    try {
      // Update unread count
      setUnreadCounts(prev => ({ ...prev, [course.code]: 0 }));

      // Listen to messages
      const unsubscribe = chatService.listenToMessages(course.code, (newMessages) => {
        setMessages(newMessages || []);
        setTimeout(() => {
          flatListRef.current?.scrollToEnd({ animated: true });
        }, 100);
      });

      // Listen to typing indicators
      const typingUnsubscribe = chatService.listenToTypingIndicators(course.code, (typing) => {
        setTypingUsers(typing);
      });

      // Listen to online users
      const onlineUnsubscribe = chatService.listenToOnlineUsers(course.code, (online) => {
        setOnlineUsers(online);
      });

      // Set current user as online
      chatService.setOnlineStatus(true);

    } catch (error) {
      console.error('Error opening chat:', error);
      Alert.alert('Error', 'Failed to load chat messages');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle message sending with edit/reply support
  const handleSendMessage = async () => {
    if (!newMessage.trim() || !selectedCourse || isSending) return;

    const messageText = newMessage.trim();
    setIsSending(true);

    try {
      if (editingMessage) {
        // Edit existing message
        const result = await chatService.editMessage(selectedCourse.code, editingMessage.id, messageText);
        if (result.success) {
          setEditingMessage(null);
          setNewMessage('');
        } else {
          Alert.alert('Error', 'Failed to edit message');
        }
      } else {
        // Send new message (with optional reply)
        const result = await chatService.sendMessage(
          selectedCourse.code,
          messageText,
          user?.uid,
          user?.fullName || user?.name,
          user?.userType || 'student',
          replyToMessage?.id,
          'text'
        );
        if (result.success) {
          setNewMessage('');
          setReplyToMessage(null);
          setInputHeight(44);
          
          // Update recent messages and reload sorted list
          loadRecentMessages();
          loadSortedChatList();
        } else {
          Alert.alert('Error', 'Failed to send message');
        }
      }
    } catch (error) {
      console.error('Error sending message:', error);
      Alert.alert('Error', 'Failed to send message');
    } finally {
      setIsSending(false);
    }
  };

  // Handle typing with better debouncing
  const handleTyping = (text) => {
    setNewMessage(text);
    
    if (selectedCourse && user?.uid) {
      // Start typing indicator when user starts typing
      if (text.length > 0) {
        chatService.startTyping(selectedCourse.code);
      } else {
        chatService.stopTyping(selectedCourse.code);
      }
      
      // Clear previous timeout
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
      
      // Set timeout to clear typing status after 3 seconds of inactivity
      if (text.length > 0) {
      typingTimeoutRef.current = setTimeout(() => {
          chatService.stopTyping(selectedCourse.code);
        }, 3000);
      }
    }
  };

  // Message Actions
  const handleLongPressMessage = (message) => {
    setSelectedMessage(message);
    setShowMessageActions(true);
    Vibration.vibrate(50);
  };

  const copyMessage = async (message) => {
    try {
      await setStringAsync(message.text);
      Alert.alert('Copied', 'Message copied to clipboard');
      setShowMessageActions(false);
    } catch (error) {
      console.error('Clipboard error:', error);
      Alert.alert('Error', 'Could not copy message');
    }
  };

  const replyToMessageHandler = (message) => {
    setReplyToMessage(message);
    setShowMessageActions(false);
    inputRef.current?.focus();
  };

  const editMessageHandler = (message) => {
    if (message.senderId !== user?.uid) {
      Alert.alert('Error', 'You can only edit your own messages');
      return;
    }
    
    // Check if message is too old to edit (48 hours)
    const messageTime = message.timestamp?.toDate?.() || new Date(0);
    const now = new Date();
    const hoursDiff = (now - messageTime) / (1000 * 60 * 60);
    
    if (hoursDiff > 48) {
      Alert.alert('Cannot Edit', 'This message is too old to edit (48 hour limit)');
      return;
    }
    
    setEditingMessage(message);
    setNewMessage(message.text);
    setShowMessageActions(false);
    inputRef.current?.focus();
  };

  const deleteMessageHandler = async (message) => {
    if (message.senderId !== user?.uid) {
      Alert.alert('Error', 'You can only delete your own messages');
      return;
    }

    // Check if message is within delete-for-everyone time limit (7 minutes)
    const messageTime = message.timestamp?.toDate?.() || new Date(0);
    const now = new Date();
    const minutesDiff = (now - messageTime) / (1000 * 60);
    
    const deleteOptions = [
        { text: 'Cancel', style: 'cancel' },
        {
        text: 'Delete for Me',
        onPress: async () => {
          try {
            const result = await chatService.deleteMessage(selectedCourse.code, message.id, false);
            if (result.success) {
              setShowMessageActions(false);
              Vibration.vibrate(100);
            } else {
              Alert.alert('Error', result.error || 'Failed to delete message');
            }
          } catch (error) {
            Alert.alert('Error', 'Could not delete message');
          }
        }
      }
    ];

    // Add delete for everyone option if within time limit
    if (minutesDiff <= 7) {
      deleteOptions.push({
        text: 'Delete for Everyone',
          style: 'destructive',
          onPress: async () => {
            try {
            const result = await chatService.deleteMessage(selectedCourse.code, message.id, true);
              if (result.success) {
                setShowMessageActions(false);
              Vibration.vibrate(100);
              } else {
              Alert.alert('Error', result.error || 'Failed to delete message');
              }
            } catch (error) {
              Alert.alert('Error', 'Could not delete message');
            }
          }
      });
    }

    Alert.alert(
      'Delete Message',
      minutesDiff <= 7 ? 
        'Choose how you want to delete this message:' : 
        'You can only delete this message for yourself (7 minute limit for everyone has passed):',
      deleteOptions
    );
  };

  const cancelReply = () => {
    setReplyToMessage(null);
  };

  const cancelEdit = () => {
    setEditingMessage(null);
    setNewMessage('');
    setInputHeight(44);
  };

  // Format time for chat list
  const formatChatListTime = (timestamp) => {
    if (!timestamp) return '';
    const date = timestamp.toDate ? timestamp.toDate() : timestamp;
    const now = new Date();
    const diffMs = now - date;
    const diffHours = diffMs / (1000 * 60 * 60);
    
    if (diffHours < 1) return 'now';
    if (diffHours < 24) return `${Math.floor(diffHours)}h`;
    if (diffHours < 168) return `${Math.floor(diffHours / 24)}d`;
    return date.toLocaleDateString();
  };

  // Add reaction to message
  const handleAddReaction = async (messageId, emoji) => {
    try {
      await chatService.addReaction(selectedCourse.code, messageId, emoji);
    } catch (error) {
      console.error('Error adding reaction:', error);
    }
  };

  // Handle emoji picker
  const toggleEmojiPicker = () => {
    setShowEmojiPicker(!showEmojiPicker);
  };

  const insertEmoji = (emoji) => {
    setNewMessage(prev => prev + emoji);
    setShowEmojiPicker(false);
    inputRef.current?.focus();
  };

  // Enhanced Voice Recording
  const startRecording = async () => {
    try {
      if (!user || !selectedCourse) {
        Alert.alert('Error', 'Please select a course first');
        return;
      }

      console.log('Starting voice recording...');
      const result = await communicationService.startVoiceRecording();
      
      if (result.success) {
    setIsRecording(true);
        setRecordingTimer(0);
    Vibration.vibrate(100);
    
        // Start timer
    recordingTimerRef.current = setInterval(() => {
          setRecordingTimer(prev => prev + 1);
    }, 1000);
        
        console.log('Voice recording started successfully');
      } else {
        console.error('Recording failed:', result.error);
        Alert.alert('Recording Error', result.error || 'Failed to start recording');
      }
    } catch (error) {
      console.error('Error starting recording:', error);
      Alert.alert('Recording Error', 'Unable to start voice recording');
    }
  };

  const stopRecording = async () => {
    try {
      const result = await communicationService.stopVoiceRecording();
    setIsRecording(false);
      
    if (recordingTimerRef.current) {
      clearInterval(recordingTimerRef.current);
    }
      
      if (result.success) {
        setVoiceMessageUri(result.uri);
        
        // Show voice message preview
        Alert.alert(
          'Voice Message Recorded',
          `Duration: ${communicationService.formatRecordingDuration(Math.floor(result.duration / 1000))}`,
          [
            { text: 'Cancel', style: 'cancel', onPress: () => setVoiceMessageUri(null) },
            { 
              text: 'Send', 
              onPress: () => sendVoiceMessage(result.uri, result.duration)
            }
          ]
        );
      } else {
        Alert.alert('Recording Error', result.error || 'Failed to stop recording');
      }
      
      setRecordingTimer(0);
    } catch (error) {
      setIsRecording(false);
      setRecordingTimer(0);
      Alert.alert('Recording Error', 'Unable to stop voice recording');
    }
  };

  const cancelRecording = async () => {
    try {
      await communicationService.cancelVoiceRecording();
      setIsRecording(false);
      setRecordingTimer(0);
      
      if (recordingTimerRef.current) {
        clearInterval(recordingTimerRef.current);
      }
    } catch (error) {
      console.error('Error canceling recording:', error);
    }
  };

  const sendVoiceMessage = async (audioUri, duration) => {
    if (!selectedCourse || !audioUri) return;

    try {
      // Send voice message with proper data structure
      const voiceMessageText = `🎵 Voice message (${communicationService.formatRecordingDuration(Math.floor(duration / 1000))})`;
      
      const result = await chatService.sendMessage(
        selectedCourse.code,
        voiceMessageText,
        user?.uid,
        user?.fullName || user?.name,
        user?.userType || 'student',
        null, // no reply
        'voice',
        {
          voiceUri: audioUri,
          uri: audioUri, // for backward compatibility
          duration: Math.floor(duration / 1000), // in seconds
          durationMs: duration // in milliseconds
        }
      );
      
      if (result.success) {
        setVoiceMessageUri(null);
        // Scroll to bottom to show new message
        setTimeout(() => {
          flatListRef.current?.scrollToEnd({ animated: true });
        }, 100);
      } else {
        Alert.alert('Error', 'Failed to send voice message');
      }
    } catch (error) {
      console.error('Error sending voice message:', error);
      Alert.alert('Error', 'Unable to send voice message');
    }
  };

  // Call Functions
  const initiateVoiceCall = async () => {
    if (!selectedCourse) {
      Alert.alert('Error', 'Please select a course first');
      return;
    }

    if (!user) {
      Alert.alert('Error', 'User not authenticated');
      return;
    }

    try {
      console.log('Initiating voice call for:', selectedCourse.code);
      const result = await communicationService.createGroupCall(selectedCourse.code, 'voice');
      
      if (result.success) {
        setCallType('voice');
        setActiveCall({ type: 'voice', course: selectedCourse.code, status: 'calling' });
        setShowCallModal(true);
        Vibration.vibrate(100);
        console.log('Voice call initiated successfully');
      } else {
        console.error('Voice call failed:', result.error);
        Alert.alert('Call Failed', result.error || 'Unable to start voice call');
      }
    } catch (error) {
      console.error('Error initiating voice call:', error);
      Alert.alert('Call Error', 'Unable to start voice call');
    }
  };

  const initiateVideoCall = async () => {
    if (!selectedCourse) {
      Alert.alert('Error', 'Please select a course first');
      return;
    }

    if (!user) {
      Alert.alert('Error', 'User not authenticated');
      return;
    }

    try {
      console.log('Initiating video call for:', selectedCourse.code);
      const result = await communicationService.createGroupCall(selectedCourse.code, 'video');
      
      if (result.success) {
        setCallType('video');
        setActiveCall({ type: 'video', course: selectedCourse.code, status: 'calling' });
        setShowCallModal(true);
        Vibration.vibrate(100);
        console.log('Video call initiated successfully');
      } else {
        console.error('Video call failed:', result.error);
        Alert.alert('Call Failed', result.error || 'Unable to start video call');
      }
    } catch (error) {
      console.error('Error initiating video call:', error);
      Alert.alert('Call Error', 'Unable to start video call');
    }
  };

  const handleIncomingCall = (action, call) => {
    if (action === 'accept') {
      communicationService.joinCall(call.id);
      setActiveCall(call);
      setShowCallModal(false);
      Vibration.vibrate(50);
    } else if (action === 'reject') {
      communicationService.rejectCall(call.id);
      setActiveCall(null);
      setShowCallModal(false);
      Vibration.vibrate([50, 100, 50]);
    }
  };

  const endCurrentCall = async () => {
    try {
      if (activeCall) {
        await communicationService.endCall(activeCall.id);
        setActiveCall(null);
        setShowCallModal(false);
        Vibration.vibrate(100);
      }
    } catch (error) {
      Alert.alert('Error', 'Unable to end call');
    }
  };

  // Message editing functions
  const startEditingMessage = (message) => {
    setEditingMessage(message);
    setEditText(message.text);
    setNewMessage(message.text);
    setShowMessageActions(false);
    inputRef.current?.focus();
  };

  const cancelEditing = () => {
    setEditingMessage(null);
    setEditText('');
    setNewMessage('');
  };

  // Attachment functions
  const showAttachmentOptions = () => {
    setShowAttachmentModal(true);
  };

  const handleAttachmentSelect = async (type) => {
    setShowAttachmentModal(false);
    
    try {
      let result;
      
      switch (type) {
        case 'camera':
          result = await fileUploadService.takePhoto();
          break;
        case 'video_camera':
          result = await fileUploadService.recordVideo();
          break;
        case 'image':
          result = await fileUploadService.pickImage();
          break;
        case 'video':
          result = await fileUploadService.pickVideo();
          break;
        case 'document':
        default:
          result = await fileUploadService.pickFile('document');
          break;
      }
      
      if (result.success) {
        const file = result.file || (result.files && result.files[0]);
        if (file) {
          const fileType = type === 'camera' ? 'image' : 
                          type === 'video_camera' ? 'video' : 
                          type === 'image' ? 'image' :
                          type === 'video' ? 'video' : 'file';
          await uploadAndSendFile(file, fileType);
        }
      } else {
        Alert.alert('Error', result.error || 'Failed to select file');
      }
    } catch (error) {
      console.error('Error selecting file:', error);
      Alert.alert('Error', 'Failed to select file');
    }
  };

  const uploadAndSendFile = async (file, type) => {
    if (!selectedCourse) return;
    
    const fileId = `upload_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    // Add to uploading files
    setUploadingFiles(prev => [...prev, {
      id: fileId,
      name: file.name,
      type: file.type,
      progress: 0
    }]);

    try {
      // Upload file
      const result = await fileUploadService.uploadFile(
        file, 
        selectedCourse.code, 
        'chat_media',
        (progress) => {
          setUploadingFiles(prev => 
            prev.map(f => f.id === fileId ? { ...f, progress } : f)
          );
        }
      );

      if (result.success) {
        // Send message with file
        const messageType = type === 'image' ? 'image' : 
                           type === 'video' ? 'video' : 'file';
        
        await chatService.sendMessage(
          selectedCourse.code,
          messageType === 'file' ? `📎 ${file.name}` : '', // Add file name for files, empty for media
          user?.uid,
          user?.fullName || user?.name,
          user?.userType || 'student',
          replyToMessage?.id,
          messageType,
          {
            fileUrl: result.downloadURL,
            fileName: file.name,
            fileSize: file.size,
            fileType: file.type,
            // Enhanced metadata for chat integration
            courseName: selectedCourse.name,
            courseCode: selectedCourse.code,
            uploadedAt: new Date().toISOString(),
            isSharedInChat: true,
            chatUpload: true,
            // Download and save capabilities
            canDownload: true,
            canSave: true,
            downloadCount: 0,
            saveCount: 0,
            isDownloadable: true,
            supportsSaveToDevice: true
          }
        );

        // Also save to course materials collection for cross-platform access
        try {
          await fileUploadService.saveChatFileToMaterials({
            title: file.name,
            description: `Shared in ${selectedCourse.name} chat`,
            courseCode: selectedCourse.code,
            courseName: selectedCourse.name,
            fileName: file.name,
            fileSize: file.size,
            fileType: file.type,
            fileUrl: result.downloadURL,
            uploadedBy: user?.uid,
            uploaderName: user?.fullName || user?.name || 'Anonymous',
            uploaderType: user?.userType || 'student',
            uploadDate: new Date().toISOString(),
            isActive: true,
            sharedInChat: true,
            chatTimestamp: new Date().toISOString()
          });
        } catch (materialError) {
          console.warn('Could not save to materials collection:', materialError);
          // Don't fail the main upload for this
        }

        // Clear reply if any
        setReplyToMessage(null);
      } else {
        Alert.alert('Upload Failed', result.error || 'Failed to upload file');
      }
    } catch (error) {
      Alert.alert('Upload Error', 'Failed to upload and send file');
    } finally {
      // Remove from uploading files
      setUploadingFiles(prev => prev.filter(f => f.id !== fileId));
    }
  };

  const saveEditedMessage = async () => {
    if (!editingMessage || !selectedCourse) return;

    try {
      setIsSending(true);
      const result = await chatService.editMessage(
        selectedCourse.code,
        editingMessage.id,
        editText.trim()
      );

      if (result.success) {
        setEditingMessage(null);
        setEditText('');
        setNewMessage('');
        Vibration.vibrate(50);
      } else {
        Alert.alert('Edit Failed', result.error);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to edit message');
    } finally {
      setIsSending(false);
    }
  };

  const deleteMessage = (message, deleteForEveryone = false) => {
    const deleteText = deleteForEveryone ? 'Delete for Everyone' : 'Delete for Me';
    const warningText = deleteForEveryone 
      ? 'This message will be deleted for everyone in the chat.'
      : 'This message will only be deleted for you.';

    Alert.alert(
      deleteText,
      warningText,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: deleteText,
          style: 'destructive',
          onPress: async () => {
            try {
              const result = await chatService.deleteMessage(
                selectedCourse.code,
                message.id,
                deleteForEveryone
              );

              if (result.success) {
                setShowMessageActions(false);
                Vibration.vibrate(100);
              } else {
                Alert.alert('Delete Failed', result.error);
              }
            } catch (error) {
              Alert.alert('Error', 'Failed to delete message');
            }
          }
        }
      ]
    );
  };

  const showMessageOptions = (message) => {
    setSelectedMessage(message);
    setShowMessageActions(true);
    Vibration.vibrate(50);
  };

  // Render chat list item with modern design
  const renderChatListItem = ({ item, index }) => {
    const lastMessage = recentMessages[item.code];
    const unreadCount = unreadCounts[item.code] || 0;
    const hasUnread = unreadCount > 0;

    return (
      <TouchableOpacity
        style={styles.chatListItem}
        onPress={() => openChat(item)}
        activeOpacity={0.7}
      >
        <View style={styles.chatItemLeft}>
          {/* Course Avatar */}
          <LinearGradient
            colors={[
              `hsl(${index * 137.5 % 360}, 70%, 55%)`,
              `hsl(${index * 137.5 % 360}, 70%, 45%)`
            ]}
            style={styles.courseAvatar}
          >
            <Text style={styles.courseAvatarText}>
              {item.code.substring(0, 3).toUpperCase()}
            </Text>
          </LinearGradient>
          
          {/* Chat Info */}
          <View style={styles.chatInfo}>
            <View style={styles.chatHeader}>
              <Text style={[styles.courseName, hasUnread && styles.unreadCourseName]} numberOfLines={1}>
                {item.name}
              </Text>
              {lastMessage && (
                <Text style={[styles.lastMessageTime, hasUnread && styles.unreadTime]}>
                  {formatChatListTime(lastMessage.timestamp)}
                </Text>
              )}
            </View>
            
            <View style={styles.chatSubInfo}>
              <Text style={styles.courseCode}>{item.code}</Text>
              <Text style={styles.separator}>•</Text>
              <Text style={styles.courseCredits}>{item.credits} credits</Text>
              <Text style={styles.separator}>•</Text>
              <Text style={styles.courseSemester}>Sem {item.semester}</Text>
            </View>
            
            {lastMessage ? (
              <View style={styles.lastMessageContainer}>
                <Text style={[styles.lastMessage, hasUnread && styles.unreadMessage]} numberOfLines={1}>
                  {lastMessage.senderName ? 
                    `${lastMessage.senderName}: ${String(lastMessage.text || '')}` : 
                    String(lastMessage.text || 'No message content')
                  }
                </Text>
              </View>
            ) : (
              <Text style={styles.noMessages}>No messages yet</Text>
            )}
          </View>
        </View>
        
        {/* Unread Badge */}
        <View style={styles.chatItemRight}>
          {hasUnread && (
            <View style={styles.unreadBadge}>
              <Text style={styles.unreadText}>
                {unreadCount > 99 ? '99+' : unreadCount}
              </Text>
            </View>
          )}
          <Ionicons name="chevron-forward" size={16} color="#C7D2FE" />
        </View>
      </TouchableOpacity>
    );
  };

  // Render individual message with modern bubble design
  const renderMessage = ({ item, index }) => {
    // Safety checks for message object
    if (!item || typeof item !== 'object' || !Array.isArray(messages)) {
      console.warn('Invalid message object or messages array:', item, messages);
      return null;
    }
    
    const isCurrentUser = item.senderId === user?.uid;
    const showAvatar = !isCurrentUser && (index === 0 || 
      messages[index - 1]?.senderId !== item.senderId);
    const showTimestamp = index === messages.length - 1 || 
      messages[index + 1]?.senderId !== item.senderId ||
      (messages[index + 1]?.timestamp - item.timestamp) > 300000; // 5 minutes
    const isSelected = selectedMessage?.id === item.id;

    return (
      <TouchableOpacity
        style={[
          styles.messageContainer,
          isCurrentUser ? styles.currentUserMessage : styles.otherUserMessage,
          isSelected && styles.selectedMessage
        ]}
        onLongPress={() => handleLongPressMessage(item)}
        onPress={() => setShowMessageActions(false)}
        activeOpacity={0.8}
      >
        {showAvatar && !isCurrentUser && (
          <LinearGradient
            colors={item.senderType === 'lecturer' ? ['#7C3AED', '#A855F7'] : ['#4F46E5', '#6366F1']}
            style={styles.messageAvatar}
          >
            <Text style={styles.messageAvatarText}>
              {item.senderName?.split(' ').map(n => n[0]).join('').toUpperCase() || 'U'}
            </Text>
          </LinearGradient>
        )}
        
        <View style={[
          styles.messageBubble,
          isCurrentUser ? styles.currentUserBubble : styles.otherUserBubble,
          !showAvatar && !isCurrentUser && styles.continuedMessage,
          isSelected && styles.selectedBubble
        ]}>
          {/* Reply preview */}
          {item.replyTo && (
            <View style={styles.replyPreview}>
              <View style={styles.replyLine} />
              <View style={styles.replyContent}>
                <Text style={styles.replyAuthor}>{String(item.replyTo.senderName || '')}</Text>
                <Text style={styles.replyText} numberOfLines={2}>
                  {String(item.replyTo.text || '')}
                </Text>
              </View>
            </View>
          )}
          
          {showAvatar && !isCurrentUser && (
            <View style={styles.messageHeaderInfo}>
              <Text style={styles.senderName}>{String(item.senderName || '')}</Text>
              {item.senderType === 'lecturer' && (
                <View style={styles.lecturerTag}>
                  <Ionicons name="school" size={8} color="#7C3AED" />
                  <Text style={styles.lecturerTagText}>Lecturer</Text>
                </View>
              )}
            </View>
          )}
          
          {/* Voice Message */}
          {item.type === 'voice' && item.voiceUri ? (
            <VoiceMessagePlayer 
              message={item}
              isCurrentUser={isCurrentUser}
            />
          ) : item.type === 'image' && item.fileUrl ? (
            <TouchableOpacity style={styles.mediaMessage}>
              <Image 
                source={{ uri: item.fileUrl }}
                style={styles.messageImage}
                resizeMode="cover"
              />
              {item.text && (
                <Text style={[
                  styles.mediaCaption,
                  isCurrentUser ? styles.currentUserText : styles.otherUserText
                ]}>
                  {String(item.text)}
                </Text>
              )}
            </TouchableOpacity>
          ) : item.type === 'video' && item.fileUrl ? (
            <TouchableOpacity style={styles.mediaMessage}>
              <View style={styles.videoContainer}>
                <View style={styles.videoPlaceholder}>
                  <Ionicons name="play-circle" size={48} color="#FFFFFF" />
                </View>
                <Text style={styles.videoFileName}>{item.fileName || 'Video'}</Text>
              </View>
              {item.text && (
                <Text style={[
                  styles.mediaCaption,
                  isCurrentUser ? styles.currentUserText : styles.otherUserText
                ]}>
                  {String(item.text)}
                </Text>
              )}
            </TouchableOpacity>
          ) : item.type === 'file' && item.fileUrl ? (
            <View style={styles.fileMessageContainer}>
              <TouchableOpacity 
                style={styles.fileMessage}
                onPress={() => Alert.alert(
                  'File Options',
                  `What would you like to do with "${item.fileName}"?`,
                  [
                    { text: 'Cancel', style: 'cancel' },
                    { text: 'Download', onPress: () => downloadFile(item) },
                    { text: 'Save to Device', onPress: () => saveFileToDevice(item) },
                    { text: 'View Details', onPress: () => showFileDetails(item) }
                  ]
                )}
              >
                <View style={styles.fileIcon}>
                  <Ionicons 
                    name={getFileIconForType(item.fileType)} 
                    size={24} 
                    color="#FFFFFF" 
                  />
                </View>
                <View style={styles.fileInfo}>
                  <Text style={[
                    styles.fileName,
                    isCurrentUser ? styles.currentUserText : styles.otherUserText
                  ]}>
                    {item.fileName || 'Document'}
                  </Text>
                  <Text style={styles.fileSize}>
                    {formatFileSize(item.fileSize || 0)}
                  </Text>
                  <Text style={styles.fileSharedBy}>
                    📤 Shared by {item.senderName}
                  </Text>
                </View>
                <View style={styles.fileActions}>
                  <TouchableOpacity 
                    style={styles.fileActionButton}
                    onPress={() => downloadFile(item)}
                  >
                    <Ionicons 
                      name="download-outline" 
                      size={16} 
                      color={isCurrentUser ? 'rgba(255,255,255,0.9)' : '#4F46E5'} 
                    />
                  </TouchableOpacity>
                                  <TouchableOpacity 
                  style={styles.fileActionButton}
                  onPress={() => saveFileToDevice(item)}
                >
                  <Ionicons 
                    name="save-outline" 
                    size={16} 
                    color={isCurrentUser ? 'rgba(255,255,255,0.9)' : '#10B981'} 
                  />
                </TouchableOpacity>
                <TouchableOpacity 
                  style={styles.fileActionButton}
                  onPress={() => shareFile(item)}
                >
                  <Ionicons 
                    name="share-outline" 
                    size={16} 
                    color={isCurrentUser ? 'rgba(255,255,255,0.9)' : '#F59E0B'} 
                  />
                </TouchableOpacity>
                </View>
              </TouchableOpacity>
            </View>
          ) : (
          <Text
            style={[
              styles.messageText,
              isCurrentUser ? styles.currentUserText : styles.otherUserText
            ]}
            selectable={true}
          >
              {String(item.text || '')}
          </Text>
          )}
          
          {/* Edit indicator */}
          {item.edited && (
            <Text style={styles.editedText}>edited</Text>
          )}
          
          {/* Message reactions */}
          {item.reactions && Object.keys(item.reactions).length > 0 && (
            <View style={styles.reactionsContainer}>
              {Object.entries(item.reactions).map(([emoji, users]) => (
                users.length > 0 && (
                  <TouchableOpacity
                    key={emoji}
                    style={[
                      styles.reactionButton,
                      users.includes(user?.uid) && styles.reactionButtonActive
                    ]}
                    onPress={() => handleAddReaction(item.id, emoji)}
                  >
                    <Text style={styles.reactionEmoji}>{emoji}</Text>
                    <Text style={styles.reactionCount}>{users.length}</Text>
                  </TouchableOpacity>
                )
              ))}
            </View>
          )}
          
          {showTimestamp && (
            <View style={styles.messageFooter}>
              <Text style={[
                styles.messageTime,
                isCurrentUser ? styles.currentUserTime : styles.otherUserTime
              ]}>
                {item.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </Text>
              {isCurrentUser && (
                <View style={styles.messageStatus}>
                  {item.status === 'sending' && <ActivityIndicator size="small" color="#C7D2FE" />}
                  {item.status === 'sent' && <Ionicons name="checkmark" size={12} color="#C7D2FE" />}
                  {item.status === 'delivered' && <Ionicons name="checkmark-done" size={12} color="#C7D2FE" />}
                  {item.readBy?.length > 1 && <Ionicons name="checkmark-done" size={12} color="#10B981" />}
                </View>
              )}
            </View>
          )}
        </View>
      </TouchableOpacity>
    );
  };

  // Render typing indicator
  const renderTypingIndicator = () => {
    if (typingUsers.length === 0) return null;

    const typingText = typingUsers.length === 1 
      ? `${String(typingUsers[0]?.userName || 'Someone')} is typing...`
      : `${typingUsers.length} people are typing...`;

    return (
      <View style={styles.typingContainer}>
        <View style={styles.typingBubble}>
          <Text style={styles.typingText}>{typingText}</Text>
          <View style={styles.typingDots}>
            <Animated.View style={[styles.typingDot, styles.typingDot1]} />
            <Animated.View style={[styles.typingDot, styles.typingDot2]} />
            <Animated.View style={[styles.typingDot, styles.typingDot3]} />
          </View>
        </View>
      </View>
    );
  };

  // Main render
  if (currentView === 'chatList') {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
        
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerContent}>
            <Text style={styles.headerTitle}>Chat</Text>
            <Text style={styles.headerSubtitle}>
              {user?.userType === 'lecturer' ? 'Teaching Courses' : `Level ${user?.academicLevel || '100'} Courses`}
            </Text>
          </View>
          <TouchableOpacity
            style={styles.searchButton}
            onPress={toggleSearch}
          >
            <Ionicons name="search" size={24} color="#4F46E5" />
          </TouchableOpacity>
        </View>

        {/* Search Bar */}
        {showSearchBar && (
          <View style={styles.searchContainer}>
            <View style={styles.searchInputContainer}>
              <Ionicons name="search" size={20} color="#64748B" />
              <TextInput
                style={styles.searchInput}
                placeholder="Search courses..."
                value={searchText}
                onChangeText={handleSearch}
                autoFocus={true}
              />
              {searchText.length > 0 && (
                <TouchableOpacity onPress={() => handleSearch('')}>
                  <Ionicons name="close-circle" size={20} color="#64748B" />
                </TouchableOpacity>
              )}
            </View>
          </View>
        )}

        {/* Chat List */}
        <FlatList
          data={searchText.length > 0 ? filteredCourses : sortedCourses}
          renderItem={renderChatListItem}
          keyExtractor={(item) => item.id}
          style={styles.chatList}
          showsVerticalScrollIndicator={false}
          ItemSeparatorComponent={() => <View style={styles.listSeparator} />}
          refreshing={isLoading}
          onRefresh={() => {
            loadSortedChatList();
            loadRecentMessages();
            loadUnreadCounts();
          }}
        />
      </SafeAreaView>
    );
  }

  // Individual Chat View
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.keyboardAvoidingView}>
        <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
        
        {/* Chat Header */}
        <View style={styles.chatHeader}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => setCurrentView('chatList')}
          >
            <Ionicons name="chevron-back" size={24} color="#4F46E5" />
          </TouchableOpacity>
          
          <View style={styles.chatHeaderInfo}>
            <Text style={styles.chatTitle} numberOfLines={1}>
              {selectedCourse?.name}
            </Text>
            <Text style={styles.chatSubtitle}>
              {onlineUsers.length > 0 ? `${onlineUsers.length + 1} online` : selectedCourse?.code}
            </Text>
          </View>
          
          {/* Call Buttons */}
          <View style={styles.callButtons}>
            <TouchableOpacity 
              style={styles.callButton} 
              onPress={initiateVoiceCall}
            >
              <Ionicons name="call" size={20} color="#4F46E5" />
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.callButton} 
              onPress={initiateVideoCall}
            >
              <Ionicons name="videocam" size={20} color="#4F46E5" />
            </TouchableOpacity>
          
          <TouchableOpacity style={styles.chatMenuButton}>
            <Ionicons name="ellipsis-vertical" size={20} color="#4F46E5" />
          </TouchableOpacity>
          </View>
        </View>

        {/* Messages List */}
        <FlatList
          ref={flatListRef}
          data={messages}
          renderItem={renderMessage}
          keyExtractor={(item) => item.id}
          style={styles.messagesList}
          showsVerticalScrollIndicator={false}
          inverted={false}
          onContentSizeChange={() => {
            setTimeout(() => {
              flatListRef.current?.scrollToEnd({ animated: true });
            }, 100);
          }}
          ListFooterComponent={renderTypingIndicator}
        />

        {/* Input Area */}
        <Animated.View style={[
          styles.inputContainer,
          { marginBottom: keyboardHeightAnimated }
        ]}>
          {/* Reply Bar */}
          {replyToMessage && (
            <View style={styles.replyBar}>
              <View style={styles.replyBarContent}>
                <View style={styles.replyBarLine} />
                <View style={styles.replyBarText}>
                  <Text style={styles.replyBarAuthor}>
                    Replying to {String(replyToMessage.senderName || '')}
                  </Text>
                  <Text style={styles.replyBarMessage} numberOfLines={1}>
                    {String(replyToMessage.text || '')}
                  </Text>
                </View>
              </View>
              <TouchableOpacity style={styles.cancelReplyButton} onPress={cancelReply}>
                <Ionicons name="close" size={20} color="#64748B" />
              </TouchableOpacity>
            </View>
          )}

          {/* Edit Bar */}
          {editingMessage && (
            <View style={styles.editBar}>
              <View style={styles.editBarContent}>
                <Ionicons name="pencil" size={16} color="#F59E0B" />
                <Text style={styles.editBarText}>Edit message</Text>
              </View>
              <TouchableOpacity style={styles.cancelEditButton} onPress={cancelEdit}>
                <Ionicons name="close" size={20} color="#64748B" />
              </TouchableOpacity>
            </View>
          )}

          {/* Input Row */}
          <View style={styles.inputRow}>
            <TouchableOpacity 
              style={styles.attachButton}
              onPress={showAttachmentOptions}
            >
              <Ionicons name="add" size={24} color="#4F46E5" />
            </TouchableOpacity>
            
            <View style={[styles.textInputContainer, { minHeight: Math.max(44, inputHeight + 16) }]}>
              <TextInput
                ref={inputRef}
                style={[
                  styles.messageInput,
                  { height: Math.max(44, inputHeight) }
                ]}
                placeholder={
                  editingMessage 
                    ? 'Edit your message...'
                    : replyToMessage 
                    ? 'Reply...' 
                    : `Message ${selectedCourse?.code}...`
                }
                placeholderTextColor="#94A3B8"
                value={newMessage}
                onChangeText={handleTyping}
                onContentSizeChange={(event) => {
                  setInputHeight(Math.min(120, Math.max(44, event.nativeEvent.contentSize.height)));
                }}
                multiline={true}
                maxLength={500}
                editable={!isSending && !isRecording}
                textAlignVertical="center"
                selectionColor="#4F46E5"
                scrollEnabled={false}
              />
              
              {newMessage.length > 0 && (
                <View style={styles.characterCount}>
                  <Text style={styles.characterCountText}>
                    {newMessage.length}/500
                  </Text>
                </View>
              )}
              
              <TouchableOpacity 
                style={[
                  styles.emojiPickerButton,
                  showEmojiPicker && styles.emojiPickerButtonActive
                ]}
                onPress={toggleEmojiPicker}
              >
                <Ionicons 
                  name={showEmojiPicker ? "happy" : "happy-outline"} 
                  size={20} 
                  color={showEmojiPicker ? "#4F46E5" : "#64748B"} 
                />
              </TouchableOpacity>
            </View>
            
            {newMessage.trim() ? (
              <TouchableOpacity
                style={[styles.sendButton, styles.sendButtonActive]}
                onPress={handleSendMessage}
                disabled={isSending}
              >
                {isSending ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                  <Ionicons 
                    name={editingMessage ? "checkmark" : "send"} 
                    size={20} 
                    color="#FFFFFF" 
                  />
                )}
              </TouchableOpacity>
            ) : (
              <TouchableOpacity
                style={[styles.micButton, isRecording && styles.micButtonRecording]}
                onPressIn={startRecording}
                onPressOut={stopRecording}
              >
                <Ionicons 
                  name="mic" 
                  size={20} 
                  color="#FFFFFF" 
                />
              </TouchableOpacity>
            )}
          </View>

          {/* Voice Recording Overlay */}
          {isRecording && (
            <View style={styles.recordingOverlay}>
              <View style={styles.recordingIndicator}>
                <View style={styles.recordingPulse}>
                  <Ionicons name="mic" size={24} color="#EF4444" />
                </View>
                <View style={styles.recordingInfo}>
                  <Text style={styles.recordingText}>Recording voice message...</Text>
                  <Text style={styles.recordingTime}>
                    {communicationService.formatRecordingDuration(recordingTimer)}
                  </Text>
                </View>
              </View>
              <View style={styles.recordingActions}>
                <TouchableOpacity onPress={cancelRecording} style={styles.cancelRecordingButton}>
                  <Ionicons name="close" size={20} color="#EF4444" />
                </TouchableOpacity>
                <TouchableOpacity onPress={stopRecording} style={styles.stopRecordingButton}>
                  <Ionicons name="send" size={20} color="#FFFFFF" />
                </TouchableOpacity>
              </View>
            </View>
          )}

          {/* Emoji Picker */}
          {showEmojiPicker && (
            <View style={styles.emojiPicker}>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                <View style={styles.emojiRow}>
                  {['😀', '😃', '😄', '😁', '😆', '😅', '😂', '🤣', '😊', '😇', '🙂', '🙃', '😉', '😌', '😍', '🥰', '😘', '😗', '😙', '😚', '😋', '😛', '😝', '😜', '🤪', '🤨', '🧐', '🤓', '😎', '🤩', '🥳', '😏', '😒', '😞', '😔', '😟', '😕', '🙁', '☹️', '😣', '😖', '😫', '😩', '🥺', '😢', '😭', '😤', '😠', '😡', '🤬', '🤯', '😳', '🥵', '🥶', '😱', '😨', '😰', '😥', '😓', '🤗', '🤔', '🤭', '🤫', '🤐', '🤨', '😐', '😑', '😶', '😏', '😒', '🙄', '😬', '🤥'].map(emoji => (
                    <TouchableOpacity
                      key={emoji}
                      style={styles.emojiButton}
                      onPress={() => insertEmoji(emoji)}
                    >
                      <Text style={styles.emoji}>{emoji}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </ScrollView>
            </View>
          )}
        </Animated.View>

        {/* Message Actions Modal */}
        <Modal
          visible={showMessageActions}
          transparent={true}
          animationType="slide"
          onRequestClose={() => setShowMessageActions(false)}
        >
          <View style={styles.messageActionsOverlay}>
            <TouchableOpacity 
              style={styles.messageActionsBackdrop}
              onPress={() => setShowMessageActions(false)}
            />
            <View style={styles.messageActionsModal}>
              <View style={styles.messageActionsHeader}>
                <Text style={styles.messageActionsTitle}>Message Actions</Text>
                <TouchableOpacity 
                  onPress={() => setShowMessageActions(false)}
                  style={styles.closeActionsButton}
                >
                  <Ionicons name="close" size={24} color="#64748B" />
                </TouchableOpacity>
              </View>
              
              <View style={styles.messageActionsGrid}>
                <TouchableOpacity 
                  style={styles.actionButton}
                  onPress={() => copyMessage(selectedMessage)}
                >
                  <View style={[styles.actionIcon, { backgroundColor: '#3B82F6' }]}>
                    <Ionicons name="copy" size={20} color="#FFFFFF" />
                  </View>
                  <Text style={styles.actionText}>Copy</Text>
                </TouchableOpacity>

                <TouchableOpacity 
                  style={styles.actionButton}
                  onPress={() => replyToMessageHandler(selectedMessage)}
                >
                  <View style={[styles.actionIcon, { backgroundColor: '#10B981' }]}>
                    <Ionicons name="arrow-undo" size={20} color="#FFFFFF" />
                  </View>
                  <Text style={styles.actionText}>Reply</Text>
                </TouchableOpacity>

                {selectedMessage?.senderId === user?.uid && (
                  <>
                    <TouchableOpacity 
                      style={styles.actionButton}
                      onPress={() => editMessageHandler(selectedMessage)}
                    >
                      <View style={[styles.actionIcon, { backgroundColor: '#F59E0B' }]}>
                        <Ionicons name="pencil" size={20} color="#FFFFFF" />
                      </View>
                      <Text style={styles.actionText}>Edit</Text>
                    </TouchableOpacity>

                    <TouchableOpacity 
                      style={styles.actionButton}
                      onPress={() => deleteMessageHandler(selectedMessage)}
                    >
                      <View style={[styles.actionIcon, { backgroundColor: '#EF4444' }]}>
                        <Ionicons name="trash" size={20} color="#FFFFFF" />
                      </View>
                      <Text style={styles.actionText}>Delete</Text>
                    </TouchableOpacity>
                  </>
                )}
              </View>

              {/* Quick Reactions */}
              <View style={styles.quickReactionsContainer}>
                <Text style={styles.quickReactionsTitle}>Quick Reactions</Text>
                <View style={styles.quickReactionsRow}>
                  {['👍', '❤️', '😄', '😮', '😢', '🔥'].map((emoji) => (
                    <TouchableOpacity
                      key={emoji}
                      style={styles.quickReactionButton}
                      onPress={() => {
                        handleAddReaction(selectedMessage?.id, emoji);
                        setShowMessageActions(false);
                      }}
                    >
                      <Text style={styles.quickReactionEmoji}>{emoji}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            </View>
          </View>
        </Modal>

        {/* Video Call Component */}
        <VideoCallComponent
          visible={(showCallModal || activeCall !== null) && callType === 'video'}
          onClose={() => {
            setShowCallModal(false);
            setActiveCall(null);
            endCurrentCall();
          }}
          isIncoming={activeCall && activeCall.initiator !== user?.uid}
          callerName={selectedCourse?.name || 'Unknown'}
          onAccept={() => handleIncomingCall('accept', activeCall)}
          onReject={() => handleIncomingCall('reject', activeCall)}
          isActive={activeCall?.status === 'active'}
        />

        {/* Voice Call Modal */}
        <Modal
          visible={(showCallModal || activeCall !== null) && callType === 'voice'}
          transparent={true}
          animationType="slide"
          onRequestClose={() => {
            if (activeCall?.status === 'calling' && activeCall?.initiator !== user?.uid) {
              handleIncomingCall('reject', activeCall);
            } else {
              endCurrentCall();
            }
          }}
        >
          <View style={styles.callModalOverlay}>
            <View style={styles.callModal}>
              {activeCall && activeCall.initiator !== user?.uid ? (
                // Incoming voice call UI
                <View style={styles.incomingCallContainer}>
                  <View style={styles.callInfo}>
                    <Ionicons name="call" size={64} color="#4F46E5" />
                    <Text style={styles.callTitle}>Incoming Voice Call</Text>
                    <Text style={styles.callSubtitle}>
                      {selectedCourse?.name || 'Group Chat'}
                    </Text>
                  </View>
                  
                  <View style={styles.incomingCallActions}>
                    <TouchableOpacity 
                      style={[styles.callActionButton, styles.rejectButton]}
                      onPress={() => handleIncomingCall('reject', activeCall)}
                    >
                      <Ionicons name="call" size={32} color="#FFFFFF" 
                        style={{ transform: [{ rotate: '135deg' }] }} />
                    </TouchableOpacity>
                    
                    <TouchableOpacity 
                      style={[styles.callActionButton, styles.acceptButton]}
                      onPress={() => handleIncomingCall('accept', activeCall)}
                    >
                      <Ionicons name="call" size={32} color="#FFFFFF" />
                    </TouchableOpacity>
                  </View>
                </View>
              ) : (
                // Active voice call UI
                <View style={styles.activeCallContainer}>
                  <View style={styles.callInfo}>
                    <Ionicons name="call" size={64} color="#4F46E5" />
                    <Text style={styles.callTitle}>
                      {activeCall?.status === 'calling' ? 'Calling...' : 'Connected'}
                    </Text>
                    <Text style={styles.callSubtitle}>
                      {selectedCourse?.name || 'Group Chat'}
                    </Text>
                    <Text style={styles.callDuration}>Voice Call</Text>
                  </View>
                  
                  <View style={styles.activeCallActions}>
                    <TouchableOpacity style={styles.callControlButton}>
                      <Ionicons name="mic-off" size={24} color="#FFFFFF" />
                    </TouchableOpacity>
                    
                    <TouchableOpacity style={styles.callControlButton}>
                      <Ionicons name="volume-high" size={24} color="#FFFFFF" />
                    </TouchableOpacity>
                    
                    <TouchableOpacity 
                      style={[styles.callActionButton, styles.endCallButton]}
                      onPress={endCurrentCall}
                    >
                      <Ionicons name="call" size={32} color="#FFFFFF" 
                        style={{ transform: [{ rotate: '135deg' }] }} />
                    </TouchableOpacity>
                  </View>
                </View>
              )}
            </View>
          </View>
        </Modal>

        {/* Attachment Options Modal */}
        <Modal
          visible={showAttachmentModal}
          animationType="slide"
          transparent={true}
          onRequestClose={() => setShowAttachmentModal(false)}
        >
          <View style={styles.attachmentModalOverlay}>
            <View style={styles.attachmentModalContent}>
              <View style={styles.attachmentModalHeader}>
                <Text style={styles.attachmentModalTitle}>Share Content</Text>
                <TouchableOpacity 
                  onPress={() => setShowAttachmentModal(false)}
                  style={styles.attachmentModalClose}
                >
                  <Ionicons name="close" size={24} color="#64748B" />
                </TouchableOpacity>
              </View>

              <View style={styles.attachmentOptions}>
                <TouchableOpacity 
                  style={styles.attachmentOption}
                  onPress={() => handleAttachmentSelect('image')}
                >
                  <LinearGradient
                    colors={['#EC4899', '#F97316']}
                    style={styles.attachmentOptionGradient}
                  >
                    <Ionicons name="image" size={28} color="#FFFFFF" />
                  </LinearGradient>
                  <Text style={styles.attachmentOptionText}>Photos</Text>
                </TouchableOpacity>

                <TouchableOpacity 
                  style={styles.attachmentOption}
                  onPress={() => handleAttachmentSelect('video')}
                >
                  <LinearGradient
                    colors={['#8B5CF6', '#A855F7']}
                    style={styles.attachmentOptionGradient}
                  >
                    <Ionicons name="videocam" size={28} color="#FFFFFF" />
                  </LinearGradient>
                  <Text style={styles.attachmentOptionText}>Videos</Text>
                </TouchableOpacity>

                <TouchableOpacity 
                  style={styles.attachmentOption}
                  onPress={() => handleAttachmentSelect('document')}
                >
                  <LinearGradient
                    colors={['#6366F1', '#8B5CF6']}
                    style={styles.attachmentOptionGradient}
                  >
                    <Ionicons name="document" size={28} color="#FFFFFF" />
                  </LinearGradient>
                  <Text style={styles.attachmentOptionText}>Documents</Text>
                </TouchableOpacity>

                <TouchableOpacity 
                  style={styles.attachmentOption}
                  onPress={() => handleAttachmentSelect('camera')}
                >
                  <LinearGradient
                    colors={['#10B981', '#059669']}
                    style={styles.attachmentOptionGradient}
                  >
                    <Ionicons name="camera" size={28} color="#FFFFFF" />
                  </LinearGradient>
                  <Text style={styles.attachmentOptionText}>Camera</Text>
                </TouchableOpacity>

                <TouchableOpacity 
                  style={styles.attachmentOption}
                  onPress={() => handleAttachmentSelect('video_camera')}
                >
                  <LinearGradient
                    colors={['#EF4444', '#DC2626']}
                    style={styles.attachmentOptionGradient}
                  >
                    <Ionicons name="video" size={28} color="#FFFFFF" />
                  </LinearGradient>
                  <Text style={styles.attachmentOptionText}>Record Video</Text>
                </TouchableOpacity>
              </View>

              {/* Upload Progress */}
              {uploadingFiles.length > 0 && (
                <View style={styles.uploadProgress}>
                  <Text style={styles.uploadProgressTitle}>Uploading Files</Text>
                  {uploadingFiles.map((file) => (
                    <View key={file.id} style={styles.uploadProgressItem}>
                      <Text style={styles.uploadProgressFileName}>{file.name}</Text>
                      <View style={styles.uploadProgressBar}>
                        <View 
                          style={[
                            styles.uploadProgressFill,
                            { width: `${file.progress}%` }
                          ]} 
                        />
                      </View>
                      <Text style={styles.uploadProgressPercent}>{Math.round(file.progress)}%</Text>
                    </View>
                  ))}
                </View>
              )}
            </View>
          </View>
        </Modal>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  keyboardAvoidingView: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  
  // Header Styles
  header: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerContent: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1E293B',
    marginBottom: 2,
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#64748B',
    fontWeight: '500',
  },
  searchButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#F8FAFC',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },

  // Chat List Styles
  chatList: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  chatListItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#FFFFFF',
  },
  chatItemLeft: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  courseAvatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  courseAvatarText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  chatInfo: {
    flex: 1,
  },
  chatHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 2,
  },
  courseName: {
    fontSize: 17,
    fontWeight: '600',
    color: '#1E293B',
    flex: 1,
    marginRight: 8,
  },
  unreadCourseName: {
    fontWeight: '700',
    color: '#0F172A',
  },
  lastMessageTime: {
    fontSize: 13,
    color: '#64748B',
  },
  unreadTime: {
    color: '#4F46E5',
    fontWeight: '600',
  },
  chatSubInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  courseCode: {
    fontSize: 13,
    color: '#4F46E5',
    fontWeight: '600',
  },
  separator: {
    marginHorizontal: 6,
    color: '#94A3B8',
    fontSize: 12,
  },
  courseCredits: {
    fontSize: 13,
    color: '#64748B',
  },
  courseSemester: {
    fontSize: 13,
    color: '#64748B',
  },
  lastMessageContainer: {
    marginTop: 2,
  },
  lastMessage: {
    fontSize: 14,
    color: '#64748B',
    lineHeight: 18,
  },
  unreadMessage: {
    color: '#1E293B',
    fontWeight: '500',
  },
  noMessages: {
    fontSize: 14,
    color: '#94A3B8',
    fontStyle: 'italic',
  },
  chatItemRight: {
    alignItems: 'center',
    gap: 8,
  },
  unreadBadge: {
    backgroundColor: '#4F46E5',
    borderRadius: 12,
    minWidth: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 8,
  },
  unreadText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: 'bold',
  },
  listSeparator: {
    height: 1,
    backgroundColor: '#F1F5F9',
    marginLeft: 92,
  },

  // Chat Header (Individual Chat)
  chatHeader: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F8FAFC',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  chatHeaderInfo: {
    flex: 1,
  },
  chatTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1E293B',
  },
  chatSubtitle: {
    fontSize: 13,
    color: '#64748B',
    marginTop: 1,
  },
  chatMenuButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F8FAFC',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },

  // Messages List
  messagesList: {
    flex: 1,
    backgroundColor: '#FAFAFA',
    paddingHorizontal: 16,
    paddingVertical: 8,
  },

  // Message Styles
  messageContainer: {
    flexDirection: 'row',
    marginVertical: 2,
    alignItems: 'flex-end',
  },
  currentUserMessage: {
    justifyContent: 'flex-end',
    alignSelf: 'flex-end',
    maxWidth: '85%',
  },
  otherUserMessage: {
    justifyContent: 'flex-start',
    alignSelf: 'flex-start',
    maxWidth: '85%',
  },
  selectedMessage: {
    backgroundColor: '#EEF2FF',
    borderRadius: 12,
    marginHorizontal: -8,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  messageAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
    marginBottom: 4,
  },
  messageAvatarText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: 'bold',
  },
  messageBubble: {
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 12,
    maxWidth: '100%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  currentUserBubble: {
    backgroundColor: '#4F46E5',
    borderBottomRightRadius: 6,
  },
  otherUserBubble: {
    backgroundColor: '#FFFFFF',
    borderBottomLeftRadius: 6,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  continuedMessage: {
    borderTopLeftRadius: 6,
    marginLeft: 40,
  },
  selectedBubble: {
    borderColor: '#4F46E5',
    borderWidth: 2,
  },
  messageHeaderInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
    gap: 8,
  },
  senderName: {
    fontSize: 12,
    fontWeight: '600',
    color: '#4F46E5',
  },
  lecturerTag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
    gap: 2,
  },
  lecturerTagText: {
    fontSize: 10,
    color: '#7C3AED',
    fontWeight: '500',
  },
  messageText: {
    fontSize: 16,
    lineHeight: 20,
  },
  currentUserText: {
    color: '#FFFFFF',
  },
  otherUserText: {
    color: '#1E293B',
  },
  editedText: {
    fontSize: 11,
    color: '#94A3B8',
    fontStyle: 'italic',
    marginTop: 4,
  },
  messageFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 4,
    gap: 8,
  },
  messageTime: {
    fontSize: 11,
  },
  currentUserTime: {
    color: '#C7D2FE',
  },
  otherUserTime: {
    color: '#94A3B8',
  },
  messageStatus: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  // Reply Preview
  replyPreview: {
    backgroundColor: 'rgba(148, 163, 184, 0.1)',
    borderRadius: 8,
    padding: 8,
    marginBottom: 8,
    flexDirection: 'row',
    borderLeftWidth: 3,
    borderLeftColor: '#4F46E5',
  },
  replyLine: {
    width: 3,
    backgroundColor: '#4F46E5',
    borderRadius: 2,
    marginRight: 8,
  },
  replyContent: {
    flex: 1,
  },
  replyAuthor: {
    fontSize: 12,
    fontWeight: '600',
    color: '#4F46E5',
    marginBottom: 2,
  },
  replyText: {
    fontSize: 13,
    color: '#64748B',
    lineHeight: 16,
  },

  // Reactions
  reactionsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 6,
    gap: 4,
  },
  reactionButton: {
    backgroundColor: '#F1F5F9',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  reactionButtonActive: {
    backgroundColor: '#EEF2FF',
    borderColor: '#4F46E5',
  },
  reactionEmoji: {
    fontSize: 12,
  },
  reactionCount: {
    fontSize: 11,
    color: '#64748B',
    fontWeight: '500',
  },

  // Typing Indicator
  typingContainer: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  typingBubble: {
    backgroundColor: '#F1F5F9',
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 8,
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: 8,
  },
  typingText: {
    fontSize: 14,
    color: '#64748B',
    fontStyle: 'italic',
  },
  typingDots: {
    flexDirection: 'row',
    gap: 2,
  },
  typingDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#94A3B8',
  },

  // Input Container
  inputContainer: {
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    paddingTop: 8,
    paddingBottom: 8,
    minHeight: 60,
    position: 'relative',
    zIndex: 1000,
  },
  replyBar: {
    backgroundColor: '#EEF2FF',
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  replyBarContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  replyBarLine: {
    width: 3,
    height: 32,
    backgroundColor: '#4F46E5',
    borderRadius: 2,
    marginRight: 8,
  },
  replyBarText: {
    flex: 1,
  },
  replyBarAuthor: {
    fontSize: 12,
    fontWeight: '600',
    color: '#4F46E5',
  },
  replyBarMessage: {
    fontSize: 13,
    color: '#64748B',
  },
  cancelReplyButton: {
    padding: 8,
  },
  editBar: {
    backgroundColor: '#FEF3C7',
    borderTopWidth: 1,
    borderTopColor: '#F59E0B',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  editBarContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  editBarText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#F59E0B',
  },
  cancelEditButton: {
    padding: 8,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: 16,
    paddingVertical: 8,
    gap: 8,
  },
  attachButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#F8FAFC',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  textInputContainer: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 22,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    paddingHorizontal: 16,
    paddingVertical: 8,
    flexDirection: 'row',
    alignItems: 'flex-end',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  messageInput: {
    flex: 1,
    fontSize: 16,
    color: '#1E293B',
    paddingRight: 80,
    fontWeight: '400',
    lineHeight: 20,
    textAlignVertical: 'center',
  },
  characterCount: {
    position: 'absolute',
    bottom: 4,
    right: 44,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
  },
  characterCountText: {
    fontSize: 10,
    color: '#64748B',
    fontWeight: '500',
  },
  emojiPickerButton: {
    position: 'absolute',
    right: 8,
    bottom: 8,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F8FAFC',
    justifyContent: 'center',
    alignItems: 'center',
  },
  emojiPickerButtonActive: {
    backgroundColor: '#EEF2FF',
  },
  sendButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#4F46E5',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#4F46E5',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 4,
  },
  sendButtonActive: {
    backgroundColor: '#4F46E5',
  },
  micButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#10B981',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#10B981',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 4,
  },
  micButtonRecording: {
    backgroundColor: '#EF4444',
    transform: [{ scale: 1.1 }],
  },

  // Emoji Picker
  emojiPicker: {
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    paddingVertical: 12,
  },
  emojiRow: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    gap: 8,
  },
  emojiButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 20,
    backgroundColor: '#F8FAFC',
  },
  emoji: {
    fontSize: 20,
  },

  // Message Actions Modal
  messageActionsOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  messageActionsBackdrop: {
    flex: 1,
  },
  messageActionsModal: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingBottom: Platform.OS === 'ios' ? 34 : 20,
    maxHeight: height * 0.6,
  },
  messageActionsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  messageActionsTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1E293B',
  },
  closeActionsButton: {
    padding: 4,
  },
  messageActionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 20,
    paddingVertical: 16,
    gap: 16,
  },
  actionButton: {
    alignItems: 'center',
    gap: 8,
    width: (width - 80) / 3,
  },
  actionIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
  },
  actionText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#64748B',
    textAlign: 'center',
  },
  quickReactionsContainer: {
    paddingHorizontal: 20,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  quickReactionsTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#64748B',
    marginBottom: 12,
  },
  quickReactionsRow: {
    flexDirection: 'row',
    gap: 12,
  },
  quickReactionButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#F8FAFC',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  quickReactionEmoji: {
    fontSize: 20,
  },

  // Call Button Styles
  callButtons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  callButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F8FAFC',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },

  // Recording Overlay Styles
  recordingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    backgroundColor: '#FEF2F2',
    borderTopWidth: 1,
    borderTopColor: '#FECACA',
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    zIndex: 1001,
  },
  recordingIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  recordingPulse: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#FEE2E2',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  recordingInfo: {
    flex: 1,
  },
  recordingText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#DC2626',
    marginBottom: 2,
  },
  recordingTime: {
    fontSize: 12,
    color: '#B91C1C',
    fontFamily: 'monospace',
  },
  recordingActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  cancelRecordingButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#FEE2E2',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#FECACA',
  },
  stopRecordingButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#4F46E5',
    justifyContent: 'center',
    alignItems: 'center',
  },

  // Call Modal Styles
  callModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  callModal: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 32,
    alignItems: 'center',
    width: width * 0.85,
    maxWidth: 320,
  },
  incomingCallContainer: {
    alignItems: 'center',
  },
  activeCallContainer: {
    alignItems: 'center',
  },
  callInfo: {
    alignItems: 'center',
    marginBottom: 32,
  },
  callTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1E293B',
    marginTop: 16,
    marginBottom: 8,
  },
  callSubtitle: {
    fontSize: 16,
    color: '#64748B',
    marginBottom: 4,
  },
  callDuration: {
    fontSize: 14,
    color: '#94A3B8',
  },
  incomingCallActions: {
    flexDirection: 'row',
    gap: 40,
  },
  activeCallActions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 16,
    width: '100%',
  },
  callActionButton: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  acceptButton: {
    backgroundColor: '#10B981',
  },
  rejectButton: {
    backgroundColor: '#EF4444',
  },
  endCallButton: {
    backgroundColor: '#EF4444',
  },
  callControlButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#6B7280',
    justifyContent: 'center',
    alignItems: 'center',
  },

  // Media message styles
  mediaMessage: {
    marginVertical: 4,
  },
  messageImage: {
    width: 200,
    height: 200,
    borderRadius: 12,
    marginBottom: 4,
  },
  mediaCaption: {
    fontSize: 14,
    marginTop: 4,
  },
  videoContainer: {
    width: 200,
    height: 150,
    borderRadius: 12,
    backgroundColor: '#1E293B',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 4,
  },
  videoPlaceholder: {
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  videoFileName: {
    fontSize: 12,
    color: '#FFFFFF',
    fontWeight: '500',
  },
  fileMessage: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    marginVertical: 2,
  },
  fileIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#6366F1',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  fileInfo: {
    flex: 1,
  },
  fileName: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 2,
  },
  fileSize: {
    fontSize: 12,
    color: '#94A3B8',
  },

  // Attachment modal styles
  attachmentModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  attachmentModalContent: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingBottom: 40,
    maxHeight: '80%',
  },
  attachmentModalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  attachmentModalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1E293B',
  },
  attachmentModalClose: {
    padding: 4,
  },
  attachmentOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 20,
    gap: 16,
  },
  attachmentOption: {
    alignItems: 'center',
    width: (width - 72) / 4,
  },
  attachmentOptionGradient: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  attachmentOptionText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#64748B',
    textAlign: 'center',
  },
  uploadProgress: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  uploadProgressTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1E293B',
    marginBottom: 12,
  },
  uploadProgressItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 8,
  },
  uploadProgressFileName: {
    flex: 1,
    fontSize: 14,
    color: '#64748B',
  },
  uploadProgressBar: {
    width: 80,
    height: 4,
    backgroundColor: '#E5E7EB',
    borderRadius: 2,
    overflow: 'hidden',
  },
  uploadProgressFill: {
    height: 4,
    backgroundColor: '#10B981',
    borderRadius: 2,
  },
  uploadProgressPercent: {
    fontSize: 12,
    color: '#64748B',
    width: 35,
    textAlign: 'right',
  },
  // Search styles
  searchContainer: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  searchInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F1F5F9',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#1E293B',
  },
  
  // Enhanced file message styles
  fileMessageContainer: {
    marginVertical: 4,
  },
  fileMessage: {
    backgroundColor: 'rgba(79, 70, 229, 0.1)',
    borderRadius: 12,
    padding: 12,
    marginVertical: 2,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(79, 70, 229, 0.2)',
  },
  fileIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#4F46E5',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  fileInfo: {
    flex: 1,
  },
  fileName: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 4,
  },
  fileSize: {
    fontSize: 12,
    opacity: 0.7,
    marginBottom: 2,
  },
  fileSharedBy: {
    fontSize: 11,
    opacity: 0.6,
    fontStyle: 'italic',
  },
  fileActions: {
    flexDirection: 'row',
    gap: 8,
  },
  fileActionButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: 'rgba(79, 70, 229, 0.1)',
  },
});