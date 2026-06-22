import {
  pgTable,
  text,
  timestamp,
  index,
  boolean,
} from "drizzle-orm/pg-core";
import { user } from "../schema";

export const userAddresses = pgTable(
  "user_addresses",
  {
    id: text("id").primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, {
        onDelete: "cascade",
      }),
    label: text("label").notNull(),
    recipient_name: text("recipient_name"),
    phone: text("phone").notNull(),
    district: text("district").notNull(),
    city: text("city").notNull(),
    area: text("area").notNull(),
    address_line: text("address_line").notNull(),
    is_default: boolean("is_default").default(false).notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => [
    index("user_addresses_userId_idx").on(table.userId),
  ]
);

