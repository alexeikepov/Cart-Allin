"use client";

import { useEffect, useState } from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { getOrders, updateCartStatus, addToCart } from "@/cart/action";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

export default function OrdersTabs() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loadingId, setLoadingId] = useState<number | null>(null);
  const router = useRouter();

  useEffect(() => {
    (async () => {
      try {
        const res = await getOrders();
        setOrders(res);
      } catch (err) {
        console.error("Error loading orders:", err);
        toast.error("❌ Failed to load orders");
      }
    })();
  }, []);

  async function handleStatusChange(cartId: number, newStatus: string) {
    try {
      setLoadingId(cartId);
      await updateCartStatus(cartId, newStatus);
      setOrders((prev) =>
        prev.map((cart) =>
          cart.cartId === cartId ? { ...cart, status: newStatus } : cart
        )
      );
      toast.success(`✅ Order #${cartId} → ${newStatus.toUpperCase()}`);
    } catch (err) {
      console.error("Error updating status:", err);
      toast.error("❌ Could not update order status");
    } finally {
      setLoadingId(null);
    }
  }

  async function handleRepeatOrder(items: any[]) {
    try {
      for (const item of items) {
        await addToCart(item.productId);
      }
      toast.info("🛒 All items added back to your cart!");
      router.push("/shop");
    } catch (err) {
      console.error("Error repeating order:", err);
      toast.error("❌ Failed to repeat order");
    }
  }

  const tabs = [
    { key: "waiting_payment", label: "💳 Waiting Payment" },
    { key: "paid", label: "💰 Paid" },
    { key: "shipped", label: "📦 Shipped" },
    { key: "completed", label: "✅ Completed" },
    { key: "cancelled", label: "❌ Cancelled" },
  ];

  return (
    <Tabs defaultValue="waiting_payment" className="mt-6">
      <TabsList className="grid grid-cols-5 mb-4">
        {tabs.map((t) => (
          <TabsTrigger key={t.key} value={t.key}>
            {t.label}
          </TabsTrigger>
        ))}
      </TabsList>

      {tabs.map((t) => (
        <TabsContent key={t.key} value={t.key}>
          {orders.filter((o) => o.status === t.key).length === 0 ? (
            <p className="text-gray-500 italic">No orders in this tab.</p>
          ) : (
            orders
              .filter((o) => o.status === t.key)
              .map((cart) => {
                const total = cart.items.reduce(
                  (sum: number, item: any) => sum + item.price * item.quantity,
                  0
                );

                return (
                  <div
                    key={cart.cartId}
                    className="border rounded-lg mb-6 p-4 bg-muted/30"
                  >
                    <div className="flex justify-between items-center mb-3">
                      <div>
                        <h3 className="font-semibold text-lg">
                          Order #{cart.cartId}
                        </h3>
                        <p className="text-sm text-gray-500">
                          {new Date(cart.createdAt).toLocaleString()}
                        </p>
                      </div>

                      <div className="flex gap-2">
                        {cart.status === "waiting_payment" && (
                          <>
                            <Button
                              size="sm"
                              variant="secondary"
                              disabled={loadingId === cart.cartId}
                              onClick={() =>
                                handleStatusChange(cart.cartId, "paid")
                              }
                            >
                              💰 Mark Paid
                            </Button>

                            <Button
                              size="sm"
                              variant="destructive"
                              disabled={loadingId === cart.cartId}
                              onClick={() =>
                                handleStatusChange(cart.cartId, "cancelled")
                              }
                            >
                              ❌ Cancel
                            </Button>
                          </>
                        )}

                        {cart.status === "paid" && (
                          <Button
                            size="sm"
                            variant="secondary"
                            disabled={loadingId === cart.cartId}
                            onClick={() =>
                              handleStatusChange(cart.cartId, "shipped")
                            }
                          >
                            📦 Mark Shipped
                          </Button>
                        )}

                        {cart.status === "shipped" && (
                          <Button
                            size="sm"
                            className="bg-green-600 text-white"
                            disabled={loadingId === cart.cartId}
                            onClick={() =>
                              handleStatusChange(cart.cartId, "completed")
                            }
                          >
                            ✅ Complete
                          </Button>
                        )}

                        {cart.status === "completed" && (
                          <Button
                            size="sm"
                            onClick={() => handleRepeatOrder(cart.items)}
                          >
                            🔁 Repeat Order
                          </Button>
                        )}
                      </div>
                    </div>

                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Product</TableHead>
                          <TableHead>Price</TableHead>
                          <TableHead>Qty</TableHead>
                          <TableHead>Total</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {cart.items.map((item: any, i: number) => (
                          <TableRow key={i}>
                            <TableCell>{item.productName}</TableCell>
                            <TableCell>${item.price}</TableCell>
                            <TableCell>{item.quantity}</TableCell>
                            <TableCell>
                              ${(item.price * item.quantity).toFixed(2)}
                            </TableCell>
                          </TableRow>
                        ))}
                        <TableRow>
                          <TableCell
                            colSpan={3}
                            className="font-semibold text-right"
                          >
                            Order Total:
                          </TableCell>
                          <TableCell className="font-bold">
                            ${total.toFixed(2)}
                          </TableCell>
                        </TableRow>
                      </TableBody>
                    </Table>
                  </div>
                );
              })
          )}
        </TabsContent>
      ))}
    </Tabs>
  );
}
