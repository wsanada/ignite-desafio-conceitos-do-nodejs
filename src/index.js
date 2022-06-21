const express = require('express');
const cors = require('cors');

const { v4: uuid } = require('uuid');

const app = express();

app.use(cors());
app.use(express.json());

const users = [];

function checksExistsUserAccount(request, response, next) {
  const { username } = request.headers

  if (!username)
    return response.status(401).json({ error: "Acesso não autorizado" })

  request.user = users.find(a => a.username === username);

  if (!request.user)
    return response.status(404).json({ error: "Usuário não encontrado" })

  return next()
}

app.post('/users', (request, response) => {
  const { name, username } = request.body

  if (users.some(a => a.username === username))
    return response.status(400).json({ error: `Usuário '${username}' já cadastrado` })

  const user = {
    id: uuid(),
    name,
    username,
    todos: []
  }

  users.push(user)

  return response.status(201).json(user)
});

app.get('/todos', checksExistsUserAccount, (request, response) => {
  const { todos } = request.user

  return response.json(todos)
});

app.post('/todos', checksExistsUserAccount, (request, response) => {
  const { title, deadline } = request.body
  const { todos } = request.user

  const todo = {
    id: uuid(),
    title,
    done: false,
    deadline: new Date(deadline),
    created_at: new Date()
  }

  todos.push(todo)

  response.status(201).json(todo)
});

app.put('/todos/:id', checksExistsUserAccount, (request, response) => {
  const { id } = request.params
  const { title, deadline } = request.body
  const { todos } = request.user

  const todo = todos.find(a => a.id === id)

  if (!todo)
    return response.status(404).json({ error: "Tarefa não encontrada." })

  todo.title = title
  todo.deadline = new Date(deadline)

  return response.json(todo)
});

app.patch('/todos/:id/done', checksExistsUserAccount, (request, response) => {
  const { id } = request.params
  const { todos } = request.user

  console.log(request.params)

  const todo = todos.find(a => a.id === id)

  if (!todo)
    return response.status(404).json({ error: "Tarefa não encontrada." })

  todo.done = true

  return response.json(todo)
});

app.delete('/todos/:id', checksExistsUserAccount, (request, response) => {
  const { id } = request.params
  const { todos } = request.user

  const index = todos.findIndex(a => a.id === id)

  if (index < 0)
    return response.status(404).json({ error: "Tarefa não encontrada." })

  todos.splice(index, 1)

  return response.status(204).send()
});

module.exports = app;