"use client";

import { useState } from "react";
import StatusBadge from "./StatusBadge";

export default function CobranzaView({ cartera }) {
  const [selectedCollector, setSelectedCollector] = useState(null);
  const [compromiseDate, setCompromiseDate] = useState("");
  const [observation, setObservation] = useState("");
  const [toastMessage, setToastMessage] = useState("");

  // Filter or mock overdue clients based on actual client records
  const overdueClients = [
    {
      id: "cob_1",
      name: "Juan Carlos Mamani",
      dni: "41223341",
      crop: "Papa Yungay",
      overdueAmount: 3200,
      daysLate: 45,
      priority: "ALTA",
      phone: "964123456",
      history: ["Llamada realizada. Prometió pagar el 28/06.", "Visita predio: Sequía afectó 15% del cultivo."],
    },
    {
      id: "cob_2",
      name: "Anaximandro Quispe",
      dni: "40118120",
      crop: "Maíz Amarillo",
      overdueAmount: 1850,
      daysLate: 18,
      priority: "MEDIA",
      phone: "951987654",
      history: ["Llamada: Coordinando reprogramación corta campaña."],
    },
    {
      id: "cob_3",
      name: "María Elena Flores",
      dni: "42330336",
      crop: "Café Orgánico",
      overdueAmount: 4900,
      daysLate: 62,
      priority: "ALTA",
      phone: "983456123",
      history: ["Notificación física entregada en domicilio.", "Cliente solicita refinanciamiento."],
    },
  ];

  const handleRegisterCompromise = (e) => {
    e.preventDefault();
    if (!compromiseDate || !observation.trim()) {
      setToastMessage("Por favor complete la fecha y la observación.");
      setTimeout(() => setToastMessage(""), 4000);
      return;
    }

    // Add compromise to history
    selectedCollector.history.unshift(
      `Compromiso de Pago (${compromiseDate}): ${observation}`
    );

    setCompromiseDate("");
    setObservation("");
    setToastMessage("Compromiso de recuperación guardado con éxito.");
    setTimeout(() => setToastMessage(""), 4000);
  };

  const totalOverdue = overdueClients.reduce((sum, c) => sum + c.overdueAmount, 0);
  const avgDaysLate = Math.round(
    overdueClients.reduce((sum, c) => sum + c.daysLate, 0) / overdueClients.length
  );

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Overdue stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <div className="bg-surface-variant/30 border border-[#243648]/45 p-5 rounded-3xl backdrop-blur-sm">
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">
            Monto en Mora Total
          </span>
          <h3 className="text-2xl font-black text-error mt-2 font-mono">
            S/ {totalOverdue.toLocaleString()}
          </h3>
          <p className="text-[10px] text-slate-500 mt-1">Suma de saldos vencidos</p>
        </div>

        <div className="bg-surface-variant/30 border border-[#243648]/45 p-5 rounded-3xl backdrop-blur-sm">
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">
            Promedio Días de Atraso
          </span>
          <h3 className="text-2xl font-black text-warning mt-2 font-mono">{avgDaysLate} días</h3>
          <p className="text-[10px] text-slate-500 mt-1">Indicador de envejecimiento de mora</p>
        </div>

        <div className="bg-surface-variant/30 border border-[#243648]/45 p-5 rounded-3xl backdrop-blur-sm">
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">
            Clientes en Recuperación
          </span>
          <h3 className="text-2xl font-black text-white mt-2 font-mono">{overdueClients.length}</h3>
          <p className="text-[10px] text-slate-500 mt-1">Casos críticos en cartera</p>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Overdue borrowers list */}
        <div className="lg:col-span-7 bg-surface-variant/20 border border-[#243648]/35 rounded-3xl p-6 shadow-md flex flex-col">
          <h4 className="text-xs font-black text-slate-300 uppercase tracking-wider mb-4">
            Clientes con Saldos Vencidos en Campo
          </h4>
          <div className="space-y-4">
            {overdueClients.map((client) => {
              const isSelected = selectedCollector?.id === client.id;
              return (
                <div
                  key={client.id}
                  onClick={() => setSelectedCollector(client)}
                  className={`p-4 rounded-2xl border transition-all cursor-pointer flex flex-col gap-2.5 ${
                    isSelected
                      ? "bg-primary-container/20 border-primary"
                      : "bg-[#021525]/60 border-[#243648] hover:border-primary/20"
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <span className="font-extrabold text-sm text-white block">{client.name}</span>
                      <span className="text-[10px] text-slate-500 font-mono">DNI: {client.dni} | Cultivo: {client.crop}</span>
                    </div>
                    <StatusBadge status={client.priority} type="priority" />
                  </div>

                  <div className="flex justify-between items-center text-xs border-t border-[#243648]/25 pt-2 mt-1">
                    <div className="flex items-center gap-2">
                      <span className="text-slate-500">Mora:</span>
                      <span className="font-mono font-black text-[#FFB4AB]">S/ {client.overdueAmount.toLocaleString()}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-slate-500">Atraso:</span>
                      <span className="font-mono font-bold text-warning">{client.daysLate} días</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Action Panel & Follow-up History */}
        <div className="lg:col-span-5">
          {selectedCollector ? (
            <div className="bg-surface-variant/20 border border-[#243648]/35 rounded-3xl p-6 shadow-md space-y-6">
              <div>
                <h4 className="text-xs font-black text-slate-300 uppercase tracking-wider">
                  Acción de Cobranza Campo
                </h4>
                <p className="text-xs text-slate-400 font-bold text-primary mt-1 font-mono">
                  {selectedCollector.name}
                </p>
                <a
                  href={`tel:${selectedCollector.phone}`}
                  className="inline-flex items-center gap-2 text-xs font-bold text-success hover:underline mt-2"
                >
                  📞 Llamar: {selectedCollector.phone}
                </a>
              </div>

              {/* Toast response */}
              {toastMessage && (
                <div className="bg-primary-container/20 border border-primary/20 text-[#D1E4FB] p-3 rounded-xl text-[11px] font-bold">
                  {toastMessage}
                </div>
              )}

              {/* Form to log compromise */}
              <form onSubmit={handleRegisterCompromise} className="space-y-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[9px] text-slate-500 font-black uppercase tracking-wider pl-0.5">
                    Fecha de Compromiso de Pago
                  </label>
                  <input
                    type="date"
                    value={compromiseDate}
                    onChange={(e) => setCompromiseDate(e.target.value)}
                    className="bg-[#021525] border border-[#243648] rounded-xl px-3.5 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-primary font-mono"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-[9px] text-slate-500 font-black uppercase tracking-wider pl-0.5">
                    Observación de la visita/llamada
                  </label>
                  <textarea
                    value={observation}
                    onChange={(e) => setObservation(e.target.value)}
                    rows={2}
                    placeholder="Ej. Se acordó pago parcial este viernes en agencia."
                    className="bg-[#021525] border border-[#243648] rounded-xl px-3.5 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-primary"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full bg-gradient-to-r from-brand-green to-[#0e5c38] hover:from-success hover:to-brand-green text-white font-extrabold py-3 px-4 rounded-xl text-xs shadow-md cursor-pointer"
                >
                  REGISTRAR COMPROMISO
                </button>
              </form>

              {/* Follow-up history logs */}
              <div className="space-y-3 pt-4 border-t border-[#243648]/25">
                <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest pl-0.5 block">
                  Historial de Seguimiento
                </span>
                <div className="space-y-2.5 max-h-48 overflow-y-auto pr-1">
                  {selectedCollector.history.map((log, idx) => (
                    <div key={idx} className="p-3 bg-[#021525] border border-[#243648]/60 rounded-xl text-xs text-slate-300">
                      {log}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-surface-variant/10 border border-dashed border-[#243648]/30 rounded-3xl p-16 text-center text-slate-500 font-medium">
              Seleccione un cliente moroso para registrar compromisos de pago y ver el historial.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
