import { toast } from "sonner";
import type { SubscriptionTier } from "@/hooks/useProfile";

// These would normally be environment variables
const SHOPIFY_STORE_DOMAIN = import.meta.env.VITE_SHOPIFY_STORE_DOMAIN || "brickhouse-mindset.myshopify.com";

// Map tiers to Shopify product Variant IDs (or Product Permalinks)
// These IDs need to be populated with actual Shopify Variant IDs once the store is set up
const TIER_VARIANTS: Record<string, string> = {
  foundation: "12345678901234",
  brickhouse: "23456789012345",
  goddess: "34567890123456",
  coaching: "45678901234567",
};

/**
 * Initiates a checkout process using Shopify cart permalinks.
 * This is the simplest way to direct a user to Shopify for a specific subscription.
 */
export const createShopifyCheckout = (tier: SubscriptionTier) => {
  if (tier === "free") {
    toast.error("Cannot purchase free tier");
    return;
  }

  const variantId = TIER_VARIANTS[tier];
  
  if (!variantId || variantId === "12345678901234") {
    // Development fallback when IDs aren't set
    toast.info(`Redirecting to Shopify for ${tier} tier... (Mock)`);
    console.log(`[Shopify Mock] Would redirect to: https://${SHOPIFY_STORE_DOMAIN}/cart/${variantId}:1`);
    return;
  }

  // Creating a Shopify cart permalink
  // Format: https://{store-domain}/cart/{variant_id}:{quantity}
  const checkoutUrl = `https://${SHOPIFY_STORE_DOMAIN}/cart/${variantId}:1`;
  
  // In a real app, we might also append tracking parameters or user email
  // checkoutUrl += `?checkout[email]=${userEmail}`
  
  window.location.href = checkoutUrl;
};
