import {
  randomBytes,
  randomInt,
  scryptSync,
  timingSafeEqual,
  createHash,
} from "node:crypto";

export const RECOVERY_CODE_ALPHABET = "ABCDEFGHJKMNPQRSTUVWXYZ23456789";
export const RECOVERY_CODE_LENGTH = 16;
export const ALLOWED_NORMALIZED_CHARS = `${RECOVERY_CODE_ALPHABET}01`;

const HASH_BYTE_LENGTH = 64;
const SALT_BYTE_LENGTH = 16;

export type RecoveryCodeHash = {
  hash: string;
  salt: string;
};

export function normalizeRecoveryCodeInput(input: string): string {
  if (typeof input !== "string") {
    throw new Error("Recovery code must be a string");
  }
  const normalized = input
    .replace(/[\s-]+/g, "")
    .toUpperCase()
    .replace(/O/g, "0")
    .replace(/[IL]/g, "1");
  if (!normalized) {
    throw new Error("Recovery code is required");
  }
  return normalized;
}

function assertValidNormalizedRecoveryCode(code: string): void {
  if (code.length !== RECOVERY_CODE_LENGTH) {
    throw new Error(
      `Recovery code must be ${RECOVERY_CODE_LENGTH} characters`,
    );
  }
  for (const char of code) {
    if (!ALLOWED_NORMALIZED_CHARS.includes(char)) {
      throw new Error("Recovery code contains invalid characters");
    }
  }
}

export function isValidRecoveryCode(code: string): boolean {
  try {
    const normalized = normalizeRecoveryCodeInput(code);
    assertValidNormalizedRecoveryCode(normalized);
    return true;
  } catch {
    return false;
  }
}

export function generateRecoveryCode(): string {
  let canonicalCode = "";
  for (let i = 0; i < RECOVERY_CODE_LENGTH; i += 1) {
    const nextChar =
      RECOVERY_CODE_ALPHABET[randomInt(RECOVERY_CODE_ALPHABET.length)];
    canonicalCode += nextChar;
  }
  const groups = canonicalCode.match(/.{4}/g);
  if (!groups || groups.length * 4 !== RECOVERY_CODE_LENGTH) {
    throw new Error("Failed to format recovery code");
  }
  return groups.join("-");
}

export function hashRecoveryCode(
  code: string,
  salt?: string,
): RecoveryCodeHash {
  const normalized = normalizeRecoveryCodeInput(code);
  assertValidNormalizedRecoveryCode(normalized);

  const effectiveSalt = salt ?? randomBytes(SALT_BYTE_LENGTH).toString("hex");
  const hashBuffer = scryptSync(normalized, effectiveSalt, HASH_BYTE_LENGTH);
  return {
    hash: hashBuffer.toString("hex"),
    salt: effectiveSalt,
  };
}

export function recoveryCodeLookupKey(code: string): string {
  const normalized = normalizeRecoveryCodeInput(code);
  return createHash("sha256").update(normalized).digest("hex");
}

function isHexString(value: string): boolean {
  return /^[a-f0-9]+$/i.test(value) && value.length % 2 === 0;
}

export function verifyRecoveryCode(
  code: string,
  expectedHash: string,
  salt: string,
): boolean {
  if (
    !expectedHash ||
    !salt ||
    !isHexString(expectedHash) ||
    !isHexString(salt) ||
    salt.length !== SALT_BYTE_LENGTH * 2
  ) {
    return false;
  }
  try {
    const normalized = normalizeRecoveryCodeInput(code);
    assertValidNormalizedRecoveryCode(normalized);

    const expectedBuffer = Buffer.from(expectedHash, "hex");
    const candidateHash = scryptSync(
      normalized,
      salt,
      expectedBuffer.length || HASH_BYTE_LENGTH,
    );

    return (
      expectedBuffer.length === candidateHash.length &&
      timingSafeEqual(candidateHash, expectedBuffer)
    );
  } catch {
    return false;
  }
}
