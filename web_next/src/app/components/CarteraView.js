"use client";

import { useState } from "react";
import StatusBadge from "./StatusBadge";

export default function CarteraView({ cartera, onSelectClient, selectedClient }) {
  const [search, setSearch] = useState("");
  const [activeFilter, setActiveFilter] = useState("TODOS");

  const filterOptions = [
    "TODOS",
    "NUEVA_SOLICITUD",
    "RENOVACIÓN",
    "RECUPERACIÓN MORA",
    "SEGUIMIENTO",
  ];

  // Filtering logic
  const filteredCartera = cartera.filter((item) => {
    const matchesSearch =
      item.name.toLowerCase().includes(search.toLowerCase()) ||
      item.dni.includes(search);

    const matchesFilter =
      activeFilter === "TODOS" || item.status === activeFilter;

    return matchesSearch && matchesFilter;
  });

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Filters & Search Header */}
      <div className="bg-surface-variant/20 border border-[#243648]/35 p-6 rounded-3xl backdrop-blur-sm space-y-4">
        <h3 className="text-xs font-black text-slate-300 uppercase tracking-wider">
          Mi Cartera de Campo Diaria
        </h3>

        <div className="flex flex-col md:flex-row gap-4 items-stretch md:items-center justify-between">
          {/* Search bar */}
          <div className="relative flex-1">
            <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-500">
              <svg className="w-4.5 h-4.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </span>
            <input
              type="text"
              placeholder="Buscar por nombre, apellidos o DNI..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-[#021525]/60 border border-[#243648] rounded-xl pl-11 pr-4 py-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/25 transition-all"
            />
          </div>

          {/* Filter Pills */}
          <div className="flex flex-wrap gap-2">
            {filterOptions.map((opt) => (
              <button
                key={opt}
                onClick={() => setActiveFilter(opt)}
                className={`px-3 py-1.5 rounded-lg text-[10px] font-black tracking-wide transition-all duration-200 cursor-pointer border ${
                  activeFilter === opt
                    ? "bg-primary-container/30 text-primary border-primary/25 shadow-sm"
                    : "bg-[#021525]/40 text-slate-400 hover:text-slate-200 border-[#243648]/60"
                }`}
              >
                {opt.replace("_", " ")}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Grid listing */}
      {filteredCartera.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {filteredCartera.map((item) => {
            const isSelected = selectedClient?.id === item.id;
            return (
              <div
                key={item.id}
                onClick={() => onSelectClient(item)}
                className={`p-5 rounded-3xl border transition-all duration-300 cursor-pointer flex flex-col justify-between min-h-[160px] ${
                  isSelected
                    ? "bg-primary-container/20 border-primary shadow-lg shadow-primary/5"
                    : "bg-surface-variant/20 border-[#243648]/35 hover:border-primary/25 hover:bg-surface-variant/35"
                }`}
              >
                <div>
                  <div className="flex justify-between items-start gap-2">
                    <span className="font-extrabold text-sm text-white leading-tight">
                      {item.name}
                    </span>
                    <StatusBadge status={item.priority} type="priority" />
                  </div>

                  <div className="flex justify-between items-center text-[10.5px] text-slate-400 mt-2 font-mono">
                    <span>DNI: {item.dni}</span>
                    <span className="text-[#FFB800] font-bold">{item.status.replace("_", " ")}</span>
                  </div>
                </div>

                <div className="border-t border-[#243648]/25 pt-3.5 mt-4 flex justify-between items-center text-[10px] text-slate-500">
                  <span className="truncate max-w-[170px]" title={item.location}>
                    📍 {item.location}
                  </span>
                  <StatusBadge status={item.isVisited} type="visit" />
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="bg-surface-variant/10 border border-dashed border-[#243648]/30 rounded-3xl p-16 text-center text-slate-500 font-semibold">
          No se encontraron clientes que coincidan con la búsqueda o filtro.
        </div>
      )}
    </div>
  );
}
