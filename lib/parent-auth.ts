import { jwtVerify } from "jose";
import { cookies } from "next/headers";

export async function getParentSession() {
  const cookieStore = await cookies();
  const token = cookieStore.get("parent_token")?.value;

  if (!token) return null;

  try {
    const secret = new TextEncoder().encode(process.env.AUTH_SECRET);
    const { payload } = await jwtVerify(token, secret);
    return payload as { id: string; name: string; email: string; role: string };
  } catch {
    return null;
  }
}