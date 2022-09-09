const express = require("express");
const cors = require("cors");

const { v4: uuidv4 } = require("uuid");

const app = express();

app.use(cors());
app.use(express.json());

const users = [];

function checksExistsUserAccount(request, response, next) {
  const { username } = request.headers;

  const ExistedUser = users.find((user) => user.username === username);

  if (!ExistedUser) {
    return response.status(400).json({ error: "Mensagem do erro" });
  }

  request.user = ExistedUser;

  return next();
}

app.post("/users", (request, response) => {
  const { name, username } = request.body;

  const userAleradyExists = users.some((user) => user.username === username);

  if (userAleradyExists) {
    return response.status(400).json({ error: "User Already exist" });
  }

  const newUser = {
    id: uuidv4(),
    name,
    username,
    todos: [],
  };

  users.push(newUser);

  return response.status(201).send(newUser);
});

app.get("/todos", checksExistsUserAccount, (request, response) => {
  const { user } = request;

  return response.json(user.todos);
});

app.post("/todos", checksExistsUserAccount, (request, response) => {
  const { title, deadline } = request.body;

  const { user } = request;

  const newTodo = {
    id: uuidv4(), // precisa ser um uuid
    title,
    done: false,
    deadline: new Date(deadline),
    created_at: new Date(),
  };

  user.todos.push(newTodo);

  return response.status(201).send(newTodo);
});

app.put("/todos/:id", checksExistsUserAccount, (request, response) => {
  const { title, deadline } = request.body;
  const { id } = request.params;
  const { user } = request;

  const existedTodo = user.todos.find((todo) => todo.id === id);

  if (!existedTodo) {
    return response.status(404).json({ error: "ToDo not found" });
  }

  const newTodo = {
    deadline,
    done: false,
    title,
  };

  user.todos.forEach((todo) => {
    if (todo.id === id) {
      todo.title = newTodo.title;
      todo.deadline = newTodo.deadline;
    }
  });

  return response.status(201).send(newTodo);
});

app.patch("/todos/:id/done", checksExistsUserAccount, (request, response) => {
  const { id } = request.params;
  const { user } = request;

  const existedTodo = user.todos.find((todo) => todo.id === id);

  if (!existedTodo) {
    return response.status(404).json({ error: "ToDo not found" });
  }

  let newTodo = existedTodo;
  newTodo.done = true;

  user.todos[user.todos.indexOf(existedTodo)] = newTodo;

  return response.status(201).send(newTodo);
});

app.delete("/todos/:id", checksExistsUserAccount, (request, response) => {
  // Complete aqui
  const { id } = request.params;
  const { user } = request;

  const existedTodo = user.todos.find((todo) => todo.id === id);

  if (!existedTodo) {
    return response.status(404).json({ error: "ToDo not found" });
  }

  user.todos.splice(user.todos.indexOf(existedTodo), 1);

  return response.status(204).json(user.todos);
});

module.exports = app;
