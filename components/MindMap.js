import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Animated,
  Dimensions,
  Alert,
  Modal,
  TextInput,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

const { width, height } = Dimensions.get('window');

export default function MindMap({ visible, onClose, user }) {
  const [mindMaps, setMindMaps] = useState([]);
  const [currentMap, setCurrentMap] = useState(null);
  const [isCreating, setIsCreating] = useState(false);
  const [mapTitle, setMapTitle] = useState('');
  const [selectedTemplate, setSelectedTemplate] = useState('study');
  
  const slideAnim = useRef(new Animated.Value(height)).current;

  const templates = [
    {
      id: 'study',
      name: 'Study Guide',
      icon: 'book',
      color: '#10B981',
      description: 'Organize study materials',
    },
    {
      id: 'project',
      name: 'Project Planning',
      icon: 'rocket',
      color: '#8B5CF6',
      description: 'Plan project tasks',
    },
    {
      id: 'brainstorm',
      name: 'Brainstorming',
      icon: 'bulb',
      color: '#F59E0B',
      description: 'Generate ideas',
    },
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

  const createNewMap = () => {
    if (!mapTitle.trim()) {
      Alert.alert('Error', 'Please enter a title for your mind map');
      return;
    }

    const newMap = {
      id: Date.now(),
      title: mapTitle,
      template: selectedTemplate,
      createdAt: new Date(),
    };

    setMindMaps([newMap, ...mindMaps]);
    setMapTitle('');
    setIsCreating(false);
    Alert.alert('Success', 'Mind map created successfully!');
  };

  const deleteMap = (mapId) => {
    Alert.alert(
      'Delete Mind Map',
      'Are you sure you want to delete this mind map?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            setMindMaps(mindMaps.filter(map => map.id !== mapId));
          },
        },
      ]
    );
  };

  const renderMap = (map) => (
    <TouchableOpacity
      key={map.id}
      style={styles.mapCard}
      onPress={() => setCurrentMap(map)}
    >
      <View style={styles.mapHeader}>
        <View style={styles.mapInfo}>
          <Text style={styles.mapTitle}>{map.title}</Text>
          <Text style={styles.mapTemplate}>
            {templates.find(t => t.id === map.template)?.name}
          </Text>
        </View>
        <View style={styles.mapActions}>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => setCurrentMap(map)}
          >
            <Ionicons name="eye" size={16} color="#4F46E5" />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => deleteMap(map.id)}
          >
            <Ionicons name="trash" size={16} color="#EF4444" />
          </TouchableOpacity>
        </View>
      </View>
      
      <Text style={styles.mapDate}>
        Created: {new Date(map.createdAt).toLocaleDateString()}
      </Text>
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
            },
          ]}
        >
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.headerTitle}>Mind Maps</Text>
            <View style={styles.headerActions}>
              <TouchableOpacity
                style={styles.createMapButton}
                onPress={() => setIsCreating(true)}
              >
                <Ionicons name="add" size={20} color="#FFFFFF" />
                <Text style={styles.createMapButtonText}>New Map</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.closeButton} onPress={onClose}>
                <Ionicons name="close" size={24} color="#64748B" />
              </TouchableOpacity>
            </View>
          </View>

          {isCreating ? (
            /* Create New Map */
            <View style={styles.createSection}>
              <Text style={styles.createTitle}>Create New Mind Map</Text>
              
              <TextInput
                style={styles.titleInput}
                placeholder="Enter mind map title..."
                value={mapTitle}
                onChangeText={setMapTitle}
              />
              
              <Text style={styles.templateTitle}>Choose Template:</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.templatesContainer}>
                {templates.map((template) => (
                  <TouchableOpacity
                    key={template.id}
                    style={[
                      styles.templateCard,
                      selectedTemplate === template.id && styles.selectedTemplate,
                    ]}
                    onPress={() => setSelectedTemplate(template.id)}
                  >
                    <LinearGradient
                      colors={[template.color, template.color + '80']}
                      style={styles.templateGradient}
                    >
                      <Ionicons name={template.icon} size={32} color="#FFFFFF" />
                      <Text style={styles.templateName}>{template.name}</Text>
                      <Text style={styles.templateDescription}>
                        {template.description}
                      </Text>
                    </LinearGradient>
                  </TouchableOpacity>
                ))}
              </ScrollView>
              
              <View style={styles.createActions}>
                <TouchableOpacity
                  style={styles.cancelButton}
                  onPress={() => {
                    setIsCreating(false);
                    setMapTitle('');
                    setSelectedTemplate('study');
                  }}
                >
                  <Text style={styles.cancelButtonText}>Cancel</Text>
                </TouchableOpacity>
                
                <TouchableOpacity
                  style={[styles.createButton, !mapTitle.trim() && styles.createButtonDisabled]}
                  onPress={createNewMap}
                  disabled={!mapTitle.trim()}
                >
                  <Ionicons name="checkmark" size={20} color="#FFFFFF" />
                  <Text style={styles.createButtonText}>Create Map</Text>
                </TouchableOpacity>
              </View>
            </View>
          ) : currentMap ? (
            /* View Mind Map */
            <View style={styles.mapViewSection}>
              <View style={styles.mapViewHeader}>
                <TouchableOpacity
                  style={styles.backButton}
                  onPress={() => setCurrentMap(null)}
                >
                  <Ionicons name="arrow-back" size={20} color="#64748B" />
                  <Text style={styles.backButtonText}>Back to Maps</Text>
                </TouchableOpacity>
                
                <Text style={styles.currentMapTitle}>{currentMap.title}</Text>
              </View>
              
              <View style={styles.canvasContainer}>
                <View style={styles.canvas}>
                  <Text style={styles.canvasText}>Mind Map Canvas</Text>
                  <Text style={styles.canvasSubtext}>Interactive mind mapping coming soon!</Text>
                </View>
              </View>
            </View>
          ) : (
            /* Maps List */
            <View style={styles.mapsSection}>
              <Text style={styles.mapsSectionTitle}>
                Your Mind Maps ({mindMaps.length})
              </Text>
              
              <ScrollView style={styles.mapsList} showsVerticalScrollIndicator={false}>
                {mindMaps.length > 0 ? (
                  mindMaps.map(renderMap)
                ) : (
                  <View style={styles.emptyState}>
                    <Ionicons name="git-network" size={48} color="#94A3B8" />
                    <Text style={styles.emptyTitle}>No mind maps yet</Text>
                    <Text style={styles.emptySubtitle}>
                      Create your first mind map to organize your thoughts!
                    </Text>
                    <TouchableOpacity
                      style={styles.emptyCreateButton}
                      onPress={() => setIsCreating(true)}
                    >
                      <Ionicons name="add" size={20} color="#FFFFFF" />
                      <Text style={styles.emptyCreateButtonText}>Create First Map</Text>
                    </TouchableOpacity>
                  </View>
                )}
              </ScrollView>
            </View>
          )}
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
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  createMapButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#10B981',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    gap: 6,
  },
  createMapButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  closeButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: '#F1F5F9',
  },
  createSection: {
    padding: 20,
  },
  createTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1E293B',
    marginBottom: 16,
  },
  titleInput: {
    fontSize: 16,
    color: '#1E293B',
    padding: 16,
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  templateTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1E293B',
    marginBottom: 12,
  },
  templatesContainer: {
    flexDirection: 'row',
    marginBottom: 20,
  },
  templateCard: {
    width: 140,
    marginRight: 12,
    borderRadius: 16,
    overflow: 'hidden',
  },
  selectedTemplate: {
    borderWidth: 3,
    borderColor: '#4F46E5',
  },
  templateGradient: {
    padding: 20,
    alignItems: 'center',
    minHeight: 120,
  },
  templateName: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
    marginTop: 12,
    marginBottom: 8,
    textAlign: 'center',
  },
  templateDescription: {
    color: '#FFFFFF',
    fontSize: 12,
    textAlign: 'center',
    lineHeight: 16,
  },
  createActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    alignItems: 'center',
  },
  cancelButtonText: {
    color: '#64748B',
    fontSize: 16,
    fontWeight: '600',
  },
  createButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#10B981',
    paddingVertical: 14,
    borderRadius: 12,
    justifyContent: 'center',
    gap: 8,
  },
  createButtonDisabled: {
    backgroundColor: '#94A3B8',
  },
  createButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  mapViewSection: {
    flex: 1,
  },
  mapViewHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,
    gap: 6,
  },
  backButtonText: {
    color: '#64748B',
    fontSize: 14,
    fontWeight: '500',
  },
  currentMapTitle: {
    flex: 1,
    fontSize: 18,
    fontWeight: '600',
    color: '#1E293B',
  },
  canvasContainer: {
    flex: 1,
    backgroundColor: '#F8FAFC',
    justifyContent: 'center',
    alignItems: 'center',
  },
  canvas: {
    alignItems: 'center',
  },
  canvasText: {
    fontSize: 24,
    fontWeight: '700',
    color: '#64748B',
    marginBottom: 8,
  },
  canvasSubtext: {
    fontSize: 16,
    color: '#94A3B8',
    textAlign: 'center',
  },
  mapsSection: {
    flex: 1,
    padding: 20,
  },
  mapsSectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1E293B',
    marginBottom: 16,
  },
  mapsList: {
    flex: 1,
  },
  mapCard: {
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
  mapHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  mapInfo: {
    flex: 1,
    marginRight: 12,
  },
  mapTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1E293B',
    marginBottom: 4,
  },
  mapTemplate: {
    fontSize: 12,
    color: '#64748B',
  },
  mapActions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    padding: 6,
    borderRadius: 8,
    backgroundColor: '#F8FAFC',
  },
  mapDate: {
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
    marginBottom: 20,
  },
  emptyCreateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#10B981',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 20,
    gap: 8,
  },
  emptyCreateButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
});
