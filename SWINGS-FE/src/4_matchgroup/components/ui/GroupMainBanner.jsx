import { useEffect, useState } from "react";
import banner1 from "../../../assets/golf-banner-1-optimized.jpg";
import banner2 from "../../../assets/golf-banner-2-optimized.jpg";

const banners = [
  {
    src: banner1,
    title: "필드에서 만나는 주말 라운드",
    description: "비슷한 스타일의 골퍼들과 자연스럽게 팀을 만들어 보세요.",
  },
  {
    src: banner2,
    title: "스크린으로 가볍게 시작하는 모임",
    description: "부담 없는 한 판부터 시작해서 편하게 친해질 수 있습니다.",
  },
];

export default function GroupMainBanner() {
  const [currentBanner, setCurrentBanner] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentBanner((prev) => (prev + 1) % banners.length);
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  return (
    <section className="space-y-4">
      <div className="relative overflow-hidden rounded-[2rem] border border-slate-200 bg-slate-900 shadow-lg">
        <div
          className="flex transition-transform duration-500 ease-in-out"
          style={{ transform: `translateX(-${currentBanner * 100}%)` }}
        >
          {banners.map((banner, idx) => (
            <div
              key={idx}
              className="relative w-full flex-shrink-0 aspect-[16/8] min-h-[240px] sm:min-h-[280px] lg:min-h-[360px]"
            >
              <img
                src={banner.src}
                alt={banner.title}
                className="absolute inset-0 h-full w-full object-cover object-center"
                loading={idx === 0 ? "eager" : "lazy"}
                decoding="async"
                sizes="(max-width: 768px) 100vw, 1200px"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-slate-950/75 via-slate-900/35 to-transparent" />
              <div className="absolute inset-x-0 bottom-0 p-6 sm:p-8 lg:p-10">
                <div className="max-w-xl text-white">
                  <p className="text-xs font-semibold uppercase tracking-[0.28em] text-pink-200">
                    Golf Group Match
                  </p>
                  <h2 className="mt-3 text-2xl font-black leading-tight sm:text-3xl lg:text-4xl">
                    {banner.title}
                  </h2>
                  <p className="mt-3 text-sm leading-6 text-slate-100 sm:text-base">
                    {banner.description}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="absolute bottom-5 left-1/2 flex -translate-x-1/2 gap-2">
          {banners.map((banner, idx) => (
            <button
              key={banner.title}
              type="button"
              onClick={() => setCurrentBanner(idx)}
              aria-label={`${idx + 1}번 배너 보기`}
              className={`h-2.5 rounded-full transition-all ${
                idx === currentBanner ? "w-8 bg-white" : "w-2.5 bg-white/45"
              }`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
