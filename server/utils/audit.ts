import { AuditLog } from '~/server/models/AuditLog';

export const logAudit = async (params: {
    actorAdminId: string;
    action: string;
    targetType?: string;
    targetId?: string;
    metadata?: any;
}) => {
    try {
        await AuditLog.create({
            actorAdminId: params.actorAdminId,
            action: params.action,
            targetType: params.targetType,
            targetId: params.targetId,
            metadata: params.metadata
        });
    } catch (e) {
        console.error('Failed to create audit log', e);
    }
};
