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


// --- Live Leaderboard Functions ---
export const getLatestSession = async (): Promise<LiveSession | null> => {
  try {
    // Get all meetings for the current year to find the most recent one.
    const meetingResponse = await axios.get<any[]>(`${OPENF1_API_URL}meetings?year=${new Date().getFullYear()}`);
    if (meetingResponse.data.length === 0) return null;

    // Sort meetings by date to find the most recent one.
    const latestMeeting = meetingResponse.data.sort((a,b) => new Date(b.date_start).getTime() - new Date(a.date_start).getTime())[0];
    if (!latestMeeting) return null;
    
    const meetingKey = latestMeeting.meeting_key;

    // Get all sessions for that meeting.
    const sessionsResponse = await axios.get<LiveSession[]>(`${OPENF1_API_URL}sessions?meeting_key=${meetingKey}`);
    const sessions = sessionsResponse.data;

    const now = new Date();

    // Find a session that is currently live.
    const liveSession = sessions.find(s => {
      const start = new Date(s.date_start);
      const end = new Date(s.date_end);
      return now >= start && now <= end;
    });

    if (liveSession) {
      return { ...liveSession, isLive: true };
    }

    // If no live session, return the most recently finished one within the last 3 hours as a fallback.
    const recentSessions = sessions
      .filter(s => now > new Date(s.date_end))
      .sort((a, b) => new Date(b.date_end).getTime() - new Date(a.date_end).getTime());

    if (recentSessions.length > 0) {
      const mostRecent = recentSessions[0];
      // If it ended less than 12 hours ago, we can show its final results.
      if (now.getTime() - new Date(mostRecent.date_end).getTime() < 120 * 60 * 60 * 1000) {
        return { ...mostRecent, isLive: false };
      }
    }

    return null;
  } catch (error) {
    console.error('Error fetching latest F1 session:', error);
    return null;
  }
};


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

export const getPositions = async (session_key: number): Promise<LivePosition[]> => {
  try {
    // The API returns data sorted by date descending, so we get the latest positions.
    const response = await axios.get<LivePosition[]>(`${OPENF1_API_URL}position?session_key=${session_key}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching positions:', error);
    return [];
  }
}


export const getIntervals = async (session_key: number): Promise<LiveInterval[]> => {
  try {
     // The API returns data sorted by date descending, so we get the latest intervals.
    const response = await axios.get<LiveInterval[]>(`${OPENF1_API_URL}intervals?session_key=${session_key}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching intervals:', error);
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