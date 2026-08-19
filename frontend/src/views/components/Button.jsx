export default function Button({
  children,
  onClick,
  type = "button",
  variant = "primary",
  size = "md",
  className = "",
  disabled = false,
  icon: Icon,
}) {
  const baseStyles =
    "inline-flex items-center justify-center font-semibold rounded-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer active:scale-98 select-none";

  const variants = {
    primary: "bg-indigo-600 hover:bg-indigo-700 text-white shadow-md shadow-indigo-600/20 focus:ring-indigo-500",
    secondary: "bg-slate-100 hover:bg-slate-200 text-slate-700 focus:ring-slate-400 border border-slate-200",
    outline: "border border-slate-300 text-slate-700 hover:bg-slate-50 focus:ring-indigo-500",
    danger: "bg-rose-600 hover:bg-rose-700 text-white shadow-md shadow-rose-600/20 focus:ring-rose-500",
    success: "bg-emerald-600 hover:bg-emerald-700 text-white shadow-md shadow-emerald-600/20 focus:ring-emerald-500",
    // Quick Action Colors
    quickPurple: "bg-indigo-600 hover:bg-indigo-700 text-white focus:ring-indigo-500 shadow-md shadow-indigo-600/20",
    quickGreen: "bg-emerald-600 hover:bg-emerald-700 text-white focus:ring-emerald-500 shadow-md shadow-emerald-600/20",
    quickYellow: "bg-amber-500 hover:bg-amber-600 text-white focus:ring-amber-500 shadow-md shadow-amber-500/20",
    quickRed: "bg-rose-600 hover:bg-rose-700 text-white focus:ring-rose-500 shadow-md shadow-rose-600/20",
    quickCyan: "bg-sky-500 hover:bg-sky-600 text-white focus:ring-sky-500 shadow-md shadow-sky-500/20",
  };

  const sizes = {
    sm: "px-3 py-1.5 text-xs gap-1.5",
    md: "px-4 py-2.5 text-xs gap-2",
    lg: "px-5 py-3 text-sm gap-2",
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`${baseStyles} ${variants[variant] || variants.primary} ${sizes[size]} ${className}`}
    >
      {Icon && <Icon size={size === "sm" ? 14 : 16} />}
      {children}
    </button>
  );
}

