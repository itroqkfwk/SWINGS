import React, { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
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

const FeedPage = () => {
  const { userId } = useUser();
  const [currentUser, setCurrentUser] = useState(null);
  const [showNewPostForm, setShowNewPostForm] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [likedUsers, setLikedUsers] = useState([]);
  const [isLikedModalOpen, setIsLikedModalOpen] = useState(false);
  const [feedOrder, setFeedOrder] = useState([]);
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [showProfileUploader, setShowProfileUploader] = useState(false);
  const [imageFile, setImageFile] = useState(null);

  const {
    posts,
    setPosts,
    handleLikeToggle,
    handleDelete,
    handleCommentSubmit,
    handleCommentDelete,
  } = useFeedData(userId, currentUser, null);

  const formRef = useRef(null);
  const containerRef = useRef(null);
  const lastPostRef = useRef(null);

  const {
    newPostContent,
    setNewPostContent,
    imagePreview,
    handleImageChange,
    reset,
  } = useNewPostForm();

  useEffect(() => {
    if (!userId) {
      return;
    }

    const init = async () => {
      try {
        const user = await feedApi.getCurrentUser();
        setCurrentUser(user);

        if (!user.userImg) {
          setShowProfileUploader(true);
          return;
        }

        setPosts([]);
        const order = ["followings", "all", "mine"].sort(
          () => Math.random() - 0.5
        );
        setFeedOrder(order);
        setStep(0);
        await loadFeeds(order[0], user);
      } catch {
        console.error("사용자 정보를 불러오지 못했습니다.");
      }
    };

    init();
  }, [userId]);

  useEffect(() => {
    document.body.style.overflow = showProfileUploader ? "hidden" : "";

    return () => {
      document.body.style.overflow = "";
    };
  }, [showProfileUploader]);

  const loadFeeds = async (type, user) => {
    setLoading(true);

    try {
      let newFeeds = [];

      if (type === "mine") {
        newFeeds = await feedApi.getUserFeeds(user.userId);
      } else {
        const followings = (await socialApi.getFollowings?.(user.userId)) || [];
        const filter =
          type === "followings" && followings.length > 0 ? "followings" : "all";
        const sort = type === "followings" ? "latest" : "random";

        newFeeds = await feedApi.getFeeds(user.userId, 0, 10, {
          sort,
          filter,
        });
      }

      setPosts((prev) => {
        const existingIds = new Set(prev.map((post) => post.feedId));
        const uniqueNewFeeds = newFeeds.filter(
          (feed) => !existingIds.has(feed.feedId)
        );
        return [...prev, ...uniqueNewFeeds];
      });
    } catch {
      console.error("피드를 불러오지 못했습니다.");
    } finally {
      setLoading(false);
    }
  };

  const loadMoreFeeds = async () => {
    if (loading || !currentUser || step >= feedOrder.length) {
      return;
    }

    setLoading(true);

    try {
      const previousLength = posts.length;

      await loadFeeds(feedOrder[step], currentUser);

      const isSameLength = posts.length === previousLength;
      if (isSameLength && step < feedOrder.length - 1) {
        setStep((prev) => prev + 1);
        await loadFeeds(feedOrder[step + 1], currentUser);
      }
    } catch (error) {
      console.error("피드 추가 로딩에 실패했습니다.", error);
    } finally {
      setStep((prev) => prev + 1);
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

      const order = ["followings", "all", "mine"];
      setFeedOrder(order);
      setStep(0);
      setPosts([]);
      await loadFeeds(order[0], currentUser);
    },
    targetRef: containerRef,
  });

  const togglePostForm = () => {
    setShowNewPostForm((prev) => !prev);
    if (showNewPostForm) {
      reset();
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!userId) {
      console.error("로그인 후 게시글을 작성할 수 있습니다.");
      return;
    }

    const formData = new FormData();
    formData.append("userId", userId);
    formData.append("content", newPostContent);

    if (selectedImage) {
      formData.append("file", selectedImage);
    }

    try {
      const newPost = await feedApi.uploadFeed(formData);
      setPosts((prev) => [newPost, ...prev]);
      reset();
      setSelectedImage(null);
      setShowNewPostForm(false);
    } catch {
      console.error("게시글 업로드에 실패했습니다.");
    }
  };

  const handleShowLikedBy = async (feedId) => {
    try {
      const users = await feedApi.getLikedUsers(feedId);
      setLikedUsers(users);
      setIsLikedModalOpen(true);
    } catch {
      console.error("좋아요 목록을 불러오지 못했습니다.");
    }
  };

  return (
    <div className="min-h-[calc(100vh-8rem)] bg-white">
      {showProfileUploader ? (
        <div className="fixed inset-0 z-[999] flex items-center justify-center bg-black/40">
          <ProfileImageUploaderStart
            imageFile={imageFile}
            setImageFile={setImageFile}
            initialImage={null}
            onClose={() => window.location.reload()}
            onComplete={() => window.location.reload()}
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
              <motion.div
                key="new-post-form"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 30 }}
                transition={{ duration: 0.3 }}
                className="fixed inset-0 z-50 flex items-center justify-center bg-transparent"
              >
                <div ref={formRef} className="w-[90vw] max-w-md px-4">
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
                    selectedImage={selectedImage}
                    setSelectedImage={setSelectedImage}
                  />
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <div
            ref={containerRef}
            className="w-full px-4 py-4 md:px-6 lg:px-8 xl:px-10"
          >
            <div className="space-y-4 pb-24">
              {loading && (
                <div className="py-8 text-center text-sm text-gray-500">
                  피드를 불러오는 중입니다...
                </div>
              )}

              {!loading && posts.length === 0 && (
                <div className="flex min-h-[calc(100vh-14rem)] items-center justify-center">
                  <div className="w-full max-w-xl rounded-3xl border border-gray-100 bg-slate-50 px-6 py-12 text-center shadow-sm">
                    <p className="text-lg font-semibold text-slate-700">
                      표시할 피드가 없습니다.
                    </p>
                    <p className="mt-3 text-sm text-slate-400">
                      첫 게시글을 작성하거나 다른 사용자와 연결을 시작해보세요.
                    </p>
                  </div>
                </div>
              )}

              {posts.map((post, index) => (
                <motion.div
                  key={post.feedId}
                  ref={index === posts.length - 1 ? lastPostRef : null}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: index * 0.05 }}
                >
                  <FeedPost
                    post={post}
                    currentUser={currentUser}
                    onImageClick={setSelectedImage}
                    onLike={() => handleLikeToggle(post.feedId, false)}
                    onUnlike={() => handleLikeToggle(post.feedId, true)}
                    onToggleComments={(feedId) => {
                      setPosts((prev) =>
                        prev.map((currentPost) =>
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
                      setPosts((prev) =>
                        prev.map((currentPost) =>
                          currentPost.feedId === updatedPost.feedId
                            ? updatedPost
                            : currentPost
                        )
                      )
                    }
                  />
                </motion.div>
              ))}
            </div>
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
