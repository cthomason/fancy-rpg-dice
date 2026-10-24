import DiceBox from "@3d-dice/dice-box-threejs";
import "./style.css";

// Themes: Each color swatch has its own dice colors
// HACK: just hard code everything for now
const PROFILES = {
  // --- Custom Solid Colors ---
  crimson:      { label: "Crimson",        swatch: "#991b1b", custom: { background: "#991b1b", foreground: "#ffffff", outline: "#991b1b", texture: "none", material: "plastic" } },
  emerald:      { label: "Emerald",        swatch: "#1b7a43", custom: { background: "#1b7a43", foreground: "#ffffff", outline: "#1b7a43", texture: "none", material: "plastic" } },
  purple:       { label: "Royal Purple",         swatch: "#6b21a8", custom: { background: "#6b21a8", foreground: "#ffffff", outline: "#6b21a8", texture: "none", material: "plastic" } },

  // --- RPG Damage & Elemental Themes ---
  radiant:      { label: "Radiant",        swatch: "radial-gradient(circle, #ffffff, #F9B333)", colorset: "radiant" },
  fire:         { label: "Fire",           swatch: "radial-gradient(circle, #f8d84f, #f43c04, #910200)", colorset: "fire" },
  ice:          { label: "Ice",            swatch: "radial-gradient(circle, #e0f2fe, #21B9AF)", colorset: "ice" },
  cold:         { label: "Cold",           swatch: "radial-gradient(circle, #21B9AF, #1e3a8a)", colorset: "cold" },
  poison:       { label: "Poison",         swatch: "radial-gradient(circle, #84ef62, #3b0764)", colorset: "poison" },
  acid:         { label: "Acid",           swatch: "radial-gradient(circle, #A9FF70, #15803d)", colorset: "acid" },
  thunder:      { label: "Thunder",        swatch: "radial-gradient(circle, #D8C759, #52525b)", colorset: "thunder" },
  lightning:    { label: "Lightning",      swatch: "radial-gradient(circle, #FFC500, #f17105)", colorset: "lightning" },
  air:          { label: "Air",            swatch: "radial-gradient(circle, #ffffff, #94a3b8)", colorset: "air" },
  water:        { label: "Water",          swatch: "radial-gradient(circle, #60E3FF, #1e40af)", colorset: "water" },
  earth:        { label: "Earth",          swatch: "radial-gradient(circle, #6C9943, #56341A)", colorset: "earth" },
  force:        { label: "Force",          swatch: "radial-gradient(circle, #FF97FF, #701a75)", colorset: "force" },
  psychic:      { label: "Psychic",        swatch: "radial-gradient(circle, #f472b6, #4c1d95)", colorset: "psychic" },
  necrotic:     { label: "Necrotic",       swatch: "radial-gradient(circle, #dc2626, #111111)", colorset: "necrotic" },

  // --- Fantasy & Special Themes ---
  bloodmoon:    { label: "Blood Moon",     swatch: "radial-gradient(circle, #eab308, #7f1d1d)", colorset: "bloodmoon" },
  astralsea:    { label: "Astral Sea",     swatch: "radial-gradient(circle, #e2e8f0, #334155)", colorset: "astralsea" },
  starynight:   { label: "Starry Night",   swatch: "radial-gradient(circle, #4F708F, #091636)", colorset: "starynight" }, // Note: single 'r' in library
  bronze:       { label: "Thylean Bronze", swatch: "radial-gradient(circle, #FFB066, #9a3412)", colorset: "bronze" },
  dragons:      { label: "Dragons",        swatch: "radial-gradient(circle, #FFC000, #B80000)", colorset: "dragons" },
  inspired:     { label: "Inspired",       swatch: "radial-gradient(circle, #FFD700, #C4C4B6)", colorset: "inspired" },
  glitterparty: { label: "Glitter Party",  swatch: "linear-gradient(135deg, #FFB5F5, #7FC9FF, #A17FFF)", colorset: "glitterparty" },
  pinkdreams:   { label: "Pink Dreams",    swatch: "linear-gradient(135deg, #ff007f, #f8c8dc)", colorset: "pinkdreams" },
  breebaby:     { label: "Pastel Sunset",  swatch: "linear-gradient(135deg, #fe5f55, #f7d1cd, #7a9e9f)", colorset: "breebaby" },
  birdup:       { label: "Bird Up",        swatch: "linear-gradient(135deg, #F17105, #D11149, #6610F2)", colorset: "birdup" },
  tigerking:    { label: "Tiger King",     swatch: "radial-gradient(circle, #FFCC40, #78350f)", colorset: "tigerking" },

  // --- Classics & Wildcards ---
  black:        { label: "Obsidian Black", swatch: "#111111", colorset: "black" },
  white:        { label: "Ivory White",    swatch: "#f8fafc", colorset: "white" },
  rainbow:      { label: "Rainbow",        swatch: "linear-gradient(135deg, #ef4444, #eab308, #22c55e, #3b82f6, #a855f7)", colorset: "rainbow" }
};

