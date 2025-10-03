import React, { useEffect, useState } from 'react';
import { View, StyleSheet, FlatList } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  ActivityIndicator,
  Card,
  Text,
  SegmentedButtons,
} from 'react-native-paper';
import { getDriverStandings, getConstructorStandings } from '../services/API';
import { DriverStanding, ConstructorStanding } from '../types';
import { colors } from '../styles/theme';

const StandingsScreen = ({ navigation }: any): React.JSX.Element => {
  const [drivers, setDrivers] = useState<DriverStanding[]>([]);
  const [constructors, setConstructors] = useState<ConstructorStanding[]>([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState('drivers'); // 'drivers' or 'constructors'

  useEffect(() => {
    const fetchData = async () => {
      try {
        const now = new Date();
        const year = now.getFullYear().toString();
        const [driverData, constructorData] = await Promise.all([
          getDriverStandings(year),
          getConstructorStandings(year),
        ]);
        setDrivers(driverData);
        setConstructors(constructorData);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const renderDriver = ({ item }: { item: DriverStanding }) => (
    <Card style={styles.itemCard}>
      <View style={styles.itemContainer}>
        <Text style={styles.position}>{item.position}</Text>
        <View style={{ flex: 1 }}>
          <Text
            style={styles.title}
          >{`${item.Driver.givenName} ${item.Driver.familyName}`}</Text>
          <Text style={styles.subtitle}>{item.Constructors[0]?.name}</Text>
        </View>
        <Text style={styles.points}>{item.points} PTS</Text>
      </View>
    </Card>
  );

  const renderConstructor = ({ item }: { item: ConstructorStanding }) => (
    <Card style={styles.itemCard}>
      <View style={styles.itemContainer}>
        <Text style={styles.position}>{item.position}</Text>
        <View style={{ flex: 1 }}>
          <Text style={styles.title}>{item.Constructor.name}</Text>
        </View>
        <Text style={styles.points}>{item.points} PTS</Text>
      </View>
    </Card>
  );

  return (
    <SafeAreaView style={styles.container}  edges={['top']}>
      <View style={styles.segmentContainer}>
        <SegmentedButtons
          value={view}
          onValueChange={setView}
          buttons={[
            { value: 'drivers', label: 'Drivers' },
            { value: 'constructors', label: 'Constructors' },
          ]}
          theme={{ colors: { secondaryContainer: colors.subtle } }}
        />
      </View>

      {loading ? (
        <ActivityIndicator
          style={{ marginTop: 20 }}
          size="large"
          color={colors.primary}
        />
      ) : (
        <FlatList
          data={view === 'drivers' ? drivers : constructors}
          renderItem={view === 'drivers' ? renderDriver : renderConstructor}
          keyExtractor={(item) => item.position}
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  headerTitle: {
    color: colors.text,
    textAlign: 'center',
    marginVertical: 20,
    marginTop: 40,
  },
  segmentContainer: { paddingHorizontal: 16, paddingBottom: 10, paddingTop: 30 },
  itemCard: {
    marginHorizontal: 16,
    marginVertical: 4,
    backgroundColor: colors.card,
  },
  itemContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
  },
  position: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.text,
    width: 40,
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.text,
  },
  subtitle: {
    color: colors.subtle,
  },
  points: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.primary,
  },
});

export default StandingsScreen;