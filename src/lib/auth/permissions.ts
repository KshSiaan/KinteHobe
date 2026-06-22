import { createAccessControl } from "better-auth/plugins/access";
import {
  adminAc,
  defaultStatements,
  userAc,
} from "better-auth/plugins/admin/access";
export const ac = createAccessControl({
  ...defaultStatements,
  category: ["create", "list", "read", "update", "delete"],
  product: ["create", "list", "read", "update", "delete"],
  reviews: ["create", "list", "read", "update", "delete"],
});

export const user = ac.newRole({
  ...userAc.statements,
  user: [...userAc.statements.user, "get", "list", "update"],
  category: ["list", "read"],
  product: ["list", "read"],
  reviews: ["create", "list", "read", "update"],
});

export const manager = ac.newRole({
  ...userAc.statements,
  user: [...userAc.statements.user, "get", "list", "update", "ban"],
  category: ["list", "read"],
  product: ["create", "list", "read", "update", "delete"],
  reviews: ["list", "read", "delete"],
});

export const admin = ac.newRole({
  ...adminAc.statements,
  category: ["create", "list", "read", "update", "delete"],
  product: ["create", "list", "read", "update", "delete"],
  reviews: ["create", "list", "read", "update", "delete"],
});
