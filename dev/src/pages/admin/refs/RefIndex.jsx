import { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { tablesByGroup, GROUPS } from "./schema";
import RefTablePage from "./RefTablePage";
import TypesPage from "./TypesPage";
import { TABLE_ICONS, GROUP_ICONS } from "@/components/icons";
import styles from "./RefIndex.module.css";

export default function RefIndex({ activeCampaign }) {
  const [selectedTable, setSelectedTable] = useState(null);

  if (selectedTable === "types") {
    return <TypesPage onBack={() => setSelectedTable(null)} />;
  }
  if (selectedTable) {
    return (
      <RefTablePage
        tableKey={selectedTable}
        onBack={() => setSelectedTable(null)}
        activeCampaign={activeCampaign}
      />
    );
  }

  const grouped = tablesByGroup();

  return (
    <div className={styles.wrap}>
      <div className={styles.intro}>
        <p className="muted">
          Globally shared across all campaigns. Entries tagged with an <strong>era of origin</strong>
          {activeCampaign ? (
            <> are displayed with their state for <strong>Age {activeCampaign.currentAge ?? 1}</strong> of {activeCampaign.name}.</>
          ) : (
            <>. Select a campaign to see known/forgotten/lost states.</>
          )}
        </p>
      </div>

      {Object.entries(GROUPS).map(([groupKey, groupMeta]) => (
        <section key={groupKey} className={styles.group}>
          <header className={styles.groupHead}>
            <h3 className={styles.groupTitle}>
              {GROUP_ICONS[groupKey] && (
                <FontAwesomeIcon icon={GROUP_ICONS[groupKey]} className={styles.groupIcon} />
              )}
              {groupMeta.label}
            </h3>
            <p className={styles.groupDesc}>{groupMeta.desc}</p>
          </header>
          <div className={styles.grid}>
            {(grouped[groupKey] || []).map((t) => (
              <button
                key={t.key}
                className={styles.card}
                onClick={() => setSelectedTable(t.key)}
              >
                <span className={styles.cardIcon}>
                  {TABLE_ICONS[t.key] ? (
                    <FontAwesomeIcon icon={TABLE_ICONS[t.key]} />
                  ) : (
                    t.icon
                  )}
                </span>
                <div className={styles.cardBody}>
                  <span className={styles.cardTitle}>
                    {t.label}
                    {t.hasAge && <span className={styles.ageTag}>age</span>}
                  </span>
                  <span className={styles.cardDesc}>{t.description}</span>
                </div>
              </button>
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
