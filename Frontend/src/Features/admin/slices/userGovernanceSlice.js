import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../../services/api";

const initialState = {
  usersList: [],
  paginationMeta: {
    totalRecords: 0,
    totalPages: 1,
    currentPage: 1,
    hasNextPage: false,
    hasPrevPage: false,
  },

  filters: {
    search: "",
    role: "",
    status: "",
  },

  isLoadingUsers: false,
  isUpdatingStatus: false,
  error: null,
  updateError: null,
};

export const fetchSystemUsers = createAsyncThunk(
  "userGovernance/fetchSystemUsers",
  async (params, { rejectWithValue }) => {
    try {
      const response = await api.get("/admin/get-user", { params });
      return response.data.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch system users",
      );
    }
  },
);

export const changeUserStatus = createAsyncThunk(
  "userGovernance/changeUserStatus",
  async ({ userId, status }, { rejectWithValue }) => {
    try {
      const response = await api.patch(`/admin/user-status/${userId}`, {
        status,
      });
      return { userId, status: response.data.data.status };
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to update user status",
      );
    }
  },
);

const userGovernanceSlice = createSlice({
  name: "userGovernance",
  initialState,
  reducers: {
    updateFilters: (state, action) => {
      state.filters = { ...state.filters, ...action.payload };
      
      state.paginationMeta.currentPage = 1;
    },
    clearGovernanceState: (state) => {
      state.usersList = [];
      state.filters = { search: "", role: "", status: "" };
      state.paginationMeta = initialState.paginationMeta;
      state.error = null;
      state.updateError = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // --- Fetch Users Lifecycle ---
      .addCase(fetchSystemUsers.pending, (state) => {
        state.isLoadingUsers = true;
        state.error = null;
      })
      .addCase(fetchSystemUsers.fulfilled, (state, action) => {
        state.isLoadingUsers = false;
        state.usersList = action.payload.records;
        state.paginationMeta = action.payload.pagination;
      })
      .addCase(fetchSystemUsers.rejected, (state, action) => {
        state.isLoadingUsers = false;
        state.error = action.payload;
      })

      // --- Update User Status Lifecycle (Optimistic Magic) ---
      .addCase(changeUserStatus.pending, (state) => {
        state.isUpdatingStatus = true;
        state.updateError = null;
      })
      .addCase(changeUserStatus.fulfilled, (state, action) => {
        state.isUpdatingStatus = false;
        const { userId, status } = action.payload;
        const targetUser = state.usersList.find((user) => user._id === userId);

        if (targetUser) {
          targetUser.status = status;
        }
      })
      .addCase(changeUserStatus.rejected, (state, action) => {
        state.isUpdatingStatus = false;
        state.updateError = action.payload;
      });
  },
});

export const { updateFilters, clearGovernanceState } =
  userGovernanceSlice.actions;
export default userGovernanceSlice.reducer;
