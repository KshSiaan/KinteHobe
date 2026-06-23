import { auth } from "@/lib/auth";

export async function POST(){
    const user = await auth.api.getSession();
    if(!user?.session?.token || !user?.user?.role || !["admin", "manager"].includes(user?.user?.role)){
        return new Response(JSON.stringify({message: "Unauthorized"}), {status: 401});
    }

    


}