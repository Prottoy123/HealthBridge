import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../../services/api";

const initialState = {
  availableSlots: [],
  selectedSlot: null,
  isFetchingSlots: false,
  isBooking: false,
  error: null,
};

export const fetchAvailableSlots = createAsyncThunk(
  "patient/fetchAvailableSlots",
  async ({ doctorId, date }, { rejectWithValue }) => {
    try {
      const response = await api.get(`/patient/slots/${doctorId}`, {
        params: { date },
      });
      return response.data.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch slots",
      );
    }
  },
);

export const bookAppointment = createAsyncThunk(
  "patient/bookAppointment",
  async ({ appointmentId, aiSymptomSummary }, { rejectWithValue }) => {
    try {
      const response = await api.patch(`/patient/book/${appointmentId}`, {
        aiSymptomSummary,
      });
      return response.data.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to book appointment",
      );
    }
  },
);

const appointmentSlice = createSlice({
  name: "appointment",
  initialState,
  reducers: {
    selectSlot: (state, action) => {
      state.selectedSlot = action.payload;
    },
    clearAppointmentState: (state) => {
      state.availableSlots = [];
      state.selectedSlot = null;
      state.isFetchingSlots = false;
      state.isBooking = false;
      state.error = null;
    },
  },

  extraReducers: (builder) => {
    builder
      // --- Fetch Slots Lifecycle ---
      .addCase(fetchAvailableSlots.pending, (state) => {
        state.isFetchingSlots = true;
        state.error = null;
      })
      .addCase(fetchAvailableSlots.fulfilled, (state, action) => {
        state.isFetchingSlots = false;
        state.availableSlots = action.payload;
      })
      .addCase(fetchAvailableSlots.rejected, (state, action) => {
        state.isFetchingSlots = false;
        state.error = action.payload;
      })

      // --- Book Appointment Lifecycle ---
      .addCase(bookAppointment.pending, (state) => {
        state.isBooking = true;
        state.error = null;
      })
      .addCase(bookAppointment.fulfilled, (state, action) => {
        state.isBooking = false;

        state.availableSlots = state.availableSlots.filter(
          (slot) => slot._id !== action.payload._id,
        );
        state.selectedSlot = null;
      })
      .addCase(bookAppointment.rejected, (state, action) => {
        state.isBooking = false;
        state.error = action.payload;
      });
  },
});

export const { selectSlot, clearAppointmentState } = appointmentSlice.actions;
export default appointmentSlice.reducer;
