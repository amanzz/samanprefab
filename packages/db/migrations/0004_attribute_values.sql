CREATE TABLE "attribute_values" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "attribute_id" uuid NOT NULL REFERENCES "product_attributes"("id") ON DELETE CASCADE,
  "value" varchar(200) NOT NULL,
  "sort_order" integer DEFAULT 0 NOT NULL,
  "created_at" timestamp DEFAULT now() NOT NULL
);

CREATE INDEX "attribute_values_attribute_id_idx" ON "attribute_values" ("attribute_id");
CREATE UNIQUE INDEX "attribute_values_unique_idx" ON "attribute_values" ("attribute_id", "value");
