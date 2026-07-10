/**
 * PixelArtStudio — Tu taller de arte dentro de Florecer
 *
 * Te guía paso a paso para generar cada asset.
 * Muestra prompts listos para copiar, placeholders,
 * y tu progreso visual mientras construyes el juego.
 */
import * as React from "react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/Button"
import {
  FULL_CATALOG,
  type PixelAsset,
  buildVertexPrompt,
} from "@/lib/pixel-art-assets"

const CATEGORIES = [
  { id: "companion_mood", label: "🌱 Compañera", desc: "4 estados emocionales" },
  { id: "avatar_base", label: "👤 Avatares", desc: "Bases para tu personaje" },
  { id: "cosmetic_hat", label: "🎩 Sombreros", desc: "Accesorios de cabeza" },
  { id: "cosmetic_dress", label: "👗 Vestidos", desc: "Ropa y outfits" },
  { id: "cosmetic_accessory", label: "💍 Accesorios", desc: "Items decorativos" },
  { id: "cosmetic_shoes", label: "👠 Zapatos", desc: "Calzado" },
  { id: "goal_icon", label: "🎯 Metas", desc: "Iconos de objetivos" },
  { id: "celebration", label: "✨ Celebraciones", desc: "Efectos especiales" },
] as const

function PixelArtStudio() {
  const [selectedCategory, setSelectedCategory] = React.useState<string>("companion_mood")
  const [selectedAsset, setSelectedAsset] = React.useState<PixelAsset | null>(null)
  const [copied, setCopied] = React.useState(false)

  // Check which assets exist (in a real app, this would check the filesystem)
  const assetStatuses = React.useMemo(() => {
    return FULL_CATALOG.map((asset) => ({
      asset,
      status: "missing" as const,
    }))
  }, [])

  const filteredAssets = assetStatuses.filter(
    (s) => s.asset.category === selectedCategory
  )

  const progress = {
    total: FULL_CATALOG.length,
    done: 0, // Would be calculated from actual files
    percentage: 0,
  }

  const handleCopyPrompt = (asset: PixelAsset) => {
    const prompt = buildVertexPrompt(asset)
    navigator.clipboard.writeText(prompt.prompt)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-base to-surface">
      <div className="max-w-4xl mx-auto p-4 space-y-6 pb-24">
        {/* Header */}
        <header className="py-4">
          <h1 className="text-3xl font-bold text-foreground">
            🎨 Estudio de Pixel Art
          </h1>
          <p className="text-muted-foreground mt-2">
            Genera tus assets uno por uno. Copia el prompt, pégalo en Vertex AI,
            retoca en tu editor favorito, y súbelo a la app.
          </p>
        </header>

        {/* Progress */}
        <div className="bg-surface rounded-2xl border-2 border-border p-5">
          <div className="flex justify-between items-center mb-3">
            <h2 className="text-lg font-bold">Progreso del estudio</h2>
            <span className="text-2xl font-bold text-primary">
              {progress.done}/{progress.total}
            </span>
          </div>
          <div className="w-full h-3 bg-secondary rounded-full overflow-hidden">
            <div
              className="h-full rounded-full bg-gradient-to-r from-primary to-pop transition-all duration-700"
              style={{ width: `${progress.percentage}%` }}
            />
          </div>
          <p className="text-sm text-muted-foreground mt-2">
            {progress.total - progress.done} assets pendientes. ¡Tú puedes! ✨
          </p>
        </div>

        {/* Category Selector */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {CATEGORIES.map((cat) => {
            const isActive = cat.id === selectedCategory
            const catAssets = assetStatuses.filter((s) => s.asset.category === cat.id)
            const catDone = catAssets.filter((s) => s.status !== "missing").length

            return (
              <button
                key={cat.id}
                onClick={() => {
                  setSelectedCategory(cat.id)
                  setSelectedAsset(null)
                }}
                className={cn(
                  "p-4 rounded-2xl border-2 text-left transition-all duration-200",
                  isActive
                    ? "border-primary bg-primary/10 shadow-md"
                    : "border-border bg-surface hover:border-primary/30"
                )}
              >
                <div className="text-2xl mb-2">{cat.label.split(" ")[0]}</div>
                <div className="font-semibold text-sm">{cat.label.split(" ").slice(1).join(" ")}</div>
                <div className="text-xs text-muted-foreground mt-1">{cat.desc}</div>
                <div className="text-xs font-medium mt-2 text-primary">
                  {catDone}/{catAssets.length} listos
                </div>
              </button>
            )
          })}
        </div>

        {/* Asset Grid */}
        <div className="bg-surface rounded-2xl border-2 border-border p-5">
          <h2 className="text-lg font-bold mb-4">
            {CATEGORIES.find((c) => c.id === selectedCategory)?.label}
          </h2>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {filteredAssets.map(({ asset, status }) => {
              const isSelected = selectedAsset?.id === asset.id
              const isDone = status !== "missing"

              return (
                <button
                  key={asset.id}
                  onClick={() => setSelectedAsset(asset)}
                  className={cn(
                    "relative p-4 rounded-xl border-2 transition-all duration-200 text-left",
                    isSelected
                      ? "border-primary bg-primary/10"
                      : "border-border hover:border-primary/30",
                    isDone && "opacity-60"
                  )}
                >
                  {/* Status Dot */}
                  <div
                    className={cn(
                      "absolute top-2 right-2 w-3 h-3 rounded-full border-2 border-white",
                      status === "missing" && "bg-red-400"
                    )}
                  />

                  {/* Placeholder */}
                  <div className="aspect-square bg-secondary/50 rounded-lg mb-3 flex items-center justify-center">
                    <span className="text-3xl opacity-50">
                      {status === "missing" ? "🎨" : "✨"}
                    </span>
                  </div>

                  <div className="text-sm font-semibold truncate">{asset.name}</div>
                  <div className="text-xs text-muted-foreground mt-1">
                    {asset.width}x{asset.height}px
                  </div>
                </button>
              )
            })}
          </div>
        </div>

        {/* Selected Asset Detail */}
        {selectedAsset && (
          <div className="bg-surface rounded-2xl border-2 border-primary p-6 space-y-4">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-xl font-bold">{selectedAsset.name}</h3>
                <p className="text-sm text-muted-foreground">
                  ID: {selectedAsset.id} · {selectedAsset.width}x{selectedAsset.height}px
                </p>
              </div>
              <div className="text-3xl">🎨</div>
            </div>

            {/* Prompt */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Prompt para Vertex AI</label>
              <div className="relative">
                <pre className="bg-secondary/50 rounded-xl p-4 text-sm font-mono whitespace-pre-wrap break-all">
                  {buildVertexPrompt(selectedAsset).prompt}
                </pre>
                <Button
                  onClick={() => handleCopyPrompt(selectedAsset)}
                  variant="secondary"
                  size="sm"
                  className="absolute top-2 right-2"
                >
                  {copied ? "¡Copiado! ✅" : "📋 Copiar"}
                </Button>
              </div>
            </div>

            {/* Negative Prompt */}
            {selectedAsset.negativePrompt && (
              <div className="space-y-2">
                <label className="text-sm font-medium">Negative Prompt</label>
                <pre className="bg-red-500/5 border border-red-500/20 rounded-xl p-4 text-sm font-mono whitespace-pre-wrap break-all text-red-700">
                  {selectedAsset.negativePrompt}
                </pre>
              </div>
            )}

            {/* Instructions */}
            <div className="bg-primary/5 rounded-xl p-4 space-y-2">
              <h4 className="font-semibold text-sm">📋 Pasos a seguir:</h4>
              <ol className="text-sm text-muted-foreground space-y-1 list-decimal list-inside">
                <li>Copia el prompt de arriba</li>
                <li>Ve a <a href="https://console.cloud.google.com/vertex-ai/studio" target="_blank" rel="noopener noreferrer" className="text-primary underline">Vertex AI Studio</a></li>
                <li>Selecciona "Image Generation"</li>
                <li>Pega el prompt y ajusta parámetros (guidance: 7.5, steps: 50)</li>
                <li>Genera 3-5 variantes y elige la mejor</li>
                <li>Ábrela en Aseprite/Pixaki/Photoshop para retocar</li>
                <li>Exporta como PNG con fondo transparente</li>
                <li>Guárdala en <code className="bg-secondary px-1 rounded">public/assets/pixelart/{selectedAsset.category}/</code></li>
              </ol>
            </div>

            {/* File Path */}
            <div className="flex items-center gap-2 p-3 bg-secondary/30 rounded-xl">
              <span className="text-sm font-mono text-muted-foreground">
                public/assets/pixelart/{selectedAsset.category}/{selectedAsset.id}.png
              </span>
            </div>
          </div>
        )}

        {/* Tips */}
        <div className="bg-gradient-to-r from-amber-500/10 to-orange-500/10 rounded-2xl border-2 border-amber-500/20 p-5">
          <h3 className="font-bold text-amber-800 mb-2">💡 Tips para retocar</h3>
          <ul className="text-sm text-amber-700 space-y-1">
            <li>• Usa Aseprite ($20) o Lospec (gratis) para pixel art puro</li>
            <li>• Photoshop funciona si configuras el pincel a 1px sin anti-aliasing</li>
            <li>• La paleta debe ser exactamente los 16 colores del guide</li>
            <li>• Todo asset debe tener borde negro de 1px para consistencia</li>
            <li>• Fondo transparente (no blanco, no magenta)</li>
          </ul>
        </div>
      </div>
    </div>
  )
}

export { PixelArtStudio }
