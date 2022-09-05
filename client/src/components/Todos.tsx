import React, { useContext, useEffect, useState } from "react";
import update from "immutability-helper";
import {
  Button,
  Checkbox,
  Divider,
  Grid,
  Header,
  Icon,
  Input,
  Image,
  Loader,
} from "semantic-ui-react";

import { createTodo, deleteTodo, getTodos, patchTodo } from "../api/todos-api";
import { Todo } from "../types/Todo";
import { calculateDueDate } from "../utils/dateUtils";
import { UserContext } from "context/UserContext";
import { useHistory } from "react-router-dom";


export const Todos = () => {
  const userContext = useContext(UserContext);
  const history = useHistory()

  const [todos, setTodos] = useState<Todo[]>([]);
  const [newTodoName, setNewTodoName] = useState("");
  const [loadingTodos, setLoadingTodos] = useState(false);

  useEffect(() => {
    async function loadTodoAsync() {
      try {
        if (userContext?.idToken) {
          setLoadingTodos(true);
          const todos = await getTodos(userContext.idToken);
          setTodos(todos);
          setLoadingTodos(false);
        }
      } catch (e) {
        alert(`Failed to fetch todos: ${(e as Error).message}`);
      }
    }

    loadTodoAsync();
  }, [userContext?.idToken]);

  const handleNameChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setNewTodoName(event.target.value);
  };

  const onEditButtonClick = (todoId: string) => {
    history.push(`/todos/${todoId}/edit`);
  };

  const onTodoCreate = async (event: React.ChangeEvent<HTMLButtonElement>) => {
    try {
      const dueDate = calculateDueDate();
      const newTodo = await createTodo(userContext.idToken, {
        name: newTodoName,
        dueDate,
      });
      setTodos([...todos, newTodo]);
      setNewTodoName(newTodoName);
    } catch {
      alert("Todo creation failed");
    }
  };

  const onTodoDelete = async (todoId: string) => {
    try {
      await deleteTodo(userContext.idToken, todoId);
      setTodos(todos.filter((todo) => todo.todoId !== todoId));
    } catch {
      alert("Todo deletion failed");
    }
  };

  const onTodoCheck = async (pos: number) => {
    try {
      const todo = todos[pos];
      await patchTodo(userContext.idToken, todo.todoId, {
        name: todo.name,
        dueDate: todo.dueDate,
        done: !todo.done,
      });
      setTodos(
        update(todos, {
          [pos]: { done: { $set: !todo.done } },
        })
      );
    } catch {
      alert("Todo deletion failed");
    }
  };

  const renderCreateTodoInput = () => (
    <Grid.Row>
      <Grid.Column width={16}>
        <Input
          action={{
            color: "teal",
            labelPosition: "left",
            icon: "add",
            content: "New task",
            onClick: onTodoCreate,
          }}
          fluid
          actionPosition="left"
          placeholder="To change the world..."
          onChange={handleNameChange}
        />
      </Grid.Column>
      <Grid.Column width={16}>
        <Divider />
      </Grid.Column>
    </Grid.Row>
  );

  const renderTodos = () => {
    if (loadingTodos) {
      return renderLoading();
    }

    return renderTodosList();
  };

  const renderLoading = () => (
    <Grid.Row>
      <Loader indeterminate active inline="centered">
        Loading TODOs
      </Loader>
    </Grid.Row>
  );

  const renderTodosList = () => (
    <Grid padded>
      {todos &&
        todos.map((todo, pos) => {
          return (
            <Grid.Row key={todo.todoId}>
              <Grid.Column width={1} verticalAlign="middle">
                <Checkbox
                  onChange={() => onTodoCheck(pos)}
                  checked={todo.done}
                />
              </Grid.Column>
              <Grid.Column width={10} verticalAlign="middle">
                {todo.name}
              </Grid.Column>
              <Grid.Column width={3} floated="right">
                {todo.dueDate}
              </Grid.Column>
              <Grid.Column width={1} floated="right">
                <Button
                  icon
                  color="blue"
                  onClick={() => onEditButtonClick(todo.todoId)}
                >
                  <Icon name="pencil" />
                </Button>
              </Grid.Column>
              <Grid.Column width={1} floated="right">
                <Button
                  icon
                  color="red"
                  onClick={() => onTodoDelete(todo.todoId)}
                >
                  <Icon name="delete" />
                </Button>
              </Grid.Column>
              {todo.attachmentUrl && (
                <Image src={todo.attachmentUrl} size="small" wrapped />
              )}
              <Grid.Column width={16}>
                <Divider />
              </Grid.Column>
            </Grid.Row>
          );
        })}
    </Grid>
  );

  return (
    <div>
      <Header as="h1">TODOs</Header>

      {renderCreateTodoInput()}

      {renderTodos()}
    </div>
  );
};
