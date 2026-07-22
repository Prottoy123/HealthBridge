import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import { fetchActiveFollowups } from "./Slices/doctorSlice";

const Messages = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { activeFollowUps, isActiveFollowUpsLoading, activeFollowUpsError } =
    useSelector((state) => state.doctor);

  useEffect(() => {
    dispatch(fetchActiveFollowups());
  }, [dispatch]);

  const handleOpenChat = (appointmentId) => {
    navigate(`/doctor/messages/${appointmentId}`);
  };

  // The TTL Engine (Time-to-Live Calculator)
  const calculateTimeToLive = (expiresAt) => {
    if (!expiresAt)
      return { text: "Expired", color: "text-red-600 bg-red-100" };

    const difference = new Date(expiresAt) - new Date();

    if (difference <= 0) {
      return { text: "Expired", color: "text-red-600 bg-red-100" };
    }

    const totalMinutes = Math.floor(difference / (1000 * 60));
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;

    // Warning color if less than 6 hours remaining
    const colorClass =
      hours < 6
        ? "text-orange-600 bg-orange-100"
        : "text-green-600 bg-green-100";

    return { text: `${hours}h ${minutes}m remaining`, color: colorClass };
  };

  // GUARD 1: API Error State
  if (activeFollowUpsError) {
    return (
      <div className="p-6 text-center text-red-500 bg-red-50 rounded-lg m-6">
        <p className="font-semibold">Failed to load Inbox</p>
        <p className="text-sm">{activeFollowUpsError}</p>
      </div>
    );
  }

  // GUARD 2: Loading State (Fixed undefined return)
  if (isActiveFollowUpsLoading) {
    return (
      <div className="flex justify-center items-center h-[60vh]">
        <div className="w-10 h-10 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
      </div>
    );
  }

  // THE MAIN RETURN UI
  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-800">
          Active Consultations
        </h1>
        <p className="text-slate-500 text-sm mt-1">
          Patients currently within their 48-hour follow-up window.
        </p>
      </div>

      {/* GUARD 3: Empty State (Proper JSX instead of raw toast) */}
      {!activeFollowUps || activeFollowUps.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-64 bg-white border border-slate-200 rounded-xl shadow-sm">
          <span className="text-4xl mb-3">📭</span>
          <h3 className="text-lg font-medium text-slate-700">Inbox is empty</h3>
          <p className="text-sm text-slate-400 mt-1">
            No active follow-ups at the moment.
          </p>
        </div>
      ) : (
        /* INBOX RADAR LIST */
        <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
          <ul className="divide-y divide-slate-100">
            {activeFollowUps.map((chat) => {
              const ttl = calculateTimeToLive(chat.expiresAt);

              return (
                <li
                  key={chat._id}
                  onClick={() => handleOpenChat(chat.originalAppointmentId)}
                  className="flex items-center justify-between p-5 hover:bg-slate-50 transition cursor-pointer group"
                >
                  <div className="flex items-center space-x-4">
                    <img
                      src={
                        chat.patientInfo.profileImage ||
                        "https://via.placeholder.com/150"
                      }
                      alt={chat.patientInfo.fullName}
                      className="w-12 h-12 rounded-full object-cover border border-slate-200"
                    />
                    <div>
                      <h3 className="text-sm font-bold text-slate-800 group-hover:text-blue-600 transition">
                        {chat.patientInfo.fullName}
                      </h3>
                      <p className="text-xs text-slate-500 mt-0.5">
                        Consultation Date:{" "}
                        {new Date(
                          chat.appointmentDetails.appointmentDate,
                        ).toLocaleDateString()}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-4">
                    {/* Time-to-Live Badge */}
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-semibold ${ttl.color}`}
                    >
                      🕒 {ttl.text}
                    </span>

                    {/* Action Icon */}
                    <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 group-hover:bg-blue-600 group-hover:text-white transition">
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M9 5l7 7-7 7"
                        ></path>
                      </svg>
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </div>
  );
};

export default Messages;
