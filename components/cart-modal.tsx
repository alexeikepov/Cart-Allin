"use client";

import { useEffect, useState } from "react";
import { getCart, confirmOrder } from "@/cart/action";
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

export default function CartModal() {
  const [cart, setCart] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    (async () => {
      const res = await getCart();
      setCart(res);
    })();
  }, []);

  const total = cart.reduce((sum, i) => sum + i.price * i.quantity, 0);

  async function handleConfirm() {
    setLoading(true);
    await confirmOrder(); // создаёт carts + привязывает cart_items
    setLoading(false);
    window.location.reload();
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
                </TableRow>
              ))}
              <TableRow>
                <TableCell colSpan={3} className="font-semibold text-right">
                  Cart Total:
                </TableCell>
                <TableCell className="font-bold">${total.toFixed(2)}</TableCell>
              </TableRow>
            </TableBody>
          </Table>

          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                disabled={loading}
                className="bg-emerald-600 text-white mt-4 w-full"
              >
                ✅ Confirm Order
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Confirm your order?</AlertDialogTitle>
                <AlertDialogDescription>
                  Please make sure all items in your cart are correct. Once
                  confirmed, your order will be created and moved to “My
                  Orders”.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={handleConfirm}>
                  Yes, Confirm
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </>
      )}
    </div>
  );
}
