import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import Modal from "@/components/Modal";
import ConfirmDialog from "@/components/ConfirmDialog";
import ThemeSwitcher from "@/components/ThemeSwitcher";

describe("Modal", () => {
  it("renders nothing when closed", () => {
    const { container } = render(<Modal open={false} title="Test" onClose={() => {}} />);
    expect(container.innerHTML).toBe("");
  });

  it("renders content when open", () => {
    render(<Modal open={true} title="My Title" onClose={() => {}}><p>Body</p></Modal>);
    expect(screen.getByText("My Title")).toBeTruthy();
    expect(screen.getByText("Body")).toBeTruthy();
  });

  it("calls onClose when X button clicked", () => {
    const onClose = vi.fn();
    render(<Modal open={true} title="Test" onClose={onClose}><p>B</p></Modal>);
    fireEvent.click(screen.getByLabelText("Close"));
    expect(onClose).toHaveBeenCalled();
  });
});

describe("ConfirmDialog", () => {
  it("renders nothing when closed", () => {
    const { container } = render(
      <ConfirmDialog open={false} title="Del" message="Sure?" onConfirm={() => {}} onCancel={() => {}} />
    );
    expect(container.innerHTML).toBe("");
  });

  it("shows message when open", () => {
    render(
      <ConfirmDialog open={true} title="Delete" message="Are you sure?" onConfirm={() => {}} onCancel={() => {}} />
    );
    expect(screen.getByText("Are you sure?")).toBeTruthy();
  });

  it("calls onConfirm", () => {
    const onConfirm = vi.fn();
    render(
      <ConfirmDialog open={true} title="Del" message="Sure?" confirmLabel="Yes" onConfirm={onConfirm} onCancel={() => {}} />
    );
    fireEvent.click(screen.getByText("Yes"));
    expect(onConfirm).toHaveBeenCalled();
  });

  it("calls onCancel", () => {
    const onCancel = vi.fn();
    render(
      <ConfirmDialog open={true} title="Del" message="Sure?" onConfirm={() => {}} onCancel={onCancel} />
    );
    fireEvent.click(screen.getByText("Cancel"));
    expect(onCancel).toHaveBeenCalled();
  });
});

describe("ThemeSwitcher", () => {
  it("renders three theme buttons", () => {
    render(<ThemeSwitcher />);
    expect(screen.getByText("Dark")).toBeTruthy();
    expect(screen.getByText("Light")).toBeTruthy();
    expect(screen.getByText("HC")).toBeTruthy();
  });

  it("sets data-theme on html when clicked", () => {
    render(<ThemeSwitcher />);
    fireEvent.click(screen.getByText("Light"));
    expect(document.documentElement.getAttribute("data-theme")).toBe("light");
    fireEvent.click(screen.getByText("Dark"));
  });
});
