import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  FaCheck,
  FaComment,
  FaEdit,
  FaEllipsisV,
  FaHeart,
  FaImage,
  FaPaperPlane,
  FaRegHeart,
  FaTimes,
  FaTrash,
  FaUser,
} from "react-icons/fa";
import feedApi from "../api/feedApi";
import socialApi from "../api/socialApi";
import { processFeed } from "../utils/feedUtils";
import { normalizeImageUrl } from "../utils/imageUtils";
import ImageModal from "./ImageModal";

const CAPTION_COLLAPSE_LENGTH = 220;
const COMMENT_COLLAPSE_LENGTH = 140;

const formatTimeAgo = (dateString) => {
  if (!dateString) return "";

  const date = new Date(dateString);
  const now = new Date();
  const diffMinutes = Math.max(0, Math.floor((now - date) / (1000 * 60)));

  if (diffMinutes < 1) return "방금 전";
  if (diffMinutes < 60) return `${diffMinutes}분 전`;
  if (diffMinutes < 1440) return `${Math.floor(diffMinutes / 60)}시간 전`;
  return `${Math.floor(diffMinutes / 1440)}일 전`;
};

const FeedDetailModal = ({
  feed,
  currentUser,
  onClose,
  onLikeToggle,
  onRequestDelete,
  onShowLikedBy,
  onCommentSubmit,
  onCommentDelete,
  setSelectedFeed,
  updateFeedInState,
}) => {
  const modalRef = useRef(null);
  const commentsRef = useRef(null);

  const [localFeed, setLocalFeed] = useState(processFeed(feed));
  const [authorProfile, setAuthorProfile] = useState(null);
  const [newComment, setNewComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [expandedCaption, setExpandedCaption] = useState(false);
  const [expandedCommentIds, setExpandedCommentIds] = useState([]);
  const [selectedImage, setSelectedImage] = useState(null);
  const [editingCommentId, setEditingCommentId] = useState(null);
  const [editedComment, setEditedComment] = useState("");
  const [activeCommentMenuId, setActiveCommentMenuId] = useState(null);
  const [showPostMenu, setShowPostMenu] = useState(false);
  const [isEditingPost, setIsEditingPost] = useState(false);
  const [editedCaption, setEditedCaption] = useState(feed?.caption || "");
  const [editedFile, setEditedFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(
    feed?.image || feed?.imageUrl
      ? normalizeImageUrl(feed.image || feed.imageUrl)
      : null
  );

  useEffect(() => {
    setLocalFeed(processFeed(feed));
    setEditedCaption(feed?.caption || "");
    setEditedFile(null);
    setImagePreview(
      feed?.image || feed?.imageUrl
        ? normalizeImageUrl(feed.image || feed.imageUrl)
        : null
    );
  }, [feed]);

  useEffect(() => {
    const fetchAuthor = async () => {
      if (!feed?.userId) return;

      try {
        const profile = await socialApi.getProfile(feed.userId);
        setAuthorProfile(profile);
      } catch (error) {
        console.error("작성자 프로필 로딩 실패:", error);
      }
    };

    fetchAuthor();
  }, [feed?.userId]);

  useEffect(() => {
    const handleMouseDown = (event) => {
      if (modalRef.current && !modalRef.current.contains(event.target)) {
        onClose();
      }
    };

    const handleEscape = (event) => {
      if (event.key === "Escape") {
        if (selectedImage) {
          setSelectedImage(null);
          return;
        }

        onClose();
      }
    };

    document.addEventListener("mousedown", handleMouseDown);
    document.addEventListener("keydown", handleEscape);
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("mousedown", handleMouseDown);
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "auto";
    };
  }, [onClose, selectedImage]);

  useEffect(() => {
    if (!commentsRef.current) return;
    commentsRef.current.scrollTop = commentsRef.current.scrollHeight;
  }, [localFeed?.comments?.length]);

  const sortedComments = useMemo(
    () =>
      [...(localFeed?.comments || [])].sort(
        (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
      ),
    [localFeed?.comments]
  );

  if (!feed) return null;

  const currentUserId = currentUser?.userId?.toString();
  const postOwnerId = localFeed?.userId?.toString();
  const canManagePost = currentUserId && currentUserId === postOwnerId;
  const hasImage = Boolean(localFeed?.image || localFeed?.imageUrl);
  const normalizedImageUrl = hasImage
    ? normalizeImageUrl(localFeed.image || localFeed.imageUrl)
    : null;
  const isCaptionLong =
    (localFeed?.caption || "").length > CAPTION_COLLAPSE_LENGTH;

  const handleLikeClick = async () => {
    if (!localFeed) return;

    const nextLiked = !localFeed.liked;
    const optimisticFeed = {
      ...localFeed,
      liked: nextLiked,
      likes: nextLiked ? (localFeed.likes || 0) + 1 : localFeed.likes - 1,
    };

    setLocalFeed(optimisticFeed);

    try {
      const updatedFeed = await onLikeToggle?.(localFeed.feedId, localFeed.liked);
      if (updatedFeed) {
        const processedFeed = processFeed(updatedFeed);
        setLocalFeed(processedFeed);
        setSelectedFeed(processedFeed);
        updateFeedInState?.(processedFeed);
      }
    } catch (error) {
      console.error("좋아요 처리 실패:", error);
      setLocalFeed(processFeed(feed));
    }
  };

  const handlePostUpdate = async (event) => {
    event.preventDefault();

    try {
      const updatedFeed = await feedApi.updateFeed(localFeed.feedId, {
        caption: editedCaption,
        file: editedFile,
      });

      const processedFeed = processFeed(updatedFeed);
      setLocalFeed(processedFeed);
      setSelectedFeed(processedFeed);
      updateFeedInState?.(processedFeed);
      setIsEditingPost(false);
      setShowPostMenu(false);
    } catch (error) {
      console.error("게시글 수정 실패:", error);
    }
  };

  const handleLocalCommentSubmit = async (event) => {
    event.preventDefault();

    if (!newComment.trim() || isSubmitting) return;

    setIsSubmitting(true);

    try {
      const createdComment = await onCommentSubmit?.(localFeed.feedId, newComment);
      const nextComment = {
        ...createdComment,
        username: createdComment?.username ?? currentUser?.username ?? "익명",
        userProfilePic:
          createdComment?.userProfilePic ?? currentUser?.userImg ?? null,
      };

      const updatedFeed = processFeed({
        ...localFeed,
        comments: [...(localFeed.comments || []), nextComment],
      });

      setLocalFeed(updatedFeed);
      setSelectedFeed(updatedFeed);
      updateFeedInState?.(updatedFeed);
      setNewComment("");
    } catch (error) {
      console.error("댓글 작성 실패:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCommentUpdate = async (commentId) => {
    if (!editedComment.trim()) return;

    try {
      const updatedComment = await feedApi.updateComment(
        localFeed.feedId,
        commentId,
        editedComment
      );

      const updatedFeed = processFeed({
        ...localFeed,
        comments: (localFeed.comments || []).map((comment) =>
          comment.commentId === commentId ? updatedComment : comment
        ),
      });

      setLocalFeed(updatedFeed);
      setSelectedFeed(updatedFeed);
      updateFeedInState?.(updatedFeed);
      setEditingCommentId(null);
      setEditedComment("");
      setActiveCommentMenuId(null);
    } catch (error) {
      console.error("댓글 수정 실패:", error);
    }
  };

  const handleCommentDelete = async (commentId) => {
    try {
      await onCommentDelete?.(localFeed.feedId, commentId);

      const updatedFeed = processFeed({
        ...localFeed,
        comments: (localFeed.comments || []).filter(
          (comment) => comment.commentId !== commentId
        ),
      });

      setLocalFeed(updatedFeed);
      setSelectedFeed(updatedFeed);
      updateFeedInState?.(updatedFeed);
    } catch (error) {
      console.error("댓글 삭제 실패:", error);
    }
  };

  const toggleCommentExpand = (commentId) => {
    setExpandedCommentIds((previousIds) =>
      previousIds.includes(commentId)
        ? previousIds.filter((id) => id !== commentId)
        : [...previousIds, commentId]
    );
  };

  const clearImagePreview = () => {
    const input = document.getElementById(`feed-detail-image-${localFeed.feedId}`);
    if (input) {
      input.value = "";
    }

    setEditedFile(null);
    setImagePreview(null);
  };

  return (
    <div className="fixed inset-0 z-[9980] flex items-center justify-center bg-slate-950/45 p-3 backdrop-blur-sm sm:p-5">
      <div
        ref={modalRef}
        className="relative flex h-[min(92vh,56rem)] w-full max-w-6xl flex-col overflow-hidden rounded-[2rem] border border-white/60 bg-white/95 shadow-[0_35px_90px_rgba(15,23,42,0.22)] lg:flex-row"
      >
        <button
          type="button"
          onClick={onClose}
          className="absolute right-4 top-4 z-30 flex h-11 w-11 items-center justify-center rounded-full bg-white/95 text-slate-600 shadow-lg transition hover:text-slate-900"
          aria-label="닫기"
        >
          <FaTimes />
        </button>

        {hasImage ? (
          <div className="relative h-[16rem] w-full shrink-0 overflow-hidden bg-slate-100 sm:h-[22rem] lg:h-full lg:w-[48%]">
            <button
              type="button"
              onClick={() => setSelectedImage(normalizedImageUrl)}
              className="block h-full w-full"
            >
              <img
                src={normalizedImageUrl}
                alt="게시글 이미지"
                className="h-full w-full object-cover"
              />
            </button>
          </div>
        ) : null}

        <div className="flex min-h-0 flex-1 flex-col bg-white">
          <header className="flex items-center gap-3 border-b border-slate-100 px-4 py-4 sm:px-6">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-full bg-gradient-to-br from-rose-100 to-amber-100 ring-1 ring-slate-200">
              {authorProfile?.userImg ? (
                <img
                  src={normalizeImageUrl(authorProfile.userImg)}
                  alt={authorProfile?.username || "작성자"}
                  className="h-full w-full object-cover"
                />
              ) : (
                <FaUser className="text-slate-500" />
              )}
            </div>

            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold text-slate-900 sm:text-base">
                {authorProfile?.username || localFeed.username || "작성자"}
              </p>
              <p className="mt-0.5 text-xs text-slate-400 sm:text-sm">
                {formatTimeAgo(localFeed.createdAt)}
              </p>
            </div>

            {canManagePost && (
              <div className="relative mr-12 sm:mr-14">
                <button
                  type="button"
                  onClick={() => setShowPostMenu((previous) => !previous)}
                  className="flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 bg-slate-50 text-slate-500 transition hover:border-slate-300 hover:bg-slate-100 hover:text-slate-700"
                >
                  <FaEllipsisV />
                </button>

                {showPostMenu && (
                  <div className="absolute right-0 top-12 z-20 flex overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-lg">
                    <button
                      type="button"
                      onClick={() => {
                        setShowPostMenu(false);
                        setIsEditingPost(true);
                      }}
                      className="flex items-center gap-2 px-4 py-3 text-sm font-medium text-slate-600 transition hover:bg-slate-50"
                    >
                      <FaEdit />
                      수정
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setShowPostMenu(false);
                        onRequestDelete?.(localFeed.feedId);
                      }}
                      className="flex items-center gap-2 px-4 py-3 text-sm font-medium text-rose-600 transition hover:bg-rose-50"
                    >
                      <FaTrash />
                      삭제
                    </button>
                  </div>
                )}
              </div>
            )}
          </header>

          <div className="min-h-0 flex-1 overflow-y-auto">
            {isEditingPost ? (
              <div className="space-y-4 px-4 py-5 sm:px-6">
                <form onSubmit={handlePostUpdate} className="space-y-4">
                  <div className="flex items-center justify-between rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
                    <label
                      htmlFor={`feed-detail-image-${localFeed.feedId}`}
                      className="flex cursor-pointer items-center gap-2 text-sm font-semibold text-slate-700"
                    >
                      <FaImage className="text-rose-500" />
                      이미지 변경
                    </label>
                    <input
                      id={`feed-detail-image-${localFeed.feedId}`}
                      type="file"
                      accept="image/*"
                      onChange={(event) =>
                        setEditedFile(event.target.files?.[0] || null)
                      }
                      className="hidden"
                    />
                  </div>

                  {(editedFile || imagePreview) && (
                    <div className="relative overflow-hidden rounded-[1.5rem] border border-slate-200 bg-slate-50">
                      <img
                        src={
                          editedFile
                            ? URL.createObjectURL(editedFile)
                            : imagePreview
                        }
                        alt="수정 이미지 미리보기"
                        className="h-64 w-full object-cover"
                      />
                      <button
                        type="button"
                        onClick={clearImagePreview}
                        className="absolute right-3 top-3 flex h-10 w-10 items-center justify-center rounded-full bg-white/90 text-slate-700 shadow transition hover:bg-white"
                      >
                        <FaTimes />
                      </button>
                    </div>
                  )}

                  <div className="rounded-[1.5rem] border border-slate-200 bg-white p-3 shadow-sm">
                    <textarea
                      value={editedCaption}
                      onChange={(event) => setEditedCaption(event.target.value)}
                      placeholder="게시글 내용을 입력하세요."
                      maxLength={500}
                      className="min-h-40 w-full resize-none border-0 bg-transparent px-1 py-1 text-sm leading-6 text-slate-800 outline-none placeholder:text-slate-400"
                    />
                    <div className="mt-2 text-right text-xs text-slate-400">
                      {editedCaption.length}/500
                    </div>
                  </div>

                  <div className="flex justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setIsEditingPost(false);
                        setEditedCaption(localFeed.caption || "");
                        setEditedFile(null);
                        setImagePreview(
                          localFeed.image || localFeed.imageUrl
                            ? normalizeImageUrl(
                                localFeed.image || localFeed.imageUrl
                              )
                            : null
                        );
                      }}
                      className="rounded-full border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-600 transition hover:bg-slate-50"
                    >
                      취소
                    </button>
                    <button
                      type="submit"
                      className="rounded-full bg-gradient-to-r from-rose-500 to-orange-400 px-5 py-2 text-sm font-semibold text-white shadow-sm transition hover:brightness-105"
                    >
                      저장하기
                    </button>
                  </div>
                </form>
              </div>
            ) : (
              <div className="space-y-5 px-4 py-5 sm:px-6">
                <section className="rounded-[1.75rem] border border-slate-100 bg-gradient-to-br from-white to-slate-50 px-5 py-4">
                  <p
                    className={`whitespace-pre-wrap break-words text-[15px] leading-7 text-slate-700 sm:text-base ${
                      !expandedCaption && isCaptionLong ? "line-clamp-5" : ""
                    }`}
                  >
                    {localFeed.caption?.trim() || "아직 작성된 소개가 없습니다."}
                  </p>

                  {isCaptionLong && (
                    <button
                      type="button"
                      onClick={() => setExpandedCaption((previous) => !previous)}
                      className="mt-3 text-sm font-semibold text-rose-500 transition hover:text-rose-600"
                    >
                      {expandedCaption ? "접기" : "더 보기"}
                    </button>
                  )}
                </section>

                <section className="flex flex-wrap items-center justify-between gap-3 rounded-[1.5rem] border border-slate-100 bg-white px-4 py-3 shadow-sm">
                  <div className="flex items-center gap-4">
                    <button
                      type="button"
                      onClick={handleLikeClick}
                      className={`flex items-center gap-2 rounded-full px-3 py-2 text-sm font-semibold transition ${
                        localFeed.liked
                          ? "bg-rose-50 text-rose-500"
                          : "bg-slate-50 text-slate-500 hover:bg-slate-100"
                      }`}
                    >
                      {localFeed.liked ? <FaHeart /> : <FaRegHeart />}
                      좋아요
                    </button>
                    <button
                      type="button"
                      onClick={() => onShowLikedBy?.(localFeed.feedId)}
                      className="text-sm font-semibold text-rose-500 transition hover:text-rose-600"
                    >
                      {localFeed.likes || 0}
                    </button>
                    <div className="flex items-center gap-2 text-sm text-slate-500">
                      <FaComment />
                      댓글 {sortedComments.length}
                    </div>
                  </div>

                  <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-500">
                    {formatTimeAgo(localFeed.createdAt)}
                  </span>
                </section>

                <section className="rounded-[1.75rem] border border-white/80 bg-slate-50/80 p-4 shadow-[0_12px_35px_rgba(15,23,42,0.06)] sm:p-5">
                  <div className="mb-4 flex items-center justify-between">
                    <h3 className="text-sm font-semibold text-slate-800 sm:text-base">
                      댓글 {sortedComments.length}
                    </h3>
                  </div>

                  <div
                    ref={commentsRef}
                    className="max-h-[18rem] space-y-3 overflow-y-auto pr-1"
                  >
                    {sortedComments.length > 0 ? (
                      sortedComments.map((comment) => {
                        const isExpanded = expandedCommentIds.includes(
                          comment.commentId
                        );
                        const isEditing = editingCommentId === comment.commentId;
                        const isCommentOwner =
                          currentUser?.userId?.toString() ===
                          comment?.userId?.toString();
                        const isCommentLong =
                          (comment?.content || "").length >
                          COMMENT_COLLAPSE_LENGTH;

                        return (
                          <div
                            key={comment.commentId}
                            className="rounded-[1.25rem] border border-slate-100 bg-white px-4 py-3"
                          >
                            <div className="flex items-start gap-3">
                              <div className="flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-full bg-slate-100 ring-1 ring-slate-200">
                                {comment.userProfilePic ? (
                                  <img
                                    src={normalizeImageUrl(comment.userProfilePic)}
                                    alt={comment.username || "사용자"}
                                    className="h-full w-full object-cover"
                                  />
                                ) : (
                                  <FaUser className="text-slate-400" />
                                )}
                              </div>

                              <div className="min-w-0 flex-1">
                                <div className="flex items-center gap-2">
                                  <span className="text-sm font-semibold text-slate-800">
                                    {comment.username || "사용자"}
                                  </span>
                                  <span className="text-xs text-slate-400">
                                    {formatTimeAgo(comment.createdAt)}
                                  </span>
                                </div>

                                {isEditing ? (
                                  <div className="mt-3 flex items-center gap-2">
                                    <input
                                      value={editedComment}
                                      onChange={(event) =>
                                        setEditedComment(event.target.value)
                                      }
                                      className="flex-1 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm text-slate-700 outline-none transition focus:border-rose-300"
                                    />
                                    <button
                                      type="button"
                                      onClick={() =>
                                        handleCommentUpdate(comment.commentId)
                                      }
                                      className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-r from-rose-500 to-orange-400 text-white shadow-sm transition hover:brightness-105"
                                    >
                                      <FaCheck />
                                    </button>
                                  </div>
                                ) : (
                                  <>
                                    <p
                                      className={`mt-2 whitespace-pre-wrap break-words text-sm leading-6 text-slate-600 ${
                                        !isExpanded && isCommentLong
                                          ? "line-clamp-3"
                                          : ""
                                      }`}
                                    >
                                      {comment.content || ""}
                                    </p>
                                    {isCommentLong && (
                                      <button
                                        type="button"
                                        onClick={() =>
                                          toggleCommentExpand(comment.commentId)
                                        }
                                        className="mt-2 text-xs font-semibold text-rose-500 transition hover:text-rose-600"
                                      >
                                        {isExpanded ? "접기" : "더 보기"}
                                      </button>
                                    )}
                                  </>
                                )}
                              </div>

                              {isCommentOwner && (
                                <div className="relative">
                                  <button
                                    type="button"
                                    onClick={() =>
                                      setActiveCommentMenuId((previous) =>
                                        previous === comment.commentId
                                          ? null
                                          : comment.commentId
                                      )
                                    }
                                    className="flex h-8 w-8 items-center justify-center rounded-full text-slate-400 transition hover:bg-slate-50 hover:text-slate-600"
                                  >
                                    <FaEllipsisV className="text-xs" />
                                  </button>

                                  {activeCommentMenuId === comment.commentId && (
                                    <div className="absolute right-0 top-9 z-20 flex overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-lg">
                                      <button
                                        type="button"
                                        onClick={() => {
                                          setEditingCommentId(comment.commentId);
                                          setEditedComment(comment.content || "");
                                          setActiveCommentMenuId(null);
                                        }}
                                        className="px-3 py-2 text-slate-600 transition hover:bg-slate-50"
                                      >
                                        <FaEdit />
                                      </button>
                                      <button
                                        type="button"
                                        onClick={() => {
                                          handleCommentDelete(comment.commentId);
                                          setActiveCommentMenuId(null);
                                        }}
                                        className="px-3 py-2 text-rose-600 transition hover:bg-rose-50"
                                      >
                                        <FaTrash />
                                      </button>
                                    </div>
                                  )}
                                </div>
                              )}
                            </div>
                          </div>
                        );
                      })
                    ) : (
                      <div className="rounded-[1.25rem] border border-dashed border-slate-200 bg-white px-5 py-8 text-center">
                        <FaComment className="mx-auto mb-3 text-2xl text-slate-300" />
                        <p className="text-sm text-slate-500">
                          아직 댓글이 없습니다. 첫 댓글을 남겨보세요.
                        </p>
                      </div>
                    )}
                  </div>

                  <form onSubmit={handleLocalCommentSubmit} className="mt-4">
                    <div className="flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 shadow-sm">
                      <input
                        value={newComment}
                        onChange={(event) => setNewComment(event.target.value)}
                        placeholder="댓글을 입력하세요."
                        maxLength={300}
                        className="min-w-0 flex-1 bg-transparent text-sm text-slate-700 outline-none placeholder:text-slate-400"
                      />
                      <span className="hidden text-xs text-slate-300 sm:block">
                        {newComment.length}/300
                      </span>
                      <button
                        type="submit"
                        disabled={!newComment.trim() || isSubmitting}
                        className={`flex h-10 w-10 items-center justify-center rounded-full text-white transition ${
                          newComment.trim() && !isSubmitting
                            ? "bg-gradient-to-r from-rose-500 to-orange-400 shadow-sm hover:brightness-105"
                            : "cursor-not-allowed bg-slate-300"
                        }`}
                      >
                        <FaPaperPlane />
                      </button>
                    </div>
                  </form>
                </section>
              </div>
            )}
          </div>
        </div>
      </div>

      {selectedImage && (
        <div className="fixed inset-0 z-[10000]">
          <ImageModal
            imageUrl={selectedImage}
            onClose={() => setSelectedImage(null)}
          />
        </div>
      )}
    </div>
  );
};

export default FeedDetailModal;
