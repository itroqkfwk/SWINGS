import React, { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion as Motion } from "framer-motion";
import { FaCompass, FaImage, FaLayerGroup, FaPenFancy } from "react-icons/fa";
import useUser from "../hooks/useUser";
import useNewPostForm from "../hooks/useNewPostForm";
import useIntersectionObserver from "../hooks/useIntersectionObserver";
import usePullToRefresh from "../hooks/usePullToRefresh";
import useFeedData from "../hooks/useFeedData";
import CreatePostButton from "../components/CreatePostButton";
import FeedPost from "../components/FeedPost";
import NewPostForm from "../components/NewPostForm";
import ImageModal from "../components/ImageModal";
import LikedUsersModal from "../components/LikedUsersModal";
import ProfileImageUploaderStart from "../../1_user/components/ProfileImageUploaderStart";
import feedApi from "../api/feedApi";
import socialApi from "../api/socialApi";
import {
  DEFAULT_FEED_QUERY_OPTIONS,
  mergeUniqueFeeds,
  processFeed,
  processFeeds,
  replaceFeedById,
} from "../utils/feedUtils";

const FEED_FLOW = ["followings", "all", "mine"];

const FeedPage = () => {
  const { user: currentUser, userId } = useUser();
  const [showNewPostForm, setShowNewPostForm] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [likedUsers, setLikedUsers] = useState([]);
  const [isLikedModalOpen, setIsLikedModalOpen] = useState(false);
  const [feedOrder, setFeedOrder] = useState([]);
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [showProfileUploader, setShowProfileUploader] = useState(false);
  const [imageFile, setImageFile] = useState(null);
  const [isSubmittingPost, setIsSubmittingPost] = useState(false);

  const {
    posts,
    setPosts,
    handleLikeToggle,
    handleDelete,
    handleCommentSubmit,
    handleCommentDelete,
  } = useFeedData(userId, currentUser, null);

  const containerRef = useRef(null);
  const lastPostRef = useRef(null);

  const {
    newPostContent,
    setNewPostContent,
    newPostImage,
    imagePreview,
    handleImageChange,
    clearImage,
    reset,
  } = useNewPostForm();

  const fetchFeedBatch = async (type, user) => {
    if (type === "mine") {
      return processFeeds(await feedApi.getUserFeeds(user.userId));
    }

    const followings = (await socialApi.getFollowings?.(user.userId)) || [];
    const shouldUseFollowingFilter =
      type === "followings" && followings.length > 0;

    return processFeeds(
      await feedApi.getFeeds(user.userId, 0, 10, {
        ...DEFAULT_FEED_QUERY_OPTIONS,
        filter: shouldUseFollowingFilter ? "followings" : "all",
        sort: type === "followings" ? "latest" : "random",
      })
    );
  };

  const buildInitialFeeds = async (order, user) => {
    const [firstBatch, myFeeds] = await Promise.all([
      fetchFeedBatch(order[0], user),
      fetchFeedBatch("mine", user),
    ]);

    return mergeUniqueFeeds(firstBatch, myFeeds);
  };

  useEffect(() => {
    if (!userId || !currentUser) {
      return;
    }

    const init = async () => {
      try {
        const skipped = sessionStorage.getItem("skippedProfileUploader") === "true";
        if (!currentUser.userImg && !skipped) {
          setShowProfileUploader(true);
        }

        const randomizedOrder = [...FEED_FLOW].sort(() => Math.random() - 0.5);
        const initialFeeds = await buildInitialFeeds(randomizedOrder, currentUser);

        setFeedOrder(randomizedOrder);
        setPosts(initialFeeds);
        setStep(1);
      } catch (error) {
        console.error("사용자 정보를 불러오지 못했습니다.", error);
      }
    };

    init();
  }, [currentUser, setPosts, userId]);

  useEffect(() => {
    document.body.style.overflow = showProfileUploader ? "hidden" : "";

    return () => {
      document.body.style.overflow = "";
    };
  }, [showProfileUploader]);

  const loadMoreFeeds = async () => {
    if (loading || !currentUser || step >= feedOrder.length) {
      return;
    }

    setLoading(true);

    try {
      const nextFeeds = await fetchFeedBatch(feedOrder[step], currentUser);
      setPosts((previousPosts) => mergeUniqueFeeds(previousPosts, nextFeeds));
      setStep((previousStep) => previousStep + 1);
    } catch (error) {
      console.error("피드를 추가로 불러오지 못했습니다.", error);
    } finally {
      setLoading(false);
    }
  };

  useIntersectionObserver({
    targetRef: lastPostRef,
    onIntersect: loadMoreFeeds,
    enabled: step < feedOrder.length,
  });

  const { isRefreshing } = usePullToRefresh({
    onRefresh: async () => {
      if (!currentUser) {
        return;
      }

      const refreshedOrder = [...FEED_FLOW];
      const refreshedFeeds = await buildInitialFeeds(refreshedOrder, currentUser);

      setFeedOrder(refreshedOrder);
      setPosts(refreshedFeeds);
      setStep(1);
    },
    targetRef: containerRef,
  });

  const togglePostForm = () => {
    setShowNewPostForm((previous) => !previous);

    if (showNewPostForm) {
      reset();
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!userId) {
      console.error("로그인해야 게시글을 작성할 수 있습니다.");
      return;
    }

    setIsSubmittingPost(true);

    try {
      const formData = new FormData();
      formData.append("userId", userId);
      formData.append("content", newPostContent);

      if (newPostImage) {
        formData.append("file", newPostImage);
      }

      const newPost = await feedApi.uploadFeed(formData);
      setPosts((previousPosts) => [processFeed(newPost), ...previousPosts]);
      reset();
      setShowNewPostForm(false);
    } catch (error) {
      console.error("게시글 업로드에 실패했습니다.", error);
    } finally {
      setIsSubmittingPost(false);
    }
  };

  const handleShowLikedBy = async (feedId) => {
    try {
      const users = await feedApi.getLikedUsers(feedId);
      setLikedUsers(users);
      setIsLikedModalOpen(true);
    } catch (error) {
      console.error("좋아요 목록을 불러오지 못했습니다.", error);
    }
  };

  return (
    <div className="min-h-[calc(100vh-8rem)] bg-slate-50">
      {showProfileUploader ? (
        <div className="fixed inset-0 z-[999] flex items-center justify-center bg-black/40">
          <ProfileImageUploaderStart
            imageFile={imageFile}
            setImageFile={setImageFile}
            initialImage={null}
            onClose={() => {
              sessionStorage.setItem("skippedProfileUploader", "true");
              setShowProfileUploader(false);
            }}
            onComplete={() => {
              sessionStorage.setItem("skippedProfileUploader", "true");
              setShowProfileUploader(false);
            }}
          />
        </div>
      ) : (
        <>
          <CreatePostButton
            onClick={togglePostForm}
            customPosition="bottom-24 right-6"
          />

          {isRefreshing && (
            <div className="py-3 text-center text-sm text-blue-500 animate-pulse">
              피드를 새로고침하는 중입니다...
            </div>
          )}

          <AnimatePresence>
            {showNewPostForm && (
              <Motion.div
                key="new-post-form"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 30 }}
                transition={{ duration: 0.3 }}
                className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 px-4 backdrop-blur-sm"
              >
                <div className="w-full max-w-xl">
                  <NewPostForm
                    newPostContent={newPostContent}
                    setNewPostContent={setNewPostContent}
                    handleImageChange={handleImageChange}
                    imagePreview={imagePreview}
                    handleSubmit={handleSubmit}
                    setShowNewPostForm={() => {
                      setShowNewPostForm(false);
                      reset();
                    }}
                    clearSelectedImage={clearImage}
                    isSubmitting={isSubmittingPost}
                  />
                </div>
              </Motion.div>
            )}
          </AnimatePresence>

          <div
            ref={containerRef}
            className="mx-auto grid w-full max-w-[1400px] gap-6 px-4 py-4 md:px-6 lg:grid-cols-[minmax(0,1fr)_300px] lg:px-8"
          >
            <section className="min-w-0">
              <div className="mb-5 rounded-[2rem] border border-slate-200 bg-white px-5 py-5 shadow-[0_18px_50px_rgba(15,23,42,0.06)]">
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-pink-500">
                  Swings Feed
                </p>
                <div className="mt-3 flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
                  <div>
                    <h1 className="text-2xl font-black text-slate-900 sm:text-3xl">
                      지금 올라오는 골프 피드
                    </h1>
                    <p className="mt-2 text-sm leading-6 text-slate-500">
                      내 피드, 팔로잉 피드, 전체 피드를 섞어서 더 먼저 보고 싶은 흐름으로 구성했습니다.
                    </p>
                  </div>

                  <div className="flex flex-wrap gap-2 text-xs font-semibold text-slate-500">
                    <span className="rounded-full bg-slate-100 px-3 py-2">
                      게시글 {posts.length}개
                    </span>
                    <span className="rounded-full bg-rose-50 px-3 py-2 text-rose-500">
                      내 피드 우선 포함
                    </span>
                  </div>
                </div>
              </div>

              <div className="space-y-4 pb-24">
                {loading && (
                  <div className="py-8 text-center text-sm text-gray-500">
                    피드를 불러오는 중입니다...
                  </div>
                )}

                {!loading && posts.length === 0 && (
                  <div className="flex min-h-[calc(100vh-16rem)] items-center justify-center">
                    <div className="w-full max-w-xl rounded-3xl border border-gray-100 bg-white px-6 py-12 text-center shadow-sm">
                      <p className="text-lg font-semibold text-slate-700">
                        아직 표시할 피드가 없습니다.
                      </p>
                      <p className="mt-3 text-sm text-slate-400">
                        첫 게시글을 올리거나 다른 사용자와 연결을 시작해보세요.
                      </p>
                    </div>
                  </div>
                )}

                {posts.map((post, index) => (
                  <Motion.div
                    key={post.feedId}
                    ref={index === posts.length - 1 ? lastPostRef : null}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.35, delay: index * 0.04 }}
                  >
                    <FeedPost
                      post={post}
                      currentUser={currentUser}
                      onImageClick={setSelectedImage}
                      onLike={() => handleLikeToggle(post.feedId, false)}
                      onUnlike={() => handleLikeToggle(post.feedId, true)}
                      onToggleComments={(feedId) => {
                        setPosts((previousPosts) =>
                          previousPosts.map((currentPost) =>
                            currentPost.feedId === feedId
                              ? {
                                  ...currentPost,
                                  showComments: !currentPost.showComments,
                                }
                              : currentPost
                          )
                        );
                      }}
                      onCommentSubmit={handleCommentSubmit}
                      onCommentDelete={(commentId) =>
                        handleCommentDelete(post.feedId, commentId)
                      }
                      onDelete={() => handleDelete(post.feedId)}
                      onShowLikedBy={handleShowLikedBy}
                      updatePostInState={(updatedPost) =>
                        setPosts((previousPosts) =>
                          replaceFeedById(previousPosts, updatedPost)
                        )
                      }
                    />
                  </Motion.div>
                ))}
              </div>
            </section>

            <aside className="hidden lg:block">
              <div className="sticky top-24 space-y-4">
                <div className="rounded-[2rem] border border-slate-200 bg-white p-5 shadow-[0_18px_50px_rgba(15,23,42,0.06)]">
                  <div className="flex items-center gap-3">
                    <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-rose-50 text-rose-500">
                      <FaPenFancy />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-slate-900">새 글 올리기</p>
                      <p className="text-xs text-slate-500">
                        오늘 라운드 분위기나 사진을 바로 공유해보세요.
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={togglePostForm}
                    className="mt-4 w-full rounded-2xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
                  >
                    글쓰기 열기
                  </button>
                </div>

                <div className="rounded-[2rem] border border-slate-200 bg-white p-5 shadow-[0_18px_50px_rgba(15,23,42,0.06)]">
                  <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-400">
                    Feed Mix
                  </p>
                  <div className="mt-4 space-y-3">
                    <div className="flex items-center gap-3 rounded-2xl bg-slate-50 px-4 py-3">
                      <FaLayerGroup className="text-slate-500" />
                      <div>
                        <p className="text-sm font-semibold text-slate-800">내 피드 포함</p>
                        <p className="text-xs text-slate-500">
                          새로고침해도 내 게시글이 먼저 보이도록 구성했습니다.
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 rounded-2xl bg-slate-50 px-4 py-3">
                      <FaCompass className="text-pink-500" />
                      <div>
                        <p className="text-sm font-semibold text-slate-800">팔로잉 우선</p>
                        <p className="text-xs text-slate-500">
                          연결된 사용자의 소식을 먼저 확인할 수 있습니다.
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 rounded-2xl bg-slate-50 px-4 py-3">
                      <FaImage className="text-sky-500" />
                      <div>
                        <p className="text-sm font-semibold text-slate-800">이미지 중심</p>
                        <p className="text-xs text-slate-500">
                          사진과 캡션이 잘 보이도록 카드 비율을 조정했습니다.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </aside>
          </div>

          {selectedImage && (
            <ImageModal
              imageUrl={selectedImage}
              onClose={() => setSelectedImage(null)}
            />
          )}

          {isLikedModalOpen && (
            <LikedUsersModal
              users={likedUsers}
              onClose={() => setIsLikedModalOpen(false)}
            />
          )}
        </>
      )}
    </div>
  );
};

export default FeedPage;
