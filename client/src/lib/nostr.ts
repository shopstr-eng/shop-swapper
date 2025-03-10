import { SimplePool } from 'nostr-tools/pool';
import type { BaseProduct } from "./parsers";
import type { NostrProduct } from "@shared/schema";

const RELAYS = [
  'wss://relay.damus.io',
  'wss://nos.lol',
  'wss://relay.primal.net',
  'wss://sendit.nosflare.com',
  'wss://relay.nostr.band'
];

export function convertToNostr(product: BaseProduct): NostrProduct {
  const nostrProduct: NostrProduct = {
    kind: 30402,
    created_at: Math.floor(Date.now() / 1000),
    content: product.description,
    tags: [
      ["d", product.id],
      ["title", product.title],
      ["price", product.price.toString(), product.currency],
      ["type", "simple", "physical"],
      ["visibility", "on-sale"],
      ["stock", product.quantity.toString()],
      ["summary", product.description.substring(0, 280)], // Short summary
    ]
  };

  // Add images if available
  product.images.forEach((img, idx) => {
    nostrProduct.tags.push(["image", img, "", idx.toString()]);
  });

  // Add category if available
  if (product.category) {
    nostrProduct.tags.push(["t", product.category]);
  }

  // Add weight if available
  if (product.weight && product.weightUnit) {
    nostrProduct.tags.push(["weight", product.weight.toString(), product.weightUnit]);
  }

  // Add dimensions if available
  if (product.dimensions && product.dimensionUnit) {
    nostrProduct.tags.push(["dim", product.dimensions, product.dimensionUnit]);
  }

  return nostrProduct;
}

export async function publishToNostr(events: NostrProduct[]): Promise<void> {
  const pool = new SimplePool();

  try {
    // Publish each event to all relays
    await Promise.all(
      events.map(event => 
        Promise.any(pool.publish(RELAYS, event))
      )
    );
  } finally {
    // Clean up the pool
    pool.close();
  }
}