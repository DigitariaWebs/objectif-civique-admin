function formatInline(s: string): string {
  return s
    .replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>")
    .replace(/\*([^*]+)\*/g, "<em>$1</em>")
    .replace(/`([^`]+)`/g, "<code>$1</code>")
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener">$1</a>');
}

export function renderMarkdown(src: string | undefined): string {
  if (!src) return "";
  const lines = src.split("\n");
  let out = "";
  let inList = false;
  let inQuote = false;
  for (const raw of lines) {
    const l = raw;
    if (/^### /.test(l)) { if (inList) { out += "</ul>"; inList = false; } out += `<h3>${l.slice(4)}</h3>`; continue; }
    if (/^## /.test(l)) { if (inList) { out += "</ul>"; inList = false; } out += `<h2>${l.slice(3)}</h2>`; continue; }
    if (/^# /.test(l)) { if (inList) { out += "</ul>"; inList = false; } out += `<h1>${l.slice(2)}</h1>`; continue; }
    if (/^> /.test(l)) {
      if (inList) { out += "</ul>"; inList = false; }
      if (!inQuote) { out += "<blockquote>"; inQuote = true; }
      out += l.slice(2) + "<br/>";
      continue;
    } else if (inQuote) { out += "</blockquote>"; inQuote = false; }
    if (/^[-*] /.test(l)) {
      if (!inList) { out += "<ul>"; inList = true; }
      out += `<li>${formatInline(l.slice(2))}</li>`;
      continue;
    }
    if (inList) { out += "</ul>"; inList = false; }
    if (l.trim() === "") { out += ""; continue; }
    out += `<p>${formatInline(l)}</p>`;
  }
  if (inList) out += "</ul>";
  if (inQuote) out += "</blockquote>";
  return out;
}
