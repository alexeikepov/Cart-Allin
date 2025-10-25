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
import { getOrders, updateOrderStatus } from "@/cart/action";

export default function OrdersTabs() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loadingId, setLoadingId] = useState<number | null>(null);

  useEffect(() => {
    (async () => {
      const res = await getOrders();
      setOrders(res);
    })();
  }, []);

  async function handleStatusChange(cartId: number, newStatus: string) {
    setLoadingId(cartId);
    await updateOrderStatus(cartId, newStatus);
    setOrders((prev) =>
      prev.map((cart) =>
        cart.cartId === cartId ? { ...cart, status: newStatus } : cart
      )
    );
    setLoadingId(null);
  }

  const tabs = [
    { key: "waiting_payment", label: "💳 Waiting Payment" },
    { key: "ordered", label: "📦 Ordered" },
    { key: "received", label: "✅ Received" },
  ];

  return (
    <Tabs defaultValue="ordered" className="mt-4">
      <TabsList className="grid grid-cols-3 mb-4">
        {tabs.map((t) => (
          <TabsTrigger key={t.key} value={t.key}>
            {t.label}
          </TabsTrigger>
        ))}
      </TabsList>

      {tabs.map((t) => (
        <TabsContent key={t.key} value={t.key}>
          {orders.filter((o) => o.status === t.key).length === 0 ? (
            <p className="text-gray-500 italic">No orders here</p>
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
                          Cart #{cart.cartId}
                        </h3>
                        <p className="text-sm text-gray-500">
                          {new Date(cart.createdAt).toLocaleString()}
                        </p>
                      </div>
                      <div>
                        {cart.status === "waiting_payment" && (
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button
                                size="sm"
                                disabled={loadingId === cart.cartId}
                              >
                                Confirm
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>
                                  Confirm purchase?
                                </AlertDialogTitle>
                                <AlertDialogDescription>
                                  Are you sure you want to confirm this order?
                                  After confirmation it will move to
                                  <b> "Ordered"</b> status.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() =>
                                    handleStatusChange(cart.cartId, "ordered")
                                  }
                                >
                                  Yes, Confirm
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        )}

                        {cart.status === "ordered" && (
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button
                                variant="secondary"
                                size="sm"
                                disabled={loadingId === cart.cartId}
                              >
                                Received
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>
                                  Mark as received?
                                </AlertDialogTitle>
                                <AlertDialogDescription>
                                  Are you sure this order has been received?
                                  This action will mark it as
                                  <b> "Received"</b>.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() =>
                                    handleStatusChange(cart.cartId, "received")
                                  }
                                >
                                  Yes, Received
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
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
                            Cart Total:
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
