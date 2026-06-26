"use client";

import { useState, useEffect } from "react";

export default function LoginScreen({ onLogin, error, setError }) {
  const [username, setUsername] = useState("1001");
  const [password, setPassword] = useState("agrobanco");
  const [attempts, setAttempts] = useState(0);
  const [lockoutTime, setLockoutTime] = useState(0);
  const [validationError, setValidationError] = useState("");

  useEffect(() => {
    let timer;
    if (lockoutTime > 0) {
      timer = setInterval(() => {
        setLockoutTime((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [lockoutTime]);

  const handleSubmit = (e) => {
    e.preventDefault();
    setValidationError("");
    setError("");

    if (lockoutTime > 0) {
      setError(`Terminal bloqueada. Intente de nuevo en ${Math.ceil(lockoutTime / 60)} minutos.`);
      return;
    }

    if (!username.trim()) {
      setValidationError("El código de empleado es obligatorio.");
      return;
    }
    if (!password.trim()) {
      setValidationError("La contraseña es obligatoria.");
      return;
    }

    // Call login handler from parent
    onLogin(username, password).then((success) => {
      if (!success) {
        const nextAttempts = attempts + 1;
        setAttempts(nextAttempts);
        if (nextAttempts >= 3) {
          setLockoutTime(1800); // 30 minutes in seconds
          setError("Terminal bloqueada por seguridad tras 3 intentos fallidos. Reintente en 30 minutos.");
        }
      } else {
        setAttempts(0);
      }
    });
  };

  const formatLockout = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? "0" : ""}${secs}`;
  };

  return (
    <div className="flex-1 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 relative min-h-[calc(100vh-140px)] z-10">
      {/* Login Card */}
      <div className="max-w-md w-full glass-panel border border-[#92CFEE]/15 rounded-3xl p-8 shadow-2xl relative overflow-hidden animate-fade-in">
        {/* Top Glow Accent */}
        <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-brand-green via-primary to-brand-gold" />

        {/* Logo and Header */}
        <div className="text-center mb-8">
          <div className="mx-auto w-14 h-14 rounded-2xl bg-gradient-to-tr from-brand-green to-success flex items-center justify-center shadow-lg shadow-brand-green/20 mb-4">
            <svg className="w-8 h-8 text-[#021525]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 3.5 0 9.5a7 7 0 0 1-8 8.5z" />
              <path d="M19 2c-2.26 4.33-5.27 7.14-8 8" />
            </svg>
          </div>
          <h2 className="text-2xl font-black tracking-tight text-white flex items-center justify-center gap-1.5">
            AGRO<span className="text-brand-gold">BANCO</span>
          </h2>
          <p className="text-[10px] uppercase font-black tracking-widest text-brand-green mt-0.5">Fuerza de Ventas Digital</p>
          <p className="text-xs text-slate-400 mt-2">Acceso exclusivo para Oficiales de Negocios y Asesores</p>
        </div>

        {/* Errors display */}
        {(error || validationError) && (
          <div className="bg-rose-950/30 border border-rose-500/20 text-[#FFB4AB] rounded-2xl p-4 text-xs mb-6 flex gap-3 animate-fade-in">
            <svg className="w-5 h-5 shrink-0 text-rose-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <div className="flex-1">
              <span className="font-bold block">Error de autenticación</span>
              <span className="mt-0.5 block opacity-90">{error || validationError}</span>
            </div>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-1">
            <label className="text-[10.5px] text-slate-400 font-extrabold tracking-wider uppercase pl-1">
              Código de Empleado
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-500">
                <svg className="w-4.5 h-4.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </span>
              <input
                type="text"
                placeholder="Ej. 1001"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                disabled={lockoutTime > 0}
                className="w-full bg-[#021525]/60 border border-[#243648] rounded-xl pl-11 pr-4 py-3.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/25 transition-all font-mono"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-[10.5px] text-slate-400 font-extrabold tracking-wider uppercase pl-1">
              Contraseña
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-500">
                <svg className="w-4.5 h-4.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </span>
              <input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={lockoutTime > 0}
                className="w-full bg-[#021525]/60 border border-[#243648] rounded-xl pl-11 pr-4 py-3.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/25 transition-all"
              />
            </div>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={lockoutTime > 0}
              className={`w-full bg-gradient-to-r from-brand-green to-[#0e5c38] hover:from-success hover:to-brand-green text-white font-extrabold py-4 px-6 rounded-xl shadow-lg shadow-brand-green/10 transition-all text-xs tracking-widest uppercase cursor-pointer ${
                lockoutTime > 0 ? "opacity-40 cursor-not-allowed" : "active:scale-[0.98]"
              }`}
            >
              {lockoutTime > 0 ? `BLOQUEADO (${formatLockout(lockoutTime)})` : "INGRESAR AL PORTAL"}
            </button>
          </div>
        </form>

        {/* Help Tip */}
        <div className="mt-8 text-center text-[11px] text-slate-500">
          ¿Problemas con el acceso? Contactar al <span className="text-primary hover:underline cursor-pointer">Soporte TI de Agrobanco</span>
        </div>
      </div>
    </div>
  );
}
