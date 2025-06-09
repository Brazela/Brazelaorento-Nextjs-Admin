// app/components/RemoveRadixPortal.tsx or src/components/RemoveRadixPortal.tsx

"use client";
import { useEffect } from "react";
import Link from "next/link";

export default function RemoveRadixPortal({
  children,
}: {
  children: React.ReactNode;
}) {
  useEffect(() => {
    const portal = document.getElementById("nextjs-portal-root");
    if (portal) {
      portal.remove();
      console.log("✅ Radix portal removed.");
    }
  }, []);

  return <>{children}</>;
}
