import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  Animated,
  StatusBar,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import MapView, { Marker, PROVIDER_GOOGLE, Polyline } from 'react-native-maps';
import { useTheme } from '../components/ThemeProvider';
import { SHUTTLE_DATA } from '../data/shuttleData';

const { width, height } = Dimensions.get('window');

// Real KNUST Coordinates for the Shuttle Path
const KNUST_SHUTTLE_PATH = [
  { latitude: 6.6747, longitude: -1.5716 }, // Main Gate
  { latitude: 6.6780, longitude: -1.5750 }, // Unity Hall
  { latitude: 6.6740, longitude: -1.5810 }, // Pa Joe
  { latitude: 6.6700, longitude: -1.5750 }, // Great Hall
  { latitude: 6.6710, longitude: -1.5650 }, // Engineering
];

export default function ShuttleScreen({ navigation }) {
  const { isDark } = useTheme();
  const [selectedRoute, setSelectedRoute] = useState(SHUTTLE_DATA.routes[0]);
  const [currentEta, setCurrentEta] = useState('4 mins');
  const [busCoord, setBusCoord] = useState(KNUST_SHUTTLE_PATH[0]);
  const mapRef = useRef(null);

  useEffect(() => {
    let index = 0;
    const interval = setInterval(() => {
      index = (index + 1) % KNUST_SHUTTLE_PATH.length;
      const nextPos = KNUST_SHUTTLE_PATH[index];
      setBusCoord(nextPos);
      setCurrentEta(`${Math.floor(Math.random() * 5) + 1} mins`);
      
      // Optional: Auto-pan to bus if needed
      // mapRef.current?.animateToRegion({ ...nextPos, latitudeDelta: 0.01, longitudeDelta: 0.01 }, 1000);
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const renderRouteHeader = () => (
    <View style={styles.routeHeader}>
      <Text style={[styles.sectionTitle, isDark && styles.darkText]}>Active Campus Routes</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.routeScroll}>
        {SHUTTLE_DATA.routes.map(route => (
          <TouchableOpacity
            key={route.id}
            onPress={() => setSelectedRoute(route)}
            style={[
              styles.routeBadge,
              selectedRoute.id === route.id && { backgroundColor: route.color },
              isDark && selectedRoute.id !== route.id && styles.darkBadge
            ]}
          >
            <Ionicons
              name="navigate-circle-outline"
              size={18}
              color={selectedRoute.id === route.id ? '#FFFFFF' : route.color}
            />
            <Text style={[styles.routeBadgeText, selectedRoute.id === route.id && styles.textWhite]}>
              {route.name}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );

  const renderShuttleCard = (item) => {
    const isFull = item.occupied >= item.capacity;
    return (
      <TouchableOpacity
        key={item.id}
        style={[styles.shuttleCard, isDark && styles.darkCard]}
        onPress={() => Alert.alert(`Track ${item.plate}`, `Bus is currently between ${selectedRoute.stops[0]} and ${selectedRoute.stops[1]}.`)}
      >
        <LinearGradient colors={isDark ? ['#1E293B', '#0F172A'] : ['#FFFFFF', '#F8FAFC']} style={styles.cardGradient}>
          <View style={styles.shuttleInfo}>
            <View style={styles.shuttleHeader}>
              <View style={[styles.typeBadge, { backgroundColor: selectedRoute.color + '20' }]}>
                <Ionicons name="bus-outline" size={12} color={selectedRoute.color} />
                <Text style={[styles.typeText, { color: selectedRoute.color }]}>{item.type}</Text>
              </View>
              <View style={styles.etaBadge}>
                <Text style={styles.etaText}>{item.eta}</Text>
              </View>
            </View>
            <Text style={[styles.plateNumber, isDark && styles.darkText]}>{item.plate}</Text>
            <Text style={styles.driverName}>Driver: {item.driver}</Text>
            <View style={styles.capacitySection}>
              <View style={styles.capacityBarContainer}>
                <View style={[styles.capacityBar, { width: `${(item.occupied / item.capacity) * 100}%`, backgroundColor: isFull ? '#EF4444' : '#10B981' }]} />
              </View>
              <Text style={styles.capacityLabel}>{item.occupied}/{item.capacity} Seats Taken</Text>
            </View>
          </View>
          <View style={styles.actionRow}>
            <TouchableOpacity style={[styles.boardButton, isFull && styles.disabledButton]} disabled={isFull} onPress={() => Alert.alert('Boarding...', 'Scan the QR code on the bus to confirm.')}>
              <Text style={styles.boardButtonText}>{isFull ? 'Full' : 'Board'}</Text>
            </TouchableOpacity>
          </View>
        </LinearGradient>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={[styles.container, isDark && styles.darkContainer]}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header Section */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color={isDark ? '#FFFFFF' : '#000000'} />
          </TouchableOpacity>
          <View style={{ flex: 1, marginLeft: 15 }}>
            <Text style={[styles.greeting, isDark && styles.darkTextSecondary]}>Shuttle Service</Text>
            <Text style={[styles.title, isDark && styles.darkText]}>Live Tracking</Text>
          </View>
          <TouchableOpacity style={styles.headerIcon} onPress={() => Alert.alert('Info', 'Real-time GPS data updated every 5 seconds.')}>
            <LinearGradient colors={['#6366F1', '#A855F7']} style={styles.iconGradient}>
              <Ionicons name="wifi" size={20} color="#FFFFFF" />
            </LinearGradient>
          </TouchableOpacity>
        </View>

        {/* Real Live Map */}
        <View style={styles.mapContainer}>
          <MapView
            ref={mapRef}
            provider={PROVIDER_GOOGLE}
            style={styles.map}
            initialRegion={{
              ...KNUST_SHUTTLE_PATH[0],
              latitudeDelta: 0.02,
              longitudeDelta: 0.02,
            }}
            customMapStyle={isDark ? darkMapStyle : []}
          >
            <Polyline coordinates={KNUST_SHUTTLE_PATH} strokeColor={selectedRoute.color} strokeWidth={4} lineDashPattern={[5, 5]} />
            <Marker coordinate={busCoord} flat anchor={{ x: 0.5, y: 0.5 }}>
              <View style={[styles.busMarker, { backgroundColor: selectedRoute.color }]}>
                <Ionicons name="bus" size={16} color="#FFF" />
              </View>
            </Marker>
          </MapView>

          <View style={styles.mapOverlay}>
            <LinearGradient colors={['transparent', 'rgba(0,0,0,0.8)']} style={styles.overlayGrad}>
              <View style={styles.activeRouteInfo}>
                <View style={[styles.colorIndicator, { backgroundColor: selectedRoute.color }]} />
                <View>
                  <Text style={styles.activeRouteName}>{selectedRoute.name} Line</Text>
                  <Text style={styles.activeRouteStops}>Next Bus in {currentEta} • {selectedRoute.stops.length} Stops</Text>
                </View>
              </View>
            </LinearGradient>
          </View>
        </View>

        {renderRouteHeader()}

        <View style={styles.listSection}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionSubtitle, isDark && styles.darkText]}>Buses on this route</Text>
            <Text style={styles.liveIndicator}>• Live updates</Text>
          </View>
          {SHUTTLE_DATA.shuttles.filter(s => s.routeId === selectedRoute.id).map(item => renderShuttleCard(item))}
        </View>

        <View style={{ height: 120 }} />
      </ScrollView>

      {/* Quick Action Floating Button */}
      <TouchableOpacity style={styles.fab} onPress={() => Alert.alert('NFC/QR Boarding', 'Place your phone near the bus terminal scanner.')}>
        <LinearGradient colors={['#6366F1', '#A855F7']} style={styles.fabGradient}>
          <Ionicons name="qr-code" size={24} color="#FFFFFF" />
          <Text style={styles.fabText}>Scan to Board</Text>
        </LinearGradient>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const darkMapStyle = [
  { "elementType": "geometry", "stylers": [{ "color": "#242f3e" }] },
  { "elementType": "labels.text.fill", "stylers": [{ "color": "#746855" }] },
  { "elementType": "labels.text.stroke", "stylers": [{ "color": "#242f3e" }] },
  { "featureType": "water", "elementType": "geometry", "stylers": [{ "color": "#17263c" }] }
];

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  darkContainer: { backgroundColor: '#0F172A' },
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, paddingTop: 20, paddingBottom: 10 },
  backButton: { width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(99, 102, 241, 0.1)', justifyContent: 'center', alignItems: 'center' },
  greeting: { fontSize: 14, color: '#64748B', fontWeight: '600' },
  title: { fontSize: 24, fontWeight: '900', color: '#1E293B' },
  headerIcon: { width: 45, height: 45, borderRadius: 15, overflow: 'hidden' },
  iconGradient: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  mapContainer: { margin: 20, height: 250, borderRadius: 30, overflow: 'hidden', elevation: 15, shadowColor: '#000', shadowOpacity: 0.3, shadowRadius: 15 },
  map: { width: '100%', height: '100%' },
  mapOverlay: { position: 'absolute', bottom: 0, width: '100%' },
  overlayGrad: { padding: 20, paddingTop: 40 },
  activeRouteInfo: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  colorIndicator: { width: 4, height: 35, borderRadius: 2 },
  activeRouteName: { color: '#FFFFFF', fontWeight: '900', fontSize: 18 },
  activeRouteStops: { color: 'rgba(255,255,255,0.7)', fontSize: 13, fontWeight: '600' },
  busMarker: { width: 34, height: 34, borderRadius: 17, justifyContent: 'center', alignItems: 'center', borderWidth: 3, borderColor: '#FFF', elevation: 10 },
  routeHeader: { paddingBottom: 15 },
  sectionTitle: { fontSize: 18, fontWeight: '900', color: '#1E293B', marginLeft: 20, marginBottom: 12 },
  routeScroll: { paddingLeft: 20, gap: 12 },
  routeBadge: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 10, borderRadius: 22, backgroundColor: '#FFFFFF', gap: 8, elevation: 2 },
  darkBadge: { backgroundColor: '#1E293B' },
  routeBadgeText: { fontSize: 14, fontWeight: '800', color: '#64748B' },
  textWhite: { color: '#FFFFFF' },
  listSection: { paddingHorizontal: 20 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15 },
  sectionSubtitle: { fontSize: 17, fontWeight: '900', color: '#1E293B' },
  liveIndicator: { fontSize: 12, color: '#10B981', fontWeight: '800' },
  shuttleCard: { marginBottom: 15, borderRadius: 25, overflow: 'hidden', elevation: 5 },
  darkCard: { backgroundColor: '#1E293B' },
  cardGradient: { padding: 18, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  shuttleInfo: { flex: 1 },
  shuttleHeader: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 8 },
  typeBadge: { paddingHorizontal: 10, paddingVertical: 5, borderRadius: 8, flexDirection: 'row', alignItems: 'center', gap: 5 },
  typeText: { fontSize: 11, fontWeight: '800' },
  etaBadge: { backgroundColor: '#F1F5F9', paddingHorizontal: 10, paddingVertical: 5, borderRadius: 8 },
  etaText: { fontSize: 11, fontWeight: '800', color: '#475569' },
  plateNumber: { fontSize: 20, fontWeight: '900', color: '#1E293B', marginBottom: 2 },
  driverName: { fontSize: 13, color: '#94A3B8', fontWeight: '600', marginBottom: 12 },
  capacitySection: { gap: 8 },
  capacityBarContainer: { height: 6, backgroundColor: '#E2E8F0', borderRadius: 3, width: '90%' },
  capacityBar: { height: '100%', borderRadius: 3 },
  capacityLabel: { fontSize: 11, color: '#94A3B8', fontWeight: '700' },
  actionRow: { alignItems: 'flex-end' },
  boardButton: { backgroundColor: '#6366F1', paddingHorizontal: 20, paddingVertical: 12, borderRadius: 15 },
  disabledButton: { backgroundColor: '#94A3B8' },
  boardButtonText: { color: '#FFFFFF', fontWeight: '900', fontSize: 14 },
  fab: { position: 'absolute', bottom: 30, alignSelf: 'center', width: width * 0.7, height: 60, borderRadius: 30, elevation: 15, shadowColor: '#6366F1', shadowOpacity: 0.4, shadowRadius: 20 },
  fabGradient: { flex: 1, borderRadius: 30, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 12 },
  fabText: { color: '#FFFFFF', fontWeight: '900', fontSize: 18 },
  darkText: { color: '#FFFFFF' },
  darkTextSecondary: { color: '#94A3B8' },
});
