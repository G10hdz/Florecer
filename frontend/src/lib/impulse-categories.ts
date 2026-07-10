export interface ImpulseCategory {
  id: string
  emoji: string
  label: string
  description: string
  defaultAmount: number
  color: string
}

export const DEFAULT_IMPULSE_CATEGORIES: ImpulseCategory[] = [
  { id: "delivery", emoji: "🍔", label: "Delivery", description: "Uber Eats, Rappi, etc.", defaultAmount: 150, color: "#FF6B6B" },
  { id: "shopping", emoji: "🛍️", label: "Shopping", description: "Temu, AliExpress, Shein", defaultAmount: 200, color: "#4ECDC4" },
  { id: "rides", emoji: "🚗", label: "Rides", description: "Uber, Didi, inDriver", defaultAmount: 80, color: "#45B7D1" },
  { id: "treats", emoji: "☕", label: "Daily Treat", description: "Café, snack, etc.", defaultAmount: 50, color: "#96CEB4" },
  { id: "streaming", emoji: "🎬", label: "Streaming", description: "Netflix, Spotify, etc.", defaultAmount: 150, color: "#DDA0DD" },
  { id: "merch", emoji: "🎵", label: "Merch", description: "K-pop, anime, etc.", defaultAmount: 300, color: "#FFD93D" },
]
