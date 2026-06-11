import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { admin as AdminPlugin } from "better-auth/plugins/admin";
import { db } from "./db"; // your drizzle instance
import { ac, admin, manager, user } from "./auth/permissions";
import { SendVerificationEmail } from "./mail/send-verification-email";
export const auth = betterAuth({
    database: drizzleAdapter(db, {
        provider: "pg",
    }),
    secret: process.env.BETTER_AUTH_SECRET,
    baseURL: process.env.BETTER_AUTH_URL || "http://localhost:3000",
    trustedOrigins: ["https://kintehobe.vercel.app","http://localhost:3000"],
    emailAndPassword: {
        enabled: true,
        requireEmailVerification: true,
        
    },
    emailVerification:{
        sendOnSignUp:true,
        sendVerificationEmail:async ({user,url})=>{
            await SendVerificationEmail({
                user,url
            });
        }
    },
    plugins:[AdminPlugin({
        ac,
        defaultRole:"user",
        roles:{
            user,
            admin,
            manager
        }
    })]
});