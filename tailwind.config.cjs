const config = {
	content: ["./src/**/*.{html,js,svelte,ts}"],

	theme: {
		extend: {},
	},

	plugins: [require("daisyui"), require("@tailwindcss/typography")],

	daisyui: {
		themes: [
			{
				mytheme: {
					primary: "#4c1d95", // This is purple-900
					secondary: "#f000b8",
					accent: "#37cdbe",
					neutral: "#3d4451",
					"base-100": "#ffffff",
				},
			},
		],
	},
};

module.exports = config;
