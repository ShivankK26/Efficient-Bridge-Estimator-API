/**
 * @file ApiUtil.ts
 * @description Utility class for making API requests using Axios.
 * Contains methods to handle external API interactions with standardized error handling.
 */

import axios from 'axios';

/**
 * A utility class for making HTTP requests to external APIs.
 * @class ApiUtil
 */
export class ApiUtil {
  /**
   * Makes a GET request to the specified URL with custom headers.
   * The API key is read from the environment variables.
   * @param {string} url     - The URL to make the GET request to.
   * @returns {Promise<any>} - The data received from the external API.
   * @throws {Error} Throws an error if the request fails.
   */
  static async fetch(url: string): Promise<any> {
    try {
      const response = await axios.get(url, {
        headers: {
          'API-KEY': process.env.API_KEY,
        },
      });
      return response.data;
    } catch (error: any) {
      console.error(`API Error: ${error.message}`);
      throw new Error('Failed to fetch data from external API');
    }
  }
}