import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import { AddPositionForm } from "@/components/AddPositionForm";

describe("AddPositionForm", () => {
  const baseProps = {
    newSymbol: "",
    newShares: "",
    newBuyPrice: "",
    newDca: "",
    formError: null,
    onSymbolChange: vi.fn(),
    onSharesChange: vi.fn(),
    onBuyPriceChange: vi.fn(),
    onDcaChange: vi.fn(),
    onSubmit: vi.fn(),
  };

  it("renders core inputs and submit affordance", () => {
    const html = renderToStaticMarkup(<AddPositionForm {...baseProps} />);

    expect(html).toContain('data-testid="input-symbol"');
    expect(html).toContain('data-testid="input-shares"');
    expect(html).toContain('data-testid="input-buy-price"');
    expect(html).toContain('data-testid="input-dca"');
    expect(html).toContain('data-testid="save-position-button"');
  });

  it("renders error message when provided", () => {
    const html = renderToStaticMarkup(
      <AddPositionForm {...baseProps} formError="Symbol is required." />,
    );

    expect(html).toContain("Symbol is required.");
  });

  it("renders cancel button in editing mode", () => {
    const html = renderToStaticMarkup(
      <AddPositionForm {...baseProps} isEditing onCancel={vi.fn()} />,
    );

    expect(html).toContain('aria-label="Cancel"');
  });
});
