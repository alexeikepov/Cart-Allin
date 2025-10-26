"use client";

import { useEffect, useState } from "react";
import { getCart, confirmOrder, removeFromCart } from "@/cart/action";
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
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";

export default function CartModal() {
  const [cart, setCart] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [confirming, setConfirming] = useState(false);
  const [removing, setRemoving] = useState<number | null>(null);

  useEffect(() => {
    loadCart();
  }, []);

  async function loadCart() {
    try {
      const res = await getCart();
      setCart(res);
    } catch (err) {
      console.error("Error loading cart:", err);
      toast.error("❌ Failed to load cart");
    } finally {
      setLoading(false);
    }
  }

  const total = cart.reduce((sum, i) => sum + i.price * i.quantity, 0);

  async function handleRemove(cartItemId: number) {
    try {
      setRemoving(cartItemId);
      await removeFromCart(cartItemId);
      toast.success("🗑️ Item removed from cart");
      await loadCart();
    } catch (err) {
      console.error("Error removing item:", err);
      toast.error("❌ Failed to remove item");
    } finally {
      setRemoving(null);
    }
  }

  async function handleConfirm() {
    try {
      setConfirming(true);
      await confirmOrder();
      toast.success("✅ Order confirmed and moved to 'My Orders'");
      setTimeout(() => window.location.reload(), 1000);
    } catch (err) {
      console.error("Error confirming order:", err);
      toast.error("❌ Failed to confirm order");
    } finally {
      setConfirming(false);
    }
  }

  if (loading) {
    return <p className="text-gray-500 italic">Loading your cart...</p>;
  }

  return (
    <div className="space-y-4">
      {cart.length === 0 ? (
        <p className="text-gray-500 italic">Your cart is empty.</p>
      ) : (
        <>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Product</TableHead>
                <TableHead>Price</TableHead>
                <TableHead>Qty</TableHead>
                <TableHead>Total</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {cart.map((item) => (
                <TableRow key={item.cartItemId}>
                  <TableCell>{item.productName}</TableCell>
                  <TableCell>${item.price}</TableCell>
                  <TableCell>{item.quantity}</TableCell>
                  <TableCell>
                    ${(item.price * item.quantity).toFixed(2)}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="destructive"
                      size="sm"
                      disabled={removing === item.cartItemId}
                      onClick={() => handleRemove(item.cartItemId)}
                    >
                      {removing === item.cartItemId
                        ? "Removing..."
                        : "🗑️ Remove"}
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
              <TableRow>
                <TableCell colSpan={4} className="font-semibold text-right">
                  Cart Total:
                </TableCell>
                <TableCell className="font-bold">${total.toFixed(2)}</TableCell>
              </TableRow>
            </TableBody>
          </Table>

          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                disabled={confirming}
                className="bg-emerald-600 text-white mt-4 w-full"
              >
                {confirming ? "Processing..." : "✅ Confirm Order"}
              </Button>
            </AlertDialogTrigger>

            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Confirm your order?</AlertDialogTitle>
                <AlertDialogDescription>
                  Please verify all items before confirming. Once approved, your
                  order will move to <b>“My Orders”</b>.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel disabled={confirming}>
                  Cancel
                </AlertDialogCancel>
                <AlertDialogAction
                  disabled={confirming}
                  onClick={handleConfirm}
                >
                  {confirming ? "Processing..." : "Yes, Confirm"}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </>
      )}
    </div>
  );
}
