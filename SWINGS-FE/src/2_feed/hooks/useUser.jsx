import { useEffect, useState } from "react";
import { fetchUserData } from "../../1_user/api/userApi";

const useUser = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserInfo = async () => {
      try {
        const currentUser = await fetchUserData();
        setUser(currentUser);
      } catch (error) {
        console.error("사용자 정보를 가져오는 데 실패했습니다.", error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserInfo();
  }, []);

  return {
    user,
    userId: user?.userId ?? null,
    isAuthenticated: Boolean(user?.userId),
    loading,
  };
};

export default useUser;
