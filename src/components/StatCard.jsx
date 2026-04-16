const StatCard = ({ title, value, sub, icon: Icon, color, highlight }) => {
  const colorMap = {
    indigo: "text-indigo-600 border-l-indigo-600",
    emerald: "text-emerald-600 border-l-emerald-600",
    slate: "text-slate-600 border-l-slate-600",
    amber: "text-amber-600 border-l-amber-600",
  };

  return (
    <div
      className={`bg-white p-5 rounded-2xl border border-slate-200 shadow-sm transition-all duration-300 ${highlight ? `border-l-4 ${colorMap[color]}` : ""}`}
    >
      <div className="flex items-center justify-between mb-2">
        <p className="text-slate-500 text-[10px] font-bold uppercase tracking-wider">
          {title}
        </p>
        {Icon && <Icon size={18} className={colorMap[color].split(" ")[0]} />}
      </div>
      <p className="text-2xl font-bold truncate text-slate-800">{value}</p>
      <p className="text-xs text-slate-400 mt-1">{sub}</p>
    </div>
  );
};

export default StatCard;
