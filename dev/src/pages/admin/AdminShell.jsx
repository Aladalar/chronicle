import { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faChevronRight, faBars as faMenu } from "@fortawesome/free-solid-svg-icons";
import ThemeSwitcher from "@/components/ThemeSwitcher";
import { NAV_ICONS, BRAND_ICON } from "@/components/icons";
import styles from "./AdminShell.module.css";

const NAV = [
  {
    id: "campaigns",
    label: "Campaigns",
    children: [
      { id: "characters", label: "Characters" },
      { id: "content",    label: "Lore & Journal" },
    ],
  },
  { id: "refs",      label: "Shared DBs" },
  { id: "sounds",    label: "Soundboard" },
  { id: "ref-edits", label: "Ref Edits" },
  { id: "players",   label: "Players" },
];

const SECTION_LOOKUP = (() => {
  const map = {};
  for (const n of NAV) {
    map[n.id] = { ...n, parent: null };
    (n.children || []).forEach((c) => {
      map[c.id] = { ...c, parent: n.id };
    });
  }
  return map;
})();

export default function AdminShell({ children, section, onSection, campaignName, campaignSelected }) {
  const [navOpen, setNavOpen] = useState(true);
  const [expanded, setExpanded] = useState({ campaigns: true });

  const toggleExpand = (id) => setExpanded((e) => ({ ...e, [id]: !e[id] }));

  const current = SECTION_LOOKUP[section] || {};

  return (
    <div className={styles.shell}>
      <aside className={styles.sidebar} data-open={navOpen}>
        <div className={styles.brand}>
          <FontAwesomeIcon icon={BRAND_ICON} className={styles.brandMark} />
          <span className={styles.brandText}>CHRONICLE</span>
          <span className={styles.brandTag}>admin</span>
        </div>

        <nav className={styles.nav}>
          {NAV.map((item) => (
            <div key={item.id}>
              <NavRow
                item={item}
                section={section}
                onSection={onSection}
                expanded={expanded[item.id]}
                onToggleExpand={() => toggleExpand(item.id)}
                hasChildren={!!item.children}
              />
              {item.children && expanded[item.id] && (
                <div className={styles.navChildren}>
                  {item.children.map((child) => (
                    <NavRow
                      key={child.id}
                      item={child}
                      section={section}
                      onSection={onSection}
                      nested
                      disabled={!campaignSelected}
                    />
                  ))}
                </div>
              )}
            </div>
          ))}
        </nav>

        <div className={styles.sidebarFoot}>
          <ThemeSwitcher />
        </div>
      </aside>

      <div className={styles.main}>
        <header className={styles.header}>
          <button
            className={`btn-ghost ${styles.menuBtn}`}
            onClick={() => setNavOpen(!navOpen)}
            aria-label="Toggle navigation"
          >
            <FontAwesomeIcon icon={faMenu} />
          </button>
          <h2 className={styles.headerTitle}>{current.label || "Admin"}</h2>
          <div className={styles.headerSpace} />
          {campaignName && (
            <div className={styles.campaignBadge}>
              <span className={styles.campaignLabel}>Campaign</span>
              <span className={styles.campaignName}>{campaignName}</span>
            </div>
          )}
        </header>

        <main className={styles.content}>{children}</main>
      </div>
    </div>
  );
}

function NavRow({ item, section, onSection, nested, disabled, expanded, onToggleExpand, hasChildren }) {
  const active = section === item.id;
  const icon = NAV_ICONS[item.id];

  return (
    <button
      className={styles.navItem}
      data-active={active}
      data-nested={nested}
      data-disabled={disabled}
      onClick={() => !disabled && onSection(item.id)}
      disabled={disabled}
      title={disabled ? "Select a campaign first" : undefined}
    >
      {icon && <FontAwesomeIcon icon={icon} className={styles.navIcon} fixedWidth />}
      <span className={styles.navLabel}>{item.label}</span>
      {hasChildren && (
        <span
          className={styles.expandToggle}
          data-expanded={expanded}
          onClick={(e) => { e.stopPropagation(); onToggleExpand(); }}
          role="button"
          aria-label={expanded ? "Collapse" : "Expand"}
        >
          <FontAwesomeIcon icon={faChevronRight} />
        </span>
      )}
    </button>
  );
}
