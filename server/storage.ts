import { users, type User, type InsertUser, recipes, type Recipe, type InsertRecipe } from "@shared/schema";
import createMemoryStore from "memorystore";
import session from "express-session";

const MemoryStore = createMemoryStore(session);

export interface IStorage {
  // User CRUD operations
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Recipe CRUD operations
  getRecipes(limit: number, offset: number): Promise<Recipe[]>;
  getRecipeById(id: number): Promise<Recipe | undefined>;
  getRecipesByAuthor(authorId: number): Promise<Recipe[]>;
  createRecipe(recipe: InsertRecipe): Promise<Recipe>;
  updateRecipe(id: number, recipe: Partial<InsertRecipe>): Promise<Recipe | undefined>;
  deleteRecipe(id: number): Promise<boolean>;
  
  // Search and filter operations
  searchRecipes(query: string, limit: number, offset: number): Promise<Recipe[]>;
  filterRecipesByTags(tags: string[], limit: number, offset: number): Promise<Recipe[]>;
  sortRecipes(criteria: 'newest' | 'oldest' | 'az' | 'za' | 'popular', limit: number, offset: number): Promise<Recipe[]>;
  
  // Session store
  sessionStore: session.SessionStore;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private recipes: Map<number, Recipe>;
  private nextUserId: number;
  private nextRecipeId: number;
  public sessionStore: session.SessionStore;

  constructor() {
    this.users = new Map();
    this.recipes = new Map();
    this.nextUserId = 1;
    this.nextRecipeId = 1;
    this.sessionStore = new MemoryStore({
      checkPeriod: 86400000, // prune expired entries every 24h
    });
    
    // Add some initial recipe data
    this.seedRecipes();
  }

  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.nextUserId++;
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  async getRecipes(limit: number, offset: number): Promise<Recipe[]> {
    const allRecipes = Array.from(this.recipes.values());
    // Sort by newest first (default)
    allRecipes.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    return allRecipes.slice(offset, offset + limit);
  }

  async getRecipeById(id: number): Promise<Recipe | undefined> {
    return this.recipes.get(id);
  }

  async getRecipesByAuthor(authorId: number): Promise<Recipe[]> {
    return Array.from(this.recipes.values()).filter(
      (recipe) => recipe.authorId === authorId
    );
  }

  async createRecipe(insertRecipe: InsertRecipe): Promise<Recipe> {
    const id = this.nextRecipeId++;
    const now = new Date();
    const recipe: Recipe = { 
      ...insertRecipe, 
      id, 
      createdAt: now,
      rating: 0,
      ratingCount: 0
    };
    this.recipes.set(id, recipe);
    return recipe;
  }

  async updateRecipe(id: number, updates: Partial<InsertRecipe>): Promise<Recipe | undefined> {
    const existingRecipe = this.recipes.get(id);
    if (!existingRecipe) return undefined;
    
    const updatedRecipe = { ...existingRecipe, ...updates };
    this.recipes.set(id, updatedRecipe);
    return updatedRecipe;
  }

  async deleteRecipe(id: number): Promise<boolean> {
    return this.recipes.delete(id);
  }

  async searchRecipes(query: string, limit: number, offset: number): Promise<Recipe[]> {
    if (!query) return this.getRecipes(limit, offset);
    
    const lowercaseQuery = query.toLowerCase();
    const matchedRecipes = Array.from(this.recipes.values()).filter(recipe => {
      return (
        recipe.name.toLowerCase().includes(lowercaseQuery) ||
        recipe.description.toLowerCase().includes(lowercaseQuery) ||
        recipe.ingredients.some(i => i.toLowerCase().includes(lowercaseQuery)) ||
        recipe.tags.some(t => t.toLowerCase().includes(lowercaseQuery))
      );
    });
    
    return matchedRecipes.slice(offset, offset + limit);
  }

  async filterRecipesByTags(tags: string[], limit: number, offset: number): Promise<Recipe[]> {
    if (!tags.length) return this.getRecipes(limit, offset);
    
    const matchedRecipes = Array.from(this.recipes.values()).filter(recipe => {
      return tags.every(tag => recipe.tags.includes(tag));
    });
    
    return matchedRecipes.slice(offset, offset + limit);
  }

