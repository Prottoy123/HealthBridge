import { configureStore, combineReducers } from "@reduxjs/toolkit";
import {
  persistStore,
  persistReducer,
  FLUSH,
  REHYDRATE,
  PAUSE,
  PERSIST,
  PURGE,
  REGISTER,
} from "redux-persist";

import storageModule from "redux-persist/lib/storage";

//AUTHENTICATION
import authReducer from "../Features/auth/authSlice";

//CHAT
import chatReducer from "../Features/chat/chatSlice";

//PATIENT ROLE
import patientReducer from "../Features/patient/Slices/patientSlice";
import appointmentSlice from "../Features/patient/Slices/appointmentSlice";
import appointmentHistoryReducer from "../Features/patient/Slices/appointmentHistorySlice";
import aiReducer from "../Features/patient/Slices/AI-Slices";
import patientVaultReducer from "../Features/patient/Slices/patientVaultSlice";
import patientInboxReducer from "../Features/patient/Slices/patientInboxSlice";

//DOCTOR ROLE
import doctorListReducer from "../Features/patient/Slices/doctorListSlice";
import doctorProfileSlice from "../Features/doctor/Slices/doctorProfileSlice";
import doctorReducer from "../Features/doctor/Slices/doctorSlice";
import PatientHistoryReducer from "../Features/doctor/Slices/PatientHistorySlice";

//ADMIN ROLE
import adminReducer from "../Features/admin/slices/adminSlice";
import userGovernanceReducer from "../Features/admin/slices/userGovernanceSlice";
import adminStaffReducer from "../Features/admin/slices/staffProvisioningSlice";

//STAFF ROLE
import SlotReducer from "../Features/staff/Slices/SlotSlice";
import staffReducer from "../Features/staff/Slices/staffSlice";

// Vite/ESM CommonJS Interop adjustment for redux-persist
const storage = storageModule?.default || storageModule;

const rootReducer = combineReducers({
  auth: authReducer,
  patient: patientReducer,
  patientVault: patientVaultReducer,
  patientInbox: patientInboxReducer,
  appointmentHistory: appointmentHistoryReducer,
  doctorList: doctorListReducer,
  admin: adminReducer,
  adminStaff: adminStaffReducer,
  userGovernance: userGovernanceReducer,
  doctorProfile: doctorProfileSlice,
  patientHistory: PatientHistoryReducer,
  doctor: doctorReducer, 
  appointment: appointmentSlice,
  ai: aiReducer,
  slot: SlotReducer,
  staff: staffReducer,
  chat: chatReducer,
});

const persistConfig = {
  key: "root",
  version: 1,
  storage,
  whitelist: ["auth"], // persist auth slice
};

const persistedReducer = persistReducer(persistConfig, rootReducer);

export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
      },
    }),
});

export const persistor = persistStore(store);
