# Fotos reales para CASEFILE

La interfaz ya está preparada para mostrar fotos reales. Si un archivo no existe,
se muestra automáticamente una ilustración de reemplazo — nada se rompe. Apenas
agregues el archivo con el nombre exacto de abajo, aparece solo, sin tocar código.

Formato: `.jpg` (podés cambiarlo por `.png` editando el `src` en el componente
correspondiente si preferís). Tamaño sugerido: horizontal, mínimo 800×500px.

## /images/cases/ — portada del expediente y tarjeta del dashboard

- `caso-001.jpg` — imagen de portada de "El último tren" (ej: un vagón de tren de noche)

## /images/suspects/ — retrato de cada sospechoso

- `laura-mendez.jpg`
- `martin-vega.jpg`
- `diego-torres.jpg`
- `sofia-rios.jpg`

## /images/locations/ — foto de cada ubicación investigable

- `estacion.jpg`
- `vagon.jpg`
- `anden.jpg`
- `oficina-guardia.jpg`

## /images/evidence/ — foto de cada pista/evidencia

- `mancha-de-sangre.jpg`
- `huella-de-bota-reglamentaria.jpg`
- `boleto-de-tren-de-laura.jpg`
- `tarjeta-sim-descartada.jpg`
- `nota-escrita.jpg`
- `llave-maestra-faltante.jpg`
- `corte-de-camaras-de-seis-minutos.jpg`
- `recibo-de-casa-de-empeno.jpg`
- `fotos-de-diego-torres.jpg`

## Cómo se generan estos nombres

El nombre de archivo sale de convertir el título real (el que está en
`prisma/seed.ts`) a minúsculas, sin acentos, con guiones en vez de espacios —
ver `src/lib/slug.ts`. Si en el futuro agregás el Caso #002 con sus propios
sospechosos/pistas, los nombres de archivo esperados van a salir solos siguiendo
la misma regla: "Diamante rosa" → `diamante-rosa.jpg`.

## Generar las imágenes con IA

Si querés usar un generador de imágenes (Midjourney, DALL·E, Nano Banana, etc.)
en lugar de fotos reales, un prompt que funciona bien con la estética del juego:

> "Fotografía cinematográfica oscura, estilo noir policial, [describir la
> escena/objeto/persona], iluminación dramática de una sola fuente, grano de
> película, paleta desaturada con negros profundos y un acento rojo o dorado
> apagado, sin texto ni marcas de agua."
