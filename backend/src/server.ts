import { serve } from '@hono/node-server';
import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { ApolloServer } from '@apollo/server';
import { schema } from './schema.js';
import mongoose from 'mongoose';
import { config } from 'dotenv';
import { auth } from './auth.js';
import { streamText } from 'hono/streaming';
import { chatbotService } from './chatbot/service.js';

config();

const app = new Hono();

app.use('/*', cors({
    origin: (process.env.CORS_ORIGIN || 'http://localhost:5173').split(','),
    credentials: true,
    allowMethods: ['GET', 'POST', 'OPTIONS', 'PUT', 'DELETE'],
    allowHeaders: ['Content-Type', 'Authorization', 'Cookie'],
}));

// Mount Better Auth handler
app.all("/api/auth/*", async (c) => {
    const res = await auth.handler(c.req.raw);
    return res;
});

app.post('/api/chat', async (c) => {
    const session = await auth.api.getSession({ headers: c.req.raw.headers });

    if (!session?.user) {
        return c.json({ error: 'Unauthorized' }, 401);
    }

    const { message } = await c.req.json();
    return streamText(c, async (stream) => {
        const chatData = chatbotService.processChat(session.user, message);
        for await (const part of chatData) {
            await stream.write(part);
        }
    })

})

const server = new ApolloServer({
    schema,
    introspection: process.env.NODE_ENV !== 'production',
});

await server.start();

app.use('/graphql', async (c) => {
    const session = await auth.api.getSession({ headers: c.req.raw.headers });

    const result = await server.executeHTTPGraphQLRequest({
        httpGraphQLRequest: {
            method: c.req.method,
            headers: c.req.raw.headers as any,
            body: await c.req.json().catch(() => ({})),
            search: c.req.url.split('?')[1] || '',
        },
        context: async () => ({
            session,
        }),
    });

    result.headers.forEach((value, key) => {
        c.header(key, value);
    });

    c.status((result.status || 200) as any);
    return c.body(result.body.kind === 'complete' ? result.body.string : '');
});

const PORT = Number(process.env.PORT) || 4000;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/rental-management';

mongoose.connect(MONGO_URI)
    .then(() => {
        console.log('Connected to MongoDB');
    })
    .catch(err => console.error(`Mongo Connection Error: ${err}`));

serve({
    fetch: app.fetch,
    port: PORT
}, (info) => {
    console.log(`Server running on http://localhost:${info.port}`);
    console.log(`GraphQL endpoint: http://localhost:${info.port}/graphql`);
    console.log(`Auth endpoint: http://localhost:${info.port}/api/auth`);
});
