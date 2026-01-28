import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  FlatList,
} from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import MapViewDirections from 'react-native-maps-directions';
import * as Location from 'expo-location';
import SectionCard from '../components/sectioncard';
import PrimaryButton from '../components/primarybutton';
import usePersistentState from '../hooks/usepersistentstate';
import { colors, radii, spacing, typography } from '../constants/colors';
import { GOOGLE_MAPS_API_KEY } from '../config';

const DEFAULT_REGION = {
  latitude: 37.7749,
  longitude: -122.4194,
  latitudeDelta: 0.05,
  longitudeDelta: 0.05,
};

export default function MapsScreen() {
  const mapRef = useRef(null);
  const [origin, setOrigin] = useState('');
  const [destination, setDestination] = useState('');
  const [label, setLabel] = useState('');
  const [savedRoutes, setSavedRoutes] = usePersistentState('savedRoutes', []);
  const [region, setRegion] = useState(DEFAULT_REGION);
  const [location, setLocation] = useState(null);
  const [locationGranted, setLocationGranted] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') return;
        setLocationGranted(true);
        const current = await Location.getCurrentPositionAsync({});
        setLocation(current.coords);
        setRegion({
          latitude: current.coords.latitude,
          longitude: current.coords.longitude,
          latitudeDelta: 0.05,
          longitudeDelta: 0.05,
        });
      } catch (error) {
        console.warn('Location error', error);
      }
    })();
  }, []);

  const handleSaveRoute = () => {
    if (!origin || !destination) return;
    const route = {
      id: Date.now().toString(),
      origin,
      destination,
      label: label || `Route ${savedRoutes.length + 1}`,
      createdAt: Date.now(),
    };
    setSavedRoutes((prev) => [route, ...prev].slice(0, 8));
    setLabel('');
  };

  const handleUseRoute = (route) => {
    setOrigin(route.origin);
    setDestination(route.destination);
  };

  return (
    <View style={styles.container}>
      <SectionCard>
        <Text style={styles.heading}>Route Planner</Text>
        <Text style={styles.helper}>
          Drop addresses or place names. Replace the Google Maps key in app.json before shipping.
        </Text>
        <TextInput
          style={styles.input}
          placeholder="Origin (e.g., Home, 123 Main)"
          placeholderTextColor={colors.muted}
          value={origin}
          onChangeText={setOrigin}
        />
        <TextInput
          style={styles.input}
          placeholder="Destination (e.g., Therapy, Grocery)"
          placeholderTextColor={colors.muted}
          value={destination}
          onChangeText={setDestination}
        />
        <TextInput
          style={styles.input}
          placeholder="Optional label (e.g., Tuesday focus run)"
          placeholderTextColor={colors.muted}
          value={label}
          onChangeText={setLabel}
        />
        <PrimaryButton
          label="Save favorite route"
          onPress={handleSaveRoute}
          disabled={!origin || !destination}
        />
      </SectionCard>

      <SectionCard style={{ flex: 1 }}>
        <MapView
          ref={mapRef}
          style={styles.map}
          provider={MapView.PROVIDER_GOOGLE}
          initialRegion={region}
          customMapStyle={darkMapStyle}
        >
          {locationGranted && location && (
            <Marker
              coordinate={{
                latitude: location.latitude,
                longitude: location.longitude,
              }}
              title="You"
              description="Current position"
              pinColor={colors.accent}
            />
          )}

          {origin && destination && (
            <MapViewDirections
              origin={origin}
              destination={destination}
              apikey={GOOGLE_MAPS_API_KEY}
              strokeWidth={4}
              strokeColor={colors.accent}
              lineDashPattern={[10, 8]}
              onReady={(result) => {
                mapRef.current?.fitToCoordinates(result.coordinates, {
                  edgePadding: { top: 40, bottom: 40, left: 40, right: 40 },
                  animated: true,
                });
              }}
              onError={(msg) => console.warn('Directions error', msg)}
            />
          )}
        </MapView>
        <Text style={styles.helperSmall}>
          Replace 'AIzaSyD-Your-Free-Key-Here' with your own Google Maps Directions API key.
        </Text>
      </SectionCard>

      <SectionCard>
        <Text style={styles.subheading}>Saved Runs</Text>
        {savedRoutes.length === 0 ? (
          <Text style={styles.helper}>No favorites yet. Tap save after planning a run.</Text>
        ) : (
          <FlatList
            data={savedRoutes}
            keyExtractor={(item) => item.id}
            scrollEnabled={false}
            renderItem={({ item }) => (
              <TouchableOpacity onPress={() => handleUseRoute(item)} style={styles.routeRow}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.routeLabel}>{item.label}</Text>
                  <Text style={styles.routeText}>
                    {item.origin} ➜ {item.destination}
                  </Text>
                </View>
                <Text style={styles.useText}>Use</Text>
              </TouchableOpacity>
            )}
          />
        )}
      </SectionCard>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    padding: spacing.md,
  },
  heading: {
    color: colors.text,
    fontSize: typography.sizes.xl,
    fontWeight: typography.weights.bold,
    marginBottom: spacing.sm,
  },
  subheading: {
    color: colors.text,
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.semibold,
    marginBottom: spacing.sm,
  },
  helper: {
    color: colors.muted,
    marginBottom: spacing.sm,
  },
  helperSmall: {
    color: colors.muted,
    marginTop: spacing.sm,
    fontSize: 12,
    textAlign: 'center',
  },
  input: {
    backgroundColor: colors.surface,
    color: colors.text,
    borderRadius: radii.md,
    padding: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: spacing.sm,
  },
  map: {
    width: '100%',
    height: 220,
    borderRadius: radii.lg,
  },
  routeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  routeLabel: {
    color: colors.text,
    fontWeight: typography.weights.semibold,
    marginBottom: 4,
  },
  routeText: {
    color: colors.muted,
    fontSize: typography.sizes.xs,
  },
  useText: {
    color: colors.accent,
    fontWeight: typography.weights.bold,
  },
});

const darkMapStyle = [
  { elementType: 'geometry', stylers: [{ color: '#1d1d27' }] },
  { elementType: 'labels.text.fill', stylers: [{ color: '#ffffff' }] },
  {
    featureType: 'road',
    elementType: 'geometry',
    stylers: [{ color: '#272733' }],
  },
  {
    featureType: 'water',
    elementType: 'geometry',
    stylers: [{ color: '#0f111a' }],
  },
];
