import {createAccessControl} from "better-auth/plugins/access"
import {defaultStatements} from "better-auth/plugins/admin/access"
export const ac = createAccessControl({
    ...defaultStatements,
    category:["create","list","read","update","delete"]
})