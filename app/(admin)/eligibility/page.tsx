"use client";

import { useState } from "react";
import { motion } from "motion/react";
import { toast } from "sonner";
import {
  ArrowDown,
  ArrowUp,
  Check,
  ClipboardCheck,
  Download,
  Plus,
  Save,
  Trash2,
  Upload,
  X,
} from "lucide-react";

import { Drawer } from "@/components/ui/Drawer";
import { confirmAction } from "@/components/ui/ConfirmDialog";
import { evaluateAnswers, useEligibility } from "@/stores/useEligibility";
import type {
  EligibilityChoice,
  EligibilityOutcome,
  EligibilityQuestion,
  EligibilityRule,
  Goal,
} from "@/types";
import { simulateVoid } from "@/lib/api";
import { cn } from "@/lib/utils";

export default function EligibilityPage() {
  const questions = useEligibility((s) => s.questions);
  const rules = useEligibility((s) => s.rules);
  const setQuestions = useEligibility((s) => s.setQuestions);
  const setRules = useEligibility((s) => s.setRules);
  const upsertQuestion = useEligibility((s) => s.upsertQuestion);
  const removeQuestion = useEligibility((s) => s.removeQuestion);
  const upsertRule = useEligibility((s) => s.upsertRule);
  const removeRule = useEligibility((s) => s.removeRule);
  const reset = useEligibility((s) => s.reset);

  const [editingRule, setEditingRule] = useState<EligibilityRule | null>(null);
  const [testOpen, setTestOpen] = useState(false);

  function newQuestion() {
    upsertQuestion({
      id: `q_${Date.now().toString(36)}`,
      prompt: "Nouvelle question",
      choices: [
        { key: "yes", label: "Oui" },
        { key: "no", label: "Non" },
      ],
    });
    toast.success("Question ajoutée");
  }

  function newRule() {
    setEditingRule({
      id: `r_${Date.now().toString(36)}`,
      conditions: [],
      outcome: { kind: "eligible", programs: ["NAT"] },
    });
  }

  function moveQuestion(id: string, dir: -1 | 1) {
    const idx = questions.findIndex((q) => q.id === id);
    const swap = idx + dir;
    if (swap < 0 || swap >= questions.length) return;
    const next = [...questions];
    [next[idx], next[swap]] = [next[swap]!, next[idx]!];
    setQuestions(next);
  }

  function moveRule(id: string, dir: -1 | 1) {
    const idx = rules.findIndex((r) => r.id === id);
    const swap = idx + dir;
    if (swap < 0 || swap >= rules.length) return;
    const next = [...rules];
    [next[idx], next[swap]] = [next[swap]!, next[idx]!];
    setRules(next);
  }

  async function handleDeleteQuestion(id: string) {
    const ok = await confirmAction({
      title: "Supprimer la question ?",
      message: "Toutes les conditions de règle référencant cette question seront retirées.",
      destructive: true,
    });
    if (!ok) return;
    await simulateVoid();
    removeQuestion(id);
    toast.success("Question supprimée");
  }

  async function handleDeleteRule(id: string) {
    const ok = await confirmAction({
      title: "Supprimer la règle ?",
      message: "Action irréversible.",
      destructive: true,
    });
    if (!ok) return;
    await simulateVoid();
    removeRule(id);
    toast.success("Règle supprimée");
  }

  function exportJson() {
    const blob = new Blob([JSON.stringify({ questions, rules }, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "eligibility.json";
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Export téléchargé");
  }

  function importJson(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const parsed = JSON.parse(reader.result as string);
        if (parsed.questions) setQuestions(parsed.questions);
        if (parsed.rules) setRules(parsed.rules);
        toast.success("Configuration importée");
      } catch {
        toast.error("Fichier JSON invalide");
      }
    };
    reader.readAsText(file);
  }

  return (
    <motion.div className="page" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2 }}>
      <div className="page-header">
        <div className="page-title-block">
          <h1>Test d&apos;éligibilité</h1>
          <div className="page-subtitle">
            {questions.length} questions · {rules.length} règles
          </div>
        </div>
        <div className="page-actions">
          <button className="btn outline" onClick={() => setTestOpen(true)}>
            <ClipboardCheck size={13} /> Tester le parcours
          </button>
          <button className="btn outline" onClick={exportJson}>
            <Download size={13} /> Exporter JSON
          </button>
          <label className="btn outline" style={{ cursor: "pointer" }}>
            <Upload size={13} /> Importer JSON
            <input type="file" accept="application/json" onChange={importJson} style={{ display: "none" }} />
          </label>
          <button className="btn ghost" onClick={() => { reset(); toast.success("Réinitialisé"); }}>
            Réinitialiser
          </button>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, alignItems: "flex-start" }}>
        <div className="card" style={{ padding: 16 }}>
          <div className="row between" style={{ marginBottom: 12 }}>
            <h2>Questions</h2>
            <button className="btn primary sm" onClick={newQuestion}>
              <Plus size={12} /> Ajouter
            </button>
          </div>
          <div className="col" style={{ gap: 10 }}>
            {questions.map((q, i) => (
              <QuestionEditor
                key={q.id}
                question={q}
                isFirst={i === 0}
                isLast={i === questions.length - 1}
                onMove={(d) => moveQuestion(q.id, d)}
                onChange={(next) => upsertQuestion(next)}
                onDelete={() => handleDeleteQuestion(q.id)}
              />
            ))}
          </div>
        </div>

        <div className="card" style={{ padding: 16 }}>
          <div className="row between" style={{ marginBottom: 12 }}>
            <h2>Règles</h2>
            <button className="btn primary sm" onClick={newRule}>
              <Plus size={12} /> Ajouter
            </button>
          </div>
          <div className="col" style={{ gap: 10 }}>
            {rules.map((r, i) => (
              <RuleSummary
                key={r.id}
                rule={r}
                questions={questions}
                isFirst={i === 0}
                isLast={i === rules.length - 1}
                onMove={(d) => moveRule(r.id, d)}
                onEdit={() => setEditingRule(r)}
                onDelete={() => handleDeleteRule(r.id)}
              />
            ))}
            {rules.length === 0 && (
              <div className="muted" style={{ padding: 24, textAlign: "center", fontSize: 13 }}>
                Aucune règle. Ajoutez-en une pour commencer.
              </div>
            )}
          </div>
        </div>
      </div>

      <RuleDrawer
        rule={editingRule}
        questions={questions}
        onClose={() => setEditingRule(null)}
        onSave={(r) => {
          upsertRule(r);
          toast.success("Règle enregistrée");
          setEditingRule(null);
        }}
      />

      <TestModal
        open={testOpen}
        onClose={() => setTestOpen(false)}
        questions={questions}
        rules={rules}
      />
    </motion.div>
  );
}

