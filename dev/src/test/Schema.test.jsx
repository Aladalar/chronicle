import { describe, it, expect } from "vitest";
import { REF_TABLES, GROUPS, tablesByGroup } from "@/pages/admin/refs/schema";
import { computeAgeState, ageInfo, AGE_STATES } from "@/pages/admin/refs/age";
import { TABLE_ICONS, GROUP_ICONS, NAV_ICONS, SOUND_ICONS } from "@/components/icons";

describe("Schema integrity", () => {
  const tables = Object.entries(REF_TABLES);

  it("every table belongs to a valid group", () => {
    tables.forEach(([key, def]) => {
      expect(GROUPS).toHaveProperty(def.group);
    });
  });

  it("every table has a label", () => {
    tables.forEach(([key, def]) => {
      expect(def.label).toBeTruthy();
    });
  });

  it("every non-dedicated table has fields array", () => {
    tables.forEach(([key, def]) => {
      if (!def.hasDedicatedPage) {
        expect(Array.isArray(def.fields)).toBe(true);
        expect(def.fields.length).toBeGreaterThan(0);
      }
    });
  });

  it("every non-dedicated table has listColumns", () => {
    tables.forEach(([key, def]) => {
      if (!def.hasDedicatedPage) {
        expect(Array.isArray(def.listColumns)).toBe(true);
        expect(def.listColumns.length).toBeGreaterThan(0);
      }
    });
  });

  it("listColumns reference fields that exist", () => {
    tables.forEach(([key, def]) => {
      if (def.hasDedicatedPage || !def.listColumns) return;
      const fieldKeys = def.fields.map((f) => f.key);
      def.listColumns.forEach((col) => {
        expect(fieldKeys).toContain(col);
      });
    });
  });

  it("every field has key and label", () => {
    tables.forEach(([key, def]) => {
      (def.fields || []).forEach((f) => {
        expect(f.key).toBeTruthy();
        expect(f.label).toBeTruthy();
      });
    });
  });

  it("every field has a valid type", () => {
    const validTypes = ["text", "longtext", "number", "select", "tags", "ref", "color", "attrmods", "ingredient-parts", "bundle-layers"];
    tables.forEach(([key, def]) => {
      (def.fields || []).forEach((f) => {
        expect(validTypes).toContain(f.type);
      });
    });
  });

  it("ref fields have refTable defined", () => {
    tables.forEach(([key, def]) => {
      (def.fields || []).filter((f) => f.type === "ref").forEach((f) => {
        expect(f.refTable).toBeTruthy();
      });
    });
  });

  it("select fields have options array", () => {
    tables.forEach(([key, def]) => {
      (def.fields || []).filter((f) => f.type === "select").forEach((f) => {
        expect(Array.isArray(f.options)).toBe(true);
        expect(f.options.length).toBeGreaterThan(0);
      });
    });
  });

  it("age-enabled tables have age field", () => {
    tables.forEach(([key, def]) => {
      if (def.hasAge) {
        const hasAgeField = (def.fields || []).some((f) => f.key === "age");
        expect(hasAgeField).toBe(true);
      }
    });
  });

  it("tablesByGroup returns all tables", () => {
    const grouped = tablesByGroup();
    let totalTables = 0;
    Object.values(grouped).forEach((arr) => { totalTables += arr.length; });
    expect(totalTables).toBe(tables.length);
  });
});

describe("Icon registry", () => {
  it("every ref table has an icon", () => {
    Object.keys(REF_TABLES).forEach((key) => {
      if (!REF_TABLES[key].hasDedicatedPage) {
        // dedicated page tables handle their own icon
      }
      expect(TABLE_ICONS[key]).toBeTruthy();
    });
  });

  it("every group has an icon", () => {
    Object.keys(GROUPS).forEach((key) => {
      expect(GROUP_ICONS[key]).toBeTruthy();
    });
  });

  it("all nav icons are defined", () => {
    ["campaigns", "characters", "content", "refs", "ref-edits", "players", "sounds"].forEach((id) => {
      expect(NAV_ICONS[id]).toBeTruthy();
    });
  });

  it("all sound icons are defined", () => {
    ["sounds", "music", "ambient", "bundles"].forEach((id) => {
      expect(SOUND_ICONS[id]).toBeTruthy();
    });
  });
});

describe("Age state computation", () => {
  it("returns undiscovered when entry is from future age", () => {
    expect(computeAgeState(1, 3)).toBe("undiscovered");
    expect(computeAgeState(0, 2)).toBe("undiscovered");
  });

  it("returns known for current and previous age", () => {
    expect(computeAgeState(3, 3)).toBe("known");
    expect(computeAgeState(4, 3)).toBe("known");
  });

  it("returns forgotten for 2 ages ahead", () => {
    expect(computeAgeState(5, 3)).toBe("forgotten");
  });

  it("returns lost for 3+ ages ahead", () => {
    expect(computeAgeState(6, 3)).toBe("lost");
    expect(computeAgeState(10, 3)).toBe("lost");
  });

  it("returns unknown when age is null", () => {
    expect(computeAgeState(null, 3)).toBe("unknown");
    expect(computeAgeState(undefined, 3)).toBe("unknown");
  });

  it("returns unknown when campaign age is null", () => {
    expect(computeAgeState(2, null)).toBe("unknown");
  });

  it("ageInfo returns full meta object", () => {
    const info = ageInfo(5, 3);
    expect(info.state).toBe("forgotten");
    expect(info.diff).toBe(2);
    expect(info.meta).toEqual(AGE_STATES.forgotten);
  });

  it("all age states have label and color", () => {
    Object.values(AGE_STATES).forEach((s) => {
      expect(s.label).toBeTruthy();
      expect(s.color).toBeTruthy();
    });
  });
});
