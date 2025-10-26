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
    httpOnly: true,
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

export async function updateProductCategory(
  productId: number,
  newCategoryId: number
) {
  if (!productId || !newCategoryId)
    throw new Error("Invalid product/category ID");

  await db("products")
    .where("id", productId)
    .update({ categoryId: newCategoryId });

  revalidatePath("/shop");
}

export async function updateProduct(data: any) {
  const id = Number(data.id);
  const name = String(data.name ?? "").trim();
  const price = Number(data.price);
  const categoryId = data.categoryId ? Number(data.categoryId) : null;

  if (!id) throw new Error("Missing product ID");
  if (!name) throw new Error("Product name required");
  if (isNaN(price) || price <= 0) throw new Error("Valid price required");

  await db("products").where({ id }).update({
    name,
    price,
    categoryId,
    updatedAt: db.fn.now(),
  });

  return { id, name, price, categoryId };
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
  const parsedUserId = Number(userId);

  await db("carts")
    .where({ userId: parsedUserId, status: "active" })
    .first()
    .update({});

  let cart = await db("carts")
    .where({ userId: parsedUserId, status: "active" })
    .first();

  if (!cart) {
    const [newCart] = await db("carts")
      .insert({
        userId: parsedUserId,
        status: "active",
        createdAt: db.fn.now(),
      })
      .returning("*");
    cart = newCart;
  }

  const existing = await db("cart_items")
    .where({ cartId: cart.id, productId })
    .first();

  if (existing) {
    await db("cart_items")
      .where({ id: existing.id })
      .update({ quantity: existing.quantity + 1 });
  } else {
    await db("cart_items").insert({
      cartId: cart.id,
      productId,
      quantity: 1,
      createdAt: db.fn.now(),
    });
  }

  revalidatePath("/shop");
}

export async function getCart() {
  const cookieStore = await cookies();
  const userId = cookieStore.get("user_id")?.value;
  if (!userId) throw new Error("Not authorized");
  const parsedUserId = Number(userId);

  const cart = await db("carts")
    .where({ userId: parsedUserId, status: "active" })
    .first();

  if (!cart) return [];

  return db("cart_items")
    .join("products", "cart_items.productId", "products.id")
    .select(
      "cart_items.id as cartItemId",
      "products.name as productName",
      "products.price",
      "cart_items.quantity",
      "cart_items.createdAt"
    )
    .where("cart_items.cartId", cart.id)
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

  const parsedUserId = Number(userId);

  const activeCart = await db("carts")
    .where({ userId: parsedUserId, status: "active" })
    .first();

  if (!activeCart) throw new Error("No active cart found");

  const items = await db("cart_items")
    .where({ cartId: activeCart.id })
    .orderBy("id", "asc");

  if (!items || items.length === 0) {
    throw new Error("Cart is empty");
  }

  await db("carts")
    .where({ id: activeCart.id })
    .update({ status: "waiting_payment" });

  await db("carts").insert({
    userId: parsedUserId,
    status: "active",
    createdAt: db.fn.now(),
  });

  console.log(
    `✅ Cart #${activeCart.id} confirmed for user ${parsedUserId}. New empty cart created.`
  );

  revalidatePath("/shop");
}

export async function updateCartStatus(cartId: number, newStatus: string) {
  const valid = [
    "active",
    "waiting_payment",
    "paid",
    "cancelled",
    "shipped",
    "completed",
  ];
  if (!valid.includes(newStatus)) throw new Error("Invalid status");

  const cookieStore = await cookies();
  const userId = cookieStore.get("user_id")?.value;
  if (!userId) throw new Error("Not authorized");

  await db("carts")
    .where({ id: cartId, userId: Number(userId) })
    .update({ status: newStatus });

  revalidatePath("/shop");
}

export async function getOrders() {
  const cookieStore = await cookies();
  const userId = cookieStore.get("user_id")?.value;
  if (!userId) throw new Error("Not authorized");
  const parsedUserId = Number(userId);

  const carts = await db("carts")
    .select("id as cartId", "status", "createdAt")
    .where("userId", parsedUserId)
    .andWhereNot("status", "active")
    .orderBy("createdAt", "desc");

  const cartsWithItems = await Promise.all(
    carts.map(async (cart: any) => {
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

  const activeCart = await db("carts")
    .where({ userId: Number(userId), status: "active" })
    .first();

  const cartItems = activeCart
    ? await db("cart_items")
        .join("products", "cart_items.productId", "products.id")
        .select(
          "cart_items.id as cartItemId",
          "products.name as productName",
          "products.price",
          "cart_items.quantity",
          "cart_items.createdAt"
        )
        .where("cart_items.cartId", activeCart.id)
        .orderBy("cart_items.createdAt", "desc")
    : [];

  return {
    username: user?.user || "User",
    categories,
    products,
    cart: cartItems,
  };
}
