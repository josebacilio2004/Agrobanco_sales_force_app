"use client";

export default function TopBar({
  apiUrl,
  setApiUrl,
  dbStatus,
  handleSeed,
  isSeeding,
  onMenuToggle,
  advisorToken,
}) {
  return (
    <header className="border-b border-[#243648]/40 bg-[#021525]/90 backdrop-blur-xl sticky top-0 z-30 px-6 py-4.5 flex justify-between items-center gap-4 shadow-lg shadow-black/20">
      <div className="flex items-center gap-3">
        {/* Mobile Hamburger menu */}
        {advisorToken && (
          <button
            onClick={onMenuToggle}
            className="p-1.5 rounded-lg border border-[#243648]/55 text-slate-400 hover:text-white hover:bg-[#243648]/20 lg:hidden cursor-pointer mr-1"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        )}

        {/* Branding Logo */}
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-brand-green to-success flex items-center justify-center shadow-md shadow-brand-green/20">
            <svg className="w-5.5 h-5.5 text-[#021525]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 3.5 0 9.5a7 7 0 0 1-8 8.5z" />
              <path d="M19 2c-2.26 4.33-5.27 7.14-8 8" />
            </svg>
          </div>
          <div>
            <h1 className="font-black text-lg tracking-tight text-white flex items-center gap-1.5 leading-none">
              AGRO<span className="text-brand-gold">BANCO</span>
            </h1>
            <p className="text-[8.5px] uppercase font-black tracking-wider text-brand-green mt-0.5">
              Fuerza de Ventas Digital
            </p>
          </div>
        </div>
      </div>

      {/* Utilities */}
      <div className="flex items-center flex-wrap gap-4">
        {/* Core Server Address Input */}
        <div className="flex items-center bg-[#021525]/60 rounded-xl border border-[#243648]/60 px-3.5 py-2.5 gap-2 shadow-inner">
          <span className="text-[9px] font-black text-slate-500 uppercase tracking-wider hidden sm:inline">Servidor:</span>
          <input
            type="text"
            value={apiUrl}
            onChange={(e) => setApiUrl(e.target.value)}
            className="bg-transparent text-xs font-mono text-primary focus:outline-none w-44 sm:w-52"
          />
          <span
            className={`w-2.5 h-2.5 rounded-full transition-all duration-300 ${
              dbStatus === "online"
                ? "bg-success shadow-lg shadow-success/40 animate-pulse"
                : "bg-error shadow-lg shadow-error/40"
            }`}
          />
          <span className="text-[9px] font-black uppercase text-slate-400 hidden md:inline">{dbStatus}</span>
        </div>

        {/* Database seed utility */}
        <button
          onClick={handleSeed}
          disabled={isSeeding}
          className="bg-surface-variant/40 border border-[#243648]/80 hover:border-success/40 text-slate-300 hover:text-brand-gold font-bold text-[11px] py-2.5 px-4 rounded-xl flex items-center gap-2 shadow-md transition-all duration-300 disabled:opacity-50 group cursor-pointer"
        >
          {isSeeding ? (
            <span className="animate-spin h-3.5 w-3.5 border-2 border-slate-300 border-t-transparent rounded-full" />
          ) : (
            <svg
              className="w-3.5 h-3.5 transition-transform group-hover:rotate-180 duration-500 text-brand-gold"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 1121.21 7.89M9 11l3-3m0 0l3 3m-3-3v12" />
            </svg>
          )}
          <span className="hidden sm:inline">Reiniciar DB</span>
        </button>
      </div>
    </header>
  );
}
