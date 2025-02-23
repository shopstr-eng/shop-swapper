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
          const products = results.data
            .filter((row: any) => row["sku"] || row["asin"] || row["ASIN"] || row["SKU"])
            .map((row: any) => ({
              id: row["sku"] || row["asin"] || row["ASIN"] || row["SKU"] || "",
              title: row["item-name"] || row["product-name"] || row["title"] || row["Title"] || "",
              description: row["item-description"] || row["product-description"] || row["description"] || row["Description"] || "",
              price: parseFloat(row["price"] || row["Price"] || row["list-price"] || "0"),
              currency: row["currency"] || "USD",
              quantity: parseInt(row["quantity"] || row["Quantity"] || row["stock-level"] || "0"),
              images: (row["image-url"] || row["image-urls"] || row["images"] || "")
                .split(/[,|]/)
                .map((url: string) => url.trim())
                .filter(Boolean),
              category: row["product-category"] || row["category"] || row["Category"] || "",
              weight: parseFloat(row["item-weight"] || row["weight"] || row["Weight"] || "0"),
              weightUnit: row["weight-unit"] || "kg",
              dimensions: row["item-dimensions"] || row["dimensions"] || row["Dimensions"],
              dimensionUnit: row["dimension-unit"] || "cm"
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
              // Collect all image URLs
              const images = [];
              if (row["Image Src"]) images.push(row["Image Src"]);
              if (row["Image Src 2"]) images.push(row["Image Src 2"]);
              if (row["Image Src 3"]) images.push(row["Image Src 3"]);

              // Get additional images from the Image column if it exists
              const additionalImages = row["Images"] || row["Additional Images"];
              if (additionalImages) {
                images.push(...additionalImages.split(/[,|]/).map((url: string) => url.trim()).filter(Boolean));
              }

              return {
                id: row["Variant SKU"] || row["ID"] || row["Product ID"] || "",
                title: row["Title"] || "",
                description: row["Body (HTML)"] || row["Description"] || "",
                price: parseFloat(row["Variant Price"] || row["Price"] || "0"),
                currency: row["Currency"] || "USD", // Shopify exports might include currency
                quantity: parseInt(row["Variant Inventory Qty"] || row["Inventory"] || "0"),
                images: images.filter(Boolean),
                category: row["Type"] || row["Product Type"] || row["Category"] || "",
                weight: parseFloat(row["Variant Weight"] || row["Weight"] || "0"),
                weightUnit: row["Variant Weight Unit"] || row["Weight Unit"] || "kg",
                dimensions: row["Variant Dimensions"] || `${row["Length"] || ""}x${row["Width"] || ""}x${row["Height"] || ""}`,
                dimensionUnit: row["Dimension Unit"] || "cm"
              };
            });
          resolve(products);
        } catch (error) {
          reject(new Error("Failed to parse Shopify data: " + (error as Error).message));
        }
      },
      error: (error) => reject(new Error("Failed to parse CSV: " + error.message))
    });
  });
}