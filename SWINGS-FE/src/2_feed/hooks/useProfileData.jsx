import { useEffect, useState } from "react";
import socialApi from "../api/socialApi";

export const useProfileData = (userId, currentUser) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [profile, setProfile] = useState(null);
  const [introduce, setIntroduce] = useState("");
  const [isFollowing, setIsFollowing] = useState(false);
  const [stats, setStats] = useState({ posts: 0, followers: 0, following: 0 });
  const [followers, setFollowers] = useState([]);
  const [followings, setFollowings] = useState([]);

  const fetchProfileData = async () => {
    if (!userId || !currentUser) {
      setLoading(false);
      setError(null);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const [
        profileData,
        introduceData,
        followersData,
        followingsData,
        feedCount,
        followStatus,
      ] = await Promise.all([
        socialApi.getProfile(userId),
        socialApi.getIntroduce(userId),
        socialApi.getFollowers(userId),
        socialApi.getFollowings(userId),
        socialApi.getFeedCount(userId),
        socialApi.isFollowing(currentUser.userId, userId),
      ]);

      const nextFollowers = followersData || [];
      const nextFollowings = followingsData || [];

      setProfile(profileData || null);
      setIntroduce(introduceData || "");
      setFollowers(nextFollowers);
      setFollowings(nextFollowings);
      setStats({
        posts: feedCount || 0,
        followers: nextFollowers.length || 0,
        following: nextFollowings.length || 0,
      });
      setIsFollowing(followStatus === "팔로우 중입니다.");
    } catch (err) {
      console.error("프로필 데이터를 불러오지 못했습니다.", err);
      setError("프로필 정보를 불러오지 못했습니다.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfileData();
  }, [userId, currentUser]);

  const refreshProfileData = () => {
    fetchProfileData();
  };

  const saveIntroduce = async () => {
    if (!currentUser || !userId) return;

    try {
      await socialApi.updateIntroduce(userId, introduce);
    } catch (err) {
      console.error("자기소개 저장 실패:", err);
    }
  };

  return {
    loading,
    error,
    profile,
    introduce,
    isFollowing,
    stats,
    followers,
    followings,
    setIntroduce,
    refreshProfileData,
    saveIntroduce,
  };
};

export default useProfileData;
