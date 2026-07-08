import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../../services/api"; 

const initialState = {
  isProvisioning: false,
  provisionError: null,
  newlyCreatedCredentials: null,
};

export const provisionStaffAccount = createAsyncThunk(
  "admin/provisionStaffAccount",
  async (staffData, { rejectWithValue }) => {
    try {
      const response = await api.post("/admin/create-staff", staffData);
      return response.data.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to provision staff account",
      );
    }
  },
);

const adminStaffSlice = createSlice({
  name: "adminStaff",
  initialState,
  reducers: {
    clearNewlyCreatedCredentials: (state) => {
      state.newlyCreatedCredentials = null;
      state.provisionError = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(provisionStaffAccount.pending, (state) => {
        state.isProvisioning = true;
        state.provisionError = null;
      })
      .addCase(provisionStaffAccount.fulfilled, (state, action) => {
        state.isProvisioning = false;
        state.newlyCreatedCredentials = action.payload;
      })
      .addCase(provisionStaffAccount.rejected, (state, action) => {
        state.isProvisioning = false;
        state.provisionError = action.payload;
      });
  },
});

export const { clearNewlyCreatedCredentials } = adminStaffSlice.actions;
export default adminStaffSlice.reducer;
