import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../../services/api"; 

const initialState = {
  profile: null,
  status: "idle",
  error: null, 
};

// ১. Fetch Profile Thunk
export const fetchDoctorProfile = createAsyncThunk(
  "doctor/fetchProfile",
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get("/doctor/get-profile");
      return response.data.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch doctor profile",
      );
    }
  },
);

// ২. Update Profile Thunk
export const updateDoctorProfile = createAsyncThunk(
  "doctor/updateProfile",
  async (updateData, { rejectWithValue }) => {
    try {
      const response = await api.patch("/doctor/update-profile", updateData);
      return response.data.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to update doctor profile",
      );
    }
  },
);

const doctorProfileSlice = createSlice({
  name: "doctorProfile",
  initialState,
  reducers: {
    clearDoctorProfile: (state) => {
      state.profile = null;
      state.status = "idle";
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // --- Fetch Profile Lifecycle ---
      .addCase(fetchDoctorProfile.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(fetchDoctorProfile.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.profile = action.payload;
      })
      .addCase(fetchDoctorProfile.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
      })

      // --- Update Profile Lifecycle ---
      .addCase(updateDoctorProfile.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(updateDoctorProfile.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.profile = action.payload;
      })
      .addCase(updateDoctorProfile.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
      });
  },
});

export const { clearDoctorProfile } = doctorProfileSlice.actions;
export default doctorProfileSlice.reducer;
