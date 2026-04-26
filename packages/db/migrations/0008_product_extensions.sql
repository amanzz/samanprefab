-- Add custom_buttons column to products
-- Also: features/applications icon/image fields are stored inside existing JSONB arrays, no column change needed
ALTER TABLE products ADD COLUMN IF NOT EXISTS custom_buttons jsonb DEFAULT '[]'::jsonb;
