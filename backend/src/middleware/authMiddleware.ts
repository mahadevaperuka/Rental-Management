export const authGuard = async (resolve: any, source: any, args: any, context: any, info: any) => {
    if (!context.session) {
        throw new Error('Authorized Usage Only! Please login to continue.');
    }
    return resolve(source, args, context, info);
};
