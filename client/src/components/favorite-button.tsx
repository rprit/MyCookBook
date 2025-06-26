import { Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useFavorites } from "@/context/favorites-context";
import { useToast } from "@/hooks/use-toast";
import React from "react";

interface FavoriteButtonProps {
  recipeId: string;
  iconSize?: number;
  className?: string;
  showToast?: boolean;
}

export default function FavoriteButton({
  recipeId,
  iconSize = 28,
  className = "",
  showToast = false,
}: FavoriteButtonProps) {
  const { isFavorite, toggleFavorite } = useFavorites();
  const { toast } = useToast();

  const handleToggleFavorite = (e: React.MouseEvent) => {
    e.preventDefault();
    const wasFavorite = isFavorite(recipeId);
    toggleFavorite(recipeId);
    if (showToast) {
      toast({
        title: wasFavorite ? "Recipe removed" : "Recipe saved",
        description: wasFavorite
          ? "Recipe removed from your favorites"
          : "Recipe added to your favorites",
      });
    }
  };

  return (
    <Button
      variant="ghost"
      size="icon"
      className={`${isFavorite(recipeId) ? "text-primary" : "text-gray-400"} ${className}`}
      onClick={handleToggleFavorite}
      aria-label={isFavorite(recipeId) ? "Remove from favorites" : "Add to favorites"}
    >
      <Heart className={`h-[${iconSize}px] w-[${iconSize}px] ${isFavorite(recipeId) ? "fill-current" : ""}`} />
    </Button>
  );
}
