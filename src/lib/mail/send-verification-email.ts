import { MailtrapClient } from "mailtrap";


const TOKEN = process.env.MAILER_API_KEY!;

const client = new MailtrapClient({
  token: TOKEN,
});

const sender = {
  email: "hello@demomailtrap.co",
  name: "KinteHobe Team",
};

export async function SendVerificationEmail({user,url}:{user:{
    id: string;
    createdAt: Date;
    updatedAt: Date;
    email: string;
    emailVerified: boolean;
    name: string;
    image?: string | null | undefined;
},url:string}){

    await client.send({
        from: sender,
        to: [{
            email: user.email,
             name: user.name,
        }],
        subject: "Verify your mail - KinteHobe",
        html:`<!DOCTYPE html>
        <html lang="en">
        <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>Verify Your Email - KinteHobe</title>
        <style>
            :root {
            --background: oklch(0.994 0 0);
            --foreground: oklch(0 0 0);
            --card: oklch(0.994 0 0);
            --card-foreground: oklch(0 0 0);
            --primary: oklch(0.5393 0.2713 286.7462);
            --primary-foreground: oklch(1 0 0);
            --secondary: oklch(0.954 0.0063 255.4755);
            --muted: oklch(0.9702 0 0);
            --muted-foreground: oklch(0.4386 0 0);
            --accent: oklch(0.9393 0.0288 266.368);
            --border: oklch(0.93 0.0094 286.2156);
            --radius: 0.375rem;
            --font-sans:
                ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI",
                Roboto, "Helvetica Neue", Arial, "Noto Sans", sans-serif, "Apple Color Emoji",
                "Segoe UI Emoji", "Segoe UI Symbol", "Noto Color Emoji";
            }

            * {
            box-sizing: border-box;
            }

            body {
            margin: 0;
            padding: 0;
            min-height: 100vh;
            font-family: var(--font-sans);
            background: var(--background);
            color: var(--foreground);
            }

            .email-container {
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
            }

            .email-wrapper {
            background: color-mix(in oklab, var(--card) 92%, white);
            border: 1px solid var(--border);
            border-radius: calc(var(--radius) * 3);
            overflow: hidden;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
            }

            .email-header {
            background: linear-gradient(
                135deg,
                var(--primary),
                color-mix(in oklab, var(--primary) 72%, white)
            );
            padding: 40px 32px;
            text-align: center;
            color: var(--primary-foreground);
            }

            .email-icon {
            width: 60px;
            height: 60px;
            margin: 0 auto 16px;
            background: rgba(255, 255, 255, 0.15);
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            }

            .email-icon svg {
            width: 32px;
            height: 32px;
            stroke: currentColor;
            fill: none;
            }

            .email-header h1 {
            margin: 0;
            font-size: 28px;
            font-weight: 700;
            line-height: 1.2;
            letter-spacing: -0.01em;
            }

            .email-content {
            padding: 40px 32px;
            text-align: center;
            }

            .email-content p {
            margin: 0 0 24px;
            font-size: 15px;
            line-height: 1.6;
            color: var(--muted-foreground);
            }

            .email-content p.intro {
            color: var(--foreground);
            font-size: 16px;
            margin-bottom: 32px;
            }

            .verification-button {
            display: inline-block;
            background: var(--primary);
            color: var(--primary-foreground);
            padding: 14px 40px;
            border-radius: calc(var(--radius) * 2);
            text-decoration: none;
            font-weight: 600;
            font-size: 16px;
            margin: 32px 0;
            box-shadow: 0 8px 18px color-mix(in oklab, var(--primary) 22%, transparent);
            }

            .verification-button:hover {
            opacity: 0.95;
            }

            .email-divider {
            margin: 32px 0;
            padding: 32px 0;
            border-top: 1px solid var(--border);
            border-bottom: 1px solid var(--border);
            }

            .verification-link-section {
            background: var(--muted);
            padding: 20px;
            border-radius: calc(var(--radius) * 2);
            margin: 24px 0;
            }

            .verification-link-section p {
            margin: 0 0 12px;
            font-size: 13px;
            font-weight: 600;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            color: var(--muted-foreground);
            }

            .verification-link {
            word-break: break-all;
            font-size: 12px;
            color: var(--accent-foreground);
            font-family: monospace;
            line-height: 1.4;
            }

            .email-footer {
            background: var(--secondary);
            padding: 32px;
            text-align: center;
            border-top: 1px solid var(--border);
            }

            .email-footer p {
            margin: 0 0 12px;
            font-size: 13px;
            line-height: 1.5;
            color: var(--muted-foreground);
            }

            .email-footer p:last-child {
            margin-bottom: 0;
            }

            .email-footer strong {
            color: var(--foreground);
            font-weight: 600;
            }

            @media (max-width: 640px) {
            .email-container {
                padding: 12px;
            }

            .email-header {
                padding: 32px 24px;
            }

            .email-header h1 {
                font-size: 24px;
            }

            .email-content {
                padding: 32px 24px;
            }

            .email-content p {
                font-size: 14px;
            }

            .verification-button {
                padding: 12px 32px;
                font-size: 15px;
            }

            .email-footer {
                padding: 24px;
            }
            }
        </style>
        </head>
        <body>
        <div class="email-container">
            <div class="email-wrapper">
            <!-- Header -->
            <div class="email-header">
                <div class="email-icon">
                <svg viewBox="0 0 24 24" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M4 6h16a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2Z"/>
                    <path d="m22 8-8.97 5.7a2 2 0 0 1-2.06 0L2 8"/>
                </svg>
                </div>
                <h1>Verify Your Email</h1>
            </div>

            <!-- Main Content -->
            <div class="email-content">
                <p class="intro">Thank you for signing up with KinteHobe. To activate your account and complete registration, please verify your email address.</p>

                <a href="${url}" class="verification-button">Verify Email Address</a>

                <div class="verification-link-section">
                <p>Or copy this link:</p>
                <div class="verification-link">${url}</div>
                </div>

                <div class="email-divider"></div>

                <p>This verification link will expire in 24 hours. If you did not create this account, please ignore this email.</p>
            </div>

            <!-- Footer -->
            <div class="email-footer">
                <p>Didn't receive the email? Check your <strong>spam</strong> or <strong>junk</strong> folder.</p>
                <p>© 2026 KinteHobe. All rights reserved.</p>
            </div>
            </div>
        </div>
        </body>
        </html>`
    });

}