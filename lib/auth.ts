import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { emailOTP } from "better-auth/plugins";
import { prisma } from "./prisma";
import * as bcrypt from "bcryptjs";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export const auth = betterAuth({
    database: prismaAdapter(prisma, {
        provider: "postgresql",
    }),
    emailAndPassword: {
        enabled: true,
        password: {
            hash: async (password) => {
                return await bcrypt.hash(password, 10);
            },
            verify: async ({ hash, password }) => {
                return await bcrypt.compare(password, hash);
            },
        },
    },
    user: {
        deleteUser: {
            enabled: true,
        },
        additionalFields: {
            role: {
                type: "string",
                defaultValue: "STUDENT",
            },
            teamId: {
                type: "string",
                required: false,
            }
        }
    },
    plugins: [
        emailOTP({
            async sendVerificationOTP({ email, otp, type }) {
                try {
                    if (!process.env.RESEND_API_KEY) {
                        console.warn("⚠️ RESEND_API_KEY is missing. Email not sent.");
                        console.log(`\n\n>>> 📧 [MOCK EMAIL] To: ${email} | Type: ${type} | Code: ${otp} <<<\n\n`);
                        return;
                    }

                    const { data, error } = await resend.emails.send({
                        from: "onboarding@resend.dev", // Using Resend's default testing domain
                        to: email,
                        subject: `Your Verification Code: ${otp}`,
                        html: `
                            <div style="font-family: sans-serif; padding: 20px;">
                                <h1>Verify your account</h1>
                                <p>Your verification code is:</p>
                                <h2 style="background: #f4f4f5; padding: 10px; display: inline-block; border-radius: 5px;">${otp}</h2>
                                <p>This code expires in 5 minutes.</p>
                            </div>
                        `,
                    });

                    if (error) {
                        console.error("❌ Error sending email:", error);
                    } else {
                        console.log("✅ Email sent successfully:", data);
                    }
                } catch (e) {
                    console.error("❌ Unexpected error sending email:", e);
                }
            },
            otpLength: 5,
        })
    ]
});
