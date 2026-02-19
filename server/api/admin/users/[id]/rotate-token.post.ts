import { UserToken } from '~/server/models/UserToken';
import { CacheEntry } from '~/server/models/CacheEntry';
import { hashToken, encryptToken } from '~/server/utils/encryption';
import { logAudit } from '~/server/utils/audit';
import { randomBytes } from 'node:crypto';

export default defineEventHandler(async (event) => {
    const id = getRouterParam(event, 'id');

    // Revoke all existing tokens for user
    await UserToken.updateMany(
        { userId: id, revokedAt: null },
        { revokedAt: new Date() }
    );

    // Create new token
    const rawToken = randomBytes(32).toString('hex');
    const tokenHash = hashToken(rawToken);
    const tokenCiphertext = encryptToken(rawToken);

    await UserToken.create({
        userId: id,
        tokenHash,
        tokenCiphertext
    });

    // Clear cache
    await CacheEntry.deleteMany({ userId: id });

    await logAudit({
        actorAdminId: event.context.user.id,
        action: 'ROTATE_TOKEN',
        targetType: 'User',
        targetId: id
    });

    return { token: rawToken };
});
