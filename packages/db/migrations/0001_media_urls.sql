ALTER TABLE "media" ADD COLUMN IF NOT EXISTS "urls" jsonb DEFAULT '{}';
ALTER TABLE "media" ADD COLUMN IF NOT EXISTS "blur_data_url" text;
ALTER TABLE "media" ADD COLUMN IF NOT EXISTS "width" integer;
ALTER TABLE "media" ADD COLUMN IF NOT EXISTS "height" integer;
ALTER TABLE "media" ADD COLUMN IF NOT EXISTS "folder" varchar(255) DEFAULT 'general';
