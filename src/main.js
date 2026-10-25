import DiceBox from "@3d-dice/dice-box-threejs";
import "./style.css";
import PROFILES from "./profiles.js";

let currentProfile = PROFILES.crimson;
let dicePool = {}; // e.g., { 20: 1, 6: 2 }

// Initialize 3D Dice Box
const box = new DiceBox("#dice-canvas", {
	assetPath: "/",
	theme_customColorset: currentProfile.custom,
	baseScale: 100,
	strength: 4.5,
	// gravity_multiplier: 600,
	sounds: false,
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

// Roll Button
document.getElementById("roll-btn").addEventListener("click", async () => {
	const entries = Object.entries(dicePool);
	if (entries.length === 0) {
		// Default to 1d20 if nothing is queued!
		entries.push(["20", 1]);
	}

	const notationParts = [];
	for (const [sides, count] of entries) {
		notationParts.push(`${count}d${sides}`);
	}

	const fullNotation = notationParts.join("+");
	document.getElementById("result-banner").classList.add("hidden");

	const result = await box.roll(fullNotation);

	// Display the results banner
	document.getElementById("result-total").textContent = result.total;
	const rollsList = result.sets
		.map(
			(s) => `${s.num}d${s.type}: [${s.rolls.map((r) => r.value).join(", ")}]`,
		)
		.join(" + ");
	document.getElementById("result-breakdown").textContent = rollsList;
	document.getElementById("result-banner").classList.remove("hidden");
});

// Clear pool & table
document.getElementById("clear-btn").addEventListener("click", () => {
	dicePool = {};
	document.querySelectorAll(".badge").forEach((b) => {
		b.classList.add("hidden");
	});
	document.getElementById("result-banner").classList.add("hidden");
	box.clearDice();
});

// Drawer Open / Close Controls (Left Dice Drawer & Right Presets Drawer)
const diceDrawerEl = document.getElementById("dice-drawer");
const presetsDrawerEl = document.getElementById("presets-drawer");
const backdropEl = document.getElementById("drawer-backdrop");

function closeAllDrawers() {
	diceDrawerEl.classList.remove("open");
	presetsDrawerEl.classList.remove("open");
	backdropEl.classList.add("hidden");
}

function toggleDrawer(open) {
	presetsDrawerEl.classList.remove("open");
	diceDrawerEl.classList.toggle("open", open);
	backdropEl.classList.toggle("hidden", !open);
}

function togglePresetsDrawer(open) {
	diceDrawerEl.classList.remove("open");
	presetsDrawerEl.classList.toggle("open", open);
	backdropEl.classList.toggle("hidden", !open);
}

document
	.getElementById("dice-drawer-btn")
	.addEventListener("click", () => toggleDrawer(true));
document
	.getElementById("close-drawer-btn")
	.addEventListener("click", closeAllDrawers);

document
	.getElementById("presets-drawer-btn")
	.addEventListener("click", () => togglePresetsDrawer(true));
document
	.getElementById("close-presets-btn")
	.addEventListener("click", closeAllDrawers);

backdropEl.addEventListener("click", closeAllDrawers);

// Auto-populate the Left Dice Drawer AND the Preset Modal Dropdown from PROFILES
const diceListEl = document.getElementById("dice-list");
// const presetThemeSelect = document.getElementById("preset-theme");

if (diceListEl) diceListEl.innerHTML = "";

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
		if (jailedThemes.has(key)) {
			// Release from Dice Jail on parole!
			jailedThemes.delete(key);
			saveJailState();
		}
		applyTheme(key);
		closeAllDrawers();
	});
	diceListEl.appendChild(btn);
}

// Add option to the New Preset Modal <select>
// const opt = document.createElement("option");
// opt.value = key;
// opt.textContent = `${profile.label} Dice`;
// presetThemeSelect.appendChild(opt);

