import { clearSupabaseData, createUser, startSupabase } from "./utils";

async function seed() {
	try {
		await startSupabase();
		await clearSupabaseData();
		await createUser({ email: "test@abv.bg", fullName: "Test user", password: "password" });
	} catch (err) {
		console.error(err);
		process.exit(1);
	}

	process.exit();
}

seed();
