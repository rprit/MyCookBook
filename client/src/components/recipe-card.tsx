import { Recipe } from "@shared/schema";
import { useFavorites } from "@/context/favorites-context";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Clock } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Link, useLocation } from "wouter";
import FavoriteButton from "@/components/favorite-button";

interface RecipeCardProps {
  recipe: Recipe;
}

export default function RecipeCard({ recipe }: RecipeCardProps) {
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  
  return (
    <Link href={`/recipe/${recipe.id}`}>
      <a className="block">
        <Card className="overflow-hidden h-full flex flex-col hover:shadow-lg transition-all duration-300 cursor-pointer">
          <div className="h-48 overflow-hidden relative">
            <img 
              src={recipe.imageUrl || "https://images.unsplash.com/photo-1495521821757-a1efb6729352?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=800&h=450"} 
              alt={recipe.name} 
              className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
            />
            <div className="absolute top-2 right-2 bg-white/90 px-2 py-1 rounded text-xs font-medium text-gray-700 flex items-center">
              <Clock className="w-3 h-3 mr-1" /> {recipe.prepTime} min prep + {recipe.cookTime} min cook
            </div>
          </div>
          
          <CardContent className="p-4 flex-grow flex flex-col">
            <div className="flex justify-between items-center  mb-2">
              <h3 className="font-semibold text-lg text-gray-900 truncate">{recipe.name}</h3>
              <FavoriteButton recipeId={String(recipe.id)} showToast iconSize={28} />
            </div>
            
            <p className="text-gray-600 text-sm line-clamp-2 mb-3">
              {recipe.description}
            </p>
            
            <div className="flex flex-wrap gap-1 mb-3">
              {recipe.tags.map((tag, index) => (
                <span key={index} className="bg-gray-100 px-2 py-0.5 rounded text-xs text-gray-700">
                  {tag}
                </span>
              ))}
            </div>
            
            <div className="flex justify-between items-center mt-auto">
              <div className="flex items-center">
                <span className="text-xs text-gray-500">{recipe.tags[0]}</span>
              </div>
              
              <span className="text-primary font-medium">View Recipe →</span>
            </div>
          </CardContent>
        </Card>
      </a>
    </Link>
  );
}
