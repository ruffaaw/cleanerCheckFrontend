import { NextResponse } from "next/server";

export function middleware(req: Request) {
  const token = req.headers.get("cookie")?.includes("auth-token");

  if (!token && req.url.includes("/dashboard")) {
    return NextResponse.redirect(new URL("/login", req.url));
  }
}
