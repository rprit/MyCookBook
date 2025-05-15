import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Recipe } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import { useParams, useLocation } from "wouter";
import { Loader2, Clock, Users, ArrowLeft, Edit } from "lucide-react";
import Header from "@/components/header";
import Footer from "@/components/footer";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Link } from "wouter";
import EditRecipeDialog from "@/components/edit-recipe-dialog";

export default function RecipePage() {
  const params = useParams();
  const id = params.id;
  const [, setLocation] = useLocation();
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

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
            <Button onClick={() => setIsEditDialogOpen(true)}>
              <Edit className="w-4 h-4 mr-2" />
              Edit Recipe
            </Button>
          </div>

          <Card className="p-6 space-y-8">
            {/* Recipe Header */}
            <div className="space-y-4">
              <h1 className="text-4xl font-bold text-gray-900">{recipe.name}</h1>
              <p className="text-lg text-gray-600">{recipe.description}</p>
            </div>

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
    </div>
  );
}
