// Themes: Each color swatch has its own dice colors
const PROFILES = {
	// --- Custom Solid Colors ---
	crimson: {
		label: "Crimson",
		swatch: "#991b1b",
		custom: {
			background: "#991b1b",
			foreground: "#ffffff",
			outline: "#991b1b",
			texture: "none",
			material: "plastic",
		},
	},
	emerald: {
		label: "Emerald",
		swatch: "#1b7a43",
		custom: {
			background: "#1b7a43",
			foreground: "#ffffff",
			outline: "#1b7a43",
			texture: "none",
			material: "plastic",
		},
	},
	purple: {
		label: "Royal Purple",
		swatch: "#6b21a8",
		custom: {
			background: "#6b21a8",
			foreground: "#ffffff",
			outline: "#6b21a8",
			texture: "none",
			material: "plastic",
		},
	},

	// --- RPG Damage & Elemental Themes ---
	radiant: {
		label: "Radiant",
		swatch: "radial-gradient(circle, #ffffff, #F9B333)",
		colorset: "radiant",
	},
	fire: {
		label: "Fire",
		swatch: "radial-gradient(circle, #f8d84f, #f43c04, #910200)",
		colorset: "fire",
	},
	ice: {
		label: "Ice",
		swatch: "radial-gradient(circle, #e0f2fe, #21B9AF)",
		colorset: "ice",
	},
	cold: {
		label: "Cold",
		swatch: "radial-gradient(circle, #21B9AF, #1e3a8a)",
		colorset: "cold",
	},
	poison: {
		label: "Poison",
		swatch: "radial-gradient(circle, #84ef62, #3b0764)",
		colorset: "poison",
	},
	acid: {
		label: "Acid",
		swatch: "radial-gradient(circle, #A9FF70, #15803d)",
		colorset: "acid",
	},
	thunder: {
		label: "Thunder",
		swatch: "radial-gradient(circle, #D8C759, #52525b)",
		colorset: "thunder",
	},
	lightning: {
		label: "Lightning",
		swatch: "radial-gradient(circle, #FFC500, #f17105)",
		colorset: "lightning",
	},
	air: {
		label: "Air",
		swatch: "radial-gradient(circle, #ffffff, #94a3b8)",
		colorset: "air",
	},
	water: {
		label: "Water",
		swatch: "radial-gradient(circle, #60E3FF, #1e40af)",
		colorset: "water",
	},
	earth: {
		label: "Earth",
		swatch: "radial-gradient(circle, #6C9943, #56341A)",
		colorset: "earth",
	},
	force: {
		label: "Force",
		swatch: "radial-gradient(circle, #FF97FF, #701a75)",
		colorset: "force",
	},
	psychic: {
		label: "Psychic",
		swatch: "radial-gradient(circle, #f472b6, #4c1d95)",
		colorset: "psychic",
	},
	necrotic: {
		label: "Necrotic",
		swatch: "radial-gradient(circle, #dc2626, #111111)",
		colorset: "necrotic",
	},

	// --- Fantasy & Special Themes ---
	bloodmoon: {
		label: "Blood Moon",
		swatch: "radial-gradient(circle, #eab308, #7f1d1d)",
		colorset: "bloodmoon",
	},
	astralsea: {
		label: "Astral Sea",
		swatch: "radial-gradient(circle, #e2e8f0, #334155)",
		colorset: "astralsea",
	},
	starynight: {
		label: "Starry Night",
		swatch: "radial-gradient(circle, #4F708F, #091636)",
		colorset: "starynight",
	},
	bronze: {
		label: "Thylean Bronze",
		swatch: "radial-gradient(circle, #FFB066, #9a3412)",
		colorset: "bronze",
	},
	dragons: {
		label: "Dragons",
		swatch: "radial-gradient(circle, #FFC000, #B80000)",
		colorset: "dragons",
	},
	inspired: {
		label: "Inspired",
		swatch: "radial-gradient(circle, #FFD700, #C4C4B6)",
		colorset: "inspired",
	},
	glitterparty: {
		label: "Glitter Party",
		swatch: "linear-gradient(135deg, #FFB5F5, #7FC9FF, #A17FFF)",
		colorset: "glitterparty",
	},
	pinkdreams: {
		label: "Pink Dreams",
		swatch: "linear-gradient(135deg, #ff007f, #f8c8dc)",
		colorset: "pinkdreams",
	},
	breebaby: {
		label: "Pastel Sunset",
		swatch: "linear-gradient(135deg, #fe5f55, #f7d1cd, #7a9e9f)",
		colorset: "breebaby",
	},
	birdup: {
		label: "Bird Up",
		swatch: "linear-gradient(135deg, #F17105, #D11149, #6610F2)",
		colorset: "birdup",
	},
	tigerking: {
		label: "Tiger King",
		swatch: "radial-gradient(circle, #FFCC40, #78350f)",
		colorset: "tigerking",
	},

	// --- Classics & Wildcards ---
	black: { label: "Obsidian Black", swatch: "#111111", colorset: "black" },
	white: { label: "Ivory White", swatch: "#f8fafc", colorset: "white" },
	rainbow: {
		label: "Rainbow",
		swatch:
			"linear-gradient(135deg, #ef4444, #eab308, #22c55e, #3b82f6, #a855f7)",
		colorset: "rainbow",
	},
};

export default PROFILES;
