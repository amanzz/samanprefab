CREATE TYPE "public"."notification_type" AS ENUM('lead', 'quote', 'product', 'system');--> statement-breakpoint
CREATE TABLE "notifications" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"type" "notification_type" NOT NULL,
	"title" varchar(255) NOT NULL,
	"description" text,
	"data" jsonb DEFAULT '{}'::jsonb,
	"read" boolean DEFAULT false,
	"action_url" varchar(500),
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "products" ADD COLUMN "featured_image" varchar(500);--> statement-breakpoint
ALTER TABLE "products" ADD COLUMN "price_text" varchar(120);--> statement-breakpoint
ALTER TABLE "products" ADD COLUMN "custom_buttons" jsonb DEFAULT '[]'::jsonb;--> statement-breakpoint
ALTER TABLE "products" ADD COLUMN "section_order" jsonb DEFAULT '["features","applications","faq"]'::jsonb;--> statement-breakpoint
ALTER TABLE "products" ADD COLUMN "delivery_time" varchar(100);--> statement-breakpoint
ALTER TABLE "products" ADD COLUMN "warranty" varchar(100);--> statement-breakpoint
ALTER TABLE "products" ADD COLUMN "installation_time" varchar(100);--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "avatar" varchar(500);