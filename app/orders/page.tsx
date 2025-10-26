import Link from "next/link";
import { Button } from "@/components/ui/button";
import OrdersTabs from "@/components/orders-tab";

export default function OrdersPage() {
  return (
    <main className="max-w-5xl mx-auto p-8 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">📦 My Orders</h1>
        <Link href="/shop">
          <Button variant="secondary">⬅️ Back to Shop</Button>
        </Link>
      </div>

      <OrdersTabs />
    </main>
  );
}
