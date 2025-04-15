<script>
	// Props for the component
	export let photoUrl = ""; // URL of the uploaded photo (to pass back to parent)
	export let onUpload = () => {}; // Callback function when photo is uploaded

	let photo = null; // Holds the selected file

	function resizeImage(file, maxSize = 1024) {
	return new Promise((resolve) => {
		const img = new Image();
		const reader = new FileReader();
		reader.onload = (e) => {
			img.src = e.target.result;
		};
		img.onload = () => {
			const canvas = document.createElement("canvas");
			let { width, height } = img;

			if (width > height) {
				if (width > maxSize) {
					height *= maxSize / width;
					width = maxSize;
				}
			} else {
				if (height > maxSize) {
					width *= maxSize / height;
					height = maxSize;
				}
			}

			canvas.width = width;
			canvas.height = height;
			canvas.getContext("2d").drawImage(img, 0, 0, width, height);
			canvas.toBlob((blob) => {
				resolve(new File([blob], file.name, { type: blob.type }));
			}, "image/jpeg", 0.8);
		};
		reader.readAsDataURL(file);
	});
}

	// Handle file selection
	async function handleFileChange(event) {
		const file = event.target.files[0];
		if (file) {
			photo = file;

			const formData = new FormData();
			const resized = await resizeImage(file);
			formData.append("image", resized);

			const response = await fetch("/api/upload", {
				method: "POST",
				body: formData,
			});

			if (!response.ok) {
				throw new Error("Upload failed");
			}

			const data = await response.json();
			if (data.imageUrl) {
				photoUrl = data.imageUrl;
				onUpload(photoUrl);
			} else {
				alert("Error: " + data.error);
			}
		}
	}
</script>

<div class="mt-4">
	<label for="photo" class="block text-gray-700 font-semibold mb-2"
		>3. Upload a Photo</label
	>
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
		<img
			src={photoUrl}
			alt="Preview"
			class="w-full max-w-sm rounded-lg shadow-md"
		/>
	</div>
{/if}
