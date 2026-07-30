"use client";

import { useTransition } from "react";
import { Heart } from "lucide-react";
import { toast } from "sonner";
import { toggleFavorite } from "@/lib/actions/favorites";
import { cn } from "@/lib/utils";

export function FavoriteButton({
  propertyId,
  isFavorited,
}: {
  propertyId: string;
  isFavorited: boolean;
}) {
  const [isPending, startTransition] = useTransition();

  return (
    <button
      type="button"
      aria-label={isFavorited ? "הסרה מהמועדפים" : "הוספה למועדפים"}
      aria-pressed={isFavorited}
      disabled={isPending}
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        startTransition(async () => {
          const result = await toggleFavorite(propertyId);
          toast.success(result.added ? "הנכס נוסף למועדפים" : "הנכס הוסר מהמועדפים");
        });
      }}
      className="absolute end-3 top-3 flex h-8 w-8 items-center justify-center rounded-full bg-background/90 shadow-sm transition-transform hover:scale-105 disabled:opacity-60"
    >
      <Heart className={cn("h-4 w-4", isFavorited ? "fill-destructive text-destructive" : "text-muted-foreground")} />
    </button>
  );
}
