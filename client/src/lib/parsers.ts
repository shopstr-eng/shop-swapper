import Papa from "papaparse";
import type { NostrProduct } from "@shared/schema";

// Common interface for all product data
export interface BaseProduct {
  id: string;
  title: string;
  description: string;
  price: number;
  currency: string;
  quantity: number;
  images: string[];
  category?: string;
  weight?: number;
  weightUnit?: string;
  dimensions?: string;
  dimensionUnit?: string;
}

// Parser functions for different platforms
export async function parseAmazonData(file: File): Promise<BaseProduct[]> {
  return new Promise((resolve, reject) => {
    Papa.parse(file, {
      header: true,
      complete: (results) => {
        try {
          const products = results.data.map((row: any) => ({
            id: row["sku"] || row["asin"] || "",
            title: row["item-name"] || row["product-name"] || "",
            description: row["item-description"] || row["product-description"] || "",
            price: parseFloat(row["price"] || "0"),
            currency: "USD",
            quantity: parseInt(row["quantity"] || "0"),
            images: row["image-url"]?.split(",").filter(Boolean) || [],
            category: row["product-category"],
            weight: parseFloat(row["item-weight"] || "0"),
            weightUnit: "kg",
            dimensions: row["item-dimensions"],
            dimensionUnit: "cm"
          }));
          resolve(products);
        } catch (error) {
          reject(new Error("Failed to parse Amazon data: " + (error as Error).message));
        }
      },
      error: (error) => reject(new Error("Failed to parse CSV: " + error.message))
    });
  });
}

export async function parseEbayData(file: File): Promise<BaseProduct[]> {
  return new Promise((resolve, reject) => {
    Papa.parse(file, {
      header: true,
      complete: (results) => {
        try {
          const products = results.data
            .filter((row: any) => row["SKU"] || row["Title"]) // Filter out empty rows
            .map((row: any) => {
              // Get all image URLs
              const imageUrls = [];
              for (let i = 1; i <= 12; i++) {
                const url = row[`Picture URL ${i}`];
                if (url && url.trim() !== '') {
                  imageUrls.push(url);
                }
              }

              // Handle dimensions
              const length = row["Length"] || "0";
              const width = row["Width"] || "0";
              const height = row["Height"] || "0";
              const dimensions = `${length}x${width}x${height}`;

              return {
                id: row["SKU"] || "",
                title: row["Title"] || "",
                description: row["Product Description"] || "",
                price: parseFloat(row["Start Price"] || "0"),
                currency: "USD", // Default to USD if not specified
                quantity: parseInt(row["Quantity"] || "0"),
                images: imageUrls,
                category: row["Type"] || "",
                weight: parseFloat(row["Weight Major"] || "0"),
                weightUnit: "kg", // Default to kg
                dimensions: dimensions !== "0x0x0" ? dimensions : undefined,
                dimensionUnit: row["Measurement System"] === "English" ? "in" : "cm"
              };
            });
          resolve(products);
        } catch (error) {
          reject(new Error("Failed to parse eBay data: " + (error as Error).message));
        }
      },
      error: (error) => reject(new Error("Failed to parse CSV: " + error.message))
    });
  });
}

export async function parseShopifyData(file: File): Promise<BaseProduct[]> {
  return new Promise((resolve, reject) => {
    Papa.parse(file, {
      header: true,
      complete: (results) => {
        try {
          const products = results.data
            .filter((row: any) => row["Handle"] || row["Title"]) // Filter out empty rows
            .map((row: any) => {
              // Convert grams to kg for weight
              const weightInGrams = parseFloat(row["Variant Grams"] || "0");
              const weightInKg = weightInGrams / 1000;

              return {
                id: row["Variant SKU"] || row["Handle"] || "",
                title: row["Title"] || "",
                description: row["Body (HTML)"] || "",
                price: parseFloat(row["Variant Price"] || "0"),
                currency: "USD", // Default to USD
                quantity: parseInt(row["Variant Inventory Qty"] || "0"),
                images: (row["Image Src"] || "").split(",").filter(Boolean).map((url: string) => url.trim()),
                category: row["Type"] || row["Product Category"] || "",
                weight: weightInKg,
                weightUnit: "kg", // Convert to kg standard
                dimensions: undefined, // Shopify export doesn't include dimensions
                dimensionUnit: "cm" // Default to cm
              };
            })
            .filter((product: BaseProduct) => product.title && product.id); // Filter out invalid products

          resolve(products);
        } catch (error) {
          reject(new Error("Failed to parse Shopify data: " + (error as Error).message));
        }
      },
      error: (error) => reject(new Error("Failed to parse CSV: " + error.message))
    });
  });
}