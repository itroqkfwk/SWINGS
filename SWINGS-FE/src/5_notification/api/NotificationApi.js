import axiosInstance from "../../1_user/api/axiosInstance.js";

const createDummyNotifications = (receiver) => [
  {
    notificationId: "dummy-noti-1",
    receiver,
    type: "match",
    message: "민서님이 회원님의 프로필에 관심을 보냈습니다.",
    read: false,
    createdAt: new Date().toISOString(),
  },
  {
    notificationId: "dummy-noti-2",
    receiver,
    type: "chat",
    message: "하은님이 새로운 채팅 메시지를 보냈습니다.",
    read: false,
    createdAt: new Date(Date.now() - 1000 * 60 * 25).toISOString(),
  },
  {
    notificationId: "dummy-noti-3",
    receiver,
    type: "system",
    message: "오늘의 무료 좋아요가 다시 충전되었습니다.",
    read: true,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 3).toISOString(),
  },
];

export const getAllNotifications = async (receiver) => {
  try {
    const response = await axiosInstance.get("/notification/list", {
      params: { receiver },
    });

    if (Array.isArray(response.data) && response.data.length > 0) {
      return response.data;
    }

    return createDummyNotifications(receiver);
  } catch (error) {
    console.error("알림 목록 불러오기 실패:", error);
    return createDummyNotifications(receiver);
  }
};

export const markAsRead = async (notificationId) => {
  try {
    await axiosInstance.put(`/notification/read/${notificationId}`);
  } catch (error) {
    console.error("읽음 처리 실패:", error);
  }
};

export const deleteNotification = async (notificationId) => {
  try {
    await axiosInstance.delete(`/notification/delete/${notificationId}`);
  } catch (error) {
    console.error("알림 삭제 실패:", error);
  }
};
