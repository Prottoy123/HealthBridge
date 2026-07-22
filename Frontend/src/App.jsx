import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import RequireAuth from "./components/guards/RequireAuth";
import RoleGuard from "./components/guards/Rolegaurd";
import ForceChangeGuard from "./components/guards/ForceChangeGuard";

import IdentityManager from "./components/IdentityManager";
import SetupPassword from "./components/SetupPassword";

import Login from "./Features/auth/Login";
import Register from "./Features/auth/Register";

// Admin Import
import AdminDashboard from "./Features/admin/AdminDashboard";
// Staff Import
import LiveDeskManager from "./Features/staff/LiveDeskManager";
import StaffLayout from "./Features/staff/component/StaffLayout";
import ReportManager from "./Features/staff/ReportManager";
import SlotManager from "./Features/staff/component/SlotManager";

// Doctor Import
import DoctorLayout from "./Features/doctor/component/DoctorLayout"; // Added DoctorLayout
import QueueViewer from "./Features/doctor/QueueViewer";
import DoctorProfile from "./Features/doctor/component/DoctorProfile";
import ConsultationDesk from "./Features/doctor/component/ConsultationDesk";
import Messages from "./Features/doctor/Messages";

import ChatInterface from "./Features/chat/ChatInterFace";

// Patient Import
import GetDoctorList from "./Features/patient/Components/GetDoctorList";
import PatientDashboard from "./Features/patient/PatientDashboard";
import PatientProfileSettings from "./Features/patient/Components/PatientProfileSettings";
import AiSymptomBot from "./Features/patient/Components/AiSymptomBot";
import BookAppointment from "./Features/patient/Components/BookAppointment";

const App = () => {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public Routes - Outside RequireAuth */}
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
              <div className="p-6 bg-gray-50 min-h-screen">
                <IdentityManager />
              </div>
            }
          />

          {/* Patient Only Routes */}
          <Route element={<RoleGuard allowedRoles={["PATIENT"]} />}>
            <Route path="/patient/dashboard" element={<PatientDashboard />} />
            <Route
              path="/patient/settings"
              element={<PatientProfileSettings />}
            />
            <Route path="/patient/get-doctors" element={<GetDoctorList />} />
            <Route
              path="/patient/analyze-symptoms"
              element={<AiSymptomBot />}
            />
            <Route
              path="/patient/book-appointment"
              element={<BookAppointment />}
            />
            <Route
              path="/patient/messages/:appointmentId"
              element={<ChatInterface />}
            />
          </Route>

          {/* === DOCTOR NESTED ROUTING ARCHITECTURE === */}
          <Route element={<RoleGuard allowedRoles={["DOCTOR"]} />}>
            <Route path="/doctor" element={<DoctorLayout />}>
              {/* Default Redirect to Queue */}
              <Route index element={<Navigate to="queue" replace />} />
              <Route path="queue" element={<QueueViewer />} />
              <Route path="doctor-profile" element={<DoctorProfile />} />

              {/* Future Routes (Keep these ready for next phases) */}
              <Route
                path="consultation/:appointmentId"
                element={<ConsultationDesk />}
              />
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
              <Route path="/staff/upload-reports" element={<ReportManager />} />
            </Route>
          </Route>

          {/* Admin Only Routes */}
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
