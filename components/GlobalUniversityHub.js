import React, { useState } from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  ScrollView,
  Image,
  TextInput
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

const { width, height } = Dimensions.get('window');

export default function GlobalUniversityHub({ visible, onClose, user, initialTab = 'research' }) {
  const [activeTab, setActiveTab] = useState(initialTab);

  React.useEffect(() => {
    if (visible && initialTab) {
      setActiveTab(initialTab);
    }
  }, [visible, initialTab]);

  const tabs = [
    { id: 'research', label: 'Research', icon: 'document-text' },
    { id: 'patents', label: 'Patents', icon: 'bulb' },
    { id: 'faculty', label: 'Faculty', icon: 'people' },
    { id: 'events', label: 'Global Events', icon: 'earth' },
  ];

  const renderResearch = () => (
    <View style={styles.tabContent}>
      <View style={styles.searchBar}>
        <Ionicons name="search" size={20} color="#94A3B8" />
        <TextInput placeholder="Search global publications..." style={styles.searchInput} />
      </View>
      
      <Text style={styles.sectionTitle}>Featured Publications</Text>
      {[1, 2, 3].map(i => (
        <TouchableOpacity key={i} style={styles.paperCard}>
          <View style={styles.paperHeader}>
            <View style={styles.journalBadge}><Text style={styles.journalText}>IEEE Access</Text></View>
            <Text style={styles.paperDate}>2 days ago</Text>
          </View>
          <Text style={styles.paperTitle}>Advancements in Edge Computing for IoT Systems: A Comprehensive Survey</Text>
          <Text style={styles.paperAuthors}>Dr. Emily Chen, Prof. Mark Thompson</Text>
          <View style={styles.paperFooter}>
            <View style={styles.stat}><Ionicons name="eye-outline" size={14} color="#64748B" /><Text style={styles.statText}>1.2k</Text></View>
            <View style={styles.stat}><Ionicons name="download-outline" size={14} color="#64748B" /><Text style={styles.statText}>450</Text></View>
            <TouchableOpacity style={styles.readButton}><Text style={styles.readButtonText}>Read Paper</Text></TouchableOpacity>
          </View>
        </TouchableOpacity>
      ))}
    </View>
  );

  const renderPatents = () => (
    <View style={styles.tabContent}>
      <LinearGradient colors={['#8B5CF6', '#6D28D9']} style={styles.patentHero}>
        <Ionicons name="bulb" size={40} color="#FFFFFF" />
        <Text style={styles.patentHeroTitle}>Patent Your Idea</Text>
        <Text style={styles.patentHeroSubtitle}>Connect with legal experts and file your inventions globally.</Text>
        <TouchableOpacity style={styles.fileButton}><Text style={styles.fileButtonText}>Start Filing Process</Text></TouchableOpacity>
      </LinearGradient>

      <Text style={styles.sectionTitle}>Recent Student Inventions</Text>
      <View style={styles.patentGrid}>
        {[
          { title: 'Solar Backpack', category: 'Energy', date: 'Oct 2025' },
          { title: 'AI Study Sync', category: 'Software', date: 'Sep 2025' }
        ].map((p, i) => (
          <View key={i} style={styles.miniPatentCard}>
            <Ionicons name="medal" size={24} color="#F59E0B" />
            <Text style={styles.miniPatentTitle}>{p.title}</Text>
            <Text style={styles.miniPatentCategory}>{p.category}</Text>
          </View>
        ))}
      </View>
    </View>
  );

  const renderFaculty = () => (
    <View style={styles.tabContent}>
      <Text style={styles.sectionTitle}>Global Faculty Directory</Text>
      <View style={styles.searchBar}>
        <Ionicons name="search" size={20} color="#94A3B8" />
        <TextInput placeholder="Search lecturers, researchers..." style={styles.searchInput} />
      </View>

      {[
        { name: 'Dr. Sarah Jenkins', dept: 'Applied AI', univ: 'Stanford University', status: 'Online' },
        { name: 'Prof. Kofi Mensah', dept: 'Computer Science', univ: 'KNUST', status: 'In Meeting' },
        { name: 'Dr. Elena Rossi', dept: 'Machine Learning', univ: 'MIT', status: 'Available' },
      ].map((faculty, i) => (
        <TouchableOpacity key={i} style={styles.paperCard}>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <View style={[styles.hubIconCircle, { backgroundColor: '#EEF2FF', marginRight: 15 }]}>
              <Ionicons name="person" size={20} color="#6366F1" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.paperTitle}>{faculty.name}</Text>
              <Text style={styles.paperAuthors}>{faculty.dept} • {faculty.univ}</Text>
            </View>
            <View style={{ alignItems: 'flex-end' }}>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <View style={[styles.onlineIndicator, { backgroundColor: faculty.status === 'Online' ? '#10B981' : '#F59E0B', width: 6, height: 6, borderRadius: 3, marginRight: 4 }]} />
                <Text style={{ fontSize: 10, color: '#64748B' }}>{faculty.status}</Text>
              </View>
              <TouchableOpacity style={[styles.readButton, { marginTop: 8, backgroundColor: '#F1F5F9' }]}>
                <Text style={[styles.readButtonText, { color: '#6366F1' }]}>Connect</Text>
              </TouchableOpacity>
            </View>
          </View>
        </TouchableOpacity>
      ))}
    </View>
  );

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.header}>
            <View>
              <Text style={styles.headerTitle}>Global University Hub</Text>
              <Text style={styles.headerSubtitle}>Connecting minds across the globe</Text>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}><Ionicons name="close" size={24} color="#64748B" /></TouchableOpacity>
          </View>

          <View style={styles.tabsRow}>
            {tabs.map(tab => (
              <TouchableOpacity 
                key={tab.id} 
                style={[styles.tab, activeTab === tab.id && styles.activeTab]}
                onPress={() => setActiveTab(tab.id)}
              >
                <Ionicons name={tab.icon} size={20} color={activeTab === tab.id ? '#6366F1' : '#94A3B8'} />
                <Text style={[styles.tabText, activeTab === tab.id && styles.activeTabText]}>{tab.label}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <ScrollView showsVerticalScrollIndicator={false} style={styles.mainScroll}>
            {activeTab === 'research' && renderResearch()}
            {activeTab === 'patents' && renderPatents()}
            {activeTab === 'faculty' && renderFaculty()}
            {activeTab === 'events' && <View style={styles.tabContent}><Text style={styles.emptyText}>Global events calendar coming soon!</Text></View>}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalContent: { backgroundColor: '#F8FAFC', borderTopLeftRadius: 30, borderTopRightRadius: 30, height: height * 0.9, paddingTop: 20 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, marginBottom: 20 },
  headerTitle: { fontSize: 22, fontWeight: 'bold', color: '#1E293B' },
  headerSubtitle: { fontSize: 13, color: '#64748B' },
  closeButton: { padding: 8, backgroundColor: '#F1F5F9', borderRadius: 20 },
  tabsRow: { flexDirection: 'row', paddingHorizontal: 20, gap: 10, marginBottom: 15 },
  tab: { flexDirection: 'row', alignItems: 'center', paddingVertical: 10, paddingHorizontal: 15, borderRadius: 20, backgroundColor: '#FFFFFF', gap: 8, elevation: 1 },
  activeTab: { borderBottomWidth: 2, borderBottomColor: '#6366F1' },
  tabText: { fontSize: 13, color: '#94A3B8', fontWeight: '600' },
  activeTabText: { color: '#6366F1' },
  mainScroll: { paddingHorizontal: 20 },
  tabContent: { paddingVertical: 10 },
  searchBar: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFFFFF', paddingHorizontal: 15, borderRadius: 15, height: 45, marginBottom: 20, elevation: 1 },
  searchInput: { flex: 1, marginLeft: 10, fontSize: 14 },
  sectionTitle: { fontSize: 16, fontWeight: 'bold', color: '#334155', marginBottom: 15 },
  paperCard: { backgroundColor: '#FFFFFF', borderRadius: 20, padding: 15, marginBottom: 15, elevation: 2 },
  paperHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 },
  journalBadge: { backgroundColor: '#EEF2FF', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 },
  journalText: { fontSize: 10, color: '#6366F1', fontWeight: 'bold' },
  paperDate: { fontSize: 10, color: '#94A3B8' },
  paperTitle: { fontSize: 15, fontWeight: 'bold', color: '#1E293B', marginBottom: 5 },
  paperAuthors: { fontSize: 12, color: '#64748B', marginBottom: 15 },
  paperFooter: { flexDirection: 'row', alignItems: 'center', borderTopWidth: 1, borderTopColor: '#F1F5F9', paddingTop: 10 },
  stat: { flexDirection: 'row', alignItems: 'center', gap: 4, marginRight: 15 },
  statText: { fontSize: 12, color: '#64748B' },
  readButton: { marginLeft: 'auto', backgroundColor: '#6366F1', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8 },
  readButtonText: { color: '#FFFFFF', fontSize: 12, fontWeight: 'bold' },
  patentHero: { padding: 20, borderRadius: 20, marginBottom: 20 },
  patentHeroTitle: { color: '#FFFFFF', fontSize: 20, fontWeight: 'bold', marginTop: 10 },
  patentHeroSubtitle: { color: 'rgba(255,255,255,0.8)', fontSize: 12, marginTop: 5, marginBottom: 15 },
  fileButton: { backgroundColor: '#FFFFFF', paddingVertical: 10, borderRadius: 10, alignItems: 'center' },
  fileButtonText: { color: '#6D28D9', fontWeight: 'bold' },
  patentGrid: { flexDirection: 'row', gap: 10 },
  miniPatentCard: { flex: 1, backgroundColor: '#FFFFFF', padding: 15, borderRadius: 15, alignItems: 'center', elevation: 1 },
  miniPatentTitle: { fontSize: 14, fontWeight: 'bold', color: '#1E293B', marginTop: 10 },
  miniPatentCategory: { fontSize: 10, color: '#64748B' },
  emptyText: { textAlign: 'center', color: '#94A3B8', marginTop: 40 }
});
