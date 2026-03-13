import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { StudyProvider } from "@/context/StudyContext";
import { AppLayout } from "@/components/layout/AppLayout";
import Dashboard from "@/pages/dashboard";
import Planner from "@/pages/planner";
import FocusVault from "@/pages/focus";
import AcademicLedger from "@/pages/ledger";
import Analytics from "@/pages/analytics";
import NotFound from "@/pages/not-found";

// Create a client for any external APIs if added later
const queryClient = new QueryClient();

function Router() {
  return (
    <AppLayout>
      <Switch>
        <Route path="/" component={Dashboard} />
        <Route path="/planner" component={Planner} />
        <Route path="/focus" component={FocusVault} />
        <Route path="/ledger" component={AcademicLedger} />
        <Route path="/analytics" component={Analytics} />
        <Route component={NotFound} />
      </Switch>
    </AppLayout>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <StudyProvider>
        <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
          <Router />
        </WouterRouter>
      </StudyProvider>
    </QueryClientProvider>
  );
}

export default App;
