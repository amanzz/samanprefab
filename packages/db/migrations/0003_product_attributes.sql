CREATE TYPE "attribute_type" AS ENUM('text', 'number', 'select');

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

INSERT INTO "product_attributes" ("name", "unit", "type", "sort_order") VALUES
  ('Length', 'ft', 'number', 1),
  ('Width', 'ft', 'number', 2),
  ('Height', 'ft', 'number', 3),
  ('Area', 'sq ft', 'number', 4),
  ('Wall Thickness', 'mm', 'number', 5),
  ('Material', NULL, 'text', 6),
  ('Roof Type', NULL, 'select', 7),
  ('Flooring', NULL, 'select', 8),
  ('Insulation', NULL, 'text', 9),
  ('Capacity', 'persons', 'number', 10),
  ('Weight', 'kg', 'number', 11),
  ('Color', NULL, 'text', 12);
