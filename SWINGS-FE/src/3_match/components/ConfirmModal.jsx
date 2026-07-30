import React, { useState } from "react";
import { motion } from "framer-motion";

const MotionDiv = motion.div;

function ConfirmModal({
  message,
  onConfirm,
  onCancel,
  cancelLabel = "취소",
  confirmLabel = "확인",
}) {
  const [submitting, setSubmitting] = useState(false);

  const handleConfirm = async () => {
    if (submitting) {
      return;
    }

    setSubmitting(true);

    try {
      await onConfirm();
    } catch (error) {
      console.error("ConfirmModal error", error);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[999] flex items-center justify-center bg-slate-900/35 px-4 backdrop-blur-sm">
      <MotionDiv
        initial={{ opacity: 0, y: 18, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 14, scale: 0.98 }}
        transition={{ duration: 0.2 }}
        className="w-full max-w-sm rounded-[1.75rem] border border-white/70 bg-white/88 p-6 text-center shadow-[0_24px_80px_rgba(15,23,42,0.18)] backdrop-blur-xl"
      >
        <p className="whitespace-pre-line text-base font-medium leading-7 text-slate-700">
          {message}
        </p>

        <div className="mt-6 grid grid-cols-2 gap-3">
          <button
            onClick={onCancel}
            disabled={submitting}
            className="rounded-2xl border border-slate-200 bg-slate-100 px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-200"
          >
            {cancelLabel}
          </button>
          <button
            onClick={handleConfirm}
            disabled={submitting}
            className={`rounded-2xl px-4 py-3 text-sm font-semibold text-white transition ${
              submitting
                ? "cursor-not-allowed bg-pink-300"
                : "bg-gradient-to-r from-pink-500 to-rose-400 hover:brightness-105"
            }`}
          >
            {confirmLabel}
          </button>
        </div>
      </MotionDiv>
    </div>
  );
}

export default ConfirmModal;
