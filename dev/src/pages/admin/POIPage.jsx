import { useState } from "react";
import { POI_TABLES } from "./refs/schema";
import RefTablePage from "./refs/RefTablePage";
import styles from "./refs/RefIndex.module.css";

export default function POIPage({ activeCampaign }) {
  const [selected, setSelected] = useState(null);

  if (selected) {
    return (
      <RefTablePage
        tableKey={selected}
        scope="poi"
        onBack={() => setSelected(null)}
        activeCampaign={activeCampaign}
      />
    );
  }

  return (
    <div className={styles.wrap}>
      <div className={styles.intro}>
        <p className="muted">
          Places of interest. Each entry has an <strong>era of origin</strong> that determines its
          current state: known, forgotten, or lost to history.
          {activeCampaign && <> Viewing for <strong>Age {activeCampaign.currentAge ?? 1}</strong>.</>}
        </p>
      </div>

      <div className={styles.grid}>
        {Object.entries(POI_TABLES).map(([key, def]) => (
          <button
            key={key}
            className={styles.card}
            onClick={() => setSelected(key)}
          >
            <span className={styles.cardIcon}>{def.icon}</span>
            <div className={styles.cardBody}>
              <span className={styles.cardTitle}>
                {def.label}
                <span className={styles.ageTag}>age</span>
              </span>
              <span className={styles.cardDesc}>{def.description}</span>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
