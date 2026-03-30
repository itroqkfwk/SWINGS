import React, { useEffect, useMemo, useState } from "react";
import {
  FaCheck,
  FaComment,
  FaEdit,
  FaEllipsisV,
  FaImage,
  FaPaperPlane,
  FaTimes,
  FaTrash,
  FaUser,
} from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import feedApi from "../api/feedApi";
import { normalizeImageUrl } from "../utils/imageUtils";
import DeleteConfirmModal from "./DeleteConfirmModal";
import LikeButton from "./LikeButton";

const CAPTION_COLLAPSE_LENGTH = 140;
const COMMENT_COLLAPSE_LENGTH = 110;

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

const FeedPost = ({
  post,
  onLike,
  onUnlike,
  currentUser,
  onDelete,
  onToggleComments,
  onCommentDelete,
  onCommentSubmit,
  onImageClick,
  onShowLikedBy,
  likeLoading = {},
  updatePostInState,
}) => {
  const navigate = useNavigate();

  const [newComment, setNewComment] = useState("");
  const [expandedCaption, setExpandedCaption] = useState(false);
  const [expandedCommentIds, setExpandedCommentIds] = useState([]);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showPostMenu, setShowPostMenu] = useState(false);
  const [editingCommentId, setEditingCommentId] = useState(null);
  const [editedComment, setEditedComment] = useState("");
  const [activeCommentMenuId, setActiveCommentMenuId] = useState(null);
  const [isEditingPost, setIsEditingPost] = useState(false);
  const [editedCaption, setEditedCaption] = useState(post.caption || "");
  const [editedFile, setEditedFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(
    post.image || post.imageUrl
      ? normalizeImageUrl(post.image || post.imageUrl)
      : null
  );

  const sortedComments = useMemo(
    () =>
      [...(post.comments || [])].sort(
        (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
      ),
    [post.comments]
  );

  const currentUserId = currentUser?.userId?.toString();
  const postOwnerId = post?.userId?.toString();
  const hasImage = Boolean(post.image || post.imageUrl);
  const normalizedImageUrl = hasImage
    ? normalizeImageUrl(post.image || post.imageUrl)
    : null;
  const canManagePost = currentUserId && currentUserId === postOwnerId;
  const isCaptionLong = (post.caption || "").length > CAPTION_COLLAPSE_LENGTH;

  useEffect(() => {
    setEditedCaption(post.caption || "");
    setImagePreview(
      post.image || post.imageUrl
        ? normalizeImageUrl(post.image || post.imageUrl)
        : null
    );
    setEditedFile(null);
  }, [post.caption, post.image, post.imageUrl]);

  const handleProfileClick = () => {
    if (post.userId) {
      navigate(`/swings/profile/${post.userId}`);
    }
  };

  const handleLocalCommentSubmit = async (event) => {
    event.preventDefault();

    if (!newComment.trim()) return;

    await onCommentSubmit(post.feedId, newComment);
    setNewComment("");
  };

  const handlePostDelete = () => {
    onDelete(post.feedId);
    setShowDeleteConfirm(false);
  };

  const toggleCommentExpand = (commentId) => {
    setExpandedCommentIds((previousIds) =>
      previousIds.includes(commentId)
        ? previousIds.filter((id) => id !== commentId)
        : [...previousIds, commentId]
    );
  };

  const handleEditImageChange = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setEditedFile(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const clearImagePreview = () => {
    const input = document.getElementById(`image-upload-${post.feedId}`);
    if (input) {
      input.value = "";
    }

    setEditedFile(null);
    setImagePreview(null);
  };

  const handlePostUpdate = async (event) => {
    event.preventDefault();

    try {
      const updatedFeed = await feedApi.updateFeed(post.feedId, {
        caption: editedCaption,
        file: editedFile,
      });

      updatePostInState(updatedFeed);
      setIsEditingPost(false);
      setShowPostMenu(false);
    } catch (error) {
      console.error("게시글 수정 실패:", error);
    }
  };

  const handleCommentUpdate = async (commentId) => {
    if (!editedComment.trim()) return;

    try {
      const updatedComment = await feedApi.updateComment(
        post.feedId,
        commentId,
        editedComment
      );

      updatePostInState({
        ...post,
        comments: (post.comments || []).map((comment) =>
          comment.commentId === commentId ? updatedComment : comment
        ),
      });

      setEditingCommentId(null);
      setEditedComment("");
      setActiveCommentMenuId(null);
    } catch (error) {
      console.error("댓글 수정 실패:", error);
    }
  };

  return (
    <article className="mx-auto w-full max-w-3xl overflow-hidden rounded-[2rem] border border-white/70 bg-white/90 shadow-[0_22px_60px_rgba(15,23,42,0.10)] backdrop-blur">
      <header className="flex items-center justify-between gap-3 border-b border-slate-100 px-4 py-4 sm:px-6">
        <button
          type="button"
          onClick={handleProfileClick}
          className="flex min-w-0 items-center gap-3 text-left"
        >
          <div className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-full bg-gradient-to-br from-rose-100 to-amber-100 ring-1 ring-slate-200">
            {post.userProfilePic ? (
              <img
                src={normalizeImageUrl(post.userProfilePic)}
                alt={`${post.username || "사용자"} 프로필`}
                className="h-full w-full object-cover"
              />
            ) : (
              <FaUser className="text-slate-500" />
            )}
          </div>
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-slate-900 sm:text-base">
              {post.username || "사용자"}
            </p>
            <p className="mt-0.5 text-xs text-slate-400 sm:text-sm">
              {formatTimeAgo(post.createdAt)}
            </p>
          </div>
        </button>

        {canManagePost && (
          <div className="relative">
            <button
              type="button"
              onClick={() => setShowPostMenu((previous) => !previous)}
              className="flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 bg-slate-50 text-slate-500 transition hover:border-slate-300 hover:bg-slate-100 hover:text-slate-700"
              aria-label="게시글 메뉴"
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
                    setShowDeleteConfirm(true);
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

      <DeleteConfirmModal
        visible={showDeleteConfirm}
        onCancel={() => setShowDeleteConfirm(false)}
        onConfirm={handlePostDelete}
      />

      {isEditingPost ? (
        <div className="space-y-4 px-4 py-5 sm:px-6">
          <form onSubmit={handlePostUpdate} className="space-y-4">
            <div className="flex items-center justify-between rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
              <label
                htmlFor={`image-upload-${post.feedId}`}
                className="flex cursor-pointer items-center gap-2 text-sm font-semibold text-slate-700"
              >
                <FaImage className="text-rose-500" />
                이미지 변경
              </label>
              <input
                id={`image-upload-${post.feedId}`}
                type="file"
                accept="image/*"
                onChange={handleEditImageChange}
                className="hidden"
              />
            </div>

            {imagePreview && (
              <div className="relative overflow-hidden rounded-[1.5rem] border border-slate-200 bg-slate-50">
                <img
                  src={imagePreview}
                  alt="수정 미리보기"
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
                className="min-h-36 w-full resize-none border-0 bg-transparent px-1 py-1 text-sm leading-6 text-slate-800 outline-none placeholder:text-slate-400"
              />
              <div className="mt-2 text-right text-xs text-slate-400">
                {editedCaption.length}/500
              </div>
            </div>

            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setIsEditingPost(false)}
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
        <>
          {hasImage ? (
            <button
              type="button"
              onClick={() => onImageClick(normalizedImageUrl)}
              className="block w-full overflow-hidden bg-slate-100"
            >
              <img
                src={normalizedImageUrl}
                alt="게시글 이미지"
                className="h-[18rem] w-full object-cover sm:h-[24rem] lg:h-[28rem]"
              />
            </button>
          ) : null}

          <div className="px-4 py-5 sm:px-6">
            <div
              className={`rounded-[1.5rem] border border-slate-100 bg-gradient-to-br from-white to-slate-50 px-5 py-4 ${
                !hasImage ? "min-h-[12rem] sm:min-h-[14rem]" : ""
              }`}
            >
              <p
                className={`whitespace-pre-wrap break-words text-[15px] leading-7 text-slate-700 sm:text-base ${
                  !expandedCaption && isCaptionLong ? "line-clamp-3" : ""
                }`}
              >
                {post.caption?.trim() || "아직 작성된 소개가 없습니다."}
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
            </div>
          </div>
        </>
      )}

      <div className="border-t border-slate-100 bg-white px-4 py-4 sm:px-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <LikeButton
                liked={post.liked}
                likeCount={post.likes}
                onLike={async () => {
                  const updated = await onLike(post.feedId);
                  if (updated && updatePostInState) {
                    updatePostInState(updated);
                  }
                }}
                onUnlike={async () => {
                  const updated = await onUnlike(post.feedId);
                  if (updated && updatePostInState) {
                    updatePostInState(updated);
                  }
                }}
                isLoading={likeLoading[post.feedId]}
                showCount={false}
              />
              <button
                type="button"
                onClick={() => onShowLikedBy(post.feedId)}
                className={`text-sm font-semibold transition ${
                  post.likes > 0
                    ? "text-rose-500 hover:text-rose-600"
                    : "text-slate-400 hover:text-slate-500"
                }`}
              >
                좋아요 {post.likes || 0}
              </button>
            </div>

            <button
              type="button"
              onClick={() => onToggleComments(post.feedId)}
              className="flex items-center gap-2 text-sm font-medium text-slate-500 transition hover:text-slate-700"
            >
              <FaComment />
              댓글 {post.comments?.length || 0}
            </button>
          </div>

          <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-500">
            피드 #{post.feedId}
          </span>
        </div>
      </div>

      {post.showComments && (
        <section className="border-t border-slate-100 bg-slate-50/80 px-4 py-5 sm:px-6">
          <div className="rounded-[1.75rem] border border-white/80 bg-white/90 p-4 shadow-[0_12px_35px_rgba(15,23,42,0.06)] sm:p-5">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-sm font-semibold text-slate-800 sm:text-base">
                댓글 {sortedComments.length}
              </h3>
              <button
                type="button"
                onClick={() => onToggleComments(post.feedId)}
                className="text-xs font-medium text-slate-400 transition hover:text-slate-600"
              >
                닫기
              </button>
            </div>

            <div className="space-y-3">
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
                    (comment?.content || "").length > COMMENT_COLLAPSE_LENGTH;

                  return (
                    <div
                      key={comment.commentId}
                      className="rounded-[1.25rem] border border-slate-100 bg-slate-50 px-4 py-3"
                    >
                      <div className="flex items-start gap-3">
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-full bg-white ring-1 ring-slate-200">
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
                                    ? "line-clamp-2"
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
                              className="flex h-8 w-8 items-center justify-center rounded-full text-slate-400 transition hover:bg-white hover:text-slate-600"
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
                                    onCommentDelete(
                                      comment.commentId,
                                      post.feedId
                                    );
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
                <div className="rounded-[1.25rem] border border-dashed border-slate-200 bg-slate-50 px-5 py-8 text-center">
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
                  type="text"
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
                  disabled={!newComment.trim()}
                  className={`flex h-10 w-10 items-center justify-center rounded-full text-white transition ${
                    newComment.trim()
                      ? "bg-gradient-to-r from-rose-500 to-orange-400 shadow-sm hover:brightness-105"
                      : "cursor-not-allowed bg-slate-300"
                  }`}
                >
                  <FaPaperPlane />
                </button>
              </div>
            </form>
          </div>
        </section>
      )}
    </article>
  );
};

export default FeedPost;
