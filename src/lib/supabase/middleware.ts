import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

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
        setAll(cookiesToSet: Array<{ name: string; value: string; options?: any }>) {
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

  // Vérification de la session via supabase.auth.getUser() (sécurisé, validé côté serveur)
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const pathname = request.nextUrl.pathname;

  // Routes protégées nécessitant obligatoirement un compte et un e-mail confirmé
  const isProtectedRoute =
    pathname.startsWith("/dashboard") || pathname.startsWith("/missions/create");

  if (isProtectedRoute) {
    // 1. Utilisateur non connecté -> Redirection vers la page de connexion
    if (!user) {
      const loginUrl = new URL("/auth/login", request.url);
      loginUrl.searchParams.set("next", pathname);
      return NextResponse.redirect(loginUrl);
    }

    // 2. Utilisateur connecté mais adresse e-mail non confirmée -> Blocage et redirection vers la page de vérification
    if (!user.email_confirmed_at) {
      const verifyUrl = new URL("/auth/verify-email", request.url);
      if (user.email) {
        verifyUrl.searchParams.set("email", user.email);
      }
      verifyUrl.searchParams.set("required", "1");
      return NextResponse.redirect(verifyUrl);
    }
  }

  return supabaseResponse;
}
