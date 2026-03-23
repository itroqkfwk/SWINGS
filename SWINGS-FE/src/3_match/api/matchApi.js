import axios from "../../1_user/api/axiosInstance";

export const fetchRecommendedProfiles = (username) => {
  return axios.get(`/api/users/${username}/recommend`);
};

export const sendLike = (fromUserId, toUserId, paid = false) => {
  return axios.post(`/api/likes/${fromUserId}/${toUserId}`, null, {
    params: { paid },
  });
};

export const sendLikeToUser = (fromUsername, toUsername, paid = false) => {
  return axios.post(`/api/likes/${fromUsername}/${toUsername}`, null, {
    params: { paid },
  });
};

export const sendDislike = (fromUserId, toUserId) => {
  return axios.post(`/api/dislikes/${fromUserId}/${toUserId}`);
};

export async function getSentAndReceivedLikes(userId) {
  const response = await axios.get(`/api/likes/all/${userId}`);
  return response.data;
}

export const createChatRoom = async (
  user1,
  user2,
  isSuperChat = false
) => {
  return axios.post(`/api/chat/room`, null, {
    params: {
      user1,
      user2,
      isSuperChat,
    },
  });
};
