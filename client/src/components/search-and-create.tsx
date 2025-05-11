import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Plus } from "lucide-react";
import { useEffect, useState } from "react";

interface SearchAndCreateProps {
  onSearch: (value: string) => void;
  onCreate: () => void;
}

export default function SearchAndCreate({ onSearch, onCreate }: SearchAndCreateProps) {
  const [searchInput, setSearchInput] = useState("");

  const handleSearchInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchInput(e.target.value);
  };

  useEffect(() => {
    const timerId = setTimeout(() => {
      onSearch(searchInput);
    }, 300);

    return () => clearTimeout(timerId);
  }, [searchInput, onSearch]);

  return (
    <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
      <div className="relative w-full md:w-2/3">
        <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
          <Search className="h-4 w-4 text-gray-400" />
        </div>
        <Input 
          type="text" 
          className="w-full pl-10 border-gray-300 focus:ring-primary focus:border-primary"
          placeholder="Search recipes by name, ingredients or tags..."
          value={searchInput}
          onChange={handleSearchInput}
        />
      </div>
      <Button 
        className="bg-primary text-white hover:bg-primary/90 w-full md:w-auto"
        onClick={onCreate}
      >
        <Plus className="h-4 w-4 mr-2" />
        Create Recipe
      </Button>
    </div>
  );
}
