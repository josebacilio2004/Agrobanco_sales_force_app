"use client";

import { useState } from "react";

export default function Sidebar({ activeTab, setActiveTab, advisorData, onLogout, isOpen, setIsOpen }) {
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  const menuItems = [
    {
      id: "dashboard",
      label: "Dashboard",
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 002 2h2a2 2 0 002-2z" />
        </svg>
      ),
    },
    {
      id: "cartera",
      label: "Cartera Diaria",
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
        </svg>
      ),
    },
    {
      id: "solicitudes",
      label: "Solicitudes en Trámite",
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      ),
    },
    {
      id: "simulador",
      label: "Simulador de Cuotas",
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 11h.01M9 11h.01M12 14h.01M15 11h.01M12 7h.01M18 21H6a2 2 0 01-2-2V5a2 2 0 012-2h12a2 2 0 012 2v14a2 2 0 01-2 2z" />
        </svg>
      ),
    },
    {
      id: "cobranza",
      label: "Cobranza y Mora",
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
    },
  ];

  const handleTabChange = (tabId) => {
    setActiveTab(tabId);
    setIsOpen(false); // Close sidebar on mobile
  };

  return (
    <>
      {/* Backdrop for Mobile */}
      {isOpen && (
        <div
          onClick={() => setIsOpen(false)}
          className="fixed inset-0 bg-[#020604]/60 backdrop-blur-sm z-30 lg:hidden transition-opacity duration-300"
        />
      )}

      {/* Sidebar Drawer */}
      <aside
        className={`fixed inset-y-0 left-0 w-72 bg-[#021525] border-r border-[#243648]/40 z-40 flex flex-col justify-between transition-transform duration-300 transform lg:translate-x-0 lg:static lg:h-[calc(100vh-73px)] ${
          isOpen ? "translate-x-0" : "-translate-x-0 -translate-x-full"
        }`}
      >
        <div className="flex flex-col flex-1 overflow-y-auto">
          {/* User Profile Header */}
          <div className="p-6 border-b border-[#243648]/40 bg-[#1A5F7A]/5">
            <div className="flex items-center gap-4">
              <div className="relative">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-brand-green to-primary flex items-center justify-center text-[#021525] font-black text-lg shadow-md shadow-primary/10">
                  {advisorData?.username === "1001" ? "A" : advisorData?.username?.slice(0, 2).toUpperCase() || "AS"}
                </div>
                <span className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-success border-2 border-[#021525]" />
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="text-sm font-black text-white truncate">
                  {advisorData?.username === "1001" ? "Asesor Huancayo" : advisorData?.username || "Oficial Campo"}
                </h4>
                <p className="text-[10px] text-primary font-bold tracking-wider font-mono truncate mt-0.5">
                  CÓDIGO: {advisorData?.username || "1001"}
                </p>
                <span className="inline-block mt-1 bg-[#1A5F7A]/25 border border-primary/20 text-[#92CFEE] text-[8px] font-black px-1.5 py-0.5 rounded uppercase tracking-wider">
                  Oficial de Negocios
                </span>
              </div>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="p-4 space-y-1">
            <span className="block px-3 text-[9px] font-black text-slate-500 uppercase tracking-widest mb-3">
              Módulos Fuerza Ventas
            </span>
            {menuItems.map((item) => {
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleTabChange(item.id)}
                  className={`w-full flex items-center gap-3.5 px-4 py-3 rounded-xl text-xs font-bold transition-all duration-200 cursor-pointer ${
                    isActive
                      ? "bg-primary-container/30 text-primary border border-primary/20 shadow-md shadow-primary/5"
                      : "text-slate-400 hover:text-slate-200 hover:bg-[#243648]/20 border border-transparent"
                  }`}
                >
                  <span className={isActive ? "text-primary animate-pulse" : "text-slate-400"}>
                    {item.icon}
                  </span>
                  {item.label}
                </button>
              );
            })}

            {/* Admin/Supervisor Sections */}
            <div className="pt-6 mt-4 border-t border-[#243648]/35">
              <span className="block px-3 text-[9px] font-black text-slate-500 uppercase tracking-widest mb-3">
                Gestión y Supervisión
              </span>
              <button
                onClick={() => handleTabChange("reportes")}
                className={`w-full flex items-center gap-3.5 px-4 py-3 rounded-xl text-xs font-bold transition-all duration-200 cursor-pointer ${
                  activeTab === "reportes"
                    ? "bg-primary-container/30 text-primary border border-primary/20 shadow-md"
                    : "text-slate-500 hover:text-slate-300 hover:bg-[#243648]/10 border border-transparent"
                }`}
              >
                <span className="text-slate-500">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M11 3.055A9.003 9.003 0 1020.945 13H11V3.055z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z" />
                  </svg>
                </span>
                Reportes de Cobertura
              </button>
              <button
                onClick={() => handleTabChange("reasignacion")}
                className={`w-full flex items-center gap-3.5 px-4 py-3 rounded-xl text-xs font-bold transition-all duration-200 cursor-pointer ${
                  activeTab === "reasignacion"
                    ? "bg-primary-container/30 text-primary border border-primary/20 shadow-md"
                    : "text-slate-500 hover:text-slate-300 hover:bg-[#243648]/10 border border-transparent"
                }`}
              >
                <span className="text-slate-500">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                </span>
                Reasignación de Tareas
              </button>
            </div>
          </nav>
        </div>

        {/* Footer actions - Logout */}
        <div className="p-4 border-t border-[#243648]/40 bg-[#021525]">
          {!showLogoutConfirm ? (
            <button
              onClick={() => setShowLogoutConfirm(true)}
              className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-xs font-bold text-[#FFB4AB] bg-[#FFB4AB]/5 border border-[#FFB4AB]/15 hover:bg-[#FFB4AB]/10 transition-all cursor-pointer"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              Cerrar Sesión
            </button>
          ) : (
            <div className="space-y-2 animate-fade-in">
              <span className="text-[10px] text-slate-400 block text-center font-semibold">¿Seguro que desea salir?</span>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={onLogout}
                  className="py-2 px-3 rounded-lg text-[10px] font-black bg-[#FFB4AB] text-[#021525] hover:bg-[#ffc6c0] transition-colors cursor-pointer text-center"
                >
                  SÍ, SALIR
                </button>
                <button
                  onClick={() => setShowLogoutConfirm(false)}
                  className="py-2 px-3 rounded-lg text-[10px] font-bold bg-[#243648] text-slate-300 hover:text-white transition-colors cursor-pointer text-center"
                >
                  CANCELAR
                </button>
              </div>
            </div>
          )}
        </div>
      </aside>
    </>
  );
}
