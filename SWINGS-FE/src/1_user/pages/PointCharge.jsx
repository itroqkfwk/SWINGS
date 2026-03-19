import { useEffect, useState } from "react";
import { Heart } from "lucide-react";
import { IoIosArrowBack } from "react-icons/io";
import { useNavigate } from "react-router-dom";
import CoinSelectModal from "../components/CoinSelectModal";
import { fetchUserData } from "../api/userApi";

const coinOptions = [
  { coin: 5, price: 5000 },
  { coin: 10, price: 10000 },
  { coin: 33, price: 30000, label: "30 + 10%" },
  { coin: 55, price: 50000, label: "50 + 10%" },
  { coin: 110, price: 100000, label: "100 + 10%" },
  { coin: 330, price: 300000, label: "300 + 10%" },
];

const getHeartStyle = (coin) => {
  if (coin === 5) {
    return { size: 24, textColor: "text-gray-300", fillColor: "fill-none" };
  }
  if (coin === 10) {
    return { size: 28, textColor: "text-pink-200", fillColor: "fill-pink-100" };
  }
  if (coin === 33) {
    return { size: 32, textColor: "text-pink-300", fillColor: "fill-pink-200" };
  }
  if (coin === 55) {
    return { size: 36, textColor: "text-pink-400", fillColor: "fill-pink-300" };
  }
  if (coin === 110) {
    return { size: 40, textColor: "text-pink-500", fillColor: "fill-pink-400" };
  }
  if (coin === 330) {
    return { size: 44, textColor: "text-pink-600", fillColor: "fill-pink-500" };
  }
  return { size: 24, textColor: "text-gray-300", fillColor: "fill-none" };
};

export default function PointCharge() {
  const [user, setUser] = useState(null);
  const [selectedCoin, setSelectedCoin] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    fetchUserData()
      .then((data) => setUser(data))
      .catch((error) => console.error("사용자 정보를 불러오지 못했습니다.", error));
  }, []);

  const handleCoinClick = (coin) => {
    setSelectedCoin(coin);
    setIsModalOpen(true);
  };

  return (
    <div className="relative min-h-screen bg-slate-50 px-5 pb-24 pt-6">
      <button
        type="button"
        className="mb-4 flex items-center gap-1 text-sm font-medium text-gray-500 transition-colors hover:text-gray-900"
        onClick={() => navigate("/swings/points")}
      >
        <IoIosArrowBack size={20} />
        포인트 내역으로 돌아가기
      </button>

      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">포인트 충전</h1>
        <p className="mt-2 text-sm text-gray-500">
          원하는 상품을 선택하면 결제 화면으로 이동합니다.
        </p>
      </div>

      <div className="grid w-full grid-cols-2 gap-4 sm:max-w-3xl sm:grid-cols-3">
        {coinOptions.map(({ coin, price, label }) => {
          const isEvent = coin >= 30;
          const { size, textColor, fillColor } = getHeartStyle(coin);

          return (
            <button
              key={coin}
              type="button"
              onClick={() => handleCoinClick(coin)}
              className="group relative flex min-h-[176px] flex-col items-center justify-between rounded-2xl bg-white p-4 text-center shadow-sm ring-1 ring-gray-100 transition duration-300 hover:-translate-y-1 hover:shadow-lg"
            >
              {isEvent && (
                <div className="absolute right-3 top-3 rounded-full bg-rose-500 px-2 py-1 text-[10px] font-bold text-white">
                  EVENT
                </div>
              )}

              <div className={`mt-2 flex justify-center ${textColor}`}>
                <Heart
                  size={size}
                  className={`transition-transform duration-300 group-hover:rotate-6 ${textColor} ${fillColor}`}
                />
              </div>

              <div className="mt-3">
                {label ? (
                  <p className="text-lg font-bold text-gray-900">
                    {label.split(" + ")[0]} +{" "}
                    <span className="text-rose-500">10%</span>
                    <span className="mt-1 block text-sm font-medium text-gray-500">
                      총 {coin}포인트
                    </span>
                  </p>
                ) : (
                  <p className="text-lg font-bold text-gray-900">{coin}포인트</p>
                )}
              </div>

              <div className="text-sm font-medium text-gray-500">
                {price.toLocaleString()}원
              </div>
            </button>
          );
        })}
      </div>

      {isModalOpen && user?.userId && (
        <CoinSelectModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          coin={selectedCoin}
          userId={user.userId}
          redirectToCheckout={true}
        />
      )}
    </div>
  );
}
