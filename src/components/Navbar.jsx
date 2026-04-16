import { Search, Github, BarChart3 } from "lucide-react";

const Navbar = ({ repoInput, setRepoInput, onSearch }) => (
  <nav className="bg-white border-b border-slate-200 sticky top-0 z-50 shadow-sm">
    <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between gap-4">
      <div className="flex items-center gap-2">
        <div className="bg-indigo-600 p-1.5 rounded-lg text-white">
          <BarChart3 size={20} />
        </div>
        <span className="font-bold text-slate-800 tracking-tight">
          GitStats
        </span>
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          onSearch();
        }}
        className="relative flex-1 max-w-md group"
      >
        {/* 
        <Search
          className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-600 transition-colors"
          size={16}
        />
        <input
          type="text"
          className="w-full pl-10 pr-4 py-2 bg-slate-100 border-transparent focus:bg-white border focus:ring-2 focus:ring-indigo-500/20 rounded-xl outline-none text-sm transition-all"
          value={repoInput}
          onChange={(e) => setRepoInput(e.target.value)}
          placeholder="usuario/repositorio"
        /> */}
      </form>

      {/* <a
        href="https://github.com"
        target="_blank"
        rel="noreferrer"
        className="text-slate-400 hover:text-slate-600 transition-colors"
      > */}
      <Github size={20} />
      {/* </a> */}
    </div>
  </nav>
);

export default Navbar;
