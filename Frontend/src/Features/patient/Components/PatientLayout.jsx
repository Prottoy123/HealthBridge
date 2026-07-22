import { Outlet } from "react-router-dom";
import UserMenuDropdown from "../common/UserMenuDropdown";
// import PatientSidebar from "./PatientSidebar"; // Assuming you have a sidebar component

const PatientLayout = () => {
  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      {/* Sidebar - Fixed */}
      {/* <PatientSidebar className="hidden md:flex w-64 flex-col" /> */}

      <div className="flex flex-col flex-1 w-full">
        {/* Top Header - Fixed */}
        <header className="flex h-16 items-center justify-between px-6 bg-white border-b border-gray-200">
          <div className="md:hidden">
            {/* Mobile Menu Toggle Button */}
            <span className="font-bold text-xl text-blue-600">
              HealthBridge
            </span>
          </div>
          <div className="hidden md:block">
            <h1 className="text-xl font-semibold text-gray-800">
              Patient Portal
            </h1>
          </div>

          <div className="flex items-center gap-4">
            {/* Global User Menu - Implemented as per docs */}
            <UserMenuDropdown />
          </div>
        </header>

        {/* Main Content Area - Dynamic Outlet */}
        <main className="flex-1 overflow-y-auto p-4 md:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default PatientLayout;
