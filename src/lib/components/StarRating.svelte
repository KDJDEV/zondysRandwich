<script>
	export let rate = "";
	export let alreadyInDB;
	export let small;
</script>

<form class="rating {alreadyInDB ? 'disabled' : ''} {small ? 'small' : ''}">
	<label>
		<input type="radio" name="stars" bind:group={rate} value="1" />
		<span class="icon">★</span>
	</label>
	<label>
		<input type="radio" name="stars" bind:group={rate} value="2" />
		<span class="icon">★</span><span class="icon">★</span>
	</label>
	<label>
		<input type="radio" name="stars" bind:group={rate} value="3" />
		<span class="icon">★</span><span class="icon">★</span><span class="icon"
			>★</span
		>
	</label>
	<label>
		<input type="radio" name="stars" bind:group={rate} value="4" />
		<span class="icon">★</span><span class="icon">★</span><span class="icon"
			>★</span
		><span class="icon">★</span>
	</label>
	<label>
		<input type="radio" name="stars" bind:group={rate} value="5" />
		<span class="icon">★</span><span class="icon">★</span><span class="icon"
			>★</span
		><span class="icon">★</span><span class="icon">★</span>
	</label>
</form>

<style>
	.rating {
		display: inline-block;
		position: relative;
		height: 50px;
		line-height: 50px;
		font-size: 50px;
	}
	.small {
		font-size: 25px;
	}
	.rating.disabled {
		pointer-events: none;
	}
	.rating label {
		position: absolute;
		top: 0;
		left: 0;
		height: 100%;
		cursor: pointer;
	}

	.rating label:last-child {
		position: static;
	}

	.rating label:nth-child(1) {
		z-index: 5;
	}

	.rating label:nth-child(2) {
		z-index: 4;
	}

	.rating label:nth-child(3) {
		z-index: 3;
	}

	.rating label:nth-child(4) {
		z-index: 2;
	}

	.rating label:nth-child(5) {
		z-index: 1;
	}

	.rating label input {
		position: absolute;
		top: 0;
		left: 0;
		opacity: 0;
	}

	.rating label .icon {
		float: left;
		color: transparent;
	}

	.rating label:last-child .icon {
		color: #000;
	}

	.rating:not(:hover) label input:checked ~ .icon,
	.rating:hover label:hover input ~ .icon {
		color: rgb(237, 221, 0);
	}

	.rating label input:focus:not(:checked) ~ .icon:last-child {
		color: #000;
		text-shadow: 0 0 5px rgb(246, 255, 0);
	}
</style>
