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
        navigate("/staff/dashboard");
      } else if (user.role === "ADMIN") {
        navigate("/admin/dashboard");
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
    <div className="min-h-screen grid grid-cols-1 lg:grid-cols-2 bg-[#050f11] relative overflow-hidden font-sans">
      {/* Ambient background glows */}
      <div className="absolute top-1/4 left-1/4 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-teal-500/10 rounded-full blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-1/4 right-1/4 translate-x-1/2 translate-y-1/2 w-[400px] h-[400px] bg-cyan-500/10 rounded-full blur-[120px] pointer-events-none"></div>

      {/* Left Column: Login Form */}
      <div className="flex flex-col justify-center px-6 py-12 sm:px-12 lg:px-20 xl:px-24 relative z-10">
        <div className="mx-auto w-full max-w-md bg-white/[0.02] border border-white/[0.05] backdrop-blur-xl p-8 sm:p-10 rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.3)]">
          {/* Logo / Title */}
          <div className="flex items-center gap-3 mb-8">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-tr from-teal-500 to-cyan-400 text-slate-950 font-bold shadow-[0_0_20px_rgba(20,184,166,0.35)]">
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2.5"
                  d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                />
              </svg>
            </div>
            <span className="text-2xl font-extrabold tracking-tight text-white">
              Health<span className="text-teal-400">Bridge</span>
            </span>
          </div>

          <div>
            <h2 className="text-3xl font-extrabold tracking-tight text-white leading-tight">
              Welcome back
            </h2>
            <p className="mt-2.5 text-sm text-slate-450 text-slate-400">
              Sign in to manage patient profiles, appointment queues, and
              clinical configurations.
            </p>
          </div>

          <div className="mt-8">
            <form onSubmit={handleLogin} className="space-y-6">
              <div>
                <label className="block text-xs font-semibold text-teal-400 uppercase tracking-widest mb-2">
                  Email Address
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="block w-full px-4 py-3 border border-white/[0.08] rounded-xl text-white placeholder-slate-500 bg-white/[0.02] focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition duration-200 text-sm shadow-inner"
                  placeholder="name@example.com"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-xs font-semibold text-teal-400 uppercase tracking-widest">
                    Password
                  </label>
                </div>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full px-4 py-3 border border-white/[0.08] rounded-xl text-white placeholder-slate-500 bg-white/[0.02] focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition duration-200 text-sm shadow-inner"
                  placeholder="••••••••"
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isLoading}
                  className="flex w-full justify-center rounded-xl bg-gradient-to-r from-teal-500 to-cyan-400 py-3 text-sm font-bold text-slate-950 shadow-[0_0_20px_rgba(20,184,166,0.2)] hover:shadow-[0_0_30px_rgba(20,184,166,0.4)] hover:brightness-110 active:scale-[0.98] disabled:from-slate-700 disabled:to-slate-700 disabled:text-slate-400 disabled:cursor-not-allowed transition duration-150 cursor-pointer"
                >
                  {isLoading ? "SIGNING IN..." : "SIGN IN"}
                </button>
              </div>
            </form>

            <div className="mt-6 text-center text-sm text-slate-405 text-slate-400">
              New to HealthBridge?{" "}
              <span
                className="font-bold text-teal-400 hover:text-teal-350 hover:underline cursor-pointer transition duration-150"
                onClick={() => navigate("/register")}
              >
                Create an account
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Right Column: Visual Panel */}
      <div className="hidden lg:flex flex-col justify-between bg-[#041517] p-16 text-white border-l border-white/[0.04] relative overflow-hidden">
        {/* Subtle grid pattern overlay */}
        <div className="absolute inset-0 bg-[radial-gradient(#153e43_1.2px,transparent_1.2px)] [background-size:24px_24px] opacity-40"></div>

        {/* Top brand header */}
        <div className="relative z-10 flex items-center justify-between">
          <span className="text-xs font-semibold uppercase tracking-widest text-teal-400 bg-teal-500/10 px-3 py-1.5 rounded-full border border-teal-500/20 shadow-[0_0_15px_rgba(20,184,166,0.1)]">
            HIPAA COMPLIANT SECURITY
          </span>
          <span className="text-xs text-slate-400 uppercase tracking-widest">
            Active Stream
          </span>
        </div>

        {/* Middle visual representation: Live Clinical telemetry visualizer */}
        <div className="relative z-10 my-auto max-w-md space-y-8">
          {/* Telemetry wave widget */}
          <div className="bg-white/[0.02] backdrop-blur-md rounded-3xl p-6 border border-white/[0.06] shadow-2xl space-y-6">
            <div className="flex justify-between items-center text-xs font-bold uppercase tracking-wider text-teal-400">
              <span>Real-Time Patient Intake</span>
              <span className="flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_#10b981]"></span>
                Synchronized
              </span>
            </div>

            {/* Simulated intake flow graph */}
            <div className="h-24 flex items-end justify-between gap-1.5 pt-2 border-b border-white/[0.05] pb-2">
              <div
                className="w-full bg-gradient-to-t from-teal-950 to-teal-400 rounded-full transition-all duration-500"
                style={{ height: "35%" }}
              ></div>
              <div
                className="w-full bg-gradient-to-t from-teal-950 to-teal-400 rounded-full transition-all duration-500"
                style={{ height: "55%" }}
              ></div>
              <div
                className="w-full bg-gradient-to-t from-teal-950 to-teal-400 rounded-full transition-all duration-500"
                style={{ height: "45%" }}
              ></div>
              <div
                className="w-full bg-gradient-to-t from-teal-950 to-teal-400 rounded-full transition-all duration-500"
                style={{ height: "75%" }}
              ></div>
              <div
                className="w-full bg-gradient-to-t from-teal-950 to-teal-400 rounded-full transition-all duration-500"
                style={{ height: "90%" }}
              ></div>
              <div
                className="w-full bg-gradient-to-t from-teal-950 to-teal-400 rounded-full transition-all duration-500"
                style={{ height: "60%" }}
              ></div>
              <div
                className="w-full bg-gradient-to-t from-teal-950 to-teal-400 rounded-full transition-all duration-500"
                style={{ height: "50%" }}
              ></div>
              <div
                className="w-full bg-gradient-to-t from-teal-950 to-teal-400 rounded-full transition-all duration-500"
                style={{ height: "80%" }}
              ></div>
              <div
                className="w-full bg-gradient-to-t from-teal-950 to-cyan-400 rounded-full transition-all duration-500"
                style={{ height: "100%" }}
              ></div>
              <div
                className="w-full bg-gradient-to-t from-teal-950 to-teal-400 rounded-full transition-all duration-500"
                style={{ height: "70%" }}
              ></div>
              <div
                className="w-full bg-gradient-to-t from-teal-950 to-teal-400 rounded-full transition-all duration-500"
                style={{ height: "50%" }}
              ></div>
              <div
                className="w-full bg-gradient-to-t from-teal-950 to-teal-400 rounded-full transition-all duration-500"
                style={{ height: "65%" }}
              ></div>
              <div
                className="w-full bg-gradient-to-t from-teal-950 to-teal-400 rounded-full transition-all duration-500"
                style={{ height: "85%" }}
              ></div>
              <div
                className="w-full bg-gradient-to-t from-teal-950 to-teal-400 rounded-full transition-all duration-500"
                style={{ height: "45%" }}
              ></div>
              <div
                className="w-full bg-gradient-to-t from-teal-950 to-teal-400 rounded-full transition-all duration-500"
                style={{ height: "35%" }}
              ></div>
            </div>

            {/* Counters */}
            <div className="grid grid-cols-3 gap-4">
              <div className="bg-white/5 rounded-2xl p-4 border border-white/5 text-center">
                <span className="block text-[10px] text-slate-400 uppercase font-bold tracking-wider">
                  Avg Wait
                </span>
                <span className="text-xl font-black text-teal-400 mt-1 block">
                  18 min
                </span>
              </div>
              <div className="bg-white/5 rounded-2xl p-4 border border-white/5 text-center">
                <span className="block text-[10px] text-slate-400 uppercase font-bold tracking-wider">
                  Intake
                </span>
                <span className="text-xl font-black text-teal-400 mt-1 block">
                  142/hr
                </span>
              </div>
              <div className="bg-white/5 rounded-2xl p-4 border border-white/5 text-center">
                <span className="block text-[10px] text-slate-400 uppercase font-bold tracking-wider">
                  Load
                </span>
                <span className="text-xl font-black text-emerald-400 mt-1 block">
                  Normal
                </span>
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-3xl font-extrabold tracking-tight leading-snug text-white">
              Smart Healthcare Operations
            </h3>
            <p className="mt-4 text-slate-300 leading-relaxed text-sm">
              An all-in-one system designed for smart patient management, secure
              communication channels, and real-time medical staff scheduling.
            </p>
          </div>
        </div>

        {/* Bottom quotes / footer */}
        <div className="relative z-10 flex items-center gap-4 text-xs text-slate-400 border-t border-white/10 pt-8">
          <svg
            className="w-5 h-5 text-teal-400 shrink-0"
            fill="currentColor"
            viewBox="0 0 20 20"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              fillRule="evenodd"
              d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-2 0c0 .993-.241 1.929-.668 2.754l-1.524-1.525a3.997 3.997 0 00.078-2.183l1.555-1.555A7.962 7.962 0 0116 10zM7.246 12.754l-1.525 1.524A7.962 7.962 0 014 10c0-.993.241-1.929.668-2.754l1.524 1.525a3.997 3.997 0 00-.078 2.183l-1.555 1.555A7.962 7.962 0 014 10z"
              clipRule="evenodd"
            />
          </svg>
          <span className="italic leading-normal text-slate-350 text-slate-300">
            "This platform has transformed how our clinic coordinates schedules
            and handles patient walk-ins." — Dr. Sarah Rahman, MD
          </span>
        </div>
      </div>
    </div>
  );
};

export default Login;
