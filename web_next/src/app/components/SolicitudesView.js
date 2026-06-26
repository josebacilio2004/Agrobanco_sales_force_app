"use client";

import { useState } from "react";
import StatusBadge from "./StatusBadge";

export default function SolicitudesView({ solicitudes, cartera, onSelectClient }) {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("Todas");

  const statusOptions = [
    "Todas",
    "Enviadas",
    "En Comité",
    "Aprobadas",
    "Desembolsadas",
    "Rechazadas",
  ];

  const getAmountNumber = (amountStr) => {
    if (typeof amountStr === "number") return amountStr;
    if (!amountStr) return 0;
    const clean = amountStr.replace(/S\/\s*/, "").replace(/,/g, "");
    return parseFloat(clean) || 0;
  };

  const filteredSolicitudes = solicitudes.filter((sol) => {
    const matchesSearch = sol.name.toLowerCase().includes(search.toLowerCase()) || sol.id.includes(search);
    const matchesFilter = statusFilter === "Todas" || sol.status === statusFilter;
    return matchesSearch && matchesFilter;
  });

  const handleCardClick = (sol) => {
    // Attempt to find client in the cartera
    // Try matching by DNI (if it is contained in sol.id) or by client name
    const dniMatch = sol.id.split("_")[0];
    const client = cartera.find((c) => c.dni === dniMatch || c.name === sol.name);
    if (client) {
      onSelectClient(client);
    } else {
      // Fallback
      onSelectClient({ id: sol.id, name: sol.name, dni: dniMatch || sol.id, status: "NUEVA_SOLICITUD" });
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Search and Filters Header */}
      <div className="bg-surface-variant/20 border border-[#243648]/35 p-6 rounded-3xl backdrop-blur-sm space-y-4">
        <h3 className="text-xs font-black text-slate-300 uppercase tracking-wider">
          Filtro de Solicitudes y Expedientes
        </h3>

        <div className="flex flex-col md:flex-row gap-4 items-stretch md:items-center justify-between">
          {/* Search */}
          <div className="relative flex-1">
            <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-500">
              <svg className="w-4.5 h-4.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </span>
            <input
              type="text"
              placeholder="Buscar por cliente o expediente..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-[#021525]/60 border border-[#243648] rounded-xl pl-11 pr-4 py-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/25 transition-all"
            />
          </div>

          {/* Filter Dropdown */}
          <div className="flex items-center gap-3">
            <span className="text-[10px] text-slate-500 font-extrabold uppercase tracking-wider">Estado:</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-[#021525] border border-[#243648] rounded-xl px-4 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-primary cursor-pointer font-bold"
            >
              {statusOptions.map((opt) => (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Grid List */}
      {filteredSolicitudes.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredSolicitudes.map((sol) => (
            <div
              key={sol.id}
              onClick={() => handleCardClick(sol)}
              className="bg-surface-variant/20 border border-[#243648]/35 hover:border-primary/25 rounded-3xl p-5 cursor-pointer hover:bg-surface-variant/25 transition-all duration-300 flex flex-col justify-between min-h-[140px]"
            >
              <div>
                <div className="flex justify-between items-center gap-2">
                  <span className="font-mono font-bold text-xs text-primary">{sol.id}</span>
                  <StatusBadge status={sol.status} />
                </div>
                <h4 className="font-extrabold text-sm text-white mt-2.5 leading-tight">{sol.name}</h4>
              </div>

              <div className="border-t border-[#243648]/25 pt-3 mt-4 flex justify-between items-center text-[10.5px] text-slate-400 font-mono">
                <span className="font-bold text-slate-300">
                  Monto: S/ {getAmountNumber(sol.amount).toLocaleString()}
                </span>
                <span className="text-slate-500">{sol.date}</span>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-surface-variant/10 border border-dashed border-[#243648]/30 rounded-3xl p-16 text-center text-slate-500 font-semibold">
          No se encontraron expedientes en trámite.
        </div>
      )}
    </div>
  );
}
