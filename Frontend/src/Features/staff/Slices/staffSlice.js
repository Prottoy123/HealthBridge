import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../../services/api";

// --- Thunks ---

export const fetchTodayQueue = createAsyncThunk(
  "staff/fetchTodayQueue",
  async (doctorId, { rejectWithValue }) => {
    try {
      const response = await api.get(
        `/staff/doctor-queue?doctorId=${doctorId}`,
      );
      return response.data.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to load today's queue.",
      );
    }
  },
);

export const uploadPatientReport = createAsyncThunk(
  "staff/uploadPatientReport",
  async (formDataPayload, { rejectWithValue }) => {
    try {
      // Sending FormData requires specific headers
      const response = await api.post(
        "/staff/upload-lab-report",
        formDataPayload,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        },
      );
      return response.data.message;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to upload patient reports.",
      );
    }
  },
);

// // Fetching patient list for the dropdown
// export const fetchPatientsForDropdown = createAsyncThunk(
//   "staff/fetchPatientsForDropdown",
//   async (_, { rejectWithValue }) => {
//     try {
//       const response = await api.get("/staff/get-patients");
//       return response.data.data;
//     } catch (error) {
//       return rejectWithValue(
//         error.response?.data?.message || "Failed to fetch patient list.",
//       );
//     }
//   },
// );

// --- Initial State ---

const initialState = {
  todayQueue: [],
  queueStatus: "idle",
  patientsList: [],
  isLoadingPatients: false,
  error: null,
};

// --- Slice ---

const staffSlice = createSlice({
  name: "staff",
  initialState,
  reducers: {
    updateQueueStatus: (state, action) => {
      const { appointmentId, newStatus } = action.payload;
      const appointmentIndex = state.todayQueue.findIndex(
        (app) => app._id === appointmentId,
      );

      if (appointmentIndex !== -1) {
        state.todayQueue[appointmentIndex].status = newStatus;
      }
    },

    addLiveAppointment: (state, action) => {
      state.todayQueue.push(action.payload);
    },

    clearStaffData: (state) => {
      state.todayQueue = [];
      state.queueStatus = "idle";
      state.patientsList = [];
      state.error = null;
    },
  },

  extraReducers: (builder) => {
    builder
      // Fetch Today Queue Lifecycle
      .addCase(fetchTodayQueue.pending, (state) => {
        state.queueStatus = "loading";
        state.error = null;
      })
      .addCase(fetchTodayQueue.fulfilled, (state, action) => {
        state.queueStatus = "succeeded";
        state.todayQueue = action.payload;
      })
      .addCase(fetchTodayQueue.rejected, (state, action) => {
        state.queueStatus = "failed";
        state.error = action.payload;
      })

      // // Fetch Patients Lifecycle
      // .addCase(fetchPatientsForDropdown.pending, (state) => {
      //   state.isLoadingPatients = true;
      //   state.error = null;
      // })
      // .addCase(fetchPatientsForDropdown.fulfilled, (state, action) => {
      //   state.isLoadingPatients = false;
      //   state.patientsList = action.payload;
      // })
      // .addCase(fetchPatientsForDropdown.rejected, (state, action) => {
      //   state.isLoadingPatients = false;
      //   state.error = action.payload;
      // });
  },
});

export const { updateQueueStatus, addLiveAppointment, clearStaffData } =
  staffSlice.actions;

export default staffSlice.reducer;
