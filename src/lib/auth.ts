import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { admin as AdminPlugin } from "better-auth/plugins/admin";
import { db } from "./db"; // your drizzle instance
import { ac, admin, user } from "./auth/permissions";
import { dash } from "@better-auth/infra";
export const auth = betterAuth({
    database: drizzleAdapter(db, {
        provider: "pg",
    }),
    secret: process.env.BETTER_AUTH_SECRET,
    baseURL: process.env.BETTER_AUTH_URL || "http://localhost:3000",
    trustedOrigins: ["http://localhost:3000"],
    emailAndPassword: {
        enabled: true,
    },
    plugins:[AdminPlugin({
        ac,
        defaultRole:"user",
        roles:{
            user,
            admin
        }
    }),dash()]
});