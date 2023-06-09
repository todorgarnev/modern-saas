import {
	clearSupabaseData,
	createContact,
	createUser,
	startSupabase,
	syncStripeProducts
} from "./utils";

const testUsers = [
	{
		full_name: "Test User 1",
		email: "test1@abv.bg",
		password: "password"
	},
	{
		full_name: "Test User 2",
		email: "test2@abv.bg",
		password: "password"
	},
	{
		full_name: "Test User 3",
		email: "test3@abv.bg",
		password: "password"
	}
];

const seed = async () => {
	try {
		await startSupabase();
		await clearSupabaseData();
		await syncStripeProducts();

		for (const testUser of testUsers) {
			const user = await createUser(testUser);

			for (let i = 0; i < 5; i++) {
				await createContact(user.id);
			}
		}
	} catch (err) {
		process.exit(1);
	}

	process.exit();
};

seed();
