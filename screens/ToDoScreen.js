import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, SafeAreaView, Dimensions, TextInput, Alert, Modal, KeyboardAvoidingView, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { useTheme } from '../components/ThemeProvider';
import { useApp } from '../context/AppContext';

const { width } = Dimensions.get('window');

export default function ToDoScreen({ navigation }) {
  const { isDark } = useTheme();
  const { tasks, setTasks } = useApp();
  const [modalVisible, setModalVisible] = useState(false);
  const [newTask, setNewTask] = useState({ title: '', type: 'Exams', deadline: 'Soon' });

  const toggleTask = (id) => {
    setTasks(tasks.map(t => t.id === id ? { ...t, completed: !t.completed } : t));
  };

  const addTask = () => {
    if (!newTask.title) return Alert.alert('Error', 'Please enter a task title');
    const task = {
      ...newTask,
      id: Date.now(),
      completed: false
    };
    setTasks([task, ...tasks]);
    setModalVisible(false);
    setNewTask({ title: '', type: 'Exams', deadline: 'Soon' });
  };

  const deleteTask = (id) => {
    setTasks(tasks.filter(t => t.id !== id));
  };

  const getIcon = (type) => {
    switch(type) {
      case 'Exams': return 'school';
      case 'Paper': return 'document-text';
      case 'Project': return 'people';
      default: return 'checkbox';
    }
  };

  const getColor = (type) => {
    switch(type) {
      case 'Exams': return '#EF4444';
      case 'Paper': return '#3B82F6';
      case 'Project': return '#10B981';
      default: return '#6366F1';
    }
  };

  return (
    <SafeAreaView style={[styles.container, isDark && styles.darkContainer]}>
      <LinearGradient colors={isDark ? ['#0F172A', '#1E1B4B'] : ['#F8FAFC', '#FFFFFF']} style={styles.background}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color={isDark ? '#FFF' : '#1E293B'} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, isDark && styles.darkText]}>My Tasks</Text>
          <TouchableOpacity style={styles.addBtn} onPress={() => setModalVisible(true)}>
             <Ionicons name="add" size={24} color="#FFF" />
          </TouchableOpacity>
        </View>

        <View style={styles.statsRow}>
          <View style={styles.statBox}>
            <Text style={styles.statVal}>{tasks.filter(t => !t.completed).length}</Text>
            <Text style={styles.statLabel}>Pending</Text>
          </View>
          <View style={[styles.statBox, { borderLeftWidth: 1, borderLeftColor: 'rgba(0,0,0,0.1)' }]}>
            <Text style={styles.statVal}>{tasks.filter(t => t.completed).length}</Text>
            <Text style={styles.statLabel}>Completed</Text>
          </View>
        </View>

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
          <Text style={[styles.sectionTitle, isDark && styles.darkText]}>Focus List</Text>
          {tasks.length === 0 ? (
            <View style={styles.emptyState}>
              <Ionicons name="clipboard-outline" size={60} color="#CBD5E1" />
              <Text style={styles.emptyText}>No tasks yet. Add one to get started!</Text>
            </View>
          ) : (
            tasks.map((task) => (
              <TouchableOpacity key={task.id} style={styles.taskCard} onPress={() => toggleTask(task.id)} onLongPress={() => Alert.alert('Delete Task', 'Remove this task?', [{ text: 'Cancel' }, { text: 'Delete', onPress: () => deleteTask(task.id), style: 'destructive' }])}>
                <BlurView intensity={isDark ? 20 : 40} tint={isDark ? 'dark' : 'light'} style={styles.taskBlur}>
                  <View style={[styles.typeLine, { backgroundColor: getColor(task.type) }]} />
                  <View style={styles.taskContent}>
                    <View style={styles.taskInfo}>
                      <View style={styles.titleRow}>
                        <Ionicons name={getIcon(task.type)} size={18} color={getColor(task.type)} style={{ marginRight: 8 }} />
                        <Text style={[styles.taskTitle, task.completed && styles.completedText, isDark && styles.darkText]}>{task.title}</Text>
                      </View>
                      <Text style={styles.taskMeta}>
                        <Ionicons name="time-outline" size={12} /> {task.deadline} • {task.type}
                      </Text>
                    </View>
                    <View style={[styles.checkbox, task.completed && { backgroundColor: getColor(task.type), borderColor: getColor(task.type) }]}>
                      {task.completed && <Ionicons name="checkmark" size={16} color="#FFF" />}
                    </View>
                  </View>
                </BlurView>
              </TouchableOpacity>
            ))
          )}

          {/* AI Productivity Tip */}
          <View style={styles.aiTip}>
            <LinearGradient colors={['#6366F1', '#4F46E5']} style={styles.tipGradient}>
              <Ionicons name="bulb" size={24} color="#FFF" />
              <Text style={styles.tipText}>AI Suggestion: You usually finish "{tasks[0]?.type || 'Academic'}" tasks faster in the evening.</Text>
            </LinearGradient>
          </View>
        </ScrollView>

        <Modal visible={modalVisible} animationType="slide" transparent>
          <BlurView intensity={90} tint="dark" style={styles.modalBg}>
            <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.modalContent}>
              <View style={[styles.modalHeader, isDark && { borderBottomColor: '#334155' }]}>
                <Text style={styles.modalTitle}>New Task</Text>
                <TouchableOpacity onPress={() => setModalVisible(false)}><Ionicons name="close" size={24} color="#FFF" /></TouchableOpacity>
              </View>
              
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Task Title</Text>
                <TextInput style={styles.input} placeholder="Enter task title..." placeholderTextColor="#94A3B8" value={newTask.title} onChangeText={(t) => setNewTask({...newTask, title: t})} />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Category</Text>
                <View style={styles.typeGrid}>
                  {['Exams', 'Paper', 'Project', 'Other'].map(type => (
                    <TouchableOpacity key={type} style={[styles.typePill, newTask.type === type && { backgroundColor: getColor(type) }]} onPress={() => setNewTask({...newTask, type})}>
                      <Text style={[styles.typePillText, newTask.type === type && { color: '#FFF' }]}>{type}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              <TouchableOpacity style={styles.saveBtn} onPress={addTask}>
                <Text style={styles.saveBtnText}>Save Task</Text>
              </TouchableOpacity>
            </KeyboardAvoidingView>
          </BlurView>
        </Modal>
      </LinearGradient>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  darkContainer: { backgroundColor: '#0F172A' },
  background: { flex: 1 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 20 },
  backButton: { width: 44, height: 44, borderRadius: 15, backgroundColor: 'rgba(99, 102, 241, 0.05)', alignItems: 'center', justifyContent: 'center' },
  headerTitle: { fontSize: 22, fontWeight: '800', color: '#1E293B' },
  addBtn: { width: 45, height: 45, borderRadius: 15, backgroundColor: '#4F46E5', alignItems: 'center', justifyContent: 'center' },
  statsRow: { flexDirection: 'row', backgroundColor: 'rgba(99, 102, 241, 0.05)', margin: 20, borderRadius: 20, padding: 15 },
  statBox: { flex: 1, alignItems: 'center' },
  statVal: { fontSize: 20, fontWeight: '800', color: '#4F46E5' },
  statLabel: { fontSize: 12, color: '#64748B', marginTop: 2, fontWeight: '600' },
  scrollContent: { paddingHorizontal: 20, pb: 40 },
  sectionTitle: { fontSize: 18, fontWeight: '800', color: '#1E293B', marginBottom: 15 },
  taskCard: { borderRadius: 20, overflow: 'hidden', marginBottom: 15, borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' },
  taskBlur: { flexDirection: 'row' },
  typeLine: { width: 6 },
  taskContent: { flex: 1, padding: 15, flexDirection: 'row', alignItems: 'center' },
  taskInfo: { flex: 1 },
  titleRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 6 },
  taskTitle: { fontSize: 15, fontWeight: '700', color: '#1E293B' },
  completedText: { textDecorationLine: 'line-through', opacity: 0.5 },
  taskMeta: { fontSize: 12, color: '#94A3B8', fontWeight: '500' },
  checkbox: { width: 24, height: 24, borderRadius: 12, borderWidth: 2, borderColor: '#CBD5E1', alignItems: 'center', justifyContent: 'center' },
  emptyState: { alignItems: 'center', marginTop: 50, marginBottom: 50 },
  emptyText: { color: '#94A3B8', marginTop: 10, fontSize: 14 },
  aiTip: { marginTop: 30, borderRadius: 20, overflow: 'hidden', marginBottom: 40 },
  tipGradient: { padding: 20, flexDirection: 'row', alignItems: 'center' },
  tipText: { flex: 1, color: '#FFF', fontSize: 13, marginLeft: 15, lineHeight: 18, fontWeight: '600' },
  darkText: { color: '#FFF' },
  modalBg: { flex: 1, justifyContent: 'flex-end' },
  modalContent: { backgroundColor: '#1E293B', borderTopLeftRadius: 30, borderTopRightRadius: 30, padding: 25, pb: 40 },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.1)', pb: 15 },
  modalTitle: { fontSize: 20, fontWeight: '900', color: '#FFF' },
  inputGroup: { marginBottom: 20 },
  label: { fontSize: 14, color: '#94A3B8', marginBottom: 8, fontWeight: '700' },
  input: { backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: 12, padding: 15, color: '#FFF', fontSize: 15 },
  typeGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  typePill: { paddingHorizontal: 15, paddingVertical: 8, borderRadius: 10, backgroundColor: 'rgba(255,255,255,0.1)' },
  typePillText: { color: '#94A3B8', fontSize: 13, fontWeight: '700' },
  saveBtn: { backgroundColor: '#4F46E5', paddingVertical: 15, borderRadius: 15, alignItems: 'center', marginTop: 10 },
  saveBtnText: { color: '#FFF', fontSize: 16, fontWeight: '800' },
});
