import axios from 'axios';
import { ApiResponse, Race } from '../types';

const apiClient = axios.create({
  baseURL: 'https://api.jolpi.ca/ergast/f1',
});

export const getRaceSchedule = async (year: string): Promise<Race[]> => {
  try {
    console.log('Hi')
    const response = await apiClient.get<ApiResponse>(`/${year}.json`);
    if (response.data && response.data.MRData.RaceTable.Races) {
      return response.data.MRData.RaceTable.Races;
    }
    return [];
  } catch (error) {
    console.error("Error fetching race schedule:", error);
    throw error;
  }
};
