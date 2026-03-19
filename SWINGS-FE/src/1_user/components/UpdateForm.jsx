import { useEffect, useState } from "react";
import Select from "react-select";
import { Dialog } from "@headlessui/react";
import { useNavigate } from "react-router-dom";
import { checkUsername, fetchUserData, updateUserInfo } from "../api/userApi";
import { removeToken } from "../utils/userUtils";

const regionMap = {
  서울: "SEOUL",
  부산: "BUSAN",
  대구: "DAEGU",
  인천: "INCHEON",
  광주: "GWANGJU",
  대전: "DAEJEON",
  울산: "ULSAN",
  세종: "SEJONG",
  경기: "GYEONGGI",
  강원: "GANGWON",
  충북: "CHUNGBUK",
  충남: "CHUNGNAM",
  전북: "JEONBUK",
  전남: "JEONNAM",
  경북: "GYEONGBUK",
  경남: "GYEONGNAM",
  제주: "JEJU",
};

const regionOptions = Object.keys(regionMap).map((label) => ({
  label,
  value: label,
}));

const mbtiOptions = [
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
].map((value) => ({ label: value, value }));

const golfSkillOptions = [
  { label: "초급", value: "beginner" },
  { label: "중급", value: "intermediate" },
  { label: "고급", value: "advanced" },
];

const religionOptions = [
  { label: "무교", value: "none" },
  { label: "기독교", value: "christian" },
  { label: "천주교", value: "catholic" },
  { label: "불교", value: "buddhist" },
  { label: "기타", value: "etc" },
];

const yesNoOptions = [
  { label: "예", value: "yes" },
  { label: "아니오", value: "no" },
];

const drinkOptions = [
  { label: "마심", value: "yes" },
  { label: "마시지 않음", value: "no" },
];

const selectStyles = {
  control: (base, state) => ({
    ...base,
    minHeight: "44px",
    borderRadius: "0.75rem",
    borderColor: state.isFocused ? "#fb7185" : "#d1d5db",
    boxShadow: "none",
    paddingLeft: "0.25rem",
    ":hover": {
      borderColor: "#fb7185",
    },
  }),
  menu: (base) => ({
    ...base,
    zIndex: 20,
    borderRadius: "0.75rem",
    overflow: "hidden",
  }),
};

const initialModal = {
  open: false,
  success: true,
  message: "",
  logout: false,
};

