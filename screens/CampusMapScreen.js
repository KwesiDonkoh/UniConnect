import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  Dimensions,
  Animated,
  StatusBar,
  Alert,
  ActivityIndicator,
  TextInput,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import MapView, { Marker, PROVIDER_GOOGLE, Callout } from 'react-native-maps';
import * as Location from 'expo-location';
import { useTheme } from '../components/ThemeProvider';

const { width, height } = Dimensions.get('window');

const KNUST_REGION = {
  latitude: 6.6747,
  longitude: -1.5716,
  latitudeDelta: 0.02,
  longitudeDelta: 0.02,
};

const MAP_CATEGORIES = [
  { id: 'all', label: 'All', icon: 'navigate' },
  { id: 'academic', label: 'Colleges', icon: 'school' },
  { id: 'hostels', label: 'Halls', icon: 'bed' },
  { id: 'atm', label: 'Services', icon: 'card' },
  { id: 'food', label: 'Dining', icon: 'restaurant' },
];

const LOCATIONS = [
  { id: 'l1', name: 'Great Hall', category: 'academic', latitude: 6.6731, longitude: -1.5664, description: 'Main ceremonial hall' },
  { id: 'l2', name: 'Unity Hall (Continental)', category: 'hostels', latitude: 6.6800, longitude: -1.5700, description: 'Male traditional hall' },
  { id: 'l3', name: 'University Hall (Katanga)', category: 'hostels', latitude: 6.6740, longitude: -1.5750, description: 'Male traditional hall' },
  { id: 'l4', name: 'College of Engineering', category: 'academic', latitude: 6.6750, longitude: -1.5650, description: 'Faculty area' },
  { id: 'l5', name: 'College of Science', category: 'academic', latitude: 6.6710, longitude: -1.5600, description: 'Academic buildings' },
  { id: 'l6', name: 'College of Law', category: 'academic', latitude: 6.6780, longitude: -1.5620, description: 'Faculty of Law' },
  { id: 'l7', name: 'Pa Joe Stadium', category: 'other', latitude: 6.6700, longitude: -1.5780, description: 'Sports complex' },
];

