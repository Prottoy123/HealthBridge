import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { toast } from "react-hot-toast";
import api from "../../services/api";
import { setCredentials } from "./authSlice";

const Login = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  // 1. Local Memory State
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // 2. Submit Logic
  const handleLogin = async (e) => {
    e.preventDefault();

    // Basic Validation
    if (!email || !password) {
      return toast.error("All fields are required");
    }

    setIsLoading(true);

    try {
      // 3. API Call
      const response = await api.post("/user/login", { email, password });

      // Extracting data based on Backend ApiResponse structure
      const { user, accessToken } = response.data.data;

      // 4. Save to Redux (Persist will automatically lock it in localStorage)
      dispatch(setCredentials({ user, accessToken }));
      toast.success("Login successful!");

      // 5. Role-based Traffic Control (Redirect)
      if (user.role === "PATIENT") {
        navigate("/patient/dashboard");
      } else if (user.role === "DOCTOR") {
        navigate("/doctor/queue");
      } else if (user.role === "STAFF") {
        navigate("/staff/live-desk");
      } else if (user.role === "ADMIN") {
        navigate("/admin/verifications");
      } else {
        navigate("/");
      }
    } catch (error) {
      // Interceptor handles the error toast, just log it and stop spinner
      console.error("Login failed", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="max-w-md w-full bg-white rounded-xl shadow-lg p-8">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-extrabold text-gray-900">
            Health Bridge
          </h2>
          <p className="text-gray-500 mt-2">Login to your account</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Email Address
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 block w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              placeholder="you@example.com"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1 block w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className={`w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-white font-semibold ${
              isLoading
                ? "bg-blue-400 cursor-not-allowed"
                : "bg-blue-600 hover:bg-blue-700"
            } transition duration-200`}
          >
            {isLoading ? "Processing..." : "Login"}
          </button>
        </form>

        <div className="mt-6 text-center text-sm text-gray-600">
          Don't have an account?{" "}
          <span
            className="text-blue-600 hover:underline cursor-pointer"
            onClick={() => navigate("/register")}
          >
            Register here
          </span>
        </div>
      </div>
    </div>
  );
};

export default Login;
