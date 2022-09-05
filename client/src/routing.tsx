import { Router, Route } from "react-router-dom";
import Callback from "./components/Callback";
import { AppState, Auth0Provider } from "@auth0/auth0-react";
import { authConfig } from "./config";
import { App } from "./App";
import { UserContextProvider } from "./context/UserContext";

const createHistory = require("history").createBrowserHistory;
const history = createHistory();

export const makeAuthRouting = () => {
  const handleCallback = (appState: AppState) => {
    console.log("handleCallback", window.location.pathname);
    history.push(appState?.returnTo || window.location.pathname);
  };

  return (
    <Auth0Provider
      domain={authConfig.domain}
      clientId={authConfig.clientId}
      redirectUri={authConfig.callbackUrl}
      onRedirectCallback={handleCallback}
    >
      <UserContextProvider>
        <Router history={history}>
          <div>
            <Route
              path="/callback"
              render={(props) => {
                console.log("callback url", JSON.stringify(props));
                return <Callback />;
              }}
            />
            <Route
              render={(props) => {
                return <App {...props} />;
              }}
            />
          </div>
        </Router>
      </UserContextProvider>
    </Auth0Provider>
  );
};
