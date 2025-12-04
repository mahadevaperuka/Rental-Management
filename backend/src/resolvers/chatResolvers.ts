import { schemaComposer } from 'graphql-compose';
import { chatbotService } from '../chatbot/service.js';
import { z } from 'zod';

const ChatResponseTC = schemaComposer.createObjectTC({
    name: 'ChatResponse',
    fields: {
        message: 'String!',
        data: 'JSON',
    },
});

export const chatResolver = schemaComposer.createResolver({
    name: 'chat',
    type: ChatResponseTC,
    args: {
        message: 'String!',
    },
    resolve: async ({ args, context }) => {
        if (!context.session?.user) {
            throw new Error("Unauthorized");
        }
        return chatbotService.processChat(context.session.user, (args as any).message);
    },
});
