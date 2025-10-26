"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import CartModal from "@/components/cart-modal";

export default function HeaderSection({
  username,
  cartCount,
  onConfirmOrder,
}: {
  username: string;
  cartCount: number;
  onConfirmOrder: () => Promise<void>;
}) {
  return (
    <div className="flex items-center justify-between mb-6">
      <h1 className="text-3xl font-bold">
        Welcome, <span className="text-blue-600">{username}</span>
      </h1>

      <div className="flex gap-3">
        <Link href="/orders">
          <Button variant="outline">My Orders</Button>
        </Link>

        <Dialog>
          <DialogTrigger asChild>
            <Button variant="secondary">View Cart ({cartCount})</Button>
          </DialogTrigger>
          <DialogContent className="max-w-3xl">
            <DialogHeader>
              <DialogTitle>My Cart</DialogTitle>
            </DialogHeader>
            <CartModal />
          </DialogContent>
        </Dialog>

        <Button
          onClick={onConfirmOrder}
          disabled={cartCount === 0}
          className="bg-emerald-600 text-white"
        >
          Confirm Order
        </Button>
      </div>
    </div>
  );
}
