import { useState, useEffect, useCallback } from 'react';
import * as Location from 'expo-location';
import { logger } from '../lib/logger';

export type LocationState = {
  latitude: number;
  longitude: number;
  accuracy: number | null;
};

export type PermissionStatus = 'unasked' | 'granted' | 'denied' | 'restricted';

export function useUserLocation() {
  const [location, setLocation] = useState<LocationState | null>(null);
  const [permissionStatus, setPermissionStatus] = useState<PermissionStatus>('unasked');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const requestPermission = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const { status } = await Location.requestForegroundPermissionsAsync();
      setPermissionStatus(status as PermissionStatus);

      if (status === 'granted') {
        await getCurrentLocation();
      }

      return status;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to request location permission';
      setError(errorMessage);
      logger.error('Failed to request location permission', err);
      return 'denied';
    } finally {
      setLoading(false);
    }
  }, []);

  const getCurrentLocation = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const currentLocation = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });

      setLocation({
        latitude: currentLocation.coords.latitude,
        longitude: currentLocation.coords.longitude,
        accuracy: currentLocation.coords.accuracy,
      });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to get current location';
      setError(errorMessage);
      logger.error('Failed to get current location', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const checkPermissionStatus = useCallback(async () => {
    try {
      const { status } = await Location.getForegroundPermissionsAsync();
      setPermissionStatus(status as PermissionStatus);
      return status;
    } catch (err) {
      logger.error('Failed to check permission status', err);
      return 'denied';
    }
  }, []);

  // Check permission status on mount
  useEffect(() => {
    checkPermissionStatus();
  }, [checkPermissionStatus]);

  return {
    location,
    permissionStatus,
    loading,
    error,
    requestPermission,
    getCurrentLocation,
    checkPermissionStatus,
  };
} 