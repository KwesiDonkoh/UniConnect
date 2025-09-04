import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  TextInput,
  SafeAreaView,
  ActivityIndicator,
  Animated,
  Image,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { StatusBar } from 'expo-status-bar';
import { useApp } from '../context/AppContext';
import { Colors } from '../themes/modernTheme';
import privateMessagingService from '../services/privateMessagingService';
import simpleCallingService from '../services/simpleCallingService';

// Import safe components
import EnhancedFileShareModal from '../components/EnhancedFileShareModal';
import SimpleAudioRecorder from '../components/SimpleAudioRecorder';
import SimpleVoiceCallModal from '../components/SimpleVoiceCallModal';
import SimpleVideoCallModal from '../components/SimpleVideoCallModal';

export default function MessagingWithCallsScreen({ navigation }) {
  const appContext = useApp();
  const { user } = appContext || {};
  const [selectedTab, setSelectedTab] = useState('conversations');
  const [conversations, setConversations] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [messageText, setMessageText] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  
  // Safe features
  const [showFileShare, setShowFileShare] = useState(false);
  const [showAudioRecorder, setShowAudioRecorder] = useState(false);
  
  // Simple calling features
  const [showVoiceCall, setShowVoiceCall] = useState(false);
  const [showVideoCall, setShowVideoCall] = useState(false);
  const [currentCall, setCurrentCall] = useState(null);

  const fadeAnim = useRef(new Animated.Value(0)).current;

  // Early return if user data is not available
  if (!user) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar style="light" />
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading...</Text>
        </View>
      </SafeAreaView>
    );
  }

  useEffect(() => {
    if (user) {
      privateMessagingService.setCurrentUser(user.uid, user.fullName || user.name, user.userType);
      simpleCallingService.initialize(user.uid);
      
      // Set up calling service callbacks
      simpleCallingService.setOnCallStatusChange(handleCallStatusChange);
      
      loadConversations();
      
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }).start();
    }

    return () => {
      simpleCallingService.destroy();
    };
  }, [user]);

  const handleCallStatusChange = (callData) => {
    setCurrentCall(callData);
    
    if (callData.status === 'ended' || callData.status === 'rejected') {
      setShowVoiceCall(false);
      setShowVideoCall(false);
      setCurrentCall(null);
    }
  };

  const loadConversations = async () => {
    try {
      setLoading(true);
      const result = await privateMessagingService.getUserConversations();
      if (result.success) {
        setConversations(result.conversations);
        
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
        
        privateMessagingService.listenToPrivateMessages(conversationId, (newMessages) => {
          setMessages(newMessages);
        });
        
        await privateMessagingService.markMessagesAsRead(conversationId);
      }
    } catch (error) {
      console.error('Error loading messages:', error);
      Alert.alert('Error', 'Failed to load messages');
    }
  };

  const sendMessage = async () => {
    if (!messageText.trim() || !selectedConversation || sending) return;

    const tempMessage = {
      id: Date.now().toString(),
      text: messageText.trim(),
      senderId: user.uid,
      senderName: user.name || user.fullName,
      timestamp: new Date(),
      type: 'text',
      status: 'sending'
    };

    setMessages(prev => [...prev, tempMessage]);
    setMessageText('');
    setSending(true);

    try {
      const result = await privateMessagingService.sendPrivateMessage(
        selectedConversation.id,
        messageText.trim(),
        'text'
      );

      if (result.success) {
        setMessages(prev => 
          prev.map(msg => 
            msg.id === tempMessage.id 
              ? { ...result.message, status: 'sent' }
              : msg
          )
        );
      } else {
        setMessages(prev => prev.filter(msg => msg.id !== tempMessage.id));
        Alert.alert('Error', 'Failed to send message');
      }
    } catch (error) {
      setMessages(prev => prev.filter(msg => msg.id !== tempMessage.id));
      Alert.alert('Error', 'Failed to send message');
    } finally {
      setSending(false);
    }
  };

  const startVoiceCall = async () => {
    if (!selectedConversation?.otherParticipant) return;

    const result = await simpleCallingService.startVoiceCall(
      selectedConversation.otherParticipant.id,
      selectedConversation.otherParticipant.name,
      selectedConversation.otherParticipant.avatar
    );

    if (result.success) {
      setCurrentCall(result.call);
      setShowVoiceCall(true);
    } else {
      Alert.alert('Error', result.error || 'Failed to start voice call');
    }
  };

  const startVideoCall = async () => {
    if (!selectedConversation?.otherParticipant) return;

    const result = await simpleCallingService.startVideoCall(
      selectedConversation.otherParticipant.id,
      selectedConversation.otherParticipant.name,
      selectedConversation.otherParticipant.avatar
    );

    if (result.success) {
      setCurrentCall(result.call);
      setShowVideoCall(true);
    } else {
      Alert.alert('Error', result.error || 'Failed to start video call');
    }
  };

  const handleFileSent = async (uploadResults, message) => {
    if (!selectedConversation) return;

    try {
      for (const result of uploadResults) {
        if (result.success) {
          await privateMessagingService.sendPrivateMessage(
            selectedConversation.id,
            message || `File: ${result.fileName}`,
            'file',
            {
              fileName: result.fileName,
              downloadURL: result.downloadURL,
              fileId: result.fileId,
            }
          );
        }
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to send files');
    }
  };

  const handleAudioSent = async (audioData) => {
    if (!selectedConversation) return;

    try {
      await privateMessagingService.sendPrivateMessage(
        selectedConversation.id,
        'Audio message',
        'audio',
        {
          audioUri: audioData.uri,
          duration: audioData.duration,
          timestamp: audioData.timestamp,
        }
      );
    } catch (error) {
      Alert.alert('Error', 'Failed to send audio message');
    }
  };

  const renderMessage = ({ item, index }) => {
    const isOwnMessage = item.senderId === user.uid;
    const showAvatar = !isOwnMessage && (index === 0 || messages[index - 1]?.senderId !== item.senderId);

    return (
      <Animated.View
        style={[
          styles.messageContainer,
          isOwnMessage ? styles.ownMessage : styles.otherMessage,
          { opacity: fadeAnim },
        ]}
      >
        {showAvatar && !isOwnMessage && (
          <Image
            source={{ uri: selectedConversation?.otherParticipant?.avatar || 'https://i.pravatar.cc/150?img=1' }}
            style={styles.messageAvatar}
          />
        )}

        <View style={[
          styles.messageBubble,
          isOwnMessage ? styles.ownMessageBubble : styles.otherMessageBubble,
        ]}>
          {item.type === 'text' && (
            <Text style={[
              styles.messageText,
              isOwnMessage ? styles.ownMessageText : styles.otherMessageText,
            ]}>
              {item.text}
            </Text>
          )}

          {item.type === 'file' && (
            <View style={styles.fileMessage}>
              <Ionicons 
                name="document-attach" 
                size={20} 
                color={isOwnMessage ? Colors.primary[100] : Colors.primary[500]} 
              />
              <Text style={[
                styles.fileName,
                isOwnMessage ? styles.ownMessageText : styles.otherMessageText,
              ]}>
                {item.metadata?.fileName || 'File'}
              </Text>
            </View>
          )}

          {item.type === 'audio' && (
            <View style={styles.audioMessage}>
              <Ionicons 
                name="musical-notes" 
                size={20} 
                color={isOwnMessage ? Colors.primary[100] : Colors.primary[500]} 
              />
              <Text style={[
                styles.fileName,
                isOwnMessage ? styles.ownMessageText : styles.otherMessageText,
              ]}>
                Audio Message ({item.metadata?.duration || 0}s)
              </Text>
            </View>
          )}

          <Text style={[
            styles.messageTime,
            isOwnMessage ? styles.ownMessageTime : styles.otherMessageTime,
          ]}>
            {item.timestamp?.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </Text>
        </View>
      </Animated.View>
    );
  };

  const renderConversation = ({ item }) => (
    <TouchableOpacity
      style={styles.conversationItem}
      onPress={() => {
        setSelectedConversation(item);
        setSelectedTab('chat');
        loadMessages(item.id);
      }}
    >
      <Image
        source={{ uri: item.otherParticipant?.avatar || 'https://i.pravatar.cc/150?img=1' }}
        style={styles.conversationAvatar}
      />
      
      <View style={styles.conversationInfo}>
        <Text style={styles.conversationName}>
          {item.otherParticipant?.name || 'Unknown'}
        </Text>
        <Text style={styles.conversationLastMessage} numberOfLines={1}>
          {item.lastMessage?.text || 'No messages yet'}
        </Text>
      </View>

      <View style={styles.conversationMeta}>
        <Text style={styles.conversationTime}>
          {item.lastMessage?.timestamp?.toLocaleDateString() || ''}
        </Text>
        {item.unreadCount > 0 && (
          <View style={styles.unreadBadge}>
            <Text style={styles.unreadCount}>{item.unreadCount}</Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );

  if (selectedTab === 'chat' && selectedConversation) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar style="light" />
        
        {/* Chat Header with Call Buttons */}
        <LinearGradient
          colors={[Colors.primary[600], Colors.primary[800]]}
          style={styles.chatHeader}
        >
          <View style={styles.chatHeaderContent}>
            <TouchableOpacity
              onPress={() => setSelectedTab('conversations')}
              style={styles.backButton}
            >
              <Ionicons name="arrow-back" size={24} color="white" />
            </TouchableOpacity>

            <View style={styles.chatHeaderInfo}>
              <Image
                source={{ uri: selectedConversation.otherParticipant?.avatar || 'https://i.pravatar.cc/150?img=1' }}
                style={styles.chatHeaderAvatar}
              />
              <View>
                <Text style={styles.chatHeaderName}>
                  {selectedConversation.otherParticipant?.name || 'Unknown'}
                </Text>
                <Text style={styles.chatHeaderStatus}>Online</Text>
              </View>
            </View>

            <View style={styles.chatHeaderActions}>
              <TouchableOpacity
                onPress={startVoiceCall}
                style={styles.headerActionButton}
              >
                <Ionicons name="call" size={20} color="white" />
              </TouchableOpacity>

              <TouchableOpacity
                onPress={startVideoCall}
                style={styles.headerActionButton}
              >
                <Ionicons name="videocam" size={20} color="white" />
              </TouchableOpacity>
            </View>
          </View>
        </LinearGradient>

        {/* Messages */}
        <View style={styles.chatContent}>
          <FlatList
            data={messages}
            renderItem={renderMessage}
            keyExtractor={(item) => item.id}
            style={styles.messagesList}
            contentContainerStyle={styles.messagesContent}
            inverted
          />

          {/* Input Bar */}
          <View style={styles.inputContainer}>
            <TouchableOpacity
              onPress={() => setShowFileShare(true)}
              style={styles.inputAction}
            >
              <Ionicons name="attach" size={24} color={Colors.primary[500]} />
            </TouchableOpacity>

            <View style={styles.textInputContainer}>
              <TextInput
                style={styles.textInput}
                placeholder="Type a message..."
                value={messageText}
                onChangeText={setMessageText}
                multiline
                maxLength={1000}
                placeholderTextColor={Colors.neutral[400]}
              />
            </View>

            <TouchableOpacity
              onPress={() => setShowAudioRecorder(true)}
              style={styles.inputAction}
            >
              <Ionicons name="mic" size={24} color={Colors.primary[500]} />
            </TouchableOpacity>

            <TouchableOpacity
              onPress={sendMessage}
              style={[
                styles.sendButton,
                (!messageText.trim() || sending) && styles.sendButtonDisabled
              ]}
              disabled={!messageText.trim() || sending}
            >
              {sending ? (
                <ActivityIndicator size="small" color="white" />
              ) : (
                <Ionicons name="send" size={20} color="white" />
              )}
            </TouchableOpacity>
          </View>
        </View>

        {/* Modals */}
        <EnhancedFileShareModal
          visible={showFileShare}
          onClose={() => setShowFileShare(false)}
          onFileSent={handleFileSent}
          userInfo={user}
          courseCode={selectedConversation?.subject || 'private'}
        />

        <SimpleAudioRecorder
          visible={showAudioRecorder}
          onClose={() => setShowAudioRecorder(false)}
          onSendAudio={handleAudioSent}
        />

        <SimpleVoiceCallModal
          visible={showVoiceCall}
          onClose={() => setShowVoiceCall(false)}
          callData={currentCall}
          isIncoming={false}
        />

        <SimpleVideoCallModal
          visible={showVideoCall}
          onClose={() => setShowVideoCall(false)}
          callData={currentCall}
          isIncoming={false}
        />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="light" />
      
      {/* Header */}
      <LinearGradient
        colors={[Colors.primary[600], Colors.primary[800]]}
        style={styles.header}
      >
        <View style={styles.headerContent}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.backButton}
          >
            <Ionicons name="arrow-back" size={24} color="white" />
          </TouchableOpacity>
          
          <Text style={styles.headerTitle}>Messaging & Calls</Text>
          
          <View style={{ width: 40 }} />
        </View>
      </LinearGradient>

      {/* Conversations List */}
      <Animated.View style={[
        styles.content,
        { opacity: fadeAnim }
      ]}>
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={Colors.primary[500]} />
            <Text style={styles.loadingText}>Loading conversations...</Text>
          </View>
        ) : conversations.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Ionicons name="chatbubbles-outline" size={64} color={Colors.neutral[400]} />
            <Text style={styles.emptyTitle}>No Conversations</Text>
            <Text style={styles.emptySubtitle}>
              Start a conversation with your lecturers or classmates
            </Text>
          </View>
        ) : (
          <FlatList
            data={conversations}
            renderItem={renderConversation}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.conversationsList}
          />
        )}
      </Animated.View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.neutral[50],
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: Colors.neutral[600],
  },
  header: {
    paddingTop: 20,
    paddingBottom: 20,
    paddingHorizontal: 20,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
  },
  content: {
    flex: 1,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.neutral[600],
    marginTop: 20,
    marginBottom: 10,
  },
  emptySubtitle: {
    fontSize: 14,
    color: Colors.neutral[500],
    textAlign: 'center',
    lineHeight: 20,
  },
  conversationsList: {
    padding: 20,
  },
  conversationItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    padding: 15,
    borderRadius: 15,
    marginBottom: 15,
    shadowColor: Colors.neutral[900],
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  conversationAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 15,
  },
  conversationInfo: {
    flex: 1,
  },
  conversationName: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.neutral[900],
    marginBottom: 4,
  },
  conversationLastMessage: {
    fontSize: 14,
    color: Colors.neutral[600],
  },
  conversationMeta: {
    alignItems: 'flex-end',
  },
  conversationTime: {
    fontSize: 12,
    color: Colors.neutral[500],
    marginBottom: 5,
  },
  unreadBadge: {
    backgroundColor: Colors.primary[500],
    borderRadius: 10,
    paddingHorizontal: 6,
    paddingVertical: 2,
    minWidth: 20,
    alignItems: 'center',
  },
  unreadCount: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  
  // Chat styles
  chatHeader: {
    paddingTop: 20,
    paddingBottom: 15,
    paddingHorizontal: 20,
  },
  chatHeaderContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  chatHeaderInfo: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 15,
  },
  chatHeaderAvatar: {
    width: 35,
    height: 35,
    borderRadius: 17.5,
    marginRight: 10,
  },
  chatHeaderName: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  chatHeaderStatus: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 12,
  },
  chatHeaderActions: {
    flexDirection: 'row',
    gap: 10,
  },
  headerActionButton: {
    width: 35,
    height: 35,
    borderRadius: 17.5,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  chatContent: {
    flex: 1,
  },
  messagesList: {
    flex: 1,
  },
  messagesContent: {
    padding: 20,
  },
  messageContainer: {
    flexDirection: 'row',
    marginBottom: 15,
    alignItems: 'flex-end',
  },
  ownMessage: {
    justifyContent: 'flex-end',
  },
  otherMessage: {
    justifyContent: 'flex-start',
  },
  messageAvatar: {
    width: 30,
    height: 30,
    borderRadius: 15,
    marginRight: 8,
  },
  messageBubble: {
    maxWidth: '75%',
    padding: 12,
    borderRadius: 18,
  },
  ownMessageBubble: {
    backgroundColor: Colors.primary[500],
    borderBottomRightRadius: 4,
  },
  otherMessageBubble: {
    backgroundColor: 'white',
    borderBottomLeftRadius: 4,
    shadowColor: Colors.neutral[900],
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  messageText: {
    fontSize: 16,
    lineHeight: 20,
  },
  ownMessageText: {
    color: 'white',
  },
  otherMessageText: {
    color: Colors.neutral[900],
  },
  fileMessage: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  audioMessage: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  fileName: {
    fontSize: 14,
    fontWeight: '500',
  },
  messageTime: {
    fontSize: 11,
    marginTop: 4,
  },
  ownMessageTime: {
    color: 'rgba(255,255,255,0.7)',
  },
  otherMessageTime: {
    color: Colors.neutral[500],
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    padding: 15,
    backgroundColor: 'white',
    borderTopWidth: 1,
    borderTopColor: Colors.neutral[200],
    gap: 10,
  },
  inputAction: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.neutral[100],
    alignItems: 'center',
    justifyContent: 'center',
  },
  textInputContainer: {
    flex: 1,
    backgroundColor: Colors.neutral[100],
    borderRadius: 20,
    paddingHorizontal: 15,
    paddingVertical: 10,
    maxHeight: 100,
  },
  textInput: {
    fontSize: 16,
    color: Colors.neutral[900],
    textAlignVertical: 'top',
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.primary[500],
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendButtonDisabled: {
    backgroundColor: Colors.neutral[300],
  },
});
