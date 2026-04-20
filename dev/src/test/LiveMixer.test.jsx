import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import LiveMixer from "@/pages/admin/sounds/LiveMixer";

const TEST_PRESET = {
  name: "Dungeon",
  musicTrack: { trackName: "dark_halls.mp3", volume: 70, loop: "yes", loopDelay: 0, fadeIn: 2, fadeOut: 2 },
  ambientLayers: [
    { trackName: "dripping.mp3", volume: 50, loop: "yes", loopDelay: 0, fadeIn: 1, fadeOut: 1 },
    { trackName: "wind_howl.mp3", volume: 30, loop: "yes", loopDelay: 5, fadeIn: 0, fadeOut: 0 },
  ],
  soundButtons: [
    { trackName: "door_creak.mp3", volume: 80, loop: "no", loopDelay: 0, fadeIn: 0, fadeOut: 0 },
    { trackName: "chains.mp3", volume: 60, loop: "yes", loopDelay: 30, fadeIn: 0, fadeOut: 0 },
  ],
};

describe("LiveMixer", () => {
  it("renders nothing when no preset active", () => {
    const { container } = render(<LiveMixer activePreset={null} onDeactivate={() => {}} />);
    expect(container.innerHTML).toBe("");
  });

  it("renders preset name when active", () => {
    render(<LiveMixer activePreset={TEST_PRESET} onDeactivate={() => {}} />);
    expect(screen.getByText("Dungeon")).toBeTruthy();
  });

  it("shows Stop All button", () => {
    render(<LiveMixer activePreset={TEST_PRESET} onDeactivate={() => {}} />);
    expect(screen.getByText("Stop All")).toBeTruthy();
  });

  it("calls onDeactivate when Stop All clicked", () => {
    const onDeactivate = vi.fn();
    render(<LiveMixer activePreset={TEST_PRESET} onDeactivate={onDeactivate} />);
    fireEvent.click(screen.getByText("Stop All"));
    expect(onDeactivate).toHaveBeenCalled();
  });

  it("shows music track name", () => {
    render(<LiveMixer activePreset={TEST_PRESET} onDeactivate={() => {}} />);
    expect(screen.getByText("dark_halls.mp3")).toBeTruthy();
  });

  it("shows ambient layer names", () => {
    render(<LiveMixer activePreset={TEST_PRESET} onDeactivate={() => {}} />);
    expect(screen.getByText("dripping.mp3")).toBeTruthy();
    expect(screen.getByText("wind_howl.mp3")).toBeTruthy();
  });

  it("shows sound button names", () => {
    render(<LiveMixer activePreset={TEST_PRESET} onDeactivate={() => {}} />);
    expect(screen.getByText("door_creak.mp3")).toBeTruthy();
    expect(screen.getByText("chains.mp3")).toBeTruthy();
  });

  it("shows loop delay badge on ambient with delay", () => {
    render(<LiveMixer activePreset={TEST_PRESET} onDeactivate={() => {}} />);
    expect(screen.getByText("⟳ 5s")).toBeTruthy();
  });

  it("shows loop indicator on looping sound buttons", () => {
    render(<LiveMixer activePreset={TEST_PRESET} onDeactivate={() => {}} />);
    // chains.mp3 has loop=yes
    const loopDots = screen.getAllByText("⟳");
    expect(loopDots.length).toBeGreaterThan(0);
  });

  it("shows master volume slider", () => {
    const { container } = render(<LiveMixer activePreset={TEST_PRESET} onDeactivate={() => {}} />);
    const sliders = container.querySelectorAll('input[type="range"]');
    expect(sliders.length).toBeGreaterThan(0);
  });
});
