import { User } from '~/server/models/User';

export default defineEventHandler(async (event) => {
    return await User.find().sort({ createdAt: -1 });
});
