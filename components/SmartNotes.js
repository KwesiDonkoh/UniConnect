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
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

const { width, height } = Dimensions.get('window');

export default function SmartNotes({ visible, onClose, user }) {
  const [notes, setNotes] = useState([]);
  const [currentNote, setCurrentNote] = useState('');
  const [selectedNote, setSelectedNote] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [noteTitle, setNoteTitle] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  
  const slideAnim = useRef(new Animated.Value(height)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  const categories = [
    { id: 'all', name: 'All Notes', icon: 'documents', color: '#667eea' },
    { id: 'lecture', name: 'Lectures', icon: 'school', color: '#10B981' },
    { id: 'assignment', name: 'Assignments', icon: 'document-text', color: '#F59E0B' },
    { id: 'study', name: 'Study Notes', icon: 'book', color: '#8B5CF6' },
    { id: 'ideas', name: 'Ideas', icon: 'bulb', color: '#EC4899' },
  ];

  const aiSuggestions = [
    'Summarize this note in bullet points',
    'Create study questions from this content',
    'Organize this into a mind map structure',
    'Highlight key concepts and definitions',
    'Generate practice problems',
    'Create flashcards from this content',
  ];

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.spring(slideAnim, {
          toValue: 0,
          tension: 50,
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
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible]);

  const saveNote = () => {
    if (!noteTitle.trim() || !currentNote.trim()) {
      Alert.alert('Error', 'Please enter both title and content');
      return;
    }

    const newNote = {
      id: Date.now(),
      title: noteTitle,
      content: currentNote,
      category: selectedCategory === 'all' ? 'general' : selectedCategory,
      timestamp: new Date(),
      tags: extractTags(currentNote),
    };

    setNotes([newNote, ...notes]);
    setCurrentNote('');
    setNoteTitle('');
    setSelectedCategory('all');
    Alert.alert('Success', 'Note saved successfully!');
  };

  const extractTags = (content) => {
    const words = content.split(' ');
    return words.filter(word => word.startsWith('#')).slice(0, 5);
  };

  const deleteNote = (noteId) => {
    Alert.alert(
      'Delete Note',
      'Are you sure you want to delete this note?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            setNotes(notes.filter(note => note.id !== noteId));
            setSelectedNote(null);
            setIsEditing(false);
          },
        },
      ]
    );
  };

  const editNote = (note) => {
    setSelectedNote(note);
    setNoteTitle(note.title);
    setCurrentNote(note.content);
    setSelectedCategory(note.category);
    setIsEditing(true);
  };

  const updateNote = () => {
    if (!noteTitle.trim() || !currentNote.trim()) {
      Alert.alert('Error', 'Please enter both title and content');
      return;
    }

    const updatedNotes = notes.map(note =>
      note.id === selectedNote.id
        ? {
            ...note,
            title: noteTitle,
            content: currentNote,
            category: selectedCategory === 'all' ? 'general' : selectedCategory,
            timestamp: new Date(),
            tags: extractTags(currentNote),
          }
        : note
    );

    setNotes(updatedNotes);
    setSelectedNote(null);
    setCurrentNote('');
    setNoteTitle('');
    setSelectedCategory('all');
    setIsEditing(false);
    Alert.alert('Success', 'Note updated successfully!');
  };

  const applyAISuggestion = (suggestion) => {
    let enhancedContent = currentNote;
    
    switch (suggestion) {
      case 'Summarize this note in bullet points':
        enhancedContent = currentNote
          .split('.')
          .filter(sentence => sentence.trim().length > 10)
          .map(sentence => `• ${sentence.trim()}`)
          .join('\n');
        break;
      case 'Create study questions from this content':
        enhancedContent = currentNote
          .split('.')
          .filter(sentence => sentence.trim().length > 20)
          .slice(0, 5)
          .map(sentence => `Q: ${sentence.trim()}?\nA: [Your answer here]`)
          .join('\n\n');
        break;
      case 'Highlight key concepts and definitions':
        enhancedContent = currentNote
          .split('.')
          .map(sentence => {
            const words = sentence.split(' ');
            return words.map(word => 
              word.length > 6 ? `**${word}**` : word
            ).join(' ');
          })
          .join('. ');
        break;
      default:
        enhancedContent = `${currentNote}\n\n---\nAI Suggestion: ${suggestion}`;
    }
    
    setCurrentNote(enhancedContent);
    Alert.alert('AI Enhancement Applied', 'Your note has been enhanced with AI suggestions!');
  };

  const filteredNotes = notes.filter(note => {
    const matchesSearch = note.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         note.content.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || note.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const renderNote = (note) => (
    <TouchableOpacity
      key={note.id}
      style={styles.noteCard}
      onPress={() => editNote(note)}
    >
      <View style={styles.noteHeader}>
        <Text style={styles.noteTitle} numberOfLines={1}>
          {note.title}
        </Text>
        <View style={styles.noteActions}>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => editNote(note)}
          >
            <Ionicons name="create" size={16} color="#4F46E5" />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => deleteNote(note.id)}
          >
            <Ionicons name="trash" size={16} color="#EF4444" />
          </TouchableOpacity>
        </View>
      </View>
      
      <Text style={styles.noteContent} numberOfLines={3}>
        {note.content}
      </Text>
      
      <View style={styles.noteFooter}>
        <View style={styles.noteTags}>
          {note.tags.slice(0, 3).map((tag, index) => (
            <Text key={index} style={styles.tag}>
              {tag}
            </Text>
          ))}
        </View>
        <Text style={styles.noteTimestamp}>
          {new Date(note.timestamp).toLocaleDateString()}
        </Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="none"
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <TouchableOpacity style={styles.backdrop} onPress={onClose} />
        <Animated.View
          style={[
            styles.modalContent,
            {
              transform: [{ translateY: slideAnim }],
              opacity: fadeAnim,
            },
          ]}
        >
          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={styles.keyboardView}
          >
            {/* Header */}
            <View style={styles.header}>
              <Text style={styles.headerTitle}>Smart Notes</Text>
              <TouchableOpacity style={styles.closeButton} onPress={onClose}>
                <Ionicons name="close" size={24} color="#64748B" />
              </TouchableOpacity>
            </View>

            {/* Search and Categories */}
            <View style={styles.searchSection}>
              <View style={styles.searchContainer}>
                <Ionicons name="search" size={20} color="#64748B" />
                <TextInput
                  style={styles.searchInput}
                  placeholder="Search notes..."
                  value={searchQuery}
                  onChangeText={setSearchQuery}
                />
              </View>
              
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoriesContainer}>
                {categories.map((category) => (
                  <TouchableOpacity
                    key={category.id}
                    style={[
                      styles.categoryButton,
                      selectedCategory === category.id && styles.selectedCategory,
                    ]}
                    onPress={() => setSelectedCategory(category.id)}
                  >
                    <Ionicons name={category.icon} size={16} color={selectedCategory === category.id ? '#FFFFFF' : category.color} />
                    <Text style={[
                      styles.categoryText,
                      selectedCategory === category.id && styles.selectedCategoryText,
                    ]}>
                      {category.name}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>

            {/* AI Suggestions */}
            <View style={styles.aiSection}>
              <Text style={styles.aiSectionTitle}>AI Enhancements</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.suggestionsContainer}>
                {aiSuggestions.map((suggestion, index) => (
                  <TouchableOpacity
                    key={index}
                    style={styles.suggestionButton}
                    onPress={() => applyAISuggestion(suggestion)}
                  >
                    <Ionicons name="sparkles" size={16} color="#F59E0B" />
                    <Text style={styles.suggestionText} numberOfLines={2}>
                      {suggestion}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>

            {/* Note Input */}
            <View style={styles.inputSection}>
              <TextInput
                style={styles.titleInput}
                placeholder="Note title..."
                value={noteTitle}
                onChangeText={setNoteTitle}
              />
              
              <TextInput
                style={styles.contentInput}
                placeholder="Start writing your note... Use #tags for organization"
                value={currentNote}
                onChangeText={setCurrentNote}
                multiline
                textAlignVertical="top"
              />
              
              <View style={styles.inputActions}>
                <TouchableOpacity
                  style={styles.categorySelector}
                  onPress={() => {
                    Alert.alert(
                      'Select Category',
                      'Choose a category for your note:',
                      categories.slice(1).map(cat => ({
                        text: cat.name,
                        onPress: () => setSelectedCategory(cat.id),
                      }))
                    );
                  }}
                >
                  <Ionicons name="folder" size={16} color="#64748B" />
                  <Text style={styles.categorySelectorText}>
                    {categories.find(c => c.id === selectedCategory)?.name || 'Select Category'}
                  </Text>
                </TouchableOpacity>
                
                <TouchableOpacity
                  style={[styles.saveButton, (!noteTitle.trim() || !currentNote.trim()) && styles.saveButtonDisabled]}
                  onPress={isEditing ? updateNote : saveNote}
                  disabled={!noteTitle.trim() || !currentNote.trim()}
                >
                  <Ionicons name={isEditing ? "checkmark" : "save"} size={16} color="#FFFFFF" />
                  <Text style={styles.saveButtonText}>
                    {isEditing ? 'Update' : 'Save Note'}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Notes List */}
            <View style={styles.notesSection}>
              <Text style={styles.notesSectionTitle}>
                Your Notes ({filteredNotes.length})
              </Text>
              <ScrollView style={styles.notesList} showsVerticalScrollIndicator={false}>
                {filteredNotes.length > 0 ? (
                  filteredNotes.map(renderNote)
                ) : (
                  <View style={styles.emptyState}>
                    <Ionicons name="document-text" size={48} color="#94A3B8" />
                    <Text style={styles.emptyTitle}>No notes yet</Text>
                    <Text style={styles.emptySubtitle}>
                      Start writing your first smart note!
                    </Text>
                  </View>
                )}
              </ScrollView>
            </View>
          </KeyboardAvoidingView>
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  backdrop: {
    flex: 1,
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: height * 0.9,
  },
  keyboardView: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1E293B',
  },
  closeButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: '#F1F5F9',
  },
  searchSection: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginBottom: 16,
  },
  searchInput: {
    flex: 1,
    marginLeft: 12,
    fontSize: 16,
    color: '#1E293B',
  },
  categoriesContainer: {
    flexDirection: 'row',
  },
  categoryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginRight: 8,
    gap: 6,
  },
  selectedCategory: {
    backgroundColor: '#4F46E5',
    borderColor: '#4F46E5',
  },
  categoryText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#64748B',
  },
  selectedCategoryText: {
    color: '#FFFFFF',
  },
  aiSection: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  aiSectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1E293B',
    marginBottom: 12,
  },
  suggestionsContainer: {
    flexDirection: 'row',
  },
  suggestionButton: {
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 16,
    marginRight: 8,
    alignItems: 'center',
    minWidth: 120,
  },
  suggestionText: {
    fontSize: 11,
    color: '#92400E',
    fontWeight: '500',
    textAlign: 'center',
    marginTop: 4,
  },
  inputSection: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  titleInput: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1E293B',
    padding: 16,
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  contentInput: {
    fontSize: 16,
    color: '#1E293B',
    padding: 16,
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    minHeight: 120,
  },
  inputActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  categorySelector: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    gap: 8,
  },
  categorySelectorText: {
    fontSize: 14,
    color: '#64748B',
    fontWeight: '500',
  },
  saveButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#10B981',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12,
    gap: 8,
  },
  saveButtonDisabled: {
    backgroundColor: '#94A3B8',
  },
  saveButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  notesSection: {
    flex: 1,
    padding: 20,
  },
  notesSectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1E293B',
    marginBottom: 16,
  },
  notesList: {
    flex: 1,
  },
  noteCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  noteHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  noteTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1E293B',
    flex: 1,
    marginRight: 12,
  },
  noteActions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    padding: 6,
    borderRadius: 8,
    backgroundColor: '#F8FAFC',
  },
  noteContent: {
    fontSize: 14,
    color: '#64748B',
    lineHeight: 20,
    marginBottom: 12,
  },
  noteFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  noteTags: {
    flexDirection: 'row',
    gap: 6,
  },
  tag: {
    fontSize: 11,
    color: '#4F46E5',
    backgroundColor: '#EEF2FF',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    fontWeight: '500',
  },
  noteTimestamp: {
    fontSize: 12,
    color: '#94A3B8',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#64748B',
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#94A3B8',
    textAlign: 'center',
  },
});
