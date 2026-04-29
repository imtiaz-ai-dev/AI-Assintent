import { useEffect, useRef, useState } from "react";
import { getStatus, startMonitor, stopMonitor } from "../api";
import { Play, Square, RefreshCw, Wifi, WifiOff, Activity, Zap, Clock } from "lucide-react";

export default function Monitor() {
  const [status, setStatus] = useState({ running: false, checks: 0 });
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(false);
  const logRef = useRef(null);
  const esRef = useRef(null);

  const fetchStatus = async () => {
    try { const r = await getStatus(); setStatus(r.data); } catch {}
  };

  useEffect(() => {
    fetchStatus();
    const t = setInterval(fetchStatus, 3000);
    esRef.current = new EventSource(`${process.env.REACT_APP_API_URL || "http://localhost:8000"}/monitor/stream`);
    esRef.current.onmessage = (e) => {
      const raw = e.data;
      const level = raw.includes("[ERROR]") || raw.includes("[CRITICAL]") ? "error"
        : raw.includes("[WARNING]") ? "warning" : "info";
      const time = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" });
      setLogs(p => [...p.slice(-399), { text: raw, level, time }]);
    };
    return () => { clearInterval(t); esRef.current?.close(); };
  }, []);

  useEffect(() => {
    if (logRef.current) logRef.current.scrollTop = logRef.current.scrollHeight;
  }, [logs]);

  const handleStart = async () => { setLoading(true); await startMonitor(); await fetchStatus(); setLoading(false); };
  const handleStop  = async () => { setLoading(true); await stopMonitor();  await fetchStatus(); setLoading(false); };

  const miniCards = [
    { label: "Session Checks", val: status.checks,                                    icon: Activity, color: "#6366f1" },
    { label: "Status",         val: status.running ? "Running" : "Stopped",           icon: Wifi,     color: status.running ? "#10b981" : "#94a3b8" },
    { label: "Mode",           val: "Auto-Book",                                       icon: Zap,      color: "#8b5cf6" },
    { label: "Interval",       val: "20s",                                             icon: Clock,    color: "#f59e0b" },
  ];

  return (
    <div className="page fade-in">
      <div className="page-header">
        <h1>Monitor Control</h1>
        <p>Start, stop and observe the automated slot detection engine</p>
      </div>

      {/* Hero */}
      <div className="hero-banner">
        <div className="hero-text">
          <h2>
            {status.running
              ? <><Wifi size={22} style={{ display: "inline", marginRight: 10, verticalAlign: "middle" }} />Monitoring is Active</>
              : <><WifiOff size={22} style={{ display: "inline", marginRight: 10, verticalAlign: "middle" }} />Monitoring is Stopped</>}
          </h2>
          <p>
            {status.running
              ? `Actively scanning Qatar Visa Center for available appointment slots — ${status.checks} checks completed this session.`
              : "Click Start Monitoring to begin automated slot detection. The system will notify you instantly when a slot is found."}
          </p>
        </div>
        <div className="hero-actions">
          <button className="btn btn-white btn-lg" onClick={handleStart} disabled={status.running || loading}>
            {loading && !status.running ? <RefreshCw size={15} className="spin" /> : <Play size={15} />}
            Start Monitoring
          </button>
          <button className="btn btn-white-ghost btn-lg" onClick={handleStop} disabled={!status.running || loading}>
            <Square size={15} /> Stop
          </button>
        </div>
      </div>

      {/* Mini Stats */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 16, marginBottom: 24 }}>
        {miniCards.map(({ label, val, icon: Icon, color }) => (
          <div className="card" key={label} style={{ padding: "18px 20px", display: "flex", alignItems: "center", gap: 14 }}>
            <div style={{ width: 40, height: 40, borderRadius: 12, background: color + "18", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              <Icon size={18} color={color} />
            </div>
            <div>
              <div style={{ fontSize: 11, color: "var(--text3)", fontWeight: 600, textTransform: "uppercase", letterSpacing: ".5px", marginBottom: 4 }}>{label}</div>
              <div style={{ fontSize: 18, fontWeight: 800, color, letterSpacing: "-.3px" }}>{val}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Live Log */}
      <div className="card">
        <div className="card-header">
          <div className="card-title">
            <span style={{ width: 8, height: 8, borderRadius: "50%", background: status.running ? "var(--green)" : "var(--text3)", display: "inline-block", boxShadow: status.running ? "0 0 0 3px rgba(16,185,129,.2)" : "none" }} />
            Live Terminal
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <span className="badge b-gray">{logs.length} lines</span>
            <button className="btn btn-ghost btn-sm" onClick={() => setLogs([])}><RefreshCw size={12} /> Clear</button>
          </div>
        </div>
        <div className="log-box" ref={logRef}>
          {logs.length === 0 ? (
            <div style={{ color: "#3d4f6b", fontStyle: "italic" }}>
              $ Waiting for activity... Start monitoring to see live output.
            </div>
          ) : (
            logs.map((l, i) => (
              <div key={i} className="log-line">
                <span className="log-t">{l.time}</span>
                <span className={`log-lvl ${l.level}`}>{l.level.toUpperCase()}</span>
                <span className={`log-msg ${l.level}`}>{l.text}</span>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
