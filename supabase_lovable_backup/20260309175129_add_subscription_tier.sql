CREATE TYPE user_subscription_tier AS ENUM ('free', 'foundation', 'brickhouse', 'goddess', 'coaching');

ALTER TABLE profiles
ADD COLUMN subscription_tier user_subscription_tier DEFAULT 'free',
ADD COLUMN shopify_customer_id TEXT;
