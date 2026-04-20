import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import RefTablePage from "@/pages/admin/refs/RefTablePage";

beforeEach(() => {
  global.fetch = vi.fn((url) => {
    if (url.includes("/refs/abilities")) {
      return Promise.resolve({
        ok: true, status: 200,
        json: () => Promise.resolve([
          { id: "a1", name: "Smith", typeId: "t1", attribute: "STR", description: "Forge stuff" },
          { id: "a2", name: "Archery", typeId: "t1", attribute: "AGI", description: "" },
        ]),
      });
    }
    if (url.includes("/refs/types")) {
      return Promise.resolve({
        ok: true, status: 200,
        json: () => Promise.resolve([
          { id: "t1", name: "Fight", icon: "X", color: "#c04040", designations: ["ability"] },
        ]),
      });
    }
    return Promise.resolve({ ok: true, status: 200, json: () => Promise.resolve([]) });
  });
});

describe("RefTablePage", () => {
  const defaultProps = {
    tableKey: "abilities",
    onBack: vi.fn(),
    activeCampaign: null,
  };

  it("renders heading and breadcrumb", async () => {
    render(<RefTablePage {...defaultProps} />);
    await waitFor(() => {
      // "Abilities" appears in breadcrumb + heading — just check it's there
      const matches = screen.getAllByText("Abilities");
      expect(matches.length).toBeGreaterThanOrEqual(1);
    });
  });

  it("shows breadcrumb with back button", async () => {
    render(<RefTablePage {...defaultProps} />);
    await waitFor(() => {
      const backBtns = screen.getAllByText("Shared DBs");
      expect(backBtns.length).toBeGreaterThanOrEqual(1);
    });
  });

  it("calls onBack when breadcrumb is clicked", async () => {
    const onBack = vi.fn();
    render(<RefTablePage {...defaultProps} onBack={onBack} />);
    await waitFor(() => screen.getAllByText("Shared DBs"));
    const backBtn = screen.getAllByText("Shared DBs").find((el) => el.closest("button"));
    if (backBtn) fireEvent.click(backBtn.closest("button"));
    expect(onBack).toHaveBeenCalled();
  });

  it("shows table rows after load", async () => {
    render(<RefTablePage {...defaultProps} />);
    await waitFor(() => {
      expect(screen.getByText("Smith")).toBeTruthy();
      expect(screen.getByText("Archery")).toBeTruthy();
    });
  });

  it("shows search input", async () => {
    render(<RefTablePage {...defaultProps} />);
    await waitFor(() => {
      expect(screen.getByPlaceholderText("Search...")).toBeTruthy();
    });
  });

  it("filters rows by search", async () => {
    render(<RefTablePage {...defaultProps} />);
    await waitFor(() => screen.getByText("Smith"));
    fireEvent.change(screen.getByPlaceholderText("Search..."), { target: { value: "arch" } });
    expect(screen.queryByText("Smith")).toBeNull();
    expect(screen.getByText("Archery")).toBeTruthy();
  });

  it("shows create button", async () => {
    render(<RefTablePage {...defaultProps} />);
    await waitFor(() => {
      const btns = screen.getAllByRole("button");
      const newBtn = btns.find((b) => b.textContent.includes("New"));
      expect(newBtn).toBeTruthy();
    });
  });

  it("opens modal on create click", async () => {
    render(<RefTablePage {...defaultProps} />);
    await waitFor(() => screen.getByText("Smith"));
    const btns = screen.getAllByRole("button");
    const newBtn = btns.find((b) => b.textContent.includes("New"));
    fireEvent.click(newBtn);
    await waitFor(() => {
      expect(screen.getByText("Cancel")).toBeTruthy();
    });
  });

  it("shows empty state when table has no rows", async () => {
    global.fetch = vi.fn(() =>
      Promise.resolve({ ok: true, status: 200, json: () => Promise.resolve([]) })
    );
    render(<RefTablePage tableKey="beasts" onBack={vi.fn()} activeCampaign={null} />);
    await waitFor(() => {
      expect(screen.getByText(/No beasts yet/i)).toBeTruthy();
    });
  });

  it("resolves ref column values to type names", async () => {
    render(<RefTablePage {...defaultProps} />);
    await waitFor(() => {
      // "Fight" appears in the resolved type column — may appear multiple times
      const matches = screen.getAllByText("Fight");
      expect(matches.length).toBeGreaterThanOrEqual(1);
    });
  });

  it("shows age state filter when campaign selected and table has age", async () => {
    global.fetch = vi.fn(() =>
      Promise.resolve({ ok: true, status: 200, json: () => Promise.resolve([]) })
    );
    render(
      <RefTablePage tableKey="races" onBack={vi.fn()} activeCampaign={{ id: "c1", currentAge: 2 }} />
    );
    await waitFor(() => {
      // "All" filter pill
      const allBtns = screen.getAllByText("All");
      expect(allBtns.length).toBeGreaterThanOrEqual(1);
    });
  });
});
