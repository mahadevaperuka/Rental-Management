import { Ollama } from 'ollama';
import { INTENTS } from './intents.js';
import { schema } from '../schema.js';
import { graphql } from 'graphql';

const ollama = new Ollama({ host: process.env.OLLAMA_HOST || 'http://127.0.0.1:11434' });
const MODEL = process.env.OLLAMA_MODEL || 'gemma3:4b';

export class ChatbotService {
    async *processChat(user: any, message: string) {
        try {
            // 1. Classify Intent
            const intentName = await this.classifyIntent(message, user.role);
            console.log(`Classified intent: ${intentName}`);

            if (!intentName || !INTENTS[intentName as keyof typeof INTENTS]) {
                return {
                    message: "I'm sorry, I didn't understand that request. I can help with lease details, payments, maintenance, and more.",
                    data: null
                };
            }

            const intent = INTENTS[intentName as keyof typeof INTENTS];

            // 2. Execute Query
            const variableValues = {
                linked_id: user.linked_id?.toString()
            };
            const result = await graphql({
                schema,
                source: intent.query,
                variableValues,
                contextValue: {
                    session: { user }
                }
            });

            if (result.errors) {
                console.error("GraphQL Errors:", result.errors);
                return {
                    message: "I encountered an error while fetching the data.",
                    data: null
                };
            }

            const systemPrompt = `
            You are a helpful assistant.
            The user asked: "${message}"
            The system retrieved the following data for intent "${intentName}":
            ${JSON.stringify(result.data, null, 2)}

            Please summarize this data in a friendly, natural language response.
            Keep it concise. If the data is empty, say so politely.
            Do not mention "JSON" or "data objects".
        `;

            const response = await ollama.chat({
                model: MODEL,
                messages: [
                    { role: "system", content: systemPrompt }
                ],
                stream: true,
            });

            for await (const part of response){
                yield part.message.content;
            }
            
            

        } catch (error) {
            console.error("Chatbot Error:", error);
            return {
                message: "An unexpected error occurred.",
                data: null
            };
        }
    }



    private async classifyIntent(message: string, role: string): Promise<string | null> {
        const availableIntents = Object.values(INTENTS).filter(intent => {
            if (role === 'Tenant') {
                return intent.name.startsWith('GET_MY_') || intent.name === 'GET_COMMUNITY_INFO';
            } else if (role === 'Manager') {
                return intent.name.startsWith('GET_') && !intent.name.startsWith('GET_MY_');
            }
            return false;
        });

        const systemPrompt = `
            You are a helpful assistant for a rental management platform.
            Your goal is to map the user's natural language query to one of the following intents:
            ${availableIntents.map(i => `- ${i.name}: ${i.description}`).join('\n')}

            If the user's query matches one of these intents, return ONLY the intent name.
            If the query is unrelated or unclear, return "UNKNOWN".
        `;

        const response = await ollama.chat({
            model: MODEL,
            messages: [
                { role: "system", content: systemPrompt },
                { role: "user", content: message }
            ],
            stream: false,
        });

        const content = response.message.content?.trim();
        return content === "UNKNOWN" ? null : content || null;
    }

    private async generateSummary(userMessage: string, data: any, intentName: string): Promise<string> {
        const systemPrompt = `
            You are a helpful assistant.
            The user asked: "${userMessage}"
            The system retrieved the following data for intent "${intentName}":
            ${JSON.stringify(data, null, 2)}

            Please summarize this data in a friendly, natural language response.
            Keep it concise. If the data is empty, say so politely.
            Do not mention "JSON" or "data objects".
        `;

        const response = await ollama.chat({
            model: MODEL,
            messages: [
                { role: "system", content: systemPrompt }
            ],
            stream: false,
        });

        return response.message.content || "Here is the information you requested.";
    }
}

export const chatbotService = new ChatbotService();
