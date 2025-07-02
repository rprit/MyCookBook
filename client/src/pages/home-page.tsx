import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import Header from "@/components/header";
import Footer from "@/components/footer";
import SearchAndCreate from "@/components/search-and-create";
import FilterAndSort from "@/components/filter-and-sort";
import RecipeGrid from "@/components/recipe-grid";
import CreateRecipeDialog from "@/components/create-recipe-dialog";
import { Recipe } from "@shared/schema";
import { useFavorites } from "@/context/favorites-context";
import { Heart } from "lucide-react";

export default function HomePage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [sortOption, setSortOption] = useState<'newest' | 'oldest' | 'az' | 'za' | 'popular'>('newest');
  const [visibleCount, setVisibleCount] = useState(6);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState(searchTerm);
  const { favorites } = useFavorites();
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);

  // Debounce search term
  useEffect(() => {
    const timerId = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 500);

    return () => {
      clearTimeout(timerId);
    };
  }, [searchTerm]);

  const buildQueryParams = () => {
    const params = new URLSearchParams();
    params.append('limit', visibleCount.toString());
    
    if (debouncedSearchTerm) {
      params.append('search', debouncedSearchTerm);
    }
    
    if (selectedTags.length > 0) {
      params.append('tags', selectedTags.join(','));
    }
    
    params.append('sort', sortOption);
    
    return params.toString();
  };

  const { data: recipes, isLoading, refetch } = useQuery<Recipe[]>({
    queryKey: [`/api/recipes?${buildQueryParams()}`],
  });

  const handleSearch = (value: string) => {
    setSearchTerm(value);
    setVisibleCount(6); // Reset pagination when searching
  };

  const handleTagChange = (tag: string) => {
    // If tag is already selected, remove it, otherwise add it
    setSelectedTags(prev => 
      prev.includes(tag) 
        ? prev.filter(t => t !== tag) 
        : [...prev, tag]
    );
    setVisibleCount(6); // Reset pagination when changing filters
  };

  const handleSortChange = (value: 'newest' | 'oldest' | 'az' | 'za' | 'popular') => {
    setSortOption(value);
    setVisibleCount(6); // Reset pagination when changing sort
  };

  const handleLoadMore = () => {
    setVisibleCount(prev => prev + 6);
  };

  const handleCreateRecipe = () => {
    setIsCreateDialogOpen(true);
  };

  const handleCreateSuccess = () => {
    refetch();
    setIsCreateDialogOpen(false);
  };

  const handleClearFilters = () => {
    setSearchTerm("");
    setSelectedTags([]);
    setSortOption('newest');
  };

  // Filter recipes if showFavoritesOnly is true
  const filteredRecipes = showFavoritesOnly
    ? (recipes || []).filter((r) => favorites.includes(String(r.id)))
    : recipes || [];

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="container mx-auto px-4 py-6 flex-grow">
        <SearchAndCreate onSearch={handleSearch} onCreate={handleCreateRecipe}
          >
          <button
            className={`flex items-center gap-2 px-4 py-2 rounded text-sm font-medium border transition-colors ${showFavoritesOnly ? "bg-primary text-white border-primary" : "bg-white text-primary border-primary"}`}
            onClick={() => setShowFavoritesOnly((v) => !v)}
            aria-pressed={showFavoritesOnly}
          >
            <Heart className={`h-5 w-5 ${showFavoritesOnly ? "fill-current text-white" : "fill-current text-primary"}`} />
            {showFavoritesOnly ? "All Recipes" : "Favorites"}
          </button>
        </SearchAndCreate>
        <FilterAndSort 
          selectedTags={selectedTags}
          onTagChange={handleTagChange}
          sortOption={sortOption}
          onSortChange={handleSortChange}
          onRemoveTag={(tag) => handleTagChange(tag)}
        />
        
        <RecipeGrid 
          recipes={filteredRecipes}
          loading={isLoading}
          hasMore={!showFavoritesOnly && !!recipes && recipes.length >= visibleCount}
          onLoadMore={handleLoadMore}
          onClearFilters={handleClearFilters}
        />
      </main>
      
      <Footer />
      
      <CreateRecipeDialog
        open={isCreateDialogOpen}
        onOpenChange={setIsCreateDialogOpen}
        onSuccess={handleCreateSuccess}
      />
    </div>
  );
}
