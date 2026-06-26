"use client";

import { useEffect } from "react";

export default function Toast({ message, type = "success", onClose }) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 5000);
    return () => clearTimeout(timer);
  }, [onClose]);

  const isSuccess = type === "success";
  const isError = type === "error";
  const isInfo = type === "info";

  return (
    <div
      className={`fixed bottom-6 right-6 px-5 py-4 rounded-2xl shadow-2xl border backdrop-blur-xl flex items-center gap-3.5 z-50 animate-fade-in ${
        isSuccess
          ? "bg-[#0c1e13]/90 border-success/35 text-[#e6fcf0]"
          : isError
          ? "bg-rose-950/90 border-error/25 text-rose-100"
          : "bg-surface-variant/90 border-primary/20 text-[#D1E4FB]"
      }`}
    >
      {isSuccess && (
        <div className="w-6 h-6 rounded-full bg-success/15 flex items-center justify-center text-success shrink-0">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4" />
          </svg>
        </div>
      )}
      {isError && (
        <div className="w-6 h-6 rounded-full bg-error/10 flex items-center justify-center text-error shrink-0">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </div>
      )}
      {isInfo && (
        <div className="w-6 h-6 rounded-full bg-primary/15 flex items-center justify-center text-primary shrink-0">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
      )}
      <span className="text-xs font-semibold leading-relaxed">{message}</span>
      <button
        onClick={onClose}
        className="text-slate-400 hover:text-slate-200 text-xs font-bold pl-2 cursor-pointer transition-colors"
      >
        ✕
      </button>
    </div>
  );
}
