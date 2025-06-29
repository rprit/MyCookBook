import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Recipe, UpdateRecipe } from "@shared/schema";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { X, Loader2, Plus, GripVertical } from "lucide-react";
import { DragDropContext, Droppable, Draggable, DropResult } from "@hello-pangea/dnd";

// Available tags for recipes
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

// Extended schema with validation
const recipeFormSchema = z.object({
  name: z.string().min(3, "Name must be at least 3 characters"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  imageUrl: z.string().url("Please enter a valid URL").optional().or(z.literal("")),
  prepTime: z.coerce.number().min(0, "Prep time must be at least 1 minute"),
  cookTime: z.coerce.number().min(1, "Cook time must be at least 1 minute"),
  servings: z.coerce.number().min(1, "Servings must be at least 1"),
  ingredients: z.array(z.string()).min(1, "Add at least one ingredient"),
  instructions: z.array(z.string()).min(1, "Add at least one instruction step"),
  tags: z.array(z.string()).min(1, "Select at least one tag"),
});

type RecipeFormValues = z.infer<typeof recipeFormSchema>;

interface EditRecipeDialogProps {
  recipe: Recipe;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export default function EditRecipeDialog({
  recipe,
  open,
  onOpenChange,
  onSuccess
}: EditRecipeDialogProps) {
  const { toast } = useToast();
  const [ingredientInput, setIngredientInput] = useState("");
  const [instructionInput, setInstructionInput] = useState("");
  const [editingIngredientIndex, setEditingIngredientIndex] = useState<number | null>(null);
  const [editingInstructionIndex, setEditingInstructionIndex] = useState<number | null>(null);
  const queryClient = useQueryClient();

  const form = useForm<RecipeFormValues>({
    resolver: zodResolver(recipeFormSchema),
    defaultValues: {
      name: recipe.name,
      description: recipe.description,
      imageUrl: recipe.imageUrl || "",
      prepTime: recipe.prepTime,
      cookTime: recipe.cookTime,
      servings: recipe.servings,
      ingredients: recipe.ingredients,
      instructions: recipe.instructions,
      tags: recipe.tags,
    },
  });
  const updateRecipeMutation = useMutation({    mutationFn: async (recipeData: UpdateRecipe) => {
      const res = await apiRequest("PUT", `/api/recipes/${recipe.id}`, recipeData);
      return await res.json() as Recipe;
    },
    onSuccess: () => {
      toast({
        title: "Recipe updated!",
        description: "Your recipe has been successfully updated.",
      });
      // Small delay to ensure toast is visible before reload
      setTimeout(() => {
        window.location.reload();
      }, 1000);
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to update recipe",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: RecipeFormValues) => {
    // Transform the form data to match the UpdateRecipe type
    const recipeData: UpdateRecipe = {
      name: data.name,
      description: data.description,
      imageUrl: data.imageUrl || undefined,
      prepTime: data.prepTime,
      cookTime: data.cookTime,
      servings: data.servings,
      ingredients: data.ingredients,
      instructions: data.instructions,
      tags: data.tags,
    };
    
    updateRecipeMutation.mutate(recipeData);
  };

  const addIngredient = () => {
    if (ingredientInput.trim()) {
      const currentIngredients = form.getValues().ingredients || [];
      form.setValue("ingredients", [...currentIngredients, ingredientInput.trim()]);
      setIngredientInput("");
    }
  };

  const removeIngredient = (index: number) => {
    const currentIngredients = form.getValues().ingredients;
    form.setValue("ingredients", currentIngredients.filter((_, i) => i !== index));
  };

  const addInstruction = () => {
    if (instructionInput.trim()) {
      const currentInstructions = form.getValues().instructions || [];
      form.setValue("instructions", [...currentInstructions, instructionInput.trim()]);
      setInstructionInput("");
    }
  };

  const removeInstruction = (index: number) => {
    const currentInstructions = form.getValues().instructions;
    form.setValue("instructions", currentInstructions.filter((_, i) => i !== index));
  };

  const toggleTag = (tag: string) => {
    const currentTags = form.getValues().tags;
    if (currentTags.includes(tag)) {
      form.setValue("tags", currentTags.filter(t => t !== tag));
    } else {
      form.setValue("tags", [...currentTags, tag]);
    }
  };

  // Restrict drag transform to vertical movement only (for react-beautiful-dnd style transform string)
  function restrictToVerticalOnly(transform: string | undefined): string | undefined {
    if (!transform) return undefined;
    const match = transform.match(/translate\(([-\d.]+)px,\s*([-\d.]+)px\)/);
    if (!match) return transform;
    const y = match[2];
    return `translate(0px, ${y}px)`;
  }

  // Handler for drag end for ingredients
  const onDragEndIngredients = (result: DropResult) => {
    if (!result.destination) return;
    const items = Array.from(form.getValues().ingredients);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);
    form.setValue("ingredients", items);
    if (editingIngredientIndex !== null) {
      if (result.source.index === editingIngredientIndex) {
        setEditingIngredientIndex(result.destination.index);
      } else if (
        result.source.index < editingIngredientIndex &&
        result.destination.index >= editingIngredientIndex
      ) {
        setEditingIngredientIndex(editingIngredientIndex - 1);
      } else if (
        result.source.index > editingIngredientIndex &&
        result.destination.index <= editingIngredientIndex
      ) {
        setEditingIngredientIndex(editingIngredientIndex + 1);
      }
    }
  };
  // Handler for drag end for instructions
  const onDragEndInstructions = (result: DropResult) => {
    if (!result.destination) return;
    const items = Array.from(form.getValues().instructions);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);
    form.setValue("instructions", items);
    if (editingInstructionIndex !== null) {
      if (result.source.index === editingInstructionIndex) {
        setEditingInstructionIndex(result.destination.index);
      } else if (
        result.source.index < editingInstructionIndex &&
        result.destination.index >= editingInstructionIndex
      ) {
        setEditingInstructionIndex(editingInstructionIndex - 1);
      } else if (
        result.source.index > editingInstructionIndex &&
        result.destination.index <= editingInstructionIndex
      ) {
        setEditingInstructionIndex(editingInstructionIndex + 1);
      }
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl">Edit Recipe</DialogTitle>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Basic Information */}
            <div className="space-y-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Recipe Name</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g. Classic Pancakes" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Describe your recipe in a few sentences..." 
                        className="resize-none min-h-[100px]"
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="imageUrl"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Image URL (Optional)</FormLabel>
                    <FormControl>
                      <Input placeholder="https://example.com/image.jpg" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
                
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="prepTime"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Preparation Time (minutes)</FormLabel>
                      <FormControl>
                        <Input type="number" min="0" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="cookTime"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Cooking Time (minutes)</FormLabel>
                      <FormControl>
                        <Input type="number" min="1" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="servings"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Servings</FormLabel>
                      <FormControl>
                        <Input type="number" min="1" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>
            
            {/* Ingredients */}
            <div className="space-y-2">
              <FormField
                control={form.control}
                name="ingredients"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Ingredients</FormLabel>
                    <div className="flex items-center space-x-2">
                      <Input 
                        placeholder="e.g. 2 cups all-purpose flour"
                        value={ingredientInput}
                        onChange={(e) => setIngredientInput(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            e.preventDefault();
                            addIngredient();
                          }
                        }}
                      />
                      <Button type="button" onClick={addIngredient} size="sm">
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                      <DragDropContext onDragEnd={onDragEndIngredients}>
                        <Droppable droppableId="ingredients-droppable" direction="vertical">
                          {(provided) => (
                            <div className="mt-2 space-y-2" ref={provided.innerRef} {...provided.droppableProps}>
                              {field.value.map((ingredient, index) => (
                                <Draggable key={index} draggableId={`ingredient-${index}`} index={index}>
                                  {(provided, snapshot) => (
                                    <div
                                      ref={provided.innerRef}
                                      {...provided.draggableProps}
                                      {...provided.dragHandleProps}
                                      style={{
                                        ...provided.draggableProps.style,
                                        top: snapshot.isDragging ? 'auto' : undefined,
                                        left: snapshot.isDragging ? 'auto' : undefined,
                                        transform: restrictToVerticalOnly(
                                          provided.draggableProps.style?.transform
                                        ),
                                      }}
                                      className={`flex items-center justify-between bg-gray-50 p-2 rounded ${snapshot.isDragging ? "ring-2 ring-primary" : ""}`}
                                    >
                                      <span {...provided.dragHandleProps} className="cursor-grab mr-2 text-gray-400"><GripVertical className="h-4 w-4" /></span>
                                      <Input
                                        value={ingredient}
                                        onChange={(e) => {
                                          const newIngredients = [...field.value];
                                          newIngredients[index] = e.target.value;
                                          form.setValue("ingredients", newIngredients);
                                        }}
                                        className="flex-1"
                                      />
                                      <Button
                                        type="button"
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => removeIngredient(index)}
                                      >
                                        <X className="h-4 w-4" />
                                      </Button>
                                    </div>
                                  )}
                                </Draggable>
                              ))}
                              {provided.placeholder}
                            </div>
                          )}
                        </Droppable>
                      </DragDropContext>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            {/* Instructions */}
            <div className="space-y-2">
              <FormField
                control={form.control}
                name="instructions"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Instructions</FormLabel>
                    <div className="flex items-center space-x-2">
                      <Textarea 
                        placeholder="e.g. Preheat the oven to 350°F (175°C)..."
                        value={instructionInput}
                        onChange={(e) => setInstructionInput(e.target.value)}
                        className="resize-none"
                      />
                      <Button type="button" onClick={addInstruction} size="sm">
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                      <DragDropContext onDragEnd={onDragEndInstructions}>
                        <Droppable droppableId="instructions-droppable" direction="vertical">
                          {(provided) => (
                            <div className="mt-2 space-y-2" ref={provided.innerRef} {...provided.droppableProps}>
                              {field.value.map((instruction, index) => (
                                <Draggable key={index} draggableId={`instruction-${index}`} index={index}>
                                  {(provided, snapshot) => (
                                    <div
                                      ref={provided.innerRef}
                                      {...provided.draggableProps}
                                      {...provided.dragHandleProps}
                                      style={{
                                        ...provided.draggableProps.style,
                                        top: snapshot.isDragging ? 'auto' : undefined,
                                        left: snapshot.isDragging ? 'auto' : undefined,
                                        transform: restrictToVerticalOnly(
                                          provided.draggableProps.style?.transform
                                        ),
                                      }}
                                      className={`flex items-start justify-between bg-gray-50 p-2 rounded ${snapshot.isDragging ? "ring-2 ring-primary" : ""}`}
                                    >
                                      <span {...provided.dragHandleProps} className="cursor-grab mr-2 text-gray-400"><GripVertical className="h-4 w-4" /></span>
                                      <div className="font-bold mt-2 min-w-[24px]">{index + 1}.</div>
                                      <Textarea
                                        value={instruction}
                                        onChange={(e) => {
                                          const newInstructions = [...field.value];
                                          newInstructions[index] = e.target.value;
                                          form.setValue("instructions", newInstructions);
                                        }}
                                        className="flex-1 min-h-[60px]"
                                      />
                                      <Button
                                        type="button"
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => removeInstruction(index)}
                                      >
                                        <X className="h-4 w-4" />
                                      </Button>
                                    </div>
                                  )}
                                </Draggable>
                              ))}
                              {provided.placeholder}
                            </div>
                          )}
                        </Droppable>
                      </DragDropContext>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            {/* Tags */}
            <div className="space-y-2">
              <FormField
                control={form.control}
                name="tags"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tags</FormLabel>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {availableTags.map((tag) => (
                        <div
                          key={tag}
                          className={`px-3 py-1 rounded-full text-sm cursor-pointer transition-colors ${
                            field.value.includes(tag)
                              ? "bg-primary text-white"
                              : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                          }`}
                          onClick={() => toggleTag(tag)}
                        >
                          {tag}
                        </div>
                      ))}
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => {form.reset(); onOpenChange(false);}}
              >
                Cancel
              </Button>
              <Button 
                type="submit"
                disabled={updateRecipeMutation.isPending}
              >
                {updateRecipeMutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  "Save Changes"
                )}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
