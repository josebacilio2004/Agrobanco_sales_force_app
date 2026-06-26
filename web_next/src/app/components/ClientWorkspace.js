"use client";

import { useState, useEffect } from "react";
import StatusBadge from "./StatusBadge";

export default function ClientWorkspace({
  selectedClient,
  apiUrl,
  advisorToken,
  showToast,
  onRefreshData,
}) {
  const [details, setDetails] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  // Step 2 state
  const [buroReport, setBuroReport] = useState(null);
  const [isBuroLoading, setIsBuroLoading] = useState(false);

  // Step 3 state
  const [latVisita, setLatVisita] = useState("-12.0463");
  const [lngVisita, setLngVisita] = useState("-75.1955");
  const [obsVisita, setObsVisita] = useState(
    "Visita realizada en predio agrícola. Se valida cultivos de maíz en buen estado."
  );
  const [isVisitLoading, setIsVisitLoading] = useState(false);
  const [isVisitCompleted, setIsVisitCompleted] = useState(false);

  // Step 4 state
  const [firmaUrl, setFirmaUrl] = useState("");
  const [isFirmaUploading, setIsFirmaUploading] = useState(false);

  // Step 5 state
  const [isPromoting, setIsPromoting] = useState(false);
  const [isProcessingComite, setIsProcessingComite] = useState(false);

  const fetchClientDetails = async () => {
    if (!selectedClient || !advisorToken) return;
    setIsLoading(true);
    // Reset steps states
    setBuroReport(null);
    setIsVisitCompleted(false);
    setFirmaUrl("");

    // Set coordinate presets
    if (selectedClient.dni === "40118120") {
      setLatVisita("-12.0581");
      setLngVisita("-75.2027");
    } else if (selectedClient.dni === "41223341") {
      setLatVisita("-12.0921");
      setLngVisita("-75.2105");
    } else if (selectedClient.dni === "42330336") {
      setLatVisita("-12.0734");
      setLngVisita("-75.2289");
    } else {
      setLatVisita("-12.0463");
      setLngVisita("-75.1955");
    }

    try {
      const res = await fetch(`${apiUrl}/fv/cliente/${selectedClient.id}`, {
        headers: { Authorization: `Bearer ${advisorToken}` },
      });
      if (res.ok) {
        const data = await res.json();
        setDetails(data);
        if (data.solicitud_estado && data.solicitud_estado !== "enviado") {
          setIsVisitCompleted(true);
        }
        if (data.firma_path) {
          setFirmaUrl(data.firma_path);
        }
      } else {
        showToast("Error al obtener los detalles del cliente.", "error");
      }
    } catch (err) {
      console.error(err);
      showToast("Error de conexión al obtener detalles del cliente.", "error");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchClientDetails();
  }, [selectedClient, advisorToken]);

  // STEP 2: Consultar Buró SBS
  const handleConsultarBuro = async () => {
    if (!details) return;
    setIsBuroLoading(true);
    try {
      const res = await fetch(`${apiUrl}/fv/buro/consultar`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${advisorToken}`,
        },
        body: JSON.stringify({ dni: details.dni }),
      });
      const data = await res.json();
      if (res.ok) {
        setBuroReport(data);
        showToast("Buró de Crédito SBS consultado exitosamente.", "success");
      } else {
        showToast(data.detail || "Error en buró de crédito.", "error");
      }
    } catch (err) {
      showToast("No se pudo conectar con el buró financiero.", "error");
    } finally {
      setIsBuroLoading(false);
    }
  };

  // STEP 3: Registrar Visita Técnica (GPS)
  const handleRegistrarVisita = async () => {
    if (!details || !details.solicitud_id) {
      showToast("El cliente debe tener una solicitud de crédito registrada.", "error");
      return;
    }
    setIsVisitLoading(true);
    try {
      const res = await fetch(`${apiUrl}/fv/solicitud/visita`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${advisorToken}`,
        },
        body: JSON.stringify({
          solicitud_id: details.solicitud_id,
          lat: parseFloat(latVisita),
          lng: parseFloat(lngVisita),
          observacion: obsVisita,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setIsVisitCompleted(true);
        showToast("Coordenadas GPS y Visita técnica registradas.", "success");
        fetchClientDetails();
        if (onRefreshData) onRefreshData();
      } else {
        showToast(data.detail || "Error al registrar visita.", "error");
      }
    } catch {
      showToast("Error de conexión al guardar visita.", "error");
    } finally {
      setIsVisitLoading(false);
    }
  };

  // STEP 4: Capturar Firma Digital
  const handleCapturarFirma = async () => {
    if (!details || !details.solicitud_id) return;
    setIsFirmaUploading(true);
    try {
      const blob = new Blob(["mock_signature_bytes_from_salesforce"], { type: "image/png" });
      const file = new File([blob], "firma_digital.png", { type: "image/png" });
      const formData = new FormData();
      formData.append("solicitud_id", details.solicitud_id);
      formData.append("tipo_documento", "FIRMA");
      formData.append("file", file);

      const res = await fetch(`${apiUrl}/fv/solicitud/documentos`, {
        method: "POST",
        headers: { Authorization: `Bearer ${advisorToken}` },
        body: formData,
      });
      const data = await res.json();
      if (res.ok) {
        setFirmaUrl(data.file_path);
        showToast("Firma Digital del cliente capturada y cargada.", "success");
        fetchClientDetails();
        if (onRefreshData) onRefreshData();
      } else {
        showToast(data.detail || "Error al subir la firma.", "error");
      }
    } catch {
      showToast("Error de red al subir firma digital.", "error");
    } finally {
      setIsFirmaUploading(false);
    }
  };

  // STEP 5: Promover al Comité
  const handlePromoverComite = async () => {
    if (!details || !details.solicitud_id) return;
    setIsPromoting(true);
    try {
      const res = await fetch(`${apiUrl}/fv/solicitud/promover`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${advisorToken}`,
        },
        body: JSON.stringify({ solicitud_id: details.solicitud_id }),
      });
      const data = await res.json();
      if (res.ok) {
        showToast("Expediente promovido electrónicamente al Comité.", "success");
        fetchClientDetails();
        if (onRefreshData) onRefreshData();
      } else {
        showToast(data.detail || "Error al promover la solicitud.", "error");
      }
    } catch {
      showToast("Error de conexión al transmitir expediente.", "error");
    } finally {
      setIsPromoting(false);
    }
  };

  // STEP 5: Dictaminar Comité
  const handleProcessComiteDirect = async () => {
    if (!details || !details.solicitud_id) return;
    setIsProcessingComite(true);
    try {
      const res = await fetch(`${apiUrl}/comite/procesar/${details.solicitud_id}`, {
        method: "POST",
      });
      const data = await res.json();
      if (res.ok) {
        showToast(`Comité Dictamina: ${data.decision}. Fondos desembolsados.`, "success");
        fetchClientDetails();
        if (onRefreshData) onRefreshData();
      } else {
        showToast(`Error en comité: ${data.detail || "No procesado"}`, "error");
      }
    } catch {
      showToast("Error al conectar con la pasarela del comité.", "error");
    } finally {
      setIsProcessingComite(false);
    }
  };

  if (isLoading) {
    return (
      <div className="bg-surface-variant/20 border border-[#243648]/35 rounded-3xl p-16 text-center flex flex-col items-center justify-center min-h-[450px]">
        <span className="animate-spin h-10 w-10 border-4 border-primary border-t-transparent rounded-full mb-4" />
        <h3 className="font-bold text-slate-300 text-sm">Cargando expediente Salesforce...</h3>
      </div>
    );
  }

  return (
    <div className="bg-surface-variant/20 border border-[#243648]/35 rounded-3xl p-6 flex flex-col gap-6 shadow-xl backdrop-blur-sm animate-fade-in">
      {/* Folder Header */}
      <div className="border-b border-[#243648]/25 pb-5 flex justify-between items-start flex-wrap gap-4">
        <div>
          <span className="text-[9px] font-black text-brand-gold bg-primary-container/20 px-2.5 py-1 rounded border border-primary/20 tracking-wider uppercase">
            Expediente Digital
          </span>
          <h3 className="text-xl font-black text-white mt-2">
            {details ? `${details.nombres} ${details.apellidos}` : selectedClient.name}
          </h3>
          <p className="text-xs text-slate-400 font-mono mt-0.5">DNI: {selectedClient.dni}</p>
        </div>

        <div className="text-right">
          <span className="text-[9px] text-slate-500 block uppercase font-bold tracking-wider">Estado de Expediente</span>
          <div className="mt-1">
            <StatusBadge status={details?.solicitud_estado || "Sin Solicitud"} />
          </div>
        </div>
      </div>

      {/* Accordion Steps */}
      <div className="flex flex-col gap-5">
        {/* STEP 1: Ficha Socioeconómica */}
        <div className="bg-[#021525]/60 border border-[#243648]/50 rounded-2xl p-5">
          <h4 className="text-xs font-black text-slate-200 uppercase tracking-wider mb-4 flex items-center gap-2 border-b border-[#243648]/20 pb-2.5">
            <span className="w-5 h-5 rounded-full bg-[#1A5F7A]/40 text-primary flex items-center justify-center font-bold text-[10px]">
              1
            </span>
            Ficha Socioeconómica y Predio Agrícola
          </h4>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-xs">
            <div>
              <span className="text-[9.5px] text-slate-500 font-black uppercase tracking-wide block">Negocio / Fundo</span>
              <span className="font-bold text-slate-200 block mt-0.5">{details?.nombre_negocio || "No registrado"}</span>
            </div>
            <div>
              <span className="text-[9.5px] text-slate-500 font-black uppercase tracking-wide block">Antigüedad</span>
              <span className="font-bold text-slate-200 block mt-0.5">
                {details?.antiguedad_meses ? `${details.antiguedad_meses} meses` : "N/D"}
              </span>
            </div>
            <div>
              <span className="text-[9.5px] text-slate-500 font-black uppercase tracking-wide block">Teléfono</span>
              <span className="font-bold text-slate-200 font-mono block mt-0.5">{details?.telefono || "N/D"}</span>
            </div>
            <div>
              <span className="text-[9.5px] text-slate-500 font-black uppercase tracking-wide block">Ingreso Estimado</span>
              <span className="font-black text-success block mt-0.5">
                S/ {details?.ingresos ? details.ingresos.toLocaleString() : "0"}
              </span>
            </div>
            <div>
              <span className="text-[9.5px] text-slate-500 font-black uppercase tracking-wide block">Gasto Mensual</span>
              <span className="font-black text-slate-300 block mt-0.5">
                S/ {details?.gastos ? details.gastos.toLocaleString() : "0"}
              </span>
            </div>
            <div>
              <span className="text-[9.5px] text-slate-500 font-black uppercase tracking-wide block">Excedente Neto</span>
              <span className="font-black text-success block mt-0.5">
                S/ {details ? (details.ingresos - details.gastos).toLocaleString() : "0"}
              </span>
            </div>
          </div>
        </div>

        {/* STEP 2: SBS Credit Bureau Check */}
        <div className="bg-[#021525]/60 border border-[#243648]/50 rounded-2xl p-5">
          <h4 className="text-xs font-black text-slate-200 uppercase tracking-wider mb-4 flex items-center gap-2 border-b border-[#243648]/20 pb-2.5">
            <span className="w-5 h-5 rounded-full bg-[#1A5F7A]/40 text-primary flex items-center justify-center font-bold text-[10px]">
              2
            </span>
            Consulta de Calificación Buró SBS
          </h4>

          {!buroReport ? (
            <div className="space-y-3">
              <p className="text-xs text-slate-400">
                Consulte la calificación SBS oficial del sistema financiero del cliente antes de registrar la visita de campo.
              </p>
              <button
                onClick={handleConsultarBuro}
                disabled={isBuroLoading}
                className="bg-primary-container/20 border border-primary/45 hover:bg-primary-container/30 text-primary font-black py-2.5 px-4 rounded-xl text-xs flex items-center gap-2 transition-all cursor-pointer"
              >
                {isBuroLoading ? (
                  <span className="animate-spin h-3.5 w-3.5 border-2 border-primary border-t-transparent rounded-full" />
                ) : (
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                )}
                CONSULTAR CALIFICACIÓN SBS
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs animate-fade-in">
              <div>
                <span className="text-[9.5px] text-slate-500 font-black uppercase tracking-wide block">SBS Oficial</span>
                <span
                  className={`inline-block font-black px-2 py-0.5 rounded text-[10px] mt-1 border ${
                    buroReport.sbs_rating === "NORMAL"
                      ? "bg-success/10 text-success border-success/20"
                      : buroReport.sbs_rating === "CPP"
                      ? "bg-warning/10 text-warning border-warning/20"
                      : "bg-rose-950/20 text-[#FFB4AB] border-rose-500/20"
                  }`}
                >
                  {buroReport.sbs_rating}
                </span>
              </div>
              <div>
                <span className="text-[9.5px] text-slate-500 font-black uppercase tracking-wide block">Score SBS</span>
                <span className="font-bold text-slate-200 font-mono block mt-1">{buroReport.score} / 1000</span>
              </div>
              <div>
                <span className="text-[9.5px] text-slate-500 font-black uppercase tracking-wide block">Deuda Total</span>
                <span className="font-bold text-slate-200 font-mono block mt-1">S/ {buroReport.deuda_total.toLocaleString()}</span>
              </div>
              <div>
                <span className="text-[9.5px] text-slate-500 font-black uppercase tracking-wide block">Filtro / Dictamen</span>
                <span className={`font-black block mt-1 ${buroReport.recomendacion === "RECOMENDADO" ? "text-success" : "text-error"}`}>
                  {buroReport.recomendacion}
                </span>
              </div>
            </div>
          )}
        </div>

        {/* STEP 3: Visita de Campo GPS */}
        <div className="bg-[#021525]/60 border border-[#243648]/50 rounded-2xl p-5">
          <h4 className="text-xs font-black text-slate-200 uppercase tracking-wider mb-4 flex items-center gap-2 border-b border-[#243648]/20 pb-2.5">
            <span className="w-5 h-5 rounded-full bg-[#1A5F7A]/40 text-primary flex items-center justify-center font-bold text-[10px]">
              3
            </span>
            Visita de Campo y Geolocalización (GPS)
          </h4>

          {!details?.solicitud_id ? (
            <p className="text-xs text-slate-500 italic">
              Esperando que el cliente registre una solicitud de crédito para desbloquear geolocalización.
            </p>
          ) : (
            <div className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[9px] text-slate-500 font-black uppercase tracking-wider pl-0.5">Latitud GPS</label>
                  <input
                    type="text"
                    value={latVisita}
                    onChange={(e) => setLatVisita(e.target.value)}
                    disabled={isVisitCompleted}
                    className="bg-[#021525] border border-[#243648] rounded-xl px-3.5 py-2.5 text-slate-200 focus:outline-none focus:border-primary font-mono text-xs"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-[9px] text-slate-500 font-black uppercase tracking-wider pl-0.5">Longitud GPS</label>
                  <input
                    type="text"
                    value={lngVisita}
                    onChange={(e) => setLngVisita(e.target.value)}
                    disabled={isVisitCompleted}
                    className="bg-[#021525] border border-[#243648] rounded-xl px-3.5 py-2.5 text-slate-200 focus:outline-none focus:border-primary font-mono text-xs"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[9px] text-slate-500 font-black uppercase tracking-wider pl-0.5">
                  Observación Técnica de Negocio
                </label>
                <textarea
                  value={obsVisita}
                  onChange={(e) => setObsVisita(e.target.value)}
                  disabled={isVisitCompleted}
                  rows={2}
                  className="bg-[#021525] border border-[#243648] rounded-xl px-3.5 py-2.5 text-slate-200 focus:outline-none focus:border-primary text-xs"
                />
              </div>

              {!isVisitCompleted ? (
                <button
                  onClick={handleRegistrarVisita}
                  disabled={isVisitLoading}
                  className="bg-primary-container/20 border border-primary/45 hover:bg-primary-container/30 text-primary font-black py-2.5 px-4 rounded-xl text-xs flex items-center gap-2 transition-all cursor-pointer"
                >
                  {isVisitLoading ? (
                    <span className="animate-spin h-3.5 w-3.5 border-2 border-primary border-t-transparent rounded-full" />
                  ) : (
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  )}
                  REGISTRAR COORDENADAS GPS
                </button>
              ) : (
                <div className="bg-success/10 border border-success/20 text-success p-3 rounded-xl flex items-center gap-2">
                  <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                  <span>Geolocalización técnica y visita de campo registradas exitosamente.</span>
                </div>
              )}
            </div>
          )}
        </div>

        {/* STEP 4: Expediente & Firma Digital */}
        <div className="bg-[#021525]/60 border border-[#243648]/50 rounded-2xl p-5">
          <h4 className="text-xs font-black text-slate-200 uppercase tracking-wider mb-4 flex items-center gap-2 border-b border-[#243648]/20 pb-2.5">
            <span className="w-5 h-5 rounded-full bg-[#1A5F7A]/40 text-primary flex items-center justify-center font-bold text-[10px]">
              4
            </span>
            Firma Digital y Archivos Adjuntos
          </h4>

          {!details?.solicitud_id ? (
            <p className="text-xs text-slate-500 italic">Debe haber una solicitud activa para adjuntar la firma.</p>
          ) : (
            <div className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3 text-[10px] text-slate-400">
                <div className="flex items-center gap-2 bg-[#021525] border border-[#243648]/60 p-2.5 rounded-xl">
                  <span className="w-2.5 h-2.5 rounded-full bg-success" />
                  <span>Foto DNI (Anverso / Reverso)</span>
                </div>
                <div className="flex items-center gap-2 bg-[#021525] border border-[#243648]/60 p-2.5 rounded-xl">
                  <span className="w-2.5 h-2.5 rounded-full bg-success" />
                  <span>Título / Certificado Predial</span>
                </div>
              </div>

              {!firmaUrl ? (
                <button
                  onClick={handleCapturarFirma}
                  disabled={isFirmaUploading}
                  className="bg-primary-container/20 border border-primary/45 hover:bg-primary-container/30 text-primary font-black py-2.5 px-4 rounded-xl text-xs flex items-center gap-2 transition-all cursor-pointer"
                >
                  {isFirmaUploading ? (
                    <span className="animate-spin h-3.5 w-3.5 border-2 border-primary border-t-transparent rounded-full" />
                  ) : (
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                    </svg>
                  )}
                  CAPTURAR FIRMA DIGITAL DE CONFORMIDAD
                </button>
              ) : (
                <div className="space-y-3">
                  <div className="bg-success/10 border border-success/20 text-success p-3 rounded-xl flex items-center gap-2">
                    <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                    <span>Firma digital de conformidad adjunta y guardada.</span>
                  </div>
                  {firmaUrl.startsWith("http") || firmaUrl.includes("/") ? (
                    <div className="p-3 bg-[#021525] border border-[#243648] rounded-xl text-[10.5px] font-mono text-slate-400 break-all">
                      Fichero: {firmaUrl}
                    </div>
                  ) : null}
                </div>
              )}
            </div>
          )}
        </div>

        {/* STEP 5: Aprobación y Desembolso */}
        <div className="bg-[#021525]/60 border border-[#243648]/50 rounded-2xl p-5">
          <h4 className="text-xs font-black text-slate-200 uppercase tracking-wider mb-4 flex items-center gap-2 border-b border-[#243648]/20 pb-2.5">
            <span className="w-5 h-5 rounded-full bg-[#1A5F7A]/40 text-primary flex items-center justify-center font-bold text-[10px]">
              5
            </span>
            Aprobación y Desembolso
          </h4>

          {details?.solicitud_estado === "enviado" || details?.solicitud_estado === "en_evaluacion" ? (
            <div className="space-y-3">
              <p className="text-xs text-slate-400">
                Promueva el expediente completo (SBS, coordenadas GPS, firma) al comité de evaluación para dictamen de riesgos.
              </p>
              <button
                onClick={handlePromoverComite}
                disabled={isPromoting || !isVisitCompleted}
                className="w-full bg-gradient-to-r from-brand-green to-[#0e5c38] hover:from-success hover:to-brand-green text-white font-extrabold py-3 px-4 rounded-xl text-xs transition-all disabled:opacity-40 shadow-md cursor-pointer"
              >
                {isPromoting ? "Promoviendo expediente..." : "PROMOVER SOLICITUD AL COMITÉ"}
              </button>
              {!isVisitCompleted && (
                <span className="text-[10px] text-warning block font-bold">
                  ⚠️ Requiere completar el registro GPS de campo (Paso 3) para promover.
                </span>
              )}
            </div>
          ) : details?.solicitud_estado === "recibido_comite" ? (
            <div className="bg-primary-container/10 border border-primary/20 p-5 rounded-2xl space-y-4">
              <div>
                <span className="text-[10px] font-black text-brand-gold block uppercase tracking-wider">
                  Evaluación de Riesgo de Comité
                </span>
                <p className="text-xs text-slate-400 mt-1">
                  El expediente ha sido verificado y calificado. Evalúe y ejecute la resolución/desembolso inmediato.
                </p>
              </div>
              <button
                onClick={handleProcessComiteDirect}
                disabled={isProcessingComite}
                className="w-full bg-brand-gold hover:bg-[#e6a600] text-[#021525] font-black py-3.5 px-4 rounded-xl text-xs transition-all shadow-md flex justify-center items-center gap-2 cursor-pointer"
              >
                {isProcessingComite ? (
                  <span className="animate-spin h-4 w-4 border-2 border-[#021525] border-t-transparent rounded-full" />
                ) : (
                  "DICTAMINAR COMITÉ Y AUTODESEMBOLSAR"
                )}
              </button>
            </div>
          ) : details?.solicitud_estado === "desembolsado" ? (
            <div className="bg-success/10 border border-success/20 text-success p-5 rounded-xl space-y-2">
              <span className="text-xs font-black uppercase tracking-wider block">Crédito Desembolsado</span>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                El préstamo de S/ {details?.solicitud_monto?.toLocaleString()} ha sido liquidado correctamente.
                La cuenta de ahorros del cliente ha sido acreditada y los cobros de cuotas se iniciarán según cronograma.
              </p>
            </div>
          ) : details?.solicitud_estado === "rechazado" ? (
            <div className="bg-rose-950/20 border border-rose-500/20 text-[#FFB4AB] p-5 rounded-xl">
              <span className="text-xs font-black uppercase tracking-wider block">Expediente Rechazado</span>
              <p className="text-[11px] text-slate-400 mt-1">
                La solicitud de crédito ha sido denegada por riesgos crediticios o SBS insuficiente.
              </p>
            </div>
          ) : (
            <p className="text-xs text-slate-500 italic">No hay ninguna solicitud de crédito en trámite para este cliente.</p>
          )}
        </div>
      </div>
    </div>
  );
}
