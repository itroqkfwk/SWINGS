import { checkUsername } from "../api/userApi";

export function saveToken(token) {
  sessionStorage.setItem("token", token);
}

export function getToken() {
  return sessionStorage.getItem("token");
}

export function removeToken() {
  sessionStorage.removeItem("token");
}

export const toBase64 = (file) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });

export const getUpdatedFields = (original, edited) => {
  const updated = {};

  for (const key in edited) {
    if (edited[key] !== original[key]) {
      updated[key] = edited[key];
    }
  }

  return updated;
};

export const validatePasswordMatch = (pwd1, pwd2) => {
  if (pwd1 !== pwd2) {
    return "비밀번호가 일치하지 않습니다.";
  }

  if (pwd1.length < 4) {
    return "최소 4자 이상이어야 합니다.";
  }

  if (!/[a-z]/.test(pwd1)) {
    return "영문 소문자를 최소 1자 이상 포함해야 합니다.";
  }

  if (!/[0-9]/.test(pwd1)) {
    return "숫자를 최소 1자 이상 포함해야 합니다.";
  }

  if (!/[!@#$%^&*(),.?":{}|<>_\-\\[\]~`+=/]/.test(pwd1)) {
    return "특수문자를 최소 1자 이상 포함해야 합니다.";
  }

  return null;
};

export function formatKoreanDate(dateStr) {
  const date = new Date(dateStr);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");

  return `${year}.${month}.${day} ${hours}:${minutes}`;
}

export const formDataPerStep = [
  {
    username: "",
    password: "",
    confirmPassword: "",
    name: "",
    email: "",
  },
  { gender: "", birthDate: "", phonenumber: "" },
  { mbti: "", job: "", activityRegion: "" },
  { hobbies: "", religion: "", smoking: "", drinking: "" },
  { golfSkill: "", introduce: "" },
];

export const hasEmptyFields = (step, formData) => {
  const currentStepFields = Object.keys(formDataPerStep[step]);
  return currentStepFields.some((field) => {
    const value = formData[field];
    return typeof value !== "string" || value.trim() === "";
  });
};

export const handleUsernameCheckLogic = async (username, setMessage) => {
  if (!username) {
    setMessage("아이디를 입력해주세요.");
    return;
  }

  try {
    const exists = await checkUsername(username);
    setMessage(
      exists ? "이미 사용 중인 아이디입니다." : "사용 가능한 아이디입니다."
    );
  } catch {
    setMessage("아이디 중복 확인 중 오류가 발생했습니다.");
  }
};

export const prefillFromOAuthState = (location, formData, updateData) => {
  const state = location.state;

  if (state?.email && !formData.email) {
    updateData({ email: state.email });
  }

  if (state?.name && !formData.name) {
    updateData({ name: state.name });
  }
};

export const mbtiOptions = [
  "ISTJ",
  "ISFJ",
  "INFJ",
  "INTJ",
  "ISTP",
  "ISFP",
  "INFP",
  "INTP",
  "ESTP",
  "ESFP",
  "ENFP",
  "ENTP",
  "ESTJ",
  "ESFJ",
  "ENFJ",
  "ENTJ",
].map((type) => ({ label: type, value: type }));

export const regionOptions = [
  { label: "서울", value: "SEOUL" },
  { label: "부산", value: "BUSAN" },
  { label: "대구", value: "DAEGU" },
  { label: "인천", value: "INCHEON" },
  { label: "광주", value: "GWANGJU" },
  { label: "대전", value: "DAEJEON" },
  { label: "울산", value: "ULSAN" },
  { label: "세종", value: "SEJONG" },
  { label: "경기", value: "GYEONGGI" },
  { label: "강원", value: "GANGWON" },
  { label: "충북", value: "CHUNGBUK" },
  { label: "충남", value: "CHUNGNAM" },
  { label: "전북", value: "JEONBUK" },
  { label: "전남", value: "JEONNAM" },
  { label: "경북", value: "GYEONGBUK" },
  { label: "경남", value: "GYEONGNAM" },
  { label: "제주", value: "JEJU" },
];

export const customSelectStyles = {
  container: (base) => ({
    ...base,
    width: "100%",
  }),
  control: (base) => ({
    ...base,
    paddingTop: "2px",
    paddingBottom: "2px",
    paddingLeft: "12px",
    paddingRight: "12px",
    borderColor: "#D1D5DB",
    borderRadius: "0.5rem",
    minHeight: "42px",
    boxShadow: "none",
  }),
  menu: (base) => ({
    ...base,
    maxHeight: "150px",
    overflowY: "auto",
    color: "#000",
    zIndex: 9999,
  }),
};
