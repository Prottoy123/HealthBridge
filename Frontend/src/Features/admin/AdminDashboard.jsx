import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchSystemAnalytics } from "./slices/adminSlice";
import CreateStaffModal from "./component/CreateStaffModal";
import PendingDoctorTable from "./component/PendingDoctorTable";
import UserStatusManager from "./component/UserStatusManager";
import UserMenuDropdown from "../../components/UserMenuDropdown";
import { Shield, Plus, Users, UserCheck, Activity, Calendar, BarChart3, Clock, AlertTriangle } from "lucide-react";

function AdminDashboard() {
  const dispatch = useDispatch();
  const { isFetchingAnalytics, analyticsData } = useSelector((state) => state.admin);

  const [activeTab, setActiveTab] = useState("ANALYTICS");
  const [isStaffModalOpen, setIsStaffModalOpen] = useState(false);

  useEffect(() => {
    dispatch(fetchSystemAnalytics());
  }, [dispatch]);

  const handleTabSwitch = (tabName) => setActiveTab(tabName);
  const openStaffModal = () => setIsStaffModalOpen(true);
  const closeStaffModal = () => setIsStaffModalOpen(false);

  return (
    <main className="relative min-h-screen bg-[#03090a] w-full font-sans text-slate-200">
      
      {/* 1. Header & Actions */}
      <header className="sticky top-0 z-30 flex items-center justify-between px-4 sm:px-8 h-16 sm:h-20 border-b border-white/[0.05] shadow-sm backdrop-blur-md bg-[#03090a]/80">
        <div>
          <h1 className="text-lg sm:text-2xl font-semibold tracking-tight text-slate-200 flex items-center gap-2">
            <Shield className="w-5 h-5 sm:w-7 sm:h-7 text-teal-400" />
            <span className="truncate max-w-[150px] sm:max-w-none">Admin Control Center</span>
          </h1>
          <p className="text-[10px] sm:text-sm font-medium text-slate-500 mt-0.5 hidden sm:block">
            System overview and identity governance
          </p>
        </div>

        <div className="flex items-center gap-2 sm:gap-4 shrink-0">
          <button
            onClick={openStaffModal}
            className="inline-flex items-center justify-center p-2 sm:px-5 sm:py-2.5 text-xs sm:text-sm font-semibold text-slate-900 transition-colors bg-teal-500 rounded-lg hover:bg-teal-600 focus:outline-none"
            title="Provision New Staff"
          >
            <Plus className="w-5 h-5 sm:mr-1.5" />
            <span className="hidden sm:inline">Provision Staff</span>
          </button>
          
          <UserMenuDropdown />
        </div>
      </header>

      <div className="p-4 sm:p-6 md:p-8 max-w-7xl mx-auto space-y-8">
        
        {/* 2. The HUD (Heads Up Display) Grid */}
        <section aria-labelledby="analytics-heading">
          <h2 id="analytics-heading" className="sr-only">System Analytics</h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {isFetchingAnalytics ? (
              // Skeleton Loader State
              <>
                {[1, 2, 3, 4].map((item) => (
                  <div key={item} className="bg-[#051316] rounded-2xl p-6 border border-white/[0.05] shadow-sm flex flex-col justify-between h-32 relative overflow-hidden">
                    <div className="w-24 h-4 bg-white/[0.05] rounded animate-pulse"></div>
                    <div className="w-16 h-8 bg-white/[0.05] rounded animate-pulse mt-4"></div>
                    <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/[0.02] to-transparent animate-[shimmer_1.5s_infinite]"></div>
                  </div>
                ))}
              </>
            ) : (
              // Actual Data State
              <>
                <article className="bg-[#051316] rounded-2xl p-6 border border-white/[0.05] transition-colors hover:bg-white/[0.02] group">
                  <div className="flex justify-between items-start">
                    <h3 className="text-sm font-medium text-slate-400 group-hover:text-slate-300 transition-colors">
                      Total Patients
                    </h3>
                    <div className="p-2 bg-indigo-500/10 rounded-lg border border-indigo-500/20">
                      <Users className="w-5 h-5 text-indigo-400" />
                    </div>
                  </div>
                  <p className="mt-4 text-3xl font-semibold text-slate-200">
                    {analyticsData?.totalPatients || 0}
                  </p>
                </article>

                <article className="bg-[#051316] rounded-2xl p-6 border border-white/[0.05] transition-colors hover:bg-white/[0.02] group">
                  <div className="flex justify-between items-start">
                    <h3 className="text-sm font-medium text-slate-400 group-hover:text-slate-300 transition-colors">
                      Active Doctors
                    </h3>
                    <div className="p-2 bg-blue-500/10 rounded-lg border border-blue-500/20">
                      <UserCheck className="w-5 h-5 text-blue-400" />
                    </div>
                  </div>
                  <p className="mt-4 text-3xl font-semibold text-slate-200">
                    {analyticsData?.totalDoctors || 0}
                  </p>
                </article>

                <article className="bg-[#051316] rounded-2xl p-6 border border-white/[0.05] transition-colors hover:bg-white/[0.02] group relative overflow-hidden">
                  <div className="flex justify-between items-start relative z-10">
                    <h3 className="text-sm font-medium text-slate-400 group-hover:text-slate-300 transition-colors">
                      Pending Approvals
                    </h3>
                    <div className="p-2 bg-amber-500/10 rounded-lg border border-amber-500/20">
                      <AlertTriangle className="w-5 h-5 text-amber-400" />
                    </div>
                  </div>
                  <p className="mt-4 text-3xl font-semibold text-slate-200 relative z-10">
                    {analyticsData?.pendingApprovals || 0}
                  </p>
                  {analyticsData?.pendingApprovals > 0 && (
                    <div className="absolute top-0 right-0 w-24 h-24 bg-amber-500/5 rounded-bl-full -z-0 pointer-events-none blur-xl"></div>
                  )}
                </article>

                <article className="bg-[#051316] rounded-2xl p-6 border border-white/[0.05] transition-colors hover:bg-white/[0.02] group">
                  <div className="flex justify-between items-start">
                    <h3 className="text-sm font-medium text-slate-400 group-hover:text-slate-300 transition-colors">
                      Today's Appointments
                    </h3>
                    <div className="p-2 bg-teal-500/10 rounded-lg border border-teal-500/20">
                      <Calendar className="w-5 h-5 text-teal-400" />
                    </div>
                  </div>
                  <p className="mt-4 text-3xl font-semibold text-slate-200">
                    {analyticsData?.appointmentsToday || 0}
                  </p>
                </article>
              </>
            )}
          </div>
        </section>

        {/* 3. The Navigation Engine (Tab Switcher) */}
        <div className="border-b border-white/[0.05] overflow-x-auto custom-scrollbar">
          <nav className="-mb-px flex space-x-6 sm:space-x-8 min-w-max px-1" aria-label="Tabs">
            <button
              onClick={() => handleTabSwitch("ANALYTICS")}
              className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors duration-200 flex items-center gap-2 ${
                activeTab === "ANALYTICS"
                  ? "border-teal-500 text-teal-400"
                  : "border-transparent text-slate-500 hover:text-slate-300 hover:border-white/[0.2]"
              }`}
            >
              <BarChart3 className="w-4 h-4" /> Detailed Analytics
            </button>
            <button
              onClick={() => handleTabSwitch("PENDING_DOCTORS")}
              className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors duration-200 flex items-center gap-2 ${
                activeTab === "PENDING_DOCTORS"
                  ? "border-teal-500 text-teal-400"
                  : "border-transparent text-slate-500 hover:text-slate-300 hover:border-white/[0.2]"
              }`}
            >
              <Clock className="w-4 h-4" /> Pending Approvals
              {analyticsData?.pendingApprovals > 0 && (
                <span
                  className={`ml-1.5 py-0.5 px-2 rounded-md text-xs font-medium border ${
                    activeTab === "PENDING_DOCTORS"
                      ? "bg-teal-500/10 text-teal-400 border-teal-500/20"
                      : "bg-amber-500/10 text-amber-400 border-amber-500/20"
                  }`}
                >
                  {analyticsData.pendingApprovals}
                </span>
              )}
            </button>
            <button
              onClick={() => handleTabSwitch("USER_MANAGEMENT")}
              className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors duration-200 flex items-center gap-2 ${
                activeTab === "USER_MANAGEMENT"
                  ? "border-teal-500 text-teal-400"
                  : "border-transparent text-slate-500 hover:text-slate-300 hover:border-white/[0.2]"
              }`}
            >
              <Users className="w-4 h-4" /> User Governance
            </button>
          </nav>
        </div>

        {/* 4. The Content Renderer (Lazy Loaded Areas) */}
        <section className="bg-[#051316] rounded-2xl border border-white/[0.05] min-h-[500px] overflow-hidden">
          
          {/* Analytics Zone */}
          {activeTab === "ANALYTICS" && (
            <div className="p-8 flex flex-col items-center justify-center h-[500px] text-center">
              <div className="w-16 h-16 bg-[#03090a] rounded-2xl border border-white/[0.05] flex items-center justify-center mb-4">
                <BarChart3 className="w-8 h-8 text-slate-600" />
              </div>
              <p className="text-lg font-medium text-slate-300">
                Graphical Analytics Coming Soon
              </p>
              <p className="text-sm text-slate-500 mt-1">
                Detailed charts and reports will be integrated here.
              </p>
            </div>
          )}

          {/* Pending Doctors Zone */}
          {activeTab === "PENDING_DOCTORS" && (
            <div className="w-full h-full animate-in fade-in duration-300">
              <PendingDoctorTable />
            </div>
          )}

          {/* User Governance Zone */}
          {activeTab === "USER_MANAGEMENT" && (
            <div className="w-full h-full animate-in fade-in duration-300">
              <UserStatusManager />
            </div>
          )}
        </section>
      </div>

      {/* 5. The Hidden Layer (Modals) */}
      <CreateStaffModal isOpen={isStaffModalOpen} onClose={closeStaffModal} />
    </main>
  );
}

export default AdminDashboard;
