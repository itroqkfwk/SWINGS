import { Link, useLocation } from "react-router-dom";
import { Handshake, CircleUser } from "lucide-react";
import { motion } from "framer-motion";
import { FaHeartCircleCheck } from "react-icons/fa6";
import { AiOutlineInstagram } from "react-icons/ai";
import { HiOutlineChatBubbleLeftRight } from "react-icons/hi2";

const navItems = [
  { to: "/swings/matchgroup", label: "모임", icon: Handshake },
  { to: "/swings/match", label: "소개팅", icon: FaHeartCircleCheck },
  { to: "/swings/feed", label: "피드", icon: AiOutlineInstagram },
  { to: "/swings/chat", label: "채팅", icon: HiOutlineChatBubbleLeftRight },
  { to: "/swings/social", label: "마이", icon: CircleUser },
];

function isActivePath(pathname, target) {
  if (target === "/swings/feed") {
    return pathname === target || pathname.startsWith("/swings/profile/");
  }

  return pathname === target || pathname.startsWith(`${target}/`);
}

export default function BottomNavBar() {
  const location = useLocation();

  return (
    <div className="pointer-events-none fixed bottom-3 left-0 z-50 w-full px-3 sm:px-5 lg:px-8">
      <nav className="pointer-events-auto mx-auto max-w-3xl rounded-[1.75rem] border border-white/70 bg-white/80 px-2 py-2 shadow-[0_20px_60px_rgba(15,23,42,0.12)] backdrop-blur-xl">
        <div className="grid grid-cols-5 gap-1 text-[11px] text-slate-500">
          {navItems.map((item) => {
            const active = isActivePath(location.pathname, item.to);
            const Icon = item.icon;

            return (
              <Link
                key={item.to}
                to={item.to}
                className="group relative flex flex-col items-center justify-center rounded-2xl px-2 py-2.5"
              >
                {active && (
                  <motion.div
                    layoutId="bottom-nav-pill"
                    className="absolute inset-0 rounded-2xl bg-gradient-to-br from-pink-500 to-rose-400 shadow-[0_12px_30px_rgba(244,114,182,0.28)]"
                    transition={{ type: "spring", stiffness: 280, damping: 24 }}
                  />
                )}

                <motion.div
                  animate={{ scale: active ? 1.08 : 1, y: active ? -1 : 0 }}
                  transition={{ type: "spring", stiffness: 320, damping: 18 }}
                  className={`relative z-10 flex items-center justify-center ${
                    active ? "text-white" : "text-slate-400 group-hover:text-slate-600"
                  }`}
                >
                  <Icon className="h-5 w-5 sm:h-[1.35rem] sm:w-[1.35rem]" />
                </motion.div>

                <span
                  className={`relative z-10 mt-1 text-[10px] font-semibold leading-none ${
                    active ? "text-white" : "text-slate-400 group-hover:text-slate-600"
                  }`}
                >
                  {item.label}
                </span>
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
