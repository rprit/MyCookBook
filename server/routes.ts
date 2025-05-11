import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth } from "./auth";
import { z } from "zod";
import { insertRecipeSchema } from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  // Authentication removed

  // Recipe endpoints
  app.get("/api/recipes", async (req: Request, res: Response) => {
    try {
      const limit = parseInt(req.query.limit as string) || 6;
      const offset = parseInt(req.query.offset as string) || 0;
      const search = req.query.search as string;
      const tags = req.query.tags ? (req.query.tags as string).split(',') : [];
      const sort = req.query.sort as 'newest' | 'oldest' | 'az' | 'za' | 'popular' || 'newest';

      let recipes;
      
      if (search && search.trim() !== '') {
        recipes = await storage.searchRecipes(search, limit, offset);
      } else if (tags && tags.length > 0) {
        recipes = await storage.filterRecipesByTags(tags, limit, offset);
      } else {
        recipes = await storage.sortRecipes(sort, limit, offset);
      }

      res.json(recipes);
    } catch (error) {
      res.status(500).json({ message: "Error fetching recipes" });
    }
  });

  app.get("/api/recipes/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      const recipe = await storage.getRecipeById(id);
      
      if (!recipe) {
        return res.status(404).json({ message: "Recipe not found" });
      }
      
      res.json(recipe);
    } catch (error) {
      res.status(500).json({ message: "Error fetching recipe" });
    }
  });

  app.post("/api/recipes", async (req: Request, res: Response) => {
    try {
      // Validate the request body
      const validatedData = insertRecipeSchema.parse(req.body);
      
      // Set a default author ID (1 for simplicity)
      validatedData.authorId = 1;
      
      // Create the recipe
      const recipe = await storage.createRecipe(validatedData);
      res.status(201).json(recipe);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid recipe data", errors: error.errors });
      }
      res.status(500).json({ message: "Error creating recipe" });
    }
  });

  app.put("/api/recipes/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      const recipe = await storage.getRecipeById(id);
      
      if (!recipe) {
        return res.status(404).json({ message: "Recipe not found" });
      }
      
      // Update the recipe
      const updatedRecipe = await storage.updateRecipe(id, req.body);
      res.json(updatedRecipe);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid recipe data", errors: error.errors });
      }
      res.status(500).json({ message: "Error updating recipe" });
    }
  });

  app.delete("/api/recipes/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      const recipe = await storage.getRecipeById(id);
      
      if (!recipe) {
        return res.status(404).json({ message: "Recipe not found" });
      }
      
      // Delete the recipe
      await storage.deleteRecipe(id);
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Error deleting recipe" });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}
