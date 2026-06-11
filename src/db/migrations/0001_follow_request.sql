CREATE TYPE "public"."follow_status" AS ENUM('pending', 'accepted', 'rejected');--> statement-breakpoint
CREATE TABLE "follow_request" (
	"id" text PRIMARY KEY NOT NULL,
	"follower_id" text NOT NULL,
	"following_id" text NOT NULL,
	"status" "follow_status" DEFAULT 'pending' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "follow_request_unique" UNIQUE("follower_id","following_id")
);
--> statement-breakpoint
ALTER TABLE "follow_request" ADD CONSTRAINT "follow_request_follower_id_user_id_fk" FOREIGN KEY ("follower_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "follow_request" ADD CONSTRAINT "follow_request_following_id_user_id_fk" FOREIGN KEY ("following_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "follow_request_follower_idx" ON "follow_request" USING btree ("follower_id");--> statement-breakpoint
CREATE INDEX "follow_request_following_idx" ON "follow_request" USING btree ("following_id");
