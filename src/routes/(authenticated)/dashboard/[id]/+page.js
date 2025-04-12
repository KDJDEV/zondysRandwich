export async function load({ params, fetch }) {
	const res = await fetch(`/api/${params.id}`);

	if (!res.ok) {
		return {
			sandwich: null
		};
	}

	const sandwich = await res.json();

	if (sandwich.error) {
		return {
			sandwich: null
		};
	}
	return {
		sandwich
	};
}
