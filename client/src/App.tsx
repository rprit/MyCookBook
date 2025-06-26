import { Switch, Route } from "wouter";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { FavoritesProvider } from "@/context/favorites-context";
import NotFound from "@/pages/not-found";
import HomePage from "@/pages/home-page";
import RecipePage from "@/pages/recipe-page";

function App() {
  return (
    <FavoritesProvider>
      <TooltipProvider>
        <Toaster />
        <Switch>
          <Route path="/" component={HomePage} />
          <Route path="/recipe/:id" component={RecipePage} />
          <Route component={NotFound} />
        </Switch>
      </TooltipProvider>
    </FavoritesProvider>
  );
}

export default App;
