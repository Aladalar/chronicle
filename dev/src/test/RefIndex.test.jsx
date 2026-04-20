import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import RefIndex from "@/pages/admin/refs/RefIndex";
import { GROUPS, REF_TABLES } from "@/pages/admin/refs/schema";

beforeEach(() => {
  global.fetch = vi.fn(() =>
    Promise.resolve({ ok: true, status: 200, json: () => Promise.resolve([]) })
  );
});

describe("RefIndex (Shared DBs)", () => {
  it("renders without crashing", () => {
    render(<RefIndex activeCampaign={null} />);
    expect(screen.getByText("Foundation")).toBeTruthy();
  });

  it("shows all group headers", () => {
    render(<RefIndex activeCampaign={null} />);
    Object.values(GROUPS).forEach((g) => {
      expect(screen.getByText(g.label)).toBeTruthy();
    });
  });

  it("shows table cards for non-dedicated tables", () => {
    render(<RefIndex activeCampaign={null} />);
    Object.values(REF_TABLES).forEach((t) => {
      if (!t.hasDedicatedPage) {
        const matches = screen.getAllByText(t.label);
        expect(matches.length).toBeGreaterThanOrEqual(1);
      }
    });
  });

  it("shows Types card", () => {
    render(<RefIndex activeCampaign={null} />);
    const matches = screen.getAllByText("Types");
    expect(matches.length).toBeGreaterThanOrEqual(1);
  });

  it("shows age tags on age-enabled tables", () => {
    render(<RefIndex activeCampaign={null} />);
    const ageTags = screen.getAllByText("age");
    expect(ageTags.length).toBeGreaterThan(5);
  });

  it("shows campaign age info when campaign is selected", () => {
    render(<RefIndex activeCampaign={{ id: "c1", name: "Test", currentAge: 3 }} />);
    expect(screen.getByText(/Age 3/)).toBeTruthy();
  });

  it("drills into a non-types table when card is clicked", async () => {
    render(<RefIndex activeCampaign={null} />);
    // Click "Ranks" — unique name, won't conflict
    fireEvent.click(screen.getByText("Ranks"));
    await waitFor(() => {
      // Breadcrumb back button should say "Shared DBs"
      const backBtns = screen.getAllByText("Shared DBs");
      expect(backBtns.length).toBeGreaterThanOrEqual(1);
    });
  });

  it("drills into Types dedicated page", async () => {
    render(<RefIndex activeCampaign={null} />);
    // Types appears in the card grid
    const typesCards = screen.getAllByText("Types");
    // Click the first one (the card, not the header)
    fireEvent.click(typesCards[0]);
    await waitFor(() => {
      // TypesPage has "Used For" section
      const matches = screen.getAllByText(/designation/i);
      expect(matches.length).toBeGreaterThanOrEqual(1);
    });
  });

  it("returns from drill-down when back is clicked", async () => {
    render(<RefIndex activeCampaign={null} />);
    fireEvent.click(screen.getByText("Ranks"));
    await waitFor(() => {
      const backBtns = screen.getAllByText("Shared DBs");
      expect(backBtns.length).toBeGreaterThanOrEqual(1);
    });
    // Click the back button (inside breadcrumb)
    const backBtn = screen.getAllByText("Shared DBs").find(
      (el) => el.closest("button")
    );
    if (backBtn) fireEvent.click(backBtn.closest("button"));
    await waitFor(() => {
      expect(screen.getByText("Foundation")).toBeTruthy();
    });
  });
});
