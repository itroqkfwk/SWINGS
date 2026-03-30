import axios from "axios";
import { API_BASE_URL, API_TIMEOUT_MS } from "../../config/runtime";
import { getToken } from "../utils/userUtils";

const instance = axios.create({
  baseURL: API_BASE_URL,
  timeout: API_TIMEOUT_MS,
});

instance.interceptors.request.use(
  (config) => {
    const token = getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

instance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.code === "ECONNABORTED") {
      error.message =
        "Server response timed out. Check the deployed API URL and wait for Render to wake up.";
    }

    console.error("API ERROR:", error.response?.data || error.message);
    return Promise.reject(error);
  }
);

export default instance;