// Helper to switch the visual 3D dice theme & update the top-left button
async function applyTheme(themeKey) {
	if (!themeKey || themeKey === "active" || !PROFILES[themeKey]) return;

	currentProfile = PROFILES[themeKey];

	document.querySelectorAll(".swatch-item").forEach((item) => {
		item.classList.toggle("active", item.dataset.theme === themeKey);
	});

	const dotEl = document.getElementById("active-dice-dot");
	const nameEl = document.getElementById("active-dice-name");
	if (dotEl) dotEl.style.background = currentProfile.swatch;
	if (nameEl) nameEl.textContent = currentProfile.label;

	// Wait for DiceBox to finish loading & applying the new colors/textures!
	if (currentProfile.custom) {
		await box.updateConfig({
			theme_colorset: null,
			theme_customColorset: currentProfile.custom,
		});
	} else {
		await box.updateConfig({
			theme_colorset: currentProfile.colorset,
			theme_customColorset: null,
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
	let match = diceRegex.exec(cleanStr);

	while (match !== null) {
		notationParts.push(`${match[1]}d${match[2]}`);
		match = diceRegex.exec(cleanStr);
	}

	if (notationParts.length === 0) return;

	const withoutDice = cleanStr.replace(/(\d+)d(\d+)/g, "");
	const modRegex = /[+-]\d+/g;
	let flatBonus = 0;
	let modMatch = modRegex.exec(withoutDice);
	while (modMatch !== null) {
		flatBonus += parseInt(modMatch[0], 10);
		modMatch = modRegex.exec(withoutDice);
	}

	// Pass pure, fair notation directly to DiceBox!
	const fairNotation = notationParts.join("+");
	document.getElementById("result-banner").classList.add("hidden");

	const result = await box.roll(fairNotation);
	const grandTotal = result.total + flatBonus;

	const rollsList = result.sets
		.map(
			(s) => `${s.num}d${s.type}: [${s.rolls.map((r) => r.value).join(", ")}]`,
		)
		.join(" + ");

	const bonusText =
		flatBonus > 0
			? ` + ${flatBonus}`
			: flatBonus < 0
				? ` - ${Math.abs(flatBonus)}`
				: "";
	const titlePrefix = label ? `${label} • ` : "";

	document.getElementById("result-total").textContent = grandTotal;
	document.getElementById("result-breakdown").textContent =
		`${titlePrefix}${rollsList}${bonusText}`;
	document.getElementById("result-banner").classList.remove("hidden");
}

// Saved presets manager
const STORAGE_KEY = "fancy_rpg_dice_presets";

const defaultPresets = [
	{ name: "Attack", formula: "1d20+7", theme: "emerald" },
	{ name: "Greatsword", formula: "2d6+4", theme: "crimson" },
	{ name: "Save", formula: "1d20+5", theme: "psychic" },
];

const presets = JSON.parse(localStorage.getItem(STORAGE_KEY)) || defaultPresets;

function saveAndRenderPresets() {
	localStorage.setItem(STORAGE_KEY, JSON.stringify(presets));
	const listEl = document.getElementById("presets-list");
	listEl.innerHTML = "";

	presets.forEach((preset, index) => {
		const chip = document.createElement("div");
		chip.className = "preset-chip";

		const dotHtml =
			preset.theme && PROFILES[preset.theme]
				? `<span class="preset-dot" style="background: ${PROFILES[preset.theme].swatch}"></span>`
				: `<span class="preset-dot" style="border: 1px solid #555;"></span>`;

		chip.innerHTML = `
      <div class="preset-chip-left">
        ${dotHtml}
        <span>${preset.name}</span>
      </div>
      <div class="preset-chip-right">
        <span class="formula-tag">${preset.formula}</span>
        <span class="delete-preset" data-index="${index}" title="Delete">&times;</span>
      </div>
    `;

		chip.addEventListener("click", (e) => {
			if (e.target.classList.contains("delete-preset")) {
				presets.splice(index, 1);
				saveAndRenderPresets();
				return;
			}
			closeAllDrawers();
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

// Modal Open / Close
document.getElementById("add-preset-btn").addEventListener("click", () => {
	document.getElementById("preset-modal").classList.remove("hidden");
	document.getElementById("preset-name").focus();
});

document.getElementById("cancel-preset-btn").addEventListener("click", () => {
	document.getElementById("preset-modal").classList.add("hidden");
});

// --- DICE JAIL MANAGER ---
const JAIL_STORAGE_KEY = "fancy_rpg_jailed_dice";
const jailedThemes = new Set(
	JSON.parse(localStorage.getItem(JAIL_STORAGE_KEY)) || [],
);

function saveJailState() {
	localStorage.setItem(JAIL_STORAGE_KEY, JSON.stringify([...jailedThemes]));
	updateDrawerJailUI();
}

function updateDrawerJailUI() {
	document.querySelectorAll(".swatch-item").forEach((btn) => {
		const key = btn.dataset.theme;
		const isJailed = jailedThemes.has(key);
		btn.classList.toggle("jailed", isJailed);

		// Show "Parole All" button only when at least 1 dice set is jailed
		const paroleAllBtn = document.getElementById("parole-all-btn");
		if (paroleAllBtn) {
			paroleAllBtn.classList.toggle("hidden", jailedThemes.size === 0);
		}

		let badge = btn.querySelector(".jail-badge");
		if (isJailed && !badge) {
			badge = document.createElement("span");
			badge.className = "jail-badge";
			badge.style.display = "inline-flex";
			badge.style.alignItems = "center";
			badge.style.gap = "4px";
			badge.innerHTML = `<img src="/public/lock-red.svg" width="12" height="12" alt="" /><span>Jailed</span>`;
			btn.appendChild(badge);
		} else if (!isJailed && badge) {
			badge.remove();
		}
	});
}

document.getElementById("jail-dice-btn").addEventListener("click", () => {
	// Find which theme key is currently active
	const currentKey =
		Object.keys(PROFILES).find((k) => PROFILES[k] === currentProfile) ||
		"crimson";
	const allKeys = Object.keys(PROFILES);

	// Make sure at least 1 dice set remains free!
	if (jailedThemes.size >= allKeys.length - 1) {
		alert("You can't jail your last remaining set of dice!");
		return;
	}

	// Hide the result banner & trigger the Iron Bars Slam animation!
	document.getElementById("result-banner").classList.add("hidden");
	const overlay = document.getElementById("jail-overlay");
	overlay.classList.remove("hidden", "slam");
	void overlay.offsetWidth; // Force browser reflow so animation restarts cleanly
	overlay.classList.add("slam");

	// Lock the current dice set in Dice Jail
	jailedThemes.add(currentKey);
	saveJailState();

	// Pick the next non-jailed dice set automatically
	const nextFreeKey = allKeys.find((k) => !jailedThemes.has(k)) || "crimson";

	// Halfway through the slam, clear the 3D dice and switch to the new set
	setTimeout(() => {
		box.clearDice();
		applyTheme(nextFreeKey);
	}, 600);

	// Hide the overlay when the animation finishes
	setTimeout(() => {
		overlay.classList.remove("slam");
		overlay.classList.add("hidden");
	}, 1450);
});

document.getElementById("parole-all-btn")?.addEventListener("click", () => {
	jailedThemes.clear();
	saveJailState();
});

// Render presets on startup
saveAndRenderPresets();
