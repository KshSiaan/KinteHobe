import { auth } from "@/lib/auth";


export async function POST(request: Request) {
    const user = await auth.api.getSession({
        headers: request.headers,
    })

    if (!user?.session.token) {
        return new Response(JSON.stringify({
            error: "Unauthorized"
        }), { status: 401 });
    }

    return new Response(JSON.stringify({
        user
    }));
}