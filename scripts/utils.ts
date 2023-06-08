import detect from "detect-port";
import { execSync } from "child_process";
import pg from "pg";
import { faker } from "@faker-js/faker";
import type { z } from "zod";
import { supabaseAdmin } from "$lib/server/supabase-admin";
import { stripe } from "$lib/server/stripe";
import { upsertProductRecord } from "$lib/server/products";
import { ENV } from "$lib/server/env";
import type { registerUserSchema } from "$lib/schemas";

export const startSupabase = async () => {
	const port = await detect(54322);

	if (port !== 54322) {
		return;
	}
	execSync("pnpx supabase start");
};

export const clearSupabaseData = async () => {
	const client = new pg.Client({
		connectionString: ENV.SUPABASE_DB_URL
	});
	await client.connect();
	await client.query("TRUNCATE auth.users CASCADE");
	await client.query("TRUNCATE public.billing_customers CASCADE");
	await client.query("TRUNCATE public.billing_products CASCADE");
	await client.query("TRUNCATE public.billing_subscriptions CASCADE");
	await client.query("TRUNCATE public.contacts CASCADE");
};

type CreateUser = Omit<z.infer<typeof registerUserSchema>, "passwordConfirm">;

export const createUser = async (user: CreateUser) => {
	const { data: authData, error: authError } = await supabaseAdmin.auth.signUp({
		email: user.email,
		password: user.password,
		options: {
			data: {
				full_name: user.fullName ?? "Test User"
			}
		}
	});

	if (authError || !authData.user) {
		throw new Error("Error creating user");
	}
	return authData.user;
};

export const createContact = async (user_id: string) => {
	const firstName = faker.name.firstName();
	const lastName = faker.name.lastName();
	const contact = {
		name: `${firstName} ${lastName}`,
		email: faker.internet.exampleEmail(firstName, lastName),
		company: faker.company.name(),
		phone: faker.phone.number(),
		user_id
	};

	const { error, data } = await supabaseAdmin.from("contacts").insert(contact);

	if (error) {
		throw error;
	}

	return data;
};

export const syncStripeProducts = async () => {
	const products = await stripe.products.list();

	for (const product of products.data) {
		await upsertProductRecord(product);
	}
};
