const Badge = ({ children, variant = "default" }) => {
  const variants = {
    default: "bg-slate-100 text-slate-600",
    success: "bg-emerald-100 text-emerald-700",
    warning: "bg-amber-100 text-amber-700",
  };
  return (
    <span
      className={`text-[9px] px-2 py-0.5 rounded-full font-bold uppercase tracking-tight ${variants[variant]}`}
    >
      {children}
    </span>
  );
};

export default Badge;
