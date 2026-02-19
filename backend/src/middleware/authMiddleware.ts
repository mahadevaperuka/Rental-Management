export const authGuard = async (resolve: any, source: any, args: any, context: any, info: any) => {
    // Skip auth for trusted internal service calls (e.g., chatbot)
    if (context.isServiceCall) {
        return resolve(source, args, context, info);
    }
    if (!context.session) {
        throw new Error('Authorized Usage Only! Please login to continue.');
    }
    return resolve(source, args, context, info);
};
