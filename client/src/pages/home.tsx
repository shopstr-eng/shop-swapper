import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { fileUploadSchema } from "@shared/schema";
import { parseAmazonData, parseEbayData, parseShopifyData } from "@/lib/parsers";
import { convertToNostr } from "@/lib/nostr";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Upload, Copy, FileWarning } from "lucide-react";
import JsonView from "@uiw/react-json-view";

export default function Home() {
  const [jsonOutput, setJsonOutput] = useState<any>(null);
  const { toast } = useToast();

  const form = useForm({
    resolver: zodResolver(fileUploadSchema),
    defaultValues: {
      file: undefined,
      type: "amazon"
    }
  });

  const onSubmit = async (data: any) => {
    try {
      const file = data.file[0];
      if (!file) {
        toast({
          title: "Error",
          description: "Please select a file",
          variant: "destructive"
        });
        return;
      }

      let products;
      switch (data.type) {
        case "amazon":
          products = await parseAmazonData(file);
          break;
        case "ebay":
          products = await parseEbayData(file);
          break;
        case "shopify":
          products = await parseShopifyData(file);
          break;
        default:
          throw new Error("Unsupported platform");
      }

      const nostrProducts = products.map(convertToNostr);
      setJsonOutput(nostrProducts);

      toast({
        title: "Success",
        description: `Converted ${nostrProducts.length} products`
      });
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to process file",
        variant: "destructive"
      });
    }
  };

  const copyToClipboard = () => {
    if (jsonOutput) {
      navigator.clipboard.writeText(JSON.stringify(jsonOutput, null, 2));
      toast({
        title: "Copied",
        description: "JSON copied to clipboard"
      });
    }
  };

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="text-center space-y-2">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
            Product Data Converter
          </h1>
          <p className="text-muted-foreground">
            Convert e-commerce product data to Nostr format
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Upload Product Data</CardTitle>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                  control={form.control}
                  name="type"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Platform</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select platform" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="amazon">Amazon</SelectItem>
                          <SelectItem value="ebay">eBay</SelectItem>
                          <SelectItem value="shopify">Shopify</SelectItem>
                        </SelectContent>
                      </Select>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="file"
                  render={({ field: { onChange, value, ...field } }) => (
                    <FormItem>
                      <FormLabel>CSV/JSON File</FormLabel>
                      <FormControl>
                        <Input
                          type="file"
                          accept=".csv,.json"
                          onChange={(e) => onChange(e.target.files)}
                          {...field}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />

                <Button type="submit" className="w-full">
                  <Upload className="w-4 h-4 mr-2" />
                  Convert Data
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>

        {jsonOutput && (
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Nostr Format Output</CardTitle>
              <Button variant="outline" onClick={copyToClipboard}>
                <Copy className="w-4 h-4 mr-2" />
                Copy JSON
              </Button>
            </CardHeader>
            <CardContent>
              <div className="max-h-[500px] overflow-auto rounded border">
                <JsonView 
                  value={jsonOutput}
                  style={{ padding: '1rem' }}
                />
              </div>
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileWarning className="w-5 h-5" />
              File Format Guidelines
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="prose prose-sm max-w-none">
              <ul className="list-disc pl-4 space-y-2">
                <li><strong>Amazon:</strong> Inventory File Format (.csv)</li>
                <li><strong>eBay:</strong> Bulk Listing Format (.csv)</li>
                <li><strong>Shopify:</strong> Product Export Format (.csv)</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}