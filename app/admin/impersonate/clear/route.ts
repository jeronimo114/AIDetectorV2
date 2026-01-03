import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const response = NextResponse.redirect(new URL("/admin/users", request.url));
  response.cookies.set({
    name: "impersonate_user_id",
    value: "",
    maxAge: 0,
    path: "/"
  });
  response.cookies.set({
    name: "impersonate_user_email",
    value: "",
    maxAge: 0,
    path: "/"
  });
  return response;
}
