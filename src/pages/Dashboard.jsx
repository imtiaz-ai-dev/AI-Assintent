import { useEffect, useState } from "react";
import { getStats, getStatus, getSlotHistory, getActivityLogs } from "../api";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import { Users, Activity, CheckCircle, Bell, TrendingUp, Clock, ArrowUpRight } from "lucide-react";

export default function Dashboard() {
  const [stats, setStats] = useState({ total_checks: 0, slots_found: 0, notifications_sent: 0, active_users: 0 });
  const [status, setStatus] = useState({ running: false, checks: 0 });
  const [history, setHistory] = useState([]);
  const [logs, setLogs] = useState([]);

  useEffect(() => {
    const load = async () => {
      try {
        const [s, st, h, l] = await Promise.all([getStats(), getStatus(), getSlotHistory(20), getActivityLogs(6)]);
        setStats(s.data); setStatus(st.data); setLogs(l.data);
        setHistory(h.data.slice().reverse().map((r, i) => ({ n: i + 1, v: r.slot_found ? 1 : 0 })));
      } catch {}
    };
    load();
    const t = setInterval(load, 5000);
    return () => clearInterval(t);
  }, []);

  const cards = [
    { label: "Total Applications", val: stats.active_users,        icon: Users,         grad: "linear-gradient(135deg,#6366f1,#4f46e5)", bg: "#eef2ff", ic: "#6366f1" },
    { label: "Active Monitoring",  val: status.running ? stats.active_users : 0, icon: Activity, grad: "linear-gradient(135deg,#f59e0b,#d97706)", bg: "#fffbeb", ic: "#f59e0b" },
    { label: "Slots Found",        val: stats.slots_found,          icon: CheckCircle,   grad: "linear-gradient(135deg,#10b981,#059669)", bg: "#ecfdf5", ic: "#10b981" },
    { label: "Notifications Sent", val: stats.notifications_sent,   icon: Bell,          grad: "linear-gradient(135deg,#8b5cf6,#7c3aed)", bg: "#f5f3ff", ic: "#8b5cf6" },
  ];

  const fmtTime = d => d ? new Date(d).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : "";

  return (
    <div className="page fade-in">
      <div className="page-header">
        <h1>Qatar Visa Automation Dashboard</h1>
        <p>Monitor your visa applications and available appointment slots in real-time</p>
      </div>

      {status.running && (
        <div className="alert alert-info">
          <Activity size={16} style={{ flexShrink: 0, marginTop: 1 }} />
          <span>Auto-booking enabled — monitoring Karachi & Islamabad. Will submit automatically when a slot is available.</span>
        </div>
      )}

      {/* Stats */}
      <div className="stats-grid">
        {cards.map(({ label, val, icon: Icon, grad, bg, ic }) => (
          <div className="stat-card" key={label} style={{ "--grad": grad }}>
            <div className="stat-icon" style={{ background: bg }}>
              <Icon size={22} color={ic} />
            </div>
            <div className="stat-info">
              <div className="stat-label">{label}</div>
              <div className="stat-val">{val}</div>
              <div className="stat-sub"><ArrowUpRight size={11} color={ic} /><span style={{ color: ic }}>Live data</span></div>
            </div>
          </div>
        ))}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 360px", gap: 20 }}>
        {/* Chart */}
        <div className="card">
          <div className="card-header">
            <div className="card-title"><TrendingUp size={15} /> Slot Check History</div>
            <span className="badge b-indigo">{history.length} records</span>
          </div>
          <div className="card-body">
            {history.length === 0 ? (
              <div className="empty">
                <div className="empty-icon" style={{ fontSize: 40, marginBottom: 12 }}>
                  <svg width="40" height="40" viewBox="0 0 24 24" fill="none"><path d="M3 3h18v18H3z" fill="#eef2ff" rx="4"/><path d="M7 17l4-8 4 8" stroke="#6366f1" strokeWidth="1.5" strokeLinecap="round"/><path d="M8.5 14h5" stroke="#6366f1" strokeWidth="1.5" strokeLinecap="round"/></svg>
                </div>
                <h3>No data yet</h3>
                <p>Start monitoring to see slot check history here</p>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={210}>
                <AreaChart data={history} margin={{ top: 5, right: 5, bottom: 0, left: -20 }}>
                  <defs>
                    <linearGradient id="cg" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#6366f1" stopOpacity={0.2} />
                      <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="n" tick={{ fontSize: 11, fill: "#94a3b8" }} tickFormatter={v => `#${v}`} />
                  <YAxis tick={{ fontSize: 11, fill: "#94a3b8" }} domain={[0, 1]} ticks={[0, 1]} />
                  <Tooltip
                    contentStyle={{ background: "white", border: "1px solid #e2e8f0", borderRadius: 10, fontSize: 12, boxShadow: "0 4px 12px rgba(0,0,0,.08)" }}
                    formatter={v => [v === 1 ? "✓ Slot Found" : "✗ Not Available", ""]}
                    labelFormatter={v => `Check #${v}`}
                  />
                  <Area type="monotone" dataKey="v" stroke="#6366f1" fill="url(#cg)" strokeWidth={2.5} dot={{ fill: "#6366f1", r: 3, strokeWidth: 0 }} activeDot={{ r: 5 }} />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="card">
          <div className="card-header">
            <div className="card-title"><Clock size={15} /> Recent Activity</div>
            <span className="badge b-gray">{logs.length} events</span>
          </div>
          <div style={{ padding: "8px 0" }}>
            {logs.length === 0 ? (
              <div className="empty" style={{ padding: "32px 20px" }}>
                <p>No activity yet</p>
              </div>
            ) : (
              logs.map((log, i) => (
                <div key={log.id} style={{
                  display: "flex", gap: 12, padding: "10px 22px",
                  borderBottom: i < logs.length - 1 ? "1px solid var(--border2)" : "none",
                  transition: "background .12s",
                }}
                  onMouseEnter={e => e.currentTarget.style.background = "#fafbff"}
                  onMouseLeave={e => e.currentTarget.style.background = ""}
                >
                  <div style={{
                    width: 8, height: 8, borderRadius: "50%", flexShrink: 0, marginTop: 5,
                    background: log.level === "ERROR" ? "var(--red)" : log.level === "WARNING" ? "var(--yellow)" : "var(--green)"
                  }} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 12, color: "var(--text)", lineHeight: 1.5, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{log.message}</div>
                    <div style={{ fontSize: 11, color: "var(--text3)", marginTop: 2 }}>{fmtTime(log.created_at)}</div>
                  </div>
                  <span className={`badge ${log.level === "ERROR" ? "b-red" : log.level === "WARNING" ? "b-yellow" : "b-green"}`} style={{ fontSize: 10, flexShrink: 0 }}>
                    {log.level}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
