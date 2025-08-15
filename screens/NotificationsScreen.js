import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  SafeAreaView,
  Alert,
  RefreshControl,
  Modal,
  TextInput,
  ScrollView,
  Animated,
  Vibration,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useApp } from '../context/AppContext';
import notificationService from '../services/notificationService';

export default function NotificationsScreen({ navigation }) {
  const { user } = useApp();
  const [notifications, setNotifications] = useState([]);
  const [filter, setFilter] = useState('all');
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [selectedNotification, setSelectedNotification] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [sortBy, setSortBy] = useState('newest');
  const [selectedType, setSelectedType] = useState('all');
  
  // Create notification form state (for lecturers)
  const [createForm, setCreateForm] = useState({
    title: '',
    message: '',
    type: 'announcement',
    course: '',
    priority: 'normal',
    targetUserType: 'student',
    targetAcademicLevel: '',
  });
  
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(300)).current;

  // Load notifications on component mount
  useEffect(() => {
    if (user?.uid) {
      loadNotifications();
      setupRealtimeListener();
    }
  }, [user?.uid]);

  // Setup real-time listener for notifications
  const setupRealtimeListener = () => {
    const unsubscribe = notificationService.listenToUserNotifications((newNotifications) => {
      setNotifications(newNotifications);
      setIsLoading(false);
    });

    return () => {
      if (unsubscribe) unsubscribe();
    };
  };

  // Load notifications
  const loadNotifications = async () => {
    try {
      setIsLoading(true);
      const userNotifications = await notificationService.getUserNotifications();
      setNotifications(userNotifications);
    } catch (error) {
      console.error('Error loading notifications:', error);
      Alert.alert('Error', 'Failed to load notifications');
    } finally {
      setIsLoading(false);
    }
  };

  // Refresh notifications
  const handleRefresh = async () => {
    setIsRefreshing(true);
    await loadNotifications();
    setIsRefreshing(false);
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'assignment':
        return 'document-text';
      case 'material':
        return 'book';
      case 'announcement':
        return 'megaphone';
      case 'exam':
        return 'school';
      default:
        return 'notifications';
    }
  };

  const getNotificationColor = (type) => {
    switch (type) {
      case 'assignment':
        return '#EF4444';
      case 'material':
        return '#10B981';
      case 'announcement':
        return '#F59E0B';
      case 'exam':
        return '#8B5CF6';
      default:
        return '#4F46E5';
    }
  };

  const formatTimestamp = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = Math.floor((now - date) / (1000 * 60 * 60));
    
    if (diffInHours < 1) {
      return 'Just now';
    } else if (diffInHours < 24) {
      return `${diffInHours}h ago`;
    } else {
      const diffInDays = Math.floor(diffInHours / 24);
      return `${diffInDays}d ago`;
    }
  };

  // Mark notification as read
  const markAsRead = async (notificationId) => {
    try {
      const result = await notificationService.markAsRead(notificationId);
      if (!result.success) {
        Alert.alert('Error', 'Failed to mark notification as read');
      }
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  // Mark all notifications as read
  const markAllAsRead = async () => {
    try {
      const result = await notificationService.markAllAsRead();
      if (result.success) {
        Vibration.vibrate(50);
      } else {
        Alert.alert('Error', 'Failed to mark all notifications as read');
      }
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
    }
  };

  // Delete notification
  const deleteNotification = async (notificationId) => {
    Alert.alert(
      'Delete Notification',
      'Are you sure you want to delete this notification?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              const result = await notificationService.deleteNotification(notificationId);
              if (result.success) {
                Vibration.vibrate(50);
              } else {
                Alert.alert('Error', 'Failed to delete notification');
              }
            } catch (error) {
              console.error('Error deleting notification:', error);
            }
          }
        }
      ]
    );
  };

  // Toggle notification read status
  const toggleReadStatus = async (notificationId, isRead) => {
    try {
      const result = isRead 
        ? await notificationService.markAsUnread(notificationId)
        : await notificationService.markAsRead(notificationId);
      
      if (!result.success) {
        Alert.alert('Error', 'Failed to update notification status');
      }
    } catch (error) {
      console.error('Error toggling notification status:', error);
    }
  };

  // Show notification details
  const showNotificationDetails = (notification) => {
    setSelectedNotification(notification);
    setShowDetailsModal(true);
    if (!notification.read) {
      markAsRead(notification.id);
    }
    
    // Animate modal
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start();
  };

  // Handle notification action (navigation, etc.)
  const handleNotificationAction = (notification) => {
    if (notification.actionUrl) {
      // Handle deep linking or navigation
      if (notification.actionUrl.includes('assignment')) {
        // Navigate to assignment
        navigation.navigate('Assignments', { assignmentId: notification.metadata?.assignmentId });
      } else if (notification.actionUrl.includes('material')) {
        // Navigate to materials
        navigation.navigate('Materials', { materialId: notification.metadata?.materialId });
      } else if (notification.actionUrl.includes('exam')) {
        // Navigate to exams
        navigation.navigate('Exams', { examId: notification.metadata?.examId });
      }
    }
  };

  // Enhanced filtering and sorting
  const getFilteredAndSortedNotifications = () => {
    let filtered = notifications.filter(notif => {
      // Filter by read status
      if (filter === 'unread' && notif.read) return false;
      if (filter === 'read' && !notif.read) return false;
      
      // Filter by type
      if (selectedType !== 'all' && notif.type !== selectedType) return false;
      
    return true;
  });

    // Sort notifications
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'newest':
          return new Date(b.timestamp) - new Date(a.timestamp);
        case 'oldest':
          return new Date(a.timestamp) - new Date(b.timestamp);
        case 'priority':
          const priorityOrder = { urgent: 4, high: 3, normal: 2, low: 1 };
          return (priorityOrder[b.priority] || 2) - (priorityOrder[a.priority] || 2);
        case 'course':
          return (a.course || '').localeCompare(b.course || '');
        default:
          return new Date(b.timestamp) - new Date(a.timestamp);
      }
    });

    return filtered;
  };

  const filteredNotifications = getFilteredAndSortedNotifications();

  const renderNotification = ({ item }) => {
    const iconName = getNotificationIcon(item.type);
    const iconColor = getNotificationColor(item.type);
    const priorityColor = getPriorityColor(item.priority);

    return (
      <TouchableOpacity
        style={[
          styles.notificationCard, 
          !item.read && styles.unreadCard,
          item.priority === 'urgent' && styles.urgentCard
        ]}
        onPress={() => showNotificationDetails(item)}
        onLongPress={() => {
          Vibration.vibrate(50);
          // Show context menu options
        }}
        activeOpacity={0.7}
      >
        <View style={styles.notificationContent}>
          {/* Priority indicator */}
          {item.priority !== 'normal' && (
            <View style={[styles.priorityIndicator, { backgroundColor: priorityColor }]} />
          )}
          
          <View style={[styles.iconContainer, { backgroundColor: `${iconColor}15` }]}>
            <Ionicons name={iconName} size={20} color={iconColor} />
          </View>
          
          <View style={styles.textContent}>
            <View style={styles.header}>
              <Text style={[styles.title, !item.read && styles.unreadTitle]} numberOfLines={1}>
                {String(item.title || '')}
              </Text>
              <View style={styles.headerActions}>
              {!item.read && <View style={styles.unreadDot} />}
                <TouchableOpacity
                  style={styles.actionButton}
                  onPress={(e) => {
                    e.stopPropagation();
                    toggleReadStatus(item.id, item.read);
                  }}
                >
                  <Ionicons 
                    name={item.read ? "mail" : "mail-open"} 
                    size={16} 
                    color="#64748B" 
                  />
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.actionButton}
                  onPress={(e) => {
                    e.stopPropagation();
                    deleteNotification(item.id);
                  }}
                >
                  <Ionicons name="trash-outline" size={16} color="#EF4444" />
                </TouchableOpacity>
              </View>
            </View>
            
            <Text style={styles.message} numberOfLines={2}>
              {String(item.message || '')}
            </Text>
            
            <View style={styles.footer}>
              <View style={styles.courseContainer}>
                <Text style={styles.course}>{String(item.course || '')}</Text>
                {item.priority !== 'normal' && (
                  <View style={[styles.priorityBadge, { backgroundColor: priorityColor }]}>
                    <Text style={styles.priorityText}>{item.priority?.toUpperCase()}</Text>
                  </View>
                )}
              </View>
              <Text style={styles.timestamp}>{formatTimestamp(item.timestamp)}</Text>
            </View>
            
            {/* Action button for notifications with actions */}
            {item.actionUrl && (
              <TouchableOpacity
                style={styles.notificationAction}
                onPress={(e) => {
                  e.stopPropagation();
                  handleNotificationAction(item);
                }}
              >
                <Text style={styles.actionText}>View Details</Text>
                <Ionicons name="chevron-forward" size={16} color="#4F46E5" />
              </TouchableOpacity>
            )}
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  // Get priority color
  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'urgent':
        return '#DC2626';
      case 'high':
        return '#EA580C';
      case 'normal':
        return '#059669';
      case 'low':
        return '#6B7280';
      default:
        return '#059669';
    }
  };

  const renderFilterButton = (filterType, label) => (
    <TouchableOpacity
      style={[styles.filterButton, filter === filterType && styles.activeFilter]}
      onPress={() => setFilter(filterType)}
    >
      <Text style={[styles.filterText, filter === filterType && styles.activeFilterText]}>
        {label}
      </Text>
    </TouchableOpacity>
  );

  const renderTypeFilterButton = (type, label) => (
    <TouchableOpacity
      style={[styles.typeFilterButton, selectedType === type && styles.activeTypeFilter]}
      onPress={() => setSelectedType(selectedType === type ? 'all' : type)}
    >
      <Ionicons 
        name={getNotificationIcon(type)} 
        size={16} 
        color={selectedType === type ? '#FFFFFF' : getNotificationColor(type)} 
      />
      <Text style={[styles.typeFilterText, selectedType === type && styles.activeTypeFilterText]}>
        {label}
      </Text>
    </TouchableOpacity>
  );

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <SafeAreaView style={styles.container}>
      {/* Enhanced Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Text style={styles.headerTitle}>Notifications</Text>
          {unreadCount > 0 && (
            <Text style={styles.subtitle}>{unreadCount} unread</Text>
          )}
        </View>
        <View style={styles.headerActions}>
        {unreadCount > 0 && (
          <TouchableOpacity style={styles.markAllButton} onPress={markAllAsRead}>
              <Ionicons name="checkmark-done" size={20} color="#4F46E5" />
            <Text style={styles.markAllText}>Mark all read</Text>
          </TouchableOpacity>
        )}
          {user?.userType === 'lecturer' && (
            <TouchableOpacity 
              style={styles.createButton} 
              onPress={() => setShowCreateModal(true)}
            >
              <Ionicons name="add" size={20} color="#FFFFFF" />
            </TouchableOpacity>
          )}
          <TouchableOpacity 
            style={styles.filterActionButton} 
            onPress={() => setShowFilterModal(true)}
          >
            <Ionicons name="options" size={20} color="#4F46E5" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Enhanced Filters */}
      <View style={styles.filters}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterScrollContent}>
        {renderFilterButton('all', 'All')}
        {renderFilterButton('unread', 'Unread')}
          {renderFilterButton('read', 'Read')}
          
          {/* Type filters */}
          <View style={styles.filterSeparator} />
          {renderTypeFilterButton('assignment', 'Assignments')}
          {renderTypeFilterButton('exam', 'Exams')}
          {renderTypeFilterButton('material', 'Materials')}
          {renderTypeFilterButton('announcement', 'Announcements')}
        </ScrollView>
      </View>

      {/* Notifications List */}
      <FlatList
        data={filteredNotifications}
        renderItem={renderNotification}
        keyExtractor={(item) => item.id}
        style={styles.notificationsList}
        contentContainerStyle={styles.notificationsContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={handleRefresh}
            colors={['#4F46E5']}
            tintColor="#4F46E5"
          />
        }
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Ionicons name="notifications-off-outline" size={64} color="#94A3B8" />
            <Text style={styles.emptyTitle}>No notifications</Text>
            <Text style={styles.emptySubtitle}>
              {filter === 'unread' 
                ? "You're all caught up!" 
                : "You'll see course updates and announcements here"
              }
            </Text>
            {isLoading && (
              <Text style={styles.loadingText}>Loading notifications...</Text>
            )}
          </View>
        }
      />

      {/* Notification Details Modal */}
      {showDetailsModal && selectedNotification && (
        <NotificationDetailsModal 
          notification={selectedNotification}
          visible={showDetailsModal}
          onClose={() => {
            setShowDetailsModal(false);
            setSelectedNotification(null);
            // Reset animations
            fadeAnim.setValue(0);
            slideAnim.setValue(300);
          }}
          onAction={handleNotificationAction}
        />
      )}

      {/* Create Notification Modal (for lecturers) */}
      {user?.userType === 'lecturer' && (
        <CreateNotificationModal
          visible={showCreateModal}
          onClose={() => setShowCreateModal(false)}
          user={user}
        />
      )}

      {/* Filter Modal */}
      <FilterModal
        visible={showFilterModal}
        onClose={() => setShowFilterModal(false)}
        sortBy={sortBy}
        setSortBy={setSortBy}
        selectedType={selectedType}
        setSelectedType={setSelectedType}
      />
    </SafeAreaView>
  );
}

