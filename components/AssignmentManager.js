import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, FlatList } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Shadows } from '../themes/modernTheme';

const AssignmentManager = ({ visible, onClose, isDark }) => {
  const [assignments, setAssignments] = useState([
    { id: 1, title: 'AI Research Paper', course: 'CSM395', dueDate: 'Tomorrow', status: 'Pending', priority: 'High' },
    { id: 2, title: 'Database Design Project', course: 'CSM391', dueDate: 'May 20', status: 'In Progress', priority: 'Medium' },
    { id: 3, title: 'Network Security Lab', course: 'CSM461', dueDate: 'May 25', status: 'Pending', priority: 'High' },
  ]);

  const toggleStatus = (id) => {
    setAssignments(assignments.map(a => 
      a.id === id ? { ...a, status: a.status === 'Completed' ? 'Pending' : 'Completed' } : a
    ));
  };

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.modalOverlay}>
        <LinearGradient
          colors={isDark ? ['#1E293B', '#0F172A'] : ['#FFFFFF', '#F8FAFC']}
          style={styles.modalContent}
        >
          <View style={styles.header}>
            <Text style={[styles.title, isDark && styles.textWhite]}>Assignments</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <Ionicons name="close" size={24} color={isDark ? '#FFFFFF' : '#64748B'} />
            </TouchableOpacity>
          </View>

          <FlatList
            data={assignments}
            keyExtractor={item => item.id.toString()}
            renderItem={({ item }) => (
              <TouchableOpacity 
                style={[styles.taskCard, isDark && styles.darkCard, item.status === 'Completed' && { opacity: 0.6 }]}
                onPress={() => toggleStatus(item.id)}
              >
                <View style={styles.taskLeft}>
                  <View style={[styles.checkCircle, item.status === 'Completed' && styles.checkedCircle]}>
                    {item.status === 'Completed' && <Ionicons name="checkmark" size={16} color="#FFFFFF" />}
                  </View>
                  <View>
                    <Text style={[styles.taskTitle, isDark && styles.textWhite, item.status === 'Completed' && styles.strikethrough]}>{item.title}</Text>
                    <Text style={styles.taskSub}>{item.course} • Due {item.dueDate}</Text>
                  </View>
                </View>
                <View style={[styles.priorityBadge, { backgroundColor: item.priority === 'High' ? 'rgba(239, 68, 68, 0.1)' : 'rgba(245, 158, 11, 0.1)' }]}>
                  <Text style={[styles.priorityText, { color: item.priority === 'High' ? '#EF4444' : '#F59E0B' }]}>{item.priority}</Text>
                </View>
              </TouchableOpacity>
            )}
            contentContainerStyle={styles.list}
          />

          <TouchableOpacity style={styles.addBtn}>
            <LinearGradient colors={['#6366F1', '#4F46E5']} style={styles.addGradient}>
              <Ionicons name="add" size={24} color="#FFFFFF" />
              <Text style={styles.addBtnText}>New Assignment</Text>
            </LinearGradient>
          </TouchableOpacity>
        </LinearGradient>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalContent: { borderTopLeftRadius: 32, borderTopRightRadius: 32, padding: 24, height: '75%' },
  header: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 20 },
  title: { fontSize: 24, fontWeight: '800' },
  closeBtn: { padding: 4 },
  list: { gap: 12 },
  taskCard: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: '#FFFFFF', padding: 16, borderRadius: 20, ...Shadows.sm },
  darkCard: { backgroundColor: 'rgba(255,255,255,0.05)' },
  taskLeft: { flexDirection: 'row', alignItems: 'center', gap: 12, flex: 1 },
  checkCircle: { width: 24, height: 24, borderRadius: 12, borderWidth: 2, borderColor: '#6366F1', justifyContent: 'center', alignItems: 'center' },
  checkedCircle: { backgroundColor: '#6366F1' },
  taskTitle: { fontSize: 16, fontWeight: '700', color: '#1E293B' },
  taskSub: { fontSize: 12, color: '#64748B', marginTop: 2 },
  strikethrough: { textDecorationLine: 'line-through', color: '#94A3B8' },
  priorityBadge: { paddingVertical: 4, paddingHorizontal: 10, borderRadius: 8 },
  priorityText: { fontSize: 10, fontWeight: '800' },
  addBtn: { borderRadius: 20, overflow: 'hidden', marginTop: 20, marginBottom: 20 },
  addGradient: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', padding: 16, gap: 8 },
  addBtnText: { color: '#FFFFFF', fontSize: 16, fontWeight: '800' },
  textWhite: { color: '#FFFFFF' },
});

export default AssignmentManager;
