import React, { useEffect, useState } from 'react';
import { View, StyleSheet, FlatList } from 'react-native';
import {
  ActivityIndicator,
  Card,
  Text,
  List,
  Divider,
} from 'react-native-paper';
import { getRaceSchedule } from '../services/API';
import { Race } from '../types';

// Represents the calculated time remaining
interface Countdown {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

const RaceListScreen = (): React.JSX.Element => {
  const [nextRace, setNextRace] = useState<Race | null>(null);
  const [upcomingRaces, setUpcomingRaces] = useState<Race[]>([]);
  const [countdown, setCountdown] = useState<Countdown | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAndProcessRaces = async () => {
      try {
        const allRaces = await getRaceSchedule('2025');
        const now = new Date();

        const futureRaces = allRaces
          .map(race => ({
            ...race,
            // Combine date and time to create a full Date object in UTC
            raceDateTime: new Date(`${race.date}T${race.time}`),
          }))
          .filter(race => race.raceDateTime > now)
          .sort((a, b) => a.raceDateTime.getTime() - b.raceDateTime.getTime());

        if (futureRaces.length > 0) {
          setNextRace(futureRaces[0]);
          setUpcomingRaces(futureRaces.slice(1));
        }
      } catch (err) {
        setError('Failed to fetch race schedule.');
      } finally {
        setLoading(false);
      }
    };

    fetchAndProcessRaces();
  }, []);

  useEffect(() => {
    if (!nextRace) return;

    const timer = setInterval(() => {
      const now = new Date().getTime();
      const raceTime = new Date(
        `${nextRace.date}T${nextRace.time}`,
      ).getTime();
      const distance = raceTime - now;

      if (distance < 0) {
        clearInterval(timer);
        setCountdown(null);
        // Here you might want to refetch races to update the "next race"
      } else {
        setCountdown({
          days: Math.floor(distance / (1000 * 60 * 60 * 24)),
          hours: Math.floor(
            (distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60),
          ),
          minutes: Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60)),
          seconds: Math.floor((distance % (1000 * 60)) / 1000),
        });
      }
    }, 1000);

    return () => clearInterval(timer); // Cleanup on component unmount
  }, [nextRace]);

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" />
        <Text style={styles.loadingText}>Finding Next Race...</Text>
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

  if (!nextRace) {
    return (
      <View style={styles.center}>
        <Text>No upcoming races found for this season.</Text>
      </View>
    );
  }

  const renderUpcomingRace = ({ item }: { item: Race }) => (
    <List.Item
      title={item.raceName}
      description={`${item.Circuit.circuitName}\n${new Date(
        `${item.date}T${item.time}`,
      ).toLocaleString()}`}
      descriptionNumberOfLines={2}
      left={props => <List.Icon {...props} icon="chevron-right-circle" />}
    />
  );

  return (
    <View style={styles.container}>
      <Card style={styles.nextRaceCard} elevation={5}>
        <Card.Content>
          <Text variant="labelLarge" style={styles.nextRaceSubheading}>NEXT RACE</Text>
          <Text variant="headlineMedium" style={styles.nextRaceTitle}>{nextRace.raceName}</Text>
          <Text style={styles.circuitText}>{nextRace.Circuit.circuitName}</Text>
          <Text style={styles.dateText}>
            {new Date(`${nextRace.date}T${nextRace.time}`).toLocaleString()}
          </Text>
          {countdown && (
            <View style={styles.countdownContainer}>
              <View style={styles.timeBox}>
                <Text variant="headlineLarge">{countdown.days}</Text>
                <Text>Days</Text>
              </View>
              <View style={styles.timeBox}>
                <Text variant="headlineLarge">{countdown.hours}</Text>
                <Text>Hours</Text>
              </View>
              <View style={styles.timeBox}>
                <Text variant="headlineLarge">{countdown.minutes}</Text>
                <Text>Mins</Text>
              </View>
              <View style={styles.timeBox}>
                <Text variant="headlineLarge">{countdown.seconds}</Text>
                <Text>Secs</Text>
              </View>
            </View>
          )}
        </Card.Content>
      </Card>

      <Text variant="titleLarge" style={styles.listHeader}>Upcoming Races</Text>
      <FlatList
        data={upcomingRaces}
        keyExtractor={item => item.round}
        renderItem={renderUpcomingRace}
        ItemSeparatorComponent={() => <Divider />}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  container: {
    flex: 1,
  },
  loadingText: {
    marginTop: 10,
  },
  errorText: {
    color: 'red',
    fontSize: 16,
  },
  nextRaceCard: {
    margin: 15,
  },
  nextRaceSubheading: {
    textAlign: 'center',
    color: '#E10600', // F1 Red
    fontWeight: 'bold',
  },
  nextRaceTitle: {
    textAlign: 'center',
    fontSize: 28,
    lineHeight: 30,
    marginVertical: 5,
  },
  circuitText: {
    textAlign: 'center',
    marginBottom: 5,
    fontStyle: 'italic',
  },
  dateText: {
    textAlign: 'center',
    marginBottom: 15,
    fontSize: 16,
  },
  countdownContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  timeBox: {
    alignItems: 'center',
  },
  listHeader: {
    marginLeft: 15,
    marginTop: 10,
    marginBottom: 5,
  },
});

export default RaceListScreen;
