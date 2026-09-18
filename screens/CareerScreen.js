import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, SafeAreaView, Dimensions, Image, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { useTheme } from '../components/ThemeProvider';
import { useApp } from '../context/AppContext';

const { width } = Dimensions.get('window');

export default function CareerScreen({ navigation }) {
  const { isDark } = useTheme();
  const { user } = useApp();
  const [activeTab, setActiveTab] = useState('Jobs');
  const [appliedJobs, setAppliedJobs] = useState([]);

  const jobs = [
    { id: 1, title: 'Junior Software Engineer', company: 'Tech Hub Ltd', loc: 'Accra', salary: 'GH₵ 8k - 12k', tags: ['Remote', 'Full-time'] },
    { id: 2, title: 'Data Analyst Intern', company: 'Global Data', loc: 'Kumasi', salary: 'GH₵ 3k - 5k', tags: ['Hybrid', 'Internship'] },
    { id: 3, title: 'UI/UX Designer', company: 'Creative Studio', loc: 'Accra', salary: 'GH₵ 6k - 9k', tags: ['On-site', 'Part-time'] },
  ];

  const applyForJob = (job) => {
    if (appliedJobs.includes(job.id)) return Alert.alert('Already Applied', 'You have already submitted an application for this position.');
    
    Alert.alert('Apply Now', `Apply for ${job.title} at ${job.company}? Your UniConnect AI-generated profile will be sent as your resume.`, [
      { text: 'Cancel' },
      { text: 'Apply', onPress: () => {
        setAppliedJobs([...appliedJobs, job.id]);
        Alert.alert('Success', 'Application submitted! Track your status in the Applications tab.');
      }}
    ]);
  };

  return (
    <SafeAreaView style={[styles.container, isDark && styles.darkContainer]}>
      <LinearGradient colors={isDark ? ['#0F172A', '#1E1B4B'] : ['#F8FAFC', '#EFF6FF']} style={styles.background}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color={isDark ? '#FFF' : '#1E293B'} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, isDark && styles.darkText]}>Career Services</Text>
          <TouchableOpacity style={styles.profileBtn} onPress={() => navigation.navigate('Profile')}>
             <Ionicons name="person-circle-outline" size={28} color="#4F46E5" />
          </TouchableOpacity>
        </View>

        <View style={styles.tabContainer}>
           {['Jobs', 'Mentorship', 'Resume AI'].map(tab => (
             <TouchableOpacity key={tab} onPress={() => setActiveTab(tab)} style={[styles.tab, activeTab === tab && styles.activeTab]}>
                <Text style={[styles.tabText, activeTab === tab && styles.activeTabText]}>{tab}</Text>
             </TouchableOpacity>
           ))}
        </View>

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
          {activeTab === 'Jobs' ? (
            <>
              <Text style={[styles.sectionTitle, isDark && styles.darkText]}>Recommended for you</Text>
              {jobs.map(job => (
                <TouchableOpacity key={job.id} style={styles.jobCard} onPress={() => applyForJob(job)}>
                  <BlurView intensity={isDark ? 20 : 40} tint={isDark ? 'dark' : 'light'} style={styles.jobBlur}>
                    <View style={styles.jobHeader}>
                       <View style={styles.companyLogo}><Text style={styles.logoText}>{job.company[0]}</Text></View>
                       <View style={styles.jobTitleArea}>
                          <Text style={[styles.jobTitle, isDark && styles.darkText]}>{job.title}</Text>
                          <Text style={styles.companyName}>{job.company}</Text>
                       </View>
                       {appliedJobs.includes(job.id) && <Ionicons name="checkmark-circle" size={20} color="#10B981" />}
                    </View>
                    <View style={styles.jobMeta}>
                       <Text style={styles.metaText}><Ionicons name="location-outline" size={12} /> {job.loc}</Text>
                       <Text style={styles.metaText}><Ionicons name="cash-outline" size={12} /> {job.salary}</Text>
                    </View>
                    <View style={styles.tagRow}>
                       {job.tags.map(tag => (
                         <View key={tag} style={styles.tag}><Text style={styles.tagText}>{tag}</Text></View>
                       ))}
                    </View>
                  </BlurView>
                </TouchableOpacity>
              ))}
            </>
          ) : activeTab === 'Resume AI' ? (
            <View style={styles.aiSection}>
               <LinearGradient colors={['#4F46E5', '#7C3AED']} style={styles.aiCard}>
                  <Ionicons name="sparkles" size={40} color="#FFF" />
                  <Text style={styles.aiTitle}>AI Resume Optimizer</Text>
                  <Text style={styles.aiSub}>Let UniConnect AI analyze your skills and extracurriculars to build a high-conversion resume.</Text>
                  <TouchableOpacity style={styles.aiBtn} onPress={() => Alert.alert('AI Processing', 'Generating your optimized resume based on course performance and project history...')}>
                    <Text style={styles.aiBtnText}>Generate Resume</Text>
                  </TouchableOpacity>
               </LinearGradient>
               
               <View style={styles.tipCard}>
                  <Text style={styles.tipTitle}>💡 Career Tip</Text>
                  <Text style={styles.tipText}>85% of jobs are filled through networking. Explore the Alumni portal to connect with professionals.</Text>
               </View>
            </View>
          ) : (
            <View style={styles.emptyState}>
              <Ionicons name="people-outline" size={60} color="#CBD5E1" />
              <Text style={styles.emptyText}>Mentorship portal opening soon!</Text>
            </View>
          )}
        </ScrollView>
      </LinearGradient>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  darkContainer: { backgroundColor: '#0F172A' },
  background: { flex: 1 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 20 },
  backButton: { width: 44, height: 44, borderRadius: 15, backgroundColor: 'rgba(79, 70, 229, 0.05)', alignItems: 'center', justifyContent: 'center' },
  headerTitle: { fontSize: 22, fontWeight: '800', color: '#1E293B' },
  profileBtn: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center' },
  tabContainer: { flexDirection: 'row', paddingHorizontal: 20, marginBottom: 15, borderBottomWidth: 1, borderBottomColor: 'rgba(0,0,0,0.05)' },
  tab: { flex: 1, paddingVertical: 12, alignItems: 'center' },
  activeTab: { borderBottomWidth: 3, borderBottomColor: '#4F46E5' },
  tabText: { fontSize: 13, fontWeight: '700', color: '#64748B' },
  activeTabText: { color: '#4F46E5' },
  scrollContent: { padding: 20 },
  sectionTitle: { fontSize: 18, fontWeight: '800', color: '#1E293B', marginBottom: 15 },
  jobCard: { borderRadius: 24, overflow: 'hidden', marginBottom: 15, borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' },
  jobBlur: { padding: 20 },
  jobHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 15 },
  companyLogo: { width: 45, height: 45, borderRadius: 12, backgroundColor: '#4F46E5', alignItems: 'center', justifyContent: 'center' },
  logoText: { color: '#FFF', fontSize: 18, fontWeight: '900' },
  jobTitleArea: { flex: 1, marginLeft: 15 },
  jobTitle: { fontSize: 16, fontWeight: '800', color: '#1E293B' },
  companyName: { fontSize: 13, color: '#64748B', marginTop: 2 },
  jobMeta: { flexDirection: 'row', marginBottom: 15, gap: 15 },
  metaText: { fontSize: 12, color: '#64748B', fontWeight: '600' },
  tagRow: { flexDirection: 'row', gap: 10 },
  tag: { paddingHorizontal: 10, paddingVertical: 5, borderRadius: 8, backgroundColor: 'rgba(79, 70, 229, 0.1)' },
  tagText: { fontSize: 10, color: '#4F46E5', fontWeight: '800' },
  aiSection: { gap: 20 },
  aiCard: { padding: 30, borderRadius: 30, alignItems: 'center' },
  aiTitle: { color: '#FFF', fontSize: 22, fontWeight: '900', marginTop: 15 },
  aiSub: { color: 'rgba(255,255,255,0.8)', textAlign: 'center', marginTop: 10, lineHeight: 18, fontSize: 14 },
  aiBtn: { backgroundColor: '#FFF', paddingHorizontal: 30, paddingVertical: 15, borderRadius: 15, marginTop: 20 },
  aiBtnText: { color: '#4F46E5', fontWeight: '900' },
  tipCard: { backgroundColor: '#FFFBEB', padding: 20, borderRadius: 20, borderWidth: 1, borderColor: '#FEF3C7' },
  tipTitle: { fontSize: 14, fontWeight: '900', color: '#92400E', marginBottom: 5 },
  tipText: { fontSize: 13, color: '#B45309', lineHeight: 18 },
  emptyState: { alignItems: 'center', marginTop: 50 },
  emptyText: { color: '#94A3B8', marginTop: 10, fontWeight: '600' },
  darkText: { color: '#FFF' },
});
