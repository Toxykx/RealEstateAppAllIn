"use client";

import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";

/**
 * Fires a success toast once when the page loads with ?created=1 (set by a
 * server action's redirect after creating a record), then strips the param
 * so refreshing the page doesn't re-fire it.
 */
export function CreatedToast({ message }: { message: string }) {
  const searchParams = useSearchParams();
  const router = useRouter();

  useEffect(() => {
    if (searchParams.get("created") === "1") {
      toast.success(message);
      const url = new URL(window.location.href);
      url.searchParams.delete("created");
      router.replace(url.pathname + url.search, { scroll: false });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return null;
}
