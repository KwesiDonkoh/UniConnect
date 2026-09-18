import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Dimensions,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../components/ThemeProvider';
import { useApp } from '../context/AppContext';

const { width } = Dimensions.get('window');

const RESEARCH_TABS = [
  { id: 'explorer', label: 'Paper Explorer', icon: 'search' },
  { id: 'roadmap', label: 'Roadmap', icon: 'map' },
  { id: 'citation', label: 'Citations', icon: 'bookmark' },
  { id: 'proposal', label: 'Proposal AI', icon: 'document-text', lecturerOnly: true },
];

export default function AIResearchAssistantScreen({ navigation }) {
  const { isDark } = useTheme();
  const { user } = useApp();
  const [activeTab, setActiveTab] = useState('explorer');
  const [query, setQuery] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [results, setResults] = useState([]);

  const isLecturer = user?.userType === 'lecturer';

  const handleSearch = () => {
    if (!query) return;
    setIsGenerating(true);
    setResults([]);
    
    // Simulate AI Search
    setTimeout(() => {
      setIsGenerating(false);
      setResults([
        {
          id: '1',
          title: 'Deep Learning in Modern University Ecosystems',
          authors: 'Dr. Sarah Chen, et al.',
          year: '2025',
          relevance: '98%',
          summary: 'A comprehensive study on how agentic AI models are transforming student engagement in West African universities.',
        },
        {
          id: '2',
          title: 'Blockchain for Academic Credentialing',
          authors: 'Prof. Kwesi Mensah',
          year: '2024',
          relevance: '85%',
          summary: 'Exploring decentralized ledgers for micro-credentialing in the Global South.',
        },
      ]);
    }, 2000);
  };

  const renderExplorer = () => (
    <View style={styles.tabContent}>
      <View style={[styles.searchBox, isDark && styles.darkCard]}>
        <TextInput
          style={[styles.searchInput, isDark && { color: '#FFF' }]}
          placeholder="Search for papers, topics or researchers..."
          placeholderTextColor="#94A3B8"
          value={query}
          onChangeText={setQuery}
        />
        <TouchableOpacity style={styles.searchBtn} onPress={handleSearch}>
          <Ionicons name="sparkles" size={20} color="#FFF" />
        </TouchableOpacity>
      </View>

      {isGenerating ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#4F46E5" />
          <Text style={styles.loadingText}>AI is scanning global databases...</Text>
        </View>
      ) : (
        <ScrollView showsVerticalScrollIndicator={false}>
          {results.map(item => (
            <TouchableOpacity key={item.id} style={[styles.resultCard, isDark && styles.darkCard]}>
              <View style={styles.cardHeader}>
                <View style={styles.relevanceBadge}>
                  <Text style={styles.relevanceText}>{item.relevance} Match</Text>
                </View>
                <Text style={styles.yearText}>{item.year}</Text>
              </View>
              <Text style={[styles.paperTitle, isDark && { color: '#FFF' }]}>{item.title}</Text>
              <Text style={styles.authorsText}>{item.authors}</Text>
              <Text style={styles.summaryText} numberOfLines={3}>{item.summary}</Text>
              
              <View style={styles.cardActions}>
                <TouchableOpacity style={styles.actionBtn}>
                  <Ionicons name="download-outline" size={18} color="#4F46E5" />
                  <Text style={styles.actionText}>PDF</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.actionBtn}>
                  <Ionicons name="chatbox-ellipses-outline" size={18} color="#4F46E5" />
                  <Text style={styles.actionText}>Discuss</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.citeBtn}>
                  <Text style={styles.citeBtnText}>Cite</Text>
                </TouchableOpacity>
              </View>
            </TouchableOpacity>
          ))}
        </ScrollView>
      )}
    </View>
  );

  const renderRoadmap = () => (
    <View style={styles.tabContent}>
      <View style={styles.roadmapHeader}>
        <Ionicons name="analytics" size={40} color="#4F46E5" />
        <Text style={[styles.roadmapTitle, isDark && { color: '#FFF' }]}>Research Roadmap AI</Text>
        <Text style={styles.roadmapSubtitle}>Generate a step-by-step plan for your thesis or project.</Text>
      </View>

      <TouchableOpacity 
        style={styles.generateRoadmapBtn}
        onPress={() => Alert.alert('Processing', 'AI is outlining your research strategy...')}
      >
        <LinearGradient colors={['#4F46E5', '#6366F1']} style={styles.gradientBtn}>
          <Text style={styles.gradientBtnText}>Generate Roadmap from Topic</Text>
        </LinearGradient>
      </TouchableOpacity>

      <View style={styles.roadmapSteps}>
        {[
          { icon: 'search', title: 'Phase 1: Literature Review', desc: 'Identify 5-10 core papers and define your gap.' },
          { icon: 'create', title: 'Phase 2: Methodology', desc: 'Design your survey or experimental framework.' },
          { icon: 'stats-chart', title: 'Phase 3: Data Analysis', desc: 'Pre-process results and apply statistical models.' },
        ].map((step, idx) => (
          <View key={idx} style={[styles.stepItem, isDark && styles.darkCard]}>
            <View style={styles.stepIconContainer}>
              <Ionicons name={step.icon} size={24} color="#6366F1" />
            </View>
            <View style={styles.stepInfo}>
              <Text style={[styles.stepTitle, isDark && { color: '#FFF' }]}>{step.title}</Text>
              <Text style={styles.stepDesc}>{step.desc}</Text>
            </View>
          </View>
        ))}
      </View>
    </View>
  );

  return (
    <SafeAreaView style={[styles.container, isDark && styles.darkContainer]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="chevron-back" size={24} color={isDark ? '#FFF' : '#1E293B'} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, isDark && { color: '#FFF' }]}>AI Research Assistant</Text>
        <TouchableOpacity>
          <Ionicons name="ellipsis-horizontal" size={24} color={isDark ? '#FFF' : '#1E293B'} />
        </TouchableOpacity>
      </View>

      <View style={styles.tabsContainer}>
        {RESEARCH_TABS.filter(t => !t.lecturerOnly || isLecturer).map(tab => (
          <TouchableOpacity
            key={tab.id}
            style={[
              styles.tab,
              activeTab === tab.id && styles.activeTab,
              isDark && activeTab === tab.id && { backgroundColor: '#4F46E5' }
            ]}
            onPress={() => setActiveTab(tab.id)}
          >
            <Ionicons 
              name={tab.icon} 
              size={18} 
              color={activeTab === tab.id ? '#FFF' : '#64748B'} 
            />
            <Text style={[
              styles.tabLabel,
              activeTab === tab.id && styles.activeTabLabel,
              isDark && activeTab !== tab.id && { color: '#94A3B8' }
            ]}>
              {tab.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <View style={styles.content}>
        {activeTab === 'explorer' && renderExplorer()}
        {activeTab === 'roadmap' && renderRoadmap()}
        {activeTab === 'citation' && (
          <View style={styles.placeholderContainer}>
             <Ionicons name="bookmark" size={80} color="#CBD5E1" />
             <Text style={styles.placeholderText}>Citation Machine is ready</Text>
          </View>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  darkContainer: {
    backgroundColor: '#0F172A',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#1E293B',
  },
  tabsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    marginTop: 10,
    gap: 10,
  },
  tab: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    backgroundColor: '#FFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    gap: 6,
  },
  activeTab: {
    backgroundColor: '#4F46E5',
    borderColor: '#4F46E5',
  },
  tabLabel: {
    fontSize: 13,
    color: '#64748B',
    fontWeight: '600',
  },
  activeTabLabel: {
    color: '#FFF',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  tabContent: {
    flex: 1,
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
  },
  searchBtn: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: '#4F46E5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 15,
  },
  loadingText: {
    fontSize: 14,
    color: '#64748B',
    fontStyle: 'italic',
  },
  resultCard: {
    backgroundColor: '#FFF',
    borderRadius: 20,
    padding: 20,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  darkCard: {
    backgroundColor: '#1E293B',
    borderColor: '#334155',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  relevanceBadge: {
    backgroundColor: '#DCFCE7',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  relevanceText: {
    color: '#166534',
    fontSize: 11,
    fontWeight: '800',
  },
  yearText: {
    fontSize: 12,
    color: '#94A3B8',
    fontWeight: '600',
  },
  paperTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1E293B',
    lineHeight: 22,
    marginBottom: 6,
  },
  authorsText: {
    fontSize: 13,
    color: '#6366F1',
    fontWeight: '600',
    marginBottom: 10,
  },
  summaryText: {
    fontSize: 13,
    color: '#64748B',
    lineHeight: 18,
    marginBottom: 15,
  },
  cardActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 15,
  },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  actionText: {
    fontSize: 12,
    color: '#4F46E5',
    fontWeight: '700',
  },
  citeBtn: {
    marginLeft: 'auto',
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  citeBtnText: {
    fontSize: 12,
    color: '#4F46E5',
    fontWeight: '800',
  },
  roadmapHeader: {
    alignItems: 'center',
    marginBottom: 30,
    marginTop: 10,
  },
  roadmapTitle: {
    fontSize: 22,
    fontWeight: '900',
    color: '#1E293B',
    marginTop: 15,
  },
  roadmapSubtitle: {
    fontSize: 14,
    color: '#64748B',
    textAlign: 'center',
    marginTop: 8,
    paddingHorizontal: 20,
  },
  generateRoadmapBtn: {
    marginBottom: 30,
  },
  gradientBtn: {
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: 'center',
  },
  gradientBtnText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '800',
  },
  roadmapSteps: {
    gap: 15,
  },
  stepItem: {
    flexDirection: 'row',
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    gap: 15,
  },
  stepIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: '#EEF2FF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  stepInfo: {
    flex: 1,
  },
  stepTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1E293B',
    marginBottom: 4,
  },
  stepDesc: {
    fontSize: 12,
    color: '#64748B',
    lineHeight: 16,
  },
  placeholderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderText: {
    fontSize: 16,
    color: '#94A3B8',
    fontWeight: '600',
    marginTop: 10,
  },
});
