"use client";

import { useCartStore } from "@/cart/cartStore";
import { toast } from "sonner";
import { addCategory, addProduct, confirmOrder } from "@/cart/action";
import { getFormData } from "zvijude/form/funcs";
import { useEffect } from "react";

import HeaderSection from "@/components/HeaderSection";
import CategoryManager from "@/components/CategoryManager";

export default function MainComp({
  username = "User",
  categories = [],
  products = [],
  serverCart = [],
}: any) {
  const {
    cart = [],
    categories: catState = [],
    products: prodState = [],
    serverCart: cartState = [],
    setData,
    refreshData,
  } = useCartStore();

  useEffect(() => {
    if (catState.length === 0 && categories.length > 0) {
      setData({ categories, products, serverCart });
    }
  }, [categories, products, serverCart, catState.length, setData]);

  async function handleAddCategory(e: any) {
    e.preventDefault();
    const data = getFormData(e.nativeEvent);
    await addCategory(data);
    await refreshData();
    e.target.reset();
    toast.success("✅ Category added");
  }

  async function handleAddProduct(e: any) {
    e.preventDefault();
    const data = getFormData(e.nativeEvent);
    await addProduct(data);
    await refreshData();
    e.target.reset();
    toast.success("✅ Product added");
  }

  async function handleConfirmOrder() {
    await confirmOrder();
    await refreshData();
    toast.success("✅ Order confirmed");
  }

  const mergedCart = cart.length > 0 ? cart : cartState;
  const cartCount = mergedCart.length;

  return (
    <main className="max-w-[900px] mx-auto p-10 flex flex-col gap-8">
      <HeaderSection
        username={username}
        cartCount={cartCount}
        onConfirmOrder={handleConfirmOrder}
      />

      <CategoryManager
        categories={catState || []}
        products={prodState || []}
        handleAddCategory={handleAddCategory}
        handleAddProduct={handleAddProduct}
        refreshData={refreshData}
      />
    </main>
  );
}
