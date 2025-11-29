import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

// TODO: Uncomment when database is ready
// import { PrismaClient } from "@prisma/client";
// const prisma = new PrismaClient();

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";
const AUTH_SECRET = process.env.AUTH_SECRET || "your-auth-secret";

export interface UserPayload {
    id: string;
    email: string;
    tenantId?: string;
}

/**
 * Hash password using bcrypt
 */
export async function hashPassword(password: string): Promise<string> {
    const salt = await bcrypt.genSalt(10);
    return bcrypt.hash(password, salt);
}

/**
 * Verify password against hash
 */
export async function verifyPassword(
    password: string,
    hash: string
): Promise<boolean> {
    return bcrypt.compare(password, hash);
}

/**
 * Generate JWT token
 */
export function generateToken(payload: UserPayload): string {
    return jwt.sign(payload, JWT_SECRET, {
        expiresIn: "7d", // Token expires in 7 days
    });
}

/**
 * Verify and decode JWT token
 */
export function verifyToken(token: string): UserPayload | null {
    try {
        return jwt.verify(token, JWT_SECRET) as UserPayload;
    } catch (error) {
        return null;
    }
}

/**
 * Register a new user
 */
export async function registerUser(
    email: string,
    password: string,
    tenantId?: string
): Promise<{ user: any; token: string } | { error: string }> {
    try {
        // TODO: Uncomment when database is ready
        // // Check if user already exists
        // const existingUser = await prisma.user.findUnique({
        //   where: { email },
        // });

        // if (existingUser) {
        //   return { error: "User already exists" };
        // }

        // // Hash password
        // const hashedPassword = await hashPassword(password);

        // // Create user
        // const user = await prisma.user.create({
        //   data: {
        //     email,
        //     password: hashedPassword,
        //     tenantId,
        //   },
        // });

        // // Generate token
        // const token = generateToken({
        //   id: user.id,
        //   email: user.email,
        //   tenantId: user.tenantId || undefined,
        // });

        // return {
        //   user: {
        //     id: user.id,
        //     email: user.email,
        //     tenantId: user.tenantId,
        //   },
        //   token,
        // };

        // Mock response for now
        return {
            user: { id: "mock-id", email, tenantId },
            token: generateToken({ id: "mock-id", email, tenantId }),
        };
    } catch (error) {
        console.error("Registration error:", error);
        return { error: "Registration failed" };
    }
}

/**
 * Login user
 */
export async function loginUser(
    email: string,
    password: string
): Promise<{ user: any; token: string } | { error: string }> {
    try {
        // TODO: Uncomment when database is ready
        // // Find user
        // const user = await prisma.user.findUnique({
        //   where: { email },
        // });

        // if (!user) {
        //   return { error: "Invalid credentials" };
        // }

        // // Verify password
        // const isValid = await verifyPassword(password, user.password);

        // if (!isValid) {
        //   return { error: "Invalid credentials" };
        // }

        // // Generate token
        // const token = generateToken({
        //   id: user.id,
        //   email: user.email,
        //   tenantId: user.tenantId || undefined,
        // });

        // return {
        //   user: {
        //     id: user.id,
        //     email: user.email,
        //     tenantId: user.tenantId,
        //   },
        //   token,
        // };

        // Mock response for now
        if (email === "admin@xeno.com") {
            return {
                user: { id: "mock-id", email, tenantId: "mock-tenant" },
                token: generateToken({ id: "mock-id", email, tenantId: "mock-tenant" }),
            };
        }

        return { error: "Invalid credentials" };
    } catch (error) {
        console.error("Login error:", error);
        return { error: "Login failed" };
    }
}

/**
 * Get user from token (for protected routes)
 */
export async function getUserFromToken(
    token: string
): Promise<any | null> {
    const payload = verifyToken(token);
    if (!payload) return null;

    // TODO: Uncomment when database is ready
    // const user = await prisma.user.findUnique({
    //   where: { id: payload.id },
    // });

    // return user;

    // Mock response for now
    return {
        id: payload.id,
        email: payload.email,
        tenantId: payload.tenantId,
    };
}
