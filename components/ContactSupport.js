import React from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, Dimensions, ScrollView, Linking } from 'react-native';
import { BlurView } from 'expo-blur';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

const { width, height } = Dimensions.get('window');

const ContactSupport = ({ visible, onClose, isDark }) => {
  const channels = [
    { name: 'Email Support', icon: 'mail', value: 'support@uniconnect.knust.edu', color: '#6366F1' },
    { name: 'WhatsApp HQ', icon: 'logo-whatsapp', value: '+233 24 555 0123', color: '#10B981' },
    { name: 'Discord Community', icon: 'logo-discord', value: 'UniConnect KNUST', color: '#5865F2' },
  ];

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <BlurView intensity={100} tint={isDark ? 'dark' : 'light'} style={StyleSheet.absoluteFill} />
        
        <View style={[styles.modalContent, isDark && styles.darkModal]}>
          <TouchableOpacity style={styles.closeBtn} onPress={onClose}>
            <Ionicons name="close" size={28} color={isDark ? '#FFF' : '#000'} />
          </TouchableOpacity>

          <Text style={[styles.title, isDark && styles.whiteText]}>Contact Us</Text>
          <Text style={styles.subtitle}>WE ARE ALWAYS ONLINE</Text>

          <ScrollView style={styles.channelScroll} showsVerticalScrollIndicator={false}>
            {channels.map(channel => (
              <TouchableOpacity key={channel.name} style={[styles.channelCard, isDark && styles.darkCard]}>
                <View style={[styles.iconBg, { backgroundColor: channel.color }]}>
                  <Ionicons name={channel.icon} size={24} color="#FFF" />
                </View>
                <View style={styles.channelInfo}>
                  <Text style={[styles.channelName, isDark && styles.whiteText]}>{channel.name}</Text>
                  <Text style={styles.channelValue}>{channel.value}</Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color="#94A3B8" />
              </TouchableOpacity>
            ))}
          </ScrollView>

          <View style={styles.footer}>
            <Text style={styles.footerText}>KNUST Innovation Center, Kumasi</Text>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  modalContent: { width: width * 0.9, padding: 30, backgroundColor: '#FFF', borderRadius: 40 },
  darkModal: { backgroundColor: '#0F172A' },
  closeBtn: { alignSelf: 'flex-end' },
  title: { fontSize: 24, fontWeight: '900', color: '#1E293B', textAlign: 'center', marginTop: 10 },
  whiteText: { color: '#FFF' },
  subtitle: { fontSize: 10, fontWeight: '900', color: '#6366F1', letterSpacing: 2, textAlign: 'center', marginTop: 4, marginBottom: 30 },
  channelScroll: { flex: 0 },
  channelCard: { flexDirection: 'row', alignItems: 'center', padding: 20, backgroundColor: '#F8FAFC', borderRadius: 24, marginBottom: 15 },
  darkCard: { backgroundColor: 'rgba(255,255,255,0.05)' },
  iconBg: { width: 48, height: 48, borderRadius: 16, justifyContent: 'center', alignItems: 'center' },
  channelInfo: { flex: 1, marginLeft: 15 },
  channelName: { fontSize: 14, fontWeight: '800', color: '#1E293B' },
  channelValue: { fontSize: 11, color: '#64748B', marginTop: 2 },
  footer: { marginTop: 20, alignItems: 'center' },
  footerText: { fontSize: 10, color: '#94A3B8', fontWeight: '700' },
});

export default ContactSupport;
