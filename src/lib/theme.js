import themes from '$lib/data/themes.json';

export function getTodayTheme() {
	const referenceDate = new Date("2024-01-01");
	const today = new Date();
	const daysSince = Math.floor(
		(today.getTime() - referenceDate.getTime()) / (1000 * 60 * 60 * 24)
	);

	return themes[daysSince % themes.length];
}