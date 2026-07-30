import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useGoogleLogin } from "@react-oauth/google";
import { motion as Motion, AnimatePresence } from "framer-motion";
import { useAuth } from "../context/AuthContext";
import { loginRequest, googleLoginRequest } from "../api/userApi";
import { saveToken } from "../utils/userUtils";
import { registerPushToken } from "../../5_notification/utils/registerPushToken";
import SplashScreen from "../components/SplashScreen";
import LoginLoadingScreen from "../components/LoginLoadingScreen";
import FindPasswordModal from "../components/FindPasswordModal";

const containerVariants = {
  hidden: { opacity: 0, y: -20 },
  visible: { opacity: 1, y: 0 },
};

const itemVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: (index) => ({
    opacity: 1,
    y: 0,
    transition: { delay: index * 0.08 },
  }),
};

function GoogleLoginButton({ onSuccess, onError }) {
  const googleLogin = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      try {
        const result = await googleLoginRequest(tokenResponse.access_token);
        onSuccess(result);
      } catch (error) {
        onError(error);
      }
    },
    onError,
    scope: "openid profile email",
    flow: "implicit",
  });

  return (
    <Motion.button
      type="button"
      onClick={() => googleLogin()}
      custom={7}
      variants={itemVariants}
      className="flex h-12 w-full items-center justify-center rounded-2xl border border-gray-200 bg-white px-4 text-sm font-semibold text-gray-700 transition hover:shadow-sm"
    >
      <img
        src="https://developers.google.com/identity/images/g-logo.png"
        alt="Google"
        className="mr-2 h-5 w-5"
      />
      Google로 로그인
    </Motion.button>
  );
}

