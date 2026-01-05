import {
  generateRecoveryCode,
  hashRecoveryCode,
  isValidRecoveryCode,
  normalizeRecoveryCodeInput,
  RECOVERY_CODE_LENGTH,
  RECOVERY_CODE_ALPHABET,
  verifyRecoveryCode,
} from "./recovery-code";

describe("recovery-code helpers", () => {
  it("generates a grouped recovery code with allowed characters by default", () => {
    const code = generateRecoveryCode();
    expect(code).toMatch(/^[A-Z0-9]{4}(-[A-Z0-9]{4}){3}$/);
    const normalized = normalizeRecoveryCodeInput(code);
    expect(normalized).toHaveLength(RECOVERY_CODE_LENGTH);
    expect(normalized).toMatch(/^[A-Z0-9]+$/);
    for (const char of normalized) {
      expect(`${RECOVERY_CODE_ALPHABET}01`).toContain(char);
    }
  });

  it("normalizes user input by removing separators and uppercasing", () => {
    const normalized = normalizeRecoveryCodeInput("oill-oill-oill-oill");
    expect(normalized).toBe("0111011101110111");
  });

  it("validates format and character set", () => {
    expect(isValidRecoveryCode("ABCD-EFGH-JKMN-PQRS")).toBe(true);
    expect(isValidRecoveryCode("abcd efgh ijkl mnop")).toBe(true);
    expect(isValidRecoveryCode("ABCDE123I0")).toBe(false);
    expect(isValidRecoveryCode("TOO-SHORT")).toBe(false);
    expect(isValidRecoveryCode("INVALID!CODE!DATA")).toBe(false);
  });

  it("hashes and verifies recovery codes with a generated salt", () => {
    const code = generateRecoveryCode();
    const { hash, salt } = hashRecoveryCode(code);

    expect(hash).toMatch(/^[a-f0-9]+$/);
    expect(hash.length).toBeGreaterThan(0);
    expect(salt).toMatch(/^[a-f0-9]+$/);

    expect(verifyRecoveryCode(code.toLowerCase(), hash, salt)).toBe(true);
    expect(verifyRecoveryCode(`${code}X`, hash, salt)).toBe(false);
  });

  it("returns false when the hash or salt is malformed", () => {
    const code = generateRecoveryCode();
    const { hash, salt } = hashRecoveryCode(code);

    expect(verifyRecoveryCode(code, "not-hex", salt)).toBe(false);
    expect(verifyRecoveryCode(code, hash, "")).toBe(false);
  });
});
