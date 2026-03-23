import { useState } from "react";
import feedApi from "../api/feedApi";
import {
  appendCommentToFeed,
  normalizeComment,
  processFeed,
  processFeeds,
  removeCommentFromFeed,
  replaceFeedById,
} from "../utils/feedUtils";

const useFeedData = (viewedUserId, currentUser, setSelectedFeed) => {
  const [posts, setPosts] = useState([]);

  const syncSelectedFeed = (updater) => {
    if (!setSelectedFeed) {
      return;
    }

    setSelectedFeed((previousFeed) => {
      if (!previousFeed) {
        return previousFeed;
      }

      return updater(previousFeed);
    });
  };

  const refreshFeeds = async () => {
    if (!viewedUserId) {
      return;
    }

    try {
      const feeds = await feedApi.getUserFeeds(viewedUserId);
      setPosts(processFeeds(feeds));
    } catch (error) {
      console.error("피드를 불러오지 못했습니다.", error);
    }
  };

  const handleLikeToggle = async (feedId, isLiked) => {
    try {
      const updatedFeed = isLiked
        ? await feedApi.unlikeFeed(feedId, currentUser?.userId)
        : await feedApi.likeFeed(feedId, currentUser?.userId);

      if (!updatedFeed) {
        return null;
      }

      const normalizedFeed = processFeed(updatedFeed);

      setPosts((previousPosts) => replaceFeedById(previousPosts, normalizedFeed));
      syncSelectedFeed((previousFeed) =>
        previousFeed.feedId === feedId ? normalizedFeed : previousFeed
      );

      return normalizedFeed;
    } catch (error) {
      console.error("좋아요 처리 실패:", error);
      return null;
    }
  };

  const handleDelete = async (feedId) => {
    try {
      await feedApi.deleteFeed(feedId);
      setPosts((previousPosts) =>
        previousPosts.filter((post) => post.feedId !== feedId)
      );
      syncSelectedFeed((previousFeed) =>
        previousFeed.feedId === feedId ? null : previousFeed
      );
    } catch (error) {
      console.error("게시물 삭제 실패:", error);
    }
  };

  const handleCommentSubmit = async (feedId, content) => {
    try {
      const newComment = await feedApi.addComment(
        feedId,
        currentUser?.userId,
        content
      );

      setPosts((previousPosts) =>
        appendCommentToFeed(previousPosts, feedId, newComment)
      );
      syncSelectedFeed((previousFeed) =>
        previousFeed.feedId === feedId
          ? {
              ...previousFeed,
              comments: [
                ...(previousFeed.comments ?? []),
                normalizeComment(newComment),
              ],
            }
          : previousFeed
      );

      return newComment;
    } catch (error) {
      console.error("댓글 추가 실패:", error);
      return null;
    }
  };

  const handleCommentDelete = async (feedId, commentId) => {
    try {
      await feedApi.deleteComment(feedId, commentId);

      setPosts((previousPosts) =>
        removeCommentFromFeed(previousPosts, feedId, commentId)
      );
      syncSelectedFeed((previousFeed) =>
        previousFeed.feedId === feedId
          ? {
              ...previousFeed,
              comments: (previousFeed.comments ?? []).filter(
                (comment) => comment?.commentId !== commentId
              ),
            }
          : previousFeed
      );
    } catch (error) {
      console.error("댓글 삭제 실패:", error);
    }
  };

  return {
    posts,
    setPosts,
    refreshFeeds,
    handleLikeToggle,
    handleDelete,
    handleCommentSubmit,
    handleCommentDelete,
  };
};

export default useFeedData;
