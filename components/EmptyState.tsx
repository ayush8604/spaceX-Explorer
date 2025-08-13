import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

interface EmptyStateProps {
  message?: string;
  subtitle?: string;
}

const EmptyState: React.FC<EmptyStateProps> = ({ 
  message = 'No launches found', 
  subtitle = 'Try adjusting your search or check back later' 
}) => {
  return (
    <View style={styles.container}>
      <Text style={styles.icon}>🚀</Text>
      <Text style={styles.message}>{message}</Text>
      <Text style={styles.subtitle}>{subtitle}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  icon: {
    fontSize: 64,
    marginBottom: 16,
  },
  message: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    lineHeight: 20,
  },
});

export default EmptyState; 