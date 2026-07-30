import axiosInstance from "../../1_user/api/axiosInstance.js";

export const getAllNotifications = async (receiver) => {
  const response = await axiosInstance.get("/notification/list", {
    params: { receiver },
  });

  return Array.isArray(response.data) ? response.data : [];
};

export const markAsRead = async (notificationId) => {
  await axiosInstance.put(`/notification/read/${notificationId}`);
};

export const deleteNotification = async (notificationId) => {
  await axiosInstance.delete(`/notification/delete/${notificationId}`);
};
