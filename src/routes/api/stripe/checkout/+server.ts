import { error, redirect } from "@sveltejs/kit";
import { getCustomerRecord } from "$lib/server/customers";
import { stripe } from "$lib/server/stripe";
import { ENV } from "$lib/server/env";
import type { RequestHandler } from "./$types";
import { createCheckoutSession } from "$lib/server/subscriptions";

export const GET: RequestHandler = async (event) => {
	const session = await event.locals.getSession();

	if (!session) {
		throw redirect(302, "/login");
	}

	const priceId = event.url.searchParams.get("id");

	if (!priceId) {
		throw error(400, "Invalid request");
	}

	let checkoutUrl: string;

	try {
		checkoutUrl = await createCheckoutSession(session.user.id, priceId);
	} catch (e) {
		throw error(500, "An error occurred while creating the checkout session");
	}

	throw redirect(302, checkoutUrl);
};
