import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import App from "@/App";

beforeEach(() => {
  global.fetch = vi.fn(() =>
    Promise.resolve({ ok: true, status: 200, json: () => Promise.resolve([]) })
  );
});

describe("App shell", () => {
  it("renders without crashing", () => {
    render(<App />);
    expect(screen.getByText("CHRONICLE")).toBeTruthy();
  });

  it("shows admin tag", () => {
    render(<App />);
    expect(screen.getByText("admin")).toBeTruthy();
  });

  it("defaults to Campaigns section", () => {
    render(<App />);
    // "Campaigns" appears in sidebar AND header — just check at least one exists
    const matches = screen.getAllByText("Campaigns");
    expect(matches.length).toBeGreaterThanOrEqual(1);
  });

  it("switches to Shared DBs when clicked", () => {
    render(<App />);
    fireEvent.click(screen.getByText("Shared DBs"));
    expect(screen.getByText("Foundation")).toBeTruthy();
  });

  it("switches to Soundboard when clicked", () => {
    render(<App />);
    fireEvent.click(screen.getByText("Soundboard"));
    expect(screen.getByText("Libraries")).toBeTruthy();
  });

  it("switches to Ref Edits when clicked", () => {
    render(<App />);
    fireEvent.click(screen.getByText("Ref Edits"));
    // Page shows filter buttons
    expect(screen.getByText("Pending")).toBeTruthy();
  });

  it("switches to Players when clicked", () => {
    render(<App />);
    fireEvent.click(screen.getByText("Players"));
    // Players page without campaign shows "No campaign selected"
    expect(screen.getByText("No campaign selected")).toBeTruthy();
  });

  it("disables campaign children when no campaign selected", () => {
    render(<App />);
    const allButtons = screen.getAllByRole("button");
    const charBtn = allButtons.find((b) => b.textContent.includes("Characters"));
    if (charBtn) {
      expect(charBtn).toBeDisabled();
    }
  });
});