// Notification Details Modal Component
const NotificationDetailsModal = ({ notification, visible, onClose, onAction }) => {
  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <TouchableOpacity style={styles.modalBackdrop} onPress={onClose} />
        <View style={styles.detailsModal}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Notification Details</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Ionicons name="close" size={24} color="#64748B" />
            </TouchableOpacity>
          </View>
          
          <ScrollView style={styles.modalContent}>
            <View style={styles.detailSection}>
              <Text style={styles.detailTitle}>{notification.title}</Text>
              <Text style={styles.detailMessage}>{notification.message}</Text>
            </View>
            
            <View style={styles.detailInfo}>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Course:</Text>
                <Text style={styles.infoValue}>{notification.course}</Text>
              </View>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Type:</Text>
                <Text style={styles.infoValue}>{notification.type}</Text>
              </View>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Priority:</Text>
                <Text style={styles.infoValue}>{notification.priority}</Text>
              </View>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Created:</Text>
                <Text style={styles.infoValue}>
                  {new Date(notification.timestamp).toLocaleDateString('en-US', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </Text>
              </View>
            </View>
            
            {notification.actionUrl && (
              <TouchableOpacity
                style={styles.actionButton}
                onPress={() => {
                  onAction(notification);
                  onClose();
                }}
              >
                <Text style={styles.actionButtonText}>Take Action</Text>
                <Ionicons name="arrow-forward" size={20} color="#FFFFFF" />
              </TouchableOpacity>
            )}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

// Create Notification Modal Component (for lecturers)
const CreateNotificationModal = ({ visible, onClose, user }) => {
  const [formData, setFormData] = useState({
    title: '',
    message: '',
    type: 'announcement',
    course: '',
    priority: 'normal',
    targetUserType: 'student',
    targetAcademicLevel: '',
  });

  const handleCreate = async () => {
    if (!formData.title.trim() || !formData.message.trim()) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    try {
      const result = await notificationService.createNotification(formData);
      if (result.success) {
        Alert.alert('Success', 'Notification created successfully');
        setFormData({
          title: '',
          message: '',
          type: 'announcement',
          course: '',
          priority: 'normal',
          targetUserType: 'student',
          targetAcademicLevel: '',
        });
        onClose();
      } else {
        Alert.alert('Error', result.error || 'Failed to create notification');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to create notification');
    }
  };

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.createModal}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Create Notification</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Ionicons name="close" size={24} color="#64748B" />
            </TouchableOpacity>
          </View>
          
          <ScrollView style={styles.modalContent}>
            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Title *</Text>
              <TextInput
                style={styles.formInput}
                value={formData.title}
                onChangeText={(text) => setFormData(prev => ({ ...prev, title: text }))}
                placeholder="Enter notification title"
                maxLength={100}
              />
            </View>
            
            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Message *</Text>
              <TextInput
                style={[styles.formInput, styles.textArea]}
                value={formData.message}
                onChangeText={(text) => setFormData(prev => ({ ...prev, message: text }))}
                placeholder="Enter notification message"
                multiline
                numberOfLines={4}
                maxLength={500}
              />
            </View>
            
            <View style={styles.formRow}>
              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>Type</Text>
                <View style={styles.typeSelector}>
                  {['announcement', 'assignment', 'exam', 'material'].map(type => (
                    <TouchableOpacity
                      key={type}
                      style={[
                        styles.typeOption,
                        formData.type === type && styles.selectedType
                      ]}
                      onPress={() => setFormData(prev => ({ ...prev, type }))}
                    >
                      <Text style={[
                        styles.typeOptionText,
                        formData.type === type && styles.selectedTypeText
                      ]}>
                        {type.charAt(0).toUpperCase() + type.slice(1)}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            </View>
            
            <TouchableOpacity style={styles.createButton} onPress={handleCreate}>
              <Text style={styles.createButtonText}>Create Notification</Text>
            </TouchableOpacity>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

// Filter Modal Component
const FilterModal = ({ visible, onClose, sortBy, setSortBy, selectedType, setSelectedType }) => {
  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <TouchableOpacity style={styles.modalBackdrop} onPress={onClose} />
        <View style={styles.filterModal}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Filter & Sort</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Ionicons name="close" size={24} color="#64748B" />
            </TouchableOpacity>
          </View>
          
          <View style={styles.modalContent}>
            <View style={styles.filterSection}>
              <Text style={styles.filterSectionTitle}>Sort By</Text>
              {['newest', 'oldest', 'priority', 'course'].map(option => (
                <TouchableOpacity
                  key={option}
                  style={styles.filterOption}
                  onPress={() => setSortBy(option)}
                >
                  <Text style={styles.filterOptionText}>
                    {option.charAt(0).toUpperCase() + option.slice(1)}
                  </Text>
                  {sortBy === option && (
                    <Ionicons name="checkmark" size={20} color="#4F46E5" />
                  )}
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 20,
    backgroundColor: '#FFFFFF',
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  headerLeft: {
    flex: 1,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  headerTitle: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#1E293B',
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#1E293B',
  },
  subtitle: {
    fontSize: 14,
    color: '#64748B',
    marginTop: 4,
  },
  markAllButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  markAllText: {
    fontSize: 14,
    color: '#4F46E5',
    fontWeight: '500',
  },
  filters: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    marginTop: 16,
    marginBottom: 20,
    gap: 12,
  },
  filterButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  activeFilter: {
    backgroundColor: '#4F46E5',
    borderColor: '#4F46E5',
    shadowColor: '#4F46E5',
    shadowOpacity: 0.3,
  },
  filterText: {
    fontSize: 14,
    color: '#64748B',
    fontWeight: '500',
  },
  activeFilterText: {
    color: '#FFFFFF',
  },
  notificationsList: {
    flex: 1,
  },
  notificationsContent: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  notificationCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  unreadCard: {
    borderColor: '#4F46E5',
    backgroundColor: '#FEFEFF',
    shadowColor: '#4F46E5',
    shadowOpacity: 0.2,
  },
  notificationContent: {
    flexDirection: 'row',
    padding: 18,
  },
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  textContent: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  title: {
    fontSize: 17,
    fontWeight: '700',
    color: '#1E293B',
    flex: 1,
    lineHeight: 22,
  },
  unreadTitle: {
    color: '#4F46E5',
  },
  unreadDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#4F46E5',
    marginLeft: 8,
  },
  message: {
    fontSize: 15,
    color: '#64748B',
    lineHeight: 22,
    marginBottom: 10,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  course: {
    fontSize: 12,
    color: '#4F46E5',
    fontWeight: '500',
  },
  timestamp: {
    fontSize: 12,
    color: '#94A3B8',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 80,
    paddingHorizontal: 40,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1E293B',
    marginTop: 20,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: 16,
    color: '#64748B',
    textAlign: 'center',
    marginTop: 12,
    lineHeight: 24,
  },
  
  // New styles for enhanced functionality
  createButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#4F46E5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  filterActionButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F8FAFC',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  filterScrollContent: {
    paddingRight: 20,
  },
  filterSeparator: {
    width: 1,
    height: 20,
    backgroundColor: '#E2E8F0',
    marginHorizontal: 8,
  },
  typeFilterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginRight: 8,
    gap: 4,
  },
  activeTypeFilter: {
    backgroundColor: '#4F46E5',
    borderColor: '#4F46E5',
  },
  typeFilterText: {
    fontSize: 12,
    color: '#64748B',
    fontWeight: '500',
  },
  activeTypeFilterText: {
    color: '#FFFFFF',
  },
  priorityIndicator: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: 4,
    borderTopLeftRadius: 16,
    borderBottomLeftRadius: 16,
  },
  urgentCard: {
    borderLeftWidth: 4,
    borderLeftColor: '#DC2626',
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  actionButton: {
    padding: 4,
    borderRadius: 6,
  },
  courseContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  priorityBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
  },
  priorityText: {
    fontSize: 10,
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  notificationAction: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 8,
    padding: 8,
    backgroundColor: '#F8FAFC',
    borderRadius: 8,
  },
  actionText: {
    fontSize: 14,
    color: '#4F46E5',
    fontWeight: '500',
  },
  loadingText: {
    fontSize: 14,
    color: '#64748B',
    marginTop: 8,
  },
  
  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalBackdrop: {
    flex: 1,
  },
  detailsModal: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '80%',
  },
  createModal: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '90%',
  },
  filterModal: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '60%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1E293B',
  },
  closeButton: {
    padding: 4,
  },
  modalContent: {
    padding: 20,
  },
  detailSection: {
    marginBottom: 20,
  },
  detailTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1E293B',
    marginBottom: 8,
  },
  detailMessage: {
    fontSize: 16,
    color: '#64748B',
    lineHeight: 24,
  },
  detailInfo: {
    gap: 12,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  infoLabel: {
    fontSize: 14,
    color: '#64748B',
    fontWeight: '500',
  },
  infoValue: {
    fontSize: 14,
    color: '#1E293B',
    fontWeight: '600',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#4F46E5',
    padding: 16,
    borderRadius: 12,
    marginTop: 20,
    gap: 8,
  },
  actionButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  
  // Form styles
  formGroup: {
    marginBottom: 20,
  },
  formLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  formInput: {
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#FFFFFF',
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  formRow: {
    flexDirection: 'row',
    gap: 16,
  },
  typeSelector: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  typeOption: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    backgroundColor: '#FFFFFF',
  },
  selectedType: {
    backgroundColor: '#4F46E5',
    borderColor: '#4F46E5',
  },
  typeOptionText: {
    fontSize: 14,
    color: '#374151',
  },
  selectedTypeText: {
    color: '#FFFFFF',
  },
  createButton: {
    backgroundColor: '#4F46E5',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 20,
  },
  createButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  
  // Filter modal styles
  filterSection: {
    marginBottom: 20,
  },
  filterSectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1E293B',
    marginBottom: 12,
  },
  filterOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
    marginBottom: 4,
  },
  filterOptionText: {
    fontSize: 16,
    color: '#374151',
  },
});
