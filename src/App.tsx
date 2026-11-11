import { Switch, Route, Router as WouterRouter } from "wouter";
import LandingPage from "./pages/LandingPage";
import Game from "./pages/Game";
import Football from "./pages/Football";
import { AuthProvider } from "./lib/auth";

function Router() {
  return (
    <Switch>
      <Route path="/game" component={Game} />
      <Route path="/football" component={Football} />
      <Route path="/" component={LandingPage} />
    </Switch>
  );
}

export default function App() {
  return (
    <WouterRouter base={""}>
      <AuthProvider>
        <Router />
      </AuthProvider>
    </WouterRouter>
  );
}
