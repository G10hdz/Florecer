#!/usr/bin/env node

import { mkdir, readdir, rm } from "node:fs/promises"
import path from "node:path"
import process from "node:process"
import sharp from "sharp"

const scriptDir = path.dirname(new URL(import.meta.url).pathname)
const frontendDir = path.resolve(scriptDir, "..")
const outputDir = path.join(frontendDir, "public", "assets", "pixelart")

const requiredPredrawn = new Set([
  "star_explosion_6x5.png",
  "impact_white_6x4.png",
  "electric_ring_6x5.png",
  "charge_7x6.png",
])

const goalIcons = [
  { name: "ai_brain.png", row: 1, col: 3 },
  { name: "treasure_chest.png", row: 11, col: 11 },
  { name: "music_violin.png", row: 11, col: 4 },
  { name: "telescope.png", row: 10, col: 7 },
  { name: "plant_pot_1.png", row: 12, col: 3 },
  { name: "plant_pot_2.png", row: 12, col: 4 },
  { name: "plant_pot_3.png", row: 12, col: 5 },
  { name: "money_purse.png", row: 12, col: 6 },
  { name: "coin_crown.png", row: 12, col: 7 },
  { name: "coin_stack.png", row: 12, col: 10 },
  { name: "coins_receive.png", row: 12, col: 12 },
  { name: "gems.png", row: 12, col: 14 },
  { name: "book_tome.png", row: 13, col: 7 },
  { name: "book_open.png", row: 13, col: 8 },
]

const celebrationParticlePattern = /star|spark|twirl|twinkle|light|magic|flare|glow|circle_05/i

function fail(message) {
  console.error(`Asset import failed: ${message}`)
  process.exitCode = 1
}

async function fileExists(directory) {
  try {
    const entries = await readdir(directory)
    return Array.isArray(entries)
  } catch {
    return false
  }
}

async function listFiles(directory, extension) {
  const entries = await readdir(directory, { withFileTypes: true })
  const files = await Promise.all(entries.map(async (entry) => {
    const entryPath = path.join(directory, entry.name)
    if (entry.isDirectory()) {
      return listFiles(entryPath, extension)
    }

    return entry.isFile() && entry.name.toLowerCase().endsWith(extension)
      ? [entryPath]
      : []
  }))

  return files.flat().sort((left, right) => left.localeCompare(right))
}

function kebabCase(filename) {
  const basename = path.basename(filename, path.extname(filename)).replace(/^\d+/, "")

  return basename
    .replace(/([a-z0-9])([A-Z])/g, "$1-$2")
    .replace(/([A-Z])([A-Z][a-z])/g, "$1-$2")
    .replace(/[^a-zA-Z0-9]+/g, "-")
    .replace(/([a-zA-Z])(\d)/g, "$1-$2")
    .replace(/(\d)([a-zA-Z])/g, "$1-$2")
    .replace(/^-+|-+$/g, "")
    .toLowerCase()
}

async function normalizePng(source, destination) {
  try {
    await sharp(source, { animated: false, pages: 1 })
      .png({ compressionLevel: 9, adaptiveFiltering: false, palette: false, effort: 10 })
      .toFile(destination)
  } catch (error) {
    throw new Error(`Could not normalize ${source}: ${error.message}`)
  }
}

async function importFiles(files, destinationDirectory, rename) {
  const destinationNames = new Set()

  for (const source of files) {
    const outputName = rename(source)
    if (destinationNames.has(outputName)) {
      throw new Error(`Destination name collision: ${outputName}`)
    }

    destinationNames.add(outputName)
    await normalizePng(source, path.join(destinationDirectory, outputName))
  }
}

async function importGoalIcons(source, destinationDirectory) {
  const destinationNames = new Set()

  for (const icon of goalIcons) {
    if (destinationNames.has(icon.name)) {
      throw new Error(`Destination name collision: ${icon.name}`)
    }

    destinationNames.add(icon.name)
    await sharp(source, { animated: false, pages: 1 })
      .extract({ left: icon.col * 32, top: icon.row * 32, width: 32, height: 32 })
      .png({ compressionLevel: 9, adaptiveFiltering: false, palette: false, effort: 10 })
      .toFile(path.join(destinationDirectory, icon.name))
  }
}

