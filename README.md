# CASEFILE

Juego web de detectives. MVP jugable de punta a punta:

Landing → Dashboard → Caso → Investigación → Pistas → Interrogatorio → Acusación → Resultado → Recompensa → Dashboard

## Stack

Next.js 16 (App Router) · TypeScript · Tailwind CSS v4 · Prisma 6 (PostgreSQL) · lucide-react · sonner

## Puesta en marcha

### 1. Instalar dependencias

```bash
npm install
```

### 2. Configurar la base de datos

Necesitás una base PostgreSQL (local, o un servicio como Neon / Supabase / Vercel Postgres).

Editá `.env` y poné tu connection string real:

```
DATABASE_URL="postgresql://usuario:password@localhost:5432/casefile?schema=public"
```

### 3. Generar el cliente de Prisma y crear las tablas

```bash
npx prisma generate
npx prisma migrate dev --name init
```

### 4. Sembrar el Caso #001 "El último tren" y los logros

```bash
npm run db:seed
```

(Esto corre `prisma/seed.ts`, que también se ejecuta automáticamente después de cada `migrate dev`.)

### 5. Levantar el proyecto

```bash
npm run dev
```

Abrí http://localhost:3000, creá tu detective (no hay contraseña, es un perfil local por
nombre) y jugá el caso completo.

## Notas importantes

- **El culpable nunca se manda al cliente.** Toda la lógica de acusación, cálculo de XP y
  monedas corre en `src/lib/game-logic.ts`, del lado del servidor, usando Server Actions
  (`src/app/actions/*.ts`). El campo `Suspect.isGuilty` jamás se serializa hacia componentes
  cliente antes de que el caso termine.
- **Estructura**:
  - `prisma/schema.prisma` — modelo de datos completo.
  - `prisma/seed.ts` — contenido del Caso #001 (sospechosos, pistas, ubicaciones, diálogos).
  - `src/lib/game-logic.ts` — funciones reutilizables del juego (iniciar investigación,
    descubrir pista, responder diálogo, acusar, calcular recompensa).
  - `src/lib/xp.ts` — curva de experiencia y niveles.
  - `src/app/actions/` — Server Actions que exponen `game-logic.ts` a los componentes cliente.
  - `src/components/game/` — UI específica del juego (tablero del caso, interrogatorio,
    acusación, evidencias).
  - `src/components/ui/` — primitivas visuales reutilizables (botón, card, badge, modal).
- **Sin multiplayer, sin pagos, sin IA externa** — todos los diálogos de interrogatorio están
  predefinidos en `prisma/seed.ts`, tal como se pidió para este MVP.
- Para desplegar en Vercel: configurá `DATABASE_URL` en las variables de entorno del proyecto
  y corré las migraciones contra tu base de producción antes de desplegar (o con un script
  de `postinstall`).

## Fotos reales (escenas, sospechosos, evidencias)

El diseño está preparado para mostrar fotografías reales, pero no vienen incluidas:
no las genero automáticamente ni las tomo de internet (son contenido con derechos de
autor, y esto es tu producto comercial). En su lugar, cada foto tiene un lugar exacto
esperando en `public/images/` — si el archivo no está, se ve una ilustración de
reemplazo en su lugar, sin romper nada.

Mirá `public/images/README.md` para la lista exacta de nombres de archivo que
necesita el Caso #001 (por ejemplo `public/images/suspects/laura-mendez.jpg`,
`public/images/evidence/recibo-de-casa-de-empeno.jpg`, etc.), incluyendo un
prompt sugerido si querés generarlas con una IA de imágenes.

## Próximos pasos sugeridos (no incluidos en este MVP)

- Casos #002 en adelante (el modelo de datos ya soporta agregar más `Case` vía seed).
- Sonido real (hay ganchos preparados en la UI para agregarlo).
- Sistema de pistas falsas con penalización visible en el resultado.
- Multiplayer / ranking global.
