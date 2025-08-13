import { Launch, Launchpad, LaunchResponse } from './types';

const SPACEX_API_BASE = process.env.SPACEX_API_BASE || 'https://api.spacexdata.com';

export const api = {
  // Fetch launches with pagination and search
  async fetchLaunches(page: number = 1, limit: number = 20, query?: string): Promise<LaunchResponse> {
    const body = {
      query: query ? { name: { $regex: query, $options: "i" } } : {},
      options: { limit, page, sort: { date_utc: -1 } }
    };

    try {
      const response = await fetch(`${SPACEX_API_BASE}/v5/launches/query`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json() as LaunchResponse;
    } catch (error) {
      console.error('Error fetching launches:', error);
      throw error;
    }
  },

  // Fetch launchpad details by ID
  async fetchLaunchpad(id: string): Promise<Launchpad> {
    try {
      const response = await fetch(`${SPACEX_API_BASE}/v4/launchpads/${id}`);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json() as Launchpad;
    } catch (error) {
      console.error('Error fetching launchpad:', error);
      throw error;
    }
  },

  // Fallback method for simple launch fetching
  async fetchLaunchesSimple(): Promise<Launch[]> {
    try {
      const response = await fetch(`${SPACEX_API_BASE}/v5/launches`);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json() as Launch[];
    } catch (error) {
      console.error('Error fetching launches (simple):', error);
      throw error;
    }
  }
}; 