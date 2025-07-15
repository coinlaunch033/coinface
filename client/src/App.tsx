import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { WalletProvider } from "@/contexts/wallet-context";
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
    <QueryClientProvider client={queryClient}>
      <WalletProvider>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
      </WalletProvider>
    </QueryClientProvider>
  );
}

export default App;
