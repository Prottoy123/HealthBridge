import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../../services/api";

const initialState = {
  medicalRecords: {
    data: [],
    pagination: {
      currentPage: 1,
      totalPages: 1,
      totalDocs: 0,
      hasNextPage: false,
      hasPrevPage: false,
    },
    status: "idle",
    error: null,
  },

  // Prescriptions State
  prescriptions: {
    data: [],
    pagination: {
      currentPage: 1,
      totalPages: 1,
      totalDocs: 0,
      hasNextPage: false,
      hasPrevPage: false,
    },
    status: "idle",
    error: null,
  },
};

// 2. Fetch My Medical Records Thunk
export const fetchMyRecords = createAsyncThunk(
  "vault/fetchMyRecords",
  async ({ page = 1, limit = 10 }, { rejectWithValue }) => {
    try {
      const response = await api.get(
        `/medical-records/my-records?page=${page}&limit=${limit}`,
      );
      return response.data.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch medical records",
      );
    }
  },
);

// 3. Fetch My Prescriptions Thunk
export const fetchMyPrescriptions = createAsyncThunk(
  "vault/fetchMyPrescriptions",
  async ({ page = 1, limit = 10 }, { rejectWithValue }) => {
    try {
      const response = await api.get(
        `/prescription/my-prescriptions?page=${page}&limit=${limit}`,
      );
      return response.data.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch prescriptions",
      );
    }
  },
);

// 4. Slice Configuration
const patientVaultSlice = createSlice({
  name: "patientVault",
  initialState,
  reducers: {
    clearVaultData: (state) => {
      state.medicalRecords = initialState.medicalRecords;
      state.prescriptions = initialState.prescriptions;
    },
  },
  extraReducers: (builder) => {
    builder
      // --- Medical Records Pipeline ---
      .addCase(fetchMyRecords.pending, (state) => {
        state.medicalRecords.status = "loading";
        state.medicalRecords.error = null;
      })
      .addCase(fetchMyRecords.fulfilled, (state, action) => {
        state.medicalRecords.status = "succeeded";
        state.medicalRecords.data = action.payload.records;
        state.medicalRecords.pagination = action.payload.pagination;
      })
      .addCase(fetchMyRecords.rejected, (state, action) => {
        state.medicalRecords.status = "failed";
        state.medicalRecords.error = action.payload;
      })

      // --- Prescriptions Pipeline ---
      .addCase(fetchMyPrescriptions.pending, (state) => {
        state.prescriptions.status = "loading";
        state.prescriptions.error = null;
      })
      .addCase(fetchMyPrescriptions.fulfilled, (state, action) => {
        state.prescriptions.status = "succeeded";
        state.prescriptions.data = action.payload.records;
        state.prescriptions.pagination = action.payload.pagination;
      })
      .addCase(fetchMyPrescriptions.rejected, (state, action) => {
        state.prescriptions.status = "failed";
        state.prescriptions.error = action.payload;
      });
  },
});

export const { clearVaultData } = patientVaultSlice.actions;
export default patientVaultSlice.reducer;
