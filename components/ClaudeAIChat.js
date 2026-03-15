import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Animated,
  Dimensions,
  Modal,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import claudeAiService from '../services/claudeAiService';

const { width, height } = Dimensions.get('window');

export const ClaudeAIChat = ({ visible, onClose, user }) => {
  const [messages, setMessages] = useState([
    {
      id: 1,
      type: 'ai',
      text: `Hello ${user?.name || 'there'}! 👋 I'm Claude, your universal academic assistant. I can answer any question about science, technology, math, or anything else on your mind. How can I help you today?`,
      timestamp: new Date(),
    }
  ]);
  const [inputText, setInputText] = useState('');
  const [isThinking, setIsThinking] = useState(false);
  
  const scrollViewRef = useRef();
  const slideAnim = useRef(new Animated.Value(height)).current;
  const typingDots = useRef(new Animated.Value(0)).current;

  useEffect(() => {
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

  useEffect(() => {
    if (isThinking) {
      const animation = Animated.loop(
        Animated.sequence([
          Animated.timing(typingDots, { toValue: 1, duration: 600, useNativeDriver: true }),
          Animated.timing(typingDots, { toValue: 0, duration: 600, useNativeDriver: true }),
        ])
      );
      animation.start();
      return () => animation.stop();
    }
  }, [isThinking]);

  const sendMessage = async () => {
    if (!inputText.trim()) return;

    const userMsg = inputText.trim();
    const userMessage = {
      id: Date.now(),
      type: 'user',
      text: userMsg,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInputText('');
    setIsThinking(true);

    try {
      const response = await claudeAiService.generateResponse(userMsg, {
        userType: user?.userType || 'student',
        academicLevel: user?.academicLevel || '100'
      });

      const aiResponse = {
        id: Date.now() + 1,
        type: 'ai',
        text: response,
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, aiResponse]);
      
      if (user?.uid) {
        claudeAiService.logInteraction(user.uid, userMsg, response);
      }
    } catch (error) {
      console.error('Claude Chat Error:', error);
      const errorMsg = {
        id: Date.now() + 1,
        type: 'ai',
        text: "I'm having a bit of trouble connecting to my central brain. Could you try that again? 📡",
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setIsThinking(false);
    }
  };

  if (!visible) return null;

  return (
    <Modal visible={visible} transparent animationType="none">
      <View style={styles.overlay}>
        <Animated.View 
          style={[
            styles.container,
            { transform: [{ translateY: slideAnim }] }
          ]}
        >
          <BlurView intensity={120} tint="light" style={styles.blurContainer}>
            <LinearGradient
              colors={['#7C3AED', '#4F46E5']}
              style={styles.header}
            >
              <View style={styles.headerContent}>
                <View style={styles.aiLogo}>
                  <Ionicons name="sparkles" size={24} color="#fff" />
                </View>
                <View style={styles.headerText}>
                  <Text style={styles.headerTitle}>Claude Global AI</Text>
                  <Text style={styles.headerSubtitle}>Universal academic knowledge</Text>
                </View>
                <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                  <Ionicons name="close-circle" size={32} color="#fff" />
                </TouchableOpacity>
              </View>
            </LinearGradient>

            <ScrollView
              ref={scrollViewRef}
              style={styles.messagesContainer}
              contentContainerStyle={{ paddingVertical: 20 }}
              onContentSizeChange={() => scrollViewRef.current?.scrollToEnd()}
            >
              {messages.map((message) => (
                <View
                  key={message.id}
                  style={[
                    styles.messageWrapper,
                    message.type === 'user' ? styles.userMessageWrapper : styles.aiMessageWrapper
                  ]}
                >
                  <View
                    style={[
                      styles.message,
                      message.type === 'user' ? styles.userMessage : styles.aiMessage
                    ]}
                  >
                    {message.type === 'ai' && (
                      <View style={styles.aiMessageHeader}>
                        <Ionicons name="flash" size={14} color="#7C3AED" />
                        <Text style={styles.aiLabel}>CLAUDE-INTEL</Text>
                      </View>
                    )}
                    <Text style={[
                      styles.messageText,
                      message.type === 'user' ? styles.userMessageText : styles.aiMessageText
                    ]}>
                      {message.text}
                    </Text>
                    <Text style={[
                      styles.timestamp,
                      message.type === 'user' ? styles.userTimestamp : styles.aiTimestamp
                    ]}>
                      {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </Text>
                  </View>
                </View>
              ))}
              
              {isThinking && (
                <View style={styles.aiMessageWrapper}>
                  <View style={[styles.message, styles.aiMessage]}>
                    <View style={styles.thinkingContainer}>
                      <Animated.View style={[styles.thinkingDot, { opacity: typingDots }]} />
                      <Animated.View style={[styles.thinkingDot, { opacity: typingDots, marginLeft: 4 }]} />
                      <Animated.View style={[styles.thinkingDot, { opacity: typingDots, marginLeft: 4 }]} />
                      <Text style={styles.thinkingText}>Claude is processing...</Text>
                    </View>
                  </View>
                </View>
              )}
            </ScrollView>

            <KeyboardAvoidingView
              behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
              keyboardVerticalOffset={Platform.OS === 'ios' ? 20 : 0}
            >
              <View style={styles.inputArea}>
                <View style={styles.inputWrapper}>
                  <TextInput
                    style={styles.textInput}
                    value={inputText}
                    onChangeText={setInputText}
                    placeholder="Ask Claude anything..."
                    placeholderTextColor="#94A3B8"
                    multiline
                  />
                  <TouchableOpacity
                    style={[styles.sendButton, !inputText.trim() && styles.sendButtonDisabled]}
                    onPress={sendMessage}
                    disabled={!inputText.trim() || isThinking}
                  >
                    <Ionicons 
                      name="arrow-up" 
                      size={24} 
                      color="#fff" 
                    />
                  </TouchableOpacity>
                </View>
              </View>
            </KeyboardAvoidingView>
          </BlurView>
        </Animated.View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    justifyContent: 'flex-end',
  },
  container: {
    height: height * 0.85,
    width: width,
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    overflow: 'hidden',
    backgroundColor: '#fff',
  },
  blurContainer: {
    flex: 1,
  },
  header: {
    paddingTop: 20,
    paddingBottom: 20,
    paddingHorizontal: 20,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  aiLogo: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  headerText: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#fff',
    letterSpacing: 0.5,
  },
  headerSubtitle: {
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.8)',
    marginTop: 2,
  },
  closeButton: {
    padding: 5,
  },
  messagesContainer: {
    flex: 1,
    paddingHorizontal: 15,
  },
  messageWrapper: {
    marginBottom: 15,
  },
  userMessageWrapper: {
    alignItems: 'flex-end',
  },
  aiMessageWrapper: {
    alignItems: 'flex-start',
  },
  message: {
    maxWidth: '85%',
    padding: 15,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 2,
  },
  userMessage: {
    backgroundColor: '#7C3AED',
    borderBottomRightRadius: 4,
  },
  aiMessage: {
    backgroundColor: '#F8FAFC',
    borderBottomLeftRadius: 4,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  aiMessageHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  aiLabel: {
    fontSize: 10,
    fontWeight: '900',
    color: '#7C3AED',
    marginLeft: 5,
    letterSpacing: 1,
  },
  messageText: {
    fontSize: 16,
    lineHeight: 24,
  },
  userMessageText: {
    color: '#fff',
  },
  aiMessageText: {
    color: '#1E293B',
  },
  timestamp: {
    fontSize: 10,
    marginTop: 8,
  },
  userTimestamp: {
    color: 'rgba(255, 255, 255, 0.7)',
    alignSelf: 'flex-end',
  },
  aiTimestamp: {
    color: '#94A3B8',
    alignSelf: 'flex-start',
  },
  thinkingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 5,
  },
  thinkingDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#7C3AED',
  },
  thinkingText: {
    marginLeft: 10,
    fontSize: 14,
    color: '#64748B',
    fontStyle: 'italic',
  },
  inputArea: {
    padding: 20,
    paddingBottom: Platform.OS === 'ios' ? 40 : 20,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderRadius: 30,
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  textInput: {
    flex: 1,
    paddingHorizontal: 10,
    fontSize: 16,
    color: '#1E293B',
    maxHeight: 120,
  },
  sendButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#7C3AED',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#7C3AED',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  sendButtonDisabled: {
    backgroundColor: '#CBD5E1',
    shadowOpacity: 0,
  },
});

export default ClaudeAIChat;
