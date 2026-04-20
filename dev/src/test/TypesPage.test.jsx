import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import TypesPage from "@/pages/admin/refs/TypesPage";

beforeEach(() => {
  global.fetch = vi.fn(() =>
    Promise.resolve({
      ok: true, status: 200,
      json: () => Promise.resolve([
        { id: "t1", name: "Fight", icon: "X", color: "#c04040", designations: ["ability"], sortOrder: 1 },
        { id: "t2", name: "Common", icon: "", color: "#808080", designations: ["rarity"], sortOrder: 1 },
        { id: "t3", name: "Mystic", icon: "M", color: "#6060d0", designations: ["arcane", "spell"], sortOrder: 1 },
      ]),
    })
  );
});

describe("TypesPage", () => {
  it("renders heading", async () => {
    render(<TypesPage onBack={vi.fn()} />);
    await waitFor(() => {
      // "Types" appears in breadcrumb + heading
      const matches = screen.getAllByText("Types");
      expect(matches.length).toBeGreaterThanOrEqual(1);
    });
  });

  it("shows All filter pill", async () => {
    render(<TypesPage onBack={vi.fn()} />);
    await waitFor(() => {
      const allBtns = screen.getAllByText("All");
      expect(allBtns.length).toBeGreaterThanOrEqual(1);
    });
  });

  it("shows type names in chips", async () => {
    render(<TypesPage onBack={vi.fn()} />);
    await waitFor(() => {
      expect(screen.getByText("Fight")).toBeTruthy();
      expect(screen.getByText("Common")).toBeTruthy();
    });
  });

  it("shows Mystic which has two designations", async () => {
    render(<TypesPage onBack={vi.fn()} />);
    await waitFor(() => {
      // Mystic appears under both arcane and spell sections
      const matches = screen.getAllByText("Mystic");
      expect(matches.length).toBeGreaterThanOrEqual(2);
    });
  });

  it("shows +1 badge for multi-designation types", async () => {
    render(<TypesPage onBack={vi.fn()} />);
    await waitFor(() => {
      // Mystic has 2 designations, so "+1" badge appears (at least twice since it shows in both sections)
      const badges = screen.getAllByText("+1");
      expect(badges.length).toBeGreaterThanOrEqual(1);
    });
  });

  it("shows designation section headers", async () => {
    render(<TypesPage onBack={vi.fn()} />);
    await waitFor(() => {
      const abilityHeaders = screen.getAllByText("Ability Types");
      expect(abilityHeaders.length).toBeGreaterThanOrEqual(1);
    });
  });

  it("filters when designation pill clicked", async () => {
    render(<TypesPage onBack={vi.fn()} />);
    await waitFor(() => screen.getByText("Fight"));
    // Click Rarity filter — "Rarity Tiers" appears both as filter pill and section header
    const rarityBtns = screen.getAllByText("Rarity Tiers");
    // Find the one that's a button (filter pill)
    const filterBtn = rarityBtns.find((el) => el.closest("button[class*='chip']") || el.closest("button"));
    if (filterBtn) fireEvent.click(filterBtn.closest("button"));
    await waitFor(() => {
      // Fight should disappear (it's ability, not rarity)
      expect(screen.queryByText("Fight")).toBeNull();
      // Common should remain
      expect(screen.getByText("Common")).toBeTruthy();
    });
  });

  it("opens new type modal", async () => {
    render(<TypesPage onBack={vi.fn()} />);
    await waitFor(() => screen.getByText("+ New Type"));
    fireEvent.click(screen.getByText("+ New Type"));
    await waitFor(() => {
      expect(screen.getByText("Name *")).toBeTruthy();
    });
  });

  it("calls onBack when breadcrumb clicked", async () => {
    const onBack = vi.fn();
    render(<TypesPage onBack={onBack} />);
    await waitFor(() => {
      const backBtns = screen.getAllByText("Shared DBs");
      expect(backBtns.length).toBeGreaterThanOrEqual(1);
    });
    const backBtn = screen.getAllByText("Shared DBs").find((el) => el.closest("button"));
    if (backBtn) fireEvent.click(backBtn.closest("button"));
    expect(onBack).toHaveBeenCalled();
  });
});
