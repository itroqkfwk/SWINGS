import React, { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useNavigate, useParams } from "react-router-dom";
import CreatePostButton from "../components/CreatePostButton";
import DeleteConfirmModal from "../components/DeleteConfirmModal";
import FeedDetailModal from "../components/FeedDetailModal";
import FollowListModal from "../components/FollowListModal";
import ImageModal from "../components/ImageModal";
import LikedUsersModal from "../components/LikedUsersModal";
import NewPostForm from "../components/NewPostForm";
import SocialProfile from "../components/SocialProfile";
import feedApi from "../api/feedApi";
import socialApi from "../api/socialApi";
import useFeedData from "../hooks/useFeedData";
import useNewPostForm from "../hooks/useNewPostForm";
import useProfileData from "../hooks/useProfileData";
import { processFeed, replaceFeedById } from "../utils/feedUtils";

const SocialPage = () => {
  const { userId: paramUserId } = useParams();
  const navigate = useNavigate();

  const [currentUser, setCurrentUser] = useState(null);
  const [viewedUserId, setViewedUserId] = useState(
    paramUserId ? Number(paramUserId) : null
  );
  const [selectedFeed, setSelectedFeed] = useState(null);
  const [selectedImage, setSelectedImage] = useState(null);
  const [showFollowersList, setShowFollowersList] = useState(false);
  const [showFollowingList, setShowFollowingList] = useState(false);
  const [likedByUsers, setLikedByUsers] = useState([]);
  const [showLikedByModal, setShowLikedByModal] = useState(false);
  const [showNewPostForm, setShowNewPostForm] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteTargetFeedId, setDeleteTargetFeedId] = useState(null);
  const [isSubmittingPost, setIsSubmittingPost] = useState(false);

  const {
    profile,
    introduce,
    isFollowing,
    stats,
    followers,
    followings,
    refreshProfileData,
    setIntroduce,
  } = useProfileData(viewedUserId, currentUser);

  const {
    posts: feeds,
    setPosts: setFeeds,
    refreshFeeds,
    handleLikeToggle,
    handleDelete,
    handleCommentSubmit,
    handleCommentDelete,
  } = useFeedData(viewedUserId, currentUser, setSelectedFeed);

  const {
    newPostContent,
    setNewPostContent,
    newPostImage,
    imagePreview,
    handleImageChange,
    clearImage,
    reset,
  } = useNewPostForm();

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const user = await socialApi.getCurrentUser();
        setCurrentUser(user);
      } catch (error) {
        console.error("현재 사용자 조회 실패:", error);
      }
    };

    fetchUser();
  }, []);

  useEffect(() => {
    if (paramUserId || currentUser) {
      setViewedUserId(paramUserId ? Number(paramUserId) : currentUser?.userId);
    }
  }, [paramUserId, currentUser]);

  useEffect(() => {
    if (!currentUser || !viewedUserId) return;
    refreshProfileData();
    refreshFeeds();
  }, [currentUser, viewedUserId]);

  const isCurrentUserProfile = currentUser?.userId === viewedUserId;

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!currentUser?.userId) return;

    setIsSubmittingPost(true);

    try {
      const formData = new FormData();
      formData.append("userId", currentUser.userId);
      formData.append("content", newPostContent);

      if (newPostImage) {
        formData.append("file", newPostImage);
      }

      const createdFeed = await feedApi.uploadFeed(formData);
      setFeeds((previousFeeds) => [processFeed(createdFeed), ...previousFeeds]);
      setShowNewPostForm(false);
      reset();
    } catch (error) {
      console.error("게시물 업로드 실패:", error);
    } finally {
      setIsSubmittingPost(false);
    }
  };

  const handleShowLikedBy = async (feedId) => {
    try {
      const users = await feedApi.getLikedUsers(feedId);
      setLikedByUsers(users);
      setShowLikedByModal(true);
    } catch (error) {
      console.error("좋아요 목록 불러오기 실패:", error);
    }
  };

  const handleFeedClick = (feed) => {
    setSelectedFeed(processFeed(feed));
  };

  const handleFeedDelete = async (feedId) => {
    try {
      await handleDelete(feedId);
      setSelectedFeed(null);
      setFeeds((previousFeeds) =>
        previousFeeds.filter((feed) => feed.feedId !== feedId)
      );
    } catch (error) {
      console.error("게시물 삭제 실패:", error);
    }
  };

  return (
    <div className="min-h-screen px-4 py-4 sm:px-6 lg:px-8">
      <ToastContainer position="bottom-right" />

      <div className="mx-auto max-w-[1280px]">
        <SocialProfile
          user={profile}
          userStats={stats}
          userIntroduce={introduce}
          setIntroduce={setIntroduce}
          isCurrentUser={isCurrentUserProfile}
          currentUser={currentUser}
          onRequestCharge={() => navigate("/swings/points")}
          isFollowing={isFollowing}
          onFollowToggle={async () => {
            if (!currentUser?.userId || !profile?.userId) return;

            try {
              if (isFollowing) {
                await socialApi.unfollowUser(currentUser.userId, profile.userId);
              } else {
                await socialApi.followUser(currentUser.userId, profile.userId);
              }

              await refreshProfileData();
            } catch (error) {
              console.error("팔로우 처리 실패:", error);
            }
          }}
          onShowFollowers={() => setShowFollowersList(true)}
          onShowFollowing={() => setShowFollowingList(true)}
          feeds={feeds}
          onFeedClick={handleFeedClick}
          refreshProfileData={refreshProfileData}
        />
      </div>

      {showFollowersList && (
        <FollowListModal
          users={followers}
          onClose={() => setShowFollowersList(false)}
          title="팔로워"
        />
      )}

      {showFollowingList && (
        <FollowListModal
          users={followings}
          onClose={() => setShowFollowingList(false)}
          title="팔로잉"
        />
      )}

      {showLikedByModal && (
        <LikedUsersModal
          users={likedByUsers}
          onClose={() => setShowLikedByModal(false)}
        />
      )}

      {selectedFeed && (
        <FeedDetailModal
          feed={selectedFeed}
          currentUser={currentUser}
          onClose={() => setSelectedFeed(null)}
          onLikeToggle={handleLikeToggle}
          onRequestDelete={(feedId) => {
            setDeleteTargetFeedId(feedId);
            setShowDeleteModal(true);
          }}
          onShowLikedBy={handleShowLikedBy}
          onCommentSubmit={handleCommentSubmit}
          onCommentDelete={handleCommentDelete}
          setSelectedFeed={setSelectedFeed}
          updateFeedInState={(updatedFeed) => {
            setFeeds((previousFeeds) =>
              replaceFeedById(previousFeeds, updatedFeed)
            );
          }}
        />
      )}

      {showDeleteModal && (
        <DeleteConfirmModal
          visible
          onCancel={() => {
            setShowDeleteModal(false);
            setDeleteTargetFeedId(null);
          }}
          onConfirm={async () => {
            if (!deleteTargetFeedId) return;
            await handleFeedDelete(deleteTargetFeedId);
            setDeleteTargetFeedId(null);
            setShowDeleteModal(false);
          }}
        />
      )}

      {selectedImage && (
        <ImageModal
          imageUrl={selectedImage}
          onClose={() => setSelectedImage(null)}
        />
      )}

      {isCurrentUserProfile && (
        <CreatePostButton
          onClick={() => setShowNewPostForm(true)}
          customPosition="bottom-24 right-5 sm:right-7 xl:right-10"
        />
      )}

      <AnimatePresence>
        {showNewPostForm && (
          <motion.div
            key="new-post-form"
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 24 }}
            transition={{ duration: 0.25 }}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/40 px-4 backdrop-blur-sm"
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
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default SocialPage;
