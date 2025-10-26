import { Assistant } from "next/font/google";
import "../ui/main.css";
import { Toaster } from "@/components/ui/sonner";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        {children}
        <Toaster richColors position="top-right" />{" "}
      </body>
    </html>
  );
}
