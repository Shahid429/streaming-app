export const fetchM3u8Links = async (): Promise<{ [key: string]: string }> => {
  try {
    const response = await fetch("/m3u8Links.json", {
      headers: {
        'Cache-Control': 'no-cache',
        'Pragma': 'no-cache'
      }
    });
    
    if (!response.ok) {
      throw new Error("Failed to fetch m3u8 links");
    }
    
    const data = await response.json();
    
    // Add some basic validation
    if (!data || typeof data !== 'object') {
      throw new Error("Invalid m3u8 links format");
    }
    
    // Validate each link
    Object.entries(data).forEach(([key, value]) => {
      if (typeof value !== 'string' || !value.includes('.m3u8')) {
        console.warn(`Invalid m3u8 link format for key: ${key}`);
      }
    });
    
    return data;
  } catch (error) {
    console.error("Error fetching m3u8 links:", error);
    return {};
  }
};

export const preloadM3u8Manifest = async (url: string): Promise<void> => {
  try {
    const response = await fetch(url, {
      method: 'HEAD'
    });
    
    if (!response.ok) {
      throw new Error("Failed to preload m3u8 manifest");
    }
  } catch (error) {
    console.error("Error preloading m3u8 manifest:", error);
  }
};