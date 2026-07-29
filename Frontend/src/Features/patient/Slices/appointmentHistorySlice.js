import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../../services/api";

const initialState = {
  history: [],
  isLoading: false,
  error: null,
};

export const fetchAppointmentHistory = createAsyncThunk(
  "patient/fetchAppointmentHistory",
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get("/patient/appointment-history");
      return response.data.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch appointment history",
      );
    }
  },
);

const appointmentHistorySlice = createSlice({
  name: "appointmentHistory",
  initialState,
  reducers: {
    clearHistoryState: (state) => {
      state.history = [];
      state.isLoading = false;
      state.error = null;
    },
  },

  extraReducers: (builder) => {
    builder
      .addCase(fetchAppointmentHistory.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchAppointmentHistory.fulfilled, (state, action) => {
        state.isLoading = false;
        state.history = action.payload;
      })
      .addCase(fetchAppointmentHistory.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });
  },
});

export const { clearHistoryState } = appointmentHistorySlice.actions;
export default appointmentHistorySlice.reducer;