function QuestionEditor({
  question,
  isFirst,
  isLast,
  onMove,
  onChange,
  onDelete,
}: {
  question: EligibilityQuestion;
  isFirst: boolean;
  isLast: boolean;
  onMove: (dir: -1 | 1) => void;
  onChange: (q: EligibilityQuestion) => void;
  onDelete: () => void;
}) {
  function updateChoice(i: number, patch: Partial<EligibilityChoice>) {
    const next = [...question.choices];
    next[i] = { ...next[i]!, ...patch };
    onChange({ ...question, choices: next });
  }
  function addChoice() {
    onChange({
      ...question,
      choices: [...question.choices, { key: `opt_${question.choices.length + 1}`, label: "Nouvelle option" }],
    });
  }
  function removeChoice(i: number) {
    onChange({ ...question, choices: question.choices.filter((_, idx) => idx !== i) });
  }

  return (
    <div style={{ padding: 12, border: "1px solid var(--outline)", borderRadius: 12 }}>
      <div className="row" style={{ gap: 8, marginBottom: 8 }}>
        <code style={{ fontSize: 11, color: "var(--text-tertiary)", padding: "2px 6px", background: "var(--surface-low)", borderRadius: 4 }}>
          {question.id}
        </code>
        <div style={{ marginLeft: "auto", display: "flex", gap: 4 }}>
          <button className="btn ghost sm" onClick={() => onMove(-1)} disabled={isFirst} aria-label="Monter">
            <ArrowUp size={11} />
          </button>
          <button className="btn ghost sm" onClick={() => onMove(1)} disabled={isLast} aria-label="Descendre">
            <ArrowDown size={11} />
          </button>
          <button className="btn ghost sm" onClick={onDelete} aria-label="Supprimer">
            <Trash2 size={11} />
          </button>
        </div>
      </div>
      <textarea
        value={question.prompt}
        onChange={(e) => onChange({ ...question, prompt: e.target.value })}
        style={{ minHeight: 40, fontWeight: 500, marginBottom: 8 }}
      />
      <div className="col" style={{ gap: 6 }}>
        {question.choices.map((c, i) => (
          <div key={i} className="row" style={{ gap: 6 }}>
            <input
              type="text"
              value={c.key}
              onChange={(e) => updateChoice(i, { key: e.target.value })}
              style={{ width: 120, fontFamily: "ui-monospace, monospace", fontSize: 12 }}
            />
            <input
              type="text"
              value={c.label}
              onChange={(e) => updateChoice(i, { label: e.target.value })}
              style={{ flex: 1 }}
            />
            <button className="btn ghost sm" onClick={() => removeChoice(i)} aria-label="Retirer">
              <X size={11} />
            </button>
          </div>
        ))}
        <button className="btn outline sm" onClick={addChoice} style={{ alignSelf: "flex-start" }}>
          <Plus size={11} /> Ajouter une option
        </button>
      </div>
    </div>
  );
}

