import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-hot-toast";
import { logout } from "../Features/auth/authSlice";
import api from "../services/api"; 

function UserMenuDropdown() {
  const { user } = useSelector((state) => state.auth);
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  const dispatch = useDispatch();
  const navigate = useNavigate();

  const avatarInitial = user?.fullName
    ? user.fullName.charAt(0).toUpperCase()
    : "U";
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
      navigate("/login");
    } catch (error) {
      toast.error("Logout failed. Please try again.");
    }
  };

  return (
    <div className="relative inline-block text-left" ref={dropdownRef}>
      {/* The Trigger Button (Profile Icon) */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-center w-10 h-10 rounded-full bg-blue-600 text-white font-bold border-2 border-transparent hover:border-blue-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all shadow-sm"
      >
        {hasProfileImage ? (
          <img
            src={user.profileImage}
            alt="Profile"
            className="w-full h-full rounded-full object-cover"
          />
        ) : (
          <span>{avatarInitial}</span>
        )}
      </button>

      {/* The DropDown Menu*/}
      {isOpen && (
        <div className="origin-top-right absolute right-0 mt-2 w-56 rounded-xl shadow-lg bg-white ring-1 ring-black ring-opacity-5 divide-y divide-gray-100 z-50 transform opacity-100 scale-100 transition-all duration-200">
          {/* User MetaData Header */}
          <div className="px-4 py-3 bg-gray-50 rounded-t-xl">
            <p className="text-sm font-medium text-gray-900 truncate">
              {user?.fullName || "User Name"}
            </p>
            <p className="text-xs text-gray-500 truncate mt-1 font-semibold">
              Role: {user?.role || "UNKNOWN"}
            </p>
          </div>

          {/* role based navigation panel */}
          <div className="py-1">
            {/* identity manager */}
            <button
              onClick={() => handleNavigation("/identity-manager")}
              className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-blue-600 transition-colors"
            >
              Account Security
            </button>

            {/* patient domain: Medical Profile */}
            {user?.role === "PATIENT" && (
              <button
                onClick={() => handleNavigation("/patient/settings")}
                className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-blue-600 transition-colors"
              >
                Medical Profile
              </button>
            )}

            {/* Doctor domain: Professional Profile */}
            {user?.role === "DOCTOR" && (
              <button
                onClick={() => handleNavigation("/doctor/doctor-profile")}
                className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-blue-600 transition-colors"
              >
                Professional Profile
              </button>
            )}
          </div>

          {/* Logout*/}
          <div className="py-1">
            <button
              onClick={handleLogout}
              className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 hover:text-red-700 transition-colors font-medium"
            >
              Sign Out
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default UserMenuDropdown;