export default function UpdateForm() {
  const [formData, setFormData] = useState(null);
  const [originalData, setOriginalData] = useState(null);
  const [modal, setModal] = useState(initialModal);
  const [loading, setLoading] = useState(true);
  const [usernameChecked, setUsernameChecked] = useState(true);
  const [usernameMessage, setUsernameMessage] = useState("");
  const [logoutPending, setLogoutPending] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const loadUser = async () => {
      try {
        const data = await fetchUserData();
        const regionLabel = Object.keys(regionMap).find(
          (label) => regionMap[label] === data.activityRegion
        );

        const normalizedData = {
          ...data,
          activityRegion: regionLabel || "",
        };

        setFormData(normalizedData);
        setOriginalData(normalizedData);
      } catch {
        setModal({
          open: true,
          success: false,
          message: "사용자 정보를 불러오지 못했습니다.",
          logout: false,
        });
      } finally {
        setLoading(false);
      }
    };

    loadUser();
  }, []);

  useEffect(() => {
    if (!logoutPending) {
      return;
    }

    removeToken();
    window.location.href = "/swings";
  }, [logoutPending]);

  const updateField = (key, value) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
  };

  const handleUsernameCheck = async () => {
    if (!formData?.username) {
      return;
    }

    if (formData.username === originalData.username) {
      setUsernameChecked(true);
      setUsernameMessage("현재 사용 중인 아이디입니다.");
      return;
    }

    try {
      const exists = await checkUsername(formData.username);
      setUsernameChecked(!exists);
      setUsernameMessage(
        exists
          ? "이미 사용 중인 아이디입니다."
          : "사용 가능한 아이디입니다."
      );
    } catch {
      setUsernameChecked(false);
      setUsernameMessage("아이디 중복 확인 중 오류가 발생했습니다.");
    }
  };

  const handleUpdate = async () => {
    if (!formData?.username) {
      setModal({
        open: true,
        success: false,
        message: "사용자 정보가 없습니다.",
        logout: false,
      });
      return;
    }

    if (formData.username !== originalData.username && !usernameChecked) {
      setModal({
        open: true,
        success: false,
        message: "아이디 중복 확인이 필요합니다.",
        logout: false,
      });
      return;
    }

    const updatedFields = {};

    Object.keys(formData).forEach((key) => {
      if (formData[key] !== originalData[key] && formData[key] !== undefined) {
        updatedFields[key] = formData[key];
      }
    });

    if (updatedFields.activityRegion) {
      updatedFields.activityRegion = regionMap[updatedFields.activityRegion];
    }

    if (Object.keys(updatedFields).length === 0) {
      setModal({
        open: true,
        success: false,
        message: "변경된 항목이 없습니다.",
        logout: false,
      });
      return;
    }

    try {
      await updateUserInfo(originalData.username, updatedFields);

      if (updatedFields.username) {
        setModal({
          open: true,
          success: true,
          message: "아이디가 변경되어 다시 로그인해야 합니다.",
          logout: true,
        });
        return;
      }

      setOriginalData({ ...formData });
      setModal({
        open: true,
        success: true,
        message: "회원 정보가 정상적으로 수정되었습니다.",
        logout: false,
      });
    } catch {
      setModal({
        open: true,
        success: false,
        message: "회원 정보 수정 중 오류가 발생했습니다.",
        logout: false,
      });
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center text-sm text-gray-500">
        정보를 불러오는 중입니다...
      </div>
    );
  }

  if (!formData) {
    return null;
  }

  return (
    <div className="mx-auto w-full max-w-xl px-5 pb-24 pt-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">회원 정보 수정</h1>
        <p className="mt-2 text-sm text-gray-500">
          필요한 정보만 수정하고 저장하세요.
        </p>
      </div>

      <div className="space-y-5 rounded-3xl bg-white p-5 shadow-sm ring-1 ring-gray-100">
        <div>
          <label className="mb-2 block text-sm font-semibold text-gray-700">
            아이디
          </label>
          <div className="flex gap-2">
            <input
              className="h-11 flex-1 rounded-xl border border-gray-300 px-4 text-sm text-gray-900 outline-none transition focus:border-rose-400"
              value={formData.username || ""}
              onChange={(event) => {
                updateField("username", event.target.value);
                setUsernameChecked(false);
                setUsernameMessage("");
              }}
              placeholder="아이디를 입력하세요"
            />
            <button
              type="button"
              onClick={handleUsernameCheck}
              className="rounded-xl bg-custom-pink px-4 text-sm font-bold text-white"
            >
              중복 확인
            </button>
          </div>
          {usernameMessage && (
            <p
              className={`mt-2 text-sm ${
                usernameChecked ? "text-green-600" : "text-red-500"
              }`}
            >
              {usernameMessage}
            </p>
          )}
        </div>

        <InputField
          label="생년월일"
          type="date"
          value={formData.birthDate}
          onChange={(value) => updateField("birthDate", value)}
        />

        <InputField
          label="직업"
          value={formData.job}
          onChange={(value) => updateField("job", value)}
          placeholder="직업을 입력하세요"
        />

        <LabeledSelect
          label="골프 실력"
          options={golfSkillOptions}
          value={formData.golfSkill}
          onChange={(value) => updateField("golfSkill", value)}
        />

        <LabeledSelect
          label="MBTI"
          options={mbtiOptions}
          value={formData.mbti}
          onChange={(value) => updateField("mbti", value)}
        />

        <InputField
          label="취미"
          value={formData.hobbies}
          onChange={(value) => updateField("hobbies", value)}
          placeholder="취미를 입력하세요"
        />

        <LabeledSelect
          label="활동 지역"
          options={regionOptions}
          value={formData.activityRegion}
          onChange={(value) => updateField("activityRegion", value)}
        />

        <LabeledSelect
          label="종교"
          options={religionOptions}
          value={formData.religion}
          onChange={(value) => updateField("religion", value)}
        />

        <LabeledSelect
          label="흡연 여부"
          options={yesNoOptions}
          value={formData.smoking}
          onChange={(value) => updateField("smoking", value)}
        />

        <LabeledSelect
          label="음주 여부"
          options={drinkOptions}
          value={formData.drinking}
          onChange={(value) => updateField("drinking", value)}
        />

        <div className="flex gap-3 pt-2">
          <button
            type="button"
            onClick={() => navigate("/swings/mypage")}
            className="flex-1 rounded-xl bg-gray-100 py-3 text-sm font-semibold text-gray-700"
          >
            취소
          </button>
          <button
            type="button"
            onClick={handleUpdate}
            className="flex-1 rounded-xl bg-custom-pink py-3 text-sm font-bold text-white"
          >
            저장하기
          </button>
        </div>
      </div>

      <ResultModal
        modal={modal}
        onClose={() => {
          if (modal.success && modal.logout) {
            setLogoutPending(true);
            return;
          }

          if (modal.success) {
            navigate("/swings/mypage");
            return;
          }

          setModal((prev) => ({ ...prev, open: false }));
        }}
      />
    </div>
  );
}

function InputField({
  label,
  value,
  onChange,
  placeholder = "",
  type = "text",
}) {
  return (
    <div>
      <label className="mb-2 block text-sm font-semibold text-gray-700">
        {label}
      </label>
      <input
        type={type}
        className="h-11 w-full rounded-xl border border-gray-300 px-4 text-sm text-gray-900 outline-none transition focus:border-rose-400"
        value={value || ""}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
      />
    </div>
  );
}

function LabeledSelect({ label, options, value, onChange }) {
  return (
    <div>
      <label className="mb-2 block text-sm font-semibold text-gray-700">
        {label}
      </label>
      <Select
        options={options}
        value={options.find((option) => option.value === value) || null}
        onChange={(selected) => onChange(selected?.value || "")}
        styles={selectStyles}
        placeholder="선택하세요"
      />
    </div>
  );
}

function ResultModal({ modal, onClose }) {
  return (
    <Dialog open={modal.open} onClose={onClose} className="relative z-50">
      <div className="fixed inset-0 bg-black/40 backdrop-blur-sm" />
      <div className="fixed inset-0 flex items-center justify-center px-4">
        <Dialog.Panel className="w-full max-w-sm rounded-2xl bg-white p-6 text-center shadow-xl">
          <Dialog.Title
            className={`text-lg font-bold ${
              modal.success ? "text-green-600" : "text-red-500"
            }`}
          >
            {modal.success ? "완료" : "오류"}
          </Dialog.Title>
          <p className="mt-3 whitespace-pre-line text-sm font-medium text-gray-700">
            {modal.message}
          </p>
          <button
            type="button"
            onClick={onClose}
            className="mt-5 rounded-xl bg-custom-pink px-5 py-2 text-sm font-bold text-white"
          >
            확인
          </button>
        </Dialog.Panel>
      </div>
    </Dialog>
  );
}
