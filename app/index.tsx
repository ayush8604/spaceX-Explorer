import React, { useState, useCallback, useEffect, useRef } from 'react';
import {
  View,
  Text,
  FlatList,
  TextInput,
  StyleSheet,
  RefreshControl,
  ActivityIndicator,
  Keyboard,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useLaunches } from '../hooks/useLaunches';
import LaunchRow from '../components/LaunchRow';
import EmptyState from '../components/EmptyState';
import ErrorState from '../components/ErrorState';
import LoadingState from '../components/LoadingState';
import { Launch } from '../lib/types';

export default function LaunchListScreen() {
  const router = useRouter();
  const [searchText, setSearchText] = useState('');
  const searchTimeoutRef = useRef<ReturnType<typeof setTimeout>>();
  
  const {
    launches,
    loading,
    error,
    hasNextPage,
    refreshing,
    loadNextPage,
    refresh,
    search,
    reset,
  } = useLaunches();

  // Debounced search effect
  useEffect(() => {
    // Clear previous timeout
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    // Set new timeout for 500ms after user stops typing
    searchTimeoutRef.current = setTimeout(() => {
      if (searchText.trim()) {
        search(searchText.trim());
      } else {
        // If search is empty, show all launches but keep search input
        reset();
      }
    }, 500);

    // Cleanup timeout on unmount
    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, [searchText, search, reset]);

  const handleLaunchPress = useCallback((launch: Launch) => {
    router.push({
      pathname: '/details',
      params: { launchId: launch.id },
    });
  }, [router]);

  const handleSearch = useCallback((text: string) => {
    setSearchText(text);
  }, []);

  const handleLoadMore = useCallback(() => {
    if (hasNextPage && !loading) {
      loadNextPage();
    }
  }, [hasNextPage, loading, loadNextPage]);

  const renderFooter = () => {
    if (!hasNextPage) return null;
    return (
      <View style={styles.footer}>
        <ActivityIndicator size="small" color="#007AFF" />
        <Text style={styles.footerText}>Loading more...</Text>
      </View>
    );
  };

  const renderItem = useCallback(({ item }: { item: Launch }) => (
    <LaunchRow launch={item} onPress={handleLaunchPress} />
  ), [handleLaunchPress]);

  const keyExtractor = useCallback((item: Launch) => item.id, []);

  const getItemLayout = useCallback((data: any, index: number) => ({
    length: 92, // Height of LaunchRow
    offset: 92 * index,
    index,
  }), []);

  if (loading && launches.length === 0) {
    return <LoadingState />;
  }

  if (error && launches.length === 0) {
    return <ErrorState message={error} onRetry={refresh} />;
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>🚀 SpaceX Launches</Text>
        <View style={styles.searchContainer}>
          <TextInput
            style={styles.searchInput}
            placeholder="Search missions..."
            placeholderTextColor="#999"
            value={searchText}
            onChangeText={handleSearch}
            returnKeyType="search"
            onSubmitEditing={() => Keyboard.dismiss()}
          />
        </View>
      </View>

      <FlatList
        data={launches}
        renderItem={renderItem}
        keyExtractor={keyExtractor}
        getItemLayout={getItemLayout}
        initialNumToRender={10}
        maxToRenderPerBatch={10}
        windowSize={10}
        removeClippedSubviews={true}
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.1}
        ListFooterComponent={renderFooter}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={refresh} />
        }
        ListEmptyComponent={
          <EmptyState 
            message={searchText ? 'No missions found' : 'No launches available'}
            subtitle={searchText ? 'Try a different search term' : 'Check back later for updates'}
          />
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    backgroundColor: '#000',
    paddingTop: 20,
    paddingBottom: 16,
    paddingHorizontal: 16,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
    marginBottom: 16,
  },
  searchContainer: {
    backgroundColor: '#fff',
    borderRadius: 12,
    paddingHorizontal: 4,
    paddingVertical: 4,
  },
  searchInput: {
    height: 44,
    paddingHorizontal: 16,
    fontSize: 16,
    color: '#333',
  },
  footer: {
    padding: 16,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
  },
  footerText: {
    marginLeft: 8,
    fontSize: 14,
    color: '#666',
  },
}); 