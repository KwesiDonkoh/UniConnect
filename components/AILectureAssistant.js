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
  Modal,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import claudeAiService from '../services/claudeAiService';

const { width, height } = Dimensions.get('window');

export const AILectureAssistant = ({ visible, onClose, course, user }) => {
  const [messages, setMessages] = useState([
    {
      id: 1,
      type: 'ai',
      text: `Hello Professor ${user?.name || 'Smith'}! 👨‍🏫✨ I'm your Claude-powered AI Lecture Assistant, ready to help you create amazing ${course?.name || 'Computer Science'} lectures! I can answer any academic question and assist with deep content generation.`,
      timestamp: new Date(),
    }
  ]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [selectedMode, setSelectedMode] = useState('planning'); // planning, content, engagement, assessment
  
  const scrollViewRef = useRef();
  const slideAnim = useRef(new Animated.Value(height)).current;
  const typingDots = useRef(new Animated.Value(0)).current;

  const assistantModes = [
    {
      id: 'planning',
      name: 'Lesson Planning',
      icon: 'calendar-outline',
      color: '#667eea',
      description: 'Create structured lesson plans'
    },
    {
      id: 'content',
      name: 'Content Generation',
      icon: 'document-text-outline',
      color: '#4CAF50',
      description: 'Generate slides, examples, exercises'
    },
    {
      id: 'engagement',
      name: 'Student Engagement',
      icon: 'people-outline',
      color: '#FF9800',
      description: 'Interactive activities and discussions'
    },
    {
      id: 'assessment',
      name: 'Assessment Tools',
      icon: 'checkmark-circle-outline',
      color: '#9C27B0',
      description: 'Quizzes, assignments, rubrics'
    }
  ];

  const quickActions = [
    { id: 1, text: "Create lesson plan", icon: "document", mode: "planning" },
    { id: 2, text: "Generate quiz questions", icon: "help-circle", mode: "assessment" },
    { id: 3, text: "Suggest activities", icon: "flash", mode: "engagement" },
    { id: 4, text: "Create slides outline", icon: "albums", mode: "content" },
    { id: 5, text: "Student feedback analysis", icon: "analytics", mode: "engagement" },
    { id: 6, text: "Assignment rubric", icon: "list", mode: "assessment" },
  ];

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
    if (isTyping) {
      const animation = Animated.loop(
        Animated.sequence([
          Animated.timing(typingDots, { toValue: 1, duration: 600, useNativeDriver: true }),
          Animated.timing(typingDots, { toValue: 0, duration: 600, useNativeDriver: true }),
        ])
      );
      animation.start();
      return () => animation.stop();
    }
  }, [isTyping]);

  const aiResponses = {
    planning: [
      "Let me create a comprehensive lesson plan for you! 📋",
      "I'll structure this lesson with clear objectives and activities:",
      "Here's a well-organized lesson plan following pedagogical best practices:",
    ],
    content: [
      "I'll generate engaging content for your lecture! 📚",
      "Let me create some compelling examples and explanations:",
      "Here's some rich content material for your students:",
    ],
    engagement: [
      "Let's make this lesson interactive and engaging! 🎯",
      "Here are some proven strategies to boost student participation:",
      "I'll suggest activities that will captivate your students:",
    ],
    assessment: [
      "I'll create comprehensive assessment materials! ✅",
      "Here are some well-designed evaluation tools:",
      "Let me generate assessment items with clear rubrics:",
    ],
    default: [
      "That's an excellent teaching question! Let me help you with that... 🤔",
      "Based on pedagogical research and best practices, here's my recommendation:",
      "Great question, Professor! Here's how I can assist you:",
    ]
  };

  const getAIResponse = (userMessage, mode) => {
    const message = userMessage.toLowerCase();
    
    switch (mode) {
      case 'planning':
        return generateLessonPlan(userMessage);
      case 'content':
        return generateContent(userMessage);
      case 'engagement':
        return generateEngagementStrategies(userMessage);
      case 'assessment':
        return generateAssessment(userMessage);
      default:
        return generateDefaultResponse(userMessage);
    }
  };

  const generateLessonPlan = (topic) => {
    return `${aiResponses.planning[Math.floor(Math.random() * aiResponses.planning.length)]}

📚 **${course?.name || 'Course'} Lesson Plan: ${topic}**

🎯 **Learning Objectives:**
• Students will understand the core concepts of ${topic}
• Students will be able to apply ${topic} in practical scenarios
• Students will analyze and evaluate different approaches

⏰ **Lesson Structure (50 minutes):**

**Opening (5 min)**
• Quick review of previous concepts
• Introduce today's topic with real-world connection

**Main Content (30 min)**
• **Explanation Phase (10 min)**: Core concept introduction
• **Demonstration Phase (10 min)**: Live examples and walkthroughs  
• **Practice Phase (10 min)**: Guided student activities

**Interactive Segment (10 min)**
• Think-pair-share activity
• Q&A and clarification session
• Quick formative assessment

**Closing (5 min)**
• Recap key points
• Preview next lesson
• Assignment/homework instructions

📋 **Materials Needed:**
• Presentation slides
• Handout materials
• Interactive polling tool
• Whiteboard/markers

💡 **Teaching Tips:**
• Use the "chunking" method - break complex topics into smaller parts
• Incorporate wait time after questions (3-5 seconds)
• Use varied questioning techniques (factual, analytical, hypothetical)

Would you like me to elaborate on any section or create specific materials? 🚀`;
  };

  const generateContent = (topic) => {
    return `${aiResponses.content[Math.floor(Math.random() * aiResponses.content.length)]}

📖 **Content Package: ${topic}**

**🎯 Slide Outline:**

**Slide 1: Hook & Motivation**
• "Why does ${topic} matter in the real world?"
• Industry statistics or compelling case study
• Learning journey preview

**Slide 2-3: Foundation Concepts**
• Clear definitions with visual aids
• Building blocks approach
• Common misconceptions addressed

**Slide 4-6: Deep Dive Content**
• Step-by-step explanations
• Multiple examples (simple → complex)
• Interactive elements and checkpoints

**Slide 7-8: Real-World Applications**
• Industry use cases
• Current trends and innovations
• Career connections

**💡 Interactive Examples:**

**Example 1: Basic Scenario**
"Imagine you're a software developer at Netflix..."
[Detailed walkthrough with visuals]

**Example 2: Advanced Application**  
"Now let's see how Google uses this concept..."
[Complex real-world implementation]

**🔥 Engagement Boosters:**
• **Kahoot Quiz**: 5 quick questions mid-lecture
• **Think-Pair-Share**: "How would you apply this in your future career?"
• **Live Demo**: Interactive coding/problem-solving session

**📚 Additional Resources:**
• Recommended readings
• Video tutorials
• Practice exercises
• Industry articles

**🎨 Visual Aids Suggestions:**
• Infographics showing process flow
• Before/after comparison charts
• Interactive diagrams
• Code snippets with syntax highlighting

Need me to create specific slides or expand on any section? ✨`;
  };

  const generateEngagementStrategies = (context) => {
    return `${aiResponses.engagement[Math.floor(Math.random() * aiResponses.engagement.length)]}

🎯 **Student Engagement Strategies for ${course?.name || 'Your Course'}**

**🚀 High-Impact Activities:**

**1. The "Expert Jigsaw" Method**
• Divide class into expert groups (5-6 students each)
• Each group becomes "experts" on one aspect of the topic
• Groups then teach other groups their expertise
• **Result**: 95% active participation rate!

**2. Real-Time Problem Solving**
• Present a current industry challenge
• Students work in teams to propose solutions
• Use breakout rooms for collaboration
• Present solutions to class for peer evaluation

**3. "Flip the Classroom" Moments**
• Students become the teacher for 5 minutes
• They explain concepts to classmates
• Builds confidence and deeper understanding
• Creates memorable learning experiences

**📱 Technology Integration:**

**Interactive Polling (Every 10-15 minutes)**
• "What's your confidence level with this concept?" (1-5 scale)
• Multiple choice comprehension checks
• "Predict what happens next" scenarios

**Digital Collaboration Tools**
• Shared Google Docs for group brainstorming
• Miro boards for visual collaboration
• Slack/Discord for ongoing discussions

**🎮 Gamification Elements:**

**Knowledge Leaderboard**
• Points for participation, correct answers, helping peers
• Weekly/monthly recognition
• Friendly competition between groups

**Achievement Badges**
• "Question Master" - asks thoughtful questions
• "Helper Hero" - assists struggling classmates  
• "Innovation Award" - creative problem solutions

**💬 Discussion Techniques:**

**The "Popcorn Method"**
• One student shares, then "pops" to another student
• Builds on previous comments
• Creates dynamic conversation flow

**Devil's Advocate Discussions**
• Assign students to argue different perspectives
• Develops critical thinking skills
• Makes abstract concepts more concrete

**📊 Engagement Metrics to Track:**
• Participation frequency
• Question quality
• Peer interaction levels
• Assignment completion rates

**🔥 Pro Tips:**
• Learn every student's name by week 3
• Use "wait time" - pause 3-5 seconds after questions
• Move around the classroom while teaching
• Make eye contact with different students regularly

Which strategy would you like to implement first? I can provide detailed implementation guides! 🌟`;
  };

  const generateAssessment = (topic) => {
    return `${aiResponses.assessment[Math.floor(Math.random() * aiResponses.assessment.length)]}

✅ **Comprehensive Assessment Package: ${topic}**

**🧠 Formative Assessment (During Learning):**

**Quick Pulse Checks (2-3 minutes each)**
1. **Exit Ticket Questions:**
   • What's one thing that clicked for you today?
   • What's still confusing?
   • Rate your understanding: 1-5 scale

2. **One Minute Papers:**
   • "Explain ${topic} to a friend in 60 seconds"
   • Identifies knowledge gaps immediately

3. **Think-Pair-Share Assessment:**
   • Individual reflection → Pair discussion → Class sharing
   • Builds understanding while assessing

**📝 Summative Assessment Options:**

**Option A: Traditional Quiz (20 points)**
*Multiple Choice (10 points)*
1. Which of the following best describes ${topic}?
   a) [Correct answer with clear reasoning]
   b) [Common misconception]
   c) [Plausible distractor]
   d) [Obviously incorrect]

*Short Answer (10 points)*
2. Explain how ${topic} applies to [real-world scenario]
   **Rubric**: 
   - Excellent (9-10): Clear explanation with examples
   - Good (7-8): Mostly correct with minor gaps
   - Needs Work (5-6): Basic understanding shown
   - Incomplete (0-4): Major misconceptions

**Option B: Project-Based Assessment**
*Create a mini-presentation explaining ${topic} to high school students*
**Rubric Categories:**
- **Content Accuracy (40%)**
- **Clarity of Explanation (30%)**  
- **Creativity & Engagement (20%)**
- **Organization & Flow (10%)**

**Option C: Peer Assessment Activity**
*Students create quiz questions for each other*
- Promotes deeper learning
- Develops critical thinking
- Builds community

**🎯 Advanced Assessment Strategies:**

**Authentic Assessment**
• Real industry problems to solve
• Portfolio development
• Reflection journals
• Self-assessment components

**Differentiated Assessment**
• Multiple ways to demonstrate learning
• Choice in assessment format
• Accommodations for different learning styles

**📊 Grading Efficiency Tools:**

**AI-Assisted Grading (for objective items)**
• Automated scoring for multiple choice
• Pattern recognition for common errors
• Time savings: 60-80% reduction

**Rubric-Based Grading**
• Clear criteria for each performance level
• Consistent evaluation across students
• Faster feedback delivery

**Audio Feedback**
• Record 2-3 minute voice messages
• More personal than written comments
• Students prefer audio feedback 3:1

**🔄 Continuous Improvement:**

**Data Collection:**
• Track which questions students struggle with most
• Identify patterns in misconceptions
• Adjust teaching based on results

**Student Feedback Integration:**
• "How did this assessment help your learning?"
• "What would make this assessment better?"
• Iterate and improve continuously

**⚡ Quick Implementation Tips:**
• Start with one new assessment type per semester
• Use technology to reduce grading time
• Focus on feedback quality over quantity
• Make assessment criteria transparent

Would you like me to create specific questions or detailed rubrics for any assessment type? 🚀`;
  };

  const generateDefaultResponse = (userMessage) => {
    return `${aiResponses.default[Math.floor(Math.random() * aiResponses.default.length)]}

Thank you for that thoughtful question about "${userMessage}"! 

🎓 **My Analysis:**
Based on current educational research and pedagogical best practices, here's how I can help you address this...

**📚 Teaching Perspective:**
This connects to several important concepts in effective instruction:
• Student-centered learning approaches
• Active learning methodologies  
• Assessment for learning principles

**💡 Practical Recommendations:**
• Consider implementing scaffolded learning techniques
• Use formative assessment to guide instruction
• Incorporate collaborative learning opportunities

**🔄 Next Steps:**
Would you like me to:
• Create specific materials for this topic?
• Suggest detailed implementation strategies?
• Develop assessment tools?
• Provide research-backed alternatives?

I'm here to make your teaching more effective and engaging! What aspect would you like to explore further? ✨`;
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
    setIsTyping(true);

    try {
      const response = await claudeAiService.generateResponse(inputText.trim(), {
        userType: 'lecturer',
        course: course,
        mode: selectedMode
      });

      const aiResponse = {
        id: Date.now() + 1,
        type: 'ai',
        text: response,
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, aiResponse]);
      
      if (user?.uid) {
        claudeAiService.logInteraction(user.uid, inputText.trim(), response);
      }
    } catch (error) {
      console.error('Claude AI Error:', error);
      const errorMsg = {
        id: Date.now() + 1,
        type: 'ai',
        text: "I apologize, Professor. I encountered a momentary connection issue with the central knowledge core. Please try your request again. 📡",
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleQuickAction = (action) => {
    const actionTexts = {
      "Create lesson plan": `Create a detailed lesson plan for ${course?.name || 'my course'} covering the fundamentals`,
      "Generate quiz questions": `Generate 10 comprehensive quiz questions for ${course?.name || 'my course'} with detailed explanations`,
      "Suggest activities": `Suggest 5 interactive classroom activities that will engage students in ${course?.name || 'my course'}`,
      "Create slides outline": `Create a detailed slide outline for a 50-minute lecture on ${course?.name || 'course topics'}`,
      "Student feedback analysis": `How can I analyze and improve based on student feedback in ${course?.name || 'my course'}?`,
      "Assignment rubric": `Create a comprehensive grading rubric for ${course?.name || 'course'} assignments`
    };
    
    setInputText(actionTexts[action.text]);
    setSelectedMode(action.mode);
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
          <BlurView intensity={100} style={styles.blurContainer}>
            {/* Header */}
            <LinearGradient
              colors={['#667eea', '#764ba2']}
              style={styles.header}
            >
              <View style={styles.headerContent}>
                <View style={styles.aiAvatar}>
                  <Ionicons name="school" size={24} color="#fff" />
                </View>
                <View style={styles.headerText}>
                  <Text style={styles.headerTitle}>Claude Lecture Assistant</Text>
                  <Text style={styles.headerSubtitle}>
                    {isTyping ? 'Synthesizing knowledge...' : 'Premium AI Assistance Enabled'}
                  </Text>
                </View>
                <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                  <Ionicons name="close" size={24} color="#fff" />
                </TouchableOpacity>
              </View>
            </LinearGradient>

            {/* Mode Selector */}
            <View style={styles.modeSelector}>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                {assistantModes.map((mode) => (
                  <TouchableOpacity
                    key={mode.id}
                    style={[
                      styles.modeButton,
                      selectedMode === mode.id && { backgroundColor: mode.color }
                    ]}
                    onPress={() => setSelectedMode(mode.id)}
                  >
                    <Ionicons 
                      name={mode.icon} 
                      size={16} 
                      color={selectedMode === mode.id ? "#fff" : mode.color} 
                    />
                    <Text style={[
                      styles.modeButtonText,
                      selectedMode === mode.id && { color: "#fff" }
                    ]}>
                      {mode.name}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>

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
                  onPress={() => handleQuickAction(action)}
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
                        <Ionicons name="school" size={16} color="#667eea" />
                        <Text style={styles.aiLabel}>Claude AI Assistant</Text>
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
              
              {isTyping && (
                <View style={styles.aiMessageWrapper}>
                  <View style={[styles.message, styles.aiMessage]}>
                    <View style={styles.aiMessageHeader}>
                      <Ionicons name="school" size={16} color="#667eea" />
                      <Text style={styles.aiLabel}>Claude AI Assistant</Text>
                    </View>
                    <View style={styles.thinkingContainer}>
                      <Animated.View style={[styles.thinkingDot, { opacity: typingDots }]} />
                      <Animated.View style={[styles.thinkingDot, { opacity: typingDots }]} />
                      <Animated.View style={[styles.thinkingDot, { opacity: typingDots }]} />
                      <Text style={styles.thinkingText}>Preparing teaching materials...</Text>
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
                  placeholder="Ask me about lesson planning, content creation, student engagement..."
                  placeholderTextColor="#999"
                  multiline
                  maxLength={500}
                />
                <TouchableOpacity
                  style={[styles.sendButton, !inputText.trim() && styles.sendButtonDisabled]}
                  onPress={sendMessage}
                  disabled={!inputText.trim() || isTyping}
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
    </Modal>
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
  modeSelector: {
    paddingVertical: 15,
    paddingHorizontal: 20,
  },
  modeButton: {
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
  modeButtonText: {
    fontSize: 12,
    color: '#667eea',
    marginLeft: 6,
    fontWeight: '500',
  },
  quickActions: {
    paddingVertical: 10,
    paddingHorizontal: 20,
  },
  quickActionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(102, 126, 234, 0.1)',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 18,
    marginRight: 10,
    borderWidth: 1,
    borderColor: 'rgba(102, 126, 234, 0.2)',
  },
  quickActionText: {
    fontSize: 12,
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

export default AILectureAssistant;
