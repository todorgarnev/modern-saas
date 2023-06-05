<script lang="ts">
	import { Button } from "flowbite-svelte";
	import { superForm } from "sveltekit-superforms/client";
	import UserIcon from "$lib/components/icons/UserIcon.svelte";
	import type { Validation } from "sveltekit-superforms/index";
	import type { ProfileSchema } from "$lib/schemas";

	export let data: Validation<ProfileSchema>;

	const { form, errors, enhance } = superForm(data);
</script>

<section class="px-6 pt-16">
	<div class="flex items-center font-semibold">
		<UserIcon />
		<span class="ml-4">Personal Details</span>
	</div>

	<p class="mt-3 text-sm">Change the personal details associated with your account</p>

	<form method="POST" action="?/updateProfile" use:enhance class="mt-8">
		<label for="fullName" class="space-y-2">
			<span>Name</span>

			<input type="text" name="fullName" bind:value={$form.fullName} />

			{#if $errors.fullName}
				<span class="block text-red-600 dark:text-red-500">{$errors.fullName}</span>
			{/if}
		</label>

		<Button type="submit" class="mt-4">Update Details</Button>
	</form>
</section>
