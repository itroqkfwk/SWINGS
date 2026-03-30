import React from "react";
import { PenSquare } from "lucide-react";

const CreatePostButton = ({
  onClick,
  customPosition = "bottom-24 right-6",
}) => {
  return (
    <button
      onClick={onClick}
      className={`fixed ${customPosition} z-[60] flex items-center justify-center rounded-full bg-gradient-to-r from-rose-500 to-orange-400 p-3 text-white shadow-[0_18px_40px_rgba(244,63,94,0.35)] transition-all duration-300 hover:scale-[1.03] hover:brightness-105 focus:outline-none`}
      aria-label="게시물 작성"
    >
      <PenSquare size={20} />
    </button>
  );
};

export default CreatePostButton;
