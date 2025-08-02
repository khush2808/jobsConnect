import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../lib/api";

// Async thunks for jobs API
export const fetchJobs = createAsyncThunk(
  "jobs/fetchJobs",
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await api.get("/jobs", { params });
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch jobs"
      );
    }
  }
);

export const fetchJobById = createAsyncThunk(
  "jobs/fetchJobById",
  async (jobId, { rejectWithValue }) => {
    try {
      const response = await api.get(`/jobs/${jobId}`);
      return response.data.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch job"
      );
    }
  }
);

export const createJob = createAsyncThunk(
  "jobs/createJob",
  async (jobData, { rejectWithValue }) => {
    try {
      const response = await api.post("/jobs", jobData);
      return response.data.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to create job"
      );
    }
  }
);

export const applyToJob = createAsyncThunk(
  "jobs/applyToJob",
  async ({ jobId, applicationData }, { rejectWithValue }) => {
    try {
      const response = await api.post(`/jobs/${jobId}/apply`, applicationData);
      return { jobId, application: response.data.data };
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to apply to job"
      );
    }
  }
);

export const fetchMyJobs = createAsyncThunk(
  "jobs/fetchMyJobs",
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await api.get("/jobs/my/posted", { params });
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch your jobs"
      );
    }
  }
);

export const fetchMyApplications = createAsyncThunk(
  "jobs/fetchMyApplications",
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await api.get("/jobs/my/applications", { params });
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch applications"
      );
    }
  }
);

const jobsSlice = createSlice({
  name: "jobs",
  initialState: {
    jobs: [],
    currentJob: null,
    myJobs: [],
    myApplications: [],
    isLoading: false,
    error: null,
    pagination: {
      currentPage: 1,
      totalPages: 1,
      totalJobs: 0,
      hasNext: false,
      hasPrev: false,
    },
    filters: {
      search: "",
      skills: [],
      jobType: "",
      workLocation: "",
      experienceLevel: "",
      location: "",
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
        skills: [],
        jobType: "",
        workLocation: "",
        experienceLevel: "",
        location: "",
      };
    },
    clearCurrentJob: (state) => {
      state.currentJob = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Jobs
      .addCase(fetchJobs.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchJobs.fulfilled, (state, action) => {
        state.isLoading = false;
        state.jobs = action.payload.data;
        state.pagination = action.payload.pagination;
        state.error = null;
      })
      .addCase(fetchJobs.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })

      // Fetch Job by ID
      .addCase(fetchJobById.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchJobById.fulfilled, (state, action) => {
        state.isLoading = false;
        state.currentJob = action.payload;
        state.error = null;
      })
      .addCase(fetchJobById.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })

      // Create Job
      .addCase(createJob.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(createJob.fulfilled, (state, action) => {
        state.isLoading = false;
        state.myJobs.unshift(action.payload);
        state.error = null;
      })
      .addCase(createJob.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })

      // Apply to Job
      .addCase(applyToJob.fulfilled, (state, action) => {
        // Update current job if it's the one being applied to
        if (state.currentJob && state.currentJob._id === action.payload.jobId) {
          state.currentJob.applications.push(action.payload.application);
        }
      })

      // Fetch My Jobs
      .addCase(fetchMyJobs.pending, (state) => {})
      .addCase(fetchMyJobs.fulfilled, (state, action) => {
        state.myJobs = action.payload.data;
      })
      .addCase(fetchMyJobs.rejected, (state, action) => {})

      // Fetch My Applications
      .addCase(fetchMyApplications.pending, (state) => {})
      .addCase(fetchMyApplications.fulfilled, (state, action) => {
        state.myApplications = action.payload.data;
      })
      .addCase(fetchMyApplications.rejected, (state, action) => {});
  },
});

export const { clearError, setFilters, clearFilters, clearCurrentJob } =
  jobsSlice.actions;
export default jobsSlice.reducer;
