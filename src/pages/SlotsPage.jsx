import { useEffect, useState } from "react";
import { getAvailableSlots, getSlotHistory, getStats, getUsers, getActivityLogs } from "../api";
import { MapPin, RefreshCw, CheckCircle, XCircle, Search, Clock, Calendar, TrendingUp } from "lucide-react";


export default function SlotsPage() {
  const [slots, setSlots] = useState([]);
  const [stats, setStats] = useState({ total_checks: 0, slots_found: 0 });
  const [activity, setActivity] = useState([]);
  const [users, setUsers] = useState([]);
  const [refreshing, setRefreshing] = useState(false);

  const [passport, setPassport] = useState("");
  const [visa, setVisa] = useState("");
  const [checking, setChecking] = useState(false);
  const [result, setResult] = useState(null);
  const [selectedUser, setSelectedUser] = useState("");

  const load = async () => {
    try {
      const [av, st, act, u] = await Promise.all([
        getAvailableSlots(), getStats(), getActivityLogs(10), getUsers()
      ]);
      setSlots(av.data.length > 0 ? av.data : []);
      setStats(st.data);
      setActivity(act.data);
      setUsers(u.data);
    } catch {
      setSlots([]);
    }
  };

  useEffect(() => { load(); const t = setInterval(load, 15000); return () => clearInterval(t); }, []);

  const handleUserSelect = (e) => {
    const uid = e.target.value;
    setSelectedUser(uid);
    setResult(null);
    if (uid) {
      const u = users.find(x => String(x.id) === uid);
      if (u) { setPassport(u.passport); setVisa(u.visa); }
    } else { setPassport(""); setVisa(""); }
  };

  const handleCheck = async () => {
    if (!passport.trim() || !visa.trim()) {
      setResult({ type: "warn", message: "Please enter both Passport Number and Visa Number." });
      return;
    }
    setChecking(true);
    setResult(null);
    try {
      const r = await getUsers();
      const match = r.data.find(
        u => u.passport.trim().toLowerCase() === passport.trim().toLowerCase() &&
             u.visa.trim().toLowerCase() === visa.trim().toLowerCase()
      );
      if (!match) {
        setResult({ type: "error", message: "No applicant found with these credentials." });
      } else {
        const slotRes = await getAvailableSlots();
        const hasSlots = slotRes.data.length > 0;
        setResult({
          type: hasSlots ? "success" : "info",
          applicantName: match.name,
          slotMessage: hasSlots
            ? `${slotRes.data.length} appointment slots are available!`
            : "No available appointment slots found.",
          hasSlots,
        });
      }
    } catch {
      setResult({ type: "warn", message: "Error checking. Please try again." });
    }
    setChecking(false);
  };

  const handleRefresh = async () => { setRefreshing(true); await load(); setRefreshing(false); };

  const levelBadge = (lvl) => {
    if (lvl === "High")   return "b-green";
    if (lvl === "Low")    return "b-red";
    return "b-yellow";
  };

  const timeAgo = (d) => {
    if (!d) return "";
    const diff = Math.floor((Date.now() - new Date(d)) / 1000);
    if (diff < 60) return `${diff}s ago`;
    if (diff < 3600) return `${Math.floor(diff/60)}m ago`;
    return `${Math.floor(diff/3600)}h ago`;
  };

  return (
    <div className="page fade-in">
      <div className="page-header-row">
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 800, letterSpacing: "-.5px" }}>Available Slots</h1>
          <p style={{ fontSize: 14, color: "var(--text2)", marginTop: 4 }}>Real-time Pakistan → Qatar visa appointment slots</p>
        </div>
        <button className="btn btn-outline btn-sm" onClick={handleRefresh} disabled={refreshing}>
          <RefreshCw size={13} className={refreshing ? "spin" : ""} /> Refresh
        </button>
      </div>

      {/* Summary Stats */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 16, marginBottom: 24 }}>
        {[
          { label: "Available Slots", val: slots.length, icon: Calendar, color: "#6366f1", bg: "#eef2ff" },
          { label: "Total Checks",    val: stats.total_checks, icon: TrendingUp, color: "#f59e0b", bg: "#fffbeb" },
          { label: "Slots Found",     val: stats.slots_found,  icon: CheckCircle, color: "#10b981", bg: "#ecfdf5" },
        ].map(({ label, val, icon: Icon, color, bg }) => (
          <div className="card" key={label} style={{ padding: "18px 22px", display: "flex", alignItems: "center", gap: 14 }}>
            <div style={{ width: 44, height: 44, borderRadius: 12, background: bg, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              <Icon size={20} color={color} />
            </div>
            <div>
              <div style={{ fontSize: 11, color: "var(--text3)", fontWeight: 600, textTransform: "uppercase", letterSpacing: ".5px", marginBottom: 3 }}>{label}</div>
              <div style={{ fontSize: 24, fontWeight: 800, color, letterSpacing: "-.3px" }}>{val}</div>
            </div>
          </div>
        ))}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 340px", gap: 20 }}>

        {/* LEFT — Slots Table */}
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>

          {/* Activity Feed */}
          {activity.length > 0 && (
            <div className="card">
              <div className="card-header">
                <div className="card-title"><Clock size={15} /> Recent Activity</div>
                <span className="badge b-gray">{activity.length} events</span>
              </div>
              <div style={{ padding: "4px 0" }}>
                {activity.slice(0, 5).map((a, i) => (
                  <div key={a.id} style={{ display: "flex", alignItems: "flex-start", gap: 12, padding: "9px 22px", borderBottom: i < 4 ? "1px solid var(--border2)" : "none" }}>
                    <span style={{ width: 7, height: 7, borderRadius: "50%", background: "var(--green)", flexShrink: 0, marginTop: 5 }} />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 12, color: "var(--text)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{a.message}</div>
                      <div style={{ fontSize: 11, color: "var(--text3)", marginTop: 2 }}>{timeAgo(a.created_at)}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Slots Table */}
          <div className="card">
            <div className="card-header">
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <div style={{ width: 36, height: 36, borderRadius: 10, background: "var(--blue-light)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <MapPin size={18} color="var(--blue)" />
                </div>
                <div>
                  <div style={{ fontWeight: 700, fontSize: 14 }}>Pakistan → Qatar Visa Slots</div>
                  <div style={{ fontSize: 12, color: "var(--text3)" }}>Available appointments at Pakistan visa centers</div>
                </div>
              </div>
            </div>

            <div className="tbl-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Date & Time</th>
                    <th>Location</th>
                    <th>Visa Type</th>
                    <th>Available</th>
                  </tr>
                </thead>
                <tbody>
                  {slots.length === 0 ? (
                    <tr><td colSpan={4}>
                      <div className="empty">
                        <div className="empty-icon">🔍</div>
                        <h3>No slots detected yet</h3>
                        <p>Start monitoring to detect available slots</p>
                      </div>
                    </td></tr>
                  ) : (
                    slots.map((s) => (
                      <tr key={s.id}>
                        <td>
                          <div style={{ fontWeight: 600, fontSize: 13 }}>{s.slot_date}</div>
                          <div style={{ fontSize: 11, color: "var(--text3)", display: "flex", alignItems: "center", gap: 4, marginTop: 2 }}>
                            <Clock size={10} /> {s.slot_time}
                          </div>
                        </td>
                        <td style={{ fontSize: 13 }}>{s.location}</td>
                        <td>
                          <span className={`badge ${s.visa_type === "Tourist" ? "b-purple" : "b-blue"}`}>
                            {s.visa_type}
                          </span>
                        </td>
                        <td>
                          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                            <span style={{ fontWeight: 700, fontSize: 15 }}>{s.available_count}</span>
                            <span className={`badge ${levelBadge(s.availability_level)}`}>
                              {s.availability_level}
                            </span>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {slots.length > 0 && (
              <div className="card-footer">
                <span style={{ fontSize: 12, color: "var(--text3)" }}>
                  Showing {slots.length} appointments
                </span>
                <button className="btn btn-primary btn-sm" onClick={handleRefresh} disabled={refreshing}>
                  <RefreshCw size={12} className={refreshing ? "spin" : ""} /> Refresh Slots
                </button>
              </div>
            )}
          </div>
        </div>

        {/* RIGHT — Check Availability */}
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div className="card">
            <div className="card-header">
              <div className="card-title"><Search size={15} /> Check Availability</div>
            </div>
            <div className="card-body">
              {users.length > 0 && (
                <div className="form-group" style={{ marginBottom: 14 }}>
                  <label className="form-label">Quick Fill — Select Applicant</label>
                  <select className="form-select" value={selectedUser} onChange={handleUserSelect}>
                    <option value="">— Choose applicant —</option>
                    {users.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
                  </select>
                </div>
              )}
              <div className="form-group" style={{ marginBottom: 12 }}>
                <label className="form-label">Passport Number</label>
                <input className="form-input" placeholder="e.g. AX3703902" value={passport}
                  onChange={e => { setPassport(e.target.value); setResult(null); }} />
              </div>
              <div className="form-group" style={{ marginBottom: 16 }}>
                <label className="form-label">Visa Number</label>
                <input className="form-input" placeholder="e.g. 382025438267" value={visa}
                  onChange={e => { setVisa(e.target.value); setResult(null); }} />
              </div>
              <button className="btn btn-primary" style={{ width: "100%", justifyContent: "center" }}
                onClick={handleCheck} disabled={checking}>
                {checking ? <><RefreshCw size={13} className="spin" /> Checking...</> : <><Search size={13} /> Check Availability</>}
              </button>

              {result && (
                <div style={{ marginTop: 16, display: "flex", flexDirection: "column", gap: 8 }}>
                  {result.type === "error" && (
                    <div className="result-box error">
                      <XCircle size={15} color="var(--red)" style={{ flexShrink: 0, marginTop: 1 }} />
                      <div>
                        <div style={{ fontWeight: 600, color: "var(--red)", fontSize: 13 }}>Applicant not found</div>
                        <div style={{ fontSize: 12, color: "#991b1b", marginTop: 2 }}>{result.message}</div>
                      </div>
                    </div>
                  )}
                  {result.type === "warn" && (
                    <div className="result-box warning">
                      <span style={{ flexShrink: 0 }}>⚠️</span>
                      <span style={{ fontSize: 13 }}>{result.message}</span>
                    </div>
                  )}
                  {(result.type === "success" || result.type === "info") && (
                    <>
                      <div className="result-box success">
                        <CheckCircle size={15} color="var(--green)" style={{ flexShrink: 0, marginTop: 1 }} />
                        <div>
                          <div style={{ fontWeight: 600, color: "#065f46", fontSize: 13 }}>Applicant verified!</div>
                          <div style={{ fontSize: 12, color: "#047857" }}>{result.applicantName}</div>
                        </div>
                      </div>
                      <div className={`result-box ${result.hasSlots ? "success" : "info"}`}>
                        {result.hasSlots
                          ? <CheckCircle size={15} color="var(--green)" style={{ flexShrink: 0 }} />
                          : <XCircle size={15} color="var(--text3)" style={{ flexShrink: 0 }} />}
                        <span style={{ fontSize: 13, fontWeight: 500 }}>{result.slotMessage}</span>
                      </div>
                    </>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
