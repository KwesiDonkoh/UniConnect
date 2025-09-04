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
  Alert,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';

const { width, height } = Dimensions.get('window');

export const AIStudyAssistant = ({ visible, onClose, course }) => {
  const [messages, setMessages] = useState([
    {
      id: 1,
      type: 'ai',
      text: `Hi! I'm your AI Study Assistant 🤖✨ I'm here to help you master ${course?.name || 'your studies'}! Ask me anything - from explaining complex concepts to creating practice questions!`,
      timestamp: new Date(),
    }
  ]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
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

  const aiResponses = {
    explain: [
      "Let me break that down for you in simple terms! 📚",
      "Great question! Here's how I'd explain it step by step:",
      "Think of it this way - imagine you're explaining it to a friend:",
    ],
    quiz: [
      "I'll create some practice questions for you! 🧠💪",
      "Let's test your knowledge with these questions:",
      "Here are some quiz questions to help you study:",
    ],
    summarize: [
      "Here's a concise summary of the key points: 📝",
      "Let me highlight the most important concepts:",
      "Here's what you need to remember:",
    ],
    help: [
      "I'm here to help! Here's what I can do for you: 🚀",
      "I can assist you with many things! Let me show you:",
      "Here are some ways I can boost your learning:",
    ],
    default: [
      "That's an interesting question! Let me think about it... 🤔",
      "I love helping with that topic! Here's my take:",
      "Great question! Based on your course material:",
    ]
  };

  const getAIResponse = (userMessage) => {
    const message = userMessage.toLowerCase();
    
    if (message.includes('explain') || message.includes('what is') || message.includes('how does')) {
      return generateExplanation(userMessage);
    } else if (message.includes('quiz') || message.includes('test') || message.includes('question')) {
      return generateQuiz(userMessage);
    } else if (message.includes('summarize') || message.includes('summary') || message.includes('key points')) {
      return generateSummary(userMessage);
    } else if (message.includes('help') || message.includes('what can you do')) {
      return getHelpResponse();
    } else {
      return generateDefaultResponse(userMessage);
    }
  };

  const generateExplanation = (topic) => {
    const explanations = [
      `${aiResponses.explain[Math.floor(Math.random() * aiResponses.explain.length)]}

🎯 **Core Concept**: This topic is fundamental to understanding ${course?.name || 'your subject'}.

📖 **Simple Explanation**: 
Think of this like building blocks - each concept builds on the previous one. 

🔍 **Key Points**:
• Main idea: [Core principle]
• Why it matters: [Practical application]
• How to remember: [Memory technique]

💡 **Study Tip**: Try explaining this concept to someone else - it's the best way to test your understanding!

Need me to dive deeper into any specific part? 🤓`,
      
      `Let me make this super clear! ✨

🧠 **The Big Picture**: This concept is like the foundation of a house - everything else builds on it.

📚 **Step-by-Step Breakdown**:
1. First, understand the basic definition
2. Then, see how it connects to other concepts
3. Finally, apply it to real-world examples

🎨 **Visual Learning**: Imagine this as... [analogy]

🏆 **Pro Tip**: Create a mind map connecting this to other topics you've learned!`
    ];
    
    return explanations[Math.floor(Math.random() * explanations.length)];
  };

  const generateQuiz = (topic) => {
    const quizzes = [
      `${aiResponses.quiz[Math.floor(Math.random() * aiResponses.quiz.length)]}

🎯 **Practice Questions for ${course?.name || 'Your Course'}:**

**Question 1** (Multiple Choice):
Which of the following best describes...?
A) Option A
B) Option B ✅
C) Option C
D) Option D

**Question 2** (True/False):
The statement "..." is true. 
Answer: True ✅

**Question 3** (Short Answer):
Explain the main difference between...

💡 **Study Strategy**: Answer these, then I can provide detailed explanations for each!

Want more questions on a specific topic? Just ask! 🚀`,

      `Time for a knowledge check! 🧠⚡

**🎮 Interactive Quiz Mode Activated!**

**Level 1 Question**:
What is the primary function of...?

**Hint**: Think about what we discussed earlier about core concepts! 💭

**Quick Fire Round** (30 seconds each):
1. Define: [Term]
2. Compare: [Concept A] vs [Concept B]  
3. Apply: How would you use this in...?

🏆 **Bonus Challenge**: Create your own question about this topic!`
    ];
    
    return quizzes[Math.floor(Math.random() * quizzes.length)];
  };

  const generateSummary = (topic) => {
    return `${aiResponses.summarize[Math.floor(Math.random() * aiResponses.summarize.length)]}

📋 **Key Takeaways from ${course?.name || 'Your Study Material'}:**

🎯 **Main Concepts** (Must Know):
• Concept 1: Core definition and importance
• Concept 2: How it relates to practical applications
• Concept 3: Common misconceptions to avoid

⚡ **Quick Review Points**:
✅ Remember the 3 main principles
✅ Practice with real examples
✅ Connect to previous topics

🧠 **Memory Palace Technique**:
Associate each concept with a familiar location in your mind!

📊 **Study Progress**: You're building solid foundations! Keep going! 💪

Need me to expand on any of these points? 🤔`;
  };

  const getHelpResponse = () => {
    return `${aiResponses.help[Math.floor(Math.random() * aiResponses.help.length)]}

🤖 **Your AI Study Companion Can:**

📚 **Learning Support**:
• Explain complex concepts in simple terms
• Create custom quizzes and practice tests  
• Summarize long study materials
• Generate study guides and notes

🧠 **Study Strategies**:
• Suggest memory techniques and mnemonics
• Create personalized study schedules
• Recommend learning approaches for your style
• Track your progress and weak areas

💡 **Interactive Features**:
• Real-time Q&A sessions
• Step-by-step problem solving
• Concept connections and mind mapping
• Exam preparation strategies

🎯 **Smart Assistance**:
• Adaptive questioning based on your level
• Personalized feedback and encouragement
• Study buddy conversations
• Motivation and goal setting

Just type your question or say things like:
• "Explain [topic]"
• "Quiz me on [subject]"  
• "Summarize [chapter]"
• "Help me understand..."

What would you like to explore first? 🚀✨`;
  };

  const generateDefaultResponse = (userMessage) => {
    const responses = [
      `${aiResponses.default[Math.floor(Math.random() * aiResponses.default.length)]}

That's a thoughtful question about "${userMessage}"! 

🎓 **My Analysis**:
Based on your course content and learning objectives, here's what I think...

💡 **Key Insights**:
• This connects to several important concepts we've covered
• It's particularly relevant for your upcoming assessments
• Understanding this will help with more advanced topics

🚀 **Next Steps**:
Would you like me to:
• Break this down further?
• Create practice questions?
• Find related topics to explore?

I'm here to make your learning journey amazing! ✨`,

      `Excellent question! I can see you're really thinking deeply about this! 🤓

🎯 **Let me help you with that...**

This topic is super important for ${course?.name || 'your studies'} because it forms the foundation for understanding more complex concepts later.

🧠 **Think of it this way**:
[Provides contextual explanation based on the question]

📈 **Your Learning Path**:
You're asking great questions - this shows you're developing critical thinking skills!

Want to dive deeper or move to a related topic? I'm excited to keep learning with you! 🚀`
    ];
    
    return responses[Math.floor(Math.random() * responses.length)];
  };

  const sendMessage = async () => {
    if (!inputText.trim()) return;

    const userMessage = {
      id: Date.now(),
      type: 'user',
      text: inputText.trim(),
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInputText('');
    setIsThinking(true);

    // Simulate AI thinking time
    setTimeout(() => {
      const aiResponse = {
        id: Date.now() + 1,
        type: 'ai',
        text: getAIResponse(inputText.trim()),
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, aiResponse]);
      setIsThinking(false);
    }, 1500 + Math.random() * 1000); // Random delay for realism
  };

  const quickActions = [
    { id: 1, text: "Explain this concept", icon: "bulb", action: "explain" },
    { id: 2, text: "Quiz me", icon: "help-circle", action: "quiz" },
    { id: 3, text: "Summarize notes", icon: "document-text", action: "summarize" },
    { id: 4, text: "Study tips", icon: "star", action: "tips" },
  ];

  const handleQuickAction = (action) => {
    const actionTexts = {
      explain: "Can you explain the main concepts from today's lecture?",
      quiz: "Create a quiz to test my understanding",
      summarize: "Summarize the key points I need to remember",
      tips: "Give me some study tips for better learning"
    };
    
    setInputText(actionTexts[action]);
  };

  if (!visible) return null;

  return (
    <View style={styles.overlay}>
      <Animated.View 
        style={[
          styles.container,
          { transform: [{ translateY: slideAnim }] }
        ]}
      >
        <BlurView intensity={100} style={styles.blurContainer}>
          {/* Header */}
          <LinearGradient
            colors={['#667eea', '#764ba2']}
            style={styles.header}
          >
            <View style={styles.headerContent}>
              <View style={styles.aiAvatar}>
                <Ionicons name="sparkles" size={24} color="#fff" />
              </View>
              <View style={styles.headerText}>
                <Text style={styles.headerTitle}>AI Study Assistant</Text>
                <Text style={styles.headerSubtitle}>
                  {isThinking ? 'Thinking...' : 'Ready to help you learn!'}
                </Text>
              </View>
              <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                <Ionicons name="close" size={24} color="#fff" />
              </TouchableOpacity>
            </View>
          </LinearGradient>

          {/* Quick Actions */}
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            style={styles.quickActions}
          >
            {quickActions.map((action) => (
              <TouchableOpacity
                key={action.id}
                style={styles.quickActionButton}
                onPress={() => handleQuickAction(action.action)}
              >
                <Ionicons name={action.icon} size={16} color="#667eea" />
                <Text style={styles.quickActionText}>{action.text}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          {/* Messages */}
          <ScrollView
            ref={scrollViewRef}
            style={styles.messagesContainer}
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
                      <Ionicons name="sparkles" size={16} color="#667eea" />
                      <Text style={styles.aiLabel}>AI Assistant</Text>
                    </View>
                  )}
                  <Text style={[
                    styles.messageText,
                    message.type === 'user' ? styles.userMessageText : styles.aiMessageText
                  ]}>
                    {message.text}
                  </Text>
                  <Text style={styles.timestamp}>
                    {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </Text>
                </View>
              </View>
            ))}
            
            {isThinking && (
              <View style={styles.aiMessageWrapper}>
                <View style={[styles.message, styles.aiMessage]}>
                  <View style={styles.aiMessageHeader}>
                    <Ionicons name="sparkles" size={16} color="#667eea" />
                    <Text style={styles.aiLabel}>AI Assistant</Text>
                  </View>
                  <View style={styles.thinkingContainer}>
                    <Animated.View style={[styles.thinkingDot, { opacity: typingDots }]} />
                    <Animated.View style={[styles.thinkingDot, { opacity: typingDots }]} />
                    <Animated.View style={[styles.thinkingDot, { opacity: typingDots }]} />
                    <Text style={styles.thinkingText}>AI is thinking...</Text>
                  </View>
                </View>
              </View>
            )}
          </ScrollView>

          {/* Input Area */}
          <View style={styles.inputContainer}>
            <View style={styles.inputWrapper}>
              <TextInput
                style={styles.textInput}
                value={inputText}
                onChangeText={setInputText}
                placeholder="Ask me anything about your studies..."
                placeholderTextColor="#999"
                multiline
                maxLength={500}
              />
              <TouchableOpacity
                style={[styles.sendButton, !inputText.trim() && styles.sendButtonDisabled]}
                onPress={sendMessage}
                disabled={!inputText.trim() || isThinking}
              >
                <Ionicons 
                  name="send" 
                  size={20} 
                  color={inputText.trim() ? "#fff" : "#ccc"} 
                />
              </TouchableOpacity>
            </View>
          </View>
        </BlurView>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    zIndex: 1000,
  },
  container: {
    flex: 1,
    marginTop: 50,
  },
  blurContainer: {
    flex: 1,
    borderTopLeftRadius: 25,
    borderTopRightRadius: 25,
    overflow: 'hidden',
  },
  header: {
    paddingTop: 20,
    paddingBottom: 15,
    paddingHorizontal: 20,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  aiAvatar: {
    width: 45,
    height: 45,
    borderRadius: 22.5,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  headerText: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
  },
  headerSubtitle: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
    marginTop: 2,
  },
  closeButton: {
    padding: 8,
  },
  quickActions: {
    paddingVertical: 15,
    paddingHorizontal: 20,
  },
  quickActionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(102, 126, 234, 0.1)',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    marginRight: 12,
    borderWidth: 1,
    borderColor: 'rgba(102, 126, 234, 0.3)',
  },
  quickActionText: {
    fontSize: 13,
    color: '#667eea',
    marginLeft: 6,
    fontWeight: '500',
  },
  messagesContainer: {
    flex: 1,
    paddingHorizontal: 20,
  },
  messageWrapper: {
    marginVertical: 8,
  },
  userMessageWrapper: {
    alignItems: 'flex-end',
  },
  aiMessageWrapper: {
    alignItems: 'flex-start',
  },
  message: {
    maxWidth: '85%',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 20,
  },
  userMessage: {
    backgroundColor: '#667eea',
    borderBottomRightRadius: 8,
  },
  aiMessage: {
    backgroundColor: '#f8f9fa',
    borderBottomLeftRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(102, 126, 234, 0.1)',
  },
  aiMessageHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  aiLabel: {
    fontSize: 12,
    color: '#667eea',
    fontWeight: '600',
    marginLeft: 4,
  },
  messageText: {
    fontSize: 15,
    lineHeight: 20,
  },
  userMessageText: {
    color: '#fff',
  },
  aiMessageText: {
    color: '#333',
  },
  timestamp: {
    fontSize: 11,
    color: 'rgba(0, 0, 0, 0.5)',
    marginTop: 6,
    alignSelf: 'flex-end',
  },
  thinkingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  thinkingDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#667eea',
    marginRight: 4,
  },
  thinkingText: {
    fontSize: 13,
    color: '#667eea',
    fontStyle: 'italic',
    marginLeft: 8,
  },
  inputContainer: {
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: 'rgba(0, 0, 0, 0.1)',
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    backgroundColor: '#f8f9fa',
    borderRadius: 25,
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: 'rgba(102, 126, 234, 0.2)',
  },
  textInput: {
    flex: 1,
    fontSize: 16,
    color: '#333',
    maxHeight: 100,
    paddingRight: 10,
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#667eea',
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendButtonDisabled: {
    backgroundColor: '#ccc',
  },
});

export default AIStudyAssistant;