export default function CampusMapScreen({ navigation }) {
  const { isDark } = useTheme();
  const [activeTab, setActiveTab] = useState('all');
  const [selectedLoc, setSelectedLoc] = useState(null);
  const [location, setLocation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const mapRef = useRef(null);

  const slideAnim = useRef(new Animated.Value(height * 0.4)).current;

  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Denied', 'Location access is required to show your position on the map.');
        setLoading(false);
        return;
      }

      let userLoc = await Location.getCurrentPositionAsync({});
      setLocation(userLoc);
      setLoading(false);
    })();
  }, []);

  const selectPlace = (loc) => {
    setSelectedLoc(loc);
    mapRef.current?.animateToRegion({
      latitude: loc.latitude,
      longitude: loc.longitude,
      latitudeDelta: 0.005,
      longitudeDelta: 0.005,
    }, 1000);
    Animated.spring(slideAnim, { toValue: 0, useNativeDriver: true }).start();
  };

  const handleSearch = (text) => {
    setSearchQuery(text);
    if (text.length > 2) {
      const match = LOCATIONS.find(l => l.name.toLowerCase().includes(text.toLowerCase()));
      if (match) {
        mapRef.current?.animateToRegion({
          latitude: match.latitude,
          longitude: match.longitude,
          latitudeDelta: 0.01,
          longitudeDelta: 0.01,
        }, 1000);
      }
    }
  };

  const closeDetail = () => {
    Animated.timing(slideAnim, { toValue: height * 0.4, duration: 300, useNativeDriver: true }).start(() => setSelectedLoc(null));
  };

  const centerOnUser = () => {
    if (location) {
      mapRef.current?.animateToRegion({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      }, 1000);
    }
  };

  const filteredLocations = LOCATIONS.filter(l => {
    const matchesTab = activeTab === 'all' || l.category === activeTab;
    const matchesSearch = l.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesTab && matchesSearch;
  });

  return (
    <SafeAreaView style={[styles.container, isDark && styles.darkContainer]}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />
      
      {/* Top Overlay Controls */}
      <View style={styles.topOverlay}>
        <View style={styles.headerRow}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={[styles.backBtn, isDark && styles.darkCard]}>
            <Ionicons name="arrow-back" size={24} color={isDark ? '#FFF' : '#1E293B'} />
          </TouchableOpacity>
          <View style={[styles.searchBar, isDark && styles.darkCard]}>
            <Ionicons name="search" size={18} color="#94A3B8" />
            <TextInput
              style={[styles.searchInput, isDark && styles.darkText]}
              placeholder="Search colleges, halls..."
              placeholderTextColor="#94A3B8"
              value={searchQuery}
              onChangeText={handleSearch}
            />
          </View>
        </View>

        <View style={styles.catContainer}>
          {MAP_CATEGORIES.map(cat => (
            <TouchableOpacity
              key={cat.id}
              style={[styles.catChip, activeTab === cat.id && styles.catChipActive, isDark && activeTab !== cat.id && styles.darkCard]}
              onPress={() => setActiveTab(cat.id)}
            >
              <Ionicons name={cat.icon} size={16} color={activeTab === cat.id ? '#FFF' : '#64748B'} />
              {activeTab === cat.id && <Text style={styles.catTextActive}>{cat.label}</Text>}
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Real Map Integration */}
      <MapView
        ref={mapRef}
        provider={PROVIDER_GOOGLE}
        style={styles.map}
        initialRegion={KNUST_REGION}
        showsUserLocation={true}
        showsMyLocationButton={false}
        showsCompass={true}
        customMapStyle={isDark ? darkMapStyle : []}
      >
        {filteredLocations.map(loc => (
          <Marker
            key={loc.id}
            coordinate={{ latitude: loc.latitude, longitude: loc.longitude }}
            onPress={() => selectPlace(loc)}
          >
            <View style={[styles.markerContainer, { backgroundColor: loc.category === 'academic' ? '#6366F1' : '#10B981' }]}>
              <Ionicons name={MAP_CATEGORIES.find(c => c.id === loc.category)?.icon || 'location'} size={14} color="#FFF" />
              <View style={[styles.markerTriangle, { borderTopColor: loc.category === 'academic' ? '#6366F1' : '#10B981' }]} />
            </View>
          </Marker>
        ))}
      </MapView>

      {loading && (
        <View style={styles.loader}>
          <ActivityIndicator size="large" color="#6366F1" />
        </View>
      )}

      {/* Floating Buttons */}
      <View style={styles.floatingButtons}>
        <TouchableOpacity style={[styles.floatBtn, isDark && styles.darkCard]} onPress={centerOnUser}>
          <Ionicons name="locate" size={24} color="#6366F1" />
        </TouchableOpacity>
      </View>

      {/* Place Detail Panel */}
      {selectedLoc && (
        <Animated.View style={[styles.detailPanel, isDark && styles.darkCard, { transform: [{ translateY: slideAnim }] }]}>
          <View style={styles.panelHandle} />
          <View style={styles.panelHeader}>
            <View style={styles.panelTitleBox}>
              <Text style={[styles.panelTitle, isDark && styles.darkText]}>{selectedLoc.name}</Text>
              <Text style={styles.panelSub}>{selectedLoc.description}</Text>
            </View>
            <TouchableOpacity onPress={closeDetail}>
              <Ionicons name="close-circle" size={32} color="#CBD5E1" />
            </TouchableOpacity>
          </View>

          <View style={styles.panelExtra}>
            <View style={styles.extraItem}>
              <Ionicons name="walk" size={20} color="#6366F1" />
              <Text style={[styles.extraText, isDark && styles.darkText]}>Live Navigation</Text>
            </View>
            <View style={styles.extraItem}>
              <Ionicons name="leaf" size={20} color="#10B981" />
              <Text style={[styles.extraText, isDark && styles.darkText]}>Green Zone</Text>
            </View>
          </View>

          <TouchableOpacity style={styles.navBtn} onPress={() => Alert.alert('Navigation', 'Launching live AR navigation to ' + selectedLoc.name)}>
            <LinearGradient colors={['#6366F1', '#4F46E5']} style={styles.navGrad}>
              <Ionicons name="navigate-circle" size={24} color="#FFF" />
              <Text style={styles.navText}>Arrive Faster</Text>
            </LinearGradient>
          </TouchableOpacity>
        </Animated.View>
      )}

    </SafeAreaView>
  );
}

const darkMapStyle = [
  { "elementType": "geometry", "stylers": [{ "color": "#242f3e" }] },
  { "elementType": "labels.text.fill", "stylers": [{ "color": "#746855" }] },
  { "elementType": "labels.text.stroke", "stylers": [{ "color": "#242f3e" }] },
  { "featureType": "administrative.locality", "elementType": "labels.text.fill", "stylers": [{ "color": "#d59563" }] },
  { "featureType": "poi", "elementType": "labels.text.fill", "stylers": [{ "color": "#d59563" }] },
  { "featureType": "poi.park", "elementType": "geometry", "stylers": [{ "color": "#263c3f" }] },
  { "featureType": "poi.park", "elementType": "labels.text.fill", "stylers": [{ "color": "#6b9a76" }] },
  { "featureType": "road", "elementType": "geometry", "stylers": [{ "color": "#38414e" }] },
  { "featureType": "road", "elementType": "geometry.stroke", "stylers": [{ "color": "#212a37" }] },
  { "featureType": "road", "elementType": "labels.text.fill", "stylers": [{ "color": "#9ca5b3" }] },
  { "featureType": "road.highway", "elementType": "geometry", "stylers": [{ "color": "#746855" }] },
  { "featureType": "road.highway", "elementType": "geometry.stroke", "stylers": [{ "color": "#1f2835" }] },
  { "featureType": "road.highway", "elementType": "labels.text.fill", "stylers": [{ "color": "#f3d19c" }] },
  { "featureType": "water", "elementType": "geometry", "stylers": [{ "color": "#17263c" }] },
  { "featureType": "water", "elementType": "labels.text.fill", "stylers": [{ "color": "#515c6d" }] },
  { "featureType": "water", "elementType": "labels.text.stroke", "stylers": [{ "color": "#17263c" }] }
];

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F1F5F9' },
  darkContainer: { backgroundColor: '#0F172A' },
  darkCard: { backgroundColor: '#1E293B' },
  darkText: { color: '#FFFFFF' },
  map: { width: width, height: height },
  loader: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(255,255,255,0.7)', justifyContent: 'center', alignItems: 'center' },
  
  topOverlay: { position: 'absolute', top: 20, width: '100%', zIndex: 10, paddingHorizontal: 20 },
  headerRow: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 15 },
  backBtn: { width: 44, height: 44, borderRadius: 15, backgroundColor: '#FFF', justifyContent: 'center', alignItems: 'center', elevation: 5 },
  searchBar: { flex: 1, height: 44, backgroundColor: '#FFF', borderRadius: 15, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 15, elevation: 5 },
  searchInput: { flex: 1, fontSize: 13, color: '#1E293B', marginLeft: 10, height: '100%' },
  
  catContainer: { flexDirection: 'row', justifyContent: 'space-between' },
  catChip: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFF', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 20, gap: 5, elevation: 3 },
  catChipActive: { backgroundColor: '#6366F1' },
  catText: { fontSize: 11, fontWeight: '700', color: '#64748B' },
  catTextActive: { color: '#FFF' },

  markerContainer: { width: 30, height: 30, borderRadius: 15, justifyContent: 'center', alignItems: 'center', borderWidth: 2, borderColor: '#FFF', elevation: 10 },
  markerTriangle: { width: 0, height: 0, borderLeftWidth: 5, borderRightWidth: 5, borderTopWidth: 8, borderLeftColor: 'transparent', borderRightColor: 'transparent', position: 'absolute', bottom: -7 },

  floatingButtons: { position: 'absolute', bottom: 100, right: 20, gap: 15 },
  floatBtn: { width: 50, height: 50, borderRadius: 25, backgroundColor: '#FFF', justifyContent: 'center', alignItems: 'center', elevation: 10 },

  detailPanel: { position: 'absolute', bottom: 0, width: '100%', backgroundColor: '#FFF', borderTopLeftRadius: 35, borderTopRightRadius: 35, padding: 30, elevation: 25 },
  panelHandle: { width: 40, height: 4, backgroundColor: '#E2E8F0', borderRadius: 2, alignSelf: 'center', marginBottom: 20 },
  panelHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  panelTitle: { fontSize: 22, fontWeight: '900', color: '#1E293B' },
  panelSub: { fontSize: 13, color: '#94A3B8', fontWeight: '600', marginTop: 4 },
  panelExtra: { flexDirection: 'row', gap: 20, marginVertical: 20 },
  extraItem: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  extraText: { fontSize: 14, fontWeight: '700', color: '#475569' },
  navBtn: { borderRadius: 20, overflow: 'hidden' },
  navGrad: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 15, gap: 10 },
  navText: { color: '#FFF', fontSize: 16, fontWeight: '900' },
});
