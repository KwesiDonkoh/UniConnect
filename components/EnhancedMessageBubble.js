import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import VoiceMessagePlayer from './VoiceMessagePlayer';

export const EnhancedMessageBubble = ({ 
  message, 
  isCurrentUser, 
  onLongPress,
  onPress,
  showAvatar = false 
}) => {
  const formatTime = (timestamp) => {
    if (!timestamp) return '';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const isDeleted = message.deletedForEveryone || 
    (message.deletedBy && message.deletedBy.includes(message.currentUserId));

  return (
    <TouchableOpacity
      style={[
        styles.container,
        isCurrentUser ? styles.currentUserContainer : styles.otherUserContainer
      ]}
      onLongPress={() => onLongPress(message)}
      onPress={() => onPress?.(message)}
      activeOpacity={0.8}
    >
      {showAvatar && !isCurrentUser && (
        <LinearGradient
          colors={message.senderType === 'lecturer' ? ['#7C3AED', '#A855F7'] : ['#4F46E5', '#6366F1']}
          style={styles.avatar}
        >
          <Text style={styles.avatarText}>
            {message.senderName?.split(' ').map(n => n[0]).join('').toUpperCase() || 'U'}
          </Text>
        </LinearGradient>
      )}
      
      <View style={[
        styles.bubble,
        isCurrentUser ? styles.currentUserBubble : styles.otherUserBubble,
        isDeleted && styles.deletedBubble
      ]}>
        {/* Message Content */}
        {isDeleted ? (
          <View style={styles.deletedContent}>
            <Ionicons name="trash-outline" size={16} color="#94A3B8" />
            <Text style={styles.deletedText}>This message was deleted</Text>
          </View>
        ) : (
          <>
            {/* Reply Preview */}
            {message.replyTo && (
              <View style={styles.replyPreview}>
                <View style={styles.replyLine} />
                <View style={styles.replyContent}>
                  <Text style={styles.replyAuthor}>{message.replyTo.senderName}</Text>
                  <Text style={styles.replyText} numberOfLines={1}>
                    {message.replyTo.text}
                  </Text>
                </View>
              </View>
            )}
            
            {/* Message Text */}
            <Text style={[
              styles.messageText,
              isCurrentUser ? styles.currentUserText : styles.otherUserText
            ]}>
              {message.text}
            </Text>
            
            {/* Voice Message */}
            {message.type === 'voice' && (
              <VoiceMessagePlayer 
                message={message}
                isCurrentUser={isCurrentUser}
              />
            )}
          </>
        )}
        
        {/* Message Footer */}
        <View style={styles.messageFooter}>
          <Text style={[
            styles.timestamp,
            isCurrentUser ? styles.currentUserTimestamp : styles.otherUserTimestamp
          ]}>
            {formatTime(message.timestamp)}
          </Text>
          
          {/* Edited Indicator */}
          {message.isEdited && !isDeleted && (
            <Text style={[
              styles.editedText,
              isCurrentUser ? styles.currentUserEdited : styles.otherUserEdited
            ]}>
              edited
            </Text>
          )}
          
          {/* Message Status (for current user) */}
          {isCurrentUser && !isDeleted && (
            <View style={styles.messageStatus}>
              {message.status === 'sending' && (
                <Ionicons name="time-outline" size={12} color="rgba(255,255,255,0.6)" />
              )}
              {message.status === 'sent' && (
                <Ionicons name="checkmark" size={12} color="rgba(255,255,255,0.6)" />
              )}
              {message.status === 'delivered' && (
                <View style={styles.doubleCheck}>
                  <Ionicons name="checkmark" size={12} color="rgba(255,255,255,0.6)" />
                  <Ionicons name="checkmark" size={12} color="rgba(255,255,255,0.6)" style={styles.secondCheck} />
                </View>
              )}
              {message.status === 'read' && (
                <View style={styles.doubleCheck}>
                  <Ionicons name="checkmark" size={12} color="#10B981" />
                  <Ionicons name="checkmark" size={12} color="#10B981" style={styles.secondCheck} />
                </View>
              )}
            </View>
          )}
        </View>
        
        {/* Reactions */}
        {message.reactions && Object.keys(message.reactions).length > 0 && (
          <View style={styles.reactions}>
            {Object.entries(message.reactions).map(([emoji, users]) => (
              <TouchableOpacity
                key={emoji}
                style={styles.reaction}
                onPress={() => onReactionPress?.(message, emoji)}
              >
                <Text style={styles.reactionEmoji}>{emoji}</Text>
                <Text style={styles.reactionCount}>{users.length}</Text>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    marginVertical: 2,
    paddingHorizontal: 16,
  },
  currentUserContainer: {
    justifyContent: 'flex-end',
  },
  otherUserContainer: {
    justifyContent: 'flex-start',
  },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
    marginTop: 4,
  },
  avatarText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: 'bold',
  },
  bubble: {
    maxWidth: '80%',
    borderRadius: 18,
    paddingHorizontal: 14,
    paddingVertical: 8,
    position: 'relative',
  },
  currentUserBubble: {
    backgroundColor: '#4F46E5',
    borderBottomRightRadius: 4,
  },
  otherUserBubble: {
    backgroundColor: '#F1F5F9',
    borderBottomLeftRadius: 4,
  },
  deletedBubble: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    opacity: 0.7,
  },
  deletedContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  deletedText: {
    fontSize: 14,
    color: '#94A3B8',
    fontStyle: 'italic',
  },
  replyPreview: {
    flexDirection: 'row',
    marginBottom: 6,
    paddingBottom: 6,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.2)',
  },
  replyLine: {
    width: 3,
    backgroundColor: '#F59E0B',
    borderRadius: 2,
    marginRight: 8,
  },
  replyContent: {
    flex: 1,
  },
  replyAuthor: {
    fontSize: 12,
    fontWeight: '600',
    color: '#F59E0B',
    marginBottom: 2,
  },
  replyText: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.8)',
  },
  messageText: {
    fontSize: 16,
    lineHeight: 20,
  },
  currentUserText: {
    color: '#FFFFFF',
  },
  otherUserText: {
    color: '#1E293B',
  },
  voiceMessage: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 4,
  },
  playButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  waveform: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 1,
    flex: 1,
  },
  waveBar: {
    width: 2,
    borderRadius: 1,
  },
  duration: {
    fontSize: 12,
    fontWeight: '500',
  },
  messageFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    marginTop: 4,
    gap: 4,
  },
  timestamp: {
    fontSize: 11,
  },
  currentUserTimestamp: {
    color: 'rgba(255,255,255,0.7)',
  },
  otherUserTimestamp: {
    color: '#94A3B8',
  },
  editedText: {
    fontSize: 10,
    fontStyle: 'italic',
  },
  currentUserEdited: {
    color: 'rgba(255,255,255,0.5)',
  },
  otherUserEdited: {
    color: '#94A3B8',
  },
  messageStatus: {
    marginLeft: 2,
  },
  doubleCheck: {
    flexDirection: 'row',
    position: 'relative',
  },
  secondCheck: {
    marginLeft: -8,
  },
  reactions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 4,
    marginTop: 4,
  },
  reaction: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.1)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 12,
    gap: 2,
  },
  reactionEmoji: {
    fontSize: 12,
  },
  reactionCount: {
    fontSize: 10,
    color: 'rgba(255,255,255,0.8)',
    fontWeight: '600',
  },
});

export default EnhancedMessageBubble;
