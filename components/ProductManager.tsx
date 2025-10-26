"use client";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { addToCart } from "@/cart/action";
import EditProductDialog from "./EditProductDialog";

export default function ProductManager({
  category,
  products = [],
  refreshData,
  allCategories = [],
}: any) {
  async function handleAddToCart(product: any) {
    try {
      await addToCart(product.id);
      toast.success(`🛒 Added ${product.name} to cart`);
      await refreshData();
    } catch (err) {
      console.error(err);
      toast.error("❌ Failed to add to cart");
    }
  }

  if (products.length === 0)
    return <p className="text-gray-500 italic">No products yet</p>;

  return (
    <div className="space-y-2">
      {products.map((p: any) => (
        <Card
          key={p.id}
          className="flex justify-between items-center p-3 bg-gray-50 hover:bg-gray-100 transition"
        >
          <div className="flex items-center justify-between w-full">
            <span>
              {p.name} — <b>${p.price}</b>
            </span>

            <div className="flex gap-2">
              <Button
                size="sm"
                className="bg-purple-500 hover:bg-purple-600 text-white"
                onClick={() => handleAddToCart(p)}
              >
                Add to Cart
              </Button>

              <EditProductDialog
                product={p}
                categories={allCategories}
                refreshData={refreshData}
              />
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
}
