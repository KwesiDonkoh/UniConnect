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

const { width, height } = Dimensions.get('window');

export const SmartNoteTaking = ({ visible, onClose, course }) => {
  const [noteTitle, setNoteTitle] = useState('');
  const [noteContent, setNoteContent] = useState('');
  const [isAIProcessing, setIsAIProcessing] = useState(false);
  const [aiSuggestions, setAiSuggestions] = useState([]);
  const [summary, setSummary] = useState('');
  const [keyPoints, setKeyPoints] = useState([]);
  const [noteStyle, setNoteStyle] = useState('standard'); // standard, outline, mindmap
  const [autoSave, setAutoSave] = useState(true);
  const [wordCount, setWordCount] = useState(0);
  
  const slideAnim = useRef(new Animated.Value(height)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const textInputRef = useRef(null);

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
    // Auto-save functionality
    if (autoSave && (noteTitle || noteContent)) {
      const saveTimer = setTimeout(() => {
        saveNote();
      }, 2000);
      return () => clearTimeout(saveTimer);
    }
  }, [noteTitle, noteContent, autoSave]);

  useEffect(() => {
    // Update word count
    const words = noteContent.trim().split(/\s+/).filter(word => word.length > 0);
    setWordCount(words.length);
  }, [noteContent]);

  const saveNote = () => {
    // In real implementation, save to database
    console.log('Auto-saving note...');
  };

  const generateAISummary = async () => {
    if (!noteContent.trim()) {
      Alert.alert('Empty Note', 'Please write some content first!');
      return;
    }

    setIsAIProcessing(true);
    
    // Simulate AI processing
    setTimeout(() => {
      const mockSummary = `**AI Summary of "${noteTitle || 'Your Notes'}"**

📋 **Main Topic**: ${course?.name || 'Study Material'}

🎯 **Key Concepts**:
• Core principles and definitions covered
• Important relationships between concepts  
• Practical applications and examples
• Critical points for exam preparation

💡 **Study Recommendations**:
• Review highlighted sections for better understanding
• Create flashcards for key terms
• Practice with related problems
• Connect to previous lecture materials

📊 **Completeness**: Your notes cover the essential points well! Consider adding more examples for complex topics.`;

      const mockKeyPoints = [
        'Main concept definition and importance',
        'Three key principles to remember',
        'Practical application examples',
        'Common mistakes to avoid',
        'Connection to previous topics'
      ];

      const mockSuggestions = [
        'Add more examples for complex concepts',
        'Include diagrams or visual aids',
        'Create practice questions',
        'Link to related course materials'
      ];

      setSummary(mockSummary);
      setKeyPoints(mockKeyPoints);
      setAiSuggestions(mockSuggestions);
      setIsAIProcessing(false);

      // Pulse animation for AI completion
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1.2, duration: 200, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 1, duration: 200, useNativeDriver: true }),
      ]).start();
    }, 2000);
  };

  const formatText = (format) => {
    const selection = textInputRef.current?.selection;
    if (!selection) return;

    let formattedText = noteContent;
    const { start, end } = selection;
    const selectedText = noteContent.substring(start, end);
    
    let replacement = selectedText;
    
    switch (format) {
      case 'bold':
        replacement = `**${selectedText}**`;
        break;
      case 'italic':
        replacement = `*${selectedText}*`;
        break;
      case 'highlight':
        replacement = `===${selectedText}===`;
        break;
      case 'bullet':
        replacement = `• ${selectedText}`;
        break;
    }
    
    const newText = formattedText.substring(0, start) + replacement + formattedText.substring(end);
    setNoteContent(newText);
  };

  const insertTemplate = (template) => {
    let templateText = '';
    
    switch (template) {
      case 'outline':
        templateText = `# ${course?.name || 'Course'} Notes

## Main Topic

### Key Concepts
- Concept 1
- Concept 2
- Concept 3

### Important Details
- Detail 1
- Detail 2

### Examples
- Example 1
- Example 2

### Questions/Review
- Question 1
- Question 2`;
        break;
        
      case 'cornell':
        templateText = `# ${course?.name || 'Course'} - ${new Date().toLocaleDateString()}

## Notes
[Main content area]

## Cues/Questions
[Key questions and cues]

## Summary
[Summary of main points]`;
        break;
        
      case 'mindmap':
        templateText = `# Central Topic: ${course?.name || 'Main Concept'}

## Branch 1: [Topic]
- Sub-point 1
- Sub-point 2

## Branch 2: [Topic]  
- Sub-point 1
- Sub-point 2

## Branch 3: [Topic]
- Sub-point 1
- Sub-point 2

## Connections
- How Branch 1 connects to Branch 2
- Key relationships`;
        break;
    }
    
    setNoteContent(templateText);
    setNoteStyle(template);
  };

  const exportNote = () => {
    Alert.alert(
      'Export Note',
      'Choose export format:',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'PDF', onPress: () => Alert.alert('Success', 'Note exported as PDF!') },
        { text: 'Text', onPress: () => Alert.alert('Success', 'Note exported as text file!') },
        { text: 'Share', onPress: () => Alert.alert('Success', 'Note shared with classmates!') },
      ]
    );
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
          <LinearGradient
            colors={['#667eea', '#764ba2']}
            style={styles.header}
          >
            <View style={styles.headerContent}>
              <TouchableOpacity onPress={onClose} style={styles.backButton}>
                <Ionicons name="arrow-back" size={24} color="#fff" />
              </TouchableOpacity>
              
              <View style={styles.headerInfo}>
                <Text style={styles.headerTitle}>Smart Notes</Text>
                <Text style={styles.headerSubtitle}>
                  {course?.name || 'Study Notes'} • {wordCount} words
                </Text>
              </View>
              
              <Animated.View style={{ transform: [{ scale: pulseAnim }] }}>
                <TouchableOpacity 
                  onPress={generateAISummary}
                  style={styles.aiButton}
                  disabled={isAIProcessing}
                >
                  <Ionicons 
                    name={isAIProcessing ? "hourglass" : "sparkles"} 
                    size={20} 
                    color="#fff" 
                  />
                </TouchableOpacity>
              </Animated.View>
            </View>
          </LinearGradient>

          <View style={styles.content}>
            {/* Title Input */}
            <View style={styles.titleContainer}>
              <TextInput
                style={styles.titleInput}
                placeholder="Note title..."
                value={noteTitle}
                onChangeText={setNoteTitle}
                placeholderTextColor="#999"
              />
              <View style={styles.autoSaveIndicator}>
                <Ionicons 
                  name={autoSave ? "cloud-done" : "cloud-offline"} 
                  size={16} 
                  color={autoSave ? "#4CAF50" : "#999"} 
                />
                <Text style={styles.autoSaveText}>
                  {autoSave ? 'Auto-save on' : 'Auto-save off'}
                </Text>
              </View>
            </View>

            {/* Formatting Toolbar */}
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.toolbar}>
              <TouchableOpacity 
                style={styles.toolButton}
                onPress={() => formatText('bold')}
              >
                <Ionicons name="text" size={16} color="#667eea" />
                <Text style={styles.toolText}>Bold</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.toolButton}
                onPress={() => formatText('italic')}
              >
                <Text style={[styles.toolText, { fontStyle: 'italic' }]}>Italic</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.toolButton}
                onPress={() => formatText('highlight')}
              >
                <Ionicons name="color-fill" size={16} color="#FF9800" />
                <Text style={styles.toolText}>Highlight</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.toolButton}
                onPress={() => formatText('bullet')}
              >
                <Ionicons name="list" size={16} color="#667eea" />
                <Text style={styles.toolText}>List</Text>
              </TouchableOpacity>
            </ScrollView>

            {/* Template Buttons */}
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.templates}>
              <TouchableOpacity 
                style={[styles.templateButton, noteStyle === 'outline' && styles.templateActive]}
                onPress={() => insertTemplate('outline')}
              >
                <Ionicons name="list-outline" size={18} color={noteStyle === 'outline' ? "#fff" : "#667eea"} />
                <Text style={[styles.templateText, noteStyle === 'outline' && styles.templateTextActive]}>
                  Outline
                </Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[styles.templateButton, noteStyle === 'cornell' && styles.templateActive]}
                onPress={() => insertTemplate('cornell')}
              >
                <Ionicons name="grid-outline" size={18} color={noteStyle === 'cornell' ? "#fff" : "#667eea"} />
                <Text style={[styles.templateText, noteStyle === 'cornell' && styles.templateTextActive]}>
                  Cornell
                </Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[styles.templateButton, noteStyle === 'mindmap' && styles.templateActive]}
                onPress={() => insertTemplate('mindmap')}
              >
                <Ionicons name="git-network-outline" size={18} color={noteStyle === 'mindmap' ? "#fff" : "#667eea"} />
                <Text style={[styles.templateText, noteStyle === 'mindmap' && styles.templateTextActive]}>
                  Mind Map
                </Text>
              </TouchableOpacity>
            </ScrollView>

            {/* Main Content Area */}
            <ScrollView style={styles.mainContent}>
              <TextInput
                ref={textInputRef}
                style={styles.contentInput}
                placeholder="Start typing your notes here... 
                
