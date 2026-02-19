import type { H3Event } from 'h3';
import { createError, getCookie, setCookie } from 'h3';
import {
  createHash,
  createPrivateKey,
  createPublicKey,
  generateKeyPairSync,
  randomUUID,
  sign,
  verify,
  type KeyObject
} from 'node:crypto';
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { AdminRefreshToken } from '~/server/models/AdminRefreshToken';

export const ADMIN_AUTH_COOKIE = 'admin_auth_token';
export const ADMIN_REFRESH_COOKIE = 'admin_refresh_token';

const MAX_AUTH_TTL_SECONDS = 60 * 60 * 24; // 1 day
const MAX_REFRESH_TTL_SECONDS = 60 * 60 * 24 * 7; // 7 days
const DEV_KEYS_DIR = join(process.cwd(), '.data', 'admin-jwt-keys');

interface JwtHeader {
  alg: 'EdDSA';
  typ: 'JWT';
}

interface JwtPayloadBase {
  sub: string;
  type: 'access' | 'refresh';
  iat: number;
  exp: number;
}

export interface AccessTokenPayload extends JwtPayloadBase {
  type: 'access';
  email: string;
  role: string;
  rjti: string; // refresh token id paired with this access token
}

export interface RefreshTokenPayload extends JwtPayloadBase {
  type: 'refresh';
  jti: string;
}

export interface AdminAuthUser {
  id: string;
  email: string;
  role: string;
}

interface KeyPair {
  privateKey: KeyObject;
  publicKey: KeyObject;
}

interface AuthCryptoContext {
  access: KeyPair;
  refresh: KeyPair;
}

declare global {
  // Shared across hot-reloaded module instances in the same Node process.
  // eslint-disable-next-line no-var
  var __adminAuthCrypto: AuthCryptoContext | undefined;
}

const normalizePem = (value?: string) => (value || '').trim().replace(/\\n/g, '\n');

const toBase64Url = (value: string | Buffer) => Buffer.from(value).toString('base64url');
const fromBase64Url = (value: string) => Buffer.from(value, 'base64url');

const nowSeconds = () => Math.floor(Date.now() / 1000);

const clampTtl = (value: unknown, fallback: number, max: number) => {
  const n = Number(value);
  if (!Number.isFinite(n) || n <= 0) return fallback;
  return Math.min(Math.floor(n), max);
};

export const getAuthTokenTtls = () => {
  const config = useRuntimeConfig() as any;
  return {
    authTtlSeconds: clampTtl(config.adminAuthTokenExpiresSeconds, MAX_AUTH_TTL_SECONDS, MAX_AUTH_TTL_SECONDS),
    refreshTtlSeconds: clampTtl(config.adminRefreshTokenExpiresSeconds, MAX_REFRESH_TTL_SECONDS, MAX_REFRESH_TTL_SECONDS)
  };
};

const createPair = (privatePem: string, publicPem: string): KeyPair => ({
  privateKey: createPrivateKey(privatePem),
  publicKey: createPublicKey(publicPem)
});

const keyToPem = (key: KeyObject, kind: 'public' | 'private') =>
  key.export({ format: 'pem', type: kind === 'private' ? 'pkcs8' : 'spki' }).toString();

const buildDevKeyPair = (): KeyPair => {
  const generated = generateKeyPairSync('ed25519');
  return {
    privateKey: generated.privateKey,
    publicKey: generated.publicKey
  };
};

const getDevKeyFilePaths = (kind: 'access' | 'refresh') => ({
  privatePath: join(DEV_KEYS_DIR, `${kind}.private.pem`),
  publicPath: join(DEV_KEYS_DIR, `${kind}.public.pem`)
});

const loadPersistedDevKeyPair = (kind: 'access' | 'refresh'): KeyPair | null => {
  const { privatePath, publicPath } = getDevKeyFilePaths(kind);
  if (!existsSync(privatePath) || !existsSync(publicPath)) {
    return null;
  }

  const privatePem = readFileSync(privatePath, 'utf-8');
  const publicPem = readFileSync(publicPath, 'utf-8');
  return createPair(privatePem, publicPem);
};

const persistDevKeyPair = (kind: 'access' | 'refresh', pair: KeyPair) => {
  mkdirSync(DEV_KEYS_DIR, { recursive: true });
  const { privatePath, publicPath } = getDevKeyFilePaths(kind);
  writeFileSync(privatePath, keyToPem(pair.privateKey, 'private'), { encoding: 'utf-8', mode: 0o600 });
  writeFileSync(publicPath, keyToPem(pair.publicKey, 'public'), { encoding: 'utf-8', mode: 0o644 });
};

