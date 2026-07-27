import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import RequireAuth from "./components/guards/RequireAuth";
import RoleGuard from "./components/guards/Rolegaurd";
import ForceChangeGuard from "./components/guards/ForceChangeGuard";

import IdentityManager from "./components/IdentityManager";
import SetupPassword from "./components/SetupPassword";

import Login from "./Features/auth/Login";
import Register from "./Features/auth/Register";

import Home from "./Features/Home/Home";

// Admin Import
import AdminDashboard from "./Features/admin/AdminDashboard";

// Staff Import
import LiveDeskManager from "./Features/staff/LiveDeskManager";
import StaffLayout from "./Features/staff/component/StaffLayout";
import ReportManager from "./Features/staff/ReportManager";
import SlotManager from "./Features/staff/component/SlotManager";

// Doctor Import
import DoctorLayout from "./Features/doctor/component/DoctorLayout";
import QueueViewer from "./Features/doctor/QueueViewer";
import DoctorProfile from "./Features/doctor/component/DoctorProfile";
import ConsultationDesk from "./Features/doctor/component/ConsultationDesk";
import Messages from "./Features/doctor/Messages";

// Global Chat Interface
import ChatInterface from "./Features/chat/ChatInterFace";

// Patient Import
import PatientLayout from "./Features/patient/Components/PatientLayout"; // (নতুন) সাইডবার ও হেডারের জন্য
import PatientDashboard from "./Features/patient/PatientDashboard";
import GetDoctorList from "./Features/patient/Components/GetDoctorList";
import PatientProfileSettings from "./Features/patient/Components/PatientProfileSettings";
import BookAppointment from "./Features/patient/Components/BookAppointment";
import Vault from "./Features/patient/Vault";
import PatientMessages from "./Features/patient/PatientMessages"

const App = () => {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public Routes - Outside RequireAuth */}
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Protected Routes - Inside RequireAuth */}
        <Route element={<RequireAuth />}>
          <Route element={<RoleGuard allowedRoles={["STAFF", "ADMIN"]} />}>
            <Route path="/setup-password" element={<SetupPassword />} />
          </Route>

          <Route
            path="/identity-manager"
            element={
              <div className="p-4 sm:p-6 lg:p-8 bg-[#03090a] min-h-screen">
                <IdentityManager />
              </div>
            }
          />

          {/* === PATIENT NESTED ROUTING ARCHITECTURE (FIXED) === */}
          <Route element={<RoleGuard allowedRoles={["PATIENT"]} />}>
            {/* PatientLayout এর মাধ্যমে গ্লোবাল হেডার/সাইডবার প্রটেক্ট করা হলো */}
            <Route path="/patient" element={<PatientLayout />}>
              <Route index element={<Navigate to="dashboard" replace />} />

              <Route path="dashboard" element={<PatientDashboard />} />
              <Route path="settings" element={<PatientProfileSettings />} />
              <Route path="get-doctors" element={<GetDoctorList />} />
              <Route path="book-appointment" element={<BookAppointment />} />
              <Route path="vault" element={<Vault />} />

              {/* The Patient Inbox & Chat Engine */}
              <Route
                path="messages/:appointmentId"
                element={<ChatInterface />}
              />
              <Route path="messages" element={<PatientMessages />} />
            </Route>
          </Route>

          {/* === DOCTOR NESTED ROUTING ARCHITECTURE === */}
          <Route element={<RoleGuard allowedRoles={["DOCTOR"]} />}>
            <Route path="/doctor" element={<DoctorLayout />}>
              <Route index element={<Navigate to="queue" replace />} />
              <Route path="queue" element={<QueueViewer />} />
              <Route path="doctor-profile" element={<DoctorProfile />} />
              <Route
                path="consultation/:appointmentId"
                element={<ConsultationDesk />}
              />

              {/* Doctor Inbox & Chat Engine */}
              <Route path="messages" element={<Messages />} />
              <Route
                path="messages/:appointmentId"
                element={<ChatInterface />}
              />
            </Route>
          </Route>

          {/* === STAFF NESTED ROUTING ARCHITECTURE === */}
          <Route element={<RoleGuard allowedRoles={["STAFF"]} />}>
            <Route
              path="/staff"
              element={
                <ForceChangeGuard>
                  <StaffLayout />
                </ForceChangeGuard>
              }
            >
              <Route index element={<Navigate to="dashboard" replace />} />
              <Route path="dashboard" element={<LiveDeskManager />} />
              <Route path="slot-manager" element={<SlotManager />} />
              <Route path="upload-reports" element={<ReportManager />} />
            </Route>
          </Route>

          {/* === ADMIN NESTED ROUTING ARCHITECTURE === */}
          <Route element={<RoleGuard allowedRoles={["ADMIN"]} />}>
            <Route
              path="/admin/dashboard"
              element={
                <ForceChangeGuard>
                  <AdminDashboard />
                </ForceChangeGuard>
              }
            />
          </Route>
        </Route>
      </Routes>
    </BrowserRouter>
  );
};

export default App;
