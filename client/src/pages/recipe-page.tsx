import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Recipe } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import { useParams, useLocation } from "wouter";
import { Loader2, Clock, Users, ArrowLeft, Edit, Trash2 } from "lucide-react";
import Header from "@/components/header";
import Footer from "@/components/footer";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Link } from "wouter";
import EditRecipeDialog from "@/components/edit-recipe-dialog";
import { useFavorites } from "@/context/favorites-context";
import { useToast } from "@/hooks/use-toast";
import FavoriteButton from "@/components/favorite-button";
import { Dialog, DialogContent, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";

export default function RecipePage() {
  const params = useParams();
  const id = params.id;
  const [, setLocation] = useLocation();
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const { isFavorite, toggleFavorite } = useFavorites();
  const { toast } = useToast();

  const { data: recipe, isLoading } = useQuery<Recipe>({
    queryKey: ["recipe", id],
    queryFn: async () => {
      const res = await apiRequest("GET", `/api/recipes/${id}`);
      return res.json();
    },
  });

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!recipe) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <h1 className="text-2xl font-bold text-gray-900">Recipe not found</h1>
        <p className="text-gray-600">The recipe you're looking for doesn't exist.</p>
        <Link href="/">
          <Button className="mt-4">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Recipes
          </Button>
        </Link>
      </div>
    );
  }

  const recipeId = String(recipe.id);

  const handleDelete = async () => {
    try {
      await apiRequest("DELETE", `/api/recipes/${id}`);
      toast({ title: "Recipe deleted", description: "The recipe has been deleted." });
      setLocation("/");
    } catch (err) {
      toast({ title: "Error", description: "Failed to delete recipe." });
    }
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-grow">
        <div className="container mx-auto px-4 py-8 max-w-4xl">
          <div className="flex justify-between items-center mb-6">
            <Link href="/">
              <Button variant="ghost">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Recipes
              </Button>
            </Link>
            <div className="flex gap-2">
              <Button onClick={() => setIsEditDialogOpen(true)}>
                <Edit className="w-4 h-4 mr-2" />
                Edit Recipe
              </Button>
              <Button variant="destructive" onClick={() => setIsDeleteDialogOpen(true)}>
                <Trash2 className="w-4 h-4 mr-2" />
                Delete
              </Button>
            </div>
          </div>

          <Card className="p-6 space-y-8">
            {/* Recipe Header */}
            <div className="flex items-center justify-between space-y-4">
              <div className="flex-1">
                <h1 className="text-4xl font-bold text-gray-900">{recipe.name}</h1>
                <div className="text-xs text-gray-500 mt-1 italic">
                  {recipe.updatedAt && recipe.updatedAt !== recipe.createdAt ? (
                    <div>
                      Updated on: {new Date(recipe.updatedAt).toLocaleString()}
                    </div>
                  ) : (
                    recipe.createdAt ? (
                      <div>
                        Created on: {new Date(recipe.createdAt).toLocaleString()}
                      </div>
                    ) : null
                  )}
                </div>
              </div>
              <FavoriteButton recipeId={recipeId} showToast iconSize={28} className="ml-4" />
            </div>
            <p className="text-lg text-gray-600">{recipe.description}</p>

            {/* Recipe Image */}
            <div className="aspect-video w-full overflow-hidden rounded-lg">
              <img 
                src={recipe.imageUrl || "https://images.unsplash.com/photo-1495521821757-a1efb6729352"} 
                alt={recipe.name}
                className="w-full h-full object-cover"
              />
            </div>

            {/* Recipe Info */}
            <div className="grid grid-cols-3 gap-4 p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center space-x-3">
                <Clock className="w-5 h-5 text-gray-500" />
                <div>
                  <p className="text-sm text-gray-600">Prep Time</p>
                  <p className="font-semibold">{recipe.prepTime} mins</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <Clock className="w-5 h-5 text-gray-500" />
                <div>
                  <p className="text-sm text-gray-600">Cook Time</p>
                  <p className="font-semibold">{recipe.cookTime} mins</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <Users className="w-5 h-5 text-gray-500" />
                <div>
                  <p className="text-sm text-gray-600">Servings</p>
                  <p className="font-semibold">{recipe.servings}</p>
                </div>
              </div>
            </div>

            {/* Tags */}
            <div className="flex flex-wrap gap-2">
              {recipe.tags.map((tag) => (
                <span 
                  key={tag}
                  className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm"
                >
                  {tag}
                </span>
              ))}
            </div>

            {/* Ingredients */}
            <div>
              <h2 className="text-2xl font-semibold mb-4">Ingredients</h2>
              <Card className="p-4">
                <ul className="list-disc pl-5 space-y-2">
                  {recipe.ingredients.map((ingredient, index) => (
                    <li key={index} className="text-gray-700">{ingredient}</li>
                  ))}
                </ul>
              </Card>
            </div>

            {/* Instructions */}
            <div>
              <h2 className="text-2xl font-semibold mb-4">Instructions</h2>
              <Card className="p-4">
                <ol className="space-y-4">
                  {recipe.instructions.map((instruction, index) => (
                    <li key={index} className="flex space-x-4">
                      <span className="font-bold text-primary">{index + 1}.</span>
                      <span className="text-gray-700 flex-1">{instruction}</span>
                    </li>
                  ))}
                </ol>
              </Card>
            </div>
          </Card>
        </div>
      </main>
      <Footer />
      {recipe && (
        <EditRecipeDialog
          recipe={recipe}
          open={isEditDialogOpen}
          onOpenChange={setIsEditDialogOpen}
          onSuccess={() => setIsEditDialogOpen(false)}
        />
      )}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogTitle>Delete Recipe</DialogTitle>
          <DialogDescription>
            Are you sure you want to delete this recipe? This action cannot be undone.
          </DialogDescription>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDelete}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
