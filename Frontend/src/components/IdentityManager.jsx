import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";
import api from "../services/api"
import { updateUserIdentity } from "../Features/auth/authSlice"
import { UserCircle, Shield, Lock, Save, Loader2, ArrowLeft } from "lucide-react";

function IdentityManager() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
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

  const handlePasswordChange = async (e) => {
    e.preventDefault();

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

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      {/* Module Header */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => navigate(-1)}
          className="w-10 h-10 flex items-center justify-center rounded-xl bg-[#051316] hover:bg-white/[0.05] border border-white/[0.05] text-slate-400 hover:text-white transition-colors shrink-0"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h2 className="text-2xl font-bold text-slate-200">
            Identity & Security
          </h2>
          <p className="mt-1 text-sm text-slate-400">
            Manage your core identity and system access credentials.
          </p>
        </div>
      </div>

      {/* Section 1: Identity Update Form */}
      <section className="bg-[#051316] rounded-2xl shadow-sm border border-white/[0.05] overflow-hidden">
        <div className="px-6 py-5 border-b border-white/[0.05] bg-[#03090a] flex items-center gap-2">
          <UserCircle className="w-5 h-5 text-teal-400" />
          <h3 className="text-lg font-semibold text-slate-200">
            Account Details
          </h3>
        </div>
        <div className="p-6">
          <form onSubmit={handleAccountUpdate} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex flex-col">
                <label className="text-sm font-medium text-slate-400 mb-1.5">
                  Full Name
                </label>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="px-4 py-3 bg-[#03090a] border border-white/[0.05] rounded-xl text-slate-200 placeholder-slate-600 focus:outline-none focus:border-teal-500/50 transition-colors text-sm"
                  placeholder="e.g. John Doe"
                />
              </div>

              <div className="flex flex-col">
                <label className="text-sm font-medium text-slate-400 mb-1.5">
                  Phone Number
                </label>
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="px-4 py-3 bg-[#03090a] border border-white/[0.05] rounded-xl text-slate-200 placeholder-slate-600 focus:outline-none focus:border-teal-500/50 transition-colors text-sm"
                  placeholder="e.g. +880 1..."
                />
              </div>
            </div>

            <div className="flex justify-end pt-4 border-t border-white/[0.05]">
              <button
                type="submit"
                disabled={isUpdatingAccount}
                className="flex items-center gap-2 px-6 py-2.5 font-semibold text-slate-900 bg-teal-500 rounded-xl hover:bg-teal-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-sm text-sm"
              >
                {isUpdatingAccount ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Syncing Data...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    Save Changes
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </section>

      {/* Section 2: Security & Password Form */}
      <section className="bg-[#051316] rounded-2xl shadow-sm border border-amber-500/20 overflow-hidden">
        <div className="px-6 py-5 border-b border-amber-500/20 bg-amber-500/5 flex items-center gap-2">
          <Shield className="w-5 h-5 text-amber-500" />
          <h3 className="text-lg font-semibold text-amber-500">
            Security Credentials
          </h3>
        </div>
        <div className="p-6">
          <form onSubmit={handlePasswordChange} className="space-y-6">
            <div className="flex flex-col max-w-md relative">
              <label className="text-sm font-medium text-slate-400 mb-1.5">
                Current Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="w-4 h-4 text-slate-500" />
                </div>
                <input
                  type="password"
                  value={oldPassword}
                  onChange={(e) => setOldPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-[#03090a] border border-white/[0.05] rounded-xl text-slate-200 placeholder-slate-600 focus:outline-none focus:border-amber-500/50 transition-colors text-sm"
                  placeholder="Enter current password"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex flex-col">
                <label className="text-sm font-medium text-slate-400 mb-1.5">
                  New Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="w-4 h-4 text-slate-500" />
                  </div>
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-[#03090a] border border-white/[0.05] rounded-xl text-slate-200 placeholder-slate-600 focus:outline-none focus:border-amber-500/50 transition-colors text-sm"
                    placeholder="New secure password"
                  />
                </div>
              </div>

              <div className="flex flex-col">
                <label className="text-sm font-medium text-slate-400 mb-1.5">
                  Confirm New Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="w-4 h-4 text-slate-500" />
                  </div>
                  <input
                    type="password"
                    value={confPassword}
                    onChange={(e) => setConfPassword(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-[#03090a] border border-white/[0.05] rounded-xl text-slate-200 placeholder-slate-600 focus:outline-none focus:border-amber-500/50 transition-colors text-sm"
                    placeholder="Repeat new password"
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-4 border-t border-white/[0.05]">
              <button
                type="submit"
                disabled={isChangingPassword}
                className="flex items-center gap-2 px-6 py-2.5 font-semibold text-amber-500 bg-amber-500/10 border border-amber-500/20 rounded-xl hover:bg-amber-500/20 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm"
              >
                {isChangingPassword ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Updating Security...
                  </>
                ) : (
                  <>
                    <Shield className="w-4 h-4" />
                    Update Password
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </section>
    </div>
  );
}

export default IdentityManager;
