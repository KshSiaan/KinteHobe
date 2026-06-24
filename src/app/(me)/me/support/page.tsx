import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import SupportClient from "./support-client";

export default async function Page() {
	const data = await auth.api.getSession({ headers: await headers() });

	if (!data?.user) {
		redirect("/");
	}

	return <SupportClient />;
}
