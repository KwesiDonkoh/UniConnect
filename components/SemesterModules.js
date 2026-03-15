import React from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  ScrollView,
  FlatList
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

const { width, height } = Dimensions.get('window');

export default function SemesterModules({ visible, onClose, user, courses }) {
  const currentLevelModules = Array.isArray(courses) ? courses : [];
  
  const renderModuleCard = ({ item }) => (
    <View style={styles.moduleCard}>
      <View style={styles.moduleHeader}>
        <View style={styles.moduleInfo}>
          <Text style={styles.moduleCode}>{item.code}</Text>
          <Text style={styles.moduleName}>{item.name}</Text>
        </View>
        <LinearGradient
          colors={['#10B981', '#059669']}
          style={styles.creditBadge}
        >
          <Text style={styles.creditText}>{item.credits || 3} CR</Text>
        </LinearGradient>
      </View>

      <View style={styles.moduleDetails}>
        <View style={styles.detailItem}>
          <Ionicons name="person-outline" size={16} color="#64748B" />
          <Text style={styles.detailText}>{item.lecturer || 'Dr. Mensah'}</Text>
        </View>
        <View style={styles.detailItem}>
          <Ionicons name="time-outline" size={16} color="#64748B" />
          <Text style={styles.detailText}>{item.schedule || 'Mon, Wed 10:00 AM'}</Text>
        </View>
      </View>

      <View style={styles.progressContainer}>
        <View style={styles.progressHeader}>
          <Text style={styles.progressLabel}>Current Attendance</Text>
          <Text style={styles.progressValue}>{item.attendance || '85'}%</Text>
        </View>
        <View style={styles.progressTrack}>
          <View style={[styles.progressFill, { width: `${item.attendance || 85}%` }]} />
        </View>
      </View>

      <TouchableOpacity style={styles.viewMaterialsButton}>
        <Text style={styles.viewMaterialsText}>View Course Materials</Text>
        <Ionicons name="arrow-forward" size={16} color="#6366F1" />
      </TouchableOpacity>
    </View>
  );

  return (
    <Modal visible={visible} transparent={true} animationType="slide" onRequestClose={onClose}>
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.header}>
            <View>
              <Text style={styles.headerTitle}>Semester Modules</Text>
              <Text style={styles.headerSubtitle}>
                Level {user?.academicLevel || '300'} • {currentLevelModules.length} Courses
              </Text>
            </View>
            <TouchableOpacity style={styles.closeButton} onPress={onClose}>
              <Ionicons name="close" size={24} color="#64748B" />
            </TouchableOpacity>
          </View>

          <FlatList
            data={currentLevelModules}
            renderItem={renderModuleCard}
            keyExtractor={(item) => item.code}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <Ionicons name="book-outline" size={60} color="#CBD5E1" />
                <Text style={styles.emptyText}>No modules found for this semester.</Text>
              </View>
            }
          />
        </View>
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
  modalContent: {
    backgroundColor: '#F8FAFC',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    height: height * 0.9,
    paddingTop: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1E293B',
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#64748B',
    marginTop: 2,
  },
  closeButton: {
    padding: 8,
    backgroundColor: '#F1F5F9',
    borderRadius: 20,
  },
  listContent: {
    padding: 20,
    paddingBottom: 40,
  },
  moduleCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 20,
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
  },
  moduleHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 15,
  },
  moduleInfo: {
    flex: 1,
    marginRight: 10,
  },
  moduleCode: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#6366F1',
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  moduleName: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1E293B',
  },
  creditBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  creditText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: 'bold',
  },
  moduleDetails: {
    flexDirection: 'row',
    gap: 15,
    marginBottom: 15,
    paddingBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  detailText: {
    fontSize: 13,
    color: '#64748B',
  },
  progressContainer: {
    marginBottom: 15,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  progressLabel: {
    fontSize: 13,
    color: '#64748B',
  },
  progressValue: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#1E293B',
  },
  progressTrack: {
    height: 6,
    backgroundColor: '#F1F5F9',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#10B981',
  },
  viewMaterialsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 10,
    backgroundColor: '#EEF2FF',
    borderRadius: 12,
  },
  viewMaterialsText: {
    color: '#6366F1',
    fontSize: 14,
    fontWeight: '600',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 60,
  },
  emptyText: {
    fontSize: 16,
    color: '#94A3B8',
    textAlign: 'center',
    marginTop: 20,
  },
});
