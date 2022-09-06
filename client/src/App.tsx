import { Link, Route, Switch } from "react-router-dom";
import { Grid, Menu, Segment } from "semantic-ui-react";
import { EditTodo } from "./components/EditTodo";
import { LogIn } from "./components/LogIn";
import { NotFound } from "./components/NotFound";
import { Todos } from "./components/Todos";
import { useAuth0 } from "@auth0/auth0-react";
import { useContext } from "react";
import { UserContext } from "context/UserContext";

export const App = () => {
  const { loginWithRedirect, logout } = useAuth0();
  const userContext = useContext(UserContext);

  const logInLogOutButton = () => {
    if (userContext.authenticated) {
      return (
        <Menu.Item
          name="logout"
          onClick={() => {
            localStorage.clear();
            logout({ returnTo: window.location.origin });
          }}
        >
          Log Out
        </Menu.Item>
      );
    } else {
      return (
        <Menu.Item name="login" onClick={loginWithRedirect}>
          Log In
        </Menu.Item>
      );
    }
  };

  const generateMenu = () => {
    return (
      <Menu>
        <Menu.Item name="home">
          <Link to="/">Home</Link>
        </Menu.Item>

        <Menu.Menu position="right">{logInLogOutButton()}</Menu.Menu>
      </Menu>
    );
  };

  const generateCurrentPage = () => {
    if (!userContext.authenticated) {
      return <LogIn />;
    }

    return (
      <Switch>
        <Route path="/" exact component={Todos} />

        <Route
          path="/todos/:todoId/edit"
          exact
          render={(props) => <EditTodo todoId={props.match.params.todoId} />}
        />

        <Route component={NotFound} />
      </Switch>
    );
  };

  return (
    <div>
      <Segment style={{ padding: "8em 0em" }} vertical>
        <Grid container stackable verticalAlign="middle">
          <Grid.Row>
            <Grid.Column width={16}>
              {generateMenu()}

              {generateCurrentPage()}
            </Grid.Column>
          </Grid.Row>
        </Grid>
      </Segment>
    </div>
  );
};
