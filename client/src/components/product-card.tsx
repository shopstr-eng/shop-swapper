import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Edit2, Save, X, Image as ImageIcon } from "lucide-react";
import type { NostrProduct } from "@shared/schema";
import type { BaseProduct } from "@/lib/parsers";

interface ProductCardProps {
  product: BaseProduct;
  onUpdate: (updatedProduct: BaseProduct) => void;
}

export function ProductCard({ product, onUpdate }: ProductCardProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editedProduct, setEditedProduct] = useState(product);

  const handleSave = () => {
    onUpdate(editedProduct);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditedProduct(product);
    setIsEditing(false);
  };

  if (isEditing) {
    return (
      <Card className="w-full">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-lg font-medium">Edit Product</CardTitle>
          <div className="flex gap-2">
            <Button size="sm" variant="outline" onClick={handleSave}>
              <Save className="h-4 w-4 mr-1" />
              Save
            </Button>
            <Button size="sm" variant="outline" onClick={handleCancel}>
              <X className="h-4 w-4 mr-1" />
              Cancel
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Product ID</Label>
            <Input 
              value={editedProduct.id}
              onChange={(e) => setEditedProduct({...editedProduct, id: e.target.value})}
            />
          </div>
          <div className="space-y-2">
            <Label>Title</Label>
            <Input 
              value={editedProduct.title}
              onChange={(e) => setEditedProduct({...editedProduct, title: e.target.value})}
            />
          </div>
          <div className="space-y-2">
            <Label>Description</Label>
            <Textarea 
              value={editedProduct.description}
              onChange={(e) => setEditedProduct({...editedProduct, description: e.target.value})}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Price</Label>
              <Input 
                type="number"
                value={editedProduct.price}
                onChange={(e) => setEditedProduct({...editedProduct, price: parseFloat(e.target.value)})}
              />
            </div>
            <div className="space-y-2">
              <Label>Currency</Label>
              <Input 
                value={editedProduct.currency}
                onChange={(e) => setEditedProduct({...editedProduct, currency: e.target.value})}
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Quantity</Label>
              <Input 
                type="number"
                value={editedProduct.quantity}
                onChange={(e) => setEditedProduct({...editedProduct, quantity: parseInt(e.target.value)})}
              />
            </div>
            <div className="space-y-2">
              <Label>Category</Label>
              <Input 
                value={editedProduct.category}
                onChange={(e) => setEditedProduct({...editedProduct, category: e.target.value})}
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Weight ({editedProduct.weightUnit})</Label>
              <Input 
                type="number"
                value={editedProduct.weight}
                onChange={(e) => setEditedProduct({...editedProduct, weight: parseFloat(e.target.value)})}
              />
            </div>
            <div className="space-y-2">
              <Label>Dimensions ({editedProduct.dimensionUnit})</Label>
              <Input 
                value={editedProduct.dimensions}
                onChange={(e) => setEditedProduct({...editedProduct, dimensions: e.target.value})}
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label>Images (One URL per line)</Label>
            <Textarea 
              value={editedProduct.images.join('\n')}
              onChange={(e) => setEditedProduct({...editedProduct, images: e.target.value.split('\n').filter(Boolean)})}
              placeholder="Enter image URLs, one per line"
            />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-lg font-medium">{product.title}</CardTitle>
        <Button size="sm" variant="outline" onClick={() => setIsEditing(true)}>
          <Edit2 className="h-4 w-4 mr-1" />
          Edit
        </Button>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Product ID */}
          <div className="text-sm text-muted-foreground">
            ID: {product.id}
          </div>

          {/* Description */}
          <div className="space-y-1">
            <p className="text-sm font-medium">Description</p>
            <p className="text-sm text-muted-foreground">{product.description}</p>
          </div>

          {/* Price and Stock */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm font-medium">Price</p>
              <p className="text-sm">{product.currency} {product.price}</p>
            </div>
            <div>
              <p className="text-sm font-medium">Stock</p>
              <p className="text-sm">{product.quantity}</p>
            </div>
          </div>

          {/* Category */}
          {product.category && (
            <div>
              <p className="text-sm font-medium">Category</p>
              <p className="text-sm text-muted-foreground">{product.category}</p>
            </div>
          )}

          {/* Physical Properties */}
          <div className="grid grid-cols-2 gap-4">
            {product.weight && (
              <div>
                <p className="text-sm font-medium">Weight</p>
                <p className="text-sm">{product.weight} {product.weightUnit}</p>
              </div>
            )}
            {product.dimensions && (
              <div>
                <p className="text-sm font-medium">Dimensions</p>
                <p className="text-sm">{product.dimensions} {product.dimensionUnit}</p>
              </div>
            )}
          </div>

          {/* Images */}
          {product.images.length > 0 && (
            <div className="space-y-2">
              <p className="text-sm font-medium">Images</p>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                {product.images.map((url, idx) => (
                  <div 
                    key={idx}
                    className="aspect-square rounded-md border bg-muted flex items-center justify-center overflow-hidden"
                  >
                    {url ? (
                      <img 
                        src={url} 
                        alt={`Product image ${idx + 1}`}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.src = ""; // Clear the broken image
                          target.className = "hidden";
                          target.parentElement!.innerHTML = '<div class="flex items-center justify-center w-full h-full text-muted-foreground"><ImageIcon className="w-8 h-8" /></div>';
                        }}
                      />
                    ) : (
                      <ImageIcon className="w-8 h-8 text-muted-foreground" />
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}