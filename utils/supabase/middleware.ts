import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

// Since Server Components can't write cookies, you need middleware to refresh expired Auth tokens and store them.
// The middleware is responsible for:
// (i) Refreshing the Auth token (by calling supabase.auth.getUser).
// (ii) Passing the refreshed Auth token to Server Components, so they don't attempt to refresh the same token themselves. This is accomplished with request.cookies.set.
// (iii) Passing the refreshed Auth token to the browser, so it replaces the old token. This is accomplished with response.cookies.set.
export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        // (ii) Pass the refreshed Auth token to Server Components
        setAll(cookiesToSet: any[]) {
          cookiesToSet.forEach(({ name, value, options }) =>
            request.cookies.set(name, value)
          );
          supabaseResponse = NextResponse.next({
            request,
          });
          // (iii) Pass the refreshed Auth token to the browser
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  // (i) Refresh the Auth token
  await supabase.auth.getUser();

  return response;
}
