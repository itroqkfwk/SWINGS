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
    <nav className="fixed bottom-0 z-50 w-full border-t border-slate-200 bg-white/95 backdrop-blur">
      <div className="grid h-16 w-full grid-cols-5 px-1 text-[11px] text-slate-500 sm:px-4 lg:px-8">
        {navItems.map((item) => {
          const active = isActivePath(location.pathname, item.to);
          const Icon = item.icon;

          return (
            <Link
              key={item.to}
              to={item.to}
              className={`relative flex flex-col items-center justify-center gap-1 rounded-xl transition-colors duration-200 ${
                active ? "font-semibold text-slate-900" : "text-slate-400"
              }`}
            >
              <motion.div
                animate={{ scale: active ? 1.08 : 1, y: active ? -1 : 0 }}
                transition={{ type: "spring", stiffness: 320, damping: 18 }}
                className="flex items-center justify-center"
              >
                <Icon className="h-5 w-5 text-current sm:h-6 sm:w-6" />
              </motion.div>
              <span className="text-[10px] leading-none sm:text-[11px]">
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
