import { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { motion } from "framer-motion";
import { IoIosArrowBack, IoIosArrowDown, IoIosArrowUp } from "react-icons/io";
import { MapPin, Plus } from "lucide-react";
import { format, getDaysInMonth, isToday } from "date-fns";
import { ko } from "date-fns/locale";

import MatchGroupCard from "../components/MatchGroupCard";
import useMatchGroupList from "../hooks/useMatchGroupList";
import MatchGroupCreate from "./MatchGroupCreate.jsx";
import BaseModal from "../components/ui/BaseModal";
import MapRegionModal from "../components/MapRegionModal";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

const MatchGroupList = () => {
  const { category } = useParams();
  const navigate = useNavigate();

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showMapModal, setShowMapModal] = useState(false);
  const [monthOffset, setMonthOffset] = useState(0);
  const [scrollReady, setScrollReady] = useState(false);

  const scrollRef = useRef(null);
  const today = new Date();
  const baseMonth = new Date(today.getFullYear(), today.getMonth() + monthOffset);
  const daysInMonth = getDaysInMonth(baseMonth);

  const {
    tab,
    setTab,
    setRegion,
    selectedDate,
    setSelectedDate,
    filteredGroups,
  } = useMatchGroupList(category);

  const groupCountByDate = filteredGroups.reduce((acc, group) => {
    const date = group.schedule?.split("T")[0];
    if (date) acc[date] = (acc[date] || 0) + 1;
    return acc;
  }, {});

  const handleDateClick = (ymd) => {
    setSelectedDate(selectedDate === ymd ? "" : ymd);
  };

  const changeMonth = (delta) => {
    setMonthOffset((prev) => prev + delta);
    setScrollReady(false);
  };

  useEffect(() => {
    if (!scrollRef.current) return;
    const todayEl = scrollRef.current.querySelector(".today");
    if (todayEl && !scrollReady) {
      todayEl.scrollIntoView({ inline: "center", behavior: "smooth" });
      setScrollReady(true);
    }
  }, [monthOffset, scrollReady]);

  const pageTitle = category === "screen" ? "SCREEN" : "FIELD";

  return (
    <div className="relative mx-auto max-w-6xl px-4 py-6">
      <div className="mb-5 flex items-center justify-between px-1">
        <button
          onClick={() => navigate("/swings/matchgroup")}
          className="text-gray-700"
        >
          <IoIosArrowBack size={25} />
        </button>
        <h1 className="text-xl font-bold text-center">{pageTitle}</h1>
        <button
          onClick={() => setShowCreateModal(true)}
          className="font-bold text-custom-pink"
          title="그룹 만들기"
        >
          <Plus size={25} />
        </button>
      </div>

      <div className="mb-5 rounded-[1.75rem] border border-slate-200 bg-white px-5 py-5 shadow-sm">
        <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-pink-500">
              Group Match
            </p>
            <h2 className="mt-2 text-2xl font-black text-slate-900">
              {pageTitle} 모임 목록
            </h2>
            <p className="mt-2 text-sm leading-6 text-slate-500">
              날짜와 지역을 기준으로 원하는 모임을 빠르게 찾을 수 있습니다.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowMapModal(true)}
              className="flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-4 py-2 text-sm font-semibold text-slate-600 transition hover:bg-slate-100"
            >
              <MapPin size={16} />
              지역 보기
            </button>
          </div>
        </div>
      </div>

      <div className="mx-auto mb-4 flex w-full max-w-md rounded-xl bg-gray-100 p-1 shadow-inner">
        {["all", "my"].map((type) => (
          <button
            key={type}
            className={`flex-1 rounded-lg py-2 text-sm font-semibold transition-all ${
              tab === type
                ? "bg-white text-black shadow-sm"
                : "text-gray-500 hover:text-black"
            }`}
            onClick={() => setTab(type)}
          >
            {type === "all" ? "전체" : "내 모임"}
          </button>
        ))}
      </div>

      <div className="mb-3 flex items-center gap-3 px-2">
        <div className="flex min-w-fit flex-col items-center">
          <button onClick={() => changeMonth(-1)} className="mb-1 text-xl">
            <IoIosArrowUp />
          </button>
          <span className="my-1 whitespace-nowrap text-center font-bold leading-none">
            {format(baseMonth, "M월")}
          </span>
          <button onClick={() => changeMonth(1)} className="mt-1 text-xl">
            <IoIosArrowDown />
          </button>
        </div>

        <div
          ref={scrollRef}
          className="scrollbar-hide flex gap-4 overflow-x-auto scroll-smooth"
        >
          {Array.from({ length: daysInMonth }, (_, i) => {
            const date = new Date(
              baseMonth.getFullYear(),
              baseMonth.getMonth(),
              i + 1
            );
            const ymd = format(date, "yyyy-MM-dd");
            const day = format(date, "d");
            const weekday = format(date, "EEE", { locale: ko });
            const isSelected = selectedDate === ymd;
            const isCurrentDay = isToday(date);

            return (
              <button
                key={ymd}
                onClick={() => handleDateClick(ymd)}
                className={`flex w-12 flex-col items-center justify-center rounded-lg py-1 text-xs font-medium ${
                  isSelected ? "bg-custom-pink text-white" : "text-gray-700"
                } ${isCurrentDay && !isSelected ? "today border border-pink-400" : ""}`}
              >
                <span
                  className={`mb-1 ${
                    weekday === "토"
                      ? "text-blue-500"
                      : weekday === "일"
                      ? "text-red-500"
                      : ""
                  }`}
                >
                  {weekday}
                </span>
                <span className="mb-1 text-[13px]">{day}</span>
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-gray-200 text-[12px]">
                  {groupCountByDate[ymd] || 0}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {filteredGroups.length === 0 ? (
        <div className="mt-10 rounded-[1.75rem] border border-dashed border-slate-200 bg-white px-6 py-14 text-center text-gray-500">
          조건에 맞는 그룹이 없습니다.
        </div>
      ) : (
        <motion.div
          className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {filteredGroups.map((group) => (
            <motion.div key={group.matchGroupId} variants={itemVariants}>
              <MatchGroupCard group={group} isMine={tab === "my"} />
            </motion.div>
          ))}
        </motion.div>
      )}

      {showCreateModal && (
        <BaseModal
          onClose={() => setShowCreateModal(false)}
          title="그룹 만들기"
          maxWidth="max-w-md"
        >
          <div className="scrollbar-hide max-h-[60vh] overflow-y-auto px-2">
            <MatchGroupCreate
              isModal
              onSuccess={() => setShowCreateModal(false)}
            />
          </div>
        </BaseModal>
      )}

      {showMapModal && (
        <MapRegionModal
          isOpen={showMapModal}
          onClose={() => setShowMapModal(false)}
          groups={filteredGroups}
          setRegion={setRegion}
        />
      )}
    </div>
  );
};

export default MatchGroupList;
