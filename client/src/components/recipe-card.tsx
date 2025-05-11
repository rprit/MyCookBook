import { Recipe } from "@shared/schema";
import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Heart, Clock } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface RecipeCardProps {
  recipe: Recipe;
}

export default function RecipeCard({ recipe }: RecipeCardProps) {
  const [isSaved, setIsSaved] = useState(false);
  const { toast } = useToast();
  
  const handleSaveRecipe = () => {
    setIsSaved(!isSaved);
    toast({
      title: isSaved ? "Recipe removed" : "Recipe saved",
      description: isSaved ? "Recipe removed from your favorites" : "Recipe added to your favorites",
    });
  };
  
  const handleViewRecipe = () => {
    toast({
      title: "Recipe details",
      description: `Viewing details for ${recipe.name}`,
    });
  };

  return (
    <Card className="overflow-hidden h-full flex flex-col hover:shadow-lg transition-all duration-300">
      <div className="h-48 overflow-hidden relative">
        <img 
          src={recipe.imageUrl || "https://images.unsplash.com/photo-1495521821757-a1efb6729352?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=800&h=450"} 
          alt={recipe.name} 
          className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
        />
        <div className="absolute top-2 right-2 bg-white/90 px-2 py-1 rounded text-xs font-medium text-gray-700 flex items-center">
          <Clock className="w-3 h-3 mr-1" /> {recipe.prepTime} min
        </div>
      </div>
      
      <CardContent className="p-4 flex-grow flex flex-col">
        <div className="flex justify-between items-start mb-2">
          <h3 className="font-semibold text-lg text-gray-900 truncate">{recipe.name}</h3>
          <Button 
            variant="ghost" 
            size="icon" 
            className={isSaved ? "text-primary" : "text-gray-400"}
            onClick={handleSaveRecipe}
          >
            <Heart className={`h-5 w-5 ${isSaved ? "fill-current" : ""}`} />
          </Button>
        </div>
        
        <p className="text-gray-600 text-sm line-clamp-2 mb-3">
          {recipe.description}
        </p>
        
        <div className="flex flex-wrap gap-1 mb-3">
          {recipe.tags.map((tag, index) => (
            <span key={index} className="bg-gray-100 px-2 py-0.5 rounded text-xs text-gray-700">{tag}</span>
          ))}
        </div>
        
        <div className="flex justify-between items-center mt-auto">
          <div className="flex items-center">
            <span className="text-xs text-gray-500">{recipe.tags[0]}</span>
          </div>
          
          <Button
            variant="link"
            className="text-primary font-medium p-0 h-auto"
            onClick={handleViewRecipe}
          >
            View Recipe
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
