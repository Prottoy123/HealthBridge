import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-hot-toast";
import { logout } from "../Features/auth/authSlice";
import api from "../services/api"; 
import { Shield, User as UserIcon, LogOut, ChevronDown } from "lucide-react";

function UserMenuDropdown() {
  const { user } = useSelector((state) => state.auth);
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  const dispatch = useDispatch();
  const navigate = useNavigate();

  const avatarInitial = user?.fullName ? user.fullName.charAt(0).toUpperCase() : "U";
  const hasProfileImage = Boolean(user?.profileImage);

  useEffect(() => {
    const handleOutsideClick = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleOutsideClick);
    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
    };
  }, []);

  const handleNavigation = (path) => {
    setIsOpen(false);
    navigate(path);
  };

  const handleLogout = async () => {
    try {
      await api.post("/user/logout");
      dispatch(logout());
      toast.success("Logged out successfully");
      navigate("/");
    } catch (error) {
      toast.error("Logout failed. Please try again.");
    }
  };

  return (
    <div className="relative inline-block text-left z-50" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-2 py-1.5 rounded-xl hover:bg-white/[0.05] transition-colors focus:outline-none group"
      >
        <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-[#051316] text-slate-300 font-medium border border-white/[0.05] overflow-hidden">
          {hasProfileImage ? (
            <img src={user.profileImage} alt="Profile" className="w-full h-full object-cover" />
          ) : (
            <span>{avatarInitial}</span>
          )}
        </div>
        <ChevronDown className={`w-4 h-4 text-slate-500 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="origin-top-right absolute right-0 mt-2 w-56 rounded-xl shadow-2xl bg-[#051316] border border-white/[0.1] divide-y divide-white/[0.05] transform opacity-100 scale-100 transition-all duration-200">
          <div className="px-4 py-3 bg-white/[0.02] rounded-t-xl">
            <p className="text-sm font-semibold text-slate-200 truncate">
              {user?.fullName || "User Name"}
            </p>
            <p className="text-xs text-slate-400 truncate mt-0.5">
              Role: {user?.role || "UNKNOWN"}
            </p>
          </div>

          <div className="py-1.5">
            <button
              onClick={() => handleNavigation("/identity-manager")}
              className="w-full text-left px-4 py-2 text-sm text-slate-300 hover:bg-white/[0.05] hover:text-teal-400 transition-colors flex items-center gap-2"
            >
              <Shield className="w-4 h-4" />
              Account Security
            </button>

            {user?.role === "PATIENT" && (
              <button
                onClick={() => handleNavigation("/patient/settings")}
                className="w-full text-left px-4 py-2 text-sm text-slate-300 hover:bg-white/[0.05] hover:text-teal-400 transition-colors flex items-center gap-2"
              >
                <UserIcon className="w-4 h-4" />
                Medical Profile
              </button>
            )}

            {user?.role === "DOCTOR" && (
              <button
                onClick={() => handleNavigation("/doctor/doctor-profile")}
                className="w-full text-left px-4 py-2 text-sm text-slate-300 hover:bg-white/[0.05] hover:text-teal-400 transition-colors flex items-center gap-2"
              >
                <UserIcon className="w-4 h-4" />
                Professional Profile
              </button>
            )}
          </div>

          <div className="py-1.5">
            <button
              onClick={handleLogout}
              className="w-full text-left px-4 py-2 text-sm text-rose-400 hover:bg-rose-500/10 hover:text-rose-300 transition-colors font-medium flex items-center gap-2"
            >
              <LogOut className="w-4 h-4" />
              Sign Out
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default UserMenuDropdown;
