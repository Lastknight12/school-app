"server only";

import { type UserRole } from "@prisma/client";
import { decode } from "next-auth/jwt";
import { type NextRequest, NextResponse } from "next/server";
import { type ZodIssue, type ZodRawShape, type z } from "zod";
import { env } from "~/env";

import { type CustomUser } from "~/server/auth";

export interface QueryError {
  message: ZodIssue[] | string;
  code: string;
  cause: string;
}

export async function getReqBody<T extends ZodRawShape>(
  req: NextRequest,
  schemaShape: z.ZodObject<T>,
) {
  const body = await req.json();
  if (req.method === "GET") {
    throw new Error("getReqBody cannot be called with the request method GET.");
  }

  const result = schemaShape.safeParse(body);

  return result;
}

export async function withAuth(
  req: NextRequest,
  handler: (req: NextRequest, session: CustomUser) => unknown,
  allowedRoles?: UserRole[],
) {
  try {
    const user = await getReqUser(req);

    if (!user)
      return NextResponse.json({ error: "Unauthorized" }, { status: 400 });

    if (allowedRoles && !allowedRoles.includes(user.role))
      return NextResponse.json({ error: "Unauthorized" }, { status: 400 });

    const response = await handler(req, user);

    return NextResponse.json(response ?? {});
  } catch (error) {
    if (error instanceof ServerError) {
      return error.toNextResponse();
    }

    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}

export async function getReqUser(req: NextRequest) {
  const token = req.cookies.get(
    env.NODE_ENV === "development"
      ? "next-auth.session-token"
      : "__Secure-next-auth.session-token",
  );

  if (!token) return;

  const decoded = await decode({
    token: token.value,
    secret: env.NEXTAUTH_SECRET!,
  });

  if (!decoded) return;

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { iat, exp, jti, sub, ...user } = decoded;

  return { id: sub, ...user } as CustomUser;
}

type ServerErrorCode =
  | "PARSE_ERROR"
  | "BAD_REQUEST"
  | "INTERNAL_SERVER_ERROR"
  | "UNAUTHORIZED"
  | "FORBIDDEN"
  | "NOT_FOUND"
  | "METHOD_NOT_SUPPORTED"
  | "TIMEOUT"
  | "CONFLICT"
  | "PRECONDITION_FAILED"
  | "PAYLOAD_TOO_LARGE"
  | "UNSUPPORTED_MEDIA_TYPE"
  | "UNPROCESSABLE_CONTENT"
  | "TOO_MANY_REQUESTS"
  | "CLIENT_CLOSED_REQUEST";

export class ServerError extends Error {
  public override readonly cause?: Error;
  public readonly code;

  constructor(opts: {
    message?: string;
    code: ServerErrorCode;
    cause?: "TypeError" | Error;
  }) {
    const cause =
      opts.cause instanceof Error ? opts.cause : new Error(opts.cause);
    const message = opts.message ?? cause?.message ?? opts.code;

    super(message, { cause });

    this.code = opts.code;
    this.name = "ServerError";

    if (!this.cause) {
      this.cause = cause;
    }
  }

  private static getHttpStatus(code: string): number {
    const httpStatusMap: Record<string, number> = {
      PARSE_ERROR: 400,
      BAD_REQUEST: 400,
      UNAUTHORIZED: 401,
      FORBIDDEN: 403,
      NOT_FOUND: 404,
      INTERNAL_SERVER_ERROR: 500,
      TIMEOUT: 504,
      METHOD_NOT_SUPPORTED: 405,
      CONFLICT: 409,
      PRECONDITION_FAILED: 412,
      PAYLOAD_TOO_LARGE: 413,
      UNPROCESSABLE_CONTENT: 422,
      TOO_MANY_REQUESTS: 429,
      CLIENT_CLOSED_REQUEST: 499,
    };

    return httpStatusMap[code] ?? 500;
  }

  public toNextResponse() {
    return NextResponse.json(
      {
        message:
          this.cause?.message === "TypeError"
            ? JSON.parse(this.message)
            : this.message,
        code: this.code,
        cause: this.cause?.message,
      },
      { status: ServerError.getHttpStatus(this.code) },
    );
  }
}
