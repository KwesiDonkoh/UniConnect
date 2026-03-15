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
  PanResponder,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

const { width, height } = Dimensions.get('window');

const Node = ({ node, onMove, onPress }) => {
  const pan = useRef(new Animated.ValueXY({ x: node.x, y: node.y })).current;

  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: () => true,
      onPanResponderMove: Animated.event([null, { dx: pan.x, dy: pan.y }], { useNativeDriver: false }),
      onPanResponderRelease: (e, gesture) => {
        onMove(node.id, node.x + gesture.dx, node.y + gesture.dy);
        pan.flattenOffset();
      },
      onPanResponderGrant: () => {
        pan.setOffset({
          x: pan.x._value,
          y: pan.y._value
        });
      }
    })
  ).current;

  return (
    <Animated.View
      {...panResponder.panHandlers}
      style={[
        styles.nodeContainer,
        {
          transform: [{ translateX: pan.x }, { translateY: pan.y }]
        }
      ]}
    >
      <TouchableOpacity style={[styles.node, node.isRoot && styles.rootNode]} onPress={() => onPress(node)}>
        <Text style={[styles.nodeText, node.isRoot && styles.rootNodeText]}>{node.text}</Text>
      </TouchableOpacity>
    </Animated.View>
  );
};

export default function MindMap({ visible, onClose, user }) {
  const [mindMaps, setMindMaps] = useState([]);
  const [currentMap, setCurrentMap] = useState(null);
  const [isCreating, setIsCreating] = useState(false);
  const [mapTitle, setMapTitle] = useState('');
  const [selectedTemplate, setSelectedTemplate] = useState('study');
  const [nodes, setNodes] = useState([]);
  const [newNodeText, setNewNodeText] = useState('');
  
  const slideAnim = useRef(new Animated.Value(height)).current;

  const templates = [
    { id: 'study', name: 'Study Guide', icon: 'book', color: '#10B981', description: 'Organize study materials' },
    { id: 'project', name: 'Project Planning', icon: 'rocket', color: '#8B5CF6', description: 'Plan project tasks' },
    { id: 'brainstorm', name: 'Brainstorming', icon: 'bulb', color: '#F59E0B', description: 'Generate ideas' },
  ];

  useEffect(() => {
    if (visible) {
      Animated.spring(slideAnim, { toValue: 0, tension: 50, friction: 8, useNativeDriver: true }).start();
    } else {
      Animated.timing(slideAnim, { toValue: height, duration: 300, useNativeDriver: true }).start();
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
      nodes: [{ id: 'root', text: mapTitle, x: width / 2 - 50, y: 150, isRoot: true }]
    };
    setMindMaps([newMap, ...mindMaps]);
    setCurrentMap(newMap);
    setNodes(newMap.nodes);
    setMapTitle('');
    setIsCreating(false);
  };

  const addNode = () => {
    if (!newNodeText.trim()) return;
    const newNode = {
      id: Date.now().toString(),
      text: newNodeText,
      x: width / 2 - 50,
      y: 250,
      isRoot: false
    };
    setNodes([...nodes, newNode]);
    setNewNodeText('');
  };

  const updateNodePosition = (id, x, y) => {
    setNodes(nodes.map(n => n.id === id ? { ...n, x, y } : n));
  };

  return (
    <Modal visible={visible} transparent={true} animationType="none" onRequestClose={onClose}>
      <View style={styles.modalOverlay}>
        <TouchableOpacity style={styles.backdrop} onPress={onClose} />
        <Animated.View style={[styles.modalContent, { transform: [{ translateY: slideAnim }] }]}>
          <View style={styles.header}>
            <Text style={styles.headerTitle}>Mind Maps</Text>
            <TouchableOpacity style={styles.closeButton} onPress={onClose}>
              <Ionicons name="close" size={24} color="#64748B" />
            </TouchableOpacity>
          </View>

          {isCreating ? (
            <View style={styles.createSection}>
              <Text style={styles.createTitle}>Create New Mind Map</Text>
              <TextInput style={styles.titleInput} placeholder="Enter mind map title..." value={mapTitle} onChangeText={setMapTitle} />
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.templatesContainer}>
                {templates.map((template) => (
                  <TouchableOpacity key={template.id} style={[styles.templateCard, selectedTemplate === template.id && styles.selectedTemplate]} onPress={() => setSelectedTemplate(template.id)}>
                    <LinearGradient colors={[template.color, template.color + '80']} style={styles.templateGradient}>
                      <Ionicons name={template.icon} size={32} color="#FFFFFF" />
                      <Text style={styles.templateName}>{template.name}</Text>
                    </LinearGradient>
                  </TouchableOpacity>
                ))}
              </ScrollView>
              <View style={styles.createActions}>
                <TouchableOpacity style={styles.cancelButton} onPress={() => setIsCreating(false)}><Text style={styles.cancelButtonText}>Cancel</Text></TouchableOpacity>
                <TouchableOpacity style={styles.createButton} onPress={createNewMap}><Text style={styles.createButtonText}>Create Map</Text></TouchableOpacity>
              </View>
            </View>
          ) : currentMap ? (
            <View style={styles.mapViewSection}>
              <View style={styles.mapViewHeader}>
                <TouchableOpacity onPress={() => setCurrentMap(null)} style={styles.backButton}>
                  <Ionicons name="arrow-back" size={20} color="#64748B" />
                </TouchableOpacity>
                <Text style={styles.currentMapTitle}>{currentMap.title}</Text>
                <View style={styles.addNodeContainer}>
                  <TextInput style={styles.nodeInput} placeholder="New Node..." value={newNodeText} onChangeText={setNewNodeText} />
                  <TouchableOpacity onPress={addNode} style={styles.addButton}><Ionicons name="add" size={24} color="#FFFFFF" /></TouchableOpacity>
                </View>
              </View>
              <View style={styles.canvas}>
                {nodes.map(node => (
                  <Node key={node.id} node={node} onMove={updateNodePosition} onPress={(n) => Alert.alert('Node', n.text)} />
                ))}
              </View>
            </View>
          ) : (
            <View style={styles.mapsSection}>
              <TouchableOpacity style={styles.emptyCreateButton} onPress={() => setIsCreating(true)}>
                <Ionicons name="add" size={24} color="#FFFFFF" />
                <Text style={styles.emptyCreateButtonText}>Create New Mind Map</Text>
              </TouchableOpacity>
              <ScrollView style={styles.mapsList}>
                {mindMaps.map(map => (
                  <TouchableOpacity key={map.id} style={styles.mapCard} onPress={() => { setCurrentMap(map); setNodes(map.nodes); }}>
                    <Text style={styles.mapTitle}>{map.title}</Text>
                    <Text style={styles.mapDate}>{new Date(map.createdAt).toLocaleDateString()}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          )}
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  backdrop: { flex: 1 },
  modalContent: { backgroundColor: '#FFFFFF', borderTopLeftRadius: 24, borderTopRightRadius: 24, height: height * 0.9 },
  header: { flexDirection: 'row', justifyContent: 'space-between', padding: 20, borderBottomWidth: 1, borderBottomColor: '#E2E8F0' },
  headerTitle: { fontSize: 24, fontWeight: '700' },
  closeButton: { padding: 8, backgroundColor: '#F1F5F9', borderRadius: 20 },
  createSection: { padding: 20 },
  createTitle: { fontSize: 18, fontWeight: '600', marginBottom: 15 },
  titleInput: { backgroundColor: '#F8FAFC', padding: 15, borderRadius: 12, marginBottom: 20 },
  templatesContainer: { marginBottom: 20 },
  templateCard: { width: 120, marginRight: 10, borderRadius: 12, overflow: 'hidden' },
  templateGradient: { padding: 15, alignItems: 'center' },
  templateName: { color: '#FFFFFF', fontWeight: 'bold', marginTop: 10 },
  createActions: { flexDirection: 'row', gap: 10 },
  cancelButton: { flex: 1, padding: 15, alignItems: 'center', borderRadius: 12, borderWidth: 1, borderColor: '#E2E8F0' },
  createButton: { flex: 1, padding: 15, alignItems: 'center', borderRadius: 12, backgroundColor: '#10B981' },
  createButtonText: { color: '#FFFFFF', fontWeight: 'bold' },
  mapViewSection: { flex: 1 },
  mapViewHeader: { flexDirection: 'row', alignItems: 'center', padding: 15, borderBottomWidth: 1, borderBottomColor: '#E2E8F0', gap: 10 },
  currentMapTitle: { flex: 1, fontSize: 16, fontWeight: 'bold' },
  addNodeContainer: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  nodeInput: { backgroundColor: '#F8FAFC', padding: 8, borderRadius: 10, width: 100 },
  addButton: { backgroundColor: '#6366F1', padding: 8, borderRadius: 10 },
  canvas: { flex: 1, backgroundColor: '#F8FAFC' },
  nodeContainer: { position: 'absolute' },
  node: { backgroundColor: '#FFFFFF', padding: 12, borderRadius: 12, elevation: 3, borderWidth: 1, borderColor: '#6366F1', minWidth: 100, alignItems: 'center' },
  rootNode: { backgroundColor: '#6366F1' },
  nodeText: { color: '#1E293B', fontWeight: '600' },
  rootNodeText: { color: '#FFFFFF' },
  mapsSection: { padding: 20, flex: 1 },
  emptyCreateButton: { flexDirection: 'row', backgroundColor: '#6366F1', padding: 15, borderRadius: 15, alignItems: 'center', justifyContent: 'center', gap: 10, marginBottom: 20 },
  emptyCreateButtonText: { color: '#FFFFFF', fontWeight: 'bold' },
  mapCard: { backgroundColor: '#FFFFFF', padding: 15, borderRadius: 12, marginBottom: 10, borderWidth: 1, borderColor: '#E2E8F0' },
  mapTitle: { fontSize: 16, fontWeight: 'bold' },
  mapDate: { fontSize: 12, color: '#94A3B8', marginTop: 5 }
});
