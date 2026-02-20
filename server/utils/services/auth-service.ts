import type { H3Event } from "h3";
import { Admin } from "~/server/models/Admin";
import type { AdminAuthUser } from "~/server/utils/admin-auth";
import {
  clearAdminAuthCookies,
  getAccessTokenPayload,
  getAdminUserFromAccessToken,
  getRefreshTokenPayload,
  issueAdminTokens,
  revokeRefreshTokenById,
  validateRefreshTokenRecord,
} from "~/server/utils/admin-auth";
import { verifyPassword } from "~/server/utils/password";
import type { AdminLoginBody } from "~/server/utils/validation/schemas/admin-auth";

const toAdminTokenSubject = (admin: {
  _id: unknown;
  email: string;
  role: string;
}) => {
  return {
    _id: String(admin._id),
    email: admin.email,
    role: admin.role,
  };
};

const login = async (event: H3Event, input: AdminLoginBody) => {
  const admin = await Admin.findOne({ email: input.email });
  if (!admin) {
    throw createError({
      statusCode: 401,
      statusMessage: "Invalid credentials",
    });
  }

  const isValid = await verifyPassword(admin.passwordHash, input.password);
  if (!isValid) {
    throw createError({
      statusCode: 401,
      statusMessage: "Invalid credentials",
    });
  }

  if (!admin.isActive) {
    throw createError({ statusCode: 403, statusMessage: "Admin inactive" });
  }

  clearAdminAuthCookies(event);
  await issueAdminTokens(event, toAdminTokenSubject(admin));
  return { success: true };
};

const logout = async (event: H3Event) => {
  const accessPayload = getAccessTokenPayload(event, {
    ignoreExpiration: true,
  });
  if (accessPayload?.rjti) {
    await revokeRefreshTokenById(accessPayload.rjti);
  }

  clearAdminAuthCookies(event);
  return { success: true };
};

const refresh = async (event: H3Event) => {
  const refreshPayload = getRefreshTokenPayload(event);
  if (!refreshPayload) {
    clearAdminAuthCookies(event);
    throw createError({ statusCode: 401, statusMessage: "Unauthorized" });
  }

  try {
    await validateRefreshTokenRecord(refreshPayload);

    const admin = await Admin.findById(refreshPayload.sub).select(
      "_id email role isActive",
    );

    if (!admin || !admin.isActive) {
      await revokeRefreshTokenById(refreshPayload.jti);
      clearAdminAuthCookies(event);
      throw createError({ statusCode: 401, statusMessage: "Unauthorized" });
    }

    await issueAdminTokens(
      event,
      toAdminTokenSubject(admin),
      refreshPayload.jti,
    );

    return { success: true };
  } catch (error) {
    clearAdminAuthCookies(event);
    throw error;
  }
};

const revokeSession = async (event: H3Event) => {
  const refreshPayload = getRefreshTokenPayload(event, {
    ignoreExpiration: true,
  });

  if (refreshPayload?.jti) {
    await revokeRefreshTokenById(refreshPayload.jti);
  } else {
    const accessPayload = getAccessTokenPayload(event, {
      ignoreExpiration: true,
    });
    if (accessPayload?.rjti) {
      await revokeRefreshTokenById(accessPayload.rjti);
    }
  }

  clearAdminAuthCookies(event);
  return { success: true };
};

const getCurrentAdmin = (event: H3Event) => {
  const contextUser = event.context.user as AdminAuthUser | undefined;
  const user = contextUser ?? getAdminUserFromAccessToken(event);
  if (!user) {
    throw createError({ statusCode: 401, statusMessage: "Unauthorized" });
  }
  return { user };
};

export const authService = {
  login,
  logout,
  refresh,
  revokeSession,
  getCurrentAdmin,
};
