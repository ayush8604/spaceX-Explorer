import { useState, useEffect, useCallback } from 'react';
import { Launchpad } from '../lib/types';
import { api } from '../lib/api';
import { logger } from '../lib/logger';

const launchpadCache = new Map<string, Launchpad>();

export function useLaunchpad(launchpadId: string) {
  const [launchpad, setLaunchpad] = useState<Launchpad | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchLaunchpad = useCallback(async () => {
    if (!launchpadId) return;

   
    if (launchpadCache.has(launchpadId)) {
      setLaunchpad(launchpadCache.get(launchpadId)!);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      const data = await api.fetchLaunchpad(launchpadId);
      
      
      launchpadCache.set(launchpadId, data);
      setLaunchpad(data);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch launchpad';
      setError(errorMessage);
      logger.error('Failed to fetch launchpad', err);
    } finally {
      setLoading(false);
    }
  }, [launchpadId]);

  useEffect(() => {
    fetchLaunchpad();
  }, [fetchLaunchpad]);

  return {
    launchpad,
    loading,
    error,
    refetch: fetchLaunchpad,
  };
} 