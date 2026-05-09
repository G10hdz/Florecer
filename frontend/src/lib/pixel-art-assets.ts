/**
 * Florecer Pixel Art Asset System
 *
 * Designed for Google Cloud Vertex API generation.
 * 18k MXN in credits = ~6,000-12,000 images depending on model.
 * 
 * Style guide for consistent pixel art:
 * - 64x64 or 128x128 base resolution
 * - 16-color palette (warm, pastel, Latin American inspired)
 * - Isometric or front-facing perspective
 * - Cute/chibi proportions (big head, small body)
 * - White/transparent background for layering
 * 
 * Prompt template:
 * "Pixel art [subject], [style modifiers], 
 *  64x64 resolution, 16-color palette, 
 *  transparent background, crisp edges, 
 *  game asset, centered"
 */

export type PixelAssetCategory = 
  | "avatar_base"
  | "avatar_expression"
  | "cosmetic_hat"
  | "cosmetic_dress" 
  | "cosmetic_shoes"
  | "cosmetic_accessory"
  | "companion_mood"
  | "goal_icon"
  | "ui_element"
  | "celebration"

export interface PixelAsset {
  id: string
  category: PixelAssetCategory
  name: string
  prompt: string
  negativePrompt?: string
  width: number
  height: number
  seed?: number
}

// ─────────────────────────────────────────────────────────────
// Style Modifiers (append to all prompts for consistency)
// ─────────────────────────────────────────────────────────────

export const BASE_STYLE = [
  "pixel art",
  "64x64 resolution", 
  "16-color limited palette",
  "cute chibi proportions",
  "big head small body",
  "warm pastel colors",
  "Latin American folk art inspired",
  "crisp pixel edges",
  "transparent background",
  "game sprite asset",
  "centered composition",
].join(", ")

export const NEGATIVE_STYLE = [
  "photorealistic",
  "3D render",
  "blurry",
  "gradient background",
  "complex background",
  "multiple subjects",
  "low resolution",
  "anti-aliased edges",
].join(", ")

// ─────────────────────────────────────────────────────────────
// Asset Catalog
// ─────────────────────────────────────────────────────────────

export const AVATAR_BASES: PixelAsset[] = [
  {
    id: "avatar_base_1",
    category: "avatar_base",
    name: "Base Default",
    prompt: `Cute chibi girl with brown skin and dark curly hair, wearing simple white dress, standing pose, ${BASE_STYLE}`,
    width: 64,
    height: 64,
  },
  {
    id: "avatar_base_2", 
    category: "avatar_base",
    name: "Base Short Hair",
    prompt: `Cute chibi girl with brown skin and short black hair, wearing simple white dress, standing pose, ${BASE_STYLE}`,
    width: 64,
    height: 64,
  },
  {
    id: "avatar_base_3",
    category: "avatar_base", 
    name: "Base Long Hair",
    prompt: `Cute chibi girl with brown skin and long flowing dark hair, wearing simple white dress, standing pose, ${BASE_STYLE}`,
    width: 64,
    height: 64,
  },
]

export const COMPANION_MOODS: PixelAsset[] = [
  {
    id: "companion_sad",
    category: "companion_mood",
    name: "Companion Sad",
    prompt: `Cute small magical seedling sprite with tiny face, drooping leaves, rain cloud above, looking down, ${BASE_STYLE}`,
    negativePrompt: NEGATIVE_STYLE,
    width: 64,
    height: 64,
  },
  {
    id: "companion_neutral",
    category: "companion_mood",
    name: "Companion Neutral",
    prompt: `Cute small magical seedling sprite with tiny face, neutral expression, small leaves, ${BASE_STYLE}`,
    negativePrompt: NEGATIVE_STYLE,
    width: 64,
    height: 64,
  },
  {
    id: "companion_happy",
    category: "companion_mood",
    name: "Companion Happy",
    prompt: `Cute small magical seedling sprite with tiny smiling face, bright green leaves, small flowers blooming, ${BASE_STYLE}`,
    negativePrompt: NEGATIVE_STYLE,
    width: 64,
    height: 64,
  },
  {
    id: "companion_excited",
    category: "companion_mood",
    name: "Companion Excited",
    prompt: `Cute small magical seedling sprite with tiny joyful face, sparkling eyes, rainbow petals, jumping pose, stars around, ${BASE_STYLE}`,
    negativePrompt: NEGATIVE_STYLE,
    width: 64,
    height: 64,
  },
]

export const COSMETICS_HAT: PixelAsset[] = [
  {
    id: "hat_sun",
    category: "cosmetic_hat",
    name: "Sombrero de Sol",
    prompt: `Cute wide-brimmed straw sun hat with small sunflower, pixel art hat item, ${BASE_STYLE}`,
    width: 64,
    height: 32,
  },
  {
    id: "hat_leaf",
    category: "cosmetic_hat",
    name: "Corona de Hojas",
    prompt: `Cute leafy crown made of green vines and small flowers, pixel art head accessory, ${BASE_STYLE}`,
    width: 64,
    height: 32,
  },
  {
    id: "hat_beret",
    category: "cosmetic_hat",
    name: "Boina Artista",
    prompt: `Cute red beret with small paint palette pin, pixel art hat item, ${BASE_STYLE}`,
    width: 64,
    height: 32,
  },
]

