-- House configurations table for saving user selections
CREATE TABLE IF NOT EXISTS house_configurations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  selections JSONB NOT NULL DEFAULT '{}',
  total_price DECIMAL(12, 2) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes
CREATE INDEX idx_house_configurations_user_id ON house_configurations(user_id);
CREATE INDEX idx_house_configurations_product_id ON house_configurations(product_id);

-- Add comments
COMMENT ON TABLE house_configurations IS 'Saved house configurations with user selections';
COMMENT ON COLUMN house_configurations.selections IS 'JSON object mapping anchor_id to selected product_id';
COMMENT ON COLUMN house_configurations.total_price IS 'Total price including base product and selected options';
