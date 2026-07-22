import { Outlet, NavLink } from "react-router-dom";
import { LayoutDashboard, CalendarClock, FileText } from "lucide-react";
// SURGICAL FIX: Import the global UserMenuDropdown component
// Adjust the path according to your actual folder structure (e.g., ../common/UserMenuDropdown)
import UserMenuDropdown from "../../../components/UserMenuDropdown";

const StaffLayout = () => {
  return (
    <div className="flex h-screen bg-gray-50">
      {/* 1. Fixed Sidebar (The Command Palette) */}
      <aside className="w-64 bg-white border-r border-gray-200 flex flex-col z-20 shadow-sm">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-800">Staff Desk</h2>
        </div>

        <nav className="flex-1 p-4 space-y-2">
          <NavLink
            to="/staff/dashboard"
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-colors ${
                isActive
                  ? "bg-blue-50 text-blue-700"
                  : "text-gray-600 hover:bg-gray-100"
              }`
            }
          >
            <LayoutDashboard size={20} />
            Live Desk
          </NavLink>

          <NavLink
            to="/staff/slot-manager"
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-colors ${
                isActive
                  ? "bg-blue-50 text-blue-700"
                  : "text-gray-600 hover:bg-gray-100"
              }`
            }
          >
            <CalendarClock size={20} />
            Slot Manager
          </NavLink>

          <NavLink
            to="/staff/upload-reports"
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-colors ${
                isActive
                  ? "bg-blue-50 text-blue-700"
                  : "text-gray-600 hover:bg-gray-100"
              }`
            }
          >
            <FileText size={20} />
            Lab Reports
          </NavLink>
        </nav>
      </aside>

      {/* 2. Main Canvas (The Dynamic Viewport) */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden">
        {/* SURGICAL FIX: The Global Top Header */}
        <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-end px-8 shadow-sm relative z-30">
          {/* 
             The dropdown is rendered here. 
             z-30 ensures the dropdown menu items float over the tables and charts below. 
           */}
          <UserMenuDropdown />
        </header>

        {/* Dynamic Outlet Area */}
        <div className="flex-1 overflow-y-auto p-6 relative z-10 bg-gray-50/50">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default StaffLayout;
