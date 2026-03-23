import React from "react";
import { FaImage, FaTimes } from "react-icons/fa";

const NewPostForm = ({
  newPostContent,
  setNewPostContent,
  handleImageChange,
  imagePreview,
  handleSubmit,
  setShowNewPostForm,
  clearSelectedImage,
  isSubmitting = false,
}) => {
  return (
    <div className="w-full overflow-hidden rounded-[2rem] border border-white/70 bg-white/95 shadow-[0_25px_60px_rgba(15,23,42,0.18)] backdrop-blur">
      <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
        <div>
          <h2 className="text-lg font-bold text-slate-900">새 피드 작성</h2>
          <p className="mt-1 text-sm text-slate-400">
            사진과 짧은 소개를 함께 올려보세요.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setShowNewPostForm(false)}
          className="flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 bg-slate-50 text-slate-500 transition hover:bg-slate-100 hover:text-slate-700"
        >
          <FaTimes />
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4 px-5 py-5">
        <div className="flex items-center justify-between rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
          <label
            htmlFor="new-feed-image-upload"
            className="flex cursor-pointer items-center gap-2 text-sm font-semibold text-slate-700"
          >
            <FaImage className="text-rose-500" />
            이미지 추가
          </label>
          <input
            id="new-feed-image-upload"
            type="file"
            accept="image/*"
            onChange={handleImageChange}
            className="hidden"
          />
        </div>

        {imagePreview && (
          <div className="relative overflow-hidden rounded-[1.5rem] border border-slate-200 bg-slate-50">
            <img
              src={imagePreview}
              alt="업로드 미리보기"
              className="h-64 w-full object-cover"
            />
            <button
              type="button"
              onClick={clearSelectedImage}
              className="absolute right-3 top-3 flex h-10 w-10 items-center justify-center rounded-full bg-white/90 text-slate-700 shadow transition hover:bg-white"
            >
              <FaTimes />
            </button>
          </div>
        )}

        <div className="rounded-[1.5rem] border border-slate-200 bg-white p-3 shadow-sm">
          <textarea
            value={newPostContent}
            onChange={(event) => setNewPostContent(event.target.value)}
            placeholder="오늘의 라운드, 생각, 분위기를 자유롭게 남겨보세요."
            maxLength={500}
            className="min-h-40 w-full resize-none border-0 bg-transparent px-1 py-1 text-sm leading-6 text-slate-800 outline-none placeholder:text-slate-400"
          />
          <div className="mt-2 text-right text-xs text-slate-400">
            {newPostContent.length}/500
          </div>
        </div>

        <div className="flex justify-end gap-2">
          <button
            type="button"
            onClick={() => setShowNewPostForm(false)}
            className="rounded-full border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-600 transition hover:bg-slate-50"
          >
            취소
          </button>
          <button
            type="submit"
            disabled={(!newPostContent.trim() && !imagePreview) || isSubmitting}
            className={`rounded-full px-5 py-2 text-sm font-semibold text-white transition ${
              (!newPostContent.trim() && !imagePreview) || isSubmitting
                ? "cursor-not-allowed bg-slate-300"
                : "bg-gradient-to-r from-rose-500 to-orange-400 shadow-sm hover:brightness-105"
            }`}
          >
            {isSubmitting ? "게시 중..." : "게시하기"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default NewPostForm;
