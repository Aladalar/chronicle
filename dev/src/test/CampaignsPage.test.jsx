import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import CampaignsPage from "@/pages/admin/CampaignsPage";

beforeEach(() => {
  global.fetch = vi.fn((url) => {
    if (url.includes("/campaigns") && !url.includes("/members")) {
      return Promise.resolve({
        ok: true, status: 200,
        json: () => Promise.resolve([
          { id: "c1", name: "Test Campaign", description: "Desc", currentAge: 2 },
        ]),
      });
    }
    return Promise.resolve({ ok: true, status: 200, json: () => Promise.resolve([]) });
  });
});

describe("CampaignsPage", () => {
  it("renders without crashing", async () => {
    render(<CampaignsPage activeCampaign={null} onSelect={() => {}} />);
    await waitFor(() => {
      expect(screen.getByText("New Campaign")).toBeTruthy();
    });
  });

  it("shows campaign cards after load", async () => {
    render(<CampaignsPage activeCampaign={null} onSelect={() => {}} />);
    await waitFor(() => {
      expect(screen.getByText("Test Campaign")).toBeTruthy();
    });
  });

  it("opens create modal on button click", async () => {
    render(<CampaignsPage activeCampaign={null} onSelect={() => {}} />);
    await waitFor(() => screen.getByText("New Campaign"));
    // Find the + New Campaign button (not the card title)
    const buttons = screen.getAllByRole("button");
    const newBtn = buttons.find((b) => b.textContent.includes("New Campaign"));
    fireEvent.click(newBtn);
    await waitFor(() => {
      expect(screen.getByPlaceholderText("The Shattered Kingdom")).toBeTruthy();
    });
  });

  it("shows active badge when campaign is selected", async () => {
    const active = { id: "c1", name: "Test Campaign" };
    render(<CampaignsPage activeCampaign={active} onSelect={() => {}} />);
    await waitFor(() => {
      expect(screen.getByText("Active")).toBeTruthy();
    });
  });

  it("shows Select button for inactive campaigns", async () => {
    render(<CampaignsPage activeCampaign={null} onSelect={() => {}} />);
    await waitFor(() => {
      expect(screen.getByText("Select")).toBeTruthy();
    });
  });

  it("calls onSelect when Select is clicked", async () => {
    const onSelect = vi.fn();
    render(<CampaignsPage activeCampaign={null} onSelect={onSelect} />);
    await waitFor(() => screen.getByText("Select"));
    fireEvent.click(screen.getByText("Select"));
    expect(onSelect).toHaveBeenCalledWith(expect.objectContaining({ id: "c1" }));
  });
});
