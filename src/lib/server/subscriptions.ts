import { stripeSubscriptionSchema } from "$lib/schemas";
import { stripe } from "./stripe";
import { supabaseAdmin } from "./supabase-admin";
import { getCustomerRecord } from "./customers";
import { ENV } from "./env";
import type Stripe from "stripe";

export const insertSubscriptionRecord = async (stripeSubscription: Stripe.Subscription) => {
	const subscription = stripeSubscriptionSchema.parse(stripeSubscription);

	const { data: customer, error: customerError } = await supabaseAdmin
		.from("billing_customers")
		.select("user_id")
		.eq("id", subscription.customer_id)
		.limit(1)
		.single();

	if (customerError) {
		throw customerError;
	}

	const { error: subscriptionError } = await supabaseAdmin.from("billing_subscriptions").insert({
		...subscription,
		user_id: customer.user_id
	});

	if (subscriptionError) {
		throw subscriptionError;
	}
};

export const updateSubscriptionRecord = async (stripeSubscription: Stripe.Subscription) => {
	const subscription = stripeSubscriptionSchema.parse(stripeSubscription);

	const { error: subscriptionError } = await supabaseAdmin
		.from("billing_subscriptions")
		.update(subscription)
		.eq("id", subscription.id);

	if (subscriptionError) {
		throw subscriptionError;
	}
};

export const verifyTrialEligibility = async (userId: string, priceId: string): Promise<boolean> => {
	type PriceWithProduct = Stripe.Price & { product: Stripe.Product };

	const price = (await stripe.prices.retrieve(priceId, {
		expand: ["product"]
	})) as PriceWithProduct;

	if (!price) {
		throw new Error("invalid price id");
	}

	const { data: subscription, error: subscriptionError } = await supabaseAdmin
		.from("billing_subscriptions")
		.select("id, product_id")
		.eq("user_id", userId)
		.eq("product_id", price.product.id)
		.limit(1)
		.maybeSingle();

	if (subscriptionError) {
		throw subscriptionError;
	}

	if (!subscription) {
		return true;
	}

	return false;
};

export const createCheckoutSession = async (userId: string, priceId: string) => {
	const customer = await getCustomerRecord(userId);
	const isEligibleForTrial = await verifyTrialEligibility(userId, priceId);

	if (isEligibleForTrial) {
		const checkoutSession = await stripe.checkout.sessions.create({
			payment_method_types: ["card"],
			mode: "subscription",
			customer: customer.id,
			line_items: [
				{
					price: priceId,
					quantity: 1
				}
			],
			success_url: `${ENV.PUBLIC_BASE_URL}/account`,
			cancel_url: `${ENV.PUBLIC_BASE_URL}/pricing`,
			subscription_data: {
				metadata: {
					user_id: userId
				},
				trial_period_days: 14,
				trial_settings: {
					end_behavior: {
						missing_payment_method: "cancel"
					}
				}
			}
			// payment_method_collection: "if_required" // TO ENABLE TRIAL
		});

		if (!checkoutSession.url) {
			throw new Error("Error creating checkout session");
		}
		return checkoutSession.url;
	}

	const checkoutSession = await stripe.checkout.sessions.create({
		payment_method_types: ["card"],
		mode: "subscription",
		customer: customer.id,
		line_items: [
			{
				price: priceId,
				quantity: 1
			}
		],
		success_url: `${ENV.PUBLIC_BASE_URL}/account`,
		cancel_url: `${ENV.PUBLIC_BASE_URL}/pricing`,
		subscription_data: {
			metadata: {
				user_id: userId
			}
		}
	});

	if (!checkoutSession.url) {
		throw new Error("Error creating checkout session");
	}

	return checkoutSession.url;
};