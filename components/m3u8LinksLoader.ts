export const fetchM3u8Links = async (): Promise<{ [key: string]: string }> => {
  try {
    const response = await fetch("/m3u8Links.json"); // Path to your JSON file in public folder
    if (!response.ok) {
      throw new Error("Failed to fetch m3u8 links");
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching m3u8 links:", error);
    return {}; // Return an empty object if there's an error
  }
};
