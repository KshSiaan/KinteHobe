
import "server-only";

import { createClient } from "@supabase/supabase-js";

let supabaseClientCache: ReturnType<typeof createSupabaseStorageClient> | null =
	null;

function getSupabaseUrl() {
	const url = process.env.NEXT_PUBLIC_SUPABASE_URL;

	if (!url) {
		throw new Error("Missing NEXT_PUBLIC_SUPABASE_URL environment variable");
	}

	return url;
}

function getSupabasePublishableKey() {
	const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

	if (!key) {
		throw new Error("Missing NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY environment variable");
	}

	return key;
}

export function createSupabaseStorageClient() {
	return createClient(getSupabaseUrl(), getSupabasePublishableKey(), {
		auth: {
			persistSession: false,
			autoRefreshToken: false,
		},
	});
}

export function getSupabaseStorageClient() {
	if (!supabaseClientCache) {
		supabaseClientCache = createSupabaseStorageClient();
	}

	return supabaseClientCache;
}
