"use server";

import { db } from "@/scripts/db_conn";
import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

interface User {
  id: number;
  user: string;
  createdAt: string;
}

export async function connectUser(data: any) {
  const username = data.username?.trim();
  if (!username) throw new Error("Username required");

  let user = await db<User>("users").where("user", username).first();

  if (!user) {
    const [newUser] = await db<User>("users")
      .insert({ user: username })
      .returning("*");
    user = newUser;
  }

  const cookieStore = await cookies();

  cookieStore.set("user_id", "", { path: "/", maxAge: 0 });

  cookieStore.set("user_id", String(user.id), {
    path: "/",
    httpOnly: false,
    maxAge: 60 * 60 * 24 * 7,
  });

  redirect("/shop");
}

export async function addCategory(data: any) {
  const cookieStore = await cookies();
  const userId = cookieStore.get("user_id")?.value;
  if (!userId) throw new Error("Not authorized");

  const name = String(data.name ?? "").trim();
  if (!name) throw new Error("Category name required");

  await db("categories").insert({
    name,
    user_id: Number(userId),
  });

  revalidatePath("/shop");
}

export async function deleteCategory(categoryId: number) {
  await db("categories").where("id", categoryId).del();
  revalidatePath("/shop");
}

export async function addProduct(data: any) {
  const name = String(data.name ?? "").trim();
  const price = Number(data.price);
  const categoryId = Number(data.categoryId);

  if (!name) throw new Error("Product name is required");
  if (isNaN(price) || price <= 0) throw new Error("Valid price required");

  await db("products").insert({
    name,
    price,
    categoryId: categoryId || null,
  });

  revalidatePath("/shop");
}

export async function getProducts() {
  return db("products")
    .leftJoin("categories", "products.categoryId", "categories.id")
    .select(
      "products.id",
      "products.name",
      "products.price",
      "categories.name as category"
    )
    .orderBy("products.id", "asc");
}

export async function addToCart(productId: number) {
  const cookieStore = await cookies();
  const userId = cookieStore.get("user_id")?.value;
  if (!userId) throw new Error("Not authorized");

  const existing = await db("cart_items")
    .where({
      userId: Number(userId),
      productId: Number(productId),
      status: "in_cart",
    })
    .first();

  if (existing) {
    await db("cart_items")
      .where({ id: existing.id })
      .update({ quantity: existing.quantity + 1 });
  } else {
    await db("cart_items").insert({
      userId: Number(userId),
      productId: Number(productId),
      quantity: 1,
      status: "in_cart",
    });
  }

  revalidatePath("/shop");
}

export async function getCart() {
  const cookieStore = await cookies();
  const userId = cookieStore.get("user_id")?.value;
  if (!userId) throw new Error("Not authorized");

  return db("cart_items")
    .join("products", "cart_items.productId", "products.id")
    .select(
      "cart_items.id as cartItemId",
      "products.name as productName",
      "products.price",
      "cart_items.quantity",
      "cart_items.status",
      "cart_items.createdAt"
    )
    .where("cart_items.userId", Number(userId))
    .andWhere("cart_items.status", "in_cart")
    .orderBy("cart_items.createdAt", "desc");
}

export async function removeFromCart(cartItemId: number) {
  await db("cart_items").where("id", cartItemId).del();
  revalidatePath("/shop");
}

export async function confirmOrder() {
  const cookieStore = await cookies();
  const userId = cookieStore.get("user_id")?.value;
  if (!userId) throw new Error("Not authorized");

  const items = await db("cart_items").where({
    userId: Number(userId),
    status: "in_cart",
  });

  if (items.length === 0) throw new Error("Cart is empty");

  const [newCart] = await db("carts")
    .insert({
      userId: Number(userId),
      status: "ordered",
      createdAt: db.fn.now(),
    })
    .returning("*");

  await db("cart_items")
    .where({ userId: Number(userId), status: "in_cart" })
    .update({
      cartId: newCart.id,
      status: "ordered",
    });

  revalidatePath("/shop");
}

export async function updateOrderStatus(orderId: number, newStatus: string) {
  const valid = ["waiting_payment", "ordered", "received"];
  if (!valid.includes(newStatus)) throw new Error("Invalid status");

  const cookieStore = await cookies();
  const userId = cookieStore.get("user_id")?.value;
  if (!userId) throw new Error("Not authorized");

  await db("cart_items")
    .where({ id: orderId, userId: Number(userId) })
    .update({ status: newStatus });

  revalidatePath("/shop");
}

export async function getOrders() {
  const cookieStore = await cookies();
  const userId = cookieStore.get("user_id")?.value;
  if (!userId) throw new Error("Not authorized");

  const carts = await db("carts")
    .select("id as cartId", "status", "createdAt")
    .where("userId", Number(userId))
    .orderBy("createdAt", "desc");

  const cartsWithItems = await Promise.all(
    carts.map(async (cart) => {
      const items = await db("cart_items")
        .join("products", "cart_items.productId", "products.id")
        .select(
          "products.name as productName",
          "products.price",
          "cart_items.quantity"
        )
        .where("cart_items.cartId", cart.cartId);

      return { ...cart, items };
    })
  );

  return cartsWithItems;
}

export async function getUserFullData() {
  const cookieStore = await cookies();
  const userId = cookieStore.get("user_id")?.value;

  if (!userId) redirect("/");

  const user = await db<User>("users").where("id", Number(userId)).first();

  const categories = await db("categories")
    .select("*")
    .where("user_id", Number(userId))
    .orderBy("id", "asc");

  const products = await db("products")
    .leftJoin("categories", "products.categoryId", "categories.id")
    .select(
      "products.id",
      "products.name",
      "products.price",
      "products.categoryId",
      "categories.name as categoryName",
      "products.createdAt"
    )
    .orderBy("products.id", "asc");

  const cart = await db("cart_items")
    .join("products", "cart_items.productId", "products.id")
    .select(
      "cart_items.id as cartItemId",
      "products.name as productName",
      "products.price",
      "cart_items.quantity",
      "cart_items.status",
      "cart_items.createdAt"
    )
    .where("cart_items.userId", Number(userId))
    .andWhere("cart_items.status", "in_cart")
    .orderBy("cart_items.createdAt", "desc");

  return { username: user?.user || "User", categories, products, cart };
}
