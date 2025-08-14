import React, { memo } from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';
import { Launch } from '../lib/types';

interface LaunchRowProps {
  launch: Launch;
  onPress: (launch: Launch) => void;
}

const LaunchRow = memo<LaunchRowProps>(({ launch, onPress }) => {
  const handlePress = () => onPress(launch);

  const getStatusText = () => {
    if (launch.upcoming) return 'Upcoming';
    if (launch.success === true) return 'Successful';
    if (launch.success === false) return 'Failed';
    return 'Unknown';
  };

  const getStatusColor = () => {
    if (launch.upcoming) return '#FFA500'; 
    if (launch.success === true) return '#4CAF50'; 
    if (launch.success === false) return '#F44336'; 
    return '#9E9E9E'; 
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const getImageSource = () => {
    if (launch.links.flickr?.original?.[0]) {
      return { uri: launch.links.flickr.original[0] };
    }
    if (launch.links.patch?.large) {
      return { uri: launch.links.patch.large };
    }
    if (launch.links.patch?.small) {
      return { uri: launch.links.patch.small };
    }
    // Return a placeholder or default image
    return require('../assets/images/icon.png');
  };

  return (
    <TouchableOpacity style={styles.container} onPress={handlePress}>
      <Image source={getImageSource()} style={styles.image} />
      <View style={styles.content}>
        <Text style={styles.name} numberOfLines={2}>
          {launch.name}
        </Text>
        <Text style={styles.date}>{formatDate(launch.date_utc)}</Text>
        <View style={styles.statusContainer}>
          <View style={[styles.statusDot, { backgroundColor: getStatusColor() }]} />
          <Text style={styles.status}>{getStatusText()}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
});

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    padding: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  image: {
    width: 60,
    height: 60,
    borderRadius: 8,
    marginRight: 16,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
  },
  name: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  date: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  status: {
    fontSize: 12,
    color: '#666',
    textTransform: 'uppercase',
    fontWeight: '500',
  },
});

LaunchRow.displayName = 'LaunchRow';

export default LaunchRow; 