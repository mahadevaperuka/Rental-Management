type Role = 'Admin' | 'Manager' | 'Tenant' | 'Guest';

export const requireRole = (...allowedRoles: Role[]) => {
    return async (resolve: any, source: any, args: any, context: any, info: any) => {
        // Skip RBAC for trusted internal service calls (e.g., chatbot)
        if (context.isServiceCall) {
            return resolve(source, args, context, info);
        }

        const userRole = context.session?.user?.role as Role | undefined;

        if (!userRole || !allowedRoles.includes(userRole)) {
            throw new Error(
                `Access denied. Required role: ${allowedRoles.join(' or ')}. Your role: ${userRole || 'none'}.`
            );
        }

        return resolve(source, args, context, info);
    };
};
