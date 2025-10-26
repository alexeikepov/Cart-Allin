import { db } from "@/config/db";
import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";

export async function addToCart(productId: number) {
  const userId = await getUser();

  let cart = await db("carts").where({ userId, status: "active" }).first();

  if (!cart) {
    const [newCart] = await db("carts")
      .insert({
        userId,
        status: "active",
      })
      .returning("id");
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
    });
  }

  revalidatePath("/shop");
}

async function getUser() {
  const cookieStore = await cookies();
  const userId = cookieStore.get("user_id")?.value;
  if (!userId) throw new Error("Not authorized");
  return Number(userId);
}
