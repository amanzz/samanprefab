-- Blog CMS: posts, post_categories, post_tags, and junction tables

DO $$ BEGIN
  CREATE TYPE "post_status" AS ENUM('draft', 'published');
EXCEPTION WHEN duplicate_object THEN null;
END $$;

CREATE TABLE IF NOT EXISTS "post_categories" (
  "id"          uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "name"        varchar(255) NOT NULL,
  "slug"        varchar(255) NOT NULL UNIQUE,
  "description" text,
  "parent_id"   uuid,
  "sort_order"  integer DEFAULT 0 NOT NULL,
  "created_at"  timestamp DEFAULT now() NOT NULL,
  "updated_at"  timestamp DEFAULT now() NOT NULL
);

CREATE TABLE IF NOT EXISTS "post_tags" (
  "id"         uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "name"       varchar(100) NOT NULL,
  "slug"       varchar(100) NOT NULL UNIQUE,
  "created_at" timestamp DEFAULT now() NOT NULL
);

CREATE TABLE IF NOT EXISTS "posts" (
  "id"                   uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "title"                varchar(200) NOT NULL,
  "slug"                 varchar(255) NOT NULL UNIQUE,
  "content"              jsonb DEFAULT '{}',
  "excerpt"              text,
  "featured_image"       varchar(500),
  "status"               "post_status" DEFAULT 'draft' NOT NULL,
  "author_id"            uuid REFERENCES "users"("id") ON DELETE SET NULL,
  "meta_title"           varchar(65),
  "meta_description"     varchar(160),
  "canonical_url"        varchar(500),
  "og_title"             varchar(200),
  "og_description"       varchar(300),
  "og_image"             varchar(500),
  "twitter_title"        varchar(200),
  "twitter_description"  varchar(300),
  "twitter_image"        varchar(500),
  "published_at"         timestamp,
  "created_at"           timestamp DEFAULT now() NOT NULL,
  "updated_at"           timestamp DEFAULT now() NOT NULL
);

CREATE TABLE IF NOT EXISTS "post_category_map" (
  "post_id"     uuid NOT NULL REFERENCES "posts"("id") ON DELETE CASCADE,
  "category_id" uuid NOT NULL REFERENCES "post_categories"("id") ON DELETE CASCADE,
  PRIMARY KEY ("post_id", "category_id")
);

CREATE TABLE IF NOT EXISTS "post_tag_map" (
  "post_id" uuid NOT NULL REFERENCES "posts"("id") ON DELETE CASCADE,
  "tag_id"  uuid NOT NULL REFERENCES "post_tags"("id") ON DELETE CASCADE,
  PRIMARY KEY ("post_id", "tag_id")
);

CREATE INDEX IF NOT EXISTS "posts_status_idx" ON "posts" ("status");
CREATE INDEX IF NOT EXISTS "posts_slug_idx" ON "posts" ("slug");
CREATE INDEX IF NOT EXISTS "post_category_map_post_idx" ON "post_category_map" ("post_id");
CREATE INDEX IF NOT EXISTS "post_tag_map_post_idx" ON "post_tag_map" ("post_id");
