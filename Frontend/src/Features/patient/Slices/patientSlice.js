import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../../services/api";

const initialState = {
  profile: null,
  status: "idle",
};

// 1. Fetch Profile Thunk
export const fetchPatientProfile = createAsyncThunk(
  "patient/fetchProfile",
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get("/patient/get-profile");
      return response.data.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch profile",
      );
    }
  },
);

// 2. Update Profile Thunk
export const updatePatientProfile = createAsyncThunk(
  "patient/updateProfile",
  async (updateData, { rejectWithValue }) => {
    try {
      const response = await api.patch("/patient/update-profile", updateData);
      return response.data.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to update profile",
      );
    }
  },
);

const patientSlice = createSlice({
  name: "patient",
  initialState,
  reducers: {
    clearPatientData: (state) => {
      state.profile = null;
      state.status = "idle";
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchPatientProfile.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(fetchPatientProfile.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.profile = action.payload;
      })
      .addCase(fetchPatientProfile.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
      })

      .addCase(updatePatientProfile.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(updatePatientProfile.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.profile = action.payload;
      })
      .addCase(updatePatientProfile.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
      });
  },
});

export const { clearPatientData } = patientSlice.actions;
export default patientSlice.reducer;
