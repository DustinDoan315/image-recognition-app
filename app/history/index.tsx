import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  RefreshControl,
  Alert,
  Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useScanStore } from '../../state/useScanStore';
import { ScanCard } from '../../components/ScanCard';
import { Button } from '../../components/Button';

export default function HistoryScreen() {
  const router = useRouter();
  const scans = useScanStore((state) => state.scans);
  const deleteScan = useScanStore((state) => state.deleteScan);
  const loadScans = useScanStore((state) => state.loadScans);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadScans();
  }, [loadScans]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadScans();
    setRefreshing(false);
  };

  const handleScanPress = (scanId: string) => {
    router.push(`/history/${scanId}`);
  };

  const handleDelete = (scanId: string) => {
    Alert.alert(
      'Delete Scan',
      'Are you sure you want to delete this scan?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => deleteScan(scanId),
        },
      ],
    );
  };

  const renderScanCard = ({ item }: { item: typeof scans[0] }) => (
    <ScanCard
      scan={item}
      onPress={() => handleScanPress(item.id)}
      onDelete={() => handleDelete(item.id)}
    />
  );

  if (scans.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyTitle}>No Scans Yet</Text>
        <Text style={styles.emptyText}>
          Your scan history will appear here after you analyze your first image.
        </Text>
        <Button
          title="Start Scanning"
          onPress={() => router.push('/')}
          style={styles.emptyButton}
        />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={scans}
        renderItem={renderScanCard}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
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
  listContent: {
    padding: 16,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 24,
  },
  emptyButton: {
    minWidth: 200,
  },
});

