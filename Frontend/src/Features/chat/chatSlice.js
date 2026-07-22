import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../services/api";

// 1. ASYNC THUNK: Fetching Chat History from Backend
export const fetchChatHistory = createAsyncThunk(
  "chat/fetchChatHistory",
  async ({ appointmentId, page = 1 }, { rejectWithValue }) => {
    try {
      const response = await api.get(
        `/chat/history/${appointmentId}?page=${page}`,
      );

      const { messages, pagination } = response.data.data;

      return {
        messages: messages.reverse(),
        pagination: {
          currentPage: pagination.currentPage,
          totalPages: pagination.totalPages,
          hasNextPage: pagination.hasNextPage,
        },
        isFirstPage: page === 1,
      };
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to load chat history",
      );
    }
  },
);

// 2. INITIAL STATE: The Memory Blueprint
const initialState = {
  messages: [],
  pagination: {
    currentPage: 1,
    totalPages: 1,
    hasNextPage: false,
  },
  isLoading: false,
  isFetchingMore: false,
  error: null,
};

const chatSlice = createSlice({
  name: "chat",
  initialState,
  reducers: {
    // 3. SYNCHRONOUS: Inject Live Message from Socket
    addLiveMessage: (state, action) => {
      state.messages.push(action.payload);
    },

    // 4. SYNCHRONOUS: Update Blue-Tick (Seen Status)
    updateMessageStatus: (state, action) => {
      const { messageId } = action.payload;
      const messageIndex = state.messages.findIndex(
        (msg) => msg._id === messageId,
      );
      if (messageIndex !== -1) {
        state.messages[messageIndex].isRead = true;
      }
    },

    // 5. SYNCHRONOUS: Memory Leak Prevention
    clearChatMemory: (state) => {
      state.messages = [];
      state.pagination = { currentPage: 1, totalPages: 1, hasNextPage: false };
      state.isLoading = false;
      state.isFetchingMore = false;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchChatHistory.pending, (state, action) => {
        if (action.meta.arg.page === 1) {
          state.isLoading = true;
        } else {
          state.isFetchingMore = true;
        }
        state.error = null;
      })
      .addCase(fetchChatHistory.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isFetchingMore = false;

        const { messages, pagination, isFirstPage } = action.payload;

        if (isFirstPage) {
          state.messages = messages;
        } else {
          state.messages = [...messages, ...state.messages];
        }

        state.pagination = pagination;
      })
      .addCase(fetchChatHistory.rejected, (state, action) => {
        state.isLoading = false;
        state.isFetchingMore = false;
        state.error = action.payload;
      });
  },
});

export const { addLiveMessage, updateMessageStatus, clearChatMemory } =
  chatSlice.actions;
export default chatSlice.reducer;
