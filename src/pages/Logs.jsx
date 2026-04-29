import { useEffect, useState } from "react";
import { getActivityLogs, getNotifLogs } from "../api";
import { RefreshCw, Mail, MessageSquare, Phone, Bell, ScrollText } from "lucide-react";

const TABS = ["Activity Log", "Notifications"];

export default function Logs() {
  const [tab, setTab] = useState(0);
  const [activity, setActivity] = useState([]);
  const [notifs, setNotifs] = useState([]);
  const [loading, setLoading] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const [a, n] = await Promise.all([getActivityLogs(200), getNotifLogs(100)]);
      setActivity(a.data); setNotifs(n.data);
    } catch {}
    setLoading(false);
  };

  useEffect(() => { load(); const t = setInterval(load, 5000); return () => clearInterval(t); }, []);

  const fmt = d => d ? new Date(d).toLocaleString("en-PK", { dateStyle: "short", timeStyle: "medium" }) : "—";
  const channelIcon = ch => ch === "email" ? <Mail size={11} /> : ch === "whatsapp" ? <MessageSquare size={11} /> : <Phone size={11} />;
  const channelColor = ch => ch === "email" ? "b-blue" : ch === "whatsapp" ? "b-green" : ch === "call" ? "b-purple" : "b-yellow";

  return (
    <div className="page fade-in">
      <div className="page-header-row">
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 800, letterSpacing: "-.5px" }}>Activity Logs</h1>
          <p style={{ fontSize: 14, color: "var(--text2)", marginTop: 4 }}>Complete history of system events and notifications</p>
        </div>
        <div style={{ display: "flex", gap: 10 }}>
          <button className="btn btn-outline btn-sm" onClick={load} disabled={loading}>
            <RefreshCw size={12} className={loading ? "spin" : ""} /> Refresh
          </button>
        </div>
      </div>

      {/* Summary */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 16, marginBottom: 24 }}>
        {[
          { label: "Total Events", val: activity.length, color: "#6366f1", bg: "#eef2ff" },
          { label: "Errors", val: activity.filter(a => a.level === "ERROR" || a.level === "CRITICAL").length, color: "#ef4444", bg: "#fef2f2" },
          { label: "Notifications", val: notifs.length, color: "#10b981", bg: "#ecfdf5" },
        ].map(({ label, val, color, bg }) => (
          <div className="card" key={label} style={{ padding: "18px 22px", display: "flex", alignItems: "center", gap: 16 }}>
            <div style={{ width: 44, height: 44, borderRadius: 12, background: bg, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, fontWeight: 800, color, flexShrink: 0 }}>
              {val}
            </div>
            <div style={{ fontSize: 13, fontWeight: 600, color: "var(--text2)" }}>{label}</div>
          </div>
        ))}
      </div>

      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
        <div className="tabs">
          {TABS.map((t, i) => (
            <button key={t} className={`tab-btn ${tab === i ? "active" : ""}`} onClick={() => setTab(i)}>{t}</button>
          ))}
        </div>
      </div>

      <div className="card">
        <div className="tbl-wrap">
          {tab === 0 && (
            <table>
              <thead><tr><th>Time</th><th>Level</th><th>Message</th></tr></thead>
              <tbody>
                {activity.length === 0 && (
                  <tr><td colSpan={3}><div className="empty"><div className="empty-icon"><ScrollText size={36} color="#cbd5e1" /></div><h3>No activity yet</h3><p>Start monitoring to generate logs</p></div></td></tr>
                )}
                {activity.map(r => (
                  <tr key={r.id}>
                    <td style={{ whiteSpace: "nowrap", color: "var(--text3)", fontSize: 12 }}>{fmt(r.created_at)}</td>
                    <td>
                      <span className={`badge ${r.level === "ERROR" || r.level === "CRITICAL" ? "b-red" : r.level === "WARNING" ? "b-yellow" : "b-indigo"}`}>
                        {r.level}
                      </span>
                    </td>
                    <td style={{ fontSize: 13, maxWidth: 600 }}>{r.message}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          {tab === 1 && (
            <table>
              <thead><tr><th>Time</th><th>Applicant</th><th>Channel</th><th>Status</th><th>Details</th></tr></thead>
              <tbody>
                {notifs.length === 0 && (
                  <tr><td colSpan={5}><div className="empty"><div className="empty-icon"><Bell size={36} color="#cbd5e1" /></div><h3>No notifications yet</h3><p>Notifications appear here when a slot is found</p></div></td></tr>
                )}
                {notifs.map(r => (
                  <tr key={r.id}>
                    <td style={{ whiteSpace: "nowrap", color: "var(--text3)", fontSize: 12 }}>{fmt(r.sent_at)}</td>
                    <td>
                      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <div className="avatar" style={{ width: 28, height: 28, fontSize: 11 }}>
                          {r.user_name?.split(" ").map(w => w[0]).join("").toUpperCase().slice(0, 2) || "?"}
                        </div>
                        <span style={{ fontWeight: 600 }}>{r.user_name || "—"}</span>
                      </div>
                    </td>
                    <td><span className={`badge ${channelColor(r.channel)}`}>{channelIcon(r.channel)} {r.channel}</span></td>
                    <td><span className={`badge ${r.status === "sent" ? "b-green" : "b-red"}`}>{r.status === "sent" ? "✓ Sent" : "✗ Failed"}</span></td>
                    <td style={{ fontSize: 12, color: "var(--text3)" }}>{r.message || "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
