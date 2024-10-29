import axios from "axios";

export class ApiUtil {
  static async fetch(url: string) {
    try {
      const response = await axios.get(url, {
        headers: {
          "API-KEY": process.env.API_KEY,
        }
      });
      return response.data;
    } catch (error: any) {
      console.error(`API Error: ${error.message}`);
      throw new Error("Failed to fetch data from external API");
    }
  }
}
