import {
  index,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";
import { order, transaction, user } from "../schema";

const currentStatusEnum = pgEnum("current_status", [
  "pending",
  "reviewed",
  "resolved",
  "rejected",
]);

export const fraud = pgTable(
  "fraud",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    orderId: text("order_id")
      .notNull()
      .references(() => order.id, { onDelete: "cascade" }),
    transactionId: text("transaction_id")
      .notNull()
      .references(() => transaction.id, { onDelete: "cascade" }),
    current_status: currentStatusEnum("current_status")
      .notNull()
      .default("pending"),
    resolvedBy: text("resolved_by").references(() => user.id, {
      onDelete: "set null",
    }),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at")
      .notNull()
      .defaultNow()
      .$onUpdate(() => new Date()),
  },
  (table) => [
    index("fraud_order_id_idx").on(table.orderId),
    index("fraud_transaction_id_idx").on(table.transactionId),
    index("fraud_resolved_by_idx").on(table.resolvedBy),
  ],
);
