import axios from "../../1_user/api/axiosInstance";
import { DEFAULT_FEED_QUERY_OPTIONS } from "../utils/feedUtils";

const requireUserId = (userId) => {
  if (!userId) {
    throw new Error("Login is required");
  }
};

const feedApi = {
  getFeeds: async (
    userId,
    page,
    size = 10,
    options = DEFAULT_FEED_QUERY_OPTIONS
  ) => {
    const { sort, filter } = {
      ...DEFAULT_FEED_QUERY_OPTIONS,
      ...options,
    };

    const params = {
      page,
      size,
      sort,
      filter,
      userId,
    };

    const response = await axios.get("/feeds/filtered", { params });
    return response.data;
  },

  uploadFeed: async (formData) => {
    const response = await axios.post("/feeds/upload", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return response.data;
  },

  updateFeed: async (feedId, { caption, file }) => {
    const formData = new FormData();
    formData.append("caption", caption);
    if (file) {
      formData.append("file", file);
    }

    const response = await axios.put(`/feeds/${feedId}`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });

    return response.data;
  },

  getMainFeeds: async (userId) => {
    const response = await axios.get("/feeds/main", {
      params: { userId },
    });
    return response.data;
  },

  deleteFeed: async (feedId) => {
    try {
      const response = await axios.delete(`/feeds/${feedId}`);
      if (![200, 204].includes(response.status)) {
        throw new Error("Delete failed: unexpected response");
      }
      return response;
    } catch (error) {
      console.error("Delete feed failed:", error.response?.data || error.message);
      throw error;
    }
  },

  likeFeed: async (feedId, userId) => {
    requireUserId(userId);
    const response = await axios.put(`/feeds/${feedId}/like`, null, {
      params: { userId },
    });
    return response.data;
  },

  unlikeFeed: async (feedId, userId) => {
    requireUserId(userId);
    const response = await axios.put(`/feeds/${feedId}/unlike`, null, {
      params: { userId },
    });
    return response.data;
  },

  getLikedUsers: async (feedId) => {
    const response = await axios.get(`/feeds/${feedId}/liked-users`);
    return response.data;
  },

  addComment: async (feedId, userId, content) => {
    requireUserId(userId);
    const response = await axios.post(`/feeds/${feedId}/comments`, null, {
      params: { userId, content },
    });
    return response.data;
  },

  deleteComment: async (feedId, commentId) => {
    await axios.delete(`/feeds/${feedId}/comments/${commentId}`);
  },

  updateComment: async (feedId, commentId, content) => {
    const response = await axios.patch(
      `/feeds/${feedId}/comments/${commentId}`,
      null,
      {
        params: { content },
      }
    );
    return response.data;
  },

  getUserFeeds: async (userId) => {
    const response = await axios.get(`/feeds/user/${userId}`);
    return response.data;
  },
};

export default feedApi;
