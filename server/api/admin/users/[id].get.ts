import { User } from '~/server/models/User';
import { UserToken } from '~/server/models/UserToken';
import { decryptToken } from '~/server/utils/encryption';

export default defineEventHandler(async (event) => {
    const id = getRouterParam(event, 'id');
    const user = await User.findById(id);
    if (!user) {
        throw createError({ statusCode: 404, statusMessage: 'User not found' });
    }

    const tokenRecord = await UserToken.findOne({ userId: id, revokedAt: null });
    let token = null;
    if (tokenRecord) {
        try {
            token = decryptToken(tokenRecord.tokenCiphertext);
        } catch (e) {
            token = 'DECRYPTION_FAILED';
        }
    }

    return { ...user.toObject(), token };
});
