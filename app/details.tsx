import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  Image,
  StyleSheet,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { api } from '../lib/api';
import { useLaunchpad } from '../hooks/useLaunchpad';
import MapCard from '../components/MapCard';
import LoadingState from '../components/LoadingState';
import ErrorState from '../components/ErrorState';
import { Launch } from '../lib/types';

export default function LaunchDetailsScreen() {
  const { launchId } = useLocalSearchParams<{ launchId: string }>();
  const [launch, setLaunch] = useState<Launch | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const { launchpad, loading: launchpadLoading, error: launchpadError } = useLaunchpad(
    launch?.launchpad || ''
  );

  useEffect(() => {
    if (launchId) {
      fetchLaunchDetails();
    }
  }, [launchId]);

  const fetchLaunchDetails = async () => {
    try {
      setLoading(true);
      setError(null);

      // For now, we'll use the simple API to get launch details
      // In a real app, you might want a specific endpoint for single launch
      const launches = await api.fetchLaunchesSimple();
      const foundLaunch = launches.find(l => l.id === launchId);
      
      if (foundLaunch) {
        setLaunch(foundLaunch);
      } else {
        setError('Launch not found');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch launch details';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const getStatusText = () => {
    if (launch?.upcoming) return 'Upcoming';
    if (launch?.success === true) return 'Successful';
    if (launch?.success === false) return 'Failed';
    return 'Unknown';
  };

  const getStatusColor = () => {
    if (launch?.upcoming) return '#FFA500'; // Orange
    if (launch?.success === true) return '#4CAF50'; // Green
    if (launch?.success === false) return '#F44336'; // Red
    return '#9E9E9E'; // Gray
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getImageSource = () => {
    if (launch?.links.flickr?.original?.[0]) {
      return { uri: launch.links.flickr.original[0] };
    }
    if (launch?.links.patch?.large) {
      return { uri: launch.links.patch.large };
    }
    if (launch?.links.patch?.small) {
      return { uri: launch.links.patch.small };
    }
    return require('../assets/images/icon.png');
  };

  if (loading) {
    return <LoadingState message="Loading launch details..." />;
  }

  if (error || !launch) {
    return <ErrorState message={error || 'Launch not found'} onRetry={fetchLaunchDetails} />;
  }

  return (
    <ScrollView style={styles.container}>
      {/* Launch Image */}
      <View style={styles.imageContainer}>
        <Image source={getImageSource()} style={styles.image} />
        <View style={styles.statusBadge}>
          <View style={[styles.statusDot, { backgroundColor: getStatusColor() }]} />
          <Text style={styles.statusText}>{getStatusText()}</Text>
        </View>
      </View>

      {/* Launch Details */}
      <View style={styles.detailsContainer}>
        <Text style={styles.missionName}>{launch.name}</Text>
        <Text style={styles.launchDate}>{formatDate(launch.date_utc)}</Text>
        
        {launchpad && (
          <View style={styles.launchpadSection}>
            <Text style={styles.sectionTitle}>🚀 Launchpad</Text>
            <Text style={styles.launchpadName}>{launchpad.name}</Text>
            <Text style={styles.launchpadLocation}>
              {launchpad.locality}, {launchpad.region}
            </Text>
          </View>
        )}

        {/* Map Section */}
        {launchpad && (
          <View style={styles.mapSection}>
            <Text style={styles.sectionTitle}>📍 Location</Text>
            <MapCard launchpad={launchpad} />
          </View>
        )}

        {/* Loading or Error for Launchpad */}
        {!launchpad && launchpadLoading && (
          <View style={styles.mapSection}>
            <Text style={styles.sectionTitle}>📍 Location</Text>
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#007AFF" />
              <Text style={styles.loadingText}>Loading launchpad details...</Text>
            </View>
          </View>
        )}

        {!launchpad && launchpadError && (
          <View style={styles.mapSection}>
            <Text style={styles.sectionTitle}>📍 Location</Text>
            <View style={styles.errorContainer}>
              <Text style={styles.errorText}>Failed to load launchpad details</Text>
            </View>
          </View>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  imageContainer: {
    position: 'relative',
    backgroundColor: '#000',
  },
  image: {
    width: '100%',
    height: 300,
    resizeMode: 'cover',
  },
  statusBadge: {
    position: 'absolute',
    top: 16,
    right: 16,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  statusText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  detailsContainer: {
    padding: 16,
  },
  missionName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  launchDate: {
    fontSize: 16,
    color: '#666',
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  launchpadSection: {
    marginBottom: 24,
  },
  launchpadName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  launchpadLocation: {
    fontSize: 14,
    color: '#666',
  },
  mapSection: {
    marginBottom: 24,
  },
  loadingContainer: {
    padding: 32,
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: '#666',
  },
  errorContainer: {
    padding: 32,
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
  },
  errorText: {
    fontSize: 14,
    color: '#666',
  },
}); 