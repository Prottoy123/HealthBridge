import { Outlet, Link, useLocation, useNavigate } from "react-router-dom";
import UserMenuDropdown from "../../../components/UserMenuDropdown";
import { Activity, ArrowLeft } from "lucide-react";

const PatientLayout = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const isActive = (path) => location.pathname.includes(path);
  const isDashboard = location.pathname === "/patient/dashboard" || location.pathname === "/patient";

  return (
    <div className="flex h-screen bg-[#03090a] font-sans selection:bg-teal-500/30 selection:text-teal-100 overflow-hidden relative text-slate-200">
      
      <div className="flex flex-col flex-1 w-full relative z-10">
        {/* Top Header - Fixed & Glassmorphic */}
        <header className="flex flex-col md:flex-row h-auto md:h-20 items-center justify-between px-6 py-4 md:py-0 bg-[#03090a]/80 backdrop-blur-xl border-b border-white/[0.05] gap-4 md:gap-0 z-50 shrink-0">
          
          {/* Logo & Title */}
          <div className="flex items-center justify-between w-full md:w-auto gap-3">
            <div className="flex md:hidden items-center gap-2">
              {!isDashboard && (
                <button onClick={() => navigate(-1)} className="w-10 h-10 flex items-center justify-center rounded-xl bg-[#051316] hover:bg-white/[0.05] border border-white/[0.05] text-slate-400 hover:text-white transition-colors">
                  <ArrowLeft className="w-5 h-5" />
                </button>
              )}
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-teal-500/10 border border-teal-500/20 text-teal-400 font-bold">
                <Activity className="w-5 h-5" />
              </div>
              <span className="text-xl font-bold tracking-tight text-slate-200">
                Health<span className="text-teal-400">Bridge</span>
              </span>
            </div>
            
            <div className="hidden md:flex items-center gap-2">
              {!isDashboard && (
                <button onClick={() => navigate(-1)} className="w-10 h-10 flex items-center justify-center rounded-xl bg-[#051316] hover:bg-white/[0.05] border border-white/[0.05] text-slate-400 hover:text-white transition-colors mr-1">
                  <ArrowLeft className="w-5 h-5" />
                </button>
              )}
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-teal-500/10 border border-teal-500/20 text-teal-400 font-bold">
                <Activity className="w-5 h-5" />
              </div>
              <span className="text-xl font-bold tracking-tight text-slate-200">
                Health<span className="text-teal-400">Bridge</span>
              </span>
            </div>

            <div className="flex items-center gap-4 md:hidden">
              <UserMenuDropdown />
            </div>
          </div>

          {/* Dynamic Navigation Menu */}
          <nav className="flex items-center space-x-2 bg-[#051316] p-1.5 rounded-xl border border-white/[0.05] w-full md:w-auto overflow-x-auto custom-scrollbar">
            <Link
              to="/patient/dashboard"
              className={`px-5 py-2 rounded-lg text-sm font-semibold whitespace-nowrap transition-colors ${
                isActive("/dashboard")
                  ? "bg-teal-500/10 text-teal-400"
                  : "text-slate-400 hover:text-slate-200 hover:bg-white/[0.05]"
              }`}
            >
              Dashboard
            </Link>

            <Link
              to="/patient/history"
              className={`px-5 py-2 rounded-lg text-sm font-semibold whitespace-nowrap transition-colors ${
                isActive("/history")
                  ? "bg-teal-500/10 text-teal-400"
                  : "text-slate-400 hover:text-slate-200 hover:bg-white/[0.05]"
              }`}
            >
              Appointment History
            </Link>

            <Link
              to="/patient/messages"
              className={`px-5 py-2 rounded-lg text-sm font-semibold whitespace-nowrap transition-colors ${
                isActive("/messages")
                  ? "bg-teal-500/10 text-teal-400"
                  : "text-slate-400 hover:text-slate-200 hover:bg-white/[0.05]"
              }`}
            >
              Messages
            </Link>
          </nav>

          {/* User Menu */}
          <div className="flex items-center gap-4 hidden md:flex">
            <UserMenuDropdown />
          </div>
        </header>

        {/* Main Content Area - Dynamic Outlet */}
        <main className="flex-1 overflow-y-auto p-4 md:p-6 custom-scrollbar bg-[#03090a]">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default PatientLayout;
