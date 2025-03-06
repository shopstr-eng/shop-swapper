import { z } from "zod";

// File upload schema
export const fileUploadSchema = z.object({
  file: z.any(),
  type: z.enum(["woocommerce", "ebay", "shopify"])
});

// Nostr product schema
export const nostrProductSchema = z.object({
  kind: z.literal(30402),
  created_at: z.number(),
  content: z.string(),
  tags: z.array(z.array(z.string()))
});

export type NostrProduct = z.infer<typeof nostrProductSchema>;