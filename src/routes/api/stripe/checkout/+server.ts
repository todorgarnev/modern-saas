import { error, redirect } from "@sveltejs/kit";
import { getCustomerRecord } from "$lib/server/customers";
import { stripe } from "$lib/server/stripe";
import { ENV } from "$lib/server/env";
import type { RequestHandler } from "./$types";

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
		const customer = await getCustomerRecord(session.user.id);
		const price = await stripe.prices.retrieve(priceId);

		if (!price) {
			throw new Error("Invalid price id");
		}

		const checkoutSession = await stripe.checkout.sessions.create({
			payment_method_types: ["card"],
			mode: "subscription",
			customer: customer.id,
			line_items: [
				{
					price: price.id,
					quantity: 1
				}
			],
			success_url: `${ENV.PUBLIC_BASE_URL}/account`,
			cancel_url: `${ENV.PUBLIC_BASE_URL}/pricing`,
			subscription_data: {
				metadata: {
					userId: session.user.id
				}
			}
		});

		if (!checkoutSession.url) {
			throw new Error("Error creating checkout session");
		}

		checkoutUrl = checkoutSession.url;
	} catch (e) {
		throw error(500, "An error occurred while creating the checkout session");
	}

	throw redirect(302, checkoutUrl);
};