let currentProfile = PROFILES.crimson;
let dicePool = {}; // e.g., { 20: 1, 6: 2 }

// Initialize 3D Dice Box
const box = new DiceBox("#dice-canvas", {
  assetPath: "/",
  theme_customColorset: currentProfile.custom,
  baseScale: 100,
  strength: 2,
  sounds: false
});

await box.initialize();

// Tap Die Buttons to Increment Pool
document.querySelectorAll(".die-btn").forEach((btn) => {
  btn.addEventListener("click", () => {
    const sides = parseInt(btn.dataset.sides, 10);
    dicePool[sides] = (dicePool[sides] || 0) + 1;
    
    const badge = btn.querySelector(".badge");
    badge.textContent = dicePool[sides];
    badge.classList.remove("hidden");
  });
});


document.getElementById("roll-btn").addEventListener("click", async () => {
  const entries = Object.entries(dicePool);
  if (entries.length === 0) {
    // Default to 1d20 if nothing is queued!
    entries.push(["20", 1]);
  }

  // Turn entries like [["20", 1], ["6", 2]] into ["1d20", "2d6"]
  const notationParts = [];
  for (const [sides, count] of entries) {
    notationParts.push(`${count}d${sides}`);
  }

  const fullNotation = notationParts.join("+");
  document.getElementById("result-banner").classList.add("hidden");

  const result = await box.roll(fullNotation);
  
  // Display the results banner
  document.getElementById("result-total").textContent = result.total;
  const rollsList = result.sets.map(s => `${s.num}d${s.type}: [${s.rolls.map(r => r.value).join(", ")}]`).join(" + ");
  document.getElementById("result-breakdown").textContent = rollsList;
  document.getElementById("result-banner").classList.remove("hidden");
});

// Clear pool & table
document.getElementById("clear-btn").addEventListener("click", () => {
  dicePool = {};
  document.querySelectorAll(".badge").forEach(b => b.classList.add("hidden"));
  document.getElementById("result-banner").classList.add("hidden");
  box.clearDice();
});

// Theme selector
// Drawer Open / Close Controls
const drawerEl = document.getElementById("dice-drawer");
const backdropEl = document.getElementById("drawer-backdrop");

function toggleDrawer(open) {
  drawerEl.classList.toggle("open", open);
  backdropEl.classList.toggle("hidden", !open);
}

document.getElementById("dice-drawer-btn").addEventListener("click", () => toggleDrawer(true));
document.getElementById("close-drawer-btn").addEventListener("click", () => toggleDrawer(false));
backdropEl.addEventListener("click", () => toggleDrawer(false));

// Auto-populate the Left Drawer AND the Preset Modal Dropdown from PROFILES
const diceListEl = document.getElementById("dice-list");
const presetThemeSelect = document.getElementById("preset-theme");

for (const [key, profile] of Object.entries(PROFILES)) {
  // Add button to the Left Dice Drawer
  const btn = document.createElement("button");
  btn.className = `swatch-item ${key === "crimson" ? "active" : ""}`;
  btn.dataset.theme = key;
  btn.innerHTML = `
    <span class="swatch-dot" style="background: ${profile.swatch};"></span>
    <span class="swatch-name">${profile.label}</span>
  `;
  btn.addEventListener("click", () => {
    applyTheme(key);
    toggleDrawer(false);
  });
  diceListEl.appendChild(btn);

  // Add option to the New Preset Modal <select>
  const opt = document.createElement("option");
  opt.value = key;
  opt.textContent = `${profile.label} Dice`;
  presetThemeSelect.appendChild(opt);
}

// Helper to switch the visual 3D dice theme & update the top-left button
async function applyTheme(themeKey) {
  if (!themeKey || themeKey === "active" || !PROFILES[themeKey]) return;

  currentProfile = PROFILES[themeKey];

  // Update highlight inside the drawer
  document.querySelectorAll(".swatch-item").forEach((item) => {
    item.classList.toggle("active", item.dataset.theme === themeKey);
  });

  // Update the Top-Left Button Dot & Name
  document.getElementById("active-dice-dot").style.background = currentProfile.swatch;
  document.getElementById("active-dice-name").textContent = currentProfile.label;

  // Wait for DiceBox to finish loading & applying the new colors/textures!
  if (currentProfile.custom) {
    await box.updateConfig({
      theme_colorset: null,
      theme_customColorset: currentProfile.custom
    });
  } else {
    await box.updateConfig({
      theme_colorset: currentProfile.colorset,
      theme_customColorset: null
    });
  }
}

