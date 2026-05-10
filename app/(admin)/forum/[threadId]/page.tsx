"use client";

import { use, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "motion/react";
import { toast } from "sonner";
import {
  ArrowLeft,
  Eye,
  EyeOff,
  Flag,
  Lock,
  Pin,
  Trash2,
  Unlock,
} from "lucide-react";

import { Avatar } from "@/components/ui/Avatar";
import { confirmAction } from "@/components/ui/ConfirmDialog";
import { useForumThreads } from "@/stores/useForumThreads";
import { simulateVoid } from "@/lib/api";
import { cn } from "@/lib/utils";

export default function ForumThreadPage({ params }: { params: Promise<{ threadId: string }> }) {
  const { threadId } = use(params);
  const router = useRouter();
  const thread = useForumThreads((s) => s.threads.find((t) => t.id === threadId));
  const togglePin = useForumThreads((s) => s.togglePin);
  const toggleLock = useForumThreads((s) => s.toggleLock);
  const removeThread = useForumThreads((s) => s.removeThread);
  const removeReply = useForumThreads((s) => s.removeReply);
  const hideReply = useForumThreads((s) => s.hideReply);
  const updateReply = useForumThreads((s) => s.updateReply);

  const [searchTerm] = useState("");
  // searchTerm placeholder for any future filtering inside the thread

  if (!thread) {
    return (
      <div className="page">
        <div className="card" style={{ padding: 40, textAlign: "center" }}>
          <h2>Thread introuvable</h2>
          <p className="muted" style={{ marginTop: 8 }}>Il a peut-être été supprimé.</p>
          <Link href="/forum" className="btn primary" style={{ marginTop: 18 }}>
            <ArrowLeft size={13} /> Retour au forum
          </Link>
        </div>
      </div>
    );
  }

  async function handleDeleteThread() {
    const ok = await confirmAction({
      title: "Supprimer ce thread ?",
      message: "Le thread et toutes ses réponses seront supprimés.",
      destructive: true,
    });
    if (!ok) return;
    await simulateVoid();
    removeThread(thread!.id);
    toast.success("Thread supprimé");
    router.push("/forum");
  }

  async function handleDeleteReply(replyId: string) {
    const ok = await confirmAction({
      title: "Supprimer cette réponse ?",
      message: "Action irréversible.",
      destructive: true,
    });
    if (!ok) return;
    await simulateVoid();
    removeReply(thread!.id, replyId);
    toast.success("Réponse supprimée");
  }

  return (
    <motion.div
      className="page"
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
    >
      <div className="page-header">
        <div className="page-title-block">
          <Link href="/forum" className="row" style={{ gap: 6, color: "var(--text-secondary)", textDecoration: "none", fontSize: 13, marginBottom: 6 }}>
            <ArrowLeft size={13} /> Retour au forum
          </Link>
          <h1>{thread.title}</h1>
          <div className="page-subtitle">
            {thread.author} · {thread.topic === "general" ? "Général" : thread.topic} · {thread.replies.length} réponses · {thread.views} vues
          </div>
        </div>
        <div className="page-actions">
          <button
            className="btn outline"
            onClick={() => { togglePin(thread.id); toast.success(thread.pinned ? "Désépinglé" : "Épinglé"); }}
          >
            <Pin size={13} /> {thread.pinned ? "Désépingler" : "Épingler"}
          </button>
          <button
            className="btn outline"
            onClick={() => { toggleLock(thread.id); toast.success(thread.locked ? "Déverrouillé" : "Verrouillé"); }}
          >
            {thread.locked ? <Unlock size={13} /> : <Lock size={13} />} {thread.locked ? "Déverrouiller" : "Verrouiller"}
          </button>
          <button className="btn danger" onClick={handleDeleteThread}>
            <Trash2 size={13} /> Supprimer
          </button>
        </div>
      </div>

      <div className="card card-pad" style={{ marginBottom: 14 }}>
        <div className="row" style={{ gap: 12, alignItems: "flex-start", marginBottom: 12 }}>
          <Avatar name={thread.author} size="lg" />
          <div style={{ flex: 1 }}>
            <div className="row" style={{ gap: 6, marginBottom: 4 }}>
              <strong>{thread.author}</strong>
              <span className="badge outline">{thread.authorJourney}</span>
              {thread.pinned && <span className="badge info dot">Épinglé</span>}
              {thread.locked && <span className="badge neutral dot">Verrouillé</span>}
              {thread.reportsCount > 0 && (
                <span className="badge error dot">
                  <Flag size={10} /> {thread.reportsCount} signalement{thread.reportsCount > 1 ? "s" : ""}
                </span>
              )}
            </div>
            <div className="muted tiny">{new Date(thread.createdAt).toLocaleString("fr-FR")}</div>
          </div>
        </div>
        <div style={{ fontSize: 14, lineHeight: 1.65, whiteSpace: "pre-wrap" }}>{thread.body}</div>
      </div>

      <h2 style={{ fontSize: 16, marginBottom: 10 }}>Réponses ({thread.replies.length})</h2>
      <div className="col" style={{ gap: 10 }}>
        {thread.replies.length === 0 && (
          <div className="card" style={{ padding: 30, textAlign: "center", color: "var(--text-tertiary)" }}>
            Aucune réponse pour le moment.
          </div>
        )}
        {thread.replies.map((reply) => (
          <div
            key={reply.id}
            className="card"
            style={{
              padding: 16,
              opacity: reply.hidden ? 0.55 : 1,
              borderColor: reply.hidden ? "var(--outline-variant)" : "var(--outline)",
              borderStyle: reply.hidden ? "dashed" : "solid",
            }}
          >
            <div className="row" style={{ gap: 10, alignItems: "flex-start", marginBottom: 8 }}>
              <Avatar name={reply.author} />
              <div style={{ flex: 1 }}>
                <div className="row" style={{ gap: 6 }}>
                  <strong style={{ fontSize: 13 }}>{reply.author}</strong>
                  {reply.hidden && <span className="badge warning dot">Masqué</span>}
                  {reply.reportsCount > 0 && (
                    <span className="badge error dot">
                      <Flag size={10} /> {reply.reportsCount}
                    </span>
                  )}
                </div>
                <div className="tiny muted">{new Date(reply.createdAt).toLocaleString("fr-FR")}</div>
              </div>
              <span className="badge neutral">{reply.helpful} utiles</span>
            </div>
            <div style={{ fontSize: 13.5, lineHeight: 1.6, whiteSpace: "pre-wrap" }}>{reply.body}</div>
            <div className="row" style={{ gap: 6, marginTop: 12, flexWrap: "wrap" }}>
              {reply.hidden ? (
                <button
                  className="btn outline sm"
                  onClick={() => { hideReply(thread.id, reply.id, false); toast.success("Réponse restaurée"); }}
                >
                  <Eye size={12} /> Restaurer
                </button>
              ) : (
                <button
                  className="btn outline sm"
                  onClick={() => { hideReply(thread.id, reply.id, true); toast.success("Réponse masquée"); }}
                >
                  <EyeOff size={12} /> Masquer
                </button>
              )}
              <button
                className="btn outline sm"
                onClick={() => {
                  updateReply(thread.id, reply.id, { helpful: reply.helpful + 0 });
                  toast.success("Marqué non-pertinent");
                }}
              >
                Marquer non-pertinent
              </button>
              <button
                className={cn("btn", "danger", "sm")}
                onClick={() => handleDeleteReply(reply.id)}
              >
                <Trash2 size={12} /> Supprimer
              </button>
            </div>
          </div>
        ))}
      </div>
    </motion.div>
  );
}
