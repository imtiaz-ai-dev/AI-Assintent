import { useEffect, useState } from "react";
import { getSettings, updateSetting } from "../api";
import { Save, Clock, Bell, Globe, Shield, CheckCircle, RefreshCw, Mail, MessageSquare, Phone, Smartphone, Key, AlertTriangle, Lock } from "lucide-react";

export default function Settings() {
  const [s, setS] = useState({});
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => { getSettings().then(r => setS(r.data)).catch(() => {}); }, []);

  const set = (k, v) => setS(p => ({ ...p, [k]: v }));

  const save = async () => {
    setSaving(true);
    try {
      await Promise.all(Object.entries(s).map(([k, v]) => updateSetting(k, v)));
      setSaved(true); setTimeout(() => setSaved(false), 3000);
    } catch {}
    setSaving(false);
  };

  const Toggle = ({ k, label, desc, icon }) => (
    <div className="toggle-row">
      <div className="toggle-info" style={{ display: "flex", alignItems: "flex-start", gap: 10 }}>
        {icon && <div style={{ width: 28, height: 28, borderRadius: 8, background: "var(--bg2)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, marginTop: 2 }}>{icon}</div>}
        <div>
          <div className="toggle-name">{label}</div>
          {desc && <div className="toggle-desc">{desc}</div>}
        </div>
      </div>
      <label className="toggle">
        <input type="checkbox" checked={s[k] === "true"} onChange={e => set(k, e.target.checked ? "true" : "false")} />
        <span className="toggle-track" />
      </label>
    </div>
  );

  return (
    <div className="page fade-in">
      <div className="page-header-row">
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 800, letterSpacing: "-.5px" }}>Settings</h1>
          <p style={{ fontSize: 14, color: "var(--text2)", marginTop: 4 }}>Configure monitoring behavior and notification preferences</p>
        </div>
        <button className="btn btn-primary btn-lg" onClick={save} disabled={saving}>
          {saving ? <><RefreshCw size={14} className="spin" /> Saving...</> : <><Save size={14} /> Save Changes</>}
        </button>
      </div>

      {saved && (
        <div className="alert alert-success">
          <CheckCircle size={16} style={{ flexShrink: 0 }} />
          <span>Settings saved successfully!</span>
        </div>
      )}

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>

        {/* Monitoring */}
        <div className="card">
          <div className="card-header">
            <div className="card-title"><Clock size={15} /> Monitoring Settings</div>
          </div>
          <div className="card-body" style={{ display: "flex", flexDirection: "column", gap: 18 }}>
            <div className="form-group">
              <label className="form-label">Check Interval (seconds)</label>
              <input className="form-input" type="number" min={5} max={300}
                value={s.check_interval || "20"}
                onChange={e => set("check_interval", e.target.value)} />
              <div className="form-hint">How often to check for available slots. Minimum 5 seconds.</div>
            </div>
            <div className="form-group">
              <label className="form-label">Browser Mode</label>
              <select className="form-select" value={s.headless || "false"} onChange={e => set("headless", e.target.value)}>
                <option value="false">Visible — Show browser window</option>
                <option value="true">Headless — Hidden (saves resources)</option>
              </select>
              <div className="form-hint">Use Headless mode for server/VPS deployments.</div>
            </div>
          </div>
        </div>

        {/* Notifications */}
        <div className="card">
          <div className="card-header">
            <div className="card-title"><Bell size={15} /> Notification Channels</div>
          </div>
          <div className="card-body">
            <Toggle k="notify_email"    label="Email Alerts"    desc="Send email when a slot is found" icon={<Mail size={14} color="var(--blue)" />} />
            <Toggle k="notify_sms"      label="SMS Alerts"      desc="Send SMS via Twilio Messaging" icon={<MessageSquare size={14} color="var(--green)" />} />
            <Toggle k="notify_call"     label="Phone Call"      desc="Automated voice call alert" icon={<Phone size={14} color="var(--purple)" />} />
            <Toggle k="notify_whatsapp" label="WhatsApp"        desc="WhatsApp message via Twilio" icon={<Smartphone size={14} color="var(--green)" />} />
          </div>
        </div>

        {/* Target URL */}
        <div className="card">
          <div className="card-header">
            <div className="card-title"><Globe size={15} /> Target Website</div>
          </div>
          <div className="card-body">
            <div className="form-group">
              <label className="form-label">Qatar Visa Center URL</label>
              <input className="form-input" value="https://www.qatarvisacenter.com/schedule" readOnly style={{ color: "var(--text3)", cursor: "not-allowed" }} />
            </div>
            <div style={{ marginTop: 14, padding: "12px 14px", background: "var(--blue-light)", borderRadius: 10, fontSize: 12, color: "#0369a1", border: "1px solid #bae6fd", display: "flex", gap: 8 }}>
              <span style={{ flexShrink: 0 }}>ℹ️</span>
              The system monitors this URL automatically for available appointment slots.
            </div>
          </div>
        </div>

        {/* Security */}
        <div className="card">
          <div className="card-header">
            <div className="card-title"><Shield size={15} /> Security Notes</div>
          </div>
          <div className="card-body">
            {[
              [<Key size={14} color="var(--p)" />, "API keys and passwords are stored in .env file"],
              [<AlertTriangle size={14} color="var(--yellow)" />, "Never commit .env to version control (GitHub etc.)"],
              [<Mail size={14} color="var(--blue)" />, "Use Gmail App Password, not your regular password"],
              [<Lock size={14} color="var(--red)" />, "Keep users.json secure — contains personal data"],
            ].map(([icon, note], i) => (
              <div key={i} style={{
                display: "flex", gap: 10, padding: "10px 0",
                borderBottom: i < 3 ? "1px solid var(--border2)" : "none",
                fontSize: 13, color: "var(--text2)", alignItems: "flex-start"
              }}>
                <div style={{ width: 26, height: 26, borderRadius: 7, background: "var(--bg2)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>{icon}</div>
                {note}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
