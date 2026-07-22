import { Outlet, NavLink } from "react-router-dom";
import { Users, MessageSquare } from "lucide-react";
import UserMenuDropdown from "../../../components/UserMenuDropdown";

const DoctorLayout = () => {
  return (
    <div className="flex h-screen w-full bg-slate-50">
      {/* 1. The Sidebar (Navigation) */}
      <aside className="w-64 bg-white border-r border-slate-200 flex flex-col">
        <div className="h-16 flex items-center px-6 border-b border-slate-200">
          <h1 className="text-xl font-bold text-slate-800">Doctor Desk</h1>
        </div>

        <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
          <NavLink
            to="/doctor/queue"
            className={({ isActive }) =>
              `flex items-center px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                isActive
                  ? "bg-blue-50 text-blue-700"
                  : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
              }`
            }
          >
            <Users className="w-5 h-5 mr-3" />
            Today's Queue
          </NavLink>

          {/* THE FIX: Changed 'to' path from '/doctor/chat' to '/doctor/messages' */}
          <NavLink
            to="/doctor/messages"
            className={({ isActive }) =>
              `flex items-center px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                isActive
                  ? "bg-blue-50 text-blue-700"
                  : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
              }`
            }
          >
            <MessageSquare className="w-5 h-5 mr-3" />
            Messages
          </NavLink>
        </nav>
      </aside>

      {/* 2. Main Content Area */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        {/* Header: Contains Title and the Global Profile Dropdown */}
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-8 z-10 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-700">
            Workspace Overview
          </h2>

          <UserMenuDropdown />
        </header>

        {/* 3. The Dynamic Workspace (Outlet) */}
        <main className="flex-1 overflow-y-auto p-8 bg-slate-50">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default DoctorLayout;
