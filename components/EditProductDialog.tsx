"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { getFormData } from "zvijude/form/funcs";
import { updateProduct } from "@/cart/action";
import { toast } from "sonner";

export default function EditProductDialog({
  product,
  categories = [],
  refreshData,
}: any) {
  const [open, setOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(
    String(product.categoryId || "")
  );

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = getFormData(e.nativeEvent);
    formData.id = product.id;
    formData.categoryId = selectedCategory;

    try {
      await updateProduct(formData);
      await refreshData();
      toast.success(`✅ Product "${formData.name}" updated`);
      setOpen(false);
    } catch (err) {
      console.error(err);
      toast.error("❌ Failed to update product");
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" variant="outline">
          ✏️ Edit
        </Button>
      </DialogTrigger>

      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Edit Product</DialogTitle>
        </DialogHeader>

        <form className="flex flex-col gap-3" onSubmit={handleSubmit}>
          <Input
            name="name"
            defaultValue={product.name}
            placeholder="Product name"
            required
          />
          <Input
            name="price"
            defaultValue={product.price}
            type="number"
            step="0.01"
            placeholder="Price"
            required
          />

          <Select value={selectedCategory} onValueChange={setSelectedCategory}>
            <SelectTrigger>
              <SelectValue placeholder="Select category..." />
            </SelectTrigger>
            <SelectContent>
              {(categories || []).map((c: any) => (
                <SelectItem key={c.id} value={String(c.id)}>
                  {c.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Button
            type="submit"
            className="bg-blue-500 hover:bg-blue-600 text-white"
          >
            Save Changes
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
