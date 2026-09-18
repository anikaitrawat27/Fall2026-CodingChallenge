import type { Request, Response } from "express";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { prisma } from "../lib/prisma.js";
import { ApiError } from "../lib/errors.js";
import { signToken } from "../middleware/auth.js";

export const registerSchema = z.object({
  email: z.string().email("Enter a valid email address"),
  username: z
    .string()
    .min(3, "Username must be at least 3 characters")
    .max(24)
    .regex(/^[a-zA-Z0-9_]+$/, "Letters, numbers and underscores only"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1, "Password is required"),
});

/** Shape sent to the client — never includes passwordHash. */
const publicUser = { id: true, email: true, username: true, createdAt: true } as const;

/** POST /api/auth/register */
export async function register(req: Request, res: Response) {
  const { email, username, password } = req.body as z.infer<typeof registerSchema>;

  const clash = await prisma.user.findFirst({
    where: { OR: [{ email }, { username }] },
    select: { email: true, username: true },
  });
  if (clash) {
    throw ApiError.conflict(
      clash.email === email
        ? "An account with that email already exists"
        : "That username is taken",
    );
  }

  const user = await prisma.user.create({
    data: { email, username, passwordHash: await bcrypt.hash(password, 10) },
    select: publicUser,
  });

  res.status(201).json({ user, token: signToken(user.id) });
}

/** POST /api/auth/login */
export async function login(req: Request, res: Response) {
  const { email, password } = req.body as z.infer<typeof loginSchema>;

  const user = await prisma.user.findUnique({ where: { email } });
  // Same message for "no such user" and "wrong password" so the endpoint
  // cannot be used to discover which emails have accounts.
  if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
    throw ApiError.unauthorized("Incorrect email or password");
  }

  res.json({
    user: { id: user.id, email: user.email, username: user.username, createdAt: user.createdAt },
    token: signToken(user.id),
  });
}

/** GET /api/auth/me — lets the frontend restore a session on page load. */
export async function me(req: Request, res: Response) {
  const user = await prisma.user.findUnique({
    where: { id: req.userId },
    select: publicUser,
  });
  if (!user) throw ApiError.unauthorized();
  res.json({ user });
}
