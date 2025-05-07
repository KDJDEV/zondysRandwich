<script lang="ts">
	import { session } from "$lib/stores/session";
	import { onMount } from "svelte";
	import { theme } from "$lib/stores/theme";
	import {
		faBars,
		faChartLine,
		faCog,
		faHeart,
		faRocket,
		faSignIn,
		faSignOut,
		faBook,
		faHouse
	} from "@fortawesome/free-solid-svg-icons";
	import Fa from "svelte-fa";
	import "../app.postcss";

	$: menu_items = $session?.user
		? [
				{
					href: "/dashboard",
					icon: faChartLine,
					label: "Dashboard",
				},
				{
					href: "/",
					icon: faHouse,
					label: "Home",
				},
				{
					href: `/dashboard/history?userId=${$session?.user.id}`,
					icon: faBook,
					label: "Sandwich History",
				},
				{
					href: "/logout",
					icon: faSignOut,
					label: "Log Out",
					reload: true,
				},
		  ]
		: [
				{
					href: "/login",
					icon: faSignIn,
					label: "Log In",
				},
				{
					href: "/signup",
					icon: faHeart,
					label: "Sign Up",
				},
		  ];

	onMount(async () => {
		const res = await fetch("/api/theme");
		if (res.ok) {
			const data = await res.json();
			theme.set(data.theme);
		}
	});
</script>

<header class="bg-primary px-6 text-base-100 relative">
	<div class="max-w-screen-md mx-auto flex items-center pt-2 sm:pb-2">
		<h1>
			<a href={$session?.user ? "/dashboard" : "/"} class="btn btn-ghost gap-3">
				<img src="/favicon.png" class="w-10 h-10" />
				Zondy's Randwich
			</a>
		</h1>

		<nav class="dropdown dropdown-end ml-auto">
			<label tabindex="0" class="btn btn-ghost gap-3">
				<Fa icon={faBars} />
				Menu
			</label>
			<ul
				tabindex="0"
				class="dropdown-content menu p-2 shadow-md bg-primary rounded-box w-52"
			>
				{#each menu_items as item}
					<li>
						<a
							href={item.href}
							data-sveltekit-reload={item.reload ? "" : "off"}
						>
							<Fa icon={item.icon} />
							{item.label}
						</a>
					</li>
				{/each}
			</ul>
		</nav>
	</div>

	{#if theme}
		<div
			class="sm:absolute max-w-screen-md mx-auto text-center pb-3 sm:-translate-y-10 sm:left-1/2 sm:-translate-x-1/2"
		>
			<p class="text-sm italic text-base-200">
				Today's Theme: <span class="font-semibold text-secondary"
					>{$theme ? $theme : ""}</span
				>
			</p>
		</div>
	{/if}
</header>
