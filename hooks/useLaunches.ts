import { useState, useEffect, useCallback } from 'react';
import { Launch, LaunchResponse } from '../lib/types';
import { api } from '../lib/api';
import { logger } from '../lib/logger';

export function useLaunches() {
  const [launches, setLaunches] = useState<Launch[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hasNextPage, setHasNextPage] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [refreshing, setRefreshing] = useState(false);

  const fetchPage = useCallback(async (page: number, query: string = '') => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await api.fetchLaunches(page, 20, query);
      
      if (page === 1) {
        setLaunches(response.docs);
      } else {
        setLaunches(prev => [...prev, ...response.docs]);
      }
      
      setHasNextPage(response.hasNextPage);
      setCurrentPage(page);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch launches';
      setError(errorMessage);
      logger.error('Failed to fetch launches', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const refresh = useCallback(async () => {
    setRefreshing(true);
    await fetchPage(1, searchQuery);
    setRefreshing(false);
  }, [fetchPage, searchQuery]);

  const loadNextPage = useCallback(async () => {
    if (hasNextPage && !loading) {
      await fetchPage(currentPage + 1, searchQuery);
    }
  }, [hasNextPage, loading, currentPage, fetchPage, searchQuery]);

  const search = useCallback(async (query: string) => {
    setSearchQuery(query);
    setLaunches([]);
    setCurrentPage(1);
    setHasNextPage(false);
    await fetchPage(1, query);
  }, [fetchPage]);

  const reset = useCallback(async () => {
    // Don't clear searchQuery - keep the input visible
    // setSearchQuery(''); // Remove this line
    setLaunches([]);
    setCurrentPage(1);
    setHasNextPage(false);
    await fetchPage(1, '');
  }, [fetchPage]);

  // Initial load
  useEffect(() => {
    fetchPage(1);
  }, [fetchPage]);

  return {
    launches,
    loading,
    error,
    hasNextPage,
    refreshing,
    searchQuery,
    fetchPage,
    refresh,
    loadNextPage,
    search,
    reset,
  };
} 