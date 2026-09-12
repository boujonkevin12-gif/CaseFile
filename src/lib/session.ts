import "server-only";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";

const SESSION_COOKIE = "casefile_detective_id";

/**
 * CASEFILE usa un perfil local simple: no hay contraseñas ni login real.
 * El "detective" se identifica con un id guardado en una cookie httpOnly.
 */
export async function getCurrentUser() {
  const store = await cookies();
  const id = store.get(SESSION_COOKIE)?.value;
  if (!id) return null;

  const user = await prisma.user.findUnique({ where: { id } });
  return user;
}

export async function setSessionUser(userId: string) {
  const store = await cookies();
  store.set(SESSION_COOKIE, userId, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 365,
  });
}

export async function clearSession() {
  const store = await cookies();
  store.delete(SESSION_COOKIE);
}
