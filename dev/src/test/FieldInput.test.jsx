import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import FieldInput from "@/pages/admin/refs/FieldInput";

describe("FieldInput", () => {
  it("renders text input", () => {
    render(<FieldInput field={{ key: "name", type: "text", placeholder: "Enter name" }} value="" onChange={() => {}} />);
    expect(screen.getByPlaceholderText("Enter name")).toBeTruthy();
  });

  it("renders textarea for longtext", () => {
    render(<FieldInput field={{ key: "desc", type: "longtext" }} value="hello" onChange={() => {}} />);
    const ta = screen.getByDisplayValue("hello");
    expect(ta.tagName).toBe("TEXTAREA");
  });

  it("renders number input", () => {
    render(<FieldInput field={{ key: "age", type: "number" }} value={5} onChange={() => {}} />);
    expect(screen.getByDisplayValue("5")).toBeTruthy();
  });

  it("renders select with options", () => {
    render(<FieldInput field={{ key: "x", type: "select", options: ["A", "B", "C"] }} value="B" onChange={() => {}} />);
    expect(screen.getByDisplayValue("B")).toBeTruthy();
  });

  it("renders color picker", () => {
    const { container } = render(<FieldInput field={{ key: "c", type: "color" }} value="#ff0000" onChange={() => {}} />);
    const colorInput = container.querySelector('input[type="color"]');
    expect(colorInput).toBeTruthy();
    expect(colorInput.value).toBe("#ff0000");
  });

  it("renders ref select dropdown", () => {
    const refs = { types: [{ id: "t1", name: "Fight" }, { id: "t2", name: "Magic" }] };
    render(<FieldInput field={{ key: "tid", type: "ref", refTable: "types" }} value="t1" onChange={() => {}} allRefs={refs} />);
    expect(screen.getByText("Fight")).toBeTruthy();
    expect(screen.getByText("Magic")).toBeTruthy();
  });

  it("filters ref select by designation", () => {
    const refs = {
      types: [
        { id: "t1", name: "Fight", designations: ["ability"] },
        { id: "t2", name: "Common", designations: ["rarity"] },
      ],
    };
    render(<FieldInput field={{ key: "tid", type: "ref", refTable: "types", filterDesignation: "ability" }} value="" onChange={() => {}} allRefs={refs} />);
    expect(screen.getByText("Fight")).toBeTruthy();
    expect(screen.queryByText("Common")).toBeNull();
  });

  it("renders tags input", () => {
    render(<FieldInput field={{ key: "t", type: "tags", options: ["a", "b"] }} value={["a"]} onChange={() => {}} />);
    expect(screen.getByText("a")).toBeTruthy();
  });

  it("renders attrmods grid", () => {
    render(<FieldInput field={{ key: "m", type: "attrmods" }} value={{ STR: -2 }} onChange={() => {}} />);
    expect(screen.getByText("STR")).toBeTruthy();
    expect(screen.getByDisplayValue("-2")).toBeTruthy();
  });

  it("renders ingredient parts editor", () => {
    render(<FieldInput field={{ key: "p", type: "ingredient-parts" }} value={[{ part: "Leaf", effect: "Heal", power: "I" }]} onChange={() => {}} />);
    expect(screen.getByDisplayValue("Leaf")).toBeTruthy();
    expect(screen.getByDisplayValue("Heal")).toBeTruthy();
  });

  it("renders bundle layers editor", () => {
    render(<FieldInput field={{ key: "l", type: "bundle-layers" }} value={[]} onChange={() => {}} />);
    expect(screen.getByText("+ Add Layer")).toBeTruthy();
  });

  it("calls onChange when text input changes", () => {
    const onChange = vi.fn();
    render(<FieldInput field={{ key: "n", type: "text" }} value="" onChange={onChange} />);
    fireEvent.change(screen.getByRole("textbox"), { target: { value: "test" } });
    expect(onChange).toHaveBeenCalledWith("test");
  });
});
