import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../../services/api";

// ১. Fetch Today's Queue (Existing)
export const fetchTodaysQueue = createAsyncThunk(
  "doctor/fetchTodaysQueue",
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get("doctor/daily-schedule");
      return response.data.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to load today's queue",
      );
    }
  },
);

// ২. NEW Thunk: Fetch Single Appointment Details
export const fetchAppointmentDetails = createAsyncThunk(
  "doctor/fetchAppointmentDetails",
  async (appointmentId, { rejectWithValue }) => {
    try {
      const response = await api.get(
        `doctor/appointment-details/${appointmentId}`,
      );
      return response.data.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to load consultation details",
      );
    }
  },
);

// ৩. NEW Thunk: Complete Visit & Set Follow-up
export const completeConsultation = createAsyncThunk(
  "doctor/completeConsultation",
  async ({ appointmentId, followUpDays }, { rejectWithValue, dispatch }) => {
    try {
      const response = await api.patch(
        `doctor/complete-visit/${appointmentId}`,
        { followUpDays },
      );

      dispatch(removeFromQueue(appointmentId));

      return response.data.message;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to complete visit",
      );
    }
  },
);

// ৪. NEW Thunk: Fetch Active Follow-ups (The Radar Engine)
export const fetchActiveFollowups = createAsyncThunk(
  "doctor/fetchActiveFollowups",
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get("doctor/active-followups");
      return response.data.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to load active follow-ups",
      );
    }
  },
);

const initialState = {
  queue: [],
  isLoading: false,
  error: null,

  activeAppointment: null,
  isConsultationLoading: false,
  consultationError: null,
  isCompleting: false,

  // --- New State for Inbox/Radar ---
  activeFollowUps: [],
  isActiveFollowUpsLoading: false,
  activeFollowUpsError: null,
};

const doctorSlice = createSlice({
  name: "doctor",
  initialState,
  reducers: {
    removeFromQueue: (state, action) => {
      const appointmentId = action.payload;
      state.queue = state.queue.filter((item) => item._id !== appointmentId);
    },
    clearActiveConsultation: (state) => {
      state.activeAppointment = null;
      state.consultationError = null;
    },
    // The Kill-Switch: Flushes entire doctor memory on logout
    clearDoctorData: (state) => {
      state.queue = [];
      state.activeAppointment = null;
      state.error = null;
      state.consultationError = null;

      // Clearing the new inbox memory
      state.activeFollowUps = [];
      state.activeFollowUpsError = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // --- Fetch Todays Queue ---
      .addCase(fetchTodaysQueue.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchTodaysQueue.fulfilled, (state, action) => {
        state.isLoading = false;
        state.queue = action.payload;
      })
      .addCase(fetchTodaysQueue.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })

      // --- Fetch Appointment Details ---
      .addCase(fetchAppointmentDetails.pending, (state) => {
        state.isConsultationLoading = true;
        state.consultationError = null;
      })
      .addCase(fetchAppointmentDetails.fulfilled, (state, action) => {
        state.isConsultationLoading = false;
        state.activeAppointment = action.payload;
      })
      .addCase(fetchAppointmentDetails.rejected, (state, action) => {
        state.isConsultationLoading = false;
        state.consultationError = action.payload;
      })

      // --- Complete Consultation ---
      .addCase(completeConsultation.pending, (state) => {
        state.isCompleting = true;
      })
      .addCase(completeConsultation.fulfilled, (state) => {
        state.isCompleting = false;
        state.activeAppointment = null;
      })
      .addCase(completeConsultation.rejected, (state) => {
        state.isCompleting = false;
      })

      // --- Fetch Active Follow-ups (New Inbox) ---
      .addCase(fetchActiveFollowups.pending, (state) => {
        state.isActiveFollowUpsLoading = true;
        state.activeFollowUpsError = null;
      })
      .addCase(fetchActiveFollowups.fulfilled, (state, action) => {
        state.isActiveFollowUpsLoading = false;
        state.activeFollowUps = action.payload;
      })
      .addCase(fetchActiveFollowups.rejected, (state, action) => {
        state.isActiveFollowUpsLoading = false;
        state.activeFollowUpsError = action.payload;
      });
  },
});

export const { removeFromQueue, clearActiveConsultation, clearDoctorData } =
  doctorSlice.actions;

export default doctorSlice.reducer;