  async sortRecipes(criteria: 'newest' | 'oldest' | 'az' | 'za' | 'popular', limit: number, offset: number): Promise<Recipe[]> {
    const allRecipes = Array.from(this.recipes.values());
    
    switch (criteria) {
      case 'newest':
        allRecipes.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        break;
      case 'oldest':
        allRecipes.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
        break;
      case 'az':
        allRecipes.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case 'za':
        allRecipes.sort((a, b) => b.name.localeCompare(a.name));
        break;
      case 'popular':
        allRecipes.sort((a, b) => b.rating - a.rating);
        break;
    }
    
    return allRecipes.slice(offset, offset + limit);
  }

  private seedRecipes() {
    const sampleRecipes: InsertRecipe[] = [
      {
        name: "Homemade Pasta with Fresh Herbs",
        description: "A simple yet delicious pasta dish made with fresh basil, garlic, and high-quality olive oil. Perfect for a quick weeknight dinner.",
        ingredients: [
          "2 cups all-purpose flour",
          "3 large eggs",
          "1 tablespoon olive oil",
          "½ teaspoon salt",
          "¼ cup fresh basil, chopped",
          "2 cloves garlic, minced"
        ],
        instructions: [
          "Mix flour and salt in a large bowl.",
          "Make a well in the center and add eggs and olive oil.",
          "Gradually mix the flour into the wet ingredients.",
          "Knead the dough for 8-10 minutes until smooth.",
          "Let rest for 30 minutes covered with a towel.",
          "Roll out and cut into desired pasta shapes.",
          "Cook in boiling water for 2-3 minutes.",
          "Toss with olive oil, garlic, and fresh herbs."
        ],
        imageUrl: "https://images.unsplash.com/photo-1546549032-9571cd6b27df?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=450",
        prepTime: 25,
        tags: ["Italian", "Dinner", "Vegetarian"],
        authorId: 1
      },
      {
        name: "Avocado Toast with Poached Egg",
        description: "Creamy avocado on toasted sourdough bread topped with a perfectly poached egg. A nutritious breakfast ready in minutes.",
        ingredients: [
          "1 ripe avocado",
          "2 slices sourdough bread",
          "2 eggs",
          "1 tablespoon white vinegar",
          "Salt and pepper to taste",
          "Red pepper flakes (optional)",
          "Fresh herbs for garnish"
        ],
        instructions: [
          "Toast the sourdough bread until golden and crispy.",
          "Mash the avocado in a bowl and season with salt and pepper.",
          "Bring a pot of water to a simmer, add vinegar.",
          "Crack egg into a small bowl, then slide into the simmering water.",
          "Poach for 3-4 minutes, then remove with a slotted spoon.",
          "Spread mashed avocado on toast and top with poached egg.",
          "Season with salt, pepper, and red pepper flakes if desired.",
          "Garnish with fresh herbs before serving."
        ],
        imageUrl: "https://images.unsplash.com/photo-1525351484163-7529414344d8?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=450",
        prepTime: 15,
        tags: ["Breakfast", "Quick & Easy", "Vegetarian"],
        authorId: 1
      },
      {
        name: "Berry Smoothie Bowl",
        description: "A refreshing and nutritious smoothie bowl packed with antioxidants and topped with fresh fruits, granola, and honey.",
        ingredients: [
          "1 cup mixed frozen berries",
          "1 frozen banana",
          "½ cup Greek yogurt",
          "¼ cup almond milk",
          "1 tablespoon honey or maple syrup",
          "Toppings: fresh berries, granola, chia seeds, sliced banana"
        ],
        instructions: [
          "Add frozen berries, banana, yogurt, milk, and sweetener to a blender.",
          "Blend until smooth, adding more milk if needed.",
          "Pour into a bowl.",
          "Top with fresh berries, granola, chia seeds, and sliced banana.",
          "Drizzle with additional honey if desired.",
          "Serve immediately."
        ],
        imageUrl: "https://images.unsplash.com/photo-1511690656952-34342bb7c2f2?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=450",
        prepTime: 10,
        tags: ["Breakfast", "Vegan", "Healthy"],
        authorId: 1
      },
      {
        name: "Homemade Margherita Pizza",
        description: "Classic Margherita pizza with a crispy crust, San Marzano tomatoes, fresh mozzarella, and basil. Better than delivery!",
        ingredients: [
          "For the dough: 2½ cups flour, 1 tsp yeast, 1 tsp salt, 1 tbsp olive oil, 1 cup warm water",
          "½ cup San Marzano tomato sauce",
          "8 oz fresh mozzarella, sliced",
          "Fresh basil leaves",
          "2 tbsp extra virgin olive oil",
          "Salt and pepper to taste"
        ],
        instructions: [
          "Mix flour, yeast, and salt in a bowl.",
          "Add olive oil and warm water, mix until combined.",
          "Knead for 5-7 minutes until smooth and elastic.",
          "Let rise in an oiled bowl for 1-2 hours.",
          "Preheat oven to 500°F with a pizza stone if available.",
          "Stretch dough into a 12-inch circle.",
          "Top with tomato sauce, mozzarella, and a drizzle of olive oil.",
          "Bake for 10-12 minutes until crust is golden.",
          "Add fresh basil leaves after baking.",
          "Season with salt and pepper before serving."
        ],
        imageUrl: "https://images.unsplash.com/photo-1513104890138-7c749659a591?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=450",
        prepTime: 40,
        tags: ["Italian", "Dinner", "Vegetarian"],
        authorId: 1
      },
      {
        name: "Chocolate Chip Cookies",
        description: "Classic chocolate chip cookies with crispy edges and a soft, chewy center. The perfect balance of sweet and salty.",
        ingredients: [
          "1 cup unsalted butter, softened",
          "¾ cup granulated sugar",
          "¾ cup brown sugar, packed",
          "2 large eggs",
          "2 tsp vanilla extract",
          "2¼ cups all-purpose flour",
          "1 tsp baking soda",
          "½ tsp salt",
          "2 cups chocolate chips"
        ],
        instructions: [
          "Preheat oven to 375°F and line baking sheets with parchment paper.",
          "Cream together butter and both sugars until light and fluffy.",
          "Beat in eggs one at a time, then add vanilla.",
          "In a separate bowl, mix flour, baking soda, and salt.",
          "Gradually add dry ingredients to wet ingredients and mix until just combined.",
          "Fold in chocolate chips.",
          "Drop tablespoon-sized dough balls onto baking sheets, 2 inches apart.",
          "Bake for 9-11 minutes until edges are golden but centers are still soft.",
          "Cool on baking sheet for 5 minutes, then transfer to wire rack."
        ],
        imageUrl: "https://images.unsplash.com/photo-1499636136210-6f4ee915583e?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=450",
        prepTime: 35,
        tags: ["Dessert", "Baking", "Kid-Friendly"],
        authorId: 1
      },
      {
        name: "Grilled Chicken Salad",
        description: "A healthy and filling salad with grilled chicken, mixed greens, avocado, and homemade vinaigrette dressing.",
        ingredients: [
          "2 boneless, skinless chicken breasts",
          "6 cups mixed salad greens",
          "1 avocado, sliced",
          "1 cup cherry tomatoes, halved",
          "¼ cup red onion, thinly sliced",
          "¼ cup crumbled feta cheese",
          "For the dressing: 3 tbsp olive oil, 1 tbsp lemon juice, 1 tsp Dijon mustard, salt and pepper"
        ],
        instructions: [
          "Season chicken breasts with salt, pepper, and olive oil.",
          "Grill chicken for 6-7 minutes per side until fully cooked.",
          "Let chicken rest for 5 minutes, then slice.",
          "In a large bowl, combine mixed greens, tomatoes, and red onion.",
          "Whisk together olive oil, lemon juice, mustard, salt, and pepper.",
          "Toss salad with dressing.",
          "Top with sliced chicken, avocado, and feta cheese.",
          "Serve immediately."
        ],
        imageUrl: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=450",
        prepTime: 20,
        tags: ["Lunch", "Healthy", "High-Protein"],
        authorId: 1
      }
    ];

    // Add each recipe to the in-memory storage
    sampleRecipes.forEach(recipe => {
      this.createRecipe(recipe);
    });
  }
}

export const storage = new MemStorage();
