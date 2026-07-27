import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../../services/api";

const initialState = {
  activeFollowups: [], 
  pastHistory: [], 
  status: "idle", 
  error: null,
};

export const fetchPatientFollowups = createAsyncThunk(
  "inbox/fetchPatientFollowups",
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get("/chat/patient-followups");
      return response.data.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch chat history.",
      );
    }
  },
);

const patientInboxSlice = createSlice({
  name: "patientInbox",
  initialState,
  reducers: {
    clearInboxData: (state) => {
      state.activeFollowups = [];
      state.pastHistory = [];
      state.status = "idle";
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchPatientFollowups.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(fetchPatientFollowups.fulfilled, (state, action) => {
        state.status = "succeeded";

        const allFollowups = action.payload;
        const currentTime = new Date().getTime();

        const active = [];
        const past = [];

        allFollowups.forEach((chat) => {
          const expireTime = new Date(chat.expiresAt).getTime();

          if (chat.status === "ACTIVE" && currentTime < expireTime) {
            active.push(chat);
          } else {
            past.push(chat);
          }
        });

        state.activeFollowups = active;
        state.pastHistory = past;
      })
      .addCase(fetchPatientFollowups.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
      });
  },
});

export const { clearInboxData } = patientInboxSlice.actions;
export default patientInboxSlice.reducer;
