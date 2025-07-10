import { db } from "./db";
import { InsertRecipe, Recipe, UpdateRecipe, User, InsertUser } from "@shared/schema";
import { IStorage } from "./storage";
import { eq, ilike, or, arrayContains } from "drizzle-orm";
import { recipes, users } from "../shared/schema";
import createMemoryStore from "memorystore";
import session from "express-session";

const MemoryStore = createMemoryStore(session);

export class PostgresStorage implements IStorage {
  public sessionStore = new MemoryStore({ checkPeriod: 86400000 });

  async getUser(id: number): Promise<User | undefined> {
    return db.query.users.findFirst({ where: eq(users.id, id) });
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return db.query.users.findFirst({ where: eq(users.username, username) });
  }

  async createUser(user: InsertUser): Promise<User> {
    const [created] = await db.insert(users).values(user).returning();
    return created;
  }

  async getRecipes(limit: number, offset: number): Promise<Recipe[]> {
    return db.query.recipes.findMany({ limit, offset });
  }

  async getRecipeById(id: number): Promise<Recipe | undefined> {
    return db.query.recipes.findFirst({ where: eq(recipes.id, id) });
  }

  async getRecipesByAuthor(authorId: number): Promise<Recipe[]> {
    return db.query.recipes.findMany({ where: eq(recipes.authorId, authorId) });
  }

  async createRecipe(data: InsertRecipe): Promise<Recipe> {
    const [recipe] = await db.insert(recipes).values({
      ...data,
      createdAt: new Date(),
      updatedAt: new Date(),
    }).returning();
    return recipe;
  }

  async updateRecipe(id: number, data: Partial<InsertRecipe>): Promise<Recipe | undefined> {
    const [recipe] = await db.update(recipes)
      .set({
        ...data,
        updatedAt: new Date(),
      })
      .where(eq(recipes.id, id))
      .returning();
    return recipe;
  }

  async deleteRecipe(id: number): Promise<boolean> {
    const result = await db.delete(recipes).where(eq(recipes.id, id));
    // You may want to check result.rowCount or similar if available
    return true;
  }

  async searchRecipes(query: string, limit: number, offset: number): Promise<Recipe[]> {
    return db.query.recipes.findMany({
      where: or(
        ilike(recipes.name, `%${query}%`),
        ilike(recipes.description, `%${query}%`)
      ),
      limit,
      offset,
    });
  }

  async filterRecipesByTags(tags: string[], limit: number, offset: number): Promise<Recipe[]> {
    return db.query.recipes.findMany({
      where: arrayContains(recipes.tags, tags),
      limit,
      offset,
    });
  }

  async sortRecipes(criteria: 'newest' | 'oldest' | 'az' | 'za' | 'popular', limit: number, offset: number): Promise<Recipe[]> {
    // You can expand this to support more sort options
    return db.query.recipes.findMany({ limit, offset });
  }
}
