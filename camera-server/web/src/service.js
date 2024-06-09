import axios from "axios";
import { api } from "./config";

export default class Service {
  constructor(store) {
    this.store = store;
  }

  async get(apiPath, options = {}) {
    const currentUserTokenId = this.store.getCurrentUserTokenId();
    // console.log("currentUserTokenId-get", currentUserTokenId);
    if (currentUserTokenId) {
      // Add the token ID to headers.
      options.headers = {
        ...options.headers,
        Authorization: `${currentUserTokenId}`,
      };
    }
    console.log(
      `Sending GET request to ${api}${apiPath} with options`,
      options
    );
    try {
      const response = await axios.get(`${api}${apiPath}`, options);
      console.log(`GET request to ${api}${apiPath} succeeded`, response);
      return response;
    } catch (error) {
      console.error(`GET request to ${api}${apiPath} failed`, error);
      throw error;
    }
  }

  async post(apiPath, data, options = {}) {
    const currentUserTokenId = this.store.getCurrentUserTokenId();
    // console.log("currentUserTokenId-post", currentUserTokenId);
    if (currentUserTokenId) {
      // Add the token ID to headers.
      options.headers = {
        ...options.headers,
        Authorization: `${currentUserTokenId}`,
      };
    }
    console.log(
      `Sending POST request to ${api}${apiPath} with data`,
      data,
      "and options",
      options
    );
    try {
      const response = await axios.post(`${api}${apiPath}`, data, options);
      console.log(`POST request to ${api}${apiPath} succeeded`, response);
      return response;
    } catch (error) {
      console.error(`POST request to ${api}${apiPath} failed`, error);
      throw error;
    }
  }
}
