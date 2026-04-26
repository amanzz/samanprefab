-- Add faqs column to products table for FAQ system (Task 7)
ALTER TABLE "products" ADD COLUMN IF NOT EXISTS "faqs" jsonb DEFAULT '[]';
