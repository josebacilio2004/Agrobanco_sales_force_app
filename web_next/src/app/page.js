"use client";

import { useState, useEffect } from "react";

export default function Home() {
  const [apiUrl, setApiUrl] = useState(process.env.NEXT_PUBLIC_API_URL || "http://localhost:8003");
  const [activePortal, setActivePortal] = useState("asesor"); // 'asesor' or 'cliente'
  const [dbStatus, setDbStatus] = useState("online");
  const [isSeeding, setIsSeeding] = useState(false);
  const [seedMessage, setSeedMessage] = useState("");

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
  const [monto, setMonto] = useState("1000");
  const [plazo, setPlazo] = useState("12");
  const [tea, setTea] = useState("43.92");
  const [seguro, setSeguro] = useState(false);
  const [garantia, setGarantia] = useState("sin garantia");
  const [destino, setDestino] = useState("Capital de trabajo: compra de mercaderia");
  const [loanSuccessMessage, setLoanSuccessMessage] = useState("");

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
    setSeedMessage("");
    try {
      const res = await fetch(`${apiUrl}/seed`, { method: "POST" });
      if (res.ok) {
        setSeedMessage("¡Base de datos restablecida y sembrada con éxito!");
        // Refresh data
        if (advisorToken) fetchAdvisorData();
        if (clientToken) fetchClientData();
      } else {
        setSeedMessage("Error al resetear la base de datos.");
      }
    } catch {
      setSeedMessage("No se pudo conectar con el backend.");
    } finally {
      setIsSeeding(false);
      setTimeout(() => setSeedMessage(""), 5000);
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
      } else {
        setAdvisorError(data.detail || "Credenciales inválidas.");
      }
    } catch {
      setAdvisorError("Error al conectar con el servidor.");
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
        alert(`Comité finalizado: ${data.decision}. Crédito desembolsado.`);
        setSelectedSol(null);
        fetchAdvisorData();
        if (clientToken) fetchClientData();
      } else {
        alert(`Error en comité: ${data.detail || "No procesado"}`);
      }
    } catch {
      alert("Error al conectar con el servidor del comité.");
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
      } else {
        setClientError(data.detail || "DNI o contraseña incorrectos.");
      }
    } catch {
      setClientError("Error al conectar con el servidor.");
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
        alert("Pago de cuota realizado con éxito debiendo de la cuenta de ahorros.");
        fetchClientData();
        fetchCronograma(selectedCredit.id);
      } else {
        alert(`Error al pagar: ${data.detail}`);
      }
    } catch {
      alert("Error de conexión al realizar pago.");
    } finally {
      setIsPayingCuota(false);
    }
  };

  const handleCreateLoanRequest = async (e) => {
    e.preventDefault();
    setLoanSuccessMessage("");
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
        setLoanSuccessMessage(`Solicitud creada: ${data.expediente}`);
        fetchClientData();
      } else {
        alert(`Error: ${data.detail}`);
      }
    } catch {
      alert("Error al registrar solicitud de crédito.");
    }
  };

  // Filter requests for advisor
  const filteredSolicitudes = solicitudes.filter((sol) => {
    if (selectedStatusTab === "Todas") return true;
    return sol.status === selectedStatusTab;
  });

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      {/* Top Banner / API Connection status */}
      <header className="border-b border-slate-800 bg-slate-900/80 backdrop-blur-md sticky top-0 z-50 px-6 py-4 flex flex-wrap justify-between items-center gap-4">
        <div className="flex items-center gap-3">
          <svg className="w-8 h-8 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364-6.364l-.707.707M6.343 17.657l-.707.707m2.828-9.9a5 5 0 117.072 0l-.707.707M6.343 6.343l-.707.707m12.728 11.314l-.707.707M4 12a8 8 0 018-8v8H4z"></path>
          </svg>
          <div>
            <h1 className="font-extrabold text-xl tracking-wider text-emerald-400">BANCO ANDINO</h1>
            <p className="text-xs text-slate-400">Plataforma Web de Negocios y Transacciones</p>
          </div>
        </div>

        {/* API connection config & seed utility */}
        <div className="flex items-center flex-wrap gap-4">
          <div className="flex items-center bg-slate-950 rounded-full border border-slate-800 px-3 py-1.5 gap-2">
            <span className="text-xs text-slate-400">API URL:</span>
            <input
              type="text"
              value={apiUrl}
              onChange={(e) => setApiUrl(e.target.value)}
              className="bg-transparent text-xs font-mono text-slate-100 focus:outline-none w-48"
            />
            <span className={`w-2.5 h-2.5 rounded-full ${dbStatus === "online" ? "bg-emerald-500 animate-pulse" : "bg-rose-500"}`} />
            <span className="text-xs font-semibold capitalize hidden sm:inline">{dbStatus}</span>
          </div>

          <button
            onClick={handleSeed}
            disabled={isSeeding}
            className="bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-500 hover:to-teal-600 text-white font-bold text-xs py-2 px-4 rounded-lg flex items-center gap-2 shadow-lg transition-all disabled:opacity-50"
          >
            {isSeeding ? (
              <span className="animate-spin h-3.5 w-3.5 border-2 border-white border-t-transparent rounded-full" />
            ) : (
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 1121.21 7.89M9 11l3-3m0 0l3 3m-3-3v12"></path></svg>
            )}
            Restablecer DB (Demo)
          </button>
        </div>
      </header>

      {/* Floating status message */}
      {seedMessage && (
        <div className="fixed top-20 left-1/2 transform -translate-x-1/2 bg-emerald-900 border-2 border-emerald-500 text-emerald-100 font-semibold px-6 py-3 rounded-xl shadow-2xl z-50 text-sm animate-bounce">
          {seedMessage}
        </div>
      )}

      {/* Main Tab bar */}
      <div className="max-w-7xl mx-auto w-full px-6 pt-8 flex-1 flex flex-col">
        <div className="flex border-b border-slate-800 gap-6">
          <button
            onClick={() => setActivePortal("asesor")}
            className={`py-3 px-6 font-bold text-sm tracking-wide border-b-2 transition-all flex items-center gap-2 ${
              activePortal === "asesor"
                ? "border-emerald-500 text-emerald-400"
                : "border-transparent text-slate-400 hover:text-slate-200"
            }`}
          >
            👔 Portal de Asesores (Fuerza de Ventas)
          </button>
          <button
            onClick={() => setActivePortal("cliente")}
            className={`py-3 px-6 font-bold text-sm tracking-wide border-b-2 transition-all flex items-center gap-2 ${
              activePortal === "cliente"
                ? "border-emerald-500 text-emerald-400"
                : "border-transparent text-slate-400 hover:text-slate-200"
            }`}
          >
            👤 Portal de Clientes (Banca Rural)
          </button>
        </div>

        {/* ==================== PORTAL ASESOR ==================== */}
        {activePortal === "asesor" && (
          <div className="py-6 flex-1 flex flex-col gap-6">
            {!advisorToken ? (
              // Login Asesor
              <div className="max-w-md w-full mx-auto my-12 bg-slate-900/60 border border-slate-800 rounded-2xl p-8 backdrop-blur-md shadow-xl">
                <h2 className="text-xl font-extrabold text-emerald-400 mb-2">Ingreso de Asesores</h2>
                <p className="text-xs text-slate-400 mb-6">Utiliza tu código de empleado y contraseña corporativa.</p>
                {advisorError && (
                  <div className="bg-rose-950/50 border border-rose-500/50 text-rose-200 rounded-lg p-3 text-xs mb-4">
                    {advisorError}
                  </div>
                )}
                <form onSubmit={handleAdvisorLogin} className="flex flex-col gap-4">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs text-slate-400 font-semibold">CÓDIGO DE ASESOR</label>
                    <input
                      type="text"
                      value={advisorUser}
                      onChange={(e) => setAdvisorUser(e.target.value)}
                      className="bg-slate-950 border border-slate-850 rounded-xl px-4 py-3 text-sm text-slate-100 focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs text-slate-400 font-semibold">CONTRASEÑA</label>
                    <input
                      type="password"
                      value={advisorPass}
                      onChange={(e) => setAdvisorPass(e.target.value)}
                      className="bg-slate-950 border border-slate-850 rounded-xl px-4 py-3 text-sm text-slate-100 focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                  <button
                    type="submit"
                    className="bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-500 hover:to-teal-600 text-white font-bold py-3 px-6 rounded-xl shadow-lg mt-2 transition-all"
                  >
                    Iniciar Sesión
                  </button>
                </form>
              </div>
            ) : (
              // Dashboard Asesor
              <div className="flex-1 flex flex-col gap-6">
                <div className="flex justify-between items-center flex-wrap gap-4">
                  <div>
                    <h2 className="text-xl font-bold text-slate-100">Panel de Solicitudes y Comité</h2>
                    <p className="text-xs text-slate-400">Bienvenido, Asesor {advisorData?.username || "1001"}</p>
                  </div>
                  <button
                    onClick={() => {
                      setAdvisorToken("");
                      setAdvisorData(null);
                      setSolicitudes([]);
                    }}
                    className="text-xs text-rose-400 font-semibold hover:underline"
                  >
                    Cerrar sesión de Asesor
                  </button>
                </div>

                {/* Status Tabs */}
                <div className="flex flex-wrap border-b border-slate-800 gap-1">
                  {["Todas", "Enviadas", "En Comité", "Aprobadas", "Desembolsadas", "Rechazadas"].map((tab) => (
                    <button
                      key={tab}
                      onClick={() => setSelectedStatusTab(tab)}
                      className={`py-2.5 px-4 font-semibold text-xs tracking-wide border-b-2 transition-all ${
                        selectedStatusTab === tab
                          ? "border-emerald-500 text-emerald-400 bg-slate-900/40"
                          : "border-transparent text-slate-400 hover:text-slate-200"
                      }`}
                    >
                      {tab} ({
                        tab === "Todas"
                          ? solicitudes.length
                          : solicitudes.filter((s) => s.status === tab).length
                      })
                    </button>
                  ))}
                </div>

                {/* Requests table */}
                <div className="bg-slate-900/40 border border-slate-850 rounded-2xl overflow-hidden shadow-lg backdrop-blur-md">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="border-b border-slate-800 bg-slate-900/60 text-slate-400 text-xs font-bold uppercase tracking-wider">
                          <th className="py-4 px-6">Expediente</th>
                          <th className="py-4 px-6">Cliente</th>
                          <th className="py-4 px-6">Monto Solicitado</th>
                          <th className="py-4 px-6">Estado</th>
                          <th className="py-4 px-6">Fecha/Detalle</th>
                          <th className="py-4 px-6 text-center">Acción</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-850 text-sm">
                        {filteredSolicitudes.length === 0 ? (
                          <tr>
                            <td colSpan="6" className="py-12 text-center text-slate-500 font-medium">
                              No se encontraron solicitudes en esta categoría.
                            </td>
                          </tr>
                        ) : (
                          filteredSolicitudes.map((sol) => (
                            <tr key={sol.id} className="hover:bg-slate-900/20 transition-all">
                              <td className="py-4 px-6 font-mono font-bold text-slate-200">{sol.id}</td>
                              <td className="py-4 px-6 font-semibold">{sol.name}</td>
                              <td className="py-4 px-6 font-bold text-slate-200">{sol.amount}</td>
                              <td className="py-4 px-6">
                                <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-extrabold border ${
                                  sol.status === "Desembolsadas"
                                    ? "bg-emerald-950/40 text-emerald-400 border-emerald-500/30"
                                    : sol.status === "En Comité"
                                    ? "bg-yellow-950/40 text-yellow-400 border-yellow-500/30"
                                    : sol.status === "Aprobadas"
                                    ? "bg-teal-950/40 text-teal-400 border-teal-500/30"
                                    : sol.status === "Rechazadas"
                                    ? "bg-rose-950/40 text-rose-400 border-rose-500/30"
                                    : "bg-blue-950/40 text-blue-400 border-blue-500/30"
                                }`}>
                                  {sol.status}
                                </span>
                              </td>
                              <td className="py-4 px-6 text-xs text-slate-400">{sol.date}</td>
                              <td className="py-4 px-6 text-center">
                                <button
                                  onClick={() => setSelectedSol(sol)}
                                  className="bg-slate-800 hover:bg-slate-700 text-slate-100 text-xs font-bold py-1.5 px-3 rounded-lg border border-slate-700"
                                >
                                  Ver Detalle
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
          <div className="py-6 flex-1 flex flex-col gap-6">
            {!clientToken ? (
              // Login Cliente
              <div className="max-w-md w-full mx-auto my-12 bg-slate-900/60 border border-slate-800 rounded-2xl p-8 backdrop-blur-md shadow-xl">
                <h2 className="text-xl font-extrabold text-emerald-400 mb-2">Ingreso de Clientes</h2>
                <p className="text-xs text-slate-400 mb-6">Inicia sesión con tu DNI de cliente demo.</p>
                {clientError && (
                  <div className="bg-rose-950/50 border border-rose-500/50 text-rose-200 rounded-lg p-3 text-xs mb-4">
                    {clientError}
                  </div>
                )}
                <form onSubmit={handleClientLogin} className="flex flex-col gap-4">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs text-slate-400 font-semibold">NÚMERO DE DNI</label>
                    <input
                      type="text"
                      value={clientUser}
                      onChange={(e) => setClientUser(e.target.value)}
                      className="bg-slate-950 border border-slate-850 rounded-xl px-4 py-3 text-sm text-slate-100 focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs text-slate-400 font-semibold">CONTRASEÑA</label>
                    <input
                      type="password"
                      value={clientPass}
                      onChange={(e) => setClientPass(e.target.value)}
                      className="bg-slate-950 border border-slate-850 rounded-xl px-4 py-3 text-sm text-slate-100 focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                  <button
                    type="submit"
                    className="bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-500 hover:to-teal-600 text-white font-bold py-3 px-6 rounded-xl shadow-lg mt-2 transition-all"
                  >
                    Ingresar a Home Banking
                  </button>
                </form>
              </div>
            ) : (
              // Dashboard Cliente
              <div className="flex-1 flex flex-col gap-8">
                <div className="flex justify-between items-center flex-wrap gap-4">
                  <div>
                    <h2 className="text-2xl font-black text-slate-100">
                      ¡Buenos días, <span className="text-emerald-400">{clientResumen?.cliente?.nombres}</span>!
                    </h2>
                    <p className="text-xs text-slate-400">DNI: {clientResumen?.cliente?.dni} | Calificación SBS: {clientResumen?.cliente?.calificacion_sbs}</p>
                  </div>
                  <button
                    onClick={() => {
                      setClientToken("");
                      setClientResumen(null);
                      setSelectedCredit(null);
                      setCronograma([]);
                    }}
                    className="text-xs text-rose-400 font-semibold hover:underline"
                  >
                    Salir de Home Banking
                  </button>
                </div>

                {/* Dashboard client details layout */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                  {/* Left stats & new loan request */}
                  <div className="flex flex-col gap-6">
                    {/* Savings Account Balance */}
                    <div className="bg-gradient-to-br from-emerald-900/60 to-slate-900 border border-emerald-500/20 rounded-2xl p-6 shadow-xl relative overflow-hidden">
                      <div className="absolute -right-8 -top-8 w-24 h-24 bg-emerald-500/10 rounded-full blur-2xl" />
                      <div className="flex justify-between items-center mb-3">
                        <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider">Saldo de Ahorros</span>
                        <svg className="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"></path></svg>
                      </div>
                      <h3 className="text-3xl font-black tracking-tight text-white mb-2">
                        S/ {clientResumen?.cuentas?.[0]?.saldo?.toLocaleString("es-PE", { minimumFractionDigits: 2, maximumFractionDigits: 2 }) || "0.00"}
                      </h3>
                      <p className="text-xs font-mono text-slate-400">Cta: {clientResumen?.cuentas?.[0]?.numero_cuenta}</p>
                    </div>

                    {/* New Loan request form */}
                    <div className="bg-slate-900/60 border border-slate-850 rounded-2xl p-6 shadow-lg backdrop-blur-sm">
                      <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wider mb-4 border-b border-slate-800 pb-2">Nueva Solicitud de Crédito</h3>
                      {loanSuccessMessage && (
                        <div className="bg-emerald-950/40 border border-emerald-500/50 text-emerald-200 rounded-lg p-3 text-xs mb-4">
                          {loanSuccessMessage}
                        </div>
                      )}
                      <form onSubmit={handleCreateLoanRequest} className="flex flex-col gap-3.5">
                        <div className="flex flex-col gap-1">
                          <label className="text-[10px] text-slate-400 font-bold uppercase">Monto Solicitado (S/)</label>
                          <input
                            type="number"
                            value={monto}
                            onChange={(e) => setMonto(e.target.value)}
                            className="bg-slate-950 border border-slate-850 rounded-lg px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-emerald-500"
                          />
                        </div>
                        <div className="flex flex-col gap-1">
                          <label className="text-[10px] text-slate-400 font-bold uppercase">Plazo (Meses)</label>
                          <select
                            value={plazo}
                            onChange={(e) => setPlazo(e.target.value)}
                            className="bg-slate-950 border border-slate-850 rounded-lg px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-emerald-500"
                          >
                            <option value="6">6 Meses</option>
                            <option value="12">12 Meses</option>
                            <option value="18">18 Meses</option>
                            <option value="24">24 Meses</option>
                          </select>
                        </div>
                        <div className="flex flex-col gap-1">
                          <label className="text-[10px] text-slate-400 font-bold uppercase">TEA Sugerida (%)</label>
                          <select
                            value={tea}
                            onChange={(e) => setTea(e.target.value)}
                            className="bg-slate-950 border border-slate-850 rounded-lg px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-emerald-500"
                          >
                            <option value="43.92">43.92% (Sin Seguro)</option>
                            <option value="40.92">40.92% (Con Seguro)</option>
                          </select>
                        </div>
                        <div className="flex items-center gap-2 my-1">
                          <input
                            type="checkbox"
                            checked={seguro}
                            onChange={(e) => setSeguro(e.target.checked)}
                            id="seguro_chk"
                            className="w-4 h-4 rounded text-emerald-500 accent-emerald-500"
                          />
                          <label htmlFor="seguro_chk" className="text-xs text-slate-300 font-medium">Incluir Seguro Desgravamen</label>
                        </div>
                        <button
                          type="submit"
                          className="bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-500 hover:to-teal-600 text-white font-bold py-2.5 px-4 rounded-xl text-xs shadow-lg transition-all"
                        >
                          Enviar Solicitud al Núcleo
                        </button>
                      </form>
                    </div>
                  </div>

                  {/* Middle active loans & schedule */}
                  <div className="lg:col-span-2 flex flex-col gap-6">
                    {/* Active credit details */}
                    {selectedCredit ? (
                      <div className="bg-slate-900/30 border border-slate-850 rounded-2xl p-6 shadow-md">
                        <div className="flex justify-between items-start flex-wrap gap-4 border-b border-slate-800 pb-4 mb-4">
                          <div>
                            <span className="text-xs font-extrabold text-emerald-400 bg-emerald-950/40 px-2 py-0.5 rounded border border-emerald-500/10">CRÉDITO ACTIVO</span>
                            <h3 className="text-lg font-black text-slate-100 mt-1">{selectedCredit.producto}</h3>
                            <p className="text-xs text-slate-400">TEA: {selectedCredit.tea}% | Vence el {selectedCredit.fecha_vencimiento}</p>
                          </div>
                          <div className="text-right">
                            <span className="text-xs text-slate-400 block uppercase font-bold">Saldo de la Deuda</span>
                            <h4 className="text-2xl font-black text-slate-100">
                              S/ {selectedCredit.saldo_actual.toLocaleString("es-PE", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                            </h4>
                          </div>
                        </div>

                        {/* Installments schedule table */}
                        <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-3">Cronograma de Cuotas (Amortización Francesa)</h4>
                        <div className="bg-slate-950/50 rounded-xl overflow-hidden border border-slate-850">
                          <table className="w-full text-left border-collapse">
                            <thead>
                              <tr className="bg-slate-900/60 border-b border-slate-850 text-slate-400 text-[10px] font-extrabold uppercase">
                                <th className="py-2.5 px-4">Cuota</th>
                                <th className="py-2.5 px-4">Vencimiento</th>
                                <th className="py-2.5 px-4">Monto Cuota</th>
                                <th className="py-2.5 px-4">Capital/Interés</th>
                                <th className="py-2.5 px-4">Saldo Pend.</th>
                                <th className="py-2.5 px-4 text-center">Acción</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-850 text-xs">
                              {cronograma.map((cuota) => (
                                <tr key={cuota.id} className="hover:bg-slate-900/10">
                                  <td className="py-2.5 px-4 font-bold text-slate-300">Cuota {cuota.numero_cuota}</td>
                                  <td className="py-2.5 px-4 text-slate-400">{cuota.fecha_pago}</td>
                                  <td className="py-2.5 px-4 font-bold text-slate-200">S/ {cuota.monto_cuota}</td>
                                  <td className="py-2.5 px-4 text-slate-400">
                                    S/ {cuota.capital} / S/ {cuota.interes}
                                  </td>
                                  <td className="py-2.5 px-4 text-slate-300">S/ {cuota.saldo_pendiente}</td>
                                  <td className="py-2.5 px-4 text-center">
                                    {cuota.estado === "pendiente" ? (
                                      <button
                                        onClick={() => handlePayCuota(cuota.id)}
                                        disabled={isPayingCuota}
                                        className="bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-[10px] py-1 px-2.5 rounded-lg transition-all"
                                      >
                                        PAGAR
                                      </button>
                                    ) : (
                                      <span className="text-[10px] font-extrabold text-emerald-400 bg-emerald-950/30 px-2 py-0.5 rounded border border-emerald-500/10 uppercase">
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
                    ) : (
                      <div className="bg-slate-900/10 border border-dashed border-slate-800 rounded-2xl p-12 text-center text-slate-500 font-medium">
                        No cuentas con créditos activos vigentes. Solicita uno en el panel de la izquierda.
                      </div>
                    )}

                    {/* Pending solicitudes list */}
                    {clientResumen?.solicitudes && clientResumen.solicitudes.length > 0 && (
                      <div className="bg-slate-900/20 border border-slate-850 rounded-2xl p-6">
                        <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-3">Solicitudes de Crédito en Trámite</h4>
                        <div className="flex flex-col gap-3">
                          {clientResumen.solicitudes.map((sol) => (
                            <div key={sol.id} className="flex justify-between items-center bg-slate-950/60 p-4 border border-slate-850 rounded-xl">
                              <div>
                                <span className="font-mono text-xs font-bold text-slate-300">Expediente: {sol.expediente}</span>
                                <p className="text-xs text-slate-400">Monto: S/ {sol.monto} | Plazo: {sol.plazo} meses</p>
                              </div>
                              <div>
                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold border capitalize ${
                                  sol.estado === "desembolsado"
                                    ? "bg-emerald-950 text-emerald-400 border-emerald-500/25"
                                    : sol.estado === "rechazado"
                                    ? "bg-rose-950 text-rose-400 border-rose-500/25"
                                    : "bg-blue-950 text-blue-400 border-blue-500/25"
                                }`}>
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

      {/* ADVISOR DETAILS MODAL DRAWER */}
      {selectedSol && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex justify-center items-center z-50 p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-lg w-full overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-slate-850 flex justify-between items-center">
              <h3 className="font-black text-slate-100 text-lg">EXPEDIENTE: {selectedSol.id}</h3>
              <button
                onClick={() => setSelectedSol(null)}
                className="text-slate-400 hover:text-slate-200 text-sm font-bold p-1"
              >
                ✕
              </button>
            </div>
            <div className="p-6 flex flex-col gap-4 text-sm max-h-[70vh] overflow-y-auto">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="text-[10px] text-slate-400 font-bold uppercase">Cliente</span>
                  <p className="font-bold text-slate-200">{selectedSol.name}</p>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 font-bold uppercase">Monto Solicitado</span>
                  <p className="font-black text-slate-100 text-lg">{selectedSol.amount}</p>
                </div>
              </div>
              
              <div className="border-t border-slate-850 pt-4">
                <span className="text-[10px] text-slate-400 font-bold uppercase block mb-1">Estado de Solicitud</span>
                <span className="inline-block px-3 py-1 rounded-full font-bold text-xs bg-slate-950 border border-slate-800 text-emerald-400">
                  {selectedSol.status}
                </span>
              </div>

              <div className="border-t border-slate-850 pt-4">
                <span className="text-[10px] text-slate-400 font-bold uppercase block mb-1">Analista Asignado</span>
                <p className="font-medium text-slate-300">{selectedSol.analyst}</p>
              </div>

              {selectedSol.notes && selectedSol.notes.length > 0 && (
                <div className="border-t border-slate-850 pt-4">
                  <span className="text-[10px] text-slate-400 font-bold uppercase block mb-1.5">Historial y Notas de Evaluación</span>
                  <ul className="flex flex-col gap-2">
                    {selectedSol.notes.map((note, idx) => (
                      <li key={idx} className="bg-slate-950/60 p-3 rounded-lg border border-slate-850 text-xs text-slate-300 flex items-start gap-2">
                        <span className="text-emerald-500 font-bold">•</span>
                        <span>{note}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Committee trigger action */}
              {(selectedSol.status === "En Comité" || selectedSol.status === "Enviadas") && (
                <div className="border-t border-slate-850 pt-6 mt-2">
                  <button
                    onClick={() => handleProcessComite(solicitudes.find(s => s.id === selectedSol.id)?.id || selectedSol.id)}
                    disabled={isProcessingComite}
                    className="w-full bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-500 hover:to-teal-600 text-white font-black py-3 px-6 rounded-xl shadow-lg flex justify-center items-center gap-2 tracking-wide disabled:opacity-50"
                  >
                    {isProcessingComite && (
                      <span className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full" />
                    )}
                    Procesar Comité y Desembolsar Crédito
                  </button>
                  <p className="text-[10px] text-slate-500 text-center mt-2">
                    Esta acción simulará la resolución del Comité (Aprobado/Condicionado) y depositará automáticamente los fondos en la cuenta de ahorros.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="border-t border-slate-850 bg-slate-900/30 px-6 py-4 text-center text-xs text-slate-500 mt-auto">
        © {new Date().getFullYear()} Banco Andino Core System. Todos los derechos reservados.
      </footer>
    </div>
  );
}
