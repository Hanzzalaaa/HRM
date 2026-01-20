import { NextResponse } from "next/server"

// This callback route is not needed for Prisma authentication
// Redirecting to login page
export async function GET(request: Request) {
  const { origin } = new URL(request.url)
  return NextResponse.redirect(`${origin}/auth/login`)
}
