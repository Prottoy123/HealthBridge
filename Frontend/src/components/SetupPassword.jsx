import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-hot-toast";
import api from "../services/api"; 
import { updateUserIdentity } from "../Features/auth/authSlice"

function SetupPassword() {
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confPassword, setConfPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!oldPassword || !newPassword || !confPassword) {
      toast.error("All fields are mandatory to proceed.");
      return;
    }

    if (newPassword !== confPassword) {
      toast.error("New password and confirmation do not match.");
      return;
    }

    if (newPassword.length < 6) {
      toast.error("Password must be at least 6 characters long.");
      return;
    }

    setIsLoading(true);
    try {
      const payload = { oldPassword, newPassword, confPassword };
      await api.patch("/user/change-password", payload);

      toast.success("Security verified. Account activated successfully!");

      dispatch(updateUserIdentity({ status: "ACTIVE" }));

      if (user?.role === "ADMIN") {
        navigate("/admin/dashboard");
      } else {
        navigate("/staff/dashboard");
      }
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Failed to activate account.",
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center items-center p-4">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-extrabold text-blue-600">HealthBridge</h1>
        <p className="mt-2 text-sm text-gray-600 font-medium tracking-wide uppercase">
          Enterprise Access Control
        </p>
      </div>

      {/* Main Quarntine Card */}
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
        {/* Card Header */}
        <div className="bg-blue-50/50 px-8 py-6 border-b border-gray-100 text-center">
          <h2 className="text-xl font-bold text-gray-900">
            Activate Your Account
          </h2>
          <p className="mt-2 text-sm text-gray-500">
            For security reasons, you must change your temporary password before
            accessing the system.
          </p>
        </div>

        {/* form section */}
        <div className="p-8">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="flex flex-col">
              <label className="text-sm font-semibold text-gray-700 mb-1">
                Temporary Password
              </label>
              <input
                type="password"
                value={oldPassword}
                onChange={(e) => setOldPassword(e.target.value)}
                placeholder="Enter the password provided to you"
                className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
              />
            </div>

            <div className="flex flex-col">
              <label className="text-sm font-semibold text-gray-700 mb-1">
                New Secure Password
              </label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Create a new password"
                className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
              />
            </div>

            <div className="flex flex-col">
              <label className="text-sm font-semibold text-gray-700 mb-1">
                Confirm New Password
              </label>
              <input
                type="password"
                value={confPassword}
                onChange={(e) => setConfPassword(e.target.value)}
                placeholder="Repeat new password"
                className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
              />
            </div>

            <div className="pt-4">
              <button
                type="submit"
                disabled={isLoading}
                className={`w-full py-3 px-4 flex justify-center items-center text-sm font-bold text-white rounded-lg transition-all ${
                  isLoading
                    ? "bg-blue-400 cursor-not-allowed"
                    : "bg-blue-600 hover:bg-blue-700 active:scale-95 shadow-md hover:shadow-lg"
                }`}
              >
                {isLoading ? "Activating Account..." : "Set Password & Enter"}
              </button>
            </div>
          </form>
        </div>

        {/* Card Footer */}
        <div className="px-8 py-4 bg-gray-50 border-t border-gray-100 text-center">
          <p className="text-xs text-gray-500">
            Secure connection established. HealthBridge Admin Portal.
          </p>
        </div>
      </div>
    </div>
  );
}

export default SetupPassword;
