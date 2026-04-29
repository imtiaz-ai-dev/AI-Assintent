import { useEffect, useState } from "react";
import { getUsers, createUser, updateUser, deleteUser, toggleUser } from "../api";
import { Plus, Pencil, Trash2, UserCheck, UserX, Search, Users, RefreshCw } from "lucide-react";

const empty = { name: "", passport: "", visa: "", phone: "", email: "", active: true };

export default function UsersPage() {
  const [users, setUsers] = useState([]);
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState(empty);
  const [editId, setEditId] = useState(null);
  const [search, setSearch] = useState("");
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(null);

  const load = async () => { try { const r = await getUsers(); setUsers(r.data); } catch {} };
  useEffect(() => { load(); }, []);

  const filtered = users.filter(u =>
    [u.name, u.passport, u.visa].some(v => v?.toLowerCase().includes(search.toLowerCase()))
  );

  const openAdd  = () => { setForm(empty); setEditId(null); setModal(true); };
  const openEdit = u => { setForm({ name: u.name, passport: u.passport, visa: u.visa, phone: u.phone || "", email: u.email || "", active: u.active }); setEditId(u.id); setModal(true); };

  const handleSave = async () => {
    if (!form.name || !form.passport || !form.visa) return alert("Name, Passport and Visa are required");
    setSaving(true);
    try { editId ? await updateUser(editId, form) : await createUser(form); setModal(false); load(); }
    catch (e) { alert(e.response?.data?.detail || "Error saving"); }
    setSaving(false);
  };

  const handleDelete = async id => {
    if (!window.confirm("Delete this applicant?")) return;
    setDeleting(id); await deleteUser(id); setDeleting(null); load();
  };

  const handleToggle = async id => { await toggleUser(id); load(); };
  const initials = n => n?.split(" ").map(w => w[0]).join("").toUpperCase().slice(0, 2) || "?";

  const avatarColors = ["linear-gradient(135deg,#6366f1,#8b5cf6)", "linear-gradient(135deg,#10b981,#0ea5e9)", "linear-gradient(135deg,#f59e0b,#ef4444)", "linear-gradient(135deg,#ec4899,#8b5cf6)"];

  return (
    <div className="page fade-in">
      <div className="page-header-row">
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 800, letterSpacing: "-.5px" }}>Applications</h1>
          <p style={{ fontSize: 14, color: "var(--text2)", marginTop: 4 }}>Manage visa applicant profiles for automated booking</p>
        </div>
        <button className="btn btn-primary" onClick={openAdd}><Plus size={15} /> Add Applicant</button>
      </div>

      <div className="card">
        <div className="card-header">
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div className="search-wrap">
              <Search size={14} />
              <input className="search-input" placeholder="Search by name, passport, visa..." value={search} onChange={e => setSearch(e.target.value)} />
            </div>
            <span className="badge b-indigo"><Users size={11} /> {filtered.length} applicants</span>
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <span className="badge b-green">{users.filter(u => u.active).length} active</span>
            <span className="badge b-gray">{users.filter(u => !u.active).length} inactive</span>
          </div>
        </div>

        <div className="tbl-wrap">
          <table>
            <thead>
              <tr>
                <th>Applicant</th><th>Passport No</th><th>Visa No</th>
                <th>Phone</th><th>Email</th><th>Status</th><th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 && (
                <tr><td colSpan={7}>
                  <div className="empty">
                    <div className="empty-icon"><Users size={40} color="#cbd5e1" /></div>
                    <h3>No applicants found</h3>
                    <p>{search ? "Try a different search term" : "Add your first applicant to get started"}</p>
                  </div>
                </td></tr>
              )}
              {filtered.map((u, i) => (
                <tr key={u.id}>
                  <td>
                    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                      <div className="avatar" style={{ width: 36, height: 36, fontSize: 13, background: avatarColors[i % avatarColors.length] }}>
                        {initials(u.name)}
                      </div>
                      <div>
                        <div style={{ fontWeight: 700, fontSize: 13 }}>{u.name}</div>
                        <div style={{ fontSize: 11, color: "var(--text3)" }}>ID #{u.id}</div>
                      </div>
                    </div>
                  </td>
                  <td><span className="td-mono">{u.passport}</span></td>
                  <td><span className="td-mono">{u.visa}</span></td>
                  <td style={{ color: u.phone ? "var(--text)" : "var(--text3)" }}>{u.phone || "—"}</td>
                  <td style={{ color: u.email ? "var(--text)" : "var(--text3)" }}>{u.email || "—"}</td>
                  <td>
                    <span className={`badge ${u.active ? "b-green" : "b-gray"}`}>
                      <span style={{ width: 6, height: 6, borderRadius: "50%", background: "currentColor", display: "inline-block" }} />
                      {u.active ? "Active" : "Inactive"}
                    </span>
                  </td>
                  <td>
                    <div style={{ display: "flex", gap: 6 }}>
                      <button className="btn btn-ghost btn-icon btn-sm" onClick={() => openEdit(u)} title="Edit" style={{ color: "var(--p)" }}>
                        <Pencil size={13} />
                      </button>
                      <button className="btn btn-ghost btn-icon btn-sm" onClick={() => handleToggle(u.id)} title="Toggle">
                        {u.active ? <UserX size={13} color="var(--yellow)" /> : <UserCheck size={13} color="var(--green)" />}
                      </button>
                      <button className="btn btn-ghost btn-icon btn-sm" onClick={() => handleDelete(u.id)} title="Delete" disabled={deleting === u.id}>
                        {deleting === u.id ? <RefreshCw size={13} className="spin" /> : <Trash2 size={13} color="var(--red)" />}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {modal && (
        <div className="modal-overlay" onClick={() => setModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <div className="modal-title">{editId ? "Edit Applicant" : "Add New Applicant"}</div>
              <button className="modal-close" onClick={() => setModal(false)}>✕</button>
            </div>
            <div className="modal-body">
              <div className="form-grid">
                {[["Full Name", "name", "text"], ["Passport No", "passport", "text"], ["Visa No", "visa", "text"], ["Phone", "phone", "tel"], ["Email", "email", "email"]].map(([label, key, type]) => (
                  <div className="form-group" key={key}>
                    <label className="form-label">{label}</label>
                    <input className="form-input" type={type} value={form[key]} onChange={e => setForm({ ...form, [key]: e.target.value })} placeholder={`Enter ${label.toLowerCase()}`} />
                  </div>
                ))}
                <div className="form-group">
                  <label className="form-label">Status</label>
                  <select className="form-select" value={String(form.active)} onChange={e => setForm({ ...form, active: e.target.value === "true" })}>
                    <option value="true">Active — Include in monitoring</option>
                    <option value="false">Inactive — Skip in monitoring</option>
                  </select>
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-outline" onClick={() => setModal(false)}>Cancel</button>
              <button className="btn btn-primary" onClick={handleSave} disabled={saving}>
                {saving ? <><RefreshCw size={13} className="spin" /> Saving...</> : "Save Applicant"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