const getStableDevKeyPair = (kind: 'access' | 'refresh') => {
  try {
    const existingPair = loadPersistedDevKeyPair(kind);
    if (existingPair) return existingPair;

    const generatedPair = buildDevKeyPair();
    persistDevKeyPair(kind, generatedPair);
    return generatedPair;
  } catch {
    // Last-resort fallback for environments where filesystem persistence is unavailable.
    return buildDevKeyPair();
  }
};

const getAuthCrypto = (): AuthCryptoContext => {
  if (globalThis.__adminAuthCrypto) return globalThis.__adminAuthCrypto;

  const config = useRuntimeConfig() as any;
  const accessPrivatePem = normalizePem(config.adminAuthPrivateKey);
  const accessPublicPem = normalizePem(config.adminAuthPublicKey);
  const refreshPrivatePem = normalizePem(config.adminRefreshPrivateKey);
  const refreshPublicPem = normalizePem(config.adminRefreshPublicKey);

  const hasAccessKeys = Boolean(accessPrivatePem && accessPublicPem);
  const hasRefreshKeys = Boolean(refreshPrivatePem && refreshPublicPem);

  let accessPair: KeyPair;
  let refreshPair: KeyPair;

  if (hasAccessKeys && hasRefreshKeys) {
    accessPair = createPair(accessPrivatePem, accessPublicPem);
    refreshPair = createPair(refreshPrivatePem, refreshPublicPem);
  } else if (process.env.NODE_ENV !== 'production') {
    // Dev fallback: persist generated keys so sessions survive hot reload/restarts.
    accessPair = getStableDevKeyPair('access');
    refreshPair = getStableDevKeyPair('refresh');
  } else {
    throw new Error('Admin JWT key pairs are missing. Set ADMIN_AUTH_* and ADMIN_REFRESH_* keys.');
  }

  const accessPublic = keyToPem(accessPair.publicKey, 'public');
  const refreshPublic = keyToPem(refreshPair.publicKey, 'public');
  if (accessPublic === refreshPublic) {
    throw new Error('Access and refresh JWT keys must be different.');
  }

  globalThis.__adminAuthCrypto = {
    access: accessPair,
    refresh: refreshPair
  };

  return globalThis.__adminAuthCrypto;
};

const signJwt = (payload: JwtPayloadBase, privateKey: KeyObject) => {
  const header: JwtHeader = { alg: 'EdDSA', typ: 'JWT' };
  const encodedHeader = toBase64Url(JSON.stringify(header));
  const encodedPayload = toBase64Url(JSON.stringify(payload));
  const data = `${encodedHeader}.${encodedPayload}`;
  const signature = sign(null, Buffer.from(data), privateKey);
  return `${data}.${toBase64Url(signature)}`;
};

const verifyJwt = <T extends JwtPayloadBase>(
  token: string,
  publicKey: KeyObject,
  expectedType: T['type'],
  options?: { ignoreExpiration?: boolean }
): T => {
  const parts = token.split('.');
  if (parts.length !== 3) {
    throw createError({ statusCode: 401, statusMessage: 'Invalid token format' });
  }

  const [encodedHeader = '', encodedPayload = '', encodedSignature = ''] = parts;
  const data = `${encodedHeader}.${encodedPayload}`;
  const signature = fromBase64Url(encodedSignature);

  const valid = verify(null, Buffer.from(data), publicKey, signature);
  if (!valid) {
    throw createError({ statusCode: 401, statusMessage: 'Invalid token signature' });
  }

  const header = JSON.parse(fromBase64Url(encodedHeader).toString('utf-8')) as JwtHeader;
  if (header.alg !== 'EdDSA' || header.typ !== 'JWT') {
    throw createError({ statusCode: 401, statusMessage: 'Invalid token header' });
  }

  const payload = JSON.parse(fromBase64Url(encodedPayload).toString('utf-8')) as T;
  if (payload.type !== expectedType) {
    throw createError({ statusCode: 401, statusMessage: 'Invalid token type' });
  }

  const now = nowSeconds();
  if (!options?.ignoreExpiration && payload.exp <= now) {
    throw createError({ statusCode: 401, statusMessage: 'Token expired' });
  }

  return payload;
};

const hashTokenId = (value: string) => createHash('sha256').update(value).digest('hex');

export const clearAdminAuthCookies = (event: H3Event) => {
  const clearOpts = {
    httpOnly: true as const,
    secure: true,
    sameSite: 'strict' as const,
    maxAge: 0,
    expires: new Date(0)
  };

  setCookie(event, ADMIN_AUTH_COOKIE, '', { ...clearOpts, path: '/' });
  setCookie(event, ADMIN_REFRESH_COOKIE, '', { ...clearOpts, path: '/refresh-token' });
  // Defensive cleanup in case older versions used a broader refresh cookie path.
  setCookie(event, ADMIN_REFRESH_COOKIE, '', { ...clearOpts, path: '/' });
};

