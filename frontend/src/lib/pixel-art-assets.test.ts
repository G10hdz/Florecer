import { describe, it, expect } from "vitest"
import { getGoalIconUrlByName } from "./pixel-art-assets"

describe("getGoalIconUrlByName", () => {
  it("maps IA / AI / brain keywords to ai_brain.png", () => {
    expect(getGoalIconUrlByName("Curso de IA")).toBe("/assets/pixelart/goals/ai_brain.png")
    expect(getGoalIconUrlByName("Aprender AI")).toBe("/assets/pixelart/goals/ai_brain.png")
    expect(getGoalIconUrlByName("Cerebro inteligente")).toBe("/assets/pixelart/goals/ai_brain.png")
    expect(getGoalIconUrlByName("Brain training")).toBe("/assets/pixelart/goals/ai_brain.png")
  })

  it("maps study / book / school keywords to book_open.png", () => {
    expect(getGoalIconUrlByName("Curso de inglés")).toBe("/assets/pixelart/goals/book_open.png")
    expect(getGoalIconUrlByName("Universidad")).toBe("/assets/pixelart/goals/book_open.png")
    expect(getGoalIconUrlByName("Comprar libro")).toBe("/assets/pixelart/goals/book_open.png")
  })

  it("maps music keywords to music_violin.png (accent-insensitive)", () => {
    expect(getGoalIconUrlByName("Música")).toBe("/assets/pixelart/goals/music_violin.png")
    expect(getGoalIconUrlByName("musica")).toBe("/assets/pixelart/goals/music_violin.png")
    expect(getGoalIconUrlByName("Guitarra")).toBe("/assets/pixelart/goals/music_violin.png")
    expect(getGoalIconUrlByName("mic professional")).toBe("/assets/pixelart/goals/music_violin.png")
  })

  it("maps viaje / sueño / futuro / telescopio to telescope.png (accent-insensitive)", () => {
    expect(getGoalIconUrlByName("Viaje a Japón")).toBe("/assets/pixelart/goals/telescope.png")
    expect(getGoalIconUrlByName("Mi sueño")).toBe("/assets/pixelart/goals/telescope.png")
    expect(getGoalIconUrlByName("sueno grande")).toBe("/assets/pixelart/goals/telescope.png")
    expect(getGoalIconUrlByName("Futuro")).toBe("/assets/pixelart/goals/telescope.png")
  })

  it("maps emergencia / fondo to money_purse.png", () => {
    expect(getGoalIconUrlByName("Fondo de emergencia")).toBe("/assets/pixelart/goals/money_purse.png")
    expect(getGoalIconUrlByName("Mi fondo")).toBe("/assets/pixelart/goals/money_purse.png")
  })

  it("maps inversión / startup / negocio to coin_crown.png (accent-insensitive)", () => {
    expect(getGoalIconUrlByName("Inversión")).toBe("/assets/pixelart/goals/coin_crown.png")
    expect(getGoalIconUrlByName("inversion")).toBe("/assets/pixelart/goals/coin_crown.png")
    expect(getGoalIconUrlByName("Mi startup")).toBe("/assets/pixelart/goals/coin_crown.png")
    expect(getGoalIconUrlByName("Negocio propio")).toBe("/assets/pixelart/goals/coin_crown.png")
  })

  it("maps joya / gema / anillo to gems.png", () => {
    expect(getGoalIconUrlByName("Comprar joya")).toBe("/assets/pixelart/goals/gems.png")
    expect(getGoalIconUrlByName("Anillo de compromiso")).toBe("/assets/pixelart/goals/gems.png")
  })

  it("maps planta / jardín to plant_pot_3.png (accent-insensitive)", () => {
    expect(getGoalIconUrlByName("Planta nueva")).toBe("/assets/pixelart/goals/plant_pot_3.png")
    expect(getGoalIconUrlByName("Jardín")).toBe("/assets/pixelart/goals/plant_pot_3.png")
    expect(getGoalIconUrlByName("jardin")).toBe("/assets/pixelart/goals/plant_pot_3.png")
  })

  it("falls back to coin_stack.png for unmatched names (laptop, moto, etc.)", () => {
    expect(getGoalIconUrlByName("Laptop nueva")).toBe("/assets/pixelart/goals/coin_stack.png")
    expect(getGoalIconUrlByName("Moto")).toBe("/assets/pixelart/goals/coin_stack.png")
    expect(getGoalIconUrlByName("Algo random")).toBe("/assets/pixelart/goals/coin_stack.png")
  })

  it("is case-insensitive", () => {
    expect(getGoalIconUrlByName("VIAJE")).toBe("/assets/pixelart/goals/telescope.png")
    expect(getGoalIconUrlByName("STARtUp")).toBe("/assets/pixelart/goals/coin_crown.png")
  })

  it("handles empty and whitespace names via fallback", () => {
    expect(getGoalIconUrlByName("")).toBe("/assets/pixelart/goals/coin_stack.png")
    expect(getGoalIconUrlByName("   ")).toBe("/assets/pixelart/goals/coin_stack.png")
  })

  it("only references the 14 shipped goal icons", () => {
    const shipped = [
      "ai_brain.png", "book_open.png", "book_tome.png", "coin_crown.png",
      "coin_stack.png", "coins_receive.png", "gems.png", "money_purse.png",
      "music_violin.png", "plant_pot_1.png", "plant_pot_2.png", "plant_pot_3.png",
      "telescope.png", "treasure_chest.png",
    ]
    const samples = [
      "ia", "curso", "musica", "viaje", "emergencia", "inversion",
      "joya", "planta", "laptop", "moto", "random",
    ]
    for (const name of samples) {
      const url = getGoalIconUrlByName(name)
      const file = url.replace("/assets/pixelart/goals/", "")
      expect(shipped).toContain(file)
    }
  })
})
