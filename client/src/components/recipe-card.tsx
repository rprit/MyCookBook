import { Recipe } from "@shared/schema";
import { useFavorites } from "@/context/favorites-context";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Clock } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Link, useLocation } from "wouter";
import FavoriteButton from "@/components/favorite-button";
import { useRef, useState, useEffect } from "react";

interface RecipeCardProps {
  recipe: Recipe;
}

export default function RecipeCard({ recipe }: RecipeCardProps) {
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const containerRef = useRef<HTMLDivElement>(null);
const [visibleTags, setVisibleTags] = useState<string[]>([]);
const [hiddenTags, setHiddenTags] = useState<string[]>([]);

useEffect(() => {
  if (!containerRef.current) return;

  const container = containerRef.current;
  const tagEls = Array.from(container.querySelectorAll(".tag-measure"));

  const updateTagVisibility = () => {
    const containerWidth = container.offsetWidth;
    let usedWidth = 0;
    const shown: string[] = [];
    const hidden: string[] = [];

    tagEls.forEach((el, i) => {
      const width = (el as HTMLElement).offsetWidth + 4; // padding
      if (usedWidth + width <= containerWidth - 30) {
        shown.push(recipe.tags[i]);
        usedWidth += width;
      } else {
        hidden.push(recipe.tags[i]);
      }
    });

    setVisibleTags(shown);
    setHiddenTags(hidden);
  };

  const resizeObserver = new ResizeObserver(updateTagVisibility);
  resizeObserver.observe(container);

  updateTagVisibility(); // initial run

  return () => resizeObserver.disconnect();
}, [recipe.tags]);

  
  return (
    <Link href={`/recipe/${recipe.id}`}>
      <a className="block">
        <Card className="h-full flex flex-col hover:shadow-lg transition-all duration-300 cursor-pointer">
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
            <div className="flex justify-between items-center mb-2 gap-x-4">
              <h3
                className="font-semibold text-lg text-gray-900 truncate min-w-0"
                title={recipe.name}
                tabIndex={0}
                onMouseOver={e => (e.currentTarget.title = recipe.name)}
              >
                {recipe.name}
              </h3>
              <FavoriteButton recipeId={String(recipe.id)} showToast iconSize={28} />
            </div>
            
            <p
              className={`text-gray-600 text-sm line-clamp-2 mb-3 ${recipe.description.length < 50 ? "pb-5" : ""}`}
              style={{ minHeight: '2.5em' }}
            >
              {recipe.description}
            </p>
                       
            <div className="flex items-center justify-between mt-auto space-x-2">
              <div
                ref={containerRef}
                className="flex items-center flex-1 min-w-0 group relative"
              >
                {/* Hidden tags for measurement */}
                <div className="invisible absolute left-0 top-0 h-0 overflow-hidden">
                  {recipe.tags.map((tag, index) => (
                    <span
                      key={index}
                      className="tag-measure inline-block px-2 py-0.5 text-xs font-medium bg-gray-100 rounded mr-1"
                    >
                      {tag}
                    </span>
                  ))}
                </div>

                {/* Visible tags */}
                <div className="flex flex-wrap justify-between items-center space-x-1 overflow-hidden">
                  {visibleTags.map((tag, index) => (
                    <span
                      key={index}
                      className="inline-block px-2 py-0.5 text-xs font-medium bg-gray-100 rounded text-gray-700 whitespace-nowrap"
                    >
                      {tag}
                    </span>
                  ))}

                  {hiddenTags.length > 0 && (
                    <div className="relative group">
                      <span className="bg-gray-100 px-2 py-0.5 rounded text-xs text-gray-700 cursor-pointer">
                        ...
                      </span>
                      <div className="absolute left-0 top-full mt-1 z-30 hidden group-hover:flex flex-wrap bg-white border border-gray-300 rounded shadow-1g px-2 py-1 text-xs text-gray-700 max-w-xs">
                        {hiddenTags.map((tag, index) => (
                          <span key={index} className="mr-1 mb-1">
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* View Recipe */}
              <span className="text-primary font-medium text-sm whitespace-nowrap ml-2">
                View Recipe →
              </span>
            </div>
          </CardContent>
        </Card>
      </a>
    </Link>
  );
}
