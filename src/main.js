import DiceBox from "@3d-dice/dice-box-threejs";
import "./style.css";

// Themes: Each color swatch has its own dice colors
const PROFILES = {
  crimson:   { label: "Crimson",   swatch: "#991b1b", custom: { background: "#991b1b", foreground: "#ffffff", outline: "#991b1b", texture: "none", material: "plastic" } },
  emerald:   { label: "Emerald",   swatch: "#1b7a43", custom: { background: "#1b7a43", foreground: "#ffffff", outline: "#1b7a43", texture: "none", material: "plastic" } },
  purple:    { label: "Purple",    swatch: "#6b21a8", custom: { background: "#6b21a8", foreground: "#ffffff", outline: "#6b21a8", texture: "none", material: "plastic" } },
  bloodmoon: { label: "Bloodmoon", swatch: "radial-gradient(circle, #eab308, #7f1d1d)", colorset: "bloodmoon" },
  ice:       { label: "Ice",       swatch: "radial-gradient(circle, #e0f2fe, #0284c7)", colorset: "ice" },
  psychic:   { label: "Psychic",   swatch: "radial-gradient(circle, #f472b6, #4c1d95)", colorset: "psychic" }
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

// Click a Dice Theme inside the Drawer
document.querySelectorAll(".swatch-item").forEach((item) => {
  item.addEventListener("click", () => {
    applyTheme(item.dataset.theme);
    toggleDrawer(false);
  });
});

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

// Color map for the tiny indicator dot on each preset chip
const DOT_COLORS = {
  crimson: "#991b1b",
  emerald: "#1b7a43",
  purple: "#6b21a8",
  bloodmoon: "#eab308",
  ice: "#38bdf8",
  psychic: "#f472b6"
};

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
    const dotHtml = (preset.theme && DOT_COLORS[preset.theme])
      ? `<span class="preset-dot" style="background: ${DOT_COLORS[preset.theme]}"></span>`
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
