import { useNavigate } from "react-router-dom";
import { ArrowRight, House, ShieldCheck, Users } from "lucide-react";

const cards = [
  {
    title: "유저 관리",
    description: "가입한 유저 목록을 확인하고 권한 변경이나 상세 확인을 진행합니다.",
    icon: Users,
    path: "/swings/admin/users",
    tone: "from-slate-900 to-slate-700",
  },
  {
    title: "홈으로 이동",
    description: "관리 작업을 마친 뒤 일반 서비스 홈 화면으로 바로 돌아갑니다.",
    icon: House,
    path: "/swings/feed",
    tone: "from-amber-500 to-orange-500",
  },
];

export default function AdminDashboard() {
  const navigate = useNavigate();

  return (
    <section className="space-y-8">
      <div className="rounded-3xl bg-white p-8 shadow-sm ring-1 ring-slate-200">
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-3">
            <span className="inline-flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold uppercase tracking-[0.18em] text-emerald-700">
              <ShieldCheck size={14} />
              Admin Console
            </span>
            <h1 className="text-3xl font-black tracking-tight text-slate-900">
              관리자 대시보드
            </h1>
            <p className="max-w-2xl text-sm leading-6 text-slate-500">
              관리자 전용 작업은 이 영역에서 처리하고, 일반 서비스 탐색은 홈 화면으로
              분리했습니다.
            </p>
          </div>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {cards.map(({ title, description, icon: Icon, path, tone }) => (
          <button
            key={title}
            type="button"
            onClick={() => navigate(path)}
            className="group overflow-hidden rounded-3xl bg-white text-left shadow-sm ring-1 ring-slate-200 transition hover:-translate-y-0.5 hover:shadow-lg"
          >
            <div className={`h-2 bg-gradient-to-r ${tone}`} />
            <div className="space-y-5 p-6">
              <div className="flex items-center justify-between">
                <div className="rounded-2xl bg-slate-100 p-3 text-slate-700">
                  <Icon size={22} />
                </div>
                <ArrowRight className="text-slate-300 transition group-hover:translate-x-1 group-hover:text-slate-600" />
              </div>
              <div className="space-y-2">
                <h2 className="text-xl font-bold text-slate-900">{title}</h2>
                <p className="text-sm leading-6 text-slate-500">{description}</p>
              </div>
            </div>
          </button>
        ))}
      </div>
    </section>
  );
}
