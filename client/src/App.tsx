import { Link, Route, Router, Switch } from 'react-router-dom'
import { Grid, Menu, Segment } from 'semantic-ui-react'
import { EditTodo } from './components/EditTodo'
import { LogIn } from './components/LogIn'
import { NotFound } from './components/NotFound'
import { Todos } from './components/Todos'
import { useAuth0 } from '@auth0/auth0-react'

interface AppProps {
  history: any
}

export const App = ({ history }: AppProps) => {
  const { loginWithRedirect, logout, isAuthenticated } = useAuth0()

  const logInLogOutButton = () => {
    if (isAuthenticated) {
      return (
        <Menu.Item name="logout" onClick={() => logout({ returnTo: "/" })}>
          Log Out
        </Menu.Item>
      )
    } else {
      return (
        <Menu.Item
          name="login"
          onClick={loginWithRedirect}
        >
          Log In
        </Menu.Item>
      )
    }
  }

  const generateMenu = () => {
    return (
      <Menu>
        <Menu.Item name="home">
          <Link to="/">Home</Link>
        </Menu.Item>

        <Menu.Menu position="right">{logInLogOutButton()}</Menu.Menu>
      </Menu>
    )
  }

  const generateCurrentPage = () => {
    if (!isAuthenticated) {
      return <LogIn />
    }

    return (
      <Switch>
        <Route
          path="/"
          exact
          render={(props) => {
            return <Todos {...props} />
          }}
        />

        <Route
          path="/todos/:todoId/edit"
          exact
          render={(props) => {
            return <></>
            // return <EditTodo {...props} auth={this.props.auth} />
          }}
        />

        <Route component={NotFound} />
      </Switch>
    )
  }

  return (
    <div>
      <Segment style={{ padding: '8em 0em' }} vertical>
        <Grid container stackable verticalAlign="middle">
          <Grid.Row>
            <Grid.Column width={16}>
              <Router history={history}>
                {generateMenu()}

                {generateCurrentPage()}
              </Router>
            </Grid.Column>
          </Grid.Row>
        </Grid>
      </Segment>
    </div>
  )
}
