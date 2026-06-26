"use client";

import { useState, useEffect } from "react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
} from "recharts";
import StatusBadge from "./StatusBadge";

export default function Dashboard({ cartera, solicitudes, onSelectClient }) {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Helper to parse currency strings to numbers
  const parseAmount = (amountStr) => {
    if (typeof amountStr === "number") return amountStr;
    if (!amountStr) return 0;
    const clean = amountStr.replace(/S\/\s*/g, "").replace(/,/g, "");
    return parseFloat(clean) || 0;
  };

  // KPIs calculations
  const totalClients = cartera.length;
  const activeRequests = solicitudes.length;

  const approvedOrDisbursed = solicitudes.filter(
    (s) => s.status === "Desembolsadas" || s.status === "Aprobadas"
  ).length;
  const approvalRate = activeRequests > 0 ? Math.round((approvedOrDisbursed / activeRequests) * 100) : 0;

  const totalDisbursed = solicitudes
    .filter((s) => s.status === "Desembolsadas")
    .reduce((sum, s) => sum + parseAmount(s.amount), 0);

  // Chart 1: BarChart - Solicitudes por Estado
  const states = ["Enviadas", "En Comité", "Aprobadas", "Desembolsadas", "Rechazadas"];
  const stateDistributionData = states.map((state) => ({
    name: state,
    Cantidad: solicitudes.filter((s) => s.status === state).length,
  }));

  // Chart 2: PieChart - Clientes por Prioridad
  const priorities = ["ALTA", "MEDIA", "NORMAL"];
  const priorityColors = {
    ALTA: "#FFB4AB",
    MEDIA: "#F7BB78",
    NORMAL: "#7ED99E",
  };
  const priorityDistributionData = priorities.map((prio) => ({
    name: prio,
    value: cartera.filter((c) => c.priority === prio).length,
  }));

  // Chart 3: AreaChart - Montos por Solicitud
  const amountChartData = solicitudes.slice(0, 8).map((sol) => {
    const firstName = sol.name ? sol.name.split(" ")[0] : "Cliente";
    return {
      name: firstName,
      Monto: parseAmount(sol.amount),
    };
  });

  if (!isMounted) {
    return (
      <div className="flex-1 flex items-center justify-center min-h-[400px] text-slate-500 font-semibold">
        Cargando gráficos analíticos...
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in">
      {/* 4 Upper KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Card 1 */}
        <div className="bg-surface-variant/30 border border-[#243648]/45 p-6 rounded-3xl backdrop-blur-sm relative overflow-hidden">
          <div className="absolute right-3 top-3 w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
            <svg className="w-5.5 h-5.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
          </div>
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Cartera Diaria</span>
          <h3 className="text-3xl font-black text-white mt-2.5 font-mono">{totalClients}</h3>
          <p className="text-[10px] text-slate-500 mt-1">Clientes asignados en ruta</p>
        </div>

        {/* Card 2 */}
        <div className="bg-surface-variant/30 border border-[#243648]/45 p-6 rounded-3xl backdrop-blur-sm relative overflow-hidden">
          <div className="absolute right-3 top-3 w-10 h-10 rounded-xl bg-warning/10 flex items-center justify-center text-warning">
            <svg className="w-5.5 h-5.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Solicitudes Totales</span>
          <h3 className="text-3xl font-black text-white mt-2.5 font-mono">{activeRequests}</h3>
          <p className="text-[10px] text-slate-500 mt-1">Expedientes ingresados</p>
        </div>

        {/* Card 3 */}
        <div className="bg-surface-variant/30 border border-[#243648]/45 p-6 rounded-3xl backdrop-blur-sm relative overflow-hidden">
          <div className="absolute right-3 top-3 w-10 h-10 rounded-xl bg-success/10 flex items-center justify-center text-success">
            <svg className="w-5.5 h-5.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
            </svg>
          </div>
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Tasa de Aprobación</span>
          <h3 className="text-3xl font-black text-white mt-2.5 font-mono">{approvalRate}%</h3>
          <p className="text-[10px] text-slate-500 mt-1">Créditos aprobados / desembolsados</p>
        </div>

        {/* Card 4 */}
        <div className="bg-surface-variant/30 border border-[#243648]/45 p-6 rounded-3xl backdrop-blur-sm relative overflow-hidden">
          <div className="absolute right-3 top-3 w-10 h-10 rounded-xl bg-brand-green/10 flex items-center justify-center text-success">
            <svg className="w-5.5 h-5.5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Desembolso Total</span>
          <h3 className="text-3xl font-black text-success mt-2.5 font-mono">
            S/ {totalDisbursed.toLocaleString()}
          </h3>
          <p className="text-[10px] text-slate-500 mt-1">Fondos liquidados en campo</p>
        </div>
      </div>

      {/* Recharts Grid (2 Columns) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Chart Card: AreaChart (Amounts) */}
        <div className="lg:col-span-8 bg-surface-variant/20 border border-[#243648]/35 rounded-3xl p-6 shadow-md">
          <h4 className="text-xs font-black text-slate-300 uppercase tracking-wider mb-6">
            Montos de Crédito Solicitados por Cliente (S/)
          </h4>
          <div className="h-72 w-full">
            {amountChartData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={amountChartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorAmount" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#92CFEE" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#92CFEE" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#243648/20" vertical={false} />
                  <XAxis dataKey="name" stroke="#92CFEE" fontSize={10} tickLine={false} />
                  <YAxis stroke="#92CFEE" fontSize={10} tickLine={false} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#021525",
                      borderColor: "#243648",
                      borderRadius: "12px",
                      fontSize: "11px",
                      color: "#D1E4FB",
                    }}
                  />
                  <Area type="monotone" dataKey="Monto" stroke="#92CFEE" strokeWidth={2.5} fillOpacity={1} fill="url(#colorAmount)" />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-slate-500 text-xs font-bold">
                Sin datos de montos disponibles
              </div>
            )}
          </div>
        </div>

        {/* Right Chart Card: PieChart (Priority Distribution) */}
        <div className="lg:col-span-4 bg-surface-variant/20 border border-[#243648]/35 rounded-3xl p-6 shadow-md">
          <h4 className="text-xs font-black text-slate-300 uppercase tracking-wider mb-6">
            Prioridad de Cartera Diaria
          </h4>
          <div className="h-56 w-full flex items-center justify-center">
            {totalClients > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={priorityDistributionData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={70}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {priorityDistributionData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={priorityColors[entry.name] || "#92CFEE"} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#021525",
                      borderColor: "#243648",
                      borderRadius: "12px",
                      fontSize: "11px",
                      color: "#D1E4FB",
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="text-slate-500 text-xs font-bold">Sin clientes asignados</div>
            )}
          </div>
          {/* Pie Chart Legend */}
          <div className="flex justify-center gap-4 text-[10px] mt-4 font-bold">
            {priorityDistributionData.map((d) => (
              <div key={d.name} className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: priorityColors[d.name] }} />
                <span className="text-slate-300">
                  {d.name} ({d.value})
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom Row: BarChart + Recent Requests Table */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* BarChart: Solicitudes por Estado */}
        <div className="lg:col-span-5 bg-surface-variant/20 border border-[#243648]/35 rounded-3xl p-6 shadow-md">
          <h4 className="text-xs font-black text-slate-300 uppercase tracking-wider mb-6">
            Distribución por Estado de Solicitud
          </h4>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stateDistributionData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#243648/20" vertical={false} />
                <XAxis dataKey="name" stroke="#92CFEE" fontSize={9} tickLine={false} />
                <YAxis stroke="#92CFEE" fontSize={10} tickLine={false} allowDecimals={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#021525",
                    borderColor: "#243648",
                    borderRadius: "12px",
                    fontSize: "11px",
                    color: "#D1E4FB",
                  }}
                />
                <Bar dataKey="Cantidad" fill="#7ED99E" radius={[6, 6, 0, 0]} maxBarSize={35} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Table: Recent Requests */}
        <div className="lg:col-span-7 bg-surface-variant/20 border border-[#243648]/35 rounded-3xl p-6 shadow-md flex flex-col">
          <h4 className="text-xs font-black text-slate-300 uppercase tracking-wider mb-4">
            Últimos Expedientes Asignados
          </h4>
          <div className="flex-1 overflow-x-auto">
            {solicitudes.length > 0 ? (
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-[#243648]/40 text-slate-500 text-[10px] font-black uppercase tracking-wider">
                    <th className="py-3 px-4">Código / DNI</th>
                    <th className="py-3 px-4">Cliente</th>
                    <th className="py-3 px-4">Monto</th>
                    <th className="py-3 px-4">Estado</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#243648]/20">
                  {solicitudes.slice(0, 5).map((sol) => (
                    <tr
                      key={sol.id}
                      onClick={() => onSelectClient(sol)}
                      className="hover:bg-primary-container/10 transition-colors cursor-pointer"
                    >
                      <td className="py-3 px-4 font-mono font-bold text-primary">{sol.id}</td>
                      <td className="py-3 px-4 text-white font-bold">{sol.name}</td>
                      <td className="py-3 px-4 text-slate-300 font-semibold font-mono">{sol.amount}</td>
                      <td className="py-3 px-4">
                        <StatusBadge status={sol.status} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div className="h-full flex items-center justify-center text-slate-500 text-xs font-bold py-12">
                Sin expedientes registrados en el sistema
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
