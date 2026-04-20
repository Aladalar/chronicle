// ═══════════════════════════════════════════════════════════════
// Annotation Parser for Chronicle descriptions
//
// Syntax:
//   @age:N{content}       — show only if campaignAge >= N
//   @dm{content}          — DM-only, hidden from players
//   @link:table:id{label} — cross-link to another entry
//   @link:table:id        — shorthand (renders id as label)
//   @extinct{content}     — status badge: extinct
//   @destroyed{content}   — status badge: destroyed
//   @forgotten{content}   — status badge: forgotten
//   @quote:Author{text}   — styled blockquote
//   @danger{content}      — red callout
//
// Returns an array of tokens:
//   { type: "text", value: "..." }
//   { type: "age", age: 3, children: [...tokens] }
//   { type: "dm", children: [...tokens] }
//   { type: "link", table: "settlements", id: "uuid", label: "..." }
//   { type: "status", status: "extinct"|"destroyed"|"forgotten", children: [...tokens] }
//   { type: "quote", author: "...", children: [...tokens] }
//   { type: "danger", children: [...tokens] }
// ═══════════════════════════════════════════════════════════════

export function parseAnnotations(text) {
  if (!text || typeof text !== "string") return [{ type: "text", value: text || "" }];

  const tokens = [];
  let i = 0;

  while (i < text.length) {
    // Look for @ marker
    const atIdx = text.indexOf("@", i);
    if (atIdx === -1) {
      // Rest is plain text
      if (i < text.length) tokens.push({ type: "text", value: text.slice(i) });
      break;
    }

    // Flush plain text before @
    if (atIdx > i) {
      tokens.push({ type: "text", value: text.slice(i, atIdx) });
    }

    // Try to parse annotation at atIdx
    const parsed = parseAnnotationAt(text, atIdx);
    if (parsed) {
      tokens.push(parsed.token);
      i = parsed.end;
    } else {
      // Not a valid annotation — treat @ as literal
      tokens.push({ type: "text", value: "@" });
      i = atIdx + 1;
    }
  }

  return mergeTextTokens(tokens);
}

function parseAnnotationAt(text, pos) {
  // @age:N{...}
  let m = matchAt(text, pos, /^@age:(\d+)\{/);
  if (m) {
    const inner = extractBraced(text, pos + m[0].length - 1);
    if (inner) {
      return {
        token: { type: "age", age: parseInt(m[1]), children: parseAnnotations(inner.content) },
        end: inner.end,
      };
    }
  }

  // @dm{...}
  m = matchAt(text, pos, /^@dm\{/);
  if (m) {
    const inner = extractBraced(text, pos + m[0].length - 1);
    if (inner) {
      return {
        token: { type: "dm", children: parseAnnotations(inner.content) },
        end: inner.end,
      };
    }
  }

  // @link:table:id{label}
  m = matchAt(text, pos, /^@link:([a-z-]+):([a-zA-Z0-9_-]+)\{/);
  if (m) {
    const inner = extractBraced(text, pos + m[0].length - 1);
    if (inner) {
      return {
        token: { type: "link", table: m[1], id: m[2], label: inner.content },
        end: inner.end,
      };
    }
  }

  // @link:table:id (shorthand, no braces)
  m = matchAt(text, pos, /^@link:([a-z-]+):([a-zA-Z0-9_-]+)(?=[\s,.\)]|$)/);
  if (m) {
    return {
      token: { type: "link", table: m[1], id: m[2], label: null },
      end: pos + m[0].length,
    };
  }

  // Status markers: @extinct{...}, @destroyed{...}, @forgotten{...}
  for (const status of ["extinct", "destroyed", "forgotten"]) {
    m = matchAt(text, pos, new RegExp(`^@${status}\\{`));
    if (m) {
      const inner = extractBraced(text, pos + m[0].length - 1);
      if (inner) {
        return {
          token: { type: "status", status, children: parseAnnotations(inner.content) },
          end: inner.end,
        };
      }
    }
  }

  // @quote:Author{...}
  m = matchAt(text, pos, /^@quote:([^{]+)\{/);
  if (m) {
    const inner = extractBraced(text, pos + m[0].length - 1);
    if (inner) {
      return {
        token: { type: "quote", author: m[1].trim(), children: parseAnnotations(inner.content) },
        end: inner.end,
      };
    }
  }

  // @danger{...}
  m = matchAt(text, pos, /^@danger\{/);
  if (m) {
    const inner = extractBraced(text, pos + m[0].length - 1);
    if (inner) {
      return {
        token: { type: "danger", children: parseAnnotations(inner.content) },
        end: inner.end,
      };
    }
  }

  return null;
}

// Match regex at exact position
function matchAt(text, pos, regex) {
  const sub = text.slice(pos);
  return sub.match(regex);
}

// Extract content between matching braces, handling nesting
// pos should point to the opening {
function extractBraced(text, pos) {
  if (text[pos] !== "{") return null;
  let depth = 1;
  let i = pos + 1;
  while (i < text.length && depth > 0) {
    if (text[i] === "{") depth++;
    else if (text[i] === "}") depth--;
    if (depth > 0) i++;
  }
  if (depth !== 0) return null; // unmatched
  return {
    content: text.slice(pos + 1, i),
    end: i + 1,
  };
}

// Merge adjacent text tokens
function mergeTextTokens(tokens) {
  const out = [];
  for (const t of tokens) {
    if (t.type === "text" && out.length > 0 && out[out.length - 1].type === "text") {
      out[out.length - 1].value += t.value;
    } else {
      out.push(t);
    }
  }
  return out;
}
