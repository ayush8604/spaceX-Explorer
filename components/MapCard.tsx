import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform, Linking, Alert } from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import { Launchpad } from '../lib/types';
import { useUserLocation } from '../hooks/useUserLocation';
import { calculateDistance, formatDistance } from '../lib/geo';

interface MapCardProps {
  launchpad: Launchpad;
}

const MapCard: React.FC<MapCardProps> = ({ launchpad }) => {
  const { location, permissionStatus, requestPermission } = useUserLocation();
  const [distance, setDistance] = useState<number | null>(null);
  const [mapError, setMapError] = useState<string | null>(null);

  // Debug launchpad data
  useEffect(() => {
    console.log('MapCard received launchpad:', launchpad);
    console.log('Launchpad coordinates:', {
      latitude: launchpad?.latitude,
      longitude: launchpad?.longitude,
      name: launchpad?.name
    });
  }, [launchpad]);

  useEffect(() => {
    if (location && launchpad) {
      const calculatedDistance = calculateDistance(
        location.latitude,
        location.longitude,
        launchpad.latitude,
        launchpad.longitude
      );
      setDistance(calculatedDistance);
    }
  }, [location, launchpad]);

  // Validate coordinates
  const isValidCoordinate = (lat: number, lng: number) => {
    return lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180;
  };

  const getMapRegion = () => {
    const { latitude, longitude } = launchpad;
    
    // Always use the actual launchpad coordinates from the API
    return {
      latitude,
      longitude,
      latitudeDelta: 0.05,
      longitudeDelta: 0.05,
    };
  };

  const handleOpenMaps = () => {
    const { latitude, longitude } = launchpad;
    
    if (!isValidCoordinate(latitude, longitude)) {
      Alert.alert('Invalid Coordinates', 'Unable to open maps with invalid coordinates.');
      return;
    }

    let url: string;

    if (Platform.OS === 'ios') {
      // iOS: Apple Maps
      url = `http://maps.apple.com/?daddr=${latitude},${longitude}`;
    } else {
      // Android: Google Maps
      url = `https://www.google.com/maps/dir/?api=1&destination=${latitude},${longitude}`;
    }

    Linking.openURL(url).catch((err) => {
      console.error('Failed to open maps:', err);
      Alert.alert('Error', 'Failed to open maps application.');
      // Fallback to Google Maps on web
      if (Platform.OS === 'web') {
        window.open(`https://www.google.com/maps/dir/?api=1&destination=${latitude},${longitude}`);
      }
    });
  };

  const handleLocationPermission = async () => {
    if (permissionStatus === 'unasked' || permissionStatus === 'denied') {
      await requestPermission();
    }
  };

  const handleMapError = (error: any) => {
    console.error('Map error:', error);
    setMapError('Failed to load map');
  };

  const renderLocationButton = () => {
    if (permissionStatus === 'unasked') {
      return (
        <TouchableOpacity style={styles.locationButton} onPress={handleLocationPermission}>
          <Text style={styles.locationButtonText}>Enable Location</Text>
        </TouchableOpacity>
      );
    }

    if (permissionStatus === 'denied') {
      return (
        <TouchableOpacity 
          style={styles.locationButton} 
          onPress={() => Linking.openSettings()}
        >
          <Text style={styles.locationButtonText}>Open Settings</Text>
        </TouchableOpacity>
      );
    }

    return null;
  };

  const renderMap = () => {
    if (mapError) {
      return (
        <View style={styles.mapErrorContainer}>
          <Text style={styles.mapErrorText}>{mapError}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={() => setMapError(null)}>
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      );
    }

    // Debug info
    console.log('Rendering map with coordinates:', {
      latitude: launchpad.latitude,
      longitude: launchpad.longitude,
      isValid: isValidCoordinate(launchpad.latitude, launchpad.longitude)
    });

    // Always show the map with actual launchpad coordinates from the API

    const mapRegion = getMapRegion();

    return (
      <View style={styles.mapContainer}>
        <MapView
          style={styles.map}
          initialRegion={mapRegion}
          showsUserLocation={false}
          showsMyLocationButton={false}
          showsCompass={true}
          showsScale={true}
          loadingEnabled={true}
          loadingIndicatorColor="#007AFF"
          loadingBackgroundColor="#ffffff"
          onMapReady={() => console.log('Map loaded successfully')}
        >
          {/* Launchpad marker */}
          <Marker
            coordinate={{
              latitude: launchpad.latitude,
              longitude: launchpad.longitude,
            }}
            title={launchpad.name}
            description={`${launchpad.locality}, ${launchpad.region}`}
            pinColor="red"
          />

          {/* User location marker */}
          {location && isValidCoordinate(location.latitude, location.longitude) && (
            <Marker
              coordinate={{
                latitude: location.latitude,
                longitude: location.longitude,
              }}
              title="Your Location"
              pinColor="blue"
            />
          )}
        </MapView>
        {__DEV__ && (
          <View style={styles.debugOverlay}>
            <Text style={styles.debugText}>
              Lat: {launchpad.latitude.toFixed(4)}
            </Text>
            <Text style={styles.debugText}>
              Lng: {launchpad.longitude.toFixed(4)}
            </Text>
            <Text style={styles.debugText}>
              Valid: {isValidCoordinate(launchpad.latitude, launchpad.longitude) ? 'Yes' : 'No'}
            </Text>
          </View>
        )}
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Launchpad Location</Text>
        {distance && (
          <Text style={styles.distance}>{formatDistance(distance)} away</Text>
        )}
      </View>

      {renderMap()}

      <View style={styles.footer}>
        <View style={styles.launchpadInfo}>
          <Text style={styles.launchpadName}>{launchpad.name}</Text>
          <Text style={styles.launchpadLocation}>
            {launchpad.locality}, {launchpad.region}
          </Text>
        </View>

        <TouchableOpacity style={styles.directionsButton} onPress={handleOpenMaps}>
          <Text style={styles.directionsButtonText}>Directions</Text>
        </TouchableOpacity>
      </View>

      {renderLocationButton()}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    borderRadius: 12,
    margin: 16,
    overflow: 'hidden',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  header: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  distance: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  map: {
    height: 250,
    width: '100%',
  },
  mapContainer: {
    position: 'relative',
    height: 250,
  },
  debugOverlay: {
    position: 'absolute',
    top: 10,
    left: 10,
    backgroundColor: 'rgba(0,0,0,0.5)',
    padding: 5,
    borderRadius: 5,
  },
  debugText: {
    color: '#fff',
    fontSize: 12,
  },
  mapErrorContainer: {
    height: 250,
    backgroundColor: '#f8f9fa',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  mapErrorText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 16,
  },
  retryButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
  },
  launchpadInfo: {
    flex: 1,
  },
  launchpadName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  launchpadLocation: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  directionsButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  directionsButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  locationButton: {
    backgroundColor: '#34C759',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
    margin: 16,
    alignSelf: 'center',
  },
  locationButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  mapFallbackContainer: {
    height: 250,
    backgroundColor: '#f8f9fa',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  mapFallbackText: {
    fontSize: 18,
    color: '#666',
    textAlign: 'center',
    marginBottom: 10,
  },
  coordinatesText: {
    fontSize: 14,
    color: '#333',
    marginBottom: 5,
  },
  fallbackInfo: {
    fontSize: 12,
    color: '#999',
    textAlign: 'center',
  },
});

export default MapCard; 