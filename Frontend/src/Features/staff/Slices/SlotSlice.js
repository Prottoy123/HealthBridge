import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../../services/api"

const initialState = {
  doctorsList: [],
  isLoadingDoctors: false,
  isGenerating: false,
  error: null,
  successMessage: null,
};

export const fetchDoctorsForDropdown = createAsyncThunk(
  "slot/fetchDoctorsForDropdown",
  async (queryParams = { limit: 50 }, { rejectWithValue }) => {
    try {
      const response = await api.get("/patient/doctors", {
        params: queryParams,
      });

      return response.data.data.doctors;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch doctors list",
      );
    }
  },
);

export const generateDoctorSlots = createAsyncThunk(
  "slot/generateDoctorSlots",
  async (payload, { rejectWithValue }) => {
    try {
      const response = await api.post("/staff/generate-slots", payload);
      return response.data.message;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to generate slots",
      );
    }
  },
);

const slotSlice = createSlice({
  name: "slot",
  initialState,
  reducers: {
    clearSlotFeedback: (state) => {
      state.error = null;
      state.successMessage = null;
    },
    clearSlotData: () => initialState,
  },
  extraReducers: (builder) => {
    builder
      // --- Fetch Doctors Lifecycle ---
      .addCase(fetchDoctorsForDropdown.pending, (state) => {
        state.isLoadingDoctors = true;
        state.error = null;
      })
      .addCase(fetchDoctorsForDropdown.fulfilled, (state, action) => {
        state.isLoadingDoctors = false;
        state.doctorsList = action.payload;
      })
      .addCase(fetchDoctorsForDropdown.rejected, (state, action) => {
        state.isLoadingDoctors = false;
        state.error = action.payload;
      })

      // --- Generate Slots Lifecycle ---
      .addCase(generateDoctorSlots.pending, (state) => {
        state.isGenerating = true;
        state.error = null;
        state.successMessage = null;
      })
      .addCase(generateDoctorSlots.fulfilled, (state, action) => {
        state.isGenerating = false;
        state.successMessage = action.payload;
      })
      .addCase(generateDoctorSlots.rejected, (state, action) => {
        state.isGenerating = false;
        state.error = action.payload;
      });
  },
});

export const { clearSlotFeedback, clearSlotData } = slotSlice.actions;
export default slotSlice.reducer;
