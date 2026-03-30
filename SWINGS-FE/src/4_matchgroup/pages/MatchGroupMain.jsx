import { useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowRightIcon,
  CalendarIcon,
  ClubIcon as GolfIcon,
  LandPlotIcon,
  Users2Icon,
} from "lucide-react";
import GroupMainBanner from "../components/ui/GroupMainBanner.jsx";
import BaseModal from "../components/ui/BaseModal.jsx";

export default function MatchGroupMain() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <div className="mx-auto w-full max-w-6xl px-4 pb-24 pt-4">
      <GroupMainBanner />

      <div className="mt-10 grid grid-cols-1 gap-4 lg:grid-cols-2">
        <MatchCard
          icon={<GolfIcon className="h-6 w-6 text-green-600" />}
          title="FIELD"
          desc="야외 필드에서 자연스럽게 라운드를 즐길 멤버를 찾아보세요."
          to="/swings/matchgroup/field"
        />
        <MatchCard
          icon={<LandPlotIcon className="h-6 w-6 text-blue-600" />}
          title="SCREEN"
          desc="스크린 골프로 가볍게 시작하고 싶은 분들을 위한 모임입니다."
          to="/swings/matchgroup/screen"
        />
      </div>

      <div className="mt-6 text-center">
        <button
          onClick={() => setIsModalOpen(true)}
          className="text-sm text-gray-500 underline transition hover:text-gray-700"
        >
          이용 안내 보기
        </button>
      </div>

      {isModalOpen && (
        <BaseModal onClose={() => setIsModalOpen(false)} title="이용 안내">
          <div className="grid gap-6 md:grid-cols-3">
            <InfoItem
              icon={<Users2Icon className="h-5 w-5 text-gray-700" />}
              title="모임 요청과 참여"
              desc="원하는 그룹을 선택하고 참가 요청을 보낼 수 있습니다. 방장이 확인하면 참가가 확정됩니다."
            />
            <InfoItem
              icon={<GolfIcon className="h-5 w-5 text-gray-700" />}
              title="직접 그룹 만들기"
              desc="직접 그룹을 만들고 원하는 골프 멤버를 모집할 수 있습니다."
            />
            <InfoItem
              icon={<CalendarIcon className="h-5 w-5 text-gray-700" />}
              title="일정 관리"
              desc="참여 중인 모임의 일정과 인원 정보를 한눈에 확인하고 관리할 수 있습니다."
            />
          </div>
        </BaseModal>
      )}
    </div>
  );
}

function MatchCard({ icon, title, desc, to }) {
  return (
    <Link
      to={to}
      className="flex items-center gap-6 rounded-[1.5rem] border border-slate-200 bg-white p-5 shadow-sm transition-all hover:-translate-y-1 hover:shadow-md"
    >
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gray-100">
        {icon}
      </div>
      <div className="flex-1">
        <h3 className="text-base font-semibold text-gray-900">{title}</h3>
        <p className="mt-1 line-clamp-2 text-sm text-gray-500">{desc}</p>
      </div>
      <ArrowRightIcon className="h-5 w-5 text-gray-400" />
    </Link>
  );
}

function InfoItem({ icon, title, desc }) {
  return (
    <div className="flex items-start gap-4">
      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-100">
        {icon}
      </div>
      <div>
        <h3 className="font-medium text-gray-900">{title}</h3>
        <p className="text-sm text-gray-600">{desc}</p>
      </div>
    </div>
  );
}
