<script>
	// Props for the component
	export let photoUrl = ''; // URL of the uploaded photo (to pass back to parent)
	export let onUpload = () => {}; // Callback function when photo is uploaded

	let photo = null; // Holds the selected file

	// Handle file selection
	function handleFileChange(event) {
		const file = event.target.files[0];
		if (file) {
			photo = file;
			photoUrl = URL.createObjectURL(file); // Generate a URL for preview
			onUpload(photoUrl); // Call the provided callback to notify parent
		}
	}
</script>

<div class="mt-4">
	<label for="photo" class="block text-gray-700 font-semibold mb-2">3. Upload a Photo</label>
	<input
		type="file"
		id="photo"
		accept="image/*"
		on:change={handleFileChange}
		class="block w-full text-sm text-gray-700 file:py-2 file:px-4 file:rounded-md file:border file:border-gray-300 file:bg-gray-50 file:text-gray-700 file:hover:bg-gray-100"
	/>
</div>

{#if photoUrl}
	<div class="mt-4">
		<img src={photoUrl} alt="Preview" class="w-full max-w-sm rounded-lg shadow-md" />
	</div>
{/if}
