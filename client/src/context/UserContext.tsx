import { useAuth0 } from "@auth0/auth0-react";
import React, { createContext, useEffect, useState } from "react";

interface IUser {
  name: string;
  email: string;
}

interface IUserContext {
  user: IUser;
  idToken: string;
  accessToken: string;
}

export const UserContext = createContext<IUserContext>({} as IUserContext);

export const UserContextProvider = ({
  children,
}: React.PropsWithChildren<{}>) => {
  const { user, getIdTokenClaims, getAccessTokenSilently, isAuthenticated } =
    useAuth0();
  const [context, setContext] = useState<IUserContext>();

  useEffect(() => {
    async function getIdToken() {
      const idTokenClaims = await getIdTokenClaims();
      console.log("getIdToken", JSON.stringify(idTokenClaims));

      setContext((oldContext) => ({
        ...oldContext,
        user: { ...user } as IUser,
        idToken: idTokenClaims.__raw
      }));
    }

    async function getAccessToken() {
      const accessToken = await getAccessTokenSilently();
      console.log("getAccessToken", JSON.stringify(accessToken));
      setContext((oldContext) => ({
        ...oldContext,
        user: { ...user } as IUser,
        accessToken
      }));
    }

    if (isAuthenticated) {
      getIdToken();
      getAccessToken();
    }
  }, [user, isAuthenticated, getIdTokenClaims, getAccessTokenSilently]);

  return (
    <UserContext.Provider value={context}>{children}</UserContext.Provider>
  );
};
