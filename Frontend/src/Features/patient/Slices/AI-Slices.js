import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../../services/api";

const initialState = {
  symptomSummary: "",
  isAnalyzingSymptom: false,
  symptomError: null,

  decodedPrescription: null,
  isDecodingPrescription: false,
  prescriptionError: null,
};

export const analyzeSymptoms = createAsyncThunk(
  "ai/analyzeSymptoms",
  async (symptomsText, { rejectWithValue }) => {
    try {
      const response = await api.post("/patient/analyze-symptoms", {
        symptoms: symptomsText,
      });
      return response.data.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to analyze symptoms",
      );
    }
  },
);

// ২. Prescription Decoder (Matches with req.file)
export const decodePrescription = createAsyncThunk(
  "ai/decodePrescription",
  async (imageFile, { rejectWithValue }) => {
    try {
      const formData = new FormData();
      formData.append("prescription", imageFile); // ব্যাকএন্ডের multer 필্ডের নাম অনুযায়ী

      const response = await api.post("/prescription/decode", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      return response.data.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to decode prescription",
      );
    }
  },
);

const aiSlice = createSlice({
  name: "ai",
  initialState,
  reducers: {
    clearSymptomSummary: (state) => {
      state.symptomSummary = "";
      state.symptomError = null;
    },
    clearDecodedPrescription: (state) => {
      state.decodedPrescription = null;
      state.prescriptionError = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // --- Symptom Analyzer ---
      .addCase(analyzeSymptoms.pending, (state) => {
        state.isAnalyzingSymptom = true;
        state.symptomError = null;
      })
      .addCase(analyzeSymptoms.fulfilled, (state, action) => {
        state.isAnalyzingSymptom = false;
        state.symptomSummary = action.payload;
      })
      .addCase(analyzeSymptoms.rejected, (state, action) => {
        state.isAnalyzingSymptom = false;
        state.symptomError = action.payload;
      })

      // --- Prescription Decoder ---
      .addCase(decodePrescription.pending, (state) => {
        state.isDecodingPrescription = true;
        state.prescriptionError = null;
      })
      .addCase(decodePrescription.fulfilled, (state, action) => {
        state.isDecodingPrescription = false;
        state.decodedPrescription = action.payload;
      })
      .addCase(decodePrescription.rejected, (state, action) => {
        state.isDecodingPrescription = false;
        state.prescriptionError = action.payload;
      });
  },
});

export const { clearSymptomSummary, clearDecodedPrescription } =
  aiSlice.actions;
export default aiSlice.reducer;
