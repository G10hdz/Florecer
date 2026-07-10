# Task 4b — Mostrar goal icons pixel-art en el dashboard

## Contexto
- Los iconos ya están importados en `frontend/public/assets/pixelart/goals/` (32x32 PNG, CC-BY ya acreditado):
  `ai_brain.png, book_open.png, book_tome.png, coin_crown.png, coin_stack.png, coins_receive.png, gems.png, money_purse.png, music_violin.png, plant_pot_1.png, plant_pot_2.png, plant_pot_3.png, telescope.png, treasure_chest.png`
- Hoy las cards de metas del dashboard (`frontend/src/components/pages/DashboardPage.tsx`) muestran el emoji 🎯 derivado localmente.
- Existe `frontend/src/components/molecules/PixelArtSprite.tsx` (ya aplica clase `.pixelart` → `image-rendering: pixelated`).
- El helper legacy `getPixelAssetUrl`/`getGoalIconUrl` en `frontend/src/lib/pixel-art-assets.ts` apunta a rutas planas inexistentes (`/assets/pixelart/goal_laptop.png`) — NO lo uses como está.

## Cambios requeridos
1. En `frontend/src/lib/pixel-art-assets.ts`, agregar (o reemplazar `getGoalIconUrl` por) una función `getGoalIconUrlByName(goalName: string): string` que mapee por keywords del nombre de la meta (case/acentos-insensitive) a `/assets/pixelart/goals/<file>.png`:
   - ia / ai / inteligencia / cerebro / brain → `ai_brain.png`
   - curso / estudio / libro / escuela / universidad → `book_open.png`
   - música / musica / guitarra / violin / concierto / mic → `music_violin.png`
   - viaje / sueño / sueno / futuro / telescopio → `telescope.png`
   - emergencia / fondo → `money_purse.png`
   - inversión / inversion / startup / negocio → `coin_crown.png`
   - joya / gema / anillo → `gems.png`
   - planta / jardín / jardin → `plant_pot_3.png`
   - default (incluye laptop, moto, etc. — no hay icono moderno en el pack) → `coin_stack.png`
2. En `DashboardPage.tsx`, en la card de meta enfocada Y en la lista/grid de metas: renderizar el icono con `PixelArtSprite` (o un `<img>` con clase `pixelart`) a 32–48px junto al nombre, reemplazando o acompañando el emoji 🎯 actual (elegir lo que quede más limpio con el layout existente; cambio mínimo).
3. Solo referenciar los 14 archivos listados arriba — cualquier otro path daría 404.
4. No tocar `bff/`, no agregar dependencias, no modificar el importer ni los assets.

## Aceptación
- `cd frontend && npm run build` pasa.
- `cd frontend && npm test` pasa (60/60; si agregás un test del mapper, más).
- Los iconos se ven en el dashboard (verificación en navegador la hace el coordinador).
- Diff mínimo, estilo consistente con el código existente.
