import { Recipe } from "@shared/schema";
import RecipeCard from "./recipe-card";
import { Button } from "@/components/ui/button";
import { Loader2, Search, ArrowDown } from "lucide-react";

interface RecipeGridProps {
  recipes: Recipe[];
  loading: boolean;
  hasMore: boolean;
  onLoadMore: () => void;
  onClearFilters: () => void;
}

export default function RecipeGrid({ 
  recipes,
  loading,
  hasMore,
  onLoadMore,
  onClearFilters
}: RecipeGridProps) {
  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  if (recipes.length === 0) {
    return (
      <div className="py-12 text-center">
        <div className="text-7xl mb-4 flex justify-center">
          <Search className="h-20 w-20 text-gray-300" />
        </div>
        <h3 className="text-xl font-medium text-gray-700 mb-2">No recipes found</h3>
        <p className="text-gray-500 mb-6">Try adjusting your search or filters</p>
        <Button 
          onClick={onClearFilters} 
          className="bg-primary text-white hover:bg-primary/90"
        >
          Clear All Filters
        </Button>
      </div>
    );
  }

  return (
    <div>
      {/* Add an ID so HomePage can find this grid */}
      <div id="recipe-grid" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {recipes.map((recipe) => (
          // Wrap each card in a div with .recipe-card
          <div key={recipe.id} className="recipe-card">
            <RecipeCard key={recipe.id} recipe={recipe} />
          </div>
        ))}
      </div>
      
      {hasMore && (
        <div className="mt-8 flex justify-center">
          <Button 
            variant="outline" 
            className="border-primary text-primary hover:bg-primary/5"
            onClick={onLoadMore}
          >
            Load More Recipes
            <ArrowDown className="ml-2 h-4 w-4" />
          </Button>
        </div>
      )}
    </div>
  );
}
