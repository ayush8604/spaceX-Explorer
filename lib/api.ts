import { Launch, Launchpad, LaunchResponse } from './types';

const SPACEX_API_BASE = 'https://api.spacexdata.com';

// Helper function to create fetch with timeout
const fetchWithTimeout = async (url: string, options: RequestInit, timeout: number = 10000) => {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);
  
  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
    });
    clearTimeout(timeoutId);
    return response;
  } catch (error) {
    clearTimeout(timeoutId);
    if (error instanceof Error && error.name === 'AbortError') {
      throw new Error('Request timeout - please check your internet connection');
    }
    throw error;
  }
};

export const api = {
  // Check if SpaceX API is accessible
  async checkApiHealth(): Promise<boolean> {
    try {
      const response = await fetchWithTimeout(`${SPACEX_API_BASE}/v5/launches?limit=1`, {
        method: 'GET',
        headers: { 'Accept': 'application/json' }
      }, 5000);
      return response.ok;
    } catch (error) {
      console.error('API health check failed:', error);
      return false;
    }
  },

  // Fetch launches with pagination and search - using proper search endpoint
  async fetchLaunches(page: number = 1, limit: number = 20, query?: string): Promise<LaunchResponse> {
    try {
      let launches: Launch[];
      
      if (query && query.trim()) {
        // Use POST endpoint for search queries
        console.log('Searching launches with query:', query);
        
        const searchBody = {
          query: { 
            name: { 
              $regex: query.trim(), 
              $options: "i" 
            } 
          },
          options: { 
            limit: limit * 2, // Get more results for search
            page: 1, 
            sort: { date_utc: -1 } 
          }
        };

        const response = await fetchWithTimeout(`${SPACEX_API_BASE}/v5/launches/query`, {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'User-Agent': 'SpaceX-Explorer-App/1.0'
          },
          body: JSON.stringify(searchBody),
        }, 15000); // Longer timeout for search

        if (!response.ok) {
          throw new Error(`Search request failed: ${response.status}`);
        }

        const searchResult = await response.json();
        launches = searchResult.docs || [];
        
        // Implement client-side pagination for search results
        const startIndex = (page - 1) * limit;
        const endIndex = startIndex + limit;
        launches = launches.slice(startIndex, endIndex);
        
      } else {
        // Use GET endpoint for no search query
        console.log('Fetching all launches, page:', page);
        
        const response = await fetchWithTimeout(`${SPACEX_API_BASE}/v5/launches?limit=${limit}&page=${page}&sort=date_utc`, {
          method: 'GET',
          headers: { 
            'Accept': 'application/json',
            'User-Agent': 'SpaceX-Explorer-App/1.0'
          },
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        launches = await response.json() as Launch[];
      }

      console.log(`Fetched ${launches.length} launches`);
      
      // Convert to expected format
      return {
        docs: launches,
        hasNextPage: launches.length === limit,
        page,
        totalDocs: launches.length,
        totalPages: Math.ceil(launches.length / limit)
      };
    } catch (error) {
      console.error('Error fetching launches:', error);
      
      // Try fallback method if main method fails
      try {
        console.log('Trying fallback method...');
        const fallbackLaunches = await this.fetchLaunchesSimple();
        
        // Apply search filter on client side if search was requested
        let filteredLaunches = fallbackLaunches;
        if (query && query.trim()) {
          const searchTerm = query.trim().toLowerCase();
          filteredLaunches = fallbackLaunches.filter(launch => 
            launch.name.toLowerCase().includes(searchTerm)
          );
        }
        
        // Apply pagination
        const startIndex = (page - 1) * limit;
        const endIndex = startIndex + limit;
        const paginatedLaunches = filteredLaunches.slice(startIndex, endIndex);
        
        return {
          docs: paginatedLaunches,
          hasNextPage: filteredLaunches.length > endIndex,
          page,
          totalDocs: filteredLaunches.length,
          totalPages: Math.ceil(filteredLaunches.length / limit)
        };
      } catch (fallbackError) {
        console.error('Fallback method also failed:', fallbackError);
        
        // Check if it's a network issue
        const isApiHealthy = await this.checkApiHealth();
        if (!isApiHealthy) {
          throw new Error('SpaceX API is currently unavailable. Please try again later.');
        }
        
        throw new Error('Failed to fetch launches. Please check your internet connection and try again.');
      }
    }
  },

  // Fetch launchpad details by ID
  async fetchLaunchpad(id: string): Promise<Launchpad> {
    try {
      console.log('Fetching launchpad:', id);
      
      const response = await fetchWithTimeout(`${SPACEX_API_BASE}/v4/launchpads/${id}`, {
        headers: { 
          'Accept': 'application/json',
          'User-Agent': 'SpaceX-Explorer-App/1.0'
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json() as Launchpad;
    } catch (error) {
      console.error('Error fetching launchpad:', error);
      throw new Error(`Failed to fetch launchpad details: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  },

  // Fallback method for simple launch fetching
  async fetchLaunchesSimple(): Promise<Launch[]> {
    try {
      console.log('Using fallback method to fetch launches');
      
      const response = await fetchWithTimeout(`${SPACEX_API_BASE}/v5/launches`, {
        headers: { 
          'Accept': 'application/json',
          'User-Agent': 'SpaceX-Explorer-App/1.0'
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json() as Launch[];
    } catch (error) {
      console.error('Error fetching launches (simple):', error);
      throw new Error('Failed to fetch launches from SpaceX API. Please check your internet connection and try again.');
    }
  }
}; 