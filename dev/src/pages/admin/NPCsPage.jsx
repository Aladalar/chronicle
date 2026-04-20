import { useState } from "react";
import { NPC_TABLES } from "./refs/schema";
import RefTablePage from "./refs/RefTablePage";
import styles from "./refs/RefIndex.module.css";

export default function NPCsPage({ activeCampaign }) {
  const [selected, setSelected] = useState(null);

  if (selected) {
    return (
      <RefTablePage
        tableKey={selected}
        scope="npc"
        onBack={() => setSelected(null)}
        activeCampaign={activeCampaign}
      />
    );
  }

  return (
    <div className={styles.wrap}>
      <div className={styles.intro}>
        <p className="muted">
          Named figures in the world. Each entry has an <strong>era of origin</strong> —
          gods of lost ages may be forgotten; heroes of the current age are well-known.
          {activeCampaign && <> Viewing for <strong>Age {activeCampaign.currentAge ?? 1}</strong>.</>}
        </p>
      </div>

      <div className={styles.grid}>
        {Object.entries(NPC_TABLES).map(([key, def]) => (
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
