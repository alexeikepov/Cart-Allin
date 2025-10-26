"use client";

import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import ProductManager from "./ProductManager";
import {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
} from "@/components/ui/alert-dialog";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { toast } from "sonner";
import { deleteCategory } from "@/cart/action";

export default function CategoryManager({
  categories = [],
  products = [],
  handleAddCategory,
  handleAddProduct,
  refreshData,
}: any) {
  async function handleDeleteCategory(categoryId: number) {
    await deleteCategory(categoryId);
    await refreshData();
    toast("🗑️ Category deleted");
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Create Category and Product</CardTitle>
        </CardHeader>
        <CardContent>
          <form
            onSubmit={handleAddCategory}
            className="flex items-center gap-2 mb-4"
          >
            <Input name="name" placeholder="Category name..." required />
            <Button
              type="submit"
              className="bg-green-500 hover:bg-green-600 text-white"
            >
              Add
            </Button>
          </form>

          <form onSubmit={handleAddProduct} className="grid grid-cols-4 gap-3">
            <Input
              name="name"
              placeholder="Product name..."
              className="col-span-1"
              required
            />
            <Input
              name="price"
              placeholder="Price..."
              type="number"
              step="0.01"
              required
              className="col-span-1"
            />
            <Select name="categoryId" required>
              <SelectTrigger className="col-span-1">
                <SelectValue placeholder="Select category..." />
              </SelectTrigger>
              <SelectContent>
                {categories.map((c: any) => (
                  <SelectItem key={`cat-opt-${c.id}`} value={String(c.id)}>
                    {c.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button
              type="submit"
              className="bg-blue-500 hover:bg-blue-600 text-white"
            >
              Create Product
            </Button>
          </form>
        </CardContent>
      </Card>

      {categories.map((cat: any) => {
        const catProducts = products.filter(
          (p: any) => p.categoryId === cat.id
        );
        return (
          <Card key={cat.id}>
            <CardHeader className="flex justify-between flex-row items-center">
              <CardTitle>
                {cat.name} ({catProducts.length})
              </CardTitle>

              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="destructive" size="sm">
                    Delete
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Delete "{cat.name}"?</AlertDialogTitle>
                    <AlertDialogDescription>
                      This will permanently remove the category and its products
                      association.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={() => handleDeleteCategory(cat.id)}
                    >
                      Confirm
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </CardHeader>

            <CardContent>
              <ProductManager
                category={cat}
                products={catProducts}
                refreshData={refreshData}
                allCategories={categories}
              />
            </CardContent>
          </Card>
        );
      })}
    </>
  );
}
