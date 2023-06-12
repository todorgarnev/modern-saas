import { tierPolicy } from "./config";
import type { SubscriptionTierType } from "./schemas";

export const hasReachedMaxContacts = (tier: SubscriptionTierType, contactsCount: number) => {
	return contactsCount >= tierPolicy["maxContacts"][tier];
};

export const getUpgradeURL = (tier: SubscriptionTierType) => {
	return tier === "Free" ? "/pricing" : "/account/billing";
};

export const handleLoginRedirect = (eventUrl: URL) => {
	const redirectTo = eventUrl.pathname + eventUrl.search;
	return `/login?redirectTo=${redirectTo}`;
};
