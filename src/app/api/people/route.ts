import { auth } from "@/lib/auth";

export async function GET(request: Request) {
    const session = await auth.api.getSession({
        headers: request.headers,
    });
    if (!session || !session.user) {
        return Response.json({ok:false, message: "Unauthorized" }, { status: 401 });
    }
    // const users =await db.select().from(user)
    const my_id = session.user.id;
    const users = await auth.api.listUsers({
        headers: request.headers,
        query:{
            limit: 10,
            filterOperator:"eq",
            filterValue:"user",
            filterField:"role"
        }
    });
        
    const filtered = users.users.filter((u) => u.id !== my_id);

    return Response.json({ok:true, data: { ...users, users: filtered } });
}