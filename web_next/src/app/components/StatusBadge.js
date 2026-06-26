"use client";

export default function StatusBadge({ status, type = "status" }) {
  if (type === "priority") {
    const isHigh = status === "ALTA";
    const isMedium = status === "MEDIA";
    return (
      <span
        className={`px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider border ${
          isHigh
            ? "bg-rose-950/40 text-[#FFB4AB] border-rose-500/20 shadow-sm"
            : isMedium
            ? "bg-amber-950/40 text-warning border-warning/20 shadow-sm"
            : "bg-slate-900/60 text-slate-400 border-slate-700/30"
        }`}
      >
        {status}
      </span>
    );
  }

  if (type === "visit") {
    const isVisited = status === true || status === "VISITADO" || status === "visitado";
    return (
      <span
        className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider border ${
          isVisited
            ? "bg-success/10 text-success border-success/20"
            : "bg-warning/10 text-warning border-warning/20"
        }`}
      >
        <span className={`w-1.5 h-1.5 rounded-full ${isVisited ? "bg-success animate-pulse" : "bg-warning"}`} />
        {isVisited ? "VISITADO" : "PENDIENTE"}
      </span>
    );
  }

  // Normal credit statuses
  const normalized = status?.toLowerCase() || "";
  let classes = "bg-slate-900 text-slate-400 border-slate-700/30";
  let label = status;

  if (normalized === "desembolsado" || normalized === "desembolsadas") {
    classes = "bg-success/10 text-success border-success/25";
    label = "Desembolsado";
  } else if (
    normalized === "recibido_comite" ||
    normalized === "en comité" ||
    normalized === "en_evaluacion" ||
    normalized === "en evaluacion"
  ) {
    classes = "bg-warning/10 text-warning border-warning/20";
    label = "En Comité";
  } else if (normalized === "rechazado" || normalized === "rechazadas") {
    classes = "bg-rose-950/20 text-[#FFB4AB] border-rose-500/20";
    label = "Rechazado";
  } else if (normalized === "aprobado" || normalized === "aprobadas") {
    classes = "bg-[#1A5F7A]/25 text-[#92CFEE] border-[#92CFEE]/25";
    label = "Aprobado";
  } else if (normalized === "enviado" || normalized === "enviadas") {
    classes = "bg-blue-950/40 text-blue-300 border-blue-500/20";
    label = "Enviado";
  }

  return (
    <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-[10px] font-black border tracking-wide uppercase ${classes}`}>
      {label}
    </span>
  );
}
