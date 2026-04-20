import { describe, it, expect } from "vitest";
import { parseAnnotations } from "@/components/annotations/parser";

describe("Annotation parser", () => {
  it("returns plain text as single token", () => {
    const result = parseAnnotations("Hello world");
    expect(result).toEqual([{ type: "text", value: "Hello world" }]);
  });

  it("returns empty text token for empty string", () => {
    const result = parseAnnotations("");
    expect(result).toEqual([{ type: "text", value: "" }]);
  });

  it("handles null input", () => {
    const result = parseAnnotations(null);
    expect(result).toEqual([{ type: "text", value: "" }]);
  });

  // ── @age:N{...} ──
  it("parses @age:3{content}", () => {
    const result = parseAnnotations("Before @age:3{secret stuff} after");
    expect(result.length).toBe(3);
    expect(result[0]).toEqual({ type: "text", value: "Before " });
    expect(result[1].type).toBe("age");
    expect(result[1].age).toBe(3);
    expect(result[1].children[0].value).toBe("secret stuff");
    expect(result[2]).toEqual({ type: "text", value: " after" });
  });

  // ── @dm{...} ──
  it("parses @dm{content}", () => {
    const result = parseAnnotations("@dm{hidden note}");
    expect(result.length).toBe(1);
    expect(result[0].type).toBe("dm");
    expect(result[0].children[0].value).toBe("hidden note");
  });

  // ── @link:table:id{label} ──
  it("parses @link:table:id{label}", () => {
    const result = parseAnnotations("Visit @link:settlements:abc123{City of Ash} today");
    expect(result.length).toBe(3);
    expect(result[1].type).toBe("link");
    expect(result[1].table).toBe("settlements");
    expect(result[1].id).toBe("abc123");
    expect(result[1].label).toBe("City of Ash");
  });

  // ── @link:table:id (shorthand) ──
  it("parses @link:table:id without braces", () => {
    const result = parseAnnotations("See @link:races:elf-id for details");
    expect(result.length).toBe(3);
    expect(result[1].type).toBe("link");
    expect(result[1].table).toBe("races");
    expect(result[1].id).toBe("elf-id");
    expect(result[1].label).toBeNull();
  });

  // ── @extinct{...} ──
  it("parses @extinct{content}", () => {
    const result = parseAnnotations("@extinct{Died out in age 5}");
    expect(result[0].type).toBe("status");
    expect(result[0].status).toBe("extinct");
  });

  // ── @destroyed{...} ──
  it("parses @destroyed{content}", () => {
    const result = parseAnnotations("@destroyed{Burned down}");
    expect(result[0].type).toBe("status");
    expect(result[0].status).toBe("destroyed");
  });

  // ── @forgotten{...} ──
  it("parses @forgotten{content}", () => {
    const result = parseAnnotations("@forgotten{Lost to history}");
    expect(result[0].type).toBe("status");
    expect(result[0].status).toBe("forgotten");
  });

  // ── @quote:Author{...} ──
  it("parses @quote:Author Name{text}", () => {
    const result = parseAnnotations('@quote:Elder Marn{The sea remembers}');
    expect(result[0].type).toBe("quote");
    expect(result[0].author).toBe("Elder Marn");
    expect(result[0].children[0].value).toBe("The sea remembers");
  });

  // ── @danger{...} ──
  it("parses @danger{content}", () => {
    const result = parseAnnotations("@danger{Highly toxic}");
    expect(result[0].type).toBe("danger");
    expect(result[0].children[0].value).toBe("Highly toxic");
  });

  // ── Nesting ──
  it("handles nested annotations", () => {
    const result = parseAnnotations("@age:3{This was @extinct{wiped out} in the war}");
    expect(result[0].type).toBe("age");
    expect(result[0].children.length).toBe(3);
    expect(result[0].children[0].value).toBe("This was ");
    expect(result[0].children[1].type).toBe("status");
    expect(result[0].children[1].status).toBe("extinct");
    expect(result[0].children[2].value).toBe(" in the war");
  });

  // ── Multiple annotations ──
  it("handles multiple annotations in sequence", () => {
    const result = parseAnnotations("@dm{secret} and @danger{watch out}");
    expect(result.length).toBe(3);
    expect(result[0].type).toBe("dm");
    expect(result[1].type).toBe("text");
    expect(result[2].type).toBe("danger");
  });

  // ── Edge cases ──
  it("treats unmatched @ as literal text", () => {
    const result = parseAnnotations("email@test.com");
    expect(result[0].type).toBe("text");
    expect(result[0].value).toContain("@");
  });

  it("handles unclosed braces gracefully", () => {
    const result = parseAnnotations("@age:3{unclosed text");
    // Should treat as literal since braces don't match
    expect(result.some((t) => t.type === "text")).toBe(true);
  });

  it("handles empty braces", () => {
    const result = parseAnnotations("@dm{}");
    expect(result[0].type).toBe("dm");
    expect(result[0].children.length).toBe(1);
    expect(result[0].children[0].value).toBe("");
  });

  it("handles nested braces in content", () => {
    const result = parseAnnotations("@dm{has {inner} braces}");
    expect(result[0].type).toBe("dm");
    expect(result[0].children[0].value).toBe("has {inner} braces");
  });
});
