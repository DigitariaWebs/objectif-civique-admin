"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Plus, Save, Send, ShieldCheck, Trash2 } from "lucide-react";

import { Avatar } from "@/components/ui/Avatar";
import { Drawer } from "@/components/ui/Drawer";
import { confirmAction } from "@/components/ui/ConfirmDialog";
import { useAdmins } from "@/stores/useAdmins";
import { useAuth, type AdminRole } from "@/stores/useAuth";
import { simulateVoid } from "@/lib/api";
import type { AdminUser } from "@/types";

const ROLE_LABEL: Record<AdminRole, string> = {
  "super-admin": "Super-admin",
  editor: "Éditeur",
  moderator: "Modérateur",
};

function emptyAdmin(): AdminUser {
  return {
    id: `a_${Date.now().toString(36)}`,
    name: "",
    email: "",
    role: "editor",
    twoFA: false,
    lastLogin: new Date().toISOString(),
    initials: "?",
  };
}

export default function AdminsSettings() {
  const admins = useAdmins((s) => s.admins);
  const activity = useAdmins((s) => s.activity);
  const add = useAdmins((s) => s.add);
  const updateAdmin = useAdmins((s) => s.update);
  const remove = useAdmins((s) => s.remove);
  const log = useAdmins((s) => s.log);

  const auth = useAuth();
  const [editing, setEditing] = useState<AdminUser | null>(null);

  async function handleDelete(id: string) {
    const ok = await confirmAction({
      title: "Révoquer cet admin ?",
      message: "Il perdra immédiatement l'accès à la console.",
      destructive: true,
      confirmLabel: "Révoquer",
    });
    if (!ok) return;
    await simulateVoid();
    remove(id);
    log({ author: auth.name, action: "a révoqué", target: `admin ${id}` });
    toast.success("Admin révoqué");
  }

  async function handleSave(a: AdminUser) {
    if (!a.email.includes("@")) {
      toast.error("E-mail invalide");
      return;
    }
    if (!a.name.trim()) a.name = a.email.split("@")[0]!;
    a.initials = a.name.split(" ").map((p) => p[0]).slice(0, 2).join("").toUpperCase() || "?";
    await simulateVoid();
    if (admins.find((x) => x.id === a.id)) {
      updateAdmin(a.id, a);
      toast.success("Admin mis à jour");
    } else {
      add(a);
      toast.success("Invitation envoyée");
      log({ author: auth.name, action: "a invité", target: `${a.email} (${ROLE_LABEL[a.role]})` });
    }
    setEditing(null);
  }

  function impersonate(role: AdminRole) {
    auth.switchRole(role);
    toast.success(`Connecté en tant que ${ROLE_LABEL[role]}`);
  }

  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 320px", gap: 14, alignItems: "flex-start" }}>
      <div>
        <div className="card" style={{ padding: 0, marginBottom: 14 }}>
          <div className="row between" style={{ padding: 16 }}>
            <h2>Administrateurs ({admins.length})</h2>
            <button className="btn primary" onClick={() => setEditing(emptyAdmin())}>
              <Plus size={13} /> Ajouter un admin
            </button>
          </div>
          <table className="data-table">
            <thead>
              <tr>
                <th>Membre</th>
                <th>E-mail</th>
                <th>Rôle</th>
                <th>2FA</th>
                <th>Dernière connexion</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {admins.map((a) => (
                <tr key={a.id} style={{ cursor: "default" }}>
                  <td>
                    <div className="user-cell">
                      <Avatar name={a.name} />
                      <div className="user-cell-name">{a.name}</div>
                    </div>
                  </td>
                  <td className="muted" style={{ fontSize: 12 }}>{a.email}</td>
                  <td>
                    <span className={`badge ${a.role === "super-admin" ? "info" : a.role === "editor" ? "neutral" : "outline"}`}>
                      {ROLE_LABEL[a.role]}
                    </span>
                  </td>
                  <td>
                    {a.twoFA ? (
                      <span className="badge success dot">Activée</span>
                    ) : (
                      <span className="badge warning dot">Désactivée</span>
                    )}
                  </td>
                  <td className="muted" style={{ fontSize: 12 }}>
                    {new Date(a.lastLogin).toLocaleString("fr-FR")}
                  </td>
                  <td>
                    <div className="row" style={{ gap: 4 }}>
                      <button className="btn outline sm" onClick={() => setEditing(a)}>Modifier</button>
                      <button className="btn ghost sm" onClick={() => handleDelete(a.id)} aria-label="Révoquer">
                        <Trash2 size={12} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="card" style={{ padding: 16 }}>
          <div className="row" style={{ gap: 8, marginBottom: 12 }}>
            <ShieldCheck size={18} color="var(--primary)" />
            <h2>Se connecter en tant que…</h2>
          </div>
          <p className="muted" style={{ fontSize: 13, marginBottom: 14 }}>
            Bascule temporairement votre rôle pour vérifier ce qu&apos;un éditeur ou un modérateur voit dans la console.
          </p>
          <div className="row" style={{ gap: 6 }}>
            {(Object.keys(ROLE_LABEL) as AdminRole[]).map((role) => (
              <button
                key={role}
                className={`filter-chip ${auth.role === role ? "active" : ""}`}
                onClick={() => impersonate(role)}
              >
                {ROLE_LABEL[role]}
              </button>
            ))}
          </div>
          <div className="hint" style={{ marginTop: 8 }}>
            Rôle actuel : <strong>{ROLE_LABEL[auth.role]}</strong>
          </div>
        </div>
      </div>

      <div className="card" style={{ padding: 16 }}>
        <h2 style={{ marginBottom: 12 }}>Activité récente</h2>
        <div className="col" style={{ gap: 10, maxHeight: 600, overflowY: "auto" }}>
          {activity.map((a) => (
            <div key={a.id} className="row" style={{ alignItems: "flex-start", gap: 8 }}>
              <Avatar name={a.author} size="sm" />
              <div style={{ flex: 1, fontSize: 12.5 }}>
                <div>
                  <strong>{a.author}</strong> {a.action}{" "}
                  <span className="muted">{a.target}</span>
                </div>
                <div className="tiny muted">{new Date(a.at).toLocaleString("fr-FR")}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <AdminDrawer admin={editing} onClose={() => setEditing(null)} onSave={handleSave} />
    </div>
  );
}

function AdminDrawer({
  admin,
  onClose,
  onSave,
}: {
  admin: AdminUser | null;
  onClose: () => void;
  onSave: (a: AdminUser) => void;
}) {
  const [draft, setDraft] = useState<AdminUser | null>(admin);
  if (admin && (!draft || draft.id !== admin.id)) {
    setDraft(admin);
    return null;
  }
  if (!admin || !draft) return null;
  const isNew = !admin.email;

  return (
    <Drawer
      open={!!admin}
      onClose={onClose}
      title={isNew ? "Ajouter un admin" : draft.name || draft.email}
      subtitle={isNew ? "Une invitation sera envoyée par e-mail" : draft.email}
      footer={
        <>
          <span className="save-state" />
          <button className="btn ghost" onClick={onClose}>Annuler</button>
          <button className="btn primary" onClick={() => onSave(draft)}>
            {isNew ? <><Send size={13} /> Envoyer l&apos;invitation</> : <><Save size={13} /> Enregistrer</>}
          </button>
        </>
      }
    >
      <div className="form-row split">
        <div>
          <label className="lbl">Nom</label>
          <input value={draft.name} onChange={(e) => setDraft({ ...draft, name: e.target.value })} />
        </div>
        <div>
          <label className="lbl">E-mail</label>
          <input
            value={draft.email}
            onChange={(e) => setDraft({ ...draft, email: e.target.value })}
            placeholder="prenom.nom@objectif-civique.fr"
          />
        </div>
      </div>
      <div className="form-row split">
        <div>
          <label className="lbl">Rôle</label>
          <select value={draft.role} onChange={(e) => setDraft({ ...draft, role: e.target.value as AdminRole })}>
            <option value="super-admin">Super-admin</option>
            <option value="editor">Éditeur</option>
            <option value="moderator">Modérateur</option>
          </select>
          <div className="hint">
            Super-admin : tout. Éditeur : contenu &amp; modération. Modérateur : forum uniquement.
          </div>
        </div>
        <div>
          <label className="lbl">Authentification 2FA</label>
          <div className="segmented">
            <button type="button" className={draft.twoFA ? "active" : ""} onClick={() => setDraft({ ...draft, twoFA: true })}>Activée</button>
            <button type="button" className={!draft.twoFA ? "active" : ""} onClick={() => setDraft({ ...draft, twoFA: false })}>Désactivée</button>
          </div>
        </div>
      </div>
    </Drawer>
  );
}
