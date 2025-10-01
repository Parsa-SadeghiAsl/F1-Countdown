import axios from 'axios';
import { F1APIResponse, F1RaceEvent } from '../types';

const API_BASE_URL = 'https://raw.githubusercontent.com/sportstimes/f1/main/_db/f1/';

export const getScheduleForYear = async (year: number): Promise<F1RaceEvent[]> => {
  try {
    const response = await axios.get<F1APIResponse>(`${API_BASE_URL}${year}.json`);
    return response.data.races;
  } catch (error) {
    console.error(`Error fetching F1 schedule for ${year}:`, error);
    // Return an empty array if the schedule for a year doesn't exist yet
    return [];
  }
};