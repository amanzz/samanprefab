CREATE TYPE "public"."attribute_type" AS ENUM('text', 'number', 'select');--> statement-breakpoint
CREATE TYPE "public"."post_status" AS ENUM('draft', 'published');--> statement-breakpoint
CREATE TYPE "public"."ai_context" AS ENUM('global', 'product', 'blog');--> statement-breakpoint
CREATE TABLE "attribute_values" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"attribute_id" uuid NOT NULL,
	"value" varchar(200) NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "product_attributes" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(100) NOT NULL,
	"unit" varchar(50),
	"type" "attribute_type" DEFAULT 'text' NOT NULL,
	"options" jsonb DEFAULT '[]'::jsonb,
	"is_active" boolean DEFAULT true NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "post_categories" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(255) NOT NULL,
	"slug" varchar(255) NOT NULL,
	"description" text,
	"parent_id" uuid,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "post_categories_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "post_category_map" (
	"post_id" uuid NOT NULL,
	"category_id" uuid NOT NULL,
	CONSTRAINT "post_category_map_post_id_category_id_pk" PRIMARY KEY("post_id","category_id")
);
--> statement-breakpoint
CREATE TABLE "post_tag_map" (
	"post_id" uuid NOT NULL,
	"tag_id" uuid NOT NULL,
	CONSTRAINT "post_tag_map_post_id_tag_id_pk" PRIMARY KEY("post_id","tag_id")
);
--> statement-breakpoint
CREATE TABLE "post_tags" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(100) NOT NULL,
	"slug" varchar(100) NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "post_tags_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "posts" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"title" varchar(200) NOT NULL,
	"slug" varchar(255) NOT NULL,
	"content" jsonb DEFAULT '{}'::jsonb,
	"excerpt" text,
	"featured_image" varchar(500),
	"status" "post_status" DEFAULT 'draft' NOT NULL,
	"author_id" uuid,
	"meta_title" varchar(65),
	"meta_description" varchar(160),
	"canonical_url" varchar(500),
	"og_title" varchar(200),
	"og_description" varchar(300),
	"og_image" varchar(500),
	"twitter_title" varchar(200),
	"twitter_description" varchar(300),
	"twitter_image" varchar(500),
	"published_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "posts_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "ai_generation_log" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"context" "ai_context" NOT NULL,
	"action_type" varchar(50) NOT NULL,
	"input_summary" varchar(500) DEFAULT '',
	"output_preview" text DEFAULT '',
	"duration_ms" integer,
	"tokens_used" integer,
	"success" boolean DEFAULT true NOT NULL,
	"error_message" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "ai_settings" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"context" "ai_context" NOT NULL,
	"system_prompt" text DEFAULT '' NOT NULL,
	"tone" varchar(100) DEFAULT 'professional',
	"target_keywords" text DEFAULT '',
	"language" varchar(50) DEFAULT 'English',
	"content_rules" jsonb DEFAULT '{}'::jsonb,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "ai_settings_context_unique" UNIQUE("context")
);
--> statement-breakpoint
ALTER TABLE "products" ADD COLUMN "sku" varchar(100);--> statement-breakpoint
ALTER TABLE "products" ADD COLUMN "features" jsonb DEFAULT '[]'::jsonb;--> statement-breakpoint
ALTER TABLE "products" ADD COLUMN "applications" jsonb DEFAULT '[]'::jsonb;--> statement-breakpoint
ALTER TABLE "products" ADD COLUMN "faqs" jsonb DEFAULT '[]'::jsonb;--> statement-breakpoint
ALTER TABLE "products" ADD COLUMN "show_features" boolean DEFAULT true;--> statement-breakpoint
ALTER TABLE "products" ADD COLUMN "show_applications" boolean DEFAULT true;--> statement-breakpoint
ALTER TABLE "products" ADD COLUMN "show_faq" boolean DEFAULT true;--> statement-breakpoint
ALTER TABLE "media" ADD COLUMN "urls" jsonb DEFAULT '{}'::jsonb;--> statement-breakpoint
ALTER TABLE "media" ADD COLUMN "blur_data_url" text;--> statement-breakpoint
ALTER TABLE "media" ADD COLUMN "width" integer;--> statement-breakpoint
ALTER TABLE "media" ADD COLUMN "height" integer;--> statement-breakpoint
ALTER TABLE "media" ADD COLUMN "folder" varchar(255) DEFAULT 'general';--> statement-breakpoint
ALTER TABLE "settings" ADD COLUMN "category" varchar(50) DEFAULT 'general' NOT NULL;--> statement-breakpoint
ALTER TABLE "attribute_values" ADD CONSTRAINT "attribute_values_attribute_id_product_attributes_id_fk" FOREIGN KEY ("attribute_id") REFERENCES "public"."product_attributes"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "post_category_map" ADD CONSTRAINT "post_category_map_post_id_posts_id_fk" FOREIGN KEY ("post_id") REFERENCES "public"."posts"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "post_category_map" ADD CONSTRAINT "post_category_map_category_id_post_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."post_categories"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "post_tag_map" ADD CONSTRAINT "post_tag_map_post_id_posts_id_fk" FOREIGN KEY ("post_id") REFERENCES "public"."posts"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "post_tag_map" ADD CONSTRAINT "post_tag_map_tag_id_post_tags_id_fk" FOREIGN KEY ("tag_id") REFERENCES "public"."post_tags"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "posts" ADD CONSTRAINT "posts_author_id_users_id_fk" FOREIGN KEY ("author_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;