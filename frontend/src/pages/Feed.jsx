import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchFeed,
  toggleLike,
  addComment,
  createPost,
} from "../store/postsSlice";
import { Card, CardContent } from "../components/ui/Card";
import { Button } from "../components/ui/Button";
import { Input } from "../components/ui/Input";
import { MessageSquare, Heart, Plus, Send } from "lucide-react";

function Feed() {
  const dispatch = useDispatch();
  const { feed, isLoading, error } = useSelector((state) => state.posts);
  const { user } = useSelector((state) => state.auth);

  const [newPostContent, setNewPostContent] = useState("");
  const [commentContent, setCommentContent] = useState("");
  const [activeCommentPost, setActiveCommentPost] = useState(null);
  const [showComments, setShowComments] = useState({});

  useEffect(() => {
    dispatch(fetchFeed());
  }, [dispatch]);

  const handleCreatePost = async () => {
    if (!newPostContent.trim()) return;

    try {
      await dispatch(
        createPost({
          content: newPostContent,
          type: "text",
          category: "Career",
          visibility: "public",
        })
      );
      setNewPostContent("");
    } catch (error) {
      console.error("Failed to create post:", error);
      alert("Failed to create post. Please try again.");
    }
  };

  const handleLike = async (postId) => {
    try {
      await dispatch(toggleLike(postId));
    } catch (error) {
      console.error("Failed to like post:", error);
    }
  };

  const handleComment = async (postId) => {
    if (!commentContent.trim()) return;

    try {
      await dispatch(addComment({ postId, content: commentContent }));
      setCommentContent("");
      setActiveCommentPost(null);
    } catch (error) {
      console.error("Failed to add comment:", error);
    }
  };

  const toggleComments = (postId) => {
    setShowComments((prev) => ({
      ...prev,
      [postId]: !prev[postId],
    }));
  };

  const formatTimeAgo = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMinutes = Math.floor((now - date) / (1000 * 60));

    if (diffInMinutes < 1) return "Just now";
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    return `${Math.floor(diffInMinutes / 1440)}d ago`;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Feed</h1>
          <p className="text-muted-foreground mt-2">
            Stay updated with your professional network
          </p>
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <Card>
          <CardContent className="p-6">
            <div className="text-center text-destructive">
              <p className="font-medium">Error loading feed</p>
              <p className="text-sm">{error}</p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Create Post Card */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center space-x-4">
            <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center">
              <span className="text-primary-foreground font-medium">
                {user?.firstName?.charAt(0) || "U"}
              </span>
            </div>
            <div className="flex-1">
              <textarea
                value={newPostContent}
                onChange={(e) => setNewPostContent(e.target.value)}
                placeholder="What's on your mind?"
                className="w-full px-4 py-3 bg-secondary rounded-lg text-muted-foreground hover:bg-secondary/80 transition-colors resize-none"
                rows={3}
              />
            </div>
          </div>
          {newPostContent && (
            <div className="flex justify-end mt-4">
              <Button
                onClick={handleCreatePost}
                disabled={!newPostContent.trim()}
              >
                <Send className="h-4 w-4 mr-2" />
                Post
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Posts Feed */}
      {feed.length === 0 && !isLoading ? (
        <Card>
          <CardContent className="p-12 text-center">
            <MessageSquare className="mx-auto h-12 w-12 text-muted-foreground" />
            <h3 className="mt-4 text-lg font-medium">No posts yet</h3>
            <p className="text-muted-foreground">
              Be the first to share something with your network
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {feed.map((post) => (
            <Card key={post._id}>
              <CardContent className="p-6">
                <div className="flex items-start space-x-4">
                  <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center">
                    <span className="text-primary-foreground font-medium">
                      {post.author?.firstName?.charAt(0) || "U"}
                    </span>
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center space-x-2">
                      <h4 className="font-medium">
                        {post.author?.firstName} {post.author?.lastName}
                      </h4>
                      <span className="text-muted-foreground text-sm">
                        • {formatTimeAgo(post.createdAt)}
                      </span>
                    </div>
                    <p className="text-muted-foreground text-sm">
                      {post.author?.jobTitle || "Professional"}
                    </p>

                    <div className="mt-3">
                      <p className="whitespace-pre-wrap">{post.content}</p>
                    </div>

                    {/* Tags */}
                    {post.tags && post.tags.length > 0 && (
                      <div className="flex flex-wrap gap-2 mt-3">
                        {post.tags.map((tag, index) => (
                          <span
                            key={index}
                            className="px-2 py-1 text-xs bg-secondary text-secondary-foreground rounded"
                          >
                            #{tag}
                          </span>
                        ))}
                      </div>
                    )}

                    {/* Comments Section */}
                    {showComments[post._id] &&
                      post.comments &&
                      post.comments.length > 0 && (
                        <div className="mt-4 space-y-3 border-t pt-4">
                          <h5 className="font-medium text-sm text-muted-foreground">
                            Comments
                          </h5>
                          {post.comments.map((comment, index) => (
                            <div
                              key={index}
                              className="flex items-start space-x-3"
                            >
                              <div className="w-8 h-8 bg-secondary rounded-full flex items-center justify-center">
                                <span className="text-secondary-foreground font-medium text-xs">
                                  {comment.author?.firstName?.charAt(0) || "U"}
                                </span>
                              </div>
                              <div className="flex-1">
                                <div className="flex items-center space-x-2">
                                  <span className="font-medium text-sm">
                                    {comment.author?.firstName}{" "}
                                    {comment.author?.lastName}
                                  </span>
                                  <span className="text-muted-foreground text-xs">
                                    {formatTimeAgo(comment.createdAt)}
                                  </span>
                                </div>
                                <p className="text-sm mt-1">
                                  {comment.content}
                                </p>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}

                    {/* Engagement Stats */}
                    <div className="flex items-center space-x-6 mt-4 pt-3 border-t">
                      <button
                        className={`flex items-center space-x-2 transition-colors ${
                          post.isLiked
                            ? "text-primary"
                            : "text-muted-foreground hover:text-primary"
                        }`}
                        onClick={() => handleLike(post._id)}
                      >
                        <Heart
                          className={`h-4 w-4 ${
                            post.isLiked ? "fill-current" : ""
                          }`}
                        />
                        <span className="text-sm">{post.likesCount || 0}</span>
                      </button>
                      <button
                        className="flex items-center space-x-2 text-muted-foreground hover:text-primary transition-colors"
                        onClick={() => toggleComments(post._id)}
                      >
                        <MessageSquare className="h-4 w-4" />
                        <span className="text-sm">
                          {post.commentsCount || 0}
                        </span>
                      </button>
                    </div>

                    {/* Comment Input */}
                    {activeCommentPost === post._id && (
                      <div className="mt-4 flex space-x-2">
                        <Input
                          value={commentContent}
                          onChange={(e) => setCommentContent(e.target.value)}
                          placeholder="Write a comment..."
                          className="flex-1"
                        />
                        <Button
                          size="sm"
                          onClick={() => handleComment(post._id)}
                          disabled={!commentContent.trim()}
                        >
                          Comment
                        </Button>
                      </div>
                    )}

                    {/* Show comment input when comments are expanded */}
                    {showComments[post._id] &&
                      activeCommentPost !== post._id && (
                        <div className="mt-4 flex space-x-2">
                          <Input
                            value={commentContent}
                            onChange={(e) => setCommentContent(e.target.value)}
                            placeholder="Write a comment..."
                            className="flex-1"
                          />
                          <Button
                            size="sm"
                            onClick={() => handleComment(post._id)}
                            disabled={!commentContent.trim()}
                          >
                            Comment
                          </Button>
                        </div>
                      )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

export default Feed;
