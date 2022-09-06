import { UserContext } from "context/UserContext";
import { useContext } from "react";
import { useHistory } from "react-router-dom";
import { Loading } from "./Loading";

function Callback() {

  const history = useHistory()
  const userContext = useContext(UserContext)

  if (userContext.authenticated) {
    history.push("/")
  }

  return (
    <>
      <Loading />
      <p>Loading</p>
    </>
  );
}

export default Callback;
