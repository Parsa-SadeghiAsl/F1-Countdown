import axios from 'axios';
import {
  F1APIResponse,
  F1RaceEvent,
  DriverStandingsResponse,
  ConstructorStandingsResponse,
  LiveSession,
  LiveDriver,
  LivePosition,
  LiveInterval,
  LiveSessionResult,
  Meeting, 
} from '../types';

const SCHEDULE_API_URL = 'https://raw.githubusercontent.com/sportstimes/f1/main/_db/f1/';
const ERGAST_API_URL = 'https://api.jolpi.ca/ergast/f1/';
const OPENF1_API_URL = 'https://api.openf1.org/v1/';

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

// --- Results Screen Functions ---

export const getMeetings = async (year: number): Promise<Meeting[]> => {
  try {
    const response = await axios.get<Meeting[]>(`${OPENF1_API_URL}meetings?year=${year}`);
    // Filter out meetings that haven't happened yet and sort them
    return response.data
      .filter(meeting => new Date(meeting.date_start) < new Date())
      .sort((a, b) => new Date(a.date_start).getTime() - new Date(b.date_start).getTime());
  } catch (error) {
    console.error(`Error fetching meetings for ${year}:`, error);
    return [];
  }
}

export const getSessions = async (meetingKey: number): Promise<LiveSession[]> => {
  try {
    const response = await axios.get<LiveSession[]>(`${OPENF1_API_URL}sessions?meeting_key=${meetingKey}`);
    return response.data.sort((a, b) => new Date(a.date_start).getTime() - new Date(b.date_start).getTime());
  } catch (error) {
    console.error(`Error fetching sessions for meeting ${meetingKey}:`, error);
    return [];
  }
}


export const getDrivers = async (session_key: number): Promise<LiveDriver[]> => {
  try {
    const response = await axios.get<LiveDriver[]>(`${OPENF1_API_URL}drivers?session_key=${session_key}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching drivers:', error);
    return [];
  }
}

export const getLatestDrivers = async (): Promise<LiveDriver[]> => {
  try {
    const response = await axios.get<LiveDriver[]>(`${OPENF1_API_URL}drivers?session_key=latest`);
    return response.data;
  } catch (error) {
    console.error('Error fetching latest drivers:', error);
    return [];
  }
}

export const getSessionResults = async (session_key: number): Promise<LiveSessionResult[]> => {
  try {
    const response = await axios.get<LiveSessionResult[]>(`${OPENF1_API_URL}session_result?session_key=${session_key}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching session results:', error);
    return [];
  }
}