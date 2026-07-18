import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-hot-toast";
import api from "../services/api"
import { updateUserIdentity } from "../Features/auth/authSlice"

function IdentityManager() {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);

  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");

  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confPassword, setConfPassword] = useState("");

  const [isUpdatingAccount, setIsUpdatingAccount] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  useEffect(() => {
    if (user) {
      setFullName(user.fullName || "");
      setPhone(user.phone || "");
    }
  }, [user]);


  const handleAccountUpdate = async (e) => {
    e.preventDefault();

    if (!fullName && !phone) {
      toast.error("At least one field is required to update.");
      return;
    }

    if (fullName === user.fullName && phone === (user.phone || "")) {
      toast.error("No changes detected.");
      return;
    }

    setIsUpdatingAccount(true);
    try {
      const payload = { fullName, phone };
      const response = await api.patch("/user/update-account", payload);

      dispatch(updateUserIdentity(response.data.data));
      toast.success("Account identity successfully updated.");
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to update account.");
    } finally {
      setIsUpdatingAccount(false);
    }
  };

  // ==========================================
  // দ্য সিকিউরিটি আপডেটার ইঞ্জিন
  // ==========================================
  const handlePasswordChange = async (e) => {
    e.preventDefault();

    // দ্য ক্লায়েন্ট-সাইড ভ্যালিডেশন গেট
    if (!oldPassword || !newPassword || !confPassword) {
      toast.error("All password fields are mandatory.");
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

    setIsChangingPassword(true);
    try {
      const payload = { oldPassword, newPassword, confPassword };
      await api.patch("/user/change-password", payload);

      toast.success("Security credentials updated successfully.");

      setOldPassword("");
      setNewPassword("");
      setConfPassword("");
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Failed to change password.",
      );
    } finally {
      setIsChangingPassword(false);
    }
  };

  // ==========================================
  // দ্য ইউজার ইন্টারফেস (UI Render)
  // ==========================================
  return (
    <div className="max-w-3xl mx-auto space-y-8">
      {/* মডিউল হেডার */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900">
          Identity & Security
        </h2>
        <p className="mt-1 text-sm text-gray-500">
          Manage your core identity and system access credentials.
        </p>
      </div>

      {/* সেকশন ১: আইডেন্টিটি আপডেট ফর্ম */}
      <section className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
          <h3 className="text-lg font-semibold text-gray-800">
            Account Details
          </h3>
        </div>
        <div className="p-6">
          <form onSubmit={handleAccountUpdate} className="space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="flex flex-col">
                <label className="text-sm font-medium text-gray-700 mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="px-4 py-2 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
                  placeholder="e.g. John Doe"
                />
              </div>

              <div className="flex flex-col">
                <label className="text-sm font-medium text-gray-700 mb-1">
                  Phone Number
                </label>
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="px-4 py-2 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
                  placeholder="e.g. +880 1..."
                />
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="submit"
                disabled={isUpdatingAccount}
                className={`px-5 py-2 font-semibold text-white rounded-lg transition-all ${
                  isUpdatingAccount
                    ? "bg-blue-400 cursor-not-allowed"
                    : "bg-blue-600 hover:bg-blue-700 active:scale-95"
                }`}
              >
                {isUpdatingAccount ? "Syncing Data..." : "Save Changes"}
              </button>
            </div>
          </form>
        </div>
      </section>

      {/* সেকশন ২: সিকিউরিটি ও পাসওয়ার্ড ফর্ম */}
      <section className="bg-white rounded-xl shadow-sm border border-red-100 overflow-hidden">
        <div className="px-6 py-4 border-b border-red-100 bg-red-50/30">
          <h3 className="text-lg font-semibold text-red-700">
            Security Credentials
          </h3>
        </div>
        <div className="p-6">
          <form onSubmit={handlePasswordChange} className="space-y-5">
            <div className="flex flex-col max-w-md">
              <label className="text-sm font-medium text-gray-700 mb-1">
                Current Password
              </label>
              <input
                type="password"
                value={oldPassword}
                onChange={(e) => setOldPassword(e.target.value)}
                className="px-4 py-2 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 transition-colors"
                placeholder="Enter current password"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="flex flex-col">
                <label className="text-sm font-medium text-gray-700 mb-1">
                  New Password
                </label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="px-4 py-2 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 transition-colors"
                  placeholder="New secure password"
                />
              </div>

              <div className="flex flex-col">
                <label className="text-sm font-medium text-gray-700 mb-1">
                  Confirm New Password
                </label>
                <input
                  type="password"
                  value={confPassword}
                  onChange={(e) => setConfPassword(e.target.value)}
                  className="px-4 py-2 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 transition-colors"
                  placeholder="Repeat new password"
                />
              </div>
            </div>

            <div className="flex justify-end pt-2 border-t border-gray-100 mt-6">
              <button
                type="submit"
                disabled={isChangingPassword}
                className={`px-5 py-2 font-semibold text-white rounded-lg transition-all ${
                  isChangingPassword
                    ? "bg-red-400 cursor-not-allowed"
                    : "bg-red-600 hover:bg-red-700 active:scale-95"
                }`}
              >
                {isChangingPassword
                  ? "Updating Security..."
                  : "Update Password"}
              </button>
            </div>
          </form>
        </div>
      </section>
    </div>
  );
}

export default IdentityManager;
