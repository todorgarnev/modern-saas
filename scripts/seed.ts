import { clearSupabaseData, createContact, createUser, startSupabase } from "./utils";

async function seed() {
	try {
		await startSupabase();
		await clearSupabaseData();
		const user = await createUser({
			email: "test@abv.bg",
			full_name: "Test user",
			password: "password"
		});

		for (let i = 0; i < 5; i++) {
			await createContact(user.id);
		}
	} catch (err) {
		process.exit(1);
	}

	process.exit();
}

seed();
