import { useState, useEffect, useMemo } from "react";
import { useInfiniteQuery } from "@tanstack/react-query";
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
  const [sortOption, setSortOption] = useState<
    "newest" | "oldest" | "az" | "za" | "popular"
  >("newest");
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState(searchTerm);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const { favorites } = useFavorites();
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);

  const PAGE_SIZE = 6;

  // Debounce search term
  useEffect(() => {
    const timerId = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 500);
    return () => clearTimeout(timerId);
  }, [searchTerm]);

  // Query with infinite scrolling
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    refetch,
    isLoading,
  } = useInfiniteQuery<Recipe[], Error>({
    queryKey: ["recipes", debouncedSearchTerm, selectedTags, sortOption],
    queryFn: async ({ pageParam = 0 }) => {
      const params = new URLSearchParams();
      params.append("limit", PAGE_SIZE.toString());
      params.append("offset", (pageParam as number).toString());

      if (debouncedSearchTerm) params.append("search", debouncedSearchTerm);
      if (selectedTags.length > 0)
        params.append("tags", selectedTags.join(","));
      params.append("sort", sortOption);

      const res = await fetch(`/api/recipes?${params}`);
      if (!res.ok) throw new Error("Failed to fetch recipes");
      return res.json();
    },
    getNextPageParam: (lastPage, allPages) =>
      lastPage.length === PAGE_SIZE
        ? allPages.length * PAGE_SIZE
        : undefined,
    initialPageParam: 0,
  });

  // Memoize recipes so they don't get recreated each render
  const recipes: Recipe[] = useMemo(
    () => data?.pages.flat() ?? [],
    [data]
  );

  const handleSearch = (value: string) => setSearchTerm(value);

  const handleTagChange = (tag: string) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  const handleSortChange = (
    value: "newest" | "oldest" | "az" | "za" | "popular"
  ) => setSortOption(value);

  const handleCreateRecipe = () => setIsCreateDialogOpen(true);

  const handleCreateSuccess = () => {
    refetch();
    setIsCreateDialogOpen(false);
  };

  const handleClearFilters = () => {
    setSearchTerm("");
    setSelectedTags([]);
    setSortOption("newest");
  };

  // Filter recipes if showFavoritesOnly is true
  const filteredRecipes = showFavoritesOnly
    ? recipes.filter((r) => favorites.includes(String(r.id)))
    : recipes;

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="container mx-auto px-4 py-6 flex-grow">
        <SearchAndCreate onSearch={handleSearch} onCreate={handleCreateRecipe}>
          <button
            className={`flex items-center gap-2 px-4 py-2 rounded text-sm font-medium border transition-colors ${
              showFavoritesOnly
                ? "bg-primary text-white border-primary"
                : "bg-white text-primary border-primary"
            }`}
            onClick={() => setShowFavoritesOnly((v) => !v)}
            aria-pressed={showFavoritesOnly}
          >
            <Heart
              className={`h-5 w-5 ${
                showFavoritesOnly
                  ? "fill-current text-white"
                  : "fill-current text-primary"
              }`}
            />
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
          loading={isLoading || isFetchingNextPage}
          hasMore={!showFavoritesOnly && hasNextPage}
          onLoadMore={() => {
            const prevCount = recipes.length;
            fetchNextPage().then(() => {
              requestAnimationFrame(() => {
                const grid = document.getElementById("recipe-grid");
                if (!grid) return;
                const cards = grid.querySelectorAll(".recipe-card");
                const newCard = cards[prevCount]; // first newly added
                newCard?.scrollIntoView({ behavior: "smooth", block: "start" });
              });
            });
          }}
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