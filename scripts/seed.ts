import {
	clearSupabaseData,
	createContact,
	createUser,
	startSupabase,
	syncStripeProducts
} from "./utils";

const seed = async () => {
	try {
		await startSupabase();
		await clearSupabaseData();
		await syncStripeProducts();

		const user = await createUser({
			email: "test@abv.bg",
			fullName: "Test user",
			password: "password"
		});

		for (let i = 0; i < 5; i++) {
			await createContact(user.id);
		}
	} catch (err) {
		process.exit(1);
	}

	process.exit();
};

seed();
