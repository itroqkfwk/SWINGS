import axios from "axios";
import { API_BASE_URL, API_TIMEOUT_MS } from "../../config/runtime";
import { getToken, removeToken } from "../utils/userUtils";

const instance = axios.create({
  baseURL: API_BASE_URL,
  timeout: API_TIMEOUT_MS,
  headers: {
    "ngrok-skip-browser-warning": "69420",
  },
});

instance.interceptors.request.use(
  (config) => {
    config.headers = config.headers || {};
    config.headers["ngrok-skip-browser-warning"] = "69420";
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
    if (error.response && error.response.status === 401) {
      removeToken();
      if (typeof window !== "undefined" && !window.location.pathname.endsWith("/swings")) {
        alert("로그인 세션이 만료되었습니다. 다시 로그인해 주세요.");
        window.location.href = "/swings";
      }
    } else if (error.code === "ECONNABORTED") {
      error.message =
        "무료 서버(Render) 부팅 시간이 초과되었습니다. 약 30초 후 다시 시도해 주세요.";
    } else if (!error.response && error.message === "Network Error") {
      error.message =
        "서버에 연결할 수 없습니다. 무료 서버(Render)가 부팅 중일 수 있으니 약 30초~1분 후 다시 시도해 주세요.";
    }

    console.error("API ERROR:", error.response?.data || error.message);
    return Promise.reject(error);
  }
);

export default instance;
