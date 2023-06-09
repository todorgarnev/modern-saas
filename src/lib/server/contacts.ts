import { supabaseAdmin } from "./supabase-admin";

export const getContactsCount = async (userId: string) => {
	const { error, count } = await supabaseAdmin
		.from("contacts")
		.select("*", { count: "exact", head: true })
		.eq("user_id", userId);

	if (error) {
		throw error;
	}

	if (!count) {
		return 0;
	}

	return count;
};
