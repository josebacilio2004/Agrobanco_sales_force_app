"use client";

import { useState, useEffect } from "react";

export default function Home() {
  const [apiUrl, setApiUrl] = useState(process.env.NEXT_PUBLIC_API_URL || "http://localhost:8003");
  const [activePortal, setActivePortal] = useState("asesor"); // 'asesor' or 'cliente'
  const [dbStatus, setDbStatus] = useState("online");
  const [isSeeding, setIsSeeding] = useState(false);
  const [toast, setToast] = useState(null);

  // ==================== STATE: ADVISOR (SALESFORCE) ====================
  const [advisorToken, setAdvisorToken] = useState("");
  const [advisorUser, setAdvisorUser] = useState("1001");
  const [advisorPass, setAdvisorPass] = useState("agrobanco");
  const [advisorData, setAdvisorData] = useState(null);
  
  // Salesforce lists
  const [cartera, setCartera] = useState([]);
  const [solicitudes, setSolicitudes] = useState([]);
  const [advisorTab, setAdvisorTab] = useState("cartera"); // 'cartera' or 'solicitudes'
  const [selectedStatusTab, setSelectedStatusTab] = useState("Todas");
  
  // Selected Workspaces
  const [selectedClient, setSelectedClient] = useState(null);
  const [selectedClientDetails, setSelectedClientDetails] = useState(null);
  const [selectedSol, setSelectedSol] = useState(null);
  const [advisorError, setAdvisorError] = useState("");

  // Salesforce E2E Evaluation inputs
  const [buroReport, setBuroReport] = useState(null);
  const [isBuroLoading, setIsBuroLoading] = useState(false);
  
  const [latVisita, setLatVisita] = useState("-12.0581");
  const [lngVisita, setLngVisita] = useState("-75.2027");
  const [obsVisita, setObsVisita] = useState("Visita realizada en predio agrícola. Se valida cultivos de maíz en buen estado.");
  const [isVisitLoading, setIsVisitLoading] = useState(false);
  const [isVisitCompleted, setIsVisitCompleted] = useState(false);

  const [firmaUrl, setFirmaUrl] = useState("");
  const [isFirmaUploading, setIsFirmaUploading] = useState(false);

  const [isPromoting, setIsPromoting] = useState(false);
  const [isProcessingComite, setIsProcessingComite] = useState(false);

  // ==================== STATE: CLIENT (HOME BANKING) ====================
  const [clientToken, setClientToken] = useState("");
  const [clientUser, setClientUser] = useState("40118120"); // Anaximandro Quispe
  const [clientPass, setClientPass] = useState("agrobanco");
  const [clientResumen, setClientResumen] = useState(null);
  const [selectedCredit, setSelectedCredit] = useState(null);
  const [cronograma, setCronograma] = useState([]);
  const [clientError, setClientError] = useState("");
  const [isPayingCuota, setIsPayingCuota] = useState(false);
  
  // Client new request form
  const [monto, setMonto] = useState("5000");
  const [plazo, setPlazo] = useState("12");
  const [tea, setTea] = useState("40.92");
  const [seguro, setSeguro] = useState(true);
  const [garantia, setGarantia] = useState("sin garantia");
  const [destino, setDestino] = useState("Capital de trabajo: compra de fertilizantes y semillas de maíz");

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
        showToast("¡Base de datos de Agrobanco restablecida y sembrada con éxito!", "success");
        // Reset states
        setSelectedClient(null);
        setSelectedClientDetails(null);
        setSelectedSol(null);
        setBuroReport(null);
        setIsVisitCompleted(false);
        setFirmaUrl("");
        if (advisorToken) {
          fetchCartera();
          fetchAdvisorData();
        }
        if (clientToken) fetchClientData();
      } else {
        showToast("Error al resetear la base de datos.", "error");
      }
    } catch {
      showToast("No se pudo conectar con el servidor de Agrobanco.", "error");
    } finally {
      setIsSeeding(false);
    }
  };

  // ==================== ADVISOR ACTIONS (SALESFORCE) ====================
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
        fetchCartera(data.token);
        fetchAdvisorData(data.token);
        showToast("Sesión iniciada en Agrobanco Salesforce", "success");
      } else {
        setAdvisorError(data.detail || "Credenciales corporativas inválidas.");
        showToast(data.detail || "Credenciales de Asesor incorrectas.", "error");
      }
    } catch {
      setAdvisorError("Error al conectar con el servidor de Agrobanco.");
      showToast("Error de conexión con el backend", "error");
    }
  };

  const fetchCartera = async (token = advisorToken) => {
    if (!token) return;
    try {
      const res = await fetch(`${apiUrl}/fv/cartera`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setCartera(data);
      }
    } catch (err) {
      console.error("Error fetching portfolio:", err);
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
      console.error("Error fetching credit requests:", err);
    }
  };

  // Select a client to work on in Salesforce
  const handleSelectClient = async (clientItem) => {
    setSelectedClient(clientItem);
    setSelectedClientDetails(null);
    setBuroReport(null);
    setIsVisitCompleted(false);
    setFirmaUrl("");
    
    // Auto preset coordinates based on case location
    if (clientItem.dni === "40118120") {
      setLatVisita("-12.0581");
      setLngVisita("-75.2027");
    } else if (clientItem.dni === "41223341") {
      setLatVisita("-12.0921");
      setLngVisita("-75.2105");
    } else if (clientItem.dni === "42330336") {
      setLatVisita("-12.0734");
      setLngVisita("-75.2289");
    } else {
      setLatVisita("-12.0463");
      setLngVisita("-75.1955");
    }
    
    try {
      const res = await fetch(`${apiUrl}/fv/cliente/${clientItem.id}`, {
        headers: { Authorization: `Bearer ${advisorToken}` },
      });
      if (res.ok) {
        const data = await res.json();
        setSelectedClientDetails(data);
        
        // Check if visit and signature were already completed on backend
        if (data.solicitud_estado && data.solicitud_estado !== "enviado") {
          setIsVisitCompleted(true);
        }
      }
    } catch (err) {
      console.error(err);
      showToast("Error al obtener expediente del cliente.", "error");
    }
  };

  // SF STEP 1: Query credit bureau (SBS)
  const handleConsultarBuro = async () => {
    if (!selectedClientDetails) return;
    setIsBuroLoading(true);
    try {
      const res = await fetch(`${apiUrl}/fv/buro/consultar`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${advisorToken}`,
        },
        body: JSON.stringify({ dni: selectedClientDetails.dni }),
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

  // SF STEP 2: Register field visit (GPS)
  const handleRegistrarVisita = async () => {
    if (!selectedClientDetails || !selectedClientDetails.solicitud_id) {
      showToast("El cliente debe registrar primero una solicitud de crédito.", "error");
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
          solicitud_id: selectedClientDetails.solicitud_id,
          lat: parseFloat(latVisita),
          lng: parseFloat(lngVisita),
          observacion: obsVisita,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setIsVisitCompleted(true);
        showToast("Coordenadas GPS y Visita técnica registradas.", "success");
        // Refresh details
        handleSelectClient(selectedClient);
      } else {
        showToast(data.detail || "Error al registrar visita.", "error");
      }
    } catch {
      showToast("Error de conexión al guardar visita.", "error");
    } finally {
      setIsVisitLoading(false);
    }
  };

  // SF STEP 3: Capture digital signature
  const handleCapturarFirma = async () => {
    if (!selectedClientDetails || !selectedClientDetails.solicitud_id) return;
    setIsFirmaUploading(true);
    try {
      // Simulate signature image upload
      const blob = new Blob(["mock_signature_bytes_from_salesforce"], { type: "image/png" });
      const file = new File([blob], "firma_digital.png", { type: "image/png" });
      const formData = new FormData();
      formData.append("solicitud_id", selectedClientDetails.solicitud_id);
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
      } else {
        showToast(data.detail || "Error al subir la firma.", "error");
      }
    } catch {
      showToast("Error de red al subir firma digital.", "error");
    } finally {
      setIsFirmaUploading(false);
    }
  };

  // SF STEP 4: Promover al Comité
  const handlePromoverComite = async () => {
    if (!selectedClientDetails || !selectedClientDetails.solicitud_id) return;
    setIsPromoting(true);
    try {
      const res = await fetch(`${apiUrl}/fv/solicitud/promover`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${advisorToken}`,
        },
        body: JSON.stringify({ solicitud_id: selectedClientDetails.solicitud_id }),
      });
      const data = await res.json();
      if (res.ok) {
        showToast("Expediente promovido electrónicamente al Comité.", "success");
        fetchCartera();
        fetchAdvisorData();
        handleSelectClient(selectedClient);
      } else {
        showToast(data.detail || "Error al promover la solicitud.", "error");
      }
    } catch {
      showToast("Error de conexión al transmitir expediente.", "error");
    } finally {
      setIsPromoting(false);
    }
  };

  // SF STEP 5: Dictaminar Comité (Desembolso)
  const handleProcessComiteDirect = async (solId) => {
    setIsProcessingComite(true);
    try {
      const res = await fetch(`${apiUrl}/comite/procesar/${solId}`, {
        method: "POST",
      });
      const data = await res.json();
      if (res.ok) {
        showToast(`Comité Dictamina: ${data.decision}. Fondos desembolsados.`, "success");
        fetchCartera();
        fetchAdvisorData();
        if (selectedClient) handleSelectClient(selectedClient);
      } else {
        showToast(`Error en comité: ${data.detail || "No procesado"}`, "error");
      }
    } catch {
      showToast("Error al conectar con la pasarela del comité.", "error");
    } finally {
      setIsProcessingComite(false);
    }
  };


  // ==================== CLIENT ACTIONS (HOME BANKING) ====================
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
        showToast("Acceso exitoso a Agrobanco Multicanal", "success");
      } else {
        setClientError(data.detail || "DNI o contraseña incorrectos.");
        showToast(data.detail || "DNI o contraseña incorrectos.", "error");
      }
    } catch {
      setClientError("Error al conectar con el servidor de Agrobanco.");
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
        showToast("¡Cuota cancelada con éxito debiendo de tu Cuenta de Ahorros!", "success");
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
        showToast(`Solicitud Agrícola ingresada. Expediente: ${data.expediente}`, "success");
        fetchClientData();
        if (advisorToken) {
          fetchCartera();
          fetchAdvisorData();
        }
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

  return (
    <div className="min-h-screen bg-[#020604] text-slate-100 flex flex-col font-sans relative overflow-x-hidden">
      
      {/* Decorative Blur Background (Agrobanco Green & Golden Crops) */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
        <div className="absolute top-[-15%] left-[-10%] w-[600px] h-[600px] bg-[#00824A]/10 rounded-full blur-[150px]" />
        <div className="absolute bottom-[-15%] right-[-10%] w-[600px] h-[600px] bg-[#FFB800]/5 rounded-full blur-[150px]" />
        <div className="absolute top-[40%] right-[15%] w-[450px] h-[450px] bg-[#00824A]/5 rounded-full blur-[140px]" />
      </div>

      {/* Top Banner / API Connection status */}
      <header className="border-b border-[#0c1e13] bg-[#050c07]/90 backdrop-blur-xl sticky top-0 z-40 px-6 py-4.5 flex flex-wrap justify-between items-center gap-4 shadow-lg shadow-black/40">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#00824A] to-[#80c576] flex items-center justify-center shadow-lg shadow-[#00824A]/25">
            <svg className="w-6 h-6 text-[#020604]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 3.5 0 9.5a7 7 0 0 1-8 8.5z" />
              <path d="M19 2c-2.26 4.33-5.27 7.14-8 8" />
            </svg>
          </div>
          <div>
            <h1 className="font-black text-xl tracking-tight text-white flex items-center gap-1.5">
              AGRO<span className="text-[#FFB800]">BANCO</span>
            </h1>
            <p className="text-[10px] uppercase font-extrabold tracking-widest text-[#00824A]">Plataforma de Movilidad y Negocios</p>
          </div>
        </div>

        {/* API connection config & seed utility */}
        <div className="flex items-center flex-wrap gap-4 z-10">
          <div className="flex items-center bg-[#020604]/90 rounded-xl border border-[#0d2116] px-3.5 py-2.5 gap-2 shadow-inner">
            <span className="text-[9px] font-black text-slate-500 uppercase tracking-wider">Servidor Core:</span>
            <input
              type="text"
              value={apiUrl}
              onChange={(e) => setApiUrl(e.target.value)}
              className="bg-transparent text-xs font-mono text-[#80c576] focus:outline-none w-52"
            />
            <span className={`w-2.5 h-2.5 rounded-full ${dbStatus === "online" ? "bg-[#00824A] shadow-lg shadow-[#00824A]/50 animate-pulse" : "bg-rose-500 shadow-lg shadow-rose-500/50"}`} />
            <span className="text-[9px] font-black uppercase text-slate-400 hidden sm:inline">{dbStatus}</span>
          </div>

          <button
            onClick={handleSeed}
            disabled={isSeeding}
            className="bg-[#050c07] border border-[#0d2116] hover:border-[#00824A]/40 text-slate-300 hover:text-[#FFB800] font-black text-xs py-2.5 px-4.5 rounded-xl flex items-center gap-2 shadow-md transition-all duration-300 disabled:opacity-50 group"
          >
            {isSeeding ? (
              <span className="animate-spin h-3.5 w-3.5 border-2 border-slate-300 border-t-transparent rounded-full" />
            ) : (
              <svg className="w-3.5 h-3.5 transition-transform group-hover:rotate-180 duration-500 text-[#FFB800]" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 1121.21 7.89M9 11l3-3m0 0l3 3m-3-3v12"></path></svg>
            )}
            Reiniciar Base de Datos
          </button>
        </div>
      </header>

      {/* Main Tab bar */}
      <div className="max-w-7xl mx-auto w-full px-6 pt-8 flex-1 flex flex-col z-10 relative">
        
        {/* Navigation Selector */}
        <div className="flex bg-[#050c07]/80 p-1.5 rounded-2xl border border-[#0d2116] shadow-lg max-w-lg mb-8">
          <button
            onClick={() => setActivePortal("asesor")}
            className={`flex-1 py-3.5 px-5 font-black text-xs tracking-wider rounded-xl transition-all duration-300 flex items-center justify-center gap-2 ${
              activePortal === "asesor"
                ? "bg-gradient-to-r from-[#00824A] to-[#144f33] text-white shadow-lg shadow-[#00824A]/10"
                : "text-slate-400 hover:text-slate-200 hover:bg-[#050c07]/50"
            }`}
          >
            💼 Fuerza de Ventas (Salesforce)
          </button>
          <button
            onClick={() => setActivePortal("cliente")}
            className={`flex-1 py-3.5 px-5 font-black text-xs tracking-wider rounded-xl transition-all duration-300 flex items-center justify-center gap-2 ${
              activePortal === "cliente"
                ? "bg-gradient-to-r from-[#00824A] to-[#144f33] text-white shadow-lg shadow-[#00824A]/10"
                : "text-slate-400 hover:text-slate-200 hover:bg-[#050c07]/50"
            }`}
          >
            👤 Multicanal Clientes (Web)
          </button>
        </div>

        {/* ==================== PORTAL ASESOR (SALESFORCE) ==================== */}
        {activePortal === "asesor" && (
          <div className="py-2 flex-1 flex flex-col gap-6">
            {!advisorToken ? (
              // Login Asesor
              <div className="max-w-md w-full mx-auto my-12 bg-[#050c07]/60 border border-[#0d2116] rounded-3xl p-8 backdrop-blur-md shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-[#00824A] to-[#FFB800]" />
                <h2 className="text-2xl font-black text-white mb-1">Ingreso Corporativo</h2>
                <p className="text-xs text-slate-400 mb-6">Oficiales de Negocios de Agrobanco - Salesforce Campo.</p>
                
                {advisorError && (
                  <div className="bg-rose-950/20 border border-rose-500/20 text-rose-300 rounded-xl p-3.5 text-xs mb-5 flex gap-2">
                    <svg className="w-4 h-4 shrink-0 text-rose-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/></svg>
                    <span>{advisorError}</span>
                  </div>
                )}
                
                <form onSubmit={handleAdvisorLogin} className="flex flex-col gap-4">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] text-slate-500 font-black tracking-wider uppercase">Código de Empleado (DNI)</label>
                    <input
                      type="text"
                      value={advisorUser}
                      onChange={(e) => setAdvisorUser(e.target.value)}
                      className="bg-[#020604] border border-[#0d2116] rounded-xl px-4 py-3.5 text-sm text-slate-200 focus:outline-none focus:border-[#00824A] focus:ring-1 focus:ring-[#00824A]/20 transition-all font-mono"
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] text-slate-500 font-black tracking-wider uppercase">Contraseña</label>
                    <input
                      type="password"
                      value={advisorPass}
                      onChange={(e) => setAdvisorPass(e.target.value)}
                      className="bg-[#020604] border border-[#0d2116] rounded-xl px-4 py-3.5 text-sm text-slate-200 focus:outline-none focus:border-[#00824A] focus:ring-1 focus:ring-[#00824A]/20 transition-all"
                    />
                  </div>
                  <button
                    type="submit"
                    className="w-full bg-gradient-to-r from-[#00824A] to-[#144f33] hover:from-[#00a85f] hover:to-[#1a6442] text-white font-black py-4 px-6 rounded-xl shadow-lg active:scale-[0.98] transition-all mt-3 text-xs tracking-widest uppercase"
                  >
                    Iniciar Sesión Salesforce
                  </button>
                </form>
              </div>
            ) : (
              // Dashboard Asesor (Salesforce Layout)
              <div className="flex-1 flex flex-col gap-6">
                
                {/* Advisor Info Bar */}
                <div className="flex justify-between items-center flex-wrap gap-4 bg-[#050c07]/40 border border-[#0d2116] p-6 rounded-3xl backdrop-blur-sm shadow-xl">
                  <div>
                    <h2 className="text-xl font-black text-white tracking-tight flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-[#00824A]" />
                      Terminal de Campo Salesforce
                    </h2>
                    <p className="text-xs text-slate-400 mt-1">
                      Asesor: <span className="font-bold text-[#80c576]">Código {advisorData?.username || "1001"}</span> | Agencia: Huancayo
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      setAdvisorToken("");
                      setAdvisorData(null);
                      setCartera([]);
                      setSolicitudes([]);
                      setSelectedClient(null);
                      setSelectedClientDetails(null);
                      showToast("Sesión cerrada en Salesforce", "info");
                    }}
                    className="bg-[#020604] border border-[#0d2116] hover:border-rose-500/30 text-slate-400 hover:text-rose-400 font-bold text-xs py-2.5 px-4.5 rounded-xl transition-all duration-300"
                  >
                    Salir de Salesforce
                  </button>
                </div>

                {/* Main Two-Column Salesforce Workspace */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                  
                  {/* Left Column (Lists) */}
                  <div className="lg:col-span-5 flex flex-col gap-5">
                    
                    {/* Tab Switcher (Cartera vs Solicitudes) */}
                    <div className="flex bg-[#050c07] p-1 rounded-xl border border-[#0d2116] shadow-sm">
                      <button
                        onClick={() => setAdvisorTab("cartera")}
                        className={`flex-1 py-2 px-3 font-bold text-xs rounded-lg transition-all ${
                          advisorTab === "cartera"
                            ? "bg-[#0d2116] text-[#FFB800] border border-[#00824A]/20"
                            : "text-slate-400 hover:text-slate-200"
                        }`}
                      >
                        🌾 Mi Cartera Diaria ({cartera.length})
                      </button>
                      <button
                        onClick={() => setAdvisorTab("solicitudes")}
                        className={`flex-1 py-2 px-3 font-bold text-xs rounded-lg transition-all ${
                          advisorTab === "solicitudes"
                            ? "bg-[#0d2116] text-[#FFB800] border border-[#00824A]/20"
                            : "text-slate-400 hover:text-slate-200"
                        }`}
                      >
                        📂 Solicitudes en Trámite ({solicitudes.length})
                      </button>
                    </div>

                    {/* Content Lists */}
                    {advisorTab === "cartera" ? (
                      /* List 1: Cartera Diaria */
                      <div className="bg-[#050c07]/40 border border-[#0d2116] rounded-3xl p-4.5 flex flex-col gap-3 max-h-[600px] overflow-y-auto">
                        <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-1.5">Clientes Asignados para Ruta en Campo</h3>
                        {cartera.length === 0 ? (
                          <p className="text-xs text-slate-500 text-center py-8">No se encontraron clientes asignados.</p>
                        ) : (
                          cartera.map((item) => (
                            <div
                              key={item.id}
                              onClick={() => handleSelectClient(item)}
                              className={`p-4 rounded-2xl border transition-all cursor-pointer flex flex-col gap-1.5 ${
                                selectedClient?.id === item.id
                                  ? "bg-[#0c1e13] border-[#00824A] shadow-md shadow-[#00824A]/5"
                                  : "bg-[#020604] border-[#0d2116] hover:border-[#00824A]/20"
                              }`}
                            >
                              <div className="flex justify-between items-start">
                                <span className="font-black text-xs text-white leading-tight">{item.name}</span>
                                <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase ${
                                  item.priority === "ALTA"
                                    ? "bg-rose-950/60 text-rose-400 border border-rose-500/20"
                                    : item.priority === "MEDIA"
                                    ? "bg-amber-950/60 text-amber-400 border border-amber-500/20"
                                    : "bg-slate-900 text-slate-400"
                                }`}>
                                  {item.priority}
                                </span>
                              </div>
                              
                              <div className="flex justify-between items-center text-[10px] text-slate-400 mt-1">
                                <span className="font-mono">DNI: {item.dni}</span>
                                <span className="font-bold text-[#FFB800]">{item.status}</span>
                              </div>

                              <div className="flex justify-between items-center text-[9px] text-slate-500 border-t border-[#0d2116]/80 pt-2 mt-1">
                                <span>Predio: {item.location}</span>
                                <span className={`font-black uppercase flex items-center gap-1 ${
                                  item.isVisited ? "text-emerald-400" : "text-amber-500"
                                }`}>
                                  <span className={`w-1.5 h-1.5 rounded-full ${item.isVisited ? "bg-emerald-400" : "bg-amber-500"}`} />
                                  {item.isVisited ? "VISITADO" : "PENDIENTE VISITA"}
                                </span>
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    ) : (
                      /* List 2: Solicitudes en Trámite */
                      <div className="bg-[#050c07]/40 border border-[#0d2116] rounded-3xl p-4.5 flex flex-col gap-3 max-h-[600px] overflow-y-auto">
                        <div className="flex justify-between items-center px-1.5">
                          <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Listado de Expedientes</h3>
                          <select
                            value={selectedStatusTab}
                            onChange={(e) => setSelectedStatusTab(e.target.value)}
                            className="bg-[#020604] border border-[#0d2116] rounded-md px-2 py-0.5 text-[10px] text-slate-400 focus:outline-none"
                          >
                            {["Todas", "Enviadas", "En Comité", "Aprobadas", "Desembolsadas", "Rechazadas"].map(t => (
                              <option key={t} value={t}>{t}</option>
                            ))}
                          </select>
                        </div>
                        {filteredSolicitudes.length === 0 ? (
                          <p className="text-xs text-slate-500 text-center py-8">No se encontraron expedientes.</p>
                        ) : (
                          filteredSolicitudes.map((sol) => (
                            <div
                              key={sol.id}
                              onClick={() => {
                                // Find client item in cartera to trigger detailed workspace load
                                const match = cartera.find(c => c.dni === sol.id.split("_")[0] || c.dni === sol.id || c.name === sol.name);
                                if (match) {
                                  handleSelectClient(match);
                                } else {
                                  // Fallback mock select
                                  setSelectedClient({ id: sol.id, name: sol.name, dni: sol.id, status: "NUEVA_SOLICITUD" });
                                  setSelectedClientDetails({
                                    nombres: sol.name.split(" ")[0],
                                    apellidos: sol.name.split(" ").slice(1).join(" "),
                                    dni: sol.id,
                                    solicitud_id: sol.id,
                                    solicitud_estado: sol.status.toLowerCase(),
                                    solicitud_monto: parseFloat(sol.amount.replace("S/ ", "").replace(",", "")),
                                    solicitud_plazo: 12
                                  });
                                }
                              }}
                              className="p-3.5 bg-[#020604] border border-[#0d2116] hover:border-[#00824A]/20 rounded-2xl transition-all cursor-pointer flex flex-col gap-1"
                            >
                              <div className="flex justify-between items-center">
                                <span className="font-mono font-bold text-xs text-slate-300">{sol.id}</span>
                                <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase ${
                                  sol.status === "Desembolsadas" ? "bg-emerald-950 text-emerald-400" :
                                  sol.status === "Rechazadas" ? "bg-rose-950 text-rose-400" : "bg-slate-900 text-slate-400"
                                }`}>
                                  {sol.status}
                                </span>
                              </div>
                              <span className="font-bold text-xs text-white leading-tight mt-1">{sol.name}</span>
                              <div className="flex justify-between items-center text-[10px] text-slate-500 mt-1">
                                <span>Monto: {sol.amount}</span>
                                <span>{sol.date}</span>
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    )}
                  </div>

                  {/* Right Column (Detailed Evaluation Workspace) */}
                  <div className="lg:col-span-7">
                    {!selectedClient ? (
                      /* Empty Workspace State */
                      <div className="bg-[#050c07]/20 border border-dashed border-[#0d2116] rounded-3xl p-16 text-center flex flex-col items-center justify-center min-h-[450px]">
                        <svg className="w-12 h-12 text-slate-600 mb-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                          <polyline points="14 2 14 8 20 8" />
                          <line x1="16" y1="13" x2="8" y2="13" />
                          <line x1="16" y1="17" x2="8" y2="17" />
                          <polyline points="10 9 9 9 8 9" />
                        </svg>
                        <h3 className="font-bold text-slate-300 text-base mb-1">Área de Evaluación de Campo</h3>
                        <p className="text-xs text-slate-500 max-w-sm">
                          Selecciona un cliente de tu cartera diaria o una solicitud pendiente de la izquierda para desplegar la Ficha de Salesforce y ejecutar los pasos del flujo de aprobación.
                        </p>
                      </div>
                    ) : (
                      /* Active Salesforce Client Folder Workspace */
                      <div className="bg-[#050c07]/40 border border-[#0d2116] rounded-3xl p-6 flex flex-col gap-6 shadow-xl backdrop-blur-sm">
                        
                        {/* Folder Header */}
                        <div className="border-b border-[#0d2116] pb-4.5 flex justify-between items-start flex-wrap gap-3">
                          <div>
                            <span className="text-[9px] font-black text-[#FFB800] bg-[#142316] px-2 py-0.5 rounded border border-[#00824A]/25 tracking-widest uppercase">
                              Expediente Salesforce
                            </span>
                            <h3 className="text-xl font-black text-white mt-1.5">
                              {selectedClientDetails?.nombres} {selectedClientDetails?.apellidos}
                            </h3>
                            <p className="text-xs text-slate-400 font-mono mt-0.5">DNI: {selectedClient.dni}</p>
                          </div>

                          <div className="text-right">
                            <span className="text-[9px] text-slate-500 block uppercase font-bold tracking-wider">Flujo E2E actual</span>
                            <span className={`inline-block px-2.5 py-1 rounded-lg text-[10px] font-black border capitalize mt-1 ${
                              selectedClientDetails?.solicitud_estado === "desembolsado"
                                ? "bg-emerald-950/60 text-emerald-400 border-emerald-500/20"
                                : selectedClientDetails?.solicitud_estado === "recibido_comite" || selectedClientDetails?.solicitud_estado === "en_evaluacion"
                                ? "bg-yellow-950/60 text-yellow-400 border-yellow-500/20"
                                : selectedClientDetails?.solicitud_estado === "rechazado"
                                ? "bg-rose-950/60 text-rose-400 border-rose-500/20"
                                : "bg-blue-950/60 text-blue-400 border-blue-500/20"
                            }`}>
                              {selectedClientDetails?.solicitud_estado || "Sin solicitud activa"}
                            </span>
                          </div>
                        </div>

                        {/* Interactive Steps Accordion */}
                        <div className="flex flex-col gap-4">
                          
                          {/* STEP 1: Ficha y Evaluación Económica */}
                          <div className="bg-[#020604] border border-[#0d2116] rounded-2xl p-4.5">
                            <h4 className="text-xs font-black text-slate-300 uppercase tracking-wider mb-3 flex items-center gap-2 border-b border-[#0d2116] pb-2">
                              <span className="w-5 h-5 rounded-full bg-[#0d2116] text-[#FFB800] flex items-center justify-center font-bold text-[10px]">1</span>
                              Ficha Socioeconómica y Predio Agrícola
                            </h4>
                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-xs">
                              <div>
                                <span className="text-[9px] text-slate-500 font-bold block">Negocio / Fundo</span>
                                <span className="font-semibold text-slate-200">{selectedClientDetails?.nombre_negocio || "Carga..."}</span>
                              </div>
                              <div>
                                <span className="text-[9px] text-slate-500 font-bold block">Antigüedad</span>
                                <span className="font-semibold text-slate-200">{selectedClientDetails?.antiguedad_meses ? `${selectedClientDetails.antiguedad_meses} meses` : "Carga..."}</span>
                              </div>
                              <div>
                                <span className="text-[9px] text-slate-500 font-bold block">Teléfono</span>
                                <span className="font-semibold text-slate-200 font-mono">{selectedClientDetails?.telefono || "Carga..."}</span>
                              </div>
                              <div>
                                <span className="text-[9px] text-slate-500 font-bold block">Ingreso Estimado</span>
                                <span className="font-bold text-emerald-400">S/ {selectedClientDetails?.ingresos?.toLocaleString()}</span>
                              </div>
                              <div>
                                <span className="text-[9px] text-slate-500 font-bold block">Gasto Mensual</span>
                                <span className="font-bold text-slate-300">S/ {selectedClientDetails?.gastos?.toLocaleString()}</span>
                              </div>
                              <div>
                                <span className="text-[9px] text-slate-500 font-bold block">Excedente Neto</span>
                                <span className="font-bold text-emerald-400">S/ {(selectedClientDetails?.ingresos - selectedClientDetails?.gastos || 0).toLocaleString()}</span>
                              </div>
                            </div>
                          </div>

                          {/* STEP 2: Buró SBS */}
                          <div className="bg-[#020604] border border-[#0d2116] rounded-2xl p-4.5">
                            <h4 className="text-xs font-black text-slate-300 uppercase tracking-wider mb-3 flex items-center gap-2 border-b border-[#0d2116] pb-2">
                              <span className="w-5 h-5 rounded-full bg-[#0d2116] text-[#FFB800] flex items-center justify-center font-bold text-[10px]">2</span>
                              Consulta Buró SBS
                            </h4>
                            
                            {!buroReport ? (
                              <div className="flex flex-col gap-2.5">
                                <p className="text-xs text-slate-500">Comprueba el puntaje crediticio y la calificación SBS oficial del cliente.</p>
                                <button
                                  onClick={handleConsultarBuro}
                                  disabled={isBuroLoading}
                                  className="w-full sm:w-auto bg-[#0d2116] border border-[#00824A]/40 text-[#FFB800] font-black py-2 px-4 rounded-xl text-xs flex justify-center items-center gap-2 transition-all hover:bg-[#123121]"
                                >
                                  {isBuroLoading ? (
                                    <span className="animate-spin h-3.5 w-3.5 border-2 border-[#FFB800] border-t-transparent rounded-full" />
                                  ) : "Consultar Buró y Listas SBS"}
                                </button>
                              </div>
                            ) : (
                              <div className="flex flex-col gap-3">
                                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
                                  <div>
                                    <span className="text-[9px] text-slate-500 font-bold block">Calificación SBS</span>
                                    <span className={`inline-block font-black px-2 py-0.5 rounded text-[10px] mt-0.5 ${
                                      buroReport.sbs_rating === "NORMAL" ? "bg-emerald-950 text-emerald-400" :
                                      buroReport.sbs_rating === "CPP" ? "bg-amber-950 text-amber-400" : "bg-rose-950 text-rose-400"
                                    }`}>
                                      {buroReport.sbs_rating}
                                    </span>
                                  </div>
                                  <div>
                                    <span className="text-[9px] text-slate-500 font-bold block">Score Financiero</span>
                                    <span className="font-bold text-slate-200 font-mono">{buroReport.score} / 1000</span>
                                  </div>
                                  <div>
                                    <span className="text-[9px] text-slate-500 font-bold block">Deuda Total</span>
                                    <span className="font-bold text-slate-200 font-mono">S/ {buroReport.deuda_total.toLocaleString()}</span>
                                  </div>
                                  <div>
                                    <span className="text-[9px] text-slate-500 font-bold block">Pautas / Dictamen</span>
                                    <span className={`font-black ${buroReport.recomendacion === "RECOMENDADO" ? "text-emerald-400" : "text-rose-400"}`}>
                                      {buroReport.recomendacion}
                                    </span>
                                  </div>
                                </div>
                              </div>
                            )}
                          </div>

                          {/* STEP 3: Visita de Campo & GPS */}
                          <div className="bg-[#020604] border border-[#0d2116] rounded-2xl p-4.5">
                            <h4 className="text-xs font-black text-slate-300 uppercase tracking-wider mb-3 flex items-center gap-2 border-b border-[#0d2116] pb-2">
                              <span className="w-5 h-5 rounded-full bg-[#0d2116] text-[#FFB800] flex items-center justify-center font-bold text-[10px]">3</span>
                              Visita de Campo y Geolocalización (GPS)
                            </h4>

                            {!selectedClientDetails?.solicitud_id ? (
                              <p className="text-xs text-slate-500">
                                Esperando a que el cliente cree una solicitud de crédito agrícola desde su cuenta de Home Banking para registrar las coordenadas.
                              </p>
                            ) : (
                              <div className="flex flex-col gap-3 text-xs">
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                  <div className="flex flex-col gap-1">
                                    <label className="text-[9px] text-slate-500 font-bold uppercase">Latitud (GPS)</label>
                                    <input
                                      type="text"
                                      value={latVisita}
                                      onChange={(e) => setLatVisita(e.target.value)}
                                      disabled={isVisitCompleted}
                                      className="bg-[#020604] border border-[#0d2116] rounded-xl px-3 py-2 text-slate-200 focus:outline-none focus:border-[#00824A] font-mono"
                                    />
                                  </div>
                                  <div className="flex flex-col gap-1">
                                    <label className="text-[9px] text-slate-500 font-bold uppercase">Longitud (GPS)</label>
                                    <input
                                      type="text"
                                      value={lngVisita}
                                      onChange={(e) => setLngVisita(e.target.value)}
                                      disabled={isVisitCompleted}
                                      className="bg-[#020604] border border-[#0d2116] rounded-xl px-3 py-2 text-slate-200 focus:outline-none focus:border-[#00824A] font-mono"
                                    />
                                  </div>
                                </div>
                                
                                <div className="flex flex-col gap-1">
                                  <label className="text-[9px] text-slate-500 font-bold uppercase">Observación Técnica de Campo</label>
                                  <textarea
                                    value={obsVisita}
                                    onChange={(e) => setObsVisita(e.target.value)}
                                    disabled={isVisitCompleted}
                                    rows="2"
                                    className="bg-[#020604] border border-[#0d2116] rounded-xl px-3 py-2 text-slate-200 focus:outline-none focus:border-[#00824A]"
                                  />
                                </div>

                                {!isVisitCompleted ? (
                                  <button
                                    onClick={handleRegistrarVisita}
                                    disabled={isVisitLoading}
                                    className="w-full sm:w-auto bg-[#0d2116] border border-[#00824A]/40 text-[#FFB800] font-black py-2 px-4 rounded-xl text-xs flex justify-center items-center gap-2 transition-all hover:bg-[#123121]"
                                  >
                                    {isVisitLoading ? (
                                      <span className="animate-spin h-3.5 w-3.5 border-2 border-[#FFB800] border-t-transparent rounded-full" />
                                    ) : "Registrar Visita y Georreferencia"}
                                  </button>
                                ) : (
                                  <div className="bg-[#0c1e13] border border-[#00824A]/30 text-emerald-400 p-2.5 rounded-xl flex items-center gap-2">
                                    <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7"/></svg>
                                    <span>Visita georreferenciada completada con éxito.</span>
                                  </div>
                                )}
                              </div>
                            )}
                          </div>

                          {/* STEP 4: Carga de Documentos / Firma Digital */}
                          <div className="bg-[#020604] border border-[#0d2116] rounded-2xl p-4.5">
                            <h4 className="text-xs font-black text-slate-300 uppercase tracking-wider mb-3 flex items-center gap-2 border-b border-[#0d2116] pb-2">
                              <span className="w-5 h-5 rounded-full bg-[#0d2116] text-[#FFB800] flex items-center justify-center font-bold text-[10px]">4</span>
                              Expediente de Documentos y Firma Digital
                            </h4>
                            
                            {!selectedClientDetails?.solicitud_id ? (
                              <p className="text-xs text-slate-500">Debe haber una solicitud activa para adjuntar documentos.</p>
                            ) : (
                              <div className="flex flex-col gap-3 text-xs">
                                <div className="grid grid-cols-2 gap-2 text-[10px] text-slate-400">
                                  <div className="flex items-center gap-2 bg-[#020604] border border-[#0d2116] p-2.5 rounded-xl">
                                    <span className="w-2 h-2 rounded-full bg-[#00824A]" />
                                    <span>Foto DNI (Anverso/Reverso)</span>
                                  </div>
                                  <div className="flex items-center gap-2 bg-[#020604] border border-[#0d2116] p-2.5 rounded-xl">
                                    <span className="w-2 h-2 rounded-full bg-[#00824A]" />
                                    <span>Título del Predio Rural</span>
                                  </div>
                                </div>

                                {!firmaUrl && !selectedClientDetails.firma_path ? (
                                  <button
                                    onClick={handleCapturarFirma}
                                    disabled={isFirmaUploading}
                                    className="w-full sm:w-auto bg-[#0d2116] border border-[#00824A]/40 text-[#FFB800] font-black py-2 px-4 rounded-xl text-xs flex justify-center items-center gap-2 transition-all hover:bg-[#123121]"
                                  >
                                    {isFirmaUploading ? (
                                      <span className="animate-spin h-3.5 w-3.5 border-2 border-[#FFB800] border-t-transparent rounded-full" />
                                    ) : "Capturar Firma Digital de Conformidad"}
                                  </button>
                                ) : (
                                  <div className="bg-[#0c1e13] border border-[#00824A]/30 text-emerald-400 p-2.5 rounded-xl flex items-center gap-2">
                                    <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7"/></svg>
                                    <span>Firma Digital cargada en el expediente electrónico.</span>
                                  </div>
                                )}
                              </div>
                            )}
                          </div>

                          {/* STEP 5: Transmisión y Comité */}
                          <div className="bg-[#020604] border border-[#0d2116] rounded-2xl p-4.5 relative overflow-hidden">
                            <h4 className="text-xs font-black text-slate-300 uppercase tracking-wider mb-3 flex items-center gap-2 border-b border-[#0d2116] pb-2">
                              <span className="w-5 h-5 rounded-full bg-[#0d2116] text-[#FFB800] flex items-center justify-center font-bold text-[10px]">5</span>
                              Aprobación y Desembolso
                            </h4>

                            {/* State machine handler */}
                            {selectedClientDetails?.solicitud_estado === "enviado" || selectedClientDetails?.solicitud_estado === "en_evaluacion" ? (
                              <div className="flex flex-col gap-2">
                                <p className="text-xs text-slate-500">Transmite la ficha técnica y expediente completo al Comité Central.</p>
                                <button
                                  onClick={handlePromoverComite}
                                  disabled={isPromoting || !isVisitCompleted}
                                  className="w-full bg-gradient-to-r from-[#00824A] to-[#144f33] hover:from-[#00a85f] text-white font-black py-2.5 px-4 rounded-xl text-xs transition-all disabled:opacity-40"
                                >
                                  {isPromoting ? "Transmitiendo expediente..." : "Promover Solicitud al Comité"}
                                </button>
                                {!isVisitCompleted && <span className="text-[9px] text-amber-500">⚠️ Debes registrar la georreferencia de campo (Paso 3) primero.</span>}
                              </div>
                            ) : selectedClientDetails?.solicitud_estado === "recibido_comite" ? (
                              <div className="bg-[#0c1220]/80 p-4 border border-[#0d2116] rounded-xl flex flex-col gap-3">
                                <div>
                                  <span className="text-[9px] font-black text-[#FFB800] block uppercase">Evaluación de Comité Activa</span>
                                  <p className="text-xs text-slate-400 mt-0.5">El expediente ha sido recibido. Procede con la dictaminación de riesgos y autodesembolso.</p>
                                </div>
                                <button
                                  onClick={() => handleProcessComiteDirect(selectedClientDetails.solicitud_id)}
                                  disabled={isProcessingComite}
                                  className="w-full bg-[#FFB800] hover:bg-[#e6a600] text-[#020604] font-black py-3 px-4 rounded-xl text-xs transition-all shadow-md flex justify-center items-center gap-2"
                                >
                                  {isProcessingComite ? (
                                    <span className="animate-spin h-3.5 w-3.5 border-2 border-[#020604] border-t-transparent rounded-full" />
                                  ) : "DICTAMINAR COMITÉ Y DESEMBOLSAR"}
                                </button>
                              </div>
                            ) : selectedClientDetails?.solicitud_estado === "desembolsado" ? (
                              <div className="bg-[#0c1e13] border border-[#00824A]/25 text-emerald-400 p-4 rounded-xl flex flex-col gap-1">
                                <span className="text-xs font-black uppercase">Crédito Desembolsado con Éxito</span>
                                <p className="text-[10px] text-slate-400 leading-normal mt-0.5">
                                  La operación ha concluido. El préstamo de S/ {selectedClientDetails?.solicitud_monto?.toLocaleString()} se encuentra activo y los fondos se han acreditado en la cuenta de ahorros.
                                </p>
                              </div>
                            ) : selectedClientDetails?.solicitud_estado === "rechazado" ? (
                              <div className="bg-rose-950/20 border border-rose-500/20 text-rose-400 p-4 rounded-xl">
                                <span className="text-xs font-black uppercase">Solicitud Rechazada por Riesgos</span>
                                <p className="text-[10px] text-slate-400 mt-0.5">El cliente no califica para este producto agrícola debido a deuda en el sistema financiero o inhabilitación.</p>
                              </div>
                            ) : (
                              <p className="text-xs text-slate-500">Cargando flujos del expediente...</p>
                            )}

                          </div>

                        </div>

                      </div>
                    )}
                  </div>

                </div>

              </div>
            )}
          </div>
        )}

        {/* ==================== PORTAL CLIENTE (HOME BANKING) ==================== */}
        {activePortal === "cliente" && (
          <div className="py-2 flex-1 flex flex-col gap-6">
            {!clientToken ? (
              // Login Cliente
              <div className="max-w-md w-full mx-auto my-12 bg-[#050c07]/60 border border-[#0d2116] rounded-3xl p-8 backdrop-blur-md shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-[#00824A] to-[#FFB800]" />
                <h2 className="text-2xl font-black text-white mb-1">Banca por Internet</h2>
                <p className="text-xs text-slate-400 mb-6">Portal digital para clientes agrícolas de Agrobanco.</p>
                
                {clientError && (
                  <div className="bg-rose-950/20 border border-rose-500/20 text-rose-300 rounded-xl p-3.5 text-xs mb-5 flex gap-2">
                    <svg className="w-4 h-4 shrink-0 text-rose-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/></svg>
                    <span>{clientError}</span>
                  </div>
                )}
                
                <form onSubmit={handleClientLogin} className="flex flex-col gap-4">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] text-slate-500 font-black tracking-wider uppercase">Número de DNI</label>
                    <input
                      type="text"
                      value={clientUser}
                      onChange={(e) => setClientUser(e.target.value)}
                      className="bg-[#020604] border border-[#0d2116] rounded-xl px-4 py-3.5 text-sm text-slate-200 focus:outline-none focus:border-[#00824A] focus:ring-1 focus:ring-[#00824A]/20 transition-all font-mono"
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] text-slate-500 font-black tracking-wider uppercase">Contraseña</label>
                    <input
                      type="password"
                      value={clientPass}
                      onChange={(e) => setClientPass(e.target.value)}
                      className="bg-[#020604] border border-[#0d2116] rounded-xl px-4 py-3.5 text-sm text-slate-200 focus:outline-none focus:border-[#00824A] focus:ring-1 focus:ring-[#00824A]/20 transition-all"
                    />
                  </div>
                  <button
                    type="submit"
                    className="w-full bg-gradient-to-r from-[#00824A] to-[#144f33] hover:from-[#00a85f] hover:to-[#1a6442] text-white font-black py-4 px-6 rounded-xl shadow-lg active:scale-[0.98] transition-all mt-3 text-xs tracking-widest uppercase"
                  >
                    Ingresar a Banca Rural
                  </button>
                </form>
              </div>
            ) : (
              // Dashboard Cliente (Home Banking)
              <div className="flex-1 flex flex-col gap-8">
                
                {/* Client Welcome Bar */}
                <div className="flex justify-between items-center flex-wrap gap-4 bg-[#050c07]/40 border border-[#0d2116] p-6 rounded-3xl backdrop-blur-sm shadow-xl">
                  <div>
                    <h2 className="text-2xl font-black text-slate-100 flex items-center gap-2">
                      ¡Hola, <span className="text-[#FFB800]">{clientResumen?.cliente?.nombres}</span>!
                    </h2>
                    <p className="text-xs text-slate-400 mt-1">
                      DNI: <span className="font-mono text-slate-200">{clientResumen?.cliente?.dni}</span> | Clasificación SBS:{" "}
                      <span className={`font-black px-2 py-0.5 rounded text-[9px] border ${
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
                      showToast("Sesión de Banca Rural cerrada", "info");
                    }}
                    className="bg-[#020604] border border-[#0d2116] hover:border-rose-500/30 text-slate-400 hover:text-rose-400 font-bold text-xs py-2.5 px-4.5 rounded-xl transition-all duration-300"
                  >
                    Salir de Banca Rural
                  </button>
                </div>

                {/* Grid layout */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                  
                  {/* Left Column: Account Details & Loan Application */}
                  <div className="flex flex-col gap-6">
                    
                    {/* Debit Card UI */}
                    <div className="bg-gradient-to-br from-[#072417] via-[#0d1611] to-[#040806] border border-[#00824A]/25 rounded-3xl p-6 shadow-2xl relative overflow-hidden h-48 flex flex-col justify-between">
                      <div className="absolute right-0 top-0 w-32 h-32 bg-[#FFB800]/5 rounded-full blur-[40px] pointer-events-none" />
                      <div className="absolute left-1/3 bottom-0 w-24 h-24 bg-[#00824A]/5 rounded-full blur-[30px] pointer-events-none" />
                      
                      <div className="flex justify-between items-start">
                        <div>
                          <span className="text-[10px] font-black text-[#FFB800] tracking-widest block">AGROBANCO</span>
                          <span className="text-[7.5px] text-slate-400 font-mono">CUENTA DE AHORRO RURAL</span>
                        </div>
                        <div className="w-8 h-6 bg-[#0c1e13]/80 rounded-md border border-[#00824A]/25 flex items-center justify-center">
                          <div className="w-4.5 h-4 bg-gradient-to-r from-yellow-600 to-amber-500 rounded-sm opacity-80" />
                        </div>
                      </div>

                      <div>
                        <span className="text-[9px] text-slate-500 block uppercase font-bold tracking-wider">Saldo de Ahorros Disponible</span>
                        <h3 className="text-3xl font-black tracking-tight text-white">
                          S/ {clientResumen?.cuentas?.[0]?.saldo?.toLocaleString("es-PE", { minimumFractionDigits: 2, maximumFractionDigits: 2 }) || "0.00"}
                        </h3>
                      </div>

                      <div className="flex justify-between items-center text-[9.5px] font-mono text-slate-400 border-t border-[#0d2116] pt-2">
                        <span>Cta: {clientResumen?.cuentas?.[0]?.numero_cuenta}</span>
                        <span className="text-emerald-400/80 font-bold tracking-widest text-[8px] uppercase">VIGENTE</span>
                      </div>
                    </div>

                    {/* New Loan form */}
                    <div className="bg-[#050c07]/40 border border-[#0d2116] rounded-3xl p-6 shadow-lg backdrop-blur-sm relative">
                      <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-4 border-b border-[#0d2116] pb-2">Nueva Solicitud de Crédito Agrícola</h3>
                      
                      <form onSubmit={handleCreateLoanRequest} className="flex flex-col gap-3.5">
                        
                        <div className="flex flex-col gap-1">
                          <label className="text-[9px] text-slate-500 font-bold uppercase tracking-wider">Monto Requerido (S/)</label>
                          <input
                            type="number"
                            value={monto}
                            onChange={(e) => setMonto(e.target.value)}
                            className="bg-[#020604] border border-[#0d2116] rounded-xl px-3 py-2.5 text-xs text-slate-100 focus:outline-none focus:border-[#00824A] focus:ring-1 focus:ring-[#00824A]/20 font-bold"
                          />
                        </div>

                        <div className="flex flex-col gap-1">
                          <label className="text-[9px] text-slate-500 font-bold uppercase tracking-wider">Plazo (Meses)</label>
                          <select
                            value={plazo}
                            onChange={(e) => setPlazo(e.target.value)}
                            className="bg-[#020604] border border-[#0d2116] rounded-xl px-3 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-[#00824A]"
                          >
                            <option value="6">6 Meses (Corta Campaña)</option>
                            <option value="12">12 Meses (Estándar Anual)</option>
                            <option value="18">18 Meses (Mediano Plazo)</option>
                            <option value="24">24 Meses (Largo Plazo / Inversión)</option>
                          </select>
                        </div>

                        <div className="flex flex-col gap-1">
                          <label className="text-[9px] text-slate-500 font-bold uppercase tracking-wider">Tasa Efectiva Anual (TEA)</label>
                          <select
                            value={tea}
                            onChange={(e) => setTea(e.target.value)}
                            className="bg-[#020604] border border-[#0d2116] rounded-xl px-3 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-[#00824A]"
                          >
                            <option value="40.92">40.92% TEA (Preferencial con Seguro)</option>
                            <option value="43.92">43.92% TEA (Regular sin Seguro)</option>
                          </select>
                        </div>

                        <div className="flex items-center gap-2.5 my-1.5 bg-[#020604] p-2.5 rounded-xl border border-[#0d2116]">
                          <input
                            type="checkbox"
                            checked={seguro}
                            onChange={(e) => setSeguro(e.target.checked)}
                            id="seguro_chk"
                            className="w-4 h-4 rounded text-[#00824A] accent-[#00824A] cursor-pointer"
                          />
                          <label htmlFor="seguro_chk" className="text-[11px] text-slate-400 font-medium cursor-pointer">Incluir Seguro Desgravamen</label>
                        </div>

                        <button
                          type="submit"
                          className="w-full bg-gradient-to-r from-[#00824A] to-[#144f33] hover:from-[#00a85f] hover:to-[#1a6442] text-white font-bold py-3 px-4 rounded-xl text-xs shadow-lg hover:shadow-[#00824A]/10 active:scale-[0.98] transition-all"
                        >
                          Enviar Solicitud al Sistema
                        </button>

                      </form>
                    </div>

                  </div>

                  {/* Right Column: Active Loans & Installments schedule */}
                  <div className="lg:col-span-2 flex flex-col gap-6">
                    
                    {/* Active credit details */}
                    {selectedCredit ? (
                      <div className="bg-[#050c07]/40 border border-[#0d2116] rounded-3xl p-6 shadow-xl backdrop-blur-sm">
                        
                        <div className="flex justify-between items-start flex-wrap gap-4 border-b border-[#0d2116] pb-5 mb-5">
                          <div>
                            <span className="text-[9px] font-black text-[#FFB800] bg-[#142316] px-2 py-1 rounded border border-[#00824A]/25 tracking-widest uppercase">
                              Línea Agrícola Vigente
                            </span>
                            <h3 className="text-xl font-black text-slate-100 mt-2">{selectedCredit.producto}</h3>
                            <p className="text-xs text-slate-500 mt-0.5">TEA: {selectedCredit.tea}% | Vencimiento: {selectedCredit.fecha_vencimiento}</p>
                          </div>
                          <div className="text-right">
                            <span className="text-[9px] text-slate-500 block uppercase font-bold tracking-wider">Deuda Pendiente</span>
                            <h4 className="text-3xl font-black text-white">
                              S/ {selectedCredit.saldo_actual.toLocaleString("es-PE", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                            </h4>
                          </div>
                        </div>

                        {/* Installments schedule table */}
                        <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Cronograma de Cuotas (Amortización Francesa)</h4>
                        
                        <div className="bg-[#020604] rounded-2xl overflow-hidden border border-[#0d2116] shadow-inner">
                          <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                              <thead>
                                <tr className="bg-[#050c07]/60 border-b border-[#0d2116] text-slate-500 text-[9px] font-bold uppercase tracking-wider">
                                  <th className="py-3 px-4">N° Cuota</th>
                                  <th className="py-3 px-4">Vence el</th>
                                  <th className="py-3 px-4">Importe Cuota</th>
                                  <th className="py-3 px-4">Amortización / Interés</th>
                                  <th className="py-3 px-4">Saldo Deuda</th>
                                  <th className="py-3 px-4 text-center">Acciones</th>
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-[#0d2116] text-xs">
                                {cronograma.map((cuota) => (
                                  <tr key={cuota.id} className="hover:bg-[#050c07]/40 transition-colors">
                                    <td className="py-3.5 px-4 font-bold text-slate-300">Cuota {cuota.numero_cuota}</td>
                                    <td className="py-3.5 px-4 text-slate-400 font-mono">{cuota.fecha_pago}</td>
                                    <td className="py-3.5 px-4 font-bold text-slate-200 font-mono">S/ {cuota.monto_cuota}</td>
                                    <td className="py-3.5 px-4 text-slate-500 font-mono">
                                      S/ {cuota.capital} / S/ {cuota.interes}
                                    </td>
                                    <td className="py-3.5 px-4 text-slate-400 font-mono font-bold">S/ {cuota.saldo_pendiente}</td>
                                    <td className="py-3.5 px-4 text-center">
                                      {cuota.estado === "pendiente" ? (
                                        <button
                                          onClick={() => handlePayCuota(cuota.id)}
                                          disabled={isPayingCuota}
                                          className="bg-gradient-to-r from-[#00824A] to-[#144f33] hover:from-[#00a85f] text-white font-extrabold text-[10px] py-1.5 px-3.5 rounded-lg shadow-sm transition-all active:scale-95"
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
                      <div className="bg-[#050c07]/20 border border-dashed border-[#0d2116] rounded-3xl p-12 text-center text-slate-500 font-medium">
                        No mantienes deudas activas en este periodo. Si requieres financiamiento para tu cultivo, completa la solicitud.
                      </div>
                    )}

                    {/* Pending solicitudes list */}
                    {clientResumen?.solicitudes && clientResumen.solicitudes.length > 0 && (
                      <div className="bg-[#050c07]/40 border border-[#0d2116] rounded-3xl p-6 shadow-md backdrop-blur-sm">
                        <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-4">Estado de Expedientes en Trámite</h4>
                        
                        <div className="flex flex-col gap-3">
                          {clientResumen.solicitudes.map((sol) => (
                            <div key={sol.id} className="flex justify-between items-center bg-[#020604] p-4 border border-[#0d2116] rounded-2xl hover:border-[#0c1e13] transition-all">
                              <div>
                                <span className="font-mono text-xs font-bold text-slate-200">Expediente: {sol.expediente}</span>
                                <p className="text-[10px] text-slate-500 mt-0.5">
                                  Préstamo: S/ {sol.monto} | Plazo: {sol.plazo} meses | Tasa: {sol.tea}%
                                </p>
                              </div>
                              <div className="flex items-center gap-3">
                                <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-[10px] font-black border capitalize ${
                                  sol.estado === "desembolsado"
                                    ? "bg-[#0c1e13]/60 text-emerald-400 border-emerald-500/20"
                                    : sol.estado === "rechazado"
                                    ? "bg-rose-950/60 text-rose-400 border-rose-500/20"
                                    : "bg-blue-950/60 text-blue-400 border-blue-500/20"
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

      {/* Elegant sliding Toast */}
      {toast && (
        <div className={`fixed bottom-6 right-6 px-5 py-4 rounded-2xl shadow-2xl border backdrop-blur-xl flex items-center gap-3.5 z-50 animate-in fade-in slide-in-from-bottom-5 duration-300 ${
          toast.type === "success" 
            ? "bg-[#0c1e13]/90 border-[#00824A]/25 text-emerald-100" 
            : toast.type === "error" 
            ? "bg-rose-950/90 border-rose-500/20 text-rose-100" 
            : "bg-[#050c07]/90 border-[#0d2116] text-slate-100"
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
      <footer className="border-t border-[#0d2116] bg-[#050c07]/40 px-6 py-5 text-center text-[10px] text-slate-500 mt-auto backdrop-blur-sm z-10">
        © {new Date().getFullYear()} Banco Agropecuario (Agrobanco). Plataforma Digital Integrada Salesforce & Core Móvil. Todos los derechos reservados.
      </footer>

    </div>
  );
}
