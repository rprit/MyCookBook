import { Switch, Route } from "wouter";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import HomePage from "@/pages/home-page";
import RecipePage from "@/pages/recipe-page";

function App() {
  return (
    <TooltipProvider>
      <Toaster />
      <Switch>
        <Route path="/" component={HomePage} />
        <Route path="/recipe/:id" component={RecipePage} />
        <Route component={NotFound} />
      </Switch>
    </TooltipProvider>
  );
}

export default App;
