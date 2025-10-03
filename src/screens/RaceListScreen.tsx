import React, { useEffect, useState } from 'react';
import { View, StyleSheet, FlatList, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  ActivityIndicator,
  Card,
  Text,
  IconButton,
} from 'react-native-paper';
import { getScheduleForYear } from '../services/API';
import { ProcessedEvent, Sessions } from '../types';
import { colors } from '../styles/theme';

interface Countdown {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

const getSessionName = (sessionKey: string): string => {
  const names: Record<string, string> = {
    fp1: 'Practice 1',
    fp2: 'Practice 2',
    fp3: 'Practice 3',
    sprintQualifying: 'Sprint Qualifying',
    qualifying: 'Qualifying',
    sprint: 'Sprint',
    gp: 'Race',
  };
  return names[sessionKey] || 'Event';
};

const RaceListScreen = (): React.JSX.Element => {
  const [nextEvent, setNextEvent] = useState<ProcessedEvent | null>(null);
  const [upcomingEvents, setUpcomingEvents] = useState<ProcessedEvent[]>([]);
  const [countdown, setCountdown] = useState<Countdown | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAndProcessEvents = async () => {
      try {
        const now = new Date();
        const currentYear = now.getFullYear();
        let raceEvents = await getScheduleForYear(currentYear);
        let allEvents: ProcessedEvent[] = [];
        raceEvents.forEach((race) => {
          for (const sessionKey in race.sessions) {
            const key = sessionKey as keyof Sessions;
            const sessionDate = race.sessions[key];
            if (sessionDate) {
              allEvents.push({
                key: `${race.round}-${key}`,
                eventName: getSessionName(key),
                raceName: race.name,
                dateTime: new Date(sessionDate),
              });
            }
          }
        });
        let futureEvents = allEvents
          .filter((e) => e.dateTime > now)
          .sort((a, b) => a.dateTime.getTime() - b.dateTime.getTime());
        if (futureEvents.length === 0) {
          const nextYearRaces = await getScheduleForYear(currentYear + 1);
          if (nextYearRaces.length > 0) {
            let nextYearEvents: ProcessedEvent[] = [];
            nextYearRaces.forEach((race) => {
              for (const sessionKey in race.sessions) {
                const key = sessionKey as keyof Sessions;
                const sessionDate = race.sessions[key];
                if (sessionDate) {
                  nextYearEvents.push({
                    key: `${race.round}-${key}`,
                    eventName: getSessionName(key),
                    raceName: race.name,
                    dateTime: new Date(sessionDate),
                  });
                }
              }
            });
            futureEvents = nextYearEvents.sort(
              (a, b) => a.dateTime.getTime() - b.dateTime.getTime()
            );
          }
        }
        if (futureEvents.length > 0) {
          setNextEvent(futureEvents[0]);
          setUpcomingEvents(futureEvents.slice(1));
        }
      } catch (err) {
        setError('Failed to fetch F1 schedule.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchAndProcessEvents();
  }, []);

  useEffect(() => {
    if (!nextEvent) return;
    const timer = setInterval(() => {
      const distance = nextEvent.dateTime.getTime() - new Date().getTime();
      if (distance < 0) {
        clearInterval(timer);
        setCountdown(null);
      } else {
        setCountdown({
          days: Math.floor(distance / 86400000),
          hours: Math.floor((distance % 86400000) / 3600000),
          minutes: Math.floor((distance % 3600000) / 60000),
          seconds: Math.floor((distance % 60000) / 1000),
        });
      }
    }, 1000);
    return () => clearInterval(timer);
  }, [nextEvent]);

  if (loading)
    return (
      <View style={styles.center}>
        <ActivityIndicator color={colors.primary} size="large" />
        <Text style={styles.loadingText}>Loading Schedule...</Text>
      </View>
    );
  if (error)
    return (
      <View style={styles.center}>
        <Text style={styles.errorText}>{error}</Text>
      </View>
    );
  if (!nextEvent)
    return (
      <View style={styles.center}>
        <Text>No upcoming events found.</Text>
      </View>
    );

  const renderUpcomingEvent = ({ item }: { item: ProcessedEvent }) => (
    <Card style={styles.calenderCard}>
      <Card.Title
        title={`${item.raceName} - ${item.eventName}`}
        subtitle={item.dateTime.toLocaleString()}
        titleStyle={{ color: colors.text }}
        subtitleStyle={{ color: colors.subtle }}
        right={(props) => (
          <IconButton
            {...props}
            iconColor={colors.primary}
            icon="chevron-right-circle"
          />
        )}
      />
    </Card>
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.logoContainer}>
        <Image
          source={require('../assets/f1.png')}
          style={styles.logo}
          resizeMode="contain"
        />
      </View>
      <Card style={styles.nextRaceCard} elevation={4}>
        <Card.Content>
          <Text variant="labelLarge" style={styles.nextRaceSubheading}>
            NEXT EVENT: {nextEvent.eventName}
          </Text>
          <Text variant="headlineMedium" style={styles.nextRaceTitle}>
            {nextEvent.raceName}
          </Text>
          <Text style={styles.dateText}>
            {nextEvent.dateTime.toLocaleString()}
          </Text>
          {countdown && (
            <View style={styles.countdownContainer}>
              <View style={styles.timeBox}>
                <Text variant="headlineLarge" style={styles.countdownNumber}>
                  {countdown.days}
                </Text>
                <Text style={styles.countdownLabel}>Days</Text>
              </View>
              <View style={styles.timeBox}>
                <Text variant="headlineLarge" style={styles.countdownNumber}>
                  {countdown.hours}
                </Text>
                <Text style={styles.countdownLabel}>Hours</Text>
              </View>
              <View style={styles.timeBox}>
                <Text variant="headlineLarge" style={styles.countdownNumber}>
                  {countdown.minutes}
                </Text>
                <Text style={styles.countdownLabel}>Mins</Text>
              </View>
              <View style={styles.timeBox}>
                <Text variant="headlineLarge" style={styles.countdownNumber}>
                  {countdown.seconds}
                </Text>
                <Text style={styles.countdownLabel}>Secs</Text>
              </View>
            </View>
          )}
        </Card.Content>
      </Card>
      <Text variant="titleLarge" style={styles.listHeader}>
        Upcoming Events
      </Text>
      <FlatList
        data={upcomingEvents}
        keyExtractor={(item) => item.key}
        renderItem={renderUpcomingEvent}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
  },
  container: { flex: 1, backgroundColor: colors.background },
  logoContainer: { alignItems: 'center', marginVertical: 20, marginTop: 40, },
  logo: {
    width: 120,
    height: 30,
    tintColor: colors.primary,
  },
  loadingText: { marginTop: 10, color: colors.text },
  calenderCard: { marginHorizontal: 10, marginBottom: 10, backgroundColor: colors.card },
  errorText: { color: colors.primary, fontSize: 16 },
  nextRaceCard: {
    marginHorizontal: 15,
    backgroundColor: colors.card,
    borderRadius: 12,
  },
  nextRaceSubheading: {
    textAlign: 'center',
    color: colors.primary,
    fontWeight: 'bold',
  },
  nextRaceTitle: {
    textAlign: 'center',
    color: colors.text,
    marginVertical: 5,
  },
  dateText: {
    textAlign: 'center',
    color: colors.subtle,
    marginBottom: 15,
    fontSize: 16,
  },
  countdownContainer: { flexDirection: 'row', justifyContent: 'space-around' },
  timeBox: { alignItems: 'center' },
  countdownNumber: { color: colors.text, fontWeight: 'bold' },
  countdownLabel: { color: colors.subtle },
  listHeader: {
    color: colors.text,
    marginLeft: 15,
    marginTop: 10,
    marginBottom: 10,
    fontWeight: 'bold',
  },
});

export default RaceListScreen;