export default function StartLogin() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID?.trim();

  const [showSplash, setShowSplash] = useState(
    () => localStorage.getItem("sawSplash") !== "true"
  );
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [formData, setFormData] = useState({
    username: localStorage.getItem("savedUsername") || "",
    password: "",
  });
  const [saveId, setSaveId] = useState(Boolean(localStorage.getItem("savedUsername")));
  const [errorMessage, setErrorMessage] = useState("");
  const [showFindPasswordModal, setShowFindPasswordModal] = useState(false);

  useEffect(() => {
    if (!showSplash) {
      return undefined;
    }

    const timer = setTimeout(() => {
      setShowSplash(false);
      localStorage.setItem("sawSplash", "true");
    }, 3000);

    return () => clearTimeout(timer);
  }, [showSplash]);

  const proceedAfterLogin = (accessToken) => {
    login(accessToken);
    saveToken(accessToken);

    if (saveId) {
      localStorage.setItem("savedUsername", formData.username);
    } else {
      localStorage.removeItem("savedUsername");
    }

    setIsLoggingIn(true);

    setTimeout(() => {
      navigate("/swings/feed");
    }, 900);
  };

  const handleGoogleSuccess = (result) => {
    if (result.accessToken) {
      proceedAfterLogin(result.accessToken);
      return;
    }

    if (result.isNew) {
      navigate("/swings/signup", {
        state: { email: result.email, name: result.name },
      });
    }
  };

  const handleGoogleError = () => {
    setErrorMessage("Google 로그인에 실패했습니다.");
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setErrorMessage("");

    try {
      const accessToken = await loginRequest(formData);
      proceedAfterLogin(accessToken);
      await registerPushToken(formData.username);
    } catch (error) {
      setErrorMessage(error.message || "로그인 중 오류가 발생했습니다.");
    }
  };

  if (showSplash) {
    return <SplashScreen />;
  }

  if (isLoggingIn) {
    return <LoginLoadingScreen />;
  }

  return (
    <div className="min-h-screen overflow-x-hidden bg-[radial-gradient(circle_at_top,#ffe4ec_0%,#ffffff_45%,#dbeafe_100%)] px-4 py-8 sm:px-6">
      <div className="mx-auto flex min-h-[calc(100vh-4rem)] w-full max-w-5xl items-center justify-center">
        <AnimatePresence>
          <Motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            exit="hidden"
            transition={{ duration: 0.5 }}
            className="grid w-full max-w-4xl gap-8 overflow-hidden rounded-[2rem] bg-white/80 p-6 shadow-xl ring-1 ring-white/60 backdrop-blur md:grid-cols-[1.05fr_0.95fr] md:p-8"
          >
            <div className="flex flex-col justify-center rounded-[1.5rem] bg-gradient-to-br from-rose-400 via-pink-400 to-orange-300 p-8 text-white">
              <Motion.p
                custom={0}
                variants={itemVariants}
                initial="hidden"
                animate="visible"
                className="text-sm font-semibold uppercase tracking-[0.3em] text-white/80"
              >
                Golf Social Club
              </Motion.p>
              <Motion.h1
                custom={1}
                variants={itemVariants}
                initial="hidden"
                animate="visible"
                className="mt-4 text-4xl font-black leading-tight sm:text-5xl"
              >
                SWINGS
              </Motion.h1>
              <Motion.p
                custom={2}
                variants={itemVariants}
                initial="hidden"
                animate="visible"
                className="mt-4 text-sm leading-6 text-white/90 sm:text-base"
              >
                골프로 시작하는 가벼운 연결.
                <br />
                라운드 메이트를 찾고, 대화를 이어가고, 모임까지 한 번에 관리해보세요.
              </Motion.p>
            </div>

            <div className="flex flex-col justify-center">
              <Motion.div
                custom={3}
                variants={itemVariants}
                initial="hidden"
                animate="visible"
                className="mb-6"
              >
                <h2 className="text-2xl font-bold text-gray-900">로그인</h2>
                <p className="mt-2 text-sm text-gray-500">
                  계정 정보를 입력하고 서비스를 시작하세요.
                </p>
              </Motion.div>

              <Motion.form
                onSubmit={handleSubmit}
                className="space-y-4"
                initial="hidden"
                animate="visible"
              >
                <Motion.input
                  custom={4}
                  variants={itemVariants}
                  type="text"
                  placeholder="아이디"
                  className="h-12 w-full rounded-2xl border border-gray-200 px-4 text-sm text-gray-900 outline-none transition focus:border-rose-400"
                  value={formData.username}
                  onChange={(event) =>
                    setFormData({ ...formData, username: event.target.value })
                  }
                />

                <Motion.input
                  custom={5}
                  variants={itemVariants}
                  type="password"
                  placeholder="비밀번호"
                  className="h-12 w-full rounded-2xl border border-gray-200 px-4 text-sm text-gray-900 outline-none transition focus:border-rose-400"
                  value={formData.password}
                  onChange={(event) =>
                    setFormData({ ...formData, password: event.target.value })
                  }
                />

                <Motion.div
                  custom={6}
                  variants={itemVariants}
                  className="flex items-center justify-between gap-3 text-sm"
                >
                  <label className="inline-flex items-center gap-2 text-gray-600">
                    <input
                      type="checkbox"
                      checked={saveId}
                      onChange={(event) => setSaveId(event.target.checked)}
                      className="h-4 w-4 rounded border border-gray-300 accent-custom-pink"
                    />
                    아이디 저장
                  </label>

                  <button
                    type="button"
                    onClick={() => setShowFindPasswordModal(true)}
                    className="font-semibold text-gray-500 transition hover:text-gray-900"
                  >
                    비밀번호 찾기
                  </button>
                </Motion.div>

                <Motion.button
                  type="submit"
                  custom={7}
                  variants={itemVariants}
                  className={`h-12 w-full rounded-2xl text-sm font-bold text-white transition ${
                    formData.username && formData.password
                      ? "bg-custom-purple shadow-md"
                      : "bg-custom-purple-empty"
                  }`}
                >
                  로그인
                </Motion.button>
              </Motion.form>

              <Motion.div
                custom={8}
                variants={itemVariants}
                initial="hidden"
                animate="visible"
                className="my-5 flex items-center"
              >
                <div className="h-px flex-1 bg-gray-200" />
                <span className="px-3 text-xs font-medium text-gray-400">또는</span>
                <div className="h-px flex-1 bg-gray-200" />
              </Motion.div>

              {googleClientId ? (
                <GoogleLoginButton
                  onSuccess={handleGoogleSuccess}
                  onError={handleGoogleError}
                />
              ) : (
                <Motion.button
                  type="button"
                  custom={9}
                  variants={itemVariants}
                  disabled
                  className="h-12 w-full cursor-not-allowed rounded-2xl border border-gray-200 bg-gray-100 text-sm font-semibold text-gray-400"
                >
                  Google 로그인 비활성화
                </Motion.button>
              )}

              <Motion.button
                type="button"
                onClick={() => navigate("/swings/signup")}
                custom={10}
                variants={itemVariants}
                initial="hidden"
                animate="visible"
                className="mt-4 h-12 w-full rounded-2xl bg-custom-pink text-sm font-bold text-white transition hover:opacity-95"
              >
                회원가입
              </Motion.button>
            </div>
          </Motion.div>
        </AnimatePresence>
      </div>

      {showFindPasswordModal && (
        <FindPasswordModal onClose={() => setShowFindPasswordModal(false)} />
      )}

      {errorMessage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
          <div className="relative z-10 w-full max-w-sm rounded-2xl bg-white p-6 text-center shadow-xl">
            <h2 className="text-lg font-bold text-gray-900">로그인 실패</h2>
            <p className="mt-3 whitespace-pre-line text-sm text-gray-600">
              {errorMessage}
            </p>
            <button
              type="button"
              onClick={() => setErrorMessage("")}
              className="mt-5 rounded-xl bg-gray-800 px-4 py-2 text-sm font-semibold text-white"
            >
              확인
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
