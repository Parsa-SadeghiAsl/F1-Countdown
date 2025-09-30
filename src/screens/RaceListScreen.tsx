import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet, ActivityIndicator } from 'react-native';
import { getRaceSchedule } from '../services/API';
import { Race } from '../types';

const RaceListScreen = (): React.JSX.Element => {
  const [races, setRaces] = useState<Race[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchRaces = async () => {
      try {
        // Fetching the schedule for the current year, 2025
        const raceData = await getRaceSchedule('2025');
        setRaces(raceData);
      } catch (err) {
        setError('Failed to fetch race schedule. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchRaces();
  }, []);

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" />
        <Text>Loading Races...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.center}>
        <Text style={styles.errorText}>{error}</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={races}
        keyExtractor={(item) => item.round}
        renderItem={({ item }) => (
          <View style={styles.item}>
            <Text style={styles.raceName}>{item.raceName}</Text>
            <Text>{item.Circuit.circuitName}</Text>
            <Text>Round: {item.round}</Text>
            <Text>Date: {item.date}</Text>
          </View>
        )}
        ListHeaderComponent={<Text style={styles.header}>F1 Schedule 2025</Text>}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  container: {
    flex: 1,
    padding: 10,
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
  },
  item: {
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#cccccc',
  },
  raceName: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  errorText: {
    color: 'red',
    fontSize: 16,
  }
});

export default RaceListScreen;
