import { useAuth0 } from "@auth0/auth0-react";
import React, { createContext, useEffect, useState } from "react";
import { ACCESS_TOKEN, ID_TOKEN } from "utils/constants";
import { getItem, setItem } from "utils/storage";

interface IUser {
  name: string;
  email: string;
}

interface IUserContext {
  user: IUser;
  idToken: string;
  accessToken: string;
  authenticated: boolean
  isLoading: boolean
}

export const UserContext = createContext<IUserContext>({} as IUserContext);

export const UserContextProvider = ({
  children,
}: React.PropsWithChildren<{}>) => {
  const { user, getIdTokenClaims, getAccessTokenSilently, isAuthenticated: auth0Authenticated } =
    useAuth0();
  const [context, setContext] = useState<IUserContext>({} as IUserContext);

  useEffect(() => {
    async function getIdToken() {
      let idToken = getItem(ID_TOKEN)

      if (!idToken) {
        const idTokenClaims = await getIdTokenClaims();
        console.log("getIdToken", JSON.stringify(idTokenClaims));
        idToken = idTokenClaims.__raw
        setItem(ID_TOKEN, idToken)
      }

      setContext((oldContext) => ({
        ...oldContext,
        user: { ...user } as IUser,
        idToken: idToken,
        authenticated: auth0Authenticated
      }));
    }

    async function getAccessToken() {
      let accessToken = getItem(ACCESS_TOKEN)
      if (!accessToken) {
        const accessToken = await getAccessTokenSilently();
        console.log("getAccessToken", accessToken);
        setItem(ACCESS_TOKEN, accessToken)
      }

      setContext((oldContext) => ({
        ...oldContext,
        user: { ...user } as IUser,
        accessToken,
        authenticated: auth0Authenticated
      }));
    }

    if (auth0Authenticated) {
      getIdToken();
      getAccessToken();
    }

  }, [user, auth0Authenticated, getIdTokenClaims, getAccessTokenSilently]);

  return (
    <UserContext.Provider value={context}>{children}</UserContext.Provider>
  );
};
