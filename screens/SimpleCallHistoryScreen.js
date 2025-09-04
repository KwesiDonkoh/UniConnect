import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  SafeAreaView,
  ActivityIndicator,
  Animated,
  RefreshControl,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { StatusBar } from 'expo-status-bar';
import { useApp } from '../context/AppContext';
import { Colors } from '../themes/modernTheme';
import simpleCallingService from '../services/simpleCallingService';

export default function SimpleCallHistoryScreen({ navigation }) {
  const appContext = useApp();
  const { user } = appContext || {};
  const [calls, setCalls] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fadeAnim = useRef(new Animated.Value(0)).current;

  // Early return if user data is not available
  if (!user) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar style="light" />
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading...</Text>
        </View>
      </SafeAreaView>
    );
  }

  useEffect(() => {
    if (user) {
      loadCallHistory();
      
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }).start();
    }
  }, [user]);

  const loadCallHistory = async () => {
    if (!user?.uid) return;

    try {
      setLoading(true);
      const result = await simpleCallingService.getCallHistory(user.uid);
      if (result.success) {
        setCalls(result.calls);
      } else {
        Alert.alert('Error', result.error || 'Failed to load call history');
      }
    } catch (error) {
      console.error('Error loading call history:', error);
      Alert.alert('Error', 'Failed to load call history');
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadCallHistory();
    setRefreshing(false);
  };

  const formatCallDuration = (startTime, endTime) => {
    if (!endTime) return 'Not connected';
    
    const duration = Math.floor((endTime - startTime) / 1000);
    const minutes = Math.floor(duration / 60);
    const seconds = duration % 60;
    
    if (minutes === 0) {
      return `${seconds}s`;
    }
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const getCallStatusColor = (status) => {
    switch (status) {
      case 'connected':
        return Colors.success[500];
      case 'missed':
      case 'rejected':
        return Colors.error[500];
      case 'ended':
        return Colors.info[500];
      default:
        return Colors.neutral[500];
    }
  };

  const getCallStatusText = (call) => {
    if (call.direction === 'incoming') {
      switch (call.status) {
        case 'connected':
          return 'Incoming';
        case 'rejected':
          return 'Declined';
        case 'missed':
          return 'Missed';
        default:
          return 'Incoming';
      }
    } else {
      switch (call.status) {
        case 'connected':
          return 'Outgoing';
        case 'rejected':
          return 'Declined';
        case 'missed':
          return 'No answer';
        default:
          return 'Outgoing';
      }
    }
  };

  const handleCallBack = async (call) => {
    const otherParticipant = call.direction === 'incoming' 
      ? { id: call.callerId, name: call.callerName, avatar: call.callerAvatar }
      : { id: call.receiverId, name: call.receiverName, avatar: call.receiverAvatar };

    Alert.alert(
      'Call Back',
      `Call ${otherParticipant.name}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Voice Call', 
          onPress: () => startCall('voice', otherParticipant) 
        },
        { 
          text: 'Video Call', 
          onPress: () => startCall('video', otherParticipant) 
        },
      ]
    );
  };

  const startCall = async (type, participant) => {
    const result = type === 'voice' 
      ? await simpleCallingService.startVoiceCall(participant.id, participant.name, participant.avatar)
      : await simpleCallingService.startVideoCall(participant.id, participant.name, participant.avatar);

    if (result.success) {
      Alert.alert('Success', `${type} call started!`);
    } else {
      Alert.alert('Error', result.error || `Failed to start ${type} call`);
    }
  };

  const renderCallItem = ({ item, index }) => {
    const otherParticipant = item.direction === 'incoming' 
      ? { name: item.callerName, avatar: item.callerAvatar }
      : { name: item.receiverName, avatar: item.receiverAvatar };

    return (
      <Animated.View
        style={[
          styles.callItem,
          {
            opacity: fadeAnim,
            transform: [
              {
                translateY: fadeAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [20, 0],
                }),
              },
            ],
          },
        ]}
      >
        <TouchableOpacity
          onPress={() => handleCallBack(item)}
          style={styles.callButton}
        >
          <View style={styles.callInfo}>
            <View style={styles.callIconContainer}>
              <Ionicons 
                name={item.type === 'video' ? 'videocam' : 'call'} 
                size={20} 
                color={Colors.primary[500]} 
              />
              <Ionicons 
                name={item.direction === 'incoming' ? 'arrow-down' : 'arrow-up'} 
                size={16} 
                color={getCallStatusColor(item.status)} 
                style={styles.directionIcon}
              />
            </View>
            
            <View style={styles.callDetails}>
              <Text style={styles.participantName}>
                {otherParticipant.name || 'Unknown'}
              </Text>
              <Text style={[
                styles.callStatus,
                { color: getCallStatusColor(item.status) }
              ]}>
                {getCallStatusText(item)} • {formatCallDuration(item.startedAt, item.endedAt)}
              </Text>
            </View>
          </View>

          <View style={styles.callMeta}>
            <Text style={styles.callTime}>
              {item.startedAt.toLocaleDateString() === new Date().toLocaleDateString()
                ? item.startedAt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                : item.startedAt.toLocaleDateString([], { month: 'short', day: 'numeric' })
              }
            </Text>
            
            <TouchableOpacity
              onPress={() => handleCallBack(item)}
              style={styles.callBackButton}
            >
              <Ionicons name="call" size={18} color={Colors.primary[500]} />
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Animated.View>
    );
  };

  const renderEmptyState = () => (
    <Animated.View style={[styles.emptyContainer, { opacity: fadeAnim }]}>
      <Ionicons name="call-outline" size={64} color={Colors.neutral[400]} />
      <Text style={styles.emptyTitle}>No Call History</Text>
      <Text style={styles.emptySubtitle}>
        Your call history will appear here once you make or receive calls
      </Text>
    </Animated.View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="light" />
      
      {/* Header */}
      <LinearGradient
        colors={[Colors.primary[600], Colors.primary[800]]}
        style={styles.header}
      >
        <View style={styles.headerContent}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.backButton}
          >
            <Ionicons name="arrow-back" size={24} color="white" />
          </TouchableOpacity>
          
          <Text style={styles.headerTitle}>Call History</Text>
          
          <TouchableOpacity
            onPress={loadCallHistory}
            style={styles.refreshButton}
          >
            <Ionicons name="refresh" size={24} color="white" />
          </TouchableOpacity>
        </View>
      </LinearGradient>

      {/* Content */}
      <View style={styles.content}>
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={Colors.primary[500]} />
            <Text style={styles.loadingText}>Loading call history...</Text>
          </View>
        ) : (
          <FlatList
            data={calls}
            renderItem={renderCallItem}
            keyExtractor={(item) => item.id}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={onRefresh}
                colors={[Colors.primary[500]]}
              />
            }
            contentContainerStyle={styles.callsList}
            ListEmptyComponent={renderEmptyState}
            showsVerticalScrollIndicator={false}
          />
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.neutral[50],
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: Colors.neutral[600],
  },
  header: {
    paddingTop: 20,
    paddingBottom: 20,
    paddingHorizontal: 20,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
  },
  refreshButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    flex: 1,
  },
  callsList: {
    padding: 20,
  },
  callItem: {
    backgroundColor: 'white',
    borderRadius: 15,
    marginBottom: 15,
    shadowColor: Colors.neutral[900],
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  callButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
  },
  callInfo: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  callIconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: Colors.primary[100],
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 15,
    position: 'relative',
  },
  directionIcon: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 1,
  },
  callDetails: {
    flex: 1,
  },
  participantName: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.neutral[900],
    marginBottom: 4,
  },
  callStatus: {
    fontSize: 14,
    fontWeight: '500',
  },
  callMeta: {
    alignItems: 'flex-end',
  },
  callTime: {
    fontSize: 12,
    color: Colors.neutral[500],
    marginBottom: 8,
  },
  callBackButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.primary[100],
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.neutral[600],
    marginTop: 20,
    marginBottom: 10,
  },
  emptySubtitle: {
    fontSize: 14,
    color: Colors.neutral[500],
    textAlign: 'center',
    lineHeight: 20,
    paddingHorizontal: 40,
  },
});
