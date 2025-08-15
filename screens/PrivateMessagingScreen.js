import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  Modal,
  TextInput,
  Alert,
  SafeAreaView,
  ActivityIndicator,
  Dimensions,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Animated,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useApp } from '../context/AppContext';
import privateMessagingService from '../services/privateMessagingService';

const { width, height } = Dimensions.get('window');

function PrivateMessagingScreen({ navigation }) {
  const { user } = useApp();
  const [selectedTab, setSelectedTab] = useState('conversations');
  const [conversations, setConversations] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [messageText, setMessageText] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [showNewChatModal, setShowNewChatModal] = useState(false);
  const [lecturers, setLecturers] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [chatSubject, setChatSubject] = useState('');
  const [selectedLecturer, setSelectedLecturer] = useState(null);

  // Animation refs
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;

  useEffect(() => {
    if (user) {
      privateMessagingService.setCurrentUser(user.uid, user.fullName || user.name, user.userType);
      loadConversations();
      startAnimations();
    }
  }, [user]);

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

  const loadConversations = async () => {
    try {
      setLoading(true);
      const result = await privateMessagingService.getUserConversations();
      if (result.success) {
        setConversations(result.conversations);
        
        // Set up real-time listener
        privateMessagingService.listenToUserConversations((newConversations) => {
          setConversations(newConversations);
        });
      }
    } catch (error) {
      console.error('Error loading conversations:', error);
      Alert.alert('Error', 'Failed to load conversations');
    } finally {
      setLoading(false);
    }
  };

  const loadMessages = async (conversationId) => {
    try {
      const result = await privateMessagingService.getPrivateMessages(conversationId);
      if (result.success) {
        setMessages(result.messages);
        
        // Set up real-time listener for messages
        privateMessagingService.listenToPrivateMessages(conversationId, (newMessages) => {
          setMessages(newMessages);
        });
        
        // Mark messages as read
        await privateMessagingService.markMessagesAsRead(conversationId);
      }
    } catch (error) {
      console.error('Error loading messages:', error);
      Alert.alert('Error', 'Failed to load messages');
    }
  };

  const searchLecturers = async (query = '') => {
    try {
      const result = await privateMessagingService.searchLecturers(query);
      if (result.success) {
        setLecturers(result.lecturers);
      }
    } catch (error) {
      console.error('Error searching lecturers:', error);
    }
  };

  const startNewConversation = async () => {
    if (!selectedLecturer || !chatSubject.trim()) {
      Alert.alert('Required Fields', 'Please select a lecturer and enter a subject');
      return;
    }

    try {
      const result = await privateMessagingService.startPrivateConversation(
        selectedLecturer.id,
        selectedLecturer.fullName || selectedLecturer.name,
        'lecturer',
        null,
        chatSubject.trim()
      );

      if (result.success) {
        setShowNewChatModal(false);
        setSelectedLecturer(null);
        setChatSubject('');
        setSearchQuery('');
        setSelectedConversation(result.conversation);
        loadMessages(result.conversationId);
        setSelectedTab('chat');
      } else {
        Alert.alert('Error', result.error || 'Failed to start conversation');
      }
    } catch (error) {
      console.error('Error starting conversation:', error);
      Alert.alert('Error', 'Failed to start conversation');
    }
  };

  const sendMessage = async () => {
    if (!messageText.trim() || !selectedConversation) return;

    try {
      setSending(true);
      const result = await privateMessagingService.sendPrivateMessage(
        selectedConversation.id,
        messageText.trim()
      );

      if (result.success) {
        setMessageText('');
      } else {
        Alert.alert('Error', result.error || 'Failed to send message');
      }
    } catch (error) {
      console.error('Error sending message:', error);
      Alert.alert('Error', 'Failed to send message');
    } finally {
      setSending(false);
    }
  };

  const openConversation = (conversation) => {
    setSelectedConversation(conversation);
    loadMessages(conversation.id);
    setSelectedTab('chat');
  };

  const formatTime = (timestamp) => {
    if (!timestamp) return '';
    const date = new Date(timestamp);
    const now = new Date();
    const diffDays = Math.floor((now - date) / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else if (diffDays === 1) {
      return 'Yesterday';
    } else if (diffDays < 7) {
      return date.toLocaleDateString([], { weekday: 'short' });
    } else {
      return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
    }
  };

  const renderConversationItem = ({ item }) => (
    <TouchableOpacity
      style={styles.conversationItem}
      onPress={() => openConversation(item)}
    >
      <View style={styles.conversationAvatar}>
        <LinearGradient
          colors={['#4F46E5', '#7C3AED']}
          style={styles.avatarGradient}
        >
          <Ionicons 
            name={item.otherParticipant?.userType === 'lecturer' ? 'school' : 'person'} 
            size={24} 
            color="#FFFFFF" 
          />
        </LinearGradient>
        {item.participants[user?.uid]?.hasUnread && (
          <View style={styles.unreadIndicator} />
        )}
      </View>
      
      <View style={styles.conversationInfo}>
        <View style={styles.conversationHeader}>
          <Text style={styles.conversationName}>
            {item.otherParticipant?.name || 'Unknown User'}
          </Text>
          <Text style={styles.conversationTime}>
            {formatTime(item.lastActivity)}
          </Text>
        </View>
        
        <Text style={styles.conversationSubject}>
          📋 {item.subject}
        </Text>
        
        {item.lastMessage && (
          <Text style={styles.lastMessage} numberOfLines={1}>
            {item.lastMessage.text}
          </Text>
        )}
        
        <View style={styles.conversationMeta}>
          <View style={styles.confidentialBadge}>
            <Ionicons name="shield-checkmark" size={12} color="#10B981" />
            <Text style={styles.confidentialText}>Confidential</Text>
          </View>
          <View style={styles.statusBadge}>
            <Text style={styles.statusText}>{item.status}</Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );

  const renderMessage = ({ item }) => {
    const isCurrentUser = item.senderId === user?.uid;
    
    return (
      <View style={[
        styles.messageContainer,
        isCurrentUser ? styles.currentUserMessage : styles.otherUserMessage
      ]}>
        <View style={[
          styles.messageBubble,
          isCurrentUser ? styles.currentUserBubble : styles.otherUserBubble
        ]}>
          <Text style={[
            styles.messageText,
            isCurrentUser ? styles.currentUserText : styles.otherUserText
          ]}>
            {item.text}
          </Text>
          
          <View style={styles.messageFooter}>
            <Text style={[
              styles.messageTime,
              isCurrentUser ? styles.currentUserTime : styles.otherUserTime
            ]}>
              {formatTime(item.timestamp)}
            </Text>
            {item.isConfidential && (
              <Ionicons 
                name="shield-checkmark" 
                size={12} 
                color={isCurrentUser ? 'rgba(255,255,255,0.7)' : '#10B981'} 
              />
            )}
          </View>
        </View>
      </View>
    );
  };

  const renderLecturerItem = ({ item }) => (
    <TouchableOpacity
      style={[
        styles.lecturerItem,
        selectedLecturer?.id === item.id && styles.selectedLecturerItem
      ]}
      onPress={() => setSelectedLecturer(item)}
    >
      <View style={styles.lecturerAvatar}>
        <LinearGradient
          colors={['#059669', '#10B981']}
          style={styles.avatarGradient}
        >
          <Ionicons name="school" size={20} color="#FFFFFF" />
        </LinearGradient>
      </View>
      
      <View style={styles.lecturerInfo}>
        <Text style={styles.lecturerName}>
          {item.fullName || item.name}
        </Text>
        <Text style={styles.lecturerDepartment}>
          {item.department || 'Faculty Member'}
        </Text>
        <Text style={styles.lecturerEmail}>
          {item.email}
        </Text>
      </View>
      
      {selectedLecturer?.id === item.id && (
        <Ionicons name="checkmark-circle" size={24} color="#10B981" />
      )}
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4F46E5" />
        <Text style={styles.loadingText}>Loading private messages...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <LinearGradient
        colors={['#4F46E5', '#7C3AED']}
        style={styles.header}
      >
        <View style={styles.headerContent}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
          </TouchableOpacity>
          
          <Text style={styles.headerTitle}>
            {selectedTab === 'conversations' ? 'Private Messages' : 'Confidential Chat'}
          </Text>
          
          {selectedTab === 'conversations' && user?.userType === 'student' && (
            <TouchableOpacity
              style={styles.newChatButton}
              onPress={() => {
                setShowNewChatModal(true);
                searchLecturers();
              }}
            >
              <Ionicons name="add" size={24} color="#FFFFFF" />
            </TouchableOpacity>
          )}
          
          {selectedTab === 'chat' && (
            <TouchableOpacity
              style={styles.backToChatButton}
              onPress={() => setSelectedTab('conversations')}
            >
              <Ionicons name="chatbubbles" size={24} color="#FFFFFF" />
            </TouchableOpacity>
          )}
        </View>
        
        {selectedTab === 'chat' && selectedConversation && (
          <View style={styles.chatHeader}>
            <View style={styles.chatParticipant}>
              <Ionicons name="school" size={16} color="rgba(255,255,255,0.8)" />
              <Text style={styles.chatParticipantName}>
                {selectedConversation.otherParticipant?.name}
              </Text>
            </View>
            <Text style={styles.chatSubject}>
              📋 {selectedConversation.subject}
            </Text>
          </View>
        )}
      </LinearGradient>

      <Animated.View style={[
        styles.content,
        { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }
      ]}>
        {selectedTab === 'conversations' ? (
          // Conversations List
          <View style={styles.conversationsContainer}>
            {conversations.length === 0 ? (
              <View style={styles.emptyState}>
                <Ionicons name="chatbubble-outline" size={64} color="#9CA3AF" />
                <Text style={styles.emptyStateTitle}>No Private Messages</Text>
                <Text style={styles.emptyStateText}>
                  {user?.userType === 'student' 
                    ? 'Start a confidential conversation with a lecturer'
                    : 'Students can message you privately for consultations'
                  }
                </Text>
                {user?.userType === 'student' && (
                  <TouchableOpacity
                    style={styles.startChatButton}
                    onPress={() => {
                      setShowNewChatModal(true);
                      searchLecturers();
                    }}
                  >
                    <Text style={styles.startChatButtonText}>Start Private Chat</Text>
                  </TouchableOpacity>
                )}
              </View>
            ) : (
              <FlatList
                data={conversations}
                renderItem={renderConversationItem}
                keyExtractor={(item) => item.id}
                contentContainerStyle={styles.conversationsList}
                showsVerticalScrollIndicator={false}
              />
            )}
          </View>
        ) : (
          // Chat View
          <KeyboardAvoidingView 
            style={styles.chatContainer}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          >
            <FlatList
              data={messages}
              renderItem={renderMessage}
              keyExtractor={(item) => item.id}
              contentContainerStyle={styles.messagesList}
              showsVerticalScrollIndicator={false}
            />
            
            <View style={styles.inputContainer}>
              <View style={styles.confidentialNotice}>
                <Ionicons name="shield-checkmark" size={16} color="#10B981" />
                <Text style={styles.confidentialNoticeText}>
                  This conversation is confidential and encrypted
                </Text>
              </View>
              
              <View style={styles.messageInputContainer}>
                <TextInput
                  style={styles.messageInput}
                  placeholder="Type your message..."
                  placeholderTextColor="#9CA3AF"
                  value={messageText}
                  onChangeText={setMessageText}
                  multiline
                  maxLength={1000}
                />
                <TouchableOpacity
                  style={[
                    styles.sendButton,
                    (!messageText.trim() || sending) && styles.sendButtonDisabled
                  ]}
                  onPress={sendMessage}
                  disabled={!messageText.trim() || sending}
                >
                  {sending ? (
                    <ActivityIndicator size="small" color="#FFFFFF" />
                  ) : (
                    <Ionicons name="send" size={20} color="#FFFFFF" />
                  )}
                </TouchableOpacity>
              </View>
            </View>
          </KeyboardAvoidingView>
        )}
      </Animated.View>

      {/* New Chat Modal */}
      <Modal
        visible={showNewChatModal}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity
              style={styles.modalCancelButton}
              onPress={() => {
                setShowNewChatModal(false);
                setSelectedLecturer(null);
                setChatSubject('');
                setSearchQuery('');
              }}
            >
              <Text style={styles.modalCancelText}>Cancel</Text>
            </TouchableOpacity>
            <Text style={styles.modalTitle}>New Private Message</Text>
            <TouchableOpacity
              style={[
                styles.modalStartButton,
                (!selectedLecturer || !chatSubject.trim()) && styles.modalStartButtonDisabled
              ]}
              onPress={startNewConversation}
              disabled={!selectedLecturer || !chatSubject.trim()}
            >
              <Text style={[
                styles.modalStartText,
                (!selectedLecturer || !chatSubject.trim()) && styles.modalStartTextDisabled
              ]}>
                Start
              </Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalContent}>
            {/* Subject Input */}
            <View style={styles.subjectSection}>
              <Text style={styles.sectionTitle}>Subject</Text>
              <TextInput
                style={styles.subjectInput}
                placeholder="What would you like to discuss?"
                value={chatSubject}
                onChangeText={setChatSubject}
                maxLength={100}
              />
            </View>

            {/* Lecturer Search */}
            <View style={styles.lecturerSection}>
              <Text style={styles.sectionTitle}>Select Lecturer</Text>
              <TextInput
                style={styles.searchInput}
                placeholder="Search lecturers..."
                value={searchQuery}
                onChangeText={(text) => {
                  setSearchQuery(text);
                  searchLecturers(text);
                }}
              />
              
              <FlatList
                data={lecturers}
                renderItem={renderLecturerItem}
                keyExtractor={(item) => item.id}
                style={styles.lecturersList}
                showsVerticalScrollIndicator={false}
              />
            </View>
          </ScrollView>
        </SafeAreaView>
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
    backgroundColor: '#F8FAFC',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#6B7280',
  },
  header: {
    paddingTop: 16,
    paddingBottom: 20,
    paddingHorizontal: 20,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  newChatButton: {
    padding: 8,
  },
  backToChatButton: {
    padding: 8,
  },
  chatHeader: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.2)',
  },
  chatParticipant: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  chatParticipantName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  chatSubject: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
  },
  content: {
    flex: 1,
  },
  conversationsContainer: {
    flex: 1,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  emptyStateTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
    marginTop: 16,
    marginBottom: 8,
    textAlign: 'center',
  },
  emptyStateText: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 24,
  },
  startChatButton: {
    backgroundColor: '#4F46E5',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  startChatButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  conversationsList: {
    padding: 20,
  },
  conversationItem: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  conversationAvatar: {
    position: 'relative',
    marginRight: 12,
  },
  avatarGradient: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  unreadIndicator: {
    position: 'absolute',
    top: -2,
    right: -2,
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#EF4444',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  conversationInfo: {
    flex: 1,
  },
  conversationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  conversationName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
  },
  conversationTime: {
    fontSize: 12,
    color: '#6B7280',
  },
  conversationSubject: {
    fontSize: 14,
    fontWeight: '500',
    color: '#4F46E5',
    marginBottom: 4,
  },
  lastMessage: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 8,
  },
  conversationMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  confidentialBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#ECFDF5',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
  },
  confidentialText: {
    fontSize: 10,
    fontWeight: '500',
    color: '#10B981',
  },
  statusBadge: {
    backgroundColor: '#EEF2FF',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 10,
    fontWeight: '500',
    color: '#4F46E5',
    textTransform: 'uppercase',
  },
  chatContainer: {
    flex: 1,
  },
  messagesList: {
    padding: 20,
    flexGrow: 1,
  },
  messageContainer: {
    marginBottom: 12,
  },
  currentUserMessage: {
    alignItems: 'flex-end',
  },
  otherUserMessage: {
    alignItems: 'flex-start',
  },
  messageBubble: {
    maxWidth: width * 0.75,
    borderRadius: 16,
    padding: 12,
  },
  currentUserBubble: {
    backgroundColor: '#4F46E5',
    borderBottomRightRadius: 4,
  },
  otherUserBubble: {
    backgroundColor: '#FFFFFF',
    borderBottomLeftRadius: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  messageText: {
    fontSize: 14,
    lineHeight: 20,
  },
  currentUserText: {
    color: '#FFFFFF',
  },
  otherUserText: {
    color: '#1F2937',
  },
  messageFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 4,
    gap: 8,
  },
  messageTime: {
    fontSize: 10,
    fontWeight: '500',
  },
  currentUserTime: {
    color: 'rgba(255,255,255,0.7)',
  },
  otherUserTime: {
    color: '#9CA3AF',
  },
  inputContainer: {
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    padding: 16,
  },
  confidentialNotice: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#ECFDF5',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    marginBottom: 12,
  },
  confidentialNoticeText: {
    fontSize: 12,
    color: '#059669',
    fontWeight: '500',
  },
  messageInputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 12,
  },
  messageInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 24,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 14,
    maxHeight: 120,
    backgroundColor: '#F9FAFB',
  },
  sendButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#4F46E5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendButtonDisabled: {
    backgroundColor: '#9CA3AF',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    backgroundColor: '#FFFFFF',
  },
  modalCancelButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  modalCancelText: {
    fontSize: 16,
    color: '#6B7280',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
  },
  modalStartButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  modalStartButtonDisabled: {
    opacity: 0.5,
  },
  modalStartText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#4F46E5',
  },
  modalStartTextDisabled: {
    color: '#9CA3AF',
  },
  modalContent: {
    flex: 1,
    padding: 20,
  },
  subjectSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 8,
  },
  subjectInput: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
  },
  lecturerSection: {
    flex: 1,
  },
  searchInput: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    marginBottom: 16,
  },
  lecturersList: {
    flex: 1,
  },
  lecturerItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  selectedLecturerItem: {
    borderColor: '#10B981',
    backgroundColor: '#ECFDF5',
  },
  lecturerAvatar: {
    marginRight: 12,
  },
  lecturerInfo: {
    flex: 1,
  },
  lecturerName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 2,
  },
  lecturerDepartment: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 2,
  },
  lecturerEmail: {
    fontSize: 12,
    color: '#9CA3AF',
  },
});

export default PrivateMessagingScreen;
