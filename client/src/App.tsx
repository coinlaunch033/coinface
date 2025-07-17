import { Switch, Route } from "wouter";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ReownAppKitProvider } from "@/providers/reown-provider";
import Home from "@/pages/home";
import TokenPage from "@/pages/token-page";
import MemeDrop from "@/pages/memedrop";
import NotFound from "@/pages/not-found";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/coin/:tokenName" component={TokenPage} />
      <Route path="/memedrop" component={MemeDrop} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <ReownAppKitProvider>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </ReownAppKitProvider>
  );
}

export default App;
