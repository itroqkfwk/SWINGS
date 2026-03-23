export const ANONYMOUS_USERNAME = "익명";

export const DEFAULT_FEED_QUERY_OPTIONS = {
  sort: "latest",
  filter: "all",
};

export const normalizeComment = (comment = {}) => ({
  ...comment,
  username: comment.username ?? ANONYMOUS_USERNAME,
  userProfilePic: comment.userProfilePic ?? null,
  content: comment.content ?? "",
});

export const processFeed = (feed = {}) => ({
  ...feed,
  liked: Boolean(feed.liked),
  likes: feed.likes ?? feed.likeCount ?? 0,
  comments: (feed.comments ?? []).filter(Boolean).map(normalizeComment),
  username: feed.username ?? ANONYMOUS_USERNAME,
  userProfilePic: feed.userProfilePic ?? null,
});

export const processFeeds = (feeds = []) => feeds.filter(Boolean).map(processFeed);

export const replaceFeedById = (feeds = [], nextFeed) =>
  feeds.map((feed) => (feed.feedId === nextFeed.feedId ? processFeed(nextFeed) : feed));

export const mergeUniqueFeeds = (currentFeeds = [], incomingFeeds = []) => {
  const seenFeedIds = new Set(currentFeeds.map((feed) => feed.feedId));
  const uniqueIncomingFeeds = processFeeds(incomingFeeds).filter(
    (feed) => !seenFeedIds.has(feed.feedId)
  );

  return [...currentFeeds, ...uniqueIncomingFeeds];
};

export const appendCommentToFeed = (feeds = [], feedId, comment) =>
  feeds.map((feed) =>
    feed.feedId === feedId
      ? {
          ...feed,
          comments: [...(feed.comments ?? []), normalizeComment(comment)],
        }
      : feed
  );

export const removeCommentFromFeed = (feeds = [], feedId, commentId) =>
  feeds.map((feed) =>
    feed.feedId === feedId
      ? {
          ...feed,
          comments: (feed.comments ?? []).filter(
            (comment) => comment?.commentId !== commentId
          ),
        }
      : feed
  );
