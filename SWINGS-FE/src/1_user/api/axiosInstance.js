import axios from "axios";
import { API_BASE_URL } from "../../config/runtime";
import { getToken } from "../utils/userUtils";

const instance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 5000,
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
    console.error("API ERROR:", error.response?.data || error.message);
    return Promise.reject(error);
  }
);

export default instance;
