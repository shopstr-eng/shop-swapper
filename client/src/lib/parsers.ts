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
        const products = results.data.map((row: any) => ({
          id: row["sku"] || row["asin"],
          title: row["item-name"] || row["product-name"],
          description: row["item-description"] || row["product-description"],
          price: parseFloat(row["price"]),
          currency: "USD",
          quantity: parseInt(row["quantity"] || "0"),
          images: row["image-url"]?.split(",") || [],
          category: row["product-category"],
          weight: parseFloat(row["item-weight"] || "0"),
          weightUnit: "kg",
          dimensions: row["item-dimensions"],
          dimensionUnit: "cm"
        }));
        resolve(products);
      },
      error: (error) => reject(error)
    });
  });
}

export async function parseEbayData(file: File): Promise<BaseProduct[]> {
  return new Promise((resolve, reject) => {
    Papa.parse(file, {
      header: true,
      complete: (results) => {
        const products = results.data.map((row: any) => ({
          id: row["Item ID"] || row["Custom Label"],
          title: row["Title"],
          description: row["Description"],
          price: parseFloat(row["Start Price"]),
          currency: row["Currency"],
          quantity: parseInt(row["Quantity"] || "0"),
          images: row["Picture URL"]?.split("|") || [],
          category: row["Category Name"],
          weight: parseFloat(row["Package Weight"] || "0"),
          weightUnit: row["Weight Unit"] || "kg",
          dimensions: `${row["Package Length"]}x${row["Package Width"]}x${row["Package Height"]}`,
          dimensionUnit: row["Dimension Unit"] || "cm"
        }));
        resolve(products);
      },
      error: (error) => reject(error)
    });
  });
}

export async function parseShopifyData(file: File): Promise<BaseProduct[]> {
  return new Promise((resolve, reject) => {
    Papa.parse(file, {
      header: true,
      complete: (results) => {
        const products = results.data.map((row: any) => ({
          id: row["Variant SKU"] || row["ID"],
          title: row["Title"],
          description: row["Body (HTML)"],
          price: parseFloat(row["Variant Price"]),
          currency: "USD", // Shopify exports don't include currency
          quantity: parseInt(row["Variant Inventory Qty"] || "0"),
          images: row["Image Src"]?.split(",") || [],
          category: row["Type"],
          weight: parseFloat(row["Variant Weight"] || "0"),
          weightUnit: row["Variant Weight Unit"] || "kg",
          dimensions: row["Variant Dimensions"],
          dimensionUnit: "cm"
        }));
        resolve(products);
      },
      error: (error) => reject(error)
    });
  });
}