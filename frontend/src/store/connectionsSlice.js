import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../lib/api";

// Async thunks for connections API
export const fetchConnections = createAsyncThunk(
  "connections/fetchConnections",
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await api.get("/users/connections", { params });
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch connections"
      );
    }
  }
);

export const fetchPendingRequests = createAsyncThunk(
  "connections/fetchPendingRequests",
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await api.get("/users/connections/pending", { params });
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch pending requests"
      );
    }
  }
);

export const fetchSuggestedConnections = createAsyncThunk(
  "connections/fetchSuggestedConnections",
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await api.get("/users/suggested-connections", { params });
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch suggested connections"
      );
    }
  }
);

export const sendConnectionRequest = createAsyncThunk(
  "connections/sendConnectionRequest",
  async (userId, { rejectWithValue }) => {
    try {
      const response = await api.post(`/users/${userId}/connect`);
      return { userId, ...response.data };
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to send connection request"
      );
    }
  }
);

export const respondToConnectionRequest = createAsyncThunk(
  "connections/respondToConnectionRequest",
  async ({ requestId, status }, { rejectWithValue }) => {
    try {
      const response = await api.put(`/users/connections/${requestId}`, { status });
      return { requestId, status, ...response.data };
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to respond to connection request"
      );
    }
  }
);

export const removeConnection = createAsyncThunk(
  "connections/removeConnection",
  async (connectionId, { rejectWithValue }) => {
    try {
      const response = await api.delete(`/users/connections/${connectionId}`);
      return { connectionId, ...response.data };
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to remove connection"
      );
    }
  }
);

const connectionsSlice = createSlice({
  name: "connections",
  initialState: {
    connections: [],
    pendingRequests: [],
    suggestedConnections: [],
    isLoading: false,
    error: null,
    pagination: {
      currentPage: 1,
      totalPages: 1,
      totalConnections: 0,
      hasNext: false,
      hasPrev: false,
    },
    filters: {
      search: "",
      status: "",
      sortBy: "name",
      sortOrder: "asc",
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
        search: "",
        status: "",
        sortBy: "name",
        sortOrder: "asc",
      };
    },
    updateConnectionStatus: (state, action) => {
      const { connectionId, status } = action.payload;
      const connection = state.connections.find(conn => conn._id === connectionId);
      if (connection) {
        connection.status = status;
      }
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Connections
      .addCase(fetchConnections.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchConnections.fulfilled, (state, action) => {
        state.isLoading = false;
        state.connections = action.payload.data;
        state.pagination = action.payload.pagination;
        state.error = null;
      })
      .addCase(fetchConnections.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })

      // Fetch Pending Requests
      .addCase(fetchPendingRequests.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchPendingRequests.fulfilled, (state, action) => {
        state.isLoading = false;
        state.pendingRequests = action.payload.data;
        state.error = null;
      })
      .addCase(fetchPendingRequests.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })

      // Fetch Suggested Connections
      .addCase(fetchSuggestedConnections.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchSuggestedConnections.fulfilled, (state, action) => {
        state.isLoading = false;
        state.suggestedConnections = action.payload.data;
        state.error = null;
      })
      .addCase(fetchSuggestedConnections.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })

      // Send Connection Request
      .addCase(sendConnectionRequest.fulfilled, (state, action) => {
        const { userId } = action.payload;
        // Remove from suggested connections
        state.suggestedConnections = state.suggestedConnections.filter(
          user => user._id !== userId
        );
      })

      // Respond to Connection Request
      .addCase(respondToConnectionRequest.fulfilled, (state, action) => {
        const { requestId, status } = action.payload;
        
        // Remove from pending requests
        state.pendingRequests = state.pendingRequests.filter(
          request => request._id !== requestId
        );

        // If accepted, add to connections
        if (status === "accepted") {
          const acceptedRequest = state.pendingRequests.find(
            request => request._id === requestId
          );
          if (acceptedRequest) {
            state.connections.push(acceptedRequest);
          }
        }
      })

      // Remove Connection
      .addCase(removeConnection.fulfilled, (state, action) => {
        const { connectionId } = action.payload;
        state.connections = state.connections.filter(
          connection => connection._id !== connectionId
        );
      });
  },
});

export const { 
  clearError, 
  setFilters, 
  clearFilters, 
  updateConnectionStatus 
} = connectionsSlice.actions;

export default connectionsSlice.reducer;