function RuleSummary({
  rule,
  questions,
  isFirst,
  isLast,
  onMove,
  onEdit,
  onDelete,
}: {
  rule: EligibilityRule;
  questions: EligibilityQuestion[];
  isFirst: boolean;
  isLast: boolean;
  onMove: (dir: -1 | 1) => void;
  onEdit: () => void;
  onDelete: () => void;
}) {
  function describeOutcome(o: EligibilityOutcome): string {
    if (o.kind === "exempt") return `Exempté — ${o.reason}`;
    if (o.kind === "eligible") return `Éligible — ${o.programs.join(", ")}`;
    return `Redirection → ${o.url}`;
  }
  return (
    <div style={{ padding: 12, border: "1px solid var(--outline)", borderRadius: 12 }}>
      <div className="row between" style={{ marginBottom: 8 }}>
        <code style={{ fontSize: 11, color: "var(--text-tertiary)", padding: "2px 6px", background: "var(--surface-low)", borderRadius: 4 }}>
          {rule.id}
        </code>
        <div className="row" style={{ gap: 4 }}>
          <button className="btn ghost sm" onClick={() => onMove(-1)} disabled={isFirst} aria-label="Monter">
            <ArrowUp size={11} />
          </button>
          <button className="btn ghost sm" onClick={() => onMove(1)} disabled={isLast} aria-label="Descendre">
            <ArrowDown size={11} />
          </button>
          <button className="btn outline sm" onClick={onEdit}>Modifier</button>
          <button className="btn ghost sm" onClick={onDelete} aria-label="Supprimer">
            <Trash2 size={11} />
          </button>
        </div>
      </div>
      <div className="row wrap" style={{ gap: 6, marginBottom: 8 }}>
        {rule.conditions.length === 0 ? (
          <span className="muted tiny">Aucune condition (toujours déclenché)</span>
        ) : (
          rule.conditions.map((c, i) => {
            const q = questions.find((x) => x.id === c.questionId);
            const choice = q?.choices.find((ch) => ch.key === c.equals);
            return (
              <span key={i} className="badge info">
                {q ? q.prompt.slice(0, 24) + (q.prompt.length > 24 ? "…" : "") : c.questionId} = {choice?.label ?? c.equals}
              </span>
            );
          })
        )}
      </div>
      <div style={{ fontSize: 13, fontWeight: 500 }}>→ {describeOutcome(rule.outcome)}</div>
    </div>
  );
}

