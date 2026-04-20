import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import SoundIndex from "@/pages/admin/sounds/SoundIndex";

beforeEach(() => {
  global.fetch = vi.fn(() =>
    Promise.resolve({ ok: true, status: 200, json: () => Promise.resolve([]) })
  );
});

describe("SoundIndex", () => {
  it("renders without crashing", () => {
    render(<SoundIndex />);
    expect(screen.getByText("Libraries")).toBeTruthy();
  });

  it("shows all library categories", () => {
    render(<SoundIndex />);
    expect(screen.getByText("Sound Effects")).toBeTruthy();
    expect(screen.getByText("Music")).toBeTruthy();
    expect(screen.getByText("Ambient")).toBeTruthy();
  });

  it("shows Scene Presets card", () => {
    render(<SoundIndex />);
    expect(screen.getByText("Scene Presets")).toBeTruthy();
  });

  it("drills into Sound Effects library", async () => {
    render(<SoundIndex />);
    fireEvent.click(screen.getByText("Sound Effects"));
    await waitFor(() => {
      expect(screen.getByText("Soundboard")).toBeTruthy(); // breadcrumb
    });
  });

  it("drills into Scene Presets", async () => {
    render(<SoundIndex />);
    fireEvent.click(screen.getByText("Scene Presets"));
    await waitFor(() => {
      expect(screen.getByText("Soundboard")).toBeTruthy();
    });
  });

  it("returns from drill-down", async () => {
    render(<SoundIndex />);
    fireEvent.click(screen.getByText("Sound Effects"));
    await waitFor(() => screen.getByText("Soundboard"));
    fireEvent.click(screen.getByText("Soundboard"));
    await waitFor(() => {
      expect(screen.getByText("Libraries")).toBeTruthy();
    });
  });

  it("does not show mixer when no preset is active", () => {
    render(<SoundIndex />);
    expect(screen.queryByText("Stop All")).toBeNull();
  });
});
