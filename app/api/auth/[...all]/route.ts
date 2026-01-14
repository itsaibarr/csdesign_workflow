import { auth } from "@/lib/auth"; // Import your Better Auth instance
import { toNextJsHandler } from "better-auth/next-js";

export const { POST, GET } = toNextJsHandler(auth);