function RuleDrawer({
  rule,
  questions,
  onClose,
  onSave,
}: {
  rule: EligibilityRule | null;
  questions: EligibilityQuestion[];
  onClose: () => void;
  onSave: (r: EligibilityRule) => void;
}) {
  const [draft, setDraft] = useState<EligibilityRule | null>(rule);
  if (rule && (!draft || draft.id !== rule.id)) setDraft(rule);
  if (!rule || !draft) return null;

  function setOutcomeKind(kind: EligibilityOutcome["kind"]) {
    if (kind === "exempt") setDraft({ ...draft!, outcome: { kind: "exempt", reason: "" } });
    else if (kind === "eligible") setDraft({ ...draft!, outcome: { kind: "eligible", programs: ["NAT"] } });
    else setDraft({ ...draft!, outcome: { kind: "redirect", url: "" } });
  }

  return (
    <Drawer
      open={!!rule}
      onClose={onClose}
      title={`Règle ${rule.id}`}
      subtitle="Conditions et résultat"
      footer={
        <>
          <span className="save-state" />
          <button className="btn ghost" onClick={onClose}>Annuler</button>
          <button className="btn primary" onClick={() => onSave(draft)}>
            <Save size={13} /> Enregistrer
          </button>
        </>
      }
    >
      <div className="form-row">
        <label className="lbl">Conditions (toutes vraies)</label>
        <div className="col" style={{ gap: 6 }}>
          {draft.conditions.map((c, i) => {
            const q = questions.find((x) => x.id === c.questionId);
            return (
              <div key={i} className="row" style={{ gap: 6 }}>
                <select
                  value={c.questionId}
                  onChange={(e) => {
                    const nextQ = questions.find((x) => x.id === e.target.value);
                    const next = [...draft.conditions];
                    next[i] = { questionId: e.target.value, equals: nextQ?.choices[0]?.key ?? "" };
                    setDraft({ ...draft, conditions: next });
                  }}
                  style={{ flex: 2 }}
                >
                  <option value="">— Question —</option>
                  {questions.map((qq) => (
                    <option key={qq.id} value={qq.id}>{qq.prompt.slice(0, 40)}</option>
                  ))}
                </select>
                <span className="muted">=</span>
                <select
                  value={c.equals}
                  onChange={(e) => {
                    const next = [...draft.conditions];
                    next[i] = { ...next[i]!, equals: e.target.value };
                    setDraft({ ...draft, conditions: next });
                  }}
                  style={{ flex: 1 }}
                >
                  {q?.choices.map((ch) => (
                    <option key={ch.key} value={ch.key}>{ch.label}</option>
                  ))}
                </select>
                <button
                  className="btn ghost sm"
                  onClick={() => setDraft({ ...draft, conditions: draft.conditions.filter((_, idx) => idx !== i) })}
                  aria-label="Retirer"
                >
                  <X size={11} />
                </button>
              </div>
            );
          })}
          <button
            className="btn outline sm"
            onClick={() =>
              setDraft({
                ...draft,
                conditions: [
                  ...draft.conditions,
                  { questionId: questions[0]?.id ?? "", equals: questions[0]?.choices[0]?.key ?? "" },
                ],
              })
            }
            style={{ alignSelf: "flex-start" }}
          >
            <Plus size={11} /> Ajouter une condition
          </button>
        </div>
      </div>

      <div className="form-row">
        <label className="lbl">Résultat</label>
        <div className="segmented" style={{ marginBottom: 12 }}>
          <button type="button" className={cn(draft.outcome.kind === "exempt" && "active")} onClick={() => setOutcomeKind("exempt")}>Exempté</button>
          <button type="button" className={cn(draft.outcome.kind === "eligible" && "active")} onClick={() => setOutcomeKind("eligible")}>Éligible</button>
          <button type="button" className={cn(draft.outcome.kind === "redirect" && "active")} onClick={() => setOutcomeKind("redirect")}>Redirection</button>
        </div>
        {draft.outcome.kind === "exempt" && (
          <input
            type="text"
            value={draft.outcome.reason}
            onChange={(e) => setDraft({ ...draft, outcome: { kind: "exempt", reason: e.target.value } })}
            placeholder="Raison de l'exemption"
          />
        )}
        {draft.outcome.kind === "eligible" && (
          <div className="row" style={{ gap: 6 }}>
            {(["NAT", "CSP", "CR"] as Goal[]).map((p) => {
              const sel = draft.outcome.kind === "eligible" && draft.outcome.programs.includes(p);
              return (
                <button
                  key={p}
                  type="button"
                  className={cn("filter-chip", sel && "active")}
                  onClick={() => {
                    if (draft.outcome.kind !== "eligible") return;
                    const programs = sel
                      ? draft.outcome.programs.filter((x) => x !== p)
                      : [...draft.outcome.programs, p];
                    setDraft({ ...draft, outcome: { kind: "eligible", programs } });
                  }}
                >
                  {p}
                </button>
              );
            })}
          </div>
        )}
        {draft.outcome.kind === "redirect" && (
          <input
            type="text"
            value={draft.outcome.url}
            onChange={(e) => setDraft({ ...draft, outcome: { kind: "redirect", url: e.target.value } })}
            placeholder="https://…"
          />
        )}
      </div>
    </Drawer>
  );
}

