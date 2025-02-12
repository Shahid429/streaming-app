interface ConfigState {
  currentConfig: { [key: string]: string } | null;
  lastFetchTime: number;
}

const state: ConfigState = {
  currentConfig: null,
  lastFetchTime: 0,
};

const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes cache

export const fetchM3u8Links = async (): Promise<{ [key: string]: string }> => {
  try {
    // Check if we have a cached config that's still valid
    if (
      state.currentConfig && 
      Date.now() - state.lastFetchTime < CACHE_DURATION
    ) {
      return state.currentConfig;
    }

    const apiUrl = 'https://api.github.com/repos/Shahid429/Link/contents/m3u8Links.json';
    const response = await fetch(apiUrl, {
      headers: {
        'Accept': 'application/vnd.github.v3.raw',
        // Removed problematic headers
      },
      mode: 'cors' // Explicitly set CORS mode
    });

    if (!response.ok) {
      throw new Error("Failed to fetch m3u8 links from GitHub");
    }

    const data = await response.json();

    // Validate the data structure
    if (!data || typeof data !== 'object') {
      throw new Error("Invalid m3u8 links format");
    }

    // Validate each link
    Object.entries(data).forEach(([key, value]) => {
      if (typeof value !== 'string' || !value.includes('.m3u8')) {
        console.warn(`Invalid m3u8 link format for key: ${key}`);
      }
    });

    // Update the cache
    state.currentConfig = data;
    state.lastFetchTime = Date.now();

    return data;
  } catch (error) {
    console.error("Error fetching m3u8 links:", error);
    // Fallback to cached config if available
    return state.currentConfig || {};
  }
};

export const checkForUpdates = async (): Promise<boolean> => {
  try {
    const apiUrl = 'https://api.github.com/repos/Shahid429/Link/contents/m3u8Links.json';
    const response = await fetch(apiUrl, {
      headers: {
        'Accept': 'application/vnd.github.v3.raw'
      },
      mode: 'cors'
    });

    if (!response.ok) {
      throw new Error("Failed to check for updates");
    }

    const newConfig = await response.json();

    if (
      state.currentConfig && 
      JSON.stringify(newConfig) !== JSON.stringify(state.currentConfig)
    ) {
      state.currentConfig = newConfig;
      state.lastFetchTime = Date.now();
      return true;
    }

    return false;
  } catch (error) {
    console.error("Error checking for updates:", error);
    return false;
  }
};

export const preloadM3u8Manifest = async (url: string): Promise<void> => {
  try {
    const response = await fetch(url, {
      method: 'HEAD',
      mode: 'cors',
      headers: {
        'Accept': 'application/vnd.github.v3.raw'
      }
    });
    
    if (!response.ok) {
      throw new Error("Failed to preload m3u8 manifest");
    }
  } catch (error) {
    console.error("Error preloading m3u8 manifest:", error);
  }
};

// Optional: Setup automatic update checking
export const setupAutoUpdates = (
  interval: number = 5 * 60 * 1000,
  onUpdate?: () => void
) => {
  setInterval(async () => {
    const hasUpdates = await checkForUpdates();
    if (hasUpdates && onUpdate) {
      onUpdate();
    }
  }, interval);
};

// Optional: Force refresh the config
export const forceRefresh = async (): Promise<{ [key: string]: string }> => {
  state.lastFetchTime = 0;
  return await fetchM3u8Links();
};
