import { useEffect, useState } from "react";
import axios from "../../1_user/api/axiosInstance";
import { fetchUserData } from "../../1_user/api/userApi";

export function useSwipeData() {
  const [currentUser, setCurrentUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [remainingLikes, setRemainingLikes] = useState(3);

  useEffect(() => {
    const load = async () => {
      try {
        const user = await fetchUserData();
        setCurrentUser(user);

        await fetchRecommendedUser(user.username);
        await fetchRemainingLikes(user.username);
      } catch (error) {
        console.error("소개팅 사용자 정보 로딩 실패:", error);
      }
    };

    load();
  }, []);

  const fetchRecommendedUser = async (username) => {
    try {
      const res = await axios.get(`/api/users/${username}/recommend`);
      setProfile(res.data || null);
    } catch (error) {
      console.error("추천 사용자 조회 실패:", error);
      setProfile(null);
    }
  };

  const fetchRemainingLikes = async (username) => {
    try {
      const res = await axios.get(`/api/likes/count/${username}`);
      setRemainingLikes(res.data);
    } catch (error) {
      console.error("남은 호감 수 조회 실패:", error);
      setRemainingLikes(0);
    }
  };

  return {
    currentUser,
    profile,
    setProfile,
    remainingLikes,
    setRemainingLikes,
    fetchRecommendedUser,
    fetchRemainingLikes,
  };
}
