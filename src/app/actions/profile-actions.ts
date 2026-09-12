"use server";

import { randomBytes } from "crypto";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { setSessionUser } from "@/lib/session";
import { ensureUnlockedCases } from "@/lib/game-logic";
import { redirect } from "next/navigation";

export type ProfileFormState = { error?: string };

function expedienteSuffix() {
  return randomBytes(2).toString("hex").toUpperCase();
}

/**
 * Crea un perfil nuevo por dispositivo. Si el nombre ya existe en la base,
 * se le agrega un número de expediente (Kevin-7F2A) para que cada dispositivo
 * tenga su propia cuenta y nadie entre al perfil de otro por el mismo nombre.
 */
async function createPerDeviceUser(username: string) {
  for (let attempt = 0; attempt < 6; attempt++) {
    const candidate = attempt === 0 ? username : `${username}-${expedienteSuffix()}`;
    try {
      return await prisma.user.create({ data: { username: candidate } });
    } catch (e) {
      if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2002") {
        continue;
      }
      throw e;
    }
  }
  return prisma.user.create({ data: { username: `${username}-${expedienteSuffix()}${expedienteSuffix()}` } });
}

export async function createProfile(
  _prevState: ProfileFormState,
  formData: FormData,
): Promise<ProfileFormState> {
  const raw = String(formData.get("username") ?? "").trim();
  const username = raw.slice(0, 24);

  if (username.length < 3) {
    return { error: "El nombre de detective debe tener al menos 3 caracteres." };
  }
  if (!/^[a-zA-Z0-9_ ]+$/.test(username)) {
    return { error: "Usá solo letras, números, espacios y guiones bajos." };
  }

  const user = await createPerDeviceUser(username);

  await ensureUnlockedCases(user.id);
  await setSessionUser(user.id);
  redirect("/dashboard");
}
