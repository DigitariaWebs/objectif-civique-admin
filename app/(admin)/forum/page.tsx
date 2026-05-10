"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { motion } from "motion/react";
import { toast } from "sonner";
import {
  AlertTriangle,
  Ban,
  Eye,
  Flag,
  Lock,
  MessageSquare,
  Pin,
  Reply,
  Search,
  Trash2,
  Unlock,
  Users,
} from "lucide-react";

import { KpiCard } from "@/components/ui/KpiCard";
import { FilterChip } from "@/components/ui/FilterChip";
import { Avatar } from "@/components/ui/Avatar";
import { confirmAction } from "@/components/ui/ConfirmDialog";
import { Th } from "@/components/ui/DataTableHeader";
import { Pagination } from "@/components/ui/Pagination";
import { useForumThreads } from "@/stores/useForumThreads";
import type { ForumThread, ForumTopic } from "@/types";
import { simulateVoid } from "@/lib/api";

type Tab = "threads" | "reports";

export default function ForumPage() {
  const sp = useSearchParams();
  const initialTab: Tab = sp.get("tab") === "reports" ? "reports" : "threads";
  const [tab, setTab] = useState<Tab>(initialTab);
  const threads = useForumThreads((s) => s.threads);
  const reports = useForumThreads((s) => s.reports);
  const togglePin = useForumThreads((s) => s.togglePin);
  const toggleLock = useForumThreads((s) => s.toggleLock);
  const removeThread = useForumThreads((s) => s.removeThread);
  const removeReply = useForumThreads((s) => s.removeReply);
  const hideReply = useForumThreads((s) => s.hideReply);
  const resolveReport = useForumThreads((s) => s.resolveReport);

  const [search, setSearch] = useState("");
  const [topicFilter, setTopicFilter] = useState<"all" | ForumTopic>("all");
  const [pinnedFilter, setPinnedFilter] = useState<"all" | "pinned" | "locked" | "open">("all");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);
  const [sortField, setSortField] = useState<keyof ForumThread>("createdAt");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");

  const filtered = useMemo(() => {
    let r = [...threads];
    if (search) r = r.filter((t) => t.title.toLowerCase().includes(search.toLowerCase()) || t.author.toLowerCase().includes(search.toLowerCase()));
    if (topicFilter !== "all") r = r.filter((t) => t.topic === topicFilter);
    if (pinnedFilter === "pinned") r = r.filter((t) => t.pinned);
    if (pinnedFilter === "locked") r = r.filter((t) => t.locked);
    if (pinnedFilter === "open") r = r.filter((t) => !t.locked);
    r.sort((a, b) => {
      const va = a[sortField] as string | number | boolean;
      const vb = b[sortField] as string | number | boolean;
      if (a.pinned && !b.pinned) return -1;
      if (!a.pinned && b.pinned) return 1;
      if (va < vb) return sortDir === "asc" ? -1 : 1;
      if (va > vb) return sortDir === "asc" ? 1 : -1;
      return 0;
    });
    return r;
  }, [threads, search, topicFilter, pinnedFilter, sortField, sortDir]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const pageRows = filtered.slice((page - 1) * pageSize, page * pageSize);
  useEffect(() => setPage(1), [search, topicFilter, pinnedFilter, tab]);

  const openReports = reports.filter((r) => r.status === "open").length;
  const totalReplies = threads.reduce((s, t) => s + t.replies.length, 0);
  const newWeek = threads.filter((t) => Date.now() - new Date(t.createdAt).getTime() < 7 * 86400000).length;

  function onSort(f: keyof ForumThread) {
    if (sortField === f) setSortDir(sortDir === "asc" ? "desc" : "asc");
    else {
      setSortField(f);
      setSortDir("asc");
    }
  }

  async function handleDeleteThread(id: string) {
    const ok = await confirmAction({
      title: "Supprimer ce thread ?",
      message: "Le thread et tous ses messages seront supprimés.",
      destructive: true,
    });
    if (!ok) return;
    await simulateVoid();
    removeThread(id);
    toast.success("Thread supprimé");
  }

  async function handleResolve(reportId: string, action: "approve" | "hide" | "ban" | "delete") {
    const report = reports.find((r) => r.id === reportId);
    if (!report) return;
    if (action === "delete") {
      const ok = await confirmAction({
        title: "Supprimer le contenu ?",
        message: "L'élément signalé sera supprimé du forum.",
        destructive: true,
      });
      if (!ok) return;
      await simulateVoid();
      if (report.targetKind === "thread") removeThread(report.threadId);
      else if (report.replyId) removeReply(report.threadId, report.replyId);
      resolveReport(reportId);
      toast.success("Contenu supprimé");
    } else if (action === "hide") {
      await simulateVoid();
      if (report.targetKind === "reply" && report.replyId) hideReply(report.threadId, report.replyId, true);
      resolveReport(reportId);
      toast.success("Contenu masqué");
    } else if (action === "ban") {
      const ok = await confirmAction({
        title: "Bannir l'auteur 7 jours ?",
        message: "L'auteur ne pourra plus poster pendant 7 jours.",
        destructive: true,
        confirmLabel: "Bannir",
      });
      if (!ok) return;
      await simulateVoid();
      resolveReport(reportId);
      toast.success("Auteur banni 7 jours");
    } else {
      await simulateVoid();
      resolveReport(reportId);
      toast.success("Contenu approuvé");
    }
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
          <h1>Forum</h1>
          <div className="page-subtitle">
            {threads.length} threads · {totalReplies} réponses · {openReports} signalement{openReports > 1 ? "s" : ""} ouvert{openReports > 1 ? "s" : ""}
          </div>
        </div>
      </div>

      <div className="kpi-grid" style={{ marginBottom: 16 }}>
        <KpiCard icon={MessageSquare} label="Threads totaux" value={threads.length} trend={4.1} />
        <KpiCard icon={Reply} label="Réponses totales" value={totalReplies} trend={6.4} />
        <KpiCard icon={Flag} label="Signalements ouverts" value={openReports} />
        <KpiCard icon={Users} label="Nouveaux 7 jours" value={newWeek} trend={2.2} />
      </div>

      <div className="row" style={{ gap: 4, marginBottom: 14, borderBottom: "1px solid var(--outline)" }}>
        {[
          { id: "threads", label: "Tous threads", count: threads.length },
          { id: "reports", label: "Signalements", count: openReports },
        ].map((t) => {
          const active = tab === (t.id as Tab);
          return (
            <button
              key={t.id}
              type="button"
              onClick={() => setTab(t.id as Tab)}
              style={{
                background: "transparent",
                border: "none",
                padding: "10px 16px",
                fontSize: 13.5,
                fontWeight: 500,
                color: active ? "var(--primary)" : "var(--text-secondary)",
                borderBottom: active ? "2px solid var(--primary)" : "2px solid transparent",
                cursor: "pointer",
              }}
            >
              {t.label}
              {t.id === "reports" && t.count > 0 && (
                <span
                  className="badge error"
                  style={{ marginLeft: 6, fontSize: 10, padding: "1px 6px" }}
                >
                  {t.count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {tab === "threads" && (
        <div className="data-table-wrap">
          <div className="data-table-toolbar">
            <div className="data-table-search">
              <Search size={14} className="icon" />
              <input
                placeholder="Rechercher par titre, auteur…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <div className="data-table-filters">
              <span className="muted tiny" style={{ marginRight: 4 }}>Sujet</span>
              <FilterChip active={topicFilter === "all"} onClick={() => setTopicFilter("all")}>Tous</FilterChip>
              <FilterChip active={topicFilter === "NAT"} onClick={() => setTopicFilter("NAT")}>NAT</FilterChip>
              <FilterChip active={topicFilter === "CSP"} onClick={() => setTopicFilter("CSP")}>CSP</FilterChip>
              <FilterChip active={topicFilter === "CR"} onClick={() => setTopicFilter("CR")}>CR</FilterChip>
              <FilterChip active={topicFilter === "general"} onClick={() => setTopicFilter("general")}>Général</FilterChip>
              <span className="muted tiny" style={{ margin: "0 4px 0 8px" }}>État</span>
              <FilterChip active={pinnedFilter === "all"} onClick={() => setPinnedFilter("all")}>Tous</FilterChip>
              <FilterChip active={pinnedFilter === "pinned"} onClick={() => setPinnedFilter("pinned")}>Épinglés</FilterChip>
              <FilterChip active={pinnedFilter === "locked"} onClick={() => setPinnedFilter("locked")}>Verrouillés</FilterChip>
              <FilterChip active={pinnedFilter === "open"} onClick={() => setPinnedFilter("open")}>Ouverts</FilterChip>
            </div>
          </div>

          <div className="scroll-x">
            <table className="data-table">
              <thead>
                <tr>
                  <Th field="title" sortField={sortField} sortDir={sortDir} onSort={onSort}>Titre</Th>
                  <th>Auteur</th>
                  <Th field="topic" sortField={sortField} sortDir={sortDir} onSort={onSort}>Sujet</Th>
                  <Th field="views" sortField={sortField} sortDir={sortDir} onSort={onSort}>Vues</Th>
                  <th>Réponses</th>
                  <th>Signalements</th>
                  <Th field="createdAt" sortField={sortField} sortDir={sortDir} onSort={onSort}>Créé</Th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {pageRows.length === 0 && (
                  <tr>
                    <td colSpan={8} style={{ padding: 60, textAlign: "center", color: "var(--text-tertiary)" }}>
                      Aucun thread ne correspond aux filtres.
                    </td>
                  </tr>
                )}
                {pageRows.map((t) => (
                  <tr key={t.id}>
                    <td>
                      <Link href={`/forum/${t.id}`} style={{ color: "inherit", textDecoration: "none", fontWeight: 500 }}>
                        <div className="row" style={{ gap: 6 }}>
                          {t.pinned && <Pin size={11} color="var(--primary)" />}
                          {t.locked && <Lock size={11} color="var(--text-tertiary)" />}
                          <span>{t.title}</span>
                        </div>
                      </Link>
                    </td>
                    <td>
                      <div className="user-cell">
                        <Avatar name={t.author} size="sm" />
                        <span style={{ fontSize: 12.5 }}>{t.author}</span>
                      </div>
                    </td>
                    <td><span className="badge outline">{t.topic === "general" ? "Général" : t.topic}</span></td>
                    <td className="muted" style={{ fontVariantNumeric: "tabular-nums" }}>{t.views}</td>
                    <td className="muted" style={{ fontVariantNumeric: "tabular-nums" }}>{t.replies.length}</td>
                    <td>
                      {t.reportsCount > 0 ? (
                        <span className="badge error dot">{t.reportsCount}</span>
                      ) : (
                        <span className="muted tiny">—</span>
                      )}
                    </td>
                    <td className="muted" style={{ fontSize: 12 }}>{new Date(t.createdAt).toLocaleDateString("fr-FR")}</td>
                    <td>
                      <div className="row" style={{ gap: 4 }}>
                        <button
                          className="btn ghost sm"
                          aria-label={t.pinned ? "Désépingler" : "Épingler"}
                          onClick={() => { togglePin(t.id); toast.success(t.pinned ? "Désépinglé" : "Épinglé"); }}
                        >
                          <Pin size={12} />
                        </button>
                        <button
                          className="btn ghost sm"
                          aria-label={t.locked ? "Déverrouiller" : "Verrouiller"}
                          onClick={() => { toggleLock(t.id); toast.success(t.locked ? "Déverrouillé" : "Verrouillé"); }}
                        >
                          {t.locked ? <Unlock size={12} /> : <Lock size={12} />}
                        </button>
                        <Link href={`/forum/${t.id}`} className="btn ghost sm" aria-label="Voir">
                          <Eye size={12} />
                        </Link>
                        <button
                          className="btn ghost sm"
                          aria-label="Supprimer"
                          onClick={() => handleDeleteThread(t.id)}
                        >
                          <Trash2 size={12} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <Pagination
            page={page}
            totalPages={totalPages}
            onChange={setPage}
            total={filtered.length}
            pageSize={pageSize}
            onPageSizeChange={setPageSize}
          />
        </div>
      )}

      {tab === "reports" && (
        <div className="card" style={{ padding: 0 }}>
          {reports.filter((r) => r.status === "open").length === 0 ? (
            <div style={{ padding: 60, textAlign: "center", color: "var(--text-tertiary)" }}>
              <AlertTriangle size={32} style={{ margin: "0 auto 12px", display: "block", opacity: 0.4 }} />
              Aucun signalement en attente. Bravo l&apos;équipe modération.
            </div>
          ) : (
            <div className="col" style={{ gap: 0 }}>
              {reports.filter((r) => r.status === "open").map((report) => {
                const thread = threads.find((t) => t.id === report.threadId);
                const target = report.targetKind === "reply" && thread
                  ? thread.replies.find((rr) => rr.id === report.replyId)
                  : null;
                return (
                  <div
                    key={report.id}
                    style={{
                      padding: "16px 20px",
                      borderBottom: "1px solid var(--outline)",
                      display: "flex",
                      gap: 14,
                      alignItems: "flex-start",
                    }}
                  >
                    <div
                      style={{
                        width: 36,
                        height: 36,
                        borderRadius: 10,
                        background: "rgba(239,65,53,0.10)",
                        color: "var(--secondary)",
                        display: "grid",
                        placeItems: "center",
                        flexShrink: 0,
                      }}
                    >
                      <Flag size={16} />
                    </div>
                    <div style={{ flex: 1 }}>
                      <div className="row" style={{ gap: 6, marginBottom: 4 }}>
                        <span className="badge error">{report.reason}</span>
                        <span className="muted tiny">
                          signalé par {report.reporter} · {new Date(report.createdAt).toLocaleDateString("fr-FR")}
                        </span>
                      </div>
                      {thread && (
                        <Link href={`/forum/${thread.id}`} style={{ color: "var(--on-surface)", textDecoration: "none" }}>
                          <div style={{ fontWeight: 500, fontSize: 14, marginBottom: 4 }}>
                            {report.targetKind === "thread" ? thread.title : `Réponse dans : ${thread.title}`}
                          </div>
                        </Link>
                      )}
                      <div className="muted" style={{ fontSize: 13, fontStyle: "italic", marginBottom: 10 }}>
                        « {(report.targetKind === "thread" ? thread?.body : target?.body) || "Contenu introuvable"} »
                      </div>
                      <div className="row" style={{ gap: 6, flexWrap: "wrap" }}>
                        <button className="btn outline sm" onClick={() => handleResolve(report.id, "approve")}>
                          Approuver le contenu
                        </button>
                        <button className="btn outline sm" onClick={() => handleResolve(report.id, "hide")}>
                          <Eye size={11} /> Masquer
                        </button>
                        <button className="btn outline sm" onClick={() => handleResolve(report.id, "ban")}>
                          <Ban size={11} /> Bannir l&apos;auteur 7j
                        </button>
                        <button className="btn danger sm" onClick={() => handleResolve(report.id, "delete")}>
                          <Trash2 size={11} /> Supprimer
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </motion.div>
  );
}
