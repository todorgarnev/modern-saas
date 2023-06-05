import { error, fail, redirect } from "@sveltejs/kit";
import { setError, superValidate } from "sveltekit-superforms/server";
import { supabaseAdmin } from "$lib/server/supabase-admin";
import { createContactSchema } from "$lib/schemas";
import type { Actions, PageServerLoad } from "./$types";

export const load: PageServerLoad = async (event) => {
	const session = await event.locals.getSession();

	if (!session) {
		throw redirect(302, "/login");
	}

	const getContacts = async () => {
		const { data: contacts, errors: contactsErrors } = await event.locals.supabase
			.from("contacts")
			.select("*")
			.limit(10);

		if (contactsErrors) {
			throw error(500, "Error fetching contacts, please  try again later.");
		}

		return contacts;
	};

	return {
		createContactForm: superValidate(createContactSchema),
		contacts: getContacts()
	};
};

export const actions: Actions = {
	createContact: async (event) => {
		const session = await event.locals.getSession();

		if (!session) {
			throw error(401, "Unauthorized");
		}

		const createContactForm = await superValidate(event, createContactSchema);

		if (!createContactForm.valid) {
			return fail(400, {
				createContactForm
			});
		}

		const { error: createContactError } = await supabaseAdmin.from("contacts").insert({
			...createContactForm.data,
			user_id: session.user.id
		});

		if (createContactError) {
			return setError(createContactForm, null, "Error creating contact.");
		}

		return {
			createContactForm
		};
	}
};
