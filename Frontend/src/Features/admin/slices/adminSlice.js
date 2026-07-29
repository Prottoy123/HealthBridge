import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../../services/api";

const initialState = {
  pendingDoctors: [],
  pagination: {
    totalDocs: 0,
    totalPages: 1,
    currentPage: 1,
    hasNextPage: false,
    hasPrevPage: false,
  },
  // For the Analytics data 
  analyticsData: null,
  isFetchingAnalytics: false,
  analyticsError: null,

  status: "idle",
  error: null,
};

export const fetchPendingDoctors = createAsyncThunk(
  "admin/fetchPendingDoctors",
  async ({ page, limit }, { rejectWithValue }) => {
    try {
      const response = await api.get("/admin/pending-doctors", {
        params: { page, limit },
      });
      return response.data.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch pending doctors",
      );
    }
  },
);

export const verifyDoctorAction = createAsyncThunk(
  "admin/verifyDoctorAction",
  async (doctorId, { rejectWithValue }) => {
    try {
      const response = await api.patch(`/admin/verify-doctor/${doctorId}`);
      return { doctorId, data: response.data.data };
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to verify doctor",
      );
    }
  },
);

export const fetchSystemAnalytics = createAsyncThunk(
  "admin/fetchSystemAnalytics",
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get("/admin/analytics");
      return response.data.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch analytics",
      );
    }
  },
);

const adminSlice = createSlice({
  name: "admin",
  initialState,
  reducers: {
    clearAdminState: (state) => {
      state.pendingDoctors = [];
      state.pagination = {
        totalDocs: 0,
        totalPages: 1,
        currentPage: 1,
        hasNextPage: false,
        hasPrevPage: false,
      };
      state.status = "idle";
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchPendingDoctors.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(fetchPendingDoctors.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.pendingDoctors = action.payload.records;
        state.pagination = action.payload.pagination;
      })
      .addCase(fetchPendingDoctors.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
      })

      .addCase(verifyDoctorAction.fulfilled, (state, action) => {
        state.pendingDoctors = state.pendingDoctors.filter(
          (doctor) => doctor._id !== action.payload.doctorId,
        );
        state.pagination.totalDocs -= 1;
      })
      .addCase(verifyDoctorAction.rejected, (state, action) => {
        state.error = action.payload;
      })

      .addCase(fetchSystemAnalytics.pending, (state) => {
        state.isFetchingAnalytics = true;
        state.analyticsError = null;
      })
      .addCase(fetchSystemAnalytics.fulfilled, (state, action) => {
        state.isFetchingAnalytics = false;
        state.analyticsData = action.payload;
      })
      .addCase(fetchSystemAnalytics.rejected, (state, action) => {
        state.isFetchingAnalytics = false;
        state.analyticsError = action.payload;
      });
  },
});

export const { clearAdminState } = adminSlice.actions;
export default adminSlice.reducer;
