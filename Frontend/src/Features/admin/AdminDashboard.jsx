import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchSystemAnalytics } from "./slices/adminSlice";
import CreateStaffModal from "./component/CreateStaffModal";
import PendingDoctorTable from "./component/PendingDoctorTable";
import UserStatusManager from "./component/UserStatusManager";
import UserMenuDropdown from "../../components/UserMenuDropdown";

function AdminDashboard() {
  const dispatch = useDispatch();
  const { isFetchingAnalytics, analyticsData } = useSelector(
    (state) => state.admin,
  );

  const [activeTab, setActiveTab] = useState("ANALYTICS");
  const [isStaffModalOpen, setIsStaffModalOpen] = useState(false);

  useEffect(() => {
    dispatch(fetchSystemAnalytics());
  }, [dispatch]);

  const handleTabSwitch = (tabName) => {
    setActiveTab(tabName);
  };

  const openStaffModal = () => {
    setIsStaffModalOpen(true);
  };

  const closeStaffModal = () => {
    setIsStaffModalOpen(false);
  };

  return (
    <main className="relative min-h-screen bg-gray-50/50 w-full font-sans text-gray-900">
      {/* 1. Header & Actions */}
      <header className="sticky top-0 z-30 flex flex-col sm:flex-row justify-between items-start sm:items-center px-6 py-5 border-b border-gray-200 shadow-sm backdrop-blur-sm bg-white/90">
        <div className="mb-4 sm:mb-0">
          <h1 className="text-2xl font-extrabold tracking-tight text-gray-900">
            Admin Control Center
          </h1>
          <p className="text-sm font-medium text-gray-500 mt-1">
            System overview and identity governance
          </p>
        </div>

        {/* দ্য ইন্টিগ্রেশন জোন: Flexbox দিয়ে বাটন এবং ড্রপডাউনকে পাশাপাশি বসানো হয়েছে */}
        <div className="flex items-center space-x-4">
          <button
            onClick={openStaffModal}
            className="inline-flex items-center justify-center px-5 py-2.5 text-sm font-semibold text-white transition-all duration-200 bg-blue-600 border border-transparent rounded-lg shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-600 active:scale-95"
          >
            <svg
              className="w-4 h-4 mr-2 -ml-1"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M12 6v6m0 0v6m0-6h6m-6 0H6"
              ></path>
            </svg>
            Provision New Staff
          </button>

          {/* দ্য গ্লোবাল আইডেন্টিটি আইকন */}
          <UserMenuDropdown />
        </div>
      </header>

      <div className="p-6 max-w-7xl mx-auto space-y-8">
        {/* 2. The HUD (Heads Up Display) Grid */}
        <section aria-labelledby="analytics-heading">
          <h2 id="analytics-heading" className="sr-only">
            System Analytics
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {isFetchingAnalytics ? (
              // Skeleton Loader State
              <>
                {[1, 2, 3, 4].map((item) => (
                  <div
                    key={item}
                    className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm flex flex-col justify-between h-32 relative overflow-hidden"
                  >
                    <div className="w-24 h-4 bg-gray-200 rounded animate-pulse"></div>
                    <div className="w-16 h-8 bg-gray-200 rounded animate-pulse mt-4"></div>
                    {/* Shimmer effect overlay */}
                    <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/40 to-transparent animate-[shimmer_1.5s_infinite]"></div>
                  </div>
                ))}
              </>
            ) : (
              // Actual Data State
              <>
                <article className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm hover:shadow-md transition-shadow duration-200 group">
                  <div className="flex justify-between items-start">
                    <h3 className="text-sm font-medium text-gray-500 group-hover:text-gray-700 transition-colors">
                      Total Patients
                    </h3>
                    <div className="p-2 bg-indigo-50 rounded-lg">
                      <svg
                        className="w-5 h-5 text-indigo-600"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                        ></path>
                      </svg>
                    </div>
                  </div>
                  <p className="mt-4 text-3xl font-bold text-gray-900">
                    {analyticsData?.totalPatients || 0}
                  </p>
                </article>

                <article className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm hover:shadow-md transition-shadow duration-200 group">
                  <div className="flex justify-between items-start">
                    <h3 className="text-sm font-medium text-gray-500 group-hover:text-gray-700 transition-colors">
                      Active Doctors
                    </h3>
                    <div className="p-2 bg-blue-50 rounded-lg">
                      <svg
                        className="w-5 h-5 text-blue-600"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                        ></path>
                      </svg>
                    </div>
                  </div>
                  <p className="mt-4 text-3xl font-bold text-gray-900">
                    {analyticsData?.totalDoctors || 0}
                  </p>
                </article>

                <article className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm hover:shadow-md transition-shadow duration-200 group relative overflow-hidden">
                  <div className="flex justify-between items-start relative z-10">
                    <h3 className="text-sm font-medium text-gray-500 group-hover:text-gray-700 transition-colors">
                      Pending Approvals
                    </h3>
                    <div className="p-2 bg-yellow-50 rounded-lg">
                      <svg
                        className="w-5 h-5 text-yellow-600"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                        ></path>
                      </svg>
                    </div>
                  </div>
                  <p className="mt-4 text-3xl font-bold text-gray-900 relative z-10">
                    {analyticsData?.pendingApprovals || 0}
                  </p>
                  {analyticsData?.pendingApprovals > 0 && (
                    <div className="absolute top-0 right-0 w-16 h-16 bg-yellow-100 rounded-bl-full -z-0 opacity-50"></div>
                  )}
                </article>

                <article className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm hover:shadow-md transition-shadow duration-200 group">
                  <div className="flex justify-between items-start">
                    <h3 className="text-sm font-medium text-gray-500 group-hover:text-gray-700 transition-colors">
                      Today's Appointments
                    </h3>
                    <div className="p-2 bg-green-50 rounded-lg">
                      <svg
                        className="w-5 h-5 text-green-600"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                        ></path>
                      </svg>
                    </div>
                  </div>
                  <p className="mt-4 text-3xl font-bold text-gray-900">
                    {analyticsData?.appointmentsToday || 0}
                  </p>
                </article>
              </>
            )}
          </div>
        </section>

        {/* 3. The Navigation Engine (Tab Switcher) */}
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8" aria-label="Tabs">
            <button
              onClick={() => handleTabSwitch("ANALYTICS")}
              className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors duration-200 ${
                activeTab === "ANALYTICS"
                  ? "border-blue-500 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              Detailed Analytics
            </button>
            <button
              onClick={() => handleTabSwitch("PENDING_DOCTORS")}
              className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors duration-200 flex items-center ${
                activeTab === "PENDING_DOCTORS"
                  ? "border-blue-500 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              Pending Doctor Approvals
              {analyticsData?.pendingApprovals > 0 && (
                <span
                  className={`ml-2 py-0.5 px-2.5 rounded-full text-xs font-medium ${
                    activeTab === "PENDING_DOCTORS"
                      ? "bg-blue-100 text-blue-700"
                      : "bg-red-100 text-red-600"
                  }`}
                >
                  {analyticsData.pendingApprovals}
                </span>
              )}
            </button>
            <button
              onClick={() => handleTabSwitch("USER_MANAGEMENT")}
              className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors duration-200 ${
                activeTab === "USER_MANAGEMENT"
                  ? "border-blue-500 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              User Governance
            </button>
          </nav>
        </div>

        {/* 4. The Content Renderer (Lazy Loaded Areas) */}
        <section className="bg-white rounded-xl shadow-sm border border-gray-200 min-h-[500px] overflow-hidden">
          {/* --- অ্যানালিটিক্স জোন --- */}
          {activeTab === "ANALYTICS" && (
            <div className="p-8 flex flex-col items-center justify-center h-[400px] text-gray-400">
              <svg
                className="w-16 h-16 mb-4 text-gray-300"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="1.5"
                  d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                ></path>
              </svg>
              <p className="text-lg font-medium text-gray-600">
                Graphical Analytics Coming Soon
              </p>
              <p className="text-sm mt-1">
                Detailed charts and reports will be integrated here.
              </p>
            </div>
          )}

          {/* --- পেন্ডিং ডক্টরস জোন --- */}
          {activeTab === "PENDING_DOCTORS" && (
            <div className="w-full h-full animate-in fade-in duration-300">
              <PendingDoctorTable />
            </div>
          )}

          {/* --- ইউজার গভর্ন্যান্স জোন --- */}
          {activeTab === "USER_MANAGEMENT" && (
            <div className="w-full h-full animate-in fade-in duration-300">
              <UserStatusManager />
              <div className="p-8 text-center text-blue-600 font-medium">
                [ UserStatusManager Component Will Mount Here ]
              </div>
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
