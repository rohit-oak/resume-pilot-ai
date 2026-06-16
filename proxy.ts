import { NextResponse, type NextRequest } from "next/server";
import { createProxyClient } from "@/lib/supabase";

export async function proxy(request: NextRequest) {
  const start = Date.now();
  const pathname = request.nextUrl.pathname;

  const response = NextResponse.next({
    request,
  });

  console.log("[ResumePilot][proxy]", Date.now() - start, {
    pathname,
    operation: "create-response",
  });

  const clientStart = Date.now();
  const supabase = createProxyClient(request, response);

  console.log("[ResumePilot][proxy]", Date.now() - clientStart, {
    pathname,
    operation: "create-proxy-client",
  });

  const authStart = Date.now();
  await supabase.auth.getUser();

  console.log("[ResumePilot][proxy]", Date.now() - authStart, {
    pathname,
    operation: "supabase-auth-get-user",
  });

  console.log("[ResumePilot][proxy]", Date.now() - start, {
    pathname,
    operation: "total",
  });

  return response;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
