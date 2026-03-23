import React from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "framer-motion";
import { FaTrash } from "react-icons/fa";

const DeleteConfirmModal = ({ visible, onCancel, onConfirm }) => {
  if (typeof document === "undefined") return null;

  return createPortal(
    <AnimatePresence>
      {visible ? (
        <motion.div
          className="fixed inset-0 z-[9999] flex items-center justify-center bg-slate-950/35 px-4 backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            initial={{ opacity: 0, y: 16, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.96 }}
            transition={{ duration: 0.2 }}
            className="w-full max-w-sm rounded-[2rem] border border-white/70 bg-white/95 p-6 shadow-[0_25px_60px_rgba(15,23,42,0.18)]"
          >
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-rose-100 text-rose-500">
              <FaTrash />
            </div>

            <div className="mt-4 text-center">
              <h3 className="text-xl font-semibold text-slate-900">
                게시글을 삭제할까요?
              </h3>
              <p className="mt-2 text-sm leading-6 text-slate-500">
                삭제한 게시글은 다시 복구할 수 없습니다. 정말 삭제하려면 아래
                버튼을 눌러주세요.
              </p>
            </div>

            <div className="mt-6 flex gap-3">
              <button
                type="button"
                onClick={onCancel}
                className="flex-1 rounded-full border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-600 transition hover:bg-slate-50"
              >
                취소
              </button>
              <button
                type="button"
                onClick={onConfirm}
                className="flex-1 rounded-full bg-gradient-to-r from-rose-500 to-orange-400 px-4 py-3 text-sm font-semibold text-white shadow-sm transition hover:brightness-105"
              >
                삭제하기
              </button>
            </div>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>,
    document.body
  );
};

export default DeleteConfirmModal;