export const COSMETICS_DRESS: PixelAsset[] = [
  {
    id: "dress_spring",
    category: "cosmetic_dress",
    name: "Vestido Primavera",
    prompt: `Cute pastel pink dress with flower patterns, pixel art clothing item, ${BASE_STYLE}`,
    width: 64,
    height: 48,
  },
  {
    id: "dress_autumn",
    category: "cosmetic_dress",
    name: "Vestido Otoño",
    prompt: `Cute warm orange and brown dress with leaf patterns, pixel art clothing item, ${BASE_STYLE}`,
    width: 64,
    height: 48,
  },
  {
    id: "dress_tech",
    category: "cosmetic_dress",
    name: "Overol Tech",
    prompt: `Cute denim overalls with circuit board patches, pixel art clothing item, ${BASE_STYLE}`,
    width: 64,
    height: 48,
  },
]

export const GOAL_ICONS: PixelAsset[] = [
  {
    id: "goal_laptop",
    category: "goal_icon",
    name: "Laptop Icon",
    prompt: `Cute open laptop with code on screen and small sparkles, pixel art item icon, ${BASE_STYLE}`,
    width: 64,
    height: 64,
  },
  {
    id: "goal_motorbike",
    category: "goal_icon",
    name: "Motorbike Icon",
    prompt: `Cute red scooter with basket of flowers, pixel art vehicle icon, ${BASE_STYLE}`,
    width: 64,
    height: 64,
  },
  {
    id: "goal_ai",
    category: "goal_icon",
    name: "AI Brain Icon",
    prompt: `Cute glowing brain with circuit patterns and small stars, pixel art tech icon, ${BASE_STYLE}`,
    width: 64,
    height: 64,
  },
  {
    id: "goal_startup",
    category: "goal_icon",
    name: "Rocket Startup",
    prompt: `Cute small rocket launching with flower trail, pixel art icon, ${BASE_STYLE}`,
    width: 64,
    height: 64,
  },
]

export const CELEBRATION_SPRITES: PixelAsset[] = [
  {
    id: "celebration_confetti",
    category: "celebration",
    name: "Confetti Burst",
    prompt: `Colorful confetti burst with stars and flowers, pixel art particle effect, ${BASE_STYLE}`,
    width: 128,
    height: 128,
  },
  {
    id: "celebration_levelup",
    category: "celebration",
    name: "Level Up Aura",
    prompt: `Golden glowing aura with floating sparkles and level up text, pixel art effect, ${BASE_STYLE}`,
    width: 128,
    height: 128,
  },
]

// ─────────────────────────────────────────────────────────────
// Full Catalog
// ─────────────────────────────────────────────────────────────

export const FULL_CATALOG: PixelAsset[] = [
  ...AVATAR_BASES,
  ...COMPANION_MOODS,
  ...COSMETICS_HAT,
  ...COSMETICS_DRESS,
  ...GOAL_ICONS,
  ...CELEBRATION_SPRITES,
]

// ─────────────────────────────────────────────────────────────
// Vertex API Prompt Builder
// ─────────────────────────────────────────────────────────────

export interface VertexPromptPayload {
  prompt: string
  negativePrompt?: string
  width: number
  height: number
  seed?: number
  guidanceScale?: number
  numInferenceSteps?: number
}

export function buildVertexPrompt(asset: PixelAsset): VertexPromptPayload {
  return {
    prompt: asset.prompt,
    negativePrompt: asset.negativePrompt || NEGATIVE_STYLE,
    width: asset.width,
    height: asset.height,
    seed: asset.seed,
    guidanceScale: 7.5,
    numInferenceSteps: 50,
  }
}

/**
 * Generate all prompts as a batch file for Vertex API
 */
export function generateBatchPrompts(assets: PixelAsset[] = FULL_CATALOG): string {
  return assets
    .map(
      (asset) => `
# ${asset.name} (${asset.id})
# Category: ${asset.category}
PROMPT: ${asset.prompt}
NEGATIVE: ${asset.negativePrompt || NEGATIVE_STYLE}
SIZE: ${asset.width}x${asset.height}
---
`
    )
    .join("\n")
}

// ─────────────────────────────────────────────────────────────
// Asset Path Helpers (for use in components)
// ─────────────────────────────────────────────────────────────

export function getPixelAssetUrl(assetId: string): string {
  // In production, these would be served from your CDN (R2, etc.)
  // For now, use placeholder or local path
  return `/assets/pixelart/${assetId}.png`
}

export function getCompanionSpriteUrl(mood: "sad" | "neutral" | "happy" | "excited"): string {
  return getPixelAssetUrl(`companion_${mood}`)
}

export function getGoalIconUrl(goalType: string): string {
  const mapping: Record<string, string> = {
    laptop: "goal_laptop",
    motorbike: "goal_motorbike",
    ai: "goal_ai",
    startup: "goal_startup",
    default: "goal_laptop",
  }
  return getPixelAssetUrl(mapping[goalType] || mapping.default)
}
