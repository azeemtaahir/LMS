import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { LogIn, Lock, Mail, Eye, EyeOff, Sparkles, ArrowLeft } from "lucide-react";
import { useAuthController } from "../../../hooks/useAuthHook";
import libraryBg from "../../../assets/images/library_bg.png";

export default function LoginView() {
  const navigate = useNavigate();
  const { formData, errors, loading, serverError, handleChange, handleLogin } = useAuthController();
  const [showPassword, setShowPassword] = useState(false);

  const onSubmit = (e) => {
    handleLogin(e, () => {
      navigate("/dashboard");
    });
  };

  return (
    <div className="fixed inset-0 w-full h-[100dvh] overflow-hidden select-none font-sans">
      {/* Background Image & Overlay */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: `url(${libraryBg})` }}
      >
        <div className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm" />
      </div>

      {/* Foreground Container */}
      <div className="relative z-10 w-full h-full overflow-y-auto flex flex-col items-center justify-center p-4 sm:p-6 md:p-8">
        {/* Glassmorphism Login Card */}
        <div className="my-auto w-full max-w-md p-6 sm:p-8 md:p-10 rounded-3xl bg-slate-900/80 backdrop-blur-xl border border-slate-700/60 shadow-2xl text-white shrink-0">
          <Link
            to="/public-dashboard"
            className="inline-flex items-center gap-1.5 text-xs text-indigo-400 hover:text-indigo-300 font-semibold mb-6 transition-colors"
          >
            <ArrowLeft size={14} /> Back to Catalog Dashboard
          </Link>

          {/* Brand Logo & Header */}
          <div className="flex flex-col items-center text-center mb-6 sm:mb-8">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-indigo-600 to-violet-600 flex items-center justify-center text-white font-extrabold text-xl shadow-lg shadow-indigo-500/30 mb-3">
              L
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center gap-2">
              LMS Portal <Sparkles size={16} className="text-amber-400 fill-amber-400" />
            </h1>
            <p className="text-xs text-slate-300 mt-1">Enter your credentials to access the library dashboard</p>
          </div>

          {/* Server Error Alert */}
          {serverError && (
            <div
              role="alert"
              className="mb-4 sm:mb-6 p-3 bg-rose-500/20 border border-rose-500/40 text-rose-200 rounded-xl text-xs font-semibold flex items-center gap-2"
            >
              <span aria-hidden="true">⚠️</span>
              <span>{serverError}</span>
            </div>
          )}

          {/* Login Form */}
          <form onSubmit={onSubmit} className="space-y-4 sm:space-y-5">
            {/* Email Field */}
            <div>
              <label htmlFor="email" className="block text-xs font-bold text-slate-300 mb-1.5">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={16} />
                <input
                  id="email"
                  type="email"
                  name="email"
                  autoComplete="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="abc@gmail.com"
                  className="w-full pl-10 pr-3.5 py-2.5 bg-slate-800/80 border border-slate-700 rounded-xl text-white placeholder-slate-400 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                />
              </div>
              {errors.email && <p className="text-rose-400 text-xs font-medium mt-1">{errors.email}</p>}
            </div>

            {/* Password Field */}
            <div>
              <label htmlFor="password" className="block text-xs font-bold text-slate-300 mb-1.5">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={16} />
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  name="password"
                  autoComplete="current-password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-10 py-2.5 bg-slate-800/80 border border-slate-700 rounded-xl text-white placeholder-slate-400 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white transition-colors p-1 rounded focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {errors.password && <p className="text-rose-400 text-xs font-medium mt-1">{errors.password}</p>}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-6 rounded-xl bg-indigo-600 text-white font-bold text-xs sm:text-sm hover:bg-indigo-500 shadow-lg shadow-indigo-600/30 transition-all duration-200 active:scale-[0.98] disabled:opacity-70 flex items-center justify-center gap-2 mt-4 sm:mt-6 cursor-pointer disabled:cursor-not-allowed"
            >
              <LogIn size={18} />
              <span>{loading ? "Logging in..." : "Log in"}</span>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}