import { useState, useEffect } from "react";
import { api } from "@/api/client";
import { AnnotatedText } from "@/components/annotations";

export default function FieldInput({ field, value, onChange, allRefs }) {
  switch (field.type) {
    case "text":
      return (
        <input
          value={value || ""}
          onChange={(e) => onChange(e.target.value)}
          placeholder={field.placeholder}
          style={field.mono ? { fontFamily: "var(--font-mono, monospace)" } : undefined}
        />
      );

    case "longtext":
      return <LongtextWithPreview value={value} onChange={onChange} placeholder={field.placeholder} campaignAge={field._campaignAge} />;

    case "number":
      return (
        <input
          type="number"
          value={value ?? ""}
          onChange={(e) => onChange(e.target.value === "" ? null : Number(e.target.value))}
          placeholder={field.placeholder}
        />
      );

    case "select":
      return (
        <select value={value || ""} onChange={(e) => onChange(e.target.value || null)}>
          <option value="">— None —</option>
          {field.options.map((opt) => (
            <option key={opt} value={opt}>{opt}</option>
          ))}
        </select>
      );

    case "color":
      return (
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <input
            type="color"
            value={value || "#808080"}
            onChange={(e) => onChange(e.target.value)}
            style={{ width: 48, height: 36, padding: 2, cursor: "pointer" }}
          />
          <input
            value={value || ""}
            onChange={(e) => onChange(e.target.value)}
            placeholder="#808080"
            style={{ fontFamily: "var(--font-mono, monospace)", flex: 1 }}
          />
        </div>
      );

    case "tags":
      return <TagsInput value={value} onChange={onChange} suggestions={field.options} />;

    case "ref":
      return <RefSelect refTable={field.refTable} value={value} onChange={onChange} allRefs={allRefs} filterDesignation={field.filterDesignation} />;

    case "attrmods":
      return <AttrModsInput value={value} onChange={onChange} />;

    case "ingredient-parts":
      return <IngredientPartsInput value={value} onChange={onChange} />;

    case "bundle-layers":
      return <BundleLayersInput value={value} onChange={onChange} />;

    default:
      return <input value={value || ""} onChange={(e) => onChange(e.target.value)} />;
  }
}

// ─ Tags (array of strings with autocomplete) ─
function TagsInput({ value, onChange, suggestions = [] }) {
  const [draft, setDraft] = useState("");
  const list = Array.isArray(value) ? value : [];

  const add = (v) => {
    const t = v.trim();
    if (!t || list.includes(t)) return;
    onChange([...list, t]);
    setDraft("");
  };
  const remove = (i) => onChange(list.filter((_, j) => j !== i));

  return (
    <div style={{ border: "1px solid var(--border)", borderRadius: 4, padding: 6, background: "var(--bg)" }}>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 4, marginBottom: list.length ? 6 : 0 }}>
        {list.map((tag, i) => (
          <span key={i} style={{
            padding: "2px 8px",
            borderRadius: 3,
            background: "var(--accent-bg)",
            color: "var(--accent)",
            fontSize: 13,
            display: "inline-flex",
            alignItems: "center",
            gap: 6,
          }}>
            {tag}
            <button onClick={() => remove(i)} className="btn-ghost"
              style={{ padding: "0 4px", fontSize: 14, border: "none", color: "var(--text-dim)", background: "transparent" }}>
              ×
            </button>
          </span>
        ))}
      </div>
      <input
        list={suggestions.length ? `sug-${Math.random()}` : undefined}
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === ",") { e.preventDefault(); add(draft); }
          if (e.key === "Backspace" && !draft && list.length) remove(list.length - 1);
        }}
        onBlur={() => draft && add(draft)}
        placeholder="Type and press Enter..."
        style={{ border: "none", background: "transparent", padding: "4px 0" }}
      />
      {suggestions.length > 0 && (
        <datalist id={`sug-${Math.random()}`}>
          {suggestions.map((s) => <option key={s} value={s} />)}
        </datalist>
      )}
    </div>
  );
}

// ─ Ref select (dropdown from another ref table) ─
function RefSelect({ refTable, value, onChange, allRefs, filterDesignation }) {
  let options = allRefs?.[refTable] || [];
  if (filterDesignation && refTable === "types") {
    options = options.filter((o) => {
      const d = o.designations || [];
      return Array.isArray(d) && d.includes(filterDesignation);
    });
  }

  return (
    <select value={value || ""} onChange={(e) => onChange(e.target.value || null)}>
      <option value="">— None —</option>
      {options.map((o) => (
        <option key={o.id} value={o.id}>
          {o.icon ? `${o.icon} ` : ""}{o.name}
        </option>
      ))}
    </select>
  );
}

// ─ Attribute mods { STR: -2, AGI: 1 } ─
const ATTRS = ["STR","END","FOR","AGI","INT","WIS","SPI","CHA","LCK"];
function AttrModsInput({ value, onChange }) {
  const mods = value && typeof value === "object" ? value : {};
  const set = (attr, v) => {
    const n = { ...mods };
    if (v === 0 || v === "" || v === null) delete n[attr];
    else n[attr] = Number(v);
    onChange(Object.keys(n).length ? n : null);
  };
  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 6 }}>
      {ATTRS.map((a) => (
        <label key={a} style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <span style={{ minWidth: 36, fontSize: 12, fontWeight: 600, color: "var(--accent)" }}>{a}</span>
          <input
            type="number"
            value={mods[a] ?? ""}
            onChange={(e) => set(a, e.target.value)}
            placeholder="0"
            style={{ padding: "4px 6px" }}
          />
        </label>
      ))}
    </div>
  );
}

// ─ Ingredient parts [{part, effect, power}] ─
function IngredientPartsInput({ value, onChange }) {
  const parts = Array.isArray(value) ? value : [];
  const upd = (i, key, v) => {
    const n = [...parts];
    n[i] = { ...n[i], [key]: v };
    onChange(n);
  };
  const rm  = (i) => onChange(parts.filter((_, j) => j !== i));
  const add = () => onChange([...parts, { part: "", effect: "", power: "" }]);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
      {parts.map((p, i) => (
        <div key={i} style={{ display: "grid", gridTemplateColumns: "1fr 1fr 80px auto", gap: 6 }}>
          <input value={p.part || ""} onChange={(e) => upd(i, "part", e.target.value)} placeholder="Part (List, Koren...)" />
          <input value={p.effect || ""} onChange={(e) => upd(i, "effect", e.target.value)} placeholder="Effect" />
          <input value={p.power || ""} onChange={(e) => upd(i, "power", e.target.value)} placeholder="I-V" />
          <button className="btn-sm btn-danger" onClick={() => rm(i)} title="Remove">×</button>
        </div>
      ))}
      <button className="btn-sm" onClick={add}>+ Add Part</button>
    </div>
  );
}

// ─ Bundle layers [{type: "ambient"|"music"|"sound", refId?, name, volume, randomInterval?}] ─
function BundleLayersInput({ value, onChange }) {
  const layers = Array.isArray(value) ? value : [];
  const upd = (i, key, v) => {
    const n = [...layers];
    n[i] = { ...n[i], [key]: v };
    onChange(n);
  };
  const rm  = (i) => onChange(layers.filter((_, j) => j !== i));
  const add = () => onChange([...layers, { type: "ambient", name: "", volume: 80, randomInterval: null }]);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      {layers.length === 0 && (
        <p style={{ color: "var(--text-mut)", fontSize: 13, fontStyle: "italic" }}>
          No layers. Add ambient tracks, music, or random sounds to build the environment.
        </p>
      )}
      {layers.map((l, i) => (
        <div key={i} style={{
          padding: 10, background: "var(--bg)", border: "1px solid var(--border)",
          borderRadius: 4, display: "flex", flexDirection: "column", gap: 6,
        }}>
          <div style={{ display: "grid", gridTemplateColumns: "120px 1fr 80px auto", gap: 6 }}>
            <select value={l.type || "ambient"} onChange={(e) => upd(i, "type", e.target.value)}>
              <option value="ambient">Ambient</option>
              <option value="music">Music</option>
              <option value="sound">Sound</option>
            </select>
            <input value={l.name || ""} onChange={(e) => upd(i, "name", e.target.value)} placeholder="Name or ref..." />
            <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
              <input
                type="range" min="0" max="100"
                value={l.volume ?? 80}
                onChange={(e) => upd(i, "volume", Number(e.target.value))}
                style={{ flex: 1, cursor: "pointer" }}
              />
              <span style={{ fontSize: 11, fontFamily: "var(--font-mono, monospace)", color: "var(--text-dim)", minWidth: 28 }}>
                {l.volume ?? 80}%
              </span>
            </div>
            <button className="btn-sm btn-danger" onClick={() => rm(i)} title="Remove layer">×</button>
          </div>
          {l.type === "sound" && (
            <div style={{ display: "flex", alignItems: "center", gap: 8, paddingLeft: 4 }}>
              <span style={{ fontSize: 12, color: "var(--text-dim)" }}>Random interval (s):</span>
              <input
                type="number" min="1"
                value={l.randomInterval ?? ""}
                onChange={(e) => upd(i, "randomInterval", e.target.value === "" ? null : Number(e.target.value))}
                placeholder="e.g. 30"
                style={{ width: 80, padding: "3px 6px" }}
              />
              <span style={{ fontSize: 11, color: "var(--text-mut)", fontStyle: "italic" }}>
                Plays at random intervals
              </span>
            </div>
          )}
        </div>
      ))}
      <button className="btn-sm" onClick={add}>+ Add Layer</button>
    </div>
  );
}

// ─ Longtext with annotation preview ─
function LongtextWithPreview({ value, onChange, placeholder, campaignAge }) {
  const [preview, setPreview] = useState(false);

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
        <button
          type="button"
          onClick={() => setPreview(!preview)}
          style={{
            background: "transparent", border: "none", color: "var(--accent)",
            fontSize: 11, cursor: "pointer", padding: 0, fontFamily: "inherit",
            textDecoration: "underline", textUnderlineOffset: 2,
          }}
        >
          {preview ? "Edit" : "Preview"}
        </button>
        {!preview && (
          <span style={{ fontSize: 10, color: "var(--text-mut)", fontStyle: "italic" }}>
            @age:N&#123;...&#125; @dm&#123;...&#125; @link:table:id&#123;label&#125; @danger&#123;...&#125; @quote:Author&#123;...&#125;
          </span>
        )}
      </div>
      {preview ? (
        <div style={{
          minHeight: 80, padding: 10, background: "var(--bg)",
          border: "1px solid var(--border)", borderRadius: 4,
        }}>
          <AnnotatedText text={value || ""} campaignAge={campaignAge} isDM={true} />
        </div>
      ) : (
        <textarea
          value={value || ""}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          rows={4}
        />
      )}
    </div>
  );
}
