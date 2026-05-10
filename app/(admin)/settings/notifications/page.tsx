"use client";

import { toast } from "sonner";
import { Mail, MessageSquare } from "lucide-react";

import { Checkbox } from "@/components/ui/Checkbox";
import { useNotificationSettings } from "@/stores/useNotificationSettings";
import { NOTIFICATION_EVENT_LABELS, type NotificationEvent } from "@/types";
import { simulateVoid } from "@/lib/api";

export default function NotificationsSettings() {
  const settings = useNotificationSettings((s) => s.settings);
  const toggle = useNotificationSettings((s) => s.toggle);

  async function testChannel(channel: "email" | "slack") {
    await simulateVoid();
    toast.success(channel === "email" ? "E-mail de test envoyé" : "Message Slack de test envoyé");
  }

  return (
    <div className="card" style={{ padding: 0 }}>
      <div className="row between" style={{ padding: 16, borderBottom: "1px solid var(--outline)" }}>
        <h2>Notifications par événement</h2>
        <div className="row" style={{ gap: 6 }}>
          <button className="btn outline" onClick={() => testChannel("email")}>
            <Mail size={13} /> Tester e-mail
          </button>
          <button className="btn outline" onClick={() => testChannel("slack")}>
            <MessageSquare size={13} /> Tester Slack
          </button>
        </div>
      </div>
      <table className="data-table">
        <thead>
          <tr>
            <th>Événement</th>
            <th>E-mail</th>
            <th>Slack</th>
          </tr>
        </thead>
        <tbody>
          {(Object.keys(NOTIFICATION_EVENT_LABELS) as NotificationEvent[]).map((event) => (
            <tr key={event} style={{ cursor: "default" }}>
              <td style={{ fontWeight: 500 }}>{NOTIFICATION_EVENT_LABELS[event]}</td>
              <td>
                <Checkbox
                  checked={settings[event].email}
                  onChange={() => { toggle(event, "email"); toast.success("Préférence enregistrée"); }}
                  ariaLabel={`E-mail pour ${NOTIFICATION_EVENT_LABELS[event]}`}
                />
              </td>
              <td>
                <Checkbox
                  checked={settings[event].slack}
                  onChange={() => { toggle(event, "slack"); toast.success("Préférence enregistrée"); }}
                  ariaLabel={`Slack pour ${NOTIFICATION_EVENT_LABELS[event]}`}
                />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
