import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { SourceIndicator } from "@/components/SourceIndicator";

describe("SourceIndicator", () => {
  it("renders live indicator metadata", () => {
    const html = renderToStaticMarkup(<SourceIndicator source="live" />);

    expect(html).toContain('aria-label="Live Data"');
    expect(html).toContain("bg-green-500");
  });

  it("renders cached indicator metadata", () => {
    const html = renderToStaticMarkup(<SourceIndicator source="cache" />);

    expect(html).toContain('aria-label="Cached Data"');
    expect(html).toContain("bg-orange-500");
  });
});
