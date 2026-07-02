import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../../services/api";

const initialState = {
  doctors: [],
  pagination: { totalDocs: 0, totalPages: 1, currentPage: 1, limit: 10 },
  status: "idle",
  error: null,
};

export const fetchDoctorList = createAsyncThunk(
  "doctorList/fetchDoctorList",
  async ({ page, limit, specialization, search }, { rejectWithValue }) => {
    try {
      const response = await api.get("/patient/doctors", {
        params: { page, limit, specialization, search },
      });
      return response.data.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch the list of doctors",
      );
    }
  },
);

const doctorListSlice = createSlice({
  name: "doctorList",
  initialState,
  reducers: {
    clearDoctorsList: (state) => {
      state.doctors = [];
      state.pagination = {
        totalDocs: 0,
        totalPages: 1,
        currentPage: 1,
        limit: 10,
      };
      state.status = "idle";
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchDoctorList.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(fetchDoctorList.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.doctors = action.payload.doctors;
        state.pagination = action.payload.pagination;
      })
      .addCase(fetchDoctorList.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
      });
  },
});

export const { clearDoctorsList } = doctorListSlice.actions;
export default doctorListSlice.reducer;
