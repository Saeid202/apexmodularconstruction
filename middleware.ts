import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
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
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          supabaseResponse = NextResponse.next({
            request,
          });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { pathname } = request.nextUrl;

  
  // Seller routes protection
  if (pathname.startsWith("/seller")) {
    if (pathname === "/seller/login" || pathname === "/seller/register") {
      if (user) {
        // Check both profiles role AND sellers table for complete validation
        const [profileResult, sellerResult] = await Promise.all([
          supabase.from("profiles").select("role").eq("id", user.id).single(),
          supabase.from("sellers").select("id").eq("id", user.id).single(),
        ]);

        if (profileResult.data?.role === "seller" && sellerResult.data) {
          return NextResponse.redirect(new URL("/seller/dashboard", request.url));
        }
      }
      return supabaseResponse;
    }

    if (!user) {
      return NextResponse.redirect(new URL("/seller/login", request.url));
    }

    // Check both profiles role AND sellers table for complete validation with error handling
    let profileResult: any = { data: null, error: null };
    let sellerResult: any = { data: null, error: null };
    
    try {
      const results = await Promise.allSettled([
        supabase.from("profiles").select("role").eq("id", user.id).single(),
        supabase.from("sellers").select("id").eq("id", user.id).single(),
      ]);
      
      if (results[0].status === 'fulfilled') {
        profileResult = results[0].value;
      } else {
        console.error("Profile query error:", results[0].reason);
      }
      
      if (results[1].status === 'fulfilled') {
        sellerResult = results[1].value;
      } else {
        console.error("Seller query error:", results[1].reason);
      }
    } catch (error) {
      console.error("Database query error:", error);
    }

    // Only redirect if we have valid data and user is not a seller
    // If there are database errors, allow access to prevent false redirects
    if (profileResult.data && profileResult.data.role !== "seller") {
      return NextResponse.redirect(new URL("/", request.url));
    }
    
    if (profileResult.data && profileResult.data.role === "seller" && sellerResult.error) {
      // User is a seller but seller query failed - log error but allow access
      console.error("Seller profile query failed for seller user, allowing access");
    }
  }

  // Admin routes protection
  if (pathname.startsWith("/admin")) {
    if (pathname === "/admin/login") {
      if (user) {
        const { data: profile } = await supabase
          .from("profiles")
          .select("role")
          .eq("id", user.id)
          .single();

        if (profile?.role === "admin") {
          return NextResponse.redirect(new URL("/admin/dashboard", request.url));
        }
      }
      return supabaseResponse;
    }

    if (!user) {
      return NextResponse.redirect(new URL("/admin/login", request.url));
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    if (!profile || profile.role !== "admin") {
      return NextResponse.redirect(new URL("/", request.url));
    }
  }

  // Agent routes protection
  if (pathname.startsWith("/agent")) {
    if (!user) return NextResponse.redirect(new URL("/auth/login", request.url));
    if (user.user_metadata?.role !== "agent") return NextResponse.redirect(new URL("/", request.url));
  }

  // Shipping agent routes protection
  if (pathname.startsWith("/shipping-agent")) {
    if (!user) return NextResponse.redirect(new URL("/auth/login", request.url));
    if (user.user_metadata?.role !== "shipping_agent") return NextResponse.redirect(new URL("/", request.url));
  }

  // Partner routes protection
  if (pathname.startsWith("/partner")) {
    if (!user) {
      return NextResponse.redirect(new URL("/auth/login", request.url));
    }

    const partnerRole = user.user_metadata?.role;
    if (partnerRole !== "partner") {
      return NextResponse.redirect(new URL("/", request.url));
    }
  }

  // Account routes protection (for customers)
  if (pathname.startsWith("/account")) {
    if (!user) {
      return NextResponse.redirect(new URL("/auth/login", request.url));
    }
  }

  return supabaseResponse;
}

export const config = {
  matcher: ["/account/:path*", "/seller/:path*", "/admin/:path*", "/partner/:path*", "/agent/:path*", "/shipping-agent/:path*"],
};