function TestModal({
  open,
  onClose,
  questions,
  rules,
}: {
  open: boolean;
  onClose: () => void;
  questions: EligibilityQuestion[];
  rules: EligibilityRule[];
}) {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});

  if (!open) return null;

  const total = questions.length;
  const finished = step >= total;
  const matched = finished ? evaluateAnswers(answers, rules) : null;

  function reset() {
    setStep(0);
    setAnswers({});
  }

  return (
    <Drawer
      open={open}
      onClose={() => { reset(); onClose(); }}
      title="Tester le parcours"
      subtitle="Simulation candidat"
      footer={
        <>
          <span className="save-state" />
          <button className="btn ghost" onClick={() => { reset(); onClose(); }}>Fermer</button>
          {finished && <button className="btn primary" onClick={reset}>Recommencer</button>}
        </>
      }
    >
      {!finished ? (
        <div>
          <div className="muted tiny" style={{ marginBottom: 6 }}>Question {step + 1} / {total}</div>
          <h3 style={{ marginBottom: 16 }}>{questions[step]?.prompt}</h3>
          <div className="col" style={{ gap: 8 }}>
            {questions[step]?.choices.map((c) => (
              <button
                key={c.key}
                type="button"
                className="btn outline"
                style={{ justifyContent: "flex-start", padding: "12px 16px" }}
                onClick={() => {
                  setAnswers({ ...answers, [questions[step]!.id]: c.key });
                  setStep(step + 1);
                }}
              >
                {c.label}
              </button>
            ))}
          </div>
        </div>
      ) : (
        <div>
          <div
            className="card card-pad"
            style={{
              background: matched
                ? matched.outcome.kind === "exempt"
                  ? "rgba(245,158,11,0.06)"
                  : "rgba(16,185,129,0.06)"
                : "rgba(239,65,53,0.06)",
              borderColor: matched
                ? matched.outcome.kind === "exempt"
                  ? "var(--warning)"
                  : "var(--success)"
                : "var(--secondary)",
            }}
          >
            <div className="row" style={{ gap: 8, marginBottom: 8 }}>
              <Check size={16} color={matched ? "var(--success)" : "var(--secondary)"} />
              <strong>Résultat</strong>
            </div>
            {!matched ? (
              <div>Aucune règle ne correspond aux réponses.</div>
            ) : matched.outcome.kind === "exempt" ? (
              <div>Exempté — <strong>{matched.outcome.reason}</strong></div>
            ) : matched.outcome.kind === "eligible" ? (
              <div>Éligible aux programmes : <strong>{matched.outcome.programs.join(", ")}</strong></div>
            ) : (
              <div>Redirection vers : <a href={matched.outcome.url} target="_blank" rel="noopener noreferrer">{matched.outcome.url}</a></div>
            )}
          </div>
          <div className="muted tiny" style={{ marginTop: 12 }}>Réponses :</div>
          <div className="col" style={{ gap: 4, marginTop: 4 }}>
            {Object.entries(answers).map(([qId, k]) => {
              const q = questions.find((x) => x.id === qId);
              const c = q?.choices.find((cc) => cc.key === k);
              return (
                <div key={qId} className="row tiny" style={{ gap: 6 }}>
                  <span className="muted">{q?.prompt.slice(0, 48)}</span>
                  <strong>→ {c?.label ?? k}</strong>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </Drawer>
  );
}
