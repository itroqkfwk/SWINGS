import { useEffect, useState } from "react";
import { format } from "date-fns";
import { ko } from "date-fns/locale";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { getPointBalance, getPointHistory } from "../api/userApi";

export default function MyPointPage() {
  const [balance, setBalance] = useState(0);
  const [logs, setLogs] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const loadData = async () => {
      try {
        const balanceValue = await getPointBalance();
        const history = await getPointHistory();
        setBalance(balanceValue);
        setLogs(history);
      } catch (error) {
        console.error("포인트 정보를 불러오지 못했습니다.", error);
      }
    };

    loadData();
  }, []);

  const formatPrettyDate = (dateString) => {
    const date = new Date(dateString);
    return format(date, "M월 d일 a h:mm", { locale: ko });
  };

  const groupedLogs = logs.reduce((accumulator, log) => {
    const date = new Date(log.createdAt);
    const today = new Date();
    const yesterday = new Date();
    yesterday.setDate(today.getDate() - 1);

    const isToday = date.toDateString() === today.toDateString();
    const isYesterday = date.toDateString() === yesterday.toDateString();

    const key = isToday
      ? "오늘"
      : isYesterday
      ? "어제"
      : format(date, "M월 d일", { locale: ko });

    if (!accumulator[key]) {
      accumulator[key] = [];
    }

    accumulator[key].push(log);
    return accumulator;
  }, {});

  const totalSpent = logs.reduce(
    (sum, log) => (log.amount < 0 ? sum + Math.abs(log.amount) : sum),
    0
  );

  return (
    <div className="min-h-screen bg-slate-50 px-5 pb-24 pt-6">
      <motion.section
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
        className="rounded-3xl bg-white p-5 shadow-sm ring-1 ring-gray-100"
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-sm font-medium text-gray-500">보유 포인트</p>
            <h1 className="mt-1 text-3xl font-bold text-gray-900">
              {balance.toLocaleString()} 포인트
            </h1>
            <p className="mt-2 text-xs text-gray-400">
              지금까지{" "}
              <span className="font-semibold text-gray-700">
                {totalSpent.toLocaleString()} 포인트
              </span>
              를 사용했습니다.
            </p>
          </div>

          <button
            type="button"
            onClick={() => navigate("/swings/shop")}
            className="rounded-xl bg-custom-coin px-4 py-2 text-sm font-bold text-white transition hover:opacity-90"
          >
            충전하기
          </button>
        </div>
      </motion.section>

      <section className="mt-4 rounded-2xl bg-amber-50 px-4 py-3 text-sm font-medium text-amber-800 ring-1 ring-amber-100">
        이벤트 상품은 기본 포인트에 추가 적립 혜택이 포함되어 있습니다.
      </section>

      <section className="mt-8">
        <h2 className="mb-4 text-base font-bold text-gray-800">포인트 이용 내역</h2>

        {logs.length === 0 ? (
          <div className="rounded-2xl bg-white px-4 py-10 text-center text-sm text-gray-400 shadow-sm ring-1 ring-gray-100">
            아직 포인트 이용 내역이 없습니다.
          </div>
        ) : (
          <div className="space-y-8">
            {Object.entries(groupedLogs).map(([label, group]) => (
              <div key={label}>
                <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-gray-400">
                  {label}
                </p>
                <div className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-gray-100">
                  <ul className="space-y-4">
                    <AnimatePresence>
                      {group.map((log, index) => (
                        <motion.li
                          key={`${label}-${index}`}
                          initial={{ opacity: 0, y: 8 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: 8 }}
                          transition={{ delay: index * 0.04 }}
                          className="flex items-start justify-between gap-4 border-b border-gray-100 pb-4 last:border-b-0 last:pb-0"
                        >
                          <div>
                            <p className="text-sm font-semibold text-gray-900">
                              {log.description.includes("슈퍼챗")
                                ? "슈퍼챗 사용"
                                : log.description}
                            </p>
                            <p className="mt-1 text-xs text-gray-400">
                              {formatPrettyDate(log.createdAt)}
                            </p>
                          </div>

                          <p
                            className={`shrink-0 text-sm font-bold ${
                              log.amount >= 0 ? "text-green-600" : "text-rose-500"
                            }`}
                          >
                            {log.amount >= 0 ? `+${log.amount}` : log.amount} 포인트
                          </p>
                        </motion.li>
                      ))}
                    </AnimatePresence>
                  </ul>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
