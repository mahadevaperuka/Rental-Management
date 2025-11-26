import { betterAuth } from "better-auth";
import { mongodbAdapter } from "better-auth/adapters/mongodb";
import { MongoClient } from "mongodb";
import { config } from "dotenv";

config();

const mongoUri = process.env.MONGO_URI || "mongodb://localhost:27017/rental-management";
console.log("Connecting to MongoDB with URI starting with:", mongoUri.substring(0, 15) + "...");
const client = new MongoClient(mongoUri);
await client.connect();
console.log("Better Auth MongoDB Client Connected");
const db = client.db();

export const auth = betterAuth({
    basePath: "/api/auth",
    trustedOrigins: ["http://localhost:4000"],
    logger: {
        level: "debug",
    },
    database: mongodbAdapter(db),
    emailAndPassword: {
        enabled: true,
    },
    user: {
        modelName: "users", // Explicitly map to 'users' collection
        additionalFields: {
            role: {
                type: "string",
                required: false,
                defaultValue: "Tenant"
            },
            linked_id: {
                type: "string",
                required: false
            }
        }
    }
});
