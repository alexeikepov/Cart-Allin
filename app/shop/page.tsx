import MainComp from "@/cart/cart";
import { getUserFullData } from "@/cart/action";

export default async function ShopPage() {
  const { username, categories, products, cart } = await getUserFullData();

  return (
    <MainComp
      username={username}
      categories={categories}
      products={products}
      serverCart={cart}
    />
  );
}
