import axios from 'axios';
import {
  F1APIResponse,
  F1RaceEvent,
  DriverStandingsResponse,
  ConstructorStandingsResponse,
} from '../types';

const SCHEDULE_API_URL = 'https://raw.githubusercontent.com/sportstimes/f1/main/_db/f1/';
const ERGAST_API_URL = 'http://api.jolpi.ca/ergast/f1/';

export const getScheduleForYear = async (
  year: number
): Promise<F1RaceEvent[]> => {
  try {
    const response = await axios.get<F1APIResponse>(
      `${SCHEDULE_API_URL}${year}.json`
    );
    return response.data.races;
  } catch (error) {
    console.error(`Error fetching F1 schedule for ${year}:`, error);
    return [];
  }
};

export const getDriverStandings = async (year: string) => {
  try {
    const response = await axios.get<DriverStandingsResponse>(
      `${ERGAST_API_URL}${year}/driverStandings.json`
    );
    return response.data.MRData.StandingsTable.StandingsLists[0].DriverStandings;
  } catch (error) {
    console.error('Error fetching driver standings:', error);
    throw error;
  }
};

export const getConstructorStandings = async (year: string) => {
  try {
    const response = await axios.get<ConstructorStandingsResponse>(
      `${ERGAST_API_URL}${year}/constructorStandings.json`
    );
    return response.data.MRData.StandingsTable.StandingsLists[0]
      .ConstructorStandings;
  } catch (error) {
    console.error('Error fetching constructor standings:', error);
    throw error;
  }
};
