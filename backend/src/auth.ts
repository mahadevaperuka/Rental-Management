import { betterAuth } from "better-auth";
import { mongodbAdapter } from "better-auth/adapters/mongodb";
import { MongoClient } from "mongodb";
import { config } from "dotenv";

config();

const mongoUri = process.env.MONGO_URI || "mongodb://localhost:27017/rental-management";
const client = new MongoClient(mongoUri);
await client.connect();
console.log("Better Auth MongoDB Client Connected");
const db = client.db();

export const auth = betterAuth({
    basePath: "/api/auth",
    trustedOrigins: ["http://localhost:4000", "http://localhost:5173"],
    logger: {
        level: "error",
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
                defaultValue: "Guest"
            },
            linked_id: {
                type: "string",
                required: false
            },
            image: {
                type: "string",
                required: false
            },
            is_temp_password: {
                type: "boolean",
                required: false,
                defaultValue: false
            }
        }
    }
});
