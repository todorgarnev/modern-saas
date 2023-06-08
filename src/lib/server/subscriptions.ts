import { stripeSubscriptionSchema } from "$lib/schemas";
import type Stripe from "stripe";
import { supabaseAdmin } from "./supabase-admin";

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
