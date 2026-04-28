import {createAccessControl} from "better-auth/plugins/access"
import {adminAc, defaultStatements, userAc} from "better-auth/plugins/admin/access"
export const ac = createAccessControl({
    ...defaultStatements,
    category:["create","list","read","update","delete"],
    product:["create","list","read","update","delete"],
})

export const user = ac.newRole({
    ...userAc.statements,
    user:[...userAc.statements.user,"get","list","update"],
    category:["list","read"],
    product:["list","read"],
})

export const manager = ac.newRole({
    ...userAc.statements,
    user:[...userAc.statements.user,"get","list","update"],
    category:["list","read"],
    product:["create","list","read","update","delete"],
})

export const admin = ac.newRole({
    ...adminAc.statements,
    category:["create","list","read","update","delete"],
    product:["create","list","read","update","delete"],
})