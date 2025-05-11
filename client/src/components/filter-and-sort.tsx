import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { X } from "lucide-react";

interface FilterAndSortProps {
  selectedTags: string[];
  onTagChange: (tag: string) => void;
  onRemoveTag: (tag: string) => void;
  sortOption: 'newest' | 'oldest' | 'az' | 'za' | 'popular';
  onSortChange: (option: 'newest' | 'oldest' | 'az' | 'za' | 'popular') => void;
}

// List of available tags for recipes
const availableTags = [
  "Breakfast",
  "Lunch",
  "Dinner",
  "Dessert",
  "Vegetarian",
  "Vegan",
  "Quick & Easy",
  "Italian",
  "Healthy",
  "Baking",
  "High-Protein",
  "Kid-Friendly"
];

export default function FilterAndSort({ 
  selectedTags, 
  onTagChange, 
  onRemoveTag,
  sortOption,
  onSortChange
}: FilterAndSortProps) {
  return (
    <Card className="mb-6">
      <CardContent className="p-4">
        <div className="flex flex-col md:flex-row justify-between gap-4">
          <div className="flex flex-col md:flex-row gap-4 md:items-center">
            <Label className="text-base font-medium">Filter by:</Label>
            
            <div className="relative w-full md:w-auto">
              <Select onValueChange={onTagChange}>
                <SelectTrigger className="w-full md:w-[200px]">
                  <SelectValue placeholder="All Categories" />
                </SelectTrigger>
                <SelectContent>
                  {availableTags.map((tag) => (
                    <SelectItem key={tag} value={tag}>
                      {tag}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            {selectedTags.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2 md:mt-0">
                {selectedTags.map((tag) => (
                  <Badge key={tag} variant="secondary" className="flex items-center gap-1">
                    {tag}
                    <button
                      className="ml-1 hover:text-gray-700 focus:outline-none"
                      onClick={() => onRemoveTag(tag)}
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            )}
          </div>
          
          <div className="flex items-center gap-2">
            <Label className="text-base font-medium">Sort by:</Label>
            <Select value={sortOption} onValueChange={(value) => onSortChange(value as any)}>
              <SelectTrigger className="w-full md:w-[200px]">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="newest">Newest First</SelectItem>
                <SelectItem value="oldest">Oldest First</SelectItem>
                <SelectItem value="az">Name (A-Z)</SelectItem>
                <SelectItem value="za">Name (Z-A)</SelectItem>
                <SelectItem value="popular">Most Popular</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
