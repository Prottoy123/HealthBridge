import React, { useState } from "react";
import { Outlet, NavLink, useLocation, useNavigate } from "react-router-dom";
import { Users, MessageSquare, Activity, Menu, X, ArrowLeft } from "lucide-react";
import UserMenuDropdown from "../../../components/UserMenuDropdown";

const DoctorLayout = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const isDashboard = location.pathname === "/doctor/queue" || location.pathname === "/doctor";

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  return (
    <div className="flex h-screen w-full bg-[#03090a] text-slate-200 overflow-hidden font-sans selection:bg-teal-500/30">
      
      {/* Mobile Overlay */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 md:hidden transition-opacity"
          onClick={closeMobileMenu}
        />
      )}

      {/* 1. The Sidebar (Navigation) */}
      <aside 
        className={`fixed inset-y-0 left-0 w-64 bg-[#051316] border-r border-white/[0.05] flex flex-col z-50 transform transition-transform duration-300 md:relative md:translate-x-0 ${
          isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="h-20 flex items-center justify-between px-6 border-b border-white/[0.05]">
          <div className="flex items-center gap-3">
             <div className="w-8 h-8 rounded-lg bg-teal-500/10 border border-teal-500/20 flex items-center justify-center">
               <Activity className="w-4 h-4 text-teal-400" />
             </div>
            <h1 className="text-xl font-semibold text-slate-200 tracking-tight">DocOS</h1>
          </div>
          <button 
            onClick={closeMobileMenu}
            className="md:hidden text-slate-400 hover:text-white focus:outline-none"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <nav className="flex-1 py-6 px-3 space-y-1">
          <p className="px-3 text-xs font-medium text-slate-500 mb-3">Workspace</p>
          
          <NavLink
            to="/doctor/queue"
            onClick={closeMobileMenu}
            className={({ isActive }) =>
              `flex items-center px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                isActive
                  ? "bg-teal-500/10 text-teal-400"
                  : "text-slate-400 hover:bg-white/[0.05] hover:text-slate-200"
              }`
            }
          >
            <Users className="w-5 h-5 mr-3" />
            Today's Queue
          </NavLink>

          <NavLink
            to="/doctor/messages"
            onClick={closeMobileMenu}
            className={({ isActive }) =>
              `flex items-center px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                isActive
                  ? "bg-teal-500/10 text-teal-400"
                  : "text-slate-400 hover:bg-white/[0.05] hover:text-slate-200"
              }`
            }
          >
            <MessageSquare className="w-5 h-5 mr-3" />
            Secure Comms
          </NavLink>
        </nav>
        
        {/* Connection Status Indicator */}
        <div className="p-4 border-t border-white/[0.05]">
           <div className="flex items-center gap-2 bg-[#03090a] px-3 py-2 rounded-lg border border-white/[0.02]">
             <div className="w-2 h-2 rounded-full bg-teal-500"></div>
             <span className="text-xs font-medium text-slate-400">System Online</span>
           </div>
        </div>
      </aside>

      {/* 2. Main Content Area */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden relative z-10 w-full">
        
        {/* Header: Contains Title and the Global Profile Dropdown */}
        <header className="h-20 bg-[#03090a] border-b border-white/[0.05] flex items-center justify-between px-4 md:px-8 z-30 shrink-0">
          <div className="flex items-center gap-4">
            <button 
              onClick={toggleMobileMenu}
              className="md:hidden text-slate-400 hover:text-white focus:outline-none p-1 rounded-lg hover:bg-white/[0.05] transition-colors"
            >
              <Menu className="w-6 h-6" />
            </button>

            {!isDashboard && (
              <button 
                onClick={() => navigate(-1)}
                className="w-10 h-10 flex items-center justify-center rounded-xl bg-[#051316] hover:bg-white/[0.05] border border-white/[0.05] text-slate-400 hover:text-white transition-colors shrink-0"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
            )}

            <div>
              <h2 className="text-lg font-semibold text-slate-200">
                Command Center
              </h2>
              <p className="text-xs text-slate-500 mt-0.5 hidden sm:block">End-to-End Encrypted Terminal</p>
            </div>
          </div>

          <div className="flex items-center relative shrink-0">
            <UserMenuDropdown />
          </div>
        </header>

        {/* 3. The Dynamic Workspace (Outlet) */}
        <main className="flex-1 overflow-y-auto custom-scrollbar relative p-4 md:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default DoctorLayout;
