import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../../services/api"; 

// ১. Thunk: Fetch Medical Records (Vault)
export const fetchPatientRecords = createAsyncThunk(
  "patientHistory/fetchPatientRecords",
  async ({ patientId, page = 1, limit = 10 }, { rejectWithValue }) => {
    try {
      const response = await api.get(
        `/medical-records/patient/${patientId}?page=${page}&limit=${limit}`,
      );
      return response.data.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to load medical records",
      );
    }
  },
);

// ২. Thunk: Fetch Prescriptions
export const fetchPatientPrescriptions = createAsyncThunk(
  "patientHistory/fetchPatientPrescriptions",
  async ({ patientId, page = 1, limit = 10 }, { rejectWithValue }) => {
    try {
      const response = await api.get(
        `/prescription/patient/${patientId}?page=${page}&limit=${limit}`,
      );
      return response.data.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to load prescriptions",
      );
    }
  },
);

const initialState = {
  // Records State
  records: [],
  recordsPagination: {},
  isRecordsLoading: false,
  recordsError: null,

  // Prescriptions State
  prescriptions: [],
  prescriptionsPagination: {},
  isPrescriptionsLoading: false,
  prescriptionsError: null,
};

const patientHistorySlice = createSlice({
  name: "patientHistory",
  initialState,
  reducers: {
    clearPatientHistory: (state) => {
      state.records = [];
      state.recordsPagination = {};
      state.recordsError = null;

      state.prescriptions = [];
      state.prescriptionsPagination = {};
      state.prescriptionsError = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // --- Records Handlers ---
      .addCase(fetchPatientRecords.pending, (state) => {
        state.isRecordsLoading = true;
        state.recordsError = null;
      })
      .addCase(fetchPatientRecords.fulfilled, (state, action) => {
        state.isRecordsLoading = false;
        state.records = action.payload.records;
        state.recordsPagination = action.payload.pagination;
      })
      .addCase(fetchPatientRecords.rejected, (state, action) => {
        state.isRecordsLoading = false;
        state.recordsError = action.payload;
      })

      // --- Prescriptions Handlers ---
      .addCase(fetchPatientPrescriptions.pending, (state) => {
        state.isPrescriptionsLoading = true;
        state.prescriptionsError = null;
      })
      .addCase(fetchPatientPrescriptions.fulfilled, (state, action) => {
        state.isPrescriptionsLoading = false;
        state.prescriptions = action.payload.records;
        state.prescriptionsPagination = action.payload.pagination;
      })
      .addCase(fetchPatientPrescriptions.rejected, (state, action) => {
        state.isPrescriptionsLoading = false;
        state.prescriptionsError = action.payload;
      });
  },
});

export const { clearPatientHistory } = patientHistorySlice.actions;
export default patientHistorySlice.reducer;
