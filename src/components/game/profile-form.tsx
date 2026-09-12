"use client";

import { useActionState } from "react";
import { createProfile, type ProfileFormState } from "@/app/actions/profile-actions";
import { Button } from "@/components/ui/button";

const initialState: ProfileFormState = {};

export function ProfileForm() {
  const [state, formAction, pending] = useActionState(createProfile, initialState);

  return (
    <form action={formAction} className="flex w-full max-w-sm flex-col gap-3">
      <label className="font-mono-tag text-[11px] text-ink-faint" htmlFor="username">
        NOMBRE DE DETECTIVE
      </label>
      <input
        id="username"
        name="username"
        placeholder="Ej: Kevin Reyes"
        autoComplete="off"
        maxLength={24}
        required
        className="h-11 rounded-sm border border-hairline-strong bg-panel-2 px-3 text-sm text-ink outline-none placeholder:text-ink-faint focus:border-gold/60"
      />
      {state.error && <p className="text-sm text-red-300">{state.error}</p>}
      <Button type="submit" disabled={pending} className="mt-1 uppercase">
        {pending ? "Abriendo expediente..." : "Crear detective"}
      </Button>
    </form>
  );
}
