"use client";

import { useCartStore } from "./cartStore";
import { getFormData } from "zvijude/form/funcs";
import {
  addCategory,
  addProduct,
  addToCart,
  deleteCategory,
  confirmOrder,
} from "./action";

import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import OrdersTabs from "@/components/orders-tab";

interface Product {
  id: number;
  name: string;
  price: number;
  categoryId?: number;
  createdAt: string;
}

interface Category {
  id: number;
  name: string;
}

export default function MainComp({
  username = "User",
  categories = [],
  products = [],
  serverCart = [],
}: {
  username?: string;
  categories?: Category[];
  products?: Product[];
  serverCart?: any[];
}) {
  const { cart, addItem } = useCartStore();

  async function handleAddCategory(e: any) {
    e.preventDefault();
    const data = getFormData(e);
    await addCategory(data);
    e.target.reset();
  }

  async function handleAddProduct(e: any) {
    e.preventDefault();
    const data = getFormData(e);
    await addProduct(data);
    e.target.reset();
  }

  async function handleAddToCart(productId: number, product: Product) {
    await addToCart(productId);
    addItem(product);
  }

  async function handleDeleteCategory(categoryId: number) {
    await deleteCategory(categoryId);
  }

  async function handleConfirmOrder() {
    await confirmOrder();
    window.location.reload();
  }

  return (
    <main className="flex flex-col items-start max-w-[900px] mx-auto p-10 space-y-8">
      <h1 className="text-4xl font-extrabold tracking-tight mb-4">
        Welcome, <span className="text-blue-600">{username}</span> 🛍️
      </h1>

      {/* ====== CREATE CATEGORY ====== */}
      <Card className="w-full">
        <CardHeader>
          <CardTitle>Create Category</CardTitle>
        </CardHeader>
        <CardContent>
          <form
            onSubmit={handleAddCategory}
            className="flex items-center gap-2"
          >
            <Input name="name" placeholder="Category name..." required />
            <Button type="submit" className="bg-green-500 hover:bg-green-600">
              Add
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* ====== CREATE PRODUCT ====== */}
      <Card className="w-full">
        <CardHeader>
          <CardTitle>Add Product</CardTitle>
        </CardHeader>
        <CardContent>
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
                {categories.map((c) => (
                  <SelectItem key={c.id} value={String(c.id)}>
                    {c.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button type="submit" className="bg-blue-500 hover:bg-blue-600">
              Add
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* ====== CATEGORIES & PRODUCTS ====== */}
      {categories.map((cat) => {
        const catProducts = products.filter((p) => p.categoryId === cat.id);
        return (
          <Card key={cat.id} className="w-full">
            <CardHeader className="flex justify-between flex-row items-center">
              <CardTitle>
                {cat.name} ({catProducts.length})
              </CardTitle>
              <Button
                variant="destructive"
                size="sm"
                onClick={() => handleDeleteCategory(cat.id)}
              >
                🗑
              </Button>
            </CardHeader>

            <CardContent className="space-y-2">
              {catProducts.length === 0 ? (
                <p className="text-gray-500 italic">No products yet</p>
              ) : (
                catProducts.map((p) => (
                  <Card
                    key={p.id}
                    className="flex justify-between items-center p-3 bg-gray-50 hover:bg-gray-100 transition"
                  >
                    <span>
                      {p.name} — <b>${p.price}</b>
                    </span>
                    <Button
                      size="sm"
                      className="bg-purple-500 hover:bg-purple-600"
                      onClick={() => handleAddToCart(p.id, p)}
                    >
                      Add to Cart
                    </Button>
                  </Card>
                ))
              )}
            </CardContent>
          </Card>
        );
      })}

      {/* ====== CART SECTION ====== */}
      <Card className="w-full mt-8 border-t">
        <CardHeader className="flex justify-between items-center">
          <CardTitle>🛒 Cart ({cart.length || serverCart.length})</CardTitle>
          <div className="flex gap-3">
            <Button
              className="bg-emerald-600 text-white"
              onClick={handleConfirmOrder}
            >
              ✅ Order All
            </Button>

            <Dialog>
              <DialogTrigger asChild>
                <Button className="bg-indigo-500 text-white">
                  🧾 My Orders
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-3xl">
                <DialogHeader>
                  <DialogTitle>My Orders</DialogTitle>
                </DialogHeader>
                <OrdersTabs />
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>

        <CardContent>
          {cart.length === 0 && serverCart.length === 0 ? (
            <p className="text-gray-500 italic">Your cart is empty</p>
          ) : (
            <div className="space-y-2">
              {(cart.length > 0 ? cart : serverCart).map((item) => (
                <Card key={item.id} className="flex justify-between p-3">
                  <span>
                    {item.name} — <b>${item.price}</b>
                  </span>
                  <span>x{item.quantity ?? 1}</span>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </main>
  );
}
