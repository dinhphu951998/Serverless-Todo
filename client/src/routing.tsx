import { Route, Switch, BrowserRouter } from "react-router-dom";
import Callback from "./components/Callback";
import { Auth0Provider } from "@auth0/auth0-react";
import { authConfig } from "./config";
import { App } from "./App";
import { UserContextProvider } from "./context/UserContext";

export const MyAuthRouting = () => {

  return (
    <Auth0Provider
      domain={authConfig.domain}
      clientId={authConfig.clientId}
      redirectUri={authConfig.callbackUrl}
    >
      <UserContextProvider>
        <BrowserRouter>
          <Switch>
            <Route
              path="/callback"
              exact
              component={Callback}
            />
            <Route component={App} />
          </Switch>
        </BrowserRouter>
      </UserContextProvider>
    </Auth0Provider>
  );
};
