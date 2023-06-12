import { error, redirect } from "@sveltejs/kit";
import { createCheckoutSession, getSubscriptionTier } from "$lib/server/subscriptions";
import { handleLoginRedirect } from "$lib/helpers";
import type { RequestHandler } from "./$types";

export const GET: RequestHandler = async (event) => {
	const session = await event.locals.getSession();

	if (!session) {
		throw redirect(302, handleLoginRedirect(event.url));
	}

	const tier = await getSubscriptionTier(session.user.id);

	if (tier !== "Free") {
		throw redirect(302, "/account/billing");
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
