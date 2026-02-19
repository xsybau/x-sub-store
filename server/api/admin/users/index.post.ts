import { User } from '~/server/models/User';
import { UserToken } from '~/server/models/UserToken';
import { hashToken, encryptToken } from '~/server/utils/encryption';
import { logAudit } from '~/server/utils/audit';
import { randomBytes } from 'node:crypto';

export default defineEventHandler(async (event) => {
    const body = await readBody(event);
    if (!body.label) {
        throw createError({ statusCode: 400, statusMessage: 'Label is required' });
    }

    const existing = await User.findOne({ label: body.label });
    if (existing) {
        throw createError({ statusCode: 400, statusMessage: 'Label already exists' });
    }

    const user = await User.create({
        label: body.label,
        email: body.email,
        isActive: true
    });

    const rawToken = randomBytes(32).toString('hex');
    const tokenHash = hashToken(rawToken);
    const tokenCiphertext = encryptToken(rawToken);

    await UserToken.create({
        userId: user._id,
        tokenHash,
        tokenCiphertext
    });

    await logAudit({
        actorAdminId: event.context.user.id,
        action: 'CREATE_USER',
        targetType: 'User',
        targetId: String(user._id),
        metadata: { label: user.label }
    });

    return { user, token: rawToken };
});
