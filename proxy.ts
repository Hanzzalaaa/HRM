import { NextResponse, type NextRequest } from "next/server"

export default async function proxy(request: NextRequest) {
  // TODO: Add authentication middleware here
  // For now, just allow all requests
  
  return NextResponse.next()
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)"],
}
