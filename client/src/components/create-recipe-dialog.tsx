import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { insertRecipeSchema, InsertRecipe, Recipe } from "@shared/schema";
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
import { X, Loader2, Plus, Edit, GripVertical } from "lucide-react";
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

interface CreateRecipeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export default function CreateRecipeDialog({
  open,
  onOpenChange,
  onSuccess
}: CreateRecipeDialogProps) {
  const { toast } = useToast();
  const [ingredientInput, setIngredientInput] = useState("");
  const [instructionInput, setInstructionInput] = useState("");
  const [editingIngredientIndex, setEditingIngredientIndex] = useState<number | null>(null);
  const [editingInstructionIndex, setEditingInstructionIndex] = useState<number | null>(null);
  const [tempIngredient, setTempIngredient] = useState("");
  const [tempInstruction, setTempInstruction] = useState("");

  const form = useForm<RecipeFormValues>({
    resolver: zodResolver(recipeFormSchema),
    defaultValues: {
      name: "",
      description: "",
      imageUrl: "",
      prepTime: 0,
      cookTime: 30,
      servings: 1,
      ingredients: [],
      instructions: [],
      tags: [],
    },
  });

  const createRecipeMutation = useMutation({
    mutationFn: async (recipe: InsertRecipe) => {
      const res = await apiRequest("POST", "/api/recipes", recipe);
      return await res.json() as Recipe;
    },
    onSuccess: () => {
      toast({
        title: "Recipe created!",
        description: "Your recipe has been successfully created.",
      });
      form.reset();
      onSuccess();
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to create recipe",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: RecipeFormValues) => {
    // Transform the form data to match the InsertRecipe type
    const recipeData: InsertRecipe = {
      ...data,
      imageUrl: data.imageUrl || undefined,
      authorId: 1, // Default author ID since we removed authentication
    };
    
    createRecipeMutation.mutate(recipeData);
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

  // Handler to swap ingredient up
  const swapIngredientUp = (index: number) => {
    if (index <= 0) return;
    const items = [...form.getValues().ingredients];
    [items[index - 1], items[index]] = [items[index], items[index - 1]];
    form.setValue("ingredients", items);
    if (editingIngredientIndex === index) setEditingIngredientIndex(index - 1);
    else if (editingIngredientIndex === index - 1) setEditingIngredientIndex(index);
  };
  // Handler to swap ingredient down
  const swapIngredientDown = (index: number) => {
    const items = [...form.getValues().ingredients];
    if (index >= items.length - 1) return;
    [items[index], items[index + 1]] = [items[index + 1], items[index]];
    form.setValue("ingredients", items);
    if (editingIngredientIndex === index) setEditingIngredientIndex(index + 1);
    else if (editingIngredientIndex === index + 1) setEditingIngredientIndex(index);
  };
  // Handler to swap instruction up
  const swapInstructionUp = (index: number) => {
    if (index <= 0) return;
    const items = [...form.getValues().instructions];
    [items[index - 1], items[index]] = [items[index], items[index - 1]];
    form.setValue("instructions", items);
    if (editingInstructionIndex === index) setEditingInstructionIndex(index - 1);
    else if (editingInstructionIndex === index - 1) setEditingInstructionIndex(index);
  };
  // Handler to swap instruction down
  const swapInstructionDown = (index: number) => {
    const items = [...form.getValues().instructions];
    if (index >= items.length - 1) return;
    [items[index], items[index + 1]] = [items[index + 1], items[index]];
    form.setValue("instructions", items);
    if (editingInstructionIndex === index) setEditingInstructionIndex(index + 1);
    else if (editingInstructionIndex === index + 1) setEditingInstructionIndex(index);
  };

  // Restrict drag transform to vertical movement only (for react-beautiful-dnd style transform string)
  function restrictToVerticalOnly(transform: string | undefined): string | undefined {
    if (!transform) return undefined;
    
    // Example: "translate(0px, 24px)" or "translate3d(0px, 24px, 0px)"
    //const match = transform.match(/translate(?:3d)?\(\s*([-\d.]+)px,\s*([-\d.]+)px(?:,\s*([-\d.]+)px)?\)/);
    const match = transform.match(/translate\(([-\d.]+)px,\s*([-\d.]+)px\)/);
    if (!match) return transform;
    const y = match[2];
    // Only apply vertical translation
    return `translate(0px, ${y}px)`;
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl">Create New Recipe</DialogTitle>
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
                                    {editingIngredientIndex === index ? (
                                      <>
                                        <Input
                                          value={tempIngredient}
                                          onChange={e => setTempIngredient(e.target.value)}
                                          className="flex-1 mr-2"
                                          autoFocus
                                        />
                                        <Button
                                          type="button"
                                          variant="ghost"
                                          size="sm"
                                          onClick={() => {
                                            const newIngredients = [...field.value];
                                            newIngredients[index] = tempIngredient;
                                            form.setValue("ingredients", newIngredients);
                                            setEditingIngredientIndex(null);
                                          }}
                                        >
                                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                                        </Button>
                                      </>
                                    ) : (
                                      <>
                                        <span className="flex-1 mr-2">{ingredient}</span>
                                        <Button
                                          type="button"
                                          variant="ghost"
                                          size="sm"
                                          onClick={() => {
                                            setEditingIngredientIndex(index);
                                            setTempIngredient(ingredient);
                                          }}
                                        >
                                          <Edit className="h-4 w-4" />
                                        </Button>
                                      </>
                                    )}
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
                      <Droppable droppableId="instructions-droppable"  direction="vertical">
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
                                    <div className="flex-1 flex items-center">
                                      <span className="font-bold mr-2">{index + 1}.</span>
                                      {editingInstructionIndex === index ? (
                                        <Textarea
                                          value={tempInstruction}
                                          onChange={e => setTempInstruction(e.target.value)}
                                          className="flex-1 resize-none mr-2"
                                          rows={1}
                                          autoFocus
                                        />
                                      ) : (
                                        <span>{instruction}</span>
                                      )}
                                    </div>
                                    {editingInstructionIndex === index ? (
                                      <Button
                                        type="button"
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => {
                                          const newInstructions = [...field.value];
                                          newInstructions[index] = tempInstruction;
                                          form.setValue("instructions", newInstructions);
                                          setEditingInstructionIndex(null);
                                        }}
                                      >
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                                      </Button>
                                    ) : (
                                      <Button
                                        type="button"
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => {
                                          setEditingInstructionIndex(index);
                                          setTempInstruction(instruction);
                                        }}
                                      >
                                        <Edit className="h-4 w-4" />
                                      </Button>
                                    )}
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
                onClick={() => onOpenChange(false)}
              >
                Cancel
              </Button>
              <Button 
                type="submit"
                disabled={createRecipeMutation.isPending}
              >
                {createRecipeMutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating...
                  </>
                ) : (
                  "Create Recipe"
                )}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
