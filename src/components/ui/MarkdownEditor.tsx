"use client";

import { Heading1, Heading2, Heading3, Bold, Italic, List, Quote, Link as LinkIcon, Image as ImageIcon } from "lucide-react";
import { renderMarkdown } from "@/lib/markdown";

type Props = {
  value: string;
  onChange: (value: string) => void;
  height?: number;
};

export function MarkdownEditor({ value, onChange, height = 400 }: Props) {
  const words = (value || "").trim().split(/\s+/).filter(Boolean).length;
  const chars = (value || "").length;
  const readMin = Math.max(1, Math.round(words / 220));
  return (
    <div className="md-editor" style={{ height }}>
      <div className="pane editor" style={{ display: "flex", flexDirection: "column" }}>
        <div className="md-toolbar">
          <button type="button" title="Titre 1"><Heading1 size={14} /></button>
          <button type="button" title="Titre 2"><Heading2 size={14} /></button>
          <button type="button" title="Titre 3"><Heading3 size={14} /></button>
          <span className="sep" />
          <button type="button" title="Gras"><Bold size={14} /></button>
          <button type="button" title="Italique"><Italic size={14} /></button>
          <span className="sep" />
          <button type="button" title="Liste"><List size={14} /></button>
          <button type="button" title="Citation"><Quote size={14} /></button>
          <button type="button" title="Lien"><LinkIcon size={14} /></button>
          <button type="button" title="Image"><ImageIcon size={14} /></button>
        </div>
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          style={{ flex: 1, padding: "12px 14px" }}
        />
        <div className="md-counters">
          <span>{words} mots</span>
          <span>{chars} caractères</span>
          <span>~{readMin} min de lecture</span>
        </div>
      </div>
      <div className="pane preview" dangerouslySetInnerHTML={{ __html: renderMarkdown(value) }} />
    </div>
  );
}
