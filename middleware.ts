import { type NextRequest, NextResponse } from "next/server"

export async function middleware(request: NextRequest) {
  // Only protect /dashboard routes - check for Supabase auth cookie
  if (request.nextUrl.pathname.startsWith("/dashboard")) {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

    if (!supabaseUrl || !supabaseAnonKey) {
      return NextResponse.next()
    }

    // Dynamically import to avoid bundling issues
    const { updateSession } = await import("@/lib/supabase/middleware")
    return await updateSession(request)
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/dashboard/:path*"],
}