async function main() {
  const sourceDirArgument = process.argv[2]
  if (!sourceDirArgument) {
    fail("Usage: node frontend/scripts/import-assets.mjs <srcDir>")
    return
  }

  const sourceDir = path.resolve(process.cwd(), sourceDirArgument)
  const manaSoulDir = path.join(sourceDir, "mana-soul-gui")
  const brackeysDir = path.join(sourceDir, "brackeys-vfx", "brackeys_vfx_bundle")
  const shikashiDir = path.join(sourceDir, "shikashi")
  const shikashiSheet = path.join(shikashiDir, "#1 - Transparent Icons.png")

  if (!(await fileExists(sourceDir))) {
    fail(`Source directory does not exist: ${sourceDir}`)
    return
  }

  if (!(await fileExists(manaSoulDir))) {
    fail(`Missing Mana Soul pack directory: ${manaSoulDir}`)
    return
  }

  if (!(await fileExists(brackeysDir))) {
    fail(`Missing Brackeys pack directory: ${brackeysDir}`)
    return
  }

  const alphaDir = path.join(brackeysDir, "particles", "alpha")
  const predrawnDir = path.join(brackeysDir, "predrawn")
  if (!(await fileExists(alphaDir)) || !(await fileExists(predrawnDir))) {
    fail("The Brackeys pack is missing particles/alpha or predrawn.")
    return
  }

  const manaSoulPngs = await listFiles(manaSoulDir, ".png")
  const brackeysPngs = await listFiles(brackeysDir, ".png")
  const brackeysTgas = await listFiles(brackeysDir, ".tga")
  const selectedParticles = (await listFiles(alphaDir, ".png"))
    .filter((file) => celebrationParticlePattern.test(path.basename(file)))
  const selectedPredrawn = (await listFiles(predrawnDir, ".png"))
    .filter((file) => requiredPredrawn.has(path.basename(file)))

  const missingPredrawn = [...requiredPredrawn].filter((name) =>
    !selectedPredrawn.some((file) => path.basename(file) === name)
  )
  if (missingPredrawn.length > 0) {
    fail(`The Brackeys pack is missing required predrawn sheets: ${missingPredrawn.join(", ")}`)
    return
  }

  const uiDir = path.join(outputDir, "ui")
  const celebrationsDir = path.join(outputDir, "celebrations")
  const goalsDir = path.join(outputDir, "goals")
  await rm(uiDir, { recursive: true, force: true })
  await rm(celebrationsDir, { recursive: true, force: true })
  await Promise.all([mkdir(uiDir, { recursive: true }), mkdir(celebrationsDir, { recursive: true })])

  await importFiles(manaSoulPngs, uiDir, (source) => `${kebabCase(source)}.png`)
  await importFiles(selectedPredrawn, celebrationsDir, (source) => path.basename(source))
  await importFiles(selectedParticles, celebrationsDir, (source) => path.basename(source))

  let goalImports = 0
  if (await fileExists(shikashiDir)) {
    await rm(goalsDir, { recursive: true, force: true })
    await mkdir(goalsDir, { recursive: true })
    await importGoalIcons(shikashiSheet, goalsDir)
    goalImports = goalIcons.length
  } else {
    console.warn(`Asset import warning: Shikashi pack directory is missing: ${shikashiDir}`)
  }

  const celebrationImports = selectedPredrawn.length + selectedParticles.length
  console.log("Asset import complete")
  console.log(`  ui: ${manaSoulPngs.length} imported, 0 skipped`)
  console.log(`  celebrations: ${celebrationImports} imported (${selectedPredrawn.length} predrawn, ${selectedParticles.length} particles), ${brackeysPngs.length - celebrationImports} PNGs skipped`)
  console.log(`  goals: ${goalImports} imported`)
  console.log(`  Brackeys TGA flipbooks: ${brackeysTgas.length} skipped (unsupported by sharp)`)
}

main().catch((error) => fail(error.message))
