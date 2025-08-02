import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../lib/api";

// Async thunks for posts API
export const fetchFeed = createAsyncThunk(
  "posts/fetchFeed",
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await api.get("/posts/feed", { params });
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch feed"
      );
    }
  }
);

export const fetchPostById = createAsyncThunk(
  "posts/fetchPostById",
  async (postId, { rejectWithValue }) => {
    try {
      const response = await api.get(`/posts/${postId}`);
      return response.data.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch post"
      );
    }
  }
);

export const createPost = createAsyncThunk(
  "posts/createPost",
  async (postData, { rejectWithValue }) => {
    try {
      const response = await api.post("/posts", postData);
      return response.data.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to create post"
      );
    }
  }
);

export const toggleLike = createAsyncThunk(
  "posts/toggleLike",
  async (postId, { rejectWithValue }) => {
    try {
      const response = await api.post(`/posts/${postId}/like`);
      return { postId, ...response.data.data };
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to toggle like"
      );
    }
  }
);

export const addComment = createAsyncThunk(
  "posts/addComment",
  async ({ postId, content }, { rejectWithValue }) => {
    try {
      const response = await api.post(`/posts/${postId}/comments`, { content });
      return { postId, comment: response.data.data };
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to add comment"
      );
    }
  }
);

export const sharePost = createAsyncThunk(
  "posts/sharePost",
  async ({ postId, shareComment }, { rejectWithValue }) => {
    try {
      const response = await api.post(`/posts/${postId}/share`, {
        shareComment,
      });
      return { postId, ...response.data.data };
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to share post"
      );
    }
  }
);

export const fetchMyPosts = createAsyncThunk(
  "posts/fetchMyPosts",
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await api.get("/posts/my/posts", { params });
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch your posts"
      );
    }
  }
);

const postsSlice = createSlice({
  name: "posts",
  initialState: {
    feed: [],
    currentPost: null,
    myPosts: [],
    isLoading: false,
    error: null,
    pagination: {
      currentPage: 1,
      totalPages: 1,
      totalPosts: 0,
      hasNext: false,
      hasPrev: false,
    },
    filters: {
      type: "",
      category: "",
      tags: [],
      following: false,
    },
  },
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    setFilters: (state, action) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    clearFilters: (state) => {
      state.filters = {
        type: "",
        category: "",
        tags: [],
        following: false,
      };
    },
    clearCurrentPost: (state) => {
      state.currentPost = null;
    },
    updatePostInFeed: (state, action) => {
      const { postId, updates } = action.payload;
      const postIndex = state.feed.findIndex((post) => post._id === postId);
      if (postIndex !== -1) {
        state.feed[postIndex] = { ...state.feed[postIndex], ...updates };
      }
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Feed
      .addCase(fetchFeed.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchFeed.fulfilled, (state, action) => {
        state.isLoading = false;
        state.feed = action.payload.data;
        state.pagination = action.payload.pagination;
        state.error = null;
      })
      .addCase(fetchFeed.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })

      // Fetch Post by ID
      .addCase(fetchPostById.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchPostById.fulfilled, (state, action) => {
        state.isLoading = false;
        state.currentPost = action.payload;
        state.error = null;
      })
      .addCase(fetchPostById.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })

      // Create Post
      .addCase(createPost.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(createPost.fulfilled, (state, action) => {
        state.isLoading = false;
        state.feed.unshift(action.payload);
        state.myPosts.unshift(action.payload);
        state.error = null;
      })
      .addCase(createPost.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })

      // Toggle Like
      .addCase(toggleLike.fulfilled, (state, action) => {
        const { postId, likesCount, isLiked } = action.payload;

        // Update in feed
        const feedPostIndex = state.feed.findIndex(
          (post) => post._id === postId
        );
        if (feedPostIndex !== -1) {
          state.feed[feedPostIndex].likesCount = likesCount;
          state.feed[feedPostIndex].isLiked = isLiked;
        }

        // Update current post if it matches
        if (state.currentPost && state.currentPost._id === postId) {
          state.currentPost.likesCount = likesCount;
          state.currentPost.isLiked = isLiked;
        }
      })

      // Add Comment
      .addCase(addComment.fulfilled, (state, action) => {
        const { postId, comment } = action.payload;

        // Update in feed
        const feedPostIndex = state.feed.findIndex(
          (post) => post._id === postId
        );
        if (feedPostIndex !== -1) {
          state.feed[feedPostIndex].commentsCount += 1;
        }

        // Update current post if it matches
        if (state.currentPost && state.currentPost._id === postId) {
          state.currentPost.comments.push(comment);
          state.currentPost.commentsCount += 1;
        }
      })

      // Share Post
      .addCase(sharePost.fulfilled, (state, action) => {
        const { postId, sharesCount } = action.payload;

        // Update in feed
        const feedPostIndex = state.feed.findIndex(
          (post) => post._id === postId
        );
        if (feedPostIndex !== -1) {
          state.feed[feedPostIndex].sharesCount = sharesCount;
        }

        // Update current post if it matches
        if (state.currentPost && state.currentPost._id === postId) {
          state.currentPost.sharesCount = sharesCount;
        }
      })

      // Fetch My Posts
      .addCase(fetchMyPosts.fulfilled, (state, action) => {
        state.myPosts = action.payload.data;
      });
  },
});

export const {
  clearError,
  setFilters,
  clearFilters,
  clearCurrentPost,
  updatePostInFeed,
} = postsSlice.actions;

export default postsSlice.reducer;
