"use client";

import { useState, useEffect } from "react";
import TopBar from "./components/TopBar";
import Sidebar from "./components/Sidebar";
import LoginScreen from "./components/LoginScreen";
import Dashboard from "./components/Dashboard";
import CarteraView from "./components/CarteraView";
import ClientWorkspace from "./components/ClientWorkspace";
import SolicitudesView from "./components/SolicitudesView";
import SimuladorView from "./components/SimuladorView";
import CobranzaView from "./components/CobranzaView";
import Toast from "./components/Toast";

export default function Home() {
  const [apiUrl, setApiUrl] = useState(
    process.env.NEXT_PUBLIC_API_URL || "https://agrobanco-api.onrender.com"
  );
  const [dbStatus, setDbStatus] = useState("online");
  const [isSeeding, setIsSeeding] = useState(false);
  const [toast, setToast] = useState(null);

  // Auth & Advisor state
  const [advisorToken, setAdvisorToken] = useState("");
  const [advisorData, setAdvisorData] = useState(null);
  const [advisorError, setAdvisorError] = useState("");

  // Navigation and Layout state
  const [activeTab, setActiveTab] = useState("dashboard"); // dashboard, cartera, solicitudes, simulador, cobranza, reportes, reasignacion
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [selectedClient, setSelectedClient] = useState(null);

  // Salesforce lists
  const [cartera, setCartera] = useState([]);
  const [solicitudes, setSolicitudes] = useState([]);

  // Show customized toast helper
  const showToast = (message, type = "success") => {
    setToast({ message, type });
  };

  // Check API Health
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

  useEffect(() => {
    checkHealth();
    // Poll health check every 15 seconds
    const interval = setInterval(checkHealth, 15000);
    return () => clearInterval(interval);
  }, [apiUrl]);

  // Refetch data immediately and poll every 10 seconds when logged in or API URL changes
  useEffect(() => {
    if (!advisorToken) return;

    // Fetch immediately
    fetchCartera(advisorToken);
    fetchAdvisorData(advisorToken);

    // Poll every 10 seconds
    const pollInterval = setInterval(() => {
      fetchCartera(advisorToken);
      fetchAdvisorData(advisorToken);
    }, 10000);

    return () => clearInterval(pollInterval);
  }, [apiUrl, advisorToken]);

  // Seeder trigger
  const handleSeed = async () => {
    setIsSeeding(true);
    try {
      const res = await fetch(`${apiUrl}/seed`, { method: "POST" });
      if (res.ok) {
        showToast("¡Base de datos sembrada e inicializada con éxito!", "success");
        setSelectedClient(null);
        if (advisorToken) {
          fetchCartera(advisorToken);
          fetchAdvisorData(advisorToken);
        }
      } else {
        showToast("Error al resetear la base de datos.", "error");
      }
    } catch {
      showToast("No se pudo conectar con el servidor de Agrobanco.", "error");
    } finally {
      setIsSeeding(false);
    }
  };

  // Advisor login action
  const handleAdvisorLogin = async (username, password) => {
    setAdvisorError("");
    try {
      const res = await fetch(`${apiUrl}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });
      const data = await res.json();
      if (res.ok) {
        setAdvisorToken(data.token);
        setAdvisorData(data);
        fetchCartera(data.token);
        fetchAdvisorData(data.token);
        showToast("Sesión iniciada en Agrobanco Salesforce", "success");
        return true;
      } else {
        setAdvisorError(data.detail || "Credenciales corporativas inválidas.");
        showToast(data.detail || "Credenciales de Asesor incorrectas.", "error");
        return false;
      }
    } catch {
      setAdvisorError("Error al conectar con el servidor de Agrobanco.");
      showToast("Error de conexión con el backend", "error");
      return false;
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

  const handleLogout = () => {
    setAdvisorToken("");
    setAdvisorData(null);
    setCartera([]);
    setSolicitudes([]);
    setSelectedClient(null);
    setActiveTab("dashboard");
    showToast("Sesión cerrada en Salesforce", "info");
  };

  // Change tab handler
  const handleTabChange = (tabId) => {
    setActiveTab(tabId);
    setSelectedClient(null); // Clear selected workspace on navigation
  };

  return (
    <div className="min-h-screen bg-background text-on-surface flex flex-col font-sans relative overflow-x-hidden">
      {/* Decorative background gradients */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
        <div className="absolute top-[-15%] left-[-10%] w-[600px] h-[600px] bg-brand-green/10 rounded-full blur-[150px] animate-pulse-slow" />
        <div className="absolute bottom-[-15%] right-[-10%] w-[600px] h-[600px] bg-brand-gold/5 rounded-full blur-[150px]" />
        <div className="absolute top-[40%] right-[15%] w-[450px] h-[450px] bg-primary/5 rounded-full blur-[140px] animate-pulse-slow" />
      </div>

      {/* Top Banner & server stats */}
      <TopBar
        apiUrl={apiUrl}
        setApiUrl={setApiUrl}
        dbStatus={dbStatus}
        handleSeed={handleSeed}
        isSeeding={isSeeding}
        onMenuToggle={() => setIsSidebarOpen(!isSidebarOpen)}
        advisorToken={advisorToken}
      />

      {/* Main layout container */}
      <div className="flex-1 flex flex-col z-10 relative">
        {!advisorToken ? (
          /* Login page */
          <LoginScreen
            onLogin={handleAdvisorLogin}
            error={advisorError}
            setError={setAdvisorError}
          />
        ) : (
          /* Logged-in dashboard & features layout */
          <div className="flex-1 flex">
            {/* Collapsible Sidebar Drawer */}
            <Sidebar
              activeTab={activeTab}
              setActiveTab={handleTabChange}
              advisorData={advisorData}
              onLogout={handleLogout}
              isOpen={isSidebarOpen}
              setIsOpen={setIsSidebarOpen}
            />

            {/* Content pane */}
            <main className="flex-1 p-6 md:p-8 overflow-y-auto max-w-7xl mx-auto w-full">
              {/* Tab: Dashboard */}
              {activeTab === "dashboard" && (
                <Dashboard
                  cartera={cartera}
                  solicitudes={solicitudes}
                  onSelectClient={(sol) => {
                    // Navigate to solicitudes tab and select that client
                    setActiveTab("solicitudes");
                    const client = cartera.find((c) => c.name === sol.name);
                    setSelectedClient(client || { id: sol.id, name: sol.name, dni: sol.id });
                  }}
                />
              )}

              {/* Tab: Cartera Diaria */}
              {activeTab === "cartera" && (
                <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 items-start">
                  <div className={`${selectedClient ? "xl:col-span-5 hidden xl:block" : "xl:col-span-12"}`}>
                    <CarteraView
                      cartera={cartera}
                      onSelectClient={setSelectedClient}
                      selectedClient={selectedClient}
                    />
                  </div>
                  {selectedClient && (
                    <div className="xl:col-span-7 space-y-4">
                      <div className="flex xl:hidden mb-2">
                        <button
                          onClick={() => setSelectedClient(null)}
                          className="flex items-center gap-2 text-xs font-bold text-primary hover:underline bg-surface-variant/30 border border-[#243648]/40 px-4 py-2.5 rounded-xl cursor-pointer"
                        >
                          ← Volver a Cartera
                        </button>
                      </div>
                      <ClientWorkspace
                        selectedClient={selectedClient}
                        apiUrl={apiUrl}
                        advisorToken={advisorToken}
                        showToast={showToast}
                        onRefreshData={() => {
                          fetchCartera();
                          fetchAdvisorData();
                        }}
                      />
                    </div>
                  )}
                </div>
              )}

              {/* Tab: Solicitudes en Trámite */}
              {activeTab === "solicitudes" && (
                <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 items-start">
                  <div className={`${selectedClient ? "xl:col-span-5 hidden xl:block" : "xl:col-span-12"}`}>
                    <SolicitudesView
                      solicitudes={solicitudes}
                      cartera={cartera}
                      onSelectClient={setSelectedClient}
                    />
                  </div>
                  {selectedClient && (
                    <div className="xl:col-span-7 space-y-4">
                      <div className="flex xl:hidden mb-2">
                        <button
                          onClick={() => setSelectedClient(null)}
                          className="flex items-center gap-2 text-xs font-bold text-primary hover:underline bg-surface-variant/30 border border-[#243648]/40 px-4 py-2.5 rounded-xl cursor-pointer"
                        >
                          ← Volver a Solicitudes
                        </button>
                      </div>
                      <ClientWorkspace
                        selectedClient={selectedClient}
                        apiUrl={apiUrl}
                        advisorToken={advisorToken}
                        showToast={showToast}
                        onRefreshData={() => {
                          fetchCartera();
                          fetchAdvisorData();
                        }}
                      />
                    </div>
                  )}
                </div>
              )}

              {/* Tab: Simulador */}
              {activeTab === "simulador" && <SimuladorView />}

              {/* Tab: Cobranza */}
              {activeTab === "cobranza" && <CobranzaView cartera={cartera} />}

              {/* Tab: Reportes de Cobertura */}
              {activeTab === "reportes" && (
                <div className="bg-surface-variant/20 border border-[#243648]/35 rounded-3xl p-12 text-center max-w-lg mx-auto space-y-4 animate-fade-in">
                  <div className="w-16 h-16 rounded-full bg-[#1A5F7A]/25 border border-primary/20 flex items-center justify-center text-primary mx-auto">
                    <svg className="w-8 h-8" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M11 3.055A9.003 9.003 0 1020.945 13H11V3.055z" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z" />
                    </svg>
                  </div>
                  <h3 className="text-base font-black text-white uppercase tracking-wider">Reportes de Cobertura Geográfica</h3>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    Módulo de análisis satelital y estadísticas de campo de Agrobanco. 
                    Muestra mapas de calor de solicitudes y nivel de penetración en zonas agrícolas.
                  </p>
                  <span className="inline-block bg-[#1A5F7A]/25 border border-primary/20 text-[#92CFEE] text-[9px] font-black px-2.5 py-1 rounded uppercase tracking-wider">
                    Acceso Supervisor
                  </span>
                </div>
              )}

              {/* Tab: Reasignación de Tareas */}
              {activeTab === "reasignacion" && (
                <div className="bg-surface-variant/20 border border-[#243648]/35 rounded-3xl p-12 text-center max-w-lg mx-auto space-y-4 animate-fade-in">
                  <div className="w-16 h-16 rounded-full bg-[#1A5F7A]/25 border border-primary/20 flex items-center justify-center text-primary mx-auto">
                    <svg className="w-8 h-8" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                    </svg>
                  </div>
                  <h3 className="text-base font-black text-white uppercase tracking-wider">Reasignación de Carteras y Rutas</h3>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    Permite a los supervisores de la agencia reasignar clientes y solicitudes entre oficiales de crédito.
                    Optimiza la cobertura de campo diária.
                  </p>
                  <span className="inline-block bg-[#1A5F7A]/25 border border-primary/20 text-[#92CFEE] text-[9px] font-black px-2.5 py-1 rounded uppercase tracking-wider">
                    Acceso Administrador
                  </span>
                </div>
              )}
            </main>
          </div>
        )}
      </div>

      {/* Unified Toast Alerts */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}

      {/* Footer */}
      <footer className="border-t border-[#243648]/40 bg-[#021525]/80 px-6 py-5 text-center text-[10px] text-slate-500 mt-auto backdrop-blur-sm z-10">
        © {new Date().getFullYear()} Banco Agropecuario (Agrobanco). Fuerza de Ventas Digital - Campo & Core Integrado. Todos los derechos reservados.
      </footer>
    </div>
  );
}
