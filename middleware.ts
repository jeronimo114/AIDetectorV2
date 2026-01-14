import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers
    }
  });

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    return response;
  }

  const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value, options }) => {
          response.cookies.set({ name, value, ...options });
        });
      }
    }
  });

  const {
    data: { user }
  } = await supabase.auth.getUser();

  const pathname = request.nextUrl.pathname;

  if (!user && (pathname.startsWith("/dashboard") || pathname.startsWith("/admin"))) {
    const loginUrl = request.nextUrl.clone();
    loginUrl.pathname = "/login";
    loginUrl.searchParams.set("redirectedFrom", request.nextUrl.pathname);
    return NextResponse.redirect(loginUrl);
  }

  if (user) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("role, status")
      .eq("id", user.id)
      .single();

    if (pathname.startsWith("/admin") && profile?.role !== "admin" && profile?.role !== "super_admin") {
      return NextResponse.redirect(new URL("/", request.url));
    }

    if (profile?.status === "suspended" && !pathname.startsWith("/admin")) {
      return NextResponse.redirect(new URL("/suspended", request.url));
    }
  }

  if (!pathname.startsWith("/admin") && !pathname.startsWith("/login") && !pathname.startsWith("/signup")) {
    const { data: maintenance } = await supabase
      .from("app_settings")
      .select("value")
      .eq("key", "maintenance_mode")
      .single();

    if (maintenance?.value === true) {
      return NextResponse.redirect(new URL("/maintenance", request.url));
    }
  }

  return response;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt).*)"]
};
