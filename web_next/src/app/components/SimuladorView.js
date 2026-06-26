"use client";

import { useState, useEffect } from "react";

export default function SimuladorView() {
  const [monto, setMonto] = useState(5000);
  const [plazo, setPlazo] = useState(12);
  const [tea, setTea] = useState(40.92);
  const [result, setResult] = useState(null);

  const calculateAmortization = () => {
    const p = parseFloat(monto);
    const n = parseInt(plazo);
    const annualRate = parseFloat(tea) / 100;
    
    // TEM = (1 + TEA)^(1/12) - 1
    const TEM = Math.pow(1 + annualRate, 1 / 12) - 1;

    if (isNaN(p) || isNaN(n) || isNaN(TEM) || p <= 0 || n <= 0 || TEM <= 0) {
      setResult(null);
      return;
    }

    // French Amortization Cuota formula
    const cuotaVal = (p * TEM * Math.pow(1 + TEM, n)) / (Math.pow(1 + TEM, n) - 1);
    
    let saldo = p;
    const schedule = [];
    const today = new Date();

    for (let i = 1; i <= n; i++) {
      const interesVal = saldo * TEM;
      const capitalVal = cuotaVal - interesVal;
      saldo = saldo - capitalVal;

      const dueDate = new Date(today);
      dueDate.setMonth(today.getMonth() + i);

      schedule.push({
        numero: i,
        fecha: dueDate.toLocaleDateString("es-PE", {
          day: "numeric",
          month: "short",
          year: "numeric",
        }),
        cuota: cuotaVal.toFixed(2),
        capital: capitalVal.toFixed(2),
        interes: interesVal.toFixed(2),
        saldo: Math.max(0, saldo).toFixed(2),
      });
    }

    setResult({
      cuotaMensual: cuotaVal.toFixed(2),
      totalInteres: (cuotaVal * n - p).toFixed(2),
      totalPagar: (cuotaVal * n).toFixed(2),
      schedule,
    });
  };

  useEffect(() => {
    calculateAmortization();
  }, [monto, plazo, tea]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 animate-fade-in">
      {/* Inputs Form */}
      <div className="lg:col-span-5 bg-surface-variant/20 border border-[#243648]/35 rounded-3xl p-6 shadow-md h-fit space-y-6">
        <div>
          <h3 className="text-sm font-black text-white uppercase tracking-wider">
            Simulador de Crédito Agrícola
          </h3>
          <p className="text-xs text-slate-400 mt-1">
            Calculadora rápida con amortización francesa.
          </p>
        </div>

        <div className="space-y-4">
          {/* Monto */}
          <div className="space-y-2">
            <div className="flex justify-between items-center text-xs">
              <label className="text-slate-400 font-extrabold uppercase pl-0.5">
                Monto del Crédito
              </label>
              <span className="font-mono font-bold text-primary">S/ {monto.toLocaleString()}</span>
            </div>
            <input
              type="range"
              min="1000"
              max="50000"
              step="500"
              value={monto}
              onChange={(e) => setMonto(parseInt(e.target.value))}
              className="w-full accent-primary bg-[#021525] rounded-lg h-2 cursor-pointer"
            />
            <div className="flex justify-between text-[9px] text-slate-500 font-bold font-mono">
              <span>S/ 1,000</span>
              <span>S/ 25,000</span>
              <span>S/ 50,000</span>
            </div>
          </div>

          {/* Plazo */}
          <div className="space-y-1.5">
            <label className="text-[10px] text-slate-400 font-extrabold uppercase tracking-wide pl-0.5">
              Plazo (Meses)
            </label>
            <select
              value={plazo}
              onChange={(e) => setPlazo(parseInt(e.target.value))}
              className="w-full bg-[#021525] border border-[#243648] rounded-xl px-3.5 py-3 text-xs text-slate-200 focus:outline-none focus:border-primary font-bold"
            >
              <option value="6">6 Meses (Corta Campaña)</option>
              <option value="12">12 Meses (Estándar Anual)</option>
              <option value="18">18 Meses (Mediano Plazo)</option>
              <option value="24">24 Meses (Largo Plazo)</option>
            </select>
          </div>

          {/* TEA */}
          <div className="space-y-1.5">
            <label className="text-[10px] text-slate-400 font-extrabold uppercase tracking-wide pl-0.5">
              Tasa Efectiva Anual (TEA %)
            </label>
            <select
              value={tea}
              onChange={(e) => setTea(parseFloat(e.target.value))}
              className="w-full bg-[#021525] border border-[#243648] rounded-xl px-3.5 py-3 text-xs text-slate-200 focus:outline-none focus:border-primary font-mono font-bold"
            >
              <option value="40.92">40.92% TEA (Preferencial / Fomento)</option>
              <option value="43.92">43.92% TEA (Regular)</option>
              <option value="48.50">48.50% TEA (Microcrédito)</option>
            </select>
          </div>
        </div>

        {/* Results summary card */}
        {result && (
          <div className="bg-[#1A5F7A]/15 border border-primary/20 rounded-2xl p-5 space-y-3.5">
            <div className="flex justify-between items-center">
              <span className="text-[10px] text-slate-400 uppercase font-black tracking-wider">Cuota Mensual</span>
              <span className="text-2xl font-black text-success font-mono">S/ {result.cuotaMensual}</span>
            </div>
            <div className="border-t border-[#243648]/40 pt-3 flex justify-between items-center text-xs">
              <span className="text-slate-400">Total Intereses</span>
              <span className="font-bold font-mono text-slate-200">S/ {parseFloat(result.totalInteres).toLocaleString()}</span>
            </div>
            <div className="flex justify-between items-center text-xs">
              <span className="text-slate-400">Total a Pagar</span>
              <span className="font-bold font-mono text-white">S/ {parseFloat(result.totalPagar).toLocaleString()}</span>
            </div>
          </div>
        )}
      </div>

      {/* Amortization Table */}
      <div className="lg:col-span-7 bg-surface-variant/20 border border-[#243648]/35 rounded-3xl p-6 shadow-md flex flex-col">
        <h4 className="text-xs font-black text-slate-300 uppercase tracking-wider mb-4">
          Cronograma Proyectado de Cuotas
        </h4>
        <div className="flex-1 overflow-x-auto">
          {result?.schedule ? (
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-[#243648]/40 text-slate-500 text-[9px] font-black uppercase tracking-wider">
                  <th className="py-3 px-3">Cuota</th>
                  <th className="py-3 px-3">Vence</th>
                  <th className="py-3 px-3">Importe</th>
                  <th className="py-3 px-3">Capital</th>
                  <th className="py-3 px-3">Interés</th>
                  <th className="py-3 px-3">Saldo Deuda</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#243648]/15 font-mono">
                {result.schedule.map((row) => (
                  <tr key={row.numero} className="hover:bg-primary-container/10 transition-colors">
                    <td className="py-3 px-3 font-bold text-primary">N° {row.numero}</td>
                    <td className="py-3 px-3 text-slate-400 font-sans">{row.fecha}</td>
                    <td className="py-3 px-3 font-bold text-slate-100">S/ {row.cuota}</td>
                    <td className="py-3 px-3 text-slate-300">S/ {row.capital}</td>
                    <td className="py-3 px-3 text-slate-500">S/ {row.interes}</td>
                    <td className="py-3 px-3 font-bold text-success">S/ {row.saldo}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="h-full flex items-center justify-center text-slate-500 text-xs font-bold py-12">
              Ingrese datos válidos para generar el cronograma
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