export const getAccessTokenPayload = (event: H3Event, options?: { ignoreExpiration?: boolean }) => {
  const token = getCookie(event, ADMIN_AUTH_COOKIE);
  if (!token) return null;
  try {
    const crypto = getAuthCrypto();
    return verifyJwt<AccessTokenPayload>(token, crypto.access.publicKey, 'access', options);
  } catch {
    return null;
  }
};

export const getRefreshTokenPayload = (event: H3Event, options?: { ignoreExpiration?: boolean }) => {
  const token = getCookie(event, ADMIN_REFRESH_COOKIE);
  if (!token) return null;
  try {
    const crypto = getAuthCrypto();
    return verifyJwt<RefreshTokenPayload>(token, crypto.refresh.publicKey, 'refresh', options);
  } catch {
    return null;
  }
};

export const getAdminUserFromAccessToken = (event: H3Event): AdminAuthUser | null => {
  const payload = getAccessTokenPayload(event);
  if (!payload) return null;
  return {
    id: payload.sub,
    email: payload.email,
    role: payload.role
  };
};

export const revokeRefreshTokenById = async (tokenId: string, replacedById?: string) => {
  await AdminRefreshToken.findOneAndUpdate(
    {
      tokenIdHash: hashTokenId(tokenId),
      revokedAt: null
    },
    {
      revokedAt: new Date(),
      ...(replacedById ? { replacedByTokenIdHash: hashTokenId(replacedById) } : {})
    }
  );
};

const persistRefreshToken = async (adminId: string, refreshTokenId: string, expiresAt: Date) => {
  await AdminRefreshToken.create({
    adminId,
    tokenIdHash: hashTokenId(refreshTokenId),
    expiresAt
  });
};

const setAuthCookies = (
  event: H3Event,
  accessToken: string,
  refreshToken: string,
  authTtlSeconds: number,
  refreshTtlSeconds: number
) => {
  const baseOpts = {
    httpOnly: true as const,
    secure: true,
    sameSite: 'strict' as const
  };

  setCookie(event, ADMIN_AUTH_COOKIE, accessToken, {
    ...baseOpts,
    path: '/',
    maxAge: authTtlSeconds
  });

  setCookie(event, ADMIN_REFRESH_COOKIE, refreshToken, {
    ...baseOpts,
    path: '/refresh-token',
    maxAge: refreshTtlSeconds
  });
};

export const issueAdminTokens = async (
  event: H3Event,
  admin: { _id: string; email: string; role: string },
  previousRefreshTokenId?: string
) => {
  const crypto = getAuthCrypto();
  const { authTtlSeconds, refreshTtlSeconds } = getAuthTokenTtls();
  const issuedAt = nowSeconds();
  const refreshTokenId = randomUUID();

  const accessPayload: AccessTokenPayload = {
    sub: String(admin._id),
    email: admin.email,
    role: admin.role,
    type: 'access',
    rjti: refreshTokenId,
    iat: issuedAt,
    exp: issuedAt + authTtlSeconds
  };

  const refreshPayload: RefreshTokenPayload = {
    sub: String(admin._id),
    type: 'refresh',
    jti: refreshTokenId,
    iat: issuedAt,
    exp: issuedAt + refreshTtlSeconds
  };

  const accessToken = signJwt(accessPayload, crypto.access.privateKey);
  const refreshToken = signJwt(refreshPayload, crypto.refresh.privateKey);

  await persistRefreshToken(admin._id, refreshTokenId, new Date(refreshPayload.exp * 1000));
  if (previousRefreshTokenId) {
    await revokeRefreshTokenById(previousRefreshTokenId, refreshTokenId);
  }

  setAuthCookies(event, accessToken, refreshToken, authTtlSeconds, refreshTtlSeconds);
  return { accessPayload, refreshPayload };
};

export const validateRefreshTokenRecord = async (payload: RefreshTokenPayload) => {
  const token = await AdminRefreshToken.findOne({
    adminId: payload.sub,
    tokenIdHash: hashTokenId(payload.jti)
  });

  if (!token) {
    throw createError({ statusCode: 401, statusMessage: 'Refresh token not found' });
  }

  if (token.revokedAt) {
    throw createError({ statusCode: 401, statusMessage: 'Refresh token revoked' });
  }

  if (token.expiresAt.getTime() <= Date.now()) {
    throw createError({ statusCode: 401, statusMessage: 'Refresh token expired' });
  }

  return token;
};
