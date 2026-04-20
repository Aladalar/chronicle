import { useEffect, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { THEME_ICONS } from "@/components/icons";
import styles from "./ThemeSwitcher.module.css";

const THEMES = [
  { id: "dark",  label: "Dark" },
  { id: "light", label: "Light" },
  { id: "hc",    label: "HC" },
];

export default function ThemeSwitcher() {
  const [theme, setTheme] = useState(() =>
    localStorage.getItem("chronicle_theme") || "dark"
  );

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("chronicle_theme", theme);
  }, [theme]);

  return (
    <div className={styles.group} role="radiogroup" aria-label="Theme">
      {THEMES.map((t) => (
        <button
          key={t.id}
          className={styles.btn}
          data-active={theme === t.id}
          onClick={() => setTheme(t.id)}
          title={t.label}
          aria-label={t.label}
        >
          <FontAwesomeIcon icon={THEME_ICONS[t.id]} className={styles.icon} />
          <span className={styles.label}>{t.label}</span>
        </button>
      ))}
    </div>
  );
}