✨ Pro tip: Use the AI assistant to auto-generate summaries and key points!"
                value={noteContent}
                onChangeText={setNoteContent}
                multiline
                placeholderTextColor="#999"
                textAlignVertical="top"
              />

              {/* AI Summary Section */}
              {summary && (
                <View style={styles.aiSummaryContainer}>
                  <View style={styles.aiSummaryHeader}>
                    <Ionicons name="sparkles" size={20} color="#667eea" />
                    <Text style={styles.aiSummaryTitle}>AI Summary & Analysis</Text>
                  </View>
                  <Text style={styles.aiSummaryText}>{summary}</Text>
                  
                  {keyPoints.length > 0 && (
                    <View style={styles.keyPointsContainer}>
                      <Text style={styles.keyPointsTitle}>🎯 Key Points to Remember:</Text>
                      {keyPoints.map((point, index) => (
                        <Text key={index} style={styles.keyPoint}>
                          • {point}
                        </Text>
                      ))}
                    </View>
                  )}
                  
                  {aiSuggestions.length > 0 && (
                    <View style={styles.suggestionsContainer}>
                      <Text style={styles.suggestionsTitle}>💡 AI Suggestions:</Text>
                      {aiSuggestions.map((suggestion, index) => (
                        <Text key={index} style={styles.suggestion}>
                          • {suggestion}
                        </Text>
                      ))}
                    </View>
                  )}
                </View>
              )}
            </ScrollView>

            {/* Bottom Actions */}
            <View style={styles.bottomActions}>
              <TouchableOpacity 
                style={styles.actionButton}
                onPress={() => setAutoSave(!autoSave)}
              >
                <Ionicons 
                  name={autoSave ? "cloud-done" : "cloud-offline"} 
                  size={20} 
                  color={autoSave ? "#4CAF50" : "#666"} 
                />
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.actionButton}
                onPress={exportNote}
              >
                <Ionicons name="share-outline" size={20} color="#667eea" />
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[styles.actionButton, styles.primaryAction]}
                onPress={generateAISummary}
                disabled={isAIProcessing}
              >
                {isAIProcessing ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <>
                    <Ionicons name="sparkles" size={20} color="#fff" />
                    <Text style={styles.primaryActionText}>AI Analyze</Text>
                  </>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </Animated.View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  container: {
    flex: 1,
    marginTop: 50,
    backgroundColor: '#fff',
    borderTopLeftRadius: 25,
    borderTopRightRadius: 25,
  },
  header: {
    paddingTop: 20,
    paddingBottom: 15,
    paddingHorizontal: 20,
    borderTopLeftRadius: 25,
    borderTopRightRadius: 25,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  backButton: {
    padding: 8,
    marginRight: 12,
  },
  headerInfo: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
  },
  headerSubtitle: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
    marginTop: 2,
  },
  aiButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  titleInput: {
    flex: 1,
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  autoSaveIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 15,
  },
  autoSaveText: {
    fontSize: 12,
    color: '#999',
    marginLeft: 4,
  },
  toolbar: {
    maxHeight: 50,
    marginBottom: 10,
  },
  toolButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 15,
    marginRight: 8,
    borderWidth: 1,
    borderColor: '#eee',
  },
  toolText: {
    fontSize: 12,
    color: '#667eea',
    marginLeft: 4,
    fontWeight: '500',
  },
  templates: {
    maxHeight: 50,
    marginBottom: 15,
  },
  templateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderRadius: 20,
    marginRight: 10,
    borderWidth: 1,
    borderColor: '#eee',
  },
  templateActive: {
    backgroundColor: '#667eea',
    borderColor: '#667eea',
  },
  templateText: {
    fontSize: 13,
    color: '#667eea',
    marginLeft: 6,
    fontWeight: '500',
  },
  templateTextActive: {
    color: '#fff',
  },
  mainContent: {
    flex: 1,
    marginBottom: 15,
  },
  contentInput: {
    fontSize: 16,
    color: '#333',
    lineHeight: 24,
    minHeight: 200,
    textAlignVertical: 'top',
  },
  aiSummaryContainer: {
    backgroundColor: '#f8f9ff',
    borderRadius: 15,
    padding: 20,
    marginTop: 20,
    borderWidth: 1,
    borderColor: '#e3e7ff',
  },
  aiSummaryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  aiSummaryTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#667eea',
    marginLeft: 8,
  },
  aiSummaryText: {
    fontSize: 14,
    color: '#333',
    lineHeight: 20,
    marginBottom: 15,
  },
  keyPointsContainer: {
    marginBottom: 15,
  },
  keyPointsTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  keyPoint: {
    fontSize: 13,
    color: '#666',
    lineHeight: 18,
    marginBottom: 4,
  },
  suggestionsContainer: {
    marginTop: 10,
  },
  suggestionsTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  suggestion: {
    fontSize: 13,
    color: '#666',
    lineHeight: 18,
    marginBottom: 4,
  },
  bottomActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 15,
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  actionButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#f8f9fa',
    justifyContent: 'center',
    alignItems: 'center',
  },
  primaryAction: {
    flexDirection: 'row',
    backgroundColor: '#667eea',
    paddingHorizontal: 20,
    width: 'auto',
  },
  primaryActionText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 6,
  },
});

export default SmartNoteTaking;
