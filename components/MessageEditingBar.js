import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

export const MessageEditingBar = ({ 
  editingMessage, 
  onCancel, 
  onSave, 
  editText, 
  setEditText,
  isSending 
}) => {
  if (!editingMessage) return null;

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#F59E0B', '#F97316']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={styles.gradient}
      >
        <View style={styles.content}>
          <View style={styles.info}>
            <Ionicons name="pencil" size={16} color="#FFFFFF" />
            <Text style={styles.title}>Editing Message</Text>
          </View>
          
          <View style={styles.actions}>
            <TouchableOpacity 
              style={styles.actionButton}
              onPress={onCancel}
              disabled={isSending}
            >
              <Ionicons name="close" size={18} color="#FFFFFF" />
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.actionButton, styles.saveButton]}
              onPress={onSave}
              disabled={isSending || !editText.trim()}
            >
              {isSending ? (
                <Ionicons name="checkmark" size={18} color="#FFFFFF" />
              ) : (
                <Ionicons name="checkmark" size={18} color="#FFFFFF" />
              )}
            </TouchableOpacity>
          </View>
        </View>
      </LinearGradient>
      
      <View style={styles.preview}>
        <Text style={styles.originalText} numberOfLines={2}>
          Original: {editingMessage.text}
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFF7ED',
    borderTopWidth: 1,
    borderTopColor: '#FED7AA',
  },
  gradient: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  content: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  info: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  title: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 8,
  },
  actions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  saveButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
  },
  preview: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  originalText: {
    fontSize: 12,
    color: '#92400E',
    fontStyle: 'italic',
  },
});

export default MessageEditingBar;
