const crypto = require("crypto");

const TOKEN_SECRET = process.env.AUTH_TOKEN_SECRET || "sahanz-store-dev-secret";
const TOKEN_TTL_MS = 1000 * 60 * 60 * 24 * 7;

function base64UrlEncode(input) {
  return Buffer.from(input)
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/g, "");
}

function base64UrlDecode(input) {
  const normalized = input.replace(/-/g, "+").replace(/_/g, "/");
  const padding = normalized.length % 4 === 0 ? "" : "=".repeat(4 - (normalized.length % 4));
  return Buffer.from(`${normalized}${padding}`, "base64").toString("utf8");
}

function hashPassword(password, salt = crypto.randomBytes(16).toString("hex")) {
  const digest = crypto.scryptSync(password, salt, 64).toString("hex");
  return `scrypt:${salt}:${digest}`;
}

function verifyPassword(password, passwordHash) {
  if (!passwordHash || typeof passwordHash !== "string") {
    return false;
  }

  const [scheme, salt, storedDigest] = passwordHash.split(":");

  if (scheme !== "scrypt" || !salt || !storedDigest) {
    return false;
  }

  const digest = crypto.scryptSync(password, salt, 64);
  const stored = Buffer.from(storedDigest, "hex");

  if (stored.length !== digest.length) {
    return false;
  }

  return crypto.timingSafeEqual(stored, digest);
}

function signPayload(payload) {
  return crypto.createHmac("sha256", TOKEN_SECRET).update(payload).digest("base64url");
}

function createAuthToken(user) {
  const payload = {
    sub: user.id,
    role: user.role,
    exp: Date.now() + TOKEN_TTL_MS
  };
  const encodedPayload = base64UrlEncode(JSON.stringify(payload));
  return `${encodedPayload}.${signPayload(encodedPayload)}`;
}

function verifyAuthToken(token) {
  if (!token || typeof token !== "string") {
    return null;
  }

  const [encodedPayload, signature] = token.split(".");

  if (!encodedPayload || !signature) {
    return null;
  }

  const expectedSignature = signPayload(encodedPayload);

  if (expectedSignature !== signature) {
    return null;
  }

  try {
    const payload = JSON.parse(base64UrlDecode(encodedPayload));

    if (!payload?.sub || !payload?.role || !payload?.exp || payload.exp < Date.now()) {
      return null;
    }

    return payload;
  } catch (_error) {
    return null;
  }
}

module.exports = {
  createAuthToken,
  hashPassword,
  verifyAuthToken,
  verifyPassword
};