// Execute the roll
async function executeFormulaRoll(formulaStr, label = "", themeKey = "active") {
  if (themeKey && themeKey !== "active") {
    await applyTheme(themeKey); // <-- Wait for theme/textures to finish updating!
  }

  const cleanStr = formulaStr.replace(/\s+/g, "").toLowerCase();
  const diceRegex = /(\d+)d(\d+)/g;
  const notationParts = [];
  let match;

  while ((match = diceRegex.exec(cleanStr)) !== null) {
    notationParts.push(`${match[1]}d${match[2]}`);
  }

  if (notationParts.length === 0) return;

  const withoutDice = cleanStr.replace(/(\d+)d(\d+)/g, "");
  const modRegex = /[+-]\d+/g;
  let flatBonus = 0;
  let modMatch;
  while ((modMatch = modRegex.exec(withoutDice)) !== null) {
    flatBonus += parseInt(modMatch[0], 10);
  }

  // Pass pure, fair notation directly to DiceBox!
  const fairNotation = notationParts.join("+");
  document.getElementById("result-banner").classList.add("hidden");

  const result = await box.roll(fairNotation);
  const grandTotal = result.total + flatBonus;

  const rollsList = result.sets
    .map(s => `${s.num}d${s.type}: [${s.rolls.map(r => r.value).join(", ")}]`)
    .join(" + ");
  
  const bonusText = flatBonus > 0 ? ` + ${flatBonus}` : (flatBonus < 0 ? ` - ${Math.abs(flatBonus)}` : "");
  const titlePrefix = label ? `${label} • ` : "";

  document.getElementById("result-total").textContent = grandTotal;
  document.getElementById("result-breakdown").textContent = `${titlePrefix}${rollsList}${bonusText}`;
  document.getElementById("result-banner").classList.remove("hidden");
}

// Saved presets manager
const STORAGE_KEY = "fancy_rpg_dice_presets";

const defaultPresets = [
  { name: "Attack", formula: "1d20+7", theme: "emerald" },
  { name: "Greatsword", formula: "2d6+4", theme: "crimson" },
  { name: "Save", formula: "1d20+5", theme: "psychic" }
];

let presets = JSON.parse(localStorage.getItem(STORAGE_KEY)) || defaultPresets;

function saveAndRenderPresets() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(presets));
  const listEl = document.getElementById("presets-list");
  listEl.innerHTML = "";

  presets.forEach((preset, index) => {
    const chip = document.createElement("div");
    chip.className = "preset-chip";
    
    // Show a tiny colored dot if a specific dice theme is bound to this preset
    const dotHtml = (preset.theme && PROFILES[preset.theme])
      ? `<span class="preset-dot" style="background: ${PROFILES[preset.theme].swatch}"></span>`
      : "";

    chip.innerHTML = `
      ${dotHtml}
      <span>${preset.name}</span>
      <span class="formula-tag">${preset.formula}</span>
      <span class="delete-preset" data-index="${index}" title="Delete">&times;</span>
    `;

    chip.addEventListener("click", (e) => {
      if (e.target.classList.contains("delete-preset")) {
        presets.splice(index, 1);
        saveAndRenderPresets();
        return;
      }
      executeFormulaRoll(preset.formula, preset.name, preset.theme);
    });

    listEl.appendChild(chip);
  });
}

document.getElementById("save-preset-btn").addEventListener("click", () => {
  const name = document.getElementById("preset-name").value.trim();
  const formula = document.getElementById("preset-formula").value.trim();
  const theme = document.getElementById("preset-theme").value;

  if (name && formula) {
    presets.push({ name, formula, theme });
    saveAndRenderPresets();
    document.getElementById("preset-name").value = "";
    document.getElementById("preset-formula").value = "";
    document.getElementById("preset-theme").value = "active";
    document.getElementById("preset-modal").classList.add("hidden");
  }
});

// Modal Open / Close / Save
document.getElementById("add-preset-btn").addEventListener("click", () => {
  document.getElementById("preset-modal").classList.remove("hidden");
  document.getElementById("preset-name").focus();
});

document.getElementById("cancel-preset-btn").addEventListener("click", () => {
  document.getElementById("preset-modal").classList.add("hidden");
});

// Render presets on startup
saveAndRenderPresets();
