"use client";

import { useState, useEffect } from "react";

export default function Home() {
  const [apiUrl, setApiUrl] = useState(process.env.NEXT_PUBLIC_API_URL || "http://localhost:8003");
  const [activePortal, setActivePortal] = useState("asesor"); // 'asesor' or 'cliente'
  const [dbStatus, setDbStatus] = useState("online");
  const [isSeeding, setIsSeeding] = useState(false);
  const [toast, setToast] = useState(null);

  // Advisor State
  const [advisorToken, setAdvisorToken] = useState("");
  const [advisorUser, setAdvisorUser] = useState("1001");
  const [advisorPass, setAdvisorPass] = useState("agrobanco");
  const [advisorData, setAdvisorData] = useState(null);
  const [solicitudes, setSolicitudes] = useState([]);
  const [selectedStatusTab, setSelectedStatusTab] = useState("Todas");
  const [selectedSol, setSelectedSol] = useState(null);
  const [advisorError, setAdvisorError] = useState("");
  const [isProcessingComite, setIsProcessingComite] = useState(false);

  // Client State
  const [clientToken, setClientToken] = useState("");
  const [clientUser, setClientUser] = useState("40118120"); // Anaximandro
  const [clientPass, setClientPass] = useState("agrobanco");
  const [clientResumen, setClientResumen] = useState(null);
  const [selectedCredit, setSelectedCredit] = useState(null);
  const [cronograma, setCronograma] = useState([]);
  const [clientError, setClientError] = useState("");
  const [isPayingCuota, setIsPayingCuota] = useState(false);
  
  // New Loan Form State
  const [monto, setMonto] = useState("5000");
  const [plazo, setPlazo] = useState("12");
  const [tea, setTea] = useState("43.92");
  const [seguro, setSeguro] = useState(true);
  const [garantia, setGarantia] = useState("sin garantia");
  const [destino, setDestino] = useState("Capital de trabajo: compra de insumos agrícolas");

  // Show customized toast helper
  const showToast = (message, type = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 5000);
  };

  // Check API Health
  useEffect(() => {
    checkHealth();
  }, [apiUrl]);

  const checkHealth = async () => {
    try {
      const res = await fetch(apiUrl + "/");
      if (res.ok) {
        setDbStatus("online");
      } else {
        setDbStatus("offline");
      }
    } catch {
      setDbStatus("offline");
    }
  };

  // Seeder trigger
  const handleSeed = async () => {
    setIsSeeding(true);
    try {
      const res = await fetch(`${apiUrl}/seed`, { method: "POST" });
      if (res.ok) {
        showToast("¡Base de datos restablecida y sembrada con éxito!", "success");
        // Refresh data
        if (advisorToken) fetchAdvisorData();
        if (clientToken) fetchClientData();
      } else {
        showToast("Error al resetear la base de datos.", "error");
      }
    } catch {
      showToast("No se pudo conectar con el backend.", "error");
    } finally {
      setIsSeeding(false);
    }
  };

  // ADVISOR AUTH & DATA
  const handleAdvisorLogin = async (e) => {
    e.preventDefault();
    setAdvisorError("");
    try {
      const res = await fetch(`${apiUrl}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: advisorUser, password: advisorPass }),
      });
      const data = await res.json();
      if (res.ok) {
        setAdvisorToken(data.token);
        setAdvisorData(data);
        fetchAdvisorData(data.token);
        showToast("Sesión iniciada como Asesor", "success");
      } else {
        setAdvisorError(data.detail || "Credenciales inválidas.");
        showToast(data.detail || "Credenciales inválidas.", "error");
      }
    } catch {
      setAdvisorError("Error al conectar con el servidor.");
      showToast("Error de conexión con el backend", "error");
    }
  };

  const fetchAdvisorData = async (token = advisorToken) => {
    if (!token) return;
    try {
      const res = await fetch(`${apiUrl}/fv/solicitudes`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setSolicitudes(data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleProcessComite = async (solId) => {
    setIsProcessingComite(true);
    try {
      const res = await fetch(`${apiUrl}/comite/procesar/${solId}`, {
        method: "POST",
      });
      const data = await res.json();
      if (res.ok) {
        showToast(`Comité finalizado: ${data.decision}. Crédito desembolsado.`, "success");
        setSelectedSol(null);
        fetchAdvisorData();
        if (clientToken) fetchClientData();
      } else {
        showToast(`Error en comité: ${data.detail || "No procesado"}`, "error");
      }
    } catch {
      showToast("Error de conexión al procesar el comité.", "error");
    } finally {
      setIsProcessingComite(false);
    }
  };

  // CLIENT AUTH & DATA
  const handleClientLogin = async (e) => {
    e.preventDefault();
    setClientError("");
    try {
      const res = await fetch(`${apiUrl}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: clientUser, password: clientPass }),
      });
      const data = await res.json();
      if (res.ok) {
        setClientToken(data.token);
        fetchClientData(data.token);
        showToast("Sesión iniciada en Home Banking", "success");
      } else {
        setClientError(data.detail || "DNI o contraseña incorrectos.");
        showToast(data.detail || "DNI o contraseña incorrectos.", "error");
      }
    } catch {
      setClientError("Error al conectar con el servidor.");
      showToast("Error de conexión con el backend", "error");
    }
  };

  const fetchClientData = async (token = clientToken) => {
    if (!token) return;
    try {
      const res = await fetch(`${apiUrl}/cliente/resumen`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setClientResumen(data);
        if (data.creditos && data.creditos.length > 0) {
          // Auto select first credit to show schedule
          setSelectedCredit(data.creditos[0]);
          fetchCronograma(data.creditos[0].id, token);
        } else {
          setSelectedCredit(null);
          setCronograma([]);
        }
      }
    } catch (err) {
      console.error(err);
    }
  };

  const fetchCronograma = async (creditId, token = clientToken) => {
    try {
      const res = await fetch(`${apiUrl}/cliente/credito/${creditId}/cronograma`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setCronograma(data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handlePayCuota = async (cuotaId) => {
    if (!selectedCredit) return;
    setIsPayingCuota(true);
    try {
      const res = await fetch(`${apiUrl}/cliente/operaciones/pagar`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${clientToken}`,
        },
        body: JSON.stringify({
          credito_id: selectedCredit.id,
          cuota_id: cuotaId,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        showToast("Pago de cuota realizado con éxito. Débito de cuenta de ahorros.", "success");
        fetchClientData();
        fetchCronograma(selectedCredit.id);
      } else {
        showToast(`Error al pagar: ${data.detail}`, "error");
      }
    } catch {
      showToast("Error de conexión al realizar el pago.", "error");
    } finally {
      setIsPayingCuota(false);
    }
  };

  const handleCreateLoanRequest = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`${apiUrl}/cliente/solicitud/crear`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${clientToken}`,
        },
        body: JSON.stringify({
          monto: parseFloat(monto),
          plazo: parseInt(plazo),
          tea: parseFloat(tea),
          seguro: seguro,
          garantia: garantia,
          destino: destino,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        showToast(`Solicitud registrada con éxito. Expediente: ${data.expediente}`, "success");
        fetchClientData();
      } else {
        showToast(`Error: ${data.detail}`, "error");
      }
    } catch {
      showToast("Error al registrar solicitud de crédito.", "error");
    }
  };

  // Filter requests for advisor
  const filteredSolicitudes = solicitudes.filter((sol) => {
    if (selectedStatusTab === "Todas") return true;
    return sol.status === selectedStatusTab;
  });

  // Calculate quick metrics for advisor dashboard
  const totalSols = solicitudes.length;
  const pendingComite = solicitudes.filter(s => s.status === "En Comité" || s.status === "Enviadas").length;
  const disbursedCount = solicitudes.filter(s => s.status === "Desembolsadas").length;
  const rejectedCount = solicitudes.filter(s => s.status === "Rechazadas").length;

  return (
    <div className="min-h-screen bg-[#070b13] text-slate-100 flex flex-col font-sans relative overflow-x-hidden">
      
      {/* Decorative Blur Orbs */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
        <div className="absolute top-[-15%] left-[-10%] w-[600px] h-[600px] bg-emerald-500/5 rounded-full blur-[150px]" />
        <div className="absolute bottom-[-15%] right-[-10%] w-[600px] h-[600px] bg-teal-500/5 rounded-full blur-[150px]" />
        <div className="absolute top-[40%] right-[15%] w-[400px] h-[400px] bg-blue-500/5 rounded-full blur-[130px]" />
      </div>

      {/* Top Banner / API Connection status */}
      <header className="border-b border-slate-900 bg-[#0c1220]/80 backdrop-blur-xl sticky top-0 z-40 px-6 py-4 flex flex-wrap justify-between items-center gap-4 shadow-lg shadow-black/20">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center shadow-lg shadow-emerald-500/20">
            <svg className="w-6 h-6 text-[#070b13]" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364-6.364l-.707.707M6.343 17.657l-.707.707m2.828-9.9a5 5 0 117.072 0l-.707.707M6.343 6.343l-.707.707m12.728 11.314l-.707.707M4 12a8 8 0 018-8v8H4z"></path>
            </svg>
          </div>
          <div>
            <h1 className="font-black text-xl tracking-tight text-white flex items-center gap-1.5">
              BANCO <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-300">ANDINO</span>
            </h1>
            <p className="text-[10px] uppercase font-bold tracking-wider text-slate-500">Core Rural Banking Portal</p>
          </div>
        </div>

        {/* API connection config & seed utility */}
        <div className="flex items-center flex-wrap gap-4 z-10">
          <div className="flex items-center bg-[#070b13]/80 rounded-xl border border-slate-800/80 px-3.5 py-2 gap-2 shadow-inner">
            <span className="text-[10px] font-bold text-slate-500 uppercase">Server:</span>
            <input
              type="text"
              value={apiUrl}
              onChange={(e) => setApiUrl(e.target.value)}
              className="bg-transparent text-xs font-mono text-slate-200 focus:outline-none w-52"
            />
            <span className={`w-2 h-2 rounded-full ${dbStatus === "online" ? "bg-emerald-400 shadow-lg shadow-emerald-400/50 animate-pulse" : "bg-rose-500 shadow-lg shadow-rose-500/50"}`} />
            <span className="text-[10px] font-extrabold uppercase text-slate-400 hidden sm:inline">{dbStatus}</span>
          </div>

          <button
            onClick={handleSeed}
            disabled={isSeeding}
            className="relative bg-slate-900 border border-slate-800 hover:border-emerald-500/30 text-slate-300 hover:text-emerald-400 font-bold text-xs py-2 px-4 rounded-xl flex items-center gap-2 shadow-md transition-all duration-300 disabled:opacity-50 group"
          >
            {isSeeding ? (
              <span className="animate-spin h-3.5 w-3.5 border-2 border-slate-300 border-t-transparent rounded-full" />
            ) : (
              <svg className="w-3.5 h-3.5 transition-transform group-hover:rotate-180 duration-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 1121.21 7.89M9 11l3-3m0 0l3 3m-3-3v12"></path></svg>
            )}
            Reiniciar Base de Datos
          </button>
        </div>
      </header>

      {/* Main Tab bar */}
      <div className="max-w-7xl mx-auto w-full px-6 pt-8 flex-1 flex flex-col z-10 relative">
        
        {/* Navigation Selector */}
        <div className="flex bg-[#0c1220]/80 p-1.5 rounded-2xl border border-slate-900 shadow-lg max-w-lg mb-8">
          <button
            onClick={() => setActivePortal("asesor")}
            className={`flex-1 py-3 px-5 font-bold text-xs tracking-wider rounded-xl transition-all duration-300 flex items-center justify-center gap-2 ${
              activePortal === "asesor"
                ? "bg-gradient-to-r from-emerald-600 to-teal-700 text-white shadow-lg shadow-emerald-700/20"
                : "text-slate-400 hover:text-slate-200 hover:bg-slate-900/40"
            }`}
          >
            💼 Portal Asesores
          </button>
          <button
            onClick={() => setActivePortal("cliente")}
            className={`flex-1 py-3 px-5 font-bold text-xs tracking-wider rounded-xl transition-all duration-300 flex items-center justify-center gap-2 ${
              activePortal === "cliente"
                ? "bg-gradient-to-r from-emerald-600 to-teal-700 text-white shadow-lg shadow-emerald-700/20"
                : "text-slate-400 hover:text-slate-200 hover:bg-slate-900/40"
            }`}
          >
            👤 Home Banking Clientes
          </button>
        </div>

        {/* ==================== PORTAL ASESOR ==================== */}
        {activePortal === "asesor" && (
          <div className="py-2 flex-1 flex flex-col gap-6">
            {!advisorToken ? (
              // Login Asesor
              <div className="max-w-md w-full mx-auto my-12 bg-[#0c1220]/40 border border-slate-900 rounded-3xl p-8 backdrop-blur-md shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-500 to-teal-400" />
                <h2 className="text-2xl font-black text-white mb-1">Ingreso de Asesores</h2>
                <p className="text-xs text-slate-400 mb-6">Utiliza tu código corporativo y contraseña de negocio.</p>
                
                {advisorError && (
                  <div className="bg-rose-950/20 border border-rose-500/20 text-rose-300 rounded-xl p-3.5 text-xs mb-5 flex gap-2">
                    <svg className="w-4 h-4 shrink-0 text-rose-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/></svg>
                    <span>{advisorError}</span>
                  </div>
                )}
                
                <form onSubmit={handleAdvisorLogin} className="flex flex-col gap-4">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] text-slate-500 font-bold tracking-wider uppercase">Código de Asesor</label>
                    <input
                      type="text"
                      value={advisorUser}
                      onChange={(e) => setAdvisorUser(e.target.value)}
                      className="bg-[#070b13] border border-slate-800/80 rounded-xl px-4 py-3 text-sm text-slate-200 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/20 transition-all font-mono"
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] text-slate-500 font-bold tracking-wider uppercase">Contraseña</label>
                    <input
                      type="password"
                      value={advisorPass}
                      onChange={(e) => setAdvisorPass(e.target.value)}
                      className="bg-[#070b13] border border-slate-800/80 rounded-xl px-4 py-3 text-sm text-slate-200 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/20 transition-all"
                    />
                  </div>
                  <button
                    type="submit"
                    className="w-full bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-500 hover:to-teal-600 text-white font-bold py-3.5 px-6 rounded-xl shadow-lg hover:shadow-emerald-500/10 active:scale-[0.98] transition-all mt-3 text-sm tracking-wide"
                  >
                    Iniciar Sesión Corporativa
                  </button>
                </form>
              </div>
            ) : (
              // Dashboard Asesor
              <div className="flex-1 flex flex-col gap-6">
                
                {/* Advisor Header */}
                <div className="flex justify-between items-center flex-wrap gap-4 bg-[#0c1220]/30 border border-slate-900 p-6 rounded-3xl backdrop-blur-sm">
                  <div>
                    <h2 className="text-2xl font-black text-white tracking-tight">Panel de Solicitudes Fuerza de Ventas</h2>
                    <p className="text-xs text-slate-400 mt-0.5">Asesor Activo: <span className="font-bold text-slate-200">{advisorData?.username || "1001"}</span> (Supervisor Región Centro)</p>
                  </div>
                  <button
                    onClick={() => {
                      setAdvisorToken("");
                      setAdvisorData(null);
                      setSolicitudes([]);
                      showToast("Sesión cerrada correctamente", "info");
                    }}
                    className="bg-[#070b13] border border-slate-800 hover:border-rose-500/30 text-slate-400 hover:text-rose-400 font-bold text-xs py-2.5 px-4 rounded-xl transition-all duration-300"
                  >
                    Cerrar Sesión Asesor
                  </button>
                </div>

                {/* Metrics Cards */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  
                  <div className="bg-[#0c1220]/40 border border-slate-900 p-5 rounded-2xl backdrop-blur-sm">
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">Total Solicitudes</span>
                    <div className="flex items-baseline gap-2">
                      <span className="text-3xl font-black text-white">{totalSols}</span>
                      <span className="text-xs text-slate-500">expedientes</span>
                    </div>
                  </div>

                  <div className="bg-[#0c1220]/40 border border-slate-900 p-5 rounded-2xl backdrop-blur-sm relative overflow-hidden">
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">Pendiente Comité</span>
                    <div className="flex items-baseline gap-2">
                      <span className="text-3xl font-black text-yellow-400">{pendingComite}</span>
                      <span className="text-xs text-yellow-400/50">requieren evaluar</span>
                    </div>
                    {pendingComite > 0 && <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-yellow-400 animate-pulse" />}
                  </div>

                  <div className="bg-[#0c1220]/40 border border-slate-900 p-5 rounded-2xl backdrop-blur-sm">
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">Desembolsadas</span>
                    <div className="flex items-baseline gap-2">
                      <span className="text-3xl font-black text-emerald-400">{disbursedCount}</span>
                      <span className="text-xs text-emerald-400/50">aprobadas</span>
                    </div>
                  </div>

                  <div className="bg-[#0c1220]/40 border border-slate-900 p-5 rounded-2xl backdrop-blur-sm">
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">Rechazadas</span>
                    <div className="flex items-baseline gap-2">
                      <span className="text-3xl font-black text-rose-400">{rejectedCount}</span>
                      <span className="text-xs text-rose-400/50">descartadas</span>
                    </div>
                  </div>

                </div>

                {/* Status Tabs Selector */}
                <div className="flex flex-wrap bg-[#0c1220]/30 border border-slate-900/60 p-1.5 rounded-2xl gap-1">
                  {["Todas", "Enviadas", "En Comité", "Aprobadas", "Desembolsadas", "Rechazadas"].map((tab) => (
                    <button
                      key={tab}
                      onClick={() => setSelectedStatusTab(tab)}
                      className={`py-2.5 px-4 font-bold text-xs tracking-wider rounded-xl transition-all duration-200 ${
                        selectedStatusTab === tab
                          ? "bg-slate-900 text-emerald-400 border border-slate-800"
                          : "text-slate-400 hover:text-slate-200 hover:bg-slate-900/20"
                      }`}
                    >
                      {tab}
                      <span className={`ml-2 px-1.5 py-0.5 rounded text-[10px] ${
                        selectedStatusTab === tab ? "bg-emerald-950 text-emerald-300" : "bg-[#070b13] text-slate-500"
                      }`}>
                        {tab === "Todas" ? solicitudes.length : solicitudes.filter((s) => s.status === tab).length}
                      </span>
                    </button>
                  ))}
                </div>

                {/* Requests table */}
                <div className="bg-[#0c1220]/30 border border-slate-900 rounded-3xl overflow-hidden shadow-xl backdrop-blur-md">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="border-b border-slate-900 bg-[#0c1220]/60 text-slate-400 text-[10px] font-bold uppercase tracking-wider">
                          <th className="py-4.5 px-6">Expediente</th>
                          <th className="py-4.5 px-6">Cliente</th>
                          <th className="py-4.5 px-6">Monto Solicitado</th>
                          <th className="py-4.5 px-6">Estado</th>
                          <th className="py-4.5 px-6">Último Detalle</th>
                          <th className="py-4.5 px-6 text-center">Detalles</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-900 text-sm">
                        {filteredSolicitudes.length === 0 ? (
                          <tr>
                            <td colSpan="6" className="py-16 text-center text-slate-500 font-medium">
                              No se encontraron expedientes en esta categoría.
                            </td>
                          </tr>
                        ) : (
                          filteredSolicitudes.map((sol) => (
                            <tr key={sol.id} className="hover:bg-slate-900/20 transition-colors">
                              <td className="py-4 px-6 font-mono font-bold text-slate-300">{sol.id}</td>
                              <td className="py-4 px-6 font-semibold text-slate-100">{sol.name}</td>
                              <td className="py-4 px-6 font-bold text-slate-200">{sol.amount}</td>
                              <td className="py-4 px-6">
                                <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-[10px] font-black border ${
                                  sol.status === "Desembolsadas"
                                    ? "bg-emerald-950/60 text-emerald-400 border-emerald-500/20"
                                    : sol.status === "En Comité"
                                    ? "bg-yellow-950/60 text-yellow-400 border-yellow-500/20"
                                    : sol.status === "Aprobadas"
                                    ? "bg-teal-950/60 text-teal-400 border-teal-500/20"
                                    : sol.status === "Rechazadas"
                                    ? "bg-rose-950/60 text-rose-400 border-rose-500/20"
                                    : "bg-blue-950/60 text-blue-400 border-blue-500/20"
                                }`}>
                                  <span className={`w-1.5 h-1.5 rounded-full mr-1.5 ${
                                    sol.status === "Desembolsadas" ? "bg-emerald-400" :
                                    sol.status === "En Comité" ? "bg-yellow-400" :
                                    sol.status === "Aprobadas" ? "bg-teal-400" :
                                    sol.status === "Rechazadas" ? "bg-rose-400" : "bg-blue-400"
                                  }`} />
                                  {sol.status}
                                </span>
                              </td>
                              <td className="py-4 px-6 text-xs text-slate-400">{sol.date}</td>
                              <td className="py-4 px-6 text-center">
                                <button
                                  onClick={() => setSelectedSol(sol)}
                                  className="bg-slate-900 hover:bg-slate-800 text-slate-200 hover:text-emerald-400 text-xs font-bold py-1.5 px-3 rounded-lg border border-slate-800 hover:border-emerald-500/20 transition-all"
                                >
                                  Ver Flujo
                                </button>
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ==================== PORTAL CLIENTE ==================== */}
        {activePortal === "cliente" && (
          <div className="py-2 flex-1 flex flex-col gap-6">
            {!clientToken ? (
              // Login Cliente
              <div className="max-w-md w-full mx-auto my-12 bg-[#0c1220]/40 border border-slate-900 rounded-3xl p-8 backdrop-blur-md shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-500 to-teal-400" />
                <h2 className="text-2xl font-black text-white mb-1">Ingreso de Clientes</h2>
                <p className="text-xs text-slate-400 mb-6">Inicia sesión en la plataforma digital con tu DNI.</p>
                
                {clientError && (
                  <div className="bg-rose-950/20 border border-rose-500/20 text-rose-300 rounded-xl p-3.5 text-xs mb-5 flex gap-2">
                    <svg className="w-4 h-4 shrink-0 text-rose-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/></svg>
                    <span>{clientError}</span>
                  </div>
                )}
                
                <form onSubmit={handleClientLogin} className="flex flex-col gap-4">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] text-slate-500 font-bold tracking-wider uppercase">Número de DNI</label>
                    <input
                      type="text"
                      value={clientUser}
                      onChange={(e) => setClientUser(e.target.value)}
                      className="bg-[#070b13] border border-slate-800/80 rounded-xl px-4 py-3 text-sm text-slate-200 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/20 transition-all font-mono"
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] text-slate-500 font-bold tracking-wider uppercase">Contraseña</label>
                    <input
                      type="password"
                      value={clientPass}
                      onChange={(e) => setClientPass(e.target.value)}
                      className="bg-[#070b13] border border-slate-800/80 rounded-xl px-4 py-3 text-sm text-slate-200 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/20 transition-all"
                    />
                  </div>
                  <button
                    type="submit"
                    className="w-full bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-500 hover:to-teal-600 text-white font-bold py-3.5 px-6 rounded-xl shadow-lg hover:shadow-emerald-500/10 active:scale-[0.98] transition-all mt-3 text-sm tracking-wide"
                  >
                    Ingresar a Home Banking
                  </button>
                </form>
              </div>
            ) : (
              // Dashboard Cliente
              <div className="flex-1 flex flex-col gap-8">
                
                {/* Client Welcome Header */}
                <div className="flex justify-between items-center flex-wrap gap-4 bg-[#0c1220]/30 border border-slate-900 p-6 rounded-3xl backdrop-blur-sm">
                  <div>
                    <h2 className="text-2xl font-black text-slate-100 flex items-center gap-2">
                      ¡Buenos días, <span className="text-emerald-400">{clientResumen?.cliente?.nombres || "Cliente"}</span>!
                    </h2>
                    <p className="text-xs text-slate-400 mt-0.5">
                      DNI: <span className="font-mono text-slate-200">{clientResumen?.cliente?.dni}</span> | Clasificación SBS:{" "}
                      <span className={`font-bold px-2 py-0.5 rounded text-[10px] border ${
                        clientResumen?.cliente?.calificacion_sbs === "NORMAL"
                          ? "bg-emerald-950/40 text-emerald-400 border-emerald-500/20"
                          : "bg-amber-950/40 text-amber-400 border-amber-500/20"
                      }`}>
                        {clientResumen?.cliente?.calificacion_sbs}
                      </span>
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      setClientToken("");
                      setClientResumen(null);
                      setSelectedCredit(null);
                      setCronograma([]);
                      showToast("Sesión de Home Banking cerrada", "info");
                    }}
                    className="bg-[#070b13] border border-slate-800 hover:border-rose-500/30 text-slate-400 hover:text-rose-400 font-bold text-xs py-2.5 px-4 rounded-xl transition-all duration-300"
                  >
                    Salir de Home Banking
                  </button>
                </div>

                {/* Dashboard layout */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                  
                  {/* Left Column: Account Details & Loan Application */}
                  <div className="flex flex-col gap-6">
                    
                    {/* Debit Card UI */}
                    <div className="bg-gradient-to-br from-[#0c1926] via-[#091f1a] to-slate-950 border border-emerald-500/10 rounded-3xl p-6 shadow-2xl relative overflow-hidden h-48 flex flex-col justify-between">
                      <div className="absolute right-0 top-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-[40px] pointer-events-none" />
                      <div className="absolute left-1/3 bottom-0 w-24 h-24 bg-teal-500/5 rounded-full blur-[30px] pointer-events-none" />
                      
                      <div className="flex justify-between items-start">
                        <div>
                          <span className="text-[9px] font-bold text-emerald-400 uppercase tracking-widest block">BANCO ANDINO</span>
                          <span className="text-[8px] text-slate-400 font-mono">CUENTA DE AHORRO RURAL</span>
                        </div>
                        <div className="w-8 h-6 bg-slate-800/80 rounded-md border border-slate-700/50 flex items-center justify-center">
                          <div className="w-4 h-4 bg-gradient-to-r from-yellow-600 to-amber-500 rounded-sm opacity-80" />
                        </div>
                      </div>

                      <div>
                        <span className="text-[10px] text-slate-500 block uppercase font-bold tracking-wider">Saldo Disponible</span>
                        <h3 className="text-3xl font-black tracking-tight text-white">
                          S/ {clientResumen?.cuentas?.[0]?.saldo?.toLocaleString("es-PE", { minimumFractionDigits: 2, maximumFractionDigits: 2 }) || "0.00"}
                        </h3>
                      </div>

                      <div className="flex justify-between items-center text-[10px] font-mono text-slate-400 border-t border-slate-900/80 pt-2">
                        <span>CTA: {clientResumen?.cuentas?.[0]?.numero_cuenta}</span>
                        <span className="text-emerald-400/80 font-bold">VIGENTE</span>
                      </div>
                    </div>

                    {/* New Loan form */}
                    <div className="bg-[#0c1220]/40 border border-slate-900 rounded-3xl p-6 shadow-lg backdrop-blur-sm relative">
                      <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-4 border-b border-slate-900 pb-2">Solicitar Nuevo Crédito</h3>
                      
                      <form onSubmit={handleCreateLoanRequest} className="flex flex-col gap-3.5">
                        
                        <div className="flex flex-col gap-1">
                          <label className="text-[9px] text-slate-500 font-bold uppercase tracking-wider">Monto Requerido (S/)</label>
                          <input
                            type="number"
                            value={monto}
                            onChange={(e) => setMonto(e.target.value)}
                            className="bg-[#070b13] border border-slate-850 rounded-xl px-3 py-2.5 text-xs text-slate-100 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/20 font-bold"
                          />
                        </div>

                        <div className="flex flex-col gap-1">
                          <label className="text-[9px] text-slate-500 font-bold uppercase tracking-wider">Plazo de Devolución</label>
                          <select
                            value={plazo}
                            onChange={(e) => setPlazo(e.target.value)}
                            className="bg-[#070b13] border border-slate-850 rounded-xl px-3 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-emerald-500"
                          >
                            <option value="6">6 Meses (Corto Plazo)</option>
                            <option value="12">12 Meses (Estándar)</option>
                            <option value="18">18 Meses (Mediano Plazo)</option>
                            <option value="24">24 Meses (Largo Plazo)</option>
                          </select>
                        </div>

                        <div className="flex flex-col gap-1">
                          <label className="text-[9px] text-slate-500 font-bold uppercase tracking-wider">Tasa Efectiva Anual (TEA)</label>
                          <select
                            value={tea}
                            onChange={(e) => setTea(e.target.value)}
                            className="bg-[#070b13] border border-slate-850 rounded-xl px-3 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-emerald-500"
                          >
                            <option value="43.92">43.92% TEA (Regular)</option>
                            <option value="40.92">40.92% TEA (Preferencial con Seguro)</option>
                          </select>
                        </div>

                        <div className="flex items-center gap-2.5 my-1.5 bg-[#070b13] p-2.5 rounded-xl border border-slate-900">
                          <input
                            type="checkbox"
                            checked={seguro}
                            onChange={(e) => setSeguro(e.target.checked)}
                            id="seguro_chk"
                            className="w-4 h-4 rounded text-emerald-500 accent-emerald-500 cursor-pointer"
                          />
                          <label htmlFor="seguro_chk" className="text-[11px] text-slate-400 font-medium cursor-pointer">Incluir Seguro Desgravamen</label>
                        </div>

                        <button
                          type="submit"
                          className="w-full bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-500 hover:to-teal-600 text-white font-bold py-3 px-4 rounded-xl text-xs shadow-lg hover:shadow-emerald-500/10 active:scale-[0.98] transition-all"
                        >
                          Enviar Solicitud
                        </button>

                      </form>
                    </div>

                  </div>

                  {/* Right Column: Loan Details & Timeline */}
                  <div className="lg:col-span-2 flex flex-col gap-6">
                    
                    {/* Active credit details */}
                    {selectedCredit ? (
                      <div className="bg-[#0c1220]/30 border border-slate-900 rounded-3xl p-6 shadow-xl backdrop-blur-sm">
                        
                        <div className="flex justify-between items-start flex-wrap gap-4 border-b border-slate-900 pb-5 mb-5">
                          <div>
                            <span className="text-[9px] font-black text-emerald-400 bg-emerald-950/40 px-2 py-1 rounded border border-emerald-500/15 tracking-wider uppercase">Crédito Vigente</span>
                            <h3 className="text-xl font-black text-slate-100 mt-2">{selectedCredit.producto}</h3>
                            <p className="text-xs text-slate-500 mt-0.5">TEA Pactada: {selectedCredit.tea}% | Vence el: {selectedCredit.fecha_vencimiento}</p>
                          </div>
                          <div className="text-right">
                            <span className="text-[10px] text-slate-500 block uppercase font-bold tracking-wider">Capital Pendiente</span>
                            <h4 className="text-3xl font-black text-white">
                              S/ {selectedCredit.saldo_actual.toLocaleString("es-PE", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                            </h4>
                          </div>
                        </div>

                        {/* Installments schedule table */}
                        <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Cronograma de Pagos (Amortización Francesa)</h4>
                        
                        <div className="bg-[#070b13] rounded-2xl overflow-hidden border border-slate-900 shadow-inner">
                          <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                              <thead>
                                <tr className="bg-[#0c1220]/60 border-b border-slate-900 text-slate-500 text-[9px] font-bold uppercase tracking-wider">
                                  <th className="py-3 px-4">Cuota</th>
                                  <th className="py-3 px-4">F. Vence</th>
                                  <th className="py-3 px-4">Importe</th>
                                  <th className="py-3 px-4">Capital / Interés</th>
                                  <th className="py-3 px-4">Saldo Restante</th>
                                  <th className="py-3 px-4 text-center">Operación</th>
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-slate-900 text-xs">
                                {cronograma.map((cuota) => (
                                  <tr key={cuota.id} className="hover:bg-slate-900/30 transition-colors">
                                    <td className="py-3.5 px-4 font-bold text-slate-300">Cuota {cuota.numero_cuota}</td>
                                    <td className="py-3.5 px-4 text-slate-400 font-mono">{cuota.fecha_pago}</td>
                                    <td className="py-3.5 px-4 font-bold text-slate-200 font-mono">S/ {cuota.monto_cuota}</td>
                                    <td className="py-3.5 px-4 text-slate-500 font-mono">
                                      S/ {cuota.capital} / S/ {cuota.interes}
                                    </td>
                                    <td className="py-3.5 px-4 text-slate-400 font-mono">S/ {cuota.saldo_pendiente}</td>
                                    <td className="py-3.5 px-4 text-center">
                                      {cuota.estado === "pendiente" ? (
                                        <button
                                          onClick={() => handlePayCuota(cuota.id)}
                                          disabled={isPayingCuota}
                                          className="bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-[10px] py-1.5 px-3 rounded-lg shadow-sm hover:shadow-emerald-500/10 transition-all duration-200"
                                        >
                                          PAGAR
                                        </button>
                                      ) : (
                                        <span className="inline-flex items-center px-2 py-0.5 rounded text-[9px] font-black bg-emerald-950/40 text-emerald-400 border border-emerald-500/10 uppercase">
                                          PAGADO
                                        </span>
                                      )}
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        </div>

                      </div>
                    ) : (
                      <div className="bg-[#0c1220]/20 border border-dashed border-slate-900 rounded-3xl p-12 text-center text-slate-500 font-medium">
                        No registras créditos vigentes en este momento. Si requieres financiamiento, completa la solicitud a la izquierda.
                      </div>
                    )}

                    {/* Pending solicitudes list */}
                    {clientResumen?.solicitudes && clientResumen.solicitudes.length > 0 && (
                      <div className="bg-[#0c1220]/40 border border-slate-900 rounded-3xl p-6 shadow-md backdrop-blur-sm">
                        <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-4">Estado de Solicitudes en Trámite</h4>
                        
                        <div className="flex flex-col gap-3">
                          {clientResumen.solicitudes.map((sol) => (
                            <div key={sol.id} className="flex justify-between items-center bg-[#070b13] p-4 border border-slate-900 rounded-2xl hover:border-slate-800 transition-all">
                              <div>
                                <span className="font-mono text-xs font-bold text-slate-200">Expediente: {sol.expediente}</span>
                                <p className="text-[10px] text-slate-500 mt-0.5">
                                  Capital: S/ {sol.monto} | Periodo: {sol.plazo} meses | Tasa: {sol.tea}%
                                </p>
                              </div>
                              <div className="flex items-center gap-3">
                                <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-[10px] font-black border capitalize ${
                                  sol.estado === "desembolsado"
                                    ? "bg-emerald-950/50 text-emerald-400 border-emerald-500/20"
                                    : sol.estado === "rechazado"
                                    ? "bg-rose-950/50 text-rose-400 border-rose-500/20"
                                    : "bg-blue-950/50 text-blue-400 border-blue-500/20"
                                }`}>
                                  <span className={`w-1.5 h-1.5 rounded-full mr-1.5 ${
                                    sol.estado === "desembolsado" ? "bg-emerald-400" :
                                    sol.estado === "rechazado" ? "bg-rose-400" : "bg-blue-400"
                                  }`} />
                                  {sol.estado}
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>

                      </div>
                    )}

                  </div>

                </div>

              </div>
            )}
          </div>
        )}

      </div>

      {/* ADVISOR DETAILS MODAL / STEPPER DRAWER */}
      {selectedSol && (
        <div className="fixed inset-0 bg-[#070b13]/80 backdrop-blur-md flex justify-center items-center z-50 p-4">
          <div className="bg-[#0c1220] border border-slate-900 rounded-3xl max-w-2xl w-full overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-200">
            
            <div className="p-6 border-b border-slate-900 flex justify-between items-center bg-[#0c1220]/60">
              <div>
                <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">FLUJO DE PROCESAMIENTO</span>
                <h3 className="font-black text-white text-lg mt-0.5">Expediente: {selectedSol.id}</h3>
              </div>
              <button
                onClick={() => setSelectedSol(null)}
                className="text-slate-400 hover:text-slate-200 text-sm font-bold w-8 h-8 rounded-full bg-[#070b13] border border-slate-900 flex items-center justify-center transition-all"
              >
                ✕
              </button>
            </div>

            <div className="p-6 flex flex-col gap-6 text-sm max-h-[75vh] overflow-y-auto">
              
              {/* Stepper E2E Tracker */}
              <div className="bg-[#070b13] p-5 rounded-2xl border border-slate-900/60">
                <span className="text-[9px] font-bold text-slate-500 uppercase tracking-wider block mb-4">Estado del Flujo E2E</span>
                
                {/* 6 Step Pipeline */}
                <div className="grid grid-cols-6 gap-2">
                  {[
                    { label: "1. Creada", active: true },
                    { label: "2. Visita GPS", active: selectedSol.status !== "Enviadas" },
                    { label: "3. SBS Score", active: selectedSol.status !== "Enviadas" },
                    { label: "4. Firma Doc", active: selectedSol.status !== "Enviadas" },
                    { label: "5. Comité", active: selectedSol.status === "En Comité" || selectedSol.status === "Aprobadas" || selectedSol.status === "Desembolsadas" },
                    { label: "6. Depósito", active: selectedSol.status === "Desembolsadas" }
                  ].map((step, idx) => (
                    <div key={idx} className="flex flex-col items-center text-center">
                      <div className={`w-7 h-7 rounded-full flex items-center justify-center border font-bold text-xs mb-1.5 transition-all duration-300 ${
                        step.active 
                          ? "bg-emerald-950 text-emerald-400 border-emerald-500/30 shadow-lg shadow-emerald-500/10" 
                          : "bg-slate-950 text-slate-600 border-slate-900"
                      }`}>
                        {step.active ? (
                          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7"/></svg>
                        ) : idx + 1}
                      </div>
                      <span className={`text-[8px] font-extrabold tracking-tight uppercase ${
                        step.active ? "text-emerald-400" : "text-slate-600"
                      }`}>
                        {step.label}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-[#070b13] p-4 rounded-xl border border-slate-900">
                  <span className="text-[9px] text-slate-500 font-bold uppercase tracking-wider block mb-0.5">Cliente Titular</span>
                  <p className="font-bold text-slate-200">{selectedSol.name}</p>
                </div>
                <div className="bg-[#070b13] p-4 rounded-xl border border-slate-900">
                  <span className="text-[9px] text-slate-500 font-bold uppercase tracking-wider block mb-0.5">Monto Solicitado</span>
                  <p className="font-black text-emerald-400 text-lg">{selectedSol.amount}</p>
                </div>
              </div>
              
              <div className="bg-[#070b13] p-4 rounded-xl border border-slate-900">
                <span className="text-[9px] text-slate-500 font-bold uppercase tracking-wider block mb-1">Analista a Cargo</span>
                <p className="font-semibold text-slate-300">{selectedSol.analyst || "Sin asignar"}</p>
              </div>

              {selectedSol.notes && selectedSol.notes.length > 0 && (
                <div className="bg-[#070b13] p-4 rounded-xl border border-slate-900">
                  <span className="text-[9px] text-slate-500 font-bold uppercase tracking-wider block mb-2">Evaluaciones y Evidencias</span>
                  <ul className="flex flex-col gap-2">
                    {selectedSol.notes.map((note, idx) => (
                      <li key={idx} className="bg-[#0c1220] p-3 rounded-xl border border-slate-900 text-xs text-slate-300 flex items-start gap-2.5">
                        <span className="text-emerald-400 font-bold text-base leading-none">•</span>
                        <span>{note}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Committee trigger action */}
              {(selectedSol.status === "En Comité" || selectedSol.status === "Enviadas") && (
                <div className="border-t border-slate-900 pt-6 mt-2">
                  
                  <button
                    onClick={() => handleProcessComite(solicitudes.find(s => s.id === selectedSol.id)?.id || selectedSol.id)}
                    disabled={isProcessingComite}
                    className="w-full bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-500 hover:to-teal-600 text-white font-black py-3.5 px-6 rounded-xl shadow-lg flex justify-center items-center gap-2 tracking-wide disabled:opacity-50 active:scale-[0.98] transition-all"
                  >
                    {isProcessingComite && (
                      <span className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full" />
                    )}
                    Evaluar en Comité y Desembolsar Fondos
                  </button>
                  
                  <p className="text-[10px] text-slate-500 text-center mt-2.5">
                    Esta acción simulará la reunión técnica del Comité de Riesgos, validará firmas/GPS y procederá a acreditar automáticamente los fondos en la cuenta de ahorros del cliente.
                  </p>
                </div>
              )}

            </div>
          </div>
        </div>
      )}

      {/* Elegant sliding Toast */}
      {toast && (
        <div className={`fixed bottom-6 right-6 px-5 py-4 rounded-2xl shadow-2xl border backdrop-blur-xl flex items-center gap-3.5 z-50 animate-in fade-in slide-in-from-bottom-5 duration-300 ${
          toast.type === "success" 
            ? "bg-emerald-950/90 border-emerald-500/20 text-emerald-100" 
            : toast.type === "error" 
            ? "bg-rose-950/90 border-rose-500/20 text-rose-100" 
            : "bg-[#0c1220]/90 border-slate-800 text-slate-100"
        }`}>
          {toast.type === "success" && (
            <div className="w-6 h-6 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-400 shrink-0">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 12l2 2 4-4"/></svg>
            </div>
          )}
          {toast.type === "error" && (
            <div className="w-6 h-6 rounded-full bg-rose-500/10 flex items-center justify-center text-rose-400 shrink-0">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/></svg>
            </div>
          )}
          <span className="text-xs font-bold leading-relaxed">{toast.message}</span>
          <button onClick={() => setToast(null)} className="text-slate-400 hover:text-slate-200 text-xs font-bold pl-2">✕</button>
        </div>
      )}

      {/* Footer */}
      <footer className="border-t border-slate-900/60 bg-[#0c1220]/30 px-6 py-4.5 text-center text-[10px] text-slate-500 mt-auto backdrop-blur-sm z-10">
        © {new Date().getFullYear()} Banco Andino Core System. Plataforma transaccional integrada (Vía FastAPI / SQLite / Neon PostgreSQL).
      </footer>

    </div>
  );
}
