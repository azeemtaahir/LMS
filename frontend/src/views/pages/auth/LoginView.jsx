import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { LogIn, Lock, Mail, Eye, EyeOff, Sparkles, ArrowLeft, BookOpen, Loader2 } from "lucide-react";
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
    <div className="min-h-screen w-full font-sans relative flex flex-col justify-center items-center bg-slate-950 p-4 overflow-hidden select-none">
      {/* Background Image & Light Dark Blurred Overlay */}
      <div
        className="fixed inset-0 bg-cover bg-center bg-no-repeat pointer-events-none scale-105"
        style={{ backgroundImage: `url(${libraryBg})` }}
      >
        <div className="absolute inset-0 bg-slate-950/45 backdrop-blur-sm" />
        <div className="absolute inset-0 bg-gradient-to-b from-slate-950/60 via-slate-950/20 to-slate-950/75" />
      </div>

      {/* Main Compact Centered Glassmorphism Card */}
      <div className="relative z-10 w-full max-w-sm bg-slate-900/90 backdrop-blur-xl border border-slate-700/70 shadow-2xl shadow-slate-950 rounded-2xl overflow-hidden transition-all duration-300">

        {/* Top Accent Line */}
        <div className="h-1 w-full bg-gradient-to-r from-indigo-500 via-violet-500 to-purple-500" />

        <div className="p-5 sm:p-6">
          {/* Inner Form Top Header: Catalog Link & LMS Portal Badge */}
          <div className="flex justify-between items-center mb-5 pb-3 border-b border-slate-800/80">
            <Link
              to="/public-dashboard"
              className="inline-flex items-center gap-1.5 text-xs font-medium text-indigo-400 hover:text-indigo-300 transition-colors group"
            >
              <ArrowLeft size={13} className="group-hover:-translate-x-0.5 transition-transform" />
              <span>Catalog</span>
            </Link>

            <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-indigo-300 bg-indigo-950/70 border border-indigo-800/50 px-2.5 py-0.5 rounded-full">
              <Sparkles size={11} className="text-amber-400 fill-amber-400" /> LMS Portal
            </span>
          </div>

          {/* Header & Logo */}
          <div className="text-center mb-5">
            <div className="mx-auto w-11 h-11 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-600 flex items-center justify-center text-white shadow-lg shadow-indigo-500/30 mb-2.5 ring-2 ring-indigo-500/20">
              <BookOpen size={20} className="text-white" />
            </div>

            <h1 className="text-xl font-bold text-white tracking-tight">
              Welcome Back
            </h1>
            <p className="text-xs text-slate-400 mt-1 font-normal">
              Sign in to access your library account
            </p>
          </div>

          {/* Server Error Alert */}
          {serverError && (
            <div
              role="alert"
              className="mb-4 p-2.5 bg-rose-500/20 border border-rose-500/40 text-rose-200 rounded-xl text-xs font-semibold flex items-center gap-2"
            >
              <span className="shrink-0 text-sm">⚠️</span>
              <span className="leading-tight">{serverError}</span>
            </div>
          )}

          {/* Login Form */}
          <form onSubmit={onSubmit} className="space-y-3.5">
            {/* Email Field */}
            <div>
              <label htmlFor="email" className="block text-xs font-medium text-slate-300 mb-1">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={16} />
                <input
                  id="email"
                  type="email"
                  name="email"
                  autoComplete="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="abc@library.com"
                  className="w-full pl-9 pr-3.5 py-2 bg-slate-800/80 border border-slate-700/80 rounded-lg text-white placeholder-slate-500 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                />
              </div>
              {errors.email && <p className="text-rose-400 text-xs mt-1 pl-0.5">{errors.email}</p>}
            </div>

            {/* Password Field */}
            <div>
              <label htmlFor="password" className="block text-xs font-medium text-slate-300 mb-1">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={16} />
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  name="password"
                  autoComplete="current-password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="••••••••"
                  className="w-full pl-9 pr-10 py-2 bg-slate-800/80 border border-slate-700/80 rounded-lg text-white placeholder-slate-500 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white transition-colors p-1 rounded focus:outline-none"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
              {errors.password && <p className="text-rose-400 text-xs mt-1 pl-0.5">{errors.password}</p>}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 px-4 rounded-lg bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-semibold text-xs shadow-md shadow-indigo-600/30 transition-all duration-200 active:scale-[0.99] disabled:opacity-75 flex items-center justify-center gap-2 mt-4 cursor-pointer disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <Loader2 size={15} className="animate-spin" />
                  <span>Signing in...</span>
                </>
              ) : (
                <>
                  <LogIn size={15} />
                  <span>Sign In</span>
                </>
              )}
            </button>
          </form>
        </div>

        {/* Compact Card Footer */}
        <div className="bg-slate-950/60 px-5 py-2.5 border-t border-slate-800/70 text-center">
          <p className="text-[10px] text-slate-400 font-medium">
            Library Management System Portal
          </p>
        </div>
      </div>
    </div>
  );
}