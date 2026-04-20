import { parseAnnotations } from "./parser";
import styles from "./annotations.module.css";

// Props:
//   text: raw description string with annotations
//   campaignAge: number (current campaign age, for @age gating)
//   isDM: boolean (show @dm blocks?)
//   onLinkClick: (table, id) => void (navigate to linked entry)

export default function AnnotatedText({ text, campaignAge, isDM = true, onLinkClick }) {
  if (!text) return null;
  const tokens = parseAnnotations(text);
  return <div className={styles.annotated}>{tokens.map((t, i) => renderToken(t, i, { campaignAge, isDM, onLinkClick }))}</div>;
}

function renderToken(token, key, ctx) {
  switch (token.type) {
    case "text":
      return <TextBlock key={key} value={token.value} />;

    case "age": {
      const visible = ctx.campaignAge != null && ctx.campaignAge >= token.age;
      if (!visible && !ctx.isDM) return null; // players don't see future content
      return (
        <span key={key} className={styles.ageBlock} data-visible={visible} data-dm-preview={!visible && ctx.isDM}>
          <span className={styles.ageBadge}>Age {token.age}+</span>
          <span className={visible ? undefined : styles.dimmed}>
            {token.children.map((c, i) => renderToken(c, i, ctx))}
          </span>
        </span>
      );
    }

    case "dm":
      if (!ctx.isDM) return null;
      return (
        <span key={key} className={styles.dmBlock}>
          <span className={styles.dmBadge}>DM Only</span>
          {token.children.map((c, i) => renderToken(c, i, ctx))}
        </span>
      );

    case "link":
      return (
        <span
          key={key}
          className={styles.link}
          onClick={() => ctx.onLinkClick?.(token.table, token.id)}
          title={`${token.table} → ${token.id}`}
        >
          {token.label || token.id}
        </span>
      );

    case "status": {
      const statusClass = styles[`status_${token.status}`] || styles.statusGeneric;
      return (
        <span key={key} className={`${styles.statusBlock} ${statusClass}`}>
          <span className={styles.statusBadge}>{token.status}</span>
          {token.children.map((c, i) => renderToken(c, i, ctx))}
        </span>
      );
    }

    case "quote":
      return (
        <blockquote key={key} className={styles.quote}>
          <div className={styles.quoteText}>
            {token.children.map((c, i) => renderToken(c, i, ctx))}
          </div>
          <cite className={styles.quoteAuthor}>— {token.author}</cite>
        </blockquote>
      );

    case "danger":
      return (
        <span key={key} className={styles.dangerBlock}>
          <span className={styles.dangerIcon}>⚠</span>
          {token.children.map((c, i) => renderToken(c, i, ctx))}
        </span>
      );

    default:
      return <span key={key}>{JSON.stringify(token)}</span>;
  }
}

// Render plain text with paragraph breaks
function TextBlock({ value }) {
  if (!value) return null;
  // Split by double newline for paragraphs, single newline for line breaks
  const paragraphs = value.split(/\n\n+/);
  if (paragraphs.length <= 1) {
    return <span>{value}</span>;
  }
  return (
    <>
      {paragraphs.map((p, i) => (
        <span key={i}>
          {i > 0 && <br />}
          {p}
        </span>
      ))}
    </>
  );
}
