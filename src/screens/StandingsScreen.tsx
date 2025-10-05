import React, { useEffect, useState } from 'react';
import { View, FlatList, Image, ListRenderItem } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  ActivityIndicator,
  Card,
  Text,
  SegmentedButtons,
} from 'react-native-paper';
import { getDriverStandings, getConstructorStandings, getLatestDrivers } from '../services/API';
import { DriverStanding, ConstructorStanding, LiveDriver } from '../types';
import { colors, globalStyles } from '../styles/globalStyles';

const StandingsScreen = (): React.JSX.Element => {
  const [drivers, setDrivers] = useState<DriverStanding[]>([]);
  const [constructors, setConstructors] = useState<ConstructorStanding[]>([]);
  const [liveDrivers, setLiveDrivers] = useState<Map<number, LiveDriver>>(new Map());
  const [constructorColors, setConstructorColors] = useState<Map<string, string>>(new Map());
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState('drivers');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const year = new Date().getFullYear().toString();
        const [driverData, constructorData, liveDriversData] = await Promise.all([
          getDriverStandings(year),
          getConstructorStandings(year),
          getLatestDrivers(),
        ]);

        setDrivers(driverData || []);
        setConstructors(constructorData || []);

        const driversMap = new Map<number, LiveDriver>();
        liveDriversData.forEach(driver => {
          driversMap.set(driver.driver_number, driver);
        });
        setLiveDrivers(driversMap);

        const colorMap = new Map<string, string>();
        liveDriversData.forEach(driver => {
          if (driver.team_name && driver.team_colour && !colorMap.has(driver.team_name)) {
            colorMap.set(driver.team_name == 'Kick Sauber' ? 'sauber': driver.team_name == 'Racing Bulls' ? 'rb f1 team': driver.team_name , `#${driver.team_colour}`);
          }
        });


        const finalConstructorColors = new Map<string, string>();
        if (constructorData) {
          constructorData.forEach(constructor => {
            const constructorName = constructor.Constructor.name.toLowerCase();
            for (const [teamName, color] of colorMap.entries()) {
              if (teamName.toLowerCase().includes(constructorName) || constructorName.includes(teamName.toLowerCase())) {
                finalConstructorColors.set(constructor.Constructor.name, color);
                break;
              }
            }
          });
        }
        setConstructorColors(finalConstructorColors);

      } catch (error) {
        console.error("Failed to fetch standings data:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const renderDriver: ListRenderItem<DriverStanding> = ({ item }) => {
    const liveDriver = liveDrivers.get(Number(item.Driver.permanentNumber) == 33 ? 1 :Number(item.Driver.permanentNumber));
    const teamColor = liveDriver?.team_colour ? `#${liveDriver.team_colour}` : colors.subtle;

    return (
      <Card style={globalStyles.itemCard}>
        <View style={globalStyles.itemContainer}>
          <View style={[globalStyles.teamColorBar, { backgroundColor: teamColor }]} />
          <Text style={globalStyles.position}>{item.position}</Text>
          {liveDriver?.headshot_url ? (
            <Image source={{ uri: liveDriver.headshot_url }} style={globalStyles.headshot} />
          ) : (
            <View style={globalStyles.headshot} />
          )}
          <View style={globalStyles.driverInfo}>
            <Text style={globalStyles.title}>{`${item.Driver.givenName} ${item.Driver.familyName}`}</Text>
            <Text style={globalStyles.subtitle}>{item.Constructors[0]?.name}</Text>
          </View>
          <Text style={globalStyles.points}>{item.points} PTS</Text>
        </View>
      </Card>
    );
  };

  const renderConstructor: ListRenderItem<ConstructorStanding> = ({ item }) => {
    const color = constructorColors.get(item.Constructor.name) || colors.subtle;
    return (
      <Card style={globalStyles.itemCard}>
        <View style={globalStyles.itemContainer}>
          <View style={[globalStyles.teamColorBar, { backgroundColor: color }]} />
          <Text style={globalStyles.position}>{item.position}</Text>
          <View style={globalStyles.driverInfo}>
            <Text style={globalStyles.title}>{item.Constructor.name}</Text>
          </View>
          <Text style={globalStyles.points}>{item.points} PTS</Text>
        </View>
      </Card>
    );
  };

  return (
    <SafeAreaView style={globalStyles.container} edges={['top']}>
      <View style={globalStyles.segmentContainer}>
        <SegmentedButtons
          value={view}
          onValueChange={setView}
          buttons={[
            { value: 'drivers', label: 'Drivers' },
            { value: 'constructors', label: 'Constructors' },
          ]}
        />
      </View>

      {loading ? (
        <ActivityIndicator style={{ marginTop: 20 }} size="large" color={colors.primary} />
      ) : (
        <FlatList
          data={view === 'drivers' ? drivers : constructors}
          renderItem={view === 'drivers' ? renderDriver as any : renderConstructor as any}
          keyExtractor={(item: any) => item.position}
        />
      )}
    </SafeAreaView>
  );
};

export default StandingsScreen